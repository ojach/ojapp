const CACHE_NAME = "kachi-plus-final-v1";

const urlsToCache = [
  "/kachi-plus/index.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/free",
  "/kachi-plus/style.css",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png",
  "/darkmode.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheRes) => {
      return cacheRes || fetch(event.request).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("/kachi-plus/index.html");
        }
        return new Response("", { status: 200 });
      });
    })
  );
});
