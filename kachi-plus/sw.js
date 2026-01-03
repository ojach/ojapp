const CACHE_NAME = "kachi-plus-v5";

const urlsToCache = [
  "/kachi-plus/",
  "/kachi-plus/index.html",
  "/kachi-plus/free/",
  "/kachi-plus/juggler/",
  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png"
];

// install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      // キャッシュがあれば返す
      if (cacheRes) return cacheRes;

      // キャッシュがない場合は fetch
      return fetch(event.request).catch(() => {
        // fetch エラー（外部 JS など）は無視（何も返さない）
        return new Response("", { status: 200 });
      });
    })
  );
});


