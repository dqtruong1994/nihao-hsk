(() => {
  'use strict';

  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  document.querySelectorAll('[data-textbook-dialogues]').forEach(root => {
    const storageKey = `hsk-textbook-${root.dataset.textbookLevel}-selection`;
    let book;
    let selectedLesson = 1;
    let selectedText = 1;
    let showPinyin = true;
    let showTranslation = true;

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (Number.isInteger(saved?.lesson)) selectedLesson = saved.lesson;
      if (Number.isInteger(saved?.text)) selectedText = saved.text;
    } catch { /* Reading remains available without local storage. */ }

    const remember = () => {
      try { localStorage.setItem(storageKey, JSON.stringify({ lesson: selectedLesson, text: selectedText })); }
      catch { /* A blocked storage API must not interrupt practice. */ }
    };

    function currentLesson() {
      return book.lessons.find(lesson => lesson.number === selectedLesson) || book.lessons[0];
    }

    function sentenceRows(text) {
      return text.lines.flatMap((line, index) => (line.sentences || [line]).map(sentence => ({
        ...sentence,
        speaker: line.speaker,
        turn: line.turn ?? index + 1
      })));
    }

    function renderText() {
      const lesson = currentLesson();
      const text = lesson.texts.find(item => item.number === selectedText) || lesson.texts[0];
      selectedText = text.number;
      const pages = [...new Set(text.pdfPages)].join(', ');
      const rows = sentenceRows(text);
      const panel = root.querySelector('.textbook-text-panel');
      panel.id = `textbook-panel-${book.level}`;
      panel.setAttribute('aria-labelledby', `textbook-tab-${book.level}-${text.number}`);
      panel.classList.toggle('textbook-hide-pinyin', !showPinyin);
      panel.classList.toggle('textbook-hide-translation', !showTranslation);
      panel.innerHTML = `
        <header class="textbook-text-heading">
          <div><span class="textbook-kewen" lang="zh-CN">课文 ${text.number}</span>
          ${text.sceneZh ? `<h3 lang="zh-CN">${escapeHTML(text.sceneZh)}</h3>` : ''}
          ${text.sceneVi ? `<p>${escapeHTML(text.sceneVi)}</p>` : ''}</div>
          <span class="textbook-page">Trang ${escapeHTML(pages)} trong PDF</span>
        </header>
        <div class="textbook-lines">${rows.map((sentence, index) => `
          <article class="textbook-sentence" data-textbook-sentence="${index + 1}">
            <span class="textbook-speaker" aria-label="Người nói ${escapeHTML(sentence.speaker)}">${escapeHTML(sentence.speaker)}</span>
            <div class="textbook-sentence-content">
              <div class="textbook-hanzi" lang="zh-CN">${escapeHTML(sentence.zh)}</div>
              <div class="textbook-pinyin" lang="zh-Latn">${escapeHTML(sentence.py)}</div>
              <div class="textbook-sentence-audio">${window.HSKAudio.controls({
                text: sentence.audioText || sentence.zh,
                label: `Bài ${lesson.number}, 课文 ${text.number}, ${sentence.speaker}: ${sentence.zh}`
              })}</div>
              <div class="textbook-translation">${escapeHTML(sentence.vi)}</div>
            </div>
          </article>`).join('')}
        </div>`;
      root.querySelectorAll('[data-textbook-text]').forEach(button => {
        const active = Number(button.dataset.textbookText) === text.number;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        button.classList.toggle('active', active);
        button.setAttribute('aria-controls', panel.id);
      });
      const activeTab = root.querySelector(`[data-textbook-text="${text.number}"]`);
      activeTab?.setAttribute('aria-controls', panel.id);
      root.querySelector('.textbook-announcement').textContent = `Bài ${lesson.number}, 课文 ${text.number}, ${rows.length} câu hội thoại.`;
      remember();
    }

    function renderLesson() {
      const lesson = currentLesson();
      selectedLesson = lesson.number;
      if (!lesson.texts.some(text => text.number === selectedText)) selectedText = lesson.texts[0].number;
      root.innerHTML = `
        <div class="textbook-intro">
          <span class="textbook-eyebrow">GIÁO TRÌNH CHUẨN HSK ${book.level} · ${book.lessons.length} BÀI</span>
          <h2>Hội thoại trong giáo trình</h2>
          <p>Chọn bài trong sách, sau đó chọn từng <span lang="zh-CN">课文</span>. Nghe từng câu và nói theo; có thể ẩn Pinyin hoặc bản dịch để tự luyện.</p>
        </div>
        <div class="textbook-selector">
          <label for="textbook-lesson-${book.level}">Bài trong giáo trình</label>
          <div class="textbook-selector-row">
            <button type="button" data-textbook-step="-1" aria-label="Bài giáo trình trước" ${lesson.number === book.lessons[0].number ? 'disabled' : ''}>←</button>
            <select id="textbook-lesson-${book.level}" data-textbook-lesson>${book.lessons.map(item => `<option value="${item.number}" ${item.number === lesson.number ? 'selected' : ''}>${item.number}. ${escapeHTML(item.titleZh)} — ${escapeHTML(item.titleVi)}</option>`).join('')}</select>
            <button type="button" data-textbook-step="1" aria-label="Bài giáo trình tiếp theo" ${lesson.number === book.lessons[book.lessons.length - 1].number ? 'disabled' : ''}>→</button>
          </div>
        </div>
        <div class="textbook-lesson-heading">
          <span class="textbook-lesson-number">BÀI ${lesson.number}</span>
          <h3 lang="zh-CN">${escapeHTML(lesson.titleZh)}</h3>
          <p class="textbook-title-pinyin" lang="zh-Latn">${escapeHTML(lesson.titlePinyin)}</p>
          <p>${escapeHTML(lesson.titleVi)}</p>
        </div>
        <div class="textbook-tools">
          <div class="textbook-text-tabs" role="tablist" aria-label="Các bài khóa trong bài ${lesson.number}">${lesson.texts.map(text => `<button type="button" role="tab" id="textbook-tab-${book.level}-${text.number}" data-textbook-text="${text.number}" aria-selected="false" tabindex="-1">课文 ${text.number}</button>`).join('')}</div>
          <div class="textbook-display-options">
            <button type="button" data-textbook-toggle="pinyin" aria-pressed="${showPinyin}">${showPinyin ? 'Ẩn' : 'Hiện'} Pinyin</button>
            <button type="button" data-textbook-toggle="translation" aria-pressed="${showTranslation}">${showTranslation ? 'Ẩn' : 'Hiện'} bản dịch</button>
          </div>
        </div>
        <div class="textbook-text-panel" role="tabpanel" tabindex="0"></div>
        <p class="textbook-source">Chữ Hán được đối chiếu với giáo trình HSK ${book.level} đã cung cấp. Pinyin và bản dịch tiếng Việt hỗ trợ luyện tập. Nút nghe dùng giọng tiếng Trung của thiết bị.</p>
        <div class="textbook-announcement" role="status" aria-live="polite"></div>`;
      renderText();
    }

    function changeLesson(number, focusSelector) {
      if (!book.lessons.some(lesson => lesson.number === number)) return;
      window.HSKAudio.stop();
      selectedLesson = number;
      selectedText = 1;
      renderLesson();
      if (focusSelector) root.querySelector('[data-textbook-lesson]').focus({ preventScroll: true });
    }

    root.addEventListener('change', event => {
      if (event.target.matches('[data-textbook-lesson]')) changeLesson(Number(event.target.value), true);
    });

    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute('data-textbook-retry')) { load(); return; }
      if (!book) return;
      if (button.hasAttribute('data-textbook-step')) {
        changeLesson(selectedLesson + Number(button.dataset.textbookStep), true);
      } else if (button.hasAttribute('data-textbook-text')) {
        window.HSKAudio.stop();
        selectedText = Number(button.dataset.textbookText);
        renderText();
      } else if (button.hasAttribute('data-textbook-toggle')) {
        const isPinyin = button.dataset.textbookToggle === 'pinyin';
        if (isPinyin) showPinyin = !showPinyin;
        else showTranslation = !showTranslation;
        const shown = isPinyin ? showPinyin : showTranslation;
        button.setAttribute('aria-pressed', String(shown));
        button.textContent = `${shown ? 'Ẩn' : 'Hiện'} ${isPinyin ? 'Pinyin' : 'bản dịch'}`;
        root.querySelector('.textbook-text-panel').classList.toggle(isPinyin ? 'textbook-hide-pinyin' : 'textbook-hide-translation', !shown);
      }
    });

    root.addEventListener('keydown', event => {
      if (!event.target.matches('[data-textbook-text]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...root.querySelectorAll('[data-textbook-text]')];
      const index = tabs.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].click();
      tabs[next].focus({ preventScroll: true });
    });

    async function load() {
      root.innerHTML = '<p class="textbook-loading" role="status">Đang tải hội thoại giáo trình…</p>';
      try {
        const response = await fetch(root.dataset.textbookSource);
        if (!response.ok) throw new Error('Textbook unavailable');
        const data = await response.json();
        if (!Array.isArray(data.lessons) || !data.lessons.length || !data.lessons.every(lesson =>
          Number.isInteger(lesson.number) && lesson.titleZh && Array.isArray(lesson.texts) && lesson.texts.length &&
          lesson.texts.every(text => Number.isInteger(text.number) && Array.isArray(text.pdfPages) && Array.isArray(text.lines) && text.lines.length &&
            text.lines.every(line => line.speaker && line.zh && line.py && line.vi))
        )) throw new Error('Invalid textbook content');
        book = data;
        renderLesson();
      } catch {
        root.innerHTML = '<div class="textbook-load-error" role="alert"><h2>Chưa tải được hội thoại</h2><p>Kiểm tra kết nối rồi thử tải lại nội dung giáo trình.</p><button type="button" class="btn" data-textbook-retry>Tải lại hội thoại</button></div>';
      }
    }

    load();
  });

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-open-textbook]');
    if (!opener) return;
    const tab = document.querySelector('.tabs [data-tab="textbook"]');
    tab?.click();
    tab?.focus({ preventScroll: true });
    document.getElementById('textbook')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
