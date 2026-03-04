const CACHE = 'hanzi-flash-v2';
const ASSETS = [
  '/hanzi-flash/',
  '/hanzi-flash/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // Network first para HTML e manifest (sempre busca do servidor primeiro)
  if (url.pathname.endsWith('index.html') || url.pathname.endsWith('manifest.json') || url.pathname === '/hanzi-flash/') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          caches.open(CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  
  // Cache first para assets estáticos
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
