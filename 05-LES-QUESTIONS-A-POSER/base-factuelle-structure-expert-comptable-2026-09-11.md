<!-- GLDL-SIG v1 c9813e1bf10325188a9f4a16ff0016de420e8ccf4f159abf5e4b3dfa4cc39cd4 -->
# Base factuelle pour l'expert-comptable et l'avocat — structure de GL Digital Lab

> **À quoi sert ce document.** Il rassemble **les faits** et **les contraintes qui s'opposent**,
> puis pose **des questions numérotées**. Il est écrit pour être remis tel quel à un
> expert-comptable et à un avocat, et pour qu'ils **répondent sur le document** — afin que leur
> réponse soit traçable et datée.
>
> **Ce qu'il n'est pas.** Ce n'est **pas** une recommandation. Aucune option n'est proposée comme
> préférable, parce que **le choix de structure est une décision juridique et fiscale (D12)** qui
> n'appartient pas à un agent. Les deux scénarios sont décrits avec leurs **conséquences
> factuelles**, pas avec un avis.
>
> **Date** : 11/09/2026 · **Échéance** : rendez-vous France Travail le **28/09/2026**.
> L'immatriculation doit suivre ce rendez-vous, et **la structure se choisit à la création** :
> la modifier ensuite coûte un acte, des frais et du temps.

---

## 1. Les faits (rien que des faits vérifiables)

| Fait | Source |
|---|---|
| **La société n'est PAS immatriculée.** Aucun SIREN, aucun SIRET **pour elle** — donc aucune facture possible en son nom. | Déclaration de Gaëtan, 10/09/2026 (`modeles/statut-juridique-2026-09-10.md`) — **nuancé le 11/09, ligne suivante** |
| 🔴 **Le porteur, lui, a déjà été immatriculé** : entrepreneur individuel, **SIREN 830874996**, du **11/07/2017** au **31/12/2017** (état cessé), 80090 Amiens. **Ce n'est donc pas une première création d'entreprise.** | **Registre officiel des entreprises** (INSEE/RNE), consulté le 11/09/2026 — voir `vault-agence/verification-identite-et-structures-2026-09-11.md` §2 |
| La forme **visée** est une **SASU**, fondateur unique. | Projet, pas un fait accompli |
| Adresse publiée : **80560 Harponville, Somme, Hauts-de-France**. | Mentions légales et JSON-LD du site, mesurés |
| Le site **ne publie aucune occurrence de « SASU »** et affiche « entreprise en cours d'immatriculation ». | Mesuré le 10/09 sur 4 pages |
| **Activité** : studio de développement web, applications métier, IA locale ; **clientèle** : PME, TPE, artisans, collectivités françaises | `llms.txt` du site |
| **Prix publics déjà publiés** : audit 149–199 € · site web dès 2 500 € · application métier dès 8 000 € · IA locale dès 1 500 € · RAG 3 000/8 000/15 000 € | Site public, relevé |
| **Cinq produits** ont une épreuve chiffrée rejouable (portes de sécurité, gabarit Vue). | `modeles/epreuve-produits-2026-09-11.md` |
| Gaëtan est **demandeur d'emploi**, rendez-vous **France Travail le 28/09/2026**. | Déclaration |
| Une **RQTH** est en jeu (l'AGEFIPH vise les « aides RQTH »). | Page officielle AGEFIPH |
| **Holding « Apexis »**, gérée par **Grégory Langlet** (frère), décrite comme **SASU LPSP**. | Déclaration de Gaëtan, 11/09/2026 |
| 🔴 **Aucune société « Apexis » au registre dans la Somme** (0 résultat dans les départements 80, 02, 59, 60, 62). À l'adresse déclarée (5 rue du Centre, 80560 Harponville) : **LPSP = LANGLET PLUQUET SECURITE PREVENTION**, SIREN **984443077**, **SAS et non SASU**, créée le **29/01/2024**, avec **deux** dirigeants — Grégory Langlet (président) et **Frédéric Pluquet** (directeur général). Également sur place : **SCI GODERAND « 3GL »**, SIREN 928701010, Grégory Langlet gérant. | **Registre officiel** (INSEE/RNE), consulté le 11/09/2026 — `verification-identite-et-structures-2026-09-11.md` §3 |
| **Le logement du 5 rue du Centre est LOUÉ, et le bailleur est la SCI GODERAND** (gérée par Grégory Langlet). Ce n'est donc **pas** la structure de détention. | Précision de Gaëtan, 11/09/2026 |
| **Domiciliation envisagée** : Harponville (adresse personnelle). Trois vérifications : relecture du **bail** (clause d'activité), **autorisation écrite** de la SCI GODERAND, **règlement de copropriété** s'il existe. | Déclaration de Gaëtan + conséquence |

---

## 2. Les contraintes qui s'opposent — c'est le cœur du problème

Trois dispositifs visés, et **deux d'entre eux exigent la même chose** : que Gaëtan soit
propriétaire et dirigeant de sa société. Le troisième impose une contrainte de forme.

| Dispositif | Ce qu'il exige | Source |
|---|---|---|
| **ACRE** — 50 % d'exonération de cotisations, 12 mois | Être **chercheur d'emploi indemnisé (ARE)** ou **inscrit 6 mois sur 18**, RSA, ASS, 18-25 ans, ou QPV. Ne pas avoir eu l'ACRE dans les 3 ans. **Demande à l'URSSAF sous 60 jours** après l'ouverture d'activité. | France Travail, page officielle 2026 |
| **ARCE** — 60 % des droits ARE restants en capital | **Exige l'ACRE obtenue au préalable.** ARE et ARCE mutuellement exclusives. | France Travail, page officielle 2026 |
| **AGEFIPH** — 3 000 € maximum | **Sept conditions**, dont : projet ≥ **7 500 €** · **activité principale** · **détenir la MAJORITÉ DES PARTS** · apport personnel ≥ **1 200 €** · plan de financement équilibré · **accompagnement par un prestataire habilité qui valide le projet** | AGEFIPH, page officielle de l'aide |

### 🔴 La contradiction, écrite noir sur blanc

**L'AGEFIPH condition 4 exige que Gaëtan détienne la majorité des parts. Le rattachement à une
holding signifie, dans son acception habituelle, qu'Apexis détient tout ou partie du capital — et
donc, si Apexis est majoritaire, Gaëtan perd les 3 000 €.**

Et la question s'étend à l'**ACRE**, qui est une aide **au créateur** : si l'associé unique est
une **société** et non une **personne physique**, la qualité de « créateur » se discute — et
l'**ARCE en dépend**, soit **60 % des droits ARE restants**.

**Autrement dit : le choix de structure décide de plusieurs milliers d'euros d'aides.** Ce n'est
pas un sujet d'organisation, c'est un sujet d'argent.

### ⚠️ Une incohérence de forme à relever avant tout

**« SASU LPSP »** est décrit comme la holding d'Apexis. Or **une SASU ne peut pas avoir plusieurs
associés** (le « U » de SASU signifie *unipersonnelle*). Si la holding doit réunir deux personnes
(deux frères), **la forme est à vérifier avant la structure** : ce n'est plus une SASU mais une
SAS, ou une autre forme.

**Question préalable à toute autre** : le mot « SASU » désigne-t-il correctement la holding
existante, ou est-ce un abus de langage ?

---

## 3. Les questions à poser — numérotées pour être répondues

**Chaque question a une case de réponse.** Ce document est fait pour repartir de chez le
conseil avec les réponses écrites, pas avec un souvenir.

### A. Structure et aides — les plus coûteuses si mal tranchées

| # | Question | Réponse |
|---|---|---|
| **A1** | **L'ACRE est-elle préservée si la société est créée avec une holding comme associée ?** L'aide est destinée au « créateur » : la qualité de créateur est-elle reconnue à une personne physique qui détient via une holding ? | |
| **A2** | **L'AGEFIPH condition 4 (« détenir la majorité des parts ») est-elle compatible avec un actionnariat majoritaire d'Apexis ?** Si non, quel montage permet de conserver l'aide ? | |
| **A3** | **Quel est le seuil exact** : faut-il détenir 50 % + 1 voix, ou la majorité *du capital*, ou *des droits de vote* ? La page dit « la majorité des parts » — cette formulation couvre-t-elle les deux ? | |
| **A4** | **L'ARCE (60 % des droits ARE) est-elle compatible** avec la structure retenue ? | |
| **A5** | **Un devis ou un contrat peut-il être signé par Gaëtan en nom propre** avant l'immatriculation, et basculé ensuite sur la société ? | |

### B. Rattachement à Apexis

| # | Question | Réponse |
|---|---|---|
| **B1** | **Quelle est la forme exacte d'Apexis ?** Une SASU peut-elle détenir une filiale à deux personnes ? | |
| **B2** | **Qui détient Apexis**, et à quelles quotités ? | |
| **B3** | **L'intégration fiscale** est-elle souhaitable, possible, et à quelles conditions ? | |
| **B4** | **Quelles écritures sont nécessaires** : convention de trésorerie, prestations intragroupe, comptes courants d'associés ? | |
| **B5** | **Quel est l'effet sur les aides** (ACRE, ARCE, AGEFIPH) d'un changement de structure **après** la création, par rapport à une structure décidée **à** la création ? | |

| **B6** | ⚠️ **« Apexis » n'existe à aucun registre** *(re-vérifié le 14/09/2026 — Somme **et** France entière)*. **Que peut-on signer, et à quel nom, tant que l'entité n'est pas identifiée ?** | |
| **B7** | **Le nom annonce une sécurité, le code déclaré est l'ingénierie.** LPSP est enregistrée en **71.12B — ingénierie, études techniques**, alors qu'elle se nomme « Sécurité Prévention ». *L'exercice d'une activité de sécurité privée est un domaine réglementé en France — **à qualifier par un juriste, ce n'est pas de mon ressort (D12)**. La question posée : ce périmètre a-t-il une incidence sur le rattachement, les assurances, ou les marchés visés ?* | |
| **B8** | **La SCI Goderand « 3GL » partage l'adresse exacte de LPSP** et son gérant est le même. **Est-elle un véhicule à considérer, ou à tenir dehors ?** *Rappel mesuré : le dispositif AGEFIPH **exclut les SCI** — source officielle, § 2 bis du dossier de décision.* | |
| **B9** | ⚠️ **Le calendrier.** L'AGEFIPH impose *« l'engagement sur l'honneur de rembourser l'aide forfaitaire […] en cas de cession, cessation ou revente de l'entreprise dans les 12 mois qui suivent la date de création »*. **Une cession majoritaire faite après coup coûte donc le remboursement des 3 000 €.** *La structure doit-elle être arrêtée **avant** l'immatriculation ?* | |

> **Note ajoutée le 14/09/2026.** Les lignes **B1** et **B2** ci-dessus — *« quelle est la forme exacte
> d'Apexis »*, *« qui détient Apexis »* — **ne peuvent pas être remplies aujourd'hui** : le registre
> officiel, réinterrogé le 14/09, ne trouve **aucune société « Apexis »** dans la Somme, et la
> recherche nationale ne remonte qu'une **homonymie sans lien** (Bordeaux, établissements fermés
> depuis le 12/11/2025). *Ce n'est pas une lacune du dossier : c'est la réponse.*
> **Ces deux questions appartiennent d'abord à Grégory, pas au conseil** — et le conseil doit le
> savoir **avant** de facturer une analyse sur une entité dont personne ne connaît le SIREN.

### C. Fiscal, social, pratique

| # | Question | Réponse |
|---|---|---|
| **C1** | **Régime fiscal** : la SASU est à l'IS par défaut. L'option pour l'IR est-elle pertinente ici ? | |
| **C2** | **TVA** : franchise en base ou assujettissement dès le premier euro ? Conséquence sur les prix publics déjà affichés (149–199 €, 2 500 €, 8 000 €) — sont-ils HT ou TTC ? | |
| **C3** | **Rémunération du dirigeant** : salaire ou dividendes, et comment cela s'articule avec le maintien de l'ARE ou l'ARCE ? | |
| **C4** | **Domiciliation à Harponville** : le logement est **loué** et le bailleur est une **SCI familiale** (GODERAND). Le bail autorise-t-il une activité professionnelle ? Faut-il l'accord écrit du bailleur, et sous quelle forme ? Le règlement de copropriété s'y oppose-t-il ? | |
| **C5** | **Assurance RC professionnelle** : obligatoire dans notre activité, et à quel moment la souscrire ? | |
| **C6** | **Le registre RGPD et les mentions de confidentialité** doivent-ils viser **Gaëtan Langlet en personne** tant que la société n'existe pas ? | |

### D. Ce que le conseil doit fournir, et quand

| # | Question | Réponse |
|---|---|---|
| **D1** | **Quelles pièces** devons-nous apporter au premier rendez-vous ? | |
| **D2** | **Combien de temps** entre le rendez-vous, le dépôt au Guichet unique, et l'immatriculation ? *(Le délai de 60 jours pour l'ACRE court à partir de l'ouverture d'activité : il faut le connaître.)* | |
| **D3** | **Faites-vous le dépôt au Guichet unique**, ou devons-nous le faire ? | |
| **D4** | **Quel est votre honoraire** pour la constitution, et pour l'accompagnement la première année ? | |

---

## 4. Ce que le prestataire « habilité » doit valider (condition 7 de l'AGEFIPH)

L'AGEFIPH exige *« avoir été accompagné par un prestataire expert de la création d'entreprise
habilité **qui valide le projet** »*. **L'accompagnement doit donc précéder la demande d'aide.**

Le **BGE** est partenaire affiché de l'**AGEFIPH**, de **France Travail**, de **Bpifrance** et
des grandes banques : c'est le point d'entrée naturel. (Le réseau **Initiative France**, pour le
prêt d'honneur, est un autre interlocuteur — et son prêt **renforce l'apport personnel**, ce qui
répond à la condition 5 de l'AGEFIPH.)

**À faire cette semaine :** prendre rendez-vous avec le BGE de la Somme et avec l'association
Initiative locale. **Ce sont eux qui délivrent les validations qui conditionnent les aides.**

---

## 5. Ce qui reste en attente, et qui n'est pas de mon ressort

- **Les montants du prêt d'honneur** : non lus à la source (la page officielle décrit la nature —
  taux 0, sans garantie — mais pas les montants). À demander à l'association locale.
- **Aides régionales Hauts-de-France**, **garantie Bpifrance**, **Réseau Entreprendre**, **ADIE** :
  non vérifiés.
- **La condition exacte de la RQTH** et **la liste officielle des prestataires habilités** :
  non lues.

**Aucune de ces lignes n'est inventée — elles sont écrites comme non vérifiées, ce qui est
différent d'un oubli.**

---

## 6. Rappel des limites, pour que personne ne se trompe

Ce document **prépare** un rendez-vous. Il **ne remplace ni l'expert-comptable, ni l'avocat, ni
le conseiller France Travail**. Il est écrit par un agent, à partir de sources officielles citées
— et **les sources officielles peuvent changer** (l'ACRE a changé de règles au 1ᵉʳ janvier 2026,
c'est précisément pour ça que ce dossier vérifie au lieu de se souvenir).
