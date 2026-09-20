# Le bloc `mistral` — pour l'API, avec la clé placée sans jamais la taper

> **À coller dans `~/.dsh/settings.yaml`. Écrit le 19/09/2026 pour `AKADIA Studio Retro`.**
>
> ⚠️ **CE FICHIER EST LE CHEMIN QUI FAIT SORTIR LA DONNÉE.** *L'autre fichier du dossier —
> `bascule-locale-ministral-2026-09-19.md` — est le chemin qui ne la fait pas sortir. **Les deux
> existent, et ils ne font pas la même chose.*** ⭐ *Voir le §4 de `trois-etages-2026-09-19.md`.*

---

## 1. ⭐ Les identifiants — tous vérifiés sur la spec officielle, aucun deviné

**Source unique** : **`docs.mistral.ai/openapi.yaml`** — *1 100 161 octets, OpenAPI 3.1.0,
**213 chemins**, téléchargée le 19/09/2026.* **Serveur déclaré par la spec : `https://api.mistral.ai`.**

| Chemin présent dans la spec | Ce qu'il sert |
|---|---|
| **`/v1/chat/completions`** | *le chat — **le chemin OpenAI standard*** |
| **`/v1/embeddings`** | *les embeddings* |
| **`/v1/models`** | *la liste* |
| **`/v1/audio/transcriptions`** *(+ `#stream`)* | *la parole → texte* |
| **`/v1/audio/speech`** · **`/v1/audio/voices`** | *texte → parole, et les voix* |
| **`/v1/ocr`** · **`/v1/fim/completions`** | *l'OCR, le remplissage de code* |
| **`/v1/libraries`** *(+ `/documents`)* | *les bibliothèques — **le RAG Mistral*** |
| **`/v1/fine_tuning/models`** · **`/v1/files`** · **`/v1/batch/jobs`** | *l'entraînement* |
| **`/v2/skills`** · **`/v2/prompts`** | *les skills et les prompts versionnés* |

**Modèles relevés DANS la spec** *(pas de mémoire)* :
`mistral-small-latest` · `mistral-medium-latest` · `mistral-large-latest` · ⭐ **`mistral-embed`** ·
`codestral-latest` · `voxtral-mini-latest` · `mistral-ocr-2503-completion` · `mistral-moderation-latest`.

⭐ **Et `/v1/chat/completions` étant le chemin OpenAI standard, `api: openai-completions` convient** —
*exactement la forme du bloc `openrouter` déjà présent dans le fichier.*

---

## 2. Le bloc — à coller dans `llm-pi-ai.providers`, à côté de `anthropic` et `openrouter`

```yaml
      # ── Mistral (editeur francais, UE) — api openai-completions
      # Base URL et chemins VERIFIES sur la spec OpenAPI officielle, 19/09/2026.
      # ⚠️ CE BLOC FAIT SORTIR LA DONNEE. Ne pas l'activer par defaut sans decision.
      mistral:
        api: openai-completions
        baseURL: https://api.mistral.ai/v1
        apiKeyEnv: MISTRAL_API_KEY
        displayName: Mistral (editeur francais)
        models:
          - id: mistral-small-latest
            input: [ text ]
          - id: mistral-medium-latest
            input: [ text, image ]
          - id: mistral-large-latest
            input: [ text, image ]
          - id: mistral-embed
          - id: codestral-latest
          - id: voxtral-mini-latest
```

⚠️ **DEUX CHOSES QUE JE N'ÉCRIS PAS EN CERTAIN :**
- **`input: [ text, image ]` sur `medium` et `large`** — *je l'ai déduit de la gamme, **la spec ne le
  déclare pas par modèle**. **À confirmer au premier appel**, et à retirer si le harnais proteste.*
- **Le suffixe `-latest` plutôt qu'une date** *(`codestral-2508`, `mistral-moderation-2411` existent
  aussi).* ⭐ **`-latest` suit les mises à jour ; une date fige.** *C'est un choix, pas une évidence.*

---

## 3. ⛔ LA CLÉ — comment la placer SANS jamais la taper dans une commande

> ⛔ **CORRECTION DU 20/09/2026 — LE CHEMIN ÉTAIT FAUX, ET IL ÉTAIT FAUX PAR MA FAUTE.**
> *Ce document écrivait `AKADIA Studio Retro` — **sans le R** — parce que j'avais recopié le chemin
> **du message de Gaëtan** au lieu de le **lire du disque**. `Desktop\AKADIA Studio Retro\` était
> **un dossier que mon propre `write` avait créé à 15 h 03**, à côté du vrai. Il a depuis été retiré,
> et **le vrai dossier est `ARKADIA Studio Retro`**. *Le fait est déjà au registre :
> `vault-agence/registre-echecs-agents.md`, ligne 8566.* ⚠️ **C'est exactement le piège que la fiche
> `refs/methodes.md` §7 décrit : un nom de fichier ou de dossier ne se recopie jamais à la main —
> il vient du disque.**

**Le fichier `ARKADIA Studio Retro\.env` contient déjà `MISTRAL_API_KEY`.** *Voici les trois voies,
de la meilleure à la pire.*

### ✅ Voie 1 — par l'interface du harnais *(la voie documentée)*

```
Settings  →  Modèles / Fournisseurs  →  Mistral  →  coller la clé
```

⭐ **C'est la voie que `settings.yaml` décrit lui-même, en commentaire de ses autres fournisseurs** :
*« Clé : ANTHROPIC_API_KEY (à renseigner dans **Settings → Modèles/Fournisseurs**, ou via la
variable d'environnement du même nom au lancement de dsh web). »*
**Elle ne passe par aucune ligne de commande, donc elle ne laisse aucune trace.**

### ✅ Voie 2 — par la variable d'environnement, au lancement

```powershell
$env:MISTRAL_API_KEY = (Get-Content "$env:USERPROFILE\Desktop\ARKADIA Studio Retro\.env" |
  Where-Object { $_ -match '^MISTRAL_API_KEY=' }) -replace '^MISTRAL_API_KEY=',''
```

⭐ **La clé est lue du fichier **dans la session** et posée en variable — elle n'apparaît dans aucune
commande, et aucune sortie ne l'affiche.** ⚠️ *Elle ne vit que le temps de cette fenêtre.*

### ⛔ Voie 3 — `--api-key` sur la ligne de commande. **À NE PAS FAIRE.**

⚠️ **Elle a été rencontrée aujourd'hui** : *le CLI `mistralai-workflows-cli` **réclame**
`--api-key TEXT`.* **Ce que ça produit :**
- *la clé dans l'**historique PowerShell** ;*
- *la clé dans la **sortie** si la commande échoue ;*
- ⚠️ **et la clé dans le **journal de session du harnais** — c'est-à-dire lisible après coup.*

⭐ **C'est pour ça que le `setup` a été lancé SANS la clé** — *il a répondu `Aborted!` et n'a rien
créé, **ce qui est le bon comportement**.*

---

## 4. ⚠️ Et ce qui décide vraiment, ce n'est pas la configuration

**Même si le bloc est collé et la clé posée, rien ne change tant que `agent-default-model` reste
sur `deepseek-official`.** ⭐ **Le bloc ouvre une route ; il ne la prend pas.**

**Et le choix entre les deux routes n'est pas technique :**

| | **`bascule-locale-ministral`** | **ce bloc `mistral`** |
|---|---|---|
| **La donnée sort ?** | ⛔ **non** | ⚠️ **oui, vers l'UE** |
| **« 0 % cloud » (le site)** | ✅ **reste vrai** | ⛔ **devient faux** |
| **Coût** | **0 €** | *au jeton* |
| **Puissance** | ⚠️ *un 8B* | **la meilleure** |
| **Ce qu'il débloque** | *rien de neuf — **il utilise ce qui existe*** | ⭐ *l'OCR, la parole en temps réel, les `libraries`, le fine-tuning* |

> ⭐ **Ce qui est écrit sur le site du studio, aujourd'hui** : *« tout le calcul d'IA tourne sur notre
> propre machine : **aucune donnée client ne sort**. »*
> ⛔ **Activer ce bloc rend cette phrase fausse.** *Elle devra dire autre chose — et **ce n'est pas
> un détail de rédaction, c'est la phrase qui vend.***

---

## 5. Ce que ce fichier n'établit pas

- ⛔ **Rien n'a été collé dans `settings.yaml`, aucune clé déplacée, aucun appel vers
  `api.mistral.ai`.** *Zéro.*
- **Je n'ai pas lu les tarifs, les quotas, ni la rétention.** *La spec OpenAPI ne les porte pas.*
- ⚠️ **La licence de `mistralai-workflows-cli` est VIDE sur PyPI** *(champ `license` vide, pas de
  page projet déclarée)*. *C'est un CLI Mistral, mais **je ne l'affirme pas : je constate le champ
  vide**.*
- **Je ne sais pas si le harnais sait router selon la tâche** — *local pour le simple, distant pour
  le lourd.* ⭐ *Si ça existe, **c'est la réponse aux trois options**, et je ne l'ai pas trouvée.*
- ⚠️ **Et un fait à ne pas oublier** : *le RAG du studio échoue aujourd'hui pour **deux pannes** —
  l'indexeur vise `63596` au lieu de `11434`, et il appelle `/tokenize` qui **renvoie 404** sur
  Ollama 0.34.1.* **`/v1/embeddings` avec `mistral-embed` corrigerait la seconde** — ⚠️ **en faisant
  sortir tout le corpus.** *Les deux termes du choix, encore.*

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Source unique et vérifiable :
[`docs.mistral.ai/openapi.yaml`](https://docs.mistral.ai/openapi.yaml) — 1 100 161 o, OpenAPI 3.1.0,
téléchargée le 19/09/2026 à 14 h 43. Plus : `~/.dsh/settings.yaml` **lu**, `AKADIA Studio Retro\.env`
*(nom de clé seul, valeur jamais affichée)*, et le comportement observé de `mistralai-workflows-cli`
v1.2.3.*
