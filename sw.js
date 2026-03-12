const CACHE_NAME = 'paise-premium-v2';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './settings.html',
  './logo.png',
  './manifest.json'
];

// 1. Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Serve Files from Cache (Offline Support)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});