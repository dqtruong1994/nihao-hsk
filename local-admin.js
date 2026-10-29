/**
 * Local Admin Console - Bảng Quản Trị Cục Bộ Độc Lập
 * Cho phép quản trị viên xem danh sách học viên, tiến độ 3 cấp độ,
 * lịch sử kiểm tra và xuất CSV mà không cần tài khoản ChatGPT.
 */
(() => {
  'use strict';

  function initLocalAdmin() {
    const section = document.querySelector('main.admin-access section');
    if (!section) return;

    // Thêm nút mở bảng quản trị Offline
    const localBtn = document.createElement('button');
    localBtn.type = 'button';
    localBtn.className = 'access-button';
    localBtn.style.background = '#0d835f';
    localBtn.style.borderColor = '#0d835f';
    localBtn.style.marginTop = '12px';
    localBtn.innerHTML = '📊 Mở Bảng Quản Trị Cục Bộ (Offline) <span aria-hidden="true">→</span>';
    localBtn.onclick = showLocalDashboard;
    section.appendChild(localBtn);
  }

  function readJSON(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  }

  function showLocalDashboard() {
    const studentName = localStorage.getItem('hskStudentName') || 'Học viên Demo';
    const hsk1Done = readJSON('hsk12done', []);
    const hsk2Done = readJSON('hsk2done', []);
    const hsk3Done = readJSON('hsk3done', []);
    const totalXP = Number(localStorage.getItem('hskXP') || 0);
    const hsk1Score = localStorage.getItem('hsk12score') || '—';
    const hsk2Score = localStorage.getItem('hsk2score') || '—';
    const hsk3Score = localStorage.getItem('hsk3score') || '—';
    const attempts = readJSON('hsk_completed_attempts_archive', []);

    const container = document.querySelector('main.admin-access');
    if (!container) return;

    container.style.maxWidth = '1100px';
    container.style.width = '95%';
    container.style.margin = '40px auto';
    container.style.padding = '30px';
    container.style.background = '#ffffff';
    container.style.borderRadius = '20px';
    container.style.boxShadow = '0 10px 40px rgba(0,0,0,0.1)';

    const totalLessons = hsk1Done.length + hsk2Done.length + hsk3Done.length;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eef0f8; padding-bottom:18px; margin-bottom:24px;">
        <div>
          <span style="font-size:12px; font-weight:800; color:#0d835f; letter-spacing:0.06em;">BẢNG QUẢN TRỊ CỤC BỘ · OFFLINE / HOSTED</span>
          <h1 style="margin:4px 0 0; font-size:26px; color:#1a1e36;">Quản lý Học viên & Tiến độ</h1>
        </div>
        <div style="display:flex; gap:10px;">
          <button type="button" class="access-button" id="exportCsvBtn" style="background:#6657d9; margin:0; padding:10px 18px; font-size:14px;">📥 Xuất file CSV</button>
          <a class="access-back" href="/" style="margin:0; padding:10px 16px; border:1px solid #ddd; border-radius:10px; display:inline-flex; align-items:center;">← Về trang học</a>
        </div>
      </div>

      <!-- Thống kê tổng quan -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:28px;">
        <div style="background:#f9f8ff; border:1px solid #e5e0ff; border-radius:14px; padding:18px;">
          <span style="font-size:13px; color:#6b7280; font-weight:600;">Học viên đang học</span>
          <strong style="display:block; font-size:28px; color:#6657d9; margin-top:4px;">${studentName}</strong>
          <small style="color:#8b90a6;">Dữ liệu lưu trên trình duyệt</small>
        </div>
        <div style="background:#f0fdf4; border:1px solid #dcfce7; border-radius:14px; padding:18px;">
          <span style="font-size:13px; color:#6b7280; font-weight:600;">Tổng bài hoàn thành</span>
          <strong style="display:block; font-size:28px; color:#16a34a; margin-top:4px;">${totalLessons} / 36</strong>
          <small style="color:#8b90a6;">${Math.round(totalLessons / 36 * 100)}% toàn bộ lộ trình</small>
        </div>
        <div style="background:#fefce8; border:1px solid #fef08a; border-radius:14px; padding:18px;">
          <span style="font-size:13px; color:#6b7280; font-weight:600;">Tổng XP tích lũy</span>
          <strong style="display:block; font-size:28px; color:#ca8a04; margin-top:4px;">⭐ ${totalXP}</strong>
          <small style="color:#8b90a6;">Điểm thưởng học tập</small>
        </div>
        <div style="background:#f0f9ff; border:1px solid #e0f2fe; border-radius:14px; padding:18px;">
          <span style="font-size:13px; color:#6b7280; font-weight:600;">Điểm thi gần nhất</span>
          <strong style="display:block; font-size:28px; color:#0284c7; margin-top:4px;">${hsk1Score !== '—' ? hsk1Score : hsk2Score !== '—' ? hsk2Score : hsk3Score}</strong>
          <small style="color:#8b90a6;">HSK 1: ${hsk1Score} | HSK 2: ${hsk2Score} | HSK 3: ${hsk3Score}</small>
        </div>
      </div>

      <!-- Bảng chi tiết tiến độ 3 cấp độ -->
      <h3 style="font-size:18px; margin:0 0 14px; color:#1a1e36;">Chi tiết các cấp độ HSK</h3>
      <div style="overflow-x:auto; margin-bottom:30px;">
        <table style="width:100%; border-collapse:collapse; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0; font-size:13px; color:#64748b;">
              <th style="padding:12px 14px;">Khóa học</th>
              <th style="padding:12px 14px;">Số bài hoàn thành</th>
              <th style="padding:12px 14px;">Tiến độ</th>
              <th style="padding:12px 14px;">Điểm gần nhất</th>
              <th style="padding:12px 14px;">Trạng thái</th>
            </tr>
          </thead>
          <tbody style="font-size:14px; color:#334155;">
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px 14px; font-weight:700; color:#6657d9;">HSK 1 (Nền tảng)</td>
              <td style="padding:12px 14px;">${hsk1Done.length} / 12 bài</td>
              <td style="padding:12px 14px;">
                <div style="background:#e2e8f0; border-radius:999px; height:8px; width:120px; overflow:hidden;">
                  <div style="background:#6657d9; height:100%; width:${Math.round(hsk1Done.length/12*100)}%;"></div>
                </div>
              </td>
              <td style="padding:12px 14px;"><b>${hsk1Score}</b></td>
              <td style="padding:12px 14px;">${hsk1Done.length === 12 ? '<span style="color:#16a34a; font-weight:700;">✓ Hoàn thành</span>' : '<span style="color:#64748b;">Đang học</span>'}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px 14px; font-weight:700; color:#16a34a;">HSK 2 (Tiếp nối)</td>
              <td style="padding:12px 14px;">${hsk2Done.length} / 12 bài</td>
              <td style="padding:12px 14px;">
                <div style="background:#e2e8f0; border-radius:999px; height:8px; width:120px; overflow:hidden;">
                  <div style="background:#16a34a; height:100%; width:${Math.round(hsk2Done.length/12*100)}%;"></div>
                </div>
              </td>
              <td style="padding:12px 14px;"><b>${hsk2Score}</b></td>
              <td style="padding:12px 14px;">${hsk2Done.length === 12 ? '<span style="color:#16a34a; font-weight:700;">✓ Hoàn thành</span>' : '<span style="color:#64748b;">Đang học</span>'}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9;">
              <td style="padding:12px 14px; font-weight:700; color:#0284c7;">HSK 3 (Mở rộng)</td>
              <td style="padding:12px 14px;">${hsk3Done.length} / 12 bài</td>
              <td style="padding:12px 14px;">
                <div style="background:#e2e8f0; border-radius:999px; height:8px; width:120px; overflow:hidden;">
                  <div style="background:#0284c7; height:100%; width:${Math.round(hsk3Done.length/12*100)}%;"></div>
                </div>
              </td>
              <td style="padding:12px 14px;"><b>${hsk3Score}</b></td>
              <td style="padding:12px 14px;">${hsk3Done.length === 12 ? '<span style="color:#16a34a; font-weight:700;">✓ Hoàn thành</span>' : '<span style="color:#64748b;">Đang học</span>'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Tùy chọn quản lý -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#334155; font-size:14px;">Quản lý dữ liệu người học</strong>
          <p style="margin:2px 0 0; font-size:12px; color:#64748b;">Đặt lại tiến độ nếu bạn muốn kiểm tra từ đầu.</p>
        </div>
        <button type="button" id="resetProgressBtn" style="background:#fff; border:1px solid #ef4444; color:#ef4444; padding:8px 14px; border-radius:8px; font-weight:700; cursor:pointer;">⚠️ Đặt lại toàn bộ tiến độ</button>
      </div>
    `;

    // Handler Export CSV
    document.getElementById('exportCsvBtn').onclick = () => {
      const csvRows = [
        ['Tên học viên', 'Tổng bài (36)', 'HSK 1 (12)', 'HSK 2 (12)', 'HSK 3 (12)', 'Tổng XP', 'Điểm HSK 1', 'Điểm HSK 2', 'Điểm HSK 3'],
        [
          studentName,
          totalLessons,
          hsk1Done.length,
          hsk2Done.length,
          hsk3Done.length,
          totalXP,
          hsk1Score,
          hsk2Score,
          hsk3Score
        ]
      ];
      const csvContent = '\uFEFF' + csvRows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hsk-tien-do-hoc-vien-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    // Handler Reset
    document.getElementById('resetProgressBtn').onclick = () => {
      if (confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ học tập và điểm số?')) {
        ['hsk12done', 'hsk2done', 'hsk3done', 'hskXP', 'hsk12score', 'hsk2score', 'hsk3score', 'hsk_srs_cards_v2'].forEach(k => localStorage.removeItem(k));
        alert('Đã đặt lại tiến độ.');
        location.reload();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocalAdmin);
  } else {
    initLocalAdmin();
  }
})();
