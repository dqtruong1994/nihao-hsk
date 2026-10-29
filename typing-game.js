/**
 * Pinyin Typing Challenge Game (Thử thách gõ Pinyin ra Hán tự)
 * Trò chơi 60 giây luyện phản xạ gõ bàn phím Hán ngữ và nhận diện mặt chữ
 */
(() => {
  'use strict';

  const VOCAB_BANK = [
    { hanzi: '你好', pinyin: 'nihao', meaning: 'Xin chào', candidates: ['你好', '拟好', '您好'] },
    { hanzi: '谢谢', pinyin: 'xiexie', meaning: 'Cảm ơn', candidates: ['谢谢', '写写', '些些'] },
    { hanzi: '老师', pinyin: 'laoshi', meaning: 'Giáo viên', candidates: ['老师', '老实', '老式'] },
    { hanzi: '学生', pinyin: 'xuesheng', meaning: 'Học sinh', candidates: ['学生', '学省', '学声'] },
    { hanzi: '中国', pinyin: 'zhongguo', meaning: 'Trung Quốc', candidates: ['中国', '中果', '重过'] },
    { hanzi: '朋友', pinyin: 'pengyou', meaning: 'Bạn bè', candidates: ['朋友', '澎友', '鹏友'] },
    { hanzi: '苹果', pinyin: 'pingguo', meaning: 'Quả táo', candidates: ['苹果', '平果', '屏国'] },
    { hanzi: '喝水', pinyin: 'heshui', meaning: 'Uống nước', candidates: ['喝水', '和谁', '河水'] },
    { hanzi: '睡觉', pinyin: 'shuijiao', meaning: 'Đi ngủ', candidates: ['睡觉', '水角', '税交'] },
    { hanzi: '高兴', pinyin: 'gaoxing', meaning: 'Vui vẻ', candidates: ['高兴', '告行', '高星'] },
    { hanzi: '起床', pinyin: 'qichuang', meaning: 'Thức dậy', candidates: ['起床', '起窗', '气窗'] },
    { hanzi: '跑步', pinyin: 'paobu', meaning: 'Chạy bộ', candidates: ['跑步', '跑部', '抛步'] },
    { hanzi: '便宜', pinyin: 'pianyi', meaning: 'Rẻ (giá cả)', candidates: ['便宜', '偏宜', '片衣'] },
    { hanzi: '咖啡', pinyin: 'kafei', meaning: 'Cà phê', candidates: ['咖啡', '卡非', '咖飞'] },
    { hanzi: '帮助', pinyin: 'bangzhu', meaning: 'Giúp đỡ', candidates: ['帮助', '绑扎', '棒主'] },
    { hanzi: '希望', pinyin: 'xiwang', meaning: 'Hy vọng', candidates: ['希望', '西望', '吸网'] },
    { hanzi: '经理', pinyin: 'jingli', meaning: 'Giám đốc / Quản lý', candidates: ['经理', '经历', '精力'] },
    { hanzi: '文件', pinyin: 'wenjian', meaning: 'Tài liệu / Hồ sơ', candidates: ['文件', '问卷', '温健'] },
    { hanzi: '环境', pinyin: 'huanjing', meaning: 'Môi trường', candidates: ['环境', '换镜', '缓境'] },
    { hanzi: '解决', pinyin: 'jiejue', meaning: 'Giải quyết', candidates: ['解决', '捷径', '介决'] },
    { hanzi: '提高', pinyin: 'tigao', meaning: 'Nâng cao', candidates: ['提高', '梯高', '题稿'] },
    { hanzi: '认真', pinyin: 'renzhen', meaning: 'Chăm chỉ / Nghiêm túc', candidates: ['认真', '人真', '任真'] }
  ];

  let timerInterval = null;
  let remainingSeconds = 60;
  let currentWord = null;
  let correctCount = 0;
  let totalAttempted = 0;
  let currentCombo = 0;
  let maxCombo = 0;
  let isPlaying = false;
  let shuffledList = [];

  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function startGame() {
    isPlaying = true;
    remainingSeconds = 60;
    correctCount = 0;
    totalAttempted = 0;
    currentCombo = 0;
    maxCombo = 0;
    shuffledList = shuffle(VOCAB_BANK);

    updateStatsDisplay();
    nextWord();

    const input = document.getElementById('typingInput');
    if (input) {
      input.value = '';
      input.disabled = false;
      input.focus();
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateStatsDisplay();

      if (remainingSeconds <= 0) {
        endGame();
      }
    }, 1000);
  }

  function nextWord() {
    if (shuffledList.length === 0) {
      shuffledList = shuffle(VOCAB_BANK);
    }
    currentWord = shuffledList.pop();

    const meaningEl = document.getElementById('typingTargetMeaning');
    const hintEl = document.getElementById('typingTargetHint');
    const input = document.getElementById('typingInput');
    const candidatesBox = document.getElementById('typingCandidates');

    if (meaningEl) meaningEl.textContent = currentWord.meaning;
    if (hintEl) hintEl.textContent = `Gợi ý Pinyin: ${currentWord.pinyin}`;
    if (input) input.value = '';
    if (candidatesBox) renderCandidates(currentWord.candidates);
  }

  function renderCandidates(candidates) {
    const box = document.getElementById('typingCandidates');
    if (!box) return;

    box.innerHTML = candidates.map((c, i) => `
      <button type="button" class="typing-candidate-btn ${i === 0 ? 'highlight' : ''}" onclick="window.HSKTypingGame.selectCandidate('${c}')">
        ${i + 1}. ${c}
      </button>
    `).join('');
  }

  function selectCandidate(chosenText) {
    if (!isPlaying || !currentWord) return;

    totalAttempted++;
    const isCorrect = chosenText === currentWord.hanzi;

    if (isCorrect) {
      correctCount++;
      currentCombo++;
      if (currentCombo > maxCombo) maxCombo = currentCombo;
      window.Gamification?.playSuccessSound();
    } else {
      currentCombo = 0;
      window.Gamification?.playErrorSound();
    }

    updateStatsDisplay();
    nextWord();
  }

  function handleInputKey(event) {
    if (!isPlaying || !currentWord) return;

    const input = event.target;
    const value = input.value.trim().toLowerCase();

    // 1. Nếu người học gõ phím số 1, 2, 3 để chọn ứng cử viên
    if (['1', '2', '3'].includes(event.key)) {
      event.preventDefault();
      const idx = parseInt(event.key, 10) - 1;
      const c = currentWord.candidates[idx];
      if (c) selectCandidate(c);
      return;
    }

    // 2. Nếu người học gõ Pinyin rồi nhấn Space hoặc Enter
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      if (value === currentWord.pinyin || value === currentWord.hanzi) {
        selectCandidate(currentWord.hanzi);
      } else {
        // Mặc định chọn ứng cử viên số 1
        selectCandidate(currentWord.candidates[0]);
      }
      return;
    }

    // 3. Nếu người dùng dùng bộ gõ tiếng Trung gõ trực tiếp chữ Hán khớp
    if (value.includes(currentWord.hanzi)) {
      selectCandidate(currentWord.hanzi);
    }
  }

  function updateStatsDisplay() {
    const timerEl = document.getElementById('typingTimer');
    const scoreEl = document.getElementById('typingScore');
    const comboEl = document.getElementById('typingCombo');
    const wpmEl = document.getElementById('typingWPM');

    const elapsedMinutes = Math.max(0.1, (60 - remainingSeconds) / 60);
    const wpm = Math.round(correctCount / elapsedMinutes);

    if (timerEl) timerEl.textContent = `${remainingSeconds}s`;
    if (scoreEl) scoreEl.textContent = String(correctCount);
    if (comboEl) comboEl.textContent = `x${currentCombo}`;
    if (wpmEl) wpmEl.textContent = String(wpm);
  }

  function endGame() {
    clearInterval(timerInterval);
    isPlaying = false;

    const input = document.getElementById('typingInput');
    if (input) input.disabled = true;

    const accuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
    const earnedXP = Math.min(50, Math.max(10, correctCount * 3));

    // Thưởng XP và cập nhật Quest
    window.Gamification?.addXP(earnedXP, 'Thử thách gõ Pinyin Hán tự');
    window.Gamification?.updateQuestProgress('typing', 1);

    if (correctCount >= 10) {
      window.Gamification?.confetti();
      window.Gamification?.playSuccessSound();
    }

    const body = document.getElementById('typingModalBody');
    if (body) {
      body.innerHTML = `
        <div class="typing-result-card">
          <div style="font-size:54px;">⌨️🎉</div>
          <span class="typing-result-badge">KẾT QUẢ THỬ THÁCH 60 GIÂY</span>
          <div class="typing-result-score">${correctCount} TỪ ĐÚNG</div>
          
          <div style="display:flex; justify-content:center; gap:24px; margin-bottom:20px; font-size:15px; color:#475569;">
            <span>⚡ Tốc độ: <b>${correctCount} WPM</b></span>
            <span>🎯 Độ chính xác: <b>${accuracy}%</b></span>
            <span>🔥 Combo cao nhất: <b>x${maxCombo}</b></span>
            <span>⭐ Thưởng: <b>+${earnedXP} XP</b></span>
          </div>

          <div style="display:flex; gap:12px; justify-content:center;">
            <button type="button" class="btn" style="background:#6657d9; color:#fff; border:0; padding:12px 24px; border-radius:12px; font-weight:800; cursor:pointer;" onclick="window.HSKTypingGame.restart()">
              🔄 Chơi lại ván mới
            </button>
            <button type="button" class="btn" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:12px 20px; border-radius:12px; font-weight:700; cursor:pointer;" onclick="window.HSKTypingGame.close()">
              Đóng
            </button>
          </div>
        </div>
      `;
    }
  }

  function openTypingModal() {
    const existing = document.getElementById('hskTypingModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hskTypingModal';
    overlay.className = 'typing-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeTypingModal(); };

    overlay.innerHTML = `
      <div class="typing-modal-card">
        <header class="typing-modal-header">
          <h2>⌨️ Thử Thách Gõ Pinyin Ra Chữ Hán (60s)</h2>
          <button type="button" class="rank-modal-close" onclick="window.HSKTypingGame.close()">✕</button>
        </header>

        <div class="typing-stats-bar">
          <div class="typing-stat-item">
            <small>Thời gian</small>
            <strong id="typingTimer" style="color:#e11d48;">60s</strong>
          </div>
          <div class="typing-stat-item">
            <small>Từ đúng</small>
            <strong id="typingScore" style="color:#6657d9;">0</strong>
          </div>
          <div class="typing-stat-item">
            <small>Combo</small>
            <strong id="typingCombo" style="color:#d97706;">x0</strong>
          </div>
          <div class="typing-stat-item">
            <small>Tốc độ WPM</small>
            <strong id="typingWPM" style="color:#0d9488;">0</strong>
          </div>
        </div>

        <div class="typing-modal-body" id="typingModalBody">
          <div class="typing-prompt-box">
            <div id="typingTargetMeaning" class="typing-target-meaning"></div>
            <div id="typingTargetHint" class="typing-target-hint"></div>
          </div>

          <div class="typing-input-wrapper">
            <input type="text" id="typingInput" class="typing-input" placeholder="Gõ Pinyin rồi nhấn Space hoặc Enter..." autocomplete="off" autofocus onkeydown="window.HSKTypingGame.handleKey(event)">
            <div class="typing-candidates" id="typingCandidates"></div>
          </div>

          <p style="text-align:center; font-size:12px; color:#64748b; margin-top:14px;">
            💡 <b>Mẹo gõ:</b> Nhập Pinyin không dấu rồi bấm phím <b>Space</b> hoặc <b>số 1, 2, 3</b> để chọn chữ Hán. Nếu có sẵn bàn phím tiếng Trung, bạn gõ thẳng chữ Hán vào ô!
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    startGame();
  }

  function closeTypingModal() {
    clearInterval(timerInterval);
    isPlaying = false;
    const modal = document.getElementById('hskTypingModal');
    if (modal) modal.remove();
  }

  window.HSKTypingGame = {
    open: openTypingModal,
    close: closeTypingModal,
    restart: () => {
      openTypingModal();
    },
    handleKey: handleInputKey,
    selectCandidate
  };
})();

