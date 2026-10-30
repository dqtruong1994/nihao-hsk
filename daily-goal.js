/**
 * Daily Goal Ring & Streak Tracker Engine
 * Theo dõi tiến độ XP hàng ngày (Apple Watch / Duolingo Activity Ring) & Chuỗi ngày học
 */
(() => {
  'use strict';

  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getTargetXP() {
    return parseInt(localStorage.getItem('hsk_daily_target_xp') || '50', 10);
  }

  function setTargetXP(val) {
    localStorage.setItem('hsk_daily_target_xp', String(val));
    updateAllViews();
  }

  function getTodayXP() {
    const today = getTodayKey();
    return parseInt(localStorage.getItem(`hsk_xp_date_${today}`) || '0', 10);
  }

  function getStreak() {
    return parseInt(localStorage.getItem('hsk_streak_count') || '1', 10);
  }

  function addDailyXP(amount) {
    if (!amount || amount <= 0) return;
    const today = getTodayKey();
    const current = getTodayXP();
    const updated = current + amount;
    const target = getTargetXP();

    localStorage.setItem(`hsk_xp_date_${today}`, String(updated));

    // Kiểm tra xem đã cán mốc mục tiêu lần đầu trong ngày chưa
    const wasCompleted = current >= target;
    const isNowCompleted = updated >= target;

    if (!wasCompleted && isNowCompleted) {
      // Ăn mừng hoàn thành mục tiêu ngày!
      setTimeout(() => {
        if (window.HSKAudioFX) {
          window.HSKAudioFX.playVictory();
          window.HSKAudioFX.confetti(120);
        }
      }, 300);
    }

    updateAllViews();
  }

  let pillEl = null;
  let modalEl = null;

  function initDailyGoalDOM() {
    if (pillEl) return;

    // 1. Header Pill Widget Injection
    const nav = document.querySelector('.site-nav') || document.querySelector('.nav') || document.querySelector('header nav');
    if (nav) {
      pillEl = document.createElement('div');
      pillEl.id = 'dailyGoalHeaderPill';
      pillEl.className = 'daily-goal-pill';
      pillEl.title = 'Xem tiến độ mục tiêu học hôm nay';
      pillEl.onclick = openModal;
      nav.appendChild(pillEl);
    }

    // 2. Modal Dialog
    modalEl = document.createElement('div');
    modalEl.id = 'dailyGoalModal';
    modalEl.className = 'daily-goal-modal-overlay hidden';
    modalEl.setAttribute('hidden', '');
    modalEl.innerHTML = `
      <div class="daily-goal-card" role="dialog" aria-modal="true" aria-labelledby="dailyGoalTitle">
        <div class="daily-goal-header">
          <div>
            <h3 id="dailyGoalTitle" class="daily-goal-title">Mục Tiêu Học Hôm Nay</h3>
            <p class="daily-goal-subtitle">Duy trì thói quen học mỗi ngày để đạt hiệu quả cao nhất</p>
          </div>
          <button type="button" class="daily-goal-close-btn" id="dailyGoalCloseBtn" aria-label="Đóng">✕</button>
        </div>

        <div class="daily-goal-progress-section">
          <div class="daily-goal-big-ring">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#ea580c" />
                </linearGradient>
              </defs>
              <circle class="daily-goal-big-ring-bg" cx="70" cy="70" r="56" />
              <circle class="daily-goal-big-ring-progress" id="dailyBigRingProgress" cx="70" cy="70" r="56"
                stroke-dasharray="351.85" stroke-dashoffset="351.85" />
            </svg>
            <div class="daily-goal-ring-center">
              <span class="daily-goal-center-xp" id="dailyBigXPText">0</span>
              <span class="daily-goal-center-label" id="dailyBigTargetText">/ 50 XP</span>
            </div>
          </div>
          <div style="font-size:13.5px; font-weight:700; color:#475569;" id="dailyStatusMessage">
            Chưa đạt mục tiêu hôm nay
          </div>
        </div>

        <div>
          <div style="font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chuỗi 7 ngày gần nhất</div>
          <div class="daily-streak-calendar" id="dailyStreakCalendar">
            <!-- 7 days rendered by JS -->
          </div>
        </div>

        <div>
          <div style="font-size:12px; font-weight:800; color:#64748b; text-transform:uppercase; margin-bottom:8px;">Chọn chỉ tiêu mỗi ngày</div>
          <div class="daily-target-selector">
            <div class="daily-target-chip" data-target="20">
              <div class="daily-target-chip-title">Thong thả</div>
              <div class="daily-target-chip-xp">20 XP</div>
            </div>
            <div class="daily-target-chip" data-target="50">
              <div class="daily-target-chip-title">Tiêu chuẩn</div>
              <div class="daily-target-chip-xp">50 XP</div>
            </div>
            <div class="daily-target-chip" data-target="100">
              <div class="daily-target-chip-title">Cường độ cao</div>
              <div class="daily-target-chip-xp">100 XP</div>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary" id="dailyPracticeNowBtn" style="width:100%; padding:12px; font-weight:800; border-radius:14px; cursor:pointer;">
          ⚡ Luyện tập thêm XP ngay
        </button>
      </div>
    `;
    document.body.appendChild(modalEl);

    // Event Bindings
    document.getElementById('dailyGoalCloseBtn').onclick = closeModal;
    modalEl.onclick = (e) => {
      if (e.target === modalEl) closeModal();
    };

    modalEl.querySelectorAll('.daily-target-chip').forEach(chip => {
      chip.onclick = () => {
        setTargetXP(parseInt(chip.dataset.target, 10));
      };
    });

    document.getElementById('dailyPracticeNowBtn').onclick = () => {
      closeModal();
      if (window.HSKSkillDrills) {
        window.HSKSkillDrills.open();
      } else if (window.HSKTypingGame) {
        window.HSKTypingGame.open();
      } else {
        window.location.href = '#hsk1';
      }
    };

    updateAllViews();
  }

  function updateAllViews() {
    const todayXP = getTodayXP();
    const targetXP = getTargetXP();
    const streak = getStreak();
    const percent = Math.min(100, Math.round((todayXP / targetXP) * 100));

    // 1. Update Header Pill
    if (pillEl) {
      const miniCircumference = 2 * Math.PI * 10; // r=10 -> 62.83
      const miniOffset = miniCircumference - (percent / 100) * miniCircumference;

      pillEl.innerHTML = `
        <div class="daily-goal-ring-mini">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <circle class="daily-goal-ring-mini-circle-bg" cx="13" cy="13" r="10" />
            <circle class="daily-goal-ring-mini-circle-progress" cx="13" cy="13" r="10"
              stroke-dasharray="${miniCircumference.toFixed(2)}"
              stroke-dashoffset="${miniOffset.toFixed(2)}" />
          </svg>
          <span class="daily-goal-ring-mini-icon">${percent >= 100 ? '⭐' : '🎯'}</span>
        </div>
        <span class="daily-streak-badge">🔥 ${streak} ngày</span>
      `;
    }

    // 2. Update Modal Content
    if (modalEl) {
      const bigCircumference = 2 * Math.PI * 56; // 351.85
      const bigOffset = bigCircumference - (percent / 100) * bigCircumference;

      const progressCircle = document.getElementById('dailyBigRingProgress');
      if (progressCircle) {
        progressCircle.style.strokeDashoffset = bigOffset.toFixed(2);
      }

      const xpText = document.getElementById('dailyBigXPText');
      if (xpText) xpText.textContent = String(todayXP);

      const targetText = document.getElementById('dailyBigTargetText');
      if (targetText) targetText.textContent = `/ ${targetXP} XP`;

      const statusMsg = document.getElementById('dailyStatusMessage');
      if (statusMsg) {
        if (percent >= 100) {
          statusMsg.innerHTML = '<span style="color:#059669;">🎉 Xuất sắc! Bạn đã hoàn thành mục tiêu hôm nay!</span>';
        } else {
          const remaining = targetXP - todayXP;
          statusMsg.innerHTML = `Còn <strong style="color:#6657d9;">${remaining} XP</strong> nữa để hoàn thành mục tiêu ngày!`;
        }
      }

      // Highlight target chip
      modalEl.querySelectorAll('.daily-target-chip').forEach(chip => {
        if (parseInt(chip.dataset.target, 10) === targetXP) {
          chip.classList.add('active');
        } else {
          chip.classList.remove('active');
        }
      });

      // Render 7-day strip
      renderStreakCalendar();
    }
  }

  function renderStreakCalendar() {
    const calEl = document.getElementById('dailyStreakCalendar');
    if (!calEl) return;

    const daysName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const now = new Date();
    const todayIndex = now.getDay(); // 0 is Sunday
    let html = '';

    for (let i = 0; i < 7; i++) {
      // Days from Monday (1) to Sunday (0)
      const dayOffset = (i + 1) % 7;
      const isToday = dayOffset === todayIndex;
      const isPastOrToday = (dayOffset <= todayIndex && todayIndex !== 0) || (todayIndex === 0);

      html += `
        <div class="streak-day-item">
          <span class="streak-day-name">${daysName[dayOffset]}</span>
          <div class="streak-day-bubble ${isToday ? 'today' : ''} ${isPastOrToday ? 'completed' : ''}">
            ${isPastOrToday ? '🔥' : '•'}
          </div>
        </div>
      `;
    }

    calEl.innerHTML = html;
  }

  function openModal() {
    initDailyGoalDOM();
    updateAllViews();
    modalEl.removeAttribute('hidden');
    modalEl.classList.remove('hidden');
    modalEl.style.display = 'flex';
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.setAttribute('hidden', '');
    modalEl.classList.add('hidden');
    modalEl.style.display = 'none';
  }

  // Hook vào Gamification.addXP nếu có sẵn
  function hookGamification() {
    if (window.Gamification && typeof window.Gamification.addXP === 'function') {
      const origAddXP = window.Gamification.addXP;
      window.Gamification.addXP = function(amount, reason) {
        origAddXP.apply(this, arguments);
        addDailyXP(amount);
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDailyGoalDOM();
      hookGamification();
    });
  } else {
    initDailyGoalDOM();
    hookGamification();
  }

  window.HSKDailyGoal = {
    openModal,
    closeModal,
    addDailyXP,
    getTodayXP,
    getTargetXP
  };
})();
