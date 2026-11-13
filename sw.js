// Offline support. Pages: network first, so updates show up immediately; cache is the fallback offline.
// Images/fonts: cache first.
const CACHE = "color-wheel-v13";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const isPage = e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/") || url.pathname.endsWith(".webmanifest");
  if (isPage) {
    e.respondWith(fetch(e.request, {cache: "no-store"}).then(res => {
      const copy = res.clone(); if (res.ok) caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
    }).catch(() => caches.match(e.request).then(h => h || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    const copy = res.clone();
    if (res.ok && (url.origin === self.location.origin || url.hostname.includes("fonts.g"))) caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  })));
});
