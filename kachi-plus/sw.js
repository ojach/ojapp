const CACHE_NAME = "kachi-cache-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./free.html",
  "./juggler.html",
  "./style.css",
  "../icon/icon-180.png",
  "../icon/ojapp-logo.png"
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
