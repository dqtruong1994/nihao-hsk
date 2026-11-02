/**
 * AI Speech Recognition & Pronunciation Shadowing Trainer
 * Tích hợp Thu âm giọng nói (MediaRecorder), Nghe lại giọng bạn, So sánh mẫu chuẩn & Chấm điểm AI
 * Nạp toàn bộ kho dữ liệu hàng trăm câu hội thoại giáo trình chuẩn HSK 1, HSK 2, HSK 3 (tương đương Máy Nghe Thụ Động)
 */
(() => {
  'use strict';

  // Dữ liệu câu mẫu mặc định (dùng khi chưa tải xong hoặc offline)
  const DEFAULT_SPEECH_BANK = {
    hsk1: [
      { hanzi: '你好，很高兴认识你。', pinyin: 'Nǐ hǎo, hěn gāoxìng rènshi nǐ.', vi: 'Xin chào, rất vui được quen biết bạn.' },
      { hanzi: '我是越南人，我在学汉语。', pinyin: 'Wǒ shì Yuènán rén, wǒ zài xué hànyǔ.', vi: 'Tôi là người Việt Nam, tôi đang học tiếng Trung.' },
      { hanzi: '今天天气很好，不太冷。', pinyin: 'Jīntiān tiānqì hěn hǎo, bú tài lěng.', vi: 'Hôm nay thời tiết rất đẹp, không quá lạnh.' },
      { hanzi: '你想喝茶还是喝咖啡？', pinyin: 'Nǐ xiǎng hē chá háishì hē kāfēi?', vi: 'Bạn muốn uống trà hay uống cà phê?' },
      { hanzi: '明天下午三点见。', pinyin: 'Míngtiān xiàwǔ sān diǎn jiàn.', vi: 'Chiều mai 3 giờ gặp nhau nhé.' },
      { hanzi: '这个苹果多少钱一斤？', pinyin: 'Zhège píngguǒ duōshao qián yì jīn?', vi: 'Quả táo này bao nhiêu tiền một cân?' },
      { hanzi: '请问，图书馆在哪儿？', pinyin: 'Qǐngwèn, túshūguǎn zài nǎr?', vi: 'Xin hỏi, thư viện ở đâu ạ?' }
    ],
    hsk2: [
      { hanzi: '我每天早上六点起床跑步。', pinyin: 'Wǒ měitiān zǎoshang liù diǎn qǐchuáng pǎobù.', vi: 'Ngày nào tôi cũng dậy lúc 6 giờ sáng để chạy bộ.' },
      { hanzi: '从这儿一直往前走就是地铁站。', pinyin: 'Cóng zhèr yìzhí wǎng qián zǒu jiù shì dìtiě zhàn.', vi: 'Từ đây cứ đi thẳng là đến ga tàu điện ngầm.' },
      { hanzi: '虽然这次考试很难，但是他考得不错。', pinyin: 'Suīrán zhè cì kǎoshì hěn nán, dànshì tā kǎo de búcuò.', vi: 'Tuy kỳ thi lần này khó, nhưng anh ấy thi khá tốt.' },
      { hanzi: '因为今天下大雨，所以我们不去了。', pinyin: 'Yīnwèi jīntiān xià dàyǔ, suǒyǐ wǒmen bú qù le.', vi: 'Vì hôm nay trời mưa to, nên chúng tôi không đi nữa.' },
      { hanzi: '我已经去过北京两次了。', pinyin: 'Wǒ yǐjīng qùguo Běijīng liǎng cì le.', vi: 'Tôi đã từng đến Bắc Kinh hai lần rồi.' },
      { hanzi: '我觉得这件衣服比那件漂亮。', pinyin: 'Wǒ juéde zhè jiàn yīfu bǐ nà jiàn piàoliang.', vi: 'Tôi thấy chiếc áo này đẹp hơn chiếc kia.' }
    ],
    hsk3: [
      { hanzi: '周末你有什么打算？', pinyin: 'Zhōumò nǐ yǒu shénme dǎsuàn?', vi: 'Anh dự định làm gì vào cuối tuần vậy?' },
      { hanzi: '经理，这份文件我已经修改完成了。', pinyin: 'Jīnglǐ, zhè fèn wénjiàn wǒ yǐjīng xiūgǎi wánchéng le.', vi: 'Thưa giám đốc, tài liệu này tôi đã sửa xong rồi.' },
      { hanzi: '遇到困难时不要放弃，一定会有解决的办法。', pinyin: 'Yù dào kùnnan shí bú yào fàngqì, yídìng huì yǒu jiějué de bànfǎ.', vi: 'Khi gặp khó khăn đừng bỏ cuộc, nhất định sẽ có cách giải quyết.' },
      { hanzi: '为了提高汉语水平，我每天坚持看中文新闻。', pinyin: 'Wèile tígāo hànyǔ shuǐpíng, wǒ měitiān jiānchí kàn zhōngwén xīnwén.', vi: 'Để nâng cao trình độ tiếng Trung, mỗi ngày tôi đều kiên trì xem tin tức tiếng Trung.' },
      { hanzi: '请大家把手机调成静音模式，会议马上开始。', pinyin: 'Qǐng dàjiā bǎ shǒujī tiáochéng jìngyīn móshì, huìyì mǎshàng kāishǐ.', vi: 'Xin mọi người hãy để điện thoại chế độ im lặng, cuộc họp sắp bắt đầu.' },
      { hanzi: '这里的环境非常优美，空气也很新鲜。', pinyin: 'Zhèlǐ de huánjìng fēicháng yōuměi, kōngqì yě hěn xīnxian.', vi: 'Môi trường ở đây rất đẹp, không khí cũng rất trong lành.' }
    ]
  };

  let currentLevel = 'hsk1';
  let currentIndex = 0;
  let currentLessonFilter = 'all';
  let currentPlaylist = [...DEFAULT_SPEECH_BANK.hsk1];
  let loadedDialoguesData = {}; // Cache dữ liệu các file json

  // Voice Shadowing & MediaRecorder State
  let mediaRecorder = null;
  let audioStream = null;
  let recordedChunks = [];
  let recordedAudioUrl = null;
  let userAudioPlayer = null;
  let isRecording = false;
  let isPlayingUserAudio = false;
  let isPlayingSampleAudio = false;
  let isComparing = false;
  let recordTimer = null;
  let recordSeconds = 0;

  // Speech Recognition State
  let recognition = null;
  let recognizedText = '';

  // Khởi tạo SpeechRecognition cho tiếng Trung
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'zh-CN';

    r.onstart = () => {
      // Speech recognition đã bắt đầu
    };

    r.onresult = event => {
      if (event.results && event.results[0] && event.results[0][0]) {
        recognizedText = event.results[0][0].transcript || '';
        evaluateSpeech(recognizedText);
      }
    };

    r.onerror = event => {
      // Lỗi nhận diện không ngăn cản việc thu âm file audio
    };

    r.onend = () => {
      // Khi recognition kết thúc
    };

    return r;
  }

  // Thuật toán so khớp chữ Hán và tính điểm
  function cleanZh(str) {
    return (str || '').replace(/[，。！？、；：“”‘’（）【】《》\s\p{P}\p{S}]/gu, '').trim();
  }

  function evaluateSpeech(spokenText) {
    if (!currentPlaylist || !currentPlaylist.length) return;
    const target = currentPlaylist[currentIndex];
    const cleanTarget = cleanZh(target.hanzi);
    const cleanSpoken = cleanZh(spokenText);

    if (!cleanTarget) return;

    let matchedCount = 0;
    const targetChars = cleanTarget.split('');
    const spokenChars = cleanSpoken.split('');

    // Đánh giá từng ký tự
    const markup = targetChars.map((char) => {
      if (spokenChars.includes(char)) {
        matchedCount++;
        return `<span class="speech-char-match">${char}</span>`;
      } else {
        return `<span class="speech-char-miss">${char}</span>`;
      }
    }).join('');

    const score = Math.min(100, Math.round((matchedCount / targetChars.length) * 100));

    // Hiển thị kết quả đánh giá
    const evalCard = document.getElementById('speechEvalCard');
    if (evalCard) {
      evalCard.hidden = false;

      let scoreClass = 'speech-score-low';
      let feedback = '🎧 Cần luyện tập thêm. Hãy bấm <b>🎧 Nghe lại giọng bạn</b> hoặc <b>⚖️ So sánh</b> để chỉnh thanh điệu nhé!';
      if (score >= 85) {
        scoreClass = 'speech-score-high';
        feedback = '🌟 Xuất sắc! Phát âm rất tự nhiên và chuẩn xác!';
        window.Gamification?.playSuccessSound();
        window.Gamification?.confetti();
      } else if (score >= 65) {
        scoreClass = 'speech-score-mid';
        feedback = '👍 Khá tốt! Bạn đã phát âm chuẩn phần lớn câu. Hãy nghe lại để hoàn thiện hơn!';
      }

      evalCard.innerHTML = `
        <div class="speech-eval-header">
          <strong>Kết quả phân tích giọng nói:</strong>
          <span class="speech-score-badge ${scoreClass}">${score}% Chuẩn xác</span>
        </div>
        <div style="font-size:13px; color:#64748b; margin-bottom:6px;">
          Giọng bạn nhận diện được: <b style="color:#1e293b;">${spokenText || '(Chưa bắt được âm)'}</b>
        </div>
        <div class="speech-transcript-box">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Đối chiếu từng chữ: (Xanh: chuẩn • Đỏ: cần sửa)</div>
          <div style="font-size:24px; font-family:STKaiti,KaiTi,serif; letter-spacing:2px;">${markup}</div>
        </div>
        <div class="speech-feedback-text">${feedback}</div>
      `;

      // Thưởng XP và cập nhật Quest nếu đạt >= 75%
      if (score >= 75) {
        window.Gamification?.addXP(15, 'Luyện nói phát âm đạt chuẩn');
        window.Gamification?.updateQuestProgress('speech', 1);
      }
    }

    const status = document.getElementById('speechStatusText');
    if (status && !isRecording) {
      status.innerHTML = '✅ Đã hoàn thành lượt nói! Bấm <b>🎧 Nghe lại</b> hoặc <b>⚖️ So sánh</b> để đối chiếu.';
    }
  }

  // ==========================================
  // THU ÂM & PHÁT LẠI GIỌNG HỌC VIÊN (MEDIA RECORDER)
  // ==========================================

  function toggleRecording() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  async function startRecording() {
    // Dừng phát âm nếu đang phát
    stopUserAudio();
    stopSampleAudio();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Trình duyệt của bạn chưa hỗ trợ thu âm Microphone. Vui lòng sử dụng Google Chrome hoặc Edge.');
      return;
    }

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const status = document.getElementById('speechStatusText');
      if (status) status.innerHTML = '<span style="color:#ef4444;">⚠️ Không thể truy cập Mic. Hãy cho phép quyền truy cập Microphone trên trình duyệt.</span>';
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

    mediaRecorder.ondataavailable = e => {
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
        const blob = new Blob(recordedChunks, { type: mimeType });
        recordedAudioUrl = URL.createObjectURL(blob);

        // Kích hoạt các nút nghe lại và so sánh
        updateAudioButtonsState();

        if (recognizedText) {
          evaluateSpeech(recognizedText);
        } else {
          const status = document.getElementById('speechStatusText');
          if (status) status.innerHTML = '✅ Đã ghi âm xong! Bấm <b>🎧 Nghe lại</b> để nghe giọng bạn vừa nói.';
        }
      }
    };

    mediaRecorder.start();
    isRecording = true;
    recordSeconds = 0;
    updateMicButtonUI();

    // Bắt đầu đếm giây (tối đa 15 giây cho 1 câu nói)
    clearInterval(recordTimer);
    recordTimer = setInterval(() => {
      recordSeconds++;
      updateMicButtonUI();
      if (recordSeconds >= 15) {
        stopRecording();
      }
    }, 1000);

    const status = document.getElementById('speechStatusText');
    if (status) status.innerHTML = '<span style="color:#ef4444; font-weight:700;">🔴 Đang thu âm giọng bạn...</span> Hãy đọc to và rõ ràng câu tiếng Trung ở trên!';

    // Khởi động AI speech recognition nhận diện song song
    if (!recognition) recognition = initRecognition();
    if (recognition) {
      try {
        recognition.start();
      } catch (e) {
        try { recognition.stop(); } catch {}
      }
    }
  }

  function stopRecording() {
    if (!isRecording) return;
    isRecording = false;
    clearInterval(recordTimer);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch (e) {}
    }

    if (audioStream) {
      audioStream.getTracks().forEach(t => t.stop());
      audioStream = null;
    }

    if (recognition) {
      try { recognition.stop(); } catch (e) {}
    }

    updateMicButtonUI();
  }

  function updateMicButtonUI() {
    const micBtn = document.getElementById('speechMicBtn');
    if (!micBtn) return;

    if (isRecording) {
      micBtn.classList.add('recording');
      micBtn.innerHTML = `<span>⏹</span><small style="font-size:11px; display:block; margin-top:2px;">${recordSeconds}s</small>`;
      micBtn.title = 'Bấm để dừng thu âm';
    } else {
      micBtn.classList.remove('recording');
      micBtn.innerHTML = `🎙️`;
      micBtn.title = recordedAudioUrl ? 'Bấm để thu âm lại' : 'Bấm để nói';
    }
  }

  // Phát lại âm thanh giọng người dùng vừa thu
  function playUserAudio(onEndedCallback) {
    if (!recordedAudioUrl) return;

    if (isPlayingUserAudio) {
      stopUserAudio();
      return;
    }

    stopSampleAudio();

    userAudioPlayer = new Audio(recordedAudioUrl);
    isPlayingUserAudio = true;
    updateAudioButtonsState();

    const status = document.getElementById('speechStatusText');
    if (status) status.innerHTML = '🎧 <b>Đang phát giọng bạn vừa thu âm...</b>';

    userAudioPlayer.onended = () => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateAudioButtonsState();
      if (status) status.innerHTML = '✅ Đã phát xong! Bạn có thể bấm <b>🔊 Nghe mẫu</b> để đối chiếu thanh điệu.';
      if (typeof onEndedCallback === 'function') onEndedCallback();
    };

    userAudioPlayer.onerror = () => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateAudioButtonsState();
      if (typeof onEndedCallback === 'function') onEndedCallback();
    };

    userAudioPlayer.play().catch(() => {
      isPlayingUserAudio = false;
      userAudioPlayer = null;
      updateAudioButtonsState();
    });
  }

  function stopUserAudio() {
    if (userAudioPlayer) {
      try { userAudioPlayer.pause(); } catch (e) {}
      userAudioPlayer = null;
    }
    isPlayingUserAudio = false;
    updateAudioButtonsState();
  }

  // Phát âm câu mẫu chuẩn bản ngữ
  function playSampleAudio(onEndedCallback) {
    if (!currentPlaylist || !currentPlaylist.length) return;
    const target = currentPlaylist[currentIndex];
    if (!target || !target.hanzi) return;

    stopUserAudio();
    stopSampleAudio();

    const sampleBtn = document.getElementById('speechSampleBtn');
    if (sampleBtn) sampleBtn.classList.add('is-playing-sample');
    isPlayingSampleAudio = true;

    const status = document.getElementById('speechStatusText');
    if (status) status.innerHTML = `🔊 <b>Đang đọc mẫu chuẩn bản ngữ:</b> "${target.hanzi}"`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(target.hanzi);
      u.lang = 'zh-CN';
      u.rate = 0.85;

      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      if (zhVoice) u.voice = zhVoice;

      u.onend = () => {
        isPlayingSampleAudio = false;
        if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
        if (!isComparing && status) {
          status.innerHTML = 'Bấm nút micro màu đỏ <b>🎙️</b> rồi nói to câu tiếng Trung ở trên.';
        }
        if (typeof onEndedCallback === 'function') onEndedCallback();
      };

      u.onerror = () => {
        isPlayingSampleAudio = false;
        if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
        if (typeof onEndedCallback === 'function') onEndedCallback();
      };

      window.speechSynthesis.speak(u);
    } else if (window.HSKAudio) {
      window.HSKAudio.speak(target.hanzi);
      setTimeout(() => {
        isPlayingSampleAudio = false;
        if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
        if (typeof onEndedCallback === 'function') onEndedCallback();
      }, 2500);
    } else {
      isPlayingSampleAudio = false;
      if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
      if (typeof onEndedCallback === 'function') onEndedCallback();
    }
  }

  function stopSampleAudio() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    isPlayingSampleAudio = false;
    const sampleBtn = document.getElementById('speechSampleBtn');
    if (sampleBtn) sampleBtn.classList.remove('is-playing-sample');
  }

  // So sánh: Phát câu mẫu trước, sau đó phát ngay giọng thu của học viên
  function compareAudio() {
    if (!recordedAudioUrl) return;

    const compareBtn = document.getElementById('speechCompareBtn');
    if (compareBtn) compareBtn.classList.add('is-comparing');
    isComparing = true;

    const status = document.getElementById('speechStatusText');
    if (status) status.innerHTML = '1️⃣ <b>Đang nghe giọng đọc mẫu chuẩn...</b>';

    playSampleAudio(() => {
      if (status) status.innerHTML = '2️⃣ <b>Tiếp theo: Đang phát lại giọng của bạn...</b>';
      setTimeout(() => {
        playUserAudio(() => {
          isComparing = false;
          if (compareBtn) compareBtn.classList.remove('is-comparing');
          if (status) status.innerHTML = '✨ <b>So sánh hoàn tất!</b> Hãy lắng nghe sự khác biệt về thanh điệu và ngữ điệu.';
        });
      }, 400);
    });
  }

  function updateAudioButtonsState() {
    const playUserBtn = document.getElementById('speechPlayUserBtn');
    const compareBtn = document.getElementById('speechCompareBtn');
    const sampleBtn = document.getElementById('speechSampleBtn');

    if (playUserBtn) {
      playUserBtn.disabled = !recordedAudioUrl;
      playUserBtn.classList.toggle('is-playing-user', isPlayingUserAudio);
      playUserBtn.innerHTML = isPlayingUserAudio ? '⏹ Dừng' : '🎧 Nghe lại';
    }

    if (compareBtn) {
      compareBtn.disabled = !recordedAudioUrl;
      compareBtn.classList.toggle('is-comparing', isComparing);
    }

    if (sampleBtn) {
      sampleBtn.classList.toggle('is-playing-sample', isPlayingSampleAudio);
    }
  }

  function resetRecordingState() {
    stopRecording();
    stopUserAudio();
    stopSampleAudio();

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      recordedAudioUrl = null;
    }
    recordedChunks = [];
    recognizedText = '';
    isComparing = false;

    updateAudioButtonsState();
    updateMicButtonUI();

    const evalCard = document.getElementById('speechEvalCard');
    if (evalCard) evalCard.hidden = true;

    const status = document.getElementById('speechStatusText');
    if (status) status.innerHTML = 'Bấm nút micro màu đỏ <b>🎙️</b> rồi nói to câu tiếng Trung ở trên.';
  }

  // ==========================================
  // DỮ LIỆU CÂU MẪU TỪ HỘI THOẠI GIÁO TRÌNH (IMMERSION DATA)
  // ==========================================

  async function loadDialoguesForLevel(levelKey) {
    let fileName = '';
    if (levelKey === 'hsk1') fileName = 'hsk1-textbook-dialogues.json';
    else if (levelKey === 'hsk2') fileName = 'hsk2-textbook-dialogues.json';
    else if (levelKey === 'hsk3') fileName = 'hsk3-textbook-dialogues.json';

    try {
      if (!loadedDialoguesData[levelKey]) {
        const res = await fetch(fileName);
        if (res.ok) {
          loadedDialoguesData[levelKey] = await res.json();
        }
      }
      populateLessonDropdown(loadedDialoguesData[levelKey]);
    } catch (e) {
      populateLessonDropdown(null);
    }
  }

  function populateLessonDropdown(data) {
    const lsnSelect = document.getElementById('speechLessonSelect');
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

    filterPlaylist(currentLessonFilter || 'all');
  }

  function filterPlaylist(lessonNum) {
    currentLessonFilter = lessonNum;
    const data = loadedDialoguesData[currentLevel];

    if (!data || !data.lessons) {
      currentPlaylist = [...(DEFAULT_SPEECH_BANK[currentLevel] || DEFAULT_SPEECH_BANK.hsk1)];
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
                if (line.zh && line.zh.trim()) {
                  lines.push({
                    hanzi: line.zh.trim(),
                    pinyin: line.py ? line.py.trim() : '',
                    vi: line.vi ? line.vi.trim() : '',
                    lessonNum: l.number,
                    lessonTitle: l.titleZh || ''
                  });
                }
              });
            }
          });
        }
      });

      currentPlaylist = lines.length ? lines : [...(DEFAULT_SPEECH_BANK[currentLevel] || DEFAULT_SPEECH_BANK.hsk1)];
    }

    currentIndex = 0;
    renderCurrentSentence();
  }

  function setLevel(lvl) {
    currentLevel = lvl;
    currentIndex = 0;
    currentLessonFilter = 'all';
    resetRecordingState();

    document.querySelectorAll('.speech-lvl-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === lvl);
    });

    loadDialoguesForLevel(lvl);
  }

  function nextSentence() {
    if (!currentPlaylist.length) return;
    resetRecordingState();
    currentIndex = (currentIndex + 1) % currentPlaylist.length;
    renderCurrentSentence();
  }

  function prevSentence() {
    if (!currentPlaylist.length) return;
    resetRecordingState();
    currentIndex = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    renderCurrentSentence();
  }

  function randomSentence() {
    if (!currentPlaylist.length) return;
    resetRecordingState();
    if (currentPlaylist.length > 1) {
      let nextIdx = currentIndex;
      while (nextIdx === currentIndex) {
        nextIdx = Math.floor(Math.random() * currentPlaylist.length);
      }
      currentIndex = nextIdx;
    }
    renderCurrentSentence();
  }

  function renderCurrentSentence() {
    if (!currentPlaylist.length) return;
    const target = currentPlaylist[currentIndex];
    const total = currentPlaylist.length;

    const hanziEl = document.getElementById('speechTargetHanzi');
    const pinyinEl = document.getElementById('speechTargetPinyin');
    const viEl = document.getElementById('speechTargetVi');
    const numEl = document.getElementById('speechSentenceNum');
    const lessonBadge = document.getElementById('speechLessonBadge');

    if (hanziEl) hanziEl.textContent = target.hanzi || '';
    if (pinyinEl) pinyinEl.textContent = target.pinyin || '';
    if (viEl) viEl.textContent = target.vi || '';
    if (numEl) numEl.textContent = `Câu ${currentIndex + 1} / ${total}`;

    if (lessonBadge) {
      if (target.lessonNum) {
        lessonBadge.textContent = `Bài ${target.lessonNum}`;
        lessonBadge.hidden = false;
      } else {
        lessonBadge.hidden = true;
      }
    }

    updateAudioButtonsState();
  }

  // ==========================================
  // GIAO DIỆN MODAL PHÒNG LUYỆN NÓI
  // ==========================================

  function openSpeechModal(initialLevel = 'hsk1') {
    const existing = document.getElementById('hskSpeechModal');
    if (existing) existing.remove();

    currentLevel = ['hsk1', 'hsk2', 'hsk3'].includes(initialLevel) ? initialLevel : 'hsk1';
    currentIndex = 0;
    currentLessonFilter = 'all';

    const overlay = document.createElement('div');
    overlay.id = 'hskSpeechModal';
    overlay.className = 'speech-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeSpeechModal(); };

    overlay.innerHTML = `
      <div class="speech-modal-card">
        <header class="speech-modal-header">
          <h2>
            <span>🎙️</span>
            <span>Phòng Luyện Nói & Chấm Điểm Phát Âm AI</span>
          </h2>
          <button type="button" class="rank-modal-close" onclick="window.HSKSpeechTrainer.close()" title="Đóng cửa sổ">✕</button>
        </header>

        <!-- Thanh chọn cấp độ và chọn bài học -->
        <div class="speech-level-selector">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk1' ? 'active' : ''}" data-level="hsk1" onclick="window.HSKSpeechTrainer.setLevel('hsk1')">HSK 1</button>
            <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk2' ? 'active' : ''}" data-level="hsk2" onclick="window.HSKSpeechTrainer.setLevel('hsk2')">HSK 2</button>
            <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk3' ? 'active' : ''}" data-level="hsk3" onclick="window.HSKSpeechTrainer.setLevel('hsk3')">HSK 3</button>

            <!-- Menu chọn bài học giáo trình -->
            <select id="speechLessonSelect" class="speech-lesson-select">
              <option value="all">Toàn bộ câu mẫu</option>
            </select>
          </div>

          <div style="margin-left:auto; display:flex; align-items:center; gap:10px;">
            <button type="button" class="speech-random-btn" id="speechRandomBtn" title="Chọn ngẫu nhiên 1 câu để thử thách">
              🎲 Ngẫu nhiên
            </button>
            <span id="speechSentenceNum" style="font-size:13px; font-weight:800; color:#64748b;">Câu 1 / 7</span>
          </div>
        </div>

        <div class="speech-modal-body">
          <!-- Hộp hiển thị câu mẫu chữ Hán -->
          <div class="speech-target-box">
            <span id="speechLessonBadge" class="speech-lesson-tag" hidden>Bài 1</span>
            <div id="speechTargetHanzi" class="speech-target-hanzi"></div>
            <div id="speechTargetPinyin" class="speech-target-pinyin"></div>
            <div id="speechTargetVi" class="speech-target-vi"></div>
          </div>

          <!-- Thanh nút thao tác: Nghe mẫu, Thu âm, Nghe lại giọng bạn, So sánh, Chuyển câu -->
          <div class="speech-actions">
            <button type="button" class="speech-btn-prev" onclick="window.HSKSpeechTrainer.prev()" title="Câu trước đó">
              ⏮ Câu trước
            </button>

            <button type="button" class="speech-btn-listen" id="speechSampleBtn" onclick="window.HSKSpeechTrainer.playAudio()" title="Nghe giọng đọc bản ngữ">
              🔊 Nghe mẫu
            </button>

            <button type="button" class="speech-btn-mic" id="speechMicBtn" onclick="window.HSKSpeechTrainer.toggleRecording()" title="Bấm để bắt đầu hoặc dừng thu âm">
              🎙️
            </button>

            <button type="button" class="speech-btn-user" id="speechPlayUserBtn" onclick="window.HSKSpeechTrainer.playUserAudio()" title="Nghe lại giọng bạn vừa thu âm" disabled>
              🎧 Nghe lại
            </button>

            <button type="button" class="speech-btn-compare" id="speechCompareBtn" onclick="window.HSKSpeechTrainer.compareAudio()" title="So sánh: Phát mẫu chuẩn rồi phát ngay giọng của bạn" disabled>
              ⚖️ So sánh
            </button>

            <button type="button" class="speech-btn-next" onclick="window.HSKSpeechTrainer.next()" title="Câu tiếp theo">
              Câu tiếp ⏭
            </button>
          </div>

          <div id="speechStatusText" class="speech-status-text">
            Bấm nút micro màu đỏ <b>🎙️</b> rồi nói to câu tiếng Trung ở trên.
          </div>

          <!-- Thẻ kết quả chấm điểm phát âm AI -->
          <div id="speechEvalCard" class="speech-eval-card" hidden></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Gắn sự kiện thay đổi bài học
    const lsnSelect = document.getElementById('speechLessonSelect');
    if (lsnSelect) {
      lsnSelect.onchange = () => {
        resetRecordingState();
        filterPlaylist(lsnSelect.value);
      };
    }

    const randomBtn = document.getElementById('speechRandomBtn');
    if (randomBtn) {
      randomBtn.onclick = randomSentence;
    }

    // Tải dữ liệu hội thoại từ json
    loadDialoguesForLevel(currentLevel);
  }

  function closeSpeechModal() {
    resetRecordingState();
    const modal = document.getElementById('hskSpeechModal');
    if (modal) modal.remove();
  }

  window.HSKSpeechTrainer = {
    open: openSpeechModal,
    close: closeSpeechModal,
    setLevel,
    next: nextSentence,
    prev: prevSentence,
    random: randomSentence,
    playAudio: playSampleAudio,
    playUserAudio,
    compareAudio,
    toggleRecording
  };
})();
