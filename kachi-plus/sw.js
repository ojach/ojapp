const CACHE = "kachi-plus-v13";

const FILES = [
  "/kachi-plus/",
  "/kachi-plus/free/",
  "/kachi-plus/juggler/",
  "/kachi-plus/index.html",
  "/kachi-plus/free/index.html",
  "/kachi-plus/juggler.html",
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
    caches.open(CACHE).then(async c => {
      for (const url of FILES) {
        try {
          const res = await fetch(url, { redirect: "manual" });

          // ❌ リダイレクトはキャッシュしない
          if (res.type === "opaqueredirect" || res.redirected) {
            console.warn("skip redirected:", url);
            continue;
          }

          if (res.ok) {
            await c.put(url, res.clone());
            console.log("cached:", url);
          }
        } catch (err) {
          console.warn("skip (error):", url, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return (
        res ||
        fetch(e.request).catch(() =>
          caches.match("/kachi-plus/index.html")
        )
      );
    })
  );
});
