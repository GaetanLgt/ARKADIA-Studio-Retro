# Prix figés — décision de Gaëtan (10/09/2026)

> ⚠️ **CES PRIX SONT INCHANGÉS — MAIS LE MODÈLE QUI LES PORTE EST EN RÉVISION (11/09/2026).**
> Une relecture du modèle économique a relevé **cinq incohérences internes** : aucune offre
> récurrente, un plafond de production qui contredit un catalogue d'entrée de gamme, le
> différenciant (IA locale, souveraineté des données) vendu au prix d'un produit d'appel,
> et le mot « dès » qui ancre bas partout. **Aucun prix n'a été modifié** : le budget
> appartient à Gaëtan. **Ne pas réutiliser ces montants sans lire**
> `vault-agence/revision-modele-economique-2026-09-11.md`.
>
> À retenir avant toute citation : **trois produits n'ont toujours pas de prix arrêté**
> (lecture d'images, vidéo de narration, veille outillée), et **aucune offre récurrente
> n'existe à ce jour** — ce qui rend un prévisionnel impossible à tenir.


> **Ce que ce document est.** Gaëtan a demandé de **figer les 3 fourchettes « au mieux »**.
> Voici les prix arrêtés, avec le raisonnement qui les soutient. Ils ne sont **pas
> inventés** : ils reposent sur le coût mesuré, les sources de marché lues, et **ses
> propres prix publics existants** (relevés dans `llms.txt`).
>
> Document de référence : `fourchettes-prix-2026-09-10.md` (le travail préparatoire).

---

## 1. Les prix arrêtés

| # | Produit | **Prix figé** | Justification courte |
|---|---|---|---|
| 1 | **Audit web mesuré** | **199 € HT** | Haut de la fourchette publique existante (149–199 €), justifié par un périmètre plus large |
| 2 | **Porte anti-fuite d'identifiants** | **290 € HT** | Prix d'une vérification experte, pas d'un temps machine (0,5 s) |
| 3 | **Gabarit Vue 3** — licence | **149 € HT** | Haut de la fourchette : le produit est mesuré, pas promis |
| 3b | **Gabarit Vue 3** — avec installation et personnalisation | **390 € HT** | Mène naturellement vers le site à 2 500 € sans le concurrencer |

---

## 2. Le raisonnement, produit par produit

### 2.1 Audit web mesuré — **199 € HT**

**Ce que le prix doit respecter** : le studio affiche **déjà** « Audit WordPress — 48 h :
**149 à 199 € HT** » sur son site. Un prix hors de cette zone créerait une incohérence
visible pour un prospect qui compare.

**Pourquoi le haut de la fourchette** : notre audit ne fait pas la même chose que
l'audit WordPress 48 h. Il ajoute les **en-têtes de sécurité**, la **recherche de fuites
d'identifiants**, la mesure **d'accessibilité** et un **rapport reproductible** dont le
client peut rejouer chaque chiffre. C'est un périmètre plus large, donc le haut de la
fourchette, pas le bas.

**Coût mesuré** : 33 s de machine, 0 € d'API, 30–45 min humaines.

### 2.2 Porte anti-fuite d'identifiants — **290 € HT**

**Le piège à éviter** : annoncer un prix bas parce que la machine travaille 0,5 s. Ce
serait vendre un temps de calcul, alors que le client achète tout autre chose.

**Ce qu'il achète réellement** : la certitude qu'aucun **nom de client**, aucun **nom de
machine**, aucun **identifiant technique** n'est lisible publiquement sur son site. Le
préjudice évité n'est pas proportionnel au temps de calcul : il est proportionnel à ce
qu'une fuite coûte (perte de confiance, exposition RGPD, information donnée à un
concurrent).

**Pourquoi 290 € et pas 350** : à 350 €, le produit entre en concurrence frontale avec
un audit complet, ce qu'il n'est pas. À 290 €, il reste une **vérification ciblée** avec
un argument fort — et il est vendable seul, ce qui en fait une porte d'entrée.

**Preuve de valeur disponible** : la porte est née d'un **incident réel** — trois fuites
mesurées en ligne chez nous (nom de poste, profil matériel, **nom d'un client**).

### 2.3 Gabarit Vue 3 — **149 € HT** la licence, **390 € HT** avec accompagnement

**Pourquoi 149 € et pas 49 €** : à 49 €, le produit est perçu comme un gadget, et il
**cannibalise** le site à 2 500 € (un prospect pourrait préférer assembler lui-même).
À 149 €, il reste un **produit d'entrée** : assez cher pour signaler un travail sérieux,
assez loin de 2 500 € pour ne pas remplacer le site.

---

## 2bis. Trois produits ont un coût mesuré mais **pas encore de prix**

**Constat d'audit du 10/09/2026** : sur les 10 produits de la gamme, **7 ont un prix**
(4 figés ici, 3 adossés à tes prix publics). **Trois n'en ont pas** : vision locale, vidéo de
narration, veille outillée. Or l'objectif exige « un prix **jamais inventé** » pour chacun —
donc voici des **fourchettes argumentées**, à valider.

**Ce qui est mesuré** (`couts-produits-2026-09-10.md` §6) :

| Produit | Coût machine mesuré | Coût humain | Nature du prix |
|---|---|---|---|
| 6 — Vision locale | **3,9 s/image** (13,6 s au 1ᵉʳ appel) | lecture et vérification | **prestation**, pas licence |
| 7 — Vidéo de narration | **5,0 s** d'assemblage **+ ~73 s de script** | rédaction/validation du script | **prestation** |
| 8 — Veille outillée | **0,8 s par chaîne** | analyse et rédaction | **récurrent ou ponctuel ?** — à trancher |

### Les fourchettes proposées

| Produit | Fourchette proposée | Ce qui la justifie |
|---|---|---|
| **6 — Vision locale de pré-lecture** | **à l'unité : 4–9 €/image** · **forfait 30 images : 90–190 €** | La machine est négligeable, **le temps de relecture humaine ne l'est pas**. Et la **limite doit être annoncée** (mots fautifs relevés : « pré-lecture », jamais « transcription ») |
| **7 — Vidéo de narration locale** | **190–490 € la vidéo** de 1 à 2 min | Comparable à une **prestation de montage**, pas à une licence. Le script domine le coût machine ; la valeur est dans le récit et la vérification |
| **8 — Veille outillée** | **ponctuel 90–290 €** par relevé · **récurrent 49–149 €/mois** | Le coût machine est de **0,8 s** : on ne vend pas la mesure, on vend **l'analyse** et la régularité |

**Ce que ces fourchettes ne sont pas** : des prix. Aucune n'est arrêtée, et **je ne les fige
pas** — tu as figé les trois premières, celles-ci attendent ta décision. Elles sont **bornées
par les coûts mesurés** et par des prestations comparables, pas par une intuition.

**Le point qui vaut pour les trois** : leur coût machine est de **quelques secondes et 0 €
d'API**. Le prix se joue donc **entièrement sur le temps humain et le positionnement** — pas
sur un coût technique. C'est la même conclusion que pour l'audit web.

**Pourquoi une deuxième ligne à 390 €** : c'est le vrai usage. Un client qui achète un
gabarit a souvent besoin qu'on le mette en place. Cette ligne **mène au site** au lieu de
le contourner.

**Ce que le client reçoit, et qui justifie le prix** : un point de départ mesuré à
**100/100 partout** (performance, accessibilité, bonnes pratiques, référencement), mobile
**et** bureau, **6/6 en-têtes de sécurité**, une architecture verrouillée par
`package-lock.json`, et une **preuve rejouable** (`preuve/eprouver.mjs`) qui **échoue**
si les scores ne sont plus ceux annoncés. Empreinte SHA-256 de l'archive fournie.

---

## 3. Ce que ces prix laissent ouvert — et qu'il faut savoir

**Trois produits de la gamme gardent un prix public déjà fixé par Gaëtan**, et je ne les
touche pas : IA locale **dès 1 500 €**, RAG **3 000 / 8 000 / 15 000 €**, site web
**dès 2 500 €**, application métier **dès 8 000 €**.

**Ce qui bloque encore la vente, et ce n'est pas le prix** :
1. **La société n'est pas immatriculée** — on peut chiffrer et démontrer, pas encaisser.
2. **Les CGV définitives** manquent (rétractation 14 jours, exception des contenus
   numériques fournis immédiatement, mention de TVA ou de son absence).
3. **La « résiliation en 3 clics »** si vente par abonnement (obligation depuis juin 2023).

**Ordre à respecter** : produit et prix (fait) → cadre juridique → lien de paiement.

---

## 4. Ce que ce document ne fait pas

- **Il n'invente aucun chiffre** : chaque prix vient du coût mesuré, d'une source de
  marché lue, ou d'un prix public déjà affiché par le studio.
- **Il ne promet aucun revenu** : qu'un prix soit affiché ne prouve aucune vente. Ces
  deux choses sont différentes et le resteront.
- **Il ne remplace pas la décision juridique** : le prix est posé, le cadre ne l'est pas.


---

## RÈGLE QUI FAIT FOI — décision Gaëtan du 11/09/2026

> Verbatim de la consigne : « **la liste de prix qui fait foi — < à 80 % des offres
> concurrentes** ».

**La règle, écrite pour être vérifiable :**

> Tout prix public se situe **au plus à 80 % de la référence de marché la plus proche**,
> et cette référence est **nommée et sourcée**. Sans référence comparable, le prix est
> adossé **au coût mesuré et au TJM de 450 €/jour**. **Jamais sous le coût.**

**Pourquoi la règle a besoin d'un concurrent nommé** : « −20 % » sans dénominateur n'est
pas vérifiable. On ne compare pas un audit automatisé à un audit RGAA en agence —
3 000 à 12 000 € — parce que ce ne sont pas les mêmes prestations. La règle s'applique
donc **à la référence la plus proche**, et la ligne dit laquelle.

| Offre | Prix qui fait foi | Référence **sourcée** | % du concurrent | Statut |
|---|---|---|---|---|
| **Audit web mesuré** | **199 € HT** | outil automatisé **249 €/mois** | **80 % exact** (249 × 0,8 = 199,20) | ✅ règle tenue au centime |
| **Porte anti-fuite d'identifiants** | **290 € HT** | aucun équivalent vendu séparément | — | ⚪ coût mesuré + valeur |
| **Gabarit Vue 3 — licence** | **149 € HT** | composant, pas un site | — | ⚪ produit d'appel |
| **Gabarit Vue 3 — installé** | **390 € HT** | — | — | ⚪ produit d'appel |
| **Site web** | **dès 2 500 € HT** | site sur-mesure **1 500–4 500 €** (source citée au §2) | **56 % de 4 500 €** | ✅ règle tenue |
| **Application métier** | **dès 8 000 € HT** | TJM 450 €/jour → **18 jours** | adossé au temps humain | ⚠️ **comparables à sourcer** |
| **IA & automatisation locale** | **dès 1 500 € HT** | TJM 450 €/jour → **3,3 jours** | adossé au temps humain | ⚠️ **comparables à sourcer** |
| **RAG — mémoire documentaire** | **3 000 / 8 000 / 15 000 € HT** | TJM 450 €/jour → **6,7 / 18 / 33 jours** | adossé au temps humain | ⚠️ **comparables à sourcer** |

**Ce que la règle INTERDIT de garder :** la page `/services` affiche quatre offres —
PERFORMANCE 8–15 k€ · DIGITAL FACTORY 15–30 k€ · NEURAL OPS 12–25 k€ · RAG MÉMOIRE
3–15 k€. **Aucune n'existe dans cette liste, aucune n'est adossée à une source.**
Sous la règle, elles sont invérifiables : **c'est un catalogue parallèle, et il tombe.**

**Le catalogue de référence existe déjà** : c'est le bloc `<noscript>` de `index.html`,
qui publie exactement la liste ci-dessus. C'est donc **lui** que `/services` doit
rejoindre — on ne réinvente pas un catalogue, on aligne le support qui a dérivé.

*Règle écrite le 11/09/2026. Les prix de la colonne 2 restent la décision de Gaëtan ;
cette annexe fixe la MÉTHODE qui les rend vérifiables, pas les montants.*