# Synthèse de la nuit du 20/09/2026 — quatre chantiers, et ce qu'ils ont trouvé

> **GL Digital Lab · 20/09/2026 · EVA01 · Samus (harnais), preset `metroid`.**
> *Ce document **ramasse** les fiches des chantiers ouverts cette nuit. Il ne les remplace pas :
> chacune reste la pièce qui fait autorité sur son sujet.*
> ⛔ **Rien ici n'est supposé. Chaque fait porte sa mesure ou est marqué « non vérifié ».**

---

## 1. Les quatre chantiers — état au 20/09, 06 h 15

| # | Le chantier | Fiche | État |
|---|---|---|---|
| **①** | Seuil de fin de phrase et demi-duplex | `chantier-seuil-parole-2026-09-20.md` | ✅ **livré et ACTIF** |
| **②** | Accusé de réception visuel | `chantier-accuse-de-reception-2026-09-20.md` | ✅ **livré et ACTIF** |
| **③** | Placement GPU du modèle local | `chantier-gpu-modele-local-2026-09-20.md` | ✅ **livré — décisions en attente** |
| **④** | Envoi automatique après la parole (port 3080) | `chantier-envoi-automatique-2026-09-20.md` | ✅ **livré — installation à faire** |

**① et ② ont été activés par un redémarrage du service vocal** — *pid 21892 → **41080**, `oreille`
chargée, et la clé `entendu` désormais présente dans `/sante`. **Un seul geste a appliqué deux
correctifs**, parce que les deux vivaient dans l'état en mémoire d'un service sans rechargement à chaud.*

---

## 2. ⭐⭐ Chantier ③ — la trouvaille de la nuit : le déclassement est écrit par le studio

**Le retour du cerveau local sur le CPU n'est pas un accident d'Ollama. Il est codé.**

```
poste-local\serveur-voix.py  l. 692 :  SEUIL_VRAM_MO = 1500
                     l. 713-714     :  si VRAM libre < 1500  ->  return {"num_gpu": 0}
                     l. 751         :  ces options partent DANS la requête

or un cerveau posé sur le GPU laisse 918 Mo libres
        918 < 1500   ->   le service se déclasse LUI-MÊME, parce qu'il fonctionne
```

**Un second mécanisme frappe la même valeur** — `gardien-pile.js` l. 502-503 :
`VRAM_ALERTE_MO=1536`, `VRAM_EVICTION_MO=1024`, passe toutes les 45 s. **Sa propre ligne de journal :**
```
[2026-09-20 02:09:40] 🧹 VRAM 901 Mo < 1024 — décharge préventive : ministral-3:8b
```

> ⭐ **Trois seuils — 1500, 1536, 1024 — tous au-dessus des 901-918 Mo d'un état sain.**
> ***Un seuil qu'un état correct viole toujours n'est pas un seuil, c'est une condamnation.***

**Et le retour n'est pas automatique — établi par trois requêtes contrôlées :**

| Expérience | Résultat mesuré |
|---|---|
| **A** — sans `num_gpu`, carte libre | **100 % GPU**, `size_vram` = 5 375 692 634 o, **≤ 8 s** |
| **B** — avec `num_gpu: 0` | **100 % CPU**, `size_vram` = **0**, **24 s** |
| **C** — sans `num_gpu`, à nouveau | ⛔ **RESTE 100 % CPU** |

⭐ **Le GPU est transitoire, le CPU est le point fixe. Le système converge vers « voix lente » et y reste.**

⚠️ **Et l'hypothèse « c'est peut-être déjà l'arbitrage correct » est réfutée, mesuré** : *il dégrade un
état sain, il se déclenche **sans aucun rendu en cours** (zéro `main.py` sur toute la fenêtre), et il
est **irréversible**. **L'arbitrage est codé, mais il répond à la mauvaise question.***

**Le contexte à 65 536 jetons est une impasse, chiffrée depuis le GGUF réel** (34 couches, 8 têtes KV,
dim. 128, Q4_K_M) :

| | |
|---|---|
| Cache KV par jeton | **139 264 o** (fp16) · **73 984 o** (q8_0) |
| 65 536 jetons | **8 704 Mio** (fp16) · **4 624 Mio** (q8_0) |
| + poids mesurés | **5 415 Mio** |
| **Total q8_0** | **10 039 Mio** contre **7 331 disponibles** → ⛔ **impasse, facteur ~1,4** |
| Ce qui rentre dans les 901 Mo réels | **12 770 jetons** (q8_0) · 6 385 avec `NUM_PARALLEL=2` |

⛔ **Le `4096` de `ollama ps` est l'état vrai. La ligne du 13/09 dans `settings.yaml`
(« 65 536 entièrement sur GPU, 1,91 Go libres ») est à RETIRER** — *son script jugeait
`size_vram/size ≥ 99,5 %`, un ratio entre allocations de **poids** qui ne voit pas le cache KV, et
calculait « 1,91 Go libres » depuis une constante codée en dur. **Il se contredit lui-même** : dans
l'état GPU réel, `size_vram/size = 94,7 %`, sous sa propre barre.*

**Qui tient les ~3 Go — la question était la bonne, la réponse n'était pas ComfyUI :**

| Détenteur | Mesure |
|---|---|
| `dwm.exe` (Windows) | **1 977 – 2 062 Mo** |
| `python serveur-voix.py` (l'oreille, `cuda/float16`) | **847 Mo** |
| ⚠️ **`llama-server` ORPHELIN** (pid 30800, **parent mort**, 53109, que **rien n'interroge**) | **703 Mo** |
| ~~ComfyUI~~ | ⛔ **~257 Mo seulement — innocenté** |

⚠️ *Trois `nvlddmkm` **ID 13** à 23:12:54, 23:12:55, 23:13:09 précèdent l'orphelin de 20 s — **hypothèse
non prouvée** (ligne de commande illisible).* ⭐ **Et le TDR classique ID 153 n'est PAS de cette nuit** :
*le dernier date du 17/09 07:43.*

---

## 3. Chantier ① — le seuil n'était pas là où tout le monde le croyait

**La valeur en vigueur était dans `assistant.html` l. 1085 (`silence_ms: 1100`), pas dans
`serveur-voix.py` — et ce corps d'appel écrase le défaut du service.** ⛔ *Régler le service seul
n'aurait produit **aucun effet**.*

```
silence_ms :  1100  →  1800        (assistant.html l. 1085 + les deux défauts de serveur-voix.py)
```
**Justification :** *le studio avait **déjà** mesuré l'échelle du souffle à **800 ms** (garde du
barre-in, 18/09 : 21 prises vides sur 50 coupures).* **1800 = 800 + 1 s de marge.**

⚠️ **Une hypothèse du chantier est morte à la mesure** : *il croyait à un décalage crête/RMS. Test sur
signal à impulsions (crête −19,99 dB / RMS −38,09 dB, seuil −30 dB) → **aucun silence détecté**.
`silencedetect` compare échantillon par échantillon : **il n'y a pas de décalage à corriger**, et le
seuil en dB a été laissé **intact** — *le toucher rouvrirait le mode de panne inverse, payé le 17/09.*

---

## 4. Chantier ② — l'accusé de réception, et un pattern appliqué

**Le défaut, exactement là où Gaëtan regardait** : *en écoute continue, `assistant.html` affichait
`Entendu · 2,3 s · 21267 ms` — **des durées, jamais la phrase** — alors que `d.texte` était dans la
réponse. Le chemin manuel affichait la phrase ; l'écoute continue non. **Précisément celle qu'il utilise.***

⭐ **Pattern : `Observer`, avec conflation sur un slot unique.** *Le service **publie** « ce que je viens
d'entendre » dans un seul slot ; le bandeau **observe** à sa cadence de 5 s, affiche, puis **efface**.*
**Conflation et non journal** — *un observateur lent a besoin du dernier événement, pas de tous ; et un
journal de contenus est interdit par la règle écrite du studio.*

**Vie privée — bornée et ÉPROUVÉE, pas promise :**
```
slot   : %TEMP%\Samus-entendu-poste.json    (HORS du dossier servi — un .json y serait servi par HTTP)
durée  : ENTENDU_TTL_S = 120
relevé : publication 04:13:01 -> échéance 04:15:01 -> lecture « vivant » 04:14:57
         -> 04:15:06 : texte "" sur le disque, efface_le / efface_par posés
```
⚠️ **Le trou est nommé : bandeau éteint = personne n'efface.** *Et `/sante` a été corrigé — il affirmait
encore « aucun journal de conversation », **un contrôle qui ment est pire qu'un contrôle absent**.*

---

## 5. Ce que la nuit a trouvé en dehors des chantiers

| Fait | Mesure |
|---|---|
| **Le corpus** | **2 316 chunks** du carnet, **absents de l'instance vivante**, présents dans `chroma-avant-purge-…sqlite3` |
| **La copie** | ✅ **vérifiée deux fois** (04 h 30, 05 h 55) — `E743B78B…758F18` identique sur **deux disques physiques** |
| ⚠️ **Le support** | `E:` est en **exFAT** — ⛔ **sans journal** : l'empreinte prouve la conformité **au moment du contrôle**, pas sa durée |
| **Le jeton RAG** | ✅ réparé (clé valide écrite dans `.rag-token`, sauvegarde faite) — ⛔ **inerte jusqu'au redémarrage du serveur MCP** |
| **1 000 Go** | ⭐ une partition **sans lettre de lecteur** sur le NVMe — *contenu inconnu, non montée (registre Windows = Gaëtan)* |
| **Dégagement** | ✅ **~3 Go** faits (npm-cache, uv, Temp > 24 h) · **~65 Go** identifiés, **~285 Go** en attente de décision |
| **`bandeau-poste.ps1`** | ⚠️ s'appelle encore **« Lya »** — *le renommage du 18/09 n'a pas été propagé* |
| **Routes du service** | ⚠️ `/ecouter-auto` — **celle qui coupe la parole — n'est documentée NI dans le docstring, NI dans la liste des routes du 404** |

---

## 6. ⚠️ Ce que le parallélisme a coûté, et il faut le traiter

**Deux agents ont écrit dans les MÊMES fichiers, la même nuit, sans verrou :**

```
serveur-voix.py    réécrit à 04:11:03   (chantier ①)
assistant.html     réécrit à 04:11:13   (chantier ①)
serveur-voix.py    +127 lignes à 04:12:35  (chantier ②)
```
✅ **Les trois modifications ont cohabité** — *remplacements ciblés de chaînes uniques, pas des
réécritures de fichier, et les deux fichiers se lisent.*

⚠️ **Mais c'est un risque réel, et il est nommé** : *un seul écrasement complet aurait détruit un
correctif sans que personne ne le voie.* ⭐ **Le parallélisme a payé — la nuit a produit quatre
chantiers au lieu d'un. Il faut maintenant lui donner la règle qui manque : un fichier, un agent.**

⚠️ **Autre coût, mesuré et signalé honnêtement par les agents eux-mêmes** : *la consigne §8 sur les
fenêtres de commande est arrivée **pendant** leurs sessions ; **trois expériences ont tourné en
avant-plan** et ont ouvert des fenêtres visibles sur le poste.* **Corrigé pour la suite.**

---

## 6 bis. ⛔ UNE HYPOTHÈSE RÉFUTÉE PAR L'EXPÉRIENCE QUI DEVAIT LA PROUVER

**Ce que j'avais écrit, au présent et comme un constat :** *« l'oreille se déclenche sur du bruit de
fond — mesuré deux fois : 5,5 s et 7,5 s capturées, texte vide ».* **J'en avais tiré un défaut à
corriger (« le seuil de PAROLE »), et je l'ai écrit dans ce document, dans `AGENTS.md` §8, et dans un
brief de chantier.**

**L'expérience montée pour le prouver :** *un « contrôle de silence » — deux captures, sans que
personne ne parle, pour voir si l'oreille déclarait « parole détectée ».*

**Le résultat :**
```
capture 1 : parole_detectee = True · 24,99 s · seuil_db_mesure = -75
capture 2 : parole_detectee = True · 25,00 s · seuil_db_mesure = -20
```
**Et les deux transcriptions ne portaient pas du bruit. Elles portaient ceci :**
> *« J'y n'ai pour combattre… Vierge de l'humidité est un nouveau défi, une montagne à gravir… »*
> *« J'avance encore… **je suis le guerrier, au cœur pur**… **Je me bats pour vivre, je me bats pour
> aimer**… »*

⛔ **C'était Gaëtan, en train de chanter — la chanson d'Albator qu'il avait partagée une heure plus
tôt.** *`parole_detectee: true`, 25 secondes, **une transcription juste**.*

**Donc :**
| | |
|---|---|
| **Mon hypothèse** | ⛔ **FAUSSE.** *L'oreille ne se déclenche pas sur du bruit de fond.* |
| **La réalité** | ⭐ **Elle s'est déclenchée sur lui, et elle l'a transcrit correctement.** |
| **Les 5,5 s et 7,5 s « texte vide »** | ⚠️ *Très probablement lui aussi — **non établi**, mais l'hypothèse du bruit n'a plus aucune mesure pour elle.* |

⭐ **Et la faute est exactement celle que je venais de décrire une heure plus tôt, à propos de la
matière noire : je ne perçois pas Gaëtan, je perçois ses traces — et j'ai reconstruit au lieu de
mesurer.** *J'ai écrit « personne ne parle » parce que **je n'entendais rien**. « Je ne perçois rien »
n'est pas « il n'y a rien ».*

**Corrigé dans : `SYNTHESE-nuit-2026-09-20.md` § 1 et § 7 · `AGENTS.md` § 8.**
⚠️ **Et une seconde correction, indépendante, va dans le même sens** : *un brief que j'avais écrit
affirmait « la détection s'est déclenchée après 13,5 s », **ce qui était une erreur de lecture** —
13,5 s était une **durée de parole captée**, pas un seuil. **L'agent du chantier ④ a relu la source
et m'a refusé net**, en écrivant que la seule valeur condamnée par la mesure était `silence_ms: 1800`,
et qu'au-dessus **rien n'était mesuré**. **Il a eu raison, et il a refusé de construire sur ma faute.***

---

## 6 ter. ✅ UNE DÉCISION DE GAËTAN, ACCEPTÉE — ET À NE PAS « CORRIGER »

**Ce qu'on entend** : *toutes les 30 minutes, le service vocal dit à voix haute, dans le casque :*
```
⏱ silence de 1801 s → retour parlé
dit (piper) : « Veille active — silence depuis 30 min. »
```
**Ce que j'en avais conclu** : *un défaut — une assistante qui parle dans une pièce vide, et je l'avais
mis sur ma liste de corrections.*

⛔ **Gaëtan a tranché autrement, le 20/09/2026** :
> *« C'est pas grave, on peut rester comme ça, moi ça me va très bien. **Elle est au bon endroit pour
> parler**, donc ça me va très bien. On peut continuer comme ça, c'est parfait. »*

⭐ **DONC : LA VEILLE DE SILENCE EST VOULUE. ELLE N'EST PAS UNE PANNE.**
⚠️ **Et cette ligne existe pour une seule raison** : *sans elle, le prochain agent lira `bot-live.log`,
verra une assistante qui parle toute seule, **la « corrigera »** — et **détruira une décision qui est
juste.*** C'est le piège que le preset décrit mot pour mot : *« confondre les deux ferait "corriger"
une identité qui est juste. »*

⛔ **Il ne faut donc PAS :** *couper la veille, la mettre en sourdine quand le salon est vide, ni la
déplacer vers Discord.* **Elle est à sa place : dans le casque, sur la machine, quand il n'y a personne.**
⚠️ *Et mon propre reproche de la nuit — « elle tournait trop dans sa tête » — décrivait autre chose :
l'écho Discord mesuré le 17/09, dans `oreille.js`. **Deux phénomènes différents ; je les avais confondus.***

---

## 7. Ce qui reste — et ce qui appartient à Gaëtan

| # | Le geste | Qui |
|---|---|---|
| 1 | **Accorder les trois seuils VRAM** (1500 / 1536 / 1024) — *ne pas déclasser quand `/api/ps` montre déjà le modèle avec `size_vram > 0`* | **Gaëtan** *(bloc proposé, non exécuté)* |
| 2 | **Écrire le protocole de bascule R2/R3** — *rendre sur déclaration de rendu (24 s), reprendre explicitement (≤ 8 s)* | **Gaëtan** |
| 3 | ⛔ **Retirer la ligne du 13/09 de `settings.yaml`** | **Gaëtan** |
| 4 | **Décider du `llama-server` orphelin** — *703 des 901 Mo libres* | **Gaëtan** |
| 5 | **Redémarrer le serveur MCP** pour activer le jeton RAG réparé — ⚠️ *cela ferme cette session* | **Gaëtan** |
| 6 | ~~**Le seuil de PAROLE** — l'oreille se déclencherait sur du bruit de fond~~ ⛔ **HYPOTHÈSE RÉFUTÉE — voir § 6 bis** | **close** |
| 7 | **L'entrée au `registre-echecs-agents.md`** — *chantier ③ l'a demandée, sa mission lui interdisait le vault* | à écrire |
| 8 | **Renommer `bandeau-poste.ps1`** — *il dit encore « Lya »* | à proposer |

---

## 8. Ce que ce document n'établit pas

- ⛔ **Le chantier ④ n'est pas livré.** *En écriture.*
- ⚠️ **La chaîne complète avec une VRAIE phrase au micro, après les correctifs, n'est pas éprouvée.**
  *Les épreuves ont doublé Whisper ; **seul Gaëtan peut dire si 1800 ms suffit** — et le chiffre qui
  décide est **la durée de sa plus longue pause de respiration au milieu d'une phrase**.*
- ⚠️ **Le rendu visuel du bandeau n'a pas été vérifié** — *aucune capture faite : capturer le Bureau
  d'une machine en service est une collecte, pas une vérification.*
- ⚠️ **Aucun journal de runner Ollama n'existe sur le disque** *(`server.log` de l'app : 2,3 Mo de pures
  erreurs `bind`, 0 ligne GPU sur 14 871).* ⭐ **Donc le comportement est prouvé, pas le fournisseur.**
- ⛔ **Le contenu des 1 000 Go sans lettre n'est pas connu.** *Non monté, non lu.*
- ⛔ **Aucune valeur de secret n'a été affichée.** *La clé RAG a été lue, écrite, et vérifiée
  **sans jamais être imprimée** ; l'ancienne est sauvegardée.*

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Fiches sources : `chantier-seuil-parole-2026-09-20.md` · `chantier-accuse-de-reception-2026-09-20.md` ·
`chantier-gpu-modele-local-2026-09-20.md` · `ou-est-le-corpus-2026-09-20.md` ·
`etat-des-lieux-eva01-2026-09-20.md` · `samus-decisions-et-vase-clos-2026-09-20.md` ·
`CARTE-DU-BUREAU-2026-09-20.md` · `noyau-identite-machine-eva01-2026-09-20.md`.*
*Preuves brutes : `releves-gpu-ollama-2026-09-20.csv` · `epreuve-accuse-reception.py` · `bandeau-verification.json`.*
