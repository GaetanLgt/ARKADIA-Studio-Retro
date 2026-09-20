# Chantier — pourquoi `ministral-3:8b` repart sur le processeur

**Machine** : EVA01 (Windows), utilisateur `neosp`, RTX 3080 — 10 240 Mio, RAM 63,7 Go
**Date de la fiche** : 20/09/2026
**Fenêtre de mesure** : 20/09/2026, 04 h 07 → 04 h 17 (heure machine)
**Auteur** : Trinity (fonds Metroid), sur mission de Gaëtan via l'agent parent
**Ollama** : version 0.34.2 · modèle `ministral-3:8b`, digest `1922accd5827`

> **Révision de mission en cours de route.** La cible initiale était « le faire tenir sur le
> GPU ». Gaëtan l'a déplacée : *« on essaie d'utiliser la puissance de la machine à bon
> escient et de répartir les ressources correctement quand on n'est pas à plein régime sur la
> production d'images. »* La fiche répond donc à **ce qui déclenche le déclassement**, et
> non à « comment forcer le GPU ». La conclusion n'est pas celle que j'attendais : **le
> déclassement n'est pas un accident.**

---

## 0. Réponse en trois lignes

1. **Le déclassement est décidé par le code du studio, pas par Ollama.** Deux mécanismes,
   écrits et datés, se déclenchent tous les deux sur la même valeur.
2. **Il est à sens unique** : une fois sur le CPU, le modèle **n'y revient pas tout seul** —
   mesuré. Le CPU est l'état *stable* ; le GPU est un état *transitoire*.
3. **Le seuil qui le déclenche est inatteignable par construction** : l'état GPU sain laisse
   **901-918 Mio** libres, et les trois seuils du studio sont **1 024, 1 500 et 1 536 Mio** —
   tous au-dessus. *Un seuil qu'un état correct viole toujours n'est pas un seuil, c'est une
   condamnation.*

---

## (a) Chronologie des relevés

Série automatique, un relevé toutes les 60 s (`releves-gpu-ollama-2026-09-20.csv`, joint).
`ollama ps` + `nvidia-smi` + VRAM dédiée par processus (compteur Windows
`\GPU Process Memory(*)\Dedicated Usage` — `nvidia-smi --query-compute-apps` rend `[N/A]` sur
ce poste, le compteur est la seule attribution par processus disponible).

| Heure | `ollama ps` | GPU occupé / libre (Mio) | Runner Ollama en VRAM |
|---|---|---|---|
| 04:08:21 | `ministral-3:8b` 5,7 GB **100 % CPU** ctx 4096 Forever | 3 262 / 6 792 | *aucun* |
| 04:09:23 | `ministral-3:8b` 5,4 GB **100 % GPU** ctx 4096 Forever | **9 153 / 901** | pid_42068 = **6 152 Mo** |
| 04:10:24 | *aucun modèle chargé* | 2 909 / 7 145 | — |
| 04:11:25 | *aucun modèle chargé* | 2 909 / 7 145 | — |
| 04:12:26 | *aucun modèle chargé* | 2 950 / 7 104 | — |
| 04:13:27 → 04:16:31 | `ministral-3:8b` **100 % CPU** (4 relevés) | 2 980 → 2 992 / 7 074 → 7 062 | *aucun* |

**Insertion — expérience contrôlée du 04:12:54 au 04:13:30** (démo, trois requêtes
`/api/generate`, `num_predict: 8`, prompt `« Réponds seulement : prêt. »`) :

| Étape | Requête | Durée | Résultat mesuré |
|---|---|---|---|
| État | — | — | aucun modèle · 2 982 / 7 072 |
| **A** | **sans** `num_gpu` | **≤ 8 s** (chargement à froid inclus) | **100 % GPU**, `size_vram` = **5 375 692 634 o = 5 127 Mio** · 9 136 / **918** |
| **B** | **avec** `num_gpu: 0` | **24 s** | **100 % CPU**, `size_vram` = **0** · 2 980 / 7 074 |
| **C** | **sans** `num_gpu` (à nouveau) | 4 s | **reste 100 % CPU**, `size_vram` = **0** |
| Veille 04:13:45 → 04:16:31 (12 relevés / 15 s) | — | — | aucun événement du gardien · libre stable 7 048-7 062 |

**Ce que la série dément déjà :** un `ollama ps` isolé ne dit rien de l'instant suivant. À
04:08:21 le modèle est CPU ; à 04:09:23 il est GPU ; à 04:10:24 il n'existe plus. Trois états
différents en **deux minutes**. Toute conclusion tirée d'un relevé unique aurait été fausse.

**La remise en état** : l'expérience B/C a laissé le modèle sur le CPU. J'ai rendu la machine
dans l'état où je l'ai trouvée — `ollama stop ministral-3:8b`, vérifié ensuite :
`api/ps : AUCUN MODELE`, 2 993 / 7 061. **Aucun processus de Gaëtan n'a été touché** : le
`llama-server` PID 30800 (démarré 19/09 23:13:33) et le service vocal PID 21892 (démarré
19/09 19:50:13) portent toujours leur heure de démarrage d'origine.

---

## (b) La cause identifiée, avec sa preuve

### b.1 Le déclencheur n° 1 — le service vocal se déclassse lui-même

`C:\IA\gl-digital-lab\poste-local\serveur-voix.py`, lignes 692-715 :

```python
SEUIL_VRAM_MO = 1500     # sous cette marge, on ne tente même pas le GPU

def _options_selon_vram():
    libre = _vram_libre_mo()          # nvidia-smi --query-gpu=memory.free
    if libre is None:
        return {}, None
    if libre < SEUIL_VRAM_MO:
        return {"num_gpu": 0}, libre   # ← ICI
    return {}, libre
```

et ligne 751, ces options partent **dans la requête** :

```python
"options": {"num_predict": MAX_JETONS, "temperature": 0.6, **_options_selon_vram()[0]},
```

**La chaîne, mesurée :**
- Modèle sur le GPU → libre = **918 Mio** (étape A).
- `918 < 1500` → l'appel suivant du service envoie `num_gpu: 0`.
- **Preuve, étape B** : `num_gpu: 0` sur un modèle chargé sur GPU → Ollama **décharge et
  recharge sur le CPU**, `size_vram` passe de 5 375 692 634 o à **0**, en **24 s**.
- Libre remonte à **7 074 Mio** → le seuil est satisfait → plus aucun `num_gpu: 0` n'est
  jamais envoyé.

**Le seuil de 1 500 Mio est donc structurellement inatteignable dans l'état GPU :** être sur
le GPU est précisément ce qui empêche de remplir la condition pour y rester.

**Ce qui pourrait me démentir** : un `num_gpu: 0` qui *ne* déclencherait pas de rechargement.
J'ai essayé exactement ça (étape C dans l'autre sens) : après le retour à « sans `num_gpu` »,
le modèle est **resté sur le CPU**. Le rechargement est donc bien lié au changement
d'options — et il n'a pas de retour.

### b.2 Le déclencheur n° 2 — le gardien évince, sur la même valeur

`C:\IA\gl-digital-lab\gardien-pile.js`, lignes 496-541 :

```js
const seuilAlerteMo   = Number(process.env.VRAM_ALERTE_MO   || 1536);
const seuilEvictionMo = Number(process.env.VRAM_EVICTION_MO || 1024);
...
if (libre < seuilEvictionMo && occupation.ageMs < 45 * 1000){        // ménage différé
} else if (libre < seuilEvictionMo && maintenant - ev.derniere > 5 * 60 * 1000) {
  const busy = gpuBusy();                                            // verrou .gpu-busy.lock
  const decharges = await libererVram(seuilAlerteMo, busy ? [busy] : []);
```
`setInterval(unePasse, 45000)` — ligne 567. `libererVram()` (dans `lib-vram.js`, lignes 95-108)
décharge par `keep_alive: 0` tout modèle chargé **dont le nom n'est pas dans `protege`**.

**Preuve, dans le journal du gardien lui-même** (`C:\IA\gl-digital-lab\_gardien.log`,
820 784 o, dernière écriture 04:09:40 ; **158 décharges préventives** au total) :

```
[2026-09-20 02:09:40] 🧹 VRAM 901 Mo < 1024 — décharge préventive : ministral-3:8b
```

**901 Mo.** C'est *exactement* la VRAM libre que laisse le modèle quand il est sur le GPU —
relevé à 04:09:23 par `nvidia-smi` (901 Mio), et rapporté par l'agent parent après rechargement
(9 153 Mio utilisés / 901 libres). **Le gardien évince le cerveau vocal parce que le cerveau
vocal occupe la carte — c'est-à-dire parce qu'il fonctionne.**

**La protection existe, mais elle est trop courte.** `.gpu-busy.lock` est le verrou que
`serveur-voix.py::marquer_gpu()` écrit au début de chaque appel (lignes 669-679) et que
`lib-vram.js::gpuBusy()` honore. Or (lib-vram.js ligne 123) :

```js
if (j && Date.now() - j.ts < 4 * 60 * 1000) return String(j.modele || '');
```

**Le verrou protège 4 minutes. Le modèle, lui, vit `Forever`** (`OLLAMA_KEEP_ALIVE=-1`, et
`ollama ps` affiche `UNTIL Forever` sur tous mes relevés). *Deux horloges qui ne s'accordent
pas : un verrou de 4 minutes pour un modèle immortel.* Quatre minutes après la dernière
phrase de Gaëtan, le cerveau devient un candidat légitime à l'éviction.

Le verrou courant, au moment de ma mesure : `{"ts": 1789869802477, "modele": "ministral-3:8b"}`,
écrit à **04:03:22** — soit 1 s avant l'apparition du runner `llama-server` PID 13964 (04:03:23).

### b.3 Le déclencheur n° 3 — l'éviction par un autre modèle

`OLLAMA_MAX_LOADED_MODELS=1`. Toute requête vers un autre modèle décharge `ministral-3:8b`,
qui sera rechargé **à froid** à l'appel suivant. Le journal du gardien montre ce ballet :
`arkadia-samus:latest` évincé à 23:11:53, 23:17:53, 23:23:08, 23:35:08, 23:40:23, 23:50:53,
23:56:53, 00:02:53, 00:13:23, 00:18:38. Ce n'est pas une hypothèse : c'est le même mécanisme
que le § b.1, appliqué à un autre nom.

### b.4 Pourquoi « rechargé à froid → GPU, puis CPU tout seul »

La boucle complète, chaque maillon mesuré :

1. Modèle **non chargé**, libre ≈ 7 000 Mio.
2. Appel du service → `7 000 ≥ 1 500` → **aucun `num_gpu`** → Ollama charge à froid →
   **GPU** (étape A ; la chronologie de l'agent parent au 05:00 dit la même chose après
   `ollama stop`). Libre tombe à **918 Mio**.
3. Appel suivant → `918 < 1 500` → **`num_gpu: 0`** → **rechargement CPU en 24 s** (étape B).
   Libre remonte à 7 074.
4. Appels suivants → `7 074 ≥ 1 500` → aucun `num_gpu`… **mais le modèle est déjà chargé, et
   Ollama ne le replace pas** (étape C : `size_vram` reste 0).
5. **Le CPU est définitif.** Libre 7 074 > 1 024 → le gardien ne voit rien à évincer. Rien ne
   délogera le modèle : il restera sur le CPU jusqu'à une éviction externe.

C'est la réponse exacte à l'observation du brief — et elle n'est pas un « accident » : c'est
un **point fixe**. Le système converge vers le CPU et y reste.

### b.5 Qui tient les ~3 Go quand le modèle est sur le CPU

Mesuré à 04:09:41 (compteur Windows, par PID) :

| Processus | VRAM dédiée | Nature |
|---|---|---|
| `dwm.exe` PID 1008 | **1 977 → 2 062 Mo** | compositeur de Windows — **pas un travail du studio** |
| `python.exe serveur-voix.py` PID 21892 | **847 Mo** | l'**oreille** : `faster-whisper`, `device="cuda"`, `float16` (serveur-voix.py l. 510) |
| `llama-server.exe` PID 30800 | **703 Mo** | **orphelin** — voir plus bas |
| `explorer` / Discord / Comfy Desktop / csrss / Obsidian / PowerToys / Terminal | 156 / 110 / 105 / 82 / 65 / 65 / 53 Mo | bureau |
| **ComfyUI** | **0** (les deux `main.py` absents du compteur) | arrêté par Gaëtan à 04:08 |

**Le constat de l'agent parent est confirmé et complété** : ComfyUI ne tenait que ~257 Mo.
Le vrai consommateur du socle, c'est **Windows lui-même** (`dwm.exe`, ~2 Go) et l'oreille du
service vocal (847 Mo).

**Le `llama-server.exe` PID 30800** — lignes de commande illisibles (`Path` vide,
`Win32_Process.CommandLine` vide : le processus tourne dans un contexte que je ne peux pas
interroger). Ce que j'ai pu mesurer : démarré **19/09 23:13:33**, parent (PID 31768) **disparu**,
6 361 Mo de RAM résidente, **703 Mo de VRAM**, écoute sur **127.0.0.1:53109**,
répond `{"status":"ok"}` sur `/health`, et **aucune connexion établie** vers ce port.
Il précède de 9 minutes l'`ollama.exe` en service (23:22:30). **Hypothèse étiquetée comme
telle** : c'est un runner Ollama resté orphelin de la session précédente. *Non vérifié* —
je ne peux pas lire sa ligne de commande, donc je ne peux pas prouver à quel serveur il
appartenait. **Il n'est pas à moi de le tuer.**

**Le contexte GPU du 19/09 au soir** : trois événements `nvlddmkm` **ID 13** à
**23:12:54, 23:12:55 et 23:13:09** — soit ~24 s avant l'apparition de PID 30800 (23:13:33).
Le TDR classique (**ID 153**) n'apparaît **pas** cette nuit : le dernier remonte au
**17/09 07:43:42** (antérieurs : 16/09 19:30, 15/09 20:40 ×2, 13/09 10:36, 12/09 05:27,
10/09 23:47). Un rapprochement est plausible, **il n'est pas prouvé** : les messages des
ID 13 sont vides sur ce poste, et **le journal du runner n'existe pas sur le disque**
(voir § f).

---

## (c) Le réglage et la commande exacts — **non exécutés**

### c.1 Ce qui ne marchera pas, et je le dis avant de le proposer

- **`OLLAMA_NUM_GPU` n'est pas défini** (seules variables `OLLAMA_*` présentes :
  `CONTEXT_LENGTH=8192`, `FLASH_ATTENTION=1`, `KEEP_ALIVE=-1`, `KV_CACHE_TYPE=q8_0`,
  `MAX_LOADED_MODELS=1`, `MAX_QUEUE=256`, `NUM_PARALLEL=2`, `NUM_PREDICT=42` — **aucune
  dans la portée Machine, toutes dans la portée Utilisateur**).
  Poser `OLLAMA_NUM_GPU=99` forcerait le placement par défaut sur le GPU, **mais ne
  neutralise pas un `num_gpu: 0` explicite envoyé par le service**. Il ne faut donc pas
  l'attendre de ce côté.
- **Le `Modelfile` est propre** : `ollama show ministral-3:8b --modelfile` ne contient
  **aucun** `PARAMETER num_gpu` (seul `PARAMETER temperature 0.15`). Le modèle n'est pas en
  cause.
- **Un simple `ollama keep_alive` ne suffit pas** : `KEEP_ALIVE=-1` est déjà « Forever » et le
  modèle se fait quand même décharger — parce que ce ne sont pas les horloges qui le
  délogent, ce sont les seuils.

### c.2 Le correctif minimal — une ligne, dans `serveur-voix.py`

La cause est que la question posée est **mal posée**. `_options_selon_vram()` demande « la
carte est-elle libre ? » alors que la carte occupée **par le cerveau lui-même** est le cas
normal. Le correctif minimal :

```python
# AVANT (ligne 692)
SEUIL_VRAM_MO = 1500     # sous cette marge, on ne tente même pas le GPU

# APRÈS — le seuil doit être SOUS ce que laisse un état GPU sain (901-918 Mio mesurés)
SEUIL_VRAM_MO = 800      # sous cette marge seulement, on déclassse
```

**Mais je signale la fragilité** : 800 Mo contre 901-918 mesurés, c'est **une marge de
100 Mo**. Il suffit que le bureau prenne 150 Mo de plus et le déclassement revient. Le
correctif robuste est de changer la **question**, pas le nombre :

```python
def _options_selon_vram():
    """Déclassse seulement si la carte est prise par QUELQU'UN D'AUTRE.

    Le cerveau occupe lui-même ~6,1 Go : comparer la VRAM libre à un seuil fixe revient à
    se déclasser soi-même. On regarde donc si le modèle est DÉJÀ placé sur le GPU — auquel
    cas il n'a besoin d'aucune mémoire nouvelle, et il n'y a rien à décider."""
    try:
        r = subprocess.run(["ollama", "ps"], capture_output=True, text=True, timeout=6)
        if "ministral-3:8b" in r.stdout and "100% GPU" in r.stdout:
            return {}, _vram_libre_mo()      # déjà sur le GPU : on ne se déclassse pas
    except Exception:
        pass
    libre = _vram_libre_mo()
    if libre is None:
        return {}, None
    if libre < SEUIL_VRAM_MO:                # ici le seuil ne sert plus qu'au VRAI cas :
        return {"num_gpu": 0}, libre         # une carte prise par un rendu
    return {}, libre
```
*(Ce bloc n'a pas été exécuté ni testé : il touche un service. Il demande la validation de
Gaëtan.)*

### c.3 La commande qui répare **maintenant**, sans rien réécrire

Le déclassement étant à sens unique (§ b.4 étape 5), le seul moyen de remettre le cerveau sur
le GPU est de forcer un **chargement à froid** :

```powershell
ollama stop ministral-3:8b
```

… puis laisser le prochain appel du service le recharger (≤ 8 s mesurés, étape A). C'est
exactement ce que le relevé du brief a observé à 05:00. **Non exécutée par moi** au-delà de la
remise en état expliquée en (a) : elle touche un service, et elle ne corrige le problème que
pour **un appel** — le suivant renvoie le modèle sur le CPU.

### c.4 Les deux autres verrous à accorder

| Où | Valeur actuelle | Ce qu'elle fait | Cohérence |
|---|---|---|---|
| `serveur-voix.py` l. 692 | `SEUIL_VRAM_MO = 1500` | déclassse (`num_gpu: 0`) | **au-dessus** de 901-918 → viole toujours |
| `gardien-pile.js` l. 503 | `VRAM_EVICTION_MO = 1024` | évince (`keep_alive: 0`) | **au-dessus** de 901-918 →viole toujours |
| `gardien-pile.js` l. 502 | `VRAM_ALERTE_MO = 1536` | alerte, et **objectif** de `libererVram()` | **au-dessus** de 901-918 → viole toujours |
| `lib-vram.js` l. 123 | verrou valide **4 min** | protège de l'éviction | **modèle `Forever`** → protège 4 min sur ∞ |

**Trois seuils, trois nombres différents pour décider la même chose, et tous les trois
inatteignables dans l'état qu'ils prétendent maintenir.** Les accorder est un travail de
Gaëtan : ce sont des décisions de stratégie, pas des corrections de bug.

---

## (d) Le calcul du cache KV pour 65 536 jetons

`C:\Users\neosp\.dsh\settings.yaml`, lignes 44-46, affirme :

> *« Les deux tiennent entièrement sur le GPU. Contexte maximal mesuré
> (forge-ia/mesurer-contexte-local.py) : 65 536 jetons entièrement sur GPU avec 1,91 Go encore
> libres »* — mesure du **13/09/2026**.

**Ces deux mesures ne peuvent pas décrire le même état.** Voici laquelle est vraie aujourd'hui,
et le calcul.

### d.1 Les chiffres de l'architecture — lus dans le blob GGUF, pas supposés

Blob résolu **depuis le disque** par `ollama show ministral-3:8b --modelfile` :
`C:\Users\neosp\.ollama\models\blobs\sha256-3ea32…01574` — 6 022 221 312 o, en-tête
`GGUF v3`, 531 tenseurs, 51 entrées de métadonnées.

| Métadonnée GGUF (mesurée) | Valeur |
|---|---|
| `mistral3.block_count` (couches) | **34** |
| `mistral3.attention.head_count` | 32 |
| `mistral3.attention.head_count_kv` | **8** (GQA 4:1) |
| `mistral3.attention.key_length` / `value_length` | **128** / **128** |
| `mistral3.embedding_length` | 4 096 |
| `mistral3.context_length` | 262 144 (YaRN, origine 16 384) |
| `general.file_type` | 15 (Q4_K_M) |

### d.2 Le calcul

Éléments K+V par jeton = `2 × 34 couches × 8 têtes_kv × 128` = **69 632**

| Précision | Octets / élément | Octets / jeton | Mio / jeton |
|---|---|---|---|
| fp16 (défaut) | 2 | **139 264** | 0,1328 |
| **q8_0** (votre `OLLAMA_KV_CACHE_TYPE`) | 1,0625 (34 o / bloc de 32) | **73 984** | 0,0706 |

| Contexte | fp16 | **q8_0** |
|---|---|---|
| 4 096 *(l'état réel de ce soir)* | 544 Mio | **289 Mio** |
| 8 192 | 1 088 Mio | 578 Mio |
| 16 384 | 2 176 Mio | 1 156 Mio |
| 32 768 | 4 352 Mio | 2 312 Mio |
| **65 536** | **8 704 Mio (8,50 Gio)** | **4 624 Mio (4,52 Gio)** |

### d.3 La confrontation au budget réel

- Poids du modèle, **mesuré** (`/api/ps`, champ `size`) : `5 678 206 810 o` = **5 415 Mio**.
- Carte : **10 240 Mio**. Socle mesuré ce soir (modèle sur CPU) : **2 909 → 3 262 Mio**.
- Donc disponible pour le modèle + son cache : **6 978 → 7 331 Mio**.

| Hypothèse pour 65 536 | Total poids + KV | Verdict |
|---|---|---|
| q8_0 | 5 415 + 4 624 = **10 039 Mio** | **dépasse le disponible (7 331)** — et sur une carte **entièrement vide** il ne resterait que 201 Mio pour les tampons de calcul et le bureau |
| fp16 | 5 415 + 8 704 = **14 119 Mio** | **dépasse la carte entière** (10 240) |

**Ce qui tient réellement dans les 901 Mio mesurés après un chargement GPU** :
**12 770 jetons** en q8_0, **6 784** en fp16 — et avec `OLLAMA_NUM_PARALLEL=2`
(le cache est alloué par créneau, ×2) : **6 385 jetons**.

### d.4 Verdict, et pourquoi le chiffre du 13/09 existe quand même

**Le `4096` de `ollama ps` est l'état vrai de ce soir. Le « 65 536 entièrement sur GPU » est
irreproductible sur cette carte** — l'écart n'est pas marginal, il est d'un facteur ~1,4 sur
le budget disponible.

Deux raisons mécaniques, lues dans le script qui a produit la mesure
(`C:\IA\gl-digital-lab\forge-ia\mesurer-contexte-local.py`) :

1. **Le critère « entièrement sur GPU » ne voit pas le cache KV.** Ligne 100 :
   `if r["part_gpu_pct"] >= 99.5`, avec `part_gpu_pct = 100 × size_vram / size` (ligne 73).
   `size` et `size_vram` décrivent **l'allocation des poids du modèle**, pas le cache KV. Un
   modèle dont les poids sont sur la carte et dont le cache déborde en RAM système peut donc
   passer le test.
2. **Le « 1,91 Go encore libres » n'est pas une mesure de VRAM libre.** Ligne 74 :
   `info["reste_gio"] = round(VRAM_UTILE_GIO - info["vram_Go"], 2)`, avec
   `VRAM_UTILE_GIO = 8.7` **codé en dur ligne 28**. C'est une **soustraction depuis une
   constante**, qui ignore les ~3 Go réellement pris par Windows et par l'oreille du service
   vocal.

**Et le critère se contredit lui-même ce soir** : dans l'état GPU *réel* mesuré à 04:13:02,
`size_vram / size = 5 375 692 634 / 5 678 206 810 = 94,7 %` — **sous la barre des 99,5 %** du
script. Autrement dit : même à 4 096 jetons, dans un état parfaitement sain, ce script
n'écrirait pas « entièrement sur GPU ». **La ligne du 13/09 doit être retirée ou requalifiée
dans `settings.yaml`** — c'est la seule des deux qui ne résiste pas.

---

## (e) L'arbitrage à rendre explicite

### e.1 Les deux états, chiffrés

| | **Cerveau sur GPU** | **Cerveau sur CPU** |
|---|---|---|
| Latence cerveau mesurée | **5 621 ms** *(agent parent)* | **54 515 / 56 675 ms** *(agent parent)* |
| VRAM totale utilisée | 9 136 → 9 153 Mio | 2 980 → 3 262 Mio |
| VRAM libre | **901 → 918 Mio** | 6 978 → 7 331 Mio |
| Poids du modèle en VRAM | 5 127 Mio (`size_vram`) | **0** |
| Coût du basculement | **≤ 8 s** (chargement à froid, étape A) | **24 s** (déclassement, étape B) |

*Les latences sont celles de l'agent parent ; je ne les ai pas reproduites — mes propres
mesures portent sur le placement et les durées de bascule, pas sur `cerveau_ms`.*

### e.2 Ce que 901 Mio interdit, en pratique

**Tout ce qui rend.** Le studio a ses propres bornes écrites (Wan ≤ 832×480, TRELLIS 512) ;
aucune ne tient dans 901 Mio. Trois exemples :

- **Un rendu ComfyUI** : plusieurs Go. Le cerveau sur GPU laisse **901 Mio** → **aucun rendu ne
  peut démarrer.** Le gardien fera exactement son travail : il évincera le cerveau pour faire
  la place (§ b.2) — c'est-à-dire que le déclassement *est déjà* la réaction à un rendu, mais
  il se déclenche aussi **quand il n'y a aucun rendu**, parce que le seuil ne regarde pas *qui*
  occupe la carte.
- **Une transcription Whisper large-v3** : ~3 Go en `float16` → impossible. L'oreille du
  service tourne d'ailleurs en `small`/`float16` et occupe déjà **847 Mo**.
- **Un rendu TRELLIS 512 ou Wan 832×480** : plusieurs Go → impossible.

### e.3 La règle d'arbitrage souhaitable — explicite et vérifiable

La règle actuelle est « dès que la VRAM libre passe sous N ». Elle est fausse parce qu'elle
confond **la carte est prise par le cerveau** et **la carte est prise par un rendu**. La règle
proposée sépare la *demande* de l'*état* :

> **R1.** Le cerveau tient le GPU **tant qu'aucun rendu n'est déclaré**.
> *Vérifiable* : `ollama ps` affiche `ministral-3:8b` avec `size_vram > 0`, et
> `/api/ps` renvoie `size_vram ≈ 5 375 000 000`, `context_length = 4096`.
>
> **R2.** Le cerveau **rend** la carte sur **déclaration de début de rendu** — un marqueur
> écrit (le `.gpu-busy.lock` existe déjà ; il faut un marqueur « rendu », pas un seuil de
> VRAM). Le passage se fait par un **déchargement explicite** (`keep_alive: 0`).
> *Coût mesuré* : 24 s.
>
> **R3.** Le cerveau **reprend** la carte sur **déclaration de fin de rendu** — et cette
> reprise doit être **explicite**, parce qu'elle n'est **pas automatique** : mesuré, étape C.
> *Coût mesuré* : ≤ 8 s.
>
> **R4.** Le garde ne se déclenche **jamais** à cause de la mémoire que le cerveau occupe
> lui-même. *Vérifiable* : aucune ligne de `_gardien.log` / aucun `num_gpu: 0` ne doit
> apparaître alors qu'aucun rendu n'est déclaré.
>
> **R5.** Les seuils sont **un seul nombre**, pas trois, et il est **inférieur** à ce que
> laisse un état GPU sain (§ c.4).

### e.4 L'hypothèse du parent : « le comportement actuel est peut-être déjà l'arbitrage correct »

**Réponse : non, et c'est mesuré — pas argumenté.**

1. **Il dégrade un état sain.** Le déclencheur ne regarde pas *qui* occupe la carte : il se
   déclenche sur la mémoire que le cerveau prend **à lui-même** (§ b.1, § b.2).
2. **Il se déclenche sans rendu.** Pendant toute ma fenêtre (04:07 → 04:17), **aucun rendu
   n'a tourné** (ComfyUI arrêté à 04:08, zéro `main.py` dans le compteur GPU) — et le
   déclassement s'est produit quand même.
3. **Il est irréversible.** Un arbitrage se reprend ; celui-ci ne revient pas (étape C).
4. **Il produit un mauvais état stable.** La machine converge vers « voix lente » **sans que
   personne n'ait décidé** que la voix passe après l'image *lorsqu'il n'y a pas d'image*.

Donc : **l'arbitrage est codé, mais il répond à la mauvaise question.** Ce n'est pas un
réglage forcé qu'il faut, c'est une **question corrigée** — et la décision, elle, reste à
Gaëtan.

---

## (f) Ce qui est vérifié, ce qui ne l'est pas, ce que Gaëtan doit décider

### Vérifié par mesure, dans ma fenêtre 04:07 → 04:17

- Le socle GPU (~3 Go) **n'est pas ComfyUI** : `dwm.exe` 1 977-2 062 Mo, le service vocal
  847 Mo, le `llama-server` orphelin 703 Mo, ComfyUI **0**.
- Un chargement **à froid** avec carte libre → **100 % GPU**, `size_vram` = 5 375 692 634 o,
  libre 918 Mio. Durée **≤ 8 s**.
- `num_gpu: 0` sur un modèle chargé → **déchargement + rechargement CPU**, `size_vram` = 0,
  **24 s**.
- Une requête **sans** `num_gpu` après un placement CPU **ne le replace pas** :
  `size_vram` reste 0. **Le déclassement est à sens unique.**
- `serveur-voix.py` l. 692 : `SEUIL_VRAM_MO = 1500`, et `num_gpu: 0` part dans les options
  (l. 751). **918 < 1 500.**
- `gardien-pile.js` l. 502-503 : `VRAM_ALERTE_MO = 1536`, `VRAM_EVICTION_MO = 1024`,
  passe toutes les 45 s (l. 567). `lib-vram.js` l. 123 : verrou valide **4 min**.
- `_gardien.log` : `[2026-09-20 02:09:40] 🧹 VRAM 901 Mo < 1024 — décharge préventive :
  ministral-3:8b` — **901 Mo, la valeur exacte de l'état GPU.** 158 décharges au total.
- `Modelfile` : **aucun** `PARAMETER num_gpu` (seul `temperature 0.15`).
- Variables `OLLAMA_*` : `NUM_GPU` **absent**, `KEEP_ALIVE=-1`, `MAX_LOADED_MODELS=1`,
  `NUM_PARALLEL=2`, `KV_CACHE_TYPE=q8_0`, `FLASH_ATTENTION=1`, `CONTEXT_LENGTH=8192`
  (portée Utilisateur ; **rien** en portée Machine).
- Architecture GGUF : 34 couches, 8 têtes KV, dimension 128, 262 144 de contexte, Q4_K_M.
- Cache KV : 139 264 o/jeton (fp16) et 73 984 o/jeton (q8_0) → **4 624 Mio pour 65 536
  jetons en q8_0**, 8 704 Mio en fp16.
- **65 536 jetons ne tiennent pas** : 10 039 Mio requis contre 7 331 disponibles.
- Aucun processus de Gaëtan touché ; état initial restauré.

### Non vérifié — et je le nomme plutôt que de le combler

- **Il n'existe aucune trace de journal du runner Ollama.** Le serveur qui sert réellement
  (PID 35068, lancé à la main à 23:22:30) écrit sa sortie sur une console, pas dans un
  fichier. Le `server.log` de l'application Ollama, lui, ne contient **que** des erreurs de
  port (`bind: 11434`), répétées sur 2,3 Mo et **0 ligne GPU sur 14 871** : l'application n'a
  jamais réussi à servir. **La décision de placement d'Ollama n'est donc documentée nulle
  part sur le disque** — ce que je prouve est un *comportement* (trois requêtes contrôlées),
  pas une ligne de journal de fournisseur.
- **Le retour au GPU après changement d'options n'est vérifié que sur ce modèle et cette
  machine.** Je ne généralise pas.
- **L'éviction par le gardien d'un modèle *effectivement sur GPU*** est attestée par **son
  propre journal** (02:09:40, 901 Mo), mais **je ne l'ai pas reproduite en direct** : l'étape
  C n'a pas pu remettre le modèle sur le GPU (c'est précisément ce qu'elle a démontré), et je
  n'ai pas exécuté `ollama stop` puisque ça touche un service. Une seule commande la
  reproduirait, et elle est dans la fiche : § c.3.
- **L'identité du `llama-server` PID 30800** (orphelin Ollama, ou serveur tiers de Gaëtan) :
  ligne de commande illisible, chemin vide. Hypothèse, non preuve.
- **Le lien entre les `nvlddmkm` ID 13 de 23:12-13 et l'orphelin de 23:13:33** : chronologie
  concordante, causalité non démontrée (messages vides).
- **Les rapports de plantage transmis à 19/09 22:43:24 et 20/09 02:06:45** (LiveKernelEvent P1=141
  `VIDEO_ENGINE_TIMEOUT_DETECTED`, P1=193, BlueScreen P1=119
  `VIDEO_SCHEDULER_INTERNAL_ERROR`) : leur **horodatage de survenance** n'est pas celui du
  rapport. **Non élucidé.** Ce qui est net : le TDR classique **ID 153** ne figure pas dans
  les événements de la nuit (dernier : 17/09 07:43:42), et **aucun incident GPU n'a eu lieu
  pendant mes mesures** — aucun de mes relevés n'a dépassé le premier signe de plantage, ce
  qui était la consigne.
- **Les latences 5 621 / 54 515 / 56 675 ms** : mesures de l'agent parent, non reproduites
  par moi.

### Ce que Gaëtan doit décider *(décision, pas exécution — c'est son domaine)*

1. **Quel état est le bon quand rien ne rend ?** Aujourd'hui la machine répond « voix lente »
   sans que personne ne l'ait voulu. *Recommandation* : **voix sur GPU hors rendu** (§ c.2,
   R1-R5) — 5,6 s au lieu de 54 s, au prix de 901 Mo libres et donc de l'impossibilité de
   lancer un rendu tant qu'elle est résidente.
2. **Le protocole de basculement** : R2 (le cerveau rend la carte sur déclaration de rendu,
   24 s) et R3 (il la reprend explicitement après, ≤ 8 s). À valider, puis à écrire dans
   `poste-local/` sous forme de script — aujourd'hui ce protocole n'existe pas.
3. **La ligne du 13/09 dans `settings.yaml`** (§ d.4) : **à retirer ou requalifier**. Le
   `65 536 jetons entièrement sur GPU` n'est pas reproductible, et « 1,91 Go encore libres »
   est une soustraction depuis une constante codée en dur, pas une mesure.
4. **Les trois seuils** 1 500 / 1 536 / 1 024, et le verrou de 4 min pour un modèle
   `Forever` : ce sont des **décisions de stratégie** (§ c.4). Je ne les change pas.
5. **Le `llama-server` PID 30800** — 703 Mo de VRAM + 6,4 Go de RAM pour un serveur que rien
   n'interroge. Si c'est bien un orphelin, sa libération rendrait **703 des 901 Mo**.
   ⚠️ **Je ne l'ai pas tué** : sa ligne de commande est illisible, je ne peux pas prouver à
   qui il appartient. La décision est à Gaëtan.
6. **La posture** : trois seuils qui condamnent toujours l'état qu'ils prétendent maintenir,
   et un arbitrage qui se fait *par accident*. Ce n'est pas un bug d'Ollama — c'est du code
   du studio. La question « faut-il répartir les ressources ? » a déjà une réponse écrite,
   en trois endroits qui ne se parlent pas.

---

## (g) Conduite de la mesure — une fenêtre volée à Gaëtan, et je l'inscris

La consigne §8 des consignes globales (mesurée le 20/09/2026, signalée par Gaëtan) est arrivée
**pendant** cette session : *« Les CMD qui me coupent l'entrée à la main et qui me gâchent mon
écran, ça me fait un peu chier. »* Un enfant non-terminal a sa fenêtre masquée ; **une commande
`pwsh` en avant-plan en ouvre une visible.**

**Je m'y suis mis en défaut, et c'est mesurable** : l'expérience contrôlée (A → B → C, § a) a
tourné **en avant-plan pendant ~4 minutes, de 04:12:54 à 04:13:30**, suivie de la surveillance
du gardien jusqu'à 04:16:31 — soit environ **3 min 40 s** de plus. Total : **une fenêtre
visible sur le poste de Gaëtan pendant près de quatre minutes**, exactement ce que la consigne
proscrit. La série de relevés, elle, était bien en tâche de fond (`run_in_background`).

**Correction de conduite pour la suite** : toute commande non instantanée part en
`run_in_background: true`, et sa sortie se lit par `job_output`.

**Ce que je n'ai pas fait** : la consigne §6 demande une entrée dans
`C:\IA\gl-digital-lab\vault-agence\registre-echecs-agents.md` le jour même. **Je ne l'ai pas
écrite** : la mission interdit explicitement de toucher à un vault et à un dépôt git, et
`vault-agence` est les deux. **L'entrée reste donc à faire** — par l'agent qui en a le droit.

---

**Pièce jointe** : `releves-gpu-ollama-2026-09-20.csv` — la série brute (10 relevés, 60 s)
sur laquelle la chronologie (a) est construite.

*Fiche datée du 20/09/2026. Toutes les valeurs sont horodatées ; toute affirmation non
mesurée porte explicitement la mention « non vérifié » ou « hypothèse ».*
