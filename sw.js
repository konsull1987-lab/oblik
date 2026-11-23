const C="oblik-v221";const SHELL=["./","index.html","w.html","w-manifest.json","firebase-config.js","manifest.json","icon-192.png"];
// бібліотеки з CDN (Firebase, SheetJS, reCAPTCHA) — версійні, кешуємо надовго, щоб застосунок стартував без інтернету
const LIB="oblik-lib";const LIBRE=/^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdnjs\.cloudflare\.com\/ajax\/libs\/)/;
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=="oblik-share"&&x!==LIB).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
 if(e.request.method==="POST"&&u.pathname.endsWith("/share")){ e.respondWith((async()=>{ try{ const fd=await e.request.formData(), f=fd.get("file"), c=await caches.open("oblik-share");
   if(f&&f.size!==undefined) await c.put("shared-file",new Response(f,{headers:{"content-type":f.type||"application/octet-stream","x-name":encodeURIComponent(f.name||"файл")}}));
   else await c.put("shared-text",new Response(String(fd.get("text")||fd.get("title")||""))) }catch(_){}
   return Response.redirect("./?share=1",303) })()); return }
 if(e.request.method!=="GET") return;
 // CDN-бібліотеки: спершу кеш, інакше мережа (і зберегти)
 if(LIBRE.test(e.request.url)){ e.respondWith(caches.open(LIB).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(n=>{ if(n.ok||n.type==="opaque") c.put(e.request,n.clone()); return n })))); return }
 if(u.origin!==location.origin) return;
 // файли застосунку: миттєво з кешу, а свіжу версію тихо докачуємо — вона відкриється наступного разу
 // сторінка бригади (w.html) ніколи не підміняється застосунком власників
 const home=/\/w\.html$/.test(u.pathname)?"w.html":"index.html";
 e.respondWith(caches.open(C).then(async c=>{ const hit=await c.match(e.request,{ignoreSearch:e.request.mode==="navigate"})||(e.request.mode==="navigate"?await c.match(home):null);
   const net=fetch(e.request,{cache:"no-cache"}).then(r=>{ if(r.ok) c.put(e.request,r.clone()); return r }).catch(()=>null);
   if(hit){ e.waitUntil(net); return hit }
   return (await net)||(await c.match(home))||new Response("Немає інтернету",{status:503}) }))});
self.addEventListener("notificationclick",e=>{e.notification.close(); const job=e.notification.data&&e.notification.data.job;
 e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(l=>{ if(l.length){ if(job) l[0].postMessage({job}); return l[0].focus() } return clients.openWindow(job?"./?job="+job:"./") }))});
