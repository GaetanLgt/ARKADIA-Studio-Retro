<!-- GLDL-SIG v1 7180edf687649c23b7988c1091a98bf4c328a25e7cbccf29afef3b43f82f2d02 -->
# Révision du 19/09 — tout ce qui est passé, ce qui est passé à côté, et ce qui reste

> **GL Digital Lab · 19/09/2026.** Consigne de Gaëtan : *« Tu fais une révision de tout ce que
> je t'ai balancé depuis ce matin. Tout ce qui passe à côté ou qui n'est pas amorcé, tu me le
> remets en place. »*
>
> **Ce document est l'inventaire honnête.** *Trois colonnes : ce qui est FAIT et vérifié, ce qui
> est AMORCÉ mais pas fini, et ce qui N'EST PAS AMORCÉ — avec, à chaque fois, la raison.*

---

## 1. CE QUI EST FAIT, ET VÉRIFIÉ DE L'EXTÉRIEUR

| Ce que tu as envoyé | Ce qui en est sorti | État vérifié |
|---|---|---|
| **Iron Man → l'armure de Néon** | Le projet a été **reframé en design original**. Page `/armure` **en ligne** : 316,7 Ko servis, 14 requêtes, six lois de forme, « ce que cette page ne garantit pas ». La planche concept réduite de **1 076 519 → 43 564 o (−96,0 %)** | ✅ **`/armure/` HTTP 200, vérifié dehors** |
| **Le kit Metroid** | 22 → **43 pages** *(les 9 sous-dossiers du vault copiés)*. Le kit était publié mais **atteignable par aucun lien** — il l'est depuis `/soute` | ⚠️ **pages produites, non commitées à l'instant de ce document** |
| **La nouvelle DA** | **D6 déployée** : fond `#080b14`, accent cyan `#2abfff`, action jaune `#ffe650`. **Zéro vert résiduel sous aucune forme** — *17 fichiers, 3 écritures (`#`, `rgba()`, `0x`)* | ✅ **`5dab881` en ligne, cyan ×11 dans la feuille servie** |
| **La DA sur ArkAdiA** | Landing basculée : **100 remplacements**, vert D5 → 0, cyan → 4, **menthe de marque préservée (7)** | ✅ **déployée, `run success`** |
| **Les coquilles « Arkadia »** | 1 occurrence visible corrigée (`Cluster_ARKADIA`), les 3 identifiants de code préservés, les 17 du vault **laissés** *(lecture seule)* | ✅ |
| **Les dates fausses** | 5 dates corrigées, commit `311ba7b` | ✅ |
| **La gouvernance / la fuite Citya** | Page `/ce-que-nous-nous-imposons` **en ligne**. Quatre interdits tenus : victime non nommée, aucun chiffre de la fuite, forum non désigné, aucun lien établi | ✅ **vérifié sur le HTML livré** |
| **Le pré-print « virus cognitif »** | Présenté **comme pré-print non évalué**, avec ses auteurs | ✅ |
| **Les 11 types de connaissance** | Fiche écrite ; **10 sur 11 existent**, le manque est **la couche sémantique** | ✅ |
| **Inria Défense & Sécurité** | Fiche de compatibilité : **les quatre cas d'usage ont une réponse**, l'écart est **un réglage de route**, pas une compétence | ✅ |
| **Le CNRS** | Lien posé sur `/liens` **et** dans `llms.txt`, mesuré HTTP 200 avant. **Délégation Hauts-de-France**, la région du studio | ✅ |
| **L'annuaire type CNRS** | `/liens` restructurée : 6 rubriques pleines, **et une section « ce que nous n'avons pas encore »** — *newsletter, recrutement, presse, événements, affichés vides plutôt que retirés* | ✅ |
| **La règle anti-dystopique** | Écrite : **trois raisons, dont une décisive** — *le registre dystopique argumente contre le métier du studio* | ✅ |
| **Les fonds d'écran** | **Trois n'existaient que sur ce poste** *(dossier ignoré par git)* — sauvés, plus 6 images de carrousels. Et **une génération ComfyUI** en DA D6 | ✅ **commit `492c3db`, 11 fichiers, 7,1 Mo** |
| **Le post-traitement** | Chaîne construite et éprouvée : **204 corrections typographiques sur le site**, idempotence prouvée, règles **exportées et non recopiées** | ✅ **`5dab881` en ligne** |
| **La contre-expertise YouTube** | Écrite. **Et l'action n°1 a été faite** : la chaîne est mesurée | ✅ **voir §4** |
| **NVIDIA SoL-Pi** | ⭐ **Intérêt marqué — voir §5** | ✅ noté |

---

## 2. CE QUI EST AMORCÉ ET PAS FINI

| Chantier | Où il en est | Ce qui manque |
|---|---|---|
| ⚠️ **Le kit Metroid** | 43 pages produites, 146 notes copiées. **27 fichiers suivis sur 146, et 27 sur 43.** | **Le commit et le redéploiement.** *Un sous-agent tourne encore dessus ; deux builds concurrents se marchent dessus — mes deux dernières tentatives ont expiré à 600 s pour cette raison.* |
| ⚠️ **La typographie du corpus studio** | **141 727 fautes mesurées**, l'outil est prêt, éprouvé, idempotent | **L'application.** *141 727 modifications méritent une relecture, pas un `--appliquer` à l'aveugle.* La commande : `node forge-ia/post-traitement.mjs --verifier --md` |
| ⚠️ **Le canal vocal / la persona** | *Rien de neuf aujourd'hui* | — |
| ⚠️ **La génération d'images** | Une réussie *(hall cyan/ambre)*, une ratée gardée | **L'agrandissement à 3840×1080** — *SDXL se dégrade au-delà de 2:1 ; il faut une passe d'upscale, non faite* |

---

## 3. ⛔ CE QUI N'EST PAS AMORCÉ, ET POURQUOI

| Ce que tu as envoyé | Pourquoi ça n'a pas avancé |
|---|---|
| ⛔ **Le clip CapCut** | **Je ne peux pas le lire.** *Page d'application : la requête rend 200 et zéro contenu.* **Il me faut l'export `.mp4`, trois captures, ou trois lignes.** *Le plan de la série MND existe et n'attend que lui.* |
| ⛔ **Le nom de MND** | **Décision D12.** *Ton propre document dit que « Manga No Densetsu » est le titre d'une œuvre publiée par un tiers — à vérifier avant tout usage commercial.* |
| ⛔ **Les six kanji** | ⚠️ **Deux jeux circulent** : 和 誠 美 実 動 私 *(le lore, publié sur le site)* et 泰 東 魔 米 来 言 *(les visuels récents)*. **Il faut dire lequel est le canon, sinon les deux vivront en parallèle.** |
| ⛔ **Le rebrand de la chaîne** | **En attente depuis cinq jours**, et il bloque tout le packaging. **Maintenant mesuré — voir §4.** |
| ⛔ **La destination des cinq règles réseaux** | *Mentions légales, chartes, ou CGV.* **D12.** Le texte est prêt à coller. |
| ⛔ **L'indexation du kit Metroid** | *`declaration: null`, `noindex`, hors sitemap.* **Atteignable ≠ indexable**, et ouvrir demande de défaire **les trois**. |
| ⛔ **`GLDL_JOURNAL_ACCES`** | **Ne se règle que depuis o2switch.** *Tant que ce n'est pas fait, `api/etat.php` dit « indisponible » — et il ne fabrique pas de zéros.* |
| ⛔ **La bascule du raisonnement en local** | *Trois clés distantes, dont une chinoise.* **C'est le réglage qui conditionne défense, Inria, et « 0 % cloud ».** Arbitrage : confort contre compatibilité. |
| ⛔ **`gardien-fenetre.ps1`** | **75 octets, une URL.** *Le script le détecte et avertit — mais le gardien ne garde rien, et le fichier attend d'être écrit.* |
| ⛔ **Le LinkedIn du pied de page** | *HTTP 999 sur toutes les pages du site.* **Non mesurable automatiquement — la décision de le garder est la tienne.** |
| ⛔ **Les paroles des six mp3** | *La contre-expertise en fait l'action n°3 : **la seule qui évite un retrait.*** |

---

## 4. ⭐ LA MESURE QUE PERSONNE N'AVAIT FAITE — l'état réel de la chaîne

**Action n°1 de la contre-expertise : « ouvrir la chaîne et relever l'état réel — personne ne l'a
fait depuis le 14/09. »** *C'est fait, et le résultat change la priorité.*

```
Nom affiché : xo0 Neo 0ox          Abonnés : 5          Liens externes : aucun
18 publications  ·  15 vidéos + 3 Shorts

Meilleure vidéo originale : 5 vues      Le seul chiffre notable : un Short à 583 vues
```

⚠️ **Et deux choses que personne n'avait vues :**

1. **La description de la chaîne est une RÉPONSE D'ASSISTANT COLLÉE TELLE QUELLE**, avec
   l'identifiant du message : *`id : 1353378386445340792 Pour une chaîne centrale et pérenne,
   @ArkadiaFrance est le choix le plus explicite…`* **C'est le premier écran de la chaîne.**
2. **Une vidéo s'appelle `wan5b t2v 00008`** — *un nom de fichier de générateur, publié tel quel.*

> **Ce que ça change** : *la contre-expertise déduisait « à ce volume, le CTR n'est pas une
> métrique ». **La mesure est plus dure que la déduction : il n'y a pas de métrique à optimiser.
> Il y a 18 publications pour 5 abonnés.***

⭐ **Et la description est réparable MAINTENANT** : *elle ne dépend d'aucune décision en attente.*

**Document complet** : `communication/etat-reel-chaine-youtube-2026-09-19.md`.

---

## 5. ⭐ L'INTÉRÊT MARQUÉ — NVIDIA SoL-Pi

**Ce que le papier décrit** *(arXiv 2609.20519, NVIDIA, 17/08/2026)* : au lieu d'ajuster un
harnais à la main, ils exécutent **des boucles d'auto-recherche à la couche harnais** sur de
nombreux environnements dérivés de dépôts et pilotés par des vérificateurs, **ne conservant que
les mécanismes qui survivent à la sélection.** Quatre ont survécu :

| Le mécanisme | Ce qu'il touche |
|---|---|
| **Action Fusion** | la façon dont les actions s'exécutent |
| **Online Context Compact** | **la compaction pendant une exécution** |
| **ObservationPack** | la gestion des observations |
| **Evidence-Preserving Reducer** | la lecture déléguée |

**Résultat mesuré** : **−50 % de trafic de jetons**, ~⅓ de réduction du coût API, **8,75 à
13,50 $ par heure d'économie** contre Codex et Claude Code. *Performances équivalentes sur
EdgeBench (51 tâches) avec GPT-5.6 Sol et Claude Opus 5.*

### ⭐ Pourquoi ça compte ICI, et précisément

**« Online Context Compact » traite exactement le défaut que ce harnais-ci consigne dans son
propre `AGENTS.md`** :

> *« Le résumé de compaction efface la trace de ce qui a été croisé (fichiers vus, décisions
> prises). Ne pas reprendre un plan dont la justification a disparu. »*

**Et cette session l'a payé plusieurs fois** : *des décisions prises puis reperdues, des fichiers
recroisés sans mémoire, et une consigne qui doit être **ré-injectée après chaque compaction** —
c'est écrit dans le fichier global et c'est un pansement, pas une solution.*

⚠️ **Ce que je n'ai PAS fait** : **je n'ai pas lu le papier.** *Je lis le résumé que tu m'as donné
et l'illustration du haut de page. **Les chiffres cités sont les leurs, pas vérifiés ici.***
*Je n'ai pas ouvert le dépôt NVlabs non plus.*

**Ce que j'en ferais, si tu veux** : *lire le papier, et confronter ses quatre mécanismes à ce que
ce harnais fait déjà — pour dire lesquels manquent, et lesquels existent sous un autre nom.*

---

## 6. ET LE DÉNOMINATEUR COMMUN DE LA JOURNÉE

**Quatre sources, un seul sujet.** *Aucune ne se cite :*

| Source | Ce qu'elle dit |
|---|---|
| **Chokron** *(CNRS)* | *déléguer tout à l'IA → on perd la connaissance de ses propres capacités* |
| **Solé & Ruffini** *(pré-print)* | *déchargement cognitif → contagion culturelle* |
| **Stiglitz** *(FT)* | *la production du faux dépasse la détection → **la confiance s'effondre*** |
| **UNESCO** *(Paris Digital Learning Week)* | ***« le vrai sujet n'est plus l'IA, c'est le pouvoir de décision »*** |

**Et par-dessus : le Canard Enchaîné sur l'« IApocalypse », et le WSJ sur le débat de fin du
monde.** *Six pièces, une seule question — **qui décide, et qui vérifie.***

> **C'est ton métier, écrit par six sources indépendantes en une journée**, et ça tombe sur la
> page `/ce-que-nous-nous-imposons` : *pas de hub qui centralise · aucun chiffre sans source ·
> **aucune décision déléguée**.*

---

## 7. CE QUE JE PROPOSE DE FAIRE DANS L'ORDRE

1. ⚠️ **Attendre la fin du sous-agent, puis commiter et redéployer le kit** — *27 → 146 notes, 27 → 43 pages.* **Deux builds concurrents se bloquent : c'est pour ça que les miens expiraient.**
2. **Réparer la description de la chaîne** — *elle est cassée maintenant, et elle ne dépend d'aucune décision.* **Puis renommer `wan5b t2v 00008`.**
3. **Lire le papier NVIDIA** et confronter ses quatre mécanismes à ce harnais.
4. **Appliquer la typographie au corpus studio** — *141 727 fautes, par lots, avec relecture.*
5. **Te rendre la liste des décisions en attente, en un seul endroit** — *elles sont onze, et plusieurs datent de cinq jours.*

---

## 8. CE QUE CE DOCUMENT N'ÉTABLIT PAS

- ⚠️ **Je n'ai pas relu mes propres documents de la journée un par un.** *Cet inventaire vient de
  ma mémoire de session et de mesures ponctuelles — **pas d'une relecture systématique des vingt
  et quelques fichiers produits aujourd'hui.*** *Un chantier peut donc y manquer sans que je le
  sache.*
- **Les chiffres de la partie NVIDIA sont ceux du résumé qui m'a été donné.** *Le papier n'a pas
  été ouvert.*
- **Les vues « NA » de huit vidéos** : *je ne les estime pas.*
- **Je n'ai pas vérifié que les 43 pages du kit sont toutes conformes** — *un sous-agent les a
  produites et je n'ai pas encore lu son rapport.*
- **Le rebrand a pu être tenté depuis le 14/09** sans que je puisse le prouver.
