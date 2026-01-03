const CACHE = "kachi-plus-v11";

const FILES = [
  "/kachi-plus/",
  "/kachi-plus/index.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/free/index.html",

  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
  "/darkmode.js",

  "/icon/icon-180.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png"
];

// -------- Install --------
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

// -------- Fetch --------
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      if (res) return res;

      return fetch(e.request).catch(() => {
        // オフライン時のフォールバック
        if (e.request.destination === "document") {
          // 各ページに対応
          if (e.request.url.includes("/free/")) {
            return caches.match("/kachi-plus/free/index.html");
          }
          if (e.request.url.includes("juggler")) {
            return caches.match("/kachi-plus/juggler.html");
          }
          return caches.match("/kachi-plus/index.html");
        }
        return new Response("", { status: 200 });
      });
    })
  );
});

