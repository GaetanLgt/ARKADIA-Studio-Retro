<!-- GLDL-SIG v1 8e10cfc7cbdd0e1799589578f31a1333f82c1cbbea656c7608f825495e397005 -->
# Plan de financement et prévisionnel — GL Digital Lab

> **Ce que ce document est.** La pièce que réclament **les quatre organismes** en même temps :
> le BGE et le prestataire habilité (accompagnement), l'AGEFIPH (aide de 3 000 € au plus), la
> banque (concours bancaire), Initiative France (prêt d'honneur). Tous demandent la même chose —
> **un projet présenté, un plan de financement équilibré, un prévisionnel** — et aucun ne le
> fournit. Il est donc écrit une fois, ici.
>
> **Ce qu'il ne fait pas.** Il **ne chiffre rien à ta place**. Les montants que je ne peux pas
> vérifier à la source sont des champs à remplir, écrits `[à renseigner]`. Un plan de financement
> dont on invente les lignes n'est pas un plan : c'est ce qui fait refuser un dossier.
>
> **Ce qui est vérifié** porte sa source en fin de document. Ce qui ne l'est pas est écrit comme
> tel.

---

## 0. En une page

| | |
|---|---|
| **Projet** | Studio de développement web, d'applications métier et d'intelligence artificielle locale |
| **Porteur** | Gaëtan Langlet, seul fondateur, demandeur d'emploi à la date du document |
| **Forme visée** | SASU, fondateur unique — **décision juridique, non tranchée à ce jour** |
| **Implantation** | Harponville (80560), Somme, Hauts-de-France — domiciliation à l'adresse personnelle |
| **Clientèle** | TPE, PME, artisans et collectivités françaises |
| **Étape en cours** | Rendez-vous France Travail le **28/09/2026** ; immatriculation ensuite, via le Guichet unique INPI |
| **Situation juridique au 11/09/2026** | **La société n'est pas immatriculée** : aucun SIREN ni SIRET pour elle, donc **aucune facture possible à ce jour**. ⚠️ **Le porteur, en revanche, a déjà été immatriculé** : entrepreneur individuel, SIREN 830874996, du 11/07/2017 au 31/12/2017 (cessé). **Ce n'est donc pas une première création d'entreprise** |
| **Ce qui existe déjà** | Un site public en ligne, un catalogue à prix publics, une gamme de produits **dont les épreuves ont été rejouées et datées** |

---

## 1. Le projet

### 1.1 Qui porte le projet

Gaëtan Langlet, développeur, seul fondateur. Le projet est mené en parallèle d'une recherche
d'emploi, avec un rendez-vous France Travail fixé au **28/09/2026** pour présenter la création
d'entreprise et arbitrer entre le maintien de l'ARE et l'ARCE.

Une **reconnaissance de la qualité de travailleur handicapé (RQTH)** est en jeu dans le dossier :
l'AGEFIPH intitule sa page d'aide **« Aides RQTH à la création d'entreprise »**, ce qui fait de la
RQTH une condition d'accès à ses aides et non un élément de contexte.

### 1.2 Quoi — quatre activités, un même métier

| # | Activité | Ce que le client achète |
|---|---|---|
| 1 | **Sites web** pour TPE, PME, artisans, collectivités | Un site mesuré, accessible, rapide, dont les scores sont rejouables |
| 2 | **Applications métier** | Un outil interne qui remplace un tableur et un process manuel |
| 3 | **Intelligence artificielle locale** | Un modèle qui tourne **sur le matériel du client**, sans envoyer ses données à un service tiers |
| 4 | **Recherche documentaire assistée (RAG)** | Un moteur de recherche sur les documents internes du client, avec extraits sourcés |

La quatrième est celle qui porte le positionnement : dans l'IA, la question que se posent les
PME n'est plus « est-ce que ça marche » mais « **où partent mes données** ». Un modèle qui tourne
sur place répond à cette question par une mesure, pas par une promesse.

### 1.3 À qui

Marché visé : **TPE, PME, artisans et collectivités françaises**. Le point commun est moins la
taille que la contrainte — ces structures ont des données à protéger, un budget limité, et aucune
équipe technique interne.

### 1.4 Où

Harponville, dans la Somme. Domiciliation envisagée à l'adresse personnelle — **un logement
loué, dont le bailleur est la SCI GODERAND** (gérée par Grégory Langlet).

Trois conséquences pratiques, dans cet ordre :

1. **Relire le bail** : une clause peut interdire toute activité professionnelle dans le
   logement, ou l'autoriser sous condition. Le contrat est la première chose à ouvrir.
2. **Demander une autorisation écrite de domiciliation** à la SCI, au nom de GL Digital Lab.
   Le bailleur étant familial, c'est un courrier — mais il doit être **écrit**, parce que
   c'est ce document qu'un greffe, un expert-comptable ou une banque peut demander. **Une
   autorisation orale ne vaut rien dans un dossier.**
3. **Vérifier le règlement de copropriété**, s'il en existe un : il peut restreindre l'usage
   des lots indépendamment du bail.

⚠️ **Ce que ce document n'écrit pas** : aucun article de loi sur la domiciliation. Une
recherche à la source a été tentée et **la source renvoyait une erreur 404**. Le régime exact
dépend de la commune, du local et du type de société : **c'est une question d'avocat ou
d'expert-comptable**, pas d'agent.

**Vigilance, sans dramatiser** : à cette adresse sont déjà installés la SAS **LPSP** (dont le
directeur général n'est pas de la famille) et le bailleur. Ce n'est pas un obstacle, mais
GL Digital Lab doit avoir **son propre domicile déclaré, sa propre comptabilité, son propre
compte bancaire**, et l'autorisation doit désigner **elle seule**.

Le poste « domiciliation » du plan de financement (§4.2) reste donc `[à renseigner]` : il
peut être **nul** (pas de loyer supplémentaire), mais **seulement après l'accord écrit**.

---

## 2. Ce qui est déjà mesuré — et non promis

C'est la partie qu'aucun dossier de création ne contient d'ordinaire, et c'est celle qui distingue
un projet d'une intention : **les produits existent, et leurs épreuves ont été exécutées**.

| Produit | Ce qui a été éprouvé | Résultat |
|---|---|---|
| Porte d'écosystème | Sait-elle détecter chaque défaut (réponse, en-têtes, HTTPS, listage, fuite, lien, surface fermée) ? | **9 vérifications sur 9** |
| Porte anti-fuite d'identifiants | Sait-elle détecter une fuite d'identifiant technique ? | **6 vérifications sur 6** |
| Porte serveur (VPS) | Sait-elle détecter un SSH rouvert, un pare-feu éteint, un port interdit ? | **10 vérifications sur 10** |
| L'écosystème en ligne | Les surfaces publiées répondent-elles, avec leurs en-têtes, sans fuite ? | **Verdict : écosystème vérifié** |
| Contrôle de pré-lancement | Distingue-t-il un vrai défaut d'un faux positif ? | **35 vérifications, 0 échec** |
| Gabarit Vue 3 | La preuve du gabarit est-elle rejouable et datée ? | **Preuve établie** |

*Source : `modeles/epreuve-produits-2026-09-11.md`, exécution rejouable en une commande.*

Ce que ces épreuves ne prouvent pas : **qu'un client achètera**. Un produit mesuré n'est pas un
chiffre d'affaires. La distinction est tenue partout dans ce dossier.

---

## 3. Le catalogue et ses prix

Aucun prix de cette liste n'est inventé pour ce dossier. Ils sont **déjà publics sur le site** ou
**figés par décision**.

| Produit | Prix | Origine du prix |
|---|---|---|
| Audit web mesuré | **199 € HT** | Haut d'une fourchette déjà publique (149–199 €), justifié par un périmètre plus large |
| Porte anti-fuite d'identifiants | **290 € HT** | Vérification ciblée — vendable seule, donc porte d'entrée |
| Gabarit Vue 3 — licence | **149 € HT** | Produit d'entrée, volontairement loin du site à 2 500 € |
| Gabarit Vue 3 — installé et personnalisé | **390 € HT** | Mène au site au lieu de le contourner |
| Site web | **dès 2 500 €** | Prix public affiché |
| Application métier | **dès 8 000 €** | Prix public affiché |
| Intelligence artificielle locale | **dès 1 500 €** | Prix public affiché |
| Recherche documentaire assistée (RAG) | **3 000 / 8 000 / 15 000 €** | Trois paliers publics affichés |

**Trois produits n'ont pas encore de prix** (vision locale, vidéo de narration, veille outillée).
Leur coût machine est mesuré — quelques secondes — mais leur prix se joue sur le temps humain et
le positionnement. Des fourchettes existent ; **elles ne sont pas arrêtées**, et un dossier qui
les présenterait comme des prix serait faux.

*Source : `modeles/prix-figes-2026-09-10.md`.*

---

## 4. Le plan de financement

### 4.1 Comment on le lit

Un plan de financement se lit en deux colonnes qui doivent **s'équilibrer** :

**BESOINS** (ce qu'il faut sortir au démarrage) = **RESSOURCES** (ce qu'on y met).

### 4.2 Les besoins — structure

Les postes ci-dessous sont ceux d'un studio de développement. **Aucun montant n'est écrit** :
ils dépendent de choix qui n'ont pas été faits.

| Poste | Montant | Observations |
|---|---|---|
| Matériel informatique | `[à renseigner]` | Un poste de travail existe déjà — à valoriser ou non en apport |
| Logiciels et licences | `[à renseigner]` | |
| Domiciliation et siège | `[à renseigner]` | Logement **loué à la SCI GODERAND** (bailleur familial, géré par Grégory Langlet). Charge possiblement nulle, **mais seulement après autorisation écrite de la SCI** et relecture du bail — voir §1.4 |
| Nom de domaine, hébergement, certificats | `[à renseigner]` | Charge annuelle, faible mais certaine |
| Assurance responsabilité civile professionnelle | `[à renseigner]` | |
| Comptabilité et obligations déclaratives | `[à renseigner]` | |
| Frais bancaires professionnels | `[à renseigner]` | |
| Communication et identité visuelle | `[à renseigner]` | |
| **Fonds de roulement** | `[à renseigner]` | Le poste qu'on oublie toujours : plusieurs mois de charges avant la première facture encaissée |
| **TOTAL DES BESOINS** | `[à renseigner]` | Doit dépasser **7 500 €** (condition 1 de l'AGEFIPH) |

### 4.3 Les ressources — avec les plafonds vérifiés

| Ressource | Montant | Ce qui est vérifié |
|---|---|---|
| **Apport personnel** | `[à renseigner]` | L'AGEFIPH exige **1 200 € minimum**. C'est un seuil, pas une suggestion |
| **Prêt d'honneur — Initiative France** | `[à renseigner]` | **Taux 0, aucune garantie demandée.** Renforce l'apport personnel, donc sert aussi la condition des 1 200 €. **Les montants plancher et plafond ne sont pas publiés** : à demander à l'association locale. 207 associations, dont celle du secteur d'implantation |
| **AGEFIPH — aide à la création** | **3 000 € maximum** | Plafond lu sur la page officielle de l'aide. **Complémentaire** des autres financements, jamais socle |
| **ARCE** (si retenue) | `[à renseigner]` | **60 % des droits ARE restants**, versés en deux fois (création, puis 6 mois). **Exclusive de l'ARE maintenue.** Fiscalisée, et coûte **3 % de droits à la retraite** |
| **Concours bancaire** | `[à renseigner]` | |
| **Aides locales, garantie Bpifrance, ADIE, Réseau Entreprendre** | `[à renseigner]` | ⚠️ **CORRIGÉ LE 19/09/2026 — cette ligne disait « Non vérifiées à ce jour », et c'était FAUX.** *La section 8 de CE MÊME document porte : « ✅ **FAIT le 12/09/2026** → `veille-web/financements-verifies-2026-09-12.md` ». **Les deux sections se contredisaient, et c'est celle-ci qui était périmée.*** |
| | | **Ce qui est vérifié depuis le 12/09** *(117 lignes, sources datées)* : **Réseau Entreprendre** 15 000–50 000 € ⚠️ *mais **5 emplois à 3 ans et 15 000 € d'apport** — hors de portée d'une SASU solo* · **ADIE** jusqu'à 15 000 € ⚠️ *mais **8 % + 6 % ≈ 14 %** et garant personnel à 50 %* · **JEI/JEIR** jusqu'à 50 % de réduction d'impôt *(souscriptions 2024-2028)* · **Fondation 2ᵉ chance** jusqu'à 8 000 € · **Autonomie et Solidarité** jusqu'à 100 000 € en fonds propres *(Hauts-de-France)* · **83 financements publics** recensés en région. |
| | | ⚠️ **Ce qui reste NON VÉRIFIÉ** *(et signalé comme tel dans la fiche)* : *le **montant du prêt d'honneur Initiative** — non publié au niveau régional, il se **demande** à l'association · et la **garantie Bpifrance**. **À instruire — les citer sans les avoir lues serait une faute.** |
| **TOTAL DES RESSOURCES** | `[à renseigner]` | Doit égaler le total des besoins |

### 4.4 Les trois contrôles que l'AGEFIPH impose à ce tableau

Une fois les lignes remplies, ce plan doit passer **trois contrôles**, tous issus de la page
officielle de l'aide :

| # | Contrôle | État |
|---|---|---|
| 1 | Le projet atteint **7 500 € minimum** au total | ⏳ dépend du total des besoins |
| 5 | L'apport personnel atteint **1 200 € minimum** | ⏳ dépend de la ligne apport — le prêt d'honneur aide à l'atteindre |
| 6 | Le plan de financement est **équilibré** | ⏳ besoins = ressources |

**Deux autres conditions ne se règlent pas dans ce tableau** et doivent être tranchées **avant**
de créer :

- **Condition 3** — le studio doit être l'**activité professionnelle principale** ;
- **Condition 7** — être **accompagné par un prestataire habilité qui valide le projet**.
  C'est le **BGE** qui est le point d'entrée naturel : partenaire affiché de l'AGEFIPH et de
  France Travail. L'accompagnement doit **précéder** la demande d'aide.

---

## 5. Le prévisionnel — les hypothèses, et qui les pose

Un prévisionnel n'est pas un tableau de chiffres : c'est **un jeu d'hypothèses qu'on s'engage à
tenir**. Je ne peux pas les poser à ta place — elles engagent ta charge de travail et ton revenu.
Je peux, en revanche, dire exactement **lesquelles sont nécessaires** et **pourquoi chacune
change le résultat** :

| Hypothèse | Pourquoi elle est indispensable |
|---|---|
| **Nombre de jours travaillés par mois** | Détermine la capacité maximale. Sans elle, aucun chiffre d'affaires n'est calculable |
| **Répartition entre les activités** | Un site à 2 500 € et une licence à 149 € ne consomment pas le même temps |
| **Nombre de ventes par mois, par produit** | L'hypothèse la plus fragile du dossier : c'est ici qu'un prévisionnel se casse |
| **Délai moyen d'encaissement** | Un prévisionnel de trésorerie se joue là, pas sur le chiffre d'affaires |
| **Charges fixes mensuelles** | Le seuil de rentabilité en découle directement |
| **Rémunération du dirigeant** | Elle est une charge ET une ressource — la même ligne des deux côtés |
| **Date d'obtention de l'ACRE** | 50 % d'exonération pendant 12 mois : la date change la trésorerie de la première année |

**Le premier exercice en trois questions, dans cet ordre :**
1. Combien de **mois de charges** puis-je payer sans aucune vente ?
2. Quelle est la **première vente** possible, et à quelle date ?
3. À partir de **combien de ventes par mois** l'entreprise ne perd-elle plus d'argent ?

Un prévisionnel qui ne répond pas à ces trois questions n'est pas un prévisionnel.

---

## 6. Les contraintes vérifiées qui pèsent sur ce plan

Ces quatre points ne sont pas des conseils. Ce sont des règles lues à la source, et trois d'entre
elles se contredisent entre elles — ce qui doit être tranché avant la création.

### 6.1 Le rattachement à une holding annulerait l'aide AGEFIPH

La **condition 4** de l'AGEFIPH exige, dans les mots de la page officielle, d'**« être le dirigeant
de l'entreprise, c'est-à-dire détenir la majorité des parts »**.

Un rattachement au capital d'une holding — **Apexis**, gérée par Grégory Langlet — place la
holding en position d'associé. Si elle détient la majorité, **l'aide de 3 000 € est perdue**.

Soit Gaëtan détient la majorité de GL Digital Lab et garde l'AGEFIPH, soit la holding la détient
et il la perd. **C'est un arbitrage, pas une formalité**, et il se tranche avec l'expert-comptable
et l'avocat avant l'immatriculation.

### 6.2 La structure décrite ne correspond pas au registre

**Ce n'est plus une déduction, c'est une vérification.** Le registre officiel des entreprises,
interrogé le 11/09/2026, donne ceci :

| Ce qui était décrit dans le dossier | Ce que dit le registre officiel |
|---|---|
| Une holding nommée **« Apexis »** | **Aucune société « Apexis » dans la Somme** — 0 résultat dans les départements 80, 02, 59, 60 et 62 |
| **« SASU LPSP »** | **LPSP = LANGLET PLUQUET SECURITE PREVENTION**, SIREN **984443077**, déclarée en **SAS** (code 5710), créée le **29/01/2024**, siège **5 rue du Centre, 80560 Harponville** |
| Gérée par Grégory Langlet | **Deux** dirigeants au registre : **Grégory Langlet** (président) **et Frédéric Pluquet** (directeur général) |
| Une holding | Activité déclarée **71.12B** (ingénierie, études techniques). Le mot « holding » n'apparaît pas |
| — | Une **SCI**, **GODERAND « 3GL »** (SIREN 928701010, créée le 03/05/2024), siège à la même adresse, Grégory Langlet gérant. **C'est peut-être la structure de détention** — mais c'est à Gaëtan de le confirmer, pas à un agent de le déduire |

**Deux conséquences, et elles sont pratiques :**

1. **Une SASU ne peut pas avoir plusieurs associés** — c'est sa définition. La fiche du registre
   porte deux dirigeants et nomme un tiers, **Frédéric Pluquet**. La forme décrite est donc
   inadaptée, et la structure n'est pas uniquement familiale.
2. **On ne rattache pas une société à une holding dont le nom ne figure à aucun registre.**
   Il faut le **nom exact et le SIREN** de la structure de détention, ou constater qu'elle n'est
   pas encore immatriculée.

Détail complet et méthode : `vault-agence/verification-identite-et-structures-2026-09-11.md` §3.

**À trancher avec l'expert-comptable ou l'avocat, avant l'immatriculation.**

### 6.3 L'ACRE : 60 jours, et c'est un délai qui ne se rattrape pas

| | |
|---|---|
| Demande | **À l'URSSAF, dans les 60 jours** suivant l'ouverture de l'activité |
| Avant 2026 | La demande était **automatique** |
| Depuis le 1ᵉʳ janvier 2026 | **Elle ne l'est plus.** Passé 60 jours, l'aide est définitivement perdue |
| Effet | **50 % d'exonération de cotisations pendant 12 mois** |

**L'ARCE est impossible sans ACRE obtenue** : c'est la première qui conditionne la seconde.

### 6.4 ARE ou ARCE : un choix, pas un cumul

| | ARE maintenue | ARCE |
|---|---|---|
| Nature | Revenu mensuel de remplacement | **60 % des droits restants versés en capital** |
| Versement | Mensuel | **Deux fois** : à la création, puis à 6 mois |
| Fiscalité | — | **Fiscalisée** |
| Retraite | — | **−3 %** de droits |
| Cumul | Plafonné à **60 %** des droits restants depuis le 1ᵉʳ avril 2025 | — |

**Les deux sont exclusifs.** Le choix se fait **après** l'obtention de l'ACRE.

---

## 7. Le calendrier

| Quand | Quoi | Qui |
|---|---|---|
| **Au plus tôt** | Prendre contact avec le **BGE de la Somme** — condition 7 de l'AGEFIPH | Gaëtan |
| **Au plus tôt** | Demander à la **SCI GODERAND** l'**autorisation écrite de domiciliation** au nom de GL Digital Lab (bailleur familial — un courrier) | Gaëtan |
| **Avant le 28/09** | Remplir les lignes `[à renseigner]` de ce plan | Gaëtan |
| **Avant le 28/09** | Poser les hypothèses du §5 | Gaëtan |
| **28/09/2026** | Rendez-vous France Travail | Gaëtan |
| **28/09 → +7 j** | Immatriculation via le Guichet unique INPI | Gaëtan + expert-comptable |
| **Création → +60 j** | **Demande d'ACRE à l'URSSAF** — délai légal | Gaëtan |
| **Après l'attestation ACRE** | Choix ARE ou ARCE | Gaëtan |

---

## 8. Ce qui manque à ce dossier, et qui le produit

| Pièce | Qui |
|---|---|
| Pièce d'identité, justificatif de domicile | Gaëtan |
| **Autorisation écrite de domiciliation** de la SCI GODERAND, bailleur du logement — à demander au nom de GL Digital Lab | Gaëtan |
| Relecture du **bail** (clause d'activité professionnelle) et du règlement de copropriété s'il existe | Gaëtan |
| Attestation France Travail (inscription, droits ARE restants) | Gaëtan |
| Justificatif RQTH, ou démarche engagée | Gaëtan |
| Relevés bancaires des 3 derniers mois, avis d'imposition | Gaëtan |
| CV actualisé | Gaëtan |
| **Chiffrage des besoins et des ressources (§4)** | Gaëtan |
| **Hypothèses du prévisionnel (§5)** | Gaëtan |
| Vérification des aides régionales, de la garantie Bpifrance, de l'ADIE et de Réseau Entreprendre | ✅ **FAIT le 12/09/2026** → `veille-web/financements-verifies-2026-09-12.md` (seule la garantie Bpifrance reste non vérifiée) |
| Décision de structure et de rattachement à la holding | Gaëtan, expert-comptable, avocat |

---

## Sources

Toutes consultées le **11/09/2026** et vérifiées à la source, pas reprises de mémoire.

- **AGEFIPH — Aide à la création ou la reprise d'une entreprise** (les 7 conditions, dont le
  plafond de 3 000 €, l'apport minimum de 1 200 €, le total minimum de 7 500 €, la majorité des
  parts et l'accompagnement habilité) :
  <https://www.agefiph.fr/aides-financieres/aide-la-creation-ou-la-reprise-dune-entreprise>
- **Initiative France — le prêt d'honneur** (taux 0, sans garantie, renforcement de l'apport,
  207 associations) : <https://www.initiative-france.fr/nos-solutions/financement-le-pret-d-honneur.html>
- **BGE** (565 lieux d'accueil, partenaires dont l'AGEFIPH et France Travail) :
  <https://www.bge.asso.fr/>
- **France Travail — ARE, ARCE, ACRE** (50 % sur 12 mois, demande à l'URSSAF sous 60 jours,
  ARCE à 60 % en deux versements, exclusivité ARE/ARCE) :
  <https://www.francetravail.fr/actualites/a-laffiche/2026/are-arce-acre-creer-son-entrepri.html>
- **UNEDIC** (règles d'assurance chômage applicables au créateur d'entreprise).

**Ce qui n'est pas vérifié à ce jour, et qui est donc absent des chiffres ci-dessus** : les
montants du prêt d'honneur (non publiés), le Réseau Entreprendre, l'ADIE, les aides régionales
Hauts-de-France, la garantie Bpifrance, la condition précise de la RQTH, et la liste officielle
des prestataires habilités.

---

## ✅ Mise à jour du 12/09/2026 — la vérification demandée a été faite

Le Réseau Entreprendre, l'ADIE, les aides régionales Hauts-de-France, le guichet local pour
Harponville, la réduction d'impôt JEI-JEIR et l'ACRE sont désormais **vérifiés à la source, avec
leur date** : **`vault-agence/veille-web/financements-verifies-2026-09-12.md`**.

Trois résultats qui changent le dossier :

1. **Le guichet de proximité est identifié** : **Initiative Somme** (Amiens, 03 22 22 30 63),
   plus **Hodéfi** (Lille) pour les **projets innovants**, compétent sur toute la région.
2. **Deux dispositifs sont hors de portée**, et il faut le savoir avant de monter un dossier :
   **Réseau Entreprendre** exige **5 emplois à 3 ans et 15 000 € d'apport** ; l'**ADIE** cible
   les structures sans accès bancaire et coûte **8 % + 6 %** avec un **garant personnel à 50 %**.
3. **La réduction d'impôt JEI-JEIR (jusqu'à 50 %, souscriptions du 01/01/2024 au 31/12/2028)**
   est un **argument à faire figurer dans la demande d'avis JEI** : elle dit à un souscripteur
   ce qu'il gagne.

**Ce qui reste non vérifié, et l'est dit comme tel** : le **montant** du prêt d'honneur Initiative
(non publié — il se demande), la **garantie Bpifrance** (aucune page officielle atteinte ce jour),
et l'**éligibilité personnelle** de Gaëtan à chacun de ces dispositifs, qui dépend de sa situation
et n'a été confrontée à aucun dossier.
