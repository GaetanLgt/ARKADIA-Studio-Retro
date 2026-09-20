# Chantier — envoi automatique après silence dans l'interface DSH

> **Date** : 20/09/2026 (heure de la machine).
> **Machine** : EVA-01, utilisateur `neosp`.
> **Auteur** : Trinity (preset `metroid`).
> **Demande de Gaëtan, mot pour mot** : « Je veux que quand j'arrête de parler, il fasse l'envoi
> automatique au niveau du port 3080, sur la page. Ça me saoule de devoir appuyer à chaque fois sur
> le bouton quand j'ai fini de parler. »
> **État des services** : **rien n'a été arrêté, rien n'a été redémarré, aucun conteneur, aucun
> vault, aucun secret touché.** Le harnais n'a **pas** été modifié — aucun de ses fichiers n'a été
> écrit. Aucun fichier existant n'a été modifié non plus : la sauvegarde `<nom>.avant-<raison>-2026-09-20`
> n'a donc **pas** eu lieu d'être, et c'est un fait à vérifier, pas une promesse (voir § 7).

---

## 0. UNE CORRECTION À FAIRE AVANT TOUT : le « seuil de 13,5 s » n'existe pas

Le brief de ce chantier annonçait : *« la détection de fin de phrase s'est déclenchée après
13,5 secondes »*, et en tirait un plancher : « ne descends pas sous 13,5 s ».

**C'est une erreur de lecture, et elle aurait fabriqué une deuxième version fausse.** La source est
`chantier-seuil-parole-2026-09-20.md` (même dossier), relue ligne à ligne :

| Ce que dit la source | Où | Ce que ça veut dire |
|---|---|---|
| `"secondes_captees":13.5`, `"duree_ms":21267` | l. 18-19 | 13,5 s = **durée de PAROLE captée**, pas un seuil |
| « 0,45 s de calibration + 13,5 s de capture + ~7 s de whisper ≈ 21,3 s » | l. 29 | la décomposition du tour |
| **« Il a donc cessé d'être écouté à 12,4 s de parole. »** | **l. 30** | la coupure a eu lieu **pendant** la parole |
| `silence_ms: 1800` dans `assistant.html` l. 1085 — **« C'EST LA VALEUR EN VIGUEUR »** | l. 126 | le seuil de silence était **1,8 s** |

**Donc : la seule valeur que la mesure condamne est 1,8 s.** Le 13,5 s ne condamne rien — un seuil de
13,5 s n'a jamais été en vigueur nulle part. La conclusion pratique change du tout au tout : il n'y a
pas de plancher à 13,5 s, il y a un **ancrage mesuré à 1,8 s** (insuffisant, démontré) et **rien de
mesuré au-dessus**.

---

## 1. Ce qui a été écrit, et où

| Fichier | Rôle | Taille mesurée |
|---|---|---|
| `userscripts\dsh-envoi-automatique.user.js` | le userscript (livrable principal) | 22 089 o |
| `userscripts\verifier-logique.mjs` | contrôle de la logique de décision (rejouable) | 7 067 o |
| `userscripts\verifier-selecteurs.mjs` | contrôle des sélecteurs contre le harnais installé (rejouable) | 5 599 o |
| `chantier-envoi-automatique-2026-09-20.md` | la présente fiche | — |

*Tailles mesurées le 20/09/2026, après la dernière écriture des fichiers — pas avant.*

**Pourquoi ce dossier ?** `C:\Users\neosp\Desktop\ARKADIA Studio Retro\userscripts\`
- **hors du harnais** : rien n'est écrit dans `C:\Users\neosp\AppData\Roaming\npm\node_modules\@deepseek-ai\dsh\`,
  donc aucune reconstruction, et l'URL que Gaëtan utilise en direct n'est pas touchée ;
- **dans l'arbre du studio**, à côté des autres chantiers du 20/09, donc sauvegardé et relisible ;
- **un fichier `.user.js`**, donc chargeable tel quel par un gestionnaire de userscripts, et
  supprimable d'un `Suppr`.

⚠️ **Aucun nom de fichier de ce chantier n'a été recopié à la main** : les chemins des bundles
contrôlés sont **découverts sur le disque** par `verifier-selecteurs.mjs`.

---

## 2. (a) Les sélecteurs DOM, tels qu'établis, avec la preuve

### 2.1 Comment ils ont été établis — et pourquoi pas autrement

**La page servie n'a pas pu servir de preuve.** Mesure :

```
Invoke-WebRequest http://127.0.0.1:3080
→ dsh web authentication required; reopen the URL printed by dsh web.
```

Et même avec le jeton, la réponse ne dirait rien du DOM : le HTML servi est une coquille vide —
`<div id="root"></div>` (679 o, lu dans `…\dsh-web-frontend\dist\index.html`) — tout le DOM est
construit par React dans le navigateur. **Chercher les sélecteurs là-dedans aurait été deviné, pas
mesuré.**

**Le chemin réellement suivi** : lire le **bundle installé**, c'est-à-dire le code qui *fabrique* le
DOM.

Piège rencontré et payé : le bundle principal de l'interface (`index-BKQ_L1z6.js`, 555 926 o) **ne
contient pas le champ de saisie**. Il porte 15 occurrences de `textarea`, dont **14 sont des internes
de React** et la 15ᵉ un presse-papier (`document.createElement("textarea")`), et **0** occurrence de
`contenteditable` appartenant à l'application. Conclure « le champ est un textarea » depuis là aurait
été faux. Le champ vit dans un **greffon client** : le paquet **`@deepseek-ai/dsh-client-ui-conversation`**,
`lib\client.js`, **647 101 octets** (chemin découvert sur le disque par le contrôle, pas écrit à la main).

### 2.2 Les sélecteurs

| Rôle | Sélecteur | Nature | Stabilité |
|---|---|---|---|
| **Le champ de saisie** | `[data-composer-input]` | attribut **écrit par l'application** | **stable** |
| La carte qui le contient | `[data-composer-card]` | attribut applicatif | stable |
| Le siège du composeur | `[data-composer-seat]` | attribut applicatif | stable |
| Le placeholder | `[data-composer-placeholder]` | attribut applicatif | stable |
| **Le bouton d'envoi** | dernier `button` de la carte dont une classe finit par **`_primary`** | classe **hachée au build** | **instable** — voir § 2.4 |
| Le bouton d'arrêt | **la même** classe `_primary` | classe hachée | instable |

**Preuves brutes, relevées dans `lib\client.js` du paquet ci-dessus :**

1. Le champ est un éditeur **Lexical** en `contenteditable`, et il porte un attribut explicite :

```js
function ComposerContentEditable({ editor, editable, ...rest }) { … }
  return jsx("div", {
    ref,
    contentEditable: editor !== null && editable,
    role: "textbox",
    "aria-multiline": "true",
    "data-composer-input": true,      // ← l'ancre du userscript
    ...rest
  });
```

2. La carte, là où le texte est dessiné :

```js
jsx("div", { className: clsx(InputBar_module_css_default.card, …),
             "data-composer-card": true, … })
  … jsx(ComposerContentEditable, { editor, editable,
        className: clsx(InputBar_module_css_default.input, …),
        "data-placeholder": placeholderText, … })
```

3. La correspondance de classes hachées (relevée dans le bundle, **pas supposée**) :

```js
var InputBar_module_css_default = {
  "card":    "uV2eYG_card",
  "input":   "uV2eYG_input",
  "primary": "uV2eYG_primary",     // ← le suffixe _primary est ce que le script cherche
  … };
```

4. Le bouton d'envoi et sa **classe partagée avec le bouton d'arrêt** — c'est le piège du chantier :

```js
// bouton d'ARRÊT (rendu seulement si `interruptible`)
jsx("button", { className: InputBar_module_css_default.primary,
                "aria-label": t("input.stop"), disabled: stop === void 0,
                onClick: stop, … })
// bouton d'ENVOI — même classe, rendu APRÈS dans l'ordre du DOM
jsx("button", { className: InputBar_module_css_default.primary,
                "aria-label": primaryLabel, disabled: primaryDisabled,
                onClick: onPrimary, … })
```

Le bundle porte exactement **2** occurrences de `InputBar_module_css_default.primary` — c'est ce que
le contrôle `verifier-selecteurs.mjs` vérifie (13ᵉ affirmation), parce que **c'est ce qui distingue le
bon bouton du mauvais**.

5. La voie de repli (touche Entrée), qui est le geste que Gaëtan fait aujourd'hui :

```js
editor.registerCommand(cn$1 /* KEY_ENTER_COMMAND */, (event) => {
  if (event?.shiftKey === true) return false;
  …
  if (!handlers.canSubmit()) return true;
  handlers.submit(event?.ctrlKey === true || event?.metaKey === true);
  return true;
}, 4);
```

6. Les libellés localisés (l'interface peut être en chinois **ou** en anglais — les deux dictionnaires
sont dans le bundle) :

```
"input.stop": "Stop generating"   /   "input.stop": "停止生成"
"input.send": "Send message"      /   "input.send": "发送消息"
"input.send.queue": "Queue message" / "input.send.queue": "排队发送"
"input.send.steer": "Steer message" / "input.send.steer": "插话发送"
```

### 2.3 Le contrôle des sélecteurs — rejouable, et il peut échouer

```
node "C:\Users\neosp\Desktop\ARKADIA Studio Retro\userscripts\verifier-selecteurs.mjs"
→ 13/13 affirmations tiennent.
→ SÉLECTEURS CONFORMES AU HARNAIS INSTALLÉ     (exit 0)
```

Il ne recopie aucun chemin : il **cherche** le paquet sous la racine du harnais, prend son plus gros
`.js` et teste 13 affirmations. **Après toute mise à jour de DSH, relancer ce contrôle.** Un échec
veut dire : *les sélecteurs du userscript ne sont plus valides, relire le bundle avant de faire
confiance au script.*

### 2.4 Le point faible, dit franchement

`_primary` est un **suffixe de classe haché au build** (`uV2eYG_primary` dans le build du 20/09/2026).
Il changera à la prochaine compilation. Le script est écrit pour **échouer fermé** : s'il ne trouve
aucun bouton primaire, il **ne clique rien** et se rabat sur Entrée ; s'il ne trouve pas non plus le
champ, il ne fait rien du tout et l'écrit dans la console. **Il ne clique jamais « le premier bouton
venu ».**

---

## 3. (b) Le seuil de silence retenu, et comment le changer

### Le choix

**Défaut : 10 secondes**, accepté de **3 s à 600 s**.

D'où vient ce chiffre, honnêtement :
- **Ancrage mesuré** : 1,8 s a coupé la parole de Gaëtan alors qu'il respirait
  (`assistant.html` l. 1085, via `chantier-seuil-parole-2026-09-20.md` l. 126 et l. 30).
- **Au-dessus de 1,8 s, il n'existe aucune mesure.** 10 s, c'est cinq fois et demie la valeur
  condamnée. C'est un **choix**, pas un résultat — et c'est écrit dans le script, à l'endroit où on
  le lira dans six mois.
- Le 13,5 s du brief **n'est pas** un ancrage (voir § 0).

### Comment le changer, sans toucher au code — trois voies

1. **Par le menu du gestionnaire de userscripts** (le plus simple). Une fois le script installé, le
   menu de Tampermonkey/Violentmonkey propose :
   - `⏱ Régler le délai de silence (secondes)` → une boîte de dialogue demande la valeur ;
   - `▶️/⏸ Activer ou désactiver l'envoi automatique` ;
   - `👁 Afficher ou masquer le bandeau` ;
   - `📤 Envoyer maintenant (test)` ;
   - `🔎 Diagnostic (console)`.
2. **Par la console de la page** (F12) : `__EAS.reglerDelai(20)` pour 20 s.
3. **Par le stockage** : clé `dsh-envoi-auto.delaiMs` (millisecondes) dans le `localStorage` de la
   page. Valeur lue au chargement.

Le réglage survit au rechargement de la page (stockage du gestionnaire, ou `localStorage`).

### Le garde-fou contre « vous m'avez coupé »

- **Le compte à rebours se réarme à chaque arrivée de texte** : événements `beforeinput`, `input`,
  `keydown`, `keyup`, `paste`, `drop`, `compositionupdate`, **et** un `MutationObserver` sur le champ
  (toute modification du DOM du champ réarme). *Tant que du texte arrive, rien ne part.*
- **Une composition en cours (IME, dictée en cours d'insertion) n'est jamais coupée** :
  `compositionstart` … `compositionend` bloque l'envoi.
- **Un bandeau visible, en bas à droite**, affiche le décompte (« ⏳ envoi dans 6,3 s — cliquer pour
  annuler »). **Cliquer dessus annule.** Un envoi silencieux est précisément ce qui rend possible le
  « vous m'avez coupé » — le bandeau est là pour ça, et il est activé par défaut.
- **Il ne part jamais tout seul sur un texte déjà présent avant le chargement du script** : la
  minuterie ne s'arme que sur une **arrivée de texte constatée**.

---

## 4. L'idempotence — « un envoi qui part deux fois est pire qu'un envoi manuel »

Quatre verrous, dans cet ordre :

1. **Champ vide → rien.** (Au moment où la minuterie expire, on relit le champ.)
2. **Composition en cours → rien.**
3. **Verrou** : posé **avant** l'action d'envoi, il interdit tout second envoi du même contenu même si
   l'action se comporte mal.
4. **Empreinte du dernier texte envoyé** : le contenu est **normalisé** (caractères invisibles
   retirés, espaces insécables ramenés à l'espace, espaces multiples écrasés) avant comparaison —
   donc une re-dictée identique à l'identique ne repart pas.

Puis, **contrôle après coup** : 1,2 s après l'envoi, le script relit le champ. S'il porte encore le
 texte, il journalise `envoi-non-confirme` et **ne réessaie pas**. Il ne boucle jamais.

### Le contrôle de cette logique, et la preuve qu'il peut échouer

```
node "…\userscripts\verifier-logique.mjs"
→ 14/14 cas passent · TOUT PASSE                     (exit 0)

node "…\userscripts\verifier-logique.mjs" --mutation
→ 11/14 cas passent
→ ÉCHEC 4 · verrou armé → on ne renvoie pas
→ ÉCHEC 5 · texte identique au dernier envoyé → on ne renvoie pas
→ ÉCHEC 6 · idempotence malgré espaces insécables et retours à la ligne
→ LE CONTRÔLE SAIT ÉCHOUER : le sabotage est détecté (3 cas en échec)   (exit 0)
```

Le mode `--mutation` **retire deux garde-fous du fichier livré** et vérifie que la suite les détecte.
Sans lui, « 14/14 » ne prouverait rien : *un contrôle qui ne peut pas échouer ne contrôle rien.*
Le contrôle **relit le fichier réellement livré** (bornes `DEBUT-BLOC-TESTABLE` / `FIN-BLOC-TESTABLE`),
jamais une copie.

---

## 5. (c) Installer dans Firefox, pas à pas

### 5.1 Ce qui est mesuré, et qui change la marche à suivre

⚠️ **AUCUN gestionnaire de userscripts n'est installé dans le profil Firefox de Gaëtan.** Mesuré en
lisant les manifestes des `.xpi` du profil actif
`…\Firefox\Profiles\jgs1gn9f.default-release-1788530504224\extensions\` :

```
Yomitan Popup Dictionary · Easy Youtube Video Downloader Express · clouds dark ·
Yellow Flower Tree · Ghostery · Dictionnaire français · Language: Français (French) ·
New Tab · Apple Password Manager · uBlock Origin
```

**Ni Tampermonkey, ni Violentmonkey, ni équivalent.** Donc « installer le userscript » commence par
« installer un gestionnaire » — et **installer une extension depuis `addons.mozilla.org` est une
action sur un service externe : elle appartient à Gaëtan, je ne l'ai pas faite.** C'est le seul geste
qui bloque, et il est nommé.

### 5.2 Essayer tout de suite, sans rien installer (voie courte, pour la soirée)

Le script est écrit pour tourner **aussi** sans gestionnaire : sans `GM_*`, il bascule seul sur le
`localStorage` et n'installe simplement pas de menu.

1. Ouvrir le fichier `userscripts\dsh-envoi-automatique.user.js` dans un éditeur de texte, **tout
   sélectionner** (Ctrl+A) et **copier** (Ctrl+C).
2. Dans Firefox, sur la fenêtre de DSH (`http://127.0.0.1:3080`), ouvrir la console : **F12**, onglet
   **Console**.
3. La première fois, Firefox refuse le collage : **taper** `allow pasting` puis Entrée.
4. Coller le script (Ctrl+V) puis Entrée.
5. La console doit répondre : `[EAS] prêt — délai 10 s · actif=true …`.
6. Un bandeau apparaît en bas à droite de la fenêtre.

**Limite, dite nette** : ce collage **meurt au rechargement de la page** (F5). C'est un essai, pas une
installation.

### 5.3 Installation durable (après que Gaëtan a installé un gestionnaire)

1. **Gaëtan** installe **Tampermonkey** (ou **Violentmonkey**) depuis `addons.mozilla.org`, puis
   redémarre Firefox. — *Décision et action de Gaëtan : service externe.*
2. Ouvrir le tableau de bord du gestionnaire → **Utilitaires** → **Importer depuis un fichier** →
   choisir
   `C:\Users\neosp\Desktop\ARKADIA Studio Retro\userscripts\dsh-envoi-automatique.user.js`.
   *Variante équivalente : **Créer un script**, tout effacer, coller le contenu du fichier, Ctrl+S.*
3. Le script est déclaré pour `http://127.0.0.1:3080/*` et `http://localhost:3080/*` seulement : il
   ne s'exécute sur **aucun** autre site. Le vérifier dans l'onglet du script.
4. Recharger la fenêtre de DSH (F5). Bandeau en bas à droite + `[EAS] prêt …` dans la console.
5. **Contrôle, dans la console** : `__EAS.diagnostic()` doit rendre
   `bouton_trouve: true`, `bouton_classe: "…_primary"`, `bouton_desactive: false`.
   Si `bouton_trouve: false`, le seul recours est Entrée, et il faut relancer
   `verifier-selecteurs.mjs` : le bundle a changé.

---

## 6. (d) Désinstaller — et ce que ça laisse

**Rien n'est installé dans le harnais, rien n'est patché, aucun service n'est modifié : la
désinstallation se limite au navigateur.**

| Ce qu'on veut | Le geste |
|---|---|
| **Suspendre sans désinstaller** | Menu du gestionnaire → `▶️/⏸ Activer ou désactiver l'envoi automatique`. Ou, en console : `__EAS.reglerActif(false)`. |
| **Retirer le userscript** | Tableau de bord du gestionnaire → ligne du script → **Supprimer**. Recharger la page : plus de bandeau, plus de minuterie. |
| **Effacer les réglages persistés** | Console de la page : `localStorage.removeItem('dsh-envoi-auto.delaiMs')` — idem pour `.actif` et `.badge`. Les valeurs éventuellement stockées par le gestionnaire partent avec la suppression du script. |
| **Tout nettoyer du disque** | Supprimer le dossier `userscripts\` (ou seulement les trois fichiers du § 1). |
| **Revenir à l'état d'avant** | Rien à restaurer : **aucun fichier existant n'a été modifié** (voir § 7). |

**Le geste qui n'existe pas** : il n'y a **rien** à désinstaller côté harnais, parce que rien n'y a
été écrit.

---

## 7. (e) ⚠️ CE QUE CE CHANTIER N'ÉTABLIT PAS

C'est la section la plus importante, parce que ce qui suit n'est **pas** vérifié et qu'on pourrait
croire le contraire.

1. **Le script n'a JAMAIS tourné dans un navigateur.** Ni dans celui de Gaëtan, ni ailleurs. Je
   n'avais pas accès à sa session Firefox, et la page exige un jeton (`dsh web authentication
   required`). **Zéro validation à l'exécution.** Les sélecteurs sont **lus dans le bundle qui
   fabrique le DOM**, ce qui est une preuve sur le code — **pas** une observation du DOM vivant.
2. **Le clic sur le bouton d'envoi n'est pas vérifié en vrai.** Que `button.click()` déclenche bien le
   `onClick` de React dans cette application est **attendu**, non mesuré.
3. **Le repli « touche Entrée » n'est pas vérifié en vrai.** Que le `KeyboardEvent` synthétique soit
   accepté par le gestionnaire Lexical (`KEY_ENTER_COMMAND`) est **attendu**, non mesuré.
4. **Le nombre de champs `[data-composer-input]` réellement présents dans le DOM est inconnu.** Le
   bundle contient **deux variantes** de la barre (`variant === "composer"` et une variante `hero`).
   Si les deux sont montées en même temps, le script choisit le champ **visible**, et à défaut celui
   qui a le focus — **cette règle n'a pas été éprouvée sur le DOM réel.**
5. **Les libellés de bouton dépendent de la langue de l'interface, et je ne sais pas laquelle est
   active.** Les dictionnaires **chinois et anglais** coexistent dans le bundle, et aucun réglage de
   langue n'apparaît dans `~/.dsh/settings.yaml`. **Je n'ai pas pu établir laquelle des deux
   l'interface de Gaëtan utilise.** Conséquence : le refus du bouton d'arrêt **par son libellé** peut
   ne pas mordre. Le vrai garde-fou reste **la position** (dernier bouton primaire de la carte) — et
   c'est aussi le plus fragile. **À vérifier au premier essai par `__EAS.diagnostic()` :
   `bouton_libelle` doit dire `Send message` ou `发送消息`, jamais `Stop generating` / `停止生成`.**
6. **Le délai de 10 s est un choix, pas une mesure.** Aucune mesure n'existe au-dessus de 1,8 s.
   Si Gaëtan est encore coupé, il faut **monter** la valeur par le menu — et la bonne façon de la
   fixer serait de la **mesurer**, pas de la deviner : `chantier-seuil-parole-2026-09-20.md` § 4
   donne un protocole rejouable en trois minutes (`silencedetect` sur un enregistrement, le plus
   grand `silence_duration` **à l'intérieur d'une phrase** est le chiffre à prendre).
7. **Le risque du mot qui arrive APRÈS l'envoi n'est pas traité.** Si la dictée de Windows insère
   encore un mot après que le script a envoyé, ce fragment sera un **nouveau** texte, donc envoyé à
   son tour au bout de 10 s — un second message. Le verrou ne protège que contre la **répétition à
   l'identique**. Ce cas n'est **ni testé, ni exclu**.
8. **Aucun contrôle de politique de sécurité de contenu (CSP) n'a été fait.** Le collage en console
   peut être refusé par une CSP stricte — les outils de développement en sont normalement exemptés,
   mais ce n'est **pas vérifié ici**.
9. **Aucun essai avec la reconnaissance vocale de Windows.** C'est l'hypothèse de départ (le texte
   arrive par insertion, donc `input` + mutations), pas un constat.
10. **Le comportement n'est pas éprouvé pour un envoi pendant que l'agent tourne.** Le réglage du
    harnais est `ui-conversation: busyEnter: steer` (lu dans `~/.dsh/settings.yaml`), donc un envoi
    pendant une génération **insère** vraisemblablement le message au lieu de le mettre en file.
    **Effet secondaire non vérifié.**
11. **Le suffixe de classe `_primary` changera au prochain build de DSH.** Le script échoue alors
    **fermé** (aucun clic au hasard), mais il faudra relire le bundle.
12. **Ce chantier n'a touché à rien d'autre** : aucun secret, aucun vault, aucun conteneur Docker,
    aucun service arrêté ou redémarré, `Vault-ARKADIA` non ouvert, le harnais non modifié. Et
    **aucun fichier existant n'a été modifié** — donc **aucune sauvegarde
    `<nom>.avant-<raison>-2026-09-20` n'a été créée**, faute de fichier à sauvegarder.

---

## 8. Le geste exact pour l'essayer

**Aujourd'hui, sans rien installer** (essai qui meurt au F5) :

1. Ouvrir `C:\Users\neosp\Desktop\ARKADIA Studio Retro\userscripts\dsh-envoi-automatique.user.js`
   dans un éditeur, **Ctrl+A** puis **Ctrl+C**.
2. Dans la fenêtre DSH de Firefox, **F12** → onglet **Console** → taper `allow pasting` → Entrée.
3. **Ctrl+V** puis **Entrée**.
4. Vérifier dans la console : `[EAS] prêt — délai 10 s · actif=true …`, et le bandeau en bas à droite.
5. Taper `__EAS.diagnostic()` → lire `bouton_trouve: true` et `bouton_libelle`.
6. **Dicter un message** avec la reconnaissance vocale de Windows, puis **se taire et ne toucher à
   rien**. Au bout de **10 s**, le message part seul. Le bandeau décompte, et cliquer dessus annule.
7. **Cas à éprouver en priorité** : dicter une phrase, **s'arrêter 4 ou 5 s pour respirer**, puis
   continuer. **Rien ne doit partir** au premier silence. C'est exactement l'épreuve qui a échoué sur
   la ligne vocale voisine.

**Pour que ça tienne** : faire installer Tampermonkey par Gaëtan, puis § 5.3.

---

## 9. Ce qu'il reste à faire, et à qui

| Suite | Propriétaire |
|---|---|
| Essayer, et dire si un message est parti trop tôt | **Gaëtan** |
| Installer Tampermonkey (action sur un service externe) | **Gaëtan** |
| Ajuster le délai si l'essai déçoit — ou le **mesurer** (§ 7.6) | Gaëtan décide, Trinity mesure sur demande |
| Relancer `verifier-selecteurs.mjs` après toute mise à jour de DSH | Trinity |
| Le mot qui arrive après l'envoi (§ 7.7) — à corriger ou à accepter | Trinity, sur arbitrage de Gaëtan |
