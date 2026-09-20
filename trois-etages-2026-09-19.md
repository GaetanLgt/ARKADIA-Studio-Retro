# Mistral, c'est trois choses — et une seule est déjà chez toi

> **GL Digital Lab · 19/09/2026 · dossier `AKADIA Studio Retro`.** *Le menu de la console Mistral
> que Gaëtan a collé porte une ligne décisive : **« Déployer les modèles — Téléchargez les modèles
> et déployez-les localement. »***
>
> ⭐ **Elle réconcilie ce qui semblait contradictoire depuis deux heures** : *« enrichir le modèle
> français » et « aucune donnée ne sort » **ne s'excluent pas** — à condition de savoir **de quel
> Mistral on parle**.*

---

## 1. Les trois étages — et ils ne se mélangent pas

| | **① Les modèles open-weight** | **② Les modèles commerciaux** | **③ Les fonctions managées** |
|---|---|---|---|
| **Exemples** | *Mistral Small, Devstral, Ministral* — *licence Apache 2.0* | *Mistral Large, Medium* | ***Agents, OCR, `libraries` (RAG), Workflows*** |
| **Où ça tourne** | ⭐ **CHEZ TOI** — *téléchargé, servi par `llama.cpp`* | ⚠️ **chez Mistral** | ⚠️ **chez Mistral** |
| **La donnée sort-elle ?** | ⛔ **non** | ⚠️ **oui** | ⚠️ **oui** |
| **« 0 % cloud »** | ✅ **vrai** | ⛔ faux | ⛔ faux |
| **Coût** | **0 €** *(électricité)* | *au jeton* | *au jeton* |
| **Puissance** | ⚠️ **moindre** | **la meilleure** | *—* |
| **Comment y accéder** | *Hugging Face → GGUF → `llama-server.exe`* | `/v1/chat/completions` | `/v1/libraries` · `/v1/ocr` · `/v2/skills` |

> ⚠️ **C'est le piège du dossier, et il est écrit noir sur blanc dans ton menu :** *« Téléchargez les
> modèles et **déployez-les localement** » — **c'est l'étage ①.*** **Les étages ② et ③ n'ont PAS de
> version locale.** *Un agent Mistral, un OCR Mistral, une bibliothèque Mistral — **ça n'existe
> qu'en ligne.***

---

## 2. ⭐ ET LE STUDIO A DÉJÀ L'ÉTAGE ① — il l'a depuis le 13/09

**`ollama list`, relevé le 19/09/2026 :**

```
ministral-3:8b            5,61 Go    <- UN MODELE MISTRAL, EN LOCAL
bge-m3:latest             1,08 Go    <- un modele d'embedding
nomic-embed-text:latest   0,26 Go    <- celui que l'indexeur attend
qwen3.5:9b                6,14 Go
minicpm-v:8b              5,10 Go
qwen2.5vl:7b              5,56 Go
deepseek-r1:8b            4,87 Go
neural-chat:7b            3,83 Go
qwen2.5-coder:3b-base     1,80 Go
```

⭐ **Et `ministral-3:8b` n'est pas un modèle quelconque** — *c'est **Ministral**, la gamme de bord de
Mistral.* **Déjà mesuré** *(13/09)* : **5,68 Go sur le GPU · 85 jetons/s · 5/5 appels d'outil corrects
· et il lit les images.**

> ⭐⭐ **Donc la réponse à « on va faire bosser le modèle français » n'est pas « il faut le
> télécharger » : IL EST LÀ. Il tourne, il répond, il appelle des outils, et il ne fait sortir
> aucune donnée.**
>
> ⚠️ **Ce qui manque n'est pas le modèle — c'est la route.** *`settings.yaml` ne porte aucun bloc
> `mistral`, et Ollama est déclaré mais **pas utilisé comme défaut** (le défaut est
> `deepseek-official`).*

---

## 3. Ce qui va dans `AKADIA Studio Retro\` — et ce qui n'y va PAS

### ✅ Ce qui y va

| Fichier | Pourquoi |
|---|---|
| **`llm-mistral.yml`** | *le bloc `providers:` à coller dans `settings.yaml`* — *étage ②, pour l'API* |
| **`llm-local.yml`** | *la bascule vers `ministral-3:8b` via Ollama* — *étage ①, **rien ne sort*** |
| **`mistral-openapi.yaml`** | *la spec complète — **à copier depuis `Arcadior rétro Studio\`*** |
| **`trois-etages-2026-09-19.md`** | *ce document* |

### ⛔ Ce qui n'y va PAS

- ⛔ **La clé en clair dans un fichier versionné.** *Le `.env` est là, **et c'est le bon endroit pour
  un `.env`** — à condition qu'il ne soit **jamais** dans un dépôt.* ⚠️ **Et « AKADIA Studio Retro »
  n'est sous aucun `git` : ✅ bon point, rien ne peut fuir par un `git add`.**
- ⚠️ **La clé dans `~/.dsh/.credentials.yaml`** — *c'est l'emplacement que le harnais lit, **mais y
  écrire demande une action de configuration** : *la voie documentée par le harnais est
  **Settings → Modèles/Fournisseurs**, où **Gaëtan la colle lui-même**.*
- ⛔ **Les 52,8 Go de vidéo et les 1 968 Mo de jeu.** *Ils ne « s'enrichissent » pas : **ils
  s'indexent.***

---

## 4. ⚠️ Et une correction de nom, qui n'est pas cosmétique

**Deux dossiers existent sur le Bureau, et leurs noms se ressemblent :**

```
Desktop\Arcadior rétro Studio\     <- cree par Trinity (19/09 14:42)  · 4 fichiers, 1,1 Mo
   connecteur-mistral · mistral-openapi.yaml · TRANSFERT-vers-session-Claude · enrichir-le-modele

Desktop\AKADIA Studio Retro\       <- cree par Gaëtan (19/09 14:56)   · .env seulement (49 o)
   .env  ->  MISTRAL_API_KEY
```

⚠️ **Et un troisième nom existe encore** : *`jeux/arkadia-retro-studio/` dans le dépôt — **le dossier
de packaging du produit** (§4 bis du transfert).*

⭐ **Trois noms pour trois choses différentes :**
- **`Arcadior rétro Studio`** → *les documents de préparation du transfert*
- **`AKADIA Studio Retro`** → *l'installation, avec la clé*
- **`jeux/arkadia-retro-studio`** → *le manifeste de packaging du **produit***

⚠️ **`Arkadia`, `Arcadior`, `AKADIA` — les trois orthographes coexistent, et aucune n'est tranchée.**
*C'est le même sujet que le §0-① du transfert : **le nom est une décision, et elle n'est pas
prise.***

---

## 5. Ce que ce document n'établit pas

- ⛔ **Rien n'a été installé, aucune clé déplacée, aucun appel émis vers `api.mistral.ai`.** *Ce
  document dit **où chaque chose va**.*
- ⚠️ **Je n'ai pas vérifié si `ministral-3:8b` est bien la version open-weight sous Apache 2.0.**
  *« Ministral » est une gamme Mistral, et **la gamme contient des modèles au statut différent**.*
  **À vérifier sur la fiche du modèle, pas sur son nom.**
- **Les faits sur `ministral-3:8b`** *(5,68 Go, 85 j/t/s, 5/5 outils, vision)* **datent du 13/09** —
  *six jours.* ⭐ **Ils sont **repris**, pas remesurés** : *la mesure qui les a produits vit dans
  `modeles/`.*
- **Je n'ai pas lu les conditions des modèles open-weight Mistral** — *ni ce que la licence Apache
  2.0 autorise pour un usage commercial, ni s'il existe des conditions additionnelles.* ⚠️ **Or le
  studio facture : c'est exactement le genre de point qui se lit avant, pas après.**
- ⛔ **Et je ne tranche pas « local ou distant ».** *Les deux étages existent, **ils ne font pas la
  même chose**, et le choix appartient à Gaëtan.*

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Sources : le menu de la console Mistral
collé par Gaëtan le 19/09 · `docs.mistral.ai/openapi.yaml` (chemins vérifiés) · `ollama list`
relevé le 19/09 · `modeles/` pour la mesure du 13/09 · `AGENTS.md` §6.*
