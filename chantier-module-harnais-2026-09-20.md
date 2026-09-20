# Chantier — un module *dans* le harnais pour parler à l'agent

**Date :** 20/09/2026 · **Auteur :** Trinity (fonds Metroid, preset de veille et de R&D sourcée)
**Demande :** Gaëtan, mot pour mot — *« Regardez si vous pouvez pas développer un plugin pour le harnais. Parler directement au harnais, ce serait cool. Via un bouton que j'active sur l'interface, sur le port 3080. […] Vous avez le flux qui remonte dessus. Donc on s'en sert comme gate. »*
**Statut :** faisabilité **établie**, avec **une correction de plan qui n'est pas négociable** (voir § c).
**Rien n'a été installé, construit, ni redémarré.** Toutes les commandes sont écrites, aucune n'est exécutée.

---

## 0. Réponse courte, avant le détail

**Oui, c'est faisable, et la question qui décidait de tout a une réponse positive :** un greffon client **peut écrire dans la conversation** — par un appel documenté, `inputActions.setDraft(texte)` puis `inputActions.submit()`. Le repli par dispatch d'un `keydown` Entrée existe toujours, mais il devient **inutile**.

**Mais le plan tel qu'il est imaginé ne passe pas.** La page du harnais **ne peut pas appeler `127.0.0.1:8150`** : le service vocal refuse en 403 toute requête portant un en-tête `Origin`, et un `fetch()` depuis une page en envoie toujours un. Ce n'est pas un défaut, c'est **un correctif de sécurité délibéré du 17/09/2026** (§ c).

**Conséquence d'architecture :** le module doit avoir **deux moitiés**, comme `dsh-comfyui` et `dsh-sysmon`.
- La moitié **navigateur** capte le micro et parle au harnais **en même origine** (`/voix-local/...` sur le 3080).
- La moitié **hôte** (Node, dans le processus du harnais) appelle `8150` **en serveur-à-serveur**, donc **sans en-tête `Origin`** → accepté.

C'est plus simple que prévu, pas plus compliqué : la moitié hôte est aussi ce qui permet d'écrire dans la conversation.

---

## 1. Les mesures qui portent cette note

| Ce qui est mesuré | Valeur | Où |
|---|---|---|
| Le harnais écoute sur 3080 | `127.0.0.1:3080`, PID 32232 | `Get-NetTCPConnection -State Listen` |
| Le service vocal écoute sur 8150 | `127.0.0.1:8150`, PID 41080 | idem |
| Arbre source `deepseek-harness` | commit `ddefc45fbc7f8e46dd73185e68295696d1297887`, 17/09/2026 21:19 +0800, tag **`dsh-v0.1.6-alpha.2`** | `git log -1` |
| Arbre propre | 0 fichier modifié | `git status --porcelain` (0 ligne) |
| Version du dépôt | `@deepseek-ai/dsh-root` 0.1.6-alpha.2, `pnpm@11.7.0` | `package.json` racine |
| Harnais installé (celui qui tourne) | `…\npm\node_modules\@deepseek-ai\dsh` | arborescence |
| Profil chargé par le 3080 | `~/.dsh/profiles/web` | `PLUGINS-AJOUTES.md`, `package.json` |
| `getUserMedia` / `MediaRecorder` dans le harnais installé | **0 occurrence** | recherche récursive sur `node_modules\@deepseek-ai\*` |
| `Content-Security-Policy` hors iframes sandboxées | **0 occurrence** | idem + `packages/host/webserver/src/index.ts` (aucun `setHeader`) |

⚠️ **Deux corrections au brief, et elles portent sur des noms :**
1. Le tag du dépôt est **`dsh-v0.1.6-alpha.2`**, pas `release-dsh-0.1.6-alpha.2`. Le commit est bien celui du 17/09.
2. Le brief annonce 5 routes dans le service vocal. **Le fichier en porte 9.** Le docstring (l. 19-33) en déclare 5 ; le code en sert **9** — les quatre autres sont `/transcrire` (l. 1662), `/veille` (l. 1545/1749) et `/essai` (l. 1557/1764), plus `/ecouter-auto` que le docstring ne mentionne pas non plus. *Le docstring n'est pas le contrat : le code l'est.* Une constante de 404 (l. 1570) liste elle aussi 5 routes — **elle est fausse** et c'est un piège pour qui s'y fie.

---

## a) Existe-t-il une API de greffon client documentée ?

**Oui. Nommée, documentée, et en usage réel sur cette machine.**

| Élément | Valeur exacte | Où je l'ai lu |
|---|---|---|
| Paquet qui possède le système de modules client | `@deepseek-ai/dsh-client-modules` | README du paquet |
| La déclaration | `dsh.client` dans le `package.json` du greffon, avec `platform: 'web'` | `dsh-client-modules/README.md` **l. 34** |
| Le bundle exporté | `exports["./client"]` | idem, **l. 34** et **l. 77** (source : `docs/subsystems/client-modules.md` l. 77) |
| Le type de la déclaration | `DshClientManifest` (paquet `@deepseek-ai/dsh-util-package-manifest`) | `dsh-client-modules/README.md` **l. 28** |
| Les dépendances de chargement | `dsh.client.inject` (liste de paquets dont la fabrique doit arriver avant) | idem, **l. 34** |
| Le point d'entrée du registre d'emplacements | `ctx.slots.register(…)` et `ctx.slots.inject(key, cb)` | `docs/subsystems/slots.md` **l. 5**, **l. 17**, **l. 35-40** |
| La forme du bundle | `window.__ModuleLoader__.load({ id, factory })` — *lazy-CJS*, `factory(require) → module.exports` | mesuré dans `dsh-sysmon/lib/client.js` **l. 6-9** et `dsh-mermaid/lib/client.js` **l. 1** |
| Ce que la moitié client exporte | `apply(ctx)` et `inject` | mesuré : `dsh-sysmon/lib/client.js` **l. 128-129** |
| La moitié hôte | module ESM : `export const name`, `export const inject`, `export function apply(ctx)` | mesuré : `dsh-sysmon/lib/index.js` **l. 12-13**, **l. 126-160** |

**Trois greffons tiers installés sur EVA01 déclarent tous `dsh.client` avec `platform: 'web'`** — c'est la preuve que la voie est ouverte hors du dépôt DeepSeek :

| Paquet | version | `dsh.client` |
|---|---|---|
| `dsh-sysmon` | 0.1.1 | `{ inject: [], platform: 'web', immediately: true }` |
| `dsh-mermaid` | 0.4.0 | `{ platform: 'web', inject: [] }` |
| `dsh-comfyui` | 0.4.0 | `{ platform: 'web', inject: ['@deepseek-ai/dsh-client-connection', '…/dsh-client-runtime', '…/dsh-client-locale', '…/dsh-client-ui-settings'] }` |

*(lus dans `~/.dsh/profiles/web/node_modules/<paquet>/package.json`)*

**Conclusion (a) :** l'API existe, elle est documentée, et deux formes sont disponibles. La forme **la plus économe** est celle de `dsh-sysmon` : un bundle **écrit à la main**, **sans aucune construction**, **sans import du harnais** — son propre commentaire d'en-tête dit *« Hand-written lazy-CJS bundle (no build step, no dsh imports) »* (l. 1-3). La forme **la mieux intégrée** passe par `ctx.slots`.

---

## b) ⭐ Un greffon client peut-il écrire dans la conversation ?

# OUI — et c'est documenté, pas déduit.

**L'appel exact, en deux lignes, depuis un composant d'emplacement de portée `session` :**

```js
inputActions.setDraft(texteTranscrit)   // remplace tout le brouillon
inputActions.submit()                   // entre dans la soumission (adjudication + envoi)
```

**Les sources, avec la ligne :**

| Fait | Ligne |
|---|---|
| `InputActions.submit()` — *« Enter submission (adjudication / claim transaction / default sink inside) »* | `dsh-client-ui-conversation/lib/types/client/contract/input.d.ts` **l. 219-220** |
| `InputActions.setDraft(text)` — *« Replace the whole draft (persisted-draft seed and **programmatic writes**) »* | idem **l. 211-212** |
| `inputActions` est fourni à **tout composant d'emplacement de portée `session`** | `…/contract/slots.d.ts` **l. 241-248** (`SessionStandardProps.inputActions`) ; et `input.d.ts` **l. 204-209** : *« The public input action face provided to every session-scope slot component »* |
| Où poser le bouton : `'conversation.input.right'` — *« Compact controls before the composer submit action »*, `kind: 'list'`, `scope: 'session'` | `…/contract/slots.d.ts` **l. 207-211** |
| Comment s'y inscrire | `docs/subsystems/slots.md` **l. 35-40** : `ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id, order }, Composant))` |

**Deux autres voies existent, mesurées, si la première coince :**

1. `ctx.conversation.send(text)` — service `conversation` (`IConversation`), *« Send a prompt into the caller scope's session (queued turn) […] sent verbatim as one text block »* : `…/types/client/service.d.ts` **l. 25-38**. ⚠️ Limite : *verbatim* → **ça ne passe pas par l'adjudication**, donc une ligne commençant par `/` ne serait **pas** traitée comme une commande. `setDraft` + `submit` la traite. **C'est pourquoi je retiens `inputActions`.**
2. `ctx.conversation.input.for(actx)` → `SessionInput` avec `setDraft` / `submit` / `notify` : `…/contract/input.d.ts` **l. 172-203**. Plus puissant, mais il faut un contexte de portée session ; `inputActions` évite la question.

**Le repli du chantier ④ existe-t-il encore ?** **Oui, mesuré :** `KEY_ENTER_COMMAND` et `data-composer-input` sont tous deux encore présents dans `dsh-client-ui-conversation/lib/client.js`. Le dispatch d'un `keydown` Entrée sur le champ fonctionnerait donc toujours. **Mais il n'est plus nécessaire** — et il serait plus fragile : il dépend d'un détail d'implémentation, là où `inputActions` est une **face publique documentée**.

---

## c) getUserMedia, et joindre 127.0.0.1:8150 — deux réponses, et la seconde est NON

### c.1 — `getUserMedia` : oui, sous une condition stricte

`getUserMedia` **exige un contexte sécurisé**. `127.0.0.1` est une **origine potentiellement fiable** au sens de la spécification — donc **oui, ça marche** ([MDN, Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts)).

⚠️ **Et la condition est mesurée, pas supposée :** `127.0.0.1` n'est fiable que **parce que c'est une adresse de bouclage**. **Une IP de réseau local ne l'est pas.** Or le harnais *peut* être atteint autrement : `dsh-comfyui` a codé un « host hint » exprès pour ça, avec cet exemple **dans son propre code** — `http://100.97.190.89:3080` (`dsh-comfyui/lib/index.js` **l. 190**).

- **Aujourd'hui, sur cette machine, c'est bon :** la socket écoute sur `127.0.0.1` **uniquement** (mesuré). Si Gaëtan ouvre `http://127.0.0.1:3080`, le micro de la page fonctionnera.
- **Si un jour le harnais est exposé sur une IP LAN ou un nom de domaine en `http://`, le bouton cessera de fonctionner** — sans message d'erreur parlant, et **aucun réglage côté page n'y changera rien**. C'est une contrainte de navigateur.

**Permissions / CSP : rien ne bloque.** Mesuré :
- aucun `Content-Security-Policy` sur la page du 3080 — l'`index.html` de l'application (`deepseek-harness/apps/web/index.html`, 14 lignes) n'en porte pas, et `packages/host/webserver/src/index.ts` n'écrit **aucun en-tête de sécurité** (ses seuls `writeHead` sont un 404 **l. 232** et un 400 **l. 250**) ;
- les seules occurrences de CSP du harnais sont des en-têtes d'**iframes sandboxées** (`"sandbox; default-src 'none'"`, `packages/api/session-controller/src/media-references.ts` **l. 19**) et celles de l'application **Electron** — sans rapport avec la page servie ;
- aucun `Permissions-Policy` nulle part → le micro reste autorisé pour la même origine.

### c.2 — Appeler 8150 depuis la page : **NON. Bloqué, et volontairement.**

**C'est LA découverte de cette note, et elle change le plan.**

`C:\IA\gl-digital-lab\poste-local\serveur-voix.py` porte une fonction `_origine_refusee()` (**l. 1499-1518**) dont le docstring dit exactement pourquoi :

> *« Ce service acceptait n'importe quelle origine, et renvoyait `*`. Conséquence mesurée : une requête portant `Origin: https://site-malveillant.example` recevait **HTTP 200** — donc **n'importe quelle page web ouverte dans le navigateur du poste pouvait appeler `/ecouter` et OUVRIR LE MICRO**, sans jeton, sans permission, sans que rien ne l'affiche. »*
> *« Donc **toute requête portant un en-tête `Origin` vient d'un navigateur — et un navigateur n'a rien à faire ici.** Un appel serveur-à-serveur n'en envoie jamais. »*

L'implémentation est d'un seul tenant, et c'est ce qui la rend solide :

| Ligne | Ce qui se passe |
|---|---|
| **l. 1518** | `return bool(self.headers.get("Origin"))` — la règle tient en une ligne |
| **l. 1534-1536** | `do_OPTIONS` → **403** *« origine navigateur refusée »* |
| **l. 1538-1540** | `do_GET` → **403** si `Origin` présent |
| **l. 1572-1574** | `do_POST` → **403** si `Origin` présent |

**Un `fetch()` depuis la page 3080 enverrait forcément `Origin`** (la requête est cross-origin : port différent). Donc **403.** Et même sans le 403, aucun `Access-Control-Allow-Origin` n'est renvoyé : le navigateur bloquerait la lecture de la réponse de toute façon.

⛔ **On ne contourne pas ça, et on ne le demande pas.** C'est un correctif de sécurité voulu, pris le 17/09/2026 après un trou mesuré. Le retirer pour faire marcher un bouton serait **exactement** le geste à ne pas faire.

### c.3 — La voie qui passe : la moitié hôte, en même origine côté page

**Le harnais offre à un greffon d'enregistrer ses propres routes HTTP sur son propre serveur.** C'est le mécanisme, et il est en usage réel sur cette machine.

| Fait | Ligne |
|---|---|
| `WebServer` (`ctx.webServer`) — *« `register(route)` adds one named route and returns its disposer »* | `docs/subsystems/web-server.md` **l. 51** |
| Signature générée | `register(route: WebRoute): () => void` — **l. 116** |
| Type `WebRoute` = `{ kind: 'exact' \| 'prefix', path, handler(req, res) }` | **l. 11-25** |
| `tapIndex(transform: (html: string) => string): () => void` — pour injecter une ligne dans l'index | **l. 143** |
| Usage réel, greffon tiers | `dsh-sysmon/lib/index.js` **l. 13** (`export const inject = ['webServer']`) et **l. 126-128** (`ctx.webServer.register({ kind: 'exact', path: STATS_PATH, handler })`) |
| Usage réel, routes multiples | `dsh-comfyui/lib/routes.js` **l. 192-198** (`webServer.register({ kind: 'exact', path: '/comfyui/ping', handler })`) |
| Comment la moitié client appelle sa moitié hôte | **même origine** : `fetch('/comfyui/config')`, `postJson('/comfyui/workflows/run', …)` — mesuré dans `dsh-comfyui/client/client.js` (40 occurrences de `/comfyui/…`) |

**Donc, la chaîne qui passe :**

```
[bouton dans la page 3080]
   │  getUserMedia  →  MediaRecorder  →  Blob audio
   │  POST /voix-local/transcrire          ← même origine, aucun Origin refusé, aucun CORS
   ▼
[moitié hôte du module, dans le processus du harnais]
   │  POST http://127.0.0.1:8150/transcrire   ← serveur-à-serveur, AUCUN en-tête Origin
   ▼
[serveur-voix.py]  →  { ok, texte, langue }
   │
   ▼
[moitié client]  inputActions.setDraft(texte) → inputActions.submit()
   │
   ▼
[la conversation du harnais]  →  l'agent répond  →  (option) POST /voix-local/dire → 8150 → le casque
```

**Quatre points de forme à ne pas rater, tous mesurés dans le code existant :**
1. **Aucun chemin n'est le préfixe d'un autre** — le service vocal a payé ce piège (`/ecouter` → `/ecouter-auto`, commentaire **l. 1580-1584**). Le préfixe `/voix-local/` applique la même règle côté module.
2. **Une seule moitié détient le micro** — la page. Le serveur vocal n'a pas besoin d'ouvrir le micro, donc **la veille et l'écoute permanente du 8150 restent hors circuit**. *Un micro toujours ouvert est une décision de vie privée, pas un réglage* (docstring **l. 29-31**) — et elle n'est pas prise.
3. **`/transcrire` prend un CHEMIN de fichier, pas des octets** (`serveur-voix.py` **l. 1662-1669**) : le module hôte doit **écrire le WAV sur le disque** puis passer son chemin. Extensions acceptées : `.wav .mp3 .flac .ogg .m4a .webm` (**l. 1668**). ⚠️ `MediaRecorder` produit du **`audio/webm;codecs=opus`**, accepté par le serveur — **mais je ne l'ai pas mesuré bout en bout** (§ f).
4. **La voix par défaut est `piper`, hors ligne** (`serveur-voix.py` **l. 37-40**). `vivienne` **sort de la machine** — à ne pas mettre par défaut.

---

## d) La chaîne de construction exacte

### d.1 — Où le module vit : **hors du dépôt du harnais**

Le mécanisme est établi, et il a déjà servi sept fois sur cette machine. `~/.dsh/profiles/web/package.json` :

```json
{
  "name": "dsh-profile-web",
  "private": true,
  "dependencies": { "dsh-comfyui": "^0.4.0", "dshmarket": "^1.45.0", "dsh-mermaid": "^0.4.0", "…": "…" },
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-comfyui", "dshmarket", "dsh-sysmon", "dsh-mermaid", "dsh-period-report", "api-balance"],
      "patchReload": "live"
    }
  }
}
```

Et `PLUGINS-AJOUTES.md` (même dossier) documente **la marche à suivre et ses deux pièges payés** : un paquet qui ne publie pas de couche `dsh.bundle` **ne se met pas** dans `bundles` (il se monte par `cordis.patch.yml`) ; et `pnpm install` doit être relancé **avant** le redémarrage, sinon le démarrage échoue sur des modules manquants.

### d.2 — ⚠️ Ce que le brief dit de la construction : **contredit en partie**

Le `README` de `dsh-client-modules` dit, **l. 46** :

> *« The host serves built client bundles, so `pnpm run build` must have produced each `lib/client.js` before launch; a missing bundle fails activation loudly with one build instruction and a package/path list. »*

**C'est exact — pour les paquets DU dépôt.** `deepseek-harness/package.json` **l. 20** et **l. 25** : `"build": "tsx scripts/build.ts"`, `"build:lib:client": "tsc -b tsconfig.client.json && tsdown --env.DSH_BUILD_FACE client"`.

**Mais ça ne s'applique PAS à un paquet tiers.** Mesuré : `dsh-sysmon` livre un `lib/client.js` **écrit à la main**, et le dit dans son en-tête — *« Hand-written lazy-CJS bundle (**no build step**, no dsh imports) »* (`dsh-sysmon/lib/client.js` **l. 1-3**), 132 lignes, 5 327 octets. Le mécanisme HMR du harnais ne **lit** que ce fichier : `rebuilt(id)` *« re-hashes the bundle bytes, and only a real revision change recomposes the graph »* (`docs/subsystems/client-modules.md` **l. 101**).

**→ Donc : aucune construction n'est nécessaire pour ce module.** Pas de `pnpm run build`, pas de `tsdown`, pas de `tsc`. Un fichier `client/client.js` écrit à la main suffit. **C'est ce qui fait tomber le coût de ce chantier d'un facteur important.**

### d.3 — Confirmé : un serveur lancé à côté ne met **pas** à jour cette interface

Oui, **confirmé**, et c'est cohérent avec le périmètre. La page du 3080 reçoit sa composition par `window.__DSH_BOOT__`, injecté par l'hôte **à chaque rendu d'index** (`docs/subsystems/client-modules.md` **l. 85** : *« The injection rows carry the current graph on every index render, so a reload always boots against the live composition »*). Un second serveur sur un autre port est une **autre origine** : il ne modifie pas le graphe du 3080, il ne partage ni son profil ni ses greffons, et il exigerait sa propre authentification.

**Ce qui met à jour cette interface,** dans l'ordre :
1. le paquet devient une dépendance du **profil `web`** ;
2. son nom entre dans **`dsh.profile.bundles`** du `package.json` **de ce profil** ;
3. `pnpm install` dans `~/.dsh/profiles/web` ;
4. **redémarrage de `dsh web`** — indispensable, car le paquet vient d'entrer dans la composition, et la métadonnée de paquet est *« cached per Loader specifier […] until restart »* (`docs/subsystems/client-modules.md` **l. 81**).

⚠️ **Le point 4 est un geste de Gaëtan.** Le harnais sert en direct : je ne l'arrête pas.

### d.4 — La question ouverte, et c'est la première chose à mesurer

Pour une **itération suivante** (retoucher `client/client.js` sans redémarrer), il existe une voie possible : `dsh-client-hmr` *« separately reports rebuilt revisions »* (`docs/subsystems/client-modules.md` **l. 103**) et `pnpm run dev:web` existe et tourne (`deepseek-harness/package.json` **l. 193** : `"dev:web": "tsx scripts/dev-web.ts --poll"`).

**Mais je ne l'ai pas mesuré, et je ne l'affirme pas.** Pour un paquet **hors** de l'espace de travail, rien ne prouve que l'artifact soit surveillé.

**L'épreuve, et elle coûte une minute :** lancer le module une première fois, puis **modifier un caractère visible** du `client/client.js` (un libellé du bouton) et regarder si la page se recharge **sans** redémarrage. *Si oui : le développement itératif est gratuit. Si non : chaque retouche du bouton coûte un redémarrage, et il faut donc grouper les modifications.* **Cette mesure décide du confort du chantier, et elle est à faire avant d'écrire beaucoup de code.**

### d.5 — Les commandes exactes — **écrites, non exécutées**

⛔ Aucune de ces commandes n'est à moi. Elles touchent au profil du harnais, donc au service qui sert Gaëtan en direct.

```powershell
# ── 1. (UNIQUEMENT si la première mesure d.4 montre que l'HMR ne surveille pas le paquet)
#      Sinon, passer directement à 2.

# ── 2. Déclarer le module dans le profil web. Installe + ajoute la dépendance :
dsh plugin --profile web add "file:C:\Users\neosp\Desktop\ARKADIA Studio Retro\module-vocal-squelette"

#    (le CLI « dsh plugin » ne fait que transmettre à pnpm dans le dossier du profil :
#     l'aide le dit mot pour mot — « manage a profile's plugins by forwarding the
#     remaining arguments to pnpm in the profile directory ».)

# ── 3. Ajouter la ligne dans dsh.profile.bundles de C:\Users\neosp\.dsh\profiles\web\package.json
#      -> "dsh-voix-locale"   (à la main : c'est un fichier de Gaëtan)

# ── 4. Régénérer le verrou et installer (piège payé, PLUGINS-AJOUTES.md l. 3-5) :
pnpm install --dir "C:\Users\neosp\.dsh\profiles\web"

# ── 5. Redémarrer le harnais — geste de Gaëtan, le service tourne en direct sur 3080.

# ── 6. Contrôles, une fois redémarré (aucun accès au micro) :
Invoke-RestMethod "http://127.0.0.1:3080/voix-local/sante"
Invoke-RestMethod "http://127.0.0.1:3080/voix-local/dire" -Method Post -ContentType "application/json" -Body '{"texte":"contrôle du module vocal"}'
```

**Retour arrière, et il doit être écrit d'avance :** retirer `"dsh-voix-locale"` de `dsh.profile.bundles`, puis `dsh plugin --profile web remove dsh-voix-locale`, puis `pnpm install --dir "C:\Users\neosp\.dsh\profiles\web"`, puis redémarrer. *Un chantier sans retour arrière écrit n'est pas un chantier, c'est un pari.*

---

## e) Ce que ça coûte, chiffré

**Hypothèses posées franchement :** les durées sont des **estimations d'ingénierie**, pas des mesures. Ce qui est **mesuré**, c'est la quantité de travail existant réutilisable (les trois greffons tiers, leurs routes, leur forme de bundle) — et elle est importante.

| # | Étape | Durée | Qui |
|---|---|---|---|
| 0 | **Mesure d.4** — l'HMR surveille-t-il un paquet hors espace de travail ? | 5 min | Trinity (mesure), Gaëtan (redémarre) |
| 1 | Moitié hôte : 3 routes + relais serveur-à-serveur vers 8150 + écriture du WAV temporaire | 1 h | Trinity |
| 2 | Moitié client : bouton, `getUserMedia`, `MediaRecorder`, envoi, états visuels | 1 h 30 | Trinity |
| 3 | Insertion dans la conversation (`inputActions.setDraft` + `submit`) | 30 min | Trinity |
| 4 | Retour vocal (`/voix-local/dire`) — **facultatif, et après le reste** | 30 min | Trinity |
| 5 | **Installation + redémarrage + première épreuve réelle** | 15 min | **Gaëtan** |
| 6 | Mise au point sur le vrai micro de son casque (niveaux, silence, longueur) | 1 h | Gaëtan + Trinity |
| | **Total** | **≈ 5 h**, dont **1 h 15 non délégable** | |

**Ce qui n'est PAS dans ce chiffre, et qui doit être dit :** le **journal des échecs** (`vault-agence/registre-echecs-agents.md`) et la fiche de fin de chantier, si le chantier échoue ou dévie.

**Le coût en jetons est plus bas qu'on ne le croit** : le module ne consomme **aucun** jeton de modèle pour transcrire — Whisper tourne en local dans le 8150, `piper` aussi. **Parler au harnais par ce bouton coûte exactement ce que coûte la question posée à l'agent — pas plus.** C'est un point à porter au crédit du chantier, au vu du § 9 des consignes (« 4 € en 10 minutes »).

---

## f) Ce que ce chantier n'établit pas

**Je le dis d'autant plus volontiers que cette note repose sur une chaîne de mesures, et qu'une chaîne se casse à son maillon faible.**

1. **Je n'ai pas exécuté la chaîne.** Aucun micro n'a été ouvert, aucun WAV produit, aucune route appelée. `MediaRecorder` → `webm/opus` → `/transcrire` est **plausible et non mesuré** : le serveur accepte bien l'extension `.webm` (**l. 1668**), mais je n'ai pas vérifié que Whisper en tire un texte juste. **C'est le risque n° 1 du chantier**, et il se lève en une épreuve.
2. **Je n'ai pas vérifié que `dsh-sysmon` s'affiche réellement** dans la page du 3080. J'ai lu son code, son manifeste et son installation — **pas son effet à l'écran**. Toute la confiance accordée à ce modèle vient de là. *Un paquet installé n'est pas un paquet qui tourne.*
3. **Je n'ai pas vérifié `require('react')` depuis un bundle lazy-CJS tiers.** Le `README` de `dsh-client-modules` décrit une table de base gelée (`PLATFORM_MODULES` : React, Cordis, bibliothèques d'UI statiques, **l. 41**), mais **je n'ai pas trouvé cette table dans l'artefact installé** (0 occurrence de `PLATFORM_MODULES` dans `node_modules\@deepseek-ai\*`) — elle est probablement minifiée. *Donc : la disponibilité de React pour un bundle tiers est une lecture de documentation, pas une mesure.* Le squelette isole ce point en un seul endroit.
4. **Je n'ai pas mesuré l'HMR** (§ d.4). Ouvert, et chiffré.
5. **Je n'ai pas vérifié l'authentification du 3080.** Le brief la mentionne ; je n'ai pas ouvert la page. La note n'en dépend pas — un greffon s'exécute **dans** la page authentifiée — mais je ne l'affirme pas.
6. **Je n'ai pas vérifié que le nom `dsh-voix-locale` est libre** sur le registre npm. Si un jour ce module est publié, ce nom peut être pris. Pour un usage local (`file:`), la question ne se pose pas.
7. **Je n'ai pas mesuré la latence de bout en bout de la chaîne complète.** Le banc vocal du 17/09/2026 donnait **23,36 s**, dont le rechargement du modèle à chaque appel ; le service résident est justement né pour supprimer ça (chargement `small` = **1,76 s**, payé une fois — `serveur-voix.py` l. 1657-1661). **La latence attendue ensuite n'est pas mesurée ici.**
8. **Cette note n'établit rien sur le contenu juridique.** Aucun asset, aucun texte, aucun nom de la franchise Metroid n'entre dans ce module. La frontière du preset tient : Metroid est le **sujet** du fonds, pas un droit.

⛔ **Ce que ce chantier ne fait pas, et ne fera pas :** retirer ou affaiblir `_origine_refusee()` dans `serveur-voix.py`. C'est une barrière de sécurité prise après un trou mesuré ; elle reste. Le module s'y **conforme** en passant par son hôte.

---

## Ce qui est vérifié / ce qui ne l'est pas, en une page

**Vérifié (mesuré sur cette machine, ce jour) :**
- API de greffon client documentée : `dsh.client` / `platform: 'web'` / `exports["./client"]` — § a, avec les lignes.
- **Un greffon client peut écrire dans la conversation** : `inputActions.setDraft` + `submit`, face publique documentée, fournie à tout emplacement de portée `session` — § b, avec les lignes.
- Le repli `KEY_ENTER_COMMAND` / `[data-composer-input]` **existe toujours**, et n'est plus nécessaire.
- Emplacement d'accueil du bouton : `conversation.input.right`.
- Le harnais peut servir des routes propres à un greffon : `ctx.webServer.register`, en usage réel chez deux greffons tiers.
- **La page ne peut pas appeler 8150** : 403 sur tout `Origin` — `serveur-voix.py` l. 1518, 1536, 1540, 1574.
- Aucun CSP, aucun Permissions-Policy sur la page du 3080.
- Le 3080 écoute sur `127.0.0.1` **uniquement** → contexte sécurisé → `getUserMedia` autorisé.
- Aucune construction n'est nécessaire : bundle lazy-CJS écrit à la main, précédent mesuré.
- Les deux services tournent : 3080 (PID 32232), 8150 (PID 41080).
- Le docstring du service vocal est **incomplet** (5 routes déclarées, 9 servies) et sa constante de 404 est fausse.

**Non vérifié (et je ne le présente pas autrement) :** la chaîne audio réelle ; le rendu effectif de `dsh-sysmon` ; `require('react')` depuis un bundle tiers ; le comportement de l'HMR sur un paquet hors espace de travail ; l'authentification du 3080 ; la disponibilité du nom npm ; la latence de bout en bout.

**La décision exacte qui attend Gaëtan :**

> **Autorise-t-il le principe du module à deux moitiés — un bouton micro dans la page, et une moitié hôte qui relaie vers `8150` en serveur-à-serveur — puis l'installation de `module-vocal-squelette` dans le profil `web` et le redémarrage du harnais qui la rend visible ?**
>
> *Une seule installation, un seul redémarrage. Le retour arrière est écrit d'avance (§ d.5). Rien n'est exécuté avant sa réponse.*

---

*Note écrite par Trinity le 20/09/2026. Sources : `deepseek-harness` @ `ddefc45` (17/09/2026), harnais installé `…\npm\node_modules\@deepseek-ai\dsh`, profil `~/.dsh/profiles/web`, `C:\IA\gl-digital-lab\poste-local\serveur-voix.py`. Chaque affirmation de cette note porte sa ligne, ou est marquée non vérifiée.*
