/**
 * Verified Certificate Generator (Chứng Chỉ Tốt Nghiệp HSK Chuẩn Vàng Đỏ)
 * Hỗ trợ xuất chứng chỉ bản quyền, ký mộc đỏ & tải ảnh HD PNG 1-Click
 */
(() => {
  'use strict';

  let modalEl = null;
  let studentName = localStorage.getItem('hsk_student_name') || 'Học Viên NiHao HSK';
  let certLevel = 'HSK 1';
  let certCode = '';

  function generateCertCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'HSK-2026-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function getFormattedDate() {
    const d = new Date();
    return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  }

  function initCertificateDOM() {
    if (modalEl) return;

    if (!certCode) certCode = generateCertCode();

    modalEl = document.createElement('div');
    modalEl.id = 'certificateModal';
    modalEl.className = 'certificate-modal-overlay hidden';
    modalEl.setAttribute('hidden', '');
    modalEl.innerHTML = `
      <div class="certificate-dialog-card" role="dialog" aria-modal="true" aria-labelledby="certDialogTitle">
        <div class="certificate-dialog-header">
          <h3 id="certDialogTitle" class="certificate-dialog-title">🎓 Chứng Chỉ Hoàn Thành Khóa Học HSK</h3>
          <button type="button" class="srs-close" id="certModalCloseBtn" style="border:0; background:transparent; font-size:18px; cursor:pointer;" aria-label="Đóng">✕</button>
        </div>

        <div class="certificate-paper-wrap">
          <div class="certificate-paper" id="certificatePaper">
            <div class="certificate-inner-border"></div>

            <div class="cert-header-crest">🏛️</div>
            <h2 class="cert-main-chinese-title">结 业 证 书</h2>
            <div class="cert-english-subtitle">CERTIFICATE OF ACHIEVEMENT</div>

            <div class="cert-recipient-intro">Chứng nhận học viên</div>
            <div class="cert-student-name" id="certStudentNameDisplay">${studentName}</div>

            <div class="cert-statement">
              Đã hoàn thành xuất sắc toàn bộ chương trình giáo trình chuẩn <strong>NiHao HSK</strong>, nắm vững hệ thống từ vựng, cấu trúc ngữ pháp trọng điểm và đối thoại giao tiếp phản xạ tự nhiên.
            </div>

            <div>
              <span class="cert-level-badge" id="certLevelBadge">KHÓA HỌC: ${certLevel} (CHUẨN QUỐC TẾ)</span>
            </div>

            <div class="cert-footer-row">
              <div class="cert-footer-meta">
                <div><strong>Hệ Thống:</strong> NiHao HSK EdTech Platform</div>
                <div><strong>Ngày cấp:</strong> <span id="certDateDisplay">${getFormattedDate()}</span></div>
                <div><strong>Mã xác thực:</strong> <span class="cert-code" id="certCodeDisplay">${certCode}</span></div>
              </div>

              <!-- Mộc đỏ Hoàng gia -->
              <div class="cert-seal">
                <span class="cert-seal-text-top">及格</span>
                <span class="cert-seal-text-main">准予<br/>结业</span>
              </div>
            </div>
          </div>
        </div>

        <div class="certificate-toolbar">
          <div class="cert-name-input-group">
            <label for="certNameInput" style="font-size:12.5px; font-weight:700; color:#475569; white-space:nowrap;">Tên học viên:</label>
            <input type="text" id="certNameInput" class="cert-name-input" value="${studentName}" placeholder="Nhập họ và tên của bạn..." />
          </div>

          <div style="display:flex; gap:10px;">
            <button type="button" class="btn" id="certPrintBtn" style="border:1.5px solid #cbd5e1; background:#ffffff; color:#334155; padding:8px 14px; border-radius:10px; font-weight:700; cursor:pointer;">
              🖨️ In chứng chỉ
            </button>
            <button type="button" class="btn btn-primary" id="certDownloadBtn" style="background:#b45309; border:0; color:#ffffff; padding:8px 18px; border-radius:10px; font-weight:700; cursor:pointer;">
              📥 Tải ảnh HD (PNG)
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    // Event bindings
    document.getElementById('certModalCloseBtn').onclick = closeCertificate;
    modalEl.onclick = (e) => {
      if (e.target === modalEl) closeCertificate();
    };

    const nameInput = document.getElementById('certNameInput');
    nameInput.addEventListener('input', () => {
      const val = nameInput.value.trim() || 'Học Viên NiHao HSK';
      studentName = val;
      localStorage.setItem('hsk_student_name', val);
      document.getElementById('certStudentNameDisplay').textContent = val;
    });

    document.getElementById('certPrintBtn').onclick = () => {
      window.print();
    };

    document.getElementById('certDownloadBtn').onclick = exportToCanvasPNG;
  }

  function exportToCanvasPNG() {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1100;
    const ctx = canvas.getContext('2d');

    // 1. Nền giấy kem cổ điển
    const grad = ctx.createLinearGradient(0, 0, 1600, 1100);
    grad.addColorStop(0, '#fffefb');
    grad.addColorStop(1, '#fcf7ee');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1100);

    // 2. Viền ngoài hoàng gia vàng sẫm & đỏ son
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#b45309';
    ctx.strokeRect(36, 36, 1528, 1028);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.strokeRect(48, 48, 1504, 1004);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(60, 60, 1480, 980);

    // 3. Chữ chìm Watermark HSK
    ctx.save();
    ctx.translate(800, 550);
    ctx.rotate(-15 * Math.PI / 180);
    ctx.font = 'bold 260px serif';
    ctx.fillStyle = 'rgba(180, 83, 9, 0.035)';
    ctx.textAlign = 'center';
    ctx.fillText('HSK', 0, 80);
    ctx.restore();

    // 4. Biểu tượng đỉnh
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️', 800, 150);

    // 5. Tiêu đề Hán tự: 结业证书
    ctx.font = 'bold 72px STKaiti, KaiTi, serif';
    ctx.fillStyle = '#92400e';
    ctx.letterSpacing = '12px';
    ctx.fillText('结 业 证 书', 800, 240);

    // 6. Tiêu đề tiếng Anh: CERTIFICATE OF ACHIEVEMENT
    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#b45309';
    ctx.letterSpacing = '5px';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 800, 290);

    // 7. Lời giới thiệu người nhận
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.letterSpacing = '1px';
    ctx.fillText('Chứng nhận học viên', 800, 380);

    // 8. Tên học viên
    ctx.font = 'bold 58px sans-serif';
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText(studentName, 800, 470);

    // Gạch chân tên
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#b45309';
    const textWidth = ctx.measureText(studentName).width;
    ctx.beginPath();
    ctx.moveTo(800 - textWidth / 2 - 20, 490);
    ctx.lineTo(800 + textWidth / 2 + 20, 490);
    ctx.stroke();

    // 9. Nội dung vinh danh
    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('Đã hoàn thành xuất sắc toàn bộ chương trình giáo trình chuẩn NiHao HSK,', 800, 570);
    ctx.fillText('nắm vững hệ thống từ vựng, ngữ pháp trọng điểm và đối thoại giao tiếp phản xạ.', 800, 615);

    // 10. Huy hiệu cấp độ
    ctx.fillStyle = '#fef3c7';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(500, 680, 600, 52, 26);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 22px sans-serif';
    ctx.fillStyle = '#92400e';
    ctx.fillText(`KHÓA HỌC: ${certLevel.toUpperCase()} (CHUẨN QUỐC TẾ)`, 800, 715);

    // 11. Footer trái: Ngày cấp & Mã xác thực
    ctx.textAlign = 'left';
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Hệ Thống: NiHao HSK EdTech Platform', 100, 890);
    ctx.fillText(`Ngày cấp: ${getFormattedDate()}`, 100, 930);
    ctx.fillText(`Mã xác thực: ${certCode}`, 100, 970);

    // 12. Mộc đỏ (Seal) bên phải
    ctx.save();
    ctx.translate(1360, 910);
    ctx.rotate(-10 * Math.PI / 180);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#dc2626';
    ctx.strokeRect(-65, -65, 130, 130);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 22px STKaiti, KaiTi, serif';
    ctx.fillText('及格', 0, -32);
    ctx.font = 'bold 36px STKaiti, KaiTi, serif';
    ctx.fillText('准予', 0, 8);
    ctx.fillText('结业', 0, 48);
    ctx.restore();

    // 13. Tự động tải file PNG về máy
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Chung_Chi_${certLevel.replace(/\s+/g, '_')}_NiHao_HSK.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (window.HSKAudioFX) {
      window.HSKAudioFX.playVictory();
      window.HSKAudioFX.confetti(60);
    }
  }

  function openCertificate(options = {}) {
    initCertificateDOM();
    if (options.level) {
      certLevel = options.level;
    }
    certCode = generateCertCode();

    const lvlBadge = document.getElementById('certLevelBadge');
    if (lvlBadge) lvlBadge.textContent = `KHÓA HỌC: ${certLevel} (CHUẨN QUỐC TẾ)`;

    const codeDisplay = document.getElementById('certCodeDisplay');
    if (codeDisplay) codeDisplay.textContent = certCode;

    const dateDisplay = document.getElementById('certDateDisplay');
    if (dateDisplay) dateDisplay.textContent = getFormattedDate();

    modalEl.removeAttribute('hidden');
    modalEl.classList.remove('hidden');
    modalEl.style.display = 'flex';

    if (window.HSKAudioFX) {
      window.HSKAudioFX.playVictory();
      window.HSKAudioFX.confetti(80);
    }
  }

  function closeCertificate() {
    if (!modalEl) return;
    modalEl.setAttribute('hidden', '');
    modalEl.classList.add('hidden');
    modalEl.style.display = 'none';
  }

  window.HSKCertificate = {
    open: openCertificate,
    close: closeCertificate,
    download: exportToCanvasPNG
  };
})();
