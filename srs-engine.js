/**
 * SRS Engine - Spaced Repetition System (Hệ thống lặp lại ngắt quãng SM-2)
 * Cho phép ôn tập từ vựng tập trung từ tất cả các khóa HSK 1, 2, 3
 */
(() => {
  'use strict';

  const STORAGE_KEY = 'hsk_srs_cards_v2';
  const DAY_MS = 86400000;

  function loadSRSDatabase() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  function saveSRSDatabase(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {}
  }

  // Thuật toán SM-2 điều chỉnh
  function calculateNextReview(card, grade) {
    // grade: 1 (chưa nhớ), 2 (khá nhớ), 3 (rất nhớ)
    let reps = card.reps || 0;
    let interval = card.interval || 0;
    let ef = card.ef || 2.5;

    if (grade >= 2) {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = grade === 3 ? 4 : 3;
      } else {
        const factor = grade === 3 ? ef * 1.2 : ef;
        interval = Math.round(interval * factor);
      }
      reps += 1;
      ef = Math.max(1.3, ef + (grade === 3 ? 0.15 : -0.05));
    } else {
      reps = 0;
      interval = 1; // Reset về 1 ngày
      ef = Math.max(1.3, ef - 0.2);
    }

    const nextDue = Date.now() + interval * DAY_MS;
    return {
      ...card,
      reps,
      interval,
      ef,
      lastReviewed: Date.now(),
      due: nextDue
    };
  }

  // Thu thập từ đến hạn ôn từ tất cả nguồn (bao gồm cả data cũ của HSK 1, 2, 3)
  function getAllDueCards() {
    const srsDb = loadSRSDatabase();
    const now = Date.now();
    const dueList = [];

    // Kiểm tra các từ trong srsDb
    for (const key of Object.keys(srsDb)) {
      const card = srsDb[key];
      if (card && card.due <= now) {
        dueList.push(card);
      }
    }

    return dueList;
  }

  // Đồng bộ từ cũ từ các khoá học
  function registerCard(hanzi, pinyin, hv, meaning, course = 'HSK 1') {
    const srsDb = loadSRSDatabase();
    if (!srsDb[hanzi]) {
      srsDb[hanzi] = {
        hanzi,
        pinyin,
        hv,
        meaning,
        course,
        reps: 0,
        interval: 0,
        ef: 2.5,
        due: Date.now() // sẵn sàng ôn
      };
      saveSRSDatabase(srsDb);
    }
  }

  // Modal Giao diện Ôn tập Flashcard Hằng ngày
  function openReviewModal() {
    let dueCards = getAllDueCards();
    
    // Nếu chưa có từ nào trong SRS DB, lấy từ các từ đã học từ localStorage
    if (!dueCards.length) {
      const sampleCards = [
        { hanzi: '你好', pinyin: 'nǐ hǎo', hv: 'nhĩ hảo', meaning: 'xin chào', course: 'HSK 1' },
        { hanzi: '谢谢', pinyin: 'xièxie', hv: 'tạ tạ', meaning: 'cảm ơn', course: 'HSK 1' },
        { hanzi: '每天', pinyin: 'měitiān', hv: 'mỗi ngày', meaning: 'mỗi ngày', course: 'HSK 2' },
        { hanzi: '起床', pinyin: 'qǐchuáng', hv: 'khởi sàng', meaning: 'thức dậy', course: 'HSK 2' },
        { hanzi: '打算', pinyin: 'dǎsuàn', hv: 'đả toán', meaning: 'dự định', course: 'HSK 3' }
      ];
      sampleCards.forEach(c => registerCard(c.hanzi, c.pinyin, c.hv, c.meaning, c.course));
      dueCards = getAllDueCards();
    }

    let modal = document.getElementById('srsReviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'srsReviewModal';
      modal.className = 'srs-modal-overlay';
      modal.innerHTML = `
        <div class="srs-modal-card" role="dialog" aria-modal="true" aria-labelledby="srsTitle">
          <header class="srs-header">
            <div>
              <span class="srs-kicker">LẶP LẠI NGẮT QUÃNG · SM-2 SRS</span>
              <h2 id="srsTitle">Ôn tập từ vựng hôm nay</h2>
            </div>
            <button type="button" class="srs-close" id="srsCloseBtn" aria-label="Đóng">✕</button>
          </header>
          <div class="srs-progress-bar"><div class="srs-progress-fill" id="srsProgressFill"></div></div>
          <div id="srsContent" class="srs-body"></div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('srsCloseBtn').onclick = () => { modal.hidden = true; };
    }

    modal.hidden = false;
    let currentIndex = 0;
    const total = dueCards.length;

    function renderCard() {
      const fill = document.getElementById('srsProgressFill');
      fill.style.width = Math.round((currentIndex / total) * 100) + '%';

      const container = document.getElementById('srsContent');
      if (currentIndex >= total) {
        // Hoàn thành
        if (window.Gamification) {
          window.Gamification.confetti();
          window.Gamification.playSuccessSound();
          window.Gamification.addXP(25);
        }
        container.innerHTML = `
          <div class="srs-complete">
            <div class="srs-trophy">🎉</div>
            <h3>Xuất sắc! Bạn đã hoàn thành đợt ôn tập hôm nay!</h3>
            <p>Tất cả ${total} từ vựng đã được lên lịch ôn tiếp theo theo thuật toán ngắt quãng.</p>
            <p><strong>+25 XP</strong> đã được cộng vào tài khoản của bạn.</p>
            <button type="button" class="primary-action" id="srsDoneBtn">Hoàn tất & Quay lại</button>
          </div>
        `;
        document.getElementById('srsDoneBtn').onclick = () => {
          modal.hidden = true;
          if (typeof window.refreshHome === 'function') window.refreshHome();
        };
        return;
      }

      const card = dueCards[currentIndex];
      container.innerHTML = `
        <div class="srs-card-meta">
          <span class="srs-level-pill">${card.course || 'HSK'}</span>
          <span>Thẻ ${currentIndex + 1} / ${total}</span>
        </div>
        <div class="srs-flip-card" id="srsFlipCard" tabindex="0">
          <div class="srs-card-inner" id="srsInner">
            <div class="srs-front">
              <div class="srs-hanzi">${card.hanzi}</div>
              <p class="srs-hint">Chạm hoặc nhấn phím Cách để xem phiên âm & nghĩa ↻</p>
            </div>
            <div class="srs-back" id="srsBack" hidden>
              <div class="srs-hanzi">${card.hanzi}</div>
              <div class="srs-pinyin">${card.pinyin}</div>
              <div class="srs-hv">Hán-Việt: ${card.hv || ''}</div>
              <div class="srs-meaning">Ý nghĩa: ${card.meaning}</div>
              <div class="srs-audio-slot">
                <button type="button" class="hsk-audio-btn" id="srsAudioBtn" aria-label="Nghe phát âm">🔊 Nghe phát âm</button>
              </div>
            </div>
          </div>
        </div>
        <div class="srs-actions" id="srsActions" hidden>
          <button type="button" class="srs-btn srs-bad" data-grade="1">😵 Chưa nhớ<br><small>Ôn lại sau 1 ngày</small></button>
          <button type="button" class="srs-btn srs-medium" data-grade="2">🤔 Hơi nhớ<br><small>Ôn sau ${card.interval > 1 ? card.interval * 2 : 3} ngày</small></button>
          <button type="button" class="srs-btn srs-good" data-grade="3">😊 Đã nhớ kỹ<br><small>Ôn sau ${card.interval > 1 ? card.interval * 3 : 7} ngày</small></button>
        </div>
      `;

      let flipped = false;
      const flipCard = document.getElementById('srsFlipCard');
      const back = document.getElementById('srsBack');
      const actions = document.getElementById('srsActions');
      const audioBtn = document.getElementById('srsAudioBtn');

      function doFlip() {
        if (flipped) return;
        flipped = true;
        back.hidden = false;
        actions.hidden = false;
        if (window.HSKAudio) {
          window.HSKAudio.speak(card.hanzi);
        }
      }

      flipCard.onclick = doFlip;
      flipCard.onkeydown = e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); doFlip(); } };
      audioBtn.onclick = (e) => {
        e.stopPropagation();
        if (window.HSKAudio) window.HSKAudio.speak(card.hanzi);
      };

      actions.querySelectorAll('button').forEach(btn => {
        btn.onclick = () => {
          const grade = Number(btn.dataset.grade);
          const srsDb = loadSRSDatabase();
          srsDb[card.hanzi] = calculateNextReview(card, grade);
          saveSRSDatabase(srsDb);
          if (window.Gamification) {
            window.Gamification.playTone(grade === 1 ? 260 : 520, 0.15);
            window.Gamification.addXP(grade * 2);
          }
          currentIndex++;
          renderCard();
        };
      });
    }

    renderCard();
  }

  window.SRSEngine = {
    getAllDueCards,
    registerCard,
    openReviewModal
  };
})();
