<!-- GLDL-SIG v1 896d1cd436f604870f64e97519d35cb928c5313af5626966b48a3d731979f379 -->
# Aide-mémoire — **nos** commandes, en six panneaux

> **GL Digital Lab · 19/09/2026.** Ouvert sur une image envoyée par Gaëtan : un **aide-mémoire
> « CISCO ROUTER — ESSENTIAL COMMANDS »**, six panneaux (Basic Configuration · Interface
> Configuration · Routing Configuration · Security Commands · Monitoring & Troubleshooting ·
> File Management).
>
> **Le constat, d'abord, et il est net : nous n'avons pas de routeur Cisco.** Aucune commande IOS de
> cette image ne s'exécute sur cette machine, sur le VPS, ou sur l'hébergement mutualisé.
>
> **Mais l'image est utile, et pas pour ses commandes : pour son FORMAT.** Six panneaux, deux
> colonnes (`Commande` / `Pourquoi`), un panneau par intention — *configurer, adresser, router,
> sécuriser, surveiller, sauvegarder*. **Ce format est libre ; il n'appartient à personne.**
> *La règle du studio : **on emprunte le mythe, jamais la marque.** On reprend la grille, on écrit
> nos commandes.* — et **aucun nom de marque réseau n'entre dans un livrable du studio.**
>
> ⚠️ **Je ne reproduis pas l'image.** Je reprends **six intentions**, et je remplis avec **ce qui
> tourne ici**. *Les valeurs chiffrées sont mesurées le 19/09/2026, pas recopiées.*

---

## Où atterrit chaque panneau de l'image, chez nous

| Panneau de l'image | Chez nous ? | Pourquoi |
|---|---|---|
| 1 · Basic Configuration | ⚠️ **transposé** | `enable`/`secret` → **élévation** ; `banner` → **bandeau légal Windows** ; `copy run start` → **notre règle du fichier de retour** |
| 2 · Interface Configuration | ✅ **transposé** | `Get-NetIPConfiguration`, `Get-NetAdapter` |
| 3 · Routing Configuration | ✅ **transposé** — **et c'est notre cas réel** : deux chemins réseau coexistent | `Get-NetRoute`, `route print` |
| 4 · Security Commands | ✅ **transposé — et nous l'avons déjà écrit** : `quarantaine-entrees.ps1`, `durcir-pare-feu.ps1` | **nos ACL, ce sont 667 règles** |
| 5 · Monitoring & Troubleshooting | ✅ **transposé — et déjà écrit** : `etat-de-compromission.ps1`, `rendre-enquetable.ps1` | |
| 6 · File Management | ✅ **transposé** | `Get-PSDrive`, `git`, sauvegardes |

---

## Panneau 1 — Configuration de base et identité

*L'intention de l'image : **qui je suis, qui a le droit, et comment je ne perds pas ma configuration en redémarrant.***

| Commande | Pourquoi |
|---|---|
| `Test-Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"` | **Ce qui se relance tout seul au démarrage** — utilisateur |
| `Get-ScheduledTask \| Where-Object State -ne 'Disabled'` | **Ce qui se relance tout seul, en tâche planifiée.** *Filtrer `\Microsoft\*` : c'est le système* |
| `Get-ChildItem "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\Startup"` | **Idem, côté machine** |
| `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System` → `legalnoticecaption` / `legalnoticetext` | **Le bandeau légal.** ⚠️ *Registre : **appartient à Gaëtan**, jamais à l'agent* |
| `whoami /groups \| Select-String "S-1-16-12288"` | **Suis-je élevé ?** *Sans élévation, **la moitié du diagnostic est aveugle** — c'est mesuré, pas supposé* |

> **`copy running-config startup-config` — notre équivalent n'est pas une commande, c'est une règle** :
> **`STRATEGIE-SECURITE-2026-09-17.md` §3 ligne 4** — *« on annule par un **fichier de retour**, pas de
> mémoire : chaque script écrit la liste exacte de ce qu'il a changé, **avant** de le changer. »*
> **C'est le `startup-config` du studio, et il est plus exigeant que celui de l'image.**

---

## Panneau 2 — Interfaces et adressage

*L'intention : **voir ses interfaces, savoir laquelle porte le trafic, et ce qu'elle a comme adresse.***

| Commande | Pourquoi |
|---|---|
| `Get-NetIPConfiguration` | **L'état réel** : interface, IP, passerelle. *La première commande de tout diagnostic réseau* |
| `Get-NetAdapter` | **Ce qui est `Up`, ce qui est `Disconnected`** — *`Up` ne veut pas dire « porte quelque chose »* |
| `Get-NetIPAddress -AddressFamily IPv4` | Toutes les IPv4, **y compris les `169.254.x` des cartes mortes** |
| `netstat -ano \| Select-String LISTENING` | **Ce qui écoute, et sur quelle adresse.** *La commande la plus utile du studio* |

### Mesuré ici le 19/09/2026 — et c'est une correction

| Interface | État | Adresse | Passerelle |
|---|---|---|---|
| **Wi-Fi** | **Up** | **192.168.1.29** | **192.168.1.1** |
| `vEthernet (Default Switch)` | Up | 172.31.16.1 | — *(commutateur virtuel Hyper-V)* |
| Ethernet | **Disconnected** | 169.254.90.246 | — |
| Connexion réseau Bluetooth | Disconnected | 169.254.58.147 | — |

> ⚠️ **`169.254.x` n'est pas une adresse : c'est l'absence d'adresse.** Une carte qui porte un
> `169.254` **n'est branchée à rien**.
> **Conséquence de méthode** : le 18/09, une note de session annonçait *« Ethernet rebranché »* sur la
> foi d'un `172.31.16.1`. **C'est faux** : ce `172.31.16.1` est l'interface **Hyper-V**, pas le câble.
> *L'Ethernet est `Disconnected`.* **La mesure du 19/09 corrige la note du 18/09.**

---

## Panneau 3 — Routage

*L'intention : **par où sort le trafic, et qu'est-ce qui est joignable.***

| Commande | Pourquoi |
|---|---|
| `Get-NetRoute -DestinationPrefix '0.0.0.0/0'` | **La route par défaut** — *par quelle interface on sort d'Internet* |
| `Get-NetRoute \| Sort-Object RouteMetric` | **Toutes les routes, par priorité** — *quand deux chemins existent, c'est la métrique qui tranche* |
| `route print` | Le classique, lisible, à garder sous la main |
| `tracert <hôte>` | Par où passe le trafic, saut par saut |
| `Resolve-DnsName <nom>` | **La résolution** — *souvent la vraie cause d'une panne « réseau »* |

### Mesuré ici — notre cas réel

| Ce qui a été mesuré | Résultat |
|---|---|
| **Route par défaut** | **une seule** : `192.168.1.1` par **Wi-Fi**, métrique **0** |
| Interfaces portant une route par défaut | **1 sur 3 actives** |
| **Voisins dans la table ARP** | **19** |

> **Ce que ça veut dire** : contrairement à ce que laissait croire une note du 18/09, **cette machine
> n'a qu'un seul chemin vers l'extérieur.** *Pas de routage multiple, pas de bascule de lien, pas de
> `ip route` à écrire.* **Le panneau « Routing Configuration » de l'image n'a, ici, rien à configurer.**

---

## Panneau 4 — Sécurité et listes de contrôle d'accès

*L'intention : **fermer par défaut, n'ouvrir que ce qu'on nomme.*** **C'est le panneau que nous
appliquons le plus sérieusement.**

| Commande | Pourquoi |
|---|---|
| `Get-NetFirewallProfile` | **Les 3 profils, et le sens par défaut.** *La mesure qui décide de tout le reste* |
| `Get-NetFirewallRule \| Where-Object Enabled -eq 'True' \| Measure-Object` | **Combien de règles actives** — *une liste qu'on ne peut pas compter ne se contrôle pas* |
| `Get-NetFirewallRule -Direction Inbound -Action Allow \| Where-Object Enabled -eq 'True'` | **Les portes ouvertes en entrée** — *la liste à relire à chaque audit* |
| `outils-pilotage/quarantaine-entrees.ps1` | **⛔ NE PAS RELANCER SANS DÉCISION.** *148 règles désactivées nommément, 46 conservées, **liste de retour écrite avant la première modification*** |
| `outils-pilotage/durcir-pare-feu.ps1` | Le durcissement, déjà appliqué |
| `outils-pilotage/rendre-enquetable.ps1` | **La journalisation** — *« on ne peut identifier que ce qu'on a enregistré »* |

### Mesuré ici — et un écart entre le réglage et la preuve

| Ce qui a été mesuré | Résultat |
|---|---|
| Profils pare-feu | **3 sur 3 actifs**, entrée **Block**, sortie `NotConfigured` |
| **Règles au total** | **667** |
| **Règles actives** | **265** |
| **Journalisation des blocages** | `LogBlocked = True` **sur les 3 profils** ✅ |
| **Journalisation des autorisations** | `LogAllowed = False` |
| **`pfirewall.log`** | ⛔ **ABSENT** |

> ### **Le réglage est armé. La preuve n'existe pas.**
>
> **C'est le test §6 de `STRATEGIE-SECURITE-2026-09-17.md`, et il est toujours non fait.**
> `LogBlocked=True` signifie *« si une connexion entrante est refusée, elle sera écrite »*. Le fichier
> n'existe pas **parce que rien n'a encore été refusé** — *ou parce que le fichier ne se crée pas.*
> **Les deux lectures sont possibles, et je ne peux pas les départager sans une connexion refusée.**
> **Tant que `pfirewall.log` n'existe pas et ne grossit pas, la détection est déclarée, pas démontrée.**

---

## Panneau 5 — Surveillance et diagnostic

*L'intention : **voir l'état, et savoir ce qui s'est passé.***

| Commande | Pourquoi |
|---|---|
| `outils-pilotage/etat-de-compromission.ps1` | **⛔ Le point d'entrée en cas d'incident.** Lecture seule, 8 sections, rapport daté dans `_logs\incidents\` |
| `Get-NetTCPConnection -State Established` | **Ce qui sort, et vers où** — *toute ligne non expliquée est une alarme* |
| `Get-WinEvent -ListLog System` | **La taille et l'état des journaux** — *un journal PLEIN écrase l'histoire* |
| `Test-NetConnection <hôte> -Port <n>` | Joignable ou pas, port par port |
| `arp -a` | **Qui est sur le réseau local** — *19 voisins mesurés ici* |
| `Get-Process -Id <pid>` | **Quel processus tient un port** — *`netstat` donne le PID, pas le nom* |

> ⚠️ **Et le piège qui a coûté le plus cher, mesuré le 18/09** : `Get-CimInstance` **échoue en silence**
> hors `danger-full-access`. Dans ce cas, `$liste.Count` vaut **0** et on annonce *« 0 processus »* —
> **faux**. **La règle** : *si `Get-CimInstance` ne rend rien, vérifier qu'il n'a pas échoué avant de
> conclure à une absence.* ⛔ **`tasklist` ment aussi, de la même façon.**

---

## Panneau 6 — Fichiers, sauvegarde, retour arrière

*L'intention : **où sont mes fichiers, comment je les sauvegarde, comment je reviens en arrière.***

| Commande | Pourquoi |
|---|---|
| `Get-PSDrive -PSProvider FileSystem` | **Espace libre par lecteur** — *`D:` est une clé USB FAT32 : elle n'est pas un disque* |
| `git -C <dépôt> status --short` | **Ce qui a changé** avant de sauvegarder quoi que ce soit |
| `git -C <dépôt> log --all --diff-filter=A -- '*.env' '.env'` | **⛔ LE TEST QUI COMPTE** : *un secret a-t-il déjà été committé ?* **Un secret reste dans l'histoire même après suppression** |
| `git commit -F message.txt` | **Jamais `-m`** : `git commit -m` **perd les accents** (mesuré le 12/09) |
| `sauvegarder-prod.ps1 -TestRestore` | ⚠️ **Existe. N'a JAMAIS été exécuté.** *Une sauvegarde jamais restaurée n'est pas une sauvegarde : c'est une intention* |
| `_journal-rangement-*.tsv` | **Notre équivalent du journal** : on déplace, on écrit où, **on vérifie les comptes** — *1737 = 1737, mesuré* |

---

## Ce que ce document ne dit pas

- **Je n'ai pas comparé commande par commande avec l'image.** J'ai repris **six intentions**, pas
  60 lignes. *Un mapping ligne à ligne aurait produit un tableau où la moitié des cases disent
  « sans objet » — et ce n'est pas ce qui sert.*
- **Aucune commande de ce document n'a été essayée dans ce livrable** hormis celles marquées
  « mesuré » : les relevés viennent de mon exécution du 19/09/2026, pas d'une recopie.
- **Je n'ai pas lu la documentation Microsoft** pour valider chaque commande : elles sont **exécutées
  ou connues**, pas sourcées. *Là où je ne suis pas sûr, je ne l'ai pas écrit.*
- **Aucune référence au produit de l'image n'entre dans un livrable du studio.** *Le format est libre ;
  la marque ne l'est pas.* **Le nom de l'auteur de l'image n'est pas repris non plus** — ce document
  n'a pas à porter une attribution qui laisserait croire à une reprise autorisée.

---

*GL Digital Lab · 19/09/2026 · rédigé par Trinity, preset `metroid`. Source : image reçue de Gaëtan le
19/09/2026 (décrite, non reproduite). Mesures du 19/09/2026 : `Get-NetIPConfiguration`, `Get-NetAdapter`,
`Get-NetRoute`, `Get-NetFirewallProfile`, `Get-NetFirewallRule`, `arp -a`, `netstat -ano`.
Règles reprises de `STRATEGIE-SECURITE-2026-09-17.md` §2-§6 et `~/.dsh/AGENTS.md` §2-§6.*
