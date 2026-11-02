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
  if (event.action === 'later') {
    return;
  }
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

// Xử lý sự kiện Push nhận từ server (khi điện thoại khóa màn hình hoặc tắt hẳn app)
self.addEventListener('push', event => {
  let data = {
    title: '🐼 Gấu Trúc NiHao nhắc học bài!',
    body: 'Đừng để tắt ngọn lửa chuỗi ngày học hôm nay nhé! 5 phút luyện từ vựng cùng Gấu Trúc nào! 🏮🔥',
    icon: 'favicon.svg',
    badge: 'favicon.svg'
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'favicon.svg',
    badge: data.badge || 'favicon.svg',
    vibrate: [200, 100, 200],
    tag: 'hsk-panda-notification',
    renotify: true,
    data: { url: data.url || '/' },
    actions: [
      { action: 'study', title: '🏮 Vào học ngay' },
      { action: 'later', title: '⏰ Để sau' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});
