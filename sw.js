// INCREMENT VERSION to force update
const VERSION = '3.2.3';  // Deep WebSocket debugging
const CACHE_NAME = `hush-v${VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/nostr-tools@2.7.0/lib/nostr.bundle.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/qr-scanner@1.4.2/qr-scanner.umd.min.js'
];

self.addEventListener('install', (event) => {
  console.log(`[Service Worker] Installing version ${VERSION}`);
  // Force new service worker to activate immediately
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log(`[Service Worker] Activating version ${VERSION}`);
  // Delete ALL old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Notify all clients about the update
      return self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATE_AVAILABLE',
            version: VERSION
          });
        });
      });
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first strategy for HTML to ensure updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update cache with new version
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Fall back to cache if offline
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first for other resources
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

// Handle background sync for sending messages when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-hush') {
    event.waitUntil(sendPendingMessages());
  }
});

async function sendPendingMessages() {
  // This could store pending messages in IndexedDB and send them when online
  console.log('Background sync: sending pending messages');
}