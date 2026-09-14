const CACHE_NAME = "field-interview-shell-v6";

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
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
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
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Không cache API ngoài domain như Google Apps Script
  if (url.origin !== self.location.origin) {
    return;
  }

  // Khi reload trang offline -> trả index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("./index.html", copy);
          });

          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match("./index.html"))
          );
        })
    );

    return;
  }

  // CSS / JS / icon: cache trước, mạng sau
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const copy = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
        }

        return networkResponse;
      });
    })
  );
});