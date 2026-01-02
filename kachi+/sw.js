const CACHE_NAME = "kachi-cache-v1";
const urlsToCache = [
  "/kachi+/",
  "/kachi+/index.html",
  "/kachi+/free.html",
  "/kachi+/juggler.html",
  "/kachi+/style.css",
  "/kachi+/app.js",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png"
];

// インストール
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// オフライン対応
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
