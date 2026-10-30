/**
 * Spotlight Search & Command Palette (Ctrl + K / Cmd + K / Quick Action)
 * Tìm kiếm tức thì từ vựng HSK, bài học, ngữ pháp và công cụ luyện tập
 */
(() => {
  'use strict';

  const TOOLS = [
    {
      id: 'tool_hanzi_pad',
      title: 'Tập viết chữ Hán (Ô Mễ tự cách)',
      desc: 'Luyện thuận bút chữ Hán với hướng dẫn và canvas vẽ',
      category: 'Công cụ học',
      icon: '✍️',
      action: () => {
        if (window.HanziPad) window.HanziPad.open('你好', 'nǐ hǎo', 'xin chào');
      }
    },
    {
      id: 'tool_typing_game',
      title: 'Game Luyện Gõ Pinyin Siêu Tốc',
      desc: 'Thử thách phản xạ gõ bàn phím tiếng Trung theo thời gian',
      category: 'Công cụ học',
      icon: '⌨️',
      action: () => {
        if (window.HSKTypingGame) window.HSKTypingGame.open();
      }
    },
    {
      id: 'tool_speech_trainer',
      title: 'Phòng Luyện Phát Âm AI (Speech Trainer)',
      desc: 'Nhận diện thanh điệu và chấm điểm phát âm tiếng Trung',
      category: 'Công cụ học',
      icon: '🎙️',
      action: () => {
        if (window.HSKSpeechTrainer) window.HSKSpeechTrainer.open();
      }
    },
    {
      id: 'tool_skill_drills',
      title: 'Đấu Trường 4 Kỹ Năng (Skill Drills)',
      desc: 'Luyện Nghe - Đọc - Ngữ pháp - Dịch thuật tốc độ',
      category: 'Công cụ học',
      icon: '⚡',
      action: () => {
        if (window.HSKSkillDrills) window.HSKSkillDrills.open();
      }
    },
    {
      id: 'tool_srs',
      title: 'Sổ Tay Flashcards Lặp Lại Ngắt Quãng (SRS)',
      desc: 'Ôn tập ghi nhớ từ vựng dài hạn theo thuật toán SM-2',
      category: 'Công cụ học',
      icon: '🗂️',
      action: () => {
        if (window.SRSEngine) window.SRSEngine.open();
      }
    },
    {
      id: 'tool_immersion_player',
      title: 'Máy Nghe Thụ Động (Hands-free Immersion)',
      desc: 'Bật máy phát audio bài học chạy nền liên tục với phụ đề',
      category: 'Công cụ học',
      icon: '🎧',
      action: () => {
        if (window.HSKImmersionPlayer) window.HSKImmersionPlayer.show();
      }
    },
    {
      id: 'tool_daily_goal',
      title: 'Mục Tiêu Ngày & Chuỗi Luyện (Streak & Goal)',
      desc: 'Kiểm tra tiến độ XP hôm nay, vòng tròn hoạt động và chuỗi ngày',
      category: 'Tiến độ học',
      icon: '🔥',
      action: () => {
        if (window.HSKDailyGoal) window.HSKDailyGoal.openModal();
      }
    },
    {
      id: 'tool_certificate',
      title: 'Chứng Chỉ Hoàn Thành Khóa Học HSK',
      desc: 'Xuất chứng chỉ vàng đỏ truyền thống với tên bạn và tải ảnh HD',
      category: 'Thành tích',
      icon: '🎓',
      action: () => {
        if (window.HSKCertificate) window.HSKCertificate.open();
      }
    },
    {
      id: 'tool_theme_switcher',
      title: 'Cài Đặt Mùa Lễ Hội & Giao Diện',
      desc: 'Đổi chủ đề Tết, Halloween, Trung Thu, Tình Yêu hoặc Mặc định',
      category: 'Cài đặt',
      icon: '🎨',
      action: () => {
        if (window.HSKThemeSwitcher) window.HSKThemeSwitcher.openModal();
      }
    },
    {
      id: 'tool_mock_exam',
      title: 'Thi Thử HSK Trực Tuyến',
      desc: 'Đề thi thử bấm giờ HSK 1, HSK 2, HSK 3 chuẩn định dạng',
      category: 'Kiểm tra',
      icon: '📝',
      action: () => {
        window.location.href = '#exam';
      }
    }
  ];

  const LESSON_CATALOG = [
    { title: 'HSK 1 - Bài 1: 你好 (Xin chào)', level: 'HSK 1', url: 'hsk1.html#lesson-1', tags: 'chào hỏi ni hao' },
    { title: 'HSK 1 - Bài 2: 谢谢你 (Cảm ơn bạn)', level: 'HSK 1', url: 'hsk1.html#lesson-2', tags: 'cảm ơn xiexie' },
    { title: 'HSK 1 - Bài 3: 你叫什么名字 (Bạn tên là gì)', level: 'HSK 1', url: 'hsk1.html#lesson-3', tags: 'tên xưng hô' },
    { title: 'HSK 1 - Bài 4: 她是我的汉语老师 (Cô ấy là cô giáo tiếng Trung của tôi)', level: 'HSK 1', url: 'hsk1.html#lesson-4', tags: 'thầy cô giáo viên' },
    { title: 'HSK 1 - Bài 5: 她女儿今年二十岁 (Con gái cô ấy năm nay 20 tuổi)', level: 'HSK 1', url: 'hsk1.html#lesson-5', tags: 'tuổi số đếm gia đình' },
    { title: 'HSK 1 - Bài 6: 我会说汉语 (Tôi biết nói tiếng Trung)', level: 'HSK 1', url: 'hsk1.html#lesson-6', tags: 'ngôn ngữ kỹ năng' },
    { title: 'HSK 1 - Bài 7: 今天几号 (Hôm nay ngày mấy)', level: 'HSK 1', url: 'hsk1.html#lesson-7', tags: 'ngày tháng thời gian' },
    { title: 'HSK 1 - Bài 8: 我想喝茶 (Tôi muốn uống trà)', level: 'HSK 1', url: 'hsk1.html#lesson-8', tags: 'ăn uống mua sắm giá cả' },
    { title: 'HSK 1 - Bài 9: 你儿子在哪儿工作 (Con trai bạn làm việc ở đâu)', level: 'HSK 1', url: 'hsk1.html#lesson-9', tags: 'nơi chốn công việc địa điểm' },
    { title: 'HSK 1 - Bài 10: 我能坐这儿吗 (Tôi có thể ngồi đây không)', level: 'HSK 1', url: 'hsk1.html#lesson-10', tags: 'xin phép bàn ghế' },
    { title: 'HSK 1 - Bài 11: 现在几点 (Bây giờ mấy giờ)', level: 'HSK 1', url: 'hsk1.html#lesson-11', tags: 'giờ giấc đồng hồ lịch trình' },
    { title: 'HSK 1 - Bài 12: 明天天气怎么样 (Thời tiết ngày mai thế nào)', level: 'HSK 1', url: 'hsk1.html#lesson-12', tags: 'thời tiết nóng lạnh' },
    { title: 'HSK 1 - Bài 13: 他在做什么呢 (Anh ấy đang làm gì thế)', level: 'HSK 1', url: 'hsk1.html#lesson-13', tags: 'đang làm gì tiếp diễn' },
    { title: 'HSK 1 - Bài 14: 她买了不少衣服 (Cô ấy đã mua không ít quần áo)', level: 'HSK 1', url: 'hsk1.html#lesson-14', tags: 'mua sắm quần áo' },
    { title: 'HSK 1 - Bài 15: 我是坐飞机来的 (Tôi đi máy bay đến)', level: 'HSK 1', url: 'hsk1.html#lesson-15', tags: 'phương tiện máy bay xe cộ' },
    { title: 'HSK 2 - Toàn bộ 15 bài học ngữ pháp & đối thoại', level: 'HSK 2', url: 'hsk2.html', tags: 'hsk2 so sánh câu chữ bả' },
    { title: 'HSK 3 - Toàn bộ 20 bài học mở rộng 600 từ vựng', level: 'HSK 3', url: 'hsk3.html', tags: 'hsk3 nâng cao trung cấp' }
  ];

  let modalEl = null;
  let inputEl = null;
  let resultsEl = null;
  let activeIndex = 0;
  let currentResults = [];

  function initSpotlightDOM() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.id = 'spotlightOverlay';
    modalEl.className = 'spotlight-overlay hidden';
    modalEl.setAttribute('hidden', '');
    modalEl.innerHTML = `
      <div class="spotlight-modal" role="dialog" aria-modal="true" aria-label="Tìm kiếm nhanh">
        <div class="spotlight-search-bar">
          <span class="spotlight-search-icon">🔍</span>
          <input type="text" id="spotlightInput" class="spotlight-input" placeholder="Tìm từ vựng HSK, pinyin, nghĩa, bài học hoặc công cụ... (ví dụ: ni hao, 打算, bài 5)" autocomplete="off" spellcheck="false" />
          <span class="spotlight-kbd">ESC</span>
        </div>

        <div id="spotlightResults" class="spotlight-results">
          <!-- Render kết quả tại đây -->
        </div>

        <div class="spotlight-footer" style="display:flex; justify-content:space-between; align-items:center; padding:10px 18px; background:#f8fafc; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b;">
          <div style="display:flex; gap:12px; align-items:center;">
            <span><kbd class="spotlight-kbd">↑</kbd> <kbd class="spotlight-kbd">↓</kbd> Di chuyển</span>
            <span><kbd class="spotlight-kbd">↵</kbd> Chọn</span>
            <span><kbd class="spotlight-kbd">ESC</kbd> Đóng</span>
          </div>
          <span style="font-weight:700; color:#6657d9;">NiHao HSK Spotlight</span>
        </div>
      </div>
    `;

    document.body.appendChild(modalEl);

    inputEl = modalEl.querySelector('#spotlightInput');
    resultsEl = modalEl.querySelector('#spotlightResults');

    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeSpotlight();
    });

    inputEl.addEventListener('input', () => {
      activeIndex = 0;
      performSearch(inputEl.value.trim());
    });

    inputEl.addEventListener('keydown', handleKeyNavigation);

    // Header Trigger Button Injection (nếu chưa có)
    injectHeaderTrigger();
  }

  function injectHeaderTrigger() {
    if (document.getElementById('spotlightHeaderBtn')) return;
    const headerNav = document.querySelector('.site-nav') || document.querySelector('.nav') || document.querySelector('header nav');
    if (!headerNav) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'spotlightHeaderBtn';
    btn.className = 'spotlight-header-btn';
    btn.innerHTML = `
      <span style="font-size:14px;">🔍</span>
      <span class="spotlight-btn-text">Tìm kiếm...</span>
      <kbd class="spotlight-shortcut-badge">Ctrl K</kbd>
    `;
    btn.title = 'Tìm kiếm nhanh (Ctrl + K)';
    btn.onclick = () => openSpotlight();

    // Thêm trước nút đầu tiên hoặc cuối cùng trong nav
    headerNav.appendChild(btn);
  }

  function openSpotlight() {
    initSpotlightDOM();
    modalEl.removeAttribute('hidden');
    modalEl.classList.remove('hidden');
    modalEl.style.display = 'flex';
    inputEl.value = '';
    activeIndex = 0;
    performSearch('');
    setTimeout(() => inputEl.focus(), 50);
  }

  function closeSpotlight() {
    if (!modalEl) return;
    modalEl.setAttribute('hidden', '');
    modalEl.classList.add('hidden');
    modalEl.style.display = 'none';
  }

  function performSearch(query) {
    const q = query.toLowerCase();
    const results = [];

    // 1. Tìm trong Tools (nếu rỗng thì hiển thị toàn bộ gợi ý)
    const matchedTools = TOOLS.filter(t => {
      if (!q) return true;
      return t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
    });
    if (matchedTools.length) {
      results.push({ type: 'header', title: q ? 'Công cụ & Tính năng phù hợp' : '✨ Công cụ học nổi bật' });
      matchedTools.slice(0, q ? 3 : 5).forEach(tool => {
        results.push({
          type: 'tool',
          item: tool
        });
      });
    }

    // 2. Tìm trong Bài học
    if (q) {
      const matchedLessons = LESSON_CATALOG.filter(l => 
        l.title.toLowerCase().includes(q) || (l.tags && l.tags.toLowerCase().includes(q))
      );
      if (matchedLessons.length) {
        results.push({ type: 'header', title: '📚 Bài học giáo trình' });
        matchedLessons.slice(0, 4).forEach(lesson => {
          results.push({
            type: 'lesson',
            item: lesson
          });
        });
      }
    }

    // 3. Tìm trong Từ điển HSK
    if (window.HSKDictionary && typeof window.HSKDictionary.search === 'function') {
      const dictWords = window.HSKDictionary.search(q);
      if (dictWords && dictWords.length > 0) {
        results.push({ type: 'header', title: `📖 Từ vựng HSK (${dictWords.length} kết quả)` });
        dictWords.slice(0, 8).forEach(word => {
          results.push({
            type: 'word',
            item: word
          });
        });
      }
    }

    currentResults = results;
    renderResults();
  }

  function renderResults() {
    if (!currentResults.length) {
      resultsEl.innerHTML = `
        <div class="spotlight-empty" style="text-align:center; padding:40px 20px; color:#94a3b8;">
          <div style="font-size:36px; margin-bottom:10px;">🔍</div>
          <p style="font-weight:700; color:#475569; margin:0 0 6px;">Không tìm thấy kết quả phù hợp</p>
          <span style="font-size:13px;">Hãy thử gõ chữ Hán, Pinyin (như "xiexie"), Hán-Việt hoặc tên công cụ</span>
        </div>
      `;
      return;
    }

    let selectableIndex = -1;
    let html = '';

    currentResults.forEach((res) => {
      if (res.type === 'header') {
        html += `<div class="spotlight-category-header">${res.title}</div>`;
        return;
      }

      selectableIndex++;
      const isSelected = selectableIndex === activeIndex;

      if (res.type === 'tool') {
        const tool = res.item;
        html += `
          <div class="spotlight-item ${isSelected ? 'selected' : ''}" data-idx="${selectableIndex}" onclick="window.HSKSpotlight.selectIndex(${selectableIndex})">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:24px;">${tool.icon}</span>
              <div>
                <div style="font-weight:800; font-size:15px; color:#1e1b4b;">${tool.title}</div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">${tool.desc}</div>
              </div>
            </div>
            <span class="spotlight-badge" style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">${tool.category}</span>
          </div>
        `;
      } else if (res.type === 'lesson') {
        const l = res.item;
        html += `
          <div class="spotlight-item ${isSelected ? 'selected' : ''}" data-idx="${selectableIndex}" onclick="window.HSKSpotlight.selectIndex(${selectableIndex})">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:20px;">📘</span>
              <div>
                <div style="font-weight:800; font-size:14px; color:#1e1b4b;">${l.title}</div>
                <div style="font-size:12px; color:#64748b; margin-top:2px;">Mở bài học trực tiếp</div>
              </div>
            </div>
            <span class="spotlight-badge" style="background:#ede9fe; color:#6657d9; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">${l.level}</span>
          </div>
        `;
      } else if (res.type === 'word') {
        const w = res.item;
        html += `
          <div class="spotlight-item ${isSelected ? 'selected' : ''}" data-idx="${selectableIndex}" onclick="window.HSKSpotlight.selectIndex(${selectableIndex})">
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="font-size:26px; font-family:STKaiti,KaiTi,'KaiTi SC',serif; color:#1e1b4b; min-width:44px; text-align:center;">${w.hanzi}</div>
              <div>
                <div style="display:flex; align-items:baseline; gap:8px;">
                  <span style="font-weight:800; font-size:14px; color:#6657d9;">${w.pinyin}</span>
                  ${w.hv ? `<span style="font-size:12px; color:#b45309; font-weight:600;">(HV: ${w.hv})</span>` : ''}
                </div>
                <div style="font-size:13px; color:#334155; margin-top:2px;">${w.meaning}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <button type="button" title="Nghe đọc" style="border:0; background:#f1f5f9; color:#6657d9; border-radius:8px; padding:4px 8px; font-size:12px; cursor:pointer;" onclick="event.stopPropagation(); if(window.HSKAudio) window.HSKAudio.speak('${w.hanzi}');">🔊</button>
              <button type="button" title="Tập viết" style="border:0; background:#f1f5f9; color:#334155; border-radius:8px; padding:4px 8px; font-size:12px; cursor:pointer;" onclick="event.stopPropagation(); window.HSKSpotlight.close(); if(window.HanziPad) window.HanziPad.open('${w.hanzi}','${w.pinyin}','${w.meaning}');">✍️</button>
              <span class="spotlight-badge" style="background:#fef3c7; color:#b45309; font-size:11px; font-weight:700; padding:3px 8px; border-radius:6px;">${w.level}</span>
            </div>
          </div>
        `;
      }
    });

    resultsEl.innerHTML = html;

    // Tự động cuộn đến item đã chọn nếu vượt khung
    const selectedEl = resultsEl.querySelector('.spotlight-item.selected');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }

  function handleKeyNavigation(e) {
    const selectableItems = currentResults.filter(r => r.type !== 'header');
    if (!selectableItems.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % selectableItems.length;
      renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + selectableItems.length) % selectableItems.length;
      renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectIndex(activeIndex);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeSpotlight();
    }
  }

  function selectIndex(idx) {
    const selectableItems = currentResults.filter(r => r.type !== 'header');
    const target = selectableItems[idx];
    if (!target) return;

    closeSpotlight();

    if (target.type === 'tool') {
      if (typeof target.item.action === 'function') target.item.action();
    } else if (target.type === 'lesson') {
      window.location.href = target.item.url;
    } else if (target.type === 'word') {
      const w = target.item;
      if (window.HanziPad) {
        window.HanziPad.open(w.hanzi, w.pinyin, w.meaning);
      } else if (window.HSKAudio) {
        window.HSKAudio.speak(w.hanzi);
      }
    }
  }

  // Global Keyboard Shortcuts (Ctrl + K, Cmd + K, hoặc phím / khi không gõ text)
  document.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isK = e.key === 'k' || e.key === 'K';
    const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);

    if (((isMac && e.metaKey && isK) || (!isMac && e.ctrlKey && isK)) || isSlash) {
      e.preventDefault();
      const modal = document.getElementById('spotlightOverlay');
      if (modal && !modal.hasAttribute('hidden') && modal.style.display !== 'none') {
        closeSpotlight();
      } else {
        openSpotlight();
      }
    }
  });

  // Tự động gắn trigger button khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeaderTrigger);
  } else {
    injectHeaderTrigger();
  }

  window.HSKSpotlight = {
    open: openSpotlight,
    close: closeSpotlight,
    selectIndex
  };
})();

