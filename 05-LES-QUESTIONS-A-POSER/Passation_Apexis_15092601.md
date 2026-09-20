<!-- GLDL-SIG v1 a8491b7ca505cfa873438214d39158a0e54bd183e91dbaad95a39428cc2cce91 -->
# Passation — structure du groupe Apexis, lue dans la présentation

> **Écrit par Apex le 15/09/2026**, à la demande de Gaëtan (*« envoie ça au dossier Apexis »*).
> Destinataire : la session **`metacortex`** (preset « raccordement avec Apexis »).
> Consigne autonome : le destinataire n'a pas vu la conversation d'origine.

---

## 1. Ce qui est arrivé

Gaëtan a déposé dans ce dossier une pièce **nominative, jamais lue par un service distant** :

```
Presentation entreprise professionnel bleu dore - Pr.pdf
74,9 Mo · 46 pages · 54 images · PDF 1.7
```

Mesuré : **c'est un diaporama d'images.** 45 pages sur 46 n'ont aucune couche de texte
(665 caractères en tout, dont 640 sur la seule page 2, qui cite déjà « Apexis »).
Aucun « SIREN », aucun « SASU », aucun courriel : **tout est dans l'image**.

**Méthode employée, et elle est rejouable** (outils locaux du dossier `outils-locaux/`) :

| Étape | Outil | Ce qu'il fait |
|---|---|---|
| 1 | `sonde-pdf.py` | mesure la pièce **sans en recopier une ligne** (comptages, numéros de page) |
| 2 | `lecture-locale-pdf.py` | lit la plus grande image de chaque page par **`qwen2.5vl:7b` sur Ollama local** (`127.0.0.1:11434`), puis **filtre localement** |

**Ce que la chaîne garantit** : aucune planche écrite sur le disque (elles vivent en mémoire,
pypdf → base64 → Ollama) · aucune réponse brute archivée · **rien n'est passé par une route
distante** · le filtre local retire courriels, téléphones, identifiants, codes postaux, liens et
noms de personnes avant écriture.

Résultat mesuré : **46 pages traitées, 0 échec, 0 ligne retirée par le filtre.**
Sortie : `Structure_Apexis_15092601.md` (racine de ce dossier, nommée selon la convention du § 7).

---

## 2. La structure lue

| Entité | Forme lue | Activité lue |
|---|---|---|
| **Apexis Group Holding** (aussi lu « APEXIS GROUP ») | holding | construction, développement, transmission de groupes d'entreprises · stratégie financière et fiscale · direction, stratégie, pilotage |
| **Consult Apexis** | SAS | conseil, audit, chargé de sécurité, prévention |
| **LPSP — Learn Private Security Protect** | — | sécurité privée, formation |
| **SCI Apexis** | SCI | immobilier professionnel, locaux, patrimoine |
| **Bureau Stratégie & Sûreté** | SAS | audit, conseil, stratégie, accompagnement |

Page 42 récapitule les domaines : *immobilier, conseil et expertise, sécurité et formation*.

**Aucune entité en informatique, IA, digital ou « tek ».** Gaëtan a confirmé le 15/09/2026 que
**ses cinq filiales IT/IA sont ailleurs**, et que **cette présentation est celle d'Apexis** :
ne pas chercher à faire rentrer les deux listes l'une dans l'autre.

---

## 3. ⚠️ Ce que cette lecture CORRIGE chez nous

Nos propres dossiers affirment :

- `vault-agence/base-factuelle-structure-expert-comptable-2026-09-11.md` § B1 :
  *« "SASU LPSP" est décrit comme la holding d'Apexis. Or une SASU ne peut pas avoir plusieurs associés. »*
- `vault-agence/dossier-france-travail-28-septembre-2026.md` § 4 :
  même hypothèse, avec la conséquence sur l'ACRE et l'AGEFIPH.

**La présentation dit l'inverse** : **LPSP = Learn Private Security Protect, sécurité privée et
formation** — ce n'est pas la holding. La holding s'appelle **Apexis Group Holding**.

Conséquence pratique : **la question à l'expert-comptable change de forme.** Elle ne porte plus sur
« la SASU LPSP » mais sur **Apexis Group Holding** et sur **cing entités nommées**. Les questions
ACRE / AGEFIPH / intégration fiscale restent identiques dans leur fond.

⚠️ Les deux documents ci-dessus **ne doivent pas être corrigés à la main** avant vérification :
voir § 5.

---

## 4. Ce que cette lecture NE prouve PAS — à ne pas oublier

1. **C'est un OCR.** La lecture a été faite par un **modèle de vision de 7B**, pas par une source.
   Le modèle a écrit tour à tour « Apexis » et « APEXIS » ; page 16 il hésite entre « Holding » et
   « Holding Active ». **L'orthographe exacte des noms doit être vérifiée sur la pièce** avant
   d'entrer dans un document de référence.
2. **« 0 ligne retirée » ne prouve pas que la pièce est vierge** : cela mesure seulement ce que le
   modèle a écrit. La pièce elle-même n'a pas été auditée.
3. **La pièce n'a pas été archivée, copiée ni indexée.** Elle est restée où Gaëtan l'a posée.

---

## 5. Ce qui attend une décision

| # | Question | À qui | Pourquoi |
|---|---|---|---|
| 1 | **Vérifier les cinq entités au registre officiel** | **Gaëtan** | `forge-ia/verifier-entreprises.mjs` interroge `recherche-entreprises.api.gouv.fr` (INPI+INSEE+RNE). Des **noms de sociétés sont publics**, donc c'est dans la règle — mais cela **envoie les noms à un tiers**. Accord explicite requis. **Non fait.** |
| 2 | **Où sont les cinq filiales IT / IA / digital / tek ?** | **Gaëtan** | Annoncées le 15/09/2026, introuvables dans nos documents (mesuré : `vault-agence/` ne contient aucune filiale de GL Digital Lab, et le RAG ne remonte que du bruit à 0,777). Elles sont « ailleurs » — il faut la source. |
| 3 | **Corriger ou non `base-factuelle-structure-expert-comptable-2026-09-11.md`** | **Gaëtan** | La correction n'a de valeur qu'après la vérification du point 1. |
| 4 | **Le PDF** : le déplacer dans un dossier de pièces et ne donner que son chemin | Gaëtan | Règle du studio : *un document administratif se pose dans le dossier local des pièces, on donne son chemin.* Il est aujourd'hui à la racine de ce dossier de travail. |

---

## 6. Surface de contact

- Pièce : `C:\Apexis Holding\Presentation entreprise... - Pr.pdf` **(ne pas l'ouvrir avec un modèle distant)**
- Outils locaux : `C:\Apexis Holding\outils-locaux\` (`sonde-pdf.py`, `lecture-locale-pdf.py`)
- Sortie : `C:\Apexis Holding\Structure_Apexis_15092601.md`
- Dossiers Apexis déjà écrits, à ouvrir en premier :
  `vault-agence/apexis-dossier-de-decision-2026-09-14.md` ·
  `vault-agence/noyau-dur-gl-digital-lab-et-apexis-2026-09-14.md` ·
  `vault-agence/dossier-integration-apexis-2026-09-11.md`

**Interdits, repris du preset Apex et de la règle du studio** : aucune pièce nominative par une route
distante · ne rien recommander sur le juridique (D12 : expert-comptable et avocat) · ne pas écrire un
nom non vérifié dans un document de référence · ne pas pousser sur git.

---

## 7. Convention de nommage des pièces — règle donnée par Gaëtan le 15/09/2026

**Le motif :** `<Type>_<Projet>_<AAMMJJ><NN>.<ext>`

**L'exemple qui l'a fait écrire** (et il vaut référence) :

```
Pr.pdf   →  révision  →  Présentation_Apexis_15092601.pdf
                 Type : Présentation
                Projet : Apexis
    AAMMJJ + version : 15/09/26 · version 01
```

**Portée appliquée** : les pièces du **dossier Apexis**. C'est la lecture retenue ici ; Gaëtan a
répondu *« c'est une règle de nommage, pas un fichier »*, ce qui tranche l'intention mais **pas
l'étendue**. Les deux fichiers de cette passation ont donc été renommés pour l'appliquer :

| Avant | Après |
|---|---|
| `PASSATION-apexis-structure-2026-09-15.md` | `Passation_Apexis_15092601.md` |
| `outils-locaux/structure-extraite-2026-09-15.md` | `Structure_Apexis_15092601.md` |

### ⚠️ La tension, mesurée, et elle doit être tranchée

**Le vault du studio utilise une autre convention**, en minuscules et tirets, avec la date ISO :

```
vault-agence/apexis-dossier-de-decision-2026-09-14.md
vault-agence/noyau-dur-gl-digital-lab-et-apexis-2026-09-14.md
vault-agence/dossier-france-travail-28-septembre-2026.md
```

Deux conventions dans le même studio, c'est une divergence qui finit par coûter : *une règle locale
qu'on croit générale ne se remarque que le jour où quelqu'un cherche un fichier.* Trois issues, et
**elles appartiennent à Gaëtan** :

1. la règle ne vaut **que** pour le dossier Apexis — les deux cohabitent, en le sachant ;
2. la règle devient **celle du studio** — et il faudra alors migrer les noms existants, **par script
   et en lot**, jamais à la main (`git mv` est plus sûr qu'un renommage de l'explorateur) ;
3. l'inverse : le dossier Apexis s'aligne sur le vault.

**Ce qui n'a pas été fait, volontairement** : aucune migration de noms dans le vault, aucun renommage
de pièce existante ailleurs que dans ce dossier de travail.

