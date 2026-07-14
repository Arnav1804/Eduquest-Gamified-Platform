
// service-worker.js
const CACHE_NAME = 'eduquest-v3';
const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './style.css',
  './manifest.json',
  './js/utils.js',
  './js/ui.js',
  './js/dashboard.js',
  './js/app.js',
  './js/games/results.js',
  './js/games/math.js',
  './js/games/science.js',
  './js/games/geometry.js',
  './js/games/physics.js',
  './js/games/memory.js',
  './js/games/launcher.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
