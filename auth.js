/**
 * Auth & RBAC Module (Xác thực người dùng & Phân quyền)
 * Hỗ trợ chế độ Local Storage + Cloudflare Pages Functions API
 */
(() => {
  'use strict';

  const USERS_KEY = 'hsk_users_db_v1';
  const CURRENT_USER_KEY = 'hsk_current_user_v1';

  // Khởi tạo tài khoản mẫu mặc định nếu chưa có
  function getStoredUsers() {
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (data) return JSON.parse(data);
    } catch {}

    const defaultUsers = [
      {
        id: 'u_admin_01',
        username: 'admin',
        password: 'admin@nihao123', // Mật khẩu quản trị mặc định
        fullName: 'Quản trị viên Hệ thống',
        role: 'admin', // admin | student
        status: 'active',
        createdAt: '2026-10-01T00:00:00.000Z'
      },
      {
        id: 'u_student_01',
        username: 'hocvien',
        password: '123456',
        fullName: 'Nguyễn Văn Học',
        role: 'student',
        status: 'active',
        createdAt: '2026-10-15T00:00:00.000Z'
      }
    ];
    saveUsers(defaultUsers);
    return defaultUsers;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Đồng bộ với studentName của hệ thống hiện tại
        localStorage.setItem('hskStudentName', user.fullName || user.username);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      broadcastAuthChange(user);
    } catch {}
  }

  function broadcastAuthChange(user) {
    window.dispatchEvent(new CustomEvent('hsk-auth-change', { detail: user }));
    // Thông báo cho các iframe con nếu có
    document.querySelectorAll('iframe').forEach(frame => {
      try {
        frame.contentWindow?.postMessage({ type: 'hsk-auth-change', user }, '*');
      } catch {}
    });
  }

  // Đăng nhập
  async function login(username, password) {
    username = String(username || '').trim().toLowerCase();
    password = String(password || '').trim();

    if (!username || !password) {
      throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    }

    // Ưu tiên gọi Cloudflare API nếu có backend
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          setCurrentUser(data.user);
          return data.user;
        }
      }
    } catch {}

    // Fallback Local Storage Mode
    const users = getStoredUsers();
    const user = users.find(u => u.username.toLowerCase() === username && u.password === password);

    if (!user) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    if (user.status === 'blocked') {
      throw new Error('Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.');
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      status: user.status
    };
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  // Đăng ký tài khoản học viên mới
  async function register(username, password, fullName) {
    username = String(username || '').trim().toLowerCase();
    password = String(password || '').trim();
    fullName = String(fullName || '').trim();

    if (!username || username.length < 3) {
      throw new Error('Tên đăng nhập cần có ít nhất 3 ký tự.');
    }
    if (!password || password.length < 6) {
      throw new Error('Mật khẩu cần có ít nhất 6 ký tự.');
    }
    if (!fullName) {
      fullName = username;
    }

    // Thử gọi Cloudflare API
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, fullName })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.user) {
          setCurrentUser(data.user);
          return data.user;
        }
      }
    } catch {}

    // Fallback Local Storage Mode
    const users = getStoredUsers();
    if (users.some(u => u.username.toLowerCase() === username)) {
      throw new Error('Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác.');
    }

    const newUser = {
      id: 'u_' + Date.now().toString(36),
      username,
      password,
      fullName,
      role: 'student', // Mặc định là học viên
      status: 'active',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      status: newUser.status
    };
    setCurrentUser(sessionUser);
    return sessionUser;
  }

  // Đăng xuất
  function logout() {
    setCurrentUser(null);
  }

  // Quản lý User (dành riêng cho Admin)
  function getAllUsers() {
    const current = getCurrentUser();
    if (!current || current.role !== 'admin') {
      throw new Error('Bạn không có quyền truy cập danh sách người dùng.');
    }
    return getStoredUsers().map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt
    }));
  }

  function updateUser(id, updates) {
    const current = getCurrentUser();
    if (!current || current.role !== 'admin') {
      throw new Error('Bạn không có quyền chỉnh sửa người dùng.');
    }

    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Không tìm thấy người dùng.');

    // Không cho phép tự giáng cấp hoặc khóa chính tài khoản của mình
    if (id === current.id && updates.role && updates.role !== 'admin') {
      throw new Error('Không thể tự thu hồi quyền Admin của chính bạn.');
    }

    users[index] = { ...users[index], ...updates };
    saveUsers(users);

    // Cập nhật session nếu là chính mình
    if (id === current.id) {
      setCurrentUser({ ...current, ...updates });
    }

    return users[index];
  }

  function deleteUser(id) {
    const current = getCurrentUser();
    if (!current || current.role !== 'admin') {
      throw new Error('Bạn không có quyền xóa người dùng.');
    }
    if (id === current.id) {
      throw new Error('Không thể tự xóa tài khoản của chính bạn.');
    }

    let users = getStoredUsers();
    users = users.filter(u => u.id !== id);
    saveUsers(users);
  }

  function addUserByAdmin(username, password, fullName, role = 'student') {
    const current = getCurrentUser();
    if (!current || current.role !== 'admin') {
      throw new Error('Bạn không có quyền tạo tài khoản.');
    }

    username = String(username || '').trim().toLowerCase();
    password = String(password || '').trim();
    fullName = String(fullName || '').trim() || username;

    if (!username || !password) throw new Error('Vui lòng nhập tên đăng nhập và mật khẩu.');

    const users = getStoredUsers();
    if (users.some(u => u.username.toLowerCase() === username)) {
      throw new Error('Tên đăng nhập đã tồn tại.');
    }

    const newUser = {
      id: 'u_' + Date.now().toString(36),
      username,
      password,
      fullName,
      role: ['admin', 'student'].includes(role) ? role : 'student',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  // Modal Đăng nhập / Đăng ký giao diện nổi (Popup Modal)
  function openAuthModal(defaultMode = 'login') {
    let modal = document.getElementById('hskAuthModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hskAuthModal';
      modal.className = 'srs-modal-overlay';
      modal.innerHTML = `
        <div class="srs-modal-card" style="max-width: 420px; padding: 26px 28px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:#6657d9; color:#fff; border-radius:8px; padding:4px 8px; font-weight:800; font-size:14px;">中</span>
              <strong style="font-size:18px; color:#1a1e36;">Tài khoản 你好 HSK</strong>
            </div>
            <button type="button" class="srs-close" id="authModalClose">✕</button>
          </div>
          <div style="display:flex; background:#f1f3f9; border-radius:10px; padding:3px; margin-bottom:18px;">
            <button type="button" id="authTabLogin" style="flex:1; border:0; background:#fff; padding:8px; border-radius:8px; font-weight:700; color:#1a1e36; cursor:pointer;">Đăng nhập</button>
            <button type="button" id="authTabRegister" style="flex:1; border:0; background:transparent; padding:8px; border-radius:8px; font-weight:600; color:#626880; cursor:pointer;">Đăng ký</button>
          </div>
          <form id="authForm" style="display:flex; flex-direction:column; gap:12px;">
            <div id="authFullNameGroup" hidden>
              <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:4px;">Họ và tên của bạn</label>
              <input type="text" id="authFullName" placeholder="Ví dụ: Nguyễn Văn An" style="width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:4px;">Tên đăng nhập</label>
              <input type="text" id="authUsername" required placeholder="Tên đăng nhập (username)" style="width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>
            <div>
              <label style="display:block; font-size:13px; font-weight:600; color:#475569; margin-bottom:4px;">Mật khẩu</label>
              <input type="password" id="authPassword" required placeholder="••••••••" style="width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; box-sizing:border-box;">
            </div>
            <div id="authErrorMsg" style="color:#ef4444; font-size:13px; font-weight:500; min-height:18px;"></div>
            <button type="submit" id="authSubmitBtn" style="border:0; background:#6657d9; color:#fff; padding:12px; border-radius:12px; font-weight:700; font-size:15px; cursor:pointer; margin-top:4px;">Đăng nhập ngay</button>
          </form>
          <div style="margin-top:14px; padding-top:12px; border-top:1px dashed #e2e8f0; font-size:12px; color:#8b90a6; text-align:center;">
            Tài khoản Admin thử nghiệm: <b>admin</b> / <b>admin@nihao123</b><br>
            Tài khoản Học viên thử nghiệm: <b>hocvien</b> / <b>123456</b>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('authModalClose').onclick = () => { modal.hidden = true; };
    }

    modal.hidden = false;
    let mode = defaultMode;
    const tabLogin = document.getElementById('authTabLogin');
    const tabRegister = document.getElementById('authTabRegister');
    const nameGroup = document.getElementById('authFullNameGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const errorMsg = document.getElementById('authErrorMsg');

    function setMode(m) {
      mode = m;
      errorMsg.textContent = '';
      if (mode === 'login') {
        tabLogin.style.background = '#fff';
        tabLogin.style.color = '#1a1e36';
        tabRegister.style.background = 'transparent';
        tabRegister.style.color = '#626880';
        nameGroup.hidden = true;
        submitBtn.textContent = 'Đăng nhập ngay';
      } else {
        tabRegister.style.background = '#fff';
        tabRegister.style.color = '#1a1e36';
        tabLogin.style.background = 'transparent';
        tabLogin.style.color = '#626880';
        nameGroup.hidden = false;
        submitBtn.textContent = 'Tạo tài khoản học viên';
      }
    }

    tabLogin.onclick = () => setMode('login');
    tabRegister.onclick = () => setMode('register');
    setMode(defaultMode);

    document.getElementById('authForm').onsubmit = async (e) => {
      e.preventDefault();
      errorMsg.textContent = '';
      const u = document.getElementById('authUsername').value;
      const p = document.getElementById('authPassword').value;
      const fn = document.getElementById('authFullName').value;

      try {
        if (mode === 'login') {
          const user = await login(u, p);
          modal.hidden = true;
          if (user.role === 'admin' && location.pathname.includes('/admin')) {
            location.reload();
          } else {
            location.reload();
          }
        } else {
          await register(u, p, fn);
          modal.hidden = true;
          location.reload();
        }
      } catch (err) {
        errorMsg.textContent = err.message;
      }
    };
  }

  window.HSKAuth = {
    login,
    register,
    logout,
    getCurrentUser,
    getAllUsers,
    updateUser,
    deleteUser,
    addUserByAdmin,
    openAuthModal,
    isAdmin: () => getCurrentUser()?.role === 'admin',
    isAuthenticated: () => !!getCurrentUser()
  };
})();

