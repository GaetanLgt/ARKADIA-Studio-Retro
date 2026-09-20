# Samus — les décisions du 20/09/2026, et l'état réel de la voix locale

> **GL Digital Lab · 20/09/2026, 05 h 05 · EVA01 · Samus (harnais), preset `metroid`.**
> *Gaëtan a tranché sur quatre points. Ce document les date, **parce qu'une décision orale qui
> n'est pas écrite meurt avec la fenêtre de contexte qui l'a entendue**.*

---

## 1. Ce qui est décidé

| # | La décision de Gaëtan | Verdict |
|---|---|---|
| 1 | **Remettre le cerveau local sur le GPU** | ⭐ **FAIT le 20/09 à 05 h 00** — voir §2 |
| 2 | **Raccorder l'écoute : `/ecouter-auto` → `/demander`, avec un verrou demi-duplex** | ✅ **à faire** |
| 3 | **Réparer sa consigne** — *« on répare, on fixe, on jette pas »* | ✅ **à faire** |
| 4 | **Le témoin visuel de micro** | ⛔ **REFUSÉ, et il a raison** — *voir §3* |
| 5 | **Discord · Calcifer** | ⏳ **plus tard** — *« c'est pas un souci »* |

**Et une contrainte que Gaëtan a posée lui-même** : *il dicte déjà ses messages avec la
**reconnaissance vocale de Windows**. Si l'oreille de Samus s'ouvre en même temps, **l'information
entre deux fois**.* ⛔ **Les deux ne doivent jamais écouter ensemble.**

---

## 2. Fait : le cerveau est repassé sur la carte

```
avant : ministral-3:8b   5,7 Go   100% CPU   contexte 4096   Forever
après : ministral-3:8b   5,4 Go   100% GPU   contexte 4096   Forever
        VRAM 2 854 → 9 005 Mio / 10 240
```

**Cause identifiée** : *il avait été chargé quand la carte était pleine ; `keep_alive: Forever`
l'a laissé sur le processeur.* **Déchargé puis rechargé à froid, il se replace seul sur le GPU.**

⚠️ **Revers mesuré, et il faut le garder en tête** : **9 005 / 10 240 Mio — il reste 1,2 Go.**
⛔ **Le cerveau de la voix et un rendu ComfyUI ne tiennent plus ensemble sur cette carte.**
*La règle « un seul job GPU lourd à la fois » se resserre.*

⚠️ **Contexte inchangé : 4 096, PAS 65 536.** *Le porter à 65 536 demande le cache KV, et
**ça ne rentre pas à côté dans 10 Go**. La mesure du 13/09 (« 65 536 entièrement sur GPU,
1,91 Go libres ») décrit une **autre** configuration.* **Non retesté à ce jour.**

---

## 3. Le témoin visuel : refusé, et c'est la bonne réponse

**Gaëtan** : *« moi sur mon micro, j'en ai pas, je le lève ou je le baisse pour le fermer. Je sais
quand il est ouvert, je sais qu'il est fermé. »*

⭐ **Le témoin existe déjà : c'est une perche physique, et elle est dans sa main.**
*Coder un voyant logiciel aurait fait doublon avec un geste que son propriétaire maîtrise mieux
qu'aucune interface.* **Décision retirée de la liste — pas repoussée, retirée.**

⚠️ **Et la question de vie privée du micro permanent reste donc ouverte, mais elle change de
nature** : *le mute physique de Gaëtan **est** la réponse. Ce qui reste à trancher, c'est seulement
la **durée** d'ouverture du micro logiciel — pas son principe.*

---

## 4. Le tour de parole : ce n'est pas de la politesse, c'est du matériel

⭐ **Le casque de Gaëtan est à la fois le micro et la sortie** (`Stealth 600X Gen 3`, dongle USB
`VID_10F5&PID_2232`, **capture et render ACTIFS — mesuré**). *Quand Samus parle, **sa propre voix
rentre dans son oreille**.*

**Déjà documenté par le studio le 17/09/2026** (`oreille.js`, ligne 415) :
> *« le bot se répond, indéfiniment — Discord ne renvoie jamais au bot son propre audio, donc rien ne le signale. »*

⛔ **Donc « qu'on se coupe pas la parole » ne se règle pas par une règle de savoir-vivre : il se
règle par un demi-duplex.** */dire* verrouille l'oreille, la relâche à la fin. **La parole est
sérialisée par le matériel lui-même** — et le tour de parole en découle au lieu d'être imposé.

---

## 5. L'état réel du vase clos, mesuré ce soir

| Le morceau | État | Preuve |
|---|---|---|
| Elle parle dans le casque, **sans Discord** | ✅ | `POST /dire` → `lecture_ms: 24 992` — **Gaëtan l'a entendue** |
| La chaîne complète question → cerveau → voix | ✅ | `POST /demander` |
| **Rien ne sort de la machine** | ✅ | `sorti_de_la_machine: false` (champ du code, pas une promesse) |
| Latence, GPU **saturé** | 62 s | `cerveau_ms: 54 515` |
| Latence, GPU **libre** | ⭐ **12 s** | `cerveau_ms: 5 621` · `voix_ms: 6 367` |
| **Le raccord écoute → question** | ⛔ **manquant** | `/ecouter-auto` existe, **rien ne l'appelle** |
| **Sa consigne** | ⛔ **fautive** | voir §6 |
| `dsh --profile headless` comme cerveau | ⛔ **écarté** | *aucun `--resume`, aucun `--model` — **il enverrait la voix de Gaëtan à l'API DeepSeek**, distante et payante* |

---

## 6. Sa consigne fabrique des faits — et c'est mesuré, deux fois

**Question 1** : *« qui es-tu, et sur quelle machine tournes-tu ? »*
→ ⛔ *« je tourne sur **les serveurs de Génie IT Tek FR** »* — **aucun serveur de ce nom n'existe.**
**Question 2** : *« quelle heure est-il sur cette machine ? »*
→ ⛔ *« **14h37**, et il fait un temps de ouf aujourd'hui »* — **il n'était pas 14 h 37, et elle n'a pas accès à la météo.**

> ⚠️ **Un `"sorti_de_la_machine": false` protège ce qui SORT. Il ne dit rien de la justesse de ce qui est DIT.**
> *Un modèle de 6 Go qui ne sait pas qu'il ne sait pas répond avec assurance — **dans la voix de
> l'assistante, dans le casque, sans que rien ne signale l'invention.*** C'est le point ③ de la liste.

---

## 7. Ce que ce document n'établit pas

- ⛔ **Le raccord n'est pas écrit.** *Décidé, non exécuté.*
- ⛔ **La consigne n'est pas réparée.** *Décidé, non exécuté.*
- ⚠️ **Je n'ai pas remesuré la latence après le passage sur GPU.** *Les 12 s datent d'avant le rechargement ; **elle devrait être meilleure, ce n'est pas vérifié.***
- ⚠️ **Je n'ai pas testé `/ecouter-auto` sur la voix de Gaëtan.** *`oreille.appels` vaut toujours **0** — **le seul chiffre de toute cette histoire qui n'a jamais bougé.***
- ⛔ **Aucune valeur de secret lue.** *Aucune donnée de tiers transmise.*

---

*GL Digital Lab · 20/09/2026 · **Samus (harnais)**, preset `metroid`. Mesures : `POST /sante` ·
`POST /dire` · `POST /demander` · `GET /sante` de `serveur-voix` (port 8150) · `ollama ps` /
`ollama stop` · `nvidia-smi` · registre `MMDevices\Audio` (capture **et** render) ·
`dsh --profile headless --help` · journaux `bot-live.log`, `bot-session.log` · `oreille.js` **lu**.*
