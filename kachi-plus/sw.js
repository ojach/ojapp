const CACHE_NAME = "kachi-plus-v8";

// キャッシュしたいファイル
const urlsToCache = [
  "/kachi-plus/",
  "/kachi-plus/index.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/free/index.html",
  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png",
  "/darkmode.js"
];

// ========= Install =========
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of urlsToCache) {
        try {
          const res = await fetch(url, { redirect: "manual" });

          // ▼ 301/302 など "redirected" を絶対キャッシュしない
          if (!res.redirected && res.status === 200) {
            await cache.put(url, res.clone());
          }
        } catch (e) {
          // オフラインなどは無視
          console.warn("skip caching:", url);
        }
      }
    })
  );
  self.skipWaiting();
});

// ========= Activate =========
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    )
  );
  self.clients.claim();
});

// ========= Fetch =========
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).catch(() => {
        // fetch できないとき（オフライン）
        if (event.request.mode === "navigate") {
          return caches.match("/kachi-plus/index.html");
        }
        return new Response("", { status: 200 });
      });
    })
  );
});
