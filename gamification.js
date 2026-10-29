/**
 * Gamification & Audio Synthesis Engine
 * Cung cấp:
 * 1. Hiệu ứng âm thanh chuẩn Web Audio API (chime, error, tone contours)
 * 2. Pháo hoa ăn mừng (Canvas Confetti)
 * 3. Quản lý Streak chuẩn múi giờ GMT+7 và XP toàn cục
 */
(() => {
  'use strict';

  // --- 1. Web Audio FX ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration = 0.2, type = 'sine') {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  function playSuccessSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Hai nốt vui tươi C5 (523Hz) -> E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.setValueAtTime(659.25, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);
    } catch {}
  }

  function playErrorSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(196, now + 0.1);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  // Phát âm chuẩn cao độ 4 thanh điệu tiếng Trung
  function playToneContour(tone) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.3, now);

      if (tone === 1) {
        // Thanh 1 (55): Cao độ ngang 260Hz
        osc.frequency.setValueAtTime(260, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else if (tone === 2) {
        // Thanh 2 (35): Lên giọng từ 200Hz -> 260Hz
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (tone === 3) {
        // Thanh 3 (214): Xuống trầm rồi lên lại 190 -> 130 -> 220Hz
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.22);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.52);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (tone === 4) {
        // Thanh 4 (51): Rơi nhanh dứt khoát 270Hz -> 130Hz
        osc.frequency.setValueAtTime(270, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
    } catch {}
  }

  // --- 2. Canvas Confetti ---
  function confetti() {
    let canvas = document.getElementById('hskConfettiCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'hskConfettiCanvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '999999';
      document.body.appendChild(canvas);
    }
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6657d9', '#ff4757', '#2ed573', '#ffa502', '#1e90ff', '#f368e0'];
    const particles = [];
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 8,
        life: 1
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // trọng lực
        p.rotation += p.rSpeed;
        p.life -= 0.015;
        if (p.life > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.life;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }
      if (alive) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  // --- 3. Hệ Thống 8 Cấp Bậc Rank & Nhiệm Vụ Hàng Ngày ---
  // Sắt -> Đồng -> Vàng -> Bạch kim -> Kim cương -> Cao thủ -> Đại cao thủ -> Thách đấu
  const RANKS = [
    { key: 'iron', name: 'Sắt', minXP: 0, icon: '🛡️', color: '#71717a', bgClass: 'rank-iron', desc: 'Khởi đầu học Hán tự và phát âm' },
    { key: 'bronze', name: 'Đồng', minXP: 200, icon: '🥉', color: '#b45309', bgClass: 'rank-bronze', desc: 'Nắm vững thanh điệu & Pinyin cơ bản' },
    { key: 'gold', name: 'Vàng', minXP: 500, icon: '🥇', color: '#d97706', bgClass: 'rank-gold', desc: 'Giao tiếp sơ cấp HSK 1 vững vàng' },
    { key: 'platinum', name: 'Bạch kim', minXP: 1000, icon: '💠', color: '#0d9488', bgClass: 'rank-platinum', desc: 'Vốn từ mở rộng, phản xạ HSK 2' },
    { key: 'diamond', name: 'Kim cương', minXP: 2000, icon: '💎', color: '#2563eb', bgClass: 'rank-diamond', desc: 'Làm chủ ngữ pháp HSK 2, tiến vào HSK 3' },
    { key: 'master', name: 'Cao thủ', minXP: 3500, icon: '⚔️', color: '#7c3aed', bgClass: 'rank-master', desc: 'Tự tin giao tiếp và đọc hiểu HSK 3' },
    { key: 'grandmaster', name: 'Đại cao thủ', minXP: 5500, icon: '👑', color: '#e11d48', bgClass: 'rank-grandmaster', desc: 'Bản lĩnh vững vàng, làm chủ các kỳ thi' },
    { key: 'challenger', name: 'Thách đấu', minXP: 8000, icon: '🔥', color: '#ea580c', bgClass: 'rank-challenger', desc: 'Bậc thầy Hán ngữ, đỉnh cao phản xạ' }
  ];

  function getTotalXP() {
    try {
      const hsk1 = Number(localStorage.getItem('hskXP') || 0);
      const hsk2 = Number(localStorage.getItem('hsk2XP') || 0);
      const hsk3 = Number(localStorage.getItem('hsk3XP') || 0);
      const bonus = Number(localStorage.getItem('hskBonusXP') || 0);
      return Math.max(0, hsk1 + hsk2 + hsk3 + bonus);
    } catch {
      return 0;
    }
  }

  function getRank(xp = getTotalXP()) {
    let current = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXP) {
        current = RANKS[i];
        break;
      }
    }
    return current;
  }

  function getRankProgress(xp = getTotalXP()) {
    const current = getRank(xp);
    const currentIndex = RANKS.findIndex(r => r.key === current.key);
    const nextRank = currentIndex < RANKS.length - 1 ? RANKS[currentIndex + 1] : null;

    if (!nextRank) {
      return { current, next: null, percent: 100, neededXP: 0, currentLevelXP: xp - current.minXP, spanXP: 1 };
    }

    const spanXP = nextRank.minXP - current.minXP;
    const currentLevelXP = xp - current.minXP;
    const percent = Math.min(100, Math.max(0, Math.round((currentLevelXP / spanXP) * 100)));
    const neededXP = nextRank.minXP - xp;

    return { current, next: nextRank, percent, neededXP, currentLevelXP, spanXP };
  }

  // Quản lý Nhiệm vụ hàng ngày (Daily Quests)
  function getTodayKey() {
    const d = new Date();
    return `hsk_quests_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  }

  function getDailyQuests() {
    const key = getTodayKey();
    let data = null;
    try {
      data = JSON.parse(localStorage.getItem(key) || 'null');
    } catch {}

    if (!data) {
      data = {
        login: { title: 'Điểm danh học hàng ngày', icon: '📅', xp: 10, done: true, desc: 'Mở trang học tiếng Trung mỗi ngày' },
        speech: { title: 'Luyện nói 3 câu chuẩn xác', icon: '🎙️', xp: 25, done: false, count: 0, target: 3, desc: 'Luyện phát âm trong Phòng Luyện Nói AI' },
        typing: { title: 'Thử thách gõ Pinyin 1 ván', icon: '⌨️', xp: 30, done: false, desc: 'Chơi 1 ván thử thách gõ chữ Hán' },
        drill: { title: 'Luyện 1 bài chuyên đề HSK', icon: '🎯', xp: 35, done: false, desc: 'Làm 1 bài luyện ngữ pháp/nghe/từ vựng' }
      };
      try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
    }
    return data;
  }

  function updateQuestProgress(questKey, increment = 1) {
    try {
      const key = getTodayKey();
      const quests = getDailyQuests();
      const q = quests[questKey];
      if (!q || q.done) return;

      if (q.target) {
        q.count = (q.count || 0) + increment;
        if (q.count >= q.target) {
          q.done = true;
          addXP(q.xp, `Hoàn thành nhiệm vụ: ${q.title}`);
        }
      } else {
        q.done = true;
        addXP(q.xp, `Hoàn thành nhiệm vụ: ${q.title}`);
      }

      localStorage.setItem(key, JSON.stringify(quests));
      updateRankUI();
    } catch {}
  }

  // Thêm XP toàn cục & kiểm tra thăng hạng
  function addXP(amount, reason = '') {
    try {
      const prevTotal = getTotalXP();
      const prevRank = getRank(prevTotal);

      const currentBonus = Number(localStorage.getItem('hskBonusXP') || 0);
      localStorage.setItem('hskBonusXP', String(currentBonus + amount));

      const newTotal = getTotalXP();
      const newRank = getRank(newTotal);

      updateRankUI();

      // Thông báo thăng hạng nếu vượt cấp
      if (newRank.minXP > prevRank.minXP) {
        confetti();
        playSuccessSound();
        showRankUpModal(newRank);
      }
    } catch {}
  }

  function showRankUpModal(newRank) {
    const existing = document.getElementById('hskRankUpModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hskRankUpModal';
    overlay.className = 'rank-modal-overlay';
    overlay.innerHTML = `
      <div class="rank-modal-card" style="max-width:440px; text-align:center; padding:32px 24px;">
        <div style="font-size:64px; animation: rankBounce 1.5s infinite ease-in-out;">${newRank.icon}</div>
        <span style="font-size:12px; font-weight:800; color:#7c3aed; letter-spacing:1px; text-transform:uppercase;">CHÚC MỪNG THĂNG HẠNG!</span>
        <h2 style="font-size:26px; font-weight:900; color:#1e1b4b; margin:6px 0 10px;">Cấp bậc: ${newRank.name}</h2>
        <p style="color:#64748b; font-size:14px; margin-bottom:20px;">${newRank.desc}</p>
        <button type="button" class="btn" style="background:#6657d9; color:#fff; border:0; padding:12px 24px; border-radius:12px; font-weight:800; cursor:pointer;" onclick="this.closest('.rank-modal-overlay').remove()">
          Tuyệt vời · Nhận thưởng
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // Cập nhật giao diện Rank trên Header & Trang chủ
  function updateRankUI() {
    const xp = getTotalXP();
    const info = getRankProgress(xp);

    // Cập nhật thẻ trên header
    const badge = document.getElementById('headerRankBadge');
    if (badge) {
      badge.className = `header-rank-badge ${info.current.bgClass}`;
      badge.innerHTML = `
        <span style="font-size:15px;">${info.current.icon}</span>
        <span>${info.current.name}</span>
        <span style="opacity:0.65; font-size:10px;">•</span>
        <span style="color:${info.current.color}; font-weight:800;">${xp} XP</span>
      `;
    }

    // Cập nhật totalXP text nếu có
    const totalXPNode = document.getElementById('totalXP');
    if (totalXPNode) totalXPNode.textContent = String(xp);
  }

  // Mở Popup Chi Tiết Rank & Nhiệm Vụ Hàng Ngày
  function openRankModal() {
    const existing = document.getElementById('hskRankDetailModal');
    if (existing) existing.remove();

    const xp = getTotalXP();
    const info = getRankProgress(xp);
    const quests = getDailyQuests();

    const overlay = document.createElement('div');
    overlay.id = 'hskRankDetailModal';
    overlay.className = 'rank-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="rank-modal-card">
        <header class="rank-modal-header">
          <h2>🏆 Hệ Thống Cấp Bậc & Nhiệm Vụ</h2>
          <button type="button" class="rank-modal-close" onclick="this.closest('.rank-modal-overlay').remove()">✕</button>
        </header>

        <div class="rank-modal-body">
          <!-- Spotlight Rank Hiện Tại -->
          <div class="rank-current-spotlight">
            <div class="rank-spotlight-icon">${info.current.icon}</div>
            <div class="rank-spotlight-name">Rank: ${info.current.name}</div>
            <div class="rank-spotlight-xp">${xp} XP Tích Lũy</div>

            <div class="rank-progress-container">
              <div class="rank-progress-bar" style="width: ${info.percent}%"></div>
            </div>
            <div class="rank-progress-label">
              <span>${info.percent}% tiến độ cấp hiện tại</span>
              <span>${info.next ? `Cần +${info.neededXP} XP để lên ${info.next.icon} ${info.next.name}` : 'Đã đạt cấp tối đa! 🔥'}</span>
            </div>
          </div>

          <!-- Nhiệm Vụ Hàng Ngày -->
          <h3 class="rank-tiers-title">🎯 Nhiệm vụ hôm nay (+XP nhanh)</h3>
          <div class="quests-container">
            ${Object.entries(quests).map(([k, q]) => `
              <div class="quest-item ${q.done ? 'completed' : ''}">
                <div class="quest-left">
                  <span class="quest-icon">${q.icon}</span>
                  <div>
                    <div class="quest-title">${q.title}</div>
                    <div class="quest-desc">${q.desc} ${q.target ? `(${q.count || 0}/${q.target})` : ''}</div>
                  </div>
                </div>
                <div>
                  ${q.done 
                    ? '<span class="quest-done-tag">✓ Đã xong</span>' 
                    : `<span class="quest-reward">+${q.xp} XP</span>`}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- 8 Bậc Rank -->
          <h3 class="rank-tiers-title">⭐ 8 Cấp bậc Năng lực Hán ngữ</h3>
          <div class="rank-tier-list">
            ${RANKS.map(r => {
              const isUnlocked = xp >= r.minXP;
              const isActive = r.key === info.current.key;
              return `
                <div class="rank-tier-card ${isUnlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}">
                  <span class="rank-tier-icon">${r.icon}</span>
                  <div class="rank-tier-info">
                    <strong>${r.name} ${isActive ? '<span style="color:#7c3aed; font-size:11px;">(Hiện tại)</span>' : ''}</strong>
                    <small>Từ ${r.minXP} XP • ${r.desc}</small>
                  </div>
                  ${isUnlocked ? '<span style="color:#16a34a; font-weight:800; font-size:12px;">✓</span>' : '<span style="color:#94a3b8; font-size:12px;">🔒</span>'}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  }

  // Tự động khởi tạo và điểm danh
  window.addEventListener('DOMContentLoaded', () => {
    getDailyQuests();
    updateRankUI();
  });

  window.Gamification = {
    playTone,
    playSuccessSound,
    playErrorSound,
    playToneContour,
    confetti,
    addXP,
    getTotalXP,
    getRank,
    getRankProgress,
    getDailyQuests,
    updateQuestProgress,
    openRankModal,
    updateRankUI,
    RANKS
  };
})();
