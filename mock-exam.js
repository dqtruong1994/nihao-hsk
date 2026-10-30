/**
 * HSK Mock Exam Engine (Hệ Thống Đề Thi Thử HSK 1, 2, 3)
 * Mô phỏng cấu trúc đề thi chính thức: Nghe hiểu + Đọc hiểu, có đếm giờ và giải thích chi tiết.
 */
(() => {
  'use strict';

  // --- NGÂN HÀNG ĐỀ THI THỬ ---

  const EXAM_BANK = {
    hsk1: {
      level: 1,
      title: 'Đề Thi Thử HSK 1 Chuẩn Quốc Tế',
      durationMinutes: 20,
      totalScore: 200,
      passScore: 120,
      sections: [
        {
          name: 'Phần 1: Nghe Hiểu (听力)',
          description: 'Bấm nút 🔊 Nghe phát âm và chọn phương án trả lời đúng.',
          questions: [
            { id: 'h1_l1', type: 'listening', audio: '飞机', prompt: 'Nghe từ vựng và chọn nghĩa đúng:', options: ['máy bay', 'xe buýt', 'tàu hỏa'], correct: 0, expl: '飞机 (fēijī) có nghĩa là máy bay.' },
            { id: 'h1_l2', type: 'listening', audio: '喝水', prompt: 'Nghe cụm từ và chọn hình ảnh/nghĩa:', options: ['ăn cơm', 'uống nước', 'uống trà'], correct: 1, expl: '喝水 (hē shuǐ) có nghĩa là uống nước.' },
            { id: 'h1_l3', type: 'listening', audio: '他很漂亮吗？不，他很高兴。', prompt: 'Phán đoán Đúng (✓) hay Sai (✗): "Anh ấy đang rất vui."', options: ['✓ Đúng', '✗ Sai'], correct: 0, expl: '高兴 (gāoxìng) là vui vẻ, câu nghe được khẳng định anh ấy rất vui.' },
            { id: 'h1_l4', type: 'listening', audio: '桌子上有三本书。', prompt: 'Trên bàn có bao nhiêu quyển sách?', options: ['2 quyển', '3 quyển', '4 quyển'], correct: 1, expl: '三本 (sān běn) nghĩa là 3 quyển.' },
            { id: 'h1_l5', type: 'listening', audio: '明天下午三点见。', prompt: 'Họ hẹn gặp nhau vào lúc nào?', options: ['3 giờ sáng mai', '3 giờ chiều mai', '8 giờ tối nay'], correct: 1, expl: '下午三点 (xiàwǔ sān diǎn) là 3 giờ chiều.' },
            { id: 'h1_l6', type: 'listening', audio: '苹果五块钱一斤。', prompt: 'Táo bao nhiêu tiền một cân?', options: ['5 đồng (5块)', '15 đồng (15块)', '50 đồng (50块)'], correct: 0, expl: '五块钱 (wǔ kuài qián) là 5 tệ/đồng.' },
            { id: 'h1_l7', type: 'listening', audio: '她是我的汉语老师。', prompt: 'Người phụ nữ đó là ai?', options: ['Mẹ tôi', 'Bạn học của tôi', 'Cô giáo tiếng Trung của tôi'], correct: 2, expl: '我的汉语老师 (wǒ de hànyǔ lǎoshī) là giáo viên tiếng Trung của tôi.' },
            { id: 'h1_l8', type: 'listening', audio: '外面下雨了，很冷。', prompt: 'Thời tiết bên ngoài thế nào?', options: ['Nắng nóng', 'Trời mưa và lạnh', 'Có tuyết rơi'], correct: 1, expl: '下雨 (xiàyǔ) là trời mưa, 冷 (lěng) là lạnh.' },
            { id: 'h1_l9', type: 'listening', audio: '我想吃中国菜。', prompt: 'Người nói muốn làm gì?', options: ['Uống trà Trung Quốc', 'Ăn món Trung Quốc', 'Đi du lịch Trung Quốc'], correct: 1, expl: '吃中国菜 (chī Zhōngguó cài) là ăn món ăn Trung Quốc.' },
            { id: 'h1_l10', type: 'listening', audio: '我不认识他。', prompt: 'Phán đoán: "Tôi và anh ấy là bạn thân."', options: ['✓ Đúng', '✗ Sai'], correct: 1, expl: '我不认识他 (wǒ bù rènshi tā) nghĩa là Tôi không quen biết anh ấy.' }
          ]
        },
        {
          name: 'Phần 2: Đọc Hiểu (阅读)',
          description: 'Đọc kỹ câu hỏi, chữ Hán và chọn phương án chính xác nhất.',
          questions: [
            { id: 'h1_r1', prompt: 'Chọn từ thích hợp điền vào chỗ trống: <br><b>你叫什么____？</b>', options: ['名字', '老师', '水'], correct: 0, expl: '你叫什么名字？ (Bạn tên là gì?)' },
            { id: 'h1_r2', prompt: 'Chọn chữ Hán có phiên âm là <b>"Zhōngguó"</b>:', options: ['北京', '中国', '美国'], correct: 1, expl: '中国 (Zhōngguó) là Trung Quốc.' },
            { id: 'h1_r3', prompt: 'Khẩu ngữ: Khi đối phương nói <b>"谢谢你！"</b>, bạn đáp lại:', options: ['不客气', '再见', '对不起'], correct: 0, expl: 'Đáp lại cảm ơn là 不客气 (bú kèqi - không có gì).' },
            { id: 'h1_r4', prompt: 'Tìm câu đúng ngữ pháp:', options: ['我是很高兴。', '我很高兴。', '我高兴是很。'], correct: 1, expl: 'Trước tính từ không dùng 是, dùng 很 (我很高兴).' },
            { id: 'h1_r5', prompt: 'Điền lượng từ thích hợp: <b>我买了一____书。</b>', options: ['个', '本', '块'], correct: 1, expl: 'Lượng từ của sách (书) là 本 (běn).' },
            { id: 'h1_r6', prompt: '<b>"爸爸在医院工作。"</b> — Bố làm việc ở đâu?', options: ['Trường học', 'Cửa hàng', 'Bệnh viện'], correct: 2, expl: '医院 (yīyuàn) là bệnh viện.' },
            { id: 'h1_r7', prompt: 'Chọn câu hỏi cho câu trả lời: <b>"今天十月五号。"</b>', options: ['今天几点？', '今天星期几？', '今天几号？'], correct: 2, expl: 'Hỏi ngày trong tháng dùng 今天几号？' },
            { id: 'h1_r8', prompt: 'Chọn nghĩa đúng của câu: <b>"这些苹果多少钱？"</b>', options: ['Những quả táo này bao nhiêu tiền?', 'Bạn có thích ăn táo không?', 'Táo này có ngon không?'], correct: 0, expl: '多少钱 (duōshao qián) là bao nhiêu tiền.' },
            { id: 'h1_r9', prompt: 'Chọn cặp từ trái nghĩa:', options: ['大 — 小', '冷 — 凉', '好 — 漂亮'], correct: 0, expl: '大 (dà - to) trái nghĩa với 小 (xiǎo - nhỏ).' },
            { id: 'h1_r10', prompt: 'Điền từ: <b>她____二十岁，是个大学生。</b>', options: ['今年', '昨天', '明天'], correct: 0, expl: 'Nói về số tuổi hiện tại dùng 今年 (năm nay).' }
          ]
        }
      ]
    },

    hsk2: {
      level: 2,
      title: 'Đề Thi Thử HSK 2 Chuẩn Quốc Tế',
      durationMinutes: 25,
      totalScore: 200,
      passScore: 120,
      sections: [
        {
          name: 'Phần 1: Nghe Hiểu (听力)',
          description: 'Lắng nghe từng đoạn thoại và chọn đáp án chính xác.',
          questions: [
            { id: 'h2_l1', type: 'listening', audio: '他每天早上六点起床跑步。', prompt: 'Anh ấy thường làm gì vào 6 giờ sáng?', options: ['Ăn sáng', 'Chạy bộ', 'Đi làm'], correct: 1, expl: '起床跑步 (qǐchuáng pǎobù) là thức dậy chạy bộ.' },
            { id: 'h2_l2', type: 'listening', audio: '这个自行车比那个贵两百块。', prompt: 'Chiếc xe đạp này so với chiếc kia thế nào?', options: ['Rẻ hơn 200 tệ', 'Đắt hơn 200 tệ', 'Giá bằng nhau'], correct: 1, expl: '比那个贵 (đắt hơn cái kia).' },
            { id: 'h2_l3', type: 'listening', audio: '我正在看电视呢，你打电话有什么事吗？', prompt: 'Người nói đang làm gì khi có điện thoại?', options: ['Đang nấu cơm', 'Đang xem TV', 'Đang làm bài tập'], correct: 1, expl: '正在看电视呢 (đang xem TV).' },
            { id: 'h2_l4', type: 'listening', audio: '因为今天下大雨，所以我们不去踢足球了。', prompt: 'Tại sao họ không đi đá bóng?', options: ['Vì bị ốm', 'Vì trời mưa to', 'Vì bận làm việc'], correct: 1, expl: '因为下大雨 (vì trời mưa to).' },
            { id: 'h2_l5', type: 'listening', audio: '请给我一杯温水，谢谢服务员。', prompt: 'Họ đang ở đâu và yêu cầu món gì?', options: ['Ở bệnh viện mua thuốc', 'Ở quán gọi một ly nước ấm', 'Ở thư viện mượn sách'], correct: 1, expl: '一杯温水 (một cốc nước ấm), 服务员 (phục vụ).' },
            { id: 'h2_l6', type: 'listening', audio: '我已经去过北京三次了，那里非常漂亮。', prompt: 'Người nói đã đến Bắc Kinh mấy lần?', options: ['Chưa từng đến', '2 lần', '3 lần'], correct: 2, expl: '三次 (sān cì) là 3 lần.' },
            { id: 'h2_l7', type: 'listening', audio: '从这儿一直往右走，就是中国银行。', prompt: 'Hướng đi đến Ngân hàng Trung Quốc là:', options: ['Đi thẳng rồi rẽ phải', 'Đi lùi về phía sau', 'Rẽ trái ngay'], correct: 0, expl: '一直往右走 (cứ đi về bên phải).' },
            { id: 'h2_l8', type: 'listening', audio: '别着急，医生说吃完药休息两天就好了。', prompt: 'Lời khuyên dành cho bệnh nhân là gì?', options: ['Uống thuốc và nghỉ ngơi 2 ngày', 'Đi làm việc ngay', 'Đổi sang bệnh viện khác'], correct: 0, expl: '吃完药休息两天 (uống thuốc xong nghỉ ngơi 2 ngày).' },
            { id: 'h2_l9', type: 'listening', audio: '这件红色的衣服你穿得真好看。', prompt: 'Bộ quần áo được khen có màu gì?', options: ['Màu trắng (白色)', 'Màu đen (黑色)', 'Màu đỏ (红色)'], correct: 2, expl: '红色的衣服 (quần áo màu đỏ).' },
            { id: 'h2_l10', type: 'listening', audio: '明天如果有时间，我就和你一起去看电影。', prompt: 'Điều kiện để họ đi xem phim cùng nhau là gì?', options: ['Nếu có tiền', 'Nếu trời không mưa', 'Nếu có thời gian'], correct: 2, expl: '如果有时间 (nếu có thời gian).' }
          ]
        },
        {
          name: 'Phần 2: Đọc Hiểu (阅读)',
          description: 'Chọn đáp án đúng nhất để hoàn thành câu và đoạn văn.',
          questions: [
            { id: 'h2_r1', prompt: 'Điền từ thích hợp: <b>你怎么去上班？— 我____地铁去。</b>', options: ['坐', '骑', '开'], correct: 0, expl: 'Đi tàu điện ngầm dùng động từ 坐 (ngồi/đi): 坐地铁.' },
            { id: 'h2_r2', prompt: 'Điền trợ từ thích hợp: <b>妹妹唱歌唱____很好听。</b>', options: ['的', '得', '地'], correct: 1, expl: 'Bổ ngữ chỉ mức độ sau động từ dùng 得 (唱得很好听).' },
            { id: 'h2_r3', prompt: 'Cấu trúc so sánh: <b>哥哥____弟弟高五厘米。</b>', options: ['跟', '比', '像'], correct: 1, expl: 'So sánh hơn dùng 比 (A 比 B + tính từ).' },
            { id: 'h2_r4', prompt: 'Chọn liên từ thích hợp: <b>____天气不好，____我们取消了野餐。</b>', options: ['虽然…但是…', '因为…所以…', '如果…就…'], correct: 1, expl: 'Nguyên nhân - kết quả dùng 因为…所以…' },
            { id: 'h2_r5', prompt: '<b>"学校离我家很近，走路五分钟就到了。"</b> — Câu này nghĩa là:', options: ['Trường học rất xa nhà tôi', 'Trường học rất gần nhà tôi', 'Tôi không biết đường đến trường'], correct: 1, expl: '离…很近 (cách rất gần).' },
            { id: 'h2_r6', prompt: 'Điền từ thích hợp: <b>生病了就要按时吃____。</b>', options: ['饭', '茶', '药'], correct: 2, expl: 'Uống thuốc trong tiếng Trung là 吃药 (chī yào).' },
            { id: 'h2_r7', prompt: 'Khuyên bảo ai đó đừng vội vàng dùng:', options: ['别客气', '别着急', '没关系'], correct: 1, expl: '别着急 (bié zháojí) nghĩa là Đừng sốt ruột/đừng vội.' },
            { id: 'h2_r8', prompt: 'Chọn từ chỉ trải nghiệm quá khứ: <b>你吃____北京烤鸭吗？</b>', options: ['了', '过', '着'], correct: 1, expl: 'Trợ từ 过 biểu thị trải nghiệm từng làm gì trong quá khứ.' },
            { id: 'h2_r9', prompt: '<b>"你想喝咖啡____茶？"</b> — Câu hỏi lựa chọn dùng liên từ:', options: ['或者', '还是', '而且'], correct: 1, expl: 'Trong câu hỏi lựa chọn dùng 还是 (háishi).' },
            { id: 'h2_r10', prompt: 'Chọn câu có trật tự từ đúng nhất:', options: ['我昨天买了两本很有意思的书。', '我买了昨天两本很有意思书。', '很有意思的两本书我昨天买。'], correct: 0, expl: 'Chủ ngữ + thời gian + động từ + lượng từ + định ngữ + danh từ.' }
          ]
        }
      ]
    },

    hsk3: {
      level: 3,
      title: 'Đề Thi Thử HSK 3 Chuẩn Quốc Tế',
      durationMinutes: 35,
      totalScore: 300,
      passScore: 180,
      sections: [
        {
          name: 'Phần 1: Nghe Hiểu (听力)',
          description: 'Nghe đoạn hội thoại trung cấp và lựa chọn phương án đúng.',
          questions: [
            { id: 'h3_l1', type: 'listening', audio: '经理，这份文件我已经按照您的要求修改完成了。', prompt: 'Người nói đã làm xong việc gì?', options: ['Ký hợp đồng', 'Sửa xong tài liệu theo yêu cầu', 'Gặp gỡ khách hàng'], correct: 1, expl: '修改完成文件 (hoàn thành sửa tài liệu).' },
            { id: 'h3_l2', type: 'listening', audio: '虽然这次考试很难，但是他复习得很认真，所以考得不错。', prompt: 'Kết quả thi của anh ấy thế nào?', options: ['Bị trượt', 'Thi khá tốt nhờ ôn tập chăm chỉ', 'Bỏ thi'], correct: 1, expl: '考得不错 (thi khá tốt) nhờ 复习得很认真.' },
            { id: 'h3_l3', type: 'listening', audio: '请大家把手机关上或者调成静音模式，会议马上开始。', prompt: 'Mọi người được yêu cầu làm gì trước cuộc họp?', options: ['Bật điện thoại', 'Tắt hoặc để điện thoại chế độ im lặng', 'Rời khỏi phòng'], correct: 1, expl: '把手机关上或者调成静音 (tắt máy hoặc để chế độ im lặng).' },
            { id: 'h3_l4', type: 'listening', audio: '这里环境优美，空气新鲜，非常适合老人居住。', prompt: 'Nơi này có đặc điểm gì nổi bật?', options: ['Môi trường đẹp, không khí trong lành', 'Ồn ào, đông đúc', 'Giao thông khó khăn'], correct: 0, expl: '环境优美 (môi trường đẹp), 空气新鲜 (không khí trong lành).' },
            { id: 'h3_l5', type: 'listening', audio: '他打算大学毕业以后先去南方工作两年，然后再考研究生。', prompt: 'Kế hoạch sau khi tốt nghiệp của anh ấy là:', options: ['Đi du học ngay', 'Đi làm ở miền nam 2 năm rồi mới thi thạc sĩ', 'Về quê mở công ty'], correct: 1, expl: '先去南方工作两年，然后再考研究生.' },
            { id: 'h3_l6', type: 'listening', audio: '为了提高汉语水平，我每天坚持看半个小时的中文新闻。', prompt: 'Mục đích của việc xem tin tức mỗi ngày là gì?', options: ['Để giải trí', 'Để nâng cao trình độ tiếng Trung', 'Để biết giá cả thị trường'], correct: 1, expl: '为了提高汉语水平 (để nâng cao trình độ tiếng Trung).' },
            { id: 'h3_l7', type: 'listening', audio: '我的钱包被小偷偷走了，里面有很多重要的卡和现金。', prompt: 'Chuyện gì đã xảy ra với người nói?', options: ['Bị rơi mất chìa khóa', 'Bị trộm mất ví tiền', 'Để quên ví ở nhà'], correct: 1, expl: '钱包被小偷偷走了 (ví bị trộm lấy mất).' },
            { id: 'h3_l8', type: 'listening', audio: '这家饭馆的服务员特别热情，顾客们都感到很满意。', prompt: 'Thái độ phục vụ của nhà hàng này ra sao?', options: ['Lạnh nhạt', 'Rất nhiệt tình và khách hàng hài lòng', 'Chậm chạp'], correct: 1, expl: '特别热情 (đặc biệt nhiệt tình), 感到很满意 (rất hài lòng).' },
            { id: 'h3_l9', type: 'listening', audio: '遇到困难时不要放弃，我们一定能想出解决的办法。', prompt: 'Thông điệp của câu nói là gì?', options: ['Gặp khó khăn thì nên dừng lại', 'Không nên bỏ cuộc, sẽ có cách giải quyết', 'Nhờ người khác làm hộ'], correct: 1, expl: '不要放弃 (đừng bỏ cuộc), 解决的办法 (biện pháp giải quyết).' },
            { id: 'h3_l10', type: 'listening', audio: '他对中国历史和文化非常感兴趣，买了很多相关的书籍。', prompt: 'Anh ấy quan tâm và hứng thú với điều gì?', options: ['Lịch sử và văn hóa Trung Quốc', 'Khoa học công nghệ hiện đại', 'Âm nhạc phương tây'], correct: 0, expl: '对中国历史和文化非常感兴趣 (rất có hứng thú với lịch sử và văn hóa TQ).' }
          ]
        },
        {
          name: 'Phần 2: Đọc Hiểu & Ngữ Pháp (阅读)',
          description: 'Đọc hiểu đoạn văn và vận dụng ngữ pháp HSK 3 để trả lời câu hỏi.',
          questions: [
            { id: 'h3_r1', prompt: 'Điền giới từ câu chữ 把: <b>请你____桌子上的书整理一下。</b>', options: ['被', '把', '给'], correct: 1, expl: 'Câu chữ 把 diễn tả sự tác động lên tân ngữ: 把 + O + V.' },
            { id: 'h3_r2', prompt: 'Điền liên từ: <b>____天气很冷，____他还是坚持每天晨跑。</b>', options: ['虽然…但是…', '不但…而且…', '只有…才…'], correct: 0, expl: 'Mối quan hệ nhượng bộ/tương phản dùng 虽然…但是… (mặc dù... nhưng...).' },
            { id: 'h3_r3', prompt: 'Điền câu chữ 被: <b>桌子上的蛋糕____弟弟吃光了。</b>', options: ['把', '被', '让'], correct: 1, expl: 'Câu bị động dùng 被: Bánh ngọt bị em trai ăn hết sạch.' },
            { id: 'h3_r4', prompt: 'Chọn từ thích hợp: <b>经过努力，他的中文口语水平有了很大的____。</b>', options: ['提高', '打算', '满意'], correct: 0, expl: '有了很大的提高 (có sự nâng cao/tiến bộ lớn).' },
            { id: 'h3_r5', prompt: 'Chọn liên từ thích hợp: <b>她____会说汉语，____法语也说得很流利。</b>', options: ['因为…所以…', '不但…而且…', '虽然…但是…'], correct: 1, expl: 'Tăng tiến dùng 不但…而且… (không những... mà còn...).' },
            { id: 'h3_r6', prompt: '<b>"不管遇到多大的困难，只要坚持努力，就一定会成功。"</b> — Ý chính là:', options: ['Thành công chỉ nhờ may mắn', 'Chỉ cần kiên trì nỗ lực thì sẽ thành công', 'Gặp khó khăn lớn thì nên đổi hướng'], correct: 1, expl: '只要坚持努力，就一定会成功 (chỉ cần kiên trì nỗ lực thì sẽ thành công).' },
            { id: 'h3_r7', prompt: 'Điền từ ngữ cảnh văn phòng: <b>经理对这次活动策划非常____。</b>', options: ['特别', '满意', '热情'], correct: 1, expl: '对…非常满意 (đối với... rất hài lòng).' },
            { id: 'h3_r8', prompt: 'Chọn cấu trúc biểu thị hành động sắp xảy ra:', options: ['就要…了', '正在…呢', '以前…了'], correct: 0, expl: '就要…了 (sắp... rồi) biểu thị hành động sắp sửa xảy ra trong tương lai gần.' },
            { id: 'h3_r9', prompt: '<b>"他是一个很有工作____的人，处理事情总是又快又好。"</b>', options: ['热情', '环境', '经验'], correct: 2, expl: '工作经验 (kinh nghiệm làm việc).' },
            { id: 'h3_r10', prompt: 'Chọn trật tự câu đúng với bổ ngữ xu hướng kép:', options: ['他从书包里拿出来了一本词典。', '他从书包里拿一本词典出来。', '他拿出来从书包里一本词典。'], correct: 0, expl: 'Động từ + 出来 + 了 + số lượng + danh từ (拿出来了一本词典).' }
          ]
        }
      ]
    }
  };

  // State phòng thi đang hoạt động
  let currentExam = null;
  let timerInterval = null;
  let remainingSeconds = 0;
  let userAnswers = {};

  // Phát âm cho câu hỏi nghe
  function playExamAudio(text) {
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

  // Khởi tạo và render đề thi thử
  function startExam(levelKey, containerId) {
    const data = EXAM_BANK[levelKey];
    if (!data) return;

    currentExam = {
      levelKey,
      data,
      totalQuestions: data.sections.reduce((acc, s) => acc + s.questions.length, 0),
      submitted: false
    };

    userAnswers = {};
    remainingSeconds = data.durationMinutes * 60;

    const container = document.getElementById(containerId);
    if (!container) return;

    renderExamInterface(container);
    startTimer();
  }

  function startTimer() {
    clearInterval(timerInterval);
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplay();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        alert('⏰ Đã hết thời gian làm bài! Hệ thống sẽ tự động nộp bài thi của bạn.');
        submitExam();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const timerElem = document.getElementById('examTimer');
    const box = document.getElementById('examTimerBox');
    if (!timerElem) return;

    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerElem.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (box) {
      if (remainingSeconds <= 300) { // Dưới 5 phút
        box.classList.add('warning');
      } else {
        box.classList.remove('warning');
      }
    }
  }

  function renderExamInterface(container) {
    const data = currentExam.data;

    container.innerHTML = `
      <div class="exam-container">
        <header class="exam-header">
          <div class="exam-title-box">
            <span class="exam-kicker">MÔ PHỎNG KỲ THI NĂNG LỰC HÁN NGỮ · HSK ${data.level}</span>
            <h2>🎓 ${data.title}</h2>
            <div style="font-size:14px; color:#64748b; display:flex; gap:16px; margin-top:4px;">
              <span>⏱️ Thời gian: <b>${data.durationMinutes} phút</b></span>
              <span>🎯 Điểm tối đa: <b>${data.totalScore} điểm</b></span>
              <span>🏁 Điểm đỗ: <b>≥ ${data.passScore} điểm</b></span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <button type="button" class="btn" style="background:#f1f5f9; color:#334155; font-size:13px; font-weight:700; border:1px solid #cbd5e1; padding:7px 12px; border-radius:9px;" onclick="document.querySelector('#nav .week:not(.mock-exam-btn)')?.click()">
              ← Quay lại bài học
            </button>
            <div class="exam-timer-box" id="examTimerBox">
              <span style="font-size:18px;">⏱️</span>
              <div>
                <small style="display:block; font-size:10px; font-weight:700; color:#64748b;">THỜI GIAN CÒN LẠI</small>
                <span class="timer-digits" id="examTimer">--:--</span>
              </div>
            </div>
          </div>
        </header>

        <div class="exam-progress">
          <div class="exam-progress-fill" id="examProgressFill"></div>
        </div>

        <form id="examForm">
          ${data.sections.map((section, sIndex) => `
            <div class="exam-section">
              <div class="exam-section-title">
                <span>${section.name}</span>
                <small style="font-size:12px; font-weight:normal; color:#64748b;">${section.questions.length} câu</small>
              </div>
              <p style="font-size:13px; color:#64748b; margin:-6px 0 16px 4px;">${section.description}</p>
              
              ${section.questions.map((q, qIndex) => {
                const globalIndex = (sIndex === 0 ? qIndex + 1 : data.sections[0].questions.length + qIndex + 1);
                return `
                  <div class="exam-q-card" id="qCard_${q.id}">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="exam-q-num">Câu ${globalIndex} / ${currentExam.totalQuestions}</span>
                      ${q.type === 'listening' ? `
                        <button type="button" class="btn" style="padding:4px 10px; font-size:12px; background:#f0edff; color:#6657d9; border:1px solid #d9d5ff;" onclick="window.HSKMockExam.playAudio('${q.audio}')">
                          🔊 Nghe phát âm
                        </button>
                      ` : ''}
                    </div>
                    <div class="exam-prompt">${q.prompt}</div>
                    <div class="exam-options">
                      ${q.options.map((opt, optIndex) => `
                        <label class="exam-option-label">
                          <input type="radio" name="${q.id}" value="${optIndex}" onchange="window.HSKMockExam.onSelectAnswer('${q.id}', ${optIndex})">
                          <span class="opt-text">${String.fromCharCode(65 + optIndex)}. ${opt}</span>
                        </label>
                      `).join('')}
                    </div>
                    <div class="exam-expl-box" id="expl_${q.id}" style="display:none;"></div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}

          <div class="exam-actions">
            <button type="button" class="btn-submit-exam" onclick="window.HSKMockExam.submit()">
              🏁 Nộp Bài Thi Thử
            </button>
          </div>
        </form>
      </div>
    `;

    updateProgress();
  }

  function onSelectAnswer(qId, optIndex) {
    userAnswers[qId] = optIndex;
    updateProgress();
  }

  function updateProgress() {
    const answeredCount = Object.keys(userAnswers).length;
    const total = currentExam.totalQuestions;
    const pct = Math.round((answeredCount / total) * 100);
    const bar = document.getElementById('examProgressFill');
    if (bar) bar.style.width = pct + '%';
  }

  // Nộp bài & Chấm điểm
  function submitExam() {
    if (!currentExam || currentExam.submitted) return;

    clearInterval(timerInterval);
    currentExam.submitted = true;

    const data = currentExam.data;
    let correctCount = 0;
    const total = currentExam.totalQuestions;

    // Chấm điểm từng câu
    data.sections.forEach(section => {
      section.questions.forEach(q => {
        const userChoice = userAnswers[q.id];
        const isCorrect = userChoice === q.correct;
        if (isCorrect) correctCount++;

        // Hiển thị giải thích chi tiết
        const explBox = document.getElementById(`expl_${q.id}`);
        if (explBox) {
          explBox.style.display = 'block';
          if (isCorrect) {
            explBox.innerHTML = `
              <div class="expl-correct">✓ Chính xác! (+${Math.round(data.totalScore / total)} điểm)</div>
              <div style="color:#334155; margin-top:4px;"><b>Giải thích:</b> ${q.expl}</div>
            `;
          } else {
            const correctOpt = q.options[q.correct];
            explBox.innerHTML = `
              <div class="expl-wrong">✗ Chưa chính xác. Đáp án đúng là: <b>${String.fromCharCode(65 + q.correct)}. ${correctOpt}</b></div>
              <div style="color:#334155; margin-top:4px;"><b>Giải thích:</b> ${q.expl}</div>
            `;
          }
        }
      });
    });

    const scaledScore = Math.round((correctCount / total) * data.totalScore);
    const passed = scaledScore >= data.passScore;

    // Lưu điểm cao nhất
    const bestKey = `${currentExam.levelKey}_mock_best`;
    const previousBest = Number(localStorage.getItem(bestKey)) || 0;
    if (scaledScore > previousBest) {
      localStorage.setItem(bestKey, String(scaledScore));
    }

    // Hiển thị kết quả banner đầu trang
    const form = document.getElementById('examForm');
    const existingBanner = document.getElementById('examResultBanner');
    if (existingBanner) existingBanner.remove();

    const banner = document.createElement('div');
    banner.id = 'examResultBanner';
    banner.className = `exam-result-banner ${passed ? 'pass' : 'fail'}`;
    banner.innerHTML = `
      <div style="font-size:32px;">${passed ? '🎉' : '📚'}</div>
      <h3 style="font-size:22px; margin:6px 0;">${passed ? 'XIN CHÚC MỪNG! BẠN ĐÃ ĐỖ ĐỀ THI THỬ!' : 'BẠN CẦN CỐ GẮNG THÊM MỘT CHÚT!'}</h3>
      <p style="margin:4px 0;">Đạt <b>${correctCount}/${total}</b> câu đúng · Kết quả quy đổi:</p>
      <div class="exam-result-score">${scaledScore} / ${data.totalScore} ĐIỂM</div>
      <p style="font-size:14px; font-weight:600;">
        ${passed 
          ? `✓ Bạn đã vượt qua mức điểm chuẩn (≥ ${data.passScore} điểm) để đạt chứng chỉ HSK ${data.level}.` 
          : `Mức điểm đỗ yêu cầu là ≥ ${data.passScore} điểm. Hãy xem lại các câu giải thích chi tiết bên dưới rồi luyện tập lại nhé.`}
      </p>
      <div style="margin-top:16px; display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <button type="button" class="btn" style="background:#fff; color:#1e1b4b; border:1px solid #cbd5e1; font-weight:700;" onclick="window.HSKMockExam.start('${currentExam.levelKey}', 'mainExamHost')">
          🔄 Làm lại đề thi này
        </button>
        ${passed ? `
          <button type="button" class="btn" style="background:#b45309; color:#fff; font-weight:800; border:0; padding:10px 18px; border-radius:10px; cursor:pointer; box-shadow:0 4px 14px rgba(180,83,9,0.3);" onclick="if(window.HSKCertificate) window.HSKCertificate.open({ level: 'HSK ${data.level}' })">
            🎓 Nhận Chứng Chỉ Tốt Nghiệp HSK
          </button>
        ` : ''}
      </div>
    `;

    form.prepend(banner);
    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Hiệu ứng pháo hoa và âm thanh nếu đỗ
    if (passed) {
      if (window.HSKAudioFX) {
        window.HSKAudioFX.playVictory();
        window.HSKAudioFX.confetti(120);
      }
      if (window.HSKDailyGoal) {
        window.HSKDailyGoal.addDailyXP(50);
      }
      if (window.Gamification) {
        window.Gamification.confetti();
        window.Gamification.playSuccessSound();
        window.Gamification.addXP?.(100);
      }
    } else {
      if (window.HSKAudioFX) {
        window.HSKAudioFX.playWrong();
      } else if (window.Gamification) {
        window.Gamification.playErrorSound();
      }
    }
  }

  // Gắn nút "🎓 Đề thi thử" vào Sidebar của mỗi trang khóa học
  function attachExamButton(levelKey, navContainerId, targetHostId = 'mainExamHost') {
    const nav = document.getElementById(navContainerId);
    if (!nav) return;

    // Tránh gắn trùng
    if (nav.querySelector(`.mock-exam-btn[data-level="${levelKey}"]`)) return;

    const data = EXAM_BANK[levelKey];
    if (!data) return;

    const bestScore = localStorage.getItem(`${levelKey}_mock_best`);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'week mock-exam-btn';
    btn.dataset.level = levelKey;
    btn.innerHTML = `
      <span>🎓 Đề thi thử HSK ${data.level}</span>
      <span class="mock-exam-badge">${bestScore ? bestScore + 'đ' : 'Thi ngay'}</span>
    `;

    btn.onclick = () => {
      // Đánh dấu active trên sidebar
      nav.querySelectorAll('.week').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Ẩn nội dung học bài thông thường, mở container thi thử
      const hero = document.querySelector('.hero');
      const card = document.querySelector('.card');
      const stats = document.querySelector('.stats');
      const gamify = document.querySelector('.gamify');
      const achievementBar = document.getElementById('achievementBar');

      if (hero) hero.hidden = true;
      if (card) card.hidden = true;
      if (stats) stats.hidden = true;
      if (gamify) gamify.hidden = true;
      if (achievementBar) achievementBar.hidden = true;

      let host = document.getElementById(targetHostId);
      if (!host) {
        host = document.createElement('div');
        host.id = targetHostId;
        const wrap = document.querySelector('.wrap') || document.querySelector('.main') || document.body;
        wrap.appendChild(host);
      }

      host.hidden = false;
      startExam(levelKey, targetHostId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    nav.appendChild(btn);
  }

  window.HSKMockExam = {
    start: startExam,
    submit: submitExam,
    playAudio: playExamAudio,
    onSelectAnswer,
    attachExamButton,
    getBank: () => EXAM_BANK
  };
})();