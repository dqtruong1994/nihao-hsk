/**
 * Hanzi Canvas - Bảng tập viết chữ Hán trong ô Mễ tự cách (米字格)
 * Hỗ trợ từ đơn và từ ghép nhiều chữ Hán (tách từng chữ để viết chuẩn, không bị tràn ô)
 */
(() => {
  'use strict';

  let currentWord = '';
  let currentChars = [];
  let currentCharIndex = 0;
  let showGuide = true;

  function closeHanziPad() {
    const modal = document.getElementById('hanziWritingModal');
    if (modal) {
      modal.hidden = true;
      modal.classList.add('hidden');
      modal.style.setProperty('display', 'none', 'important');
    }
  }

  function openHanziPad(word, pinyin = '', meaning = '') {
    const rawWord = String(word || '').trim();
    // Tách riêng từng chữ Hán
    let chars = Array.from(rawWord).filter(ch => /[\u3400-\u9fff\uf900-\ufaff]/u.test(ch));
    if (!chars.length) {
      chars = Array.from(rawWord).filter(ch => ch.trim());
    }
    if (!chars.length) chars = ['字'];

    currentWord = rawWord;
    currentChars = chars;
    currentCharIndex = 0;

    let modal = document.getElementById('hanziWritingModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hanziWritingModal';
      modal.className = 'hanzi-modal-overlay';
      modal.innerHTML = `
        <div class="hanzi-modal-card" role="dialog" aria-modal="true" aria-labelledby="hanziTitle">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="srs-kicker">LUYỆN NÉT THUẬN BÚT</span>
              <h3 id="hanziTitle" style="margin:2px 0 0; font-size:18px;">Tập viết chữ Hán</h3>
            </div>
            <button type="button" class="srs-close" id="hanziCloseBtn" aria-label="Đóng bảng viết">✕</button>
          </div>

          <div style="margin: 10px 0 6px;">
            <span id="hanziPinyinDisplay" style="font-size:20px; font-weight:800; color:#6657d9;"></span>
            <span id="hanziMeaningDisplay" style="color:#64748b; font-size:14px; margin-left:8px;"></span>
          </div>

          <!-- Bộ chuyển chữ nếu là từ ghép nhiều Hán tự -->
          <div id="hanziCharTabs" style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:8px 0 10px;"></div>

          <div class="hanzi-grid-box" id="hanziGridBox">
            <div class="hanzi-guide" id="hanziGuideChar">字</div>
            <canvas class="hanzi-canvas" id="hanziDrawCanvas" width="260" height="260"></canvas>
          </div>

          <!-- Thanh chuyển tiếp chữ trước/sau -->
          <div id="hanziCharNav" style="display:flex; justify-content:space-between; align-items:center; max-width:260px; margin:2px auto 12px;">
            <button type="button" id="hanziPrevCharBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:4px 10px; font-size:12px; font-weight:700; color:#475569; cursor:pointer;">← Chữ trước</button>
            <span id="hanziCharIndexLabel" style="font-size:12px; font-weight:800; color:#6657d9;">Chữ 1 / 1</span>
            <button type="button" id="hanziNextCharBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:4px 10px; font-size:12px; font-weight:700; color:#475569; cursor:pointer;">Chữ tiếp →</button>
          </div>

          <div class="hanzi-toolbar">
            <button type="button" class="hanzi-btn" id="hanziClearBtn">🔄 Xóa viết lại</button>
            <button type="button" class="hanzi-btn" id="hanziToggleGuideBtn">👁️ Ẩn/Hiện mẫu</button>
            <button type="button" class="hanzi-btn" id="hanziAudioBtn">🔊 Nghe đọc</button>
          </div>

          <p style="font-size:12px; color:#888ea8; margin:10px 0 12px;">Dùng chuột hoặc ngón tay để viết vào ô mễ tự cách.</p>
          <button type="button" class="btn" id="hanziDoneBtn" style="width:100%; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:9px; border-radius:10px; font-weight:700; cursor:pointer;">✕ Đóng bảng viết</button>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('hanziCloseBtn').onclick = (e) => {
        e.stopPropagation();
        closeHanziPad();
      };
      const doneBtn = document.getElementById('hanziDoneBtn');
      if (doneBtn) doneBtn.onclick = (e) => {
        e.stopPropagation();
        closeHanziPad();
      };
      modal.onclick = (e) => {
        if (e.target === modal) closeHanziPad();
      };
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden && modal.style.display !== 'none') {
          closeHanziPad();
        }
      });

      // Canvas Drawing Logic
      const canvas = document.getElementById('hanziDrawCanvas');
      const ctx = canvas.getContext('2d');
      let isDrawing = false;
      let lastX = 0, lastY = 0;

      function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return [
          (clientX - rect.left) * (canvas.width / rect.width),
          (clientY - rect.top) * (canvas.height / rect.height)
        ];
      }

      function start(e) {
        e.preventDefault();
        isDrawing = true;
        ctx.lineWidth = 14;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e1b4b';
        [lastX, lastY] = getPos(e);
        ctx.beginPath();
        ctx.arc(lastX, lastY, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      }

      function draw(e) {
        if (!isDrawing) return;
        e.preventDefault();
        const [x, y] = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
      }

      function stop() {
        isDrawing = false;
      }

      canvas.onmousedown = start;
      canvas.onmousemove = draw;
      canvas.onmouseup = stop;
      canvas.onmouseleave = stop;

      canvas.ontouchstart = start;
      canvas.ontouchmove = draw;
      canvas.ontouchend = stop;

      document.getElementById('hanziClearBtn').onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (window.Gamification) window.Gamification.playTone(440, 0.08);
      };

      document.getElementById('hanziToggleGuideBtn').onclick = () => {
        showGuide = !showGuide;
        const guide = document.getElementById('hanziGuideChar');
        if (guide) guide.style.opacity = showGuide ? '0.15' : '0';
      };

      document.getElementById('hanziAudioBtn').onclick = () => {
        if (window.HSKAudio) {
          const char = currentChars[currentCharIndex] || currentWord;
          window.HSKAudio.speak(currentWord || char);
        }
      };

      document.getElementById('hanziPrevCharBtn').onclick = () => {
        if (currentCharIndex > 0) {
          currentCharIndex--;
          renderActiveChar();
        }
      };

      document.getElementById('hanziNextCharBtn').onclick = () => {
        if (currentCharIndex < currentChars.length - 1) {
          currentCharIndex++;
          renderActiveChar();
        }
      };
    }

    modal.hidden = false;
    modal.classList.remove('hidden');
    modal.style.removeProperty('display');
    modal.style.setProperty('display', 'flex', 'important');

    document.getElementById('hanziPinyinDisplay').textContent = pinyin;
    document.getElementById('hanziMeaningDisplay').textContent = meaning ? `(${meaning})` : '';

    renderActiveChar();
  }

  function renderActiveChar() {
    const canvas = document.getElementById('hanziDrawCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const char = currentChars[currentCharIndex] || '字';
    const guide = document.getElementById('hanziGuideChar');
    if (guide) {
      guide.textContent = char;
      guide.style.opacity = showGuide ? '0.15' : '0';
    }

    const tabsContainer = document.getElementById('hanziCharTabs');
    const navContainer = document.getElementById('hanziCharNav');

    if (currentChars.length > 1) {
      if (tabsContainer) {
        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = currentChars.map((c, i) => `
          <button type="button" class="hanzi-char-chip ${i === currentCharIndex ? 'active' : ''}" data-index="${i}">
            ${i + 1}. ${c}
          </button>
        `).join('');

        tabsContainer.querySelectorAll('.hanzi-char-chip').forEach(btn => {
          btn.onclick = () => {
            currentCharIndex = Number(btn.dataset.index);
            renderActiveChar();
          };
        });
      }

      if (navContainer) {
        navContainer.style.display = 'flex';
        const label = document.getElementById('hanziCharIndexLabel');
        if (label) label.textContent = `Chữ ${currentCharIndex + 1} / ${currentChars.length}`;

        const prevBtn = document.getElementById('hanziPrevCharBtn');
        const nextBtn = document.getElementById('hanziNextCharBtn');
        if (prevBtn) {
          prevBtn.disabled = currentCharIndex === 0;
          prevBtn.style.opacity = currentCharIndex === 0 ? '0.4' : '1';
          prevBtn.style.cursor = currentCharIndex === 0 ? 'not-allowed' : 'pointer';
        }
        if (nextBtn) {
          nextBtn.disabled = currentCharIndex === currentChars.length - 1;
          nextBtn.style.opacity = currentCharIndex === currentChars.length - 1 ? '0.4' : '1';
          nextBtn.style.cursor = currentCharIndex === currentChars.length - 1 ? 'not-allowed' : 'pointer';
        }
      }
    } else {
      if (tabsContainer) tabsContainer.style.display = 'none';
      if (navContainer) navContainer.style.display = 'none';
    }
  }

  window.HanziPad = {
    open: openHanziPad,
    close: closeHanziPad
  };
})();
