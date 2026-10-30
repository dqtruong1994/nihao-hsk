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

  // Quản lý đóng mở Dropdown User Menu
  window.HSKHeaderMenu = {
    toggleUserMenu: (e) => {
      e?.stopPropagation();
      const wrap = document.getElementById('userMenuWrap');
      const menu = document.getElementById('userMenuDropdown');
      if (!wrap || !menu) return;
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        menu.classList.add('hidden');
        wrap.classList.remove('active');
      } else {
        menu.classList.remove('hidden');
        wrap.classList.add('active');
      }
    },
    closeUserMenu: () => {
      const wrap = document.getElementById('userMenuWrap');
      const menu = document.getElementById('userMenuDropdown');
      if (menu) menu.classList.add('hidden');
      if (wrap) wrap.classList.remove('active');
    }
  };

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#userMenuWrap')) {
      window.HSKHeaderMenu.closeUserMenu();
    }
  });

  function renderAuthHeader() {
    const slot = document.getElementById('authHeaderSlot');
    if (!slot) return;
    const user = window.HSKAuth?.getCurrentUser();
    const rankInfo = window.Gamification?.getRankProgress?.() || { current: { icon: '🛡️', name: 'Sắt', bgClass: 'rank-iron', color: '#71717a' } };
    const xp = window.Gamification?.getTotalXP?.() || 0;
    const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator?.standalone;
    const currentThemeId = window.HSKTheme?.getTheme?.() || 'default';
    const themeObj = window.HSKTheme?.getThemesList?.()?.find(t => t.id === currentThemeId);
    const themeIcon = themeObj ? themeObj.icon : '🎨';
    const themeLabel = themeObj && themeObj.id !== 'default' ? themeObj.name.split(' (')[0] : 'Đổi giao diện';

    const searchHtml = `
      <button type="button" id="spotlightHeaderBtn" class="header-search-pill" onclick="window.HSKSpotlight?.open()" title="Tìm kiếm nhanh (Ctrl + K)">
        <span style="font-size:13px;">🔍</span>
        <span class="spotlight-btn-text">Tìm kiếm</span>
        <kbd class="search-kbd">Ctrl K</kbd>
      </button>
    `;

    const dailyGoalHtml = `<div id="dailyGoalSlot" style="display:inline-flex;"></div>`;

    const soundHtml = `
      <button type="button" class="header-circle-btn sound-toggle-btn" onclick="window.HSKAudioFX?.toggleMute()" title="Bật/Tắt âm thanh hiệu ứng">
        ${window.HSKAudioFX?.isMuted() ? '🔇' : '🔊'}
      </button>
    `;

    const themeHtml = `
      <button type="button" id="themePickerBtn" class="header-circle-btn theme-header-circle-btn" onclick="window.HSKTheme?.openModal()" title="Giao diện: ${themeLabel} (Bấm để đổi)">
        <span>${themeIcon}</span>
      </button>
    `;

    let userHtml = '';
    if (user) {
      const isAdmin = user.role === 'admin';
      userHtml = `
        <div class="user-menu-wrap" id="userMenuWrap">
          <button type="button" class="user-menu-trigger" id="userMenuTrigger" onclick="window.HSKHeaderMenu.toggleUserMenu(event)">
            <span class="user-avatar-circle">${(user.name || user.username || 'U')[0].toUpperCase()}</span>
            <span class="user-display-name">${user.name || user.username}</span>
            <span class="user-chevron">▾</span>
          </button>
          <div class="user-menu-dropdown hidden" id="userMenuDropdown">
            <div class="user-dropdown-header">
              <div class="user-dropdown-avatar">${(user.name || user.username || 'U')[0].toUpperCase()}</div>
              <div class="user-dropdown-info">
                <div class="user-dropdown-name">${user.name || user.username}</div>
                <div class="user-dropdown-role ${isAdmin ? 'admin' : ''}">${isAdmin ? 'Quản trị viên' : 'Học viên'}</div>
              </div>
            </div>
            <div class="user-dropdown-rank" onclick="window.Gamification?.openRankModal(); window.HSKHeaderMenu.closeUserMenu();" title="Bấm để xem Cấp bậc Rank và Nhiệm vụ">
              <span style="font-size:18px;">${rankInfo.current.icon}</span>
              <div style="flex:1;">
                <div style="font-size:10.5px; color:#64748b; font-weight:700;">CẤP BẬC RANK</div>
                <div style="font-size:13px; font-weight:800; color:#1e1b4b;">${rankInfo.current.name} · ${xp} XP</div>
              </div>
              <span style="font-size:12px; color:#94a3b8;">→</span>
            </div>
            <div class="user-dropdown-divider"></div>
            <a class="user-dropdown-item" href="javascript:void(0)" onclick="window.HSKCertificate?.open(); window.HSKHeaderMenu.closeUserMenu();">
              <span>🎓</span> <span>Chứng chỉ HSK</span>
            </a>
            ${!isStandalone ? `
              <a class="user-dropdown-item" href="javascript:void(0)" onclick="window.HSKPWA?.install(); window.HSKHeaderMenu.closeUserMenu();">
                <span>📲</span> <span>Cài đặt ứng dụng (PWA)</span>
              </a>
            ` : ''}
            ${isAdmin ? `
              <a class="user-dropdown-item admin" href="admin.html">
                <span>🛠️</span> <span>Trang Quản trị Hệ Thống</span>
              </a>
            ` : ''}
            <div class="user-dropdown-divider"></div>
            <button type="button" class="user-dropdown-item logout" onclick="window.HSKAuth?.logout(); location.reload();">
              <span>🚪</span> <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      `;
    } else {
      userHtml = `
        <button type="button" id="headerLoginBtn" class="btn-login-header" onclick="window.HSKAuth?.openAuthModal()">
          <span>👤</span> <span>Đăng nhập</span>
        </button>
      `;
    }

    slot.className = 'header-action-cluster';
    slot.innerHTML = `
      ${searchHtml}
      ${dailyGoalHtml}
      ${soundHtml}
      ${themeHtml}
      ${userHtml}
    `;

    // Khởi tạo/Cập nhật daily goal pill vào slot
    if (window.HSKDailyGoal) {
      setTimeout(() => {
        const slotEl = document.getElementById('dailyGoalSlot');
        const pill = document.getElementById('dailyGoalHeaderPill');
        if (slotEl && pill && pill.parentElement !== slotEl) {
          slotEl.appendChild(pill);
        }
      }, 50);
    }
  }

  function renderMenus() {
    const nav = document.getElementById('dynamicNav');
    if (!nav) return;
    const currentRoute = location.hash.slice(1) || 'home';

    const coreLinks = [
      { label: 'Trang chủ', route: 'home', url: '#home' },
      { label: 'HSK 1', route: 'hsk1', url: '#hsk1' },
      { label: 'HSK 2', route: 'hsk2', url: '#hsk2' },
      { label: 'HSK 3', route: 'hsk3', url: '#hsk3' },
      { label: 'Từ điển', route: 'dict', url: '#dict' },
      { label: 'Sổ tay', route: 'notebook', url: '#notebook' }
    ];

    let html = coreLinks.map(m => {
      const active = (m.route === currentRoute || (m.route === 'home' && (!currentRoute || currentRoute === 'home'))) ? 'active' : '';
      const ariaCurrent = active ? 'aria-current="page"' : '';
      return `<a href="${m.url}" data-route="${m.route}" class="${active}" ${ariaCurrent}>${m.label}</a>`;
    }).join('');

    // Dropdown Luyện tập gọn gàng
    html += `
      <div class="nav-dropdown" id="navPracticeDropdown">
        <button type="button" class="nav-dropdown-btn">
          <span>Luyện tập</span>
          <span style="font-size:10px; opacity:0.65;">▾</span>
        </button>
        <div class="nav-dropdown-menu">
          <a href="javascript:void(0)" onclick="window.HSKSpeechTrainer?.open()">🎙️ Luyện phát âm AI</a>
          <a href="javascript:void(0)" onclick="window.HSKTypingGame?.open()">⌨️ Game gõ Pinyin</a>
          <a href="javascript:void(0)" onclick="window.HSKSkillDrills?.open()">⚡ Đấu trường 4 kỹ năng</a>
          <a href="javascript:void(0)" onclick="window.SRSEngine?.open()">🗂️ Flashcards SRS</a>
          <a href="#exam" onclick="window.location.hash='exam'">📝 Thi thử HSK</a>
          <a href="javascript:void(0)" onclick="window.HSKCertificate?.open()">🎓 Nhận chứng chỉ</a>
          <a href="javascript:void(0)" onclick="window.HSKImmersionPlayer?.show()">🎧 Nghe thụ động</a>
        </div>
      </div>
    `;

    nav.innerHTML = html;
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
    const xpVal = window.Gamification?.getTotalXP ? window.Gamification.getTotalXP() : courses.reduce((sum, course) => sum + course.xp, 0);
    if (totalXP) totalXP.textContent = String(xpVal);

    const rankInfo = window.Gamification?.getRankProgress?.();
    if (rankInfo) {
      const homeRankIcon = document.getElementById('homeRankIcon');
      const homeRankName = document.getElementById('homeRankName');
      const homeRankSub = document.getElementById('homeRankSub');
      if (homeRankIcon) homeRankIcon.textContent = rankInfo.current.icon;
      if (homeRankName) homeRankName.textContent = 'Rank: ' + rankInfo.current.name;
      if (homeRankSub) {
        if (rankInfo.next) {
          homeRankSub.textContent = rankInfo.currentXP + ' XP · Cần thêm ' + (rankInfo.next.minXP - rankInfo.currentXP) + ' XP để lên ' + rankInfo.next.name + ' ↗';
        } else {
          homeRankSub.textContent = rankInfo.currentXP + ' XP · Bạn đã đạt cấp bậc vinh dự tối cao: ' + rankInfo.current.name + '! 🎉';
        }
      }
    }
    renderAuthHeader();

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

  // Tự động gỡ bỏ Service Worker và xóa cache cũ trên mọi domain để tránh lỗi iframe crash
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      for (const reg of regs) reg.unregister();
    });
  }
  if ('caches' in window) {
    caches.keys().then(names => {
      for (const name of names) caches.delete(name);
    });
  }
})();