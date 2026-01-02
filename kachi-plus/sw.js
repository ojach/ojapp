const CACHE_NAME = "kachi-plus-v1";

const urlsToCache = [
  "/kachi-plus/",
  "/kachi-plus/index.html",
  "/kachi-plus/free.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/style.css",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png"
];


// install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
