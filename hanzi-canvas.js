/**
 * Hanzi Canvas - Bảng tập viết chữ Hán trong ô Mễ tự cách (米字格)
 * Hướng dẫn tập viết chuẩn Bút Thuận:
 * - Chữ mẫu đậm nét, rõ ràng, dễ đồ theo
 * - Đánh số thứ tự nét 1, 2, 3... kèm mũi tên chỉ hướng bút vẽ sát từng nét
 * - Hoạt họa từng nét viết theo chuẩn thư pháp (HanziWriter Animation)
 * - Hỗ trợ cả từ đơn và từ ghép nhiều chữ Hán
 */
(() => {
  'use strict';

  let currentWord = '';
  let currentChars = [];
  let currentCharIndex = 0;
  let guideContrast = 'dark'; // 'dark' (0.52) | 'medium' (0.26) | 'off' (0)
  let showStrokeNumbers = true; // Bật sẵn số thứ tự nét và mũi tên
  let currentWriter = null;
  let hanziWriterLoadedPromise = null;
  const strokeDataCache = {};

  // Nạp thư viện HanziWriter (hỗ trợ cả offline file local và CDN fallback)
  function ensureHanziWriter() {
    if (window.HanziWriter) return Promise.resolve(window.HanziWriter);
    if (hanziWriterLoadedPromise) return hanziWriterLoadedPromise;

    hanziWriterLoadedPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      // Đường dẫn file local đã tải về trong dự án
      const basePath = location.pathname.includes('/admin/') ? '../hanzi-writer.min.js' : 'hanzi-writer.min.js';
      script.src = basePath;
      script.onload = () => resolve(window.HanziWriter || null);
      script.onerror = () => {
        // Fallback nạp từ CDN nếu chạy môi trường khác
        const cdnScript = document.createElement('script');
        cdnScript.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
        cdnScript.onload = () => resolve(window.HanziWriter || null);
        cdnScript.onerror = () => resolve(null);
        document.head.appendChild(cdnScript);
      };
      document.head.appendChild(script);
    });

    return hanziWriterLoadedPromise;
  }

  // Tải dữ liệu nét bút (strokes & medians) với cơ chế lưu cache Storage
  async function fetchStrokeData(char) {
    if (strokeDataCache[char]) return strokeDataCache[char];

    const cacheKey = 'hsk_hanzi_strokes_v2_' + char;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        strokeDataCache[char] = parsed;
        return parsed;
      }
    } catch {}

    try {
      const url = 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/' + encodeURIComponent(char) + '.json';
      const resp = await fetch(url);
      if (resp.ok) {
        const data = await resp.json();
        strokeDataCache[char] = data;
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
        return data;
      }
    } catch {}

    return null;
  }

  // Tính toán vị trí và góc hướng của từng nét bút
  function calculateStrokeMarkers(medians, width = 260, height = 260, padding = 15) {
    if (!Array.isArray(medians) || !medians.length) return [];
    const markers = [];
    const drawW = width - padding * 2;
    const drawH = height - padding * 2;

    for (let i = 0; i < medians.length; i++) {
      const med = medians[i];
      if (!med || !med.length) continue;
      const p0 = med[0];

      // Tìm điểm cách điểm bắt đầu tối thiểu 70 đơn vị tọa độ để xác định chuẩn hướng vung bút
      let chosenPt = med[med.length - 1];
      for (let j = 1; j < med.length; j++) {
        const dist = Math.hypot(med[j][0] - p0[0], p0[1] - med[j][1]);
        if (dist >= 70) {
          chosenPt = med[j];
          break;
        }
      }

      const dx = chosenPt[0] - p0[0];
      const dy = p0[1] - chosenPt[1]; // Trong hệ tọa độ màn hình, trục Y hướng xuống
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = ((angleRad * 180 / Math.PI) + 360) % 360;

      let x = padding + (p0[0] / 1024) * drawW;
      let y = padding + ((900 - p0[1]) / 1024) * drawH;

      // Giới hạn trong khung kẻ ô
      x = Math.max(16, Math.min(width - 16, x));
      y = Math.max(16, Math.min(height - 16, y));

      // Tránh đè số khi điểm bắt đầu của 2 nét nằm sát nhau
      for (const prev of markers) {
        const d = Math.hypot(x - prev.x, y - prev.y);
        if (d < 22) {
          const perpAngle = angleRad + Math.PI / 2;
          x += Math.cos(perpAngle) * 15;
          y += Math.sin(perpAngle) * 15;
          x = Math.max(16, Math.min(width - 16, x));
          y = Math.max(16, Math.min(height - 16, y));
        }
      }

      markers.push({
        index: i + 1,
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        angleDeg: Number(angleDeg.toFixed(0))
      });
    }

    return markers;
  }

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
        <div class="hanzi-modal-card" role="dialog" aria-modal="true" aria-labelledby="hanziTitle" style="max-width: 440px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span class="srs-kicker" style="color:#6657d9; font-weight:800; font-size:11px; letter-spacing:0.05em;">HƯỚNG DẪN TẬP VIẾT BÚT THUẬN</span>
              <h3 id="hanziTitle" style="margin:2px 0 0; font-size:19px; color:#1e1b4b;">Tập viết chữ Hán</h3>
            </div>
            <button type="button" class="srs-close" id="hanziCloseBtn" aria-label="Đóng bảng viết">✕</button>
          </div>

          <div style="margin: 8px 0 4px; display:flex; align-items:baseline; justify-content:center; gap:8px;">
            <span id="hanziPinyinDisplay" style="font-size:22px; font-weight:800; color:#6657d9;"></span>
            <span id="hanziMeaningDisplay" style="color:#64748b; font-size:14px;"></span>
          </div>

          <!-- Bộ chuyển chữ nếu là từ ghép nhiều Hán tự -->
          <div id="hanziCharTabs" style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin:6px 0 8px;"></div>

          <!-- Huy hiệu thông tin nét bút -->
          <div id="hanziStrokeInfoBar" style="font-size:12px; font-weight:700; color:#475569; margin-bottom:4px;"></div>

          <!-- Ô Mễ tự cách (Rice Grid Box) -->
          <div class="hanzi-grid-box" id="hanziGridBox">
            <!-- HanziWriter SVG render layer -->
            <div id="hanziWriterTarget" class="hanzi-writer-layer"></div>
            <!-- Chữ mẫu nét đậm chữ chuẩn -->
            <div class="hanzi-guide" id="hanziGuideChar">字</div>
            <!-- Layer số thứ tự nét 1, 2, 3... và mũi tên chỉ hướng vẽ -->
            <div class="hanzi-stroke-badges" id="hanziStrokeBadges"></div>
            <!-- Canvas viết đè lên -->
            <canvas class="hanzi-canvas" id="hanziDrawCanvas" width="260" height="260"></canvas>
          </div>

          <!-- Thanh chuyển tiếp chữ trước/sau -->
          <div id="hanziCharNav" style="display:flex; justify-content:space-between; align-items:center; max-width:260px; margin:2px auto 10px;">
            <button type="button" id="hanziPrevCharBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:4px 10px; font-size:12px; font-weight:700; color:#475569; cursor:pointer;">← Chữ trước</button>
            <span id="hanziCharIndexLabel" style="font-size:12px; font-weight:800; color:#6657d9;">Chữ 1 / 1</span>
            <button type="button" id="hanziNextCharBtn" style="background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; padding:4px 10px; font-size:12px; font-weight:700; color:#475569; cursor:pointer;">Chữ tiếp →</button>
          </div>

          <!-- Banner giải thích thứ tự nét -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:6px 12px; margin:0 auto 10px; max-width:340px; font-size:11.5px; color:#475569; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>💡</span>
            <span>Viết theo số thứ tự <b>① ② ③...</b> theo chiều mũi tên chỉ dẫn.</span>
          </div>

          <!-- Thanh công cụ điều khiển -->
          <div class="hanzi-toolbar" style="display:flex; gap:8px; justify-content:center; flex-wrap:wrap;">
            <button type="button" class="hanzi-btn" id="hanziClearBtn" title="Xóa toàn bộ nét đã viết">
              🔄 Xóa viết lại
            </button>
            <button type="button" class="hanzi-btn" id="hanziAnimateBtn" title="Xem chuyển động từng nét theo thứ tự">
              ▶ Xem nét vẽ
            </button>
            <button type="button" class="hanzi-btn" id="hanziToggleNumbersBtn" title="Bật/Tắt số thứ tự 1, 2, 3 và mũi tên">
              🔢 Số nét: Bật
            </button>
            <button type="button" class="hanzi-btn" id="hanziToggleGuideBtn" title="Đổi độ đậm chữ mẫu hoặc ẩn mẫu">
              👁️ Mẫu: Đậm
            </button>
            <button type="button" class="hanzi-btn" id="hanziAudioBtn" title="Nghe phát âm chuẩn">
              🔊 Nghe đọc
            </button>
          </div>

          <p style="font-size:11px; color:#94a3b8; margin:10px 0 10px;">Dùng chuột hoặc ngón tay để đồ theo chữ mẫu trong ô mễ tự cách.</p>
          <button type="button" class="btn" id="hanziDoneBtn" style="width:100%; background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:9px; border-radius:10px; font-weight:700; cursor:pointer;">✕ Đóng bảng viết</button>
        </div>
      `;
      document.body.appendChild(modal);

      // Đóng modal
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
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a'; // Nét mực đậm đen than chuẩn mực
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

      // Nút Xóa viết lại
      document.getElementById('hanziClearBtn').onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (window.Gamification) window.Gamification.playTone(440, 0.08);
      };

      // Nút Xem nét vẽ hoạt họa
      document.getElementById('hanziAnimateBtn').onclick = () => {
        if (currentWriter) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          currentWriter.animateCharacter();
        }
      };

      // Nút Bật/Tắt số thứ tự nét và mũi tên
      const btnToggleNum = document.getElementById('hanziToggleNumbersBtn');
      btnToggleNum.onclick = () => {
        showStrokeNumbers = !showStrokeNumbers;
        btnToggleNum.textContent = showStrokeNumbers ? '🔢 Số nét: Bật' : '🔢 Số nét: Tắt';
        btnToggleNum.style.background = showStrokeNumbers ? '#f5f3ff' : '#f1f5f9';
        const badgesBox = document.getElementById('hanziStrokeBadges');
        if (badgesBox) badgesBox.style.display = showStrokeNumbers ? 'block' : 'none';
      };

      // Nút Chỉnh độ đậm chữ mẫu (Đậm -> Vừa -> Ẩn)
      const btnToggleGuide = document.getElementById('hanziToggleGuideBtn');
      btnToggleGuide.onclick = () => {
        if (guideContrast === 'dark') {
          guideContrast = 'medium';
          btnToggleGuide.textContent = '👁️ Mẫu: Vừa';
        } else if (guideContrast === 'medium') {
          guideContrast = 'off';
          btnToggleGuide.textContent = '👁️ Mẫu: Ẩn';
        } else {
          guideContrast = 'dark';
          btnToggleGuide.textContent = '👁️ Mẫu: Đậm';
        }
        updateGuideOpacity();
      };

      // Nút Nghe đọc
      document.getElementById('hanziAudioBtn').onclick = () => {
        if (window.HSKAudio) {
          const char = currentChars[currentCharIndex] || currentWord;
          window.HSKAudio.speak(currentWord || char);
        }
      };

      // Chữ trước / Chữ tiếp
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

    // Khởi tạo trạng thái ban đầu
    guideContrast = 'dark';
    showStrokeNumbers = true;
    const btnNum = document.getElementById('hanziToggleNumbersBtn');
    if (btnNum) {
      btnNum.textContent = '🔢 Số nét: Bật';
      btnNum.style.background = '#f5f3ff';
    }
    const btnGuide = document.getElementById('hanziToggleGuideBtn');
    if (btnGuide) btnGuide.textContent = '👁️ Mẫu: Đậm';

    // Nạp HanziWriter background
    ensureHanziWriter().then(() => {
      renderActiveChar();
    });

    renderActiveChar();
  }

  function updateGuideOpacity() {
    let opacityVal = '0.58';
    let targetOpacity = '0.65';
    if (guideContrast === 'medium') {
      opacityVal = '0.28';
      targetOpacity = '0.30';
    }
    if (guideContrast === 'off') {
      opacityVal = '0';
      targetOpacity = '0';
    }

    const guide = document.getElementById('hanziGuideChar');
    if (guide) guide.style.opacity = opacityVal;

    const target = document.getElementById('hanziWriterTarget');
    if (target) target.style.opacity = targetOpacity;
  }

  async function renderActiveChar() {
    const canvas = document.getElementById('hanziDrawCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const char = currentChars[currentCharIndex] || '字';
    const guide = document.getElementById('hanziGuideChar');
    const target = document.getElementById('hanziWriterTarget');
    const badgesBox = document.getElementById('hanziStrokeBadges');
    const infoBar = document.getElementById('hanziStrokeInfoBar');

    // Chữ mẫu mặc định font thư pháp đậm nét
    if (guide) {
      guide.textContent = char;
      guide.style.display = 'flex';
      updateGuideOpacity();
    }
    if (badgesBox) {
      badgesBox.innerHTML = '';
      badgesBox.style.display = showStrokeNumbers ? 'block' : 'none';
    }

    // Cập nhật tab chữ nếu từ ghép
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

    // Tải dữ liệu nét bút của chữ
    const strokeData = await fetchStrokeData(char);

    if (strokeData && strokeData.medians) {
      const strokeCount = strokeData.medians.length;
      if (infoBar) {
        infoBar.innerHTML = `<span style="color:#6657d9; font-weight:800; font-size:14px;">${char}</span> · <b>${strokeCount} nét</b> thuận bút`;
      }

      // 1. Tạo số thứ tự nét 1, 2, 3... kèm mũi tên chỉ hướng
      const markers = calculateStrokeMarkers(strokeData.medians, 260, 260);
      if (badgesBox && showStrokeNumbers) {
        badgesBox.innerHTML = markers.map(m => `
          <div class="stroke-guide-marker" style="left:${m.x}px; top:${m.y}px;" title="Nét ${m.index}: Viết theo hướng mũi tên">
            <span class="stroke-num-badge">${m.index}</span>
            <span class="stroke-arrow-wrap" style="transform: rotate(${m.angleDeg}deg);">
              <svg viewBox="0 0 16 16" width="10" height="10" style="display:block;">
                <path d="M2 8h10M8 4l4 4-4 4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </div>
        `).join('');
      }

      // 2. Khởi tạo HanziWriter vector
      if (window.HanziWriter && target) {
        target.innerHTML = '';
        try {
          currentWriter = window.HanziWriter.create(target, char, {
            width: 260,
            height: 260,
            padding: 15,
            showOutline: true,
            strokeAnimationSpeed: 1.1,
            delayBetweenStrokes: 180,
            strokeColor: '#312e81',
            outlineColor: '#818cf8',
            drawingColor: '#0f172a',
            drawingWidth: 15,
            showCharacter: true,
            charDataLoader: (c, onComplete) => {
              onComplete(strokeData);
            }
          });
          // Ẩn chữ font thường khi HanziWriter vector nét đậm đã sẵn sàng
          if (guide) guide.style.display = 'none';
        } catch {
          if (guide) guide.style.display = 'flex';
        }
      }
    } else {
      if (infoBar) {
        infoBar.innerHTML = `<span style="color:#6657d9; font-weight:800; font-size:14px;">${char}</span> · Bảng luyện chữ chuẩn`;
      }
      if (guide) guide.style.display = 'flex';
      if (target) target.innerHTML = '';
      currentWriter = null;
    }
  }

  window.HanziPad = {
    open: openHanziPad,
    close: closeHanziPad
  };
})();
