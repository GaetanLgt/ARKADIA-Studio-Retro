# LE SQUELETTE — ce qui tient, quand tout le reste peut casser

> **GL Digital Lab · 20/09/2026 · EVA01.** *Demande de Gaëtan : « on ne prend pas tout, mais on pose
> une ossature et on s'y tient. Il faut qu'on ait un squelette qui tienne. »*
> ⛔ **Ce document n'est pas le produit, ni le jeu, ni l'infra.** *C'est **ce qui doit survivre** à
> n'importe quelle reconstruction.* **Tout ce qui n'est pas ici est jetable.**

---

## 1. Les cinq ressources, et leur limite MESURÉE

*Un squelette se dessine autour des limites, pas autour des envies.*

| Ressource | La limite | Ce qu'elle impose |
|---|---|---|
| **VRAM** | **10 240 Mio** | ⛔ **un seul job lourd à la fois.** *Un cerveau local en prend 5,4 Go ; un rendu le lui dispute ; Whisper 3 Go.* **On n'a jamais les trois.** |
| **Contexte local** | **4 096 jetons** | ⛔ **65 536 ne rentre pas** (10 039 Mio pour 7 331 dispo) → *le long va au distant, le court au local* |
| **RAM** | **63,7 Go** | ⭐ **la seule marge réelle de cette machine** — *et elle est très peu employée* |
| **Disque `C:`** | **559 Go libres** | ⚠️ *ne pas dépasser **80 %*** → *archive, puis effacement* |
| **Le temps de Gaëtan** | *une personne* | ⛔ **tout ce qui exige son geste passe en dernier** — *et doit être annoncé* |

---

## 2. ⛔ Les trois chemins qu'on ne casse JAMAIS

| Le chemin | Ce qui le référence | La conséquence si on le casse |
|---|---|---|
| `…\Desktop\ARKADIA Studio Retro` | **le prompt gravé dans `arkadia-samus:latest`** | *un modèle ne se relit pas : **il se reconstruit*** |
| `…\Desktop\ARKADIA Studio Retro` | `~/.dsh/storages/workspace.json` + le `.env` | *le harnais perd son espace de travail* |
| `…\Desktop\GL-OS_v1` | `C:\IA\ArkAdiA\outils\cliquet.json` l.113 | *un outil du studio pointe dans le vide* |
| `…\Desktop\ArkAdiA` | `refs/passation.md` du preset `metroid` | *un preset perd son point de reprise* |

⭐ **Règle : on ne renomme pas. On déplace ce que rien ne référence, et on range à l'intérieur de ce qui est référencé.**

---

## 3. Les huit règles non négociables — elles vivent dans `AGENTS.md`

```
§2  les trois interdits mesures     (dont : UN SEUL job GPU lourd a la fois)
§3  une affirmation porte la mesure qui pourrait la demontrer, ou est « non verifie »
§5  decision visuelle · strategie · juridique · budget · service externe · REGISTRE · MISE EN LIGNE
    -> appartiennent a Gaëtan, jamais executes a sa place
§6  francais · local d'abord · jamais de donnee client dehors
§7  on ne sort pas de l'ecosysteme pour attaquer. Jamais.
§8  les commandes en tache de fond, jamais en avant-plan
§9  aucun tour autonome sans demande explicite
```

---

## 4. ⭐ Le fonds — ce qu'on ne peut PAS reconstruire

**Tout le reste se refait. Ceci, non :**

```
LE CORPUS        4 199 collections · 206 328 fragments · le carnet Metroid : 2 316 chunks
                 C: ...\rag-purge\chroma-avant-purge-20260917-145340.sqlite3
                 E: \Sauvegarde-RAG-2026-09-20\   (disque physique distinct)
                 SHA-256  E743B78B562532F348BB75AB817BA8BE25CF7576BD3B2A951B744AD329758F18
                 ⚠️ E: est en exFAT, SANS JOURNAL -> l'empreinte est a REVERIFIER

LE VAULT          141 notes .md dans OneDrive  (lecture seule, on ne le modifie pas)
LES FICHES        les documents dates de ARKADIA Studio Retro\  (5 fiches + la synthese)
LE REGISTRE       vault-agence\registre-echecs-agents.md  (signe HMAC)
```

> ⛔ **Toute opération qui touche `_sauvegardes\` doit re-vérifier l'empreinte AVANT et APRÈS.**

---

## 5. Les quatre arbitrages qui restent à écrire

*Le squelette ne tient pas tant que ces quatre-là ne sont pas tranchés — **et ils sont à Gaëtan** :*

```
①  qui a le droit au GPU, quand, et combien de temps       (les 3 seuils : 1500 / 1536 / 1024)
②  quel travail va au local, quel travail part au distant   (la table de routage)
③  la politique de conservation : X jours -> archive -> effacement   (le seuil des 80 %)
④  qui repond de quoi : les 6 presets, et le nom de chacun
```

---

## 6. ⭐ Le contrôle qui peut échouer

**Un squelette qu'on ne teste pas est un squelette auquel on croit.** *Le contrôle, et il tient en
quatre lignes — à lancer avant et après toute restructuration :*

```powershell
Test-Path "C:\Users\neosp\Desktop\ARKADIA Studio Retro"      # le chemin grave dans le modele
Get-Item "C:\Users\neosp\Desktop\GL-OS_v1"                   # cliquet.json
Get-FileHash "E:\Sauvegarde-RAG-2026-09-20\chroma-avant-purge-20260917-145340.sqlite3" -Algorithm SHA256
netstat -ano | Select-String ":3080|:8150|:11434"            # le harnais, la voix, le cerveau
```

⛔ **Si une seule de ces lignes rend faux, le squelette est cassé — et il se répare avant tout le reste.**

---

## 7. Ce que ce document n'établit pas

- ⛔ **Ce n'est pas l'ossature d'ArkAdiA.** *Le jeu, c'est le preset `arkadia` ; l'orchestration, `apex` ; l'infra, `gl-digital-lab`.* **Celui-ci est le socle commun — ce sur quoi les trois s'appuient.**
- ⚠️ **Les quatre arbitrages du § 5 ne sont pas tranchés.** *Le squelette tient, mais il est **ouvert**.*
- ⚠️ **Le disque de 6 To n'est pas branché** — *l'étage « archive » du § 1 n'existe pas encore.*
- ⛔ **Le corpus n'est PAS remis en service** : *il est sauvé, doublé, vérifié — **pas dans l'instance vivante.***

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Écrit à la fin d'une nuit de 90 tours, **parce qu'on ne pose pas un squelette après avoir empilé**.*
