const CACHE_NAME = "field-interview-shell-v3";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",

  "./styles/main.css",
  "./styles/base.css",
  "./styles/components.css",
  "./styles/responsive.css",

  "./src/app.js",
  "./src/data/database.js",

  "./src/services/image.js",
  "./src/services/location.js",
  "./src/services/notifications.js",
  "./src/services/service-worker.js",
  "./src/services/storage.js",
  "./src/services/sync.js",

  "./src/ui/dom.js",
  "./src/ui/form.js",
  "./src/ui/history.js",
  "./src/ui/navigation.js",
  "./src/ui/network.js",
  "./src/ui/settings.js",
  "./src/ui/toast.js",

  "./src/utils/date.js",
  "./src/utils/html.js",
  "./src/utils/id.js",

  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }

          return Response.error();
        });
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag !== "sync-interviews") return;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "SYNC_REQUESTED" });
        });
      })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }

        return self.clients.openWindow("./");
      })
  );
});
