# Chantier — l'accusé de réception : ce que Samus a entendu, et qui se voit

**Date :** 20/09/2026 · **Machine :** EVA01 (utilisateur `neosp`) · **Auteur :** Trinity
**Fichiers touchés :** `serveur-voix.py`, `bandeau-poste.ps1`, `assistant.html` (dans `C:\IA\gl-digital-lab\poste-local\`)
**Sauvegardes :** `<nom>.avant-accuse-reception-2026-09-20`, à côté de chaque fichier
**Services arrêtés ou redémarrés : AUCUN** — les commandes sont écrites, pas exécutées (§ 6)

---

## 1. Le défaut, tel qu'il a été mesuré

Gaëtan a parlé à son assistante. Le service a **parfaitement** transcrit sa phrase : la réponse
portait `{"ok":true,"parole_detectee":true,"texte":"…","duree_ms":21267,"micro":"Microphone (Stealth 600X Gen 3)"}`,
et le compteur `oreille.appels` de `/sante` est passé de 0 à 1 (relevé à 2 pendant ce chantier).

**Et il a conclu : « elle ne m'a pas entendu ».**

Il a conclu ça parce que **rien ne lui a montré qu'elle avait entendu**. Le défaut est humain
avant d'être technique : *un service qui a entendu sans le dire n'a pas entendu.*

Deux surfaces existaient, et **aucune des deux ne portait la preuve** :

| Surface | Ce qu'elle montrait | Mesure |
|---|---|---|
| La page (`assistant.html`) | `Entendu · 2,3 s · 21267 ms` — **des durées, pas la phrase** | ligne 1089 avant modification ; le texte était pourtant dans `d.texte` |
| Le bandeau du Bureau (`bandeau-poste.ps1`) | `je suis là et je t'écoute` — un état générique | il ne lisait **que** `/api/sante`, `/api/voix/sante` et `/api/sonder` |

Le chemin manuel (`/ecouter`, bouton 🎙) affichait bien `Entendu : « … »` (ligne 846). C'est donc
**l'écoute continue** — celle que Gaëtan utilise — qui perdait la phrase. *Un accusé de réception
qui ne porte pas la phrase n'est pas un accusé de réception.*

---

## 2. Le pattern choisi, et pourquoi celui-là

**Observer, avec conflation sur un slot unique.**

- **Le sujet** est `serveur-voix.py` : au moment où une transcription aboutit, il **publie** l'état
  « voici ce que je viens d'entendre » dans **un seul slot**.
- **L'observateur** est `bandeau-poste.ps1` : il **lit** à sa cadence (les 5 s qui existaient déjà) et affiche.
- **Conflation** : un observateur lent n'a pas besoin de tous les événements, il a besoin du **dernier**.
  Un slot, écrasé à chaque tour — **jamais une ligne de plus**.

**Pourquoi pas un journal d'événements** (l'autre candidat naturel) : parce que la règle écrite du
studio l'interdit — *« aucun journal de conversation, on mesure des durées, jamais des contenus »*
(`serveur-voix.py`, en-tête, et `/sante` qui le déclarait). Un journal accumule ; un slot ne se
souvient que du dernier tour, et il meurt à l'échéance. **C'est la forme qui rend la règle tenable,
pas une promesse.**

**Pourquoi l'observateur lit un FICHIER et non une route HTTP :** parce que la preuve qu'elle a
entendu ne doit pas disparaître avec le serveur de l'assistante. Et parce que ça n'ajoute **aucune
route** à `serveur-assistant.js` — donc aucun redémarrage de plus. *C'est aussi la seule copie de la
mécanique : le publieur écrit, l'observateur lit, personne ne réimplémente.*

### ⚠️ Ce que ce n'est PAS — et il faut le dire, parce que c'est le piège voisin

Ce n'est **pas un voyant de micro**. Gaëtan a refusé ce voyant-là : *« je lève ou je baisse ma perche,
je sais quand il est ouvert. »* Ce qui est publié et affiché ici, c'est ce que **l'ASSISTANTE a perçu**.
Jamais l'état du matériel de Gaëtan. La distinction n'est pas cosmétique : le refus portait sur un
affichage de **son** matériel, la demande porte sur la **perception de l'assistante**.

---

## 3. Ce que j'ai réutilisé tel quel (lu, pas deviné)

| Brique | Rôle ici | Où elle vit |
|---|---|---|
| `bandeau-poste.ps1` | **le** support visible du Bureau : fenêtre WinForms épinglée, déplaçable, charte D1 | déjà en place depuis le 17/09 |
| Sa cadence de 5 s (`-Intervalle`) | la boucle d'observation | elle existait ; on ne l'a pas accélérée |
| Son mode `-Essai` | mesure **sans fenêtre**, en JSON : c'est ce qui a permis d'éprouver l'observateur sans écran | préexistant |
| Son mode `-Verifier` | la fenêtre **se mesure elle-même** en Win32 et rend un rapport | préexistant ; deux champs ajoutés |
| `tempfile.gettempdir()` (déjà utilisé par `WAV_QUESTION`) | l'emplacement du slot, **hors du dossier servi** | `serveur-voix.py` l. 469 |
| `New-Object System.Text.UTF8Encoding($false)` | écriture UTF-8 sans BOM | déjà utilisé par `bandeau-position.json` |
| Le journal d'observation (`observer()` de `serveur-assistant.js`) | il enregistre déjà `voix_ecouter-auto` avec `caracteres` et `secondes_captees` — **des mesures, jamais un contenu** | **non touché** : c'est la règle, et elle est déjà tenue là |
| `purge_voix.py` | il purge **ce qui se prononce** (markdown, chemins, emoji) — **un autre métier que le mien** | **non touché** : lire avant d'écrire a évité de le détourner |

Ce qui était réutilisable **tel quel, sans une ligne de plus** : le bandeau, sa cadence, ses deux modes
de mesure, le proxy `/api/voix/*` de `serveur-assistant.js`, et `port-voix.json`.

---

## 4. Ce que j'ai écrit

### 4.1 `serveur-voix.py` — le publieur (le sujet)

Inséré après `journaliser_essai` (l. 447-458) :

- `FICHIER_ENTENDU = <tempdir>\Samus-entendu-poste.json` — **un seul slot**, hors du dossier servi et hors du dépôt ;
- `ENTENDU_TTL_S = 120` — la durée de conservation, **publiée dans l'entrée** (`expire_le`) ;
- `publier_entendu(texte, langue, secondes, duree_ms, oreille_ms, motif, origine)` :
  écriture **atomique** (fichier temporaire + `os.replace`), **ne lève jamais**, et **ne publie rien si le texte est vide**
  (une transcription rejetée — hallucination filtrée — ne doit pas s'afficher comme si elle avait été dite) ;
- deux appels : dans `/ecouter` (« écoute manuelle ») et dans `/ecouter-auto` (« écoute continue »),
  **après** `journaliser_essai`. Le `motif` est publié avec la phrase : `fin de phrase detectee`
  prouve que la coupure vient de **lui**, pas du garde-fou des 20 s ;
- `ETAT["entendu_publies"]` — un compteur, public comme les deux autres ;
- **`/sante` corrigé** : il disait `"journal_de_conversation": "aucun — seules des durées sont mesurées"`.
  C'était vrai, et ça ne l'est plus tout à fait. La ligne **déclare maintenant l'exception, le fichier
  et la durée**, et une clé `entendu` expose les publications, le chemin, le TTL et l'observateur.
  *Un contrôle qui aurait gardé l'ancienne phrase aurait été menteur — et un contrôle qui ment est pire
  qu'un contrôle absent, parce qu'on le croit.*

### 4.2 `bandeau-poste.ps1` — l'observateur (qui affiche **et qui efface**)

- `$FEntendu` — le même chemin, **mesuré avant d'être écrit** :
  `python` rend `C:\Users\neosp\AppData\Local\Temp`, `.NET` rend `C:\Users\neosp\AppData\Local\Temp\`.
  *Un chemin deviné aurait donné un bandeau définitivement muet, sans erreur.*
- `HeureAffichee()` — accepte une vraie date **ou** une chaîne : `ConvertFrom-Json` rend tantôt l'une,
  tantôt l'autre, et un `.Substring(11)` sur une `[datetime]` aurait levé au premier tour.
- `Lire-Entendu()` — rend `vivant` / `efface` / `illisible` / `$null` :
  - **vivant** : la phrase, son horodatage, sa provenance, la durée, le micro ;
  - **efface** : l'échéance est passée → il **efface le champ `texte`** et garde la preuve
    (`quand`, `secondes_captees`, `duree_ms`, `motif`, `efface_le`, `efface_par`) ;
  - **illisible** : le slot existe mais ne se lit pas → **on le dit**, on ne fait pas semblant ;
  - **comparaison d'identifiant avant d'écrire** : il n'efface que l'entrée **qu'il a vue**.
    *Une entrée plus récente n'est jamais écrasée par un effacement en retard.*
- `Mesurer()` lit le slot **en premier, sur le disque** (pas par le réseau) : si le serveur de
  l'assistante tombe, la preuve qu'elle a entendu ne tombe pas avec lui.
- `Rendre()` : l'en-tête dit **`je t'ai entendu à HH:MM:SS`**, et le corps porte en premier
  `👂 entendu à … · N s de voix · tour N ms`, puis `« la phrase »`, puis `coupé sur : …`,
  puis `effacé à HH:MM:SS — slot unique, hors du dossier servi`. **La hauteur de la fenêtre suit le
  contenu**, mesurée par GDI (`TextRenderer.MeasureText` + `WordBreak`) et non devinée.
- `-Verifier` rend deux mesures de plus : `accuse_affiche`, `hauteur_texte`, `hauteur_corps`, `texte_tient`.

### 4.3 `assistant.html` — la page

Ligne 1089 remplacée : `dire('Entendu · … ms')` → `dire('👂 Entendu : « ' + d.texte + ' » · … s de voix · … ms de tour')`.
Aucune autre modification. **Effet immédiat, sans redémarrage** : le serveur lit la page **à chaque
requête** (`fs.readFile`, l. 1100) avec `Cache-Control: no-store` — mesuré dans `serveur-assistant.js`.
Un simple F5 suffit.

### 4.4 L'épreuve — `epreuve-accuse-reception.py`

À côté de cette fiche : elle **n'ouvre pas le micro** et ne touche à aucun service. Six étapes, dont la
dernière substitue l'oreille et le transcripteur pour appeler **la vraie `do_POST`** de `/ecouter-auto` :

```
python epreuve-accuse-reception.py            # écrit, relit, éprouve la route
python epreuve-accuse-reception.py --sante    # /sante du nouveau code, sans charger Whisper
python epreuve-accuse-reception.py --nettoyer # efface le slot d'épreuve
```

---

## 5. La vie privée — l'exception, ses bornes, et la mesure qui la tient

**Si du contenu est écrit quelque part, c'est ici, et c'est dit :** dans
`%TEMP%\Samus-entendu-poste.json`, un **seul** slot, écrasé au tour suivant.
**Ce n'est pas un magnétophone** : un seul enregistrement, celui du dernier tour, avec une durée de vie.

Trois bornes, et chacune est vérifiable :

1. **Un seul slot, hors du dossier servi.** La phrase survit au tour suivant, pas à deux.
   Le dossier `poste-local\` est **servi** par le serveur HTTP (`EXTENSIONS_SERVIES` accepte `.json`) :
   un fichier posé là aurait été **lisible par le réseau**. Le slot est donc dans `%TEMP%`.
2. **Une durée**, publiée dans l'entrée (`expire_le = quand + 120 s`) — une **seule** définition de
   la règle, chez le publieur ; l'observateur ne l'invente pas.
3. **L'effacement après affichage, fait par l'observateur, et éprouvé.** Ce n'est pas une intention,
   c'est une mesure :

```
04:13:01  publication (épreuve)  →  expire_le 04:15:01, texte présent
04:14:57  le bandeau lit         →  sorte "vivant", phrase affichée
04:15:06  le bandeau relit       →  sorte "efface", fait=true
          sur le disque          →  "texte": ""            (les mots sont partis)
                                     "efface_le": "2026-09-20 04:15:06"
                                     "efface_par": "bandeau-poste.ps1 (observateur)"
                                     "quand", "secondes_captees", "duree_ms", "motif"  (la preuve reste)
```

Le slot d'épreuve a été **effacé après le chantier** (`--nettoyer` → *slot restant : non*) :
le poste n'a plus aucun texte d'essai sur le disque.

**Le trou, et il est nommé :** si le bandeau n'est pas lancé, personne n'efface. Le texte reste alors
dans `%TEMP%` **jusqu'à la phrase suivante** (qui écrase le slot) ou jusqu'au nettoyage de `%TEMP%`.
Il est borné (un fichier, une phrase, une machine), mais il n'est pas vide.
**Pour l'effacer à la main, maintenant :**

```powershell
Remove-Item -LiteralPath (Join-Path ([System.IO.Path]::GetTempPath()) 'Samus-entendu-poste.json')
```

**Aucune donnée de tiers, aucune route distante, aucun vault, aucun conteneur, aucun secret touché.**
Le journal d'observation (`observations.mjs`) continue de ne recevoir que des longueurs et des durées.

---

## 6. Comment le lancer — les commandes exactes, **non exécutées**

> ⚠️ **Rien n'a été arrêté ni redémarré.** Le service de voix (pid 21892, port 8150) tourne
> **toujours sur le code d'avant**, chargé en mémoire : mesuré à 04:17, son `/sante` porte encore
> l'ancienne phrase et **n'a pas** la clé `entendu`. Le code sur le disque, lui, est à jour.
> C'est Gaëtan qui décide du moment — ce sont ses oreilles et sa voix qui sont en service.

**① La page — immédiat, aucun redémarrage :**

```
F5 sur http://127.0.0.1:8133
```
Le serveur relit le fichier à chaque requête (`fs.readFile`, `Cache-Control: no-store`).

**② L'oreille et la voix — nécessaire pour que la publication existe :** dans un PowerShell,

```powershell
# le pid est LU dans le fichier, jamais recopié à la main
$p = (Get-Content 'C:\IA\gl-digital-lab\poste-local\port-voix.json' -Raw | ConvertFrom-Json).pid
Stop-Process -Id $p
Start-Process -FilePath 'python' `
  -ArgumentList @('C:\IA\gl-digital-lab\poste-local\serveur-voix.py') `
  -WindowStyle Hidden -WorkingDirectory 'C:\IA\gl-digital-lab\poste-local'
```
Le modèle d'oreille se recharge (~1,5 s) et Piper se remet en mémoire (~2 s) — c'est le démarrage
normal du service, celui que fait déjà le lanceur du poste.

**③ Le bandeau — il n'est PAS à l'écran en ce moment** (mesuré : aucun processus `bandeau-poste.ps1`) :

```
C:\IA\gl-digital-lab\poste-local\Lancer l'assistant.cmd
```
Le lanceur ne redémarre pas ce qui tourne déjà : après ②, il verra la voix debout et n'ouvrira que le bandeau.
S'il est déjà à l'écran : **Échap** pour le fermer, puis relancer.

**④ Voir la mesure sans rien casser** (n'affiche rien, ne parle pas, ne prend aucun micro) :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File 'C:\IA\gl-digital-lab\poste-local\bandeau-poste.ps1' -Essai
powershell -NoProfile -ExecutionPolicy Bypass -File 'C:\IA\gl-digital-lab\poste-local\bandeau-poste.ps1' -Verifier
```
`-Verifier` affiche la fenêtre **0,7 s** puis la ferme, et écrit `bandeau-verification.json` à la racine
du dépôt. ⚠️ **Il réécrit aussi `bandeau-position.json`** : si le bandeau est un jour déplacé sur le
2ᵉ écran, cette commande le remet à la position par défaut (haut-droite, DISPLAY1).

---

## 7. Ce que ce chantier n'établit PAS

1. **Qu'une vraie phrase passée au micro arrive jusqu'au bandeau.** L'épreuve substitue l'oreille
   (`enregistrer_jusqu_au_silence`) et Whisper (`transcrire`) par des doublures, et le service en cours
   n'est pas celui du disque. **Il manque UNE phrase réelle après le redémarrage de ②.** C'est la seule
   vérification qui vaille pour l'objectif, et elle demande un humain.
2. **Le rendu visuel du bandeau.** La géométrie est mesurée en Win32 (470 × 213, dans l'écran,
   topmost), la hauteur du texte est mesurée par GDI (168 px pour 11 lignes) — mais **je n'ai pas
   regardé l'écran**, et aucun test ne remplace l'œil. Aucune capture n'a été faite : capturer le
   Bureau d'une machine en service est une collecte, pas une vérification.
3. **Le non-chevauchement du texte et de l'en-tête.** Mesuré dans un banc isolé : le label `Dock=Fill`
   revendique **toute** la hauteur du formulaire (`Top=0`, `Height=213`) alors que l'en-tête et la règle
   sont dockés par-dessus. Les chiffres tiennent dans **les deux** lectures (168 px de texte pour
   213 px de cadre, ou pour 185 px si l'en-tête en prend 28) — donc *texte_tient* est vrai, mais je
   n'ai pas résolu la superposition elle-même. **Ce défaut, s'il existe, est antérieur à ce chantier**
   (le bandeau fonctionne ainsi depuis le 17/09) et je ne l'ai pas touché : le corriger serait un
   changement de mise en page non demandé.
4. **Que le compteur `oreille_appels` compte les phrases publiées.** Ce sont deux compteurs distincts
   (`oreille_appels` compte les transcriptions, `entendu_publies` les publications). Une phrase
   transcrite mais **vide après filtrage d'hallucination** incrémente le premier et pas le second.
5. **Rien sur le canal Discord.** `/transcrire` (l'oreille du salon vocal) **ne publie pas** sur le
   Bureau, et c'est délibéré : la surface est le poste de Gaëtan, pas un salon public. Si le besoin
   existe, c'est une décision à prendre, pas un oubli à réparer.
6. **Le cas « rien entendu ».** Quand `/ecouter-auto` rend `parole_detectee: false`, **rien n'est publié** :
   le bandeau ne dit rien. C'est le périmètre demandé, et j'ai écarté le reste **exprès** — un message
   « aucune parole détectée » sur le Bureau ressemblerait au voyant de micro que Gaëtan a refusé.
   *Le défaut voisin est plus dangereux que le défaut qu'on répare.*
7. **L'effacement n'est pas atomique côté observateur.** Fenêtre de quelques millisecondes entre la
   relecture et la réécriture. Conséquence bornée et **conservatrice** : elle peut perdre un
   effacement ou un accusé, **jamais garder le texte, jamais écraser une publication** (le publieur,
   lui, écrit par remplacement atomique).
8. **L'identifiant revient en `[datetime]`** dans le bandeau (`ConvertFrom-Json` convertit les chaînes
   datées). L'égalité tient parce que les deux côtés subissent la même conversion — mais deux entrées
   publiées **dans la même seconde** pourraient avoir le même identifiant. Conséquence : un accusé
   effacé trop tôt dans cette seconde-là. Jamais un texte conservé.

---

## 8. Deux choses trouvées en chemin, et qui ne sont pas de mon chantier

1. **⚠️ Un autre chantier écrivait dans les MÊMES fichiers pendant que je travaillais.**
   Mesuré : `serveur-voix.py` réécrit à **04:11:03** et `assistant.html` à **04:11:13**, par un
   chantier « seuil-respiration » (ses sauvegardes `.avant-seuil-respiration-2026-09-20` sont dans le
   dossier ; le diff porte `silence_ms` 900 → 1800). Mes sauvegardes ont donc capturé **leur** version,
   et mes modifications sont des remplacements **ciblés** (chaînes littérales uniques), pas des
   réécritures de fichier — les deux changements cohabitent. **Ce n'était pas coordonné, et ça aurait
   pu se perdre** : deux agents sur un même fichier, sans verrou, dans une nuit de travail.
2. **Le bandeau s'appelle encore « Lya »** (`$form.Text`, `$titre.Text`, et l'en-tête du fichier)
   alors que le renommage en **Samus** a été décidé le 18/09. **Je ne l'ai pas touché** : ce n'est pas
   mon chantier, et c'est exactement le genre de retouche qui se marche dessus. À faire, à froid.

## 9. Trois pièges payés pendant ce chantier (et écrits là où ils serviront)

1. **Le BOM UTF-8 du `.ps1` a sauté à la première écriture.** Le lanceur appelle `powershell`
   (**5.1**, vérifié : `System32\WindowsPowerShell\v1.0\powershell.exe`), qui lit un `.ps1` **sans BOM
   en cp1252** → accents transformés en hiéroglyphes. Mesuré dans un banc isolé. Le BOM a été remis
   **au niveau de l'octet** (aucune réécriture du texte), et relu sous 5.1 : accents corrects.
   `assistant.html` et `serveur-voix.py` sont **sans** BOM et le restent.
2. **`[Heure-De]` n'est pas un nom de type**, et les arguments d'un appel de méthode ne continuent pas
   à la ligne : un `+` en **début** de ligne suivante fait conclure au parseur que l'appel est fini
   (*« Parenthèse fermante manquante »*, 12 erreurs). Les deux formes qui marchent : l'opérateur en
   **fin** de ligne, ou une variable intermédiaire.
3. **Mon propre instrument m'a menti.** Un `Get-CimInstance` filtrant sur `bandeau-poste.ps1` a compté
   **mon propre processus de mesure** : le compte est passé de 0 à 1 sans qu'aucun bandeau n'existe —
   parce que la ligne de commande du filtre contenait le nom cherché. *Quand un contrôle crie, on
   vérifie l'instrument* (loi 20). Le filtre porte maintenant sur `-File` et exclut le pid courant.
4. *(bonus)* **`python -m py_compile` ne suffit pas** : `serveur-voix.py` importe `purge_voix`, donc
   lancé depuis un autre dossier il lève `ModuleNotFoundError`. Le fichier le dit déjà lui-même :
   *« le parseur est un collègue : il crie avant le client — mais il ne lit pas à la place du client. »*

---

## 10. Vérifié / non vérifié

### ✅ Vérifié (mesuré, reproductible)

- **Le publieur écrit vraiment** — exécuté, pas seulement compilé : slot relu sur le disque,
  622 octets UTF-8, `id`, `quand`, `expire_le`, `ttl_s`, `langue`, `secondes_captees`, `duree_ms`,
  `motif`, `micro`, `origine`, `ecrit_par`, `lu_et_efface_par`.
- **Un texte vide ne publie rien** (transcription rejetée ≠ phrase dite).
- **L'écriture est atomique** (temporaire + `os.replace`), et le slot est **hors du dossier servi**.
- **La chaîne sujet → observateur fonctionne** : la route publie, le bandeau lit — vérifié **sous
  PowerShell 5.1**, le lanceur réel, accents compris.
- **L'effacement après affichage est réel** : à l'échéance publiée (04:15:01), le texte a disparu à
  04:15:06 et la preuve (durée, motif, horodatage, effaceur) est restée.
- **La route `/ecouter-auto` appelle le publieur** : `do_POST` exécutée pour de vrai, oreille et
  transcripteur doublés, `→ la route /ecouter-auto publie : True`, provenance publiée
  « ta voix — micro du poste (écoute continue) ». **Sans micro, sans toucher au service.**
- **La fenêtre se mesure** : 470 × 213, `visible: true`, `topmost_win32: true`, `dans_l_écran: true`,
  `mot_de_l_entete: "je t'ai entendu à 04:15:38"`, `accuse_affiche: true`, `hauteur_texte: 168`,
  `texte_tient: true`.
- **La correction de la hauteur était nécessaire** : `PreferredHeight` rendait **169 px** là où GDI
  mesure **168 px de texte** dans **213 px** de cadre — la dernière ligne aurait été coupée.
- **Le `.ps1` a 0 erreur de syntaxe** (parseur PowerShell) et le BOM est en place (EF BB BF).
- **La page a 0 erreur de syntaxe**, à l'identique de sa version d'avant (contrôle **différentiel**).
- **`/sante` du nouveau code déclare l'exception** (importé, aucun modèle chargé) — donc aucun job GPU.
- **Rien n'a été arrêté** : pid 21892 vivant, port 8150, avant et après le chantier.
- **Le poste ne garde aucun texte d'épreuve** : slot supprimé, `.pyc` supprimé.

### ⚠️ Non vérifié

- **Une phrase réelle au micro, de bout en bout** — c'est la seule preuve qui compte, et elle attend
  le redémarrage de ② et une phrase de Gaëtan.
- **Le rendu visuel** (repli du texte, lisibilité, non-chevauchement de l'en-tête) : non regardé.
- **Le comportement de `Lancer l'assistant.cmd`** après arrêt de la voix : lu dans le script
  (`Test-Voix`, `Test-Bandeau`), **pas exécuté**.
- **Le bandeau sous 5.1 en usage prolongé** (les deux modes de mesure ont tourné sous 5.1 ; la boucle
  5 s en continu, non).
- **`verifier-lya.mjs`** n'a pas été étendu : son épreuve `--micro` reste la seule à vérifier la chaîne
  oreille de bout en bout, et elle n'inspecte pas le slot. À faire si Gaëtan veut que l'épreuve du poste
  couvre l'accusé de réception.

---

## 11. La commande que Gaëtan doit lancer pour le voir

```powershell
# 1) redémarrer l'oreille et la voix (le pid est lu dans le fichier, pas recopié)
$p = (Get-Content 'C:\IA\gl-digital-lab\poste-local\port-voix.json' -Raw | ConvertFrom-Json).pid
Stop-Process -Id $p
Start-Process -FilePath 'python' -ArgumentList @('C:\IA\gl-digital-lab\poste-local\serveur-voix.py') `
  -WindowStyle Hidden -WorkingDirectory 'C:\IA\gl-digital-lab\poste-local'

# 2) remettre le bandeau du Bureau à l'écran
& 'C:\IA\gl-digital-lab\poste-local\Lancer l''assistant.cmd'
```

puis **parler**, et regarder le coin haut-droit : l'en-tête doit passer à
**« je t'ai entendu à HH:MM:SS »** et la phrase s'afficher sous ses propres yeux, avec sa durée de voix,
son motif de coupure, et l'heure à laquelle elle sera effacée.

**Aucune parole, aucun accusé** — c'est le principe même : la ligne n'apparaît que si elle a entendu.
Et dans la fenêtre de l'assistante, le **F5** suffit : la phrase s'y affiche dès maintenant.
