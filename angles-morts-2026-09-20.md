# 360° et angles morts — ce que personne n'avait regardé

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> Demande : *« tout 360° et angles morts ! »*
> ⛔ **Ce document ne refait pas l'inventaire : il vérifie ce que l'inventaire avait supposé.**

---

## 1. ⛔⛔ LA TROUVAILLE : le harnais n'a pas disparu, il a changé de nom

**Ce matin, j'ai signalé un arbre envolé** : `deepseek-harness` (92 646 fichiers, 2,06 Go)
n'était plus dans `ARKADIA Studio Retro`, et une recherche bornée ne le retrouvait pas.
**C'était une alerte juste sur le constat, et fausse sur la conclusion.**

**Ce que la mesure dit maintenant, sur `ARKADIA Studio Retro\MND` :**

```
fichiers : 92 680          (deepseek-harness en portait 92 646)
poids    : 2,27 Go         (il en portait 2,06)
entrées  : .agents · .claude · .dsh-build · .git · .github · apps · benchmarks · docs
```

⭐ **C'est la même arborescence.** `.agents`, `.dsh-build`, `apps`, `benchmarks`, `docs` — la
signature du monorepo DSH. **Le dossier a été renommé `MND`, il n'a pas été supprimé.**

⚠️ **Et ça crée deux problèmes qu'aucun document ne portait :**

1. **`.git` dans `.git`** — `ARKADIA Studio Retro` est un dépôt, et `MND/` en contient un
   autre. **Un dépôt imbriqué**, que Git traite comme un sous-module de fait. *Rien de ce
   qu'il contient n'est versionné par le dépôt parent, et personne ne le voit.*
2. **`MND` ne veut rien dire ici.** Le nom désignait un autre dossier (à la racine du Bureau,
   avec `engine-local\.env`). *Deux `MND`, deux contenus, un seul nom — la devinette exacte
   que la règle du studio cherche à éviter.*

---

## 2. ⛔ La liste des huit décisions a vieilli — et une est morte toute seule

**La décision n° 4 était : « le `llama-server` orphelin (703 Mo, parent mort) — Gaëtan. »**
**Mesuré ce soir : il n'existe plus.**

| Ce qu'on cherchait | État mesuré ce soir |
|---|---|
| `llama-server` (les deux instances) | ⛔ **AUCUN processus en vie** |
| port **53109** (l'orphelin) | **ÉTEINT** |
| port **61607** (le second) | **ÉTEINT** |
| port **8188** | **ÉTEINT** |

⭐ **Donc : une décision en attente portait sur 703 Mo de VRAM déjà rendus.** *Une liste de
décisions n'est pas un document figé : elle porte des états, et un état change tout seul.*

**En revanche, les services du studio tournent tous, et ils sont identifiés :**

```
3001 node · 8090 node · 8123 · 8124 · 8125 · 8130 · 8132 · 8133 · 8134 · 8138 node
```

*L'état des lieux notait « 3001 et 8188 : non identifiés ». 8188 n'existe plus ; 3001 est
un `node` du studio.*

---

## 3. ⛔ Le bandeau s'appelle TOUJOURS « Lya » — et je l'avais écrit à tort comme réglé

**Mesuré sur `C:\IA\gl-digital-lab\poste-local\bandeau-poste.ps1` :**

```
occurrences de « Lya »   : 3
occurrences de « Samus » : 1
```

⛔ **Le renommage du 18/09 n'a pas été propagé.** Et un tour précédent de cette session
avait écrit le contraire — *c'était faux, et la mesure le dit.* **C'est exactement le § 3 des
consignes : une affirmation sur un fichier qu'on n'a pas relu est une affirmation qui tombe.**

---

## 4. Le vrai poids de la machine, remesuré (et il a grossi)

| Poste | Ce matin | **Ce soir** |
|---|---|---|
| `~/.dsh/attachments` | 99,8 Go · 1 910 fichiers | **100 Go · 1 936 fichiers** |
| les 8 copies de `webui.db` (`Downloads`) | **26,8 Go — NON MESURÉS** | ⭐ **8 copies · 24,93 Go — mesurées** |
| `MND` dans le studio | — | **2,27 Go · 92 680 fichiers** |
| la partition sans lettre | 1 000 Go, non montée | ⛔ **toujours sans lettre — disque 0, partition 2** |

⭐ **`attachments` grossit de 26 fichiers et 0,2 Go en une session.** *C'est le premier poste
de la machine, il n'est dans aucun plan de rangement, et il alimente ce qui se discute ici même.*

### 4 bis. ✅ Les 8 `webui.db` : mesurés, et l'inventaire se trompait

**Les empreintes sont tombées. Il n'y a pas huit copies du même fichier : il y a DEUX contenus.**

| Fichiers | Taille | Empreinte (16 premiers) | Verdict |
|---|---|---|---|
| `webui.db` · `webui(1..5).db` | 3 191,4 Mo chacun | `4935C86420B4CDA3…` | **6 fois le MÊME fichier** |
| `webui(6).db` · `webui(7).db` | 3 191,4 Mo chacun | `C6F2A254E54B5DAD…` | **2 fois un AUTRE fichier** |

⛔ **Correction d'une affirmation de l'inventaire** : `etat-des-lieux-eva01-2026-09-20.md` § 9
dit *« 8 fois le même fichier »*. **C'est faux, et la mesure le corrige** : six d'un côté,
**deux d'un autre**. *Deux contenus différents, à taille identique — c'est-à-dire deux états
différents de la base, pas huit copies.*

⭐ **Ce que ça permet, sans rien décider à ta place** : **garder un exemplaire de chaque
contenu et supprimer les cinq plus un** — soit **≈ 21,8 Go récupérés** sur 24,93.
⚠️ **Lesquels garder demande de savoir lequel des deux états est le bon** — *et ça, ça se
regarde à l'intérieur, pas sur l'empreinte.*


---

## 5. Ce qui est exécutable sans toi, et ce qui est à toi

| # | Le geste | Qui |
|---|---|---|
| 1 | **Résoudre le `MND` : renommer ou sortir** — et décider du dépôt imbriqué | **Gaëtan** *(le dossier est référencé par le prompt du modèle : ne pas renommer à l'aveugle)* |
| 2 | **Vérifier les empreintes des 8 `webui.db`** — doublons ou sauvegardes : la mesure est **lancée** (tâche de fond) | moi, ici |
| 3 | **Renommer « Lya » → « Samus » dans `bandeau-poste.ps1`** (3 occurrences) | **moi** — *sur accord : c'est un fichier de service* |
| 4 | **Le dépôt public** (11 fichiers au nom du porteur) | **Gaëtan** |
| 5 | **Monter la partition de 1 000 Go** (registre Windows) | **Gaëtan** |
| 6 | **Déplacer les 25 Go de `webui.db`** — *une fois qu'on saura si ce sont des doublons* | **Gaëtan** |
| 7 | **`attachments` : politique de conservation** — *100 Go, aucun plan* | **Gaëtan** — *décision, pas travail* |
| 8 | ~~le `llama-server` orphelin~~ | ⛔ **CLOSE — il s'est éteint tout seul** |

---

## 6. Ce que ce document n'établit pas

- ⛔ **Je n'ai pas renommé `MND`.** Le dossier est proche du chemin gravé dans le modèle
  `arkadia-samus:latest` et des références du harnais : *le bouger à l'aveugle est le cas
  d'école du plan de restructuration.*
- ⚠️ **Je n'ai pas ouvert les 8 `webui.db`** — les empreintes sont lancées, et **une empreinte
  égale ne prouve pas qu'un fichier est utile : elle prouve qu'il est identique.**
- ⚠️ **Le comptage de « Lya » porte sur un fichier** ; d'autres copies peuvent en porter
  ailleurs (les `.avant-*` de `poste-local/` en portent par construction).
- ⚠️ **Les ports 8188/53109/61607 sont éteints à cet instant** — *un port éteint ce soir peut
  se rallumer au prochain démarrage d'un service. « Éteint » n'est pas « supprimé ».*
- ⛔ **Aucune valeur nominative, aucun secret, aucun contenu de conversation recopié.**

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Mesures : `Get-Process` · `Get-NetTCPConnection -State Listen` · `Get-ChildItem` récursif avec
comptes · `Get-Partition` · `Select-String` sur `bandeau-poste.ps1` · `Get-FileHash` (en tâche
de fond).*
