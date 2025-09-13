self.addEventListener('install', event => self.skipWaiting());
self.addEventListener('activate', event => clients.claim());

self.addEventListener('fetch', (event) => {
  // very basic offline strategy (cache-first for navigation)
});
