const CACHE_NAME = 'inspeksi-v1';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap'
];

// Install — cache aset utama
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — hapus cache lama
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fallback ke cache
self.addEventListener('fetch', function(e){
  // Jangan cache request Firebase (biar data selalu fresh)
  if(e.request.url.includes('firebasedatabase') ||
     e.request.url.includes('firebasejs') ||
     e.request.url.includes('gstatic')){
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(function(res){
        var resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(e.request, resClone);
        });
        return res;
      })
      .catch(function(){
        return caches.match(e.request);
      })
  );
});
