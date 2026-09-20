/* Service worker — Canal Arkadia (PWA)
 * GL Digital Lab · 20/09/2026 · EVA-01
 *
 * Deux politiques, et une seule règle de fond :
 *   · les fichiers de la coquille (HTML, SVG, manifeste) : cache d'abord,
 *     parce qu'ils ne changent qu'à la main et que la vitrine doit s'afficher
 *     même si le réseau tombe ;
 *   · tout ce qui porte une requête (proxy, tunnel, voix locale) : réseau
 *     d'abord, JAMAIS de mise en cache — une réponse d'IA resservie depuis un
 *     cache est un mensonge, pas une optimisation.
 *
 * ⚠️ NON ÉPROUVÉ : ce fichier n'a pas été exécuté dans un navigateur à ce jour.
 * Le contrôle qui le valide est écrit dans README.md (« Contrôle »).
 */

const VERSION = 'canal-arkadia-v1';
const COQUILLE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './arkadia-banniere.svg',
  './icone.svg',
  './icone-maskable.svg',
];

self.addEventListener('install', (evenement) => {
  evenement.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(COQUILLE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evenement) => {
  evenement.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== VERSION).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/** Une requête qui porte une question ne se met jamais en cache. */
function porteUneRequete(url, requete) {
  if (requete.method !== 'GET') return true;
  const cheminsVives = ['/bot.php', '/api/', '/tunnel/', '/voix/', '/vision/'];
  return cheminsVives.some((c) => url.pathname.includes(c)) || url.port === '8150' || url.port === '8151';
}

self.addEventListener('fetch', (evenement) => {
  const url = new URL(evenement.request.url);

  if (porteUneRequete(url, evenement.request)) {
    evenement.respondWith(fetch(evenement.request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  evenement.respondWith(
    caches.match(evenement.request).then((enCache) => {
      const duReseau = fetch(evenement.request)
        .then((reponse) => {
          if (reponse && reponse.status === 200 && reponse.type === 'basic') {
            const copie = reponse.clone();
            caches.open(VERSION).then((cache) => cache.put(evenement.request, copie));
          }
          return reponse;
        })
        .catch(() => enCache);
      return enCache || duReseau;
    })
  );
});
