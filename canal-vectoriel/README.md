# Pack Canal Arkadia — la vitrine vectorielle, câblée bout à bout

> **GL Digital Lab · 20/09/2026 · EVA-01.**
> Pack technique du canal : coquille PWA, bannière SVG, proxy, connecteur de chat.
> ⛔ **Rien de ce qui suit n'a été obtenu en réutilisant un contenu de franchise protégée.**
> Les noms employés ici sont ceux du studio.

---

## 1. Ce que contient le dossier

| Fichier | Rôle | État |
|---|---|---|
| `index.html` | la coquille PWA : affiche la bannière, s'installe, se sert hors ligne | ✅ ouvrable |
| `manifest.webmanifest` | déclaration PWA (nom, icônes, capture, raccourcis) | ✅ écrit |
| `service-worker.js` | cache de la coquille ; **jamais** de cache sur une requête | ✅ syntaxe vérifiée |
| `arkadia-banniere.svg` | la bannière 1920×1080, **vectorielle pure** | ✅ écrit |
| `icone.svg` · `icone-maskable.svg` | icônes de l'application installée | ✅ écrites |
| `bot.php` | le proxy public : signature, quota, cache de vecteurs, relais | ✅ `php -l` propre |
| `connecteur-live.mjs` | chat TikTok/YouTube → overlay + voix locale | ✅ `--essai` 6/6 |
| `README.md` | ce document | — |

---

## 2. Le montage, dans l'ordre

```
① la coquille       ouvrir index.html dans un navigateur (double-clic suffit)
② le direct         OBS → Source navigateur → l'URL servie, 1920×1080
③ le proxy          bot.php sur l'hébergeur (Odeswitch), 4 variables d'environnement
④ le tunnel         cloudflared → MIMOTRON_URL pointe sur la machine locale
⑤ le chat           connecteur-live.mjs, lancé sur EVA-01
```

**Les quatre variables de `bot.php`** — à poser sur l'hébergeur, **jamais dans ce dépôt** :

| Variable | Ce qu'elle porte |
|---|---|
| `ARKADIA_SECRET` | le secret partagé, pour la signature HMAC |
| `MIMOTRON_URL` | l'URL publique du tunnel vers EVA-01 |
| `MIMOTRON_SECRET` | le jeton que le tunnel exige |
| `ARKADIA_QUOTA` · `ARKADIA_FENETRE` | appels par IP et par fenêtre (défaut 60 / 60 s) |

**Les variables du connecteur** (côté EVA-01) :

| Variable | Effet |
|---|---|
| `ARKADIA_AUTORISES` | **liste d'autorisation**, séparée par des virgules. **Vide = personne ne déclenche quoi que ce soit.** |
| `ARKADIA_COMMANDE` | la commande de chat (défaut `!arkadia`) |
| `ARKADIA_TIKTOK` | le compte TikTok à écouter |
| `YOUTUBE_API_KEY` · `ARKADIA_YOUTUBE_VIDEO_ID` | pour le chat YouTube |
| `ARKADIA_VOIX_URL` | le service vocal local (défaut `http://127.0.0.1:8150`) |

---

## 3. Le contrôle — deux commandes, et elles savent échouer

```powershell
# la décision du connecteur, sans réseau et sans dépendance
cd "C:\Users\neosp\Desktop\ARKADIA Studio Retro\canal-vectoriel"
$env:ARKADIA_AUTORISES = "gaetan"
node connecteur-live.mjs --essai     # attendu : 6/6, et « refus » quand la cadence serre

# la syntaxe des deux fichiers techniques
php -l bot.php
node --check service-worker.js
```

⚠️ **`--essai` est rejouable dans les deux sens** : liste garnie **et** liste vide.
Liste vide, le script refuse **tout**, y compris un compte qui serait le bon —
c'est le comportement voulu, et l'épreuve le dit au lieu de le taire.

---

## 4. ⛔ Ce que ce pack n'établit pas

1. **Le connecteur n'a jamais tourné en vrai.** `tiktok-live-connector` n'est pas
   installé sur EVA-01, et `YOUTUBE_API_KEY` n'est pas posée. L'épreuve porte sur
   **la décision seule** (`--essai`), pas sur la connexion aux plateformes.
2. **La diffusion en direct n'a pas été essayée.** Ouvrir un vrai direct pour tester
   est une action sur un service externe — elle appartient à Gaëtan.
3. **Le service worker n'a pas été exécuté dans un navigateur.** Sa syntaxe est
   validée par `node --check` ; son comportement de cache ne l'est pas.
4. **`bot.php` n'a pas été exécuté.** `php -l` valide la syntaxe, pas le relais :
   ni le tunnel, ni le quota, ni le cache n'ont été éprouvés contre un service vivant.
5. **Les icônes sont en SVG.** Chromium les accepte ; certains systèmes demandent
   des PNG (192 et 512 px) pour l'écran d'accueil. Non produits ici.
6. **Aucun rendu visuel n'a été regardé.** La bannière est écrite, pas vue —
   *la mesurer ne remplace pas la regarder.*
7. **Aucune donnée de tiers, aucun secret, aucun contenu de conversation** n'entre
   dans ce dossier : le proxy et le connecteur ne journalisent que des mesures
   (compte tronqué, longueur, durée, code).

---

## 5. Deux points qui appartiennent à Gaëtan

1. **Le nom public du personnage.** Le personnage de la vitrine porte un nom dérivé
   d'une **franchise protégée**. Un nom d'agent **interne** est un choix du studio ;
   un nom **public**, sur une chaîne, est autre chose. À trancher avant la mise en
   ligne — c'est le point D12, et il est signalé ici pour ne pas être découvert en direct.
2. **La mise en ligne** (hébergement, tunnel, clés API, ouverture d'un direct) :
   action sur un service externe.

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`.*
*Fiche liée : `patterns-metroid-arkadia-2026-09-20.md` (design interne), `PLAN-restructuration-2026-09-20.md`.*
