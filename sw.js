const C="oblik-v119";const SHELL=["./","index.html","firebase-config.js","manifest.json","icon-192.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=="oblik-share").map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
 if(e.request.method==="POST"&&u.pathname.endsWith("/share")){ e.respondWith((async()=>{ try{ const fd=await e.request.formData(), f=fd.get("file"), c=await caches.open("oblik-share");
   if(f&&f.size!==undefined) await c.put("shared-file",new Response(f,{headers:{"content-type":f.type||"application/octet-stream","x-name":encodeURIComponent(f.name||"файл")}}));
   else await c.put("shared-text",new Response(String(fd.get("text")||fd.get("title")||""))) }catch(_){}
   return Response.redirect("./?share=1",303) })()); return }if(e.request.method!=="GET"||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request,{cache:"no-cache"}).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>l.length?l[0].focus():clients.openWindow("./")))});
