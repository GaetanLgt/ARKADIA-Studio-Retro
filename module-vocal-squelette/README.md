# module-vocal-squelette — `dsh-voix-locale`

**Squelette de greffon pour le harnais.** Poser un bouton micro dans l'interface du 3080, capter **le micro de la page** (donc indépendant du focus, contrairement à la dictée de Windows), faire transcrire en local par `127.0.0.1:8150`, et **écrire le texte directement dans la conversation du harnais**.

> ⚠️ **Ce n'est pas une démonstration, c'est un point de départ.** Le code n'a **jamais été exécuté**. Rien n'a été installé, construit ni redémarré. Deux points précis sont **non vérifiés** et isolés en un seul endroit chacun : `require('react')` dans `client/client.js`, et le nom du service `slots`.

---

## La forme, et pourquoi elle est celle-là

Le module a **deux moitiés**, dans un seul paquet npm. C'est la structure de `dsh-sysmon`, `dsh-mermaid` et `dsh-comfyui` — trois greffons tiers installés sur EVA01.

```
module-vocal-squelette/
├── package.json          dsh.bundle.patch + dsh.client { platform: 'web' }
├── cordis.patch.yml      insère la ligne de greffon dans le profil
├── lib/index.js          MOITIÉ HÔTE (Node) — routes HTTP sur le 3080, relais vers 8150
└── client/client.js      MOITIÉ CLIENT (navigateur) — bouton, micro, écriture conversation
```

**Aucune construction n'est nécessaire.** Le bundle client est un `window.__ModuleLoader__.load({ id, factory })` écrit à la main. Précédent mesuré : `dsh-sysmon/lib/client.js` **l. 1-3** — *« Hand-written lazy-CJS bundle (no build step, no dsh imports) »*.

### Les trois points exacts qui font que ça marche

| Point | Appel | Source |
|---|---|---|
| Le bouton se pose ici | `ctx.slots.inject('conversation.input.right', …)` | `docs/subsystems/slots.md` l. 35-40 · emplacement déclaré dans `…/contract/slots.d.ts` **l. 207-211** |
| La portée `session` donne `inputActions` | `SessionStandardProps.inputActions` | `…/contract/slots.d.ts` **l. 241-248** |
| **Le texte entre dans la conversation** | `inputActions.setDraft(texte)` puis `inputActions.submit()` | `…/contract/input.d.ts` **l. 211-220** |

**Pas de presse-papier. Pas de clavier. Pas de dispatch d'événement.** La face publique documentée suffit — et elle passe par la **même adjudication** qu'un envoi tapé à la main (donc une ligne en `/` reste une commande).

### Pourquoi la moitié hôte est obligatoire

Le service vocal **refuse en 403 toute requête portant un en-tête `Origin`** (`C:\IA\gl-digital-lab\poste-local\serveur-voix.py` **l. 1518, 1536, 1540, 1574**). C'est un **correctif de sécurité du 17/09/2026** contre un trou mesuré : sans lui, n'importe quelle page ouverte sur le poste pouvait appeler `/ecouter` et **ouvrir le micro**.

Un `fetch()` depuis la page du 3080 enverrait forcément `Origin` → **403**.

Donc la page parle à **sa propre moitié hôte, en même origine** (`/voix-local/…` sur le 3080), et l'hôte parle à 8150 **en serveur-à-serveur, sans en-tête `Origin`** → accepté.

⛔ **On ne retire pas `_origine_refusee()` pour faire marcher un bouton.** Le module s'y conforme.

---

## Les routes servies par la moitié hôte

| Méthode | Route | Corps | Rôle |
|---|---|---|---|
| `GET` | `/voix-local/sante` | — | relais de `/sante` du service vocal |
| `POST` | `/voix-local/transcrire` | octets audio bruts | écrit un temporaire, appelle `/transcrire` de 8150 (qui prend un **chemin**, l. 1662-1669), supprime le temporaire |
| `POST` | `/voix-local/dire` | `{ texte, voix }` | relais de `/dire` — lecture dans le casque. `voix` par défaut **`piper`, hors ligne** |

Aucune de ces routes n'est le préfixe d'une autre — *piège déjà payé côté service vocal* (`/ecouter` → `/ecouter-auto`, commentaire **l. 1580-1584**).

---

## Les commandes — **écrites, non exécutées**

⛔ Le harnais sert Gaëtan **en direct** sur le 3080. Aucune de ces commandes n'est à un agent.

```powershell
# 1. Déclarer le module dans le profil web (le CLI transmet à pnpm dans le dossier du profil) :
dsh plugin --profile web add "file:C:\Users\neosp\Desktop\ARKADIA Studio Retro\module-vocal-squelette"

# 2. Ajouter "dsh-voix-locale" dans dsh.profile.bundles de
#    C:\Users\neosp\.dsh\profiles\web\package.json          (édition à la main)

# 3. Régénérer le verrou et installer — piège payé, PLUGINS-AJOUTES.md l. 3-5 :
pnpm install --dir "C:\Users\neosp\.dsh\profiles\web"

# 4. REDÉMARRER le harnais — indispensable, la métadonnée de paquet est mise en
#    cache « jusqu'au redémarrage » (docs/subsystems/client-modules.md l. 81).

# 5. Contrôles, une fois redémarré :
Invoke-RestMethod "http://127.0.0.1:3080/voix-local/sante"
Invoke-RestMethod "http://127.0.0.1:3080/voix-local/dire" -Method Post `
  -ContentType "application/json" -Body '{"texte":"contrôle du module vocal"}'
```

**Retour arrière :** retirer `"dsh-voix-locale"` de `dsh.profile.bundles` → `dsh plugin --profile web remove dsh-voix-locale` → `pnpm install --dir "C:\Users\neosp\.dsh\profiles\web"` → redémarrer.

---

## Ordre de mise au point, si ça ne marche pas du premier coup

1. **Bouton absent et page blanche** → `require('react')` indisponible. C'est le point non vérifié n° 1 (`client/client.js`, en-tête du `factory`). La console du navigateur le dira (`[voix-locale] React indisponible…`).
2. **Bouton absent, page normale** → le service `slots` n'est pas le bon nom (point non vérifié n° 2, `exports.inject`). Ou la ligne n'est pas dans `dsh.profile.bundles`.
3. **Bouton présent, `/voix-local/sante` en 404** → la moitié hôte n'a pas activé son `webServer`. `dsh-sysmon` **l. 13** confirme `export const inject = ['webServer']`.
4. **« micro indisponible : la page n'est pas dans un contexte sécurisé »** → ce n'est pas un bug. **Ouvrir `http://127.0.0.1:3080`, pas une IP de réseau local.** `getUserMedia` exige un contexte sécurisé ; `127.0.0.1` en est un, une IP LAN non.
5. **Transcription qui rend du vide** → la chaîne `MediaRecorder` (`webm/opus`) → Whisper n'a **pas été mesurée**. Le service accepte l'extension `.webm` (**l. 1668**), mais le résultat sur une vraie voix n'est pas établi.

---

## Ce que ce squelette n'établit pas

- **Aucune ligne n'a été exécutée.** Ni le micro, ni les routes, ni l'insertion dans la conversation.
- `require('react')` depuis un bundle **tiers** : lecture de documentation (`dsh-client-modules/README.md` **l. 41**), **pas** mesure — 0 occurrence de `PLATFORM_MODULES` dans les paquets installés (minifié).
- Le nom du service `slots` : repris tel quel de `docs/subsystems/slots.md` **l. 32**.
- Le comportement de l'**HMR** sur un paquet **hors** espace de travail : s'il surveille le bundle, une retouche du bouton ne coûte **pas** de redémarrage ; sinon, elle en coûte un. **À mesurer en premier** — ça décide du confort de tout le chantier.
- Le nom npm `dsh-voix-locale` n'a **pas** été vérifié comme libre. Pour un usage local (`file:`), la question ne se pose pas.
- Latence de bout en bout : **non mesurée**.
- **Aucun contenu de la franchise Metroid** n'entre dans ce module. Metroid est le sujet du fonds de veille, pas un droit.

---

*Squelette écrit par Trinity le 20/09/2026. Note complète : `chantier-module-harnais-2026-09-20.md`.*
