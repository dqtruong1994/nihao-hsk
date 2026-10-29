/**
 * Service Worker Cleaner
 * Tự động dọn dẹp cache cũ và hủy đăng ký Service Worker để tránh lỗi iframe crash
 */
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys.map(key => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});
