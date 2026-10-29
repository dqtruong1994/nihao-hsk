/**
 * Hanzi Canvas - Bảng tập viết chữ Hán trong ô Mễ tự cách (米字格)
 */
(() => {
  'use strict';

  function closeHanziPad() {
    const modal = document.getElementById('hanziWritingModal');
    if (modal) {
      modal.hidden = true;
      modal.classList.add('hidden');
      modal.style.setProperty('display', 'none', 'important');
    }
  }

  function openHanziPad(character, pinyin = '', meaning = '') {
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
          <div style="margin: 10px 0 4px;">
            <span id="hanziPinyinDisplay" style="font-size:20px; font-weight:700; color:#6657d9;"></span>
            <span id="hanziMeaningDisplay" style="color:#71768e; font-size:14px; margin-left:8px;"></span>
          </div>
          <div class="hanzi-grid-box" id="hanziGridBox">
            <div class="hanzi-guide" id="hanziGuideChar">字</div>
            <canvas class="hanzi-canvas" id="hanziDrawCanvas" width="260" height="260"></canvas>
          </div>
          <div class="hanzi-toolbar">
            <button type="button" class="hanzi-btn" id="hanziClearBtn">🔄 Xóa viết lại</button>
            <button type="button" class="hanzi-btn" id="hanziToggleGuideBtn">👁️ Ẩn/Hiện chữ mẫu</button>
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
    }

    modal.hidden = false;
    modal.classList.remove('hidden');
    modal.style.removeProperty('display');
    modal.style.setProperty('display', 'flex', 'important');

    document.getElementById('hanziPinyinDisplay').textContent = pinyin;
    document.getElementById('hanziMeaningDisplay').textContent = meaning ? `(${meaning})` : '';
    const guide = document.getElementById('hanziGuideChar');
    guide.textContent = character;

    const canvas = document.getElementById('hanziDrawCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1e1b4b';

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
      [lastX, lastY] = getPos(e);
      // Vẽ một chấm tròn ngay điểm chạm
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

    let showGuide = true;
    document.getElementById('hanziToggleGuideBtn').onclick = () => {
      showGuide = !showGuide;
      guide.style.opacity = showGuide ? '0.14' : '0';
    };

    document.getElementById('hanziAudioBtn').onclick = () => {
      if (window.HSKAudio) window.HSKAudio.speak(character);
    };
  }

  window.HanziPad = {
    open: openHanziPad,
    close: closeHanziPad
  };
})();
