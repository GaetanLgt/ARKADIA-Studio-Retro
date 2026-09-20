/*
 * Contrôle des SÉLECTEURS annoncés dans la fiche du 20/09/2026, contre le
 * harnais RÉELLEMENT installé sur EVA01. Aucun nom de fichier n'est recopié à
 * la main : le chemin est découvert sur le disque.
 *
 * Ce contrôle peut échouer — et c'est le but. Après une mise à jour de DSH, un
 * échec ici signifie : « les sélecteurs du userscript ne sont plus valides,
 * relire le bundle avant de faire confiance au script ».
 *
 * Usage :  node verifier-selecteurs.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const RACINE_DSH = "C:\\Users\\neosp\\AppData\\Roaming\\npm\\node_modules\\@deepseek-ai\\dsh";
const PAQUET = "dsh-client-ui-conversation";

/* ---------- découverte : on ne devine aucun chemin, on le trouve ---------- */

function chercherDossier(racine, nom, profondeurMax = 8) {
  const trouves = [];
  const visiter = (chemin, profondeur) => {
    if (profondeur > profondeurMax) return;
    let entrees;
    try {
      entrees = readdirSync(chemin, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entrees) {
      if (e.isDirectory()) {
        const complet = join(chemin, e.name);
        if (e.name === nom) trouves.push(complet);
        else visiter(complet, profondeur + 1);
      }
    }
  };
  visiter(racine, 0);
  return trouves;
}

function fichiersJs(racine, profondeurMax = 6) {
  const trouves = [];
  const visiter = (chemin, profondeur) => {
    if (profondeur > profondeurMax) return;
    let entrees;
    try {
      entrees = readdirSync(chemin, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entrees) {
      const complet = join(chemin, e.name);
      if (e.isDirectory()) visiter(complet, profondeur + 1);
      else if (e.isFile() && e.name.endsWith(".js")) trouves.push(complet);
    }
  };
  visiter(racine, 0);
  return trouves;
}

console.log("Racine du harnais : " + RACINE_DSH);
if (!existsSync(RACINE_DSH)) {
  console.log("ÉCHEC : harnais introuvable à cet emplacement — le script ne vérifie rien.");
  process.exit(1);
}

const dossiers = chercherDossier(RACINE_DSH, PAQUET);
if (dossiers.length === 0) {
  console.log("ÉCHEC : paquet " + PAQUET + " introuvable sous la racine du harnais.");
  process.exit(1);
}
console.log("Paquet trouvé : " + dossiers.join("  |  "));

/* Le plus gros .js du paquet porte l'implémentation (le bundle client). */
let cible = null;
let taille = -1;
for (const d of dossiers) {
  for (const f of fichiersJs(d)) {
    const t = statSync(f).size;
    if (t > taille) {
      taille = t;
      cible = f;
    }
  }
}
if (cible === null) {
  console.log("ÉCHEC : aucun bundle JS trouvé dans le paquet.");
  process.exit(1);
}
console.log("Bundle analysé : " + cible + "  (" + taille + " octets)\n");
const s = readFileSync(cible, "utf8");

/* ---------- les affirmations à réfuter ---------- */

const controles = [
  {
    nom: "le composer porte data-composer-input",
    ok: s.includes('"data-composer-input": true')
  },
  {
    nom: "le composer est contenteditable et role=textbox, multiligne",
    ok:
      s.includes("function ComposerContentEditable(") &&
      s.includes("contentEditable: editor !== null && editable") &&
      s.includes('role: "textbox"')
  },
  {
    nom: "la carte du composer porte data-composer-card",
    ok: s.includes('"data-composer-card": true')
  },
  {
    nom: "le siège du composer porte data-composer-seat",
    ok: s.includes('"data-composer-seat": ""')
  },
  {
    nom: "la carte a une classe hachée finissant par _primary",
    ok: /"primary":\s*"[A-Za-z0-9_$]+_primary"/.test(s)
  },
  {
    nom: "la classe hachée _primary existe bien dans la feuille de style du bundle",
    ok: /\.[A-Za-z0-9_$]+_primary\{/.test(s)
  },
  {
    nom: "la carte a une classe hachée finissant par _card",
    ok: /"card":\s*"[A-Za-z0-9_$]+_card"/.test(s)
  },
  {
    nom: "KEY_ENTER_COMMAND alimente handlers.submit(...) — le repli Entrée existe",
    ok: /registerCommand\(cn\$1,\s*\(event\)\s*=>\s*\{/.test(s) && s.includes("handlers.submit(event?.ctrlKey === true")
  },
  {
    nom: "le libellé d'arrêt anglais est bien la valeur de input.stop",
    ok: /"input\.stop":\s*"Stop generating"/.test(s)
  },
  {
    nom: "le libellé d'arrêt chinois est bien la valeur de input.stop",
    ok: /"input\.stop":\s*"停止生成"/.test(s)
  },
  {
    nom: "les libellés d'envoi existent (en)",
    ok:
      /"input\.send":\s*"Send message"/.test(s) &&
      /"input\.send\.queue":\s*"Queue message"/.test(s) &&
      /"input\.send\.steer":\s*"Steer message"/.test(s)
  },
  {
    nom: "les libellés d'envoi existent (zh)",
    ok:
      /"input\.send":\s*"发送消息"/.test(s) &&
      /"input\.send\.queue":\s*"排队发送"/.test(s) &&
      /"input\.send\.steer":\s*"插话发送"/.test(s)
  },
  {
    nom: "le bouton d'arrêt ET le bouton d'envoi partagent la même classe primaire (piège documenté)",
    ok: (s.match(/InputBar_module_css_default\.primary/g) || []).length === 2
  }
];

let echecs = 0;
for (const c of controles) {
  if (!c.ok) echecs++;
  console.log((c.ok ? "  PASS  " : "  ÉCHEC ") + c.nom);
}

console.log("\n" + (controles.length - echecs) + "/" + controles.length + " affirmations tiennent.");
if (echecs === 0) {
  console.log("SÉLECTEURS CONFORMES AU HARNAIS INSTALLÉ");
  process.exit(0);
}
console.log(
  "SÉLECTEURS NON CONFORMES : le bundle a changé. Relire le paquet " +
    PAQUET +
    " avant de faire confiance au userscript."
);
process.exit(1);
