const CACHE_NAME = "daily-stories-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/scripts/index.js",
  "/scripts/navigation.js",
  "/styles.css",
  "/leaflet.css",
  "/favicon.png",
  "https://story-api.dicoding.dev/v1/stories",
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch Strategy - Cache First, Network Fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return the response from the cached version
      if (response) {
        return response;
      }

      // Not in cache - return the result from the live server
      // Clone the request because it's a one-time use
      return fetch(event.request.clone()).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone the response because it's a one-time use
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          // Add the request/response pair to the cache
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Listen for push notification events
self.addEventListener("push", (event) => {
  let title = "Daily Stories App";
  let options = {
    body: "New Story Alert!",
    icon: "/favicon.png",
    badge: "/favicon.png",
  };

  if (event.data) {
    const payload = event.data.json();
    title = payload.title || title;
    options.body = payload.message || options.body;
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow("/"));
});
