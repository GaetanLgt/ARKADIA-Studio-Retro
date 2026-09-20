<!-- GLDL-SIG v1 0693b2fcd5174926b2e43c27ea5be8b83dc8875900d9050da2d68563e1780a10 -->
# Le nom de la société — la décision qui bloque les statuts

> **GL Digital Lab · 19/09/2026 · but « Horizon 2030 », round 1.** Trouvé en montant le SAS
> « en avant » : *un point commande la création, et il n'était écrit nulle part.*
>
> **Le nom de la société va dans les statuts.** Il ne se change pas gratuitement — *une
> modification statutaire est un acte, des frais et une publication.* **C'est donc, comme la
> holding Apexis, une décision qui se prend AVANT l'immatriculation.**

---

## 1. L'état mesuré, dans les pages publiées

| Nom | Occurrences publiées |
|---|---|
| **`Génie IT Tek FR`** | **542** |
| **`GL Digital Lab`** | **37** |
| `gldigitallab.fr` *(le domaine)* | 470 |

**Et les deux titres :**

| Page | `<title>` servi |
|---|---|
| Accueil | **`Génie IT Tek FR \| Architecture Numérique Souveraine`** |
| Mentions légales | **`Mentions Légales \| Génie IT Tek FR`** |

---

## 2. ⛔ La contradiction, elle est dans tes propres documents

**`docs/nomenclature-projet.md`, ligne 19** — *dans le dépôt du site* :

> *« **GL Digital Lab** — La **société**. SASU de droit français, Harponville (Somme). **C'est le nom
> qui figure sur les devis, les factures et les mentions légales.** Réel et actif. C'est le seul nom
> commercial. »*

**Or les mentions légales publiées affichent `Génie IT Tek FR`.** *La nomenclature dit une chose,
le site en publie une autre, et **les deux sont dans le même dépôt**.*

**Et `modeles/audit-et-plan-2026-09-16.md` §P1-6** le notait déjà, en plus précis :

> *« **Les 254 occurrences de `Génie IT Tek FR`** dans les documents. Elles portent **une casse que
> ta décision n'a pas retenue** (`Tek`, k minuscule). **Le site applique la bonne.** »*

⚠️ **Elles sont 542 aujourd'hui — plus du double en trois jours.** *Le compteur de l'audit portait
sur les documents ; le mien porte sur les **pages livrées**.*

---

## 3. Ce qui bloque, concrètement

**Les statuts d'une SASU portent une dénomination sociale.** Elle apparaît ensuite :

| Où | Conséquence d'un changement après coup |
|---|---|
| **Statuts** | *modification statutaire : acte, frais, publication* |
| **Kbis / SIREN** | *la dénomination est attachée à l'immatriculation* |
| **Compte bancaire pro** | *justificatif de création au nom de la société* |
| **Mentions légales du site** | *doivent porter le nom **exact** de la société* |
| **Devis et factures** | *idem — et c'est ce qu'un client lit* |
| **Le kit pédagogique publié** | *141 pages, mais elles nomment la franchise, pas la société* |

> **Autrement dit : le nom se décide une fois, tôt, ou il coûte un acte juridique plus tard.**
> *C'est mot pour mot l'argument déjà écrit pour la holding Apexis.* **Le même raisonnement
> s'applique, et personne ne l'avait appliqué au nom.**

---

## 4. ⚠️ Trois questions, et ce n'est pas à moi d'y répondre

**① Quelle dénomination sociale dans les statuts ?** *`Génie IT Tek FR` — la marque affichée au
public et présente 542 fois — ou `GL Digital Lab` — le nom que la nomenclature désigne comme « le
seul nom commercial » ?*

**② La casse.** `Tek` *(k minuscule)* ou `TEK` ? ⚠️ *L'audit du 16/09 écrit qu'il existe **une
décision** sur ce point, et que **le site applique la bonne**. **Je ne l'ai pas retrouvée dans les
documents que j'ai lus** — donc je ne sais pas laquelle c'est, et je ne la devine pas.*

**③ Et lequel porte le domaine ?** *`gldigitallab.fr` — 470 occurrences publiées. **Si la
dénomination sociale devient `Génie IT Tek FR`, le site porte un domaine au nom de l'autre.***
*Ce n'est pas nécessairement un problème, mais **ça se décide**, pas ça ne se subit.*

---

## 5. ⭐ Et une divergence que le round a trouvée sans la chercher

**`VERSION.json` de GL-OS porte** : *`"nom_affiche": "GL-OS — la distribution du studio Génie IT
Tek FR"`*. **Et il ajoute, ligne suivante** : *« Un nom de marque se choisit, un identifiant se
porte (décision Gaëtan du 13/09/2026). »*

**Donc la règle existe déjà — « un nom se choisit, un identifiant se porte » — et elle a été écrite
pour GL-OS.** *Elle s'applique exactement de la même façon ici : **la dénomination sociale se
choisit, le domaine et les identifiants se portent.*** **La règle est trouvée ; il ne manque que le
choix.**

---

## 6. Ce que je peux faire dès que le nom est tranché

1. **Inventorier les occurrences à changer** — *par fichier, avec le compte avant/après.*
2. **Appliquer en une passe** — *`Génie IT Tek FR` figure 542 fois dans les pages livrées, mais
   elles viennent d'un nombre bien plus petit de fichiers source.*
3. **Vérifier les mentions légales contre la nomenclature** — *et faire cesser la contradiction,
   dans un sens ou dans l'autre.*
4. **Et mettre à jour le kit pédagogique** s'il nomme la société — *il ne le fait pas aujourd'hui.*

---

## 7. Ce que ce document n'établit pas

- ⚠️ **Je n'ai pas retrouvé la « décision » que l'audit du 16/09 dit exister sur la casse.**
  *Elle est peut-être dans un document que je n'ai pas lu.* **Donc : non vérifié.**
- **Les 542 occurrences sont comptées dans le HTML livré**, *pas dans les sources — un même nom
  répété par un `v-for` peut venir d'une seule ligne. **Le nombre de fichiers à toucher est
  probablement bien plus petit, et je ne l'ai pas mesuré.**
- **Je n'ai pas vérifié quelles formes exactes coexistent** : *`Génie IT Tek FR`, `Génie IT Tek`,
  `Genie IT Tek`, `TEK`… **Le compte porte sur la forme avec `Tek` minuscule et `FR` final**, et
  `Genie IT Tek` sans accent donne **0** dans les pages publiées.
- **Je ne sais pas laquelle des deux dénominations est la plus susceptible d'être acceptée par
  l'INPI** — *une recherche d'antériorité n'a pas été faite, et **ce n'est pas une question que je
  peux trancher**.*
- ⛔ **Aucune modification n'a été faite.** *Ce document nomme une décision, il ne la prend pas.*

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Mesures : comptage par expression
régulière dans les 183 `.html` de `portfolio-gaetan/dist/` · lecture de
`portfolio-gaetan/docs/nomenclature-projet.md` l. 19 · `gl-digital-lab/modeles/audit-et-plan-2026-09-16.md`
§P1-6 · `gl-os/VERSION.json` · `gl-os/DECISIONS-EN-ATTENTE-2026-09-12.md` §A1-A2 ·
`vault-agence/ECHEANCES-ADMINISTRATIVES-2026-09-12.md` §1-4 · `vault-agence/dossier-france-travail-28-septembre-2026.md` §3-4.*
