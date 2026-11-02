/**
 * Service Worker for 你好 HSK PWA
 * Hỗ trợ cài đặt ứng dụng PWA mà không can thiệp lỗi iframe con
 */
const CACHE_NAME = 'nihao-hsk-pwa-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Chỉ xử lý các yêu cầu không phải điều hướng iframe
  if (event.request.mode === 'navigate') {
    return;
  }
});

// Xử lý khi người dùng nhấn vào thông báo màn hình Duolingo
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) { client = clientList[i]; break; }
        }
        return client.focus();
      }
      return self.clients.openWindow('/');
    })
  );
});
