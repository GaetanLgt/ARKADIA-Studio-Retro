# Où est passé le corpus — le carnet Metroid est retrouvé, et il tient à un seul fichier

> **GL Digital Lab · 20/09/2026, 03 h 40 · EVA-01 · preset `metroid`.**
> *Suite de `noyau-identite-machine-eva01-2026-09-20.md`. Le carnet ne répondait plus (**401**).
> J'ai cherché **pourquoi**, puis **si le corpus était encore là**.*
>
> ⭐ **Réponse : le corpus est intact — mais il vit dans UN fichier, hors du RAG.**

---

## 1. ⛔ Première conclusion, et elle est fausse toute seule : « le RAG est en panne »

**Ce que j'avais mesuré** : `401` sur `/api/v1/knowledge/` **et** sur `/api/v1/retrieval/query/collection`.
**Ce que ça ne disait pas** : *si le corpus était encore derrière la porte.*

> ⚠️ **Un `401` ne dit rien du contenu qu'il protège.** *C'est la même famille que « un `completed`
> sans fichier n'est pas un succès » : **le refus d'accès et l'absence de données sont deux pannes
> différentes**, et la seconde est la seule qui coûte.*

**Elles sont bien deux, et voici la première.**

---

## 2. La première panne : un jeton périmé — et elle se répare en une ligne

**Chaîne mesurée, de bout en bout :**

| Maillon | Fichier / mesure |
|---|---|
| Le serveur MCP lit | `C:\IA\gl-digital-lab\mcp-rag-agence.mjs` ligne 30 → `CONFIG.rag.token` |
| La configuration lit | `config-pile.js` ligne 53 : `process.env.RAG_TOKEN`, **sinon** le fichier `.rag-token` |
| Le fichier existe | `C:\IA\gl-digital-lab\.rag-token` — **35 caractères**, préfixe `sk-`, **modifié le 09/09/2026 à 01 h 53** |
| La variable d'env | `RAG_TOKEN` **non définie** dans cette session |
| Ce que la base contient | table `api_key` : **1 ligne**, longueur **35**, préfixe `sk-`, **utilisateur existant** |

**Et la comparaison qui tranche — par empreinte, valeurs jamais affichées :**

```
empreinte clé en base   : 56b19e6eaf48530b571485e7e362a3a216db488fc322de6a109b5788c2bdbfdd
empreinte clé fichier   : d13449970a539fc536b4dd18cd10bab8d575dfba3b819474b393c8865eaea623
```

⛔ **Elles diffèrent.** *Le fichier porte une clé **qui n'existe plus** dans l'instance.
⚠️ **Et la longueur + le préfixe identiques rendent la comparaison « à l'œil » inutile :
toutes les clés Open WebUI font `sk-` + 32 caractères. C'est l'empreinte qui prouve, pas l'aspect.**

✅ **Donc la réparation est connue et locale : la clé valide est dans la base vivante — elle n'est pas
à chercher ailleurs.** *Elle demande une écriture dans le `.rag-token` de `gl-digital-lab` :
**c'est une clé, donc un geste de Gaëtan**, même quand la voie est tracée.*

---

## 3. ⭐⭐ La seconde panne, et c'est la vraie : le carnet a quitté l'instance vivante

**Relevé dans le conteneur `open-webui`, en lecture seule, le 20/09/2026 :**

| Instance **vivante** (`/app/backend/data/webui.db`, 3,35 Go) | |
|---|---|
| Collections (`knowledge`) | **2** — `Agence` et `Arakadia France 2030 ` *(espace final compris)* |
| Fichiers (`file`) | **495** |
| Documents (`document`) | **0** |
| Fichiers dont le nom contient « metroid » | **6** — *soit **2 vidéos** (une rétrospective Fusion/Zero Mission, une trilogie Prime) **dupliquées trois fois chacune*** |

⛔ **Le carnet `8ffe9d4d-928a-4d43-b6be-6a5a612638f1` N'EXISTE PAS dans l'instance vivante.**
**Ni `Vault-GL-Digital-Lab` (782 fichiers au 18/09), ni `Vault-ARKADIA` (45).**

**Et les horodatages disent quand :** *dossier de données `19 Sep 23:17` · magasin vectoriel
`19 Sep 23:29` · `webui.db` `20 Sep 00:02`.* ⭐ **L'instance a été reconstruite cette nuit.**

**Le magasin vectoriel vivant, en entier :**

```
/app/backend/data/vector_db/   ->  1 dossier (83c4f9d5-…, 23:29)  +  chroma.sqlite3 de 188 416 o
```

**188 kilooctets.** *Le corpus entier tenait dans 2,25 Go (§4).*

---

## 4. ⭐⭐⭐ Et le corpus est là — mesuré, pas espéré

**Trouvé sur le disque, hors de Docker :**

```
C:\IA\gl-digital-lab\_sauvegardes\rag-purge\chroma-avant-purge-20260917-145340.sqlite3
   2 249 035 776 o (2,25 Go)   ·   modifié le 17/09/2026 à 12:17
```

**Ce que la sauvegarde contient, mesuré à l'instant :**

| Collection | Chunks |
|---|---|
| ⭐ **`8ffe9d4d-928a-4d43-b6be-6a5a612638f1`** — **mon carnet** | **2 316** |
| `Vault-ARKADIA` | 8 870 |
| **Total des collections** | **4 199** |
| dont `file-<uuid>` | **4 193** |
| **Total des embeddings** | **206 328** |

⭐ **Le carnet Metroid est intact : 2 316 chunks.** *Le relevé du 14/09 en portait 1 356, et le carnet
a grossi jusqu'au 18/09 — **2 316 est cohérent avec cette croissance**, pas avec une collection vide.*

> ⛔ **CECI EST LA SEULE COPIE CONNUE DE LA MÉMOIRE VECTORIELLE DU STUDIO.** *L'instance vivante n'en
> porte plus rien, et je n'ai trouvé **aucun autre** volume Docker, aucune autre sauvegarde Chroma.*
> **Un fichier de 2,25 Go, dans un sous-dossier de sauvegarde, sans vérification automatique.**

---

## 5. La voie de retour — elle est tracée, et elle n'est PAS à moi de l'exécuter

**Ce qu'il faudrait faire, dans l'ordre :**

1. **Ne pas toucher au fichier de sauvegarde.** *Il est la source. On travaille sur une copie.*
2. **Prouver la copie** : rejouer les comptages du §4 sur la copie, et exiger **2 316** pour le carnet.
   ⚠️ **Un chiffre qui tombe juste est le seul reçu acceptable** — *« la copie est faite » n'en est pas un.*
3. **Réinjecter** la collection dans `vector_db/` de l'instance vivante **et** recréer la ligne
   `knowledge` correspondante dans `webui.db`.
   ⚠️ *Les deux à la fois : **des vecteurs sans ligne de carnet sont des orphelins** — le carnet ne
   serait pas listé, et l'outil répondrait « le corpus ne couvre pas cette question », **c'est-à-dire
   le mensonge par construction déjà documenté.***
4. **Vérifier par la porte d'entrée**, pas par le fichier : `rag_rechercher` avec l'identifiant,
   et **une question dont je connais la réponse**.
   ⛔ **Un carnet « restauré » qui ne rend rien est pire qu'un carnet absent : il fait croire que la
   mémoire est revenue.**

> ⛔ **Je ne le fais pas ce soir.** *Écrire dans le magasin vectoriel d'un service vivant qui sert
> **deux** collections à l'agence, c'est une action sur un service partagé, et **la doctrine du
> studio est « audit d'abord »** — l'audit est fait, **la décision est à Gaëtan**.*

---

## 6. Le reste de ce que j'ai trouvé en cherchant — et qui n'est pas rien

| Trouvaille | Mesure |
|---|---|
| **8 copies de `webui.db`** dans `C:\Users\neosp\Downloads` | **3 346 415 616 o chacune**, datées **20/09 00 h 39 → 01 h 27** — *soit **~26,8 Go*** |
| `uploads/d3059ace-…_webui(5).db` **dans** le conteneur | 3,35 Go — mesurée : **0 collection, 402 fichiers** |
| `uploads/35cb22cd-…_samus_scan.py.bak` | ⭐ *un fichier nommé **samus** — et il est **dans les uploads**, donc il a été ingéré* |
| `C:\IA\gl-digital-lab\.env` | porte **13** variables, dont `OPENROUTER_API_KEY` et `O2SWITCH_TOKEN` — **et aucun jeton Open WebUI** |
| `8099` (`llama-server`) | **n'écoute pas** |

⚠️ **Les 8 copies de `Downloads` n'ont pas pu être ouvertes depuis le conteneur (`unable to open
database file`) — le montage de `C:\Users\neosp\Downloads` n'a pas pris.**
**Elles ne sont donc PAS mesurées.** *Vu leurs tailles identiques et leurs dates, ce sont
vraisemblablement des copies de la base **déjà reconstruite** — mais **je ne l'affirme pas : je ne les
ai pas ouvertes.*** **Et 26,8 Go de doublons dans `Downloads` méritent une décision, pas un silence.**

---

## 7. Ce que ce document n'établit pas

- ⛔ **Je n'ai pas restauré le carnet.** *Mesuré : il est dans la sauvegarde. Non fait : le retour.*
- ⚠️ **Je n'ai pas ouvert les 8 copies de `Downloads`** *(montage Docker en échec)*. **Non mesurées.**
- ⛔ **Je n'ai pas touché au `.rag-token`**, ni à `webui.db`, ni au magasin vectoriel, ni à un conteneur.
  *Toutes mes lectures sont en `mode=ro`.*
- ⚠️ **Je n'établis pas QUI a purgé ni POURQUOI.** *« avant purge » est le nom du dossier ;
  le raisonnement derrière est la doctrine du 14/09 (« on n'efface pas de vecteurs sans décision »),
  **mais je ne l'ai pas lu*** — *c'est une hypothèse, pas une source.*
- ⚠️ **Je ne sais pas si les 4 193 collections `file-<uuid>` doivent revenir.** *Le §7 de ma fiche
  `fonds-metroid.md` les décrit comme **orphelines**, et leur retour est un choix, pas une évidence.*
- ✅ **Et une bonne nouvelle, mesurée celle-là** : **les documents SOURCES sont intacts.** *Le vault
  Metroid est sur le disque (OneDrive), les fiches, les transcriptions et la R&D sont dans le dépôt.
  **Même sans les vecteurs, le fonds n'est pas perdu — il est à réingérer.***

---

*GL Digital Lab · 20/09/2026 · Trinity, preset `metroid`. Mesures, toutes faites ce soir en lecture
seule : `rag_carnets`, `rag_rechercher` (**401**) · `mcp-rag-agence.mjs` et `config-pile.js` **lus** ·
`.rag-token` (présence, taille, date, **empreinte**) · `.env` de `gl-digital-lab` (**noms de variables
seuls**) · `docker ps|port|inspect`, `docker volume ls` · `webui.db` et la sauvegarde Chroma **ouverts
en `mode=ro`**, `pragma page_count|freelist_count` · `Get-FileHash`/SHA-256 · `ollama list` ·
`Get-NetTCPConnection`.*
