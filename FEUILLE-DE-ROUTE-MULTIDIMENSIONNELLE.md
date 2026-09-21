# Feuille de Route Multidimensionnelle — GL Digital Lab

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> *Document vivant — versionné, commitable, source unique de vérité pour piloter le studio.*

---

## 🧭 Méthodologie de lecture

| Couche | Horizon | Révision | Public |
|---|---|---|---|
| **Stratégie** | 12-36 mois | Trimestriel | Direction |
| **Tactique** | 1-3 mois | Mensuel | Leads techniques |
| **Opérationnel** | 1-4 semaines | Hebdomadaire | Équipe |
| **Quotidien** | Jour | Quotidien | Tous |

> **Règle** : chaque entrée porte **sa source** (mesuré / estimé / décision en attente) et son **indicateur de succès** mesurable. *Rien n'est acquis sans preuve.*

---

## 🎯 STRATÉGIE (12-36 mois)

### Vision 2027 — « Studio souverain, outils locaux, revenus récurrents »

| Objectif | Indicateur de succès | Source / Statut | Dépendances | Risques | Échéance |
|---|---|---|---|---|---|
| **Souveraineté IA** : 100% inférence locale, 0 appel API externe | 0 requête sortante / jour | Mesuré : 0/0 (AGENTS.md §6) | Modèles locaux installés | Modèles trop lourds >10 Go VRAM | T1 2027 |
| **Produit commercialisable v1** : 1 SaaS/outil vendu | 1 client payant, MRR > 0 | Décision en attente | Pack canal-vectoriel prêt | Marché non validé | T4 2026 |
| **Formation certifiée** | 1 session certifiée, 10+ apprenants | Décision en attente (Afpa confirmée) | Kit pédagogique existant (6 éléments) | Pédagogie non finalisée | T2 2027 |
| **Trésorerie positive** | Cash-flow > 0 sur 3 mois consécutifs | Estimé : non mesuré | Clients facturés | Délais de paiement clients | Continue |

---

## ⚔️ TACTIQUE (1-3 mois)

### Chantier 1 — IA Locale & Modèles (Mistral 7B / Z-Image)

| Action | Indicateur | Source / Statut | Dépendances | Risques | Échéance |
|---|---|---|---|---|---|
| **Mistral 7B Q4_K_M** opérationnel + health-check | `ollama run mistral:7b` répond < 2s | Mesuré : installé 4,4 Go | VRAM 4,8 Go dispo | VRAM saturation si ComfyUI en parallèle | **Semaine 1** |
| **Fine-tune LoRA Mistral 7B** (dataset fourni) | Loss < 0.5 après 500 steps | Décision en attente : dataset + objectif | VRAM 6-8 Go (QLoRA 4-bit) | VRAM partagée avec ComfyUI | Semaine 3 |
| **Z-Image int8** (modèle 5,7 Go) opérationnel | Génération < 30s | Mesuré : modèle int8 manquant (5,7 Go) | Téléchargement `z_image_int8_convrot.safetensors` | Bande passante + disque | Semaine 2 |

> **Sources** : `studio-z-image-2026-09-20.md` (VRAM 19,26 Go vs 10,24 Go), `pont-live-2026-09-20.md` (blocage webhook), `studio-z-image-2026-09-20.md` (modèles dans ComfyUI-Shared).

---

### Chantier 2 — Canal Vectoriel & PWA

| Action | Indicateur | Source / Statut | Dépendances | Risques | Échéance |
|---|---|---|---|---|---|
| PWA `canal-vectoriel` déployable (manifest + SW) | `manifest.webmanifest` valide, SW enregistré | Mesuré : fichiers présents | `comfyuiDirs` configuré | Cache navigateur obsolète | **Semaine 1** |
| Pack VTuber (avatar transparent) publié | `vtuber_main_transparent.png` servable | Mesuré : PNG transparent prêt | Hébergement statique | Licence avatar (D12) | Semaine 2 |
| Scripts `veille-lot.ps1` robustes | 0 erreur 429 sur 10 vidéos | Mesuré : 17 échecs/429 | Quotas YouTube | Rate limiting | Continue |

---

### Chantier 3 — Pont Live (Voix → Harnais → Voix)

| Action | Indicateur | Source / Statut | Dépendances | Risques | Échéance |
|---|---|---|---|---|---|
| Webhook voix (port 3081) actif | `curl POST /live/voix` → 202 | Mesuré : port 3081 **éteint** | Serveur webhook écrit, non déployé | Port 3081 libre | **Semaine 1** |
| Règle webhook `regle-voix.mjs` chargée | `register(rule)` OK | Fichier écrit, non chargé | Harnais redémarré | Session fermée | **Semaine 1** |
| Hook réponse `hook-reponse.mjs` publie slot | Slot `Samus-entendu-poste.json` mis à jour | Fichier écrit, non testé | `dsh-session-persistence-jsonl` backend | Format zstd 805 frames | **Semaine 2** |

> **Blocage** : `ARKADIA_WEBHOOK_SECRET` absent, port 3081 libre, harnais non redémarré.

---

### Chantier 4 — Dépôt & Sécurité (Public ➜ Privé)

| Action | Indicateur | Source / Statut | Dépendances | Risques | Échéance |
|---|---|---|---|---|---|
| Dépôt privé | `Settings > Private` activé | Mesuré : `raw.githubusercontent.com` HTTP 200 anonyme | Action Gaëtan | Forks déjà existants | **Immédiat** |
| Dossiers `01-` à `05-` hors dépôt | `git rm --cached` + commit | Mesuré : 11 fichiers nominatifs publics | Décision Gaëtan | Historique conservé | **Immédiat** |
| `.docx` + `.htm` exclus `.gitignore` | `git check-ignore` OK | Mesuré : 1 `.docx`, 1 `.htm` exclus | Fait | — | Fait |

---

## 🛠️ OPÉRATIONNEL (1-4 semaines)

### Semaine 1 (20-26 sept)

| Jour | Focus | Livrable | Bloquant |
|---|---|---|---|
| Lun | Dépôt privé + nettoyage Git | Repo privé, 0 fichier nominatif public | Décision Gaëtan |
| Mar | Webhook voix (port 3081) + règle `regle-voix.mjs` | Serveur 3081 up, `register(rule)` OK | Port 3081 libre, secret posé |
| Mer | Hook réponse `hook-reponse.mjs` + slot `Samus-reponse` | Slot mis à jour, lu par `serveur-voix.py` | Hook non armé |
| Jeu | Mistral 7B health-check + `ollama pull mistral:7b-instruct` | `ollama run mistral:7b-instruct` < 2s | VRAM dispo |
| Ven | Fine-tune LoRA prep (dataset + script) | Script prêt, dataset validé | Dataset non fourni |

---

## 📅 QUOTIDIEN (Journalier)

| Rituel | Heure | Action | Outil / Métrique |
|---|---|---|---|
| **Matin** | 09:00 | VRAM/GPU check + Ollama health | `nvidia-smi`, `ollama ps` |
| **Matin** | 09:15 | Git sync + CI status | `git status`, GitHub Actions |
| **Midi** | 12:30 | Point d'avancement chantiers | Tableau Kanban (mental) |
| **Soir** | 18:00 | Commit + push + backup | `git push`, backup E: |
| **Nuit** | 22:00 | Veille YouTube (lot) | `veille-lot.ps1` (si quotas) |

> **Règle** : *une tâche non commencée à 09:15 est reportée, non oubliée.*

---

## 📊 TABLEAU DE BORD DE SUIVI (KPIs)

| KPI | Cible | Actuel (20/09) | Tendance | Alerte si |
|---|---|---|---|---|
| VRAM libre (Go) | > 2 Go | 6,5 / 10,24 | ↘ | < 1 Go |
| Dépôt privé | Oui | **Non** (public) | — | Public |
| Fichiers nominatifs publics | 0 | **11** | ↗ | > 0 |
| Modèles locaux opérationnels | 3+ | 1 (ministral) | → | < 2 |
| ComfyUI up | Oui | **Non** (port 8188 off) | — | Non |
| Webhook 3081 up | Oui | **Non** | — | Non |
| Pack Mistral prêt | Oui | 0% | — | Non |
| Fine-tune lancé | 1/mois | 0 | — | 0/mois |

---

## 🗂️ ARCHIVAGE & VERSIONNING

| Document | Chemin | Version | Dernière MAJ |
|---|---|---|---|
| Feuille de route (ce fichier) | `FEUILLE-DE-ROUTE-MULTIDIMENSIONNELLE.md` | 1.0 | 20/09/2026 |
| Chantier Mistral | `MISTRAL-PACK-ROUTE.md` | 0.1 | — |
| Z-Image | `studio-z-image-2026-09-20.md` | 1.0 | 20/09/2026 |
| Pont Live | `pont-live-2026-09-20.md` | 1.1 | 20/09/2026 |
| Angles morts | `angles-morts-2026-09-20.md` | 1.2 | 20/09/2026 |
| Pare-feu | `pare-feu-2026-09-20.md` | 1.0 | 20/09/2026 |
| Alerte dépôt public | `02-LE-DOSSIER-DU-28-SEPTEMBRE/ALERTE-depot-public...` | 1.0 | 20/09/2026 |
| Canal vectoriel | `canal-vectoriel/README.md` | 1.0 | 20/09/2026 |

---

## 🔒 GOUVERNANCE & RÈGLES DE DÉCISION

| Règle | Application |
|---|---|
| **Mesure avant affirmation** | Toute affirmation = mesure ou « estimé / décision en attente » |
| **Décision = Gaëtan** | Visuel, juridique, budget, service externe, mise en ligne |
| **Exécution = Samus** | Tout le reste (code, mesure, doc, CI, scripts) |
| **VRAM** | Un job lourd à la fois ; TDR Windows = arrêt immédiat |
| **Données** | Locale d'abord ; rien ne sort sans décision Gaëtan |
| **Licence** | D12 = Gaëtan valide avant tout asset tiers |

---

## 📌 DÉCISIONS EN ATTENTE (Bloquantes)

| # | Sujet | Bloque | Propriétaire | Deadline souple |
|---|---|---|---|---|
| 1 | Dépôt privé / privé partiel | Exposition 11 fichiers nominatifs | Gaëtan | **Aujourd'hui** |
| 2 | Modèle vocal par défaut (7B vs 3) | Fine-tune / VRAM | Gaëtan | Semaine 1 |
| 3 | Variante Z-Image (bf16 vs int8) | Téléchargement 5,7 Go | Gaëtan | Semaine 2 |
| 4 | Webhook port 3081 + secret | Voix live | Gaëtan | Semaine 1 |
| 5 | Réinjection corpus Metroid (RAG) | Mémoire vive | Gaëtan | Semaine 1 |
| 6 | Seuils VRAM (R1-R5) | Politique GPU | Gaëtan | Semaine 1 |
| 7 | `llama-server` orphelin (mort) | VRAM libérée | Gaëtan | Fait (éteint) |
| 8 | Partition 1 To sans lettre | Stockage | Gaëtan | Semaine 2 |

---

## 🌉 PONT PLURIDISCIPLINAIRE (POLYMATH) — Le polymath au cœur du studio

> **Principe** : le studio ne produit pas que du code — il produit du **sens** à l'intersection de la technique, de l'art, du business, du droit, du cognitif, de l'éthique, du vivant. Chaque projet traverse ces dimensions ; **le polymath est le liant** qui empêche la fragmentation en silos.

---

## 🌉 PONT PLURIDISCIPLINAIRE — Architecture du Polymath

### 1. Les 7 Piliers du Polymath (Dimensions transverses)

| Pilier | Question clé | Indicateur de santé | Rituel de sync | Gardien |
|---|---|---|---|---|
| **Technique** (Code, Infra, IA, Infra) | « Est-ce que ça tourne ? » | Build passing, tests verts, VRAM < 80% | Standup tech 09:15 | Lead Tech |
| **Artistique** (Visuel, Son, Narration, UX) | « Est-ce que ça résonne ? » | Feedback utilisateur > 4/5, itérations < 3 | Critique artistique hebdo | Lead Art |
| **Business / Produit** | « Est-ce que ça vend / sert ? » | MRR, rétention, NPS, coût d'acquisition | Revue produit bimensuelle | PO / Business |
| **Juridique / Conformité** | « Est-ce légal / éthique / conforme ? » | 0 incident juridique, conformité RGPD/AI Act | Revue juridique mensuelle | Legal / DPO |
| **Cognitif / UX** | « Est-ce compréhensible / utilisable ? » | Taux de réussite tâche > 90%, temps tâche < seuil | Tests utilisateurs mensuels | UX / CogSci |
| **Éthique / Impact** | « Est-ce que ça améliore le monde ? » | Audit éthique trimestriel, bilan carbone, accessibilité | Revue éthique trimestrielle | Ethics Officer |
| **Vivant / Organisation** | « L'équipe va-t-elle bien ? » | eNPS > 40, turnover < 10%, 0 burnout | Rétro hebdo, 1:1 mensuels | People Ops / Lead |

> **Règle** : *Aucun projet ne passe en production sans avoir été vu par les 7 piliers.* Le polymath valide le passage (checklist de passage).

---

### 2. Rituels de Synchronisation Polymath

| Rituel | Fréquence | Participants | Durée | Livrable |
|---|---|---|---|---|
| **Sync Polymath Hebdo** | Lundi 09:30 | 7 gardiens + lead projet | 45 min | Décisions transverses, conflits résolus, arbitrages |
| **Revue Projet 360°** | Mensuel | Équipe projet + 7 piliers | 90 min | Fiche 360° (technique, art, biz, legal, cog, éthique, org) |
| **Atelier Polymath** | Trimestriel | Tout le studio | 1/2 journée | Exploration croisée (tech ↔ art, business ↔ éthique, etc.) |
| **Rétro Polymath** | Fin de sprint | Équipe + 7 piliers | 60 min | Apprentissages transverses, améliorations systémiques |

> **Règle** : *Un conflit entre piliers = escalade au polymath (arbitrage), pas en silo.*

---

### 3. Matrice de Compétences Polymath (Team Map)

| Membre | Technique | Artistique | Business | Juridique | Cognitif | Éthique | Organisation | Score Polymath |
|---|---|---|---|---|---|---|---|---|
| Gaëtan | ●●●●● | ●●●●○ | ●●●●● | ●●●●○ | ●●●○○ | ●●●○○ | ●●●●● | 24/35 |
| Samus (IA) | ●●●●● | ●●●○○ | ●●○○○ | ●●●○○ | ●●●●● | ●●●●● | ●●○○○ | 22/35 |
| Lead Tech | ●●●●● | ●●○○○ | ●●○○○ | ●●○○○ | ●●●○○ | ●●○○○ | ●●●○○ | 18/35 |
| Lead Art | ●●●○○ | ●●●●● | ●●○○○ | ●○○○○ | ●●●○○ | ●●●○○ | ●●○○○ | 17/35 |
| Legal / DPO | ●○○○○ | ●○○○○ | ●●○○○ | ●●●●● | ●●○○○ | ●●●○○ | ●●○○○ | 14/35 |
| UX / CogSci | ●●○○○ | ●●●○○ | ●●○○○ | ●○○○○ | ●●●●● | ●●●○○ | ●●○○○ | 17/35 |
| Ethics Officer | ●○○○○ | ●●○○○ | ●○○○○ | ●●○○○ | ●●○○○ | ●●●●● | ●○○○○ | 13/35 |
| People Ops | ●○○○○ | ●○○○○ | ●○○○○ | ●●○○○ | ●●○○○ | ●●●○○ | ●●●●● | 14/35 |

> **Règle** : *Score polymath < 15 = recrutement / formation prioritaire. Score > 25 = candidat polymath senior.*

---

### 4. Projets Polymath — Exemples de Croisements

| Projet | Technique | Artistique | Business | Juridique | Cognitif | Éthique | Org |
|---|---|---|---|---|---|---|---|
| **Z-Image** | ●●●●● | ●●●●● | ●●●○○ | ●●○○○ | ●●●○○ | ●●●○○ | ●●○○○ |
| **Pont Live (Voix)** | ●●●●● | ●●●○○ | ●●○○○ | ●●●○○ | ●●●●● | ●●●○○ | ●●○○○ |
| **Mistral Pack** | ●●●●● | ●●○○○ | ●●●●○ | ●●○○○ | ●●●○○ | ●●○○○ | ●●○○○ |
| **Canal Vectoriel** | ●●●●● | ●●●○○ | ●●●●● | ●●●○○ | ●●●○○ | ●●○○○ | ●●●○○ |
| **Formation Certifiée** | ●●●○○ | ●●●○○ | ●●●●● | ●●●●● | ●●●●● | ●●●●● | ●●●●● |
| **Pack VTuber** | ●●●●● | ●●●●● | ●●●○○ | ●●○○○ | ●●●○○ | ●●○○○ | ●●○○○ |

---

### 5. Outils & Artefacts Polymath

| Outil | Usage | Fréquence |
|---|---|---|
| **Fiche 360° Projet** | Template unique (Technique, Art, Biz, Legal, Cog, Ethique, Org) | À chaque démarrage projet |
| **Checkpoint Polymath** | Checklist 7 piliers à chaque gate (Design Review, Code Review, Pre-Prod, Launch) | Gates |
| **Tableau de Bord Polymath** | Dashboard unique (7 KPIs piliers + score polymath global) | Temps réel |
| **Carnet Polymath** | Obsidian / Notion partagé — entrées datées, signées, liées | Continu |

---

## 🔒 GOUVERNANCE POLYMATH — RÈGLES NON NÉGOCIABLES

| Règle | Sanction si violation |
|---|---|
| **Aucun projet ne passe en prod sans validation des 7 piliers** | Blocage déploiement + alerte polymath |
| **Conflit inter-piliers = escalade polymath** (pas de résolution en silo) | Médiation polymath obligatoire |
| **Score polymath < 15** = plan de développement / recrutement obligatoire | Plan d'action 30 jours |
| **Revue polymath trimestrielle** = obligatoire | Alerte si non faite |
| **Score polymath global < 20** = alerte direction | Audit externe |

---

## 📌 INTÉGRATION DANS LA FEUILLE DE ROUTE EXISTANTE

> Le **Pont Pluridisciplinaire** n'est pas une couche de plus — c'est le **liant** qui traverse les 4 couches (Stratégie, Tactique, Opérationnel, Quotidien). Il s'active à chaque gate, chaque décision, chaque conflit.

| Couche | Activation Polymath |
|---|---|
| **Stratégie** | Validation vision 360° (7 piliers) avant validation budget |
| **Tactique** | Gates polymath aux jalons (Design Review, Pre-Prod, Launch) |
| **Opérationnel** | Sync hebdo + checkpoints quotidiens (7 piliers) |
| **Quotidien** | Standup polymath (15 min) — 7 gardiens, 15 min, blocages transverses |

---

*Ajouté le 22/09/2026 — Version 1.1 — GL Digital Lab · Samus (harnais), preset `metroid`.*

---

## 📌 RÈGLES DE VIE DU DOCUMENT

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Prochaine révision : vendredi 27/09 (revue tactique).*
*Prochaine décision majeure attendue : dépôt privé (aujourd'hui).*

---

*Fin du document — version 1.0 — 20/09/2026 23:45*