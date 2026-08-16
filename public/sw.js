// Minimal service worker — just enough for installability and a usable
// offline/flaky-network fallback, not a full offline-first build. Bump
// CACHE_VERSION on any change here (or trust the browser's own SW update
// check, which polls this file on navigation).
const CACHE_VERSION = 'regrow-v1';
const SHELL_URL = './';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.add(SHELL_URL).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigations (opening/reloading the app): network first, so a real
  // connection always wins, falling back to the cached shell if offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(SHELL_URL, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(SHELL_URL))
    );
    return;
  }

  // Same-origin static assets (hashed JS/CSS/images/fonts): cache-first,
  // filling the cache in the background so a repeat visit or brief network
  // hiccup doesn't blank the app.
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
