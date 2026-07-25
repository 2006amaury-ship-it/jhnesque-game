/* Cache hors-ligne minimal. Change CACHE à chaque déploiement. */
const CACHE = 'sale-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './tileset.png', './chars.png', './bosses.png',
  'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.80.1/phaser.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(FILES.map(f => c.add(f))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
