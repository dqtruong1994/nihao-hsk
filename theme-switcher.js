/**
 * HSK Seasonal Theme Switcher & Event Template Manager
 * Hỗ trợ 5 chủ đề: Mặc định, Halloween, Tết Nguyên Đán, Trung Thu, Tình Yêu
 */
(() => {
  'use strict';

  const THEMES = [
    {
      id: 'default',
      name: 'Mặc định (Hiện đại)',
      icon: '🌸',
      tagline: 'MỖI NGÀY MỘT CHÚT TIẾN BỘ',
      seal: '学习',
      desc: 'Sắc tím thanh lịch, tối giản và tập trung học tập',
      badge: '',
      banner: null,
      coursePill: '',
      stickers: [],
      colors: ['#6657d9', '#eeebfa', '#ffffff'],
      particles: []
    },
    {
      id: 'halloween',
      name: 'Lễ hội Halloween',
      icon: '🎃',
      tagline: '🎃 ĐÊM HALLOWEEN KỲ BÍ · HỌC CHỮ HÁN KHÔNG SỢ',
      seal: '鬼节',
      desc: 'Sắc cam bí ngô rực rỡ, chữ Hán nổi bật sắc nét trên nền sáng',
      badge: '🎃 HALLOWEEN',
      banner: {
        title: 'Sự kiện: Đêm Hội Halloween Kỳ Bí',
        sub: 'Luyện chữ Hán thả ga, săn XP ma thuật & thăng hạng thần tốc!',
        icons: ['🎃', '👻', '🦇', '🍬']
      },
      coursePill: '🎃 Thử thách Halloween',
      stickers: [
        { icon: '🎃', style: 'left: 2%; top: -12px; font-size: 38px; transform: rotate(-10deg); animation: floatSlow 3s ease-in-out infinite;' },
        { icon: '👻', style: 'right: 1%; top: 40px; font-size: 36px; animation: floatGhost 3.5s ease-in-out infinite;' },
        { icon: '🦇', style: 'left: 45%; top: -20px; font-size: 30px; animation: floatBat 4s ease-in-out infinite;' },
        { icon: '🍬', style: 'right: 18%; bottom: 6px; font-size: 26px; transform: rotate(18deg);' },
        { icon: '🕸️', style: 'left: 18%; top: 10px; font-size: 30px; opacity: 0.7;' }
      ],
      colors: ['#ea580c', '#fff7ed', '#ffffff'],
      particles: ['🎃', '🦇', '👻', '🍬', '🕸️']
    },
    {
      id: 'tet',
      name: 'Tết Nguyên Đán (Xuân Tiết)',
      icon: '🧧',
      tagline: '🏮 VẠN SỰ NHƯ Ý · CUNG CHÚC TÂN XUÂN · CHĂM HỌC TIẾNG TRUNG',
      seal: '吉祥',
      desc: 'Đèn lồng đỏ, cánh hoa mai đào may mắn đón Tết',
      badge: '🧧 XUÂN TIẾT',
      banner: {
        title: 'Sự kiện: Chào Xuân Giáp Thìn · Cát Tường Như Ý',
        sub: 'Khai bút đầu xuân, tích lũy điểm thưởng và hái lộc đầu năm cùng HSK!',
        icons: ['🏮', '🧧', '🌸', '✨']
      },
      coursePill: '🧧 Lì xì kiến thức',
      stickers: [
        { icon: '🏮', style: 'left: 5%; top: -14px; font-size: 40px; animation: swingLantern 3s ease-in-out infinite;' },
        { icon: '🏮', style: 'right: 5%; top: -14px; font-size: 40px; animation: swingLantern 3s ease-in-out infinite 0.5s;' },
        { icon: '🌸', style: 'left: 42%; top: -12px; font-size: 32px; animation: floatSlow 3s ease-in-out infinite;' },
        { icon: '🧧', style: 'right: 18%; bottom: 6px; font-size: 28px; transform: rotate(-15deg);' },
        { icon: '💰', style: 'left: 20%; bottom: 8px; font-size: 26px;' }
      ],
      colors: ['#dc2626', '#f59e0b', '#fee2e2'],
      particles: ['🧧', '🌸', '🏮', '✨', '🌼']
    },
    {
      id: 'midautumn',
      name: 'Tết Trung Thu (Thưởng Nguyệt)',
      icon: '🥮',
      tagline: '🌕 TRĂNG TRÒN VIÊN MÃN · TRUNG THU ĐOÀN VIÊN · GẮN KẾT HÁN NGỮ',
      seal: '团圆',
      desc: 'Ánh trăng vàng, thỏ ngọc, bánh nướng và hoa đăng',
      badge: '🥮 TRUNG THU',
      banner: {
        title: 'Sự kiện: Tết Trung Thu · Đoàn Viên Thưởng Nguyệt',
        sub: 'Ngắm trăng rằm, học chữ Hán cùng Thỏ Ngọc và rước đèn ôn từ vựng!',
        icons: ['🌕', '🥮', '🐇', '🏮']
      },
      coursePill: '🥮 Bánh Trung Thu HSK',
      stickers: [
        { icon: '🌕', style: 'right: 6%; top: -18px; font-size: 46px; filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.6)); animation: floatSlow 4s ease-in-out infinite;' },
        { icon: '🐇', style: 'left: 6%; top: 35px; font-size: 38px; animation: floatSlow 3s ease-in-out infinite 0.5s;' },
        { icon: '🥮', style: 'left: 44%; top: -10px; font-size: 32px; transform: rotate(10deg);' },
        { icon: '🏮', style: 'right: 20%; bottom: 6px; font-size: 30px;' },
        { icon: '✨', style: 'left: 24%; top: 8px; font-size: 24px;' }
      ],
      colors: ['#0284c7', '#facc15', '#e0f2fe'],
      particles: ['🥮', '🌕', '🐇', '🏮', '✨']
    },
    {
      id: 'love',
      name: 'Mùa Tình Yêu (Valentine / Qixi)',
      icon: '💖',
      tagline: '💌 YÊU THƯƠNG ĐONG ĐẦY · TÌNH YÊU HÁN NGỮ · CHẬM MÀ CHẮC',
      seal: '缘分',
      desc: 'Sắc hồng ngọt ngào, trái tim lãng mạn và hoa hồng',
      badge: '💖 TÌNH YÊU',
      banner: {
        title: 'Sự kiện: Mùa Yêu Thương · Tình Yêu & Hán Ngữ',
        sub: 'Học tiếng Trung ngọt ngào, thắp sáng duyên lành và tự tin trò chuyện!',
        icons: ['💖', '🌹', '💌', '💕']
      },
      coursePill: '💌 Hán ngữ yêu thương',
      stickers: [
        { icon: '💖', style: 'right: 5%; top: -10px; font-size: 40px; animation: heartBeat 2s ease-in-out infinite;' },
        { icon: '🌹', style: 'left: 5%; top: 32px; font-size: 36px; animation: floatSlow 3s ease-in-out infinite;' },
        { icon: '💌', style: 'left: 45%; top: -12px; font-size: 32px; transform: rotate(-10deg);' },
        { icon: '🕊️', style: 'right: 20%; bottom: 6px; font-size: 28px;' },
        { icon: '✨', style: 'left: 22%; bottom: 10px; font-size: 24px;' }
      ],
      colors: ['#e11d48', '#fda4af', '#fff1f2'],
      particles: ['💖', '🌹', '💌', '✨', '💕']
    }
  ];

  function getCurrentThemeId() {
    try {
      return localStorage.getItem('hsk_current_theme') || 
             localStorage.getItem('hsk_system_default_theme') || 
             'default';
    } catch {
      return 'default';
    }
  }

  function isParticlesEnabled() {
    try {
      return localStorage.getItem('hsk_theme_particles') !== 'false';
    } catch {
      return true;
    }
  }

  function applyTheme(themeId, save = true) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    document.documentElement.setAttribute('data-theme', theme.id);

    if (save) {
      try {
        localStorage.setItem('hsk_current_theme', theme.id);
      } catch {}
    }

    // 1. Cập nhật nút Đổi theme trên Header (icon gọn gàng)
    const btn = document.getElementById('themePickerBtn');
    if (btn) {
      btn.innerHTML = `<span>${theme.icon}</span>`;
      btn.title = `Giao diện: ${theme.name.split(' (')[0]} (Bấm để đổi)`;
    }

    // 2. Cập nhật câu slogan / tagline
    const eyebrow = document.querySelector('.eyebrow');
    if (eyebrow) {
      eyebrow.innerHTML = `<span></span> ${theme.tagline}`;
    }

    // 3. Cập nhật con dấu Hán tự
    const seal = document.querySelector('.art-seal');
    if (seal) {
      seal.textContent = theme.seal;
    }

    // 4. Cập nhật huy hiệu lễ hội trên Logo Header
    updateLogoBadge(theme);

    // 5. Cập nhật banner sự kiện ở Hero section
    updateHeroBanner(theme);

    // 6. Cập nhật hình ảnh/sticker minh họa lễ hội trong Intro Art
    updateArtStickers(theme);

    // 7. Cập nhật huy hiệu lễ hội trên thẻ khóa học
    updateCoursePills(theme);

    // 8. Cập nhật hiệu ứng hạt rơi
    setupParticles(theme);

    // 9. Đồng bộ sang các iframe con
    document.querySelectorAll('iframe').forEach(frame => {
      try {
        frame.contentWindow?.postMessage({ type: 'hsk-theme-change', theme: theme.id }, '*');
      } catch {}
    });
  }

  function updateLogoBadge(theme) {
    let badge = document.getElementById('logoFestiveBadge');
    if (!badge) {
      const logo = document.querySelector('.logo');
      if (logo) {
        badge = document.createElement('span');
        badge.id = 'logoFestiveBadge';
        badge.className = 'logo-festive-badge';
        logo.appendChild(badge);
      }
    }
    if (badge) {
      if (theme.badge) {
        badge.textContent = theme.badge;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function updateHeroBanner(theme) {
    let banner = document.getElementById('seasonalHeroBanner');
    if (!banner) {
      const introCopy = document.querySelector('.intro-copy');
      const greeting = document.getElementById('greeting');
      if (introCopy && greeting) {
        banner = document.createElement('div');
        banner.id = 'seasonalHeroBanner';
        banner.className = 'seasonal-hero-banner';
        introCopy.insertBefore(banner, greeting);
      }
    }
    if (banner) {
      if (theme.banner) {
        banner.innerHTML = `
          <div class="seasonal-banner-inner">
            <span class="seasonal-banner-main-icon">${theme.banner.icons[0]}</span>
            <div class="seasonal-banner-info">
              <strong>${theme.banner.title}</strong>
              <small>${theme.banner.sub}</small>
            </div>
            <div class="seasonal-banner-mini-icons">${theme.banner.icons.slice(1).join(' ')}</div>
          </div>
        `;
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
  }

  function updateArtStickers(theme) {
    let host = document.getElementById('themeArtStickers');
    if (!host) {
      const introArt = document.querySelector('.intro-art');
      if (introArt) {
        host = document.createElement('div');
        host.id = 'themeArtStickers';
        host.className = 'theme-art-stickers';
        introArt.appendChild(host);
      }
    }
    if (host) {
      if (theme.stickers && theme.stickers.length) {
        host.innerHTML = theme.stickers.map(s => `
          <span class="theme-sticker" style="${s.style}">${s.icon}</span>
        `).join('');
        host.style.display = 'block';
      } else {
        host.innerHTML = '';
        host.style.display = 'none';
      }
    }
  }

  function updateCoursePills(theme) {
    document.querySelectorAll('.course-card').forEach(card => {
      let pill = card.querySelector('.course-seasonal-pill');
      if (!pill) {
        const top = card.querySelector('.course-top');
        if (top) {
          pill = document.createElement('span');
          pill.className = 'course-seasonal-pill';
          top.appendChild(pill);
        }
      }
      if (pill) {
        if (theme.coursePill) {
          pill.textContent = theme.coursePill;
          pill.style.display = 'inline-block';
        } else {
          pill.style.display = 'none';
        }
      }
    });
  }

  function setupParticles(theme) {
    let container = document.getElementById('themeParticles');
    if (container) container.remove();

    // 1. Tuyệt đối không kích hoạt hạt rơi trong iframe bài học
    if (window.self !== window.top) return;

    // 2. Tuyệt đối không kích hoạt hạt rơi trong trang Quản trị Admin
    const path = (window.location.pathname || '').toLowerCase();
    if (path.includes('admin')) return;

    // 3. Không kích hoạt hạt rơi khi đang ở màn hình học bài (#hsk1, #hsk2, #hsk3)
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.startsWith('#hsk')) return;

    // 4. Nếu người dùng tắt hiệu ứng hoặc theme không có hạt rơi
    if (!isParticlesEnabled() || !theme.particles || !theme.particles.length) {
      return;
    }

    container = document.createElement('div');
    container.id = 'themeParticles';
    container.className = 'theme-particles-container';
    document.body.appendChild(container);

    const icons = theme.particles;
    const count = 14;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'theme-particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      p.style.left = (Math.random() * 94 + 3) + 'vw';
      p.style.fontSize = (Math.random() * 10 + 16) + 'px';
      p.style.animationDuration = (Math.random() * 6 + 8) + 's';
      p.style.animationDelay = (Math.random() * 7) + 's';
      container.appendChild(p);
    }
  }

  function openThemeModal() {
    let modal = document.getElementById('themePickerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'themePickerModal';
      modal.className = 'theme-modal-overlay';
      modal.innerHTML = `
        <div class="theme-modal-card" role="dialog" aria-modal="true" aria-labelledby="themeModalTitle">
          <div class="theme-modal-header">
            <h3 class="theme-modal-title" id="themeModalTitle">
              <span>🎨</span> Chọn Giao Diện Theo Mùa & Sự Kiện
            </h3>
            <button type="button" class="srs-close" id="themeCloseBtn" aria-label="Đóng">✕</button>
          </div>
          <p style="font-size:13px; color:#64748b; margin:0 0 16px;">
            Đổi không khí học tiếng Trung theo các mùa lễ hội văn hóa đặc sắc trong năm. Giao diện thay đổi tức thì và tự động lưu trên thiết bị của bạn.
          </p>

          <div class="theme-grid" id="themeGrid"></div>

          <div class="theme-switch-row">
            <div>
              <strong style="display:block; font-size:13.5px; color:#1e1b4b;">Hiệu ứng hạt rơi theo mùa</strong>
              <small style="color:#64748b; font-size:12px;">Hoa đào, bí ngô, đèn lồng, trái tim nhẹ nhàng bay trong nền</small>
            </div>
            <label style="position:relative; display:inline-block; width:44px; height:24px; cursor:pointer;">
              <input type="checkbox" id="themeParticlesToggle" style="opacity:0; width:0; height:0;">
              <span id="themeToggleSlider" style="position:absolute; inset:0; background:#cbd5e1; border-radius:24px; transition:.2s;"></span>
            </label>
          </div>

          <button type="button" class="btn" id="themeDoneBtn" style="margin-top:20px; width:100%; background:#6657d9; color:#fff; border:0; padding:12px; border-radius:12px; font-weight:700; cursor:pointer;">
            Áp dụng & Đóng
          </button>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => {
        modal.hidden = true;
        modal.classList.add('hidden');
        modal.style.setProperty('display', 'none', 'important');
      };

      document.getElementById('themeCloseBtn').onclick = closeModal;
      document.getElementById('themeDoneBtn').onclick = closeModal;
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden && modal.style.display !== 'none') {
          closeModal();
        }
      });

      const pToggle = document.getElementById('themeParticlesToggle');
      const pSlider = document.getElementById('themeToggleSlider');
      pToggle.checked = isParticlesEnabled();
      pSlider.style.background = pToggle.checked ? '#6657d9' : '#cbd5e1';

      pToggle.onchange = () => {
        try { localStorage.setItem('hsk_theme_particles', String(pToggle.checked)); } catch {}
        pSlider.style.background = pToggle.checked ? '#6657d9' : '#cbd5e1';
        setupParticles(THEMES.find(t => t.id === getCurrentThemeId()) || THEMES[0]);
      };
    }

    renderThemeGrid();
    modal.hidden = false;
    modal.classList.remove('hidden');
    modal.style.removeProperty('display');
    modal.style.setProperty('display', 'flex', 'important');
  }

  function renderThemeGrid() {
    const grid = document.getElementById('themeGrid');
    if (!grid) return;
    const current = getCurrentThemeId();

    grid.innerHTML = THEMES.map(theme => {
      const active = theme.id === current;
      return `
        <div class="theme-card-option ${active ? 'active' : ''}" data-id="${theme.id}">
          <span class="theme-active-badge">✓ Đang dùng</span>
          <div class="theme-option-top">
            <span class="theme-option-icon">${theme.icon}</span>
            <div>
              <strong class="theme-option-name">${theme.name}</strong>
            </div>
          </div>
          <div class="theme-option-desc">${theme.desc}</div>
          <div class="theme-color-palette">
            ${theme.colors.map(c => `<span class="theme-color-dot" style="background:${c};"></span>`).join('')}
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.theme-card-option').forEach(card => {
      card.onclick = () => {
        const themeId = card.dataset.id;
        applyTheme(themeId, true);
        renderThemeGrid();
      };
    });
  }

  // Lắng nghe sự kiện chuyển trang/bài học để dọn hoặc kích hoạt hạt rơi
  window.addEventListener('hashchange', () => {
    const currentTheme = THEMES.find(t => t.id === getCurrentThemeId()) || THEMES[0];
    setupParticles(currentTheme);
  });

  // Lắng nghe sự kiện đổi theme từ trang cha nếu là iframe
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'hsk-theme-change' && e.data.theme) {
      applyTheme(e.data.theme, false);
    }
  });

  // Khởi tạo theme ban đầu
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTheme(getCurrentThemeId(), false);
    });
  } else {
    applyTheme(getCurrentThemeId(), false);
  }

  window.HSKTheme = {
    getTheme: getCurrentThemeId,
    setTheme: applyTheme,
    openModal: openThemeModal,
    getThemesList: () => THEMES
  };
})();
