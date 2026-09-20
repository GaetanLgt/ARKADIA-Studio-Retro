# Déploiement — ce qui est prêt, ce qu'il faut poser, ce qui reste à trancher

> **GL Digital Lab · 20/09/2026 · EVA-01.**
> Le workflow est écrit : `.github/workflows/valider-et-deployer.yml`.
> ⚠️ **Il n'a jamais tourné** — aucune exécution n'a eu lieu à ce jour. Les étapes de
> validation, elles, ont été **rejouées à la main sur cette machine** (§ 3), et c'est
> cette reprise qui fait foi pour l'instant.

---

## 1. Le principe : le déploiement est armé, il ne se déclenche pas tout seul

| Niveau | Ce qu'il faut | Effet |
|---|---|---|
| **Rien** | — | la CI **valide** à chaque poussée et **ne pousse rien** |
| **Armé** | la variable de dépôt `DEPLOIEMENT_ACTIF` = `oui` | le déploiement devient possible |

⭐ **Pourquoi une variable et pas un secret :** dans un `if` de job, le contexte `secrets`
n'est pas lisible de façon fiable, alors que `vars` l'est. Et surtout — **un dépôt qui
déploie par défaut est un dépôt qui déploiera un jour où personne ne regardait.**

---

## 2. Ce qui est à poser côté GitHub, et qui appartient à Gaëtan

**Settings → Secrets and variables → Actions.**

### Secrets (les valeurs ne sont jamais affichées, ni par la CI, ni par moi)

| Secret | Ce qu'il porte |
|---|---|
| `DEPLOIEMENT_HOTE` | l'hôte du dépôt distant (`ftp.exemple.fr` ou l'adresse SSH) |
| `DEPLOIEMENT_UTILISATEUR` | le compte de déploiement |
| `DEPLOIEMENT_MOT_DE_PASSE` | le mot de passe — **de préférence un compte dédié au déploiement**, pas le compte principal |
| `DEPLOIEMENT_CHEMIN` | le dossier distant qui reçoit le pack |

### Variable

| Variable | Valeur | Effet |
|---|---|---|
| `DEPLOIEMENT_ACTIF` | `oui` (exactement) | arme le déploiement. Toute autre valeur, ou son absence, le laisse désarmé |

### Environnement

Le job de déploiement vise un environnement GitHub nommé **`production`**. Tant qu'il
n'existe pas, GitHub le crée à la première exécution. ⭐ **C'est là qu'on pose une
protection d'environnement** (approbation manuelle) si tu veux qu'un déploiement
attende ton clic — et vu ce que ce dossier sert, c'est probablement souhaitable.

---

## 3. Les contrôles — rejoués à la main, et ils sont rejouables

```powershell
cd "C:\Users\neosp\Desktop\ARKADIA Studio Retro"

php -l canal-vectoriel/bot.php
node --check canal-vectoriel/service-worker.js
node --check canal-vectoriel/connecteur-live.mjs
node -e "const m=require('./canal-vectoriel/manifest.webmanifest');console.log(m.name, m.icons.length)"

$env:ARKADIA_AUTORISES = "gaetan,inconnu"          # liste garnie
node canal-vectoriel/connecteur-live.mjs --essai

Remove-Item Env:\ARKADIA_AUTORISES                  # liste vide : tout doit être refusé
node canal-vectoriel/connecteur-live.mjs --essai
```

**Ce que ces contrôles ne disent pas :** ils ne prouvent pas que le site s'affiche, ni que
le tunnel tient, ni que le proxy répond. Ils prouvent que **ce qui est poussé est
syntaxiquement sain et que le refus par défaut fonctionne.**

---

## 4. ⛔ Ce que ce déploiement n'établit pas, et les points à trancher

1. **L'hébergeur n'est pas confirmé.** La fiche `ou-est-le-corpus-2026-09-20.md` § 6 relève
   un `O2SWITCH_TOKEN` parmi les variables de `C:\IA\gl-digital-lab\.env` — **c'est une
   lecture de noms, pas une preuve de destination.** *« On a un jeton » n'est pas « le site
   est là-bas ».* À confirmer avant de remplir `DEPLOIEMENT_HOTE`.
2. **La méthode d'accès n'est pas choisie.** Le workflow emploie **FTPS via `lftp`**.
   Si l'hébergeur expose SSH, un `rsync` serait plus propre et plus rapide — c'est une
   ligne à changer, pas une refonte.
3. **Le dossier distant n'est pas connu.** `DEPLOIEMENT_CHEMIN` décide de tout : pousser le
   pack à la racine du site **écraserait l'existant**. À vérifier avant le premier envoi.
4. **Le miroir ne supprime jamais** (`--delete` absent, et c'est délibéré et commenté dans
   le workflow). Conséquence : un fichier retiré du dépôt **reste** sur le serveur. Si une
   suppression est nécessaire, elle se décide — elle ne s'automatise pas.
5. **`bot.php` n'a jamais été exécuté**, ni ici ni là-bas. Le déployer le met en ligne sans
   qu'il ait rendu une seule réponse. *Le mettre en ligne est un choix ; je le nomme pour
   qu'il soit fait en le sachant.*
6. **Le contrôle après coup ne regarde que `https://gldigitallab.fr/`** et n'exige qu'un
   `200`. Un site peut répondre 200 et servir une page blanche — *un code HTTP n'est pas
   un rendu.*
7. **La mise en ligne appartient à Gaëtan** (§ 5 des consignes) : hébergement, identifiants,
   clés, ouverture d'un direct. Ce document prépare le geste, il ne le prend pas.
8. **Et le nom public du personnage reste à trancher** (D12) — voir `README.md` § 5.
   Il vaut mieux le faire **avant** qu'une adresse publique ne le rende plus difficile.

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Workflow : `.github/workflows/valider-et-deployer.yml`. Pack : `canal-vectoriel/`.*
