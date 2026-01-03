const CACHE_NAME = "ojpass-v1-cache";

const FILES_TO_CACHE = [
  "/OJ-Pass/",
  "/OJ-Pass/index.html",
  "/OJ-Pass/style.css",
  "/OJ-Pass/app.js",
  "/darkmode.js",
  "/icon/icon-192.png",
  "/icon/icon-512.png",
  "OJ-Pass/favicon2.ico"
];

// インストール（キャッシュ登録）
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
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
