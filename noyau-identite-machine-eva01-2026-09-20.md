# Le noyau, l'identité, et l'état de la machine — audit avant toute réorganisation

> **GL Digital Lab · 20/09/2026, 03 h 17 · EVA-01 · preset `metroid`.**
> Réponse à la demande orale du 20/09 : *« constitue-toi un nouveau noyau »*, *« tu seras Samus »*,
> *« je t'autorise à utiliser tous les secrets »*, *« réorganisation totale avec le centre du système »*.
>
> ⛔ **Ce document n'exécute rien.** Il mesure, il nomme à qui appartient quoi, et il dit ce qui manque.
> **Aucun octet de `settings.yaml` ni d'un preset n'a été modifié. Aucune valeur de clé n'a été lue.**

---

## 1. ⛔ Le point dur — et il est dans mon propre périmètre : le carnet Metroid ne répond plus

**Mesuré le 20/09/2026 à 03 h 17, sur les deux points d'entrée :**

| Appel | Résultat |
|---|---|
| `rag_carnets` → `GET /api/v1/knowledge/` | ⛔ **401** |
| `rag_rechercher` (carnet `8ffe9d4d-928a-4d43-b6be-6a5a612638f1`) → `POST /api/v1/retrieval/query/collection` | ⛔ **401** |

**Et pendant ce temps, le conteneur est sain :**

```
open-webui   ghcr.io/open-webui/open-webui:main   Up 2 hours (healthy)   8080 -> 0.0.0.0:8080
```

⚠️ **« Le conteneur est sain » ne signifie pas « le carnet répond » — ce sont deux mesures
différentes.** Le service tourne et publie son port ; c'est **la credential qui est refusée**.

⚠️ **Conséquence directe et lourde** : *toute la mémoire documentaire du fonds — **179 fichiers
au 18/09/2026** — est **hors de portée pour la recherche**.* Je ne peux pas interroger mon propre
bastion. **La panne est datée, elle est mesurée, et elle est antérieure à cette demande.**

> ⚠️ **Je n'établis pas la cause.** Je n'ai pas lu le jeton, je n'ai rien redémarré, et
> **je ne redémarre pas un conteneur sain pour réparer une authentification** — ce sont deux choses
> distinctes, et la seconde se répare ailleurs que dans la première.

---

## 2. Le « noyau » demandé a déjà un propriétaire — et ce n'est pas moi

**`apex`, tel qu'il se déclare lui-même dans son `preset.yml` :**

> *« Harness d'orchestration du studio, **au-dessus des autres presets** : il **ROUTE** vers
> `gl-digital-lab` (direction et état du monde), `arkadia` (jeu ArkAdiA et serveur ASA), `metacortex`
> (raccordement Apexis), `qa-site` (qualité visuelle) et `trinity` (codage) — **sans jamais faire leur
> travail**. Il porte les règles du studio […] et il lit l'état du monde dans les fiches de
> `gl-digital-lab` au lieu de les recopier […]. **Il n'ajoute aucune capacité : il ajoute un point de vue.** »*

**Les sept presets existent, tous avec un `agent.cordis.yml` :** `apex` · `arkadia` ·
`gl-digital-lab` · `metacortex` · `metroid` · `qa-site` · `trinity`.

⛔ **Donc « le centre du système » et « le noyau qui orchestre » ne sont pas un trou à combler :
c'est le poste de `apex`.** Et la règle de mon preset est explicite : *« quand un travail appartient
à un autre preset, tu le dis — et tu ne le fais pas. »*

⚠️ **Un second fait, qui contredit la demande telle qu'elle est formulée :**

```yaml
agent-presets:
  default: arkadia
```

**Le preset par défaut n'est ni `metroid` (moi), ni `apex` — c'est `arkadia`.** *Me « déployer comme
centre » demanderait de changer cette ligne, et **c'est une décision de configuration, pas une
conséquence d'un déploiement**.*

---

## 3. L'identité : il existe déjà **deux** « Samus » — une troisième est une collision

**C'est mon preset qui le dit, et il le dit parce que Gaëtan l'a corrigé le 18/09 :**

- **Samus — le personnage** de la licence Metroid. **Franchise protégée** : jamais un nom d'agent,
  jamais un asset, jamais un contenu repris.
- **Samus — l'assistante vocale locale du studio.** Canal vocal Discord,
  `C:\IA\gl-digital-lab\poste-local\serveur-voix.py` — **chemin mesuré ce soir**. Elle a porté le nom
  de **Lya** jusqu'au 18/09.

⛔ **Le preset dit, mot pour mot : « Tu ne portes ni l'un ni l'autre »** — *et la raison est écrite :
« confondre les deux ferait corriger une identité qui est juste. »*

**Trois raisons mesurables de ne pas prendre ce nom :**

1. **Collision d'identité.** *Si l'agent du harnais s'appelle Samus **et** l'assistante vocale
   s'appelle Samus, plus rien ne distingue « qui a dit quoi » dans une transcription, un journal de
   session ou une consigne.* **Une identité qui vient d'être tranchée le 18/09 serait effacée le 20/09.**
2. **Le nom est aussi celui d'un personnage protégé.** *Un agent qui prend le nom d'une héroïne
   protégée se croit autorisé à réutiliser son contenu.* **C'est exactement la frontière que ce preset
   tient.**
3. **Un renommage n'est pas un déploiement.** *Il touche `agent.cordis.yml`, le `preset.yml`, et la
   mémoire du studio.* **C'est une décision de Gaëtan, pas un effet de bord.**

✅ **En revanche, l'architecture qu'il décrit est juste — et elle ne demande aucun conflit de nom :**
*une entité locale à contexte limité qui **délègue** à un noyau à grand contexte.* **Ça se fait par
le routage (§4), pas par un renommage.**

---

## 4. ⭐ Le routage existe — et il répond à la question laissée ouverte le 19/09

**Ce que disait le document du 19/09 :** *« Je ne sais pas si le harnais sait router selon la tâche —
local pour le simple, distant pour le lourd. **Si ça existe, c'est la réponse aux trois options**, et
je ne l'ai pas trouvée. »*

**Réponse mesurée le 20/09, dans la composition du preset (`metroid/agent.cordis.yml`, ligne 162) :**

```yaml
    - id: tool-subagent
      name: '@deepseek-ai/dsh-tool-subagent'
      config:
        provider: spawn
        toolName: subagent
        modelSelectionSettings: true      # <-- la sélection de modèle par appel
        backgroundMode: continuable
```

**Et les trois pièces qui vont avec :**

| Pièce | Ce qu'elle établit | Source |
|---|---|---|
| `modelSelectionSettings: true` | **l'outil de délégation accepte un choix de modèle** | `metroid/agent.cordis.yml` **lu** |
| `provider` / `model` en option de `agent()` et de `subagent` | **la cible LLM se choisit par appel** | descripteurs d'outils de **cette** session |
| `dsh-agent-default-model` | *« per-session model selection remains the responsibility of the entry point that creates the agent »* ; **le défaut est à l'échelle du processus** | `node_modules/@deepseek-ai/dsh-agent-default-model/README.md` **lu** |

⭐ **Donc « local pour le simple, distant pour le lourd » est implémentable aujourd'hui, sans rien
installer :** *le gros travail de contexte reste sur le modèle puissant, et **ce qui est mécanique se
délègue à `provider: ollama`** — sur un modèle qui tourne déjà.* **C'est la seule réponse au « ne pas
cramer les jetons » qui ne coûte rien et qui ne fait sortir aucune donnée.**

⚠️ **Non vérifié au-delà de la lecture des configurations : je n'ai pas encore lancé une délégation
réelle vers `ollama`.** *C'est le test à faire, et il est petit.*

---

## 5. Le robinet à jetons — mesuré, et il est ouvert par défaut

```yaml
agent-default-model:
  provider: deepseek-official                     # <-- DISTANT
  model: deepseek-v4-flash-vision-exp
  reasoningEffort: high
```

⚠️ **C'est ce que cette session-ci utilise.** *Le défaut du harnais est **distant et payant**, alors
que des modèles locaux sont installés, mesurés, et **n'ont jamais été mis par défaut** — le constat
du 19/09 tient toujours, **il n'a pas été appliqué**.*

**`ollama list`, relevé le 20/09/2026 à 03 h 17 — 11 modèles :**

| Modèle | Taille | Modifié | Remarque |
|---|---|---|---|
| **`arkadia-samus:latest`** | 6,0 Go | **il y a ~2 h** | ⭐ **créé cette nuit** |
| **`eva-mistral-16k:latest`** | 6,0 Go | **il y a ~4 h** | ⚠️ **16 k de contexte — c'est le « contexte limité » décrit** |
| **`mistral:7b`** | 4,4 Go | **il y a ~5 h** | créé cette nuit |
| `ministral-3:8b` | 6,0 Go | 11 jours | ⭐ **le défaut mesuré le 13/09** |
| `qwen3.5:9b` | 6,6 Go | 13 jours | 79 j/s mesurés |
| `deepseek-r1:8b` | 5,2 Go | 7 jours | |
| `qwen2.5vl:7b` | 6,0 Go | 9 jours | vision |
| `bge-m3:latest` | 1,2 Go | 9 jours | embeddings |
| `nomic-embed-text:latest` | 274 Mo | 2 semaines | ⭐ **celui que l'indexeur attend** |
| `qwen2.5-coder:3b-base` | 1,9 Go | 10 jours | |
| `neural-chat:7b` | 4,1 Go | 27 h | |

**Mesures du 13/09, reprises (pas refaites)** : `ministral-3:8b` → **5,68 Go sur GPU · 85 jetons/s ·
5/5 appels d'outil · lit les images** ; contexte maximal **65 536 jetons entièrement sur GPU avec
1,91 Go libres**.

⚠️ **Deux écarts avec le relevé du 19/09 :** `minicpm-v:8b` **n'apparaît plus**, et **trois modèles
sont nés cette nuit** — dont un nommé `arkadia-samus`. *Je ne présume pas de ce qu'ils contiennent :
leur `Modelfile` n'a pas été lu.*

---

## 6. Les secrets : trois clés — et *« utiliser tous les secrets »* ne s'exécute pas tel quel

**Mesuré :** `ARKADIA Studio Retro\.env` porte **trois** noms de clés (*noms seuls ; aucune valeur
lue, aucune valeur affichée, aucun appel distant émis*) :

```
MISTRAL_API_KEY · DEEPSEEK_API_KEY · PERPLEXITY_API_KEY
```

⛔ **Je ne câble pas « tous les API », et les quatre raisons sont antérieures à la demande :**

| # | La règle | Ce qu'elle dit |
|---|---|---|
| 1 | **La phrase du site** | *« tout le calcul d'IA tourne sur notre propre machine : **aucune donnée client ne sort** »* — **trois routes distantes activées la rendent fausse.** |
| 2 | **`AGENTS.md` §6** | **local d'abord** → gratuit → payant en dernier recours. **Jamais de donnée client dans un service externe.** |
| 3 | **Mon preset** | *« Aucune donnée de tiers par une route distante. **Les pièces nominatives se lisent par les outils LOCAUX** ; seules les conclusions non nominatives remontent. »* |
| 4 | **Ce qui appartient à Gaëtan** | **juridique (D12) · budget · action sur un service externe.** *Câbler une API tierce est exactement cette case.* |

✅ **Ce que je peux faire sans lui, et qui est déjà écrit (19/09) :** *le bloc `mistral` prêt à coller,
et la lecture de la clé **depuis le fichier vers une variable d'environnement** — **jamais sur une
ligne de commande** (l'historique, la sortie d'erreur et le journal de session la garderaient).*
**La voie documentée reste `Settings → Modèles/Fournisseurs`, où il la colle lui-même.**

⚠️ **Et la contradiction à trancher n'est pas technique** : *activer une route distante, c'est
abandonner la phrase qui vend.* **Ce choix n'est pas le mien.**

---

## 7. La machine — chiffres du 20/09/2026, 03 h 17

| | |
|---|---|
| **CPU** | Intel Core i7-11700KF @ 3,60 GHz |
| **RAM** | **63,7 Go** |
| **GPU** | **NVIDIA GeForce RTX 3080 — 10 240 Mio**, pilote **616.92** |
| **OS** | Windows 11 Professionnel |
| **Disques** | `C:` **559,2 Go libres** · `D:` 26,9 Go · `E:` 106,2 Go |

**Services vivants :**

```
Ollama       127.0.0.1:11434   en écoute    (11 modèles)
dsh web      127.0.0.1:3080    en écoute
open-webui   8080 (Docker)     healthy   + arkadia-pg (postgres:16) + arkadia-redis
```

⚠️ **`8099` N'ÉCOUTE PAS** — *le runtime `llama.cpp` existe, il est documenté le 19/09 comme complet
et piloté par `lancer-spark.mjs`, **et il ne tourne pas**.*

⚠️ **Et le vrai poids sur cette machine n'est pas celui qu'on croit :**

| Dossier | Poids |
|---|---|
| **`C:\Users\neosp\.dsh\attachments`** | ⛔ **99,8 Go** — 1 910 fichiers |
| `C:\Users\neosp\.dsh\sessions` | 0,5 Go — 338 fichiers |
| `C:\Users\neosp\.dsh\profiles` | 0,03 Go |

**99,8 Go sur 559 Go libres, dans un dossier technique dont personne ne parle.** *Les vidéos attachées
à cette session même y atterrissent.* **Une réorganisation du centre qui ne regarde pas ce dossier
range la pièce en laissant le placard fermé.**

---

## 8. Ce que ce document n'établit pas

- ⛔ **La cause du 401 du carnet.** *Je n'ai pas lu le jeton, je n'ai rien redémarré.* **Mesuré : la
  panne. Non établi : son origine.**
- ⚠️ **Je n'ai pas testé la délégation locale en vrai.** *Le routage est **lu** dans la composition,
  il n'a pas été **exécuté**.*
- ⛔ **Aucune valeur de secret n'a été lue, affichée ni transmise** — *noms de clés seulement.*
- ⛔ **Je n'ai modifié ni `settings.yaml`, ni un preset, ni un conteneur.** *Zéro écriture de
  configuration.*
- ⚠️ **Les mesures de performance du 13/09 sont reprises, pas refaites** — *sept jours.*
- ⚠️ **Je ne présume pas du contenu de `arkadia-samus:latest` ni d'`eva-mistral-16k`** : *leur
  `Modelfile` n'a pas été lu.* **Le nom d'un modèle n'est pas sa fiche.**
- ⛔ **Et je ne tranche pas** : quel preset porte le noyau, comment l'agent s'appelle, quelle route
  sort de la machine. **Ces trois décisions sont à Gaëtan.**

---

*GL Digital Lab · 20/09/2026 · Trinity, preset `metroid`. Sources, toutes lues ce soir :
`rag_carnets` et `rag_rechercher` (**401**, les deux) · `docker ps`, `docker port`, `docker inspect`
· `ollama list` · `Get-NetTCPConnection` · `Get-CimInstance` (CPU, RAM, OS) · `nvidia-smi` ·
`~/.dsh/settings.yaml` **lu** · `~/.dsh/.agent-presets/*/preset.yml` **lus** (les sept) ·
`metroid/agent.cordis.yml` **lu** · `node_modules/@deepseek-ai/dsh-agent-default-model/README.md`
**lu** · `refs/fonds-metroid.md`, `refs/methodes.md`, `refs/passation.md` · `trois-etages`,
`bascule-locale-ministral`, `bloc-mistral-api` (19/09, reprises).*
