<!-- GLDL-SIG v1 2748b3a5a911b9259239514d7bd1620b3853022e55c8228c12dfd5fcd93c16d1 -->
# Structure — la branche IT / Tek / IA

> **Première trame, 15/09/2026.** Posée par Apex à la demande de Gaëtan (*« on pose la structure
> de la branche IT Tek ia de la holding »*). **À corriger par Gaëtan** : tout ce qui suit est soit
> sourcé, soit explicitement marqué comme blanc. Rien n'est inventé.

---

## 1. Ce qui est établi, et d'où ça vient

| Élément | Ce qui est établi | Source |
|---|---|---|
| **Génie IT Tek FR** | Le **nom commercial** du studio, et la **signature** de ses documents (`— Génie IT Tek FR`) | signature des documents du vault, ex. `rag-metroid-eva01-2026-09-14.md` |
| **GL Digital Lab** | Le **studio** : sites web, applications métier, **agents d'IA** — exécutés sur la machine du studio, en France. Harponville (Somme) | `modeles/verite-identite-gl-digital-lab.md`, mesuré sur le JSON-LD publié |
| **Statut juridique** | **Non immatriculée au 10/09/2026** — aucun SIREN, aucun SIRET ; les mentions publiées disent « entreprise en cours d'immatriculation ». **Ne pas écrire « SASU » au présent.** | mêmes sources |
| **Arkadia Retro Studio** | La **signature du studio de jeu** — réservable, *« tant que le suivi des marques n'a pas rendu son verdict sur "ArkadiA" »* | `vault-agence/nom-super-metroid-prime-4-2026-09-13.md` |
| **ARKADIA** | Trois choses distinctes : **le vaisseau** (la machine de calcul, code **SS00999**), **le réseau social ArkAdiA**, **le cluster de jeu** ARKADIA France | `modeles/nomenclature-projet.md`, cité par le doc d'identité |
| **Apexis Group Holding** | La structure du **frère Grégory** : **5 entités** — holding · conseil (SAS) · sécurité privée et formation (LPSP) · immobilier (SCI) · bureau stratégie et sûreté | lecture locale du PDF, le 15/09 — **OCR d'un modèle 7B, à vérifier sur la pièce** |
| **L'école** | Un chantier réel : `ecole/` — **gabarit à 6 éléments, 8 critères**, barème à **60 %** ; kit pilote = le vault Metroid ; vérifié par `verifier-kits.mjs` | `ecole/kits-pedagogiques-GABARIT-2026-09-14.md` |

## 2. Les lignes de produit du studio, chiffrées et publiées

Elles sont **publiées** dans l'`OfferCatalog` du site — donc elles engagent :

| Offre | Prix publié |
|---|---|
| Audit 48 h | **149 – 199 €** |
| Consulting | **90 €/h** |
| TJM | **450 €** |
| Maintenance | **350 €/mois** |
| Performance | **8 000 – 15 000 €** |
| Digital Factory | **15 000 – 30 000 €** |
| Neural Ops | **12 000 – 25 000 €** |

> **100 000 € est un niveau d'ambition**, pas une dépense ni un prix pratiqué
> (`modeles/nomenclature-projet.md`).

## 3. Les blancs — ce que je ne peux pas écrire à ta place

**C'est la raison d'être de cette page.** Les cinq entités IT / IA / digital / tek dont tu as parlé
le 15/09 **n'existent dans aucun document du studio** : mesuré — `vault-agence/` ne contient aucune
filiale de GL Digital Lab, et le carnet RAG ne remonte que du bruit à 0,777 sur la question.

| # | Ce qu'il faut | Pourquoi ça bloque |
|---|---|---|
| 1 | **Les 5 noms** | Sans nom, il n'y a pas de structure — seulement une intention |
| 2 | **Leur statut** : existantes (SIREN), en projet, ou simples marques | *Une société non immatriculée ne détient pas cinq filiales.* Les trois lectures n'ont pas les mêmes conséquences |
| 3 | **Qui détient quoi** | C'est LA question qui décide de l'AGEFIPH et de l'ACRE (voir § 4) |
| 4 | **Ce que chacune vend**, et à qui | Les 7 offres ci-dessus ne se répartissent pas toutes seules |
| 5 | **Où est la branche IT/Tek/IA par rapport à Apexis** | Deux structures, un seul frère dans chacune : à trancher avant d'écrire |

## 4. Les contraintes déjà écrites, et elles mordent sur la structure

- **AGEFIPH — 3 000 €** : si une **holding détient la majorité** de GL Digital Lab, l'aide est
  **perdue**. Source : `plan-financement-previsionnel-2026-09-11.md`, et c'est la **question 4** du
  dossier France Travail du **28/09/2026**.
- **ACRE** : mêmes conséquences sur la qualité de créateur selon qui détient la majorité.
- **« Apexis » ne figure à aucun registre** dans cinq départements (80, 02, 59, 60, 62) — mesuré.
  *On ne rattache pas une société à une holding dont le nom ne figure à aucun registre.*
- **Le mot « ArkadiA » est classé ENCOMBRÉ** au suivi des marques (`veille-web/noms-et-marques-suivi-2026-09-12.md` §2.1).
- **Metroid / Nintendo** : *le genre et la technique sont libres ; le nom, le personnage et le
  design sont pris.* Vaut pour tout ce que la branche « jeu » produirait.
- **D12 — juridique** : la structure, le rattachement et les statuts relèvent de
  **l'expert-comptable et de l'avocat**. Cette page **prépare** leurs questions ; elle ne tranche rien.

## 5. La R&D — elle existe déjà, et elle est rangée

Ce n'est pas un axe à créer : le studio a un dossier `rnd/` et un registre. **Cinq pièces, toutes datées :**

| Pièce | Sujet |
|---|---|
| `rnd/registre-rnd.md` (10,4 Ko) | le registre R&D |
| `rnd/arkadia-gate-architecture-2026-09-12.md` | l'architecture « gate » d'ArkAdiA |
| `rnd/cloisonnement-adaptation-qubes-2026-09-11.md` | cloisonnement, adaptation Qubes |
| `rnd/gl-os-distribution-2026-09-09.md` | la distribution de GL-OS |
| `rnd/site-local-agentique-2026-09-12.md` | le site local agentique |

Et **deux productions R&D mesurées ailleurs**, qui ne portent pas le nom « rnd » mais en sont :

- la R&D **sourcée** sur Metroid — `ecole/metroid-rnd-verifications-2026-09-14.md` : **43 sources, 0 requête payante** ;
- l'analyse des **poids des modèles** — `modeles/analyse-poids-llm-2026-09-14.md`.

⚠️ **`rnd/` est hors du périmètre du veilleur RAG** (mesuré le 14/09, avec `veille-video/`) : ses
documents **ne se réindexent pas tout seuls**. *Une R&D qu'on ne retrouve pas n'est pas de la R&D,
c'est une archive.* Et c'est la branche qui a le plus besoin de retrouver ce qu'elle a déjà cherché.

## 6. Ce que cette page n'est pas

- Ce n'est **pas** un organigramme : il manque les cinq noms (§ 3).
- Ce n'est **pas** un avis juridique : aucune conclusion de droit n'est tirée ici.
- Ce n'est **pas** un document publiable : il contient des blancs, et des blancs se voient.

---

*Écrit le 15/09/2026 — Apex. Chaque ligne vient d'un document daté ou d'une mesure prise le jour même.
Les blancs sont des blancs : ils ne seront remplis que par une source.*
