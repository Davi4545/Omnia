// Service worker mínimo do snapshot Resultados (escopo próprio).
// Cacheia apenas os arquivos que existem nesta pasta.
const CACHE_NAME = 'resultados-snapshot-v1';
const APP_SHELL = ["./", "./index.html", "./app.js", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(APP_SHELL.map(u => c.add(u).catch(() => null))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => { if (e.request.method !== "GET") return; e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, cp)).catch(() => {}); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }))); });
