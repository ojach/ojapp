// ================================
// 安全版 Service Worker（iOS対応）
// ================================

const CACHE_NAME = "kachi-plus-v3";

// ※ すべて「ファイル名」まで書く（/dir/ は禁止）
const urlsToCache = [
  "/kachi-plus/index.html",
  "/kachi-plus/free.html",
  "/kachi-plus/juggler.html",
  "/kachi-plus/style.css",
  "/kachi-plus/sw.js",
  "/icon/icon-180.png",
  "/icon/ojapp-logo.png",
  "/icon/favicon-16.png",
  "/icon/favicon-32.png",
];

// ================================
// インストール（初回キャッシュ）
// ================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // すぐ有効化
});

// ================================
// activate（古いキャッシュ削除）
// ================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim(); // 即適用
});

// ================================
// fetch（オフライン対応）
// ================================
//
// ignoreSearch を true にして ?id=xxxx でもキャッシュヒット
// リダイレクトを返さない安全版
//
self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        // 失敗時 fallback：index.html（SPA 安定）
        return caches.match("/kachi-plus/index.html");
      });
    })
  );
});
