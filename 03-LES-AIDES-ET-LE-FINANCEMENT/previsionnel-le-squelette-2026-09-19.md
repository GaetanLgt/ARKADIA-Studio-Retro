<!-- GLDL-SIG v1 eac9b737be6213d44219b5e65d4d84ee205b51dd7ad4688695971e3beb595dac -->
# Le prévisionnel à 3 ans — le squelette, et les hypothèses qui manquent

> **GL Digital Lab · 19/09/2026 · but « Horizon 2030 », round 9.** Le dossier France Travail §3 range
> cette pièce dans **« ce que je peux préparer »** : *« prévisionnel de trésorerie à 3 ans — je peux
> le **mettre en forme**, **pas inventer les hypothèses** : c'est lui qui valide les montants. »*
>
> ⛔ **Aucun chiffre n'est posé ici.** *Chaque case est écrite `[À POSER]`, avec **pourquoi elle
> change le résultat**.* **Un prévisionnel dont j'inventerais les hypothèses ne serait pas un
> prévisionnel : ce serait une fiction avec des colonnes.**

---

## 1. ⚠️ D'abord les sept hypothèses — elles existent déjà, et elles sont documentées

**Le document source les nomme, avec la raison de chacune.** *Je les reprends telles quelles, et
j'ajoute ce que chacune commande dans le tableau du §2.*

| # | Hypothèse `[À POSER]` | Ce qu'elle commande | Pourquoi elle est indispensable |
|---|---|---|---|
| **1** | **Jours travaillés par mois** | *la capacité maximale* | *« Sans elle, aucun chiffre d'affaires n'est calculable »* |
| **2** | **Répartition entre les activités** | *le temps consommé par vente* | *« Un site à 2 500 € et une licence à 149 € ne consomment pas le même temps »* |
| **3** | ⚠️ **Nombre de ventes par mois, par produit** | *le chiffre d'affaires* | *« **L'hypothèse la plus fragile du dossier : c'est ici qu'un prévisionnel se casse** »* |
| **4** | ⚠️ **Délai moyen d'encaissement** | *la trésorerie, pas le CA* | *« **Un prévisionnel de trésorerie se joue là**, pas sur le chiffre d'affaires »* |
| **5** | **Charges fixes mensuelles** | *le seuil de rentabilité* | *« Le seuil de rentabilité en découle directement »* |
| **6** | ⚠️ **Rémunération du dirigeant** | *les deux côtés à la fois* | *« **Elle est une charge ET une ressource — la même ligne des deux côtés** »* |
| **7** | **Date d'obtention de l'ACRE** | *la trésorerie de la 1ʳᵉ année* | *« 50 % d'exonération pendant 12 mois : la date change la trésorerie »* |

> ⭐ **Et le document ajoute la phrase qui juge le résultat** : *« **Un prévisionnel qui ne répond pas
> à ces trois questions n'est pas un prévisionnel** »* — *combien de mois de charges sans aucune
> vente · quelle première vente et à quelle date · **à partir de combien de ventes par mois
> l'entreprise ne perd plus d'argent**.*

---

## 2. ⭐ Le squelette — année 1, et les deux suivantes par différence

### 2.1 Le chiffre d'affaires — les prix sont FIGÉS, les volumes ne le sont pas

**Les prix existent** *(7 arrêtés)*. ⚠️ **Les volumes sont les hypothèses ② et ③ — et c'est là que le
prévisionnel se casse.**

| Produit | Prix *(figé)* | Ventes/mois `[À POSER]` | CA mensuel | Temps par vente `[À POSER]` |
|---|---|---|---|---|
| **Audit web mesuré** | **199 € HT** | | | *30–45 min humaines + 33 s machine* |
| **Porte anti-fuite** | **290 € HT** | | | *0,5 s machine, **temps de relecture non mesuré*** |
| **Gabarit Vue 3** — licence | **149 € HT** | | | |
| **Gabarit Vue 3** — installé | **390 € HT** | | | |
| **Site web** | **dès 2 500 € HT** | | | *TJM 450 €/jour → **~5,5 jours*** |
| **Application métier** | **dès 8 000 € HT** | | | *TJM 450 €/jour → **~18 jours*** |
| **IA locale** | **dès 1 500 € HT** | | | *TJM 450 €/jour → **~3,3 jours*** |
| **RAG documentaire** | **3 000 / 8 000 / 15 000 € HT** | | | |
| **Vision locale** ⛔ | ***pas de prix*** | — | — | *3,9 s/image + relecture* |
| **Vidéo de narration** ⛔ | ***pas de prix*** | — | — | *5 s + ~73 s de script* |
| **Veille outillée** ⛔ | ***pas de prix*** | — | — | *0,8 s par chaîne + analyse* |
| | | **TOTAL CA** | `[À POSER]` | |

> ⚠️ **Trois lignes restent sans prix, et elles ne peuvent pas entrer dans un prévisionnel tant
> qu'elles n'en ont pas.** *Le document source : « ce ne sont pas des prix, aucune n'est arrêtée. »*
> **Un prévisionnel qui les chiffrerait les figerait à ta place.**

### 2.2 Les charges — deux natures, et elles ne se lisent pas pareil

| Charge | Nature | Montant `[À POSER]` |
|---|---|---|
| **Rémunération du dirigeant** | ⚠️ **charge ET ressource** — *hypothèse ⑥* | |
| **Cotisations sociales** | *dépend de la rémunération* **et de l'ACRE** — *hypothèse ⑦* | |
| **Logiciels et licences** | *fixe* | |
| **Nom de domaine, hébergement, certificats** | *fixe annuelle, faible* | |
| **Assurance RC professionnelle** | *fixe* | |
| **Comptabilité et obligations déclaratives** | *fixe* | |
| **Frais bancaires professionnels** | *fixe* | |
| **Communication et identité visuelle** | *variable* | |
| **Domiciliation et siège** | ⚠️ *« charge possiblement nulle, **mais seulement après autorisation écrite de la SCI** »* | |

### 2.3 La trésorerie — **là où le prévisionnel se joue vraiment**

⭐ *C'est l'hypothèse ④ qui commande cette partie, et le document est catégorique : **« un
prévisionnel de trésorerie se joue là, pas sur le chiffre d'affaires. »***

| Mois | Encaissements `[À POSER]` | Décaissements `[À POSER]` | Solde | **Solde cumulé** |
|---|---|---|---|---|
| M1 → M12 | *décalés du délai d'encaissement* | | | |
| **Le point de rupture** | ⭐ *le premier mois où le cumulé devient négatif* | | | **`[À CALCULER]`** |

> ⭐ **Et c'est la réponse à la question ① du §1** : *« combien de mois de charges puis-je payer sans
> aucune vente ? »* — **c'est le fonds de roulement, et il ne se devine pas, il se lit dans le
> cumulé.**

### 2.4 Et la ligne ACRE — elle change la première année, pas les suivantes

| | Année 1 | Année 2 | Année 3 |
|---|---|---|---|
| **Exonération ACRE** | *50 % des cotisations, **12 mois à partir de la date** `[À POSER]`* | *terminée* | *terminée* |
| **Ce que ça change** | ⚠️ *sur ~15 000 € de rémunération, l'ordre de grandeur est de **plusieurs milliers d'euros** — **mais je ne le chiffre pas, la rémunération n'est pas posée*** | — | — |

---

## 3. ⚠️ Les trois contrôles que l'AGEFIPH impose — et deux conditions hors tableau

**Une fois les lignes remplies, le plan doit passer trois contrôles**, *tous issus de la page
officielle de l'aide (relevés par le document source, §4.4)* :

| # | Contrôle | État aujourd'hui |
|---|---|---|
| **1** | Le projet atteint **7 500 € minimum** au total | ⏳ *dépend du total des besoins* |
| **5** | L'apport personnel atteint **1 200 € minimum** | ⏳ *le prêt d'honneur aide à l'atteindre* |
| **6** | Le plan est **équilibré** — besoins = ressources | ⏳ |

**Et deux conditions ne se règlent PAS dans ce tableau** — *elles se tranchent **avant** de créer :*

- ⚠️ **Condition 3** — *le studio doit être l'**activité professionnelle principale*** ;
- ⚠️ **Condition 7** — *être accompagné par un **prestataire habilité qui valide le projet**.* ⭐ ***C'est le BGE, et l'accompagnement doit PRÉCÉDER la demande d'aide.***

---

## 4. ⛔ Et ce que ce squelette ne peut pas faire — les trois blocages, dans l'ordre

**Un prévisionnel à 3 ans est inutile si les trois lignes suivantes ne sont pas tranchées avant.**

| # | Le blocage | Ce qui manque |
|---|---|---|
| **1** | ⚠️ **La structure** *(associés, holding)* | ⭐ *La condition 4 de l'AGEFIPH exige que **le dirigeant détienne la majorité** — **si la holding détient, l'aide de 3 000 € tombe**, et le prévisionnel change de nature.* **Voir `le-choix-apexis-trois-consequences-2026-09-19.md`** |
| **2** | ⚠️ **La date d'ouverture de l'activité** | *Elle fixe le **départ des 12 mois d'ACRE** et **le délai de 60 jours** pour la demander.* **« Passé 60 jours, l'aide est définitivement perdue. »** |
| **3** | ⚠️ **La dénomination** | *542 occurrences publiées pour un nom, 37 pour l'autre, et la nomenclature dit l'inverse.* **Le nom va dans les statuts.** |

> ⭐ **Et le document source donne la hiérarchie** : *« **Le seul point qui empêche tout le reste est
> l'immatriculation. Tout le reste est prêt ou en attente d'elle.** »*

---

## 5. Ce que je peux faire dès que les hypothèses sont posées

**Un tableur, ou un document, qui :**

1. **Calcule le CA** à partir des prix figés × les volumes **que tu poses** ;
2. **Calcule la trésorerie mois par mois** avec le délai d'encaissement ;
3. **Trouve le point de rupture** — *le premier mois où le cumulé devient négatif* ;
4. **Répond aux trois questions du §1** — *mois de charges sans vente · première vente · seuil de
   rentabilité* ;
5. **Et vérifie les trois contrôles de l'AGEFIPH** automatiquement.

⚠️ **Mais je ne pose pas les hypothèses à ta place** — *le document source dit pourquoi : **« elles
engagent ta charge de travail et ton revenu. »***

---

## 6. Ce que ce document n'établit pas

- ⛔ **Aucun montant n'est posé.** *Zéro ligne chiffrée, et c'est volontaire.* **Les sept hypothèses
  sont nommées, aucune n'est remplie.**
- ⚠️ **Trois produits n'ont pas de prix — et je ne les chiffre pas.** *Le prévisionnel ne peut donc
  pas être complet, **même si tu remplis les sept hypothèses aujourd'hui**.* **C'est un fait à
  assumer dans le dossier, pas à contourner par une estimation.**
- **Les temps par vente du §2.1 viennent des coûts mesurés** *(TJM 450 €/jour, 3,9 s/image, etc.)*
  **ou du document source** ; ⚠️ **la ligne « porte anti-fuite » dit elle-même que son temps de
  relecture humaine n'est pas mesuré.** *Je l'ai écrit dans la case plutôt que de mettre un chiffre.*
- **Je n'ai pas lu les 372 lignes du plan de financement** : *j'en ai lu 70 (l. 1-70) puis 51
  (l. 150-200), et 28 (l. 201-228).* ⚠️ **Il reste ~220 lignes que je n'ai pas ouvertes** —
  *§6 en entier (les contraintes vérifiées), §7 (le calendrier) et §8 (**« ce qui manque à ce
  dossier »**).* **Et §8 est précisément le sujet de ce document.** ⚠️ **Je le lirai au round
  suivant plutôt que d'affirmer avoir tout couvert.**
- ⛔ **Aucun contact, aucun dépôt, aucune signature, aucune dépense engagée.**

---

*GL Digital Lab · 19/09/2026 · Trinity, preset `metroid`. Sources : `vault-agence/plan-financement-previsionnel-2026-09-11.md`
(l. 1-70, 150-228 — **lu partiellement, l'écart est dit au §6**) · `modeles/prix-figes-2026-09-10.md`
(l. 25-133) · `vault-agence/dossier-france-travail-28-septembre-2026.md` §3 et §5 (**lu en entier**) ·
`vault-agence/le-choix-apexis-trois-consequences-2026-09-19.md`.*
