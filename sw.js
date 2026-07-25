/* Service worker — v2.
   Leçon de la v1 : un cache servi en priorité sans jamais interroger le
   réseau fige l'application pour toujours. On inverse donc la règle pour
   le document lui-même, tout en gardant le hors-ligne. */
const CACHE = 'sale-v2';
const CORE = ['./', './index.html', './manifest.webmanifest',
              './tileset.png', './chars.png', './bosses.png',
              './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(CORE.map(f => c.add(f))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Le jeu tient entier dans le document : il doit toujours pouvoir se mettre
  // à jour. Réseau d'abord, cache seulement si le réseau ne répond pas.
  const isDoc = req.mode === 'navigate' || req.destination === 'document';
  if (isDoc){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Les images ne changent qu'entre deux versions : cache d'abord, ça suffit.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
