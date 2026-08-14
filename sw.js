const CACHE_NAME='ondis-app-v12.2-retail-os';
const APP_SHELL = [
  "./", "./index.html", "./assets/ondis-abertura.mp4", "./assets/ondis-abertura-poster.jpg",
  "./assets/liga/trophy-3d.png",
  "./assets/liga/reward-chest.png",
  "./assets/liga/badges/day-goal.png", "./assets/liga/badges/week-goal.png", "./assets/liga/badges/month-goal.png",
  "./assets/liga/badges/combo-master.png", "./assets/liga/badges/pa-bronze.png", "./assets/liga/badges/pa-silver.png",
  "./assets/liga/badges/pa-gold.png", "./assets/liga/badges/ticket-silver.png", "./assets/liga/badges/ticket-gold.png",
  "./assets/liga/badges/ticket-supreme.png", "./assets/liga/badges/sale-top.png", "./assets/liga/badges/sale-respect.png",
  "./assets/liga/badges/big-sale.png", "./assets/liga/badges/biggest-sale.png", "./assets/liga/badges/top-conv.png",
  "./assets/liga/badges/magic-5.png", "./assets/liga/badges/supreme-12.png", "./assets/liga/badges/reward-chest.png",
 "./login.html", "./liga-ondis.html", "./liga-ondis.css", "./liga-ondis.js",
  "./ondis-premium.css", "./ondis-premium.js", "./crm.html", "./crm-completo.html", "./crm-completo.css", "./crm-completo.js",
  "./catalogo.html", "./caixa.html", "./frente-loja.html", "./comissao.html", "./ponto.html", "./admin.html", "./superadmin.html", "./ondis-v10.css", "./ondis-v10.js", "./ondis-v11.css", "./ondis-v11.js", "./retail-os.css", "./retail-os.js", "./compras-inteligentes.html", "./collections.html", "./marketing.html", "./fidelidade.html", "./equipe-360.html", "./auditoria.html", "./omnichannel.html", "./autopilot.html", "./manifest.json", "./icon-192.png", "./icon-512.png"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>Promise.all(APP_SHELL.map(url=>cache.add(url).catch(()=>null)))));self.skipWaiting()});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)).catch(()=>{});return response}).catch(()=>caches.match(event.request,{ignoreSearch:true}).then(response=>response||caches.match("./login.html"))))});
