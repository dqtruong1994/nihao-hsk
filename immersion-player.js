/**
 * Floating Hands-Free Audio Immersion Player (Máy Nghe Thụ Động)
 * Tự động phát hội thoại giáo trình HSK liên tục chạy nền kèm phụ đề Hán tự - Pinyin - Dịch nghĩa
 * Tích hợp tính năng Luyện Nói & Thu Âm (Voice Shadowing, Recording & Playback, So sánh phát âm)
 */
(() => {
  'use strict';

  const DEFAULT_PLAYLIST = [
    { zh: '你好！', py: 'Nǐ hǎo!', vi: 'Xin chào!' },
    { zh: '您好！', py: 'Nín hǎo!', vi: 'Chào bạn (kính ngữ)!' },
    { zh: '谢谢你！', py: 'Xièxie nǐ!', vi: 'Cảm ơn bạn!' },
    { zh: '不客气！', py: 'Bú kèqi!', vi: 'Đừng khách sáo / Không có chi!' },
    { zh: '你叫什么名字？', py: 'Nǐ jiào shénme míngzi?', vi: 'Bạn tên là gì?' },
    { zh: '我叫李月。', py: 'Wǒ jiào Lǐ Yuè.', vi: 'Tôi tên là Lý Nguyệt.' },
    { zh: '你是中国人吗？', py: 'Nǐ shì Zhōngguó rén ma?', vi: 'Bạn là người Trung Quốc phải không?' },
    { zh: '我不是中国人，我是美国人。', py: 'Wǒ bú shì Zhōngguó rén, wǒ shì Měiguó rén.', vi: 'Tôi không phải người TQ, tôi là người Mỹ.' },
    { zh: '她是我的汉语老师。', py: 'Tā shì wǒ de Hànyǔ lǎoshī.', vi: 'Cô ấy là cô giáo tiếng Trung của tôi.' },
    { zh: '我想喝茶，你想喝什么？', py: 'Wǒ xiǎng hē chá, nǐ xiǎng hē shénme?', vi: 'Tôi muốn uống trà, bạn muốn uống gì?' },
    { zh: '今天天气怎么样？', py: 'Jīntiān tiānqì zěnmeyàng?', vi: 'Thời tiết hôm nay thế nào?' },
    { zh: '今天很热，不冷。', py: 'Jīntiān hěn rè, bù lěng.', vi: 'Hôm nay rất nóng, không lạnh.' },
    { zh: '明天你想去哪儿？', py: 'Míngtiān nǐ xiǎng qù nǎr?', vi: 'Ngày mai bạn muốn đi đâu?' },
    { zh: '明天我想去商店买东西。', py: 'Míngtiān wǒ xiǎng qù shāngdiàn mǎi dōngxi.', vi: 'Ngày mai tôi muốn đến cửa hàng mua đồ.' }
  ];

  let currentPlaylist = [...DEFAULT_PLAYLIST];
  let currentIndex = 0;
  let isPlaying = false;
  let playbackRate = 1.0;
  let repeatMode = 'loop-all'; // 'loop-one' | 'loop-all' | 'continuous'
  let pauseTimer = null;
  let loadedLevelData = {};

  let triggerEl = null;
  let cardEl = null;

  // Voice Shadowing & Recording State
  let mediaRecorder = null;
  let audioStream = null;
  let recordedChunks = [];
  let recordedAudioUrl = null;
  let userAudioPlayer = null;
  let isRecording = false;
  let isPlayingUserAudio = false;
  let isPlayingSample = false;
  let isComparing = false;
  let recordTimer = null;
  let recordSeconds = 0;
  let speechRecognizer = null;
  let recognizedText = '';

  function initPlayerDOM() {
    if (triggerEl) return;

    // 1. Floating Pill Trigger Button
    triggerEl = document.createElement('button');
    triggerEl.type = 'button';
    triggerEl.id = 'immersionFloatingTrigger';
    triggerEl.className = 'immersion-floating-trigger';
    triggerEl.title = 'Mở Máy Nghe Thụ Động (Hands-free Immersion)';
    triggerEl.innerHTML = `
      <div class="immersion-eq-bars">
        <span class="immersion-eq-bar"></span>
        <span class="immersion-eq-bar"></span>
        <span class="immersion-eq-bar"></span>
        <span class="immersion-eq-bar"></span>
      </div>
      <span id="immersionTriggerLabel">🎧 Luyện nghe thụ động</span>
    `;
    triggerEl.onclick = toggleCard;
    document.body.appendChild(triggerEl);

    // 2. Expanded Player Card
    cardEl = document.createElement('div');
    cardEl.id = 'immersionPlayerCard';
    cardEl.className = 'immersion-player-card hidden';
    cardEl.setAttribute('hidden', '');
    cardEl.innerHTML = `
      <div class="immersion-header">
        <div class="immersion-header-title">
          <span>🎧</span>
          <span>Máy Nghe Thụ Động (Immersion)</span>
        </div>
        <div class="immersion-header-actions">
          <button type="button" class="immersion-icon-btn" id="immersionMinBtn" title="Thu nhỏ">_</button>
          <button type="button" class="immersion-icon-btn" id="immersionCloseBtn" title="Đóng">✕</button>
        </div>
      </div>

      <div class="immersion-body">
        <div class="immersion-selector-row">
          <select id="immersionLevelSelect" class="immersion-select">
            <option value="hsk1" selected>HSK 1 - Hội thoại chuẩn</option>
            <option value="hsk2">HSK 2 - Hội thoại chuẩn</option>
            <option value="hsk3">HSK 3 - Hội thoại chuẩn</option>
          </select>
          <select id="immersionLessonSelect" class="immersion-select">
            <option value="all">Toàn bộ câu mẫu</option>
          </select>
        </div>

        <div class="immersion-subtitle-box">
          <div class="immersion-hanzi-text" id="immersionHanzi">你好！</div>
          <div class="immersion-pinyin-text" id="immersionPinyin">Nǐ hǎo!</div>
          <div class="immersion-meaning-text" id="immersionMeaning">Xin chào!</div>
        </div>

        <!-- Thanh Luyện Nói & Thu Âm (Voice Shadowing & Recording Dock) -->
        <div class="immersion-voice-dock" id="immersionVoiceDock">
          <div class="immersion-voice-row">
            <button type="button" class="immersion-v-btn rec-btn" id="immersionRecBtn" title="Bắt đầu thu âm giọng bạn">
              <span class="v-icon rec-dot">●</span>
              <span id="immersionRecLabel">Thu âm</span>
            </button>
            <button type="button" class="immersion-v-btn play-user-btn" id="immersionPlayUserBtn" title="Nghe lại giọng bạn vừa thu" disabled>
              <span class="v-icon">🎧</span>
              <span id="immersionPlayUserLabel">Nghe lại</span>
            </button>
            <button type="button" class="immersion-v-btn native-sample-btn" id="immersionNativeSampleBtn" title="Nghe giọng đọc bản ngữ câu này">
              <span class="v-icon">🔊</span>
              <span id="immersionSampleLabel">Mẫu chuẩn</span>
            </button>
            <button type="button" class="immersion-v-btn compare-btn" id="immersionCompareBtn" title="So sánh: Nghe mẫu trước, nghe bạn sau" disabled>
              <span class="v-icon">⚖️</span>
              <span id="immersionCompareLabel">So sánh</span>
            </button>
          </div>
          <div class="immersion-voice-feedback" id="immersionVoiceFeedback" data-type="idle">
            <span class="feedback-icon" id="immersionFeedbackIcon">💡</span>
            <span class="feedback-text" id="immersionFeedbackText">Bấm <b>Thu âm</b> để luyện nói theo câu này</span>
          </div>
        </div>

        <div class="immersion-controls">
          <div style="font-size:12px; font-weight:700; color:#64748b;" id="immersionProgressText">
            1 / ${currentPlaylist.length}
          </div>
          <div class="immersion-playback-btns">
            <button type="button" class="immersion-step-btn" id="immersionPrevBtn" title="Câu trước">⏮</button>
            <button type="button" class="immersion-play-btn" id="immersionPlayBtn" title="Phát / Dừng">▶</button>
            <button type="button" class="immersion-step-btn" id="immersionNextBtn" title="Câu tiếp">⏭</button>
          </div>
          <div style="display:flex; gap:4px;">
            <button type="button" class="immersion-chip-btn" id="immersionModeBtn" title="Đổi chế độ lặp">🔁 Lặp bài</button>
          </div>
        </div>

        <div class="immersion-settings-row">
          <span>Tốc độ đọc:</span>
          <div style="display:flex; gap:6px;">
            <button type="button" class="immersion-chip-btn" data-rate="0.8">0.8x</button>
            <button type="button" class="immersion-chip-btn active" data-rate="1.0">1.0x</button>
            <button type="button" class="immersion-chip-btn" data-rate="1.2">1.2x</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(cardEl);

    bindEvents();
    loadLevelData('hsk1');
  }

  function bindEvents() {
    document.getElementById('immersionMinBtn').onclick = hideCard;
    document.getElementById('immersionCloseBtn').onclick = () => {
      stopPlayback();
      resetVoiceRecording();
      hideCard();
    };

    document.getElementById('immersionPlayBtn').onclick = () => {
      if (isPlaying) {
        pausePlayback();
      } else {
        startPlayback();
      }
    };

    document.getElementById('immersionPrevBtn').onclick = () => {
      prevSentence();
    };

    document.getElementById('immersionNextBtn').onclick = () => {
      nextSentence();
    };

    // Voice Toolbar Buttons
    const recBtn = document.getElementById('immersionRecBtn');
    if (recBtn) recBtn.onclick = toggleRecording;

    const playUserBtn = document.getElementById('immersionPlayUserBtn');
    if (playUserBtn) playUserBtn.onclick = () => playUserAudio();

    const sampleBtn = document.getElementById('immersionNativeSampleBtn');
    if (sampleBtn) sampleBtn.onclick = () => playNativeSample();

    const compareBtn = document.getElementById('immersionCompareBtn');
    if (compareBtn) compareBtn.onclick = () => compareAudio();

    // Rate Buttons
    cardEl.querySelectorAll('[data-rate]').forEach(btn => {
      btn.onclick = () => {
        playbackRate = parseFloat(btn.dataset.rate);
        cardEl.querySelectorAll('[data-rate]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };
    });

    // Repeat Mode Button
    const modeBtn = document.getElementById('immersionModeBtn');
    modeBtn.onclick = () => {
      if (repeatMode === 'loop-all') {
        repeatMode = 'loop-one';
        modeBtn.textContent = '🔂 Lặp 1 câu';
      } else if (repeatMode === 'loop-one') {
        repeatMode = 'continuous';
        modeBtn.textContent = '⏩ Phát liên tục';
      } else {
        repeatMode = 'loop-all';
        modeBtn.textContent = '🔁 Lặp bài';
      }
    };

    // Level Select
    const lvlSelect = document.getElementById('immersionLevelSelect');
    lvlSelect.onchange = () => {
      resetVoiceRecording();
      loadLevelData(lvlSelect.value);
    };

    // Lesson Select
    const lsnSelect = document.getElementById('immersionLessonSelect');
    lsnSelect.onchange = () => {
      resetVoiceRecording();
      filterPlaylistByLesson(lsnSelect.value);
    };
  }

  // ==========================================
  // VOICE RECORDING & SHADOWING SYSTEM
  // ==========================================

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  async function startRecording() {
    // 1. Tạm dừng phát tự động nếu đang chạy
    if (isPlaying) {
      pausePlayback();
    }

    // 2. Dừng phát âm thanh người dùng / mẫu nếu đang phát
    stopUserAudio();
    stopNativeSpeech();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceFeedback('Trình duyệt chưa hỗ trợ thu âm qua Microphone.', 'error');
      return;
    }

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setVoiceFeedback('Không thể truy cập Mic. Hãy cho phép quyền Microphone trên trình duyệt.', 'error');
      return;
    }

    recordedChunks = [];
    recognizedText = '';

    try {
      let options = {};
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options = { mimeType: 'audio/webm;codecs=opus' };
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }
      }
      mediaRecorder = new MediaRecorder(audioStream, options);
    } catch (e) {
      mediaRecorder = new MediaRecorder(audioStream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (recordedChunks.length > 0) {
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(recordedChunks, { type: mimeType });
        recordedAudioUrl = URL.createObjectURL(audioBlob);

        const replayBtn = document.getElementById('immersionPlayUserBtn');
        const compareBtn = document.getElementById('immersionCompareBtn');
        if (replayBtn) replayBtn.disabled = false;
        if (compareBtn) compareBtn.disabled = false;

        // Nếu đã có kết quả nhận diện từ trước đó
        if (recognizedText) {
          evaluatePronunciation(recognizedText);
        } else {
          setVoiceFeedback('✅ Đã thu xong! Bấm <b>🎧 Nghe lại</b> hoặc <b>⚖️ So sánh</b>.', 'ready');
        }
      }
    };

    mediaRecorder.start();
    isRecording = true;
    recordSeconds = 0;
    updateRecordUI();

    // Bộ đếm thời gian (tối đa 12s cho 1 câu nói)
    clearInterval(recordTimer);
    recordTimer = setInterval(() => {
      recordSeconds++;
      updateRecordUI();
      if (recordSeconds >= 12) {
        stopRecording();
      }
    }, 1000);

    setVoiceFeedback('🔴 Đang thu âm... Hãy đọc to câu tiếng Trung ở trên!', 'recording');

    // Kích hoạt nhận diện tiếng Trung nếu hỗ trợ
    startSpeechRecognition();
  }

  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    clearInterval(recordTimer);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (e) {}
    }

    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
      audioStream = null;
    }

    updateRecordUI();

    if (speechRecognizer) {
      try { speechRecognizer.stop(); } catch (e) {}
    }
  }

  function updateRecordUI() {
    const recBtn = document.getElementById('immersionRecBtn');
    const recLabel = document.getElementById('immersionRecLabel');
    if (!recBtn || !recLabel) return;

    if (isRecording) {
      recBtn.classList.add('is-recording');
      recLabel.textContent = `Dừng (${recordSeconds}s)`;
    } else {
      recBtn.classList.remove('is-recording');
      recLabel.textContent = recordedAudioUrl ? 'Thu lại' : 'Thu âm';
    }
  }

  function playUserAudio(onEndedCallback) {
    if (!recordedAudioUrl) return;

    if (isPlayingUserAudio) {
      stopUserAudio();
      return;
    }

    if (isPlaying) {
      pausePlayback();
    }
    stopNativeSpeech();

    userAudioPlayer = new Audio(recordedAudioUrl);
    isPlayingUserAudio = true;
    updateUserAudioBtnState();
    setVoiceFeedback('🎧 Đang phát giọng bạn vừa thu...', 'playing');

    userAudioPlayer.onended = () => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateUserAudioBtnState();
      setVoiceFeedback('✅ Đã phát xong giọng bạn! Bấm <b>🔊 Mẫu chuẩn</b> để đối chiếu.', 'ready');
      if (typeof onEndedCallback === 'function') onEndedCallback();
    };

    userAudioPlayer.onerror = () => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateUserAudioBtnState();
      setVoiceFeedback('⚠️ Lỗi khi phát bản thu âm.', 'error');
    };

    userAudioPlayer.play().catch(() => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateUserAudioBtnState();
    });
  }

  function stopUserAudio() {
    if (userAudioPlayer) {
      userAudioPlayer.pause();
      userAudioPlayer = null;
    }
    isPlayingUserAudio = false;
    updateUserAudioBtnState();
  }

  function updateUserAudioBtnState() {
    const replayBtn = document.getElementById('immersionPlayUserBtn');
    const replayLabel = document.getElementById('immersionPlayUserLabel');
    if (!replayBtn) return;

    if (isPlayingUserAudio) {
      replayBtn.classList.add('is-playing-user');
      if (replayLabel) replayLabel.textContent = 'Dừng';
    } else {
      replayBtn.classList.remove('is-playing-user');
      if (replayLabel) replayLabel.textContent = 'Nghe lại';
    }
  }

  function playNativeSample(onEndedCallback) {
    if (!currentPlaylist.length) return;
    const item = currentPlaylist[currentIndex];
    if (!item || !item.zh) return;

    if (isPlaying) pausePlayback();
    stopUserAudio();
    stopNativeSpeech();

    const sampleBtn = document.getElementById('immersionNativeSampleBtn');
    if (sampleBtn) sampleBtn.classList.add('is-playing-sample');
    isPlayingSample = true;
    setVoiceFeedback(`🔊 Đang đọc mẫu chuẩn: "${item.zh}"`, 'playing');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.zh);
      u.lang = 'zh-CN';
      u.rate = playbackRate;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) u.voice = zhVoice;

      u.onend = () => {
        isPlayingSample = false;
        if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
        if (!isComparing) {
          setVoiceFeedback('Bấm <b>🎙️ Thu âm</b> để luyện phát âm theo câu này', 'ready');
        }
        if (typeof onEndedCallback === 'function') onEndedCallback();
      };

      u.onerror = () => {
        isPlayingSample = false;
        if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
        if (typeof onEndedCallback === 'function') onEndedCallback();
      };

      window.speechSynthesis.speak(u);
    } else {
      isPlayingSample = false;
      if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
      if (typeof onEndedCallback === 'function') onEndedCallback();
    }
  }

  function stopNativeSpeech() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    isPlayingSample = false;
    const sampleBtn = document.getElementById('immersionNativeSampleBtn');
    if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
  }

  function compareAudio() {
    if (!recordedAudioUrl) return;

    const compareBtn = document.getElementById('immersionCompareBtn');
    if (compareBtn) compareBtn.classList.add('is-comparing');
    isComparing = true;

    setVoiceFeedback('1️⃣ Đang nghe giọng mẫu chuẩn...', 'playing');
    playNativeSample(() => {
      setVoiceFeedback('2️⃣ Đang chuyển sang giọng của bạn...', 'playing');
      setTimeout(() => {
        playUserAudio(() => {
          isComparing = false;
          if (compareBtn) compareBtn.classList.remove('is-comparing');
          setVoiceFeedback('✨ So sánh hoàn tất! Hãy nghe lại để chỉnh ngữ điệu.', 'success');
        });
      }, 500);
    });
  }

  function startSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      speechRecognizer = new SpeechRecognition();
      speechRecognizer.lang = 'zh-CN';
      speechRecognizer.interimResults = false;
      speechRecognizer.maxAlternatives = 1;

      speechRecognizer.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          recognizedText = (event.results[0][0].transcript || '').trim();
          if (!isRecording) {
            evaluatePronunciation(recognizedText);
          }
        }
      };

      speechRecognizer.onerror = () => {
        // Lỗi mic hoặc nhận diện không ảnh hưởng đến luồng thu âm
      };

      speechRecognizer.start();
    } catch (e) {
      // Bỏ qua lỗi Speech Recognition
    }
  }

  function evaluatePronunciation(userTranscript) {
    if (!currentPlaylist.length) return;
    const item = currentPlaylist[currentIndex];
    if (!item || !item.zh || !userTranscript) return;

    const clean = str => str.replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
    const targetClean = clean(item.zh);
    const userClean = clean(userTranscript);

    if (!userClean) return;

    if (targetClean === userClean) {
      setVoiceFeedback(`🎉 Chuẩn xác 100%! Nhận diện: <b>"${userTranscript}"</b>`, 'success');
    } else if (targetClean.includes(userClean) || userClean.includes(targetClean)) {
      setVoiceFeedback(`👍 Rất tốt! Nhận diện: <b>"${userTranscript}"</b> (Khớp ngữ điệu)`, 'success');
    } else {
      let matchCount = 0;
      for (const char of userClean) {
        if (targetClean.includes(char)) matchCount++;
      }
      const ratio = Math.round((matchCount / Math.max(targetClean.length, 1)) * 100);
      if (ratio >= 50) {
        setVoiceFeedback(`👍 Gần chuẩn (${ratio}%)! Bạn đọc: <b>"${userTranscript}"</b>`, 'info');
      } else {
        setVoiceFeedback(`🗣️ Nhận diện: <b>"${userTranscript}"</b>. Bấm <b>⚖️ So sánh</b> để chỉnh phát âm nhé!`, 'info');
      }
    }
  }

  function resetVoiceRecording() {
    stopRecording();
    stopUserAudio();
    stopNativeSpeech();

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      recordedAudioUrl = null;
    }
    recordedChunks = [];
    recognizedText = '';
    isComparing = false;

    const replayBtn = document.getElementById('immersionPlayUserBtn');
    const compareBtn = document.getElementById('immersionCompareBtn');
    if (replayBtn) {
      replayBtn.disabled = true;
      replayBtn.classList.remove('is-playing-user');
      const label = document.getElementById('immersionPlayUserLabel');
      if (label) label.textContent = 'Nghe lại';
    }
    if (compareBtn) {
      compareBtn.disabled = true;
      compareBtn.classList.remove('is-comparing');
    }

    updateRecordUI();
    setVoiceFeedback('Bấm <b>Thu âm</b> để luyện nói theo câu này', 'idle');
  }

  function setVoiceFeedback(msg, type = 'idle') {
    const iconEl = document.getElementById('immersionFeedbackIcon');
    const textEl = document.getElementById('immersionFeedbackText');
    const boxEl = document.getElementById('immersionVoiceFeedback');
    if (!textEl || !boxEl) return;

    let icon = '💡';
    if (type === 'recording') icon = '🔴';
    else if (type === 'playing') icon = '🎵';
    else if (type === 'success') icon = '🎉';
    else if (type === 'error') icon = '⚠️';
    else if (type === 'info') icon = '🗣️';
    else if (type === 'ready') icon = '✅';

    if (iconEl) iconEl.textContent = icon;
    textEl.innerHTML = msg;
    boxEl.dataset.type = type;
  }

  // ==========================================
  // PLAYLIST & DATA LOADING
  // ==========================================

  async function loadLevelData(levelKey) {
    let fileName = '';
    if (levelKey === 'hsk1') fileName = 'hsk1-textbook-dialogues.json';
    else if (levelKey === 'hsk2') fileName = 'hsk2-textbook-dialogues.json';
    else if (levelKey === 'hsk3') fileName = 'hsk3-lessons.json';

    try {
      if (!loadedLevelData[levelKey]) {
        const res = await fetch(fileName);
        if (res.ok) {
          loadedLevelData[levelKey] = await res.json();
        }
      }
      populateLessons(loadedLevelData[levelKey]);
    } catch (e) {
      // Fallback
      populateLessons(null);
    }
  }

  function populateLessons(data) {
    const lsnSelect = document.getElementById('immersionLessonSelect');
    if (!lsnSelect) return;
    lsnSelect.innerHTML = '<option value="all">Toàn bộ câu mẫu</option>';

    if (data && data.lessons && Array.isArray(data.lessons)) {
      data.lessons.forEach(l => {
        const opt = document.createElement('option');
        opt.value = String(l.number);
        opt.textContent = `Bài ${l.number}: ${l.titleZh || ''} (${l.titleVi || ''})`;
        lsnSelect.appendChild(opt);
      });
    }

    filterPlaylistByLesson('all');
  }

  function filterPlaylistByLesson(lessonNum) {
    const levelKey = document.getElementById('immersionLevelSelect').value;
    const data = loadedLevelData[levelKey];

    if (!data || !data.lessons) {
      currentPlaylist = [...DEFAULT_PLAYLIST];
    } else {
      let lines = [];
      const lessons = lessonNum === 'all' 
        ? data.lessons 
        : data.lessons.filter(l => String(l.number) === String(lessonNum));

      lessons.forEach(l => {
        if (l.texts && Array.isArray(l.texts)) {
          l.texts.forEach(t => {
            if (t.lines && Array.isArray(t.lines)) {
              t.lines.forEach(line => {
                if (line.zh) {
                  lines.push({
                    zh: line.zh.trim(),
                    py: line.py ? line.py.trim() : '',
                    vi: line.vi ? line.vi.trim() : ''
                  });
                }
              });
            }
          });
        }
      });

      currentPlaylist = lines.length ? lines : [...DEFAULT_PLAYLIST];
    }

    currentIndex = 0;
    renderCurrentSentence();
  }

  function renderCurrentSentence() {
    if (!currentPlaylist.length) return;
    const item = currentPlaylist[currentIndex];
    const hanziEl = document.getElementById('immersionHanzi');
    const pinyinEl = document.getElementById('immersionPinyin');
    const meaningEl = document.getElementById('immersionMeaning');
    const progressEl = document.getElementById('immersionProgressText');

    if (hanziEl) hanziEl.textContent = item.zh || '';
    if (pinyinEl) pinyinEl.textContent = item.py || '';
    if (meaningEl) meaningEl.textContent = item.vi || '';
    if (progressEl) progressEl.textContent = `${currentIndex + 1} / ${currentPlaylist.length}`;
  }

  function startPlayback() {
    isPlaying = true;
    updateUIState();
    playCurrentSentence();
  }

  function pausePlayback() {
    isPlaying = false;
    clearTimeout(pauseTimer);
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    updateUIState();
  }

  function stopPlayback() {
    pausePlayback();
    currentIndex = 0;
    renderCurrentSentence();
  }

  function updateUIState() {
    const playBtn = document.getElementById('immersionPlayBtn');
    if (playBtn) playBtn.innerHTML = isPlaying ? '⏸' : '▶';

    if (triggerEl) {
      if (isPlaying) {
        triggerEl.classList.add('playing');
        document.getElementById('immersionTriggerLabel').textContent = 'Đang phát hội thoại...';
      } else {
        triggerEl.classList.remove('playing');
        document.getElementById('immersionTriggerLabel').textContent = '🎧 Luyện nghe thụ động';
      }
    }
  }

  function playCurrentSentence() {
    if (!isPlaying || !currentPlaylist.length) return;
    clearTimeout(pauseTimer);

    const item = currentPlaylist[currentIndex];
    renderCurrentSentence();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.zh);
      u.lang = 'zh-CN';
      u.rate = playbackRate;

      // Ưu tiên voice chuẩn tiếng Trung
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) u.voice = zhVoice;

      u.onend = () => {
        if (!isPlaying) return;
        // Tạm dừng 1.6 giây giữa các câu để người học ngẫm và nhại theo
        pauseTimer = setTimeout(() => {
          advanceToNext();
        }, 1600);
      };

      u.onerror = () => {
        if (!isPlaying) return;
        pauseTimer = setTimeout(() => {
          advanceToNext();
        }, 2000);
      };

      window.speechSynthesis.speak(u);
    } else {
      // Fallback
      pauseTimer = setTimeout(() => {
        advanceToNext();
      }, 3000);
    }
  }

  function advanceToNext() {
    if (!isPlaying) return;

    if (repeatMode === 'loop-one') {
      playCurrentSentence();
    } else if (repeatMode === 'loop-all') {
      currentIndex = (currentIndex + 1) % currentPlaylist.length;
      resetVoiceRecording();
      playCurrentSentence();
    } else if (repeatMode === 'continuous') {
      if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        resetVoiceRecording();
        playCurrentSentence();
      } else {
        const lsnSelect = document.getElementById('immersionLessonSelect');
        if (lsnSelect && lsnSelect.selectedIndex < lsnSelect.options.length - 1) {
          lsnSelect.selectedIndex++;
          resetVoiceRecording();
          filterPlaylistByLesson(lsnSelect.value);
          startPlayback();
        } else {
          stopPlayback();
        }
      }
    }
  }

  function prevSentence() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = currentPlaylist.length - 1;
    }
    resetVoiceRecording();
    renderCurrentSentence();
    if (isPlaying) playCurrentSentence();
  }

  function nextSentence() {
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    resetVoiceRecording();
    renderCurrentSentence();
    if (isPlaying) playCurrentSentence();
  }

  function toggleCard() {
    initPlayerDOM();
    if (cardEl.classList.contains('hidden') || cardEl.hasAttribute('hidden')) {
      showCard();
    } else {
      hideCard();
    }
  }

  function showCard() {
    initPlayerDOM();
    cardEl.removeAttribute('hidden');
    cardEl.classList.remove('hidden');
    cardEl.style.display = 'flex';
  }

  function hideCard() {
    if (!cardEl) return;
    cardEl.setAttribute('hidden', '');
    cardEl.classList.add('hidden');
    cardEl.style.display = 'none';
  }

  // Tự khởi tạo khi trang load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayerDOM);
  } else {
    initPlayerDOM();
  }

  window.HSKImmersionPlayer = {
    show: showCard,
    hide: hideCard,
    toggle: toggleCard,
    play: startPlayback,
    pause: pausePlayback,
    record: toggleRecording,
    playUser: playUserAudio,
    playSample: playNativeSample,
    compare: compareAudio
  };
})();
