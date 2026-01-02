const CACHE_NAME = "kachi-plus-cache-v1";

const urlsToCache = [
  "/kachi-plus/",
  "/kachi-plus/index.html",
  "/kachi-plus/free.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
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
    caches.match(e.request, { ignoreSearch: true }).then(res => {
      return res || fetch(e.request);
    })
  );
});
