/* correction-pwa.js — la réparation des deux mécanismes qui ne peuvent pas marcher
 *
 * GL Digital Lab · 20/09/2026 · EVA-01 · Samus (harnais), preset metroid.
 *
 * POURQUOI CE FICHIER EXISTE. La page `pwa-arkadia.html` est un artefact GÉNÉRÉ par
 * une IA. Elle fabrique sa PWA de deux façons, et les deux sont refusées par les
 * navigateurs — c'est mesuré dans le fichier lui-même, pas supposé :
 *
 *   ①  le MANIFESTE est injecté en `data:application/manifest+json;charset=utf-8,…`
 *       (relevé : 1 occurrence). Un manifeste servi en `data:` n'a pas la même origine
 *       que la page : le navigateur refuse de l'installer.
 *
 *   ②  le SERVICE WORKER est enregistré depuis un `Blob` (`URL.createObjectURL`)
 *       (relevé : 1 occurrence de `new Blob([…])` servant à `register`). Un script de
 *       service worker DOIT être servi en http(s) depuis la même origine ; `blob:` est
 *       refusé, et l'enregistrement échoue — d'où l'état `error` que la page affiche.
 *
 * ⭐ La réparation ne réécrit pas l'artefact : elle **rétablit les deux fichiers
 *    statiques** qui existent déjà à côté (`manifest.webmanifest`, `service-worker.js`)
 *    et qui, eux, sont servis en même origine. *On ne répare pas un artefact généré en
 *    le réécrivant — on lui rend ce qu'il aurait dû appeler.*
 *
 * Le script est IDEMPOTENT et rejoué : le générateur injecte ses éléments depuis un
 * `useEffect` de React, donc après le premier passage. Trois reprises couvrent l'ordre.
 */
(function () {
  'use strict';

  function reparerLeManifeste() {
    // Retire les manifestes en `data:` — ils ne s'installeront jamais.
    var liens = document.querySelectorAll('link[rel="manifest"]');
    for (var i = 0; i < liens.length; i++) {
      var href = liens[i].getAttribute('href') || '';
      if (href.indexOf('data:') === 0) liens[i].remove();
    }
    // Puis pose le vrai, servi en même origine.
    var propre = document.querySelector('link[rel="manifest"]');
    if (!propre || (propre.getAttribute('href') || '').indexOf('data:') === 0) {
      var lien = document.createElement('link');
      lien.rel = 'manifest';
      lien.href = './manifest.webmanifest';
      document.head.appendChild(lien);
    }
  }

  function reparerLeServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    // Débarrasse les enregistrements qui viennent d'un `blob:` — ils sont morts-nés.
    navigator.serviceWorker.getRegistrations().then(function (enregistrements) {
      enregistrements.forEach(function (enr) {
        var url = (enr.active && enr.active.scriptURL)
          || (enr.installing && enr.installing.scriptURL)
          || (enr.waiting && enr.waiting.scriptURL) || '';
        if (url.indexOf('blob:') === 0) enr.unregister();
      });
    }).catch(function () { /* un déregistrement raté ne doit rien casser */ });

    // Puis enregistre le fichier réel.
    navigator.serviceWorker.register('./service-worker.js').catch(function () { /* idem */ });
  }

  function reparerLaLangue() {
    // Le générateur a écrit `lang="en"` : le studio travaille en français, et un lecteur
    // d'écran qui lit du français avec une voix anglaise est un défaut, pas un détail.
    if (document.documentElement.lang !== 'fr-FR') document.documentElement.lang = 'fr-FR';
  }

  function reparer() {
    reparerLaLangue();
    reparerLeManifeste();
    reparerLeServiceWorker();
  }

  reparer();
  // Le générateur injecte après coup : on repasse une fois la page posée.
  setTimeout(reparer, 1200);
  window.addEventListener('load', reparer);
})();
