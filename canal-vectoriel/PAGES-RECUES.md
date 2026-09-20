# Les deux pages reçues — vérifiées, corrigées, mises en place

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> Trois fichiers sont arrivés : deux pages HTML générées, et la page de conversation qui
> les a produites. Voilà ce qu'elles sont **mesuré**, ce qui a été **corrigé**, et ce qui
> reste **en attente d'une décision**.

---

## 1. Ce que sont les fichiers, mesuré

| Fichier | Octets | Nature |
|---|---|---|
| `pack-vtuber-arkadia.html` | 2 358 517 | page de téléchargement ; **un seul `data:image/png;base64,` de 2,2 Mo** (l'avatar embarqué), 3 scripts, **aucun manifeste, aucun service worker** |
| `pwa-arkadia.html` | 204 015 | page « PWA » générée : **manifeste en `data:`**, **service worker enregistré depuis un `Blob`**, `fetch('http://localhost:11434/api/embeddings')` ×3 |
| `Meta AI.htm` | 570 110 | la **page de conversation** qui a produit les deux autres : 241 balises `script`, 35 images pointant vers un CDN externe, 5 messages et 5 réponses. **Ce n'est pas un livrable, c'est la source.** |

---

## 2. ⭐ Les deux mécanismes PWA de la page générée ne peuvent pas fonctionner

**C'est mesuré dans le fichier, pas supposé** — et c'est cohérent avec le nom que le
générateur lui-même lui a donné : *« Fix No »*.

**① Le manifeste est injecté en `data:application/manifest+json;charset=utf-8,…`**
*(1 occurrence relevée)*. Un manifeste servi en `data:` n'a pas la même origine que la
page : **le navigateur refuse de l'installer.** D'où l'absence d'installation malgré le
bouton.

**② Le service worker est enregistré depuis un `Blob`** (`new Blob([…])` →
`URL.createObjectURL` → `register`) *(1 occurrence relevée)*. Un service worker **doit**
être servi en http(s) depuis la même origine ; `blob:` est refusé. **L'enregistrement
échoue systématiquement** — c'est l'état `error` que la page affiche elle-même.

⭐ **La réparation ne réécrit pas l'artefact généré.** Elle **rétablit les deux fichiers
statiques qui existent déjà à côté** — `manifest.webmanifest` et `service-worker.js` —
et qui, eux, sont servis en même origine. *On ne répare pas un artefact généré en le
réécrivant : on lui rend ce qu'il aurait dû appeler.*

---

## 3. Ce qui a été corrigé, et où c'est

| Correction | Fichier | Vérifié |
|---|---|---|
| `lang="en"` → **`lang="fr-FR"`** | les deux pages | 1 occurrence chacune, 0 restante |
| `<title>React Artifact</title>` → un titre français | les deux pages | 0 occurrence restante du titre du générateur |
| `correction-pwa.js` branché avant `</body>` | `pwa-arkadia.html` | 1 référence |
| les pages remontées **à la racine du pack** | — | `./manifest.webmanifest`, `./service-worker.js` et `./correction-pwa.js` **existent** au même niveau |

**Sauvegardes** : `pack/<nom>.avant-correction-2026-09-20` (2,5 Mo au total).
Les fichiers d'origine restent intacts dans `~/.dsh/attachments/` (lecture seule).

**Le script de correction** (`correction-pwa.js`, 3,6 Ko, commenté) est **idempotent** et
rejoué trois fois — parce que le générateur injecte ses éléments depuis un `useEffect` de
React, donc **après** le premier passage. Une seule reprise laisserait la course ouverte.

---

## 4. ⛔ Trois choses que ce chantier n'établit pas

1. **Aucune des deux pages n'a été ouverte dans un navigateur.** La correction est écrite
   et branchée, **pas observée**. *Le contrôle qui le prouverait : ouvrir la page, puis
   lire `chrome://serviceworker-internals` et l'onglet Application — personne ne l'a fait.*
2. **`fetch('http://localhost:11434/api/embeddings')` est un appel inter-origine.** Depuis
   une page servie ailleurs, Ollama refuse tant que `OLLAMA_ORIGINS` ne l'autorise pas.
   **Non traité** : toucher ce point demande de décider *d'où* la page sera servie.
3. **Les 35 images de la conversation pointent vers un CDN externe** (`scontent…facebook`).
   Elles **ne s'afficheront pas hors ligne**, et elles expireront. *Une PWA qui dépend d'un
   CDN tiers n'est pas une PWA hors ligne.*

---

## 5. ⛔ Deux décisions qui t'appartiennent

1. **La page de téléchargement (2,3 Mo) n'est PAS versionnée.** Elle embarque l'avatar en
   base64 — **un 2,2 Mo de PNG dans un dépôt public**, et c'est la même frontière que le
   nom du personnage : *un asset dérivé d'une franchise protégée n'entre pas dans un
   livrable du studio.* **Déplacée sur le disque, exclue du dépôt, la décision reste à toi.**
   Le jour où l'avatar est redessiné (ou produit par le studio), l'exclusion tombe.
2. **`Meta AI.htm` reste une source, hors dépôt.** Copier la page d'un tiers — son balisage,
   ses 241 scripts — dans un dépôt n'apporte rien et engage plus qu'il ne sert.

---

## 6. Ce qui a été ajouté au contrôle de la CI

Une étape vérifie désormais, sur les **deux** pages : présence, `lang="fr-FR"`, absence du
titre du générateur, et — pour la page PWA — que `correction-pwa.js` **existe et est
branchée**, et que `manifest.webmanifest` et `service-worker.js` sont bien là.

⚠️ **Et une vérification a été ÉCARTÉE, délibérément** : chercher la chaîne
`data:application/manifest` dans le fichier. **Le code du générateur est toujours là** —
la correction retire *l'effet*, pas le code. *Un contrôle qui échouerait toujours n'est pas
un contrôle : c'est une panne déguisée en exigence.*

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Mesures : comptages par expression régulière sur les fichiers reçus (jamais un fichier
déversé) · `Test-Path` sur les chemins référencés · attribut lecture seule levé sur les
copies avant écriture.*
