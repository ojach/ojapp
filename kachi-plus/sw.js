const CACHE_NAME = "kachi-plus-v6";

const urlsToCache = [
  "/kachi-plus/index.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/free/",
  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png",
  "/darkmode.js"
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

// fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cacheRes => {
      if (cacheRes) {
        return cacheRes; // キャッシュにある → 即返す
      }

      return fetch(event.request).catch(err => {
        // オフラインでページ系を取得したときのみ fallback
        if (event.request.mode === "navigate") {
          return caches.match("/kachi-plus/juggler.html");
        }

        // 画像・CSS・JSなどは何も返さない
        return new Response("", { status: 200 });
      });
    })
  );
});
