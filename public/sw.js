// Service Worker configuration
const CACHE_NAME = 'tailor-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/manifest.json',
  '/static/css/main.chunk.css', // Note: These static paths might need adjustment based on Vite build output
  '/static/js/main.chunk.js',   // Note: These static paths might need adjustment based on Vite build output
  '/static/js/bundle.js',       // Note: These static paths might need adjustment based on Vite build output
];

// Install a service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate the new service worker immediately
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Don't cache Firebase requests and other external API calls
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebasestorage.googleapis.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('analytics') ||
    event.request.url.includes('api')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If the fetch fails (e.g. offline), show the offline page for HTML requests
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }

            // For image requests, return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/images/placeholder.png');
            }

            // Return nothing for other resource types
            return new Response('', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Update a service worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  // Claim clients so the new service worker takes effect immediately
  self.clients.claim();
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: {
      url: data.url || '/',
    },
    vibrate: [100, 50, 100],
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if there is already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window/tab is already open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  } else if (event.tag === 'sync-orders') {
    event.waitUntil(syncOrders());
  } else if (event.tag === 'sync-measurements') {
    event.waitUntil(syncMeasurements());
  }
});

// Sync functions (will be implemented in separate files)
async function syncMessages() {
  // Implementation will be in a separate file
  console.log('Syncing messages...');
}

async function syncOrders() {
  // Implementation will be in a separate file
  console.log('Syncing orders...');
}

async function syncMeasurements() {
  // Implementation will be in a separate file
  console.log('Syncing measurements...');
}
