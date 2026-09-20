# ⛔ Le dépôt est PUBLIC, et il contient le dossier administratif

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> Objet : un dossier France Travail vient d'arriver (`dossier-france-travail-28-09-2026.docx`).
> Avant de le ranger, **une vérification qui change tout** — et elle n'était pas faite.

---

## 1. ⛔ Ce qui est mesuré, et qui est le vrai sujet

```
requête HEAD, sans aucune authentification, sur
raw.githubusercontent.com/GaetanLgt/ARKADIA-Studio-Retro/master/02-…/dossier-france-travail-28-septembre-2026.md
→ HTTP 200
```

⭐ **Le dépôt est public.** Tout ce qui y est poussé est **lisible par n'importe qui, sans
compte, sans mot de passe** — et **GitHub indexe et archive les dépôts publics** (l'archive
« Arctic Code Vault »). *Ce n'est pas un dépôt privé qui deviendrait public un jour : il
l'est déjà.*

**Et déjà poussé, dans `02-LE-DOSSIER-DU-28-SEPTEMBRE/` et `01-…`, il y a :**

| Ce que la mesure relève dans le fichier déjà en ligne | Compte |
|---|---|
| le nom du porteur | 2 occurrences |
| une commune et un code postal | 2 |
| motif `[0-9]{9}` ou `[0-9]{14}` (SIREN / SIRET) | 2 |
| mentions d'adresse, de domicile, de domiciliation | 16 |
| adresse e-mail, téléphone, NIR | **0** — *bien, et je le dis aussi* |

⚠️ **Et le contenu dépasse l'identité** : ce document traite de l'**ARCE / ARE**, de la
**domiciliation** et de l'**AGEFIPH**. *Le rattachement à l'AGEFIPH renseigne sur une
situation de handicap — ce n'est pas une donnée d'identité, c'est une donnée d'une autre
nature, et elle n'a rien à faire en lecture libre.*

---

## 2. Ce que j'ai fait, et ce que je n'ai pas fait

**Fait — localement, sans toucher au distant :**
- le `.docx` **n'a pas été poussé**. Il est copié dans `02-LE-DOSSIER-DU-28-SEPTEMBRE/`
  **et exclu du dépôt** (`.gitignore`), tant que la question ci-dessous n'est pas tranchée ;
- sa nature est établie : **ce n'est pas un doublon du `.md`** — le `.md` est le *chemin
  critique et les aides*, le `.docx` est le **paquet de réunion** (présentation, script
  vidéo 90 s–2 min, 6 slides), et il se présente lui-même comme *« version corrigée »*.

**Pas fait — parce que c'est à toi, et je ne le prends pas :**
- ⛔ **je n'ai ni rendu le dépôt privé, ni réécrit l'historique, ni rien supprimé.**

---

## 3. Les trois options, et ce que chacune coûte vraiment

| Option | Ce qu'elle règle | Ce qu'elle ne règle pas |
|---|---|---|
| **① Passer le dépôt en privé** — un réglage, dans les paramètres GitHub | **tout, immédiatement** : plus rien n'est lisible publiquement, historique compris | *les forks et les caches de moteurs qui auraient déjà copié la page — non mesurable* |
| **② Sortir les dossiers personnels du dépôt** (`01-`, `02-`, `03-`, `05-`) | la cause, durablement : le dépôt ne redevient pas porteur du dossier | ⛔ **l'historique les garde** — supprimer un fichier ne l'efface pas du passé Git |
| **③ Réécrire l'historique** (`filter-repo`, force-push) | l'historique lui-même | ⚠️ **destructif** : tous les identifiants de commit changent, les clones existants cassent, et un dépôt public peut avoir été cloné |

⭐ **Mon avis, et c'est un avis, pas une décision :** **① puis ②**. Le réglage « privé »
ferme la porte aujourd'hui, en une manipulation et sans rien casser ; le rangement décide
ensuite ce qui mérite d'être versionné du tout. *③ ne se justifie qu'après, et seulement
si un clone public est établi — ce qui n'est pas mesuré.*

---

## 4. La règle qui manquait, et qui vaut pour la suite

**Un dépôt n'est pas un lieu de rangement.** Il y a aujourd'hui dans le même dépôt :
du code, des fiches de chantier, un dossier fiscal et social nominatif, et un pack
d'images. **Quatre natures, une seule visibilité.**

> **Ce qui porte une identité, une situation ou un chiffre personnel se versionne dans un
> dépôt privé — ou pas du tout.** *Et « pas du tout » est souvent la bonne réponse : le
> disque suffit, la sauvegarde double existe déjà.*

---

## 5. Ce que ce document n'établit pas

- ⚠️ **Je n'ai pas cherché si le dépôt a été forké ou moissonné.** Le HTTP 200 prouve la
  lecture, pas la copie. *Non mesuré.*
- ⚠️ **Je n'ai pas relu les trois autres dossiers** (`01-`, `03-`, `05-`) ligne à ligne : la
  mesure porte sur `02-` et sur des **motifs**, pas sur une lecture de contenu.
- ⛔ **Aucun contenu nominatif n'est recopié ici** — des comptes et des natures, jamais des
  valeurs. *La règle du studio vaut aussi pour ses propres alertes.*
- ⛔ **Je n'ai touché ni à GitHub, ni à l'historique, ni aux fichiers déjà poussés.**

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Mesures : `Invoke-WebRequest -Method Head` (sans authentification) sur `raw.githubusercontent.com` ·
comptages par motif sur le fichier déjà en ligne · `Test-Path` sur les chemins locaux.*
