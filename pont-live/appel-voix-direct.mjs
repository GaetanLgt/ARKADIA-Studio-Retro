#!/usr/bin/env node
/*
  appel-voix-direct.mjs — le script que le service vocal (ou la page) appelle
  pour faire entrer une phrase dans le harnais.

  Ce que ce script fait, et rien d'autre :
    · il construit le JSON de la demande (le prompt, un identifiant de session) ;
    · il signe le corps brut avec HMAC-SHA256 (le secret vient d'une variable
      d'environnement — jamais du dépôt) ;
    · il POST le tout vers le port d'entrée du webhook (défaut 3081, chemin /live/voix) ;
    · il affiche la réponse (`ok`, `duree_ms`) et la traite — mais PAS son contenu,
      parce que le webhook ne rend pas le contenu de la réponse.

  ⚠️ NON ÉPROUVÉ : le webhook et le port d'entrée n'existent pas sur cette machine
  (le second serveur web n'est pas monté, la règle n'est pas chargée dans le harnais,
  et le secret n'est pas posé). Le script est écrit pour être rejouable, pas pour
  avoir répondu.

  ⚠️ La mesure : le secret doit être présent (`ARKADIA_WEBHOOK_SECRET`), et le
  port d'entrée doit répondre `202`. Sans l'un ni l'autre, la réponse est un échec
  — et le script le dit sans le cacher.
*/

import crypto from 'node:crypto';

const SECRET = process.env.ARKADIA_WEBHOOK_SECRET || '';
const URL = process.env.ARKADIA_WEBHOOK_URL || 'http://127.0.0.1:3081/live/voix';
const SESSION = (process.env.ARKADIA_SESSION || 'direct-' + Date.now()).slice(0, 40);

if (SECRET === '') {
  console.log('⛔ ARKADIA_WEBHOOK_SECRET : absent — le POST serait refusé par le HMAC.');
  process.exit(1);   // échec fermé : sans secret, on ne prétend pas avoir envoyé.
}

const prompt = process.argv[2] ? process.argv.slice(2).join(' ') : process.env.ARKADIA_PROMPT || '';
if (prompt.trim() === '') {
  console.log('⛔ prompt vide — donne un texte en argument, ou pose ARKADIA_PROMPT.');
  process.exit(1);   // échec fermé : sans question, le webhook n'a rien à faire.
}

const corps = JSON.stringify({
  prompt: prompt.trim(),
  session: SESSION,
  rag: false,         // le webhook ne porte pas de RAG ; c'est la route de la parole.
});

// HMAC-SHA256 du corps brut — le contrat du webhook exige le préfixe `sha256=`.
const sig = 'sha256=' + crypto.createHmac('sha256', SECRET).update(corps).digest('hex');

// ⚠️ La POST utilise le module natif `http` — aucune dépendance externe, donc
// le script tourne même sur une machine sans `node_modules` au niveau du pack.
// C'est aussi ce qui le rend rejouable : pas de dépendance cachée.
import http from 'node:http';

const url = new URL(URL);
const donnees = Buffer.from(corps);

const options = {
  hostname: url.hostname,
  port: url.port || 80,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Hub-Signature-256': sig,
    'X-GitHub-Event': 'arkadia-voix',        // le contrat du webhook attend ce nom
    'X-GitHub-Delivery': 'direct-' + Date.now(),
    'Content-Length': donnees.length,
  },
};

const requete = http.request(options, (reponse) => {
  let donnees = '';
  reponse.on('data', (morceau) => { donnees += morceau; });
  reponse.on('end', () => {
    // ⚠️ On n'affirme JAMAIS que la réponse porte le contenu : la fiche pont-live-2026-09-20
    // établit que le webhook rend `202` SANS le résultat de l'agent. Ce que ce
    // script fait est de RENDRE le statut, pas d'inventer le contenu.
    const ok = reponse.statusCode === 202;
    let verdict = { ok, code: reponse.statusCode, duree_ms: null, reponse_brute_longueur: donnees.length };
    try { verdict = { ...verdict, ...JSON.parse(donnees) }; } catch { /* rien — le webhook
      ne promet pas de JSON de réponse, et le script le respecte au lieu de le cacher. */ }
    console.log(JSON.stringify(verdict, null, 2));
  });
});

requete.on('error', (e) => {
  console.log('⛔ POST échoué : ' + (e.code || e.message) + ' — le webhook n\'est pas accessible sur ' + URL);
  process.exit(1);
});
requete.setTimeout(120000, () => {
  requete.destroy();
  console.log('⛔ POST : délai dépassé (120 s) — le webhook ne répond pas.');
  process.exit(1);
});

requete.write(donnees);
requete.end();
