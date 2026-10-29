const CACHE_NAME = 'nihao-hsk-cache-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/site.css',
  '/site.js',
  '/auth.js',
  '/data-store.js',
  '/dictionary.js',
  '/learner-sync.js',
  '/gamification.js',
  '/hanzi-canvas.js',
  '/srs-engine.js',
  '/enhancements.css',
  '/favicon.svg',
  '/course.css',
  '/chinese-audio.css',
  '/chinese-audio.js',
  '/pinyin-audio.js',
  '/course-ui.js',
  '/textbook-dialogues.css',
  '/textbook-dialogues.js',
  '/hsk1.html',
  '/hsk1-textbook-dialogues.json',
  '/hsk2.html',
  '/hsk2-textbook-dialogues.json',
  '/hsk3.html',
  '/hsk3.css',
  '/hsk3.js',
  '/hsk3-lessons.json',
  '/admin.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Dùng Promise.allSettled để không bị crash nếu 1 file redirect hoặc lỗi
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          fetch(url, { redirect: 'follow' })
            .then(res => {
              if (res.ok) return cache.put(url, res);
            })
            .catch(() => {})
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Trên môi trường local dev (localhost/127.0.0.1): Không can thiệp để tránh xung đột
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // Bỏ qua các API serverless
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cập nhật ngầm (Stale-While-Revalidate) với clone an toàn
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(err => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || new Response('Offline', { status: 503 });
        }
        throw err;
      });
    })
  );
});
