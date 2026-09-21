# « Studio Z » — ce que j'ai trouvé, ce qui bloque, et ce qu'il faut pour que ça tourne

> **GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset `metroid`.**
> Demande : *« recherche ki studio Z et intègre ! »*
> ⚠️ **Interprétation retenue** : **Z-Image** / *Z-Image-Turbo* — le seul « studio Z » qui
> existe **déjà sur cette machine**. *Toute autre lecture est une devinette, et je ne la fais pas.*

---

## 1. ⭐ « Studio Z » est déjà là — en trois exemplaires, et exécutable zéro fois

**Le graphe existe :**

```
C:\IA\gl-digital-lab\forge-ia\workflows-comfyui\mes-graphes\NEO-3080\10_ZImage_Turbo_RAPIDE.json
C:\IA\gl-digital-lab\forge-ia\workflows-comfyui\sauvegarde-precedente\ (copie)
C:\IA\arkadia-outils\forge-ia\workflows-comfyui\…                    (copie)
```

**Mesuré : 7 243 octets · 10 nœuds · format « graphe d'interface » (`nodes`/`links`).**

```
UNETLoader · CLIPLoader · VAELoader · CLIPTextEncode · ConditioningZeroOut
EmptySD3LatentImage · ModelSamplingAuraFlow · KSampler · VAEDecode · SaveImage
```

**Et la bibliothèque exécutable du harnais, elle, ne contient qu'un seul workflow :**
`base-1024` (SDXL, RealVisXL V5, validé une fois — 1 image, 23 s).

⛔ **Donc : le graphe Z-Image existe trois fois sur le disque et zéro fois dans la
bibliothèque.** *Un fichier posé n'est pas un outil branché — c'est la leçon du chantier
voisin : « un module éprouvé sur une page témoin n'est pas un module branché ».*

---

## 2. ✅ Les modèles SONT là — mais pas là où on les attendait

| Fichier | Poids | Emplacement réel |
|---|---|---|
| `z_image_turbo_bf16.safetensors` | **11,46 Go** | `ComfyUI-**Shared**\models\diffusion_models\` |
| `qwen_3_4b.safetensors` | **7,49 Go** | `ComfyUI-**Shared**\models\text_encoders\` |
| `ae.safetensors` | **0,31 Go** | `ComfyUI-**Shared**\models\vae\` |

⭐ **Ils sont dans `ComfyUI-Shared`, pas dans le dossier `models` de l'installation.**
*Ma première recherche a conclu « absents » — et elle avait tort : je cherchais au mauvais
endroit. C'est la raison pour laquelle le champ `comfyuiDirs` du plugin existe.*

---

## 3. ⛔⛔ L'ARITHMÉTIQUE QUI DÉCIDE DE TOUT : 19,26 Go demandés, 10,24 disponibles

| Ce que le graphe charge | Go |
|---|---|
| `z_image_turbo_bf16.safetensors` | 11,46 |
| `qwen_3_4b.safetensors` | 7,49 |
| `ae.safetensors` | 0,31 |
| **Total** | **19,26** |
| **Carte** (RTX 3080) | **10,24** |

⛔ **Il manque ~9 Go — un facteur 1,9.** *Le graphe tel qu'il est écrit **ne tient pas en
VRAM** : ComfyUI déportera sur la RAM système (63,7 Go, la seule marge réelle de cette
machine), et ça tournera — **lentement**, en faisant passer les poids par le bus à chaque
étape.*

**La variante qui tiendrait existe… et il lui manque un fichier.** Le gabarit officiel
`image_z_image_int8.json` (sur le disque, dans l'installation ComfyUI) appelle :
```
z_image_int8_convrot.safetensors   (≈ 5,7 Go selon le modèle de quantification déjà employé ici)
qwen_3_4b.safetensors              (7,49 Go — déjà là)
ae.safetensors                     (0,31 Go — déjà là)
```
⛔ **`z_image_int8_convrot.safetensors` N'EST PAS sur le disque.** *La variante qui rentre est
donc celle qui manque — et la télécharger est une décision (bande passante), pas un travail.*

---

## 4. ⛔ Les deux blocages immédiats, mesurés

| Constat | Mesure |
|---|---|
| **ComfyUI est ARRÊTÉ** | le plugin pointe sur `http://127.0.0.1:8188` — **le port 8188 est ÉTEINT** |
| **`comfyuiDirs` n'est pas configuré** | champ vide dans le plugin → il ne sait pas où sont les modèles |

⭐ **Rien ne peut être extrait ni lancé tant que ces deux points ne sont pas levés.**
*Et l'un des deux n'est pas technique : démarrer ComfyUI, c'est lancer un job GPU lourd —
`AGENTS.md` §2 dit **un seul à la fois**, et le cerveau vocal vit sur la même carte.*

---

## 5. Ce qu'il faut faire, dans l'ordre — et qui le fait

| # | Le geste | Qui | Pourquoi lui |
|---|---|---|---|
| 1 | **Configurer `comfyuiDirs`** dans la page de réglages du plugin (le dossier `ComfyUI-Shared` **et/ou** l'installation) | **Gaëtan** (ou moi sur son accord) | c'est un réglage d'interface |
| 2 | **Démarrer ComfyUI** | **Gaëtan** | job GPU lourd ; §2 : un seul à la fois |
| 3 | **Extraire le graphe** (`10_ZImage_Turbo_RAPIDE`) depuis le panneau — un clic, l'extraction est validée par `POST /prompt` | **le panneau** | *un graphe d'interface n'est pas exécutable : il doit être extrait* |
| 4 | **Décider de la variante** : bf16 (déport RAM, lent, **rien à télécharger**) ou int8 (**≈ 5,7 Go à télécharger**, tient en VRAM) | **Gaëtan** | bande passante + qualité — décision |
| 5 | Écrire le **paquet de compétence** du workflow (paramètres, pièges, VRAM) une fois qu'il tourne | moi | `comfyui_skill` — c'est fait pour ça |

⭐ **Mon avis, et c'est un avis** : **commencer par le bf16**, parce qu'il ne coûte **aucun
téléchargement**, et qu'il répond à la seule question qui compte d'abord — *est-ce que ça
tourne ?* **La qualité et la vitesse se règlent après ; l'existence d'abord.**

---

## 6. Ce que ce document n'établit pas

- ⚠️ **« Studio Z » = Z-Image est une interprétation.** La recherche publique remonte aussi
  *StudioZ* (un système multi-agents de test de pitch), *KIStudio* (un événement suisse),
  *Z Studio* (Core AI Holdings) et *KiStudio Lab* (logiciel de mesure DAQ) — **aucun n'est
  sur cette machine.** *Si tu visais autre chose, dis-le : c'est une ligne à changer.*
- ⛔ **Je n'ai rien extrait, rien lancé, rien allumé.** ComfyUI reste arrêté, le champ
  `comfyuiDirs` reste vide.
- ⚠️ **Je n'ai pas pesé la qualité du rendu bf16 déporté en RAM.** *« Ça tourne » et « c'est
  utilisable » ne sont pas la même phrase* — et la seconde se mesure en minutes par image.
- ⛔ **Aucune génération n'a été produite, aucune VRAM consommée.**

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Mesures : `comfyui_workflow action: list` (bibliothèque, `baseUrl`, `comfyuiDirs`) ·
lecture du graphe (10 nœuds, format d'interface) · `Get-ChildItem` récursif sur
`Comfy-Desktop` et `C:\IA` pour les trois fichiers de modèle · lecture du gabarit
`image_z_image_int8.json` · `Get-NetTCPConnection` pour le port 8188.*
