#!/usr/bin/env node
/**
 * connecteur-live.mjs — le chat du direct entre dans la machine locale.
 *
 * Ce que ce fichier fait :
 *   · il écoute le chat (TikTok, et YouTube si la clé est fournie) ;
 *   · il ne réagit qu'à une commande explicite — « !arkadia » ;
 *   · il n'obéit qu'à une liste d'autorisation de comptes ;
 *   · il déclenche deux choses, et deux seulement :
 *       – un ORDRE d'overlay (le bandeau du poste affiche l'infographie) ;
 *       – une PHRASE, dictée par le service vocal local déjà installé.
 *
 * Ce qu'il ne fait pas, délibérément :
 *   · il n'écrit aucun contenu de message sur le disque — les mesures seules
 *     (compte, longueur, durée) sont journalisées, comme partout ici ;
 *   · il ne parle pas tout seul : sans « !arkadia », il ne dit rien ;
 *   · il ne sort rien de la machine : la voix part sur 127.0.0.1.
 *
 * ⚠️ NON ÉPROUVÉ : ni la dépendance TikTok ni l'API YouTube ne sont installées
 * sur EVA-01 à ce jour, et ce script n'a donc jamais tourné en vrai.
 * Les points non vérifiés sont listés dans README.md.
 *
 * Usage :
 *   node connecteur-live.mjs                  (TikTok seul)
 *   node connecteur-live.mjs --youtube        (TikTok + YouTube)
 *   node connecteur-live.mjs --essai          (aucun réseau : imprime la décision)
 */

import http from 'node:http';

/* ── La configuration : tout par l'environnement, rien dans le dépôt ──────── */

const CONFIG = {
  compteTiktok: process.env.ARKADIA_TIKTOK || '',
  youtubeVideId: process.env.ARKADIA_YOUTUBE_VIDEO_ID || '',
  youtubeCle: process.env.YOUTUBE_API_KEY || '',
  commande: process.env.ARKADIA_COMMANDE || '!arkadia',

  // La liste d'autorisation : vide = PERSONNE. On échoue fermé, jamais ouvert.
  autorises: (process.env.ARKADIA_AUTORISES || '')
    .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),

  voixUrl: process.env.ARKADIA_VOIX_URL || 'http://127.0.0.1:8150',
  overlayFichier: process.env.ARKADIA_OVERLAY || '',

  quotaParMinute: Number(process.env.ARKADIA_QUOTA_LIVE || 6),
  dureeMaxPhrase: Number(process.env.ARKADIA_DUREE_MAX || 240),
};

const ARGUMENTS = new Set(process.argv.slice(2));
const MODE_ESSAI = ARGUMENTS.has('--essai');

/* ── Le journal : des mesures, jamais des contenus ────────────────────────── */

function journaliser(mesure) {
  // Une ligne JSON par événement — compte, longueur, durée, verdict.
  process.stdout.write(JSON.stringify({ quand: new Date().toISOString(), ...mesure }) + '\n');
}

/* ── Le refus, et il est double : le compte, puis la cadence ─────────────── */

const dernierAppel = new Map();

export function decider(auteur, message, maintenant = Date.now()) {
  const texte = String(message || '').trim();
  const nom = String(auteur || '').trim().toLowerCase();

  if (!texte.toLowerCase().startsWith(CONFIG.commande)) {
    return { agir: false, motif: 'pas la commande' };
  }
  if (CONFIG.autorises.length === 0) {
    return { agir: false, motif: 'aucun compte autorisé (liste vide)' };
  }
  if (!CONFIG.autorises.includes(nom)) {
    return { agir: false, motif: 'compte hors liste' };
  }

  const precedent = dernierAppel.get(nom) || 0;
  if (maintenant - precedent < 60000 / CONFIG.quotaParMinute) {
    return { agir: false, motif: 'trop tôt pour ce compte' };
  }
  dernierAppel.set(nom, maintenant);

  // Ce qui suit la commande est la question ; vide, on prend une phrase par défaut.
  const demande = texte.slice(CONFIG.commande.length).trim();
  return { agir: true, motif: 'accepté', demande: demande || 'présente ton espace factoriel vectoriel' };
}

/* ── Les deux déclenchements, et rien d'autre ────────────────────────────── */

async function ordonnerOverlay() {
  if (!CONFIG.overlayFichier) {
    journaliser({ action: 'overlay', resultat: 'non configuré' });
    return;
  }
  // Le bandeau du poste observe un fichier : on écrit l'ordre, pas dans le réseau.
  const { writeFile } = await import('node:fs/promises');
  await writeFile(CONFIG.overlayFichier, JSON.stringify({
    ordre: 'afficher-infographie',
    quand: new Date().toISOString(),
  }), 'utf8');
  journaliser({ action: 'overlay', resultat: 'ordre écrit' });
}

function demanderLaPhrase(question) {
  return new Promise((resolve) => {
    const corps = JSON.stringify({ question: question.slice(0, 300), registre: 'discord' });
    const requete = http.request(
      new URL('/demander', CONFIG.voixUrl),
      { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(corps) } },
      (reponse) => {
        let donnees = '';
        reponse.on('data', (morceau) => { donnees += morceau; });
        reponse.on('end', () => {
          let verdict = { ok: false, motif: 'réponse illisible' };
          try {
            const d = JSON.parse(donnees);
            verdict = { ok: Boolean(d.ok), duree_ms: d.duree_ms, caracteres: (d.texte || '').length };
          } catch { /* on garde le verdict par défaut */ }
          resolve(verdict);
        });
      }
    );
    requete.on('error', (e) => resolve({ ok: false, motif: e.code || e.message }));
    requete.setTimeout(120000, () => { requete.destroy(); resolve({ ok: false, motif: 'délai dépassé' }); });
    requete.write(corps);
    requete.end();
  });
}

/* ── Le branchement sur les plateformes ──────────────────────────────────── */

async function demarrerTiktok() {
  let connexion;
  try {
    ({ TikTokLiveConnection: connexion } = await import('tiktok-live-connector'));
  } catch {
    journaliser({ plateforme: 'tiktok', resultat: 'dépendance absente — npm i tiktok-live-connector' });
    return null;
  }
  if (!CONFIG.compteTiktok) {
    journaliser({ plateforme: 'tiktok', resultat: 'compte non configuré' });
    return null;
  }

  const direct = new connexion(CONFIG.compteTiktok);
  await direct.connect();
  journaliser({ plateforme: 'tiktok', resultat: 'connecté' });

  direct.on('chat', async (evenement) => {
    const verdict = decider(evenement.uniqueId, evenement.comment);
    journaliser({
      plateforme: 'tiktok',
      compte: String(evenement.uniqueId || '').slice(0, 16),
      longueur: String(evenement.comment || '').length,
      agir: verdict.agir,
      motif: verdict.motif,
    });
    if (!verdict.agir) return;
    await ordonnerOverlay();
    const reponse = await demanderLaPhrase(verdict.demande);
    journaliser({ plateforme: 'tiktok', action: 'phrase', ...reponse });
  });

  return direct;
}

async function sonderYoutube() {
  if (!CONFIG.youtubeCle || !CONFIG.youtubeVideId) {
    journaliser({ plateforme: 'youtube', resultat: 'clé ou identifiant de direct absent' });
    return;
  }
  const { fetch } = globalThis;
  let pageSuivante = '';
  let premier = true;

  setInterval(async () => {
    const url = new URL('https://www.googleapis.com/youtube/v3/liveChat/messages');
    url.searchParams.set('liveChatId', CONFIG.youtubeVideId);
    url.searchParams.set('part', 'snippet,authorDetails');
    url.searchParams.set('key', CONFIG.youtubeCle);
    if (pageSuivante) url.searchParams.set('pageToken', pageSuivante);

    try {
      const r = await fetch(url);
      const d = await r.json();
      if (d.error) {
        journaliser({ plateforme: 'youtube', resultat: 'refus de l\'API', code: d.error.code });
        return;
      }
      pageSuivante = d.nextPageToken || '';
      if (premier) { premier = false; return; }   // on ne rejoue pas l'historique

      for (const item of d.items || []) {
        const auteur = item.authorDetails?.displayName || '';
        const texte = item.snippet?.displayMessage || '';
        const verdict = decider(auteur, texte);
        journaliser({
          plateforme: 'youtube',
          compte: String(auteur).slice(0, 16),
          longueur: texte.length,
          agir: verdict.agir,
          motif: verdict.motif,
        });
        if (verdict.agir) {
          await ordonnerOverlay();
          journaliser({ plateforme: 'youtube', action: 'phrase', ...(await demanderLaPhrase(verdict.demande)) });
        }
      }
    } catch (e) {
      journaliser({ plateforme: 'youtube', resultat: 'erreur réseau', code: e.code || e.name });
    }
  }, 5000);
}

/* ── L'entrée du programme ───────────────────────────────────────────────── */

if (MODE_ESSAI) {
  // Aucun réseau, aucune dépendance : on éprouve la DÉCISION seule, et on montre
  // qu'elle sait REFUSER — c'est la moitié qui compte.
  // [compte, message, verdict attendu, décalage en ms] — le décalage est explicite,
  // parce qu'un test dont l'horloge est implicite ne prouve pas ce qu'il croit.
  const cas = [
    ['inconnu', `bla ${CONFIG.commande}`, false, 0],
    ['inconnu', 'bonjour', false, 0],
    ['gaetan', 'bonjour', false, 0],
    ['gaetan', `${CONFIG.commande} c'est quoi ton espace ?`, true, 0],
    ['gaetan', `${CONFIG.commande} encore`, false, 1000],   // 1 s plus tard : la cadence refuse
    ['gaetan', `${CONFIG.commande} plus tard`, true, 60000], // 1 min plus tard : la cadence accepte
  ];
  // ⚠️ La liste d'autorisation vide change TOUTES les attentes : sans compte autorisé,
  // la bonne réponse est « refuser », y compris pour un compte qui serait le bon.
  // Le test s'adapte donc, au lieu de crier à l'échec sur un comportement correct.
  const listeVide = CONFIG.autorises.length === 0;
  let reussis = 0;
  const base = Date.now();
  for (const [auteur, message, attenduBrut, decalage] of cas) {
    const attendu = listeVide ? false : attenduBrut;
    const v = decider(auteur, message, base + decalage);
    const ok = v.agir === attendu;
    if (ok) reussis++;
    process.stdout.write(`${ok ? 'OK  ' : 'ÉCHEC'} ${auteur.padEnd(8)} +${decalage}ms « ${message} » → agir=${v.agir} (${v.motif})\n`);
  }
  if (listeVide) {
    process.stdout.write('\n(liste d\'autorisation VIDE : tout est refusé, et c\'est voulu)\n');
  }
  process.stdout.write(`\n${reussis}/${cas.length} cas — ${reussis === cas.length ? 'la décision tient' : 'À CORRIGER'}\n`);
  process.exit(reussis === cas.length ? 0 : 1);
}

journaliser({
  demarrage: true,
  compte_tiktok: CONFIG.compteTiktok ? 'configuré' : 'absent',
  youtube: CONFIG.youtubeCle ? 'configuré' : 'absent',
  comptes_autorises: CONFIG.autorises.length,
  commande: CONFIG.commande,
});

await demarrerTiktok();
if (ARGUMENTS.has('--youtube')) await sonderYoutube();
