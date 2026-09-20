<!-- GLDL-SIG v1 d7dae3e807a59c35a0e0ae962cc20279587d9590ed5835d7a20f7bc43acbfb27 -->
# Présentation du projet — la pièce que le dossier réclame

> **GL Digital Lab · 19/09/2026 · but « Horizon 2030 », round 8.** Le dossier France Travail §3 range
> cette pièce dans **« ce que je peux préparer »** : *« ce que le studio vend, à qui, à quel prix —
> **les prix sont déjà figés** »*, et *« preuve de crédibilité : les produits **avec leur épreuve
> chiffrée** — c'est ce qui distingue un projet d'une intention »*.
>
> ⛔ **Rien n'est inventé ici.** *Chaque prix vient de `prix-figes-2026-09-10.md` ; chaque chiffre
> d'épreuve vient d'une exécution réelle, **rejouée le 19/09/2026**. Et **ce qui n'a pas de prix est
> écrit comme n'en ayant pas.***
>
> ⚠️ **Et ce document porte ses réserves** : *l'AGEFIPH n'est pas un socle, un contrat de filière
> n'est ni un marché ni une subvention, et **rien ici n'est un financement**.*

---

## 1. Le projet, en une page

| | |
|---|---|
| **Quoi** | Studio de **développement web, d'applications métier et d'intelligence artificielle locale** |
| **Qui** | **Gaëtan Langlet**, seul fondateur, demandeur d'emploi à la date du dossier |
| **Où** | **Harponville (80560)**, Somme, Hauts-de-France — domiciliation envisagée à l'adresse personnelle |
| **Pour qui** | **TPE, PME, artisans et collectivités françaises** |
| **Situation juridique** | ⚠️ **La société n'est PAS immatriculée.** *Aucun SIREN ni SIRET pour elle → **aucune facture possible, aucun encaissement possible*** |
| **Ce qui existe déjà** | **Un site public en ligne — 183 pages**, des prix publics, des produits dont **les épreuves ont été rejouées et datées** |

---

## 2. Ce que le studio vend — la gamme, et ses prix

### 2.1 Les sept prix arrêtés

| # | Produit | Prix | Ce que le client achète |
|---|---|---|---|
| **1** | **Audit web mesuré** | **199 € HT** | *En-têtes de sécurité, recherche de fuites d'identifiants, accessibilité, **rapport rejouable*** |
| **2** | **Porte anti-fuite d'identifiants** | **290 € HT** | *La certitude qu'aucun nom de client, de machine ou d'identifiant n'est lisible publiquement* |
| **3** | **Gabarit Vue 3** — licence | **149 € HT** | *Un point de départ **mesuré à 100/100**, pas promis* |
| **3b** | **Gabarit Vue 3** — installé | **390 € HT** | *Le vrai usage : installer, pas juste livrer* |
| **4** | **Site web** | **dès 2 500 € HT** | *Sur-mesure, mesuré, accessible* |
| **5** | **Application métier** | **dès 8 000 € HT** | *Un outil interne qui remplace un tableur et un process manuel* |
| **6** | **IA locale** | **dès 1 500 € HT** | *Un modèle **sur le matériel du client**, sans envoyer ses données à un tiers* |

**Et un troisième palier, déjà public** : *mémoire documentaire (RAG) — **3 000 / 8 000 / 15 000 € HT**.*

### 2.2 ⚠️ Trois produits ont un coût mesuré, **pas de prix** — et ça s'écrit

| Produit | Coût machine mesuré | Fourchette proposée | Statut |
|---|---|---|---|
| **Vision locale de pré-lecture** | **3,9 s/image** *(13,6 s au 1ᵉʳ appel)* | *4–9 €/image · forfait 30 images : 90–190 €* | ⛔ **attente de décision** |
| **Vidéo de narration locale** | **5,0 s** + ~73 s de script | *190–490 € la vidéo de 1 à 2 min* | ⛔ **attente de décision** |
| **Veille outillée** | **0,8 s par chaîne** | *ponctuel 90–290 € · récurrent 49–149 €/mois* | ⛔ **attente de décision** |

> ⚠️ **Ces trois lignes ne portent AUCUN prix, et c'est délibéré.** *Le document source l'écrit :
> « ce ne sont pas des prix, aucune n'est arrêtée, et **je ne les fige pas** — tu as figé les trois
> premières, celles-ci attendent ta décision. »* **Un dossier qui afficherait une fourchette comme
> un prix ferait exactement ce que le studio s'interdit.**

**Et pour les trois, la même conclusion que l'audit** : *coût machine de **quelques secondes et 0 €
d'API** — **le prix se joue entièrement sur le temps humain et le positionnement**, pas sur un coût
technique.*

---

## 3. ⭐ La preuve de crédibilité — **rejouée le 19/09/2026**

**C'est ce qui distingue un projet d'une intention.** *Source : `modeles/epreuve-produits-2026-09-19.md`,
écrit automatiquement par `forge-ia/eprouver-produits.mjs` — **rejouable en une commande**.*

| Produit | Ce qui a été éprouvé | Résultat |
|---|---|---|
| **Produit 2 — porte anti-fuite** | *sait-elle DÉTECTER une fuite ?* | ✅ **auto-épreuve 6/6** |
| **Produit 1 — porte d'écosystème** | *détecte-t-elle chaque défaut ?* *(réponse, en-têtes, HTTPS, listage, fuite, lien, surface fermée)* | ✅ **auto-épreuve 9/9** |
| **Outil serveur — porte du VPS** | *détecte-t-il un SSH rouvert, un pare-feu éteint, un pid republié, un port interdit ?* | ✅ **auto-épreuve 10/10** |
| **Produit 1 + 2 — l'écosystème en ligne** | *les surfaces publiées répondent-elles, avec leurs en-têtes, sans fuite ?* | ✅ **VERDICT : écosystème vérifié** |
| **Produit 3 — gabarit Vue** | *la preuve est-elle rejouable et datée ?* ***(construction, poids, 4 notes, CLS)*** | ✅ **PREUVE ÉTABLIE** |
| **Produit 5 — contrôle de pré-lancement** | *distingue-t-il un défaut d'un faux positif ?* | ✅ **35 vérifications, 0 échec** |

> ⭐ **Le principe, écrit dans le script lui-même** : *« un produit vendu sur une preuve doit pouvoir
> reproduire cette preuve. […] **Une épreuve qui n'a pas tourné est écrite comme non mesurée — jamais
> comptée comme un succès.** »*
>
> ⚠️ **Et le document dit aussi ce qu'il ne prouve PAS** : *« elles prouvent que **nos outils
> détectent** les défauts qu'on leur présente, et que **nos surfaces publiées** passent les contrôles
> à l'instant de la mesure. **Elles ne prouvent pas qu'un site client obtiendra les mêmes scores —
> cela dépend de son contenu.** »*

---

## 4. Le dossier de démonstration — ce qu'on peut montrer, et où

| Ce qu'on montre | Où | État |
|---|---|---|
| **Le site public** | `gldigitallab.fr` | ✅ **en ligne, 183 pages** |
| **Les tarifs et la méthode** | `/dossier` | ✅ *« en cours d'immatriculation » — écrit noir sur blanc* |
| **Les engagements** | `/ce-que-nous-nous-imposons` | ✅ *pas de hub qui centralise · aucun chiffre sans source · **aucune décision déléguée*** |
| **L'état du studio, mesuré et daté** | `/etat-du-studio` | ✅ ***le chiffre est dans le HTML, pas dans un script*** |
| **La preuve en production** | `/arkadia` | ✅ *un réseau social exploité* |
| **Le projet de jeu** | `/armure` | ✅ *original, six lois de forme, **aucun nom de franchise*** |
| **Le kit pédagogique** | `/TARDIS/JoF/metroid/` | ⚠️ **141 pages, `noindex` et hors plan du site** — *atteignable, pas indexable, **par décision*** |

---

## 5. ⛔ Ce qui bloque encore la vente — et ce n'est PAS le prix

**Le document source le dit, et je le recopie :**

| # | Ce qui bloque | Ce qu'il faut pour le lever |
|---|---|---|
| **1** | ⚠️ **La société n'est pas immatriculée** | ⭐ *« on peut **chiffrer et démontrer**, pas **encaisser** »* — **c'est l'objet du 28/09** |
| **2** | **Les CGV définitives manquent** | *rétractation 14 jours · exception des contenus numériques fournis immédiatement · **mention de TVA ou de son absence*** |
| **3** | **La « résiliation en 3 clics »** | *obligation depuis juin 2023 **si vente par abonnement*** — *et la veille outillée a une formule récurrente* |

> ⭐ **La phrase à retenir, et elle est du studio** : ***« Le seul point qui empêche tout le reste est
> l'immatriculation. Tout le reste est prêt ou en attente d'elle. »***

---

## 6. ⚠️ Les réserves — elles voyagent avec ce document

**Un dossier qui oublierait ces lignes serait un dossier qui promet ce qu'il n'a pas.**

- ⛔ **L'AGEFIPH ne remplace pas les autres financements** — *« l'Agefiph intervient principalement
  pour compenser le handicap dans l'emploi, **en complémentarité avec les financements existants** »*.
  *Un dossier qui compterait 3 000 € d'AGEFIPH comme socle **se tromperait de nature**.*
- ⛔ **Un contrat de filière n'est ni un marché ni une subvention.** *Le cadre « Horizon 2030 » ne
  promet **aucun euro** et ne crée **aucun droit**.* **Rien dans ce document n'est un financement.**
- ⛔ **Et « Horizon 2030 » n'est pas « France 2030 »** — *deux dispositifs distincts.*
- ⚠️ **Le studio n'a aucune référence client nominative.** *Il le revendique, et `/dossier` l'écrit.*

---

## 7. Ce que ce document n'établit pas

- ⛔ **Aucun prix n'a été fixé ici.** *Sept viennent du document du 10/09, **les trois autres
  attendent la décision de Gaëtan** — et c'est écrit dans le tableau, pas en note.*
- **Je n'ai pas relu la gamme complète des 10 produits** : *le document dit « 10 produits, 7 avec un
  prix ». **J'en cite 7 + 3 + les 3 paliers RAG**, et **je ne sais pas si un produit m'échappe.**
- **Les chiffres d'épreuve sont du 19/09/2026, à 13 h 53.** *Ils sont datés et rejouables ; **ils
  ne sont pas une garantie sur un site client** — le document source le dit lui-même.*
- **Je n'ai pas ouvert le site dans un navigateur.** *J'ai mesuré les fichiers livrés : 183 pages,
  les poids, les verrous. **Le rendu à l'écran n'a pas été regardé par un œil humain.***
- **Je n'ai pas vérifié les CGV publiées** — *le document source dit « les CGV définitives
  manquent » ; **je n'ai pas ouvert `/cgv` pour voir ce qui y est.*** ⚠️ *Deux de mes vérifications
  antérieures ont montré que le site en dit parfois plus que ce que les documents croient.*
- ⛔ **Aucun contact, aucun dépôt, aucune signature.** *Ce document **met en forme des faits déjà
  écrits** — il ne les produit pas et n'engage rien.*

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Sources : `modeles/prix-figes-2026-09-10.md`
(l. 25-133, **lu**) · `modeles/epreuve-produits-2026-09-19.md` (**produit aujourd'hui par une
exécution réelle**) · `vault-agence/dossier-france-travail-28-septembre-2026.md` §3 et §5 (**lu en
entier, 435 lignes**) · `vault-agence/plan-financement-previsionnel-2026-09-11.md`.*
