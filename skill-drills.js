/**
 * Skill Drills Engine (Luyện thi theo chuyên đề & dạng bài tập trung)
 * 4 Chuyên đề: Ngữ pháp trọng điểm, Phân biệt từ dễ nhầm, Luyện nghe phản xạ, Sắp xếp câu
 */
(() => {
  'use strict';

  const DRILL_CATEGORIES = {
    grammar: {
      title: 'Ngữ Pháp Trọng Điểm & Bẫy Thi',
      icon: '🧩',
      desc: 'Luyện câu chữ 把, câu chữ 被, so sánh 比, trợ từ 了/着/过 và liên từ kép.',
      questions: [
        {
          prompt: 'Điền giới từ thích hợp: <br><b>请你____桌子上的书收拾一下。</b>',
          options: ['被 (bèi)', '把 (bǎ)', '比 (bǐ)', '在 (zài)'],
          correct: 1,
          expl: '<b>Quy tắc:</b> Cấu trúc câu chữ 把 biểu thị sự xử lý tân ngữ: <b>S + 把 + O + V + Thành phần khác</b>. Dịch: Hãy dọn dẹp sách trên bàn một chút.'
        },
        {
          prompt: 'Chọn câu bị động đúng ngữ pháp:',
          options: ['蛋糕被弟弟吃光了。', '弟弟被蛋糕吃了。', '蛋糕把弟弟吃光了。', '被蛋糕弟弟吃光了。'],
          correct: 0,
          expl: '<b>Quy tắc câu chữ 被:</b> Đối tượng chịu tác động + 被 + Tác nhân + V + Kết quả (Bánh ngọt bị em trai ăn hết sạch).'
        },
        {
          prompt: 'Điền liên từ quan hệ tương phản: <br><b>____天气很冷，____他还是坚持每天晨跑。</b>',
          options: ['因为…所以…', '虽然…但是…', '不但…而且…', '只要…就…'],
          correct: 1,
          expl: '<b>Quy tắc:</b> 虽然…但是… (Tuy rằng... nhưng mà...). Biểu thị sự nhượng bộ, tương phản giữa hai vế câu.'
        },
        {
          prompt: 'Chọn trợ từ chỉ trải nghiệm "đã từng": <br><b>我以前去____北京两次。</b>',
          options: ['了', '着', '过', '的'],
          correct: 2,
          expl: '<b>Quy tắc:</b> Động từ + 过 biểu thị trải nghiệm đã từng xảy ra trong quá khứ (Tôi trước đây đã từng đi Bắc Kinh 2 lần).'
        },
        {
          prompt: 'Điền cấu trúc so sánh hơn: <br><b>今天的天气____昨天冷一点儿。</b>',
          options: ['跟', '从', '比', '像'],
          correct: 2,
          expl: '<b>Quy tắc câu so sánh:</b> A + 比 + B + Tính từ (+ Số lượng/Mức độ). Hôm nay lạnh hơn hôm qua một chút.'
        }
      ]
    },

    confusion: {
      title: 'Phân Biệt Từ Vựng Dễ Nhầm Lẫn',
      icon: '🔍',
      desc: 'Nắm chắc cách dùng 怎么 vs 怎么样, 二 vs 两, 刚才 vs 刚, 一点儿 vs 有点儿.',
      questions: [
        {
          prompt: 'Hỏi về phương thức di chuyển: <br><b>请问，去火车站____走？</b>',
          options: ['怎么 (zěnme)', '怎么样 (zěnmeyàng)', '什么 (shénme)', '为什么 (wèishénme)'],
          correct: 0,
          expl: '<b>Phân biệt:</b> <b>怎么 + Động từ</b> dùng để hỏi cách thức/phương thức làm việc gì đó (怎么走: đi như thế nào). Còn <b>怎么样</b> dùng ở cuối câu để hỏi ý kiến/tính chất.'
        },
        {
          prompt: 'Điền từ trước lượng từ (hai quyển sách): <br><b>桌子上有____本书。</b>',
          options: ['二 (èr)', '两 (liǎng)', '俩 (liǎ)', '双 (shuāng)'],
          correct: 1,
          expl: '<b>Phân biệt:</b> Khi đếm số lượng đứng trước lượng từ (本, 个, 张...), bắt buộc phải dùng <b>两 (liǎng)</b>, không dùng 二.'
        },
        {
          prompt: 'Nói về sự việc vừa mới xảy ra trong chốc lát: <br><b>他____离开办公室，还没走远。</b>',
          options: ['刚才 (gāngcái)', '刚 (gāng)', '现在 (xiànzài)', '马上 (mǎshàng)'],
          correct: 1,
          expl: '<b>Phân biệt:</b> <b>刚</b> là phó từ đứng trực tiếp trước động từ (刚离开: vừa mới rời đi). <b>刚才</b> là danh từ chỉ thời gian, có thể đứng trước chủ ngữ.'
        },
        {
          prompt: 'Miêu tả cảm xúc tiêu cực, không như ý: <br><b>今天工作太忙了，我____累。</b>',
          options: ['一点儿 (yìdiǎnr)', '有点儿 (yǒudiǎnr)', '很多 (hěnduō)', '非常 (fēicháng)'],
          correct: 1,
          expl: '<b>Phân biệt:</b> <b>有点儿 + Tính từ</b> mang nghĩa "hơi... một chút" và thường dùng cho cảm giác tiêu cực/không vừa ý (hơi mệt, hơi đắt). Còn <b>Tính từ + 一点儿</b> dùng trong so sánh.'
        },
        {
          prompt: 'Diễn tả hành động chưa xảy ra sẽ lặp lại trong tương lai: <br><b>欢迎您下次____来！</b>',
          options: ['又 (yòu)', '再 (zài)', '还 (hái)', '也 (yě)'],
          correct: 1,
          expl: '<b>Phân biệt:</b> <b>再 (zài)</b> chỉ hành động lặp lại trong tương lai (lần sau lại đến nhé). Còn <b>又 (yòu)</b> chỉ hành động lặp lại đã xảy ra trong quá khứ.'
        }
      ]
    },

    listening: {
      title: 'Luyện Tai Nghe & Phản Xạ Nhanh',
      icon: '🎧',
      desc: 'Lắng nghe phát âm câu ngắn và nhận biết ngữ cảnh giao tiếp.',
      questions: [
        {
          audio: '外面下大雨了，你出门记得带伞。',
          prompt: 'Bấm 🔊 Nghe phát âm và chọn thông điệp của câu:',
          options: [
            'Bên ngoài trời nắng, nhớ mang kính râm.',
            'Bên ngoài mưa to, nhớ mang theo ô.',
            'Hôm nay có tuyết rơi, ở nhà đừng đi đâu.'
          ],
          correct: 1,
          expl: '<b>Từ khóa:</b> 下大雨 (mưa to), 带伞 (mang theo ô).'
        },
        {
          audio: '我坐地铁去公司，大概需要半个小时。',
          prompt: 'Bấm 🔊 Nghe và xác định phương tiện cùng thời gian đi lại:',
          options: [
            'Đi xe buýt mất 1 tiếng',
            'Đi tàu điện ngầm mất khoảng 30 phút',
            'Đi taxi mất 15 phút'
          ],
          correct: 1,
          expl: '<b>Từ khóa:</b> 坐地铁 (đi tàu điện ngầm), 半个小时 (nửa tiếng = 30 phút).'
        },
        {
          audio: '服务员，请给我们拿两双筷子，谢谢。',
          prompt: 'Bấm 🔊 Nghe và cho biết người nói đang yêu cầu món gì:',
          options: [
            'Lấy 2 đôi đũa',
            'Lấy 2 cốc nước ấm',
            'Thanh toán hóa đơn'
          ],
          correct: 0,
          expl: '<b>Từ khóa:</b> 服务员 (nhân viên phục vụ), 两双筷子 (hai đôi đũa).'
        },
        {
          audio: '这件红色的衣服打八折，真的很便宜。',
          prompt: 'Bấm 🔊 Nghe và nhận định giá cả bộ quần áo:',
          options: [
            'Đắt quá không mua được',
            'Giảm giá 20% (打八折), thật sự rất rẻ',
            'Hàng mới không được giảm giá'
          ],
          correct: 1,
          expl: '<b>Từ khóa:</b> 打八折 (chiết khấu 20%, bán với giá 80%), 很便宜 (rất rẻ).'
        }
      ]
    },

    scramble: {
      title: 'Sắp Xếp Trật Tự Câu Hán Ngữ',
      icon: '⚡',
      desc: 'Củng cố tư duy ngữ pháp chuẩn xác: Ai - Ở đâu - Làm gì - Khi nào.',
      questions: [
        {
          prompt: 'Chọn trật tự câu đúng của các cụm: <b>[在学校] [我] [学习汉语] [每天]</b>',
          options: [
            '我每天在学校学习汉语。',
            '我学习汉语每天在学校。',
            '每天学习汉语我在学校。',
            '在学校我每天学习汉语。'
          ],
          correct: 0,
          expl: '<b>Trật tự chuẩn tiếng Trung:</b> Chủ ngữ + Thời gian + Địa điểm + Động từ + Tân ngữ (我 + 每天 + 在学校 + 学习汉语).'
        },
        {
          prompt: 'Chọn trật tự câu với bổ ngữ kết quả: <b>[完成了] [这份文件] [他] [已经]</b>',
          options: [
            '他已经完成了这份文件。',
            '这份文件已经他完成了。',
            '他完成了已经这份文件。',
            '完成了他这份文件已经。'
          ],
          correct: 0,
          expl: '<b>Cấu trúc:</b> Chủ ngữ + Phó từ thời gian + Động từ + Bổ ngữ kết quả + Tân ngữ (他 + 已经 + 完成了 + 这份文件).'
        },
        {
          prompt: 'Chọn trật tự câu so sánh với "更":',
          options: [
            '跑步比散步更健康。',
            '更跑步比散步健康。',
            '比散步跑步更健康。',
            '跑步散步更比健康。'
          ],
          correct: 0,
          expl: '<b>Cấu trúc:</b> A + 比 + B + 更 + Tính từ (跑步比散步更健康 - Chạy bộ so với đi bộ thì tốt cho sức khỏe hơn).'
        }
      ]
    }
  };

  let currentCategory = null;
  let currentQIndex = 0;
  let correctCount = 0;
  let answered = false;

  function selectCategory(catKey) {
    const cat = DRILL_CATEGORIES[catKey];
    if (!cat) return;

    currentCategory = catKey;
    currentQIndex = 0;
    correctCount = 0;
    renderQuestionView();
  }

  function renderCategoryPicker() {
    const body = document.getElementById('drillModalBody');
    if (!body) return;

    body.innerHTML = `
      <div style="padding:16px 28px 0;">
        <p style="color:#64748b; font-size:14px; margin:0 0 16px;">
          Chọn chuyên đề bạn muốn rèn luyện chuyên sâu. Mỗi bài chỉ gồm 4–5 câu hỏi trọng điểm kèm giải thích chi tiết:
        </p>
      </div>

      <div class="drill-category-grid">
        ${Object.entries(DRILL_CATEGORIES).map(([k, cat]) => `
          <div class="drill-cat-card" onclick="window.HSKSkillDrills.selectCategory('${k}')">
            <div class="drill-cat-icon">${cat.icon}</div>
            <strong>${cat.title}</strong>
            <p>${cat.desc}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderQuestionView() {
    const cat = DRILL_CATEGORIES[currentCategory];
    const q = cat.questions[currentQIndex];
    const total = cat.questions.length;
    const progressPct = Math.round(((currentQIndex) / total) * 100);
    answered = false;

    const body = document.getElementById('drillModalBody');
    if (!body) return;

    body.innerHTML = `
      <div class="drill-question-container">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:13px; font-weight:800; color:#6657d9;">${cat.icon} ${cat.title}</span>
          <span style="font-size:13px; font-weight:700; color:#64748b;">Câu ${currentQIndex + 1} / ${total}</span>
        </div>

        <div class="drill-progress-bar-wrap">
          <div class="drill-progress-bar-fill" style="width:${progressPct}%;"></div>
        </div>

        <div class="drill-q-card">
          <div class="drill-q-prompt">
            ${q.prompt}
          </div>

          ${q.audio ? `
            <div style="margin-bottom:16px;">
              <button type="button" class="btn" style="background:#f0edff; color:#6657d9; border:1px solid #d9d5ff; font-weight:700; padding:6px 14px; font-size:13px;" onclick="window.HSKSkillDrills.playAudio('${q.audio}')">
                🔊 Bấm để nghe phát âm
              </button>
            </div>
          ` : ''}

          <div class="drill-options-list" id="drillOptionsList">
            ${q.options.map((opt, i) => `
              <button type="button" class="drill-opt-btn" onclick="window.HSKSkillDrills.checkAnswer(${i})">
                <span><b>${String.fromCharCode(65 + i)}.</b> ${opt}</span>
              </button>
            `).join('')}
          </div>

          <div id="drillExplBox" class="drill-explanation-box" style="display:none;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <button type="button" class="btn" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; padding:8px 16px; font-size:13px;" onclick="window.HSKSkillDrills.backToCategories()">
            ← Đổi chuyên đề
          </button>
          <button type="button" id="drillNextBtn" class="btn" style="background:#6657d9; color:#fff; border:0; font-weight:700; padding:10px 22px; font-size:14px; display:none;" onclick="window.HSKSkillDrills.nextQuestion()">
            Câu tiếp theo →
          </button>
        </div>
      </div>
    `;

    // Tự động phát âm thanh nếu có audio
    if (q.audio) {
      setTimeout(() => playAudio(q.audio), 300);
    }
  }

  function playAudio(text) {
    if (window.HSKAudio) {
      window.HSKAudio.speak(text);
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  }

  function checkAnswer(chosenIndex) {
    if (answered) return;
    answered = true;

    const cat = DRILL_CATEGORIES[currentCategory];
    const q = cat.questions[currentQIndex];
    const isCorrect = chosenIndex === q.correct;

    if (isCorrect) {
      correctCount++;
      window.Gamification?.playSuccessSound();
    } else {
      window.Gamification?.playErrorSound();
    }

    // Cập nhật giao diện các nút
    const buttons = document.querySelectorAll('.drill-opt-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else if (idx === chosenIndex) {
        btn.classList.add('wrong');
      }
    });

    // Hiển thị giải thích
    const explBox = document.getElementById('drillExplBox');
    if (explBox) {
      explBox.style.display = 'block';
      explBox.innerHTML = `
        <div style="font-weight:800; color:${isCorrect ? '#15803d' : '#b91c1c'}; margin-bottom:6px;">
          ${isCorrect ? '✓ Chính xác!' : '✗ Chưa chính xác. Đáp án đúng là ' + String.fromCharCode(65 + q.correct)}
        </div>
        <div>${q.expl}</div>
      `;
    }

    const nextBtn = document.getElementById('drillNextBtn');
    if (nextBtn) nextBtn.style.display = 'inline-block';
  }

  function nextQuestion() {
    const cat = DRILL_CATEGORIES[currentCategory];
    currentQIndex++;

    if (currentQIndex < cat.questions.length) {
      renderQuestionView();
    } else {
      renderResultView();
    }
  }

  function renderResultView() {
    const cat = DRILL_CATEGORIES[currentCategory];
    const total = cat.questions.length;
    const earnedXP = correctCount * 8 + 10;

    // Thưởng XP và cập nhật Quest
    window.Gamification?.addXP(earnedXP, `Hoàn thành chuyên đề ${cat.title}`);
    window.Gamification?.updateQuestProgress('drill', 1);

    if (correctCount >= total - 1) {
      window.Gamification?.confetti();
      window.Gamification?.playSuccessSound();
    }

    const body = document.getElementById('drillModalBody');
    if (!body) return;

    body.innerHTML = `
      <div style="padding:32px 28px; text-align:center;">
        <div style="font-size:52px;">🎯🎉</div>
        <span style="display:inline-block; background:#dcfce7; color:#15803d; font-size:13px; font-weight:800; padding:6px 16px; border-radius:999px; margin-bottom:12px;">
          HOÀN THÀNH CHUYÊN ĐỀ
        </span>
        <h2 style="font-size:24px; font-weight:900; color:#1e1b4b; margin:0 0 8px;">${cat.title}</h2>
        <p style="color:#64748b; font-size:15px; margin-bottom:20px;">
          Bạn đã trả lời đúng <b>${correctCount}/${total}</b> câu hỏi • Thưởng: <b style="color:#15803d;">+${earnedXP} XP</b>
        </p>

        <div style="display:flex; gap:12px; justify-content:center;">
          <button type="button" class="btn" style="background:#6657d9; color:#fff; border:0; padding:12px 22px; border-radius:12px; font-weight:800; cursor:pointer;" onclick="window.HSKSkillDrills.selectCategory('${currentCategory}')">
            🔄 Làm lại chuyên đề này
          </button>
          <button type="button" class="btn" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; padding:12px 20px; border-radius:12px; font-weight:700; cursor:pointer;" onclick="window.HSKSkillDrills.backToCategories()">
            Chọn chuyên đề khác
          </button>
        </div>
      </div>
    `;
  }

  function openDrillModal(categoryKey = null) {
    const existing = document.getElementById('hskDrillModal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'hskDrillModal';
    overlay.className = 'drill-modal-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeDrillModal(); };

    overlay.innerHTML = `
      <div class="drill-modal-card">
        <header class="drill-modal-header">
          <h2>🎯 Luyện Thi Theo Chuyên Đề & Dạng Bài</h2>
          <button type="button" class="rank-modal-close" onclick="window.HSKSkillDrills.close()">✕</button>
        </header>

        <div id="drillModalBody"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    if (categoryKey && DRILL_CATEGORIES[categoryKey]) {
      selectCategory(categoryKey);
    } else {
      renderCategoryPicker();
    }
  }

  function closeDrillModal() {
    const modal = document.getElementById('hskDrillModal');
    if (modal) modal.remove();
  }

  window.HSKSkillDrills = {
    open: openDrillModal,
    close: closeDrillModal,
    selectCategory,
    backToCategories: renderCategoryPicker,
    checkAnswer,
    nextQuestion,
    playAudio
  };
})();
