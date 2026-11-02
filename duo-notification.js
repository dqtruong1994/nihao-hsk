// Backward compatibility: forward to hsk-notification.js
if (typeof window !== 'undefined' && !window.HSKNotification) {
  const s = document.createElement('script');
  s.src = 'hsk-notification.js';
  s.defer = true;
  document.head.appendChild(s);
}
