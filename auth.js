/**
 * Auth & RBAC Module (Xác thực người dùng, Phân quyền & Giám sát Tiến độ)
 * Hỗ trợ chế độ Local Storage + Cloudflare Pages Functions API
 */
(() => {
  'use strict';

  const USERS_KEY = 'hsk_users_db_v1';
  const CURRENT_USER_KEY = 'hsk_current_user_v1';
  const PROGRESS_MAP_KEY = 'hsk_users_progress_map_v1';

  // Khởi tạo tài khoản mẫu mặc định nếu chưa có
  function getStoredUsers() {
    let users = null;
    try {
      const data = localStorage.getItem(USERS_KEY);
      if (data) users = JSON.parse(data);
    } catch {}

    const now = Date.now();
    const defaultUsers = [
      {
        id: 'u_admin_01',
        username: 'admin',
        password: 'admin@nihao123', // Mật khẩu quản trị mặc định
        fullName: 'Quản trị viên Hệ thống',
        role: 'admin', // admin | student
        status: 'active',
        createdAt: '2026-10-01T00:00:00.000Z',
        lastLogin: new Date(now - 15 * 60 * 1000).toISOString(),
        lastActive: new Date(now - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'u_student_01',
        username: 'hocvien',
        password: '123456',
        fullName: 'Nguyễn Văn Học',
        role: 'student',
        status: 'active',
        createdAt: '2026-10-15T00:00:00.000Z',
        lastLogin: new Date(now - 45 * 60 * 1000).toISOString(),
        lastActive: new Date(now - 8 * 60 * 1000).toISOString()
      },
      {
        id: 'u_student_02',
        username: 'tranthimai',
        password: '123456',
        fullName: 'Trần Thị Mai',
        role: 'student',
        status: 'active',
        createdAt: '2026-10-18T00:00:00.000Z',
        lastLogin: new Date(now - 3 * 3600 * 1000).toISOString(),
        lastActive: new Date(now - 2.5 * 3600 * 1000).toISOString()
      },
      {
        id: 'u_student_03',
        username: 'lehoangnam',
        password: '123456',
        fullName: 'Lê Hoàng Nam',
        role: 'student',
        status: 'active',
        createdAt: '2026-10-20T00:00:00.000Z',
        lastLogin: new Date(now - 3 * 86400 * 1000).toISOString(),
        lastActive: new Date(now - 3 * 86400 * 1000).toISOString()
      }
    ];

    if (!Array.isArray(users) || users.length === 0) {
      saveUsers(defaultUsers);
      return defaultUsers;
    }

    // Đảm bảo các tài khoản mẫu đều tồn tại và có trường thời gian
    let updated = false;
    defaultUsers.forEach(def => {
      const existing = users.find(u => u.username === def.username);
      if (!existing) {
        users.push(def);
        updated = true;
      } else {
        if (!existing.lastActive) { existing.lastActive = def.lastActive; updated = true; }
        if (!existing.lastLogin) { existing.lastLogin = def.lastLogin; updated = true; }
      }
    });

    if (updated) saveUsers(users);
    return users;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch {}
  }

  // Quản lý map tiến độ học viên
  function getStoredProgressMap() {
    let map = null;
    try {
      const data = localStorage.getItem(PROGRESS_MAP_KEY);
      if (data) map = JSON.parse(data);
    } catch {}

    const now = Date.now();
    const defaultMap = {
      u_admin_01: {
        lastActive: new Date(now - 2 * 60 * 1000).toISOString(),
        lastLogin: new Date(now - 15 * 60 * 1000).toISOString(),
        streak: 7,
        hsk1: { done: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], score: '100%', xp: 600 },
        hsk2: { done: [0, 1, 2, 3, 4, 5, 6, 7], score: '95%', xp: 420 },
        hsk3: { done: [0, 1, 2, 3], score: '90%', xp: 210 },
        totalXP: 1230
      },
      u_student_01: {
        lastActive: new Date(now - 8 * 60 * 1000).toISOString(),
        lastLogin: new Date(now - 45 * 60 * 1000).toISOString(),
        streak: 3,
        hsk1: { done: [0, 1, 2, 3, 4], score: '92%', xp: 250 },
        hsk2: { done: [0, 1], score: '86%', xp: 110 },
        hsk3: { done: [], score: '—', xp: 0 },
        totalXP: 360
      },
      u_student_02: {
        lastActive: new Date(now - 2.5 * 3600 * 1000).toISOString(),
        lastLogin: new Date(now - 3 * 3600 * 1000).toISOString(),
        streak: 4,
        hsk1: { done: [0, 1, 2, 3, 4, 5, 6, 7], score: '90%', xp: 380 },
        hsk2: { done: [0], score: '80%', xp: 50 },
        hsk3: { done: [], score: '—', xp: 0 },
        totalXP: 430
      },
      u_student_03: {
        lastActive: new Date(now - 3 * 86400 * 1000).toISOString(),
        lastLogin: new Date(now - 3 * 86400 * 1000).toISOString(),
        streak: 1,
        hsk1: { done: [0, 1], score: '75%', xp: 90 },
        hsk2: { done: [], score: '—', xp: 0 },
        hsk3: { done: [], score: '—', xp: 0 },
        totalXP: 90
      }
    };

    if (!map || typeof map !== 'object') {
      saveProgressMap(defaultMap);
      return defaultMap;
    }

    // Ghép các key mặc định nếu thiếu
    let changed = false;
    Object.keys(defaultMap).forEach(uid => {
      if (!map[uid]) {
        map[uid] = defaultMap[uid];
        changed = true;
      }
    });
    if (changed) saveProgressMap(map);
    return map;
  }

  function saveProgressMap(map) {
    try {
      localStorage.setItem(PROGRESS_MAP_KEY, JSON.stringify(map));
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
        user.lastLogin = new Date().toISOString();
        user.lastActive = user.lastLogin;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.setItem('hskStudentName', user.fullName || user.username);

        // Cập nhật vào DB
        const users = getStoredUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if (idx !== -1) {
          users[idx].lastLogin = user.lastLogin;
          users[idx].lastActive = user.lastActive;
          saveUsers(users);
        }

        // Tải tiến độ của người dùng này vào localStorage cục bộ
        restoreUserProgressToLocal(user.id);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
      broadcastAuthChange(user);
    } catch {}
  }

  function restoreUserProgressToLocal(userId) {
    try {
      const map = getStoredProgressMap();
      const p = map[userId];
      if (!p) return;

      if (p.hsk1 && Array.isArray(p.hsk1.done)) {
        localStorage.setItem('hsk12done', JSON.stringify(p.hsk1.done));
        if (p.hsk1.score) localStorage.setItem('hsk12score', p.hsk1.score);
        if (p.hsk1.xp) localStorage.setItem('hskXP', String(p.hsk1.xp));
      }
      if (p.hsk2 && Array.isArray(p.hsk2.done)) {
        localStorage.setItem('hsk2done', JSON.stringify(p.hsk2.done));
        if (p.hsk2.score) localStorage.setItem('hsk2score', p.hsk2.score);
        if (p.hsk2.xp) localStorage.setItem('hsk2XP', String(p.hsk2.xp));
      }
      if (p.hsk3 && Array.isArray(p.hsk3.done)) {
        localStorage.setItem('hsk3done', JSON.stringify(p.hsk3.done));
        if (p.hsk3.score) localStorage.setItem('hsk3score', p.hsk3.score);
        if (p.hsk3.xp) localStorage.setItem('hsk3XP', String(p.hsk3.xp));
      }
      if (p.streak) localStorage.setItem('hskStreak', String(p.streak));
    } catch {}
  }

  // Đồng bộ tiến độ từ localStorage của trình duyệt vào user map
  function syncCurrentUserProgress() {
    const cur = getCurrentUser();
    if (!cur) return;

    try {
      const map = getStoredProgressMap();
      const uProg = map[cur.id] || {
        hsk1: { done: [], score: '—', xp: 0 },
        hsk2: { done: [], score: '—', xp: 0 },
        hsk3: { done: [], score: '—', xp: 0 },
        streak: 1,
        totalXP: 0
      };

      // Đọc từ localStorage hiện thời
      const hsk1Done = JSON.parse(localStorage.getItem('hsk12done') || '[]');
      const hsk2Done = JSON.parse(localStorage.getItem('hsk2done') || '[]');
      const hsk3Done = JSON.parse(localStorage.getItem('hsk3done') || '[]');

      const hsk1Score = localStorage.getItem('hsk12score') || uProg.hsk1?.score || '—';
      const hsk2Score = localStorage.getItem('hsk2score') || uProg.hsk2?.score || '—';
      const hsk3Score = localStorage.getItem('hsk3score') || uProg.hsk3?.score || '—';

      const hsk1XP = Number(localStorage.getItem('hskXP') || uProg.hsk1?.xp || 0);
      const hsk2XP = Number(localStorage.getItem('hsk2XP') || uProg.hsk2?.xp || 0);
      const hsk3XP = Number(localStorage.getItem('hsk3XP') || uProg.hsk3?.xp || 0);
      const streak = Number(localStorage.getItem('hskStreak') || uProg.streak || 1);

      // Hợp nhất danh sách bài đã làm
      const m1Done = [...new Set([...(uProg.hsk1?.done || []), ...hsk1Done])].sort((a, b) => a - b);
      const m2Done = [...new Set([...(uProg.hsk2?.done || []), ...hsk2Done])].sort((a, b) => a - b);
      const m3Done = [...new Set([...(uProg.hsk3?.done || []), ...hsk3Done])].sort((a, b) => a - b);

      const totalXP = Math.max(uProg.totalXP || 0, hsk1XP + hsk2XP + hsk3XP);

      const nowIso = new Date().toISOString();
      map[cur.id] = {
        lastActive: nowIso,
        lastLogin: uProg.lastLogin || cur.lastLogin || nowIso,
        streak,
        hsk1: { done: m1Done, score: hsk1Score, xp: hsk1XP },
        hsk2: { done: m2Done, score: hsk2Score, xp: hsk2XP },
        hsk3: { done: m3Done, score: hsk3Score, xp: hsk3XP },
        totalXP
      };

      saveProgressMap(map);

      // Cập nhật lastActive cho users
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.id === cur.id);
      if (idx !== -1) {
        users[idx].lastActive = nowIso;
        saveUsers(users);
      }
    } catch {}
  }

  function recordHeartbeat() {
    const cur = getCurrentUser();
    if (!cur) return;
    const nowIso = new Date().toISOString();
    try {
      const users = getStoredUsers();
      const idx = users.findIndex(u => u.id === cur.id);
      if (idx !== -1) {
        users[idx].lastActive = nowIso;
        saveUsers(users);
      }
      const map = getStoredProgressMap();
      if (map[cur.id]) {
        map[cur.id].lastActive = nowIso;
        saveProgressMap(map);
      }
    } catch {}
  }

  function broadcastAuthChange(user) {
    window.dispatchEvent(new CustomEvent('hsk-auth-change', { detail: user }));
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

    // Thử gọi Cloudflare API nếu có backend
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

    const nowIso = new Date().toISOString();
    const newUser = {
      id: 'u_' + Date.now().toString(36),
      username,
      password,
      fullName,
      role: 'student', // Mặc định là học viên
      status: 'active',
      createdAt: nowIso,
      lastLogin: nowIso,
      lastActive: nowIso
    };

    users.push(newUser);
    saveUsers(users);

    // Khởi tạo tiến độ ban đầu cho học viên mới
    const map = getStoredProgressMap();
    map[newUser.id] = {
      lastActive: nowIso,
      lastLogin: nowIso,
      streak: 1,
      hsk1: { done: [], score: '—', xp: 0 },
      hsk2: { done: [], score: '—', xp: 0 },
      hsk3: { done: [], score: '—', xp: 0 },
      totalXP: 0
    };
    saveProgressMap(map);

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
    syncCurrentUserProgress();
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
      createdAt: u.createdAt,
      lastActive: u.lastActive,
      lastLogin: u.lastLogin
    }));
  }

  // Lấy toàn bộ danh sách người dùng kèm theo chi tiết hoạt động & tiến độ học tập
  function getAllUsersWithProgress() {
    const current = getCurrentUser();
    if (!current || current.role !== 'admin') {
      throw new Error('Bạn không có quyền truy cập danh sách người dùng.');
    }

    // Tự động đồng bộ tiến độ phiên hiện tại trước khi xuất
    syncCurrentUserProgress();

    const users = getStoredUsers();
    const map = getStoredProgressMap();
    const now = Date.now();

    return users.map(u => {
      const p = map[u.id] || {
        hsk1: { done: [], score: '—', xp: 0 },
        hsk2: { done: [], score: '—', xp: 0 },
        hsk3: { done: [], score: '—', xp: 0 },
        streak: 1,
        totalXP: 0
      };

      const lastActiveIso = p.lastActive || u.lastActive || u.createdAt;
      const lastActiveTime = new Date(lastActiveIso).getTime();
      const diffMs = Math.max(0, now - lastActiveTime);
      const diffMinutes = Math.floor(diffMs / 60000);

      // User coi là đang online nếu: hoạt động trong vòng 15 phút qua HOẶC là tài khoản đang đăng nhập trong tab hiện tại
      const isCurrentSessionUser = current && current.id === u.id;
      const isOnline = isCurrentSessionUser || diffMinutes < 15;

      let activeState = 'offline';
      let activeText = '';

      if (isOnline) {
        activeState = 'online';
        activeText = isCurrentSessionUser ? 'Đang online (Phiên này)' : 'Đang online';
      } else if (diffMinutes < 60) {
        activeState = 'today';
        activeText = `${diffMinutes} phút trước`;
      } else {
        const lastDate = new Date(lastActiveIso);
        const nowDate = new Date(now);
        const isSameDay = lastDate.toDateString() === nowDate.toDateString();
        const yesterday = new Date(now - 86400000);
        const isYesterday = lastDate.toDateString() === yesterday.toDateString();

        const hh = String(lastDate.getHours()).padStart(2, '0');
        const mm = String(lastDate.getMinutes()).padStart(2, '0');

        if (isSameDay) {
          activeState = 'today';
          activeText = `Hôm nay ${hh}:${mm}`;
        } else if (isYesterday) {
          activeState = 'offline';
          activeText = `Hôm qua ${hh}:${mm}`;
        } else {
          activeState = 'offline';
          const dd = String(lastDate.getDate()).padStart(2, '0');
          const mo = String(lastDate.getMonth() + 1).padStart(2, '0');
          activeText = `${dd}/${mo}/${lastDate.getFullYear()}`;
        }
      }

      const hsk1Done = Array.isArray(p.hsk1?.done) ? p.hsk1.done : [];
      const hsk2Done = Array.isArray(p.hsk2?.done) ? p.hsk2.done : [];
      const hsk3Done = Array.isArray(p.hsk3?.done) ? p.hsk3.done : [];

      const totalLessonsCompleted = hsk1Done.length + hsk2Done.length + hsk3Done.length;
      const totalXP = (p.hsk1?.xp || 0) + (p.hsk2?.xp || 0) + (p.hsk3?.xp || 0) || (p.totalXP || 0);

      return {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        lastActive: lastActiveIso,
        lastLogin: u.lastLogin || p.lastLogin || u.createdAt,
        isOnline,
        activeState,
        activeText,
        hsk1: {
          done: hsk1Done,
          doneCount: hsk1Done.length,
          total: 12,
          percent: Math.round((hsk1Done.length / 12) * 100),
          score: p.hsk1?.score || '—',
          xp: p.hsk1?.xp || 0
        },
        hsk2: {
          done: hsk2Done,
          doneCount: hsk2Done.length,
          total: 15,
          percent: Math.round((hsk2Done.length / 15) * 100),
          score: p.hsk2?.score || '—',
          xp: p.hsk2?.xp || 0
        },
        hsk3: {
          done: hsk3Done,
          doneCount: hsk3Done.length,
          total: 20,
          percent: Math.round((hsk3Done.length / 20) * 100),
          score: p.hsk3?.score || '—',
          xp: p.hsk3?.xp || 0
        },
        totalLessonsCompleted,
        totalLessonsAllLevels: 47,
        totalPercentAll: Math.round((totalLessonsCompleted / 47) * 100),
        totalXP,
        streak: p.streak || 1
      };
    });
  }

  function getUserProgress(userId) {
    const map = getStoredProgressMap();
    return map[userId] || null;
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

    const map = getStoredProgressMap();
    delete map[id];
    saveProgressMap(map);
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

    const nowIso = new Date().toISOString();
    const newUser = {
      id: 'u_' + Date.now().toString(36),
      username,
      password,
      fullName,
      role: ['admin', 'student'].includes(role) ? role : 'student',
      status: 'active',
      createdAt: nowIso,
      lastLogin: nowIso,
      lastActive: nowIso
    };
    users.push(newUser);
    saveUsers(users);

    // Khởi tạo tiến độ rỗng
    const map = getStoredProgressMap();
    map[newUser.id] = {
      lastActive: nowIso,
      lastLogin: nowIso,
      streak: 1,
      hsk1: { done: [], score: '—', xp: 0 },
      hsk2: { done: [], score: '—', xp: 0 },
      hsk3: { done: [], score: '—', xp: 0 },
      totalXP: 0
    };
    saveProgressMap(map);

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
          location.reload();
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

  // Tự động đồng bộ và nhịp đập khi trang load
  try {
    if (getCurrentUser()) {
      syncCurrentUserProgress();
      recordHeartbeat();
      // Lắng nghe các thay đổi storage để ghi nhận bài đã hoàn thành
      window.addEventListener('storage', (e) => {
        if (['hsk12done', 'hsk2done', 'hsk3done', 'hsk12score', 'hsk2score', 'hsk3score', 'hskXP', 'hsk2XP', 'hsk3XP'].includes(e.key)) {
          syncCurrentUserProgress();
        }
      });
      // Heartbeat định kỳ mỗi 3 phút
      setInterval(recordHeartbeat, 3 * 60 * 1000);
    }
  } catch {}

  window.HSKAuth = {
    login,
    register,
    logout,
    getCurrentUser,
    getAllUsers,
    getAllUsersWithProgress,
    getUserProgress,
    syncCurrentUserProgress,
    recordHeartbeat,
    updateUser,
    deleteUser,
    addUserByAdmin,
    openAuthModal,
    isAdmin: () => getCurrentUser()?.role === 'admin',
    isAuthenticated: () => !!getCurrentUser()
  };
})();
