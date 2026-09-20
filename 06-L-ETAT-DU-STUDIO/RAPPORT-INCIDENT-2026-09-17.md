<!-- GLDL-SIG v1 12b30ca6bb4cbaeb77b7911469661c668906e4f6498766c524a4b132161752a8 -->
# RAPPORT D'INCIDENT — poste EVA-01

**Date** : 17 septembre 2026
**Périmètre** : poste de travail `EVA01` (Alienware Aurora R12), services locaux du studio,
pare-feu, protection Defender, moteur RAG, observatoire Discord.
**Rédigé par** : session GL Digital Lab (preset `gl-digital-lab`, harnais DSH), à la demande de Gaëtan.
**Nature du document** : compte rendu factuel. Tout ce qui suit est **mesuré** ; ce qui ne l'est
pas est écrit comme tel. Les erreurs commises **pendant** cet audit sont incluses (§8) : un rapport
d'incident qui ne contient que les fautes des autres n'est pas un rapport, c'est un plaidoyer.

---

## 1. Ce qui a déclenché l'audit

Demande de Gaëtan : « contrôle d'intégrité au niveau du système, je vais vérifier que tout soit OK,
tout fonctionne correctement et tout soit sécurisé. Pas de trou dans la passoire. »

Puis, au fil de la session, quatre signaux :
1. « il y a une attaque au niveau de tes systèmes faite par les autres LLM des grands groupes » ;
2. « attaque des DOS en cours » ;
3. « reconnecte-toi au docker, toutes les connexions ont sauté » ;
4. « observatoire Discord est down ».

**Verdict global : les quatre signaux sont réels dans leur symptôme, et aucun ne correspond à sa
cause supposée.** Le détail suit, mesure par mesure.

---

## 2. Le paradoxe de départ, et comment il a été traité

Un contrôle d'intégrité demandé **depuis la machine auditée**, exécuté par un agent **qui tourne sur
cette machine**, en `danger-full-access`, sans approbation : l'outil de mesure est à l'intérieur du
système mesuré. Un rapport auto-attesté est un **cinquième tampon** — le défaut exact que cette
session traque par ailleurs (un verrou qui ne peut pas échouer ne vérifie rien).

Conséquence assumée dans tout ce document :
- **vérifiable en interne** : l'état présent, la surface d'attaque actuelle, les écarts à une
  référence connue ;
- **non vérifiable en interne** : « une compromission a-t-elle eu lieu avant aujourd'hui ? », et
  « l'outil de mesure est-il le bon ? ». Cela exige un **oracle hors machine** (empreinte datée,
  test depuis un autre appareil) — non réalisé à ce jour.

---

## 3. Détections Defender : trois fausses alertes, une vraie

### 3.1 Les trois « trojans » sont des lignes de commande du harnais

| Signature | Gravité | Ressource détectée | Verdict |
|---|---|---|---|
| `Trojan:Win32/PowhidSubExec.B` | 5/5 | `CmdLine:_node.exe --import …tsx… bin.ts -- pwsh.exe -NoLogo -NoProfile -NonInteractive` | **Faux positif** |
| `Trojan:Win32/ClickFix.DQ!MTB` | 5/5 | même motif, sur deux scripts de vérification documentaire | **Faux positif** |
| `Trojan:Win32/Commando.A!ml` | Grave | `CmdLine:_ pwsh … Select-String -Pattern 'irm \|iwr \|iex \|…'` | **Faux positif** |

Le point décisif : **la ressource détectée est une ligne de commande, pas un binaire.** Le
classificateur prend `node → pwsh -NoProfile -NonInteractive` pour un dropper — c'est la signature
exacte d'un harnais d'agent.

Le troisième cas est le plus parlant : la commande détectée était **celle qui cherchait les
malwares** (elle contenait la liste des motifs : `irm`, `iwr`, `iex`, `EncodedCommand`,
`FromBase64`…). Elle a été classée `Commando.A!ml` et **tuée en vol** — c'est l'origine du
`spawn EPERM` observé à 14:15, que le harnais, lui, attribuait à son bac à sable.

**Conséquence opérationnelle** : Defender neutralise de façon **silencieuse et aléatoire** les
commandes de l'agent. Un correctif durable passe par une exclusion de chemin pour les outils du
studio, ou par un changement de motif d'appel — **décision de Gaëtan**.

### 3.2 Le seul fichier réellement malveillant vient d'un navigateur tiers

```
Trojan:Win32/Pomal!rfn | 14/09/2026 04:00–04:01 | action = nettoyé / mis en quarantaine
  file : C:\Users\neosp\AppData\Local\Perplexity\Comet\User Data\Default\Cache\Cache_Data\f_000b94
  file : C:\Users\neosp\Downloads\c40f5a40-….tmp
  file : C:\Users\neosp\Downloads\855a63e7-….tmp
  process : C:\Program Files\Perplexity\Comet\Application\comet.exe
```

Le processus qui a téléchargé et manipulé le fichier est **`comet.exe`**. Aucun des trois autres cas
ne vise un fichier.

**Recommandation** : retirer Perplexity Comet du poste (décision de Gaëtan — action sur un logiciel
tiers).

---

## 4. « Attaque DoS en cours » : aucune trace

```
SynReceived        0     ← LE marqueur d'un déni de service TCP. Zéro.
SynSent            0
Established       62     normal
TimeWait         157     normal
CloseWait         32     normal
Listen            42
```

Les adresses distantes dominantes sont `3.173.21.63` (CloudFront) et `151.101.123.52` (Fastly) :
**des CDN légitimes**, ceux du harnais et du navigateur.

**Ce qui n'est PAS prouvable** : ce qui a été bloqué. `LogBlocked = False` sur les **trois** profils
du pare-feu → Windows n'écrit rien. Zéro tentative lue **ne signifie pas** zéro tentative.

Une seconde campagne d'audit, menée en parallèle par une autre session d'agent (voir §7), est arrivée
au même constat sur la même machine : « aucune trace de DDoS ».

---

## 5. Docker : redémarrage propre, aucune donnée perdue

Symptôme rapporté : « toutes les connexions ont sauté ».

```
Docker 29.8.0 | conteneurs=2 | enMarche=2 | arretes=0 | images=4
arkadia-pg    | postgres:16-alpine | Up (healthy) | 127.0.0.1:5432
arkadia-redis | redis:7-alpine     | Up (healthy) | 127.0.0.1:6379

postgres : « database system was shut down at 12:37:05 UTC » → ARRÊT PROPRE, pas un crash
           redémarrage à 12:37:26 UTC
RestartCount = 0 sur les deux conteneurs
```

**Données intactes** (vérifiées, pas déduites) :
- 8 tables : `avatars`, `communities`, `community_members`, `humans`, `messages`, `posts`,
  `relations`, `reports` ;
- comptes **réels** : `humans=5`, `communities=5` — **et non zéro** ;
- Redis : `aof_enabled=1`, `aof_last_write_status=ok`, **14 clés en `db1`** ;
- volumes nommés : `arkadia-engine_pg_data`, `arkadia-engine_redis_data` → la donnée survit aux
  conteneurs.

**Piège payé** : `pg_stat_user_tables.n_live_tup` renvoyait **0 sur toutes les tables**. Lu tel quel,
cela disait « base vide ». Le compte réel dit 5 humains / 5 communautés. **Un compteur de
statistiques non rafraîchi n'est pas une mesure d'absence.**

**Piège payé (2)** : `redis-cli dbsize` renvoie le nombre de clés de `db0`. La donnée du studio vit
en **`db1`**. D'où un premier « 0 clé » également faux.

**Cause du symptôme** : bascule du moteur à 14:37 — les clients ont perdu la socket, tout est
revenu sain. **Aucune réparation nécessaire.**

**Point de vigilance** : `docker mcp server ls` est **obsolète** dans cette version ; la commande
valide est `docker mcp profile server ls`. Profils présents : `ai_coding`, `dev_workflow`,
`terminal_control` (ce dernier = `desktop-commander` + `filesystem`). La configuration
`~/.dsh/mcp-servers.json` est cohérente : `terminal-control` → `docker mcp gateway run --profile
terminal_control`, et `rag-agence` → `node mcp-rag-agence.mjs`.

---

## 6. Surface d'attaque réseau : ce qui était ouvert, et pourquoi

### 6.1 Ouverture par accumulation

```
règles entrantes autorisantes, actives            : 246
applicables au profil Public (le Wi-Fi actuel)     : 194
```

Sur ces 194, une longue liste de règles « **programme / TCP:Any / distant:Any** » ajoutées au fil du
temps par des installeurs de jeux et d'outils — `Aniimo`, `ATLAS`, `Aseprite`, `anythingllm.exe`,
`Cyberpunk 2077`, `Don't Starve Together`, `Dying Light 2`, `Ember Knights`, `EpicGamesLauncher`,
`Beyond Good & Evil`, `Darkest Dungeon`… Chacune autorise du trafic entrant vers ce programme
**depuis n'importe quelle adresse**. `anythingllm.exe` — un serveur LLM local — était dans la liste.

Également ouverts : `OpenSSH 22`, `Partage de fichiers 445`, `RPC 135`, `Hyper-V 2179 / 6600`,
`WinRM 5985 / 47001`, `Steam 27036`, port dynamiques RPC (`49664`–`49669`, normaux).

### 6.2 Le seul vrai candidat à exposition : Osiris

`osiris-serveur.js` écoute sur `192.168.1.29:8138` — donc sur l'interface du réseau local, et non
sur la boucle locale. **Mais** : aucune règle de pare-feu ne cite le port 8138, et l'action entrante
par défaut est « bloquer ». **Écouter sur une adresse n'est pas être joignable.**

> **Correction d'une affirmation trop rapide de cette session** : « Osiris est exposé au LAN » a été
> écrit plusieurs fois avant vérification. L'état exact est : *il écoute sur l'interface réseau, et le
> pare-feu devrait bloquer*. **Le test décisif n'a pas été fait** : il consiste à ouvrir
> `http://192.168.1.29:8138/` **depuis un autre appareil** (téléphone). C'est le seul oracle
> extérieur à la machine, et il prend cinq secondes.

### 6.3 Le port 5985 n'était pas une attaque

`WinRM` écoutait sur `5985`, ce qui est un vecteur de mouvement latéral classique. Origine
**documentée par l'agent concerné lui-même**, dans `C:\Users\neosp\defense-eva01.ps1` :

> « **Une exposition que j'ai créée moi-même cette nuit** : pour tenter d'installer Windows Admin
> Center (échec), j'ai démarré **WinRM** — et je l'ai laissé en `Automatic`. »

Réparé dans la même passe, et vérifié :

```
port 5985 : fermé        service WinRM : Stopped / Manual
```

**Une défense qui commence par réparer sa propre erreur est plus honnête qu'une défense qui ajoute
des règles.**

### 6.4 Automatismes de sécurité mesurés

```
Attack Surface Reduction (ASR) : aucune règle configurée
EnableNetworkProtection        : 0   → protection réseau Defender DÉSACTIVÉE
EnableControlledFolderAccess   : 0   → protection anti-rançongiciel DÉSACTIVÉE
LogBlocked / LogAllowed        : False sur les 3 profils → pare-feu MUET
PUAProtection                  : 1   actif
RTP / comportement / IOAV      : actifs, IsTamperProtected = True
Scan complet                   : il y a 18 jours
Session                        : EVA01\neosp — élève = FALSE (pas d'élévation)
```

**Le trou le plus coûteux n'est pas un port ouvert : c'est le journal muet.** Sans `LogBlocked`,
aucune intrusion bloquée n'est connaissable.

---

## 7. Deux sessions d'agent travaillent sur la même machine

Constat : une **seconde session d'agent** est active sur EVA-01 en parallèle de celle-ci. Preuves :
- `C:\Users\neosp\defense-eva01.ps1` écrit à **14:48:15** par cette session, avec sa propre
  auto-critique en en-tête ;
- tâche planifiée `GL-Defense-EVA` créée de la même main, exécutée à 14:48:16 ;
- processus du harnais nés à 14:53:40, 14:54:29, 14:55:04, 14:56:50 — pendant cet audit ;
- fichiers de voix du bot (`vocal.mjs`, `voix.js`, `oreille.js`) modifiés **aujourd'hui**.

**Risque identifié, et non théorique** : les deux sessions touchent au même pare-feu, au même bot,
aux mêmes services. **Elles peuvent se marcher dessus.** Aucune coordination n'existe à ce jour —
c'est un point à trancher (verrou de chantier ? canal dédié ?).

---

## 8. Erreurs commises PENDANT cet audit (à garder au dossier)

Cette section existe parce que les mêmes erreurs, non écrites, se répètent.

### 8.1 Un curseur SQLite réutilisé a produit un faux « 1 carnet »

Requête sur `knowledge` : 4 lignes. `knowledge_file` : 918 liens. Résultat affiché : **un seul
carnet de 45 fichiers**. Cause : le même curseur SQLite réutilisé **à l'intérieur de sa propre
boucle** invalide l'itérateur après la première ligne. Correctif : `fetchall()` d'abord, curseur
séparé ensuite. Après correction : 4 carnets, 45 + 818 + 0 + 55 = **918**, cohérent avec la base.

### 8.2 « 4287 dossiers orphelins, 1719 Mo » — faux d'un facteur 60

La mesure comparait les **dossiers** de `vector_db\` (nommés par **segment** chez Chroma) aux
**collections** en base. Deux espaces de nommage différents. Après confrontation avec la table
`segments` : **89 vrais orphelins, 27,6 Mo.**

**Ce qui a été évité** : purger 1719 Mo sur cette base aurait détruit des vecteurs vivants. Le RAG
aurait cessé de trouver des documents **sans afficher la moindre erreur** — une panne silencieuse.

**Ce qui a permis de s'en apercevoir** : une incohérence. Toutes les collections affichaient « 0 Mo »
alors que des dossiers pesaient 240 Mo. *Une valeur implausible doit être vérifiée, pas expliquée.*

### 8.3 Un zéro qui ne prouvait rien

`embeddings orphelins = 0` alors que 3235 collections pèsent 1100 Mo : contradiction. La table
`embeddings` n'est plus le lieu de stockage chez cette version de Chroma (les vecteurs vivent dans
les fichiers `.bin`). **Le poids sur disque fait foi, pas le compteur.** Troisième occurrence du même
piège dans la journée.

### 8.4 Tuer des processus du harnais a fait tomber son gestionnaire de tâches

```
subprocess-local: Windows Job runner exited with exit code 4294967295
                  before proving its managed range empty
```

`Stop-Process` appliqué à des pid **surveillés par le harnais** (les serveurs MCP qu'il a lancés)
fait sortir son *Job Windows* avant qu'il puisse prouver que sa plage est vide : **la commande est
avortée avant d'agir.** Rien n'a été cassé, mais rien n'a été fait non plus — et l'erreur était
présentée comme un échec de la cible. Correctif appliqué : ne plus toucher aux processus du harnais,
et cibler nommément le processus à arrêter.

### 8.5 Le gardien de pile a relancé le service pendant sa maintenance

Pour purger la base vectorielle, Open WebUI devait être arrêté. Il l'a été. **Le gardien de pile
(`gardien-pile.js`, tâche `GL-Pile-Gardien`, toutes les 5 minutes) l'a relancé à 14:53:11 :**

```
events.log : « 🔁 Open WebUI (RAG) relancé automatiquement. »  ×2
parent du processus : pid 29732 → gardien-pile.js --watch --notif
```

**Faute de méthode** : le gel du jeu a été levé pour de bon le 13/09 (décision de Gaëtan) ; il
n'existe donc **aucun marqueur** pour suspendre le gardien. Toute opération de maintenance exige
désormais de neutraliser explicitement le gardien d'abord. La sauvegarde complète de la base
(2 144,8 Mo) prise **avant** la purge est ce qui protège de ce risque.

### 8.6 Deux explications écrites avant d'être testées

- « le `spawn EPERM` vient du bac à sable » → faux, c'est Defender qui a tué le processus ;
- « la clé SSH `administrators_authorized_keys` est suspecte » → elle est **illisible sans
  élévation**, donc ni confirmée ni infirmée. Une suspicion non mesurable n'a pas sa place dans un
  rapport de sécurité.

---

## 9. RAG : inventaire et purge

### 9.1 Ce qui existe

```
moteur           : Open WebUI, 127.0.0.1:8080, lancé par la tâche DSH-OpenWebUI
données          : C:\Users\neosp\AppData\Roaming\uv\tools\open-webui\Lib\site-packages\open_webui\data
  webui.db                      23,5 Mo   43 tables
  vector_db\chroma.sqlite3   2 144,8 Mo
  dossier data entier        3 949 Mo, 18 164 fichiers
carnets (4)      : Vault-ARKADIA 45 · Vault-GL-Digital-Lab 818 · Metroid 55 ·
                   benchmark-chunking-test 0
fichiers en base : 958        liens carnet↔fichier : 918
```

**Risque structurel à signaler** : les données du studio vivent **dans le dossier
d'installation du paquet Python** (`…\site-packages\open_webui\data\`). Une réinstallation ou une
mise à jour d'Open WebUI **effacerait tout**. Cette donnée doit sortir de là.

### 9.2 Ce qui gaspille, chiffré

```
collections vectorielles               : 4199
  dont « file-<uuid> »                 : 4193
        → fichiers toujours en base     :  958  |   332,2 Mo
        → ORPHELINES (fichier disparu)  : 3235  | 1 100,2 Mo
  collections de carnets               :    6  |   301,9 Mo
```

Une collection orpheline = un document supprimé d'Open WebUI dont la collection vectorielle est
restée. Le critère est un **croisement de noms** (l'`uuid` de la collection n'existe plus dans la
table `file`), pas une supposition sur le comportement du logiciel : aucun carnet ne peut donc la
référencer.

### 9.3 Purge : état

- **Débranchement** : `~/.dsh/mcp-servers.json` → `rag-agence` passé à `enabled: false`
  (sauvegarde : `…avant-debranchement-rag-20260917-145227`). Open WebUI arrêté — puis **relancé par
  le gardien** (§8.5).
- **Sauvegarde** : `_sauvegardes\rag-purge\chroma-avant-purge-20260917-145340.sqlite3` — 2 144,8 Mo.
- **Purge** : en cours à l'heure de rédaction (3235 suppressions, Chroma est lent en masse).
- **Réversibilité** : les vecteurs sont **déplacés** vers une corbeille datée, pas effacés.

---

## 10. Fenêtres de commande intempestives

Symptôme rapporté : « une fenêtre s'ouvre au moment où je parle et ça m'empêche d'envoyer mon
texte ».

**Le harnais est disculpé par la mesure** : `packages\subprocess\subprocess-local\src\spawn.ts`
pose `windowsHide: platform === 'win32'` — ses lancements ne créent aucune fenêtre.

**Cinq tâches planifiées étaient en cause** (hôte de console lancé en direct, sans rien pour masquer) :

| Tâche | Commande |
|---|---|
| `GL-Defense-EVA` | `pwsh -File C:\Users\neosp\defense-eva01.ps1` |
| `GL-Installer-WAC` | `pwsh -File C:\Users\neosp\installer-wac.ps1` |
| `GL-Revue-Telechargements` | `pwsh -File forge-ia\revue-telechargements.ps1` |
| `GL-Wifi-Sans-Economie` | `pwsh -File C:\Users\neosp\corriger-wifi.ps1` |
| `GLDL-Sauvegarde-Hebdo` | `powershell -File sauvegarder-prod.ps1 -Upload` |

Cinq autres lancent des **interfaces** (Docker Desktop ×2, Comfy Desktop, Ollama, Open WebUI) : leur
fenêtre est leur métier, mais **elle vole le focus tout autant** — et Docker a bien redémarré
aujourd'hui à 14:37.

**Correctif écrit et vérifié** (`outils-pilotage\sans-fenetres.ps1`) : chaque tâche est repointée
vers un lanceur `wscript` (`lancer-cache.vbs` + un `.cmd` par tâche) appelé avec `0 = SW_HIDE`.
**Pourquoi pas `-WindowStyle Hidden`** : cette option **crée** la fenêtre puis la cache — elle
apparaît une fraction de seconde. `wscript` est un hôte GUI sans console : **la fenêtre n'est jamais
créée.** Un mode `-Verifier` sert de **verrou anti-régression** et sort en erreur si une tâche
redevient capable d'ouvrir une fenêtre.

**État : écrit, vérifié en syntaxe, simulé. Non appliqué** — l'élévation demandée a été refusée.

---

## 11. Observatoire Discord

**Ce qui est sain** :
```
bot            : pid 9036, démarré 13:17:08, connecté (Established → 162.159.134.234:443)
webhooks.json  : JSON VALIDE, 10 clés (dou, systeme, makoto, watashi, bi, jitsu, wa,
                 curiosite, machine, validation), URLs bien formées
bot-err.log    : 0 octet
```

**Ce qui ne va pas** :
```
bot-live.log, dernière ligne (14:53:03) :  🔊 état vocal : ready → disconnected
ligne 945                              :  ✗ The operation was aborted due to timeout
```

**Donc** : le bot est vivant et connecté à Discord, mais **il a quitté le salon vocal** — il n'écoute
plus. C'est le « down » constaté.

**Et un problème plus grave que la déconnexion.** Extraits de `bot-live.log` :

```
🧠 « Je peux te montrer un projet en interne : un jeu vidéo 2D en C++/SFML,
     ou un module de formation sur les bases du Python. »
🧠 « Tu veux parler de la rencontre de ce matin avec le client sur le projet *X* ? »
```

**L'observatoire invente.** Ni « projet X », ni « rencontre de ce matin », ni « jeu 2D en C++ » ne
correspondent à quoi que ce soit du studio. Un assistant qui hallucine devant son fondateur est un
problème de confiance, pas de plomberie — et il contredit directement la règle Makoto du studio.

**Non touché volontairement** : une autre session modifie les fichiers de voix du bot aujourd'hui
(§7). Corriger par-dessus son travail produirait un conflit.

---

## 12. Verdict

### P0 — à traiter, décision ou action de Gaëtan
1. **Pare-feu muet** : `LogBlocked=False` sur les 3 profils. Sans journal, aucune détection
   d'intrusion n'est possible. Script prêt (`quarantaine-entrees.ps1`), élévation requise.
2. **Quarantaine des entrées** : 148 règles à désactiver, liste blanche de 46 (DHCP, ICMP, IPv6,
   HNS/Docker). Script prêt et simulé. **Élévation refusée à ce jour.**
3. **Fenêtres de commande** : 5 tâches corrigées à appliquer. Script prêt et simulé.
   **Élévation refusée à ce jour.**
4. **Observatoire à la dérive** : bot vocal déconnecté **et** réponses hallucinées.

### P1 — important, non bloquant
5. `EnableNetworkProtection = 0` et `EnableControlledFolderAccess = 0` : deux protections
   Defender éteintes.
6. **Defender contre le harnais** : 4 signatures frappent les commandes de l'agent, avec neutralisation
   silencieuse. Exclusion de chemin à décider.
7. **Perplexity Comet** : seul vecteur d'un vrai malware détecté (14/09). À retirer.
8. **Données RAG dans `site-packages`** : à déplacer hors du dossier d'installation.
9. **Purge RAG** : à terminer et **à vérifier** (recherche fonctionnelle sur les 4 carnets).
10. **Aucune coordination entre les deux sessions d'agent** sur la même machine.

### P2 — hygiène
11. Scan Defender complet : 18 jours.
12. `GL-ComfyUI-Relance` : dernier résultat `1073807364` (échec).
13. 89 dossiers vectoriels réellement orphelins (27,6 Mo).
14. `benchmark-chunking-test` : carnet vide.
15. Sauvegarde : `GLDL-Sauvegarde-Hebdo` existe — **sa restauration n'a pas été testée**.
16. NS : la clé `administrators_authorized_keys` reste **illisible sans élévation** — porte d'admin
    dont personne, dans cette session, ne peut attester le contenu.

### Ce qui attend une décision (jamais exécuté à la place de Gaëtan)
- appliquer la quarantaine des entrées (148 règles) ;
- appliquer le correctif des fenêtres (5 tâches) ;
- retirer Perplexity Comet ;
- exclure les outils du studio du scan Defender ;
- trancher la **charte** : garder « Lighthouse ≥ 95 » ou la reformuler ;
- décider du sort de la clé SSH d'administration ;
- **et, pour l'observatoire : réparer la voix, ou d'abord lui donner le contexte du studio.** Dans cet
  ordre ou dans l'autre, ce n'est pas la même machine.

---

## 13. Ce que ce document ne prouve pas

- **qu'aucune compromission n'a eu lieu** — l'antériorité n'est pas vérifiable depuis la machine ;
- **que l'outil de mesure est intègre** — c'est le paradoxe du §2, non levé ;
- **que la purge RAG est réussie** — elle était en cours à la rédaction ;
- **qu'Osiris soit joignable du réseau** — le test depuis un appareil tiers n'a pas été fait ;
- **que la sauvegarde hebdomadaire soit restaurable** — elle n'a jamais été restaurée.

*Un rapport d'intégrité honnête se termine par la liste de ce qu'il n'a pas établi.*
