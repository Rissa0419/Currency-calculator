// 中文：快取應用程式核心檔案，讓使用者離線也能開啟介面。
// English: Cache the app shell so the interface remains available offline.
const CACHE='fx-card-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
// 中文：清除舊版快取，避免使用過期的介面檔案。
// English: Remove outdated caches when a new service worker activates.
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
// 中文：只快取同來源的應用程式檔案，匯率 API 由頁面自行處理。
// English: Cache only same-origin app files; the page handles API failures separately.
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
