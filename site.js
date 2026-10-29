(() => {
  'use strict';

  const home = document.getElementById('home');
  const courseView = document.getElementById('courseView');
  const dictView = document.getElementById('dictView');
  const notebookView = document.getElementById('notebookView');

  const courseIds = ['hsk1', 'hsk2', 'hsk3'];
  const baseRoutes = ['home', 'dict', 'notebook', ...courseIds];

  const courseKeys = {
    hsk1: { done: 'hsk12done', xp: 'hskXP', review: 'reviewWords', lesson: 'hsk1Lesson' },
    hsk2: { done: 'hsk2done', xp: 'hsk2XP', review: 'hsk2ReviewWords', lesson: 'hsk2Lesson' },
    hsk3: { done: 'hsk3done', xp: 'hsk3XP', review: 'hsk3ReviewWords', lesson: 'hsk3Lesson' },
  };

  const cache = new Map();

  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const getText = key => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  };

  const courseData = course => {
    const keys = courseKeys[course];
    const saved = read(keys.done, []);
    const completed = Array.isArray(saved) ? new Set(saved.filter(x => Number.isInteger(x) && x >= 0 && x < 12)).size : 0;
    const savedXP = Number(read(keys.xp, 0));
    const xp = Number.isFinite(savedXP) ? Math.max(0, savedXP) : 0;
    const savedLesson = Number(read(keys.lesson, 0));
    const activeLesson = Number.isInteger(savedLesson) && savedLesson >= 0 && savedLesson < 12 ? savedLesson : 0;
    const reviews = read(keys.review, {});
    const due = reviews && typeof reviews === 'object' ? Object.values(reviews).filter(x => Number.isFinite(x) && x <= Date.now()).length : 0;
    return { completed, xp, due, activeLesson, ...cache.get(course) };
  };

  function renderAnnouncement() {
    const banner = document.getElementById('siteAnnouncementBanner');
    if (!banner) return;
    const text = getText('hsk_site_announcement');
    if (text && text.trim()) {
      banner.textContent = text.trim();
      banner.hidden = false;
    } else {
      banner.hidden = true;
    }
  }

  function renderAuthHeader() {
    const slot = document.getElementById('authHeaderSlot');
    if (!slot) return;
    const user = window.HSKAuth?.getCurrentUser();
    if (user) {
      const isAdmin = user.role === 'admin';
      slot.innerHTML = `
        <span style="font-size:13px; font-weight:600; color:#475467; display:inline-flex; align-items:center; gap:6px;">
          <span style="display:inline-block; width:26px; height:26px; line-height:26px; text-align:center; border-radius:50%; background:#e0e7ff; color:#4338ca; font-size:12px; font-weight:800;">${(user.name || user.username || 'U')[0].toUpperCase()}</span>
          <span>${user.name || user.username}</span>
          <span style="font-size:11px; padding:2px 7px; border-radius:6px; background:${isAdmin ? '#fee2e2; color:#991b1b;' : '#e0e7ff; color:#3730a3;'} font-weight:700;">${isAdmin ? 'Admin' : 'Học viên'}</span>
        </span>
        ${isAdmin ? '<a href="admin.html" style="background:#4f46e5; color:#fff; text-decoration:none; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.08);">🛠 Quản trị</a>' : ''}
        <button type="button" id="headerLogoutBtn" style="background:transparent; border:1px solid #d0d5dd; color:#475467; padding:5px 10px; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer;" onclick="window.HSKAuth?.logout(); location.reload();">Thoát</button>
      `;
    } else {
      slot.innerHTML = `
        <button type="button" id="headerLoginBtn" style="background:#6657d9; color:#fff; border:0; padding:7px 15px; border-radius:9px; font-weight:700; font-size:13px; cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.12);" onclick="window.HSKAuth?.openAuthModal()">Đăng nhập</button>
      `;
    }
  }

  function renderMenus() {
    const nav = document.getElementById('dynamicNav');
    if (!nav) return;
    const menus = window.HSKData ? window.HSKData.getMenus().filter(m => m.visible !== false) : [
      { label: 'Trang chủ', route: 'home', url: '#home' },
      { label: 'HSK 1', route: 'hsk1', url: '#hsk1' },
      { label: 'HSK 2', route: 'hsk2', url: '#hsk2' },
      { label: 'HSK 3', route: 'hsk3', url: '#hsk3' },
      { label: '📖 Tra từ điển', route: 'dict', url: '#dict' },
      { label: '⭐ Sổ tay', route: 'notebook', url: '#notebook' }
    ];
    const currentRoute = location.hash.slice(1) || 'home';
    nav.innerHTML = menus.map(m => {
      const active = (m.route === currentRoute || (m.route === 'home' && (!currentRoute || currentRoute === 'home'))) ? 'active' : '';
      const ariaCurrent = active ? 'aria-current="page"' : '';
      return `<a href="${m.url}" data-route="${m.route}" class="${active}" ${ariaCurrent}>${m.label}</a>`;
    }).join('');
  }

  function refreshHome() {
    const user = window.HSKAuth?.getCurrentUser();
    const name = user ? (user.name || user.username) : getText('hskStudentName');
    const profileLabel = document.getElementById('profileLabel');
    const greeting = document.getElementById('greeting');
    if (profileLabel) profileLabel.textContent = name ? 'Chào ' + name : 'Góc học tập của bạn';
    if (greeting) greeting.textContent = name ? '你好, ' + name + '! Mình học tiếp nhé.' : '你好！Chào bạn đến với góc học tiếng Trung.';

    const courses = courseIds.map(courseData);
    courses.forEach((data, index) => {
      const prefix = courseIds[index];
      const percent = Math.round(data.completed / 12 * 100);
      const progText = document.getElementById(prefix + 'ProgressText');
      const percText = document.getElementById(prefix + 'Percent');
      const progress = document.getElementById(prefix + 'Progress');
      const action = document.getElementById(prefix + 'Action');

      if (progText) progText.textContent = data.completed + '/12 bài hoàn thành';
      if (percText) percText.textContent = percent + '%';
      if (progress) {
        progress.setAttribute('aria-valuenow', String(percent));
        if (progress.firstElementChild) progress.firstElementChild.style.width = percent + '%';
      }
      if (action) {
        action.textContent = (data.completed > 0 || data.activeLesson > 0 || data.xp > 0 ? 'Tiếp tục ' : 'Bắt đầu ') + 'HSK ' + (index + 1);
      }
    });

    const totalCompleted = document.getElementById('totalCompleted');
    if (totalCompleted) {
      totalCompleted.replaceChildren(document.createTextNode(String(courses.reduce((sum, course) => sum + course.completed, 0))));
      const denominator = document.createElement('span');
      denominator.textContent = '/36';
      totalCompleted.append(denominator);
    }

    const totalXP = document.getElementById('totalXP');
    if (totalXP) totalXP.textContent = String(courses.reduce((sum, course) => sum + course.xp, 0));

    const dueCount = courses.reduce((sum, course) => sum + course.due, 0);
    const totalReview = document.getElementById('totalReview');
    if (totalReview) totalReview.textContent = String(dueCount);

    const reviewSub = document.getElementById('homeReviewSubtitle');
    if (reviewSub) {
      reviewSub.textContent = dueCount > 0 
        ? 'Có ' + dueCount + ' thẻ từ vựng đang đến hạn ôn theo chu kỳ hôm nay.' 
        : 'Chưa có từ nào đến hạn. Bấm để luyện tập củng cố thêm từ vựng.';
    }

    const lastCourse = getText('hskLastCourse');
    const continueLink = document.getElementById('continueLink');
    const continueText = document.getElementById('continueText');
    if (continueLink && continueText && courseIds.includes(lastCourse)) {
      continueLink.href = '#' + lastCourse;
      continueText.textContent = 'Tiếp tục HSK ' + lastCourse.slice(-1);
    }
  }

  function showRoute() {
    const requested = location.hash.slice(1);
    const validRoutes = window.HSKData ? window.HSKData.getMenus().map(m => m.route) : baseRoutes;
    const allRoutes = Array.from(new Set([...baseRoutes, ...validRoutes]));
    const route = allRoutes.includes(requested) ? requested : 'home';

    // Update active navbar styling
    document.querySelectorAll('#dynamicNav [data-route]').forEach(link => {
      const active = link.dataset.route === route;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    // Hide all main containers
    if (home) home.hidden = true;
    if (courseView) courseView.hidden = true;
    if (dictView) dictView.hidden = true;
    if (notebookView) notebookView.hidden = true;

    if (route === 'home') {
      if (home) home.hidden = false;
      document.title = '你好 HSK · Học tiếng Trung mỗi ngày';
      refreshHome();
    } else if (route === 'dict') {
      if (dictView) {
        dictView.hidden = false;
        window.HSKDictionary?.renderDictionaryView('dictView');
      }
      document.title = '📖 Tra cứu từ điển Hán ngữ · 你好 HSK';
    } else if (route === 'notebook') {
      if (notebookView) {
        notebookView.hidden = false;
        window.HSKDictionary?.renderNotebookView('notebookView');
      }
      document.title = '⭐ Sổ tay từ vựng & Ghi chú · 你好 HSK';
    } else if (courseIds.includes(route)) {
      if (courseView) courseView.hidden = false;
      courseIds.forEach(course => {
        const frame = document.getElementById('frame-' + course);
        if (!frame) return;
        frame.hidden = course !== route;
        if (course === route) {
          const currentSrc = frame.getAttribute('src');
          if (!currentSrc || currentSrc === 'about:blank') {
            frame.src = course + '.html';
          } else {
            try {
              const examLevel = localStorage.getItem('hskOpenExam');
              if (examLevel === course) {
                localStorage.removeItem('hskOpenExam');
                setTimeout(() => {
                  frame.contentWindow?.document?.querySelector('.mock-exam-btn[data-level="' + course + '"]')?.click();
                }, 100);
              }
            } catch {}
          }
        }
        if (course !== route && frame.hasAttribute('src')) {
          try {
            if (frame.contentWindow.HSKAudio) frame.contentWindow.HSKAudio.stop();
            else frame.contentWindow.speechSynthesis?.cancel();
          } catch {}
        }
      });
      try { localStorage.setItem('hskLastCourse', route); } catch {}
      document.title = 'HSK ' + route.slice(-1) + ' · 你好 HSK';
    } else {
      // Default fallback
      if (home) home.hidden = false;
      document.title = '你好 HSK · Học tiếng Trung mỗi ngày';
    }

    renderAnnouncement();
    renderAuthHeader();
  }

  // Event Listeners
  addEventListener('hashchange', showRoute);
  addEventListener('hsk-menu-updated', renderMenus);
  addEventListener('storage', () => {
    cache.clear();
    refreshHome();
    renderAnnouncement();
    renderAuthHeader();
    renderMenus();
  });

  addEventListener('message', event => {
    if (event.origin !== location.origin || event.data?.type !== 'hsk-progress') return;
    const course = event.data.course;
    if (!courseIds.includes(course)) return;
    const frame = document.getElementById('frame-' + course);
    if (!frame || event.source !== frame.contentWindow) return;
    const { completed, xp, due } = event.data;
    if (![completed, xp, due].every(Number.isFinite)) return;
    cache.set(course, { completed: Math.min(12, Math.max(0, Math.trunc(completed))), xp: Math.max(0, xp), due: Math.max(0, Math.trunc(due)) });
    refreshHome();
  });

  window.HSKSync?.subscribe(() => {
    cache.clear();
    refreshHome();
  });

  // Initial setup
  renderMenus();
  renderAnnouncement();
  renderAuthHeader();
  showRoute();

  // Quản lý Service Worker: Trên localhost/127.0.0.1 tự động gỡ bỏ để tránh cache lỗi iframe
  if ('serviceWorker' in navigator) {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      navigator.serviceWorker.getRegistrations().then(regs => {
        for (const reg of regs) reg.unregister();
      });
      if ('caches' in window) {
        caches.keys().then(names => {
          for (const name of names) caches.delete(name);
        });
      }
    } else if (location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(() => {});
      });
    }
  }
})();