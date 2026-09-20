# Patterns Metroid → ArkAdiA — traduction design (interne, D12)

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> *Document de travail **interne uniquement**. Ne sort pas du studio. Sert de table de correspondance pour transposer les patterns de design Metroid dans l'ADN ArkAdiA (Mark, Isoca, Claviers, Septième Loi, Bastions, Astra-K).*

---

## 1. Table de correspondance — pattern → équivalent ArkAdiA

| Pattern Metroid (source) | Fonction design | Équivalent ArkAdiA (nom, mécanique, lore) |
|---|---|---|
| **Suit Upgrade (Varia, Gravity, Phazon...)** | Nouvelle capacité = nouveau passage | **Module Mark** (Mark-I → Mark-VII) — chaque Module intègre : protection environnementale + nouvelle traversée + résonance Clavier. Pas de « palette swap » : chaque Mark change la silhouette et le moveset. |
| **Morph Ball** | Forme compacte → tunnels, bombes, boost | **Mode Isoca** — repli sur soi-même (hitbox ÷3), déplacement rampant, pose de **Résonateurs** (≈ bombes), **Propulsion résonante** (≈ boost ball). Coût : pas de Claviers actifs en Isoca. |
| **Scan Visor** | Lecture monde : lore, failles, objets, ennemis | **Analyseur Clavier** — maintient `TAB` : révèle **Résonances** (failles mur, caches, points faibles boss), **Échos** (lore environnemental, fragments Bastions), **Signatures** (ennemis, pièges, Dérive/Ancre). Visuel : spectre fréquentiel, pas overlay bleu. |
| **Beam / Missile / Super Missile / Grapple Beam** | Armes + outils progression (portes colorées, grappin) | **7 Claviers** (un par Bastion) — chacun = arme + clé + utilité :<br>1. **Résonance** (dégâts continus, ouvre portes Résonance)<br>2. **Perforation** (projectile traversant, brise boucliers, ouvre portes Perforation)<br>3. **Ancrage** (grappin physique + data, swing, tirage objets, ouvre portes Ancrage)<br>4. **Fréquence** (ondes, stun, active mécanismes Fréquence)<br>5. **Phase** (tire à travers murs minces, vision au-delà, ouvre portes Phase)<br>6. **Surcharge** (explosion zone, risque auto-dégâts, ouvre portes Surcharge)<br>7. **Silence** (projectile invisible, pas de son, ouvre portes Silence — bastion final) |
| **Portes colorées (Beam/Missile/Power Bomb)** | Gate progression par arme | **Portes Bastion** — scellées par **Résonance** spécifique. Clavier correspondant = clé. Pas de couleur : signature fréquentielle visible à l'Analyseur. |
| **Carte + zones (Brinstar, Norfair, Maridia...)** | Monde interconnecté, raccourcis, backtracking gratifiant | **Astra-K** — planète unique, **7 strates verticales** (Surface → Noyau). Chaque strate = biome (thermique, toxique, électrique, gravitationnel, temporel, quantique, primordial). Raccourcis = **Ancres** (points de transit rapide débloqués par Modules/Claviers). |
| **Chozo Statues / Artifacts** | Civilisation ancienne, dépôts de pouvoir, clés fin de jeu | **Bastions des Premiers** — 7 forteresses scellées, chacune gardée par un **Gardien** (boss). Module Mark + Clavier = récompense. 7e Bastion = **Serrure** (fin de jeu). |
| **Sequence Breaking** | Liberté ordre progression, skill = récompense | **Ouverture** — ordre des 7 Modules/Claviers **libre**. Conséquences :<br>- Zone accessible plus tôt = ennemis plus forts, loot adapté<br>- Zone différée = environnement changé (Dérive/Ancre ont agi)<br>- Speedrun viable : **meilleur temps = meilleur Mark final** (cosmétique + lore) |
| **Boss à patterns multiples (Ridley, Kraid, Metroid Prime...)** | Apprentissage, adaptation, fenêtre de vulnérabilité | **Gardiens des Bastions** — 7 archétypes, chacun = leçon d'un Clavier. Patterns : phases (3-4), fenêtres **Résonance** (Analyseur révèle), **Surcharge** gérable. Pas de « weak spot » unique : **fenêtre tactique** selon Clavier équipé. |
| **Salle de sauvegarde / Recharge** | Point de repos, progression persistée | **Nœuds d'Ancre** — sauvegarde + recharge Modules + transit rapide (si 2 Nœuds connectés). Esthétique : monolithe résonant, pas statue. |
| **Power Bomb** | Outil ultime, zone large, rare | **Surcharge Maximale** — Module Mark-VII + Clavier Surcharge = onde de choc zone, détruit tout scellement Surcharge, coût : **Mark temporairement dégradé** (Mark-VI 30 s). Risque/récompense assumé. |
| **Metroids (larve → alpha → gamma → zeta → omega → queen)** | Évolution ennemie, escalade menace | **Dérive** — entités qui **s'adaptent** au Clavier le plus utilisé du joueur. Contre-mesure : **varier les Claviers** (mécanique anti-spam). Reine = Gardien Bastion 5. |
| **Évasion finale (timer, compte à rebours)** | Tension, mastering, rejouabilité | **Effondrement Astra-K** — après Serrure (Bastion 7), planète se déstabilise. Retour à la navette **par itinéraire choisi** (raccourcis = Modules/Claviers maîtrisés). Temps = score. |
| **Lore environnemental (scans, logs, indices visuels)** | Narration non-linéaire, découverte joueur | **Échos & Signatures** — fragments texte/audio/visuel dans l'Analyseur. **Pas de journal** : le joueur **reconstitue** l'histoire des Premiers, de la Dérive, de l'Ancre. Septième Loi = clé de lecture. |

---

## 2. Principes de traduction (D12 — frontière ferme)

1. **Aucun nom propre Metroid** dans le code, les assets, les docs publics, les commits.
2. **Chaque pattern a un nom ArkAdiA** (Mark, Isoca, Clavier, Bastion, Ancre, Astra-K, Dérive, Surcharge, Écho, Serrure, Gardien, Nœud, Premier).
3. **La mécanique est repensée** pour servir la **Septième Loi** (Déploiement = prise de forme, engagement, conséquence).
4. **Le joueur ne devine jamais la source** — il apprend **la langue d'Astra-K**.
5. **Le fonds Metroid (RAG + vault) reste source d'étude** — pas de copier-coller, de la **distillation**.

---

## 3. Prochaines étapes design (à valider)

- [ ] **Arbre Modules Mark** — dépendances, coûts, silhouettes
- [ ] **Spécs 7 Claviers** — dégâts, cadence, utilité, porte, synergy Isoca
- [ ] **Architecture Astra-K** — 7 strates, connexions, Ancres, flux Dérive/Ancre
- [ ] **Gardiens 1-7** — patterns, fenêtres, récompenses
- [ ] **Surcharge** — courbe risque/récompense, UI, feedback
- [ ] **Ouverture** — balise ordre libre, conséquences monde, speedrun

---

*Document interne — **ne pas diffuser**. Référence pour l'équipe design/code uniquement.*