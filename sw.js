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
