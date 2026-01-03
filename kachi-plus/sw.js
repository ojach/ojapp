const CACHE = "kachi-plus-v10";

const FILES = [
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

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res =>
      res || fetch(e.request).catch(() => caches.match("/kachi-plus/index.html"))
    )
  );
});

