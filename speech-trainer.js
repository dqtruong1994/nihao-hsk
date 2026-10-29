/**
 * AI Speech Recognition & Pronunciation Shadowing Trainer
 * Sử dụng Web Speech API để thu âm giọng học viên, chấm điểm độ khớp với câu mẫu tiếng Trung
 */
(() => {
  'use strict';

  const SPEECH_BANK = {
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
      { hanzi: '经理，这份文件我已经修改完成了。', pinyin: 'Jīnglǐ, zhè fèn wénjiàn wǒ yǐjīng xiūgǎi wánchéng le.', vi: 'Thưa giám đốc, tài liệu này tôi đã sửa xong rồi.' },
      { hanzi: '遇到困难时不要放弃，一定会有解决的办法。', pinyin: 'Yù dào kùnnan shí bú yào fàngqì, yídìng huì yǒu jiějué de bànfǎ.', vi: 'Khi gặp khó khăn đừng bỏ cuộc, nhất định sẽ có cách giải quyết.' },
      { hanzi: '为了提高汉语水平，我每天坚持看中文新闻。', pinyin: 'Wèile tígāo hànyǔ shuǐpíng, wǒ měitiān jiānchí kàn zhōngwén xīnwén.', vi: 'Để nâng cao trình độ tiếng Trung, mỗi ngày tôi đều kiên trì xem tin tức tiếng Trung.' },
      { hanzi: '请大家把手机调成静音模式，会议马上开始。', pinyin: 'Qǐng dàjiā bǎ shǒujī tiáochéng jìngyīn móshì, huìyì mǎshàng kāishǐ.', vi: 'Xin mọi người hãy để điện thoại chế độ im lặng, cuộc họp sắp bắt đầu.' },
      { hanzi: '这里的环境非常优美，空气也很新鲜。', pinyin: 'Zhèlǐ de huánjìng fēicháng yōuměi, kōngqì yě hěn xīnxian.', vi: 'Môi trường ở đây rất đẹp, không khí cũng rất trong lành.' }
    ]
  };

  let currentLevel = 'hsk1';
  let currentIndex = 0;
  let recognition = null;
  let isRecording = false;

  // Khởi tạo SpeechRecognition
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'zh-CN';

    r.onstart = () => {
      isRecording = true;
      const btn = document.getElementById('speechMicBtn');
      if (btn) btn.classList.add('recording');
      const status = document.getElementById('speechStatusText');
      if (status) status.textContent = 'Đang lắng nghe giọng bạn... Hãy nói to và rõ ràng.';
    };

    r.onresult = event => {
      const transcript = event.results[0][0].transcript;
      evaluateSpeech(transcript);
    };

    r.onerror = event => {
      const status = document.getElementById('speechStatusText');
      if (status) {
        status.textContent = 'Chưa nhận diện được. Hãy bấm nút micro và thử lại nhé.';
      }
    };

    r.onend = () => {
      isRecording = false;
      const btn = document.getElementById('speechMicBtn');
      if (btn) btn.classList.remove('recording');
    };

    return r;
  }

  // Thuật toán so khớp chữ Hán và tính điểm
  function cleanZh(str) {
    return (str || '').replace(/[，。！？、；：“”‘’（）【】《》\s]/g, '').trim();
  }

  function evaluateSpeech(spokenText) {
    const target = SPEECH_BANK[currentLevel][currentIndex];
    const cleanTarget = cleanZh(target.hanzi);
    const cleanSpoken = cleanZh(spokenText);

    if (!cleanTarget) return;

    let matchedCount = 0;
    const targetChars = cleanTarget.split('');
    const spokenChars = cleanSpoken.split('');

    // Đánh giá từng ký tự
    const markup = targetChars.map((char, i) => {
      if (spokenChars.includes(char)) {
        matchedCount++;
        return `<span class="speech-char-match">${char}</span>`;
      } else {
        return `<span class="speech-char-miss">${char}</span>`;
      }
    }).join('');

    const score = Math.min(100, Math.round((matchedCount / targetChars.length) * 100));

    // Hiển thị kết quả
    const evalCard = document.getElementById('speechEvalCard');
    if (evalCard) {
      evalCard.hidden = false;

      let scoreClass = 'speech-score-low';
      let feedback = '🎧 Cần luyện tập thêm. Hãy nghe lại câu mẫu để nắm chắc thanh điệu nhé!';
      if (score >= 85) {
        scoreClass = 'speech-score-high';
        feedback = '🌟 Xuất sắc! Phát âm rất tự nhiên và chuẩn xác!';
        window.Gamification?.playSuccessSound();
        window.Gamification?.confetti();
      } else if (score >= 65) {
        scoreClass = 'speech-score-mid';
        feedback = '👍 Khá tốt! Bạn đã phát âm chuẩn phần lớn câu. Tiếp tục phát huy!';
      }

      evalCard.innerHTML = `
        <div class="speech-eval-header">
          <strong>Kết quả phân tích giọng nói:</strong>
          <span class="speech-score-badge ${scoreClass}">${score}% Chuẩn xác</span>
        </div>
        <div style="font-size:13px; color:#64748b;">Bạn đã nói: <b style="color:#1e293b;">${spokenText}</b></div>
        <div class="speech-transcript-box">
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">Đối chiếu từng chữ: (Xanh: chuẩn • Đỏ: cần sửa)</div>
          <div style="font-size:22px; font-family:STKaiti,KaiTi,serif;">${markup}</div>
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
    if (status) status.textContent = 'Hoàn thành lượt nói! Bạn có thể bấm nói lại hoặc sang câu tiếp.';
  }

  // Phát âm mẫu câu
  function playSampleAudio() {
    const target = SPEECH_BANK[currentLevel][currentIndex];
    if (window.HSKAudio) {
      window.HSKAudio.speak(target.hanzi);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(target.hanzi);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  }

  // Toggle thu âm
  function toggleRecording() {
    if (!recognition) recognition = initRecognition();

    if (!recognition) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API. Hãy sử dụng Google Chrome hoặc Microsoft Edge để trải nghiệm tính năng này tốt nhất nhé!');
      return;
    }

    if (isRecording) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch {
        recognition.stop();
      }
    }
  }

  function setLevel(lvl) {
    currentLevel = lvl;
    currentIndex = 0;
    renderCurrentSentence();

    document.querySelectorAll('.speech-lvl-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === lvl);
    });
  }

  function nextSentence() {
    const list = SPEECH_BANK[currentLevel];
    currentIndex = (currentIndex + 1) % list.length;
    renderCurrentSentence();
  }

  function renderCurrentSentence() {
    const target = SPEECH_BANK[currentLevel][currentIndex];
    const total = SPEECH_BANK[currentLevel].length;

    const hanziEl = document.getElementById('speechTargetHanzi');
    const pinyinEl = document.getElementById('speechTargetPinyin');
    const viEl = document.getElementById('speechTargetVi');
    const numEl = document.getElementById('speechSentenceNum');
    const evalCard = document.getElementById('speechEvalCard');
    const status = document.getElementById('speechStatusText');

    if (hanziEl) hanziEl.textContent = target.hanzi;
    if (pinyinEl) pinyinEl.textContent = target.pinyin;
    if (viEl) viEl.textContent = target.vi;
    if (numEl) numEl.textContent = `Câu ${currentIndex + 1} / ${total}`;
    if (evalCard) evalCard.hidden = true;
    if (status) status.textContent = 'Bấm nút micro màu đỏ rồi nói to câu tiếng Trung ở trên.';
  }

  function openSpeechModal() {
    const existing = document.getElementById('hskSpeechModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hskSpeechModal';
    overlay.className = 'speech-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeSpeechModal(); };

    overlay.innerHTML = `
      <div class="speech-modal-card">
        <header class="speech-modal-header">
          <h2>🎙️ Phòng Luyện Nói & Chấm Điểm Phát Âm AI</h2>
          <button type="button" class="rank-modal-close" onclick="window.HSKSpeechTrainer.close()">✕</button>
        </header>

        <div class="speech-level-selector">
          <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk1' ? 'active' : ''}" data-level="hsk1" onclick="window.HSKSpeechTrainer.setLevel('hsk1')">HSK 1</button>
          <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk2' ? 'active' : ''}" data-level="hsk2" onclick="window.HSKSpeechTrainer.setLevel('hsk2')">HSK 2</button>
          <button type="button" class="speech-lvl-btn ${currentLevel === 'hsk3' ? 'active' : ''}" data-level="hsk3" onclick="window.HSKSpeechTrainer.setLevel('hsk3')">HSK 3</button>
          <span id="speechSentenceNum" style="margin-left:auto; font-size:13px; font-weight:700; color:#64748b; align-self:center;"></span>
        </div>

        <div class="speech-modal-body">
          <div class="speech-target-box">
            <div id="speechTargetHanzi" class="speech-target-hanzi"></div>
            <div id="speechTargetPinyin" class="speech-target-pinyin"></div>
            <div id="speechTargetVi" class="speech-target-vi"></div>
          </div>

          <div class="speech-actions">
            <button type="button" class="speech-btn-listen" onclick="window.HSKSpeechTrainer.playAudio()">
              🔊 Nghe mẫu
            </button>
            <button type="button" class="speech-btn-mic" id="speechMicBtn" onclick="window.HSKSpeechTrainer.toggleRecording()" title="Bấm để nói">
              🎙️
            </button>
            <button type="button" class="speech-btn-next" onclick="window.HSKSpeechTrainer.next()">
              Câu tiếp →
            </button>
          </div>

          <div id="speechStatusText" style="text-align:center; font-size:13px; color:#64748b; margin-bottom:16px;"></div>

          <div id="speechEvalCard" class="speech-eval-card" hidden></div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    renderCurrentSentence();
  }

  function closeSpeechModal() {
    if (recognition && isRecording) {
      try { recognition.stop(); } catch {}
    }
    const modal = document.getElementById('hskSpeechModal');
    if (modal) modal.remove();
  }

  window.HSKSpeechTrainer = {
    open: openSpeechModal,
    close: closeSpeechModal,
    setLevel,
    next: nextSentence,
    playAudio: playSampleAudio,
    toggleRecording
  };
})();
