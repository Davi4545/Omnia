const CACHE_NAME = "ondis-shell-v2026-08-crm-arena-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./login.html",
  "./ondis-premium.css",
  "./ondis-premium.js",
  "./crm.html",
  "./crm-completo.html",
  "./crm-completo.css",
  "./crm-completo.js",
  "./assets/ondis-abertura.mp4",
  "./assets/ondis-abertura-poster.jpg",
  "./assets/arena-bau-3d.png",
  "./assets/astronauta-foguete-3d.png",
  "./assets/foguete-vendedor-3d.png",
  "./assets/espaco-ranking.jpg",
  "./assets/lua-3d.png",
  "./assets/plutao-3d.png",
  "./assets/lua-realista-3d.png",
  "./assets/marte-3d.png",
  "./assets/saturno-3d.png",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return response;
      })
      .catch(() => caches.match(event.request,{ignoreSearch:true}).then(response => response || caches.match("./login.html")))
  );
});
