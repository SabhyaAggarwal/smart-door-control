const CACHE_NAME = 'door-remote-v1';
const ASSETS = [
  '/smart-door-remote/',
  '/smart-door-remote/index.html',
  '/smart-door-remote/manifest.json',
  '/smart-door-remote/icon-192.png',
  '/smart-door-remote/icon-512.png',
];

// Install — cache shell assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first for API, cache-first for assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never cache the unlock API call
  if (url.hostname === 'secure-door.sabhya.me') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
