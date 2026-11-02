/**
 * Nihao HSK - Admin Portal Controller
 * Full CRUD for Lessons, Menus, Vocabulary, Users & RBAC
 */
(() => {
  'use strict';

  const DEFAULT_MAIL_WEBHOOK = 'https://script.google.com/macros/s/AKfycbyTLv22IiCpxeRoaxgyI2uK6Hb27f5hHQKOjokCJa_IGIxYrIuHbWQIHRxQYW-7sE9g/exec';

  let currentTab = 'dashboard';
  let activeLevel = 'hsk1';
  const HSK_LESSON_CATALOG = {
    hsk1: [
      { num: 1, zh: "你好", py: "Nǐ hǎo", vi: "Xin chào" },
      { num: 2, zh: "谢谢你", py: "Xièxiè nǐ", vi: "Cảm ơn bạn" },
      { num: 3, zh: "你叫什么名字？", py: "Nǐ jiào shénme míngzi?", vi: "Bạn tên là gì?" },
      { num: 4, zh: "她是我的汉语老师", py: "Tā shì wǒ de hànyǔ lǎoshī", vi: "Cô ấy là giáo viên tiếng Trung của tôi" },
      { num: 5, zh: "她女儿今年二十岁", py: "Tā nǚ'ér jīnnián èrshí suì", vi: "Con gái cô ấy năm nay 20 tuổi" },
      { num: 6, zh: "我会说汉语", py: "Wǒ huì shuō hànyǔ", vi: "Tôi biết nói tiếng Trung" },
      { num: 7, zh: "今天几号？", py: "Jīntiān jǐ hào?", vi: "Hôm nay ngày mấy?" },
      { num: 8, zh: "我想喝茶", py: "Wǒ xiǎng hē chá", vi: "Tôi muốn uống trà" },
      { num: 9, zh: "你儿子在哪儿工作？", py: "Nǐ érzi zài nǎr gōngzuò?", vi: "Con trai bạn làm việc ở đâu?" },
      { num: 10, zh: "我能坐这儿吗？", py: "Wǒ néng zuò zhèr ma?", vi: "Tôi có thể ngồi đây không?" },
      { num: 11, zh: "现在几点？", py: "Xiànzài jǐ diǎn?", vi: "Bây giờ là mấy giờ?" },
      { num: 12, zh: "明天天气怎么样？", py: "Míngtiān tiānqì zěnmeyàng?", vi: "Thời tiết ngày mai thế nào?" }
    ],
    hsk2: [
      { num: 1, zh: "九月去北京旅游最好", py: "Jiǔyuè qù Běijīng lǚyóu zuì hǎo", vi: "Tháng 9 đi Bắc Kinh du lịch là thích hợp nhất" },
      { num: 2, zh: "我每天六点起床", py: "Wǒ měitiān liù diǎn qǐchuáng", vi: "Mỗi ngày tôi đều thức dậy lúc 6 giờ" },
      { num: 3, zh: "左边那个红色的是我的", py: "Zuǒbian nàge hóngsè de shì wǒ de", vi: "Cái màu đỏ bên trái là của tôi" },
      { num: 4, zh: "这个工作是他帮我介绍 de", py: "Zhège gōngzuò shì tā bāng wǒ jièshào de", vi: "Công việc này là anh ấy giới thiệu cho tôi" },
      { num: 5, zh: "就买这件吧", py: "Jiù mǎi zhè jiàn ba", vi: "Mua chiếc này đi" },
      { num: 6, zh: "你怎么不吃了？", py: "Nǐ zěnme bù chī le?", vi: "Sao bạn không ăn nữa?" },
      { num: 7, zh: "差不多四十分钟", py: "Chàbùduō sìshí fēnzhōng", vi: "Khoảng tầm bốn mươi phút" },
      { num: 8, zh: "让我想想再说", py: "Ràng wǒ xiǎngxiang zài shuō", vi: "Để tôi nghĩ chút rồi nói tiếp" },
      { num: 9, zh: "题太多，我没做完", py: "Tí tài duō, wǒ méi zuò wán", vi: "Câu hỏi nhiều quá, tôi làm chưa xong" },
      { num: 10, zh: "别找了，手机在桌子上呢", py: "Bié zhǎo le, shǒujī zài zhuōzi shang ne", vi: "Đừng tìm nữa, điện thoại ở trên bàn kìa" },
      { num: 11, zh: "他比我大三岁", py: "Tā bǐ wǒ dà sān suì", vi: "Anh ấy lớn hơn tôi 3 tuổi" },
      { num: 12, zh: "你穿得太少了", py: "Nǐ chuān de tài shǎo le", vi: "Bạn mặc phong phanh quá" },
      { num: 13, zh: "门开着呢", py: "Mén kāizhe ne", vi: "Cửa đang mở kìa" },
      { num: 14, zh: "你看过那个电影吗？", py: "Nǐ kànguo nàge diànyǐng ma?", vi: "Bạn đã từng xem bộ phim đó chưa?" },
      { num: 15, zh: "新年就要到了", py: "Xīnnián jiù yào dào le", vi: "Năm mới sắp đến rồi" }
    ],
    hsk3: [
      { num: 1, zh: "周末你有什么打算？", py: "Zhōumò nǐ yǒu shénme dǎsuàn?", vi: "Anh dự định làm gì vào cuối tuần vậy?" },
      { num: 2, zh: "他什么时候回来？", py: "Tā shénme shíhou huílái?", vi: "Khi nào anh ấy quay về?" },
      { num: 3, zh: "桌子上放着很多饮料", py: "Zhuōzi shang fàng zhe hěn duō yǐnliào", vi: "Trên bàn có rất nhiều thức uống" },
      { num: 4, zh: "她总是笑着跟客人说话", py: "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", vi: "Cô ấy luôn cười khi nói chuyện với khách hàng" },
      { num: 5, zh: "我最近越来越胖了", py: "Wǒ zuìjìn yuèláiyuè pàng le", vi: "Dạo này em ngày càng béo ra" },
      { num: 6, zh: "怎么突然找不到了？", py: "Zěnme tūrán zhǎobudào le?", vi: "Sao bỗng dưng lại không tìm thấy?" },
      { num: 7, zh: "我跟她都认识五年了", py: "Wǒ gēn tā dōu rènshi wǔ nián le", vi: "Tôi và cô ấy quen nhau được năm năm rồi" },
      { num: 8, zh: "你去哪儿我就去哪儿", py: "Nǐ qù nǎr wǒ jiù qù nǎr", vi: "Em đi đâu thì anh đi đến đó" },
      { num: 9, zh: "她的汉语说得跟中国人一样好", py: "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", vi: "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy" },
      { num: 10, zh: "数学比历史难多了", py: "Shùxué bǐ lìshǐ nán duō le", vi: "Môn Toán khó hơn môn Lịch Sử nhiều" },
      { num: 11, zh: "别忘了把空调关了", py: "Bié wàng le bǎ kōngtiáo guān le", vi: "Đừng quên tắt máy điều hòa không khí nhé" },
      { num: 12, zh: "把重要的东西放在我这儿吧", py: "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", vi: "Hãy để những đồ quan trọng ở chỗ tôi đi" },
      { num: 13, zh: "我是走回来的", py: "Wǒ shì zǒuhuílai de", vi: "Anh đi bộ về" },
      { num: 14, zh: "你把水果拿过来", py: "Nǐ bǎ shuǐguǒ ná guòlái", vi: "Cậu hãy mang trái cây đến đây" },
      { num: 15, zh: "其他都没什么问题", py: "Qítā dōu méi shénme wèntí", vi: "Những câu khác đều không có vấn đề gì" },
      { num: 16, zh: "我现在累得下了班就想睡觉", py: "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", vi: "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc" },
      { num: 17, zh: "谁都有办法看好你的“病”", py: "Shéi dōu yǒu bànfǎ kànhǎo nǐ de 'bìng'", vi: "Ai cũng có cách chữa khỏi 'bệnh' của em" },
      { num: 18, zh: "我相信他们会同意的", py: "Wǒ xiāngxìn tāmen huì tóngyì de", vi: "Tôi tin họ sẽ đồng ý" },
      { num: 19, zh: "你没看出来吗？", py: "Nǐ méi kàn chūlai ma?", vi: "Anh không nhìn ra được à?" },
      { num: 20, zh: "我被他影响了", py: "Wǒ bèi tā yǐngxiǎng le", vi: "Mình chịu ảnh hưởng từ anh ấy" }
    ]
  };


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
            <button type="button" class="nav-item ${currentTab === 'activity' ? 'active' : ''}" data-tab="activity">
              ⚡ Hoạt động & Tiến độ
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
          <div class="metric-value">47</div>
          <div class="metric-sub">12 HSK 1 · 15 HSK 2 · 20 HSK 3</div>
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
                <td><span class="badge badge-active">✓ 12 bài chuẩn BLCU</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk1')">Mở học ↗</button></td>
              </tr>
              <tr>
                <td><b>HSK 2</b></td>
                <td>15 bài</td>
                <td>Mở rộng ngữ pháp, câu ghép, đời sống chuẩn BLCU</td>
                <td><span class="badge badge-active">✓ 15 bài chuẩn BLCU</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk2')">Mở học ↗</button></td>
              </tr>
              <tr>
                <td><b>HSK 3</b></td>
                <td>20 bài</td>
                <td>Giao tiếp chuyên sâu, du lịch, công sở chuẩn BLCU</td>
                <td><span class="badge badge-active">✓ 20 bài chuẩn BLCU</span></td>
                <td><button type="button" class="btn-primary btn-sm" onclick="window.open('/#hsk3')">Mở học ↗</button></td>
              </tr>
            </tbody>
          </table>
        </div>

      <!-- Widget Học viên đang hoạt động gần đây -->
      <div class="admin-card" style="margin-top: 24px;">
        <div class="card-header">
          <div>
            <h3 style="display:flex; align-items:center; gap:8px;">
              <span>⚡ Học viên Đang hoạt động & Tiến độ gần đây</span>
            </h3>
            <p style="color:#64748b; font-size:13px; margin:4px 0 0;">Cập nhật trạng thái trực tuyến và số bài học viên đã hoàn thành theo thời gian thực.</p>
          </div>
          <button type="button" class="btn-primary" id="btnDashboardToActivity">Xem tất cả tiến độ học viên →</button>
        </div>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Trạng thái</th>
                <th>Tiến độ HSK 1</th>
                <th>Tiến độ HSK 2</th>
                <th>Tiến độ HSK 3</th>
                <th>Tổng XP</th>
                <th style="text-align:right;">Thao tác</th>
              </tr>
            </thead>
            <tbody id="dashActiveUsersBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
      </div>
    `;

    renderDashboardRecentUsers();
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
        <p style="color:#64748b; font-size:13px; margin:0 0 16px;">
          Quản lý phân quyền giữa <b>Quản trị viên (Admin)</b> và <b>Học viên (Student)</b>. Mọi nhân viên đăng ký đều qua bước xác thực email để định danh chính xác.
        </p>
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Họ tên & Email nhân viên</th>
                <th>Xác thực Email</th>
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
                  <td>
                    <div style="font-weight:600; color:#1e1b4b;">${u.fullName}</div>
                    <div style="font-size:12px; color:#475569; margin-top:2px;">
                      ✉️ <b>${u.email || 'Chưa cập nhật email'}</b>
                    </div>
                  </td>
                  <td>
                    ${u.emailVerified ? `
                      <span class="badge badge-verified" title="Đã xác thực OTP qua email">✓ Đã xác nhận</span>
                    ` : `
                      <span class="badge badge-unverified">⚠️ Chưa xác thực</span>
                    `}
                  </td>
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
                <label>Họ và tên nhân viên</label>
                <input type="text" id="newFullName" class="form-control" required placeholder="Ví dụ: Trần Thị Bình - Kinh Doanh">
              </div>
              <div class="form-group">
                <label>Email nhân viên (xác thực danh tính)</label>
                <input type="email" id="newEmail" class="form-control" required placeholder="binh.tranthi@company.com">
                <small style="color:#64748b; font-size:12px; margin-top:3px; display:block;">
                  Email chính thức của nhân sự để phục vụ giám sát và báo cáo học tập.
                </small>
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
          document.getElementById('newRole').value,
          document.getElementById('newEmail').value
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
    const sysTheme = localStorage.getItem('hsk_system_default_theme') || 'default';
    const mailWebhookUrl = localStorage.getItem('hsk_mail_webhook_url') || DEFAULT_MAIL_WEBHOOK;

    container.innerHTML = `
      <div class="admin-card">
        <div class="card-header">
          <h3>Cài đặt Giao diện Website & Mùa Lễ Hội</h3>
        </div>
        <form id="settingsForm" style="display:flex; flex-direction:column; gap:16px; max-width:600px;">
          <div class="form-group">
            <label>Giao diện Mùa lễ hội mặc định của hệ thống (Seasonal Event Theme)</label>
            <select id="cfgSystemTheme" class="form-control" style="font-weight:700;">
              <option value="default" ${sysTheme === 'default' ? 'selected' : ''}>🌸 Mặc định (Tím thanh lịch - Hiện đại)</option>
              <option value="halloween" ${sysTheme === 'halloween' ? 'selected' : ''}>🎃 Lễ hội Halloween (Bí ngô ma thuật & dơi đêm)</option>
              <option value="tet" ${sysTheme === 'tet' ? 'selected' : ''}>🧧 Tết Nguyên Đán (Xuân tiết may mắn & đèn lồng đỏ)</option>
              <option value="midautumn" ${sysTheme === 'midautumn' ? 'selected' : ''}>🥮 Tết Trung Thu (Trăng rằm vàng & Thỏ ngọc)</option>
              <option value="love" ${sysTheme === 'love' ? 'selected' : ''}>💖 Mùa Tình Yêu (Valentine / Thất Tịch Qixi)</option>
            </select>
            <small style="color:#64748b; font-size:12px; margin-top:4px; display:block;">
              Khi quản trị viên đặt theme này, toàn bộ trang web và học viên truy cập sẽ tự động đổi màu sắc và hiệu ứng lễ hội tương ứng.
            </small>
          </div>
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
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <h3 style="margin:0;">📧 Cấu hình Gửi Email OTP qua Gmail (Miễn phí 100%)</h3>
          <span id="webhookStatusBadge" style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; ${mailWebhookUrl ? 'background:#dcfce7; color:#15803d;' : 'background:#fee2e2; color:#b91c1c;'}">
            ${mailWebhookUrl ? '🟢 Đã kết nối Webhook' : '🔴 Chưa kết nối Webhook'}
          </span>
        </div>
        <p style="font-size:13.5px; color:#475569; margin: 10px 0 14px; line-height: 1.6;">
          Hệ thống sẽ gửi mã OTP xác nhận đăng ký <b>trực tiếp từ chính tài khoản Gmail của bạn</b> qua Google Apps Script Webhook. Hoàn toàn <b>miễn phí vĩnh viễn</b>, không tốn tiền mua dịch vụ ngoài (Brevo/Sendgrid) và không cần thẻ thanh toán.
        </p>

        <form id="mailWebhookForm" style="display:flex; flex-direction:column; gap:14px; max-width:680px;">
          <div class="form-group">
            <label style="font-weight:700; color:#1e293b;">1. Đường link Web App Google Apps Script (Webhook URL)</label>
            <input type="url" id="cfgMailWebhookUrl" class="form-control" placeholder="https://script.google.com/macros/s/AKfycb.../exec" value="${mailWebhookUrl}" style="font-family:monospace; font-size:13px; border:2px solid #cbd5e1;">
            <small style="color:#64748b; font-size:12px; margin-top:4px; display:block;">
              ⚠️ <b>Lưu ý quan trọng:</b> Link phải kết thúc bằng chữ <code>/exec</code> sau khi bấm <b>Deploy &rarr; Web app</b> trên Google (không dùng link <code>/edit</code> trên thanh địa chỉ).
            </small>
          </div>

          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <button type="submit" class="btn-primary" style="background:#10b981; padding:9px 16px;">💾 Lưu cấu hình Gmail</button>
            <button type="button" id="btnCopyGoogleScript" class="btn-secondary" style="border:1px solid #cbd5e1; background:#f8fafc; padding:9px 14px;">📋 Sao chép mã Google Script</button>
          </div>

          <!-- KHUNG KIỂM TRA GỬI THỬ EMAIL RÕ RÀNG TRỰC QUAN -->
          <div style="background:#f8fafc; border:2px dashed #93c5fd; border-radius:12px; padding:16px; margin-top:6px;">
            <div style="font-weight:800; font-size:14px; color:#1e40af; margin-bottom:6px;">
              2. Kiểm tra gửi thử Email Test vào hòm thư Gmail của bạn:
            </div>
            <p style="font-size:12.5px; color:#475569; margin:0 0 10px;">
              Nhập địa chỉ email bất kỳ của bạn rồi bấm nút màu xanh tím để nhận email thử ngay:
            </p>
            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <input type="email" id="cfgTestEmailInput" class="form-control" placeholder="Ví dụ: myemail@gmail.com" style="flex:1; min-width:260px; font-size:14px; border:2px solid #93c5fd;" value="">
              <button type="button" id="btnTestMailWebhook" class="btn-primary" style="background:#4f46e5; padding:10px 18px; font-weight:800; white-space:nowrap; box-shadow:0 4px 12px rgba(79,70,229,0.25);">
                🚀 Gửi thử email ngay
              </button>
            </div>
            <div id="mailTestResult" style="font-size:13px; font-weight:600; min-height:20px; margin-top:12px;"></div>
          </div>
        </form>

        <div style="margin-top:20px; padding:16px; background:#fdf2f8; border:1px solid #fbcfe8; border-radius:12px;">
          <h4 style="margin:0 0 10px; font-size:14px; color:#9d174d;">⚡ Hướng dẫn cài đặt Gmail Webhook trong 2 phút (Hoàn toàn miễn phí):</h4>
          <ol style="margin:0; padding-left:20px; font-size:13px; color:#831843; line-height:1.75;">
            <li>Truy cập <a href="https://script.google.com/" target="_blank" style="color:#be185d; font-weight:800; text-decoration:underline;">script.google.com</a> (đăng nhập bằng tài khoản Gmail bạn muốn dùng gửi mail).</li>
            <li>Bấm <b>Dự án mới (New project)</b>, xóa toàn bộ code có sẵn và dán đoạn mã Google Script (bấm nút <i>"📋 Sao chép mã Google Script"</i> ở trên).</li>
            <li>Bấm nút <b>Triển khai (Deploy) &rarr; Tùy chọn triển khai mới (New deployment)</b>:
              <br>&bull; Chọn loại (Type): <b>Ứng dụng web (Web app)</b>
              <br>&bull; Thực thi dưới dạng (Execute as): <b>Tôi (email của bạn)</b>
              <br>&bull; Ai có quyền truy cập (Who has access): <b>Bất kỳ ai (Anyone)</b> <i>(Bắt buộc để web có quyền gửi yêu cầu)</i>
            </li>
            <li>Bấm <b>Triển khai</b>, cấp quyền cho Gmail, rồi sao chép đường dẫn <b>URL ứng dụng web</b> (dạng <code>https://script.google.com/macros/s/.../exec</code>) dán vào ô <b>1. Đường link Web App</b> ở trên và bấm <b>Lưu cấu hình Gmail</b>.</li>
          </ol>
        </div>
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
      const chosenTheme = document.getElementById('cfgSystemTheme').value;
      localStorage.setItem('hsk_system_default_theme', chosenTheme);
      localStorage.setItem('hsk_current_theme', chosenTheme);
      localStorage.setItem('hsk_site_title', document.getElementById('cfgSiteTitle').value);
      localStorage.setItem('hsk_site_announcement', document.getElementById('cfgAnnouncement').value);
      if (window.HSKTheme) {
        window.HSKTheme.setTheme(chosenTheme, true);
      }
      alert('Đã lưu cấu hình website và cập nhật chủ đề lễ hội thành công!');
    };

    const GOOGLE_APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var to = data.email;
    var code = data.code || '';
    var subject = data.subject || ('NiHao HSK · Mã xác nhận đăng ký tài khoản: ' + code);
    var body = data.body || ('Mã xác nhận của bạn là: ' + code);
    var htmlBody = data.html || (
      '<div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:14px;">' +
      '<h2 style="color:#6657d9;text-align:center;">NiHao HSK · Xác nhận Email</h2>' +
      '<p>Xin chào, bạn vừa yêu cầu đăng ký tài khoản trên hệ thống <b>NiHao HSK</b>.</p>' +
      '<p>Mã xác thực của bạn là:</p>' +
      '<div style="text-align:center;margin:24px 0;"><span style="font-size:32px;font-weight:800;letter-spacing:6px;color:#4338ca;background:#eef2ff;padding:12px 28px;border-radius:10px;border:2px dashed #6366f1;">' + code + '</span></div>' +
      '<p style="color:#64748b;font-size:13px;">Mã có hiệu lực trong vòng 10 phút. Tuyệt đối không chia sẻ mã cho người khác.</p>' +
      '</div>'
    );

    GmailApp.sendEmail(to, subject, body, {
      name: 'NiHao HSK',
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

    document.getElementById('mailWebhookForm').onsubmit = (e) => {
      e.preventDefault();
      const urlInput = document.getElementById('cfgMailWebhookUrl');
      const urlVal = (urlInput.value || '').trim();
      if (urlVal && urlVal.includes('/edit')) {
        alert('⚠️ CẢNH BÁO: Đường link bạn dán là link trang chỉnh sửa code (/edit)!\n\nLink Web App gửi mail phải kết thúc bằng "/exec".\nBạn hãy bấm nút Deploy (Triển khai) -> Tùy chọn triển khai mới -> Web App trên Google Apps Script để lấy link "/exec".');
        urlInput.focus();
        return;
      }
      localStorage.setItem('hsk_mail_webhook_url', urlVal);
      const resEl = document.getElementById('mailTestResult');
      resEl.innerHTML = '<span style="color:#10b981;">✅ Đã lưu cấu hình Webhook Gmail thành công! Bây giờ bạn có thể nhập email bên dưới để gửi thử.</span>';
      const badge = document.getElementById('webhookStatusBadge');
      if (badge) {
        badge.textContent = urlVal ? '🟢 Đã kết nối Webhook' : '🔴 Chưa kết nối Webhook';
        badge.style.background = urlVal ? '#dcfce7' : '#fee2e2';
        badge.style.color = urlVal ? '#15803d' : '#b91c1c';
      }
      alert('Đã lưu cấu hình Webhook Gmail thành công!');
    };

    document.getElementById('btnCopyGoogleScript').onclick = () => {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE).then(() => {
        alert('Đã sao chép mã Google Apps Script vào bộ nhớ tạm!\n\nBây giờ bạn chỉ cần vào script.google.com, tạo dự án mới rồi dán (Ctrl+V) vào.');
      }).catch(() => {
        prompt('Sao chép mã Google Apps Script bên dưới:', GOOGLE_APPS_SCRIPT_TEMPLATE);
      });
    };

    const btnTest = document.getElementById('btnTestMailWebhook');
    btnTest.onclick = async () => {
      const urlInput = document.getElementById('cfgMailWebhookUrl');
      const emailInput = document.getElementById('cfgTestEmailInput');
      const resEl = document.getElementById('mailTestResult');

      const urlVal = (urlInput.value || '').trim();
      const testEmail = (emailInput.value || '').trim();

      // 1. Kiểm tra URL Webhook (Tự động điền link mặc định nếu ô trống)
      let activeWebhook = urlVal || DEFAULT_MAIL_WEBHOOK;
      if (!urlVal) {
        urlInput.value = DEFAULT_MAIL_WEBHOOK;
        urlVal = DEFAULT_MAIL_WEBHOOK;
        localStorage.setItem('hsk_mail_webhook_url', DEFAULT_MAIL_WEBHOOK);
      }

      if (urlVal.includes('/edit')) {
        alert('⚠️ ĐÂY LÀ LINK CHỈNH SỬA CODE (/edit), KHÔNG PHẢI LINK WEB APP!\n\nBạn hãy mở tab Google Apps Script, bấm nút "Triển khai (Deploy)" màu xanh -> chọn "Tùy chọn triển khai mới (New deployment)" -> Web App -> Ai có quyền truy cập: "Bất kỳ ai (Anyone)" -> Bấm Triển khai để lấy link kết thúc bằng "/exec".');
        urlInput.focus();
        urlInput.style.borderColor = '#ef4444';
        resEl.innerHTML = '<span style="color:#ef4444;">⚠️ Link của bạn đang kết thúc bằng /edit. Link đúng phải kết thúc bằng /exec sau khi Deploy.</span>';
        return;
      }

      urlInput.style.borderColor = '#cbd5e1';

      // 2. Kiểm tra Email người nhận test
      if (!testEmail || !testEmail.includes('@')) {
        alert('⚠️ VUI LÒNG NHẬP ĐỊA CHỈ EMAIL CỦA BẠN!\n\nHãy gõ địa chỉ email bạn muốn nhận thư kiểm tra vào ô "Ví dụ: myemail@gmail.com".');
        emailInput.focus();
        emailInput.style.borderColor = '#ef4444';
        resEl.innerHTML = '<span style="color:#ef4444;">⚠️ Vui lòng nhập địa chỉ email vào ô phía trên rồi bấm "Gửi thử email ngay".</span>';
        return;
      }

      emailInput.style.borderColor = '#93c5fd';

      // Tự động lưu URL vào máy
      localStorage.setItem('hsk_mail_webhook_url', urlVal);

      // Hiển thị trạng thái đang gửi
      btnTest.disabled = true;
      const originalText = btnTest.innerHTML;
      btnTest.innerHTML = '⏳ Đang gửi mail...';
      btnTest.style.opacity = '0.7';
      resEl.innerHTML = `<span style="color:#4f46e5;">⏳ Đang kết nối tới Google Apps Script và gửi email test tới <b>${testEmail}</b>... Vui lòng đợi 3-5 giây.</span>`;

      try {
        // Gửi qua backend Cloudflare Worker
        const resp = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testEmail, webhookUrl: urlVal, isTest: true })
        });
        const data = await resp.json().catch(() => ({}));

        if (resp.ok && data.success && data.emailSent) {
          resEl.innerHTML = `
            <div style="background:#ecfdf5; border:1.5px solid #10b981; border-radius:10px; padding:12px; color:#065f46;">
              <div style="font-weight:800; font-size:14px;">🎉 THÀNH CÔNG RỰC RỠ!</div>
              <div style="font-size:13px; margin-top:4px;">
                Email kiểm tra đã được gửi tới <b>${testEmail}</b> qua Gmail. Bạn hãy mở hộp thư Gmail (kiểm tra cả mục Hộp thư đến / Thư rác Spam) để xem email nhé!
              </div>
            </div>
          `;
          alert(`🎉 THÀNH CÔNG RỰC RỠ!\n\nEmail kiểm tra đã được gửi thành công đến: ${testEmail}\n\nVui lòng mở hộp thư Gmail của bạn để kiểm tra nhé!`);
        } else {
          // Thử gửi trực tiếp từ trình duyệt đến Webhook
          try {
            await fetch(urlVal, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                email: testEmail,
                code: '668899',
                isTest: true,
                subject: 'NiHao HSK · Kiểm tra gửi mail trực tiếp từ Gmail thành công!'
              })
            });

            resEl.innerHTML = `
              <div style="background:#ecfdf5; border:1.5px solid #10b981; border-radius:10px; padding:12px; color:#065f46;">
                <div style="font-weight:800; font-size:14px;">🎉 ĐÃ GỬI YÊU CẦU ĐẾN GMAIL THÀNH CÔNG!</div>
                <div style="font-size:13px; margin-top:4px;">
                  Hệ thống đã kết nối trực tiếp đến Google Apps Script. Vui lòng mở hộp thư <b>${testEmail}</b> (kiểm tra cả mục Hộp thư đến / Thư rác Spam) để kiểm tra email nhé!
                </div>
              </div>
            `;
            alert(`🎉 ĐÃ KÍCH HOẠT GỬI EMAIL THÀNH CÔNG!\n\nYêu cầu gửi mail đã được chuyển tới Gmail của bạn. Vui lòng mở hòm thư ${testEmail} để kiểm tra.`);
          } catch (directErr) {
            resEl.innerHTML = `
              <div style="background:#fef2f2; border:1.5px solid #ef4444; border-radius:10px; padding:12px; color:#991b1b;">
                <div style="font-weight:800;">❌ Không thể gửi email: ${data.message || directErr.message}</div>
                <div style="font-size:12px; margin-top:4px;">
                  👉 Hãy kiểm tra xem khi Triển khai trên script.google.com bạn đã chọn mục <b>"Ai có quyền truy cập (Who has access)"</b> là <b>"Bất kỳ ai (Anyone)"</b> chưa nhé!
                </div>
              </div>
            `;
            alert('❌ Lỗi kết nối Google Apps Script:\n\n' + (data.message || directErr.message) + '\n\nBạn hãy kiểm tra xem lúc Triển khai trên Google đã chọn "Ai có quyền truy cập" là "Bất kỳ ai (Anyone)" chưa nhé.');
          }
        }
      } catch (err) {
        resEl.innerHTML = `
          <div style="background:#fef2f2; border:1.5px solid #ef4444; border-radius:10px; padding:12px; color:#991b1b;">
            <div style="font-weight:800;">❌ Lỗi kết nối: ${err.message}</div>
          </div>
        `;
        alert('❌ Lỗi kết nối: ' + err.message);
      } finally {
        btnTest.disabled = false;
        btnTest.innerHTML = originalText;
        btnTest.style.opacity = '1';
      }
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




  // --- DASHBOARD WIDGET: HỌC VIÊN HOẠT ĐỘNG GẦN ĐÂY ---
  function renderDashboardRecentUsers() {
    const tbody = document.getElementById('dashActiveUsersBody');
    const btnNav = document.getElementById('btnDashboardToActivity');
    if (btnNav) {
      btnNav.onclick = () => {
        const navBtn = document.querySelector('.nav-item[data-tab="activity"]');
        if (navBtn) navBtn.click();
      };
    }
    if (!tbody) return;

    const users = window.HSKAuth.getAllUsersWithProgress ? window.HSKAuth.getAllUsersWithProgress() : [];
    // Sắp xếp: online trước, sau đó theo lần cuối hoạt động
    users.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0) || new Date(b.lastActive) - new Date(a.lastActive));

    tbody.innerHTML = users.slice(0, 5).map(u => `
      <tr>
        <td>
          <div class="user-profile-cell">
            <div class="user-avatar">${(u.fullName || u.username).charAt(0).toUpperCase()}</div>
            <div>
              <div class="user-meta-name">
                ${u.fullName}
                <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}" style="font-size:10px; padding:2px 6px;">
                  ${u.role === 'admin' ? 'Admin' : 'Học viên'}
                </span>
                ${u.emailVerified ? '<span title="Đã xác thực email" style="color:#16a34a; font-weight:700; font-size:11px; margin-left:2px;">✓</span>' : ''}
              </div>
              <div style="font-size:11px; color:#475569; margin:1px 0;">✉️ ${u.email || 'Chưa có email'}</div>
              <div class="user-meta-sub">@${u.username}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${u.activeState === 'online' ? 'badge-online' : (u.activeState === 'today' ? 'badge-today' : 'badge-offline')}">
            <span class="${u.activeState === 'online' ? 'pulse-dot' : (u.activeState === 'today' ? 'dot-today' : 'dot-offline')}"></span>
            ${u.activeText}
          </span>
        </td>
        <td>
          <div class="progress-cell">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>${u.hsk1.doneCount} / 12</span>
              <span style="color:#6657d9;">${u.hsk1.percent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill fill-hsk1" style="width: ${u.hsk1.percent}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="progress-cell">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>${u.hsk2.doneCount} / 15</span>
              <span style="color:#10b981;">${u.hsk2.percent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill fill-hsk2" style="width: ${u.hsk2.percent}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <div class="progress-cell">
            <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
              <span>${u.hsk3.doneCount} / 20</span>
              <span style="color:#0284c7;">${u.hsk3.percent}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill fill-hsk3" style="width: ${u.hsk3.percent}%;"></div>
            </div>
          </div>
        </td>
        <td><b>⭐ ${u.totalXP}</b></td>
        <td style="text-align:right;">
          <button type="button" class="btn-secondary btn-sm btn-view-progress" data-id="${u.id}">Chi tiết bài học →</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-view-progress').forEach(b => {
      b.onclick = () => {
        const u = users.find(x => x.id === b.dataset.id);
        if (u) openProgressDetailModal(u);
      };
    });
  }

  // --- TAB: HỌC VIÊN ĐANG HOẠT ĐỘNG & TIẾN ĐỘ HOÀN THÀNH ---
  function renderActivityTab(container) {
    const allUsers = window.HSKAuth.getAllUsersWithProgress ? window.HSKAuth.getAllUsersWithProgress() : [];
    let currentFilter = 'all'; // all | online | hsk1 | hsk2 | hsk3
    let searchTerm = '';

    const onlineCount = allUsers.filter(u => u.isOnline).length;
    const todayCount = allUsers.filter(u => u.activeState === 'online' || u.activeState === 'today').length;
    const totalLessonsAll = allUsers.reduce((sum, u) => sum + u.totalLessonsCompleted, 0);
    const totalXPAll = allUsers.reduce((sum, u) => sum + u.totalXP, 0);

    container.innerHTML = `
      <!-- Top Metrics Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header"><span>ĐANG TRỰC TUYẾN</span><span class="metric-icon">🟢</span></div>
          <div class="metric-value" style="color:#16a34a;">${onlineCount}</div>
          <div class="metric-sub">${todayCount} người dùng hoạt động trong ngày hôm nay</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>TỔNG HỌC VIÊN</span><span class="metric-icon">🎓</span></div>
          <div class="metric-value">${allUsers.length}</div>
          <div class="metric-sub">${allUsers.filter(u => u.role === 'student').length} học viên · ${allUsers.filter(u => u.role === 'admin').length} quản trị viên</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>BÀI ĐÃ HOÀN THÀNH</span><span class="metric-icon">🏆</span></div>
          <div class="metric-value" style="color:#6657d9;">${totalLessonsAll}</div>
          <div class="metric-sub">Tổng bài học HSK 1, 2, 3 đã được các học viên vượt qua</div>
        </div>
        <div class="metric-card">
          <div class="metric-header"><span>TỔNG ĐIỂM XP</span><span class="metric-icon">⭐</span></div>
          <div class="metric-value" style="color:#ca8a04;">${totalXPAll}</div>
          <div class="metric-sub">Điểm thưởng học tập tích lũy toàn hệ thống</div>
        </div>
      </div>

      <!-- Main Activity Table Card -->
      <div class="admin-card">
        <div class="card-header" style="flex-wrap:wrap; gap:12px;">
          <div>
            <h3>Danh sách Học viên Hoạt động & Tiến độ Chi tiết</h3>
            <p style="color:#64748b; font-size:13px; margin:4px 0 0;">
              Theo dõi ai đang online, số bài đã hoàn thành từng cấp độ, điểm thi gần nhất và danh sách bài học cụ thể.
            </p>
          </div>
          <div style="display:flex; gap:10px; align-items:center;">
            <button type="button" class="btn-secondary" id="btnExportProgressCsv" style="display:inline-flex; align-items:center; gap:6px;">
              📥 Xuất báo cáo CSV
            </button>
            <button type="button" class="btn-primary" id="btnRefreshActivity" style="display:inline-flex; align-items:center; gap:6px;">
              🔄 Làm mới
            </button>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom:18px;">
          <div class="filter-tabs" style="margin-bottom:0;">
            <button type="button" class="filter-tab active" data-actfilter="all">Tất cả (${allUsers.length})</button>
            <button type="button" class="filter-tab" data-actfilter="online">🟢 Đang online (${onlineCount})</button>
            <button type="button" class="filter-tab" data-actfilter="hsk1">Đang học HSK 1</button>
            <button type="button" class="filter-tab" data-actfilter="hsk2">Đang học HSK 2</button>
            <button type="button" class="filter-tab" data-actfilter="hsk3">Đang học HSK 3</button>
          </div>
          <div style="min-width: 260px; flex: 1; max-width: 360px;">
            <input type="text" id="activitySearchInput" class="form-control" placeholder="🔍 Tìm học viên theo tên, username...">
          </div>
        </div>

        <!-- Table View -->
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Trạng thái hoạt động</th>
                <th style="min-width: 140px;">Tiến độ HSK 1 (12 bài)</th>
                <th style="min-width: 140px;">Tiến độ HSK 2 (15 bài)</th>
                <th style="min-width: 140px;">Tiến độ HSK 3 (20 bài)</th>
                <th>Tổng XP & Chuỗi</th>
                <th style="width: 160px; text-align: right;">Chi tiết đã học</th>
              </tr>
            </thead>
            <tbody id="activityTableBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    function getFilteredUsers() {
      return allUsers.filter(u => {
        // Search filter (hỗ trợ tìm theo tên, username hoặc email nhân viên)
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchName = (u.fullName || '').toLowerCase().includes(term);
          const matchUser = (u.username || '').toLowerCase().includes(term);
          const matchEmail = (u.email || '').toLowerCase().includes(term);
          if (!matchName && !matchUser && !matchEmail) return false;
        }
        // Category filter
        if (currentFilter === 'online') return u.isOnline;
        if (currentFilter === 'hsk1') return u.hsk1.doneCount > 0;
        if (currentFilter === 'hsk2') return u.hsk2.doneCount > 0;
        if (currentFilter === 'hsk3') return u.hsk3.doneCount > 0;
        return true;
      });
    }

    function renderTableRows() {
      const tbody = document.getElementById('activityTableBody');
      if (!tbody) return;

      const filtered = getFilteredUsers();
      // Sắp xếp: online trước, sau đó theo lần cuối hoạt động
      filtered.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0) || new Date(b.lastActive) - new Date(a.lastActive));

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center; padding:36px; color:#94a3b8;">
              Không tìm thấy học viên nào phù hợp với bộ lọc hiện tại.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.map(u => `
        <tr>
          <td>
            <div class="user-profile-cell">
              <div class="user-avatar">${(u.fullName || u.username).charAt(0).toUpperCase()}</div>
              <div>
                <div class="user-meta-name">
                  <span>${u.fullName}</span>
                  <span class="badge ${u.role === 'admin' ? 'badge-admin' : 'badge-student'}" style="font-size:11px;">
                    ${u.role === 'admin' ? '👑 Admin' : '🎓 Học viên'}
                  </span>
                  ${u.emailVerified ? '<span title="Đã xác thực email" style="color:#16a34a; font-weight:700; font-size:12px; margin-left:3px;">✓</span>' : ''}
                </div>
                <div class="user-meta-email" style="font-size:12px; color:#475569; margin:2px 0;">
                  ✉️ <b>${u.email || 'Chưa cập nhật email'}</b>
                  ${u.emailVerified ? '<span style="color:#16a34a; font-size:10px; background:#dcfce7; padding:1px 5px; border-radius:4px; font-weight:600; margin-left:4px;">Đã xác nhận</span>' : ''}
                </div>
                <div class="user-meta-sub" style="font-size:11px; color:#94a3b8; margin-top:2px;">@${u.username} · Tạo ${new Date(u.createdAt).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>
          </td>
          <td>
            <span class="badge ${u.activeState === 'online' ? 'badge-online' : (u.activeState === 'today' ? 'badge-today' : 'badge-offline')}">
              <span class="${u.activeState === 'online' ? 'pulse-dot' : (u.activeState === 'today' ? 'dot-today' : 'dot-offline')}"></span>
              ${u.activeText}
            </span>
          </td>
          <td>
            <div class="progress-cell">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                <span>${u.hsk1.doneCount}/12 bài</span>
                <span style="color:#6657d9;">${u.hsk1.percent}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill fill-hsk1" style="width: ${u.hsk1.percent}%;"></div>
              </div>
              <div style="font-size:11px; color:#64748b; margin-top:3px;">
                Điểm: <b>${u.hsk1.score}</b> · XP: ${u.hsk1.xp}
              </div>
            </div>
          </td>
          <td>
            <div class="progress-cell">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                <span>${u.hsk2.doneCount}/15 bài</span>
                <span style="color:#10b981;">${u.hsk2.percent}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill fill-hsk2" style="width: ${u.hsk2.percent}%;"></div>
              </div>
              <div style="font-size:11px; color:#64748b; margin-top:3px;">
                Điểm: <b>${u.hsk2.score}</b> · XP: ${u.hsk2.xp}
              </div>
            </div>
          </td>
          <td>
            <div class="progress-cell">
              <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700;">
                <span>${u.hsk3.doneCount}/20 bài</span>
                <span style="color:#0284c7;">${u.hsk3.percent}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill fill-hsk3" style="width: ${u.hsk3.percent}%;"></div>
              </div>
              <div style="font-size:11px; color:#64748b; margin-top:3px;">
                Điểm: <b>${u.hsk3.score}</b> · XP: ${u.hsk3.xp}
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:13px; font-weight:700; color:#ca8a04;">⭐ ${u.totalXP} XP</div>
            <div style="font-size:12px; color:#64748b; margin-top:2px;">🔥 Chuỗi ${u.streak} ngày</div>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-primary btn-sm btn-open-detail" data-id="${u.id}" style="padding:7px 12px;">
              📋 Xem bài đã học
            </button>
          </td>
        </tr>
      `).join('');

      tbody.querySelectorAll('.btn-open-detail').forEach(b => {
        b.onclick = () => {
          const userObj = allUsers.find(x => x.id === b.dataset.id);
          if (userObj) openProgressDetailModal(userObj);
        };
      });
    }

    renderTableRows();

    // Event listeners
    container.querySelectorAll('[data-actfilter]').forEach(b => {
      b.onclick = () => {
        container.querySelectorAll('[data-actfilter]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        currentFilter = b.dataset.actfilter;
        renderTableRows();
      };
    });

    const searchInput = document.getElementById('activitySearchInput');
    if (searchInput) {
      searchInput.oninput = (e) => {
        searchTerm = e.target.value.trim();
        renderTableRows();
      };
    }

    const btnRefresh = document.getElementById('btnRefreshActivity');
    if (btnRefresh) {
      btnRefresh.onclick = () => {
        renderActivityTab(container);
      };
    }

    // Xuất CSV
    const btnExport = document.getElementById('btnExportProgressCsv');
    if (btnExport) {
      btnExport.onclick = () => {
        exportProgressCSV(allUsers);
      };
    }
  }

  // --- MODAL CHI TIẾT BÀI ĐÃ HOÀN THÀNH CỦA TỪNG HỌC VIÊN ---
  function openProgressDetailModal(user) {
    const host = document.getElementById('adminModalHost');
    let activeLevelTab = 'hsk1'; // hsk1 | hsk2 | hsk3

    function renderModalContent() {
      const levelData = user[activeLevelTab] || { done: [], score: '—', xp: 0, total: 12, percent: 0 };
      const catalog = HSK_LESSON_CATALOG[activeLevelTab] || [];
      const completedIndices = new Set(levelData.done || []);

      host.innerHTML = `
        <div class="admin-modal-overlay">
          <div class="admin-modal-card" style="max-width: 780px; width: 95%;">
            <div class="admin-modal-header" style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:18px 22px;">
              <div style="display:flex; align-items:center; gap:12px;">
                <div class="user-avatar" style="width:44px; height:44px; font-size:17px;">
                  ${(user.fullName || user.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style="font-size:18px; margin:0; display:flex; align-items:center; gap:8px;">
                    <span>${user.fullName}</span>
                    <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-student'}">
                      ${user.role === 'admin' ? 'Admin' : 'Học viên'}
                    </span>
                    ${user.emailVerified ? '<span title="Đã xác thực email" style="color:#16a34a; font-weight:700; font-size:13px;">✓</span>' : ''}
                  </h3>
                  <div style="font-size:12px; color:#64748b; margin-top:2px;">
                    ✉️ <b>${user.email || 'Chưa có email'}</b> ${user.emailVerified ? '<span style="color:#16a34a; font-size:10.5px; background:#dcfce7; padding:1px 5px; border-radius:4px; font-weight:600;">(Đã xác nhận)</span>' : ''} · @${user.username} · Trạng thái: <b>${user.activeText}</b> · Tổng hoàn thành: <b>${user.totalLessonsCompleted}/47 bài</b>
                  </div>
                </div>
              </div>
              <button type="button" class="modal-close" id="btnCloseProgressModal" style="border:0; background:transparent; font-size:22px; cursor:pointer; color:#94a3b8;">✕</button>
            </div>

            <!-- Level Selector Tabs -->
            <div style="padding:14px 22px 0; background:#fff; border-bottom:1px solid #e2e8f0; display:flex; gap:10px;">
              <button type="button" class="filter-tab ${activeLevelTab === 'hsk1' ? 'active' : ''}" data-modallevel="hsk1" style="padding:8px 16px;">
                HSK 1 (${user.hsk1.doneCount}/12 bài)
              </button>
              <button type="button" class="filter-tab ${activeLevelTab === 'hsk2' ? 'active' : ''}" data-modallevel="hsk2" style="padding:8px 16px;">
                HSK 2 (${user.hsk2.doneCount}/15 bài)
              </button>
              <button type="button" class="filter-tab ${activeLevelTab === 'hsk3' ? 'active' : ''}" data-modallevel="hsk3" style="padding:8px 16px;">
                HSK 3 (${user.hsk3.doneCount}/20 bài)
              </button>
            </div>

            <!-- Modal Body -->
            <div class="admin-modal-body" style="padding:20px 22px;">
              <!-- Level Summary Banner -->
              <div style="background:#f9f8ff; border:1px solid #e5e0ff; border-radius:12px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div>
                  <span style="font-size:12px; font-weight:700; color:#6657d9; text-transform:uppercase;">TIẾN ĐỘ ${activeLevelTab.toUpperCase()}</span>
                  <div style="font-size:20px; font-weight:800; color:#1e1b4b; margin-top:2px;">
                    ${levelData.doneCount} / ${catalog.length} bài đã hoàn thành (${levelData.percent}%)
                  </div>
                </div>
                <div style="display:flex; gap:16px;">
                  <div style="text-align:right;">
                    <span style="font-size:11px; color:#64748b; font-weight:600;">ĐIỂM GẦN NHẤT</span>
                    <div style="font-size:18px; font-weight:800; color:#0284c7;">${levelData.score}</div>
                  </div>
                  <div style="text-align:right;">
                    <span style="font-size:11px; color:#64748b; font-weight:600;">XP TÍCH LŨY</span>
                    <div style="font-size:18px; font-weight:800; color:#ca8a04;">⭐ ${levelData.xp}</div>
                  </div>
                </div>
              </div>

              <!-- Checklist Grid -->
              <h4 style="margin:8px 0 2px; font-size:15px; color:#0f172a;">
                Danh sách chi tiết từng bài học (${catalog.length} bài chuẩn giáo trình):
              </h4>
              <div class="checklist-grid">
                ${catalog.map((lesson, idx) => {
                  const isDone = completedIndices.has(idx);
                  return `
                    <div class="checklist-item ${isDone ? 'completed' : ''}">
                      <div class="checklist-item-icon" style="color: ${isDone ? '#16a34a' : '#94a3b8'};">
                        ${isDone ? '✅' : '⏳'}
                      </div>
                      <div style="flex:1;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <span class="checklist-item-title">Bài ${lesson.num}</span>
                          <span class="badge ${isDone ? 'badge-active' : 'badge-offline'}" style="font-size:10px; padding:2px 6px;">
                            ${isDone ? '✓ Đã xong' : 'Chưa học'}
                          </span>
                        </div>
                        <div class="checklist-item-zh">${lesson.zh}</div>
                        <div class="checklist-item-sub">${lesson.py} · ${lesson.vi}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="admin-modal-footer">
              <button type="button" class="btn-secondary" id="btnDismissProgressModal">Đóng cửa sổ</button>
            </div>
          </div>
        </div>
      `;

      // Event handlers inside modal
      document.getElementById('btnCloseProgressModal').onclick = () => { host.innerHTML = ''; };
      document.getElementById('btnDismissProgressModal').onclick = () => { host.innerHTML = ''; };

      host.querySelectorAll('[data-modallevel]').forEach(tab => {
        tab.onclick = () => {
          activeLevelTab = tab.dataset.modallevel;
          renderModalContent();
        };
      });
    }

    renderModalContent();
  }

  // Xuất file CSV tiến độ học viên
  function exportProgressCSV(users) {
    const headers = [
      'ID', 'Tài khoản', 'Họ và tên', 'Email nhân viên', 'Xác thực Email', 'Vai trò', 'Trạng thái hoạt động', 'Lần cuối hoạt động',
      'HSK1 Hoàn thành', 'HSK1 %', 'HSK1 Điểm',
      'HSK2 Hoàn thành', 'HSK2 %', 'HSK2 Điểm',
      'HSK3 Hoàn thành', 'HSK3 %', 'HSK3 Điểm',
      'Tổng số bài xong (trên 47)', 'Tổng XP', 'Chuỗi ngày'
    ];

    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.username}"`,
      `"${u.fullName}"`,
      `"${u.email || ''}"`,
      `"${u.emailVerified ? 'Đã xác nhận' : 'Chưa xác thực'}"`,
      `"${u.role === 'admin' ? 'Quản trị viên' : 'Học viên'}"`,
      `"${u.activeText}"`,
      `"${new Date(u.lastActive).toLocaleString('vi-VN')}"`,
      `"${u.hsk1.doneCount}/12"`,
      `"${u.hsk1.percent}%"`,
      `"${u.hsk1.score}"`,
      `"${u.hsk2.doneCount}/15"`,
      `"${u.hsk2.percent}%"`,
      `"${u.hsk2.score}"`,
      `"${u.hsk3.doneCount}/20"`,
      `"${u.hsk3.percent}%"`,
      `"${u.hsk3.score}"`,
      `"${u.totalLessonsCompleted}/47"`,
      `"${u.totalXP}"`,
      `"${u.streak}"`
    ]);

    const csvContent = '﻿' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nihao-hsk-tien-do-hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Khởi động hệ thống quản trị
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
