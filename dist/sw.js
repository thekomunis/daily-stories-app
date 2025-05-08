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
  let notificationData = {
    title: "Daily Stories App",
    options: {
      body: "Ada pembaruan baru!",
      icon: "/favicon.png",
      badge: "/favicon.png",
    },
  };

  // Parse data jika tersedia
  if (event.data) {
    try {
      const data = event.data.json();

      // Format sesuai skema yang diberikan
      if (data.title) {
        notificationData.title = data.title;
      }

      if (data.options && data.options.body) {
        notificationData.options.body = data.options.body;
      }

      // Tambahkan properti lain jika ada
      if (data.options) {
        notificationData.options = {
          ...notificationData.options,
          ...data.options,
        };
      }
    } catch (error) {
      console.error("Error parsing push data:", error);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Redirect ke halaman beranda saat notifikasi diklik
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Jika ada jendela aplikasi yang terbuka, fokuskan jendela tersebut
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.includes("/daily-stories-app") && "focus" in client) {
            return client.focus();
          }
        }

        // Jika tidak ada jendela yang terbuka, buka jendela baru
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
