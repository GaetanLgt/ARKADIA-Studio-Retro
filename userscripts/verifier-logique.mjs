/*
 * Contrôle de la logique de décision du userscript d'envoi automatique.
 *
 * Ce fichier ne teste PAS l'interface (je n'ai pas accès au navigateur de
 * Gaëtan). Il teste la SEULE partie qui décide « j'envoie / je n'envoie pas »,
 * en la relisant dans le fichier réellement livré — jamais une copie. Si
 * quelqu'un affaiblit un garde-fou dans le .user.js, ce contrôle tombe.
 *
 * Usage :
 *   node verifier-logique.mjs              → doit afficher « TOUT PASSE »
 *   node verifier-logique.mjs --mutation   → retire deux garde-fous et VÉRIFIE
 *                                            que la suite les détecte
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ici = dirname(fileURLToPath(import.meta.url));
const cheminScript = join(ici, "dsh-envoi-automatique.user.js");

const DEBUT = "/* == DEBUT-BLOC-TESTABLE == */";
const FIN = "/* == FIN-BLOC-TESTABLE == */";

function extraireBloc(source) {
  const d = source.indexOf(DEBUT);
  const f = source.indexOf(FIN);
  if (d === -1 || f === -1 || f <= d) {
    throw new Error("bornes du bloc testable introuvables dans " + cheminScript);
  }
  return source.slice(d + DEBUT.length, f);
}

function charger(bloc) {
  // eslint-disable-next-line no-new-func
  return new Function(bloc + "\n return { normaliser: normaliser, decider: decider };")();
}

const cases = [
  {
    nom: "1 · composer vide → rien",
    etat: { texte: "", composeurTrouve: true, boutonTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "composeur-vide" }
  },
  {
    nom: "2 · espaces et caractères invisibles seuls → rien",
    etat: { texte: " \u00A0\u200B\n\t ", composeurTrouve: true, boutonTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "composeur-vide" }
  },
  {
    nom: "3 · composition IME en cours → on ne coupe pas",
    etat: { texte: "bonjour", compositionEnCours: true, composeurTrouve: true, boutonTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "composition-en-cours" }
  },
  {
    nom: "4 · verrou armé → on ne renvoie pas",
    etat: { texte: "bonjour", verrou: true, composeurTrouve: true, boutonTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "verrou-arme" }
  },
  {
    nom: "5 · texte identique au dernier envoyé → on ne renvoie pas",
    etat: { texte: "bonjour", dernierTexteEnvoye: "bonjour", composeurTrouve: true, boutonTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "deja-envoye-a-l-identique" }
  },
  {
    nom: "6 · idempotence malgré espaces insécables et retours à la ligne",
    etat: {
      texte: "bonjour\u00A0 le\r\nmonde",
      dernierTexteEnvoye: "bonjour le monde",
      composeurTrouve: true,
      boutonTrouve: true
    },
    attendu: { envoi: false, voie: "aucune", raison: "deja-envoye-a-l-identique" }
  },
  {
    nom: "7 · le bouton trouvé est le bouton d'ARRÊT → refus",
    etat: { texte: "bonjour", libelleArret: true, boutonTrouve: true, composeurTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "bouton-arret-refuse" }
  },
  {
    nom: "8 · bouton d'envoi désactivé → on ne force pas",
    etat: { texte: "bonjour", boutonTrouve: true, boutonDesactive: true, composeurTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "bouton-desactive" }
  },
  {
    nom: "9 · nominal → clic sur le bouton",
    etat: { texte: "bonjour", boutonTrouve: true, composeurTrouve: true },
    attendu: { envoi: true, voie: "bouton", raison: "bouton-primaire-pret" }
  },
  {
    nom: "10 · bouton introuvable mais composer présent → repli touche Entrée",
    etat: { texte: "bonjour", boutonTrouve: false, composeurTrouve: true },
    attendu: { envoi: true, voie: "entree", raison: "repli-touche-entree" }
  },
  {
    nom: "11 · ni bouton ni composer → rien (aucun clic au hasard)",
    etat: { texte: "bonjour", boutonTrouve: false, composeurTrouve: false },
    attendu: { envoi: false, voie: "aucune", raison: "composeur-absent" }
  },
  {
    nom: "12 · entrée nulle / non-objet → rien, et aucune exception",
    etat: null,
    attendu: { envoi: false, voie: "aucune", raison: "composeur-vide" }
  },
  {
    nom: "13 · texte non-chaîne → rien, et aucune exception",
    etat: { texte: 42, boutonTrouve: true, composeurTrouve: true },
    attendu: { envoi: false, voie: "aucune", raison: "composeur-vide" }
  },
  {
    nom: "14 · nouveau texte après un envoi → on envoie (la dictée reprend)",
    etat: { texte: "deuxième message", dernierTexteEnvoye: "premier message", boutonTrouve: true, composeurTrouve: true },
    attendu: { envoi: true, voie: "bouton", raison: "bouton-primaire-pret" }
  }
];

function executer(bloc, etiquette) {
  const { decider } = charger(bloc);
  let echecs = 0;
  console.log("— " + etiquette + " —");
  for (const c of cases) {
    let obtenu;
    let exception = null;
    try {
      const brut = decider(c.etat);
      obtenu = { envoi: brut.envoi, voie: brut.voie, raison: brut.raison };
    } catch (err) {
      exception = err && err.message ? err.message : String(err);
    }
    const ok =
      exception === null &&
      obtenu.envoi === c.attendu.envoi &&
      obtenu.voie === c.attendu.voie &&
      obtenu.raison === c.attendu.raison;
    if (!ok) echecs++;
    console.log(
      (ok ? "  PASS  " : "  ÉCHEC ") +
        c.nom +
        (ok ? "" : "  — attendu " + JSON.stringify(c.attendu) + " · obtenu " + (exception ? "EXCEPTION " + exception : JSON.stringify(obtenu)))
    );
  }
  console.log("  → " + (cases.length - echecs) + "/" + cases.length + " cas passent");
  return echecs;
}

const source = readFileSync(cheminScript, "utf8");
const bloc = extraireBloc(source);
console.log("Contrôle de " + cheminScript);
console.log("Bloc testable extrait : " + bloc.length + " caractères\n");

const mutation = process.argv.includes("--mutation");

if (!mutation) {
  const echecs = executer(bloc, "logique livrée");
  if (echecs === 0) {
    console.log("\nTOUT PASSE");
    process.exit(0);
  }
  console.log("\n" + echecs + " CAS EN ÉCHEC — le livrable est faux");
  process.exit(1);
}

// Mode mutation : on sabote deux garde-fous et on VÉRIFIE que la suite tombe.
// Un contrôle qui ne peut pas échouer ne contrôle rien.
const saboté = bloc
  .replace("if (e.verrou === true)", "if (false)")
  .replace("if (texte === normaliser(e.dernierTexteEnvoye))", "if (false)");

if (saboté === bloc) {
  console.log("SABOTAGE IMPOSSIBLE : les garde-fous ne sont plus là où le contrôle les attend.");
  process.exit(1);
}

const echecsMutation = executer(saboté, "logique sabotée (verrou + idempotence retirés)");
console.log("");
if (echecsMutation > 0) {
  console.log("LE CONTRÔLE SAIT ÉCHOUER : le sabotage est détecté (" + echecsMutation + " cas en échec).");
  process.exit(0);
}
console.log("PROBLÈME : le sabotage n'a rien cassé — le contrôle ne contrôle rien.");
process.exit(1);
