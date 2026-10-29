/**
 * Nihao HSK - Admin Portal Controller
 * Full CRUD for Lessons, Menus, Vocabulary, Users & RBAC
 */
(() => {
  'use strict';

  let currentTab = 'dashboard';
  let activeLevel = 'hsk1';

  function init() {
    const user = window.HSKAuth?.getCurrentUser();
    const app = document.getElementById('adminApp');
    if (!app) return;

    if (!user || user.role !== 'admin') {
      renderAdminLogin(app);
      return;
    }

    renderAdminDashboard(app, user);
  }

  // --- 1. Màn hình Đăng nhập Admin nếu chưa xác thực ---
  function renderAdminLogin(container) {
    const homeLink = location.pathname.endsWith('/admin') || location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
    container.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 20px;">
        <div style="background: #ffffff; border-radius: 24px; padding: 36px 32px; width: 100%; max-width: 440px; box-shadow: 0 25px 60px rgba(0,0,0,0.3); text-align: center;">
          <div style="background: #6657d9; color: #fff; width: 48px; height: 48px; border-radius: 14px; font-size: 24px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">中</div>
          <span style="display:block; font-size: 11px; font-weight: 800; color: #6657d9; letter-spacing: 0.1em; text-transform: uppercase;">TRANG QUẢN TRỊ VIÊN</span>
          <h2 style="font-size: 22px; color: #0f172a; margin: 4px 0 16px;">Đăng nhập Quản trị HSK</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Chỉ tài khoản có phân quyền <b>Admin</b> mới được quyền truy cập các tính năng CRUD hệ thống.</p>
          <form id="adminLoginForm" style="display: flex; flex-direction: column; gap: 14px; text-align: left;">
            <div>
              <label style="font-size: 13px; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Tên đăng nhập Admin</label>
              <input type="text" id="adminUser" required placeholder="admin" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 11px 14px; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>
            <div>
              <label style="font-size: 13px; font-weight: 600; color: #334155; display: block; margin-bottom: 4px;">Mật khẩu</label>
              <input type="password" id="adminPass" required placeholder="••••••••" style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 11px 14px; font-size: 14px; outline: none; box-sizing: border-box;">
            </div>
            <div id="adminLoginError" style="color: #ef4444; font-size: 13px; min-height: 18px;"></div>
            <button type="submit" style="background: #6657d9; color: #fff; border: 0; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;">Đăng nhập Hệ thống →</button>
          </form>
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #64748b;">
            Tài khoản mặc định: <b>admin</b> / Mật khẩu: <b>admin@nihao123</b>
          </div>
          <div style="margin-top: 14px;">
            <a href="${homeLink}" style="color: #6657d9; text-decoration: none; font-size: 13px; font-weight: 600;">← Về trang học công khai</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById('adminLoginForm').onsubmit = async (e) => {
      e.preventDefault();
      const u = document.getElementById('adminUser').value;
      const p = document.getElementById('adminPass').value;
      const err = document.getElementById('adminLoginError');
      err.textContent = '';
      try {
        const user = await window.HSKAuth.login(u, p);
        if (user.role !== 'admin') {
          window.HSKAuth.logout();
          throw new Error('Tài khoản này là Học viên, không có quyền quản trị viên.');
        }
        init();
      } catch (e) {
        err.textContent = e.message;
      }
    };
  }

  // --- 2. Giao diện Quản trị Chính (Main Dashboard) ---
  function renderAdminDashboard(container, user) {
    const homeLink = location.pathname.endsWith('/admin') || location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
    container.innerHTML = `
      <div class="admin-layout">
        <!-- Sidebar -->
        <aside class="admin-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-logo">中</div>
            <div class="sidebar-title">
              你好 HSK
              <small>QUẢN TRỊ HỆ THỐNG</small>
            </div>
          </div>
          <nav class="sidebar-nav">
            <button type="button" class="nav-item ${currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
              📊 Tổng quan
            </button>
            <button type="button" class="nav-item ${currentTab === 'lessons' ? 'active' : ''}" data-tab="lessons">
              📚 Quản lý Bài học
            </button>
            <button type="button" class="nav-item ${currentTab === 'menus' ? 'active' : ''}" data-tab="menus">
              🧭 Quản lý Menu
            </button>
            <button type="button" class="nav-item ${currentTab === 'vocab' ? 'active' : ''}" data-tab="vocab">
              🗂 Quản lý Từ vựng
            </button>
            <button type="button" class="nav-item ${currentTab === 'users' ? 'active' : ''}" data-tab="users">
              👥 Người dùng & Quyền
            </button>
            <button type="button" class="nav-item ${currentTab === 'settings' ? 'active' : ''}" data-tab="settings">
              ⚙️ Cài đặt & Sao lưu
            </button>
          </nav>
          <div class="sidebar-footer">
            <div class="user-badge">
              <div>
                <strong>${user.fullName || user.username}</strong>
                <small>Quyền: Admin</small>
              </div>
              <button type="button" class="btn-logout" id="adminLogoutBtn">Đăng xuất</button>
            </div>
          </div>
        </aside>

        <!-- Main View -->
        <div class="admin-main">
          <header class="admin-topbar">
            <div class="page-title">
              <h1 id="adminPageHeader">Tổng quan Hệ thống</h1>
              <p id="adminPageSub">Xem thống kê hoạt động, khóa học và học viên.</p>
            </div>
            <div class="topbar-actions">
              <a href="${homeLink}" target="_blank" class="btn-secondary" style="display:inline-flex; align-items:center; gap:6px; text-decoration:none;">
                🌐 Xem Website ↗
              </a>
            </div>
          </header>
          <main class="admin-content" id="adminMainContent"></main>
        </div>
      </div>
      <div id="adminModalHost"></div>
    `;

    // Sidebar navigation click
    container.querySelectorAll('.nav-item').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTab = btn.dataset.tab;
        renderTabContent();
      };
    });

    document.getElementById('adminLogoutBtn').onclick = () => {
      window.HSKAuth.logout();
      location.reload();
    };

    renderTabContent();
  }

  function renderTabContent() {
    const main = document.getElementById('adminMainContent');
    const title = document.getElementById('adminPageHeader');
    const sub = document.getElementById('adminPageSub');
    if (!main) return;

    if (currentTab === 'dashboard') {
      title.textContent = 'Tổng quan Hệ thống';
      sub.textContent = 'Thống kê hoạt động, số lượng bài học, từ vựng và học viên.';
      renderDashboardTab(main);
    } else if (currentTab === 'lessons') {
      title.textContent = 'Quản lý Bài học (Lessons CRUD)';
      sub.textContent = 'Thêm, sửa, xóa nội dung bài giảng, từ vựng và câu hỏi trắc nghiệm của từng cấp độ.';
      renderLessonsTab(main);
    } else if (currentTab === 'menus') {
      title.textContent = 'Quản lý Menu & Điều hướng';
      sub.textContent = 'Tùy chỉnh danh sách liên kết trên thanh điều hướng trang chủ.';
      renderMenusTab(main);
    } else if (currentTab === 'vocab') {
      title.textContent = 'Quản lý Từ vựng (Vocabulary)';
      sub.textContent = 'Tìm kiếm, bổ sung và phân loại từ vựng cho toàn bộ các cấp độ HSK.';
      renderVocabTab(main);
    } else if (currentTab === 'users') {
      title.textContent = 'Quản lý Người dùng & Phân quyền';
      sub.textContent = 'Quản lý tài khoản học viên, nâng/hạ quyền Admin và kiểm soát trạng thái hoạt động.';
      renderUsersTab(main);
    } else if (currentTab === 'settings') {
      title.textContent = 'Cài đặt & Sao lưu Hệ thống';
      sub.textContent = 'Cấu hình thông báo, xuất/nhập file sao lưu JSON.';
      renderSettingsTab(main);
    }
  }

  // --- TAB 1: TỔNG QUAN (DASHBOARD) ---
  function renderDashboardTab(container) {
    const users = window.HSKAuth.getAllUsers();
    const menus = window.HSKData.getMenus();
    const hsk1Done = JSON.parse(localStorage.getItem('hsk12done') || '[]');
    const hsk2Done = JSON.parse(localStorage.getItem('hsk2done') || '[]');
    const hsk3Done = JSON.parse(localStorage.getItem('hsk3done') || '[]');
    const totalXP = Number(localStorage.getItem('hskXP') || 0);

    container.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header"><span>TỔNG HỌC VIÊN</span><span class="metric-icon">👥</span></div>
          <div class="metric-value">${users.length}</div>
          <div class="metric-sub">${users.filter(u => u.role === 'admin').length} Quản trị viên · ${users.filter(u => u.role === 'student').length} Học viên</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>TỔNG BÀI HỌC</span><span class="metric-icon">📚</span></div>
          <div class="metric-value">36</div>
          <div class="metric-sub">12 HSK 1 · 12 HSK 2 · 12 HSK 3</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>TỔNG TỪ VỰNG</span><span class="metric-icon">🗂</span></div>
          <div class="metric-value">300+</div>
          <div class="metric-sub">Đã tích hợp âm thanh & tập viết</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>ĐIỂM XP ĐÃ TÍCH LŨY</span><span class="metric-icon">⭐</span></div>
          <div class="metric-value">${totalXP}</div>
          <div class="metric-sub">${hsk1Done.length + hsk2Done.length + hsk3Done.length}/36 bài đã học</div>
        </div>
      </div>

      <div class="admin-card">
        <div class="card-header">
          <h3>Trạng thái Khóa học & Tiến độ Toàn site</h3>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Cấp độ</th>
                <th>Số bài</th>
                <th>Tiêu điểm</th>
                <th>Hội thoại giáo trình</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>HSK 1</b></td>
                <td>12 bài</td>
                <td>Pinyin, 4 thanh điệu, câu giao tiếp nền tảng</td>
                <td><span class="badge badge-active">✓ Đã bật (12 bài)</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk1')">Mở học ↗</button></td>
              </tr>
              <tr>
                <td><b>HSK 2</b></td>
                <td>12 bài</td>
                <td>Mở rộng ngữ pháp, câu ghép, đời sống</td>
                <td><span class="badge badge-active">✓ Đã bật (12 bài mới)</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk2')">Mở học ↗</button></td>
              </tr>
              <tr>
                <td><b>HSK 3</b></td>
                <td>12 bài</td>
                <td>Giao tiếp chủ đề, công việc, du lịch</td>
                <td><span class="badge badge-active">✓ Đã bật</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk3')">Mở học ↗</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- TAB 2: QUẢN LÝ BÀI HỌC (LESSONS CRUD) ---
  function renderLessonsTab(container) {
    const customList = window.HSKData.getCustomLessons(activeLevel);

    // Mẫu 12 bài học mặc định
    const defaultLessons = Array.from({ length: 12 }, (_, i) => ({
      number: i + 1,
      title: `Bài ${i + 1}`,
      topicZh: i === 0 ? '你好' : `Bài học số ${i + 1}`,
      topicPy: i === 0 ? 'Nǐ hǎo' : '',
      topicVi: i === 0 ? 'Xin chào' : '',
      description: 'Bài học tiêu chuẩn theo chương trình.'
    }));

    // Hợp nhất dữ liệu
    const merged = defaultLessons.map(dl => {
      const custom = customList.find(cl => cl.number === dl.number);
      return custom ? { ...dl, ...custom, isCustomized: true } : dl;
    });

    // Thêm các bài tùy biến bổ sung nếu có (bài 13, 14, ...)
    customList.forEach(cl => {
      if (!merged.some(m => m.number === cl.number)) {
        merged.push({ ...cl, isCustomized: true });
      }
    });

    merged.sort((a, b) => a.number - b.number);

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <div class="filter-tabs">
            <button type="button" class="filter-tab ${activeLevel === 'hsk1' ? 'active' : ''}" data-level="hsk1">HSK 1</button>
            <button type="button" class="filter-tab ${activeLevel === 'hsk2' ? 'active' : ''}" data-level="hsk2">HSK 2</button>
            <button type="button" class="filter-tab ${activeLevel === 'hsk3' ? 'active' : ''}" data-level="hsk3">HSK 3</button>
          </div>
          <button type="button" class="btn-primary" id="btnAddNewLesson">+ Thêm bài học mới</button>
        </div>

        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 70px;">Bài #</th>
                <th>Tiêu đề bài học</th>
                <th>Câu chủ đề (Hán tự)</th>
                <th>Pinyin & Bản dịch</th>
                <th>Trạng thái</th>
                <th style="width: 140px; text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${merged.map(l => `
                <tr>
                  <td><b>${l.number}</b></td>
                  <td><strong>${l.title}</strong></td>
                  <td><span style="font-size:18px; font-family:STKaiti,KaiTi,serif; color:#6657d9;">${l.topicZh || '—'}</span></td>
                  <td>
                    <div>${l.topicPy || ''}</div>
                    <small style="color:#64748b;">${l.topicVi || ''}</small>
                  </td>
                  <td>${l.isCustomized ? '<span class="badge badge-active">Đã tùy biến</span>' : '<span class="badge" style="background:#e2e8f0; color:#475569;">Mặc định</span>'}</td>
                  <td style="text-align: right;">
                    <button type="button" class="btn-secondary btn-sm btn-edit-lesson" data-num="${l.number}">Sửa</button>
                    ${l.isCustomized ? `<button type="button" class="btn-danger btn-sm btn-del-lesson" data-num="${l.number}" style="margin-left:4px;">Đặt lại</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Filter level
    container.querySelectorAll('.filter-tab').forEach(b => {
      b.onclick = () => {
        activeLevel = b.dataset.level;
        renderLessonsTab(container);
      };
    });

    // Add new lesson
    document.getElementById('btnAddNewLesson').onclick = () => {
      openLessonModal({
        number: merged.length + 1,
        title: `Bài ${merged.length + 1}`,
        topicZh: '',
        topicPy: '',
        topicVi: '',
        description: ''
      });
    };

    // Edit lesson
    container.querySelectorAll('.btn-edit-lesson').forEach(btn => {
      btn.onclick = () => {
        const num = Number(btn.dataset.num);
        const l = merged.find(item => item.number === num);
        if (l) openLessonModal(l);
      };
    });

    // Delete / Reset lesson
    container.querySelectorAll('.btn-del-lesson').forEach(btn => {
      btn.onclick = () => {
        const num = Number(btn.dataset.num);
        if (confirm(`Bạn có chắc muốn đặt lại Bài ${num} về nội dung mặc định?`)) {
          window.HSKData.deleteLesson(activeLevel, num);
          renderLessonsTab(container);
        }
      };
    });
  }

  function openLessonModal(lesson) {
    const host = document.getElementById('adminModalHost');
    host.innerHTML = `
      <div class="admin-modal-overlay">
        <div class="admin-modal">
          <div class="admin-modal-header">
            <h3>Chỉnh sửa Bài học: ${lesson.title || `Bài ${lesson.number}`} (${activeLevel.toUpperCase()})</h3>
            <button type="button" class="srs-close" id="modalClose">✕</button>
          </div>
          <form id="lessonEditForm">
            <div class="admin-modal-body">
              <div style="display:grid; grid-template-columns: 90px 1fr; gap:12px;">
                <div class="form-group">
                  <label>Số bài</label>
                  <input type="number" id="lNumber" class="form-control" required value="${lesson.number}">
                </div>
                <div class="form-group">
                  <label>Tiêu đề bài học</label>
                  <input type="text" id="lTitle" class="form-control" required value="${lesson.title || ''}">
                </div>
              </div>
              <div class="form-group">
                <label>Câu chủ đề (Chữ Hán)</label>
                <input type="text" id="lTopicZh" class="form-control" placeholder="Ví dụ: 你好" value="${lesson.topicZh || ''}">
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label>Phiên âm Pinyin</label>
                  <input type="text" id="lTopicPy" class="form-control" placeholder="Ví dụ: Nǐ hǎo" value="${lesson.topicPy || ''}">
                </div>
                <div class="form-group">
                  <label>Dịch nghĩa tiếng Việt</label>
                  <input type="text" id="lTopicVi" class="form-control" placeholder="Ví dụ: Xin chào" value="${lesson.topicVi || ''}">
                </div>
              </div>
              <div class="form-group">
                <label>Mô tả bài học & Mục tiêu</label>
                <textarea id="lDesc" class="form-control" rows="3">${lesson.description || ''}</textarea>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="btn-secondary" id="modalCancel">Hủy</button>
              <button type="submit" class="btn-primary">Lưu bài học</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { host.innerHTML = ''; };
    document.getElementById('modalClose').onclick = close;
    document.getElementById('modalCancel').onclick = close;

    document.getElementById('lessonEditForm').onsubmit = (e) => {
      e.preventDefault();
      const updated = {
        number: Number(document.getElementById('lNumber').value),
        title: document.getElementById('lTitle').value,
        topicZh: document.getElementById('lTopicZh').value,
        topicPy: document.getElementById('lTopicPy').value,
        topicVi: document.getElementById('lTopicVi').value,
        description: document.getElementById('lDesc').value
      };
      window.HSKData.upsertLesson(activeLevel, updated);
      close();
      renderTabContent();
    };
  }

  // --- TAB 3: QUẢN LÝ MENU (NAVIGATION CRUD) ---
  function renderMenusTab(container) {
    const menus = window.HSKData.getMenus();

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <h3>Danh sách Menu hiển thị trên Header</h3>
          <button type="button" class="btn-primary" id="btnAddNewMenu">+ Thêm liên kết Menu</button>
        </div>
        <p style="color:#64748b; font-size:13px; margin:0 0 16px;">Bạn có thể đổi tên, sắp xếp thứ tự hoặc bật/tắt hiển thị của các menu điều hướng trên trang chủ.</p>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th style="width: 70px;">Thứ tự</th>
                <th>Tên Menu</th>
                <th>Đường dẫn (URL / Hash)</th>
                <th>Trạng thái</th>
                <th>Loại</th>
                <th style="width: 140px; text-align: right;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${menus.map(m => `
                <tr>
                  <td><b>#${m.order}</b></td>
                  <td><strong>${m.label}</strong></td>
                  <td><code>${m.url}</code></td>
                  <td>${m.visible ? '<span class="badge badge-active">Đang hiện</span>' : '<span class="badge badge-blocked">Đã ẩn</span>'}</td>
                  <td>${m.isSystem ? '<span class="badge badge-student">Hệ thống</span>' : '<span class="badge badge-admin">Tùy biến</span>'}</td>
                  <td style="text-align: right;">
                    <button type="button" class="btn-secondary btn-sm btn-edit-menu" data-id="${m.id}">Sửa</button>
                    ${!m.isSystem ? `<button type="button" class="btn-danger btn-sm btn-del-menu" data-id="${m.id}" style="margin-left:4px;">Xóa</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btnAddNewMenu').onclick = () => {
      openMenuModal({ label: '', url: '#', order: menus.length + 1, visible: true });
    };

    container.querySelectorAll('.btn-edit-menu').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const item = menus.find(m => m.id === id);
        if (item) openMenuModal(item);
      };
    });

    container.querySelectorAll('.btn-del-menu').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc muốn xóa menu này?')) {
          try {
            window.HSKData.deleteMenu(id);
            renderMenusTab(container);
          } catch (e) {
            alert(e.message);
          }
        }
      };
    });
  }

  function openMenuModal(menu) {
    const host = document.getElementById('adminModalHost');
    const isNew = !menu.id;

    host.innerHTML = `
      <div class="admin-modal-overlay">
        <div class="admin-modal" style="max-width: 500px;">
          <div class="admin-modal-header">
            <h3>${isNew ? 'Thêm Menu mới' : 'Chỉnh sửa Menu: ' + menu.label}</h3>
            <button type="button" class="srs-close" id="modalClose">✕</button>
          </div>
          <form id="menuEditForm">
            <div class="admin-modal-body">
              <div class="form-group">
                <label>Tên hiển thị</label>
                <input type="text" id="mLabel" class="form-control" required placeholder="Ví dụ: Tài liệu học tập" value="${menu.label}">
              </div>
              <div class="form-group">
                <label>Đường dẫn liên kết (URL)</label>
                <input type="text" id="mUrl" class="form-control" required placeholder="Ví dụ: #hsk1 hoặc https://..." value="${menu.url}">
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input type="number" id="mOrder" class="form-control" required value="${menu.order}">
                </div>
                <div class="form-group">
                  <label>Trạng thái</label>
                  <select id="mVisible" class="form-control">
                    <option value="true" ${menu.visible ? 'selected' : ''}>Hiển thị</option>
                    <option value="false" ${!menu.visible ? 'selected' : ''}>Ẩn khỏi Header</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="btn-secondary" id="modalCancel">Hủy</button>
              <button type="submit" class="btn-primary">Lưu Menu</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { host.innerHTML = ''; };
    document.getElementById('modalClose').onclick = close;
    document.getElementById('modalCancel').onclick = close;

    document.getElementById('menuEditForm').onsubmit = (e) => {
      e.preventDefault();
      const data = {
        label: document.getElementById('mLabel').value,
        url: document.getElementById('mUrl').value,
        order: Number(document.getElementById('mOrder').value),
        visible: document.getElementById('mVisible').value === 'true'
      };
      if (isNew) {
        window.HSKData.addMenu(data);
      } else {
        window.HSKData.updateMenu(menu.id, data);
      }
      close();
      renderTabContent();
    };
  }

  // --- TAB 4: QUẢN LÝ TỪ VỰNG (VOCABULARY) ---
  function renderVocabTab(container) {
    const list = window.HSKDictionary ? window.HSKDictionary.search('') : [];

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <h3>Kho từ vựng HSK tổng hợp</h3>
          <input type="search" id="vocabFilterInput" placeholder="Tìm kiếm nhanh từ vựng..." style="padding:8px 14px; border:1.5px solid #cbd5e1; border-radius:10px; font-size:13px; outline:none; width:260px;">
        </div>
        <div class="table-responsive">
          <table class="admin-table" id="vocabAdminTable">
            <thead>
              <tr>
                <th>Hán tự</th>
                <th>Pinyin</th>
                <th>Hán-Việt</th>
                <th>Ý nghĩa tiếng Việt</th>
                <th>Cấp độ</th>
                <th>Chủ đề</th>
                <th style="width: 100px; text-align: right;">Nghe thử</th>
              </tr>
            </thead>
            <tbody id="vocabTbody">
              ${list.map(v => `
                <tr>
                  <td><span style="font-size:22px; font-family:STKaiti,serif; color:#1a1e36;">${v.hanzi}</span></td>
                  <td><b style="color:#6657d9;">${v.pinyin}</b></td>
                  <td><span style="color:#b45309;">${v.hv}</span></td>
                  <td>${v.meaning}</td>
                  <td><span class="badge badge-student">${v.level}</span></td>
                  <td><small style="color:#64748b;">${v.topic}</small></td>
                  <td style="text-align: right;">
                    <button type="button" class="btn-secondary btn-sm" onclick="if(window.HSKAudio) window.HSKAudio.speak('${v.hanzi}')">🔊</button>
                    <button type="button" class="btn-secondary btn-sm" onclick="if(window.HanziPad) window.HanziPad.open('${v.hanzi}','${v.pinyin}','${v.meaning}')">✍️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('vocabFilterInput').oninput = (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = window.HSKDictionary.search(q);
      const tbody = document.getElementById('vocabTbody');
      tbody.innerHTML = filtered.map(v => `
        <tr>
          <td><span style="font-size:22px; font-family:STKaiti,serif; color:#1a1e36;">${v.hanzi}</span></td>
          <td><b style="color:#6657d9;">${v.pinyin}</b></td>
          <td><span style="color:#b45309;">${v.hv}</span></td>
          <td>${v.meaning}</td>
          <td><span class="badge badge-student">${v.level}</span></td>
          <td><small style="color:#64748b;">${v.topic}</small></td>
          <td style="text-align: right;">
            <button type="button" class="btn-secondary btn-sm" onclick="if(window.HSKAudio) window.HSKAudio.speak('${v.hanzi}')">🔊</button>
            <button type="button" class="btn-secondary btn-sm" onclick="if(window.HanziPad) window.HanziPad.open('${v.hanzi}','${v.pinyin}','${v.meaning}')">✍️</button>
          </td>
        </tr>
      `).join('');
    };
  }

  // --- TAB 5: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (USERS & RBAC) ---
  function renderUsersTab(container) {
    const users = window.HSKAuth.getAllUsers();
    const currentUser = window.HSKAuth.getCurrentUser();

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <h3>Danh sách Tài khoản & Phân quyền</h3>
          <button type="button" class="btn-primary" id="btnAddNewUser">+ Thêm tài khoản mới</button>
        </div>
        <p style="color:#64748b; font-size:13px; margin:0 0 16px;">Quản lý phân quyền giữa <b>Quản trị viên (Admin)</b> và <b>Học viên (Student)</b>.</p>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Họ tên</th>
                <th>Vai trò (Role)</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th style="width: 220px; text-align: right;">Thao tác phân quyền</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td><b>${u.username}</b> ${u.id === currentUser.id ? '<small style="color:#6657d9;">(Bạn)</small>' : ''}</td>
                  <td>${u.fullName}</td>
                  <td>
                    <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}">
                      ${u.role === 'admin' ? '👑 Admin' : '🎓 Học viên'}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${u.status === 'active' ? 'badge-active' : 'badge-blocked'}">
                      ${u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td><small style="color:#64748b;">${new Date(u.createdAt).toLocaleDateString('vi-VN')}</small></td>
                  <td style="text-align: right;">
                    ${u.id !== currentUser.id ? `
                      <button type="button" class="btn-secondary btn-sm btn-role-user" data-id="${u.id}" data-role="${u.role === 'admin' ? 'student' : 'admin'}">
                        ${u.role === 'admin' ? 'Hạ quyền Học viên' : 'Nâng quyền Admin'}
                      </button>
                      <button type="button" class="btn-secondary btn-sm btn-toggle-status" data-id="${u.id}" data-status="${u.status === 'active' ? 'blocked' : 'active'}" style="margin-left:4px;">
                        ${u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                      <button type="button" class="btn-danger btn-sm btn-del-user" data-id="${u.id}" style="margin-left:4px;">Xóa</button>
                    ` : '<small style="color:#94a3b8;">Đang đăng nhập</small>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btnAddNewUser').onclick = () => {
      openAddUserModal();
    };

    container.querySelectorAll('.btn-role-user').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const newRole = btn.dataset.role;
        try {
          window.HSKAuth.updateUser(id, { role: newRole });
          renderUsersTab(container);
        } catch (e) {
          alert(e.message);
        }
      };
    });

    container.querySelectorAll('.btn-toggle-status').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const newStatus = btn.dataset.status;
        try {
          window.HSKAuth.updateUser(id, { status: newStatus });
          renderUsersTab(container);
        } catch (e) {
          alert(e.message);
        }
      };
    });

    container.querySelectorAll('.btn-del-user').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
          try {
            window.HSKAuth.deleteUser(id);
            renderUsersTab(container);
          } catch (e) {
            alert(e.message);
          }
        }
      };
    });
  }

  function openAddUserModal() {
    const host = document.getElementById('adminModalHost');
    host.innerHTML = `
      <div class="admin-modal-overlay">
        <div class="admin-modal" style="max-width: 480px;">
          <div class="admin-modal-header">
            <h3>Tạo Tài khoản & Cấp quyền Mới</h3>
            <button type="button" class="srs-close" id="modalClose">✕</button>
          </div>
          <form id="addUserForm">
            <div class="admin-modal-body">
              <div class="form-group">
                <label>Họ và tên</label>
                <input type="text" id="newFullName" class="form-control" required placeholder="Ví dụ: Trần Thị Bình">
              </div>
              <div class="form-group">
                <label>Tên đăng nhập (username)</label>
                <input type="text" id="newUsername" class="form-control" required placeholder="tentaikhoan">
              </div>
              <div class="form-group">
                <label>Mật khẩu khởi tạo</label>
                <input type="password" id="newPassword" class="form-control" required placeholder="••••••••">
              </div>
              <div class="form-group">
                <label>Phân quyền vai trò</label>
                <select id="newRole" class="form-control">
                  <option value="student">🎓 Học viên (Student)</option>
                  <option value="admin">👑 Quản trị viên (Admin)</option>
                </select>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="btn-secondary" id="modalCancel">Hủy</button>
              <button type="submit" class="btn-primary">Tạo tài khoản</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => { host.innerHTML = ''; };
    document.getElementById('modalClose').onclick = close;
    document.getElementById('modalCancel').onclick = close;

    document.getElementById('addUserForm').onsubmit = (e) => {
      e.preventDefault();
      try {
        window.HSKAuth.addUserByAdmin(
          document.getElementById('newUsername').value,
          document.getElementById('newPassword').value,
          document.getElementById('newFullName').value,
          document.getElementById('newRole').value
        );
        close();
        renderTabContent();
      } catch (err) {
        alert(err.message);
      }
    };
  }

  // --- TAB 6: CÀI ĐẶT & SAO LƯU (SETTINGS & BACKUP) ---
  function renderSettingsTab(container) {
    const siteTitle = localStorage.getItem('hsk_site_title') || '你好 HSK · Học tiếng Trung mỗi ngày';
    const announcement = localStorage.getItem('hsk_site_announcement') || 'Chào mừng các bạn đến với góc tự học tiếng Trung HSK 1, 2, 3!';

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <h3>Cài đặt Giao diện Website</h3>
        </div>
        <form id="settingsForm" style="display:flex; flex-direction:column; gap:16px; max-width:600px;">
          <div class="form-group">
            <label>Tiêu đề Trang web (Site Title)</label>
            <input type="text" id="cfgSiteTitle" class="form-control" value="${siteTitle}">
          </div>
          <div class="form-group">
            <label>Thông báo chạy trên đầu trang (Announcement Banner)</label>
            <input type="text" id="cfgAnnouncement" class="form-control" value="${announcement}">
          </div>
          <div>
            <button type="submit" class="btn-primary">Lưu cài đặt</button>
          </div>
        </form>
      </div>

      <div class="admin-card">
        <div class="card-header">
          <h3>Sao lưu & Phục hồi Dữ liệu (Backup & Restore)</h3>
        </div>
        <p style="color:#64748b; font-size:14px; margin-bottom:18px;">
          Xuất toàn bộ bài học tùy biến, thực đơn menu, danh sách tài khoản học viên và sổ tay từ vựng ra file JSON để lưu trữ an toàn hoặc chuyển sang máy chủ khác.
        </p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
          <button type="button" class="btn-primary" id="btnExportJSON">📥 Xuất file Backup JSON</button>
          <label class="btn-secondary" style="cursor:pointer; display:inline-flex; align-items:center;">
            📤 Nhập file Backup JSON
            <input type="file" id="importFileInput" accept=".json" style="display:none;">
          </label>
        </div>
      </div>
    `;

    document.getElementById('settingsForm').onsubmit = (e) => {
      e.preventDefault();
      localStorage.setItem('hsk_site_title', document.getElementById('cfgSiteTitle').value);
      localStorage.setItem('hsk_site_announcement', document.getElementById('cfgAnnouncement').value);
      alert('Đã lưu cấu hình website thành công.');
    };

    document.getElementById('btnExportJSON').onclick = () => {
      const data = window.HSKData.exportFullBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nihao-hsk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    document.getElementById('importFileInput').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const json = JSON.parse(evt.target.result);
          window.HSKData.importFullBackup(json);
          alert('Đã phục hồi dữ liệu từ file backup thành công!');
          location.reload();
        } catch (err) {
          alert('Lỗi đọc file: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
  }

  // Khởi động
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
