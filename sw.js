/* ONDIS — service worker de atualização segura. Sem cache de versões CSS/JS desatualizadas. */
const CACHE_NAME = 'ondis-static-20261126-r1';
const SHELL = ['./', './index.html', './login.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE_NAME);
    await Promise.allSettled(SHELL.map(async url=>{
      const res=await fetch(url,{cache:'reload'});
      if(res.ok) await cache.put(url,res);
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k.startsWith('ondis-') && k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  // Nunca devolver HTML no lugar de CSS, JS, imagens, módulos ou chamadas externas.
  const documentReq=req.mode==='navigate';
  event.respondWith((async()=>{
    try{
      const response=await fetch(req,{cache:'no-store'});
      if(response.ok && documentReq){const cache=await caches.open(CACHE_NAME);cache.put(req,response.clone()).catch(()=>{});}
      return response;
    }catch(err){
      if(documentReq){const saved=await caches.match(req);if(saved)return saved;}
      return Response.error();
    }
  })());
});
