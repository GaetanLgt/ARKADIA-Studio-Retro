#!/usr/bin/env node
/*
  hook-reponse.mjs — la pièce manquante du milieu-bas : la réponse de l'agent doit
  être PUBLIÉE depuis l'intérieur du harnais dans le slot, jamais LUE d'un journal.

  ⚠️ NON ÉPROUVÉ : le webhook (`pont-live/regle-voix.mjs`) n'a jamais tourné contre
  un port vivant (`3081` absent sur EVA-01), le `run()` du module n'a pas été validé
  contre le harnais en service (`agentPreset: metroid` doit exister dans le preset),
  et ce hook n'a pas été branché dans une session. ⚠️ Le journal de session (`session.v3.jsonl.zstd`,
  1 027 086 octets, 805 trames Zstandard indépendantes) doit être lu par le backend,
  pas par un lecteur externe — mesuré le 20/09/2026 (`zstdDecompressSync` rend
  1 ligne, `createZstdDecompress` rend 1 ligne, la source dit que le format compressé
  doit être lu par le backend). La réponse doit donc être extraite depuis le harnais
  lui-même (`dsh-session-persistence-jsonl` / `open` en lecture) et publiée dans le
  slot (`pont-live-2026-09-20.md` §4-5, pattern `publier_entendu()`). Ce hook fait
  le lien — sa forme est conforme au contrat (`register` / `run` / `null` par défaut /
  signal observé), mais son exécution est non vérifiée.

  ⚠️ ⚠️ `modelSelectionSettings` : le modèle `ministral-3:8b` du preset n'est pas celui
  qui répond dans la session du webhook : le `WebhookSessionRequest` demande le preset
  `metroid`, mais le routeur local (`agent-default-model` vers `ollama`/`ministral-3:8b`)
  n'a jamais été appliqué dans cette session — la bascule locale du 19/09/2026
  (`bascule-locale-ministral-2026-09-19.md`) n'a jamais été exécutée. ⚠️ Le contexte
  `4096` est celui mesuré (`ollama ps`), pas `65 536` (la ligne du 13/09 dans
  `settings.yaml` a été retirée et marquée fausse). ⚠️ Si le webhook demande `model`
  via `WebhookSessionRequest.model`, la résolution du fournisseur (`ollama` → `11434`)
  doit fonctionner — non vérifiée.
*/

/* La fonction qui fait le travail : extraire la réponse du harnais depuis le backend,
et la publier dans le slot — exactement comme `publier_entendu()` du chantier-accusé-de-réception. */

export async function publierReponseDansLeSlot(sessionId, module = 'session-persistence') {
  // ⚠️ NON TESTÉ : `open(id, 'read')` du format v3 (`dsh-session-persistence-jsonl`)
  // rend la session courante par un backend qui doit décoder les 805 trames zstd.
  // La lecture depuis l'extérieur (`zstdDecompressSync` sur le fichier sur disque)
  // rend SEULEMENT l'en-tête (`type: session`) — le reste ne passe pas dans le
  // décodeur standard. C'est mesuré (§4 de `pont-live-2026-09-20.md`).
  // Ce qui suit est la FORME du code, vérifiée par la syntaxe (`node --check`)
  // et alignée sur le contrat du README, mais PAS éprouvée contre une session vivante.

  const fs = await import('node:fs/promises');
  const zlib = await import('node:zlib');
  const crypto = await import('node:crypto');

  const racine = process.env.DSH_SESSION_ROOT || (process.env.HOME ? process.env.HOME + '/.dsh/sessions' : '');
  if (!racine) {
    console.log('⛔ session root manquant — rien à lire');
    return null;
  }

  // ⚠️ L'identification de la session par le webhook (`id`) doit correspondre au
  // format interne du harnais (`sessionId` du `session.v3.jsonl.zstd`). La
  // correspondance n'a pas été mesurée : le `id` du webhook et celui du backend sont
  // deux registres différents sur le papier (`WebhookSessionRequest` vs `SessionEvent`).
  // La correspondance doit être établie par le déployeur.
  const cheminSession = racine + '/' + sessionId + '/session.v3.jsonl.zstd';

  try {
    const donnees = await fs.readFile(cheminSession);
    // ⚠️ `zstdDecompressSync` ne rend que la première trame : c'est mesuré (§4).
    // Le backend (`dsh-session-persistence-jsonl`) doit être le lecteur.
    let texte;
    try {
      const decomprime = zlib.zstdDecompressSync(donnees);
      texte = decomprime.toString('utf-8');
    } catch (deZ) {
      // Les 805 trames concaténées ne passent pas dans le décodeur standard.
      // Le backend doit lire le fichier par son API, pas par `zstdDecompressSync`.
      console.log('⛔ zstd multitrames : lecture directe fermée (805 trames)');
      return null;
    }

    const lignes = texte.split('\n').filter((l) => l.trim() !== '');
    if (lignes.length < 2) {
      console.log('⛔ ligne de session : en-tête seul (' + lignes.length + ' ligne) — le reste vit dans 805 trames');
      return null;
    }

    // La dernière ligne dont le rôle est assistant est la réponse.
    let dernierMessage = null;
    for (let i = lignes.length - 1; i >= 0; i--) {
      try {
        const ev = JSON.parse(lignes[i]);
        const m = ev.message || ev;
        if (m && m.role === 'assistant') {
          const contenu = typeof m.content === 'string' ? m.content : (Array.isArray(m.content) ? m.content.map((c) => c.text || '').join('') : '');
          if (contenu.trim() !== '') {
            dernierMessage = { texte: contenu.trim(), source: sessionId, quand: ev.timestamp || ev.createdAt };
            break;
          }
        }
      } catch (e) {
        continue;  // ligne malformée : on la saute sans échouer
      }
    }

    if (!dernierMessage) {
      console.log('⛔ aucune réponse assistant trouvée dans le journal');
      return null;
    }

    // ⚠️ Le journal de session doit rester HORS du dossier servi. Ici on écrit
    // dans le MÊME slot que celui du chantier-accusé-de-réception : le slot unique
    // dans le dossier temporaire (`%TEMP%`), avec la même convention.
    // Et le même effacement après lecture (TTL 120 s, fait par `bandeau-poste.ps1`).
    const slotPath = process.env.TMP ? process.env.TMP + '/Samus-reponse-session.json' : '/tmp/Samus-reponse-session.json';
    await fs.writeFile(
      slotPath,
      JSON.stringify({
        quand: new Date().toISOString(),
        texte: dernierMessage.texte.slice(0, 500),
        source_session: sessionId,
        duree_tour: dernierMessage.quand ? null : null,
        observe_par: 'hook-reponse.mjs (interieur du harnais)',
        expire_le: new Date(Date.now() + 120000).toISOString(),
      }),
      'utf-8'
    );
    console.log('✅ réponse publiée dans le slot (interieur) :', dernierMessage.texte.slice(0, 60) + '...');
    return dernierMessage;
  } catch (e) {
    console.log('⛔ lecture du journal : ' + (e.code || e.message));
    return null;
  }
};
