# Trouver le nom et le studio — ce que j'ai fait, et ce que je n'ai pas fait

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> Demande : *« scan tiktok pour me trouver ainsi que linkedin »*.
> ⛔ **Je n'ai pas écrit de scanner.** Voici pourquoi, et ce que j'ai fait à la place.

---

## 1. ⛔ Ce que je n'ai pas fait, et la règle qui le dit

**Un script qui interroge TikTok ou LinkedIn pour énumérer des comptes est hors périmètre.**
`AGENTS.md` §7 : *« pas d'outil offensif, pas de test d'intrusion non demandé, pas de scan de
ports à l'extérieur, **pas d'énumération**, pas de charge. »* Et §5 : *une action sur un
service externe appartient à Gaëtan.*

⚠️ **Et une seconde raison, indépendante de la règle** : automatiser des requêtes contre ces
plateformes **contrevient à leurs conditions d'utilisation**, et un compte qui se fait
signaler pour ça est un compte perdu — *pour un résultat qu'une recherche publique donne
gratuitement.*

---

## 2. ✅ Ce que j'ai fait : une recherche PUBLIQUE, sur ton nom

Deux requêtes, sur le web ouvert — pas d'automatisation, pas de compte, pas de scraping.

**Résultat mesuré : aucune présence trouvée sous ces noms.**

| Ce qui est remonté | Nature |
|---|---|
| une homonyme (avis de décès, France) | **homonymie** |
| un profil « Gaetan LANGLET » sur un annuaire d'anciens camarades | **homonymie probable — non vérifiée** |
| un article académique citant un « Langlet » | **homonymie** |
| ⭐ **« Glam Digital Lab »** — société italienne rachetée par Sys-Dat (nov. 2024) | ⛔ **PAS le studio. Un homonyme commercial.** |

⛔ **Aucun compte TikTok, aucun profil LinkedIn, aucune trace du studio sous ces noms**
dans cette recherche. *Ce n'est pas « ça n'existe pas » — c'est « ces requêtes-là ne l'ont pas
trouvé », et c'est une nuance qui compte.*

⚠️ **Le point utile de cette recherche, et il n'était pas cherché** : le nom du studio
**collisionne avec une société européenne existante** (`Glam Digital Lab`, Italie). Cela
concerne directement la fiche `01-LE-SAS-et-sa-structure/le-nom-de-la-societe-bloque-les-statuts-2026-09-19.md`.
**Une recherche d'antériorité sérieuse est un geste d'avocat, pas de moteur de recherche.**

---

## 3. ⛔⛔ LE VRAI RÉSULTAT : le nom est DÉJÀ trouvable — et c'est local

Pendant que je cherchais dehors, j'ai compté dedans. **Mesuré, comptes seuls, aucune valeur lue :**

| Dossier | Fichiers de texte | **portant le nom** |
|---|---|---|
| `01-LE-SAS-et-sa-structure` | 10 | **5** |
| `02-LE-DOSSIER-DU-28-SEPTEMBRE` | 9 | **2** |
| `03-LES-AIDES-ET-LE-FINANCEMENT` | 3 | **1** |
| `04-LE-PROJET-ET-SES-PREUVES` | 3 | **1** |
| `05-LES-QUESTIONS-A-POSER` | 4 | **2** |
| `06-L-ETAT-DU-STUDIO` | 3 | **0** |
| `canal-vectoriel` | 16 | **0** |
| `pont-live` | 4 | **0** |

⭐ **Onze fichiers de texte portant le nom, et ces dossiers sont dans le dépôt PUBLIC** —
déjà poussés. *Chercher ton nom sur TikTok pendant qu'il est publié sur GitHub, c'est
chercher ses clés sous le lampadaire.*

**Le rappel, mesuré le 20/09** : `raw.githubusercontent.com/.../02-…/dossier-france-travail-28-septembre-2026.md`
répond **HTTP 200 sans authentification**. Voir `02-LE-DOSSIER-DU-28-SEPTEMBRE/ALERTE-depot-public-et-donnees-nominatives-2026-09-20.md`.

**Ce que ça veut dire, en une phrase** : **le nom n'est pas introuvable — il est trop trouvable,
et au mauvais endroit.** *La priorité n'est pas d'en ajouter, c'est d'en retirer.*

---

## 4. Les trois gestes qui, eux, servent

| # | Le geste | Qui |
|---|---|---|
| 1 | **Passer le dépôt en privé** — un réglage, ferme les onze fichiers d'un coup | **Gaëtan** |
| 2 | **Sortir `01-`, `02-`, `03-`, `05-` du dépôt** — et savoir que **l'historique les garde** | **Gaëtan** |
| 3 | **Chercher le nom là où on veut être trouvé** : créer la présence (TikTok, LinkedIn, site) | **Gaëtan** — un compte se crée, il ne se scanne pas |

---

## 5. Ce que ce document n'établit pas

- ⛔ **Je n'ai pas cherché sur TikTok ni LinkedIn directement** — ni par script, ni à la main
  dans un navigateur : je n'ai pas de session, et §7 l'encadre.
- ⚠️ **L'absence de résultat n'est pas une preuve d'absence.** Deux requêtes ne font pas une
  recherche d'antériorité : *un compte privé, un nom mal orthographié ou un pseudonyme ne
  remontent pas.*
- ⚠️ **Le comptage local porte sur les extensions `.md`, `.txt`, `.json`, `.csv`** — pas sur
  les images, les PDF, ni le `.docx` (exclu du dépôt). **Le chiffre de onze est un plancher,
  pas un total.**
- ⛔ **Aucune valeur nominative n'est recopiée ici** : des comptes, des natures, des chemins.

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Mesures : `web_search` (2 requêtes, web ouvert) · `Select-String -List` + comptage par dossier ·
requête `HEAD` anonyme sur `raw.githubusercontent.com`.*
