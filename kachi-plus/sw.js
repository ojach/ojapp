const CACHE = "kachi-plus-v11";

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

// インストール（キャッシュ登録）
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// フェッチ（キャッシュ優先）
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((res) => {
      return res || fetch(evt.request);
    })
  );
});

