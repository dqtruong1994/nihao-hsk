(() => {
  'use strict';
  if (window.HSKAudio) return;

  const INITIAL_MESSAGE = 'Chọn Nghe hoặc Nghe chậm để nghe phát âm tiếng Trung.';
  const START_TIMEOUT = 7000;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  let synthesis = null;
  try { synthesis = window.speechSynthesis; } catch {}
  const supported = !!synthesis && typeof synthesis.speak === 'function' && typeof synthesis.cancel === 'function' && typeof window.SpeechSynthesisUtterance === 'function';
  let voices = [], active = null, generation = 0;
  let state = { phase: 'idle', message: INITIAL_MESSAGE, label: '', rate: 1 };

  function refreshVoices() {
    try { voices = supported && typeof synthesis.getVoices === 'function' ? Array.from(synthesis.getVoices() || []) : []; }
    catch { voices = []; }
    return voices;
  }
  function mandarinRank(voice) {
    const language = String(voice.lang || '').replace(/_/g, '-').toLowerCase();
    const name = String(voice.name || '');
    if (/^yue(?:-|$)/.test(language) || /(?:^|-)hk(?:-|$)/.test(language) || /cantonese|廣東|广东|粵語|粤语/i.test(name)) return -1;
    let rank = -1;
    if (/^(?:zh|cmn)-(?:hans-)?cn$/.test(language)) rank = 600;
    else if (/^zh-hans(?:-|$)/.test(language)) rank = 500;
    else if (/^(?:zh|cmn)-sg$/.test(language)) rank = 450;
    else if (/^cmn(?:-|$)/.test(language)) rank = 400;
    else if (/^zh-tw$/.test(language) || /^zh-hant(?:-|$)/.test(language)) rank = 350;
    return rank < 0 ? -1 : rank + (voice.localService ? 2 : 0) + (voice.default ? 1 : 0);
  }
  function chooseVoice() {
    return voices.reduce((best, voice) => mandarinRank(voice) > (best ? mandarinRank(best) : -1) ? voice : best, null);
  }
  function soundExample(key) {
    const dictionary = window.HSKPronunciation;
    if (!dictionary || !Object.prototype.hasOwnProperty.call(dictionary, key)) return null;
    const example = dictionary[key];
    return example && typeof example.text === 'string' && example.text.trim() ? example : null;
  }
  function controls(options = {}) {
    const key = typeof options.soundKey === 'string' ? options.soundKey.trim() : '';
    const example = key ? soundExample(key) : null;
    const text = key ? example?.text || '' : typeof options.text === 'string' ? options.text.trim() : '';
    const label = String(options.label || example?.label || text || 'Tiếng Trung');
    const attributes = ' data-hsk-audio-text="' + escape(text) + '"' + (key ? ' data-hsk-audio-key="' + escape(key) + '"' : '') + ' data-hsk-audio-label="' + escape(label) + '"';
    const button = (rate, title, icon) => '<button type="button" class="hsk-audio-btn"' + attributes + ' data-hsk-audio-rate="' + rate + '" aria-pressed="false" aria-label="' + escape(title + ': ' + label) + '"><span aria-hidden="true">' + icon + '</span> ' + title + '</button>';
    const caption = key ? '<span class="hsk-audio-caption">' + (example ? 'Âm tiết ví dụ: ' + escape([example.pinyin, example.text].filter(Boolean).join(' · ')) : 'Âm tiết ví dụ đang được cập nhật.') + '</span>' : '';
    return '<span class="hsk-audio-controls' + (options.compact ? ' compact' : '') + '" role="group" aria-label="' + escape('Phát âm: ' + label) + '">' + button(1, 'Nghe', '🔊') + button(0.7, 'Nghe chậm', '🐢') + caption + '</span>';
  }

  function statusRegion() {
    if (!document.body) return null;
    let region = document.getElementById('hskAudioStatus');
    if (!region) {
      region = document.createElement('div');
      region.id = 'hskAudioStatus'; region.className = 'hsk-audio-status';
      region.setAttribute('role', 'status'); region.setAttribute('aria-live', 'polite'); region.setAttribute('aria-atomic', 'true');
      document.body.appendChild(region);
    }
    let message = region.querySelector('.hsk-audio-message');
    if (!message) { message = document.createElement('span'); message.className = 'hsk-audio-message'; region.appendChild(message); }
    let stopButton = region.querySelector('[data-hsk-audio-stop]');
    if (!stopButton) {
      stopButton = document.createElement('button'); stopButton.type = 'button'; stopButton.className = 'hsk-audio-stop';
      stopButton.setAttribute('data-hsk-audio-stop', ''); stopButton.setAttribute('aria-label', 'Dừng phát âm'); stopButton.textContent = 'Dừng';
      region.appendChild(stopButton);
    }
    region.hidden = !active && state.phase === 'idle' && state.message === INITIAL_MESSAGE; region.dataset.state = state.phase;
    message.textContent = state.message; stopButton.disabled = false;
    stopButton.textContent = active ? 'Dừng' : 'Đóng';
    stopButton.setAttribute('aria-label', active ? 'Dừng phát âm' : 'Đóng thông báo phát âm');
    return region;
  }
  function setState(phase, message, details = {}) { state = { ...state, ...details, phase, message }; statusRegion(); }
  function buttonState(task, mode) {
    const button = task?.button;
    if (!button) return;
    button.classList.toggle('is-playing', mode === 'speaking');
    button.classList.toggle('is-loading', mode === 'preparing');
    button.setAttribute('aria-pressed', String(mode !== 'idle')); button.setAttribute('aria-busy', String(mode === 'preparing'));
    if (mode !== 'idle') button.setAttribute('aria-label', 'Dừng phát âm: ' + task.label);
    else if (task.originalLabel === null) button.removeAttribute('aria-label');
    else button.setAttribute('aria-label', task.originalLabel);
  }
  function clearTimers(task) { if (task) { clearTimeout(task.startTimer); clearTimeout(task.endTimer); } }
  function retire() {
    const previous = active;
    active = null; generation++;
    clearTimers(previous); buttonState(previous, 'idle');
    try { synthesis?.cancel(); } catch {}
    return !!previous;
  }
  function stop() {
    const wasActive = retire();
    if (wasActive) setState('stopped', 'Đã dừng phát âm. Chọn Nghe để phát lại.');
    else setState('idle', INITIAL_MESSAGE, { label: '', rate: 1 });
    return wasActive;
  }
  function fail(message) { retire(); setState('error', message); return false; }
  function current(task) { return active === task && task.generation === generation; }
  function finish(task, phase, message) {
    if (!current(task)) return;
    clearTimers(task); buttonState(task, 'idle'); active = null; generation++;
    setState(phase, message);
  }
  function errorMessage(code) {
    if (code === 'not-allowed') return 'Trình duyệt chưa cho phát âm. Hãy chạm lại nút Nghe để bắt đầu.';
    if (['language-unavailable', 'voice-unavailable', 'synthesis-unavailable'].includes(code)) return 'Chưa có giọng tiếng Trung phù hợp. Kiểm tra giọng tiếng Trung trong cài đặt thiết bị rồi chạm Nghe lại.';
    if (code === 'network') return 'Giọng đọc này cần kết nối mạng. Kiểm tra kết nối rồi chạm Nghe lại.';
    if (['audio-busy', 'audio-hardware'].includes(code)) return 'Chưa dùng được đầu ra âm thanh. Kiểm tra âm lượng, loa hoặc tai nghe rồi thử lại.';
    if (['canceled', 'interrupted'].includes(code)) return 'Phát âm đã bị ngắt. Bạn có thể chạm Nghe để phát lại.';
    if (code === 'text-too-long') return 'Đoạn này quá dài với giọng đọc của thiết bị. Hãy nghe từng câu hoặc đoạn ngắn hơn.';
    return 'Chưa phát được giọng đọc. Kiểm tra âm thanh và giọng tiếng Trung của thiết bị rồi thử lại.';
  }
  function speak(text, options = {}) {
    retire();
    if (!supported) return fail('Trình duyệt này chưa hỗ trợ giọng đọc. Hãy mở bài bằng trình duyệt có chức năng đọc tiếng Trung.');
    if (typeof text !== 'string' || !text.trim()) return fail('Chưa có nội dung tiếng Trung để phát âm. Hãy chọn một từ hoặc câu khác.');
    const value = text.trim(), requestedRate = Number(options.rate ?? 1);
    const rate = Number.isFinite(requestedRate) ? Math.max(0.5, Math.min(1.5, requestedRate)) : 1;
    const rawLabel = String(options.label || value).trim(), label = rawLabel.length > 100 ? rawLabel.slice(0, 100) + '…' : rawLabel;
    refreshVoices();
    const voice = chooseVoice();
    if (voices.length && !voice) return fail(errorMessage('language-unavailable'));
    let utterance;
    try { utterance = new window.SpeechSynthesisUtterance(value); }
    catch { return fail(errorMessage('synthesis-unavailable')); }
    if (voice) utterance.voice = voice;
    utterance.lang = voice ? String(voice.lang).replace(/_/g, '-') : 'zh-CN';
    utterance.rate = rate; utterance.pitch = 1; utterance.volume = 1;
    const task = { generation, utterance, label, rate, button: options.button || null, originalLabel: options.button?.getAttribute('aria-label') ?? null, started: false, startTimer: null, endTimer: null };
    active = task;
    buttonState(task, 'preparing'); setState('preparing', 'Đang chuẩn bị giọng đọc: ' + label, { label, rate });
    utterance.onstart = () => {
      if (!current(task)) return;
      task.started = true; clearTimeout(task.startTimer);
      buttonState(task, 'speaking'); setState('speaking', 'Đang đọc' + (rate < 1 ? ' chậm' : '') + ': ' + label);
      task.endTimer = setTimeout(() => {
        if (current(task)) fail('Giọng đọc chưa kết thúc đúng cách. Đã dừng phát; bạn có thể chạm Nghe để thử lại.');
      }, Math.max(20000, Math.min(180000, value.length * 600 / rate + 10000)));
    };
    utterance.onend = () => finish(task, 'idle', 'Đã phát xong: ' + label);
    utterance.onerror = event => { if (current(task)) fail(errorMessage(event.error)); };
    task.startTimer = setTimeout(() => {
      if (current(task) && !task.started) fail('Chưa nghe được giọng đọc. Hãy chạm Nghe lại; nếu vẫn im lặng, kiểm tra âm lượng và giọng tiếng Trung của thiết bị.');
    }, START_TIMEOUT);
    try {
      // Keep the first native speak call inside the user's click gesture.
      if (synthesis.paused && typeof synthesis.resume === 'function') synthesis.resume();
      document.dispatchEvent(new CustomEvent('hsk-audio-start', { bubbles: true, detail: { text: value, label, rate } }));
      synthesis.speak(utterance);
      return true;
    } catch { return fail(errorMessage('synthesis-failed')); }
  }

  document.addEventListener('click', event => {
    const target = event.target?.closest?.('button[data-hsk-audio-rate], button[data-hsk-audio-stop]');
    if (!target) return;
    event.preventDefault(); event.stopPropagation();
    if (target.hasAttribute('data-hsk-audio-stop')) { stop(); return; }
    if (active?.button === target) { stop(); return; }
    const key = target.getAttribute('data-hsk-audio-key'), example = key ? soundExample(key) : null;
    if (key && !example) { fail('Chưa tìm thấy âm tiết ví dụ cho mục này. Hãy chọn mục khác hoặc tải lại bài học.'); return; }
    if (key && key.startsWith('tone:') && window.Gamification) {
      const py = key.slice(5);
      let toneNum = 1;
      if (/[áéíóúǘ]/i.test(py)) toneNum = 2;
      else if (/[ǎěǐǒǔǚ]/i.test(py)) toneNum = 3;
      else if (/[àèìòùǜ]/i.test(py)) toneNum = 4;
      window.Gamification.playToneContour(toneNum);
    }
    speak(key ? example.text : target.getAttribute('data-hsk-audio-text'), { rate: Number(target.getAttribute('data-hsk-audio-rate')), button: target, label: target.getAttribute('data-hsk-audio-label') || example?.label });
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  if (synthesis) {
    if (typeof synthesis.addEventListener === 'function') synthesis.addEventListener('voiceschanged', refreshVoices);
    else synthesis.onvoiceschanged = refreshVoices;
  }
  refreshVoices();
  window.HSKAudio = { controls, speak, stop, getState: () => ({ ...state, supported }) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', statusRegion, { once: true });
  else statusRegion();
})();
