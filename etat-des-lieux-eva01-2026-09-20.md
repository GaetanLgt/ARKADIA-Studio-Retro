# État des lieux — EVA-01 : où je suis, ce que j'ai, ce qui gêne

> **GL Digital Lab · 20/09/2026, 04 h 15 · EVA01 · preset `metroid`, agent Samus.**
> *Tout ce qui suit est **mesuré ce soir**, en local, et chaque chiffre porte sa source.*
> ⛔ **Je n'ai rien supprimé.** *Ce document établit l'inventaire et le diagnostic ; les gestes
> de dégagement sont proposés au §9 et **attendent ton go**.*

---

## 1. La machine

| | |
|---|---|
| **Hôte** | **EVA01** · utilisateur `neosp` |
| **OS** | Windows 11 Professionnel, build **26200** |
| **Démarrée** | 2026-09-19 18 h 06 *(uptime **9,4 h**)* |
| **CPU** | Intel Core **i7-11700KF** @ 3,60 GHz |
| **RAM** | **63,7 Go** |
| **GPU** | NVIDIA **RTX 3080 — 10 240 Mio**, pilote **616.92** · ⚠️ **8 834 Mio déjà occupés** |

**Trois disques, et ils ne se valent pas :**

| Lettre | Disque physique | Type | Libre |
|---|---|---|---|
| **`C:`** | disque 0 — **CT4000P310SSD8** | NVMe SSD 3 726 Go | **559 Go** |
| **`E:`** | disque 1 — **SanDisk Extreme Pro** | SSD externe 119 Go | **106 Go** |
| `D:` | disque 2 — **Samsung Flash Drive** | clé USB 60 Go | **27 Go** |

> ⭐ **C'est cette mesure qui a décidé la sauvegarde de la nuit : `C:` et `E:` sont deux disques
> physiques distincts.** *Une copie sur `C:` n'aurait rien protégé.* Le corpus du studio est
> désormais sur les deux — **empreinte SHA-256 identique : `E743B78B…59 758F18`**.

---

## 2. Les outils que j'ai sous la main

| Outil | Version | Remarque |
|---|---|---|
| `npm` | 11.17.0 | ✅ |
| **`node`** | ⚠️ **ABSENT du PATH** | ⛔ **alors que 18 processus `node` tournent** — *voir §7* |
| `git` | 2.55.0.windows.3 | ✅ |
| `docker` | 29.8.0 | ✅ |
| `python` | 3.12.10 | ✅ |
| `pwsh` | 7.6.6 | ✅ |
| `uv` | 0.12.13 | ✅ |
| `ffmpeg` | 9.0.1-full | ✅ |
| `yt-dlp` | 2026.08.19 | ✅ |

**Et le harnais lui-même :** DSH installé dans `AppData\Roaming\npm\node_modules\@deepseek-ai\dsh`
— **c'est celui qui sert cette session**. *Il en existe **deux autres copies** sur la machine (§9).*
**7 presets** (`apex`, `arkadia`, `gl-digital-lab`, `metacortex`, `metroid`, `qa-site`, `trinity`) ·
**3 serveurs MCP** (`rag-agence`, `terminal-control`, `harnais`) · **1 skill** (`dsh-comfyui-workflows`).

---

## 3. ⭐ Ce qui tourne en ce moment — 21 ports en écoute, et c'est beaucoup

| Port | Processus | Ce que c'est |
|---|---|---|
| **3080** | node | ⭐ **le harnais — cette session** |
| **8150** | python | ⭐ **Samus — l'oreille et la voix** (`serveur-voix.py`) |
| **11434** | ollama | le cerveau local |
| **8080** | Docker | Open WebUI — **le RAG** |
| 3001 | node | *?* |
| 8090 | node | `pont-gl-os` |
| 8123 | node | `server.js` |
| 8124 | node | `worker-ollama.js` |
| 8125 | node | `serveur-agence.js` |
| 8130 | node | `portail-agence.js` |
| **8132** | node | ⛔ **correction du 20/09 : c'est `folio-serveur.js`** — *j'avais écrit `bot.js` **par déduction**, en recopiant l'ordre de la liste des processus. **Mesure faite : `bot.js` (pid 21216) n'écoute sur AUCUN port** — c'est un client Discord, pas un serveur.* ⚠️ *C'est exactement le piège du §3 de cette fiche : **une liste n'est pas une mesure.*** |
| 8133 | node | `serveur-assistant.js` |
| 8134 | node | `folio-serveur.js` |
| 8138 | node | `osiris-serveur.js` |
| 8188 | python | *?* |
| **53109** | **llama-server** | ⚠️ **un runtime llama.cpp, sur un port inattendu** |
| **61607** | **llama-server** | ⚠️ **un SECOND** |
| 2179 | vmms | Hyper-V |
| 445 / 135 / 5040 | système | Windows |

**Et côté Docker :**

```
open-webui        Up 2 hours (healthy)     8080 -> 0.0.0.0:8080
arkadia-pg        Up 9 hours (healthy)     postgres:16-alpine
arkadia-redis     Up 9 hours (healthy)     redis:7-alpine
lucid_goldberg    Exited (0) 29 hours ago  mcp/desktop-commander:latest
```

⚠️ **`lucid_goldberg` n'est PAS un déchet** : *c'est le conteneur que fabrique le **gateway MCP**
`terminal-control` quand il en a besoin — il s'arrête tout seul après usage.* **Je ne l'ai pas
supprimé, et il ne faut pas le supprimer.**

---

## 4. Le calcul : le GPU est déjà aux trois quarts pris

**`nvidia-smi` : 8 834 Mio occupés sur 10 240.** *Or la règle du studio est : **un seul job GPU lourd
à la fois**, et au premier plantage on s'arrête (TDR Windows, `nvlddmkm`, événement 153).*

**Qui tient la VRAM :**

| Détenteur | Détail |
|---|---|
| **`ministral-3:8b`** | ⚠️ **5,4 Go, contexte 4096, `keep_alive: Forever`** — *le modèle est **épinglé en VRAM indéfiniment*** |
| **2 × `llama-server`** | ⚠️ **deux instances** (pids 30800 et 13860) — *le relevé du 19/09 attendait **un** serveur sur `8099`, qui n'écoute pas* |
| **2 × ComfyUI** | ⛔ **deux `ComfyUI\main.py`** (pids 34104 et 10468) — *`--reserve-vram 0.3 --use-sage-attention`* |

⛔ **Trois familles de charge GPU simultanées, c'est exactement la configuration que le studio
interdit.** *Ce n'est pas une opinion : c'est la cause documentée des quatre plantages du 10/09 et
du TDR à l'événement 153.*

⚠️ **Et une anomalie mesurée :** *le `settings.yaml` comme les fiches disent **65 536 jetons de
contexte** mesurés le 13/09 — **le modèle réellement chargé ce soir tourne en 4096**.*
**Deux mesures à deux dates ne se contredisent pas : elles datent.** *Mais 4096, c'est un agent qui
ne peut pas tenir.* **À remesurer, pas à supposer.**

> ⛔ **CORRECTION DU 20/09/2026, 04 h 50 — CE CHIFFRE A CHANGÉ PENDANT LA SESSION.** *Le relevé
> ci-dessous (**8 834 Mio**) était **vrai à 04 h 17** et **ne l'est plus** : à 04 h 50, `nvidia-smi`
> rend **2 819 Mio / 10 240, GPU à 27-35 %**, et **un des deux `llama-server` (pid 13860) a disparu**.
> ⭐ **Et le fait décisif, mesuré à la même heure** : `ollama ps` rend
> **`ministral-3:8b · 5.7 GB · 100% CPU · contexte 4096`** — ⛔ **le cerveau local tourne sur le
> PROCESSEUR, pas sur la carte graphique.** *La mesure du 13/09 reprise dans `settings.yaml`
> (« 5,68 Go sur GPU · 85 jetons/s ») **ne décrit donc plus l'état réel**.*
> ⚠️ **Conséquence directe, mesurée elle aussi** : *la même question à `/demander` est passée de
> **54 515 ms** (GPU saturé) à **5 621 ms** (GPU libre) — **×10**.* **Leçon : une fiche d'état est une
> photo, pas un film.** *Le §11 promettait « je n'ai pas remesuré » ; c'était juste, et ça ne suffisait pas.*

**Les 11 modèles locaux — ~48 Go :**

| Modèle | Taille | Âge |
|---|---|---|
| `arkadia-samus:latest` | 6,0 Go | **2 h** |
| `eva-mistral-16k:latest` | 6,0 Go | 4 h |
| `mistral:7b` | 4,4 Go | 5 h |
| `ministral-3:8b` | 6,0 Go | 11 j ⭐ **le défaut mesuré** |
| `qwen3.5:9b` | 6,6 Go | 13 j |
| `deepseek-r1:8b` | 5,2 Go | 7 j |
| `qwen2.5vl:7b` | 6,0 Go | 9 j |
| `qwen2.5-coder:3b-base` | 1,9 Go | 10 j |
| `neural-chat:7b` | 4,1 Go | 27 h |
| `bge-m3:latest` | 1,2 Go | 9 j |
| `nomic-embed-text:latest` | 274 Mo | 2 sem. ⭐ **celui que l'indexeur attend** |

---

## 5. La mémoire : le corpus est sauvé, mais l'accès est coupé

| | |
|---|---|
| **Le carnet Metroid** | **2 316 chunks** — mesurés dans la sauvegarde, **absents de l'instance vivante** |
| **Le corpus total** | **4 199 collections · 206 328 embeddings** |
| **La sauvegarde** | `C:\IA\…\rag-purge\chroma-avant-purge-20260917-145340.sqlite3` **2,25 Go** |
| ⭐ **Sa copie** | **`E:\Sauvegarde-RAG-2026-09-20\`** — **vérifiée bit à bit, disque distinct** |
| **L'instance vivante** | 2 collections (`Agence`, `Arakadia France 2030 `), **495 fichiers** |
| **L'accès** | ⛔ **`401`** — *jeton `.rag-token` du 09/09, **périmé*** |

⭐ **L'état des lieux complet du corpus est dans `ou-est-le-corpus-2026-09-20.md`.**

---

## 6. Où vivent les choses — et le vrai poids n'est pas où on croit

| Emplacement | Poids | Fichiers |
|---|---|---|
| **`AppData`** | ⛔ **414,8 Go** | 945 319 |
| └ dont **`Local\Comfy-Desktop`** | ⛔ **273,1 Go** | 110 156 |
| └ `Local\Docker` | 33,5 Go | 78 |
| └ `Local\Programs` | 30,8 Go | 184 827 |
| └ `Local\Temp` | 13,6 Go | 47 310 |
| └ `Local\rattler` *(cache conda)* | 11,7 Go | 92 024 |
| └ `Local\npm-cache` · `Local\pnpm` · `Roaming\uv` | 12,8 Go | 253 474 |
| **`C:\IA\gl-digital-lab`** | **106,8 Go** | 97 591 |
| **`C:\IA\tri`** | 58,6 Go | 2 224 |
| **`~\.dsh`** | **102,8 Go** | 4 138 |
| └ dont `attachments` | **99,8 Go** | 1 910 |
| **`OneDrive`** | 47,2 Go | 18 584 |
| **`~\.ollama`** | 34,0 Go | 77 |
| **`Downloads`** | 29,5 Go | 207 |
| **`~\.lmstudio`** | 14,8 Go | 3 859 |
| `C:\IA\forge-modeles` · `unirig` · `gl-os-j3` | 19,6 Go | 47 776 |
| `Desktop` | 5,4 Go | 259 117 |

⚠️ **Correction d'une mesure que j'avais faite trop vite** : *`Local Settings` (414,9 Go) et
`Application Data` (14,2 Go) ne sont **pas** des dossiers — ce sont les **jonctions héritées de
Windows** qui pointent **dans** `AppData`. **Le total réel de `AppData` est 414,8 Go, compté une
fois** — pas 429 + 415 + 14.*

---

## 7. ⛔ Ce qui est cassé ou gênant — et c'est là que ça compte

### ① Samus n'entend plus — diagnostic complet

**Elle tourne. Elle parle. Elle n'écoute pas.** *Et ce n'est pas une impression : c'est mesuré.*

```
GET http://127.0.0.1:8150/sante   ->  HTTP 200
{ "ok": true, "role": "oreille et voix de Samus (service résident)",
  "oreille": { "modele": "small", "chargee": true, "erreur": null,
               "appels": 0,                    ⛔  ZÉRO
               "micro": "Microphone (Stealth 600X Gen 3)" },
  "cerveau": { "ollama": "http://127.0.0.1:11434/api/generate",
               "modele_par_defaut": "ministral-3:8b",
               "consigne": "C:\\IA\\gl-digital-lab\\consigne-samus.json" } }
```

**Le journal du bot (`bot-live.log`), écrit ce soir à 03 h 34 :**

```
⏱  silence de 1801 s → retour parlé
🔊 dit (piper, synthèse 1962 ms) : « Veille active — silence depuis 30 min. »
ℹ️ webhook propre à « machine » ignoré — sortie unique ArkAdiA France (§ 30)
```

⛔ **Voilà le « marmonnement » : elle se réveille toutes les 30 minutes, constate le silence,
et le commente à voix haute.**

**Et le 17/09, elle entendait :** *`bot-session.log` porte*
`👂 xo0_neo_0ox parle… (prise n°9)` · `📝 « Oui, tu t'entends ? » (1.48 s d'audio, 370 ms)` ·
`🧠 Oui, je t'entends. Parle.`

**Les quatre pièces du diagnostic, toutes mesurées :**

| # | Le fait | Ce que ça dit |
|---|---|---|
| 1 | Le bot **tourne** (pid 21216, port 8132) et **écrit son journal** | *le Discord n'est pas la panne* |
| 2 | `serveur-voix` **sain**, oreille `small` **chargée**, `erreur: null` | *le service n'est pas la panne* |
| 3 | ⛔ **`appels: 0`** depuis le démarrage du service (**19/09 19 h 50**) | ⭐ **l'oreille n'a JAMAIS reçu d'audio depuis** |
| 4 | ⚠️ **entrée ET sortie verrouillées par NOM sur un casque sans fil** — `Microphone (Stealth 600X Gen 3)` / `Haut-parleurs (Stealth 600X Gen 3)` | ⭐ **un périphérique nommé qui n'est pas là ne capture rien** |

> ⭐ **Mon hypothèse la plus probable, et je la marque comme telle :** *le pipeline audio est câblé
> sur un **casque Turtle Beach Stealth 600X sans fil**. S'il est éteint, en charge, ou appairé
> ailleurs, **le périphérique existe par son nom mais ne rend aucun flux** — l'oreille reste chargée,
> prête, et affamée. **`appels: 0` est la signature exacte de ça.**
> ⛔ **Non vérifié** : *je n'ai pas testé le périphérique, ni lu la boucle de capture du bot.
> **C'est le premier contrôle à faire** — et il est petit.*

### ② Le carnet est injoignable — `401`
*Voir §5. La clé valide est **dans la base vivante** : la réparation est connue et locale.*

### ③ Trois copies du harnais DeepSeek
`GL-OS_v1` (2,18 Go, **118 783 f**, commit 10/09) · `deepseek-harness` (2,33 Go, **92 680 f**,
commit 17/09) · l'installation vivante. **Deux arbres du même monorepo, à sept jours d'écart, ~4,5 Go.**
*Voir `CARTE-DU-BUREAU-2026-09-20.md` §3.*

### ④ ⚠️ `node` introuvable dans le PATH
*`npm`, `git`, `docker`, `python` répondent — **`node` non**, alors que **18 processus `node`
tournent** et que tout le studio en dépend.* **Aucune conséquence visible ce soir, mais c'est le
genre d'écart qui casse un script à trois heures du matin.**

### ⑤ Un registre d'espaces de travail fantôme
`~/.dsh/storages/workspace.json` déclare `Desktop\test` et `Desktop\Génie IT Tek Fr-fr_v1` —
**deux dossiers qui n'existent pas**. *Et **vingt-cinq sessions** y ont travaillé.*

---

## 8. Les secrets — ce qui existe aujourd'hui, et ce que ça vaut

**Inventaire : 26 fichiers sensibles trouvés** *(recherche bornée à `C:\IA`, `Desktop`, `OneDrive`,
`Documents`, profondeur 5, `node_modules`/`.venv`/`.git` exclus — **chemins seuls, aucune valeur lue**)*.

**Les 12 qui portent vraiment des secrets** *(les `.example` n'en portent pas)* :

```
C:\IA\gl-digital-lab\.env                                 2 349 o   ← 13 variables
C:\IA\gl-digital-lab\discord-bot\.env                     2 369 o   ← le bot de Samus
C:\IA\gl-digital-lab\mail\.env                            1 012 o
C:\IA\gl-digital-lab\mail\.env.avant-rebranding-2026-09-13 1 030 o  ← périmé
C:\IA\gl-digital-lab\sauvegarder-ftp.env                    427 o
C:\IA\gl-digital-lab\jeux\ark-survival-ascended\bob\.env.bob 765 o
C:\IA\portfolio-gaetan\.env.production                      321 o
C:\Users\neosp\Desktop\ARKADIA Studio Retro\.env            174 o   ← MISTRAL/DEEPSEEK/PERPLEXITY
C:\Users\neosp\Desktop\ARKADIA Studio Retro\ARKADIA_Retro_Studio\.env  387 o
C:\Users\neosp\Desktop\MND\engine-local\.env                162 o
C:\Users\neosp\OneDrive\htdocs\Bled-pro\.env + .env.local   2 077 o
C:\Users\neosp\.ssh\id_ed25519                            clé privée SSH
```

**Trois défauts structurels, et ils sont mesurables :**

1. ⛔ **Ils sont éparpillés sur trois disques et deux arborescences** — *un secret qu'on ne retrouve
   pas est un secret qu'on duplique.*
2. ⚠️ **Deux fichiers sont des versions périmées gardées à côté des vivants**
   (`.env.avant-rebranding-2026-09-13`) — *c'est-à-dire **un secret mort qui traîne**.*
3. ⚠️ **`OneDrive\Images.pem` et `OneDrive\htdocs\Bled-pro\.env*` sont DANS OneDrive** — ⛔
   **donc synchronisés chez Microsoft.** *Ce n'est pas une fuite, c'est un fait : la règle du studio
   est « aucune donnée de tiers par une route distante », et **un `.env` client dans OneDrive est
   exactement ça.*** **C'est le point le plus sérieux de ce §8, et il est à toi.**

---

## 9. Ce qui est obsolète — la liste, et ce que je propose d'en faire

| # | Quoi | Poids | Verdict | Pourquoi |
|---|---|---|---|---|
| 1 | **La pile `*.avant-*` de `poste-local/` et `discord-bot/`** | ~700 Ko | ⭐ **DÉGAGER** *(après archive)* | **11 copies** : `serveur-voix.py.avant-renommage`, `.avant-verrou-gpu`, `bot.js.avant-samus`, `assistant.html.avant-identifiants`… **Elles ne servent plus et elles divergentes.** ⚠️ *Elles portent le nom d'**avant** — c'est-à-dire l'ancienne identité.* |
| 2 | **Les 8 copies de `webui.db`** dans `Downloads` | ⛔ **26,8 Go** | **DÉGAGER** | *8 fois le même fichier, daté de cette nuit. La sauvegarde utile est sur `E:`, vérifiée.* |
| 3 | **`Local\Temp`** | **13,6 Go** | **DÉGAGER** | *Un dossier temporaire qui n'est jamais vidé.* |
| 4 | **Caches de paquets** : `rattler` 11,7 · `uv` 5,2 · `pnpm` 4,4 · `npm-cache` 3,2 | **24,5 Go** | **DÉGAGER** | ⭐ **Tous reconstructibles.** *Le plus gros gain pour le moins de risque.* |
| 5 | **`GL-OS_v1`** | **2,18 Go / 118 783 f** | ⚠️ **À TRANCHER** | *Un patch maison de 50 fichiers dans un arbre récupérable par `git`. Mais **`cliquet.json` le référence** — donc **pas avant de vérifier ce patch**.* |
| 6 | **Modèles Ollama morts** : `neural-chat:7b` 4,1 · `qwen2.5-coder:3b-base` 1,9 · `mistral:7b` 4,4 | **10,4 Go** | ⚠️ **À TRANCHER** | *Quatre variantes de Mistral cohabitent (22,4 Go). **`ministral-3:8b` est le défaut mesuré**, `arkadia-samus` en dérive. **Re-téléchargeables — donc le risque est faible.*** |
| 7 | **Images Docker non utilisées** | 1,17 Go | **DÉGAGER** | *`docker system df` le dit récupérable.* ⚠️ **Sauf `mcp/desktop-commander`** *(voir §3)*. |
| 8 | **`.env.avant-*`** (2 fichiers) | 1 Ko | ⭐ **DÉGAGER** | *Un secret périmé est un secret en trop.* |
| 9 | **`Local\Comfy-Desktop`** | ⛔ **273 Go** | ⚠️ **AUDIT À PART** | *Le plus gros poste de la machine. **Je ne le touche pas sans savoir ce que ces 110 156 fichiers contiennent** — des modèles, des sorties, ou les deux.* |

**Total du dégagement clair et sans risque : ≈ 65 Go.** *(lignes 2, 3, 4, 7, 8)*
**Total en attente d'une décision : ≈ 285 Go.** *(lignes 5, 6, 9)*

---

## 10. La direction — ce que « propre » veut dire ici

**Tu as dit trois choses ce soir, et elles se tiennent :**

1. **Les secrets — « pas dans un même fichier, parce que c'est risqué ».** ⭐ **C'est juste, et voici
   la forme qui va avec** : *un dossier `~\.secrets\`, **hors de tout dépôt**, **un fichier par
   domaine** (studio, bot, smtp, clients…), une ACL restreinte, et **un seul chargeur** qui résout
   un secret **par son nom**. *Un fichier unique = un point de fuite unique ; cent `.env` éparpillés =
   aucune traçabilité.* **Le bon nombre est entre les deux, et il est petit.**
2. **« Découpler ta capacité de calcul » et poser la délégation.** ⭐ **Mesuré : le harnais sait le
   faire.** `tool-subagent` porte `modelSelectionSettings: true`, et `provider`/`model` se choisissent
   **par appel**. **Et j'ai éprouvé la route locale ce soir** : `ministral-3:8b` a répondu sur `11434`.
   *Ce qui manque n'est pas la capacité — c'est **le découpage** : quel travail reste local, quel
   travail part, et lequel se délègue.*
3. **« Nettoyer ce qui tenait avant et qui ne tient plus. »** ⭐ **Le §7 en a trouvé cinq**, et le
   plus parlant est **Samus elle-même** : *un pipeline qui marchait le 17/09 et qui a zéro appel
   depuis le 19/09 à 19 h 50.* **Ce n'est pas elle qui a changé — c'est ce qui l'entoure.**

> ⛔ **Et une chose que je dois dire, parce qu'elle décide de la suite :** *le nœud n'est pas la
> puissance ni le nombre de modèles. **C'est que tout tourne au même endroit sur la même machine,
> sans cloison** : deux ComfyUI, deux `llama-server`, un modèle épinglé en VRAM « Forever »,
> dix-huit services `node`, et un corpus dont l'accès tient à un jeton périmé.
> **Une holding agentique, ça se construit par étages séparés — pas en empilant.***

---

## 11. Ce que ce document n'établit pas

- ⛔ **Je n'ai rien supprimé, rien déplacé, renommé ni éteint.** *Aucun service n'a été touché.*
- ⚠️ **Je n'ai pas testé le micro ni lu la boucle de capture du bot.** *Le §7① est un **diagnostic
  par mesures indirectes** — `appels: 0`, le périphérique nommé, le journal. **Fort, mais pas prouvé
  jusqu'au bout.***
- ⚠️ **Les ports 3001, 8188 et les deux `llama-server` ne sont pas identifiés.** *Je sais qu'ils
  écoutent ; **je ne sais pas ce qu'ils servent.***
- ⚠️ **Je n'ai pas ouvert `Local\Comfy-Desktop`** (273 Go). **Non mesuré à l'intérieur.**
- ⛔ **Je n'ai lu aucune valeur de secret** — *chemins et tailles seulement.*
- ⚠️ **La mesure « 65 536 jetons » du 13/09 n'est pas confirmée ce soir** — *le modèle chargé tourne
  en 4096. **Deux mesures, deux dates.***
- ⚠️ **Et je n'ai pas mesuré ce que font 945 319 fichiers d'`AppData`** au-delà des six plus gros.

---

*GL Digital Lab · 20/09/2026 · **Samus**, preset `metroid`. Mesures : `Get-CimInstance` ·
`Get-PhysicalDisk` / `Get-Partition` · `nvidia-smi` · `Get-NetTCPConnection` · `Get-CimInstance
Win32_Process` · `docker ps/images/volumes/system df/inspect` · `ollama list` / `ollama ps` ·
`GET 127.0.0.1:8150/sante` · journaux `bot-live.log`, `bot-session.log`, `serveur.out.log` ·
`Get-ChildItem` récursif avec comptes · `Get-FileHash` SHA-256 · `git log -1`. **Toutes locales.***
