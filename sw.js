const CACHE_NAME = 'hush-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/nostr-tools@2.7.0/lib/nostr.bundle.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
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