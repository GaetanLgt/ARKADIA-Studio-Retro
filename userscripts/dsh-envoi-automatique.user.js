// ==UserScript==
// @name         DSH — envoi automatique après silence (dictée)
// @name:fr      DSH — envoi automatique après silence (dictée)
// @namespace    gl-digital-lab/eva01
// @version      1.0.0
// @description  Envoie le message dicté dans l'interface DSH (127.0.0.1:3080) après un silence GÉNÉREUX et configurable, au lieu d'appuyer sur Entrée. Le compte à rebours se réarme à chaque frappe ou insertion de texte.
// @author       Trinity (GL Digital Lab) — chantier du 20/09/2026
// @match        http://127.0.0.1:3080/*
// @match        http://localhost:3080/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

/*
 * CE SCRIPT N'EST PAS DANS LE HARNAIS.
 * Il vit sur le disque, à côté du chantier, et ne s'exécute que dans la page
 * http://127.0.0.1:3080 — jamais dans le processus `dsh web`, jamais dans ses
 * fichiers. Le retirer = désactiver/désinstaller le userscript, ou vider le
 * localStorage. Rien d'autre n'est touché.
 *
 * SÉLECTEURS — établis dans le bundle installé, pas devinés :
 *   composer  div[data-composer-input]        (éditeur Lexical, contenteditable)
 *   carte     [data-composer-card]            (l'ancre qui contient composer + boutons)
 *   siège     [data-composer-seat]
 *   bouton    dernier button de la carte dont une classe finit par "_primary"
 *             (classe hachée au build : uV2eYG_primary dans le build du 20/09/2026 ;
 *              la CIRE est donc repérée par le suffixe "_primary", et le script
 *              REFUSE d'agir si elle est introuvable — il ne clique jamais au hasard)
 *   arrêt     le bouton d'arrêt porte AUSSI "_primary" : il est refusé par son
 *             libellé (« Stop generating » / « 停止生成 ») et parce qu'il n'est
 *             pas le dernier de la liste.
 *
 * Preuve complète : chantier-envoi-automatique-2026-09-20.md, section (a).
 */

(function () {
  "use strict";

  /* ==================== configuration persistée ==================== */

  const NS = "dsh-envoi-auto";

  // Délai par défaut : 10 s. D'où vient ce chiffre — et d'où il ne vient PAS.
  //
  // ANCRAGE MESURÉ (chantier-seuil-parole-2026-09-20.md) : le seuil de silence
  // réellement EN VIGUEUR sur la ligne vocale voisine était `silence_ms: 1800`,
  // soit 1,8 s (assistant.html l. 1085). C'est ce 1,8 s — pas autre chose — qui
  // a coupé Gaëtan pendant qu'il respirait, avec 13,5 s de parole déjà captée
  // (`secondes_captees: 13.5`, `duree_ms: 21267`). *Le 13,5 s est une durée de
  // PAROLE, pas un seuil de silence : le lire comme un seuil est une erreur de
  // lecture, et elle a circulé.*
  //
  // DONC : la seule valeur que la mesure condamne est 1,8 s. On prend 10 s,
  // soit cinq fois et demie la valeur mesurée comme insuffisante. Au-dessus,
  // il n'existe AUCUNE mesure — c'est un choix, pas un résultat. C'est
  // précisément pourquoi il est modifiable sans toucher au code : menu du
  // gestionnaire, ou window.__EAS.reglerDelai(secondes), ou clé `delaiMs` en
  // localStorage. Plage acceptée : 3 s à 600 s.
  const DELAI_DEFAUT_MS = 10000;

  const aGM = typeof GM_getValue === "function" && typeof GM_setValue === "function";

  function lire(cle, defaut) {
    try {
      if (aGM) {
        const v = GM_getValue(cle, undefined);
        if (v !== undefined && v !== null && v !== "") return v;
      }
      const ls = window.localStorage.getItem(NS + "." + cle);
      if (ls !== null && ls !== "") return ls;
    } catch (err) {
      /* localStorage peut être refusé : on retombe sur le défaut, sans bruit. */
    }
    return defaut;
  }

  function ecrire(cle, valeur) {
    try {
      if (aGM) GM_setValue(cle, valeur);
      window.localStorage.setItem(NS + "." + cle, String(valeur));
    } catch (err) {
      console.warn("[EAS] écriture du réglage refusée :", err && err.message);
    }
  }

  function lireEntier(cle, defaut) {
    const n = parseInt(lire(cle, defaut), 10);
    return Number.isFinite(n) ? n : defaut;
  }

  const etat = {
    delaiMs: Math.min(600000, Math.max(3000, lireEntier("delaiMs", DELAI_DEFAUT_MS))),
    actif: String(lire("actif", "true")) !== "false",
    badge: String(lire("badge", "true")) !== "false",
    // état d'exécution, non persisté
    minuterie: null,
    composeurObserve: null,
    dernierTexteEnvoye: "",
    verrou: false,
    compositionEnCours: false,
    horodatageDeclenche: 0,
    ignoreJusqua: 0,
    dernierEvenement: "(aucun)",
    journal: []
  };

  /* ==================== bloc testable (ne pas renommer les bornes) ==================== */
  /* == DEBUT-BLOC-TESTABLE == */

  const CARACTERES_INVISIBLES = /[\u200B-\u200D\uFEFF]/g;

  /** Ramène un texte dicté à une forme comparable : sans caractères
   *  invisibles, sans espaces insécables, espaces multiples écrasés. */
  function normaliser(texte) {
    if (typeof texte !== "string") return "";
    return texte
      .replace(CARACTERES_INVISIBLES, "")
      .replace(/[\u00A0\u202F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Décision PURE. Aucun accès au DOM : c'est ce qui la rend testable hors
   *  navigateur (voir userscripts/verifier-logique.mjs).
   *  @returns {{envoi: boolean, voie: "bouton"|"entree"|"aucune", raison: string}} */
  function decider(etatEntree) {
    const e = etatEntree || {};
    const texte = normaliser(e.texte);

    // 1. rien à envoyer
    if (texte === "") return { envoi: false, voie: "aucune", raison: "composeur-vide" };

    // 2. une composition (IME, dictée en cours d'insertion) n'est jamais coupée
    if (e.compositionEnCours === true) return { envoi: false, voie: "aucune", raison: "composition-en-cours" };

    // 3. verrou d'idempotence : on a déjà déclenché un envoi pour ce contenu
    if (e.verrou === true) return { envoi: false, voie: "aucune", raison: "verrou-arme" };

    // 4. idempotence longue : ce contenu exact a déjà été envoyé
    if (texte === normaliser(e.dernierTexteEnvoye)) {
      return { envoi: false, voie: "aucune", raison: "deja-envoye-a-l-identique" };
    }

    // 5. le bouton primaire est peut-être le bouton d'ARRÊT — refus explicite
    if (e.boutonTrouve === true && e.libelleArret === true) {
      return { envoi: false, voie: "aucune", raison: "bouton-arret-refuse" };
    }

    // 6. bouton présent mais inactif (envoi impossible) — on ne force pas
    if (e.boutonTrouve === true && e.boutonDesactive === true) {
      return { envoi: false, voie: "aucune", raison: "bouton-desactive" };
    }

    // 7. voie nominale : le vrai bouton d'envoi
    if (e.boutonTrouve === true) return { envoi: true, voie: "bouton", raison: "bouton-primaire-pret" };

    // 8. repli : la touche Entrée sur le composer (même geste que Gaëtan aujourd'hui)
    if (e.composeurTrouve === true) return { envoi: true, voie: "entree", raison: "repli-touche-entree" };

    return { envoi: false, voie: "aucune", raison: "composeur-absent" };
  }

  /* == FIN-BLOC-TESTABLE == */

  /* ==================== sélecteurs ==================== */

  const SELECTEURS = {
    composeur: "[data-composer-input]",
    carte: "[data-composer-card]",
    siege: "[data-composer-seat]"
  };

  // Libellés localisés du bouton d'ARRÊT, relevés dans le bundle installé
  // (dictionnaires zh et en de @deepseek-ai/dsh-client-ui-conversation).
  // L'interface peut être en chinois ou en anglais : les deux sont refusés.
  const LIBELLES_ARRET = ["Stop generating", "停止生成"];

  /* ==================== lecture du DOM ==================== */

  function estVisible(el) {
    try {
      return el.getClientRects().length > 0;
    } catch (err) {
      return false;
    }
  }

  function composeurs() {
    return Array.prototype.slice.call(document.querySelectorAll(SELECTEURS.composeur));
  }

  /** Le composer réellement utilisé : visible, et si plusieurs, celui qui a le focus. */
  function composeurActif() {
    const visibles = composeurs().filter(estVisible);
    if (visibles.length === 0) return null;
    const actif = document.activeElement;
    const avecFocus = visibles.filter((el) => el === actif || el.contains(actif));
    if (avecFocus.length > 0) return avecFocus[avecFocus.length - 1];
    return visibles[visibles.length - 1];
  }

  /** Texte du composer. Le placeholder est un FRÈRE de l'éditeur
   *  ([data-composer-placeholder]), il n'est donc jamais compté. */
  function texteComposeur(el) {
    if (el === null) return "";
    let brut = "";
    try {
      brut = typeof el.innerText === "string" && el.innerText !== "" ? el.innerText : el.textContent;
    } catch (err) {
      brut = el.textContent || "";
    }
    return normaliser(brut);
  }

  /** Bouton d'envoi : le DERNIER bouton primaire de la carte.
   *  Le bouton d'arrêt est aussi primaire mais arrive AVANT (ordre du DOM
   *  relevé dans le bundle). On refuse en plus tout libellé d'arrêt connu. */
  function boutonEnvoi(composeur) {
    if (composeur === null) return null;
    let racine = null;
    try {
      racine = composeur.closest(SELECTEURS.carte);
    } catch (err) {
      racine = null;
    }
    if (racine === null) {
      try {
        racine = composeur.closest(SELECTEURS.siege);
      } catch (err) {
        racine = null;
      }
    }
    if (racine === null) racine = document.body;

    const primaires = Array.prototype.slice
      .call(racine.querySelectorAll("button"))
      .filter((b) => {
        const cls = b.className;
        if (typeof cls !== "string" || cls === "") return false;
        return cls.split(/\s+/).some((c) => c.endsWith("_primary"));
      });

    if (primaires.length === 0) return null;
    const dernier = primaires[primaires.length - 1];
    if (estBoutonArret(dernier)) return null;
    return dernier;
  }

  function estBoutonArret(b) {
    const libelle = normaliser(b.getAttribute("aria-label") || "");
    return LIBELLES_ARRET.indexOf(libelle) !== -1;
  }

  function estDesactive(b) {
    if (b.disabled === true) return true;
    if (b.getAttribute("aria-disabled") === "true") return true;
    return false;
  }

  /* ==================== état de la décision ==================== */

  function etatCourant() {
    const composeur = composeurActif();
    const bouton = boutonEnvoi(composeur);
    return {
      texte: texteComposeur(composeur),
      compositionEnCours: etat.compositionEnCours,
      verrou: etat.verrou,
      dernierTexteEnvoye: etat.dernierTexteEnvoye,
      composeurTrouve: composeur !== null,
      boutonTrouve: bouton !== null,
      boutonDesactive: bouton === null ? false : estDesactive(bouton),
      libelleArret: bouton === null ? false : estBoutonArret(bouton),
      _composeur: composeur,
      _bouton: bouton
    };
  }

  /* ==================== journal (borné) ==================== */

  function noter(raison, detail) {
    const ligne = { quand: new Date().toISOString(), raison: raison, detail: detail === undefined ? null : detail };
    etat.journal.push(ligne);
    if (etat.journal.length > 60) etat.journal.shift();
    return ligne;
  }

  /* ==================== bandeau ==================== */

  let elementBandeau = null;

  function bandeau() {
    if (elementBandeau !== null && document.body.contains(elementBandeau)) return elementBandeau;
    const d = document.createElement("div");
    d.id = "eas-bandeau";
    d.style.cssText = [
      "position:fixed",
      "right:18px",
      "bottom:96px",
      "z-index:2147483000",
      "max-width:260px",
      "padding:6px 10px",
      "border-radius:10px",
      "border:1px solid rgba(0,0,0,.18)",
      "background:rgba(20,20,22,.86)",
      "color:#f2f2f2",
      "font:12px/1.35 system-ui,Segoe UI,sans-serif",
      "cursor:pointer",
      "user-select:none"
    ].join(";");
    d.title = "Envoi automatique après silence — cliquer pour annuler le décompte en cours";
    d.addEventListener("click", () => {
      annuler("clic-sur-le-bandeau");
    });
    document.body.appendChild(d);
    elementBandeau = d;
    return d;
  }

  function dessinerBandeau() {
    if (!etat.badge) {
      if (elementBandeau !== null) elementBandeau.style.display = "none";
      return;
    }
    const d = bandeau();
    d.style.display = "block";

    if (!etat.actif) {
      d.textContent = "⏸ envoi auto désactivé (cliquer : annuler)";
      d.style.opacity = "0.55";
      return;
    }
    if (etat.minuterie === null) {
      d.textContent = "🎙 envoi auto : " + Math.round(etat.delaiMs / 1000) + " s après la fin de la dictée";
      d.style.opacity = "0.55";
      return;
    }
    const reste = Math.max(0, etat.delaiMs - (Date.now() - etat.horodatageDeclenche));
    d.textContent = "⏳ envoi dans " + (reste / 1000).toFixed(1) + " s — cliquer pour annuler";
    d.style.opacity = "1";
  }

  /* ==================== minuterie ==================== */

  function armer(origine) {
    if (Date.now() < etat.ignoreJusqua) return;
    if (!etat.actif) return;
    const composeur = composeurActif();
    if (composeur === null) return;
    if (texteComposeur(composeur) === "") {
      // rien à envoyer : on désarme (arrivée de texte = nouvel armement)
      if (etat.minuterie !== null) annuler("composeur-vide");
      return;
    }
    etat.dernierEvenement = origine;
    if (etat.minuterie !== null) clearTimeout(etat.minuterie);
    etat.horodatageDeclenche = Date.now();
    etat.minuterie = setTimeout(declencher, etat.delaiMs);
    dessinerBandeau();
  }

  function annuler(raison) {
    if (etat.minuterie !== null) {
      clearTimeout(etat.minuterie);
      etat.minuterie = null;
      noter("decompte-annule", raison);
    }
    dessinerBandeau();
  }

  function declencher() {
    etat.minuterie = null;
    const e = etatCourant();
    const decision = decider(e);
    noter("decision", decision.raison);

    if (!decision.envoi) {
      dessinerBandeau();
      return decision;
    }

    const texteEnvoye = e.texte;
    // VERROU posé AVANT l'action : même si l'action se comporte mal,
    // aucun second envoi du même contenu ne peut partir.
    etat.verrou = true;
    etat.dernierTexteEnvoye = texteEnvoye;

    let action = "aucune";
    if (decision.voie === "bouton") {
      e._bouton.click();
      action = "clic-bouton";
    } else if (decision.voie === "entree") {
      tenterEntree(e._composeur);
      action = "touche-entree";
    }
    noter("envoi-declenche", { voie: decision.voie, action: action, longueur: texteEnvoye.length });

    // On ignore les mutations que NOUS venons de provoquer (le composer se vide).
    etat.ignoreJusqua = Date.now() + 900;

    // Contrôle : l'envoi a-t-il pris ? On ne réessaie JAMAIS automatiquement.
    setTimeout(() => {
      const apres = texteComposeur(composeurActif());
      if (apres === texteEnvoye) {
        noter("envoi-non-confirme", "le composer porte encore le texte : envoi possiblement manqué, aucun nouvel essai");
        console.warn("[EAS] envoi non confirmé — le texte est toujours dans le composer. Aucun nouvel essai automatique.");
      } else {
        noter("envoi-confirme", "composer vidé ou modifié");
      }
      // Le verrou tombe dès que le contenu visible n'est plus celui envoyé.
      if (apres !== texteEnvoye) etat.verrou = false;
      dessinerBandeau();
    }, 1200);

    dessinerBandeau();
    return decision;
  }

  function tenterEntree(composeur) {
    try {
      composeur.focus({ preventScroll: true });
      const ev = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        cancelable: true,
        composed: true,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
        metaKey: false
      });
      composeur.dispatchEvent(ev);
    } catch (err) {
      noter("repli-entree-impossible", err && err.message);
    }
  }

  /* ==================== écoute de l'activité ==================== */

  const EVENEMENTS_ACTIVITE = [
    "beforeinput",
    "input",
    "keydown",
    "keyup",
    "paste",
    "drop",
    "compositionstart",
    "compositionupdate",
    "compositionend"
  ];

  function surActivite(ev) {
    // Toute arrivée de texte réarme : tant que du texte arrive, on n'envoie pas.
    if (ev.type === "compositionstart") etat.compositionEnCours = true;
    if (ev.type === "compositionend") etat.compositionEnCours = false;
    armer("evenement:" + ev.type);
  }

  function brancherEcouteDocument() {
    EVENEMENTS_ACTIVITE.forEach((nom) => document.addEventListener(nom, surActivite, true));
  }

  let observateur = null;
  let observateurAttente = null;

  function observerComposeur(composeur) {
    if (observateur !== null) observateur.disconnect();
    observateur = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "characterData" || m.type === "childList") {
          armer("mutation:" + m.type);
          return;
        }
      }
    });
    observateur.observe(composeur, { subtree: true, childList: true, characterData: true });
    etat.composeurObserve = composeur;
    armer("observation-branchee");
  }

  function attendreComposeur() {
    const existant = composeurActif();
    if (existant !== null) {
      observerComposeur(existant);
      return;
    }
    if (observateurAttente !== null) return;
    observateurAttente = new MutationObserver(() => {
      const c = composeurActif();
      if (c !== null) {
        observateurAttente.disconnect();
        observateurAttente = null;
        observerComposeur(c);
      }
    });
    observateurAttente.observe(document.documentElement, { subtree: true, childList: true });
  }

  /* ==================== API et menus ==================== */

  function reglerDelai(secondes) {
    const s = Number(secondes);
    if (!Number.isFinite(s) || s <= 0) {
      console.warn("[EAS] délai refusé :", secondes);
      return etat.delaiMs;
    }
    etat.delaiMs = Math.min(600000, Math.max(3000, Math.round(s * 1000)));
    ecrire("delaiMs", etat.delaiMs);
    console.info("[EAS] délai de silence =", etat.delaiMs / 1000, "s");
    if (etat.minuterie !== null) armer("delai-change");
    dessinerBandeau();
    return etat.delaiMs;
  }

  function reglerActif(valeur) {
    etat.actif = valeur === true || valeur === "true";
    ecrire("actif", etat.actif ? "true" : "false");
    if (!etat.actif) annuler("desactivation");
    dessinerBandeau();
    console.info("[EAS] actif =", etat.actif);
    return etat.actif;
  }

  function reglerBandeau(valeur) {
    etat.badge = valeur === true || valeur === "true";
    ecrire("badge", etat.badge ? "true" : "false");
    dessinerBandeau();
    return etat.badge;
  }

  window.__EAS = {
    etat: etat,
    selecteurs: SELECTEURS,
    etatCourant: etatCourant,
    decider: decider,
    normaliser: normaliser,
    reglerDelai: reglerDelai,
    reglerActif: reglerActif,
    reglerBandeau: reglerBandeau,
    envoyerMaintenant: () => declencher(),
    annuler: annuler,
    journal: () => etat.journal,
    diagnostic: function () {
      const composeur = composeurActif();
      const bouton = boutonEnvoi(composeur);
      const rapport = {
        actif: etat.actif,
        delai_secondes: etat.delaiMs / 1000,
        composeurs_dans_le_dom: composeurs().length,
        composeur_actif: composeur === null ? null : composeur.className,
        bouton_trouve: bouton !== null,
        bouton_classe: bouton === null ? null : bouton.className,
        bouton_libelle: bouton === null ? null : bouton.getAttribute("aria-label"),
        bouton_desactive: bouton === null ? null : estDesactive(bouton),
        texte_present: texteComposeur(composeur).length + " caractère(s)",
        composition_en_cours: etat.compositionEnCours,
        verrou: etat.verrou,
        dernier_evenement: etat.dernierEvenement,
        journal: etat.journal.slice(-12)
      };
      console.info("[EAS] diagnostic :", rapport);
      return rapport;
    }
  };

  function menu(nom, action) {
    try {
      if (typeof GM_registerMenuCommand === "function") GM_registerMenuCommand(nom, action);
    } catch (err) {
      /* pas de gestionnaire de userscripts : on n'installe pas de menu */
    }
  }

  menu("⏱ Régler le délai de silence (secondes)", () => {
    const propose = String(etat.delaiMs / 1000);
    const reponse = window.prompt(
      "Délai de silence avant envoi automatique, en secondes.\n" +
        "Minimum 3, maximum 600. Valeur actuelle : " + propose + "\n" +
        "(rappel : le défaut est 10 s. Sur la ligne vocale voisine, un silence de 1,8 s a déjà coupé\n" +
        "la parole — ne descends pas en dessous de cette valeur sans raison.)",
      propose
    );
    if (reponse !== null) reglerDelai(reponse);
  });
  menu("▶️/⏸ Activer ou désactiver l'envoi automatique", () => reglerActif(!etat.actif));
  menu("👁 Afficher ou masquer le bandeau", () => reglerBandeau(!etat.badge));
  menu("📤 Envoyer maintenant (test)", () => declencher());
  menu("🔎 Diagnostic (console)", () => window.__EAS.diagnostic());

  /* ==================== démarrage ==================== */

  function demarrer() {
    brancherEcouteDocument();
    attendreComposeur();
    dessinerBandeau();
    setInterval(dessinerBandeau, 250);

    // Si le composer est re-rendu par React (changement de session, navigation),
    // on rebranche l'observation.
    setInterval(() => {
      const c = composeurActif();
      if (c !== null && c !== etat.composeurObserve) observerComposeur(c);
    }, 2000);

    console.info(
      "[EAS] prêt — délai " + etat.delaiMs / 1000 + " s · actif=" + etat.actif +
        " · API : window.__EAS (diagnostic(), reglerDelai(s), journal())"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer, { once: true });
  } else {
    demarrer();
  }
})();
