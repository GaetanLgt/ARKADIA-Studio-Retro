# Chantier — le seuil de silence qui coupait la parole

> **Date** : 20/09/2026, 04h15 (heure de la machine).
> **Machine** : EVA-01, utilisateur `neosp`.
> **Auteur** : Trinity (preset `metroid`), sur demande de Gaëtan.
> **Objet** : `POST /ecouter-auto` a rendu `motif: "fin de phrase detectee"` alors que Gaëtan parlait
> encore — son verdict, mot pour mot : **« vous m'avez coupé »**.
> **État du service** : **ni arrêté, ni redémarré.** pid 21892, vivant et revérifié après chaque
> écriture (HTTP 200 sur `/sante`, `appels oreille = 1`).

---

## 0. Ce qui a été mesuré, et la réponse brute

Réponse fournie (l'incident) :

```json
{"ok":true,"parole_detectee":true,"motif":"fin de phrase detectee","secondes_captees":13.5,
 "seuil_db_mesure":-38.1,"duree_ms":21267}
```

**Corroboration indépendante, faite ici sans le savoir au départ** : un autre script modifiait
`serveur-voix.py` pendant que je travaillais (§ 6), et son commentaire cite le **même** événement
par son `duree_ms` (`21267`) et rapporte `oreille.appels` passant de **0 à 1** dans `/sante`.
J'ai mesuré ce même `appels = 1` de mon côté, à 04h10. **Les deux lectures se recoupent : ce tour
est la seule transcription du service depuis son démarrage le 19/09 à 19h50.** L'incident n'est donc
pas une reconstitution — il est unique et datable.

Coherence interne du tour, recalculée : 0,45 s de calibration + 13,5 s de capture + ~7 s de whisper
≈ 21,3 s = `duree_ms: 21267`. **Il a donc cessé d'être écouté à 12,4 s de parole.**

---

## 1. Le mécanisme exact, tel qu'il a été lu

Tout se joue dans `enregistrer_jusqu_au_silence()` et la route `/ecouter-auto`.
Numéros de ligne mesurés sur `serveur-voix.py` **le 20/09 à 04h15, 1858 lignes, 103 251 octets** —
ce fichier bouge (§ 6), donc chaque ancre est donnée **aussi par son texte**.

### 1.1 L'appel (route `POST /ecouter-auto`)

| Ancre | Ligne | Ce qu'elle dit |
|---|---|---|
| `if self.path.startswith("/ecouter-auto")` | **l. 1614** | la route |
| `silence_ms=int(d.get("silence_ms") or 1800)` | **l. 1618** | **la valeur modifiée** — défaut de la route |
| `"seuil_db_mesure": seuil_mesure` | l. 1624, 1630, 1650 | les trois sorties possibles |
| `and not self.path.startswith("/ecouter-auto")` | l. 1584 | la garde du piège payé le 17/09 (`/ecouter-auto` commence par `/ecouter`) |
| `"routes": ["/sante", …]` | l. 1570 | la liste du 404 — **ne mentionne pas `/ecouter-auto`** |
| docstring, `GET /sante` … `GET /epreuve` | l. 21-25 | idem : **`/ecouter-auto` n'y figure pas** |

⚠️ **Deux écrits du service ne documentent pas la route en cause** (le docstring et la liste du 404).
Ce n'est pas le défaut de ce soir, mais c'est ce qui a fait chercher au mauvais endroit.

### 1.2 Le seuil de niveau — il se MESURE, il ne se choisit pas

| Ancre | Ligne |
|---|---|
| capture de calibration 0,45 s (`-f dshow -i audio=… -t 0.45`) | l. 1043 |
| `volumedetect` sur cette capture | l. 1047 |
| `seuil_utilise = max(-75.0, min(-20.0, pic + 12.0))` | l. 1056 |
| repli `seuil_utilise = seuil_db` si la calibration échoue | l. 1060 |

Le seuil vaut donc **le pic du plancher de bruit + 12 dB**, borné à `[-75, -20]`.
Mesure de l'incident : `seuil_db_mesure = -38.1` ⟹ **le pic du plancher mesuré était −50,1 dBFS.**
C'est un plancher élevé (micro-casque + dongle USB), et c'est celui de ce soir.

### 1.3 La détection — et la règle d'arrêt

| Ancre | Ligne |
|---|---|
| `-t max_secondes` (borne haute, 20 s ici) | l. 1072 |
| `-af silencedetect=noise={seuil}dB:d={silence_s}` | l. 1075 |
| `silence_s = max(0.25, silence_ms / 1000)` | l. 1027 |
| `for ligne in p.stderr` | l. 1084 |
| `a_entendu = True` sur `silence_end` | l. 1086 |
| `motif = "fin de phrase detectee"` + `break` sur `silence_start` après avoir entendu | **l. 1089** |
| `motif = "garde-fou de temps"` si `max_secondes + 5` dépassé | l. 1092 |
| arrêt propre `p.stdin.write("q")` (le correctif du 17/09 : un ffmpeg tué ne finalise pas son WAV) | l. 1099 |

**La règle, en une phrase** : *on s'arrête au premier `silence_start` qui SUIT un `silence_end`* —
c'est-à-dire après **`silence_ms` de calme continu sous le seuil**.

### 1.4 Le paramètre fautif, et le seul

Donc, en vigueur ce soir : **tous les échantillons sous −38,1 dBFS pendant 1,1 s ⟹ tour refermé.**

Une pause de respiration fait exactement ça. Le service n'a pas mal entendu : **il a correctement
constaté un calme, et il a mal interprété sa durée.**

---

## 2. Ce que j'ai d'abord cru — et que la mesure a démenti

**Mon hypothèse de départ** : le seuil `pic + 12 dB` est dérivé d'une **crête** (`max_volume`
de `volumedetect`), alors que `silencedetect` travaillerait sur un **RMS de fenêtre**. Décalage de
grandeur ⟹ seuil trop « serré » ⟹ c'était ça, la cause.

**Le protocole, qui pouvait me contredire** : un signal à impulsions (1 échantillon sur 640 à
l'amplitude 0,1), donc à très fort facteur de crête, passé à `silencedetect=noise=-30dB:d=0.5`.

| Mesure | Résultat |
|---|---|
| `astats` — crête | **−19,99 dBFS** |
| `astats` — RMS | **−38,09 dBFS** (coïncidence numérique avec le −38,1 de l'incident : **sans lien**) |
| silence détecté à −30 dB ? | **NON — aucun `silence_start`** |

Le RMS était **8 dB sous** le seuil et le silence n'a pas été vu ⟹ **la comparaison est faite
échantillon par échantillon, pas sur un RMS de fenêtre.**
**Mon hypothèse est morte.** Et elle emporte la conclusion qui allait avec : la dérivation
`pic + 12 dB` porte bien sur la **même** grandeur que le détecteur. **Il n'y a aucun décalage à
corriger au niveau du seuil en dB.**

Conséquence directe : **je n'ai pas touché au seuil de niveau**, et c'est délibéré — voir § 4.

---

## 3. Le piège principal : la valeur en vigueur n'est PAS dans `serveur-voix.py`

C'est le point qui change la cible, et il valait la vérification.

| Fichier | Ligne | Valeur |
|---|---|---|
| `serveur-voix.py` — signature | l. 981 | `silence_ms=1800` **(défaut — inerte)** |
| `serveur-voix.py` — route | l. 1618 | `silence_ms or 1800` **(défaut — inerte)** |
| `serveur-voix.py` — veille locale | l. 308 | `silence_ms=1000` (non touché) |
| **`assistant.html` — écoute continue** | **l. 1085** | **`silence_ms: 1800` — C'EST LA VALEUR EN VIGUEUR** |
| `verifier-lya.mjs` — harnais de vérification | l. 271 | `silence_ms: 1100` (non touché, voir § 5) |

La chaîne, mesurée : `assistant.html` l. 1068 → `POST /api/voix/ecouter-auto` →
`serveur-assistant.js` **l. 947** (proxy) lit le corps **brut** (l. 962-964) et le retransmet
**tel quel** (`body: corps`, **l. 970**) → `serveur-voix.py` l. 1614.

> **Régler `serveur-voix.py` seul n'aurait donc rien changé.** Le corps de l'appelant écrase le
> défaut de la route, à chaque appel. *Un contrôle qui ne peut pas échouer ne contrôle rien* —
> et ici, un réglage fait au mauvais endroit n'aurait produit **aucun** effet mesurable, tout en
> donnant l'illusion d'avoir été appliqué.

**Deuxième constat du même genre, et il est écrit en toutes lettres dans le fichier** : le
commentaire de `assistant.html` l. 1070-1072 affirme que le seuil « vient de la MESURE
(−57,5 dB relevé sur ce poste) ». Or `seuil_db: -57.5` est **écrasé** par la calibration
(l. 1056) dès qu'elle réussit — et elle a réussi ce soir : `seuil_db_mesure = -38.1`, **pas
−57,5**. Le commentaire décrit une intention, pas le comportement. *« C'est écrit dans le
fichier » ne veut pas dire « c'est ce qui se passe ».*

---

## 4. Le réglage appliqué, et pourquoi cette valeur

**`silence_ms` : 1100 → 1800 ms**, appliqué dans `assistant.html` (valeur en vigueur) **et** sur
les deux défauts de `serveur-voix.py` (cohérence, sans effet aujourd'hui).

### Pourquoi 1800, et pas un autre nombre

1. **Le défaut est la DURÉE, pas le niveau** — établi au § 2 par la mesure. Le seul levier qui
   sépare « respiration » de « fin de tour » est donc le temps de calme exigé.
2. **L'échelle du souffle est déjà mesurée par le studio, et elle est documentée** :
   `modeles/architecture-multi-agents-mesure-2026-09-18.md` l. 129 — la garde du barre-in a reçu un
   **seuil de 800 ms** précisément pour qu'« il ne coupe plus pour un souffle », après
   **21 prises vides sur 50 coupures** (`calibration-voix-2026-09-18.md` § 4). Un souffle est donc
   un événement **sub-seconde** — et 1100 ms ne le dépassait que de 300 ms.
3. **1,8 s = 800 ms (l'échelle mesurée du souffle) + 1 s de marge.** La marge est là parce qu'on
   parle à une machine : les pauses y sont plus longues qu'entre deux humains, puisqu'on attend
   une réponse.
4. **Le sens de l'erreur est sûr** : allonger `silence_ms` ne peut que **retarder** la coupure,
   jamais l'avancer. Un seuil par échantillon ne devient pas plus « bavard » parce qu'on attend
   plus longtemps.
5. **Le budget est tenu** : avec `max_secondes: 20` (l. 1085), la fenêtre de calme consomme au plus
   9 % de la capture au lieu de 5,5 % — il reste ≥ 18 s de parole. Et si le garde-fou se déclenche,
   le service **transcrit quand même** ce qu'il a capté (`motif: "garde-fou de temps"`, l. 1092) :
   c'est une dégradation, pas un silence.
6. **Le coût, dit franchement** : **+700 ms par tour**. À comparer aux 201-1 858 ms déjà mesurés
   pour la seule oreille (`calibration-voix-2026-09-18.md` § 1).

### Ce que je n'ai PAS touché, et pourquoi

- **Le seuil de niveau (`−38,1` / `−57,5`)** : la mesure du § 2 montre qu'il n'y a pas de décalage
  de grandeur à réparer. Et le toucher dans le mauvais sens réveille le **mode de panne opposé,
  déjà payé le 17/09** : `{"ok":false,"secondes_captees":15,"erreur":"aucune parole detectee … ou
  seuil trop haut"}` (`observations-lya.jsonl`). Trop bas, le silence n'arrive jamais ; trop haut,
  il arrive tout le temps. **Un seul changement à la fois** (règle du fichier, l. 182).
- **`verifier-lya.mjs` (l. 271, `silence_ms: 1100`)** : c'est un **harnais de vérification**, pas un
  appelant de production. Changer le paramètre d'un test change ce que le test éprouve — décision
  à Gaëtan, pas à moi (§ 7).
- **`serveur-voix.py` l. 308 (veille locale, `silence_ms=1000`)** : autre usage, autre fil, et la
  veille est **inactive** (`/sante` : `veille.active = false`). Hors sujet ce soir.

---

## 5. Ce qui est vérifié, et ce qui ne l'est pas

### Vérifié (avec la mesure qui pourrait le démentir)

| Affirmation | Mesure |
|---|---|
| Les 2 fichiers modifiés étaient en **UTF-8 valide sans BOM** avant écriture | décodage strict UTF-8 : OK sur les deux |
| Sauvegardes **identiques à la source** | SHA-256 comparés : `identique = True` sur les deux |
| `serveur-voix.py` est **syntaxiquement valide** après édition | `ast.parse` : OK |
| **Seules 2 lignes pré-existantes** ont été touchées | `Compare-Object` contre la sauvegarde : **2 retirées**, nommément la signature et le défaut de la route. 17 lignes ajoutées (ma note datée). |
| Les fins de ligne n'ont pas été converties | `serveur-voix.py` : CR=0 / LF=1857. `assistant.html` : CR=1244 / LF=1244 (CRLF préservés). |
| Plus aucun `900` en défaut de silence | regex : `silence_ms=900` → **0** occurrence |
| `assistant.html` ne passe plus 1100 | `silence_ms: 1100` → **0** occurrence |
| **Le service n'a pas été interrompu** | pid 21892 vivant, `/sante` HTTP 200, `appels oreille = 1` — inchangé après chaque écriture |
| Le paramètre en vigueur est bien celui de l'appelant | `serveur-assistant.js` l. 970 `body: corps` : corps retransmis **brut** |
| Une page suffit à recharger le réglage | `serveur-assistant.js` l. 1100 `fs.readFile(cible, …)` : HTML **relu à chaque requête**, + `Cache-Control: no-store` (l. 1107) |

### Non vérifié — et je ne le présente pas comme fait

1. **Le comportement après le réglage.** Je n'ai **pas** parlé dans le micro : le défaut ne peut
   être déclaré corrigé qu'à l'oreille, par Gaëtan, sur une vraie phrase avec une vraie respiration.
   Ce que je garantis est le **mécanisme**, pas l'issue.
2. **La durée réelle de la respiration de Gaëtan.** Elle n'est **mesurée nulle part** : le WAV est
   écrasé à chaque tour (docstring, « le fichier WAV de la question est écrasé »). C'est le chiffre
   qui manque, et il manque à tout le monde (§ 8).
3. **L'onglet du navigateur.** Si la page est ouverte en ce moment, elle porte encore `1100`
   en mémoire : il faut **recharger** (F5). Non vérifiable d'ici.
4. **Que le réglage du défaut de `serveur-voix.py` soit un jour en vigueur** : il ne l'est pas
   (aucun rechargement à chaud, et **aucun appelant ne l'omet** aujourd'hui). Il est là pour que le
   prochain appelant ne réintroduise pas 1,1 s — **pas** parce qu'il gouverne quoi que ce soit.
5. **La trace de l'incident dans les journaux.** Je l'ai cherchée : `observations-lya.jsonl`
   s'arrête au **17/09 07h51**, `essai-Samus.jsonl` **n'existe pas** (le service l'annonce pourtant
   dans `/sante`), et aucun fichier d'observation ne porte de ligne datée du 19 ou 20/09.
   **La corroboration vient donc du compteur `oreille.appels` et du `duree_ms` partagé — pas d'un
   journal.** Je le dis plutôt que de laisser croire à une piste complète.
6. **L'effet du cumul avec le chantier voisin** (§ 6) : je n'ai pas relu en entier les 127 lignes
   ajoutées par l'autre script.

---

## 6. Ce qui s'est passé pendant que je travaillais — à savoir

`serveur-voix.py` **a été modifié par un autre script pendant ma session** : 1727 lignes après mes
éditions (95 085 o) → **1858 lignes (103 251 o)**, écriture à **04h12:35**. Le chantier voisin porte
sur l'**accusé de réception** (« ce que Samus vient d'entendre », publié vers le bandeau du poste) ;
il cite le **même** incident (`duree_ms: 21267`) sous un autre angle : *« elle ne m'a pas entendu »* —
le service avait transcrit, mais rien ne le montrait sur le poste.

**Mesure faite à 04h15** : mes trois modifications sont **intactes** (1 occurrence chacune), les
défauts de silence ne portent plus aucun `900`, et le service est vivant. Je n'ai rien écrasé, rien
n'a été écrasé.

**Conséquence de méthode, et elle est retenue** : ce fichier bouge, donc **une référence de ligne
y pourrit en quelques minutes**. Mes commentaires citent désormais la **ligne de code** autant que
son numéro (ex. la ligne `seuil_utilise = max(-75.0, min(-20.0, pic + 12.0))`, l. 1056) — un numéro
seul aurait été faux avant la fin de la nuit. Les numéros de cette fiche sont datés **04h15**.

---

## 7. La commande exacte pour redémarrer le service

### D'abord : est-ce nécessaire ? **NON — pas pour ce soir.**

- `assistant.html` est **relu à chaque requête** (`serveur-assistant.js` l. 1100 + `no-store`) :
  **un rechargement de page suffit** (F5). Aucun redémarrage.
- `serveur-voix.py` **ne se recharge pas à chaud** (`ThreadingHTTPServer` l. 1827,
  `serve_forever` l. 1843) : ses deux défauts modifiés ne seront en vigueur qu'au prochain démarrage —
  et ils **ne changent rien** aujourd'hui (§ 5.4). Le redémarrage peut donc attendre un moment
  choisi, pas subi.

### Si un redémarrage est décidé (à lancer **par Gaëtan**, pas par moi)

Ce que le processus est réellement, mesuré sur le pid 21892 :

```
Exécutable : C:\Users\neosp\AppData\Local\Programs\Python\Python312\python.exe
Ligne      : "…\python.exe serveur-voix.py"   (chemin relatif ⟹ dossier de travail = poste-local)
Démarré    : 19/09/2026 19:50:13
```

```powershell
# 1. arrêter (le pid change à chaque démarrage : le relire avant)
Stop-Process -Id 21892
Start-Sleep -Seconds 2

# 2. relancer, exactement comme le lanceur du studio (lancer-assistant.ps1, l. 126)
Start-Process -FilePath 'python' `
  -ArgumentList @('C:\IA\gl-digital-lab\poste-local\serveur-voix.py') `
  -WindowStyle Hidden -WorkingDirectory 'C:\IA\gl-digital-lab\poste-local'

# 3. vérifier — doit rendre HTTP 200 avec "port": 8150
Invoke-WebRequest -Uri 'http://127.0.0.1:8150/sante' -UseBasicParsing | Select-Object -Expand Content
```

⚠️ **`lancer-assistant.ps1` seul ne redémarre PAS le service** : il teste d'abord s'il répond
(l. 121 `Test-Voix`) et affiche « voix : déjà en marche ». Il faut **arrêter le processus d'abord**.

---

## 8. Le chiffre qui reste à mesurer

> **La durée, en millisecondes, de la plus longue pause de respiration de Gaëtan À L'INTÉRIEUR
> d'une phrase — c'est ce nombre qui décide si 1800 ms suffit.**

Personne ne l'a : le WAV est écrasé à chaque tour, et aucun journal ne conserve le motif avec la
durée du silence (l'observateur ne journalise que `secondes_captees` et `duree_ms`).

**Le protocole, mesurable en trois minutes, avec le même seuil que ce soir :**

```powershell
# 1. s'enregistrer 20 s en marquant une respiration au milieu d'une phrase
#    (le micro s'ouvre : à faire quand le service n'écoute pas et que Samus ne parle pas)
& ffmpeg -y -f dshow -i "audio=Microphone (Stealth 600X Gen 3)" -t 20 -ar 16000 -ac 1 "$env:TEMP\essai-pause.wav"

# 2. relire les silences, avec le seuil mesuré ce soir et la fenêtre en vigueur
& ffmpeg -hide_banner -nostdin -i "$env:TEMP\essai-pause.wav" `
  -af "silencedetect=noise=-38.1dB:d=0.7" -f null - 2>&1 | Select-String "silence_"
```

Chaque silence trouvé est rendu avec son `silence_start`, son `silence_end` **et** son
`silence_duration` : **le plus grand `silence_duration` à l'intérieur d'une phrase est le chiffre.**
S'il dépasse 1,8 s, mon réglage est encore trop court — et alors c'est ce nombre-là qu'il faudra
mettre dans `silence_ms`, pas un autre jugé « raisonnable ».

*Réserve honnête* : le seuil est recalibré à chaque écoute, donc `-38.1` est le seuil **de ce
soir**, pas une constante. Le protocole le dit, il ne le cache pas.

---

## 9. Ce que j'ai modifié, en une table

| Fichier | Ligne | Avant | Après |
|---|---|---|---|
| `poste-local\assistant.html` | **1085** | `silence_ms: 1100` | **`silence_ms: 1800`** + note datée (l. 1074-1084) |
| `poste-local\serveur-voix.py` | **981** | `silence_ms=900` | **`silence_ms=1800`** |
| `poste-local\serveur-voix.py` | **1618** | `"silence_ms") or 900` | **`"silence_ms") or 1800`** |
| `poste-local\serveur-voix.py` | 1023-1035 | — | note datée (mécanisme, mesure, inertie du défaut) |

**Sauvegardes, à la convention du studio, faites AVANT toute écriture :**

- `serveur-voix.py.avant-seuil-respiration-2026-09-20` — 93 872 o
- `assistant.html.avant-seuil-respiration-2026-09-20` — 60 427 o

Restaurer (nom repris du disque, jamais retapé) :

```powershell
Get-ChildItem 'C:\IA\gl-digital-lab\poste-local\' -File |
  Where-Object { $_.Name -like '*avant-seuil-respiration-2026-09-20' } |
  ForEach-Object { Write-Output ("restaurerait : " + $_.Name) }
```

---

*GL Digital Lab — **20/09/2026**, EVA-01. Service vocal **non arrêté, non redémarré** (pid 21892
vivant, vérifié après chaque écriture). Aucune donnée de conversation recopiée : seuls des durées,
des motifs et des noms de fichiers figurent ici. Aucun fichier du vault touché. Aucun contenu de
licence protégée. Écrit par Trinity (preset `metroid`) sur un chantier qui n'est pas son périmètre
habituel — tout est daté et commenté sur place, et **rien n'est commité**.*

**Un piège payé, et il est de moi** : ma première édition a échoué parce que j'avais recopié
`secondes_captees` à la main alors que le disque porte `secondes_capturees` (coquille de la
docstring, **l. 1025** — 1 occurrence contre 8 de l'autre graphie). *Un nom recopié à la
main, même dans une commande, est un nom qu'on n'a pas lu.* Je n'ai pas corrigé la coquille : hors
périmètre.
