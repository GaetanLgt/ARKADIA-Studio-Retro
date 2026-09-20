# Nomenclature du projet — source qui fait foi

> **Ce document existe parce que des analyses externes se trompent.**
> Le 10/09/2026, deux décryptages indépendants du chantier ont circulé en
> annonçant que le projet avait été « rebaptisé Seuil » et que son budget de
> page « dépassait 1 200 Ko ». Les deux affirmations sont fausses, et elles
> viennent d'une lecture de documents internes **pris à des dates différentes**.
>
> Quand une même information circule mal deux fois, ce n'est pas la faute des
> lecteurs : c'est qu'aucun document ne dit clairement **quel nom s'applique à
> quoi**. Celui-ci le fait. En cas de doute, c'est celui-ci qui tranche.

---

## Les quatre noms, et ce qu'ils désignent

| Nom | Ce que c'est | Statut |
|---|---|---|
| **GL Digital Lab** | La **société** (nom commercial), Harponville (80560, Somme). C'est le nom qui figure sur les devis, les factures et les mentions légales. | Le seul nom commercial. **Statut juridique au 10/09/2026 : société PAS ENCORE IMMATRICULÉE** — aucun SIREN, aucun SIRET. Ne JAMAIS écrire « SASU » au présent, ni « immatriculée » : le statut visé (SASU) reste un projet. Les mentions légales publiées disent elles-mêmes « Entreprise en cours d'immatriculation ». |
| **ARKADIA (code SS00999)** | Le **vaisseau** : la machine de calcul de Gaëtan. Un poste unique, identifié, dont les caractéristiques sont publiées sur le site. | **Actif.** C'est le nom employé sur le site et le fond d'écran. |
| **SEUIL** | Un **nom de concept** proposé par le directeur artistique externe, pour désigner le point d'irruption de l'IA dans le réel. | **NON ADOPTÉ.** Proposition en attente. Aucune recherche d'antériorité INPI n'a été faite, aucun dépôt. **Ne pas l'employer comme nom du projet.** |
| **Arcadia** | Nom employé par les analyses externes. | **N'existe pas** dans nos documents. Confusion probable avec ARKADIA. |

## Les pièges de vocabulaire

- **ARKADIA** désigne **trois choses différentes** selon le contexte : le
  vaisseau (le poste de calcul), le réseau social **ArkAdiA** en production, et
  le cluster de jeu **ARKADIA France PvE** exploité 18 mois. L'audit externe
  recommande de réserver le nom au produit et de donner au poste un identifiant
  technique distinct (il propose `GL-LOCAL-01`). **Décision de Gaëtan, en
  attente.**
- **SEUIL** et **Arcadia** ne sont pas interchangeables : l'un est une
  proposition non retenue, l'autre une invention des analyses externes.

## Les chiffres, avec leur date — parce qu'ils bougent

La plupart des erreurs des analyses viennent de chiffres datés présentés comme
actuels. Chaque chiffre doit donc être lu avec sa date.

| Mesure | Valeur | Date | Où |
|---|---|---|---|
| Poids de la page d'accueil | **878 Ko** transmis compressé | 10/09/2026 | `forge-ia/audit-home.py` |
| Poids des six unités 3D | **408 Ko** | 10/09/2026 | génération SDXL → TRELLIS.2 |
| Poids des avatars précédents | 938 Ko | avant le 10/09/2026 | remplacés |
| Contrastes statiques | **31 paires conformes** | 10/09/2026 | `forge-ia/audit-home.py` |
| Contrastes des états dynamiques | 12 règles jugées, 0 échec | 10/09/2026 | `forge-ia/audit-etats-dynamiques.py` |
| Accessibilité structurelle | 0 échec sur 5 pages | 10/09/2026 | `forge-ia/audit-a11y.py` |
| Lighthouse performance | **non mesuré de façon fiable** | — | voir `docs/mesurer-la-performance.md` |

⚠️ **Le chiffre de « 1 241 Ko »** qui circule vient d'un ancien document
(`decisions-da-matrix-resurrections.md`) qui **additionnait les fichiers bruts**
sans compression. Il ne décrit plus rien : la mesure réelle est de 878 Ko.

⚠️ **Le chiffre de « 100 000 € »** est le **niveau d'ambition de la commande** de
Gaëtan, pas une dépense, pas un budget, pas un prix pratiqué. Les prix réels sont
publics : 149 à 199 € pour un audit, dès 2 500 € pour un site.

## Rappel de méthode

Nos documents internes sont des **instantanés datés**, pas un état courant. Chacun
décrit ce qui était vrai le jour où il a été écrit, y compris quand la suite l'a
contredit — c'est voulu, c'est la trace des décisions.

**Pour connaître l'état courant, ne lire aucun document seul :** consulter
`decisions-concept-flagship-d5.md`, section 7bis « ce qui n'est PAS démontré »,
qui est tenue à jour, et rejouer les scripts de mesure.
