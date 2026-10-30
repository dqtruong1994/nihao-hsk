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
      colors: ['#6657d9', '#eeebfa', '#ffffff'],
      particles: []
    },
    {
      id: 'halloween',
      name: 'Lễ hội Halloween',
      icon: '🎃',
      tagline: '🎃 ĐÊM HALLOWEEN KỲ BÍ · HỌC CHỮ HÁN KHÔNG SỢ',
      seal: '鬼节',
      desc: 'Bí ngô ma thuật, bóng ma vui nhộn và dơi đêm kỳ thú',
      colors: ['#ea580c', '#451a03', '#1c1917'],
      particles: ['🎃', '🦇', '👻', '🍬', '🕸️']
    },
    {
      id: 'tet',
      name: 'Tết Nguyên Đán (Xuân Tiết)',
      icon: '🧧',
      tagline: '🏮 VẠN SỰ NHƯ Ý · CUNG CHÚC TÂN XUÂN · CHĂM HỌC TIẾNG TRUNG',
      seal: '吉祥',
      desc: 'Đèn lồng đỏ, cánh hoa mai đào may mắn đón Tết',
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
      colors: ['#e11d48', '#fda4af', '#fff1f2'],
      particles: ['💖', '🌹', '💌', '✨', '💕']
    }
  ];

  let particleInterval = null;

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

    // Update Header button text
    const btn = document.getElementById('themePickerBtn');
    if (btn) {
      btn.innerHTML = `<span>${theme.icon}</span> <span>${theme.id === 'default' ? 'Đổi giao diện' : theme.name.split(' (')[0]}</span>`;
    }

    // Update slogan / eyebrow if present on homepage
    const eyebrow = document.querySelector('.eyebrow');
    if (eyebrow) {
      eyebrow.innerHTML = `<span></span> ${theme.tagline}`;
    }

    // Update Intro seal character if present
    const seal = document.querySelector('.art-seal');
    if (seal) {
      seal.textContent = theme.seal;
    }

    // Update particles
    setupParticles(theme);

    // Broadcast to iframes
    document.querySelectorAll('iframe').forEach(frame => {
      try {
        frame.contentWindow?.postMessage({ type: 'hsk-theme-change', theme: theme.id }, '*');
      } catch {}
    });
  }

  function setupParticles(theme) {
    let container = document.getElementById('themeParticles');
    if (container) container.remove();

    // Không kích hoạt hiệu ứng hạt rơi trong iframe để giữ giao diện học tập tập trung
    if (window.self !== window.top) return;

    if (!isParticlesEnabled() || !theme.particles || !theme.particles.length) {
      return;
    }

    container = document.createElement('div');
    container.id = 'themeParticles';
    container.className = 'theme-particles-container';
    document.body.appendChild(container);

    const icons = theme.particles;
    const count = 16;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'theme-particle';
      p.textContent = icons[Math.floor(Math.random() * icons.length)];
      p.style.left = (Math.random() * 96 + 2) + 'vw';
      p.style.fontSize = (Math.random() * 12 + 16) + 'px';
      p.style.animationDuration = (Math.random() * 6 + 7) + 's';
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

  // Lắng nghe sự kiện đổi theme từ trang cha nếu là iframe
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'hsk-theme-change' && e.data.theme) {
      applyTheme(e.data.theme, false);
    }
  });

  // Khởi tạo theme ban đầu
  applyTheme(getCurrentThemeId(), false);

  window.HSKTheme = {
    getTheme: getCurrentThemeId,
    setTheme: applyTheme,
    openModal: openThemeModal,
    getThemesList: () => THEMES
  };
})();
