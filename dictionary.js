/**
 * Hanzi Dictionary & Search Module (Tra cứu Hán tự, Pinyin, Hán-Việt)
 */
(() => {
  'use strict';

  // Cơ sở dữ liệu từ điển tổng hợp từ HSK 1, 2, 3
  let dictionaryCache = null;

  function buildDictionaryDatabase() {
    if (dictionaryCache) return dictionaryCache;

    const words = [
      // HSK 1
      { hanzi: '你好', pinyin: 'nǐ hǎo', hv: 'nhĩ hảo', meaning: 'xin chào', level: 'HSK 1', topic: 'Chào hỏi' },
      { hanzi: '您好', pinyin: 'nín hǎo', hv: 'nhĩ hảo', meaning: 'xin chào (lịch sự, kính ngữ)', level: 'HSK 1', topic: 'Chào hỏi' },
      { hanzi: '我', pinyin: 'wǒ', hv: 'ngã', meaning: 'tôi, mình', level: 'HSK 1', topic: 'Đại từ' },
      { hanzi: '你', pinyin: 'nǐ', hv: 'nhĩ', meaning: 'bạn, cậu', level: 'HSK 1', topic: 'Đại từ' },
      { hanzi: '他', pinyin: 'tā', hv: 'tha', meaning: 'anh ấy, ông ấy', level: 'HSK 1', topic: 'Đại từ' },
      { hanzi: '她', pinyin: 'tā', hv: 'tha', meaning: 'cô ấy, bà ấy', level: 'HSK 1', topic: 'Đại từ' },
      { hanzi: '叫', pinyin: 'jiào', hv: 'khiếu', meaning: 'gọi, tên là', level: 'HSK 1', topic: 'Giới thiệu' },
      { hanzi: '名字', pinyin: 'míngzi', hv: 'danh tự', meaning: 'tên', level: 'HSK 1', topic: 'Giới thiệu' },
      { hanzi: '是', pinyin: 'shì', hv: 'thị', meaning: 'là, đúng', level: 'HSK 1', topic: 'Phán đoán' },
      { hanzi: '不是', pinyin: 'bú shì', hv: 'bất thị', meaning: 'không phải', level: 'HSK 1', topic: 'Phán đoán' },
      { hanzi: '中国', pinyin: 'Zhōngguó', hv: 'Trung Quốc', meaning: 'Trung Quốc', level: 'HSK 1', topic: 'Quốc gia' },
      { hanzi: '越南', pinyin: 'Yuènán', hv: 'Việt Nam', meaning: 'Việt Nam', level: 'HSK 1', topic: 'Quốc gia' },
      { hanzi: '老师', pinyin: 'lǎoshī', hv: 'lão sư', meaning: 'giáo viên, thầy cô', level: 'HSK 1', topic: 'Nghề nghiệp' },
      { hanzi: '学生', pinyin: 'xuésheng', hv: 'học sinh', meaning: 'học sinh, sinh viên', level: 'HSK 1', topic: 'Nghề nghiệp' },
      { hanzi: '爸爸', pinyin: 'bàba', hv: 'ba ba', meaning: 'bố, cha', level: 'HSK 1', topic: 'Gia đình' },
      { hanzi: '妈妈', pinyin: 'māma', hv: 'ma ma', meaning: 'mẹ, má', level: 'HSK 1', topic: 'Gia đình' },
      { hanzi: '吃', pinyin: 'chī', hv: 'ngật', meaning: 'ăn', level: 'HSK 1', topic: 'Hoạt động' },
      { hanzi: '喝', pinyin: 'hē', hv: 'hát', meaning: 'uống', level: 'HSK 1', topic: 'Hoạt động' },
      { hanzi: '茶', pinyin: 'chá', hv: 'trà', meaning: 'trà, chè', level: 'HSK 1', topic: 'Đồ uống' },
      { hanzi: '水', pinyin: 'shuǐ', hv: 'thủy', meaning: 'nước', level: 'HSK 1', topic: 'Đồ uống' },
      { hanzi: '米饭', pinyin: 'mǐfàn', hv: 'mễ phạn', meaning: 'cơm', level: 'HSK 1', topic: 'Ăn uống' },
      { hanzi: '多少钱', pinyin: 'duōshao qián', hv: 'đa thiểu tiền', meaning: 'bao nhiêu tiền', level: 'HSK 1', topic: 'Mua sắm' },
      { hanzi: '今天', pinyin: 'jīntiān', hv: 'kim thiên', meaning: 'hôm nay', level: 'HSK 1', topic: 'Thời gian' },
      { hanzi: '明天', pinyin: 'míngtiān', hv: 'minh thiên', meaning: 'ngày mai', level: 'HSK 1', topic: 'Thời gian' },
      { hanzi: '昨天', pinyin: 'zuótiān', hv: 'tạc thiên', meaning: 'hôm qua', level: 'HSK 1', topic: 'Thời gian' },
      { hanzi: '天气', pinyin: 'tiānqì', hv: 'thiên khí', meaning: 'thời tiết', level: 'HSK 1', topic: 'Thời tiết' },
      { hanzi: '冷', pinyin: 'lěng', hv: 'lãnh', meaning: 'lạnh', level: 'HSK 1', topic: 'Tính từ' },
      { hanzi: '热', pinyin: 'rè', hv: 'nhiệt', meaning: 'nóng', level: 'HSK 1', topic: 'Tính từ' },
      { hanzi: '漂亮', pinyin: 'piàoliang', hv: 'phiêu lượng', meaning: 'xinh đẹp, đẹp đẽ', level: 'HSK 1', topic: 'Tính từ' },

      // HSK 2
      { hanzi: '起床', pinyin: 'qǐchuáng', hv: 'khởi sàng', meaning: 'thức dậy, rời giường', level: 'HSK 2', topic: 'Sinh hoạt' },
      { hanzi: '跑步', pinyin: 'pǎobù', hv: 'bào bộ', meaning: 'chạy bộ', level: 'HSK 2', topic: 'Thể thao' },
      { hanzi: '生病', pinyin: 'shēngbìng', hv: 'sinh bệnh', meaning: 'bị ốm, ngã bệnh', level: 'HSK 2', topic: 'Sức khỏe' },
      { hanzi: '医院', pinyin: 'yīyuàn', hv: 'y viện', meaning: 'bệnh viện', level: 'HSK 2', topic: 'Địa điểm' },
      { hanzi: '药', pinyin: 'yào', hv: 'dược', meaning: 'thuốc', level: 'HSK 2', topic: 'Sức khỏe' },
      { hanzi: '手表', pinyin: 'shǒubiǎo', hv: 'thủ biểu', meaning: 'đồng hồ đeo tay', level: 'HSK 2', topic: 'Đồ dùng' },
      { hanzi: '红色', pinyin: 'hóngsè', hv: 'hồng sắc', meaning: 'màu đỏ', level: 'HSK 2', topic: 'Màu sắc' },
      { hanzi: '便宜', pinyin: 'piányi', hv: 'tiện nghi', meaning: 'rẻ, giá rẻ', level: 'HSK 2', topic: 'Mua sắm' },
      { hanzi: '贵', pinyin: 'guì', hv: 'quý', meaning: 'đắt, quý giá', level: 'HSK 2', topic: 'Mua sắm' },
      { hanzi: '穿', pinyin: 'chuān', hv: 'xuyên', meaning: 'mặc (quần áo), xỏ (giày)', level: 'HSK 2', topic: 'Trang phục' },
      { hanzi: '衣服', pinyin: 'yīfu', hv: 'y phục', meaning: 'quần áo, trang phục', level: 'HSK 2', topic: 'Trang phục' },
      { hanzi: '旅游', pinyin: 'lǚyóu', hv: 'lữ du', meaning: 'du lịch, đi chơi xa', level: 'HSK 2', topic: 'Du lịch' },
      { hanzi: '北京', pinyin: 'Běijīng', hv: 'Bắc Kinh', meaning: 'thủ đô Bắc Kinh', level: 'HSK 2', topic: 'Địa danh' },
      { hanzi: '地铁', pinyin: 'dìtiě', hv: 'địa thiết', meaning: 'tàu điện ngầm', level: 'HSK 2', topic: 'Giao thông' },
      { hanzi: '公共汽车', pinyin: 'gōnggòng qìchē', hv: 'công cộng khí xa', meaning: 'xe buýt', level: 'HSK 2', topic: 'Giao thông' },
      { hanzi: '咖啡', pinyin: 'kāfēi', hv: 'ca phê', meaning: 'cà phê', level: 'HSK 2', topic: 'Đồ uống' },
      { hanzi: '准备', pinyin: 'zhǔnbèi', hv: 'chuẩn bị', meaning: 'chuẩn bị, định làm', level: 'HSK 2', topic: 'Kế hoạch' },
      { hanzi: '帮助', pinyin: 'bāngzhù', hv: 'bang trợ', meaning: 'giúp đỡ, hỗ trợ', level: 'HSK 2', topic: 'Giao tiếp' },

      // HSK 3
      { hanzi: '打算', pinyin: 'dǎsuàn', hv: 'đả toán', meaning: 'dự định, tính toán', level: 'HSK 3', topic: 'Kế hoạch' },
      { hanzi: '复习', pinyin: 'fùxí', hv: 'phục tập', meaning: 'ôn tập, ôn lại bài', level: 'HSK 3', topic: 'Học tập' },
      { hanzi: '安排', pinyin: 'ānpái', hv: 'an bài', meaning: 'sắp xếp, bố trí', level: 'HSK 3', topic: 'Công việc' },
      { hanzi: '完成', pinyin: 'wánchéng', hv: 'hoàn thành', meaning: 'hoàn thành, làm xong', level: 'HSK 3', topic: 'Công việc' },
      { hanzi: '提高', pinyin: 'tígāo', hv: 'đề cao', meaning: 'nâng cao, cải thiện', level: 'HSK 3', topic: 'Học tập' },
      { hanzi: '认真', pinyin: 'rènzhēn', hv: 'nhận chân', meaning: 'chăm chỉ, nghiêm túc', level: 'HSK 3', topic: 'Tính cách' },
      { hanzi: '环境', pinyin: 'huánjìng', hv: 'hoàn cảnh', meaning: 'môi trường, hoàn cảnh xung quanh', level: 'HSK 3', topic: 'Đời sống' },
      { hanzi: '热情', pinyin: 'rèqíng', hv: 'nhiệt tình', meaning: 'nhiệt tình, hiếu khách', level: 'HSK 3', topic: 'Tính cách' },
      { hanzi: '经验', pinyin: 'jīngyàn', hv: 'kinh nghiệm', meaning: 'kinh nghiệm thực tế', level: 'HSK 3', topic: 'Công việc' },
      { hanzi: '影响', pinyin: 'yǐngxiǎng', hv: 'ảnh hưởng', meaning: 'ảnh hưởng, tác động', level: 'HSK 3', topic: 'Ngữ pháp' },
      { hanzi: '解决', pinyin: 'jiějué', hv: 'giải quyết', meaning: 'giải quyết (vấn đề, khó khăn)', level: 'HSK 3', topic: 'Công việc' },
      { hanzi: '满意', pinyin: 'mǎnyì', hv: 'mãn ý', meaning: 'hài lòng, vừa ý', level: 'HSK 3', topic: 'Cảm xúc' }
    ];

    dictionaryCache = words;
    return dictionaryCache;
  }

  function search(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];

    const db = buildDictionaryDatabase();
    return db.filter(item => {
      const matchHanzi = item.hanzi.includes(q);
      const matchPinyin = item.pinyin.toLowerCase().includes(q) || item.pinyin.toLowerCase().replace(/[^a-z]/g, '').includes(q.replace(/[^a-z]/g, ''));
      const matchMeaning = item.meaning.toLowerCase().includes(q);
      const matchHv = item.hv.toLowerCase().includes(q);
      const matchLevel = item.level.toLowerCase().includes(q);
      return matchHanzi || matchPinyin || matchMeaning || matchHv || matchLevel;
    });
  }

  // Render view tra cứu
  function renderDictionaryView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 20px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size:12px; font-weight:800; color:#6657d9; letter-spacing:0.08em; text-transform:uppercase;">CÔNG CỤ HỌC TIẾNG TRUNG</span>
          <h2 style="font-size:26px; color:#1a1e36; margin:6px 0;">📖 Tra cứu Từ điển Hán tự & Pinyin</h2>
          <p style="color:#64748b; font-size:15px; margin:4px 0 18px;">Tìm kiếm từ vựng theo chữ Hán, Pinyin hoặc nghĩa tiếng Việt. Tích hợp tập viết nét và nghe phát âm.</p>
          <div style="position:relative; max-width:600px; margin:0 auto;">
            <input type="search" id="dictSearchInput" placeholder="Nhập chữ Hán (你好), Pinyin (ni hao) hoặc nghĩa (xin chào)..." style="width:100%; padding:14px 20px; font-size:16px; border:2px solid #6657d9; border-radius:14px; outline:none; box-sizing:border-box; box-shadow:0 6px 20px rgba(102,87,217,0.12);">
          </div>
        </div>
        <div id="dictResults" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;"></div>
      </div>
    `;

    const input = document.getElementById('dictSearchInput');
    const results = document.getElementById('dictResults');

    function update() {
      const q = input.value;
      const list = q ? search(q) : buildDictionaryDatabase().slice(0, 12);
      if (!list.length) {
        results.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:30px;">Không tìm thấy từ vựng phù hợp với "<b>${q}</b>".</p>`;
        return;
      }

      results.innerHTML = list.map(item => {
        const bookmarked = window.HSKData?.isBookmarked(item.hanzi);
        return `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <span style="background:#f0edff; color:#6657d9; font-size:12px; font-weight:700; padding:2px 8px; border-radius:999px;">${item.level}</span>
                <button type="button" class="bookmark-btn" data-hanzi="${item.hanzi}" style="border:0; background:transparent; font-size:18px; cursor:pointer;" title="Lưu vào sổ tay">${bookmarked ? '⭐' : '☆'}</button>
              </div>
              <div style="font-size:36px; font-family:STKaiti,KaiTi,'KaiTi SC',serif; color:#1a1e36; line-height:1.2;">${item.hanzi}</div>
              <div style="font-size:16px; font-weight:700; color:#6657d9; margin-top:4px;">${item.pinyin}</div>
              <div style="font-size:13px; color:#b45309; font-weight:600; margin-top:2px;">Hán-Việt: ${item.hv}</div>
              <div style="font-size:14px; color:#334155; margin-top:6px;">${item.meaning}</div>
            </div>
            <div style="display:flex; gap:8px; margin-top:14px; padding-top:12px; border-top:1px dashed #f1f5f9;">
              <button type="button" style="flex:1; border:1px solid #d9d5ff; background:#f5f3ff; color:#6657d9; border-radius:8px; padding:6px; font-size:12px; font-weight:700; cursor:pointer;" onclick="if(window.HSKAudio) window.HSKAudio.speak('${item.hanzi}')">🔊 Nghe</button>
              <button type="button" style="flex:1; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; border-radius:8px; padding:6px; font-size:12px; font-weight:700; cursor:pointer;" onclick="if(window.HanziPad) window.HanziPad.open('${item.hanzi}', '${item.pinyin}', '${item.meaning}')">✍️ Tập viết</button>
            </div>
          </div>
        `;
      }).join('');

      results.querySelectorAll('.bookmark-btn').forEach(btn => {
        btn.onclick = () => {
          const hanzi = btn.dataset.hanzi;
          const word = buildDictionaryDatabase().find(w => w.hanzi === hanzi);
          if (word && window.HSKData) {
            const isSaved = window.HSKData.toggleBookmark({
              hanzi: word.hanzi,
              pinyin: word.pinyin,
              hv: word.hv,
              meaning: word.meaning,
              course: word.level
            });
            btn.textContent = isSaved ? '⭐' : '☆';
            if (window.Gamification) window.Gamification.playTone(isSaved ? 580 : 300, 0.1);
          }
        };
      });
    }

    input.oninput = update;
    update();
  }

  // Render view Sổ tay từ vựng yêu thích (Notebook)
  function renderNotebookView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const list = window.HSKData ? window.HSKData.getBookmarks() : [];
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 20px 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size:12px; font-weight:800; color:#d97706; letter-spacing:0.08em; text-transform:uppercase;">SỔ TAY CÁ NHÂN</span>
          <h2 style="font-size:26px; color:#1a1e36; margin:6px 0;">⭐ Từ vựng đã lưu (${list.length} từ)</h2>
          <p style="color:#64748b; font-size:15px; margin:4px 0 14px;">Danh sách từ vựng bạn đã đánh dấu sao để ôn luyện tập trung.</p>
        </div>
        ${!list.length ? `
          <div style="text-align:center; padding:50px 20px; background:#fff; border-radius:18px; border:1px dashed #cbd5e1;">
            <div style="font-size:48px; margin-bottom:10px;">📖</div>
            <h3 style="margin:0 0 6px; color:#1a1e36;">Chưa có từ vựng nào trong sổ tay</h3>
            <p style="color:#64748b; font-size:14px; margin:0 0 16px;">Hãy bấm biểu tượng ngôi sao ⭐ trên bất kỳ thẻ từ vựng nào để lưu vào đây.</p>
            <a href="#dict" style="background:#6657d9; color:#fff; text-decoration:none; padding:10px 18px; border-radius:10px; font-weight:700; font-size:14px; display:inline-block;">Mở tra cứu từ điển →</a>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;">
            ${list.map(item => `
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <span style="background:#fef3c7; color:#b45309; font-size:12px; font-weight:700; padding:2px 8px; border-radius:999px;">${item.course}</span>
                    <button type="button" class="remove-bookmark-btn" data-hanzi="${item.hanzi}" style="border:0; background:transparent; font-size:18px; cursor:pointer;" title="Bỏ lưu">⭐</button>
                  </div>
                  <div style="font-size:36px; font-family:STKaiti,KaiTi,'KaiTi SC',serif; color:#1a1e36;">${item.hanzi}</div>
                  <div style="font-size:16px; font-weight:700; color:#6657d9; margin-top:4px;">${item.pinyin}</div>
                  <div style="font-size:13px; color:#b45309; font-weight:600; margin-top:2px;">Hán-Việt: ${item.hv}</div>
                  <div style="font-size:14px; color:#334155; margin-top:6px;">${item.meaning}</div>
                </div>
                <div style="display:flex; gap:8px; margin-top:14px; padding-top:12px; border-top:1px dashed #f1f5f9;">
                  <button type="button" style="flex:1; border:1px solid #d9d5ff; background:#f5f3ff; color:#6657d9; border-radius:8px; padding:6px; font-size:12px; font-weight:700; cursor:pointer;" onclick="if(window.HSKAudio) window.HSKAudio.speak('${item.hanzi}')">🔊 Nghe</button>
                  <button type="button" style="flex:1; border:1px solid #e2e8f0; background:#f8fafc; color:#334155; border-radius:8px; padding:6px; font-size:12px; font-weight:700; cursor:pointer;" onclick="if(window.HanziPad) window.HanziPad.open('${item.hanzi}', '${item.pinyin}', '${item.meaning}')">✍️ Tập viết</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
      btn.onclick = () => {
        const hanzi = btn.dataset.hanzi;
        if (window.HSKData) {
          window.HSKData.toggleBookmark({ hanzi });
          renderNotebookView(containerId);
        }
      };
    });
  }

  window.HSKDictionary = {
    search,
    renderDictionaryView,
    renderNotebookView
  };
})();

