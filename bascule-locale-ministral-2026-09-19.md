# La bascule locale — passer le harnais sur `ministral-3:8b`

> **À coller dans `~/.dsh/settings.yaml`. Écrit le 19/09/2026 pour le dossier `AKADIA Studio Retro`.**
>
> ⭐ **CE FICHIER NE DEMANDE AUCUNE INSTALLATION.** *Le modèle est déjà là, déclaré, mesuré, et il a
> passé ses épreuves d'outillage.* **C'est le chemin le moins cher de tout le dossier.**

---

## ⭐ Ce qui est déjà en place — vérifié le 19/09/2026

**`~/.dsh/settings.yaml` porte déjà le bloc complet, dans `llm-pi-ai.providers.ollama` :**

```yaml
      ollama:
        api: openai-completions
        baseURL: http://localhost:11434/v1
        headers:
          Authorization: "Bearer ollama-local"
        compat:
          supportsDeveloperRole: false
          supportsReasoningEffort: false
          supportsStore: false
          supportsStrictMode: false
          maxTokensField: max_tokens
        models:
          - id: qwen3.5:9b
          - id: ministral-3:8b
            input: [ text, image ]
```

**Et les mesures, écrites dans le fichier lui-même** *(13/09/2026, `forge-ia/tester-agent-local.py`,
rejouable)* :

| Modèle | Appels d'outil | GPU | Vitesse | Images |
|---|---|---|---|---|
| **`ministral-3:8b`** | **5/5 corrects** | **5,68 Go** | **85 jetons/s** | ⭐ **oui** |
| `qwen3.5:9b` | 5/5 corrects | 5,50 Go | 79 jetons/s | non |

⭐ **Et la décision est écrite, datée** : *« Décision Gaëtan du 13/09/2026 : **`ministral-3:8b` reste
le défaut** — il est le plus rapide des deux et **il est le seul à lire les images**. »*

⚠️ **Le fichier porte aussi sa propre correction** : *« ce fichier annonçait "qwen3.5:9b : agent
local par défaut" alors que la valeur choisie ci-dessus est ministral-3:8b. **Le commentaire
contredisait le réglage.** »* — ⭐ **la même faute que ce dossier traque partout ailleurs.**

**Et le contexte maximal est mesuré** : *« 65 536 jetons entièrement sur GPU avec 1,91 Go encore
libres — **c'est ce qui permet de faire tourner un agent**, dont le prompt système et les schémas
d'outils sont longs. »*

---

## ⛔ Ce qui n'est PAS en place — et c'est **une seule chose**

**`agent-default-model` ne pointe pas sur Ollama :**

```yaml
# CE QU'IL Y A AUJOURD'HUI
agent-default-model:
  provider: deepseek-official
  model: deepseek-v4-flash-vision-exp
  reasoningEffort: high
```

> ⭐ **Donc le harnais parle à un service distant, alors que le modèle Mistral local est installé,
> déclaré, éprouvé, et **n'a jamais été mis par défaut**.**

---

## ⭐ LA BASCULE — deux lignes

```yaml
agent-default-model:
  provider: ollama            # <- etait deepseek-official
  model: ministral-3:8b       # <- etait deepseek-v4-flash-vision-exp
  reasoningEffort: high       # <- a RETIRER ou laisser : Ollama l'ignore
```

⚠️ **`reasoningEffort`** : *le bloc `ollama` déclare `supportsReasoningEffort: false`. **Le laisser
ne casse rien, mais il ne sert à rien**.* **À nettoyer, ou à garder pour le jour où le défaut
repart sur un modèle qui le comprend.**

---

## ⚠️ Ce que cette bascule fait, et ce qu'elle ne fait pas

### ✅ Ce qu'elle fait

- ⭐ **Aucune donnée ne sort de la machine.** *`ministral-3:8b` tourne sur le GPU d'EVA-01.*
- ⭐ **La phrase publiée sur le site redevient vraie** : *« tout le calcul d'IA tourne sur notre
  propre machine : aucune donnée client ne sort. »*
- **Coût : 0 €.**
- **Elle est réversible en deux lignes.**

### ⚠️ Ce qu'elle ne fait pas — et il faut le savoir avant

- ⚠️ **Un 8B n'est pas `deepseek-v4-flash-vision-exp`.** *Le harnais enchaîne des tâches longues avec
  beaucoup d'outils : **le modèle local fera plus d'erreurs, et il faudra le surveiller.***
- ⚠️ **Il mobilise le GPU en permanence.** *Or la règle du studio dit **un seul job GPU lourd à la
  fois**.* **Un agent local qui tourne pendant qu'un rendu ComfyUI travaille, c'est deux jobs sur
  10 Go de VRAM.**
- **Pas de « vision » au sens large** : *il lit les images (`input: [text, image]`), **il ne fait pas
  ce que fait un OCR Mistral**.*

---

## ⭐ Et la contradiction à trancher — elle est dans le but du jour

**Deux consignes du 19/09 se heurtent :**

| | La consigne |
|---|---|
| **A** | *« On va **arrêter d'utiliser Ollama** »* |
| **B** | *« passer sur une session **Mistral** — et **pas dans le cloud** »* |

⛔ **Or `ministral-3:8b` TOURNE DANS OLLAMA.** *Et `serveur-voix.py` le déclare comme son cerveau :*

```json
"cerveau": { "ollama": "http://127.0.0.1:11434/api/generate",
             "modele_par_defaut": "ministral-3:8b" }
```

**Donc « arrêter Ollama » arrêterait Samus, le RAG, et ce modèle** — ⭐ *c'est-à-dire **le Mistral
local qui existe déjà**.*

**Les trois lectures, telles qu'elles sont posées dans le but :**

| | Ce que ça veut dire | Ce que ça coûte |
|---|---|---|
| **①** | **Remplacer Ollama par `llama.cpp`** | ⭐ *le runtime est **déjà complet** (`llama-server.exe` + `llama-server-impl.dll` + `ggml-cuda.dll` + un modèle 8,2 Go), et `lancer-spark.mjs` le pilote sur **8099**.* ⚠️ *Mais `ministral-3:8b` est un modèle Ollama : il faudrait **le convertir en GGUF ou en télécharger un**.* |
| **②** | **Garder Ollama, ajouter l'API Mistral pour le reste** | ⚠️ *la donnée sort pour ce qui passe par l'API* |
| **③** | **Les deux, séparés par nature** | *le local pour ce qui ne sort pas, l'API pour ce qui est déjà publié* |

⛔ **Aucune n'est tranchée ici.** *Ce fichier installe l'option **② sans la nommer** — c'est-à-dire
la bascule locale — **parce qu'elle est la seule qui ne coûte rien et ne fait rien sortir**.*

---

## Ce que ce fichier n'établit pas

- ⛔ **Rien n'a été modifié dans `settings.yaml`.** *Ce fichier dit **quoi coller**, il ne l'a pas
  collé.*
- ⚠️ **Je n'ai pas testé `ministral-3:8b` sur une tâche longue du harnais.** *Les 5/5 appels d'outil
  mesurés le 13/09 portent sur **cinq tâches simples** (lire un fichier, lancer une commande).*
  **Ce n'est pas la même chose qu'une session de plusieurs heures.**
- **Les mesures datent du 13/09** — *six jours.* ⭐ **Reprises du fichier, pas refaites.**
- ⚠️ **Et je ne sais pas si le harnais sait router selon la tâche** *(local pour le simple, distant
  pour le lourd).* *Si ça existe, c'est la vraie réponse — **et ça ne se lit pas dans ce que j'ai
  ouvert.***

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Sources : `~/.dsh/settings.yaml` **lu**
(bloc `llm-pi-ai.providers.ollama` en entier, et `agent-default-model`) · `ollama list` relevé le
19/09 · `serveur-voix.py` via `GET /sante` · le but du 19/09 §« contradiction ».*
