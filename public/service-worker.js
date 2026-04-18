const CACHE_NAME = 'typeforge-static-v2';
const STATIC_ASSETS = new Set([
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]);

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(Array.from(STATIC_ASSETS))),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('typeforge-')) {
            return caches.delete(cacheName);
          }

          return Promise.resolve();
        }),
      ).then(() => self.clients.claim()),
    ),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) return;
  if (url.pathname.startsWith('/_next/')) return;
  if (url.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/')),
    );
    return;
  }

  if (!STATIC_ASSETS.has(url.pathname) && !url.pathname.startsWith('/media/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone).catch(() => undefined);
        });

        return networkResponse;
      });
    }),
  );
});
