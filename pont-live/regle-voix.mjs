#!/usr/bin/env node
/*
  regle-voix.mjs — module de règle webhook : la parole entre dans le harnais.

  Ce que ce fichier EST : un plugin de forme `WebhookRule<K>` qui respecte
  le contrat documenté par `dsh-webhook`: `register(rule)` / `run(delivery, signal)`,
  retourne `WebhookSessionRequest | null`, et observe le signal de coupure.

  Ce que ce fichier N'EST PAS : il n'a jamais tourné contre un webhook en vrai
  (le port 3081 et la règle ne sont pas armés sur cette machine — voir la fiche).
  ⚠️ `modelSelectionSettings` et le choix du modèle ne sont pas traités : le modèle
  est celui du preset (`ministral-3:8b`), et le routeur local (`agent-default-model`
  vers `ollama`/`ministral-3:8b`) n'est jamais appliqué dans cette session — la bascule
  locale écrite le 19/09 (`bascule-locale-ministral-2026-09-19.md`) n'a jamais été
  exécutée. ⚠️ Le contexte `4096` est celui mesuré (`ollama ps`), pas `65 536`.

  ⚠️ Le retour : le webhook rend `202`, jamais la réponse de l'agent. Pour que la
  réponse atteigne le casque, ce module doit être complété par une pièce qui lit la
  session et publie la réponse dans le slot (`pont-live-2026-09-20.md` §4-5) —
  le même pattern que `publier_entendu()` du chantier-accusé-de-réception.
  Cette pièce manque ; le design est tracé ; son absence est nommée.

  La règle échoue fermé : si `ARKADIA_AUTORISES` est vide, la réponse est `null` —
  le webhook ne crée aucune session. Et si la liste est vide mais la commande est là,
  le verdict est « aucun compte autorisé (liste vide) » — c'est le même principe
  que le connecteur : la liste d'autorisation vide refuse tout, par construction.
*/

// La forme exacte attendue par le contrat du harnais : un objet brandé WebhookRule.
// On n'injecte pas de valeurs réelles ici — c'est la forme, pas le déploiement.

/** @type {import('@deepseek-ai/dsh-webhook').WebhookRule<typeof 'arkadia'} */
export default {
  id: 'regle-voix-arkadia',
  kind: 'arkadia-live',
  source: 'direct',
  path: '/live/voix',
  // Les quatre variables d'environnement que le contrat exige : aucune valeur
  // n'est codée en dur ; chacune doit être résolue par le déployeur.
  // ⚠️ `ARKADIA_WEBHOOK_SECRET` doit être un secret ; il n'est jamais lu
  // depuis un `.env` de dépôt.
  secretEnv: 'ARKADIA_WEBHOOK_SECRET',
  maxBodyBytes: 32768,

  async run(delivery, signal) {
    // Le contrat de livraison : un objet normalisé avec le corps brut déjà vérifié.
    const corps = delivery.body || {};
    const prompt = (corps.prompt || '').trim();

    // ✓ Les comptes autorisés sont ceux que la fiche désigne — jamais « tout le monde ».
    const autorises = new Set(
      (process.env.ARKADIA_AUTORISES || '')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );

    const auteur = (corps.from || '').trim().toLowerCase();
    if (!corps.from || !prompt || !prompt.startsWith('!arkadia')) {
      return null; // pas la commande de chat du studio
    }
    if (autorises.size > 0 && !autorises.has(auteur)) {
      return null; // compte non autorisé
    }

    // Le signal de coupure : si le service est redémarré en cours de réponse,
    // le signal est annulé ; on doit s'arrêter proprement.
    if (signal && signal.aborted) return null;

    // Ce que le webhook rend — le contrat : un request de session. Rien d'autre.
    // ⚠️ Le preset `agentPreset` doit exister dans le harnais (`preset.yml`) ;
    // sinon la création échoue. ⚠️ `permissionPreset` doit autoriser au moins
    // la lecture et la réponse dans le workspace. Non vérifié sur le harnais vivant.
    return {
      workspacePath: 'ARKADIA Studio Retro',
      title: 'Canal Arkadia — « ' + prompt.slice(11).slice(0, 120) + ' »',
      prompt: prompt,
      agentPreset: 'metroid',
      permissionPreset: 'defense',
      model: { provider: 'ollama', model: 'ministral-3:8b' },
    };
  },
};
