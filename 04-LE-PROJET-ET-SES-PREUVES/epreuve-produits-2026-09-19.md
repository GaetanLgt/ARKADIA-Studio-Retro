# Épreuve des produits — 19/09/2026 13:53:34

> **Ce que ce document est.** Une exécution réelle des épreuves de chaque produit,
> écrite automatiquement par `forge-ia/eprouver-produits.mjs`. Rejouable en une commande.
> Une épreuve qui n’a **pas** tourné est écrite comme non mesurée — jamais comptée comme un succès.

| Produit | Ce qui a été éprouvé | Résultat |
|---|---|---|
| Produit 2 — porte anti-fuite | la porte sait-elle DÉTECTER une fuite ? | ✅ auto-épreuve 6/6 |
| Produit 1 — porte d’écosystème | la porte sait-elle détecter chaque défaut (réponse, en-têtes, HTTPS, listage, fuite, lien, surface fermée) ? | ✅ auto-épreuve 9/9 |
| Outil serveur — porte du VPS | la porte serveur sait-elle détecter un SSH rouvert, un pare-feu éteint, un pid republié, un port interdit ? | ✅ auto-épreuve 10/10 |
| Produit 1 + 2 — l’écosystème en ligne | les surfaces publiées répondent-elles, avec leurs en-têtes, sans fuite ? | ✅ VERDICT : écosystème vérifié |
| Produit 3 — gabarit Vue | la preuve du gabarit (construction, poids, 4 notes, CLS) est-elle rejouable et datée ? | ✅ PREUVE ÉTABLIE |
| Produit 5 — contrôle de pré-lancement | le contrôle sait-il distinguer un défaut d'un faux positif (texte visible, blocs de code, placeholders, promesses chiffrées, type de cible, sphère, page coquille) ? | ✅ 35 vérifications, 0 échec |

## Non mesuré dans ce passage (et pourquoi)

- Produit 1 (audit mesuré d’un site client) : non relancé ici — il ouvre un navigateur et prend plusieurs minutes. La dernière mesure datée porte sur nos propres sites (voir modeles/benchmark-sites-2026-09-10.md).
- Produit 4 (textes de vente) : rien à mesurer — ses prix sont volontairement vides, la décision appartient à Gaëtan.

## Ce que ces épreuves ne prouvent pas

- Elles prouvent que **nos outils détectent** les défauts qu’on leur présente (auto-épreuves) et que
  **nos surfaces publiées** passent les contrôles à l’instant de la mesure.
- Elles ne prouvent pas qu’un site **client** obtiendra les mêmes scores : cela dépend de son contenu.
- Elles ne remplacent pas la lecture humaine d’un rapport par Gaëtan.
