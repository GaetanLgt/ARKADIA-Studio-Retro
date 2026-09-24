# Deep dive EVA-01 — 24/09/2026

**GL Digital Lab (Génie IT TeK FR) · machine EVA-01 · mesure du 24/09/2026 à 01 h 38-01 h 47.**
*Ce document ne raconte pas ce qui a été fait : il porte **ce qui a été mesuré**, et les écarts que la mesure a révélés.*

> **Règle appliquée.** Aucun chiffre de ce document n'est déduit ni recopié : chacun vient d'une commande lancée sur la machine. *Là où une mesure manque, c'est écrit « non mesuré » — et ça ne se comble pas.*

---

## 1. La machine

| | |
|---|---|
| **Hôte** | `EVA01` — utilisateur `neosp` |
| **OS** | Microsoft Windows 11 Professionnel, build **26200** |
| **Uptime** | **5,7 h** — démarrée le **23/09 à 19 h 55** |
| **RAM** | **30,2 Go utilisés / 63,7 Go** |
| **Disque `C:`** | **446,7 Go libres / 2 724,9 Go** (16 % occupés) |
| **GPU** | **NVIDIA GeForce RTX 3080** — pilote **616.92** |
| **VRAM** | **9 973 MiB / 10 240 MiB** au moment de la mesure — **97 % occupée** |

> ⚠️ **La VRAM est le point de tension.** À 01 h 38, elle était pleine à **97 %**, alors que ComfyUI annonçait **8,38 Go libres** une heure plus tôt. *Un seul job GPU lourd à la fois reste la règle — et la marge réelle est plus faible que le total ne le laisse croire.*

### Les services qui écoutent, mesurés par connexion (pas par processus)

| Port | Service | État |
|---|---|---|
| **8188** | **ComfyUI** — version **0.37.0**, `cudaMallocAsync`, un seul device | ✅ **OUVERT** |
| **11434** | **Ollama** — version **0.34.2** | ✅ **OUVERT** |
| **3080** | **DSH Web** | ✅ **OUVERT** |
| **8080** | *(service non identifié)* | ✅ **OUVERT** |
| **7777** | — | fermé |

### Les outils

| Outil | Version |
|---|---|
| Node.js | **v24.19.0** |
| git | **2.55.0.windows.3** |
| Python | **3.12.10** |
| Ollama | **0.34.2** |

---

## 2. ⚠️ Écart n° 1 — LE JEU N'EST PAS OÙ ON LE CHERCHE

**C'est l'écart le plus coûteux, parce qu'il produit des chemins inventés.**

| Ce qui est annoncé à l'agent | Ce qui existe |
|---|---|
| répertoire de travail : `C:\Users\neosp\Desktop\ARKADIA Studio Retro` | ✅ existe |
| le jeu vit dans **`jeu/`** *(chemin relatif)* | ❌ **`Desktop\ARKADIA Studio Retro\jeu` EST ABSENT** |
| | ✅ le jeu est dans **`C:\IA\ArkAdiA\jeu`** — **41 fichiers** |

**Mesuré** : `C:\IA\ArkAdiA\jeu\` porte **41 fichiers**, dont `epreuve.mjs` (60 489 o), `moteur.mjs`, `donnees.mjs`, `manette.mjs`, `libelles.mjs`, `config.mjs`, `hote.mjs`, et **`donnees/` — 15 fichiers JSON** (ascension, biomes, boss, corps, creatures, evenements, maisons, modules, noms, objets, presentation, **reacteur**, regions, reglages, ressources).

> **Le mécanisme, tel qu'il se produit** : un agent qui ne peut pas vérifier un chemin **ne se tait pas — il en déduit un plausible**, et il l'écrit. C'est la cause mécanique des hallucinations de chemins, déjà documentée par le studio. **La réponse est un résolveur, pas une consigne de plus.**

---

## 3. ⚠️ Écart n° 2 — LE VÉRIFICATEUR EST MYOPE, ET IL REND VERT

`C:\IA\gl-digital-lab\forge-ia\verifier-kits.mjs` — **12 173 o**.

**Ce qu'il annonce** : *« VERDICT : les critères comptables passent »* (code de sortie **0**).
**Ce qu'il a réellement lu** :

| Mesure | Valeur |
|---|---|
| notes du coffre | **144** |
| notes classées **`contenu`** — les seules contrôlées | **12** |
| notes classées **`travail`** — *aucun critère* | **123** *(87 %)* |
| liens internes morts | **0** |
| questions / réponses (contrôles) | **33 / 27** |

**La cause est dans le code**, ligne 72 — `typeDe(rel)` ne reconnaît que la racine (`^\d\d-`, `dossier-`) et `fiches/`. **Tout le reste tombe en `travail`.**

**Et le vrai trou est minuscule** — c'est ce qui rend le défaut trompeur. Sur les **123** notes non contrôlées :

| Ce qu'elles portent | Combien |
|---|---|
| une section « Sources » | **112 / 123** |
| une réserve déclarée | 45 |
| une limite explicite | 19 |
| **ni sources, ni réserve, ni limite** | **1** — `3d/carte-3d.md`, qui est une **carte** |

> ⛔ **Le vert ne dit pas « le coffre est bon ». Il dit « les 12 notes que je regarde ne me contredisent pas ».** *Un garde-fou qui ne couvre qu'un chemin est une porte.*

---

## 4. ⚠️ Écart n° 3 — IL Y AVAIT DEUX COFFRES DU MÊME NOM

**Mesuré** : les deux copies portaient **exactement les mêmes 142 noms de fichiers**, et pourtant :

| Fichier témoin `00-carte-du-vault.md` | Taille | Dernière écriture |
|---|---|---|
| `OneDrive\Documents\Metroid\Vault-Metroid` | **19 320 o** | 24/09 01:39 |
| `C:\IA\Vault-Metroid` | **15 128 o** | **14/09 19:00** |

**Même nom, contenus différents, dix jours d'écart.** *Un même nom posé sur deux contenus est la définition de deux vérités qui divergent en silence.*

⚠️ **Ce qui n'a PAS été établi** : **comment** la seconde copie était alimentée — ni script, ni tâche planifiée, ni synchronisation n'ont été trouvés. *La bascule a été faite à la main, et vérifiée par empreinte SHA256.*

---

## 5. ✅ Ce qui a été livré, et ce qui est vérifié

| Livraison | Vérification |
|---|---|
| **`C:\IA\Vault-Metroid` = source de vérité** (décision de Gaëtan) | ✅ **0 divergence** après synchronisation · **144 notes** de part et d'autre |
| **DNS du studio** — `DNS-du-studio.md`, résolveur de chemins | ✅ **17 adresses vérifiées**, **1 absente déclarée** |
| **Carte du coffre revue** | ✅ compteurs des 7 dossiers vérifiés un par un · `ponts/` **4 → 7** · **1 affirmation non mesurée retirée** |
| **INDEX et README** mis à jour | ✅ source de vérité, système oracle, revue du 24/09 |
| **Note de pont sur les coffres** | ✅ mesures, réserves, et ce qu'elle ne prouve pas |
| **Note de pont sur le réacteur** | ✅ corrigée — **elle ne tranche pas le nom** |
| **Vérificateur relancé** | ✅ **0 lien mort** |

---

## 6. ⛔ Ce qui n'a PAS été fait, et qui doit se dire

1. **Le coffre n'a plus qu'un seul exemplaire — et donc aucune sauvegarde.** *Décisions de Gaëtan du 24/09 : **sortie du nuage**. OneDrive vidé après vérification par empreinte SHA256 que ses **150 fichiers** étaient identiques à ceux du PC ; les **3 fichiers du studio** trouvés dans iCloud rapatriés.* ⛔ **Conséquence directe : un disque perdu est un coffre perdu.** *C'est le point le plus fragile de cette session.*
2. **Le nom du réacteur n'est pas tranché** — **ORACLE** et **LA SOURCE**, `[À TRANCHER]`, arbitrage de Gaëtan (`C:\IA\ArkAdiA\NOM-DU-REACTEUR-2026-09-22.md`). ⛔ **Rien n'a été écrit qui tranche à sa place.**
3. **Les notes `01` → `11` et les 112 atomes n'ont pas été réécrits** : leur fraîcheur **n'a pas été remesurée à la source**. *On ne réécrit pas ce qu'on n'a pas vérifié.*
4. **Le PDF « Les Actus IA » (Renaud Dekode, 7 pages)** a été **identifié, pas traité** — *hors sujet pour ce coffre, il se classe au dépôt de l'agence.*
5. **Le service du port 8080 n'est pas identifié.**
6. **Les 6 notes d'`ARKADIA-VAULT` ont été comptées et datées, jamais lues.**

---

*Mesuré et écrit sur **EVA-01**, le **24/09/2026**. Toute affirmation de ce document porte sa mesure, sa date, ou la mention explicite de ce qui manque.*
