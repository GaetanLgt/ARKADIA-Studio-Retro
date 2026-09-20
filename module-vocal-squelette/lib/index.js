// dsh-voix-locale — moitié HÔTE.
//
// POURQUOI CETTE MOITIÉ EXISTE, ET CE N'EST PAS UN DÉTAIL D'ARCHITECTURE :
// le service vocal local (127.0.0.1:8150) refuse en 403 toute requête portant un
// en-tête « Origin » (serveur-voix.py, l. 1518, 1536, 1540, 1574). C'est un
// correctif de sécurité du 17/09/2026 contre un trou mesuré : sans lui, n'importe
// quelle page web ouverte sur le poste pouvait appeler /ecouter et ouvrir le micro.
// Un fetch() depuis la page du 3080 enverrait forcément « Origin » → 403.
//
// Donc : la page appelle CE greffon, en même origine, sur le 3080 (aucun CORS,
// aucun Origin refusé), et c'est l'hôte qui parle à 8150 en serveur-à-serveur,
// donc SANS en-tête Origin. C'est la seule voie qui respecte la barrière.
//
// Forme calquée sur deux greffons tiers mesurés sur EVA01 :
//   dsh-sysmon/lib/index.js  l. 13 et l. 126-128
//   dsh-comfyui/lib/routes.js l. 192-198
//
// ⚠️ Tout ce fichier est un SQUELETTE : il n'a jamais été exécuté.

import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

export const name = 'dsh-voix-locale'

// « webServer » est le seul service requis : c'est lui qui porte les routes.
// Mesuré en usage réel : dsh-sysmon/lib/index.js l. 13.
export const inject = ['webServer']

/** Adresse du service vocal. Écoute mesurée sur 127.0.0.1:8150 (PID 41080). */
const VOIX_HOTE = '127.0.0.1'
const VOIX_PORT = 8150

/** Préfixe de toutes nos routes. Aucune n'est le préfixe d'une autre (piège payé, serveur-voix.py l. 1580). */
const PREFIXE = '/voix-local'

/** Plafond de taille du corps audio accepté (octets). Une minute d'opus ≈ 500 ko ; on laisse large. */
const TAILLE_MAX = 32 * 1024 * 1024

/**
 * Appelle le service vocal en serveur-à-serveur.
 *
 * ⚠️ POINT CRITIQUE : aucun en-tête « Origin » n'est posé, et c'est délibéré.
 * Poser `Origin` ferait répondre 403 à tout le service (serveur-voix.py l. 1573-1574).
 * On utilise node:http et non fetch() pour que cette absence soit VISIBLE dans le code.
 *
 * @param {string} chemin - chemin de la route sur 8150, ex. '/sante'.
 * @param {object|null} corps - corps JSON, ou null pour un GET.
 * @returns {Promise<object>} la réponse JSON décodée.
 */
function appelVoix(chemin, corps) {
  return new Promise((resoudre, rejeter) => {
    const donnees = corps === null ? null : Buffer.from(JSON.stringify(corps), 'utf-8')
    const requete = http.request(
      {
        host: VOIX_HOTE,
        port: VOIX_PORT,
        path: chemin,
        method: donnees === null ? 'GET' : 'POST',
        headers: donnees === null
          ? { accept: 'application/json' }
          : { 'content-type': 'application/json', 'content-length': donnees.length, accept: 'application/json' },
      },
      (reponse) => {
        const morceaux = []
        reponse.on('data', (m) => morceaux.push(m))
        reponse.on('end', () => {
          const texte = Buffer.concat(morceaux).toString('utf-8')
          try {
            resoudre(JSON.parse(texte || '{}'))
          } catch {
            rejeter(new Error(`réponse illisible du service vocal : ${texte.slice(0, 200)}`))
          }
        })
      },
    )
    requete.on('error', (erreur) => rejeter(erreur))
    requete.setTimeout(120000, () => requete.destroy(new Error('service vocal : délai dépassé')))
    if (donnees !== null) requete.write(donnees)
    requete.end()
  })
}

/** Lit le corps d'une requête POST brute, avec plafond. */
function lireCorps(requete, plafond = TAILLE_MAX) {
  return new Promise((resoudre, rejeter) => {
    const morceaux = []
    let taille = 0
    requete.on('data', (m) => {
      taille += m.length
      if (taille > plafond) {
        requete.destroy()
        rejeter(Object.assign(new Error('corps trop volumineux'), { code: 413 }))
        return
      }
      morceaux.push(m)
    })
    requete.on('end', () => resoudre(Buffer.concat(morceaux)))
    requete.on('error', rejeter)
  })
}

/** Répond du JSON. */
function repondre(reponse, code, objet) {
  const corps = Buffer.from(JSON.stringify(objet), 'utf-8')
  reponse.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': corps.length })
  reponse.end(corps)
}

/**
 * @param {import('@deepseek-ai/cordis').Context} ctx contexte du greffon.
 * @returns {() => void} le désabonnement, comme tout `register` du harnais.
 */
export function apply(ctx) {
  const desabonnements = []

  // ── État : c'est public dans /voix-local/sante, jamais caché. ────────────────
  const etat = {
    demarrage: new Date().toISOString(),
    transcriptions: 0,
    dernieres_ms: null,
    derniere_erreur: null,
  }

  // ── GET /voix-local/sante — relais de /sante du service vocal ───────────────
  desabonnements.push(ctx.webServer.register({
    kind: 'exact',
    path: `${PREFIXE}/sante`,
    handler: async (_requete, reponse) => {
      try {
        const voix = await appelVoix('/sante', null)
        repondre(reponse, 200, { ok: true, module: etat, voix })
      } catch (erreur) {
        // On ne masque pas : un service vocal éteint doit se voir.
        repondre(reponse, 502, { ok: false, module: etat, erreur: String(erreur.message || erreur) })
      }
    },
  }))

  // ── POST /voix-local/transcrire — reçoit l'audio BRUT, écrit un fichier,
  //    le fait transcrire par le service vocal (qui prend un CHEMIN, pas des
  //    octets : serveur-voix.py l. 1662-1669).
  //
  //    Corps : octets audio. Type accepté par le service : .wav .mp3 .flac
  //    .ogg .m4a .webm (l. 1668). MediaRecorder produit du webm/opus.
  desabonnements.push(ctx.webServer.register({
    kind: 'exact',
    path: `${PREFIXE}/transcrire`,
    handler: async (requete, reponse) => {
      if ((requete.method || 'GET').toUpperCase() !== 'POST') {
        repondre(reponse, 405, { ok: false, erreur: 'POST attendu' })
        return
      }
      let temporaire = null
      try {
        const octets = await lireCorps(requete)
        if (octets.length === 0) {
          repondre(reponse, 422, { ok: false, erreur: 'corps audio vide' })
          return
        }
        temporaire = path.join(os.tmpdir(), `voix-locale-${randomUUID()}.webm`)
        await fs.writeFile(temporaire, octets)

        const debut = Date.now()
        const resultat = await appelVoix('/transcrire', { chemin: temporaire })
        etat.dernieres_ms = Date.now() - debut

        if (!resultat || resultat.ok !== true) {
          etat.derniere_erreur = (resultat && resultat.erreur) || 'échec de transcription'
          repondre(reponse, 502, { ok: false, erreur: etat.derniere_erreur, module: etat })
          return
        }
        etat.transcriptions += 1
        etat.derniere_erreur = null
        repondre(reponse, 200, { ok: true, texte: resultat.texte || '', langue: resultat.langue || null, module: etat })
      } catch (erreur) {
        etat.derniere_erreur = String(erreur.message || erreur)
        repondre(reponse, erreur.code === 413 ? 413 : 500, { ok: false, erreur: etat.derniere_erreur })
      } finally {
        // Le WAV/WebM temporaire ne survit pas à la requête : aucun contenu de
        // conversation n'est conservé sur disque (même règle que serveur-voix.py l. 32-33).
        if (temporaire) await fs.rm(temporaire, { force: true }).catch(() => {})
      }
    },
  }))

  // ── POST /voix-local/dire — { texte } → synthèse + lecture dans le casque.
  //    Voix par défaut : piper, HORS LIGNE (décision Gaëtan 17/09, serveur-voix.py l. 37-40).
  //    « vivienne » SORT DE LA MACHINE : à ne pas mettre par défaut.
  desabonnements.push(ctx.webServer.register({
    kind: 'exact',
    path: `${PREFIXE}/dire`,
    handler: async (requete, reponse) => {
      if ((requete.method || 'GET').toUpperCase() !== 'POST') {
        repondre(reponse, 405, { ok: false, erreur: 'POST attendu' })
        return
      }
      try {
        const brut = await lireCorps(requete)
        let corps = {}
        try { corps = JSON.parse(brut.toString('utf-8') || '{}') } catch { corps = {} }
        const texte = String(corps.texte || '').trim()
        if (!texte) {
          repondre(reponse, 422, { ok: false, erreur: 'champ « texte » vide' })
          return
        }
        const voix = corps.voix === 'vivienne' ? 'vivienne' : 'piper'
        const resultat = await appelVoix('/dire', { texte, voix })
        repondre(reponse, resultat && resultat.ok === true ? 200 : 502, resultat || { ok: false, erreur: 'réponse vide' })
      } catch (erreur) {
        repondre(reponse, 500, { ok: false, erreur: String(erreur.message || erreur) })
      }
    },
  }))

  return () => { for (const d of desabonnements) d() }
}
