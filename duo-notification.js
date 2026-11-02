/**
 * Duolingo-style Pop-up & Web Notification Engine
 * - Hỗ trợ thông báo popup linh vật Cú Duo nổi bật ngay trong trang web
 * - Hỗ trợ Web Push Notification đẩy trực tiếp ra màn hình khóa / desktop / mobile
 * - Tự động phát âm thanh Chime đặc trưng và nhắc nhở giữ chuỗi ngày học (Streak)
 */
(() => {
  'use strict';

  const STORAGE_NOTIF_ENABLED = 'hsk_duo_notif_enabled';
  const STORAGE_NOTIF_TIME = 'hsk_duo_notif_time'; // Mặc định '20:00'
  const STORAGE_LAST_REMIND_DATE = 'hsk_duo_last_remind_date';

  // 1. DUOLINGO OWL MASCOT SVG GRAPHICS (VECTƠ CHÍNH XÁC & ĐÁNG YÊU)
  const DUO_SVGS = {
    // Cú Duo vui vẻ vẫy cánh
    happy: `
      <svg class="duo-owl-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="62" r="44" fill="#58cc02" />
        <ellipse cx="60" cy="74" rx="28" ry="24" fill="#89e219" />
        <!-- Đôi cánh -->
        <path d="M16 64C12 50 20 38 24 36C26 44 26 58 20 68Z" fill="#46a302" />
        <path d="M104 64C108 50 100 38 96 36C94 44 94 58 100 68Z" fill="#46a302" />
        <!-- Đôi mắt to tròn -->
        <ellipse cx="44" cy="52" rx="14" ry="16" fill="#ffffff" />
        <ellipse cx="76" cy="52" rx="14" ry="16" fill="#ffffff" />
        <ellipse cx="46" cy="52" rx="8" ry="9" fill="#4b4b4b" />
        <ellipse cx="74" cy="52" rx="8" ry="9" fill="#4b4b4b" />
        <circle cx="48" cy="49" r="3" fill="#ffffff" />
        <circle cx="76" cy="49" r="3" fill="#ffffff" />
        <!-- Mỏ cam -->
        <path d="M52 62C52 62 60 72 68 62L60 58L52 62Z" fill="#ff9600" />
        <!-- Chân cam -->
        <ellipse cx="48" cy="106" rx="8" ry="4" fill="#ff9600" />
        <ellipse cx="72" cy="106" rx="8" ry="4" fill="#ff9600" />
      </svg>
    `,

    // Cú Duo khóc năn nỉ học bài (iconic Duolingo meme)
    sad: `
      <svg class="duo-owl-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="62" r="44" fill="#58cc02" />
        <ellipse cx="60" cy="74" rx="28" ry="24" fill="#89e219" />
        <path d="M16 68C14 55 22 45 25 42C26 50 24 62 18 72Z" fill="#46a302" />
        <path d="M104 68C106 55 98 45 95 42C94 50 96 62 102 72Z" fill="#46a302" />
        <!-- Mắt ngấn lệ -->
        <ellipse cx="44" cy="54" rx="14" ry="15" fill="#ffffff" />
        <ellipse cx="76" cy="54" rx="14" ry="15" fill="#ffffff" />
        <ellipse cx="46" cy="56" rx="8" ry="8" fill="#1cb0f6" />
        <ellipse cx="74" cy="56" rx="8" ry="8" fill="#1cb0f6" />
        <circle cx="48" cy="54" r="3" fill="#ffffff" />
        <circle cx="76" cy="54" r="3" fill="#ffffff" />
        <!-- Giọt nước mắt rơi -->
        <path d="M30 68C30 64 34 60 34 60C34 60 38 64 38 68C38 71 35 73 34 73C32 73 30 71 30 68Z" fill="#38bdf8" />
        <path d="M82 68C82 64 86 60 86 60C86 60 90 64 90 68C90 71 87 73 86 73C84 73 82 71 82 68Z" fill="#38bdf8" />
        <!-- Mỏ mếu -->
        <path d="M52 68C56 64 64 64 68 68L60 62L52 68Z" fill="#ff9600" />
        <ellipse cx="48" cy="106" rx="8" ry="4" fill="#ff9600" />
        <ellipse cx="72" cy="106" rx="8" ry="4" fill="#ff9600" />
      </svg>
    `,

    // Cú Duo ngọn lửa Streak chiến binh
    streak: `
      <svg class="duo-owl-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="42" fill="#58cc02" />
        <ellipse cx="60" cy="75" rx="26" ry="22" fill="#89e219" />
        <!-- Ngọn lửa trên đầu -->
        <path d="M60 6C66 18 78 24 74 36C70 42 62 44 60 40C58 44 48 40 46 34C44 24 54 18 60 6Z" fill="#ff9600" />
        <path d="M60 16C63 22 70 26 68 32C66 35 62 36 60 34C59 36 54 34 53 30C52 24 57 22 60 16Z" fill="#ffc800" />
        <!-- Mắt quyết tâm -->
        <ellipse cx="44" cy="54" rx="13" ry="14" fill="#ffffff" />
        <ellipse cx="76" cy="54" rx="13" ry="14" fill="#ffffff" />
        <ellipse cx="46" cy="54" rx="7" ry="8" fill="#4b4b4b" />
        <ellipse cx="74" cy="54" rx="7" ry="8" fill="#4b4b4b" />
        <circle cx="48" cy="51" r="2.5" fill="#ffffff" />
        <circle cx="76" cy="51" r="2.5" fill="#ffffff" />
        <!-- Mỏ cười tươi -->
        <path d="M52 64C52 64 60 74 68 64L60 60L52 64Z" fill="#ff9600" />
        <ellipse cx="48" cy="106" rx="8" ry="4" fill="#ff9600" />
        <ellipse cx="72" cy="106" rx="8" ry="4" fill="#ff9600" />
      </svg>
    `,

    // Cú Duo nhắc nhở nghiêm túc (đeo đồng hồ / giơ cánh)
    reminder: `
      <svg class="duo-owl-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="62" r="44" fill="#58cc02" />
        <ellipse cx="60" cy="74" rx="28" ry="24" fill="#89e219" />
        <!-- Cánh chỉ sang bên -->
        <path d="M14 62C10 48 18 36 22 34C24 42 24 56 18 66Z" fill="#46a302" />
        <path d="M98 52C108 45 116 52 114 60C108 64 100 60 98 52Z" fill="#46a302" />
        <!-- Đồng hồ mini -->
        <circle cx="106" cy="72" r="10" fill="#ffffff" stroke="#ff9600" stroke-width="2.5" />
        <path d="M106 66V72L110 74" stroke="#ff9600" stroke-width="2" stroke-linecap="round" />
        <!-- Mắt chú ý -->
        <ellipse cx="44" cy="52" rx="14" ry="16" fill="#ffffff" />
        <ellipse cx="76" cy="52" rx="14" ry="16" fill="#ffffff" />
        <ellipse cx="46" cy="52" rx="8" ry="9" fill="#1f2937" />
        <ellipse cx="74" cy="52" rx="8" ry="9" fill="#1f2937" />
        <circle cx="48" cy="49" r="3" fill="#ffffff" />
        <circle cx="76" cy="49" r="3" fill="#ffffff" />
        <path d="M52 62C52 62 60 72 68 62L60 58L52 62Z" fill="#ff9600" />
        <ellipse cx="48" cy="106" rx="8" ry="4" fill="#ff9600" />
        <ellipse cx="72" cy="106" rx="8" ry="4" fill="#ff9600" />
      </svg>
    `
  };

  // 2. ÂM THANH CHIME DUOLINGO VUI TƯƠI (SYNTHESIZED WEB AUDIO API)
  function playDuoSound(type = 'chime') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'chime' || type === 'happy') {
        // Hợp âm Arpeggio vui nhộn C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.08;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0, noteStart);
          gain.gain.linearRampToValueAtTime(0.22, noteStart + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.3);
        });
      } else if (type === 'sad') {
        // Âm điệu mếu nhẹ E5 -> D5 -> C5
        const notes = [659.25, 587.33, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.14;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.18, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.4);
        });
      } else if (type === 'streak') {
        // Âm lửa bùng nổ vui tai
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.06;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, noteStart);
          gain.gain.setValueAtTime(0.12, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteStart);
          osc.stop(noteStart + 0.25);
        });
      }
    } catch {}
  }

  // 3. THÔNG BÁO POPUP TOÀN MÀN HÌNH CHUẨN DUOLINGO (IN-APP MODAL)
  let overlayEl = null;

  function ensureModalDOM() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.className = 'duo-popup-overlay';
    overlayEl.id = 'duoPopupOverlay';
    overlayEl.innerHTML = `
      <div class="duo-card" id="duoCard">
        <button type="button" class="duo-close-btn" id="duoCloseBtn" aria-label="Đóng">✕</button>
        <div class="duo-mascot-wrapper" id="duoMascotContainer">
          ${DUO_SVGS.happy}
          <div class="duo-mood-badge" id="duoMoodBadge">🔥 3 ngày</div>
        </div>
        <div class="duo-bubble">
          <h3 class="duo-title" id="duoTitle">🦉 Duo nhắc nhở bạn!</h3>
          <p class="duo-message" id="duoMessage">
            Chỉ còn 5 phút để hoàn thành mục tiêu 50 XP và giữ chuỗi ngày hôm nay. Đừng để Duo khóc nhé!
          </p>
        </div>
        <div class="duo-stats-row" id="duoStatsRow">
          <div class="duo-stat-pill streak" id="duoStatStreak">
            <span>🔥</span> <span id="duoStatStreakVal">1 ngày</span>
          </div>
          <div class="duo-stat-pill xp" id="duoStatXP">
            <span>⭐</span> <span id="duoStatXPVal">0 / 50 XP</span>
          </div>
        </div>
        <div class="duo-actions">
          <button type="button" class="duo-btn duo-btn-primary" id="duoActionPrimary">
            🚀 VÀO HỌC NGAY
          </button>
          <button type="button" class="duo-btn duo-btn-secondary" id="duoActionSecondary">
            ⏰ NHẮC TÔI SAU 10 PHÚT
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    // Bắt sự kiện đóng
    overlayEl.querySelector('#duoCloseBtn').onclick = hidePopup;
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) hidePopup();
    });

    return overlayEl;
  }

  function showPopup(options = {}) {
    ensureModalDOM();

    const mood = options.mood || 'happy'; // 'happy' | 'sad' | 'streak' | 'reminder'
    const title = options.title || '🦉 Duo nhắc bạn học bài!';
    const message = options.message || '5 phút học tiếng Trung hôm nay sẽ giúp bạn nhớ từ vựng lâu hơn gấp 3 lần!';
    const primaryText = options.primaryText || '🚀 VÀO HỌC NGAY';
    const primaryColor = options.primaryColor || (mood === 'streak' ? 'duo-btn-orange' : 'duo-btn-primary');
    const badgeText = options.badgeText || (mood === 'streak' ? '🔥 Giữ chuỗi' : '⭐ Tích luỹ XP');

    // Nạp SVG mascot theo tâm trạng
    const mascotBox = document.getElementById('duoMascotContainer');
    if (mascotBox) {
      mascotBox.innerHTML = `
        ${DUO_SVGS[mood] || DUO_SVGS.happy}
        <div class="duo-mood-badge" id="duoMoodBadge">${badgeText}</div>
      `;
    }

    document.getElementById('duoTitle').innerHTML = title;
    document.getElementById('duoMessage').innerHTML = message;

    // Cập nhật thống kê
    const streak = parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);
    const today = new Date().toISOString().slice(0, 10);
    const xp = parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
    const targetXP = parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);

    const streakVal = document.getElementById('duoStatStreakVal');
    if (streakVal) streakVal.textContent = `${streak} ngày liên tiếp`;

    const xpVal = document.getElementById('duoStatXPVal');
    if (xpVal) xpVal.textContent = `${xp} / ${targetXP} XP`;

    // Cấu hình nút chính
    const btnPrimary = document.getElementById('duoActionPrimary');
    btnPrimary.className = `duo-btn ${primaryColor}`;
    btnPrimary.textContent = primaryText;
    btnPrimary.onclick = () => {
      hidePopup();
      if (typeof options.onPrimary === 'function') {
        options.onPrimary();
      } else {
        // Tự động chuyển tới bài học gần nhất
        const lastCourse = localStorage.getItem('hskLastCourse') || 'hsk1';
        window.location.hash = '#' + lastCourse;
      }
    };

    // Cấu hình nút phụ
    const btnSecondary = document.getElementById('duoActionSecondary');
    btnSecondary.onclick = () => {
      hidePopup();
      showToast('⏰ Đã hẹn nhắc lại', 'Duo sẽ nhắc bạn lại sau ít phút nữa nhé!', 'reminder');
    };

    // Hiển thị modal và phát âm thanh
    overlayEl.classList.add('active');
    playDuoSound(mood);

    // Bắn pháo hoa giấy ăn mừng nếu là Streak
    if (mood === 'streak' && window.HSKAudioFX?.confetti) {
      setTimeout(() => window.HSKAudioFX.confetti(60), 150);
    }
  }

  function hidePopup() {
    if (overlayEl) overlayEl.classList.remove('active');
  }

  // 4. THÔNG BÁO TOAST GÓC MÀN HÌNH (GỌN NHẸ KHÔNG CHẮN TẦM NHÌN)
  let toastEl = null;
  let toastTimer = null;

  function showToast(title, body, mood = 'happy', duration = 5000) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'duo-toast';
      toastEl.id = 'duoToast';
      document.body.appendChild(toastEl);
    }

    toastEl.innerHTML = `
      <div class="duo-toast-mascot">
        ${DUO_SVGS[mood] || DUO_SVGS.happy}
      </div>
      <div class="duo-toast-content">
        <h4 class="duo-toast-title">${title}</h4>
        <p class="duo-toast-body">${body}</p>
      </div>
      <button type="button" class="duo-toast-close" onclick="this.parentElement.classList.remove('show')">✕</button>
    `;

    setTimeout(() => toastEl.classList.add('show'), 50);
    playDuoSound(mood);

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }

  // 5. THÔNG BÁO HỆ THỐNG TRÌNH DUYỆT (WEB PUSH NOTIFICATION RA MÀN HÌNH NGOÀI)
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
        showToast('🎉 Đã bật thông báo!', 'Duo sẽ nhắc bạn học mỗi ngày để không bị mất chuỗi nhé!', 'happy');
        return true;
      }
    }

    return false;
  }

  function sendDesktopNotification(title, body, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      // Fallback hiển thị Popup Duolingo trong trang
      showPopup({
        title,
        message: body,
        mood: options.mood || 'reminder'
      });
      return;
    }

    try {
      const notifOptions = {
        body: body || 'Học 5 phút mỗi ngày cùng NiHao HSK nhé!',
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        tag: 'hsk-daily-duo-reminder',
        renotify: true,
        silent: false,
        data: { url: window.location.origin }
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, notifOptions);
        });
      } else {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
      playDuoSound(options.mood || 'chime');
    } catch {
      // Fallback
      showPopup({ title, message: body, mood: options.mood || 'reminder' });
    }
  }

  // 6. LINH VẬT DUO THÒ ĐẦU GÓC DƯỚI (FLOATING WIDGET)
  function initFloatingWidget() {
    if (document.getElementById('duoFloatingWidget')) return;

    const widget = document.createElement('div');
    widget.className = 'duo-floating-widget';
    widget.id = 'duoFloatingWidget';
    widget.innerHTML = `
      <div class="duo-floating-hint" id="duoFloatingHint" onclick="window.DuoNotification.openControlCard()">
        🦉 <span>Duo nhắc học</span>
      </div>
      <button type="button" class="duo-floating-btn" id="duoFloatingBtn" title="Linh vật Duo nhắc học" aria-label="Linh vật Duo nhắc học">
        ${DUO_SVGS.happy}
        <span class="duo-floating-badge" id="duoFloatingBadge">!</span>
      </button>
    `;

    document.body.appendChild(widget);

    document.getElementById('duoFloatingBtn').onclick = () => {
      openControlCard();
    };
  }

  // Bảng điều khiển lịch nhắc học & test thông báo Duolingo
  function openControlCard() {
    const isGranted = 'Notification' in window && Notification.permission === 'granted';
    const notifTime = localStorage.getItem(STORAGE_NOTIF_TIME) || '20:00';
    const streak = parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);

    showPopup({
      title: '🦉 Cài đặt Nhắc học Duolingo',
      mood: 'reminder',
      badgeText: `🔥 Chuỗi ${streak} ngày`,
      message: `
        <div style="font-size:13.5px; line-height:1.6; color:#475569;">
          Nhận thông báo màn hình mỗi ngày như Duolingo để không bao giờ bỏ lỡ buổi học tiếng Trung:
          <div style="margin: 12px 0; background: #ffffff; border: 2px solid #e5e5e5; border-radius: 12px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <span>🔔 Thông báo màn hình:</span>
            <b>${isGranted ? '🟢 Đã cấp quyền' : '🔴 Chưa cấp quyền'}</b>
          </div>
          <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
            <label style="font-weight:700;">⏰ Giờ nhắc hàng ngày:</label>
            <input type="time" id="duoConfigTime" value="${notifTime}" style="padding:6px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:700;">
          </div>
        </div>
      `,
      primaryText: isGranted ? '🧪 GỬI THỬ THÔNG BÁO NGAY' : '🔔 BẬT THÔNG BÁO DUOLINGO',
      onPrimary: async () => {
        const timeInput = document.getElementById('duoConfigTime');
        if (timeInput) localStorage.setItem(STORAGE_NOTIF_TIME, timeInput.value || '20:00');

        if (!isGranted) {
          const ok = await requestNotificationPermission();
          if (ok) {
            triggerSampleDuoNotification();
          }
        } else {
          triggerSampleDuoNotification();
        }
      }
    });
  }

  // 7. CÁC MẪU CÂU THÔNG BÁO HÀI HƯỚC CHUẨN DUOLINGO (ROTATING MEMES)
  const DUO_MESSAGES = [
    {
      mood: 'sad',
      title: '🦉 Duo đang buồn thiu...',
      body: 'Bạn chưa ghé học tiếng Trung hôm nay. Duo đang ngồi khóc một mình bên góc màn hình nè! 🥺'
    },
    {
      mood: 'streak',
      title: '🔥 Cảnh báo nguy cơ tắt chuỗi!',
      body: 'Ngọn lửa học tập của bạn sắp tàn rồi! Chỉ cần 3 phút hoàn thành 1 bài để giữ chuỗi ngày rực rỡ!'
    },
    {
      mood: 'reminder',
      title: '🦉 Duo nhắc bạn luyện nghe!',
      body: '5 phút luyện phát âm hoặc nghe thụ động ngay bây giờ sẽ giúp bạn tăng tốc lên HSK 3 cấp tốc! 🚀'
    },
    {
      mood: 'happy',
      title: '⭐ Đã đến giờ vàng nạp XP!',
      body: 'Bạn còn thiếu một chút nữa là hoàn thành mục tiêu ngày. Vào học cùng Duo để nhận huy hiệu nhé!'
    }
  ];

  function triggerSampleDuoNotification() {
    const randomMsg = DUO_MESSAGES[Math.floor(Math.random() * DUO_MESSAGES.length)];

    // 1. Gửi thông báo hệ thống màn hình ngoài
    sendDesktopNotification(randomMsg.title, randomMsg.body, { mood: randomMsg.mood });

    // 2. Hiện Toast Duolingo rực rỡ trong trang web
    showToast(randomMsg.title, randomMsg.body, randomMsg.mood, 6000);
  }

  // 8. BỘ ĐẾM HẸN GIỜ TỰ ĐỘNG KIỂM TRA MỖI 15 PHÚT
  function checkDailyReminderSchedule() {
    const today = new Date().toISOString().slice(0, 10);
    const lastReminded = localStorage.getItem(STORAGE_LAST_REMIND_DATE);
    if (lastReminded === today) return; // Đã nhắc hôm nay rồi thì không làm phiền nữa

    const targetTime = localStorage.getItem(STORAGE_NOTIF_TIME) || '20:00';
    const [targetHour, targetMinute] = targetTime.split(':').map(n => parseInt(n, 10));

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Nếu đã qua giờ nhắc và hôm nay chưa đạt mục tiêu XP
    if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
      const todayXP = parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
      const targetXP = parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);

      if (todayXP < targetXP) {
        localStorage.setItem(STORAGE_LAST_REMIND_DATE, today);
        triggerSampleDuoNotification();
      }
    }
  }

  // Khởi chạy khi tài liệu sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initFloatingWidget();
      setInterval(checkDailyReminderSchedule, 15 * 60 * 1000);
      setTimeout(checkDailyReminderSchedule, 3000);
    });
  } else {
    initFloatingWidget();
    setInterval(checkDailyReminderSchedule, 15 * 60 * 1000);
    setTimeout(checkDailyReminderSchedule, 3000);
  }

  // Export API toàn cục
  window.DuoNotification = {
    showPopup,
    hidePopup,
    showToast,
    requestPermission: requestNotificationPermission,
    sendNotification: sendDesktopNotification,
    openControlCard,
    test: triggerSampleDuoNotification,
    moods: { ...DUO_SVGS }
  };
})();
