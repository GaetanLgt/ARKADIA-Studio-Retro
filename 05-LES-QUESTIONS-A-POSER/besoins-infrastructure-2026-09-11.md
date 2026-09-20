<!-- GLDL-SIG v1 338d6d69f3f5484bab5d41ab5fae13a5c543e9229801762b063a494e6190bf7c -->
# Besoins d'infrastructure — état mesuré et cible

**GL Digital Lab · 11 septembre 2026 · à joindre au dossier administratif**

> **Ce que ce document est.** L'état **réellement relevé** de la machine du studio, les limites
> qu'elle impose, et ce qu'il faudrait pour les lever. Chaque chiffre vient d'un relevé, pas
> d'une estimation de mémoire.
>
> **Pourquoi il est dans ce dossier.** Une banque, l'AGEFIPH et un accompagnateur demandent
> « de quoi avez-vous besoin ». Ce document répond avec des mesures, ce qui est plus solide
> qu'une liste de souhaits.

---

## 1. Ce qui est en service

| Élément | Relevé du 10/09/2026 |
|---|---|
| Processeur | Intel i7-11700KF — 8 cœurs, 16 threads |
| Mémoire vive | **64 Go** (2 × 32 Go), cadencés à **3600 MT/s** |
| Carte graphique | **RTX 3080 — 10 240 Mio**, dont **8,7 Gio réellement exploitables** par les modèles |
| Disque système | Crucial P310 — 4 To |
| Système | Windows 11 Professionnel, build 26200 |

## 2. Ce que cette machine produit, mesuré

| Capacité | Mesure |
|---|---|
| Modèle de dialogue le plus lourd | **85 jetons/seconde**, entièrement sur carte graphique |
| Contexte maximum sur carte graphique | **65 536 jetons**, avec 1,9 Go encore libres |
| Génération d'images (modèle de référence) | **21 s par image** |
| Recherche documentaire sur 106 documents | **rappel 83,3 %**, banc d'essai rejouable |
| Contrôle d'un site avant mise en ligne | **33 s**, 0 € d'API |

## 3. La limite dure, et elle est unique

**Un seul modèle lourd peut tourner à la fois.** C'est une contrainte de mémoire graphique, pas
un choix : le studio a mesuré que 8,7 Gio sont disponibles pour les modèles, et qu'un modèle plus
gros déborde vers le processeur — la vitesse s'effondre alors.

**Conséquence directe sur l'activité** : pendant un travail de génération, **rien d'autre de
lourd ne peut être fait sur cette machine**. La capacité de production a donc un **plafond dur**,
et ce plafond détermine combien de clients le studio peut servir en parallèle. C'est le premier
frein à la croissance, avant toute question commerciale.

## 4. Ce qu'il faudrait, par ordre de priorité

| # | Besoin | Ce que ça débloque | Nature |
|---|---|---|---|
| 1 | **Sauvegarde hors site vérifiée** | Rien ne protège aujourd'hui contre la perte du poste : code, documents, données de travail | **Priorité absolue**, coût faible |
| 2 | **Une seconde carte graphique** | Doubler la capacité de production : deux travaux en parallèle au lieu d'un | Investissement principal |
| 3 | **Un serveur distinct pour les projets clients** | Les projets clients ne doivent pas tourner sur le poste de travail — exigence de cloisonnement, pas de confort | Investissement moyen |
| 4 | **Onduleur** | Une coupure pendant une écriture de base de données coûte des données | Coût faible |
| 5 | **Adresse réseau fixe et certificat** | Héberger un service client sans dépendre d'une connexion domestique | Coût récurrent faible |
| 6 | **Séparation des environnements** travail / client / personnel | Principe de cloisonnement, déjà engagé | Organisation, pas achat |

**Le point 2 est le vrai levier.** Une carte graphique de génération précédente — pas le modèle le
plus récent — suffirait à **doubler la capacité** pour une fraction du prix. C'est le meilleur
rapport entre l'euro investi et la capacité gagnée.

## 5. Ce dont le studio n'a PAS besoin

- **Pas de « cloud » par défaut.** Le positionnement est inverse : les données restent chez le
  client ou chez nous. C'est un argument commercial, pas une contrainte.
- **Pas de matériel haut de gamme neuf.** Le milieu de gamme de la génération précédente suffit.
- **Pas de local ni de salle serveur.** Le volume actuel ne le justifie pas.
- **Pas de licences logicielles onéreuses** : la chaîne technique repose sur des outils libres.

## 6. Ce que ça pèse dans le plan de financement

Ces besoins alimentent directement les postes « matériel informatique », « logiciels et licences »
et « fonds de roulement » du plan de financement joint.

**Les montants ne sont pas chiffrés ici, et c'est volontaire** : ils dépendent d'arbitrages qui
n'ont pas été pris — quelle carte, neuf ou occasion, quelle priorité. **Un montant inventé serait
un montant faux, et il se verrait au premier devis.**

Ce qui est établi : **la liste est ordonnée par rapport entre le coût et ce que chaque poste
débloque**, et le point 1 ne coûte presque rien.

---

*GL Digital Lab — Gaëtan Langlet — Harponville (80560), Somme*
