/**
 * PWA Installation & Device Management
 * Quản lý cài đặt ứng dụng 你好 HSK lên điện thoại (iOS, Android, Máy tính)
 */
(() => {
  'use strict';

  let deferredPrompt = null;

  function detectOS() {
    const ua = navigator.userAgent || navigator.vendor || window.opera || '';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'desktop';
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwaHeaderInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
    const banner = document.getElementById('pwaHomeBanner');
    if (banner) banner.style.display = 'flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const banner = document.getElementById('pwaHomeBanner');
    if (banner) banner.style.display = 'none';
    const btn = document.getElementById('pwaHeaderInstallBtn');
    if (btn) {
      btn.textContent = '✓ Đã cài App';
      btn.style.opacity = '0.75';
    }
  });

  // Đăng ký Service Worker an toàn cho PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  function openGuideModal(os = detectOS()) {
    let modal = document.getElementById('pwaGuideModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pwaGuideModal';
      modal.className = 'pwa-modal-overlay';
      modal.innerHTML = `
        <div class="pwa-modal-card" role="dialog" aria-modal="true" aria-labelledby="pwaModalTitle">
          <div class="pwa-modal-header">
            <h3 class="pwa-modal-title" id="pwaModalTitle">📲 Cài đặt App về điện thoại</h3>
            <button type="button" class="pwa-close-btn" id="pwaCloseBtn" aria-label="Đóng">✕</button>
          </div>

          <div class="pwa-os-tabs">
            <button type="button" class="pwa-os-tab" data-os="ios">🍎 iPhone / iPad</button>
            <button type="button" class="pwa-os-tab" data-os="android">🤖 Android</button>
            <button type="button" class="pwa-os-tab" data-os="desktop">💻 Máy tính</button>
          </div>

          <div id="pwaTabContent"></div>

          <div class="pwa-benefit-box">
            ✨ <strong>Lợi ích khi cài App:</strong> Mở học toàn màn hình (không vướng thanh duyệt web), truy cập nhanh 1 chạm, tự động lưu bài học và không bị gián đoạn.
          </div>

          <button type="button" class="btn" id="pwaDoneBtn" style="margin-top:16px; width:100%; background:#7c3aed; color:#fff; border:0; padding:12px; border-radius:12px; font-weight:700; cursor:pointer;">
            Đã hiểu & Bắt đầu cài
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => {
        modal.hidden = true;
        modal.classList.add('hidden');
        modal.style.setProperty('display', 'none', 'important');
      };

      document.getElementById('pwaCloseBtn').onclick = closeModal;
      document.getElementById('pwaDoneBtn').onclick = closeModal;
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden && modal.style.display !== 'none') {
          closeModal();
        }
      });

      modal.querySelectorAll('.pwa-os-tab').forEach(tab => {
        tab.onclick = () => renderTab(tab.dataset.os);
      });
    }

    function renderTab(targetOS) {
      modal.querySelectorAll('.pwa-os-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.os === targetOS);
      });

      const content = document.getElementById('pwaTabContent');
      if (targetOS === 'ios') {
        content.innerHTML = `
          <div class="pwa-step-item">
            <div class="pwa-step-num">1</div>
            <div class="pwa-step-text">
              Mở trang này trên trình duyệt <strong>Safari</strong> của iPhone/iPad, sau đó bấm vào nút <strong>Chia sẻ</strong> <span class="pwa-step-highlight">⎋ (Biểu tượng ô vuông có mũi tên trỏ lên)</span> ở thanh dưới cùng màn hình.
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">2</div>
            <div class="pwa-step-text">
              Cuộn menu xuống và chọn dòng <span class="pwa-step-highlight">➕ Thêm vào MH chính</span> (Add to Home Screen).
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">3</div>
            <div class="pwa-step-text">
              Bấm nút <strong>"Thêm" (Add)</strong> ở góc trên bên phải màn hình. Biểu tượng ứng dụng <strong>你好 HSK</strong> sẽ xuất hiện ngay trên màn hình chính!
            </div>
          </div>
        `;
      } else if (targetOS === 'android') {
        content.innerHTML = `
          <div class="pwa-step-item">
            <div class="pwa-step-num">1</div>
            <div class="pwa-step-text">
              Mở trang này trên <strong>Google Chrome</strong> hoặc trình duyệt mặc định trên máy Android.
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">2</div>
            <div class="pwa-step-text">
              Bấm vào biểu tượng <strong>3 dấu chấm ⋮</strong> ở góc trên bên phải màn hình trình duyệt.
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">3</div>
            <div class="pwa-step-text">
              Chọn mục <span class="pwa-step-highlight">📲 Cài đặt ứng dụng</span> hoặc <span class="pwa-step-highlight">➕ Thêm vào Màn hình chính</span>. App sẽ được cài ngay ra ngoài màn hình điện thoại!
            </div>
          </div>
        `;
      } else {
        content.innerHTML = `
          <div class="pwa-step-item">
            <div class="pwa-step-num">1</div>
            <div class="pwa-step-text">
              Trên thanh địa chỉ trình duyệt (Chrome, Edge), tìm biểu tượng <span class="pwa-step-highlight">⊕ Cài đặt</span> ở góc bên phải thanh nhập URL.
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">2</div>
            <div class="pwa-step-text">
              Hoặc bấm vào menu <strong>3 chấm ⋮</strong> ➔ chọn <span class="pwa-step-highlight">Cài đặt 你好 HSK...</span>
            </div>
          </div>
          <div class="pwa-step-item">
            <div class="pwa-step-num">3</div>
            <div class="pwa-step-text">
              Ứng dụng sẽ mở trong một cửa sổ riêng biệt như một phần mềm máy tính độc lập.
            </div>
          </div>
        `;
      }
    }

    renderTab(os);
    modal.hidden = false;
    modal.classList.remove('hidden');
    modal.style.removeProperty('display');
    modal.style.setProperty('display', 'flex', 'important');
  }

  async function install() {
    if (isStandalone()) {
      alert('Bạn đang học trên ứng dụng đã cài đặt!');
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          if (window.Gamification) {
            window.Gamification.confetti?.();
            window.Gamification.addXP?.(15);
          }
          const banner = document.getElementById('pwaHomeBanner');
          if (banner) banner.style.display = 'none';
        }
        deferredPrompt = null;
      } catch {
        openGuideModal();
      }
    } else {
      openGuideModal();
    }
  }

  window.HSKPWA = {
    install,
    openGuide: openGuideModal,
    isStandalone,
    detectOS
  };
})();

