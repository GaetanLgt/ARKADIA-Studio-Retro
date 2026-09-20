# Restructuration de la machine — le plan, prêt à exécuter

> **GL Digital Lab · 20/09/2026 · EVA01.**
> Demande de Gaëtan : *« tout ce qui est IA dans le bon fichier, tout ce qui est ceci dans le bon
> fichier, tout ce qui est cela dans son fichier. Quand la restructuration est faite, vous arrêtez. »*
> ⛔ **Ce document est le PLAN. Il n'a pas été exécuté** — *il ne restait pas assez de fenêtre, et une
> restructuration à l'aveugle casse des chemins.*

---

## 1. ⛔ TROIS CHEMINS QU'IL NE FAUT PAS CASSER (mesurés le 20/09)

| Ce qui bouge | Ce qui le référence | Conséquence |
|---|---|---|
| **`ARKADIA Studio Retro`** | ⛔ le **prompt système gravé dans le modèle** `arkadia-samus:latest` : *« Racine du studio : `…\ARKADIA Studio Retro\ARKADIA_Retro_Studio` »* | **renommer rend faux un texte dans un modèle — et un modèle ne se relit pas, il se reconstruit** |
| **`ARKADIA Studio Retro`** | ⛔ `~/.dsh/storages/workspace.json` · le `.env` cité par les fiches du 19/09 | **le harnais perd son espace de travail** |
| **`GL-OS_v1`** | ⛔ `C:\IA\ArkAdiA\outils\cliquet.json` l.113 → `…\Desktop\GL-OS_v1\packages\preset\agent-presets` | **l'outil du studio pointe dans le vide** |
| **`ArkAdiA`** | ⛔ `refs/passation.md` du preset `metroid` → *le registre des bastions vit dedans* | **un preset perd son point de reprise** |

⭐ **Règle qui en découle : on ne renomme pas. On DÉPLACE ce qui n'est référencé par rien, et on
range À L'INTÉRIEUR de ce qui l'est.**

---

## 2. La classification — cinq familles, et ce qui va dedans

| Famille | Ce que c'est | Où ça vit | Ce qui est mesuré |
|---|---|---|---|
| **① LE FONDS METROID** | le vault (OneDrive, **lecture seule**), les transcriptions, le kit pédagogique, la R&D sourcée | `OneDrive\Documents\Metroid\Vault-Metroid\` — **ne pas toucher** | 141 notes `.md` mesurées le 18/09 |
| **② LES DOCUMENTS DU STUDIO** | les fiches datées, les chantiers, la synthèse, les audits | **`ARKADIA Studio Retro\`** — *déjà là* | 5 fiches + la synthèse + l'état des lieux |
| **③ L'IA — MODÈLES ET SERVICES** | `ministral-3:8b`, `arkadia-samus`, `eva-mistral-16k`, le service vocal, le bot | `C:\IA\gl-digital-lab\` + Ollama (**~48 Go**) | *11 modèles, 21 ports* |
| **④ L'IA — HARNais (ARBRES DE CODE)** | `deepseek-harness` (17/09) · `GL-OS_v1` (10/09) · l'installation vivante | ⚠️ **`GL-OS_v1` ne bouge pas** (cliquet.json) | *2,18 + 2,33 Go, ~211 000 fichiers* |
| **⑤ LES ARCHIVES ET LE LOURD** | les `_Bureau-*` · les 8 copies de `webui.db` (26,8 Go) · `C:\IA\tri` (58,6 Go) · `Comfy-Desktop` (273 Go) | ⛔ **sur le disque de 6 To, quand il sera branché** | *non branché — mesuré* |

---

## 3. L'ordre d'exécution — et il compte

```
1.  L'ETAT DES LIEUX D'ABORD          deja fait (etat-des-lieux-eva01-2026-09-20.md)
2.  LE BUREAU                          deja fait (13 fichiers volants -> 4 dossiers)
3.  LES DOCUMENTS DU STUDIO            ⬜ rassembler les fiches datees eparpillees
4.  LE DEDOUBLONNAGE DES ARBRES        ⬜ ⚠️ DECISION : GL-OS_v1 (2,18 Go, 118 783 f)
                                          ne bouge QUE si `cliquet.json` est corrige avant
5.  LE LOURD VERS LE 6 To              ⬜ ⚠️ quand le disque sera branche
6.  LES 1 000 Go SANS LETTRE           ⬜ ⚠️ DECISION DE GAETAN — registre Windows (§5 AGENTS.md)
```

⭐ **Chaque étape : compter AVANT, déplacer, journaliser, compter APRÈS.** *La méthode du studio.*

---

## 4. Ce qui reste à décider — et ce n'est pas du travail

| # | La décision | Qui |
|---|---|---|
| 1 | **Les 3 seuils VRAM** (1500 / 1536 / 1024) — *ils condamnent un état sain* | Gaëtan |
| 2 | **Retirer la ligne du 13/09** de `settings.yaml` — *elle est fausse* | Gaëtan |
| 3 | **Le `llama-server` orphelin** (703 Mo, parent mort) | Gaëtan |
| 4 | **La partition de 1 000 Go** sans lettre de lecteur | Gaëtan |
| 5 | **Le carnet** : restauration + redémarrage du serveur MCP | Gaëtan |
| 6 | **Les 26,8 Go de `webui.db`** dans `Downloads` — ⚠️ *je n'ai pas pu les ouvrir : **je ne sais pas si ce sont des doublons ou des sauvegardes*** | Gaëtan |
| 7 | **`rattler` (11,7 Go) et `pnpm` (4,4 Go)** — *caches, mais je ne connais pas leur propriétaire* | Gaëtan |
| 8 | **Le module vocal** (≈ 5 h) et **le plancher du seuil de parole** | Gaëtan |

---

## 5. Ce que ce document n'établit pas

- ⛔ **Rien n'a été déplacé ni renommé pour cette restructuration.** *Seul le Bureau a été rangé (13 → 3 fichiers à la racine).*
- ⚠️ **Je n'ai pas exploré les trois quarts de la machine.** *`AppData` (414,8 Go / 945 319 fichiers), `OneDrive\Bureau`, les 273 Go de `Comfy-Desktop` : **non ouverts**, et je le dis plutôt que de faire semblant.*
- ⛔ **Le contenu des 1 000 Go sans lettre est inconnu.** *Non monté.*
- ⚠️ **Les 26,8 Go de `webui.db` ne sont pas mesurés** — *le montage Docker de `Downloads` a échoué.* **Ils ne sont ni des doublons prouvés, ni des sauvegardes prouvées.**
- ⛔ **Et un fait à garder en tête** : *le corpus vit sur **deux** disques (`C:` et `E:`), **vérifié trois fois**. **Toute restructuration qui touche `C:\IA\gl-digital-lab\_sauvegardes\` doit re-vérifier l'empreinte `E743B78B…` avant et après.***

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`. Écrit à la fin d'une nuit de
travail, sur demande de Gaëtan, **pour que la prochaine session exécute sans réfléchir** — et sans
casser les trois chemins du § 1.*
