# Statut juridique de GL Digital Lab — état mesuré au 10/09/2026

> **Fait établi par Gaëtan le 10/09/2026 : la société n'est PAS ENCORE
> IMMATRICULÉE.** Aucun SIREN, aucun SIRET.
> Ce document existe parce que ~25 fichiers du dépôt affirment le contraire, au
> présent, et qu'une affirmation fausse répétée vingt fois finit par être crue —
> y compris par un client, un avocat ou un expert-comptable.

## 1. Ce qui est mesuré (et non supposé)

| Fait | Preuve |
|---|---|
| La société **n'est pas immatriculée** | Déclaration de Gaëtan, 10/09/2026 |
| Le site **le dit lui-même** | `https://gldigitallab.fr/mentions-legales` : « Entreprise en cours d'immatriculation — SIRET disponible prochainement » |
| Le site **ne publie AUCUNE occurrence de « SASU »** | Mesuré le 10/09 sur `/`, `/mentions-legales`, `/services`, `/arkadia` : **0 occurrence**. Rien de faux n'est publié en ligne. |
| Adresse publiée | `80560 Harponville, Somme, Hauts-de-France, France` — mentions légales **et** JSON-LD (`addressLocality: Harponville`, `postalCode: 80560`). Le site écrit aussi « dans la Somme ». |
| Pas d'autre adresse nulle part | « Lille » n'apparaît dans **aucun** document ni sur le site : c'était une métadonnée d'un outil externe. |

## 2. La règle à appliquer partout, à partir de maintenant

- ❌ **Jamais** « SASU » **au présent**. Jamais « société immatriculée »,
  « enregistrée », « société de droit français » employé comme un fait accompli.
- ✅ Dire : « **société en cours d'immatriculation** », ou « studio indépendant
  français » quand le statut n'est pas le sujet.
- ✅ Le statut **visé** (SASU) peut être cité comme un **projet** : « la SASU en
  cours de constitution ».
- ⚠️ **Aucun document commercial ne doit porter un numéro qui n'existe pas** :
  ni SIREN, ni SIRET, ni numéro de TVA, ni RCS. Un devis ou une facture qui
  l'inventerait est un faux.
- ⚠️ **Rien ne doit être signé au nom d'une personne morale qui n'existe pas
  encore** — question à trancher (voir §5), c'est du juridique, donc D12.

## 3. Ce qui a déjà été corrigé le 10/09/2026

| Fichier | Ce qui a été corrigé |
|---|---|
| `modeles/prompt-memoire-perplexity.md` | « SASU de droit français » → **pas encore immatriculée**, avec interdiction explicite d'écrire SASU au présent. C'est **le bloc qui part chez Perplexity** : c'est lui qui a propagé l'erreur. |
| `modeles/prompt-memoire-claude.md` | Idem (bloc donné à Claude). |
| `modeles/nomenclature-projet.md` | Ligne « GL Digital Lab = SASU de droit français · Réel et actif » → statut réel. C'est le document qui **fait foi** sur les noms. |
| `modeles/verite-identite-gl-digital-lab.md` | Table d'identité + la ligne performance/accessibilité (révisée le même jour). |

## 4. Ce qui reste à aligner (balayage mécanique, ~20 fichiers)

**Priorité 1 — documents légaux (à corriger AVANT tout devis ou facture) :**

| Fichier | Contenu à corriger |
|---|---|
| `modeles/MENTIONS-LEGALES.md` | « Raison sociale : SASU (à confirmer) » — le préambule dit déjà « à compléter dès l'immatriculation », mais la ligne affirme SASU |
| `modeles/CGV.md` | « GL Digital Lab (ci-après "le Prestataire"), SASU de produits numériques » — et le préambule dit « à faire valider par un avocat » |
| `modeles/clause-rgpd-rag.md` | « GL Digital Lab (SASU, Gaëtan LANGLET) agit en qualité de responsable de traitement » — or un responsable de traitement peut être une personne physique : la clause doit viser **Gaëtan Langlet**, pas une société inexistante |
| `modeles/DEVIS.md` | Cases « Statut : SASU (à confirmer) » et « Numéro SIRET (dès immatriculation) » — déjà caveaté, à aligner sur la formulation unique |

**Priorité 2 — documents qui partent chez des IA externes** (ils propagent
l'erreur, exactement comme aujourd'hui) :
`PROMPT-PERPLEXITY.md`, `PROMPT-PERPLEXITY-OPTIMISATION.md`,
`PROMPT-PERPLEXITY-CRASHTEST.md`, `PROMPT-PERPLEXITY-CRASHTEST-COMPACT.md`,
`modeles/prompt-perplexity-concept-flagship.md`,
`modeles/prompt-perplexity-holding-ia.md`,
`modeles/prompt-perplexity-angles-morts-arkadia.md`.

**Priorité 3 — documents de travail et identité :**
`modeles/identite-commerciale-gl-2026.md` (⚠️ il affirme un « **badge SASU**
appliqué sur la homepage » : **mesuré faux**, 0 occurrence — c'est une
affirmation sur notre propre site, elle doit partir),
`communication/README.md`, `PARTAGE-DES-EAUX.md`,
`contextes/2026-10/01-etat-lieux-agence.md`, `modeles/amelioration-continue.md`,
`modeles/README.md` (dit « SASU en création » — le plus proche du vrai),
`modeles/compta-analytique-template.md`.

**Ne pas réécrire (archives datées — réécrire l'histoire serait pire) :**
`livrables/demo-pack1-agent-contenu-2026-09-09.md`,
`livrables/@client-01-viking-tatouage/01-cahier-des-charges.md`,
`vault-agence/jof-viking-tatouage-cahier-des-charges.md`,
`forge-ia/notebooklm-arkadia/01-*.md` et `02-*.md`,
`forge-ia/eva01-deep-dive-et-plan.md` (la mention y sert à qualifier un piège de
licence, pas à affirmer un statut).
Elles portent une date : elles disent ce qui était cru **ce jour-là**.

**Cas particulier :** `modeles/strategie-holding-ia-2026.md` et
`modeles/copie-vitrine-holding-2026.md` parlent de SASU comme **cible** d'une
stratégie. Ce n'est pas une erreur de fait, mais ces notes deviennent
incohérentes si l'immatriculation n'a pas eu lieu : à relire quand le statut
changera.

## 5. Questions qui relèvent du juridique — donc de Gaëtan, pas d'un agent

1. **Un devis ou un contrat peut-il être signé avant l'immatriculation ?** En
   pratique, un particulier peut s'engager en son nom propre ; une société qui
   n'existe pas ne le peut pas. La réponse conditionne ce qu'on peut accepter
   comme commande **dès maintenant**.
2. **Une facture est-elle possible sans SIREN ?** Si non, faut-il différer toute
   facturation jusqu'à l'obtention, ou passer par une autre structure le temps de
   l'immatriculation ?
3. **Le registre RGPD et les mentions de confidentialité doivent-ils viser
   Gaëtan Langlet en personne** tant que la société n'existe pas ? (C'est ce que
   suggère la logique ci-dessus, mais **je ne tranche pas à ta place**.)
4. **Domiciliation** : l'adresse publiée est Harponville (80560). Est-ce bien
   l'adresse qui sera déclarée à l'immatriculation ? Si oui, `nomenclature-projet.md`
   et les mentions n'auront qu'à gagner leur SIRET le jour venu.

> Aucun de ces quatre points ne peut être résolu par une mesure : ce sont des
> décisions. Aucun devis ne part tant qu'ils ne sont pas tranchés.

---

## 6. Avancement du balayage — mis à jour le 10/09/2026

| Priorité | Périmètre | État |
|---|---|---|
| **1** | Documents légaux : `MENTIONS-LEGALES.md`, `CGV.md`, `clause-rgpd-rag.md` | ✅ **fait** (commit `2d66f9a`) |
| **2** | Les 7 prompts partant chez des IA externes | ✅ **fait** — **10 remplacements**, aucun numéro introduit (vérifié par recherche sur `SIRET`/`SIREN`/`RCS`/`TVA`) |
| **3** | Documents de travail : `communication/README.md`, `PARTAGE-DEES-EAUX.md`, `contextes/2026-10/01-etat-lieux-agence.md`, `modeles/amelioration-continue.md`, `modeles/decisions-concept-flagship-d5.md`, `modeles/strategie-holding-ia-2026.md` (l. 50) | ✅ **fait** — 8 fichiers, 10 lignes. `compta-analytique-template.md` n'avait **rien** à corriger : sa seule mention est un comparatif de structures futures |
| — | `modeles/DEVIS.md` | ✅ **fait** |
| **4** | **LES GÉNÉRATEURS — le vrai risque, trouvé en dernier** | ✅ **fait**. `documents/devis-pdf.js` écrivait « SASU — France » **en pied d'un vrai devis client** ; `documents/generer.js` dans les documents générés ; `pack-notebooklm.js` **réinjectait « SASU française » dans les prompts envoyés à une IA externe**. Corriger les documents sans corriger les générateurs laissait l'erreur repartir à chaque document produit — c'est la même leçon que `installer-gardien.ps1` et `_dsh-web-lanceur.vbs` : **corriger la source, pas l'artefact**. Les trois passent `node --check`. |
| **5** | Quatre dernières mentions | ✅ **fait** : `copie-vitrine-holding-2026.md` (badge + intro au présent), `PROMPT-PERPLEXITY.md` (présent de narration), `forge-ia/fond-ecran-seuil-3840x1080.html` |

**Une seule ambiguïté laissée ouverte, volontairement** :
`modeles/strategie-holding-ia-2026.md` l. 74 — « GL Digital Lab (SASU) = siège ». Son §2
dit « ne pas créer de structure juridique maintenant » (→ cible), mais son §0 décrit la
holding **organisationnelle** comme « la façon dont le studio fonctionne VRAIMENT en
interne, dès maintenant » (→ présent). Les deux lectures tiennent : **à trancher par
Gaëtan**, pas par un agent.

**Ce qui n'est pas un défaut à corriger, et qu'il ne faut pas réécrire** : dans
`PROMPT-PERPLEXITY.md` (l. 75) et `prompt-perplexity-holding-ia.md` (l. 78, 81,
158-163), « SASU » désigne une **cible** de stratégie (holding, filiale à créer).
C'est un projet, pas une affirmation de fait — laissé volontairement tel quel.
Reste un point de style à trancher : `PROMPT-PERPLEXITY.md` l. 75 utilise le
présent de narration (« la SASU devient filiale d'une holding ») ; dire « la SASU
**en cours de constitution** devient filiale » serait plus juste.

**Un défaut trouvé dans un document que je n'avais pas listé** : `clause-rgpd-rag.md`
portait une **contradiction de rôles RGPD** — titre « Responsable de traitement »
et phrase « agit en qualité de sous-traitant ». Corrigé : le Client est responsable
de traitement, le studio est sous-traitant. C'est plus grave que le statut : un
client lisant ce bloc ne pouvait pas savoir qui répondait de quoi.
