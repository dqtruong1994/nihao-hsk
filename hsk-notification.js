/**
 * NiHao HSK - Little Cat Mascot (小猫) & Chinese Learning Notification Engine
 * - Linh vật chính thức: Tiểu Miêu (小猫 🐱) - Chú mèo đen mắt hổ phách thông minh đáng yêu
 * - Icon thông báo: Chú mèo ngắm trăng (cat-moon) & Chú mèo con đáng yêu (cat-cute)
 * - Thông điệp chủ đạo: "小猫 nhắc bạn học tiếng Trung"
 * - Tự động kiểm tra: Nếu vào web chưa bật thông báo -> Hiển thị banner gợi ý trang nhã
 * - Đẩy thông báo ra màn hình khóa điện thoại (PWA / Android / iOS) và desktop
 * - Tương thích hoàn toàn ngược với window.HSKNotification và window.DuoNotification
 */
(() => {
  'use strict';

  const STORAGE_NOTIF_ENABLED = 'hsk_duo_notif_enabled';
  const STORAGE_NOTIF_TIME = 'hsk_duo_notif_time'; // Mặc định '20:00'
  const STORAGE_LAST_REMIND_DATE = 'hsk_duo_last_remind_date';
  const STORAGE_PROMPT_DISMISSED = 'hsk_cat_prompt_dismissed';
  const STORAGE_PROMPT_LAST_TIME = 'hsk_cat_prompt_last_dismissed';

  // 1. HÌNH ẢNH LINH VẬT TIỂU MIÊU (小猫)
  const CAT_IMAGES = {
    cute: 'cat-cute.png',
    moon: 'cat-moon.png',
    icon: 'cat-notif-icon.png',
    happy: 'cat-cute.png',
    sad: 'cat-cute.png',
    pleading: 'cat-cute.png',
    streak: 'cat-moon.png',
    reminder: 'cat-cute.png'
  };

  // 2. ÂM THANH NGŨ CUNG & TIẾNG CHUÔNG MÈO ĐÁNG YÊU (CHINESE PENTATONIC & FELINE CHIME)
  function playChineseSound(type = 'chime') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'chime' || type === 'happy' || type === 'cute') {
        // Thang âm Ngũ cung Cung (C5) - Thương (D5) - Giốc (E5) - Chủy (G5) - Vũ (A5)
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.07;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0, noteStart);
          gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.4);
        });
      } else if (type === 'sad' || type === 'pleading') {
        // Giai điệu nũng nịu gọi bạn học
        const notes = [440.00, 392.00, 329.63, 293.66];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.12;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.18, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.38);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.45);
        });
      } else if (type === 'streak') {
        // Tiếng khánh rực rỡ ăn mừng chuỗi ngày
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.06;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.2, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.32);
        });
      }
    } catch {}
  }

  // 3. TỰ ĐỘNG KIỂM TRA & HIỂN THỊ BANNER GỢI Ý BẬT THÔNG BÁO CHO USER
  let promptBannerEl = null;

  function showPromptBanner() {
    if (promptBannerEl) {
      promptBannerEl.classList.add('show');
      return;
    }

    promptBannerEl = document.createElement('div');
    promptBannerEl.className = 'panda-prompt-banner cat-prompt-banner';
    promptBannerEl.id = 'catPromptBanner';
    promptBannerEl.innerHTML = `
      <div class="panda-prompt-avatar cat-prompt-avatar">
        <img src="cat-cute.png" class="cat-prompt-avatar-img" alt="小猫" />
      </div>
      <div class="panda-prompt-content">
        <div class="panda-prompt-title">
          <span>🐱 小猫 nhắc bạn học tiếng Trung</span>
        </div>
        <p class="panda-prompt-desc">
          Bật thông báo để được Tiểu Miêu (小猫) nhắc nhở 5 phút ôn từ vựng & luyện phát âm HSK mỗi ngày, không sợ quên bài nhé! 🐾
        </p>
        <div class="panda-prompt-actions">
          <button type="button" class="panda-btn-allow cat-btn-allow" id="btnCatAllow">
            🏮 Bật thông báo ngay
          </button>
          <button type="button" class="panda-btn-dismiss" id="btnCatDismiss">
            Để sau
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(promptBannerEl);

    setTimeout(() => {
      promptBannerEl.classList.add('show');
      playChineseSound('chime');
    }, 100);

    // Xử lý nút Bật thông báo
    document.getElementById('btnCatAllow').onclick = async () => {
      promptBannerEl.classList.remove('show');
      const granted = await requestNotificationPermission();
      if (granted) {
        if (window.HSKAudioFX?.confetti) window.HSKAudioFX.confetti(80);
        showToast('🎉 Hoan nghênh bạn!', 'Tiểu Miêu (小猫) đã sẵn sàng đồng hành và nhắc bạn học đúng giờ mỗi ngày! 🐾🏮', 'happy');
      }
    };

    // Xử lý nút Để sau
    document.getElementById('btnCatDismiss').onclick = () => {
      promptBannerEl.classList.remove('show');
      sessionStorage.setItem(STORAGE_PROMPT_DISMISSED, 'true');
      localStorage.setItem(STORAGE_PROMPT_LAST_TIME, String(Date.now()));
    };
  }

  function checkNotificationOnVisit() {
    if (!('Notification' in window)) return;

    // Đã bật rồi thì không cần hỏi lại
    if (Notification.permission === 'granted') return;

    // Đã từ chối trong browser settings thì tôn trọng người dùng
    if (Notification.permission === 'denied') return;

    // Đã đóng trong phiên làm việc này
    if (sessionStorage.getItem(STORAGE_PROMPT_DISMISSED)) return;

    // Đã bấm để sau trong vòng 24 giờ qua
    const lastDismissed = parseInt(localStorage.getItem(STORAGE_PROMPT_LAST_TIME) || '0', 10);
    if (Date.now() - lastDismissed < 24 * 60 * 60 * 1000) return;

    // Đợi 3.5 giây sau khi mở trang để người dùng nắm bắt nội dung trước
    setTimeout(showPromptBanner, 3500);
  }

  // 4. POPUP MODAL TIỂU MIÊU (小猫)
  let overlayEl = null;

  function ensureModalDOM() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.className = 'panda-popup-overlay cat-popup-overlay';
    overlayEl.id = 'catPopupOverlay';
    overlayEl.innerHTML = `
      <div class="panda-card cat-card" id="catCard">
        <button type="button" class="panda-close-btn" id="catCloseBtn" aria-label="Đóng">✕</button>
        <div class="panda-mascot-wrapper cat-mascot-wrapper" id="catMascotContainer">
          <img src="cat-cute.png" class="cat-mascot-img" id="catMascotImg" alt="小猫" />
          <div class="panda-seal-badge cat-seal-badge" id="catSealBadge">小猫</div>
        </div>
        <div class="panda-bubble cat-bubble">
          <h3 class="panda-title" id="catTitle">🐱 小猫 nhắc bạn học tiếng Trung</h3>
          <p class="panda-message" id="catMessage">
            Khổng Tử từng dạy: "Học mà ôn lại, chẳng vui lắm sao?" (学而时习之). Hãy dành 5 phút hôm nay cùng Tiểu Miêu (小猫) ôn từ vựng tích luỹ thêm 50 XP nhé! 🐾
          </p>
        </div>
        <div class="panda-stats-row" id="catStatsRow">
          <div class="panda-stat-pill streak" id="catStatStreak">
            <span>🔥</span> <span id="catStatStreakVal">1 ngày</span>
          </div>
          <div class="panda-stat-pill xp" id="catStatXP">
            <span>⭐</span> <span id="catStatXPVal">0 / 50 XP</span>
          </div>
        </div>
        <div class="panda-actions">
          <button type="button" class="panda-btn panda-btn-primary cat-btn-primary" id="catActionPrimary">
            🏮 VÀO HỌC CÙNG 小猫
          </button>
          <button type="button" class="panda-btn panda-btn-secondary" id="catActionSecondary">
            ⏰ NHẮC TÔI SAU 10 PHÚT
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    overlayEl.querySelector('#catCloseBtn').onclick = hidePopup;
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) hidePopup();
    });

    return overlayEl;
  }

  function showPopup(options = {}) {
    ensureModalDOM();

    const mood = options.mood || 'cute';
    const title = options.title || '🐱 小猫 nhắc bạn học tiếng Trung';
    const message = options.message || 'Mỗi ngày 5 phút tích tiểu thành đại. Cùng Tiểu Miêu (小猫) chinh phục HSK thật vững vàng nhé! 🐾';
    const primaryText = options.primaryText || '🏮 VÀO HỌC CÙNG 小猫';
    const primaryColor = options.primaryColor || (mood === 'streak' ? 'panda-btn-orange' : 'panda-btn-primary');
    const sealText = options.sealText || (mood === 'streak' ? '必胜' : (mood === 'sad' || mood === 'pleading' ? '想你' : '小猫'));

    const mascotBox = document.getElementById('catMascotContainer');
    const imgSrc = CAT_IMAGES[mood] || CAT_IMAGES.cute;
    if (mascotBox) {
      mascotBox.innerHTML = `
        <img src="${imgSrc}" class="cat-mascot-img ${mood === 'streak' ? 'moon-mode' : ''}" id="catMascotImg" alt="小猫" />
        <div class="panda-seal-badge cat-seal-badge" id="catSealBadge">${sealText}</div>
      `;
    }

    const titleEl = document.getElementById('catTitle');
    if (titleEl) titleEl.innerHTML = title;

    const msgEl = document.getElementById('catMessage');
    if (msgEl) msgEl.innerHTML = message;

    const streak = parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);
    const today = new Date().toISOString().slice(0, 10);
    const xp = parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
    const targetXP = parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);

    const streakVal = document.getElementById('catStatStreakVal');
    if (streakVal) streakVal.textContent = `${streak} ngày liên tiếp`;

    const xpVal = document.getElementById('catStatXPVal');
    if (xpVal) xpVal.textContent = `${xp} / ${targetXP} XP`;

    const btnPrimary = document.getElementById('catActionPrimary');
    btnPrimary.className = `panda-btn ${primaryColor} cat-btn-primary`;
    btnPrimary.textContent = primaryText;
    btnPrimary.onclick = () => {
      hidePopup();
      if (typeof options.onPrimary === 'function') {
        options.onPrimary();
      } else {
        const lastCourse = localStorage.getItem('hskLastCourse') || 'hsk1';
        window.location.hash = '#' + lastCourse;
      }
    };

    const btnSecondary = document.getElementById('catActionSecondary');
    btnSecondary.onclick = () => {
      hidePopup();
      showToast('⏰ Đã hẹn nhắc lại', 'Tiểu Miêu (小猫) sẽ nhắc bạn lại sau ít phút nữa nhé! 🐾', 'reminder');
    };

    overlayEl.classList.add('active');
    playChineseSound(mood);

    if (mood === 'streak' && window.HSKAudioFX?.confetti) {
      setTimeout(() => window.HSKAudioFX.confetti(60), 150);
    }
  }

  function hidePopup() {
    if (overlayEl) overlayEl.classList.remove('active');
  }

  // 5. TOAST THÔNG BÁO GÓC MÀN HÌNH (TIỂU MIÊU)
  let toastEl = null;
  let toastTimer = null;

  function showToast(title, body, mood = 'cute', duration = 5000) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'panda-toast cat-toast';
      toastEl.id = 'catToast';
      document.body.appendChild(toastEl);
    }

    const imgSrc = CAT_IMAGES[mood] || CAT_IMAGES.cute;
    toastEl.innerHTML = `
      <div class="panda-toast-mascot cat-toast-mascot">
        <img src="${imgSrc}" class="cat-toast-img" alt="小猫" />
      </div>
      <div class="panda-toast-content">
        <h4 class="panda-toast-title">${title || '🐱 小猫 nhắc bạn học tiếng Trung'}</h4>
        <p class="panda-toast-body">${body}</p>
      </div>
      <button type="button" class="panda-toast-close" onclick="this.parentElement.classList.remove('show')">✕</button>
    `;

    setTimeout(() => toastEl.classList.add('show'), 50);
    playChineseSound(mood);

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // 6. THÔNG BÁO HỆ THỐNG TRÌNH DUYỆT (WEB PUSH ĐẨY RA MÀN HÌNH NGOÀI VÀ MÀN HÌNH KHÓA ĐIỆN THOẠI)
  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      alert('Trình duyệt của bạn hiện chưa hỗ trợ tính năng Web Notification.');
      return false;
    }

    if (Notification.permission === 'granted') {
      localStorage.setItem(STORAGE_NOTIF_ENABLED, 'true');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem(STORAGE_NOTIF_ENABLED, 'true');
        showToast('🎉 Đã kích hoạt thông báo!', 'Tiểu Miêu (小猫) sẽ đồng hành và nhắc học mỗi ngày cùng bạn! 🐾🏮', 'happy');
        return true;
      }
    }

    return false;
  }

  function sendDesktopNotification(title, body, options = {}) {
    const finalTitle = title || '🐱 小猫 nhắc bạn học tiếng Trung';
    const finalBody = body || 'Tiểu Miêu (小猫) đang đợi bạn nè! Hãy dành 5 phút hoàn thành 1 bài học hôm nay nhé! 🐾';

    if (!('Notification' in window) || Notification.permission !== 'granted') {
      showPopup({
        title: finalTitle,
        message: finalBody,
        mood: options.mood || 'reminder'
      });
      return;
    }

    try {
      const notifOptions = {
        body: finalBody,
        icon: 'cat-notif-icon.png',
        badge: 'cat-notif-icon.png',
        image: 'cat-cute.png',
        vibrate: [200, 100, 200],
        tag: 'hsk-cat-notification',
        renotify: true,
        silent: false,
        data: { url: window.location.origin },
        actions: [
          { action: 'study', title: '🏮 Vào học ngay' },
          { action: 'later', title: '⏰ Để sau' }
        ]
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(finalTitle, notifOptions);
        });
      } else {
        const notif = new Notification(finalTitle, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
      playChineseSound(options.mood || 'chime');
    } catch {
      showPopup({ title: finalTitle, message: finalBody, mood: options.mood || 'reminder' });
    }
  }

  // 7. LINH VẬT TIỂU MIÊU NỔI Ở GÓC PHẢI DƯỚI (FLOATING WIDGET)
  function initFloatingWidget() {
    if (document.getElementById('catFloatingWidget')) return;

    const widget = document.createElement('div');
    widget.className = 'panda-floating-widget cat-floating-widget';
    widget.id = 'catFloatingWidget';
    widget.innerHTML = `
      <div class="panda-floating-hint cat-floating-hint" id="catFloatingHint" onclick="window.HSKNotification.openControlCard()">
        🐱 <span>小猫 nhắc học</span>
      </div>
      <button type="button" class="panda-floating-btn cat-floating-btn" id="catFloatingBtn" title="小猫 nhắc bạn học tiếng Trung" aria-label="小猫 nhắc bạn học tiếng Trung">
        <img src="cat-notif-icon.png" class="cat-floating-icon" alt="小猫" />
        <span class="panda-floating-badge" id="catFloatingBadge">!</span>
      </button>
    `;

    document.body.appendChild(widget);

    document.getElementById('catFloatingBtn').onclick = () => {
      openControlCard();
    };
  }

  // Bảng điều khiển lịch nhắc học & test thông báo Tiểu Miêu (小猫)
  function openControlCard() {
    const isGranted = 'Notification' in window && Notification.permission === 'granted';
    const notifTime = localStorage.getItem(STORAGE_NOTIF_TIME) || '20:00';

    showPopup({
      title: '🐱 Cài đặt Nhắc học cùng 小猫',
      mood: 'reminder',
      sealText: '小猫',
      message: `
        <div style="font-size:13.5px; line-height:1.6; color:#475569;">
          Nhận thông báo màn hình mỗi ngày từ <b>Tiểu Miêu (小猫)</b> để không bao giờ bỏ lỡ buổi học tiếng Trung:
          <div style="margin: 12px 0; background: #ffffff; border: 2px solid #fed7aa; border-radius: 12px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <span>🔔 Thông báo màn hình:</span>
            <b>${isGranted ? '🟢 Đã cấp quyền' : '🔴 Chưa cấp quyền'}</b>
          </div>
          <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
            <label style="font-weight:700;">⏰ Giờ nhắc hàng ngày:</label>
            <input type="time" id="catConfigTime" value="${notifTime}" style="padding:6px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:700;">
          </div>
        </div>
      `,
      primaryText: isGranted ? '🧪 GỬI THỬ THÔNG BÁO NGAY' : '🏮 BẬT THÔNG BÁO TIỂU MIÊU',
      onPrimary: async () => {
        const timeInput = document.getElementById('catConfigTime');
        if (timeInput) localStorage.setItem(STORAGE_NOTIF_TIME, timeInput.value || '20:00');

        if (!isGranted) {
          const ok = await requestNotificationPermission();
          if (ok) {
            triggerSampleNotification();
          }
        } else {
          triggerSampleNotification();
        }
      }
    });
  }

  // 8. CÁC MẪU CÂU THÔNG BÁO TIỂU MIÊU (小猫) ĐẬM CHẤT HÁN NGỮ
  const CAT_MESSAGES = [
    {
      mood: 'cute',
      title: '🐱 小猫 nhắc bạn học tiếng Trung',
      body: 'Khổng Tử từng dạy "Ôn cố nhi tri tân". Hôm nay bạn chưa ghé học, Tiểu Miêu (小猫) đang đợi bạn nè! Mau vào học nhé! 🐾'
    },
    {
      mood: 'streak',
      title: '🔥 小猫 nhắc bạn học tiếng Trung',
      body: 'Ngọn lửa chăm chỉ đang bừng sáng! Chỉ 5 phút cùng Tiểu Miêu (小猫) hoàn thành 1 bài để giữ vững chuỗi ngày nhé! 🐾'
    },
    {
      mood: 'reminder',
      title: '🏮 小猫 nhắc bạn học tiếng Trung',
      body: 'Đã đến giờ luyện khẩu ngữ HSK! Dành 5 phút luyện phát âm AI cùng Tiểu Miêu (小猫) ngay bây giờ nhé! 🚀'
    },
    {
      mood: 'happy',
      title: '⭐ 小猫 nhắc bạn học tiếng Trung',
      body: 'Chỉ còn thiếu một chút nữa là hoàn thành mục tiêu ngày. Cùng Tiểu Miêu (小猫) học bài và tích luỹ 50 XP nào! 🎉'
    }
  ];

  function triggerSampleNotification() {
    const randomMsg = CAT_MESSAGES[Math.floor(Math.random() * CAT_MESSAGES.length)];
    sendDesktopNotification(randomMsg.title, randomMsg.body, { mood: randomMsg.mood });
    showToast(randomMsg.title, randomMsg.body, randomMsg.mood, 6000);
  }

  // 9. BỘ ĐẾM HẸN GIỜ TỰ ĐỘNG
  function checkDailyReminderSchedule() {
    const today = new Date().toISOString().slice(0, 10);
    const lastReminded = localStorage.getItem(STORAGE_LAST_REMIND_DATE);
    if (lastReminded === today) return;

    const targetTime = localStorage.getItem(STORAGE_NOTIF_TIME) || '20:00';
    const [targetHour, targetMinute] = targetTime.split(':').map(n => parseInt(n, 10));

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
      const todayXP = parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
      const targetXP = parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);

      if (todayXP < targetXP) {
        localStorage.setItem(STORAGE_LAST_REMIND_DATE, today);
        triggerSampleNotification();
      }
    }
  }

  // Khởi động
  function boot() {
    initFloatingWidget();
    checkNotificationOnVisit();
    setInterval(checkDailyReminderSchedule, 15 * 60 * 1000);
    setTimeout(checkDailyReminderSchedule, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // API xuất ra toàn cục
  const HSKNotificationAPI = {
    showPopup,
    hidePopup,
    showToast,
    requestPermission: requestNotificationPermission,
    sendNotification: sendDesktopNotification,
    openControlCard,
    test: triggerSampleNotification,
    checkOnVisit: checkNotificationOnVisit,
    images: { ...CAT_IMAGES }
  };

  window.HSKNotification = HSKNotificationAPI;
  // Giữ alias tương thích
  window.DuoNotification = HSKNotificationAPI;
})();
