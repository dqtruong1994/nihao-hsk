/**
 * NiHao HSK - Panda Mascot & Chinese Culture Notification Engine
 * - Linh vật độc quyền: Gấu Trúc NiHao "Bao Bao" (大熊猫 🐼)
 * - Tự động kiểm tra: Nếu người dùng chưa bật thông báo khi vào web -> Gợi ý bật thông báo trang nhã, không phiền toái
 * - Âm thanh Ngũ Cung truyền thống (Chinese Pentatonic Arpeggio C5-D5-E5-G5-A5)
 * - Đẩy thông báo ra màn hình khóa điện thoại (PWA / Android / iOS) và màn hình desktop
 */
(() => {
  'use strict';

  const STORAGE_NOTIF_ENABLED = 'hsk_duo_notif_enabled';
  const STORAGE_NOTIF_TIME = 'hsk_duo_notif_time'; // Mặc định '20:00'
  const STORAGE_LAST_REMIND_DATE = 'hsk_duo_last_remind_date';
  const STORAGE_PROMPT_DISMISSED = 'hsk_panda_prompt_dismissed';
  const STORAGE_PROMPT_LAST_TIME = 'hsk_panda_prompt_last_dismissed';

  // 1. LINH VẬT GẤU TRÚC NIHAO (SVG VECTOR NGHỆ THUẬT Á ĐÔNG ĐỘC QUYỀN)
  const PANDA_SVGS = {
    // Gấu trúc tươi cười vẫy tay chào "你好!" (Happy)
    happy: `
      <svg class="panda-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Đôi tai đen tròn -->
        <circle cx="28" cy="30" r="14" fill="#1e293b" />
        <circle cx="28" cy="30" r="7" fill="#f43f5e" opacity="0.7" />
        <circle cx="92" cy="30" r="14" fill="#1e293b" />
        <circle cx="92" cy="30" r="7" fill="#f43f5e" opacity="0.7" />
        <!-- Đèn lồng đỏ mini góc trái -->
        <rect x="8" y="14" width="12" height="16" rx="6" fill="#e11d48" />
        <line x1="14" y1="6" x2="14" y2="14" stroke="#f59e0b" stroke-width="1.5" />
        <line x1="14" y1="30" x2="14" y2="38" stroke="#f59e0b" stroke-width="1.5" />
        <rect x="10" y="20" width="8" height="4" fill="#fde047" opacity="0.8" />
        <!-- Khuôn mặt tròn gấu trúc -->
        <circle cx="60" cy="64" r="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" />
        <!-- Đốm đen quanh mắt đặc trưng -->
        <ellipse cx="44" cy="58" rx="14" ry="16" fill="#1e293b" transform="rotate(-18 44 58)" />
        <ellipse cx="76" cy="58" rx="14" ry="16" fill="#1e293b" transform="rotate(18 76 58)" />
        <!-- Mắt long lanh lấp lánh -->
        <circle cx="45" cy="57" r="7" fill="#ffffff" />
        <circle cx="75" cy="57" r="7" fill="#ffffff" />
        <circle cx="46" cy="57" r="4.5" fill="#0f172a" />
        <circle cx="74" cy="57" r="4.5" fill="#0f172a" />
        <circle cx="47.5" cy="55.5" r="1.8" fill="#ffffff" />
        <circle cx="75.5" cy="55.5" r="1.8" fill="#ffffff" />
        <!-- Má hồng rực rỡ -->
        <ellipse cx="32" cy="72" rx="7" ry="4.5" fill="#fda4af" />
        <ellipse cx="88" cy="72" rx="7" ry="4.5" fill="#fda4af" />
        <!-- Mũi gấu trúc tam giác tròn -->
        <path d="M56 66C56 64 64 64 64 66C64 69 56 69 56 66Z" fill="#1e293b" />
        <!-- Miệng cười mỉm đáng yêu -->
        <path d="M54 70Q60 76 66 70" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Nơ cát tường đỏ may mắn trước ngực -->
        <circle cx="60" cy="98" r="5" fill="#e11d48" />
        <path d="M55 98L44 94V102L55 98Z" fill="#be123c" />
        <path d="M65 98L76 94V102L65 98Z" fill="#be123c" />
        <circle cx="60" cy="98" r="2" fill="#fde047" />
        <!-- Tay vẫy chào thân thiện -->
        <circle cx="98" cy="76" r="9" fill="#1e293b" />
      </svg>
    `,

    // Gấu trúc mong ngóng, mếu máo vì học viên chưa học (Sad/Pleading)
    sad: `
      <svg class="panda-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="30" r="14" fill="#1e293b" />
        <circle cx="28" cy="30" r="7" fill="#f43f5e" opacity="0.6" />
        <circle cx="92" cy="30" r="14" fill="#1e293b" />
        <circle cx="92" cy="30" r="7" fill="#f43f5e" opacity="0.6" />
        <!-- Khuôn mặt tròn -->
        <circle cx="60" cy="64" r="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" />
        <!-- Đốm mắt cụp xuống mếu máo -->
        <ellipse cx="44" cy="60" rx="14" ry="16" fill="#1e293b" transform="rotate(-10 44 60)" />
        <ellipse cx="76" cy="60" rx="14" ry="16" fill="#1e293b" transform="rotate(10 76 60)" />
        <!-- Mắt ngấn lệ nước mắt to -->
        <circle cx="45" cy="60" r="7.5" fill="#ffffff" />
        <circle cx="75" cy="60" r="7.5" fill="#ffffff" />
        <circle cx="46" cy="61" r="5" fill="#0284c7" />
        <circle cx="74" cy="61" r="5" fill="#0284c7" />
        <circle cx="47" cy="59" r="2" fill="#ffffff" />
        <circle cx="75" cy="59" r="2" fill="#ffffff" />
        <!-- Giọt nước mắt rơi biếc -->
        <path d="M30 74C30 70 34 66 34 66C34 66 38 70 38 74C38 77 35 79 34 79C32 79 30 77 30 74Z" fill="#38bdf8" />
        <path d="M82 74C82 70 86 66 86 66C86 66 90 70 90 74C90 77 87 79 86 79C84 79 82 77 82 74Z" fill="#38bdf8" />
        <!-- Mũi & miệng mếu -->
        <path d="M56 68C56 66 64 66 64 68C64 71 56 71 56 68Z" fill="#1e293b" />
        <path d="M54 75Q60 70 66 75" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Ôm cuộn sách Hán tự -->
        <rect x="42" y="90" width="36" height="14" rx="4" fill="#fde68a" stroke="#d97706" stroke-width="1.5" />
        <line x1="48" y1="94" x2="72" y2="94" stroke="#b45309" stroke-width="1.2" />
        <line x1="48" y1="99" x2="66" y2="99" stroke="#b45309" stroke-width="1.2" />
        <circle cx="38" cy="94" r="7" fill="#1e293b" />
        <circle cx="82" cy="94" r="7" fill="#1e293b" />
      </svg>
    `,

    // Gấu trúc thắt băng đô đỏ "学" (Học) - Chiến binh Lửa Chuỗi ngày (Streak)
    streak: `
      <svg class="panda-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Ngọn lửa đỏ cam rực rỡ sau đầu -->
        <path d="M60 2C68 16 82 22 78 36C74 42 64 44 60 40C58 44 46 40 44 32C42 22 52 16 60 2Z" fill="#ea580c" />
        <path d="M60 12C64 20 74 24 71 32C69 35 63 36 60 34C59 36 53 34 52 28C51 22 56 20 60 12Z" fill="#f59e0b" />
        <path d="M60 20C62 24 67 26 65 30C64 32 61 33 60 32C59 33 56 32 55 29C54 26 57 24 60 20Z" fill="#fef08a" />
        <!-- Đôi tai đen -->
        <circle cx="28" cy="34" r="13" fill="#1e293b" />
        <circle cx="92" cy="34" r="13" fill="#1e293b" />
        <!-- Khuôn mặt -->
        <circle cx="60" cy="66" r="43" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" />
        <!-- Băng đô đỏ buộc trán chữ "学" (Học) -->
        <rect x="20" y="44" width="80" height="12" rx="4" fill="#e11d48" />
        <text x="60" y="53.5" fill="#fef08a" font-size="9" font-weight="900" text-anchor="middle" font-family="STKaiti, KaiTi, serif">学</text>
        <path d="M96 48L108 42V56L96 52Z" fill="#be123c" />
        <!-- Đốm mắt quyết tâm -->
        <ellipse cx="44" cy="62" rx="13" ry="15" fill="#1e293b" transform="rotate(-15 44 62)" />
        <ellipse cx="76" cy="62" rx="13" ry="15" fill="#1e293b" transform="rotate(15 76 62)" />
        <!-- Mắt sao lửa -->
        <circle cx="45" cy="62" r="6" fill="#ffffff" />
        <circle cx="75" cy="62" r="6" fill="#ffffff" />
        <circle cx="46" cy="62" r="3.8" fill="#1e293b" />
        <circle cx="74" cy="62" r="3.8" fill="#1e293b" />
        <circle cx="47" cy="60.5" r="1.5" fill="#fef08a" />
        <circle cx="75" cy="60.5" r="1.5" fill="#fef08a" />
        <!-- Mũi & nụ cười chiến thắng -->
        <path d="M56 70C56 68 64 68 64 70C64 73 56 73 56 70Z" fill="#1e293b" />
        <path d="M54 74Q60 80 66 74" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
      </svg>
    `,

    // Gấu trúc Trạng nguyên cầm cành trúc xanh & quạt xếp (Reminder)
    reminder: `
      <svg class="panda-svg" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="30" r="14" fill="#1e293b" />
        <circle cx="92" cy="30" r="14" fill="#1e293b" />
        <!-- Mũ trạng nguyên xanh ngọc viền vàng -->
        <path d="M40 32C40 24 80 24 80 32L88 38H32L40 32Z" fill="#047857" />
        <line x1="60" y1="24" x2="60" y2="16" stroke="#f59e0b" stroke-width="2" />
        <circle cx="60" cy="15" r="3" fill="#f59e0b" />
        <!-- Khuôn mặt -->
        <circle cx="60" cy="64" r="44" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5" />
        <!-- Đốm mắt -->
        <ellipse cx="44" cy="58" rx="14" ry="16" fill="#1e293b" transform="rotate(-18 44 58)" />
        <ellipse cx="76" cy="58" rx="14" ry="16" fill="#1e293b" transform="rotate(18 76 58)" />
        <!-- Mắt chú ý -->
        <circle cx="45" cy="57" r="7" fill="#ffffff" />
        <circle cx="75" cy="57" r="7" fill="#ffffff" />
        <circle cx="46" cy="57" r="4.5" fill="#1e293b" />
        <circle cx="74" cy="57" r="4.5" fill="#1e293b" />
        <circle cx="47.5" cy="55.5" r="1.8" fill="#ffffff" />
        <circle cx="75.5" cy="55.5" r="1.8" fill="#ffffff" />
        <!-- Mũi & miệng -->
        <path d="M56 66C56 64 64 64 64 66C64 69 56 69 56 66Z" fill="#1e293b" />
        <path d="M54 70Q60 76 66 70" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none" />
        <!-- Cành trúc xanh góc phải -->
        <path d="M96 52Q102 70 108 90" stroke="#059669" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="106" cy="62" rx="7" ry="3" fill="#10b981" transform="rotate(-20 106 62)" />
        <ellipse cx="100" cy="74" rx="8" ry="3.5" fill="#10b981" transform="rotate(30 100 74)" />
      </svg>
    `
  };

  // 2. ÂM THANH NGŨ CUNG TRUYỀN THỐNG TRUNG HOA (CHINESE PENTATONIC CHIME)
  function playChineseSound(type = 'chime') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'chime' || type === 'happy') {
        // Thang âm Ngũ cung: Cung (C5) - Thương (D5) - Giốc (E5) - Chủy (G5) - Vũ (A5)
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
      } else if (type === 'sad') {
        // Giai điệu trầm ngâm: A4 -> G4 -> E4 -> D4
        const notes = [440.00, 392.00, 329.63, 293.66];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const noteStart = now + idx * 0.13;
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
        // Tiếng chiêng khánh rực rỡ ăn mừng
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

  // 3. TỰ ĐỘNG CHECK VÀ HIỂN THỊ BANNER GỢI Ý BẬT THÔNG BÁO CHO USER MỚI
  let promptBannerEl = null;

  function showPromptBanner() {
    if (promptBannerEl) {
      promptBannerEl.classList.add('show');
      return;
    }

    promptBannerEl = document.createElement('div');
    promptBannerEl.className = 'panda-prompt-banner';
    promptBannerEl.id = 'pandaPromptBanner';
    promptBannerEl.innerHTML = `
      <div class="panda-prompt-avatar">
        ${PANDA_SVGS.happy}
      </div>
      <div class="panda-prompt-content">
        <div class="panda-prompt-title">
          <span>🐼 Cùng Gấu Trúc NiHao giữ chuỗi học!</span>
        </div>
        <p class="panda-prompt-desc">
          Bật thông báo để được nhắc nhở 5 phút ôn từ vựng & luyện phát âm HSK mỗi ngày, không sợ quên bài nhé!
        </p>
        <div class="panda-prompt-actions">
          <button type="button" class="panda-btn-allow" id="btnPandaAllow">
            🏮 Bật thông báo ngay
          </button>
          <button type="button" class="panda-btn-dismiss" id="btnPandaDismiss">
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

    // Xử lý nút Cho phép
    document.getElementById('btnPandaAllow').onclick = async () => {
      promptBannerEl.classList.remove('show');
      const granted = await requestNotificationPermission();
      if (granted) {
        if (window.HSKAudioFX?.confetti) window.HSKAudioFX.confetti(80);
        showToast('🎉 Hoan nghênh bạn!', 'Gấu Trúc NiHao đã sẵn sàng đồng hành và nhắc bạn học đúng giờ mỗi ngày! 🏮', 'happy');
      }
    };

    // Xử lý nút Để sau
    document.getElementById('btnPandaDismiss').onclick = () => {
      promptBannerEl.classList.remove('show');
      sessionStorage.setItem(STORAGE_PROMPT_DISMISSED, 'true');
      localStorage.setItem(STORAGE_PROMPT_LAST_TIME, String(Date.now()));
    };
  }

  function checkNotificationOnVisit() {
    if (!('Notification' in window)) return;

    // Đã bật rồi thì không cần hỏi
    if (Notification.permission === 'granted') return;

    // Đã từ chối hẳn trong browser settings thì không làm phiền
    if (Notification.permission === 'denied') return;

    // Nếu đã đóng trong phiên làm việc này
    if (sessionStorage.getItem(STORAGE_PROMPT_DISMISSED)) return;

    // Nếu đã bấm để sau trong vòng 24 giờ qua
    const lastDismissed = parseInt(localStorage.getItem(STORAGE_PROMPT_LAST_TIME) || '0', 10);
    if (Date.now() - lastDismissed < 24 * 60 * 60 * 1000) return;

    // Đợi 3.5 giây sau khi mở trang để người dùng nắm bắt nội dung trước
    setTimeout(showPromptBanner, 3500);
  }

  // 4. POPUP MODAL GẤU TRÚC NIHAO
  let overlayEl = null;

  function ensureModalDOM() {
    if (overlayEl) return overlayEl;

    overlayEl = document.createElement('div');
    overlayEl.className = 'panda-popup-overlay';
    overlayEl.id = 'pandaPopupOverlay';
    overlayEl.innerHTML = `
      <div class="panda-card" id="pandaCard">
        <button type="button" class="panda-close-btn" id="pandaCloseBtn" aria-label="Đóng">✕</button>
        <div class="panda-mascot-wrapper" id="pandaMascotContainer">
          ${PANDA_SVGS.happy}
          <div class="panda-seal-badge" id="pandaSealBadge">你好</div>
        </div>
        <div class="panda-bubble">
          <h3 class="panda-title" id="pandaTitle">🐼 Gấu Trúc NiHao nhắc nhở bạn!</h3>
          <p class="panda-message" id="pandaMessage">
            Khổng Tử từng dạy: "Học mà ôn lại, chẳng vui lắm sao?" (学而时习之). Hãy dành 5 phút hôm nay cùng Gấu Trúc tích luỹ thêm 50 XP nhé!
          </p>
        </div>
        <div class="panda-stats-row" id="pandaStatsRow">
          <div class="panda-stat-pill streak" id="pandaStatStreak">
            <span>🔥</span> <span id="pandaStatStreakVal">1 ngày</span>
          </div>
          <div class="panda-stat-pill xp" id="pandaStatXP">
            <span>⭐</span> <span id="pandaStatXPVal">0 / 50 XP</span>
          </div>
        </div>
        <div class="panda-actions">
          <button type="button" class="panda-btn panda-btn-primary" id="pandaActionPrimary">
            🏮 VÀO HỌC NGAY
          </button>
          <button type="button" class="panda-btn panda-btn-secondary" id="pandaActionSecondary">
            ⏰ NHẮC TÔI SAU 10 PHÚT
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlayEl);

    overlayEl.querySelector('#pandaCloseBtn').onclick = hidePopup;
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) hidePopup();
    });

    return overlayEl;
  }

  function showPopup(options = {}) {
    ensureModalDOM();

    const mood = options.mood || 'happy'; // 'happy' | 'sad' | 'streak' | 'reminder'
    const title = options.title || '🐼 Gấu Trúc NiHao nhắc bạn học bài!';
    const message = options.message || 'Mỗi ngày 5 phút tích tiểu thành đại. Cùng Gấu Trúc chinh phục HSK thật vững vàng nhé!';
    const primaryText = options.primaryText || '🏮 VÀO HỌC NGAY';
    const primaryColor = options.primaryColor || (mood === 'streak' ? 'panda-btn-orange' : 'panda-btn-primary');
    const sealText = options.sealText || (mood === 'streak' ? '必胜' : (mood === 'sad' ? '想你' : '你好'));

    const mascotBox = document.getElementById('pandaMascotContainer');
    if (mascotBox) {
      mascotBox.innerHTML = `
        ${PANDA_SVGS[mood] || PANDA_SVGS.happy}
        <div class="panda-seal-badge" id="pandaSealBadge">${sealText}</div>
      `;
    }

    document.getElementById('pandaTitle').innerHTML = title;
    document.getElementById('pandaMessage').innerHTML = message;

    const streak = parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);
    const today = new Date().toISOString().slice(0, 10);
    const xp = parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
    const targetXP = parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);

    const streakVal = document.getElementById('pandaStatStreakVal');
    if (streakVal) streakVal.textContent = `${streak} ngày liên tiếp`;

    const xpVal = document.getElementById('pandaStatXPVal');
    if (xpVal) xpVal.textContent = `${xp} / ${targetXP} XP`;

    const btnPrimary = document.getElementById('pandaActionPrimary');
    btnPrimary.className = `panda-btn ${primaryColor}`;
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

    const btnSecondary = document.getElementById('pandaActionSecondary');
    btnSecondary.onclick = () => {
      hidePopup();
      showToast('⏰ Đã hẹn nhắc lại', 'Gấu Trúc NiHao sẽ nhắc bạn lại sau ít phút nữa nhé!', 'reminder');
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

  // 5. TOAST THÔNG BÁO GÓC MÀN HÌNH
  let toastEl = null;
  let toastTimer = null;

  function showToast(title, body, mood = 'happy', duration = 5000) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'panda-toast';
      toastEl.id = 'pandaToast';
      document.body.appendChild(toastEl);
    }

    toastEl.innerHTML = `
      <div class="panda-toast-mascot">
        ${PANDA_SVGS[mood] || PANDA_SVGS.happy}
      </div>
      <div class="panda-toast-content">
        <h4 class="panda-toast-title">${title}</h4>
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

  // 6. THÔNG BÁO HỆ THỐNG TRÌNH DUYỆT (WEB PUSH ĐẨY RA MÀN HÌNH NGOÀI)
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
        showToast('🎉 Đã kích hoạt thông báo!', 'Gấu Trúc NiHao sẽ đồng hành và nhắc học mỗi ngày cùng bạn! 🏮', 'happy');
        return true;
      }
    }

    return false;
  }

  function sendDesktopNotification(title, body, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
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
        icon: 'favicon.svg',
        badge: 'favicon.svg',
        vibrate: [200, 100, 200],
        tag: 'hsk-panda-notification',
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
          reg.showNotification(title, notifOptions);
        });
      } else {
        const notif = new Notification(title, notifOptions);
        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
      playChineseSound(options.mood || 'chime');
    } catch {
      showPopup({ title, message: body, mood: options.mood || 'reminder' });
    }
  }

  // 7. LINH VẬT GẤU TRÚC NỔI Ở GÓC PHẢI DƯỚI (FLOATING WIDGET)
  function initFloatingWidget() {
    if (document.getElementById('pandaFloatingWidget')) return;

    const widget = document.createElement('div');
    widget.className = 'panda-floating-widget';
    widget.id = 'pandaFloatingWidget';
    widget.innerHTML = `
      <div class="panda-floating-hint" id="pandaFloatingHint" onclick="window.HSKNotification.openControlCard()">
        🐼 <span>Gấu Trúc nhắc học</span>
      </div>
      <button type="button" class="panda-floating-btn" id="pandaFloatingBtn" title="Gấu Trúc NiHao nhắc học" aria-label="Gấu Trúc NiHao nhắc học">
        ${PANDA_SVGS.happy}
        <span class="panda-floating-badge" id="pandaFloatingBadge">!</span>
      </button>
    `;

    document.body.appendChild(widget);

    document.getElementById('pandaFloatingBtn').onclick = () => {
      openControlCard();
    };
  }

  // Bảng điều khiển lịch nhắc học & test thông báo Gấu Trúc NiHao
  function openControlCard() {
    const isGranted = 'Notification' in window && Notification.permission === 'granted';
    const notifTime = localStorage.getItem(STORAGE_NOTIF_TIME) || '20:00';
    const streak = parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);

    showPopup({
      title: '🐼 Cài đặt Nhắc học NiHao HSK',
      mood: 'reminder',
      sealText: '学',
      message: `
        <div style="font-size:13.5px; line-height:1.6; color:#475569;">
          Nhận thông báo màn hình mỗi ngày từ Gấu Trúc NiHao để không bao giờ bỏ lỡ buổi học tiếng Trung:
          <div style="margin: 12px 0; background: #ffffff; border: 2px solid #fed7aa; border-radius: 12px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center;">
            <span>🔔 Thông báo màn hình:</span>
            <b>${isGranted ? '🟢 Đã cấp quyền' : '🔴 Chưa cấp quyền'}</b>
          </div>
          <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
            <label style="font-weight:700;">⏰ Giờ nhắc hàng ngày:</label>
            <input type="time" id="pandaConfigTime" value="${notifTime}" style="padding:6px 10px; border-radius:8px; border:1.5px solid #cbd5e1; font-weight:700;">
          </div>
        </div>
      `,
      primaryText: isGranted ? '🧪 GỬI THỬ THÔNG BÁO NGAY' : '🏮 BẬT THÔNG BÁO NIHAO',
      onPrimary: async () => {
        const timeInput = document.getElementById('pandaConfigTime');
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

  // 8. CÁC MẪU CÂU THÔNG BÁO ĐẬM CHẤT HÁN NGỮ & KHUYẾN HỌC
  const PANDA_MESSAGES = [
    {
      mood: 'sad',
      title: '🐼 Gấu Trúc NiHao đang nhớ bạn...',
      body: 'Khổng Tử từng dạy "Ôn cố nhi tri tân". Hôm nay bạn chưa ghé học, Gấu Trúc đang ngồi đợi bạn nè! 🥺'
    },
    {
      mood: 'streak',
      title: '🔥 Bảo vệ ngọn lửa chuỗi ngày!',
      body: 'Ngọn lửa chăm chỉ của bạn đang bừng sáng! Chỉ cần 5 phút hoàn thành 1 bài để giữ vững chuỗi ngày nhé!'
    },
    {
      mood: 'reminder',
      title: '🏮 Đã đến giờ luyện khẩu ngữ HSK!',
      body: '5 phút luyện phát âm AI hoặc nghe thụ động ngay bây giờ sẽ giúp bạn nhớ từ vựng lâu hơn gấp 3 lần! 🚀'
    },
    {
      mood: 'happy',
      title: '⭐ Giờ vàng tích luỹ 50 XP!',
      body: 'Chỉ còn thiếu một chút nữa là hoàn thành mục tiêu ngày. Cùng Gấu Trúc mở khóa huy hiệu mới nào! 🎉'
    }
  ];

  function triggerSampleNotification() {
    const randomMsg = PANDA_MESSAGES[Math.floor(Math.random() * PANDA_MESSAGES.length)];
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
    moods: { ...PANDA_SVGS }
  };

  window.HSKNotification = HSKNotificationAPI;
  // Giữ alias tương thích
  window.DuoNotification = HSKNotificationAPI;
})();
