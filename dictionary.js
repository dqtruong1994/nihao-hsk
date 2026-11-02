/**
 * Hanzi Dictionary, Voice Search & AI Sentence Analyzer Module
 * Tra cứu Hán tự, Tìm kiếm bằng giọng nói & Phân tích cấu trúc câu tiếng Trung chuyên sâu
 */
(() => {
  'use strict';

  let currentTab = 'search'; // 'search' | 'analyzer'
  let voiceLang = 'zh-CN'; // 'zh-CN' | 'vi-VN'
  let recognitionInstance = null;
  let isListeningDict = false;
  let isListeningAnalyzer = false;

  // ================================================================
  // 1. CƠ SỞ DỮ LIỆU TỪ ĐIỂN HSK 1, 2, 3 KÈM TỪ LOẠI (POS TAGGING)
  // ================================================================
  let dictionaryCache = null;

  function buildDictionaryDatabase() {
    if (dictionaryCache) return dictionaryCache;

    const words = [
      // HSK 1
      { hanzi: '你好', pinyin: 'nǐ hǎo', hv: 'nhĩ hảo', meaning: 'xin chào', level: 'HSK 1', pos: 'Chào hỏi', topic: 'Chào hỏi' },
      { hanzi: '您好', pinyin: 'nín hǎo', hv: 'nhĩ hảo', meaning: 'xin chào (lịch sự, kính ngữ)', level: 'HSK 1', pos: 'Chào hỏi', topic: 'Chào hỏi' },
      { hanzi: '我', pinyin: 'wǒ', hv: 'ngã', meaning: 'tôi, mình', level: 'HSK 1', pos: 'Đại từ', topic: 'Đại từ' },
      { hanzi: '你', pinyin: 'nǐ', hv: 'nhĩ', meaning: 'bạn, cậu', level: 'HSK 1', pos: 'Đại từ', topic: 'Đại từ' },
      { hanzi: '他', pinyin: 'tā', hv: 'tha', meaning: 'anh ấy, ông ấy', level: 'HSK 1', pos: 'Đại từ', topic: 'Đại từ' },
      { hanzi: '她', pinyin: 'tā', hv: 'tha', meaning: 'cô ấy, bà ấy', level: 'HSK 1', pos: 'Đại từ', topic: 'Đại từ' },
      { hanzi: '我们', pinyin: 'wǒmen', hv: 'ngã môn', meaning: 'chúng tôi, chúng ta', level: 'HSK 1', pos: 'Đại từ', topic: 'Đại từ' },
      { hanzi: '叫', pinyin: 'jiào', hv: 'khiếu', meaning: 'gọi, tên là', level: 'HSK 1', pos: 'Động từ', topic: 'Giới thiệu' },
      { hanzi: '名字', pinyin: 'míngzi', hv: 'danh tự', meaning: 'tên, danh xưng', level: 'HSK 1', pos: 'Danh từ', topic: 'Giới thiệu' },
      { hanzi: '是', pinyin: 'shì', hv: 'thị', meaning: 'là, đúng', level: 'HSK 1', pos: 'Động từ phán đoán', topic: 'Phán đoán' },
      { hanzi: '不是', pinyin: 'bú shì', hv: 'bất thị', meaning: 'không phải', level: 'HSK 1', pos: 'Cụm phủ định', topic: 'Phán đoán' },
      { hanzi: '不', pinyin: 'bù', hv: 'bất', meaning: 'không, chẳng', level: 'HSK 1', pos: 'Phó từ phủ định', topic: 'Phủ định' },
      { hanzi: '没', pinyin: 'méi', hv: 'mộc', meaning: 'chưa, không có', level: 'HSK 1', pos: 'Phó từ phủ định', topic: 'Phủ định' },
      { hanzi: '很', pinyin: 'hěn', hv: 'hẩn', meaning: 'rất, quá', level: 'HSK 1', pos: 'Phó từ mức độ', topic: 'Phó từ' },
      { hanzi: '太', pinyin: 'tài', hv: 'thái', meaning: 'quá, lắm', level: 'HSK 1', pos: 'Phó từ', topic: 'Phó từ' },
      { hanzi: '真', pinyin: 'zhēn', hv: 'chân', meaning: 'thật, thật là', level: 'HSK 1', pos: 'Phó từ', topic: 'Phó từ' },
      { hanzi: '中国', pinyin: 'Zhōngguó', hv: 'Trung Quốc', meaning: 'Trung Quốc', level: 'HSK 1', pos: 'Danh từ riêng', topic: 'Quốc gia' },
      { hanzi: '越南', pinyin: 'Yuènán', hv: 'Việt Nam', meaning: 'Việt Nam', level: 'HSK 1', pos: 'Danh từ riêng', topic: 'Quốc gia' },
      { hanzi: '老师', pinyin: 'lǎoshī', hv: 'lão sư', meaning: 'thầy cô giáo', level: 'HSK 1', pos: 'Danh từ', topic: 'Nghề nghiệp' },
      { hanzi: '学生', pinyin: 'xuésheng', hv: 'học sinh', meaning: 'học sinh, sinh viên', level: 'HSK 1', pos: 'Danh từ', topic: 'Nghề nghiệp' },
      { hanzi: '爸爸', pinyin: 'bàba', hv: 'ba ba', meaning: 'bố, cha', level: 'HSK 1', pos: 'Danh từ', topic: 'Gia đình' },
      { hanzi: '妈妈', pinyin: 'māma', hv: 'ma ma', meaning: 'mẹ, má', level: 'HSK 1', pos: 'Danh từ', topic: 'Gia đình' },
      { hanzi: '吃', pinyin: 'chī', hv: 'ngật', meaning: 'ăn', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '喝', pinyin: 'hē', hv: 'hát', meaning: 'uống', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '茶', pinyin: 'chá', hv: 'trà', meaning: 'trà, chè', level: 'HSK 1', pos: 'Danh từ', topic: 'Đồ uống' },
      { hanzi: '水', pinyin: 'shuǐ', hv: 'thủy', meaning: 'nước', level: 'HSK 1', pos: 'Danh từ', topic: 'Đồ uống' },
      { hanzi: '米饭', pinyin: 'mǐfàn', hv: 'mễ phạn', meaning: 'cơm', level: 'HSK 1', pos: 'Danh từ', topic: 'Ăn uống' },
      { hanzi: '菜', pinyin: 'cài', hv: 'thái', meaning: 'món ăn, rau', level: 'HSK 1', pos: 'Danh từ', topic: 'Ăn uống' },
      { hanzi: '看', pinyin: 'kàn', hv: 'khán', meaning: 'xem, nhìn, đọc', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '听', pinyin: 'tīng', hv: 'thính', meaning: 'nghe', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '说', pinyin: 'shuō', hv: 'thuyết', meaning: 'nói', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '读', pinyin: 'dú', hv: 'độc', meaning: 'đọc', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '写', pinyin: 'xiě', hv: 'tả', meaning: 'viết', level: 'HSK 1', pos: 'Động từ', topic: 'Hoạt động' },
      { hanzi: '书', pinyin: 'shū', hv: 'thư', meaning: 'sách', level: 'HSK 1', pos: 'Danh từ', topic: 'Học tập' },
      { hanzi: '本', pinyin: 'běn', hv: 'bản', meaning: 'quyển, cuốn', level: 'HSK 1', pos: 'Lượng từ', topic: 'Lượng từ' },
      { hanzi: '个', pinyin: 'gè', hv: 'cá', meaning: 'cái, con, người', level: 'HSK 1', pos: 'Lượng từ', topic: 'Lượng từ' },
      { hanzi: '杯', pinyin: 'bēi', hv: 'bôi', meaning: 'ly, cốc', level: 'HSK 1', pos: 'Lượng từ', topic: 'Lượng từ' },
      { hanzi: '喜欢', pinyin: 'xǐhuan', hv: 'hỉ hoan', meaning: 'thích, yêu thích', level: 'HSK 1', pos: 'Động từ tâm lý', topic: 'Cảm xúc' },
      { hanzi: '想', pinyin: 'xiǎng', hv: 'tưởng', meaning: 'muốn, nhớ, nghĩ', level: 'HSK 1', pos: 'Động từ năng nguyện', topic: 'Nguyện vọng' },
      { hanzi: '要', pinyin: 'yào', hv: 'yếu', meaning: 'muốn, cần, phải', level: 'HSK 1', pos: 'Động từ năng nguyện', topic: 'Nguyện vọng' },
      { hanzi: '能', pinyin: 'néng', hv: 'năng', meaning: 'có thể', level: 'HSK 1', pos: 'Động từ năng nguyện', topic: 'Khả năng' },
      { hanzi: '会', pinyin: 'huì', hv: 'hội', meaning: 'biết, sẽ', level: 'HSK 1', pos: 'Động từ năng nguyện', topic: 'Khả năng' },
      { hanzi: '学校', pinyin: 'xuéxiào', hv: 'học hiệu', meaning: 'trường học', level: 'HSK 1', pos: 'Danh từ', topic: 'Địa điểm' },
      { hanzi: '家', pinyin: 'jiā', hv: 'gia', meaning: 'nhà, gia đình', level: 'HSK 1', pos: 'Danh từ', topic: 'Gia đình' },
      { hanzi: '买', pinyin: 'mǎi', hv: 'mãi', meaning: 'mua', level: 'HSK 1', pos: 'Động từ', topic: 'Mua sắm' },
      { hanzi: '卖', pinyin: 'mài', hv: 'mại', meaning: 'bán', level: 'HSK 1', pos: 'Động từ', topic: 'Mua sắm' },
      { hanzi: '钱', pinyin: 'qián', hv: 'tiền', meaning: 'tiền bạc', level: 'HSK 1', pos: 'Danh từ', topic: 'Mua sắm' },
      { hanzi: '今天', pinyin: 'jīntiān', hv: 'kim thiên', meaning: 'hôm nay', level: 'HSK 1', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '明天', pinyin: 'míngtiān', hv: 'minh thiên', meaning: 'ngày mai', level: 'HSK 1', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '昨天', pinyin: 'zuótiān', hv: 'tạc thiên', meaning: 'hôm qua', level: 'HSK 1', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '现在', pinyin: 'xiànzài', hv: 'hiện tại', meaning: 'bây giờ, hiện tại', level: 'HSK 1', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '天气', pinyin: 'tiānqì', hv: 'thiên khí', meaning: 'thời tiết', level: 'HSK 1', pos: 'Danh từ', topic: 'Thời tiết' },
      { hanzi: '冷', pinyin: 'lěng', hv: 'lãnh', meaning: 'lạnh', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '热', pinyin: 'rè', hv: 'nhiệt', meaning: 'nóng', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '好', pinyin: 'hǎo', hv: 'hảo', meaning: 'tốt, đẹp, xong', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '大', pinyin: 'dà', hv: 'đại', meaning: 'to, lớn', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '小', pinyin: 'xiǎo', hv: 'tiểu', meaning: 'nhỏ, bé', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '漂亮', pinyin: 'piàoliang', hv: 'phiêu lượng', meaning: 'xinh đẹp', level: 'HSK 1', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '高兴', pinyin: 'gāoxìng', hv: 'cao hứng', meaning: 'vui vẻ, phấn khởi', level: 'HSK 1', pos: 'Tính từ', topic: 'Cảm xúc' },
      { hanzi: '的', pinyin: 'de', hv: 'đích', meaning: 'của, mà (trợ từ kết cấu)', level: 'HSK 1', pos: 'Trợ từ kết cấu', topic: 'Ngữ pháp' },
      { hanzi: '了', pinyin: 'le', hv: 'liễu', meaning: 'rồi (trợ từ động thái/ngữ khí)', level: 'HSK 1', pos: 'Trợ từ', topic: 'Ngữ pháp' },
      { hanzi: '吗', pinyin: 'ma', hv: 'ma', meaning: 'sao, không (hỏi)', level: 'HSK 1', pos: 'Trợ từ nghi vấn', topic: 'Ngữ pháp' },
      { hanzi: '呢', pinyin: 'ne', hv: 'ni', meaning: 'thế, đâu (hỏi)', level: 'HSK 1', pos: 'Trợ từ ngữ khí', topic: 'Ngữ pháp' },
      { hanzi: '什么', pinyin: 'shénme', hv: 'thập ma', meaning: 'cái gì, gì', level: 'HSK 1', pos: 'Đại từ nghi vấn', topic: 'Nghi vấn' },
      { hanzi: '谁', pinyin: 'shuí', hv: 'thùy', meaning: 'ai', level: 'HSK 1', pos: 'Đại từ nghi vấn', topic: 'Nghi vấn' },
      { hanzi: '哪儿', pinyin: 'nǎr', hv: 'nả', meaning: 'ở đâu, chỗ nào', level: 'HSK 1', pos: 'Đại từ nghi vấn', topic: 'Nghi vấn' },
      { hanzi: '怎么', pinyin: 'zěnme', hv: 'chẩm ma', meaning: 'làm sao, thế nào', level: 'HSK 1', pos: 'Đại từ nghi vấn', topic: 'Nghi vấn' },

      // HSK 2
      { hanzi: '起床', pinyin: 'qǐchuáng', hv: 'khởi sàng', meaning: 'thức dậy', level: 'HSK 2', pos: 'Động từ', topic: 'Sinh hoạt' },
      { hanzi: '跑步', pinyin: 'pǎobù', hv: 'bào bộ', meaning: 'chạy bộ', level: 'HSK 2', pos: 'Động từ', topic: 'Thể thao' },
      { hanzi: '生病', pinyin: 'shēngbìng', hv: 'sinh bệnh', meaning: 'bị ốm', level: 'HSK 2', pos: 'Động từ', topic: 'Sức khỏe' },
      { hanzi: '医院', pinyin: 'yīyuàn', hv: 'y viện', meaning: 'bệnh viện', level: 'HSK 2', pos: 'Danh từ', topic: 'Địa điểm' },
      { hanzi: '穿', pinyin: 'chuān', hv: 'xuyên', meaning: 'mặc (áo), đi (giày)', level: 'HSK 2', pos: 'Động từ', topic: 'Trang phục' },
      { hanzi: '衣服', pinyin: 'yīfu', hv: 'y phục', meaning: 'quần áo', level: 'HSK 2', pos: 'Danh từ', topic: 'Trang phục' },
      { hanzi: '旅游', pinyin: 'lǚyóu', hv: 'lữ du', meaning: 'du lịch', level: 'HSK 2', pos: 'Động từ', topic: 'Du lịch' },
      { hanzi: '准备', pinyin: 'zhǔnbèi', hv: 'chuẩn bị', meaning: 'chuẩn bị', level: 'HSK 2', pos: 'Động từ', topic: 'Kế hoạch' },
      { hanzi: '帮助', pinyin: 'bāngzhù', hv: 'bang trợ', meaning: 'giúp đỡ', level: 'HSK 2', pos: 'Động từ', topic: 'Giao tiếp' },
      { hanzi: '快', pinyin: 'kuài', hv: 'khoái', meaning: 'nhanh, sắp', level: 'HSK 2', pos: 'Tính từ / Phó từ', topic: 'Tính từ' },
      { hanzi: '慢', pinyin: 'màn', hv: 'mạn', meaning: 'chậm', level: 'HSK 2', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '远', pinyin: 'yuǎn', hv: 'viễn', meaning: 'xa', level: 'HSK 2', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '近', pinyin: 'jìn', hv: 'cận', meaning: 'gần', level: 'HSK 2', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '虽然', pinyin: 'suīrán', hv: 'tuy nhiên', meaning: 'tuy rằng, mặc dù', level: 'HSK 2', pos: 'Liên từ', topic: 'Liên từ' },
      { hanzi: '但是', pinyin: 'dànshì', hv: 'đãn thị', meaning: 'nhưng mà', level: 'HSK 2', pos: 'Liên từ', topic: 'Liên từ' },
      { hanzi: '因为', pinyin: 'yīnwèi', hv: 'nhân vi', meaning: 'bởi vì', level: 'HSK 2', pos: 'Liên từ', topic: 'Liên từ' },
      { hanzi: '所以', pinyin: 'suǒyǐ', hv: 'sở dĩ', meaning: 'cho nên, vì vậy', level: 'HSK 2', pos: 'Liên từ', topic: 'Liên từ' },
      { hanzi: '比', pinyin: 'bǐ', hv: 'tỷ', meaning: 'so với', level: 'HSK 2', pos: 'Giới từ so sánh', topic: 'Ngữ pháp' },
      { hanzi: '得', pinyin: 'de', hv: 'đắc', meaning: 'được (trợ từ kết cấu bổ ngữ)', level: 'HSK 2', pos: 'Trợ từ bổ ngữ', topic: 'Ngữ pháp' },
      { hanzi: '着', pinyin: 'zhe', hv: 'trước', meaning: 'đang (trợ từ tiếp diễn)', level: 'HSK 2', pos: 'Trợ từ động thái', topic: 'Ngữ pháp' },
      { hanzi: '过', pinyin: 'guo', hv: 'quá', meaning: 'từng (trợ từ trải nghiệm)', level: 'HSK 2', pos: 'Trợ từ động thái', topic: 'Ngữ pháp' },
      { hanzi: '火车站', pinyin: 'huǒchēzhàn', hv: 'hỏa xa trạm', meaning: 'ga tàu hỏa', level: 'HSK 2', pos: 'Danh từ', topic: 'Giao thông' },
      { hanzi: '公共汽车', pinyin: 'gōnggòng qìchē', hv: 'công cộng khí xa', meaning: 'xe buýt', level: 'HSK 2', pos: 'Danh từ', topic: 'Giao thông' },

      // HSK 3
      { hanzi: '打算', pinyin: 'dǎsuàn', hv: 'đả toán', meaning: 'dự định, tính toán', level: 'HSK 3', pos: 'Động từ / Danh từ', topic: 'Kế hoạch' },
      { hanzi: '复习', pinyin: 'fùxí', hv: 'phục tập', meaning: 'ôn tập', level: 'HSK 3', pos: 'Động từ', topic: 'Học tập' },
      { hanzi: '安排', pinyin: 'ānpái', hv: 'an bài', meaning: 'sắp xếp, bố trí', level: 'HSK 3', pos: 'Động từ', topic: 'Công việc' },
      { hanzi: '完成', pinyin: 'wánchéng', hv: 'hoàn thành', meaning: 'hoàn thành', level: 'HSK 3', pos: 'Động từ', topic: 'Công việc' },
      { hanzi: '提高', pinyin: 'tígāo', hv: 'đề cao', meaning: 'nâng cao, cải thiện', level: 'HSK 3', pos: 'Động từ', topic: 'Học tập' },
      { hanzi: '认真', pinyin: 'rènzhēn', hv: 'nhận chân', meaning: 'chăm chỉ, nghiêm túc', level: 'HSK 3', pos: 'Tính từ', topic: 'Tính cách' },
      { hanzi: '照顾', pinyin: 'zhàogù', hv: 'chiếu cố', meaning: 'chăm sóc', level: 'HSK 3', pos: 'Động từ', topic: 'Đời sống' },
      { hanzi: '感冒', pinyin: 'gǎnmào', hv: 'cảm mạo', meaning: 'cảm cúm', level: 'HSK 3', pos: 'Động từ / Danh từ', topic: 'Sức khỏe' },
      { hanzi: '突然', pinyin: 'tūrán', hv: 'đột nhiên', meaning: 'đột nhiên, bất ngờ', level: 'HSK 3', pos: 'Phó từ / Tính từ', topic: 'Phó từ' },
      { hanzi: '清楚', pinyin: 'qīngchu', hv: 'thanh sở', meaning: 'rõ ràng, minh bạch', level: 'HSK 3', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '刚才', pinyin: 'gāngcái', hv: 'cương tài', meaning: 'vừa nãy, lúc nãy', level: 'HSK 3', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '周末', pinyin: 'zhōumò', hv: 'chu vi mạt', meaning: 'cuối tuần', level: 'HSK 3', pos: 'Danh từ thời gian', topic: 'Thời gian' },
      { hanzi: '饮料', pinyin: 'yǐnliào', hv: 'ẩm liệu', meaning: 'đồ uống, thức uống', level: 'HSK 3', pos: 'Danh từ', topic: 'Ăn uống' },
      { hanzi: '舒服', pinyin: 'shūfu', hv: 'thư phục', meaning: 'thoải mái, dễ chịu', level: 'HSK 3', pos: 'Tính từ', topic: 'Cảm giác' },
      { hanzi: '把', pinyin: 'bǎ', hv: 'bả', meaning: 'đem, lấy (câu chữ 把)', level: 'HSK 3', pos: 'Giới từ xử lý', topic: 'Ngữ pháp' },
      { hanzi: '被', pinyin: 'bèi', hv: 'bị', meaning: 'bị, được (câu chữ 被)', level: 'HSK 3', pos: 'Giới từ bị động', topic: 'Ngữ pháp' },
      { hanzi: '地', pinyin: 'de', hv: 'địa', meaning: 'một cách (trợ từ trạng ngữ)', level: 'HSK 3', pos: 'Trợ từ trạng ngữ', topic: 'Ngữ pháp' },
      { hanzi: '完', pinyin: 'wán', hv: 'hoàn', meaning: 'xong, hết (bổ ngữ kết quả)', level: 'HSK 3', pos: 'Bổ ngữ kết quả', topic: 'Ngữ pháp' },
      { hanzi: '懂', pinyin: 'dǒng', hv: 'đổng', meaning: 'hiểu (bổ ngữ kết quả)', level: 'HSK 3', pos: 'Động từ / Bổ ngữ', topic: 'Ngữ pháp' },
      { hanzi: '见', pinyin: 'jiàn', hv: 'kiến', meaning: 'thấy, gặp (bổ ngữ kết quả)', level: 'HSK 3', pos: 'Động từ / Bổ ngữ', topic: 'Ngữ pháp' },
      { hanzi: '到', pinyin: 'dào', hv: 'đáo', meaning: 'đến, được (bổ ngữ kết quả)', level: 'HSK 3', pos: 'Giới từ / Bổ ngữ', topic: 'Ngữ pháp' },
      { hanzi: '熊猫', pinyin: 'xióngmāo', hv: 'hùng miêu', meaning: 'gấu trúc', level: 'HSK 3', pos: 'Danh từ', topic: 'Động vật' },
      { hanzi: '担心', pinyin: 'dānxīn', hv: 'đam tâm', meaning: 'lo lắng, băn khoăn', level: 'HSK 3', pos: 'Động từ tâm lý', topic: 'Tâm lý' },
      { hanzi: '方便', pinyin: 'fāngbiàn', hv: 'phương tiện', meaning: 'tiện lợi, thuận tiện', level: 'HSK 3', pos: 'Tính từ', topic: 'Tính từ' },
      { hanzi: '空调', pinyin: 'kōngtiáo', hv: 'không điều', meaning: 'máy điều hòa', level: 'HSK 3', pos: 'Danh từ', topic: 'Đồ gia dụng' },
      { hanzi: '护照', pinyin: 'hùzhào', hv: 'hộ chiếu', meaning: 'hộ chiếu', level: 'HSK 3', pos: 'Danh từ', topic: 'Du lịch' },
      { hanzi: '行李箱', pinyin: 'xínglixiāng', hv: 'hành lý tương', meaning: 'vali hành lý', level: 'HSK 3', pos: 'Danh từ', topic: 'Du lịch' },
      { hanzi: '终于', pinyin: 'zhōngyú', hv: 'chung vu', meaning: 'cuối cùng, rốt cuộc', level: 'HSK 3', pos: 'Phó từ', topic: 'Phó từ' },
      { hanzi: '除了', pinyin: 'chúle', hv: 'trừ liễu', meaning: 'ngoài ra, trừ phi', level: 'HSK 3', pos: 'Liên từ', topic: 'Liên từ' },
      { hanzi: '极了', pinyin: 'jí le', hv: 'cực liễu', meaning: 'cực kỳ, hết sức', level: 'HSK 3', pos: 'Bổ ngữ mức độ', topic: 'Phó từ' }
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

  // ================================================================
  // 2. NHẬN DIỆN GIỌNG NÓI (SPEECH RECOGNITION ĐA NGÔN NGỮ)
  // ================================================================
  function getSpeechRecognizer(lang, onResult, onEnd, onError) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API. Vui lòng sử dụng Google Chrome hoặc Edge.');
      return null;
    }

    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;

    rec.onresult = (e) => {
      if (e.results && e.results[0] && e.results[0][0]) {
        const text = e.results[0][0].transcript;
        if (typeof onResult === 'function') onResult(text);
      }
    };

    rec.onerror = (err) => {
      if (typeof onError === 'function') onError(err);
    };

    rec.onend = () => {
      if (typeof onEnd === 'function') onEnd();
    };

    return rec;
  }

  // ================================================================
  // 3. BỘ PHÂN TÍCH CẤU TRÚC CÂU & NGỮ PHÁP HÁN NGỮ (AI SENTENCE ANALYZER)
  // ================================================================

  // Dịch câu tự động (Online Google Client API + Offline Local Dictionary Segmentation)
  async function translateText(text, targetLang = 'vi') {
    const clean = String(text || '').trim();
    if (!clean) return '';

    try {
      const sl = targetLang === 'vi' ? 'auto' : 'vi';
      const tl = targetLang === 'vi' ? 'vi' : 'zh-CN';
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(clean)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          return data[0].map(item => item[0]).filter(Boolean).join('');
        }
      }
    } catch (e) {
      console.warn('Online translation error, fallback to token dictionary:', e);
    }

    // Fallback nếu ngoại tuyến
    const tokens = segmentSentence(clean);
    return tokens.map(t => t.meaning).join(' ');
  }

  // Thuật toán tách từ ghép Hán ngữ (Max Matching Word Segmentation)
  function segmentSentence(text) {
    const db = buildDictionaryDatabase();
    const clean = String(text || '').replace(/[，。！？,.!?\s]/g, '');
    const tokens = [];
    let i = 0;

    while (i < clean.length) {
      let matched = null;
      // Thử tìm từ ghép dài nhất (4 ký tự -> 3 -> 2 -> 1)
      for (let len = 4; len >= 1; len--) {
        if (i + len <= clean.length) {
          const sub = clean.slice(i, i + len);
          const found = db.find(w => w.hanzi === sub);
          if (found) {
            matched = found;
            i += len;
            break;
          }
        }
      }

      if (matched) {
        tokens.push(matched);
      } else {
        // Ký tự đơn chưa có trong từ điển
        const singleChar = clean[i];
        tokens.push({
          hanzi: singleChar,
          pinyin: '',
          hv: '',
          meaning: 'Từ vựng Hán tự',
          level: 'HSK',
          pos: 'Từ tố'
        });
        i++;
      }
    }

    return tokens;
  }

  // Nhận diện các điểm ngữ pháp HSK trọng tâm trong câu
  function detectGrammarPatterns(sentence) {
    const s = String(sentence || '');
    const patterns = [
      {
        id: 'ba',
        regex: /(把)\s*([^，。！？]+?)\s*([看做吃喝写洗弄卖带放学买办]+)([^，。！？]*)/,
        name: 'Cấu trúc câu chữ 把 (把字句 - Bǎ Sentence)',
        formula: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác (Bổ ngữ / 了)',
        explain: 'Nhấn mạnh sự xử lý, tác động của chủ ngữ làm thay đổi vị trí, tính chất hoặc kết quả của đối tượng (tân ngữ).'
      },
      {
        id: 'bei',
        regex: /(被)\s*([^，。！？]*?)\s*([看做吃喝写洗弄卖带放]+)([^，。！？]*)/,
        name: 'Cấu trúc câu bị động chữ 被 (被字句 - Bèi Sentence)',
        formula: 'Chủ ngữ (bị tác động) + 被 + (Tác nhân) + Động từ + Thành phần khác',
        explain: 'Biểu thị câu bị động trong tiếng Trung, thường diễn tả sự việc xảy ra ngoài ý muốn hoặc nhấn mạnh kết quả của đối tượng.'
      },
      {
        id: 'bi',
        regex: /([^，。！？]+?)\s*(比)\s*([^，。！？]+?)\s*([更还]+)?\s*([高大快慢好漂亮聪明冷热贵便宜多]+)/,
        name: 'Cấu trúc câu so sánh hơn chữ 比 (比字句 - Comparison)',
        formula: 'A + 比 + B + (Phó từ: 更/还) + Tính từ',
        explain: 'So sánh sự chênh lệch tính chất, mức độ giữa A và B (A hơn B). Lưu ý: Tuyệt đối không dùng phó từ "很" trực tiếp trước tính từ sau 比.'
      },
      {
        id: 'shi_de',
        regex: /(是)\s*([^，。！？]+?)\s*([去来买到回走学]+)([^，。！？]*?)(的)/,
        name: 'Cấu trúc nhấn mạnh 是……的 (Shì...de)',
        formula: 'Chủ ngữ + 是 + [Thời gian / Địa điểm / Phương thức] + Động từ + 的',
        explain: 'Dùng để nhấn mạnh chi tiết (khi nào, ở đâu, bằng phương thức nào) của một hành động đã diễn ra trong quá khứ.'
      },
      {
        id: 'de_state',
        regex: /([跑说读写唱走学做看吃]+)(得)\s*([很非常真太]+)?\s*([快慢好漂亮高清楚]+)/,
        name: 'Cấu trúc Bổ ngữ trạng thái / mức độ (V + 得 - State Complement)',
        formula: 'Động từ + 得 + (Phó từ: 很/非常) + Tính từ',
        explain: 'Dùng để miêu tả, đánh giá trình độ hoặc trạng thái kết quả của hành động được thực hiện như thế nào.'
      },
      {
        id: 'suiran_danshi',
        regex: /(虽然)[^，。！？]+?[，,]?\s*(但是|但|可是)/,
        name: 'Cặp liên từ nhượng bộ 虽然……但是…… (Although... but...)',
        formula: '虽然 + Vế 1 (Tuy rằng...), 但是/可是 + Vế 2 (nhưng mà...)',
        explain: 'Biểu thị quan hệ chuyển ngoặt giữa hai vế câu: Tuy sự việc ở vế 1 diễn ra như vậy, nhưng vế 2 vẫn có kết quả khác.'
      },
      {
        id: 'yinwei_suoyi',
        regex: /(因为)[^，。！？]+?[，,]?\s*(所以)/,
        name: 'Cặp liên từ nhân quả 因为……所以…… (Because... so...)',
        formula: '因为 + Nguyên nhân (Vì...), 所以 + Kết quả (Cho nên...)',
        explain: 'Biểu thị quan hệ nguyên nhân và kết quả chặt chẽ giữa hai sự việc.'
      },
      {
        id: 'budan_erqie',
        regex: /(不但|不仅)[^，。！？]+?[，,]?\s*(而且|也|还)/,
        name: 'Cặp liên từ tăng tiến 不但……而且…… (Not only... but also...)',
        formula: '不但 + Ý 1 (Không những...), 而且 + Ý 2 tăng tiến (mà còn...)',
        explain: 'Biểu thị mức độ của sự việc vế sau cao hơn, phát triển hơn so với sự việc ở vế trước.'
      },
      {
        id: 'yibian_yibian',
        regex: /(一边)[^，。！？]+?(一边)/,
        name: 'Cấu trúc hành động song song 一边……一边……',
        formula: '一边 + Hành động 1, 一边 + Hành động 2',
        explain: 'Biểu thị hai hành động diễn ra cùng một lúc (vừa... vừa...).'
      },
      {
        id: 'yue_yue',
        regex: /(越)[^，。！？]+?(越)/,
        name: 'Cấu trúc luỹ tiến 越……越…… (The more... the more...)',
        formula: '越 + Tính từ / Động từ 1, 越 + Tính từ / Động từ 2',
        explain: 'Biểu thị mức độ thay đổi theo chiều hướng tăng tiến (càng... càng...).'
      },
      {
        id: 'aspect_le',
        regex: /([吃喝看做买写去来]+)(了)/,
        name: 'Trợ từ động thái 了 (Hoàn thành hành động)',
        formula: 'Động từ + 了',
        explain: 'Đặt ngay sau động từ để biểu thị hành động đã được thực hiện hoặc hoàn tất.'
      },
      {
        id: 'aspect_zhe',
        regex: /([穿戴坐站看听]+)(着)/,
        name: 'Trợ từ động thái 着 (Duy trì trạng thái)',
        formula: 'Động từ + 着',
        explain: 'Biểu thị trạng thái của hành động đang được duy trì liên tục.'
      },
      {
        id: 'aspect_guo',
        regex: /([去过买过吃过看过听过]+)/,
        name: 'Trợ từ động thái 过 (Từng trải qua)',
        formula: 'Động từ + 过',
        explain: 'Nhấn mạnh một trải nghiệm đã từng xảy ra ít nhất một lần trong quá khứ.'
      }
    ];

    return patterns.filter(p => p.regex.test(s));
  }

  // Phân tích các thành phần cấu trúc câu (Subject, Adverbial, Verb, Complement, Object)
  function parseSentenceComponents(sentence, tokens) {
    const s = String(sentence || '');
    const components = [];

    // Danh sách từ nhận diện nhanh
    const timeWords = ['今天', '明天', '昨天', '现在', '刚才', '周末', '去年', '今年', '明年', '晚上', '早上', '下午'];
    const subjects = ['我', '你', '他', '她', '我们', '你们', '他们', '老师', '学生', '爸爸', '妈妈', '朋友', '医生'];
    const verbs = ['吃', '喝', '看', '听', '说', '读', '写', '买', '卖', '去', '来', '叫', '是', '有', '跑', '跑步', '起床', '复习', '打算', '完成', '安排', '提高', '照顾', '生病'];
    const complements = ['完', '懂', '见', '到', '好', '错', '开', '上', '下', '清楚', '快', '慢', '起来'];
    const particles = ['了', '着', '过', '的', '得', '地', '吗', '呢', '吧', '把', '被', '比'];

    tokens.forEach(tok => {
      let role = 'Thành phần';
      let roleClass = 'gc-particle';

      if (timeWords.includes(tok.hanzi)) {
        role = 'Trạng ngữ (Thời gian)';
        roleClass = 'gc-adverbial';
      } else if (subjects.includes(tok.hanzi)) {
        role = 'Chủ ngữ (Subject)';
        roleClass = 'gc-subject';
      } else if (verbs.includes(tok.hanzi)) {
        role = 'Vị ngữ (Động từ chính)';
        roleClass = 'gc-verb';
      } else if (complements.includes(tok.hanzi)) {
        role = 'Bổ ngữ (Complement)';
        roleClass = 'gc-complement';
      } else if (particles.includes(tok.hanzi)) {
        role = 'Trợ từ / Giới từ';
        roleClass = 'gc-particle';
      } else if (tok.pos === 'Danh từ' || tok.pos === 'Danh từ riêng') {
        role = 'Tân ngữ (Object)';
        roleClass = 'gc-object';
      } else if (tok.pos === 'Tính từ') {
        role = 'Định ngữ / Tính từ';
        roleClass = 'gc-attributive';
      } else if (tok.pos === 'Phó từ' || tok.pos === 'Phó từ mức độ') {
        role = 'Trạng ngữ (Phó từ)';
        roleClass = 'gc-adverbial';
      }

      components.push({
        hanzi: tok.hanzi,
        pinyin: tok.pinyin,
        role,
        roleClass
      });
    });

    return components;
  }

  // ================================================================
  // 4. RENDER GIAO DIỆN CHÍNH (DICTIONARY VIEW)
  // ================================================================
  function renderDictionaryView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 20px 16px;">
        <!-- Thanh chuyển đổi 2 Tab lớn -->
        <div class="dict-tab-nav">
          <button type="button" class="dict-tab-btn ${currentTab === 'search' ? 'active' : ''}" id="tabBtnSearch">
            📖 Tra cứu Từ vựng & Giọng nói
          </button>
          <button type="button" class="dict-tab-btn ${currentTab === 'analyzer' ? 'active' : ''}" id="tabBtnAnalyzer">
            🤖 Phân tích Cấu trúc Câu & Dịch nghĩa
          </button>
        </div>

        <!-- ================= TAB 1: TRA CỨU TỪ ĐIỂN & GIỌNG NÓI ================= -->
        <div id="dictSearchSection" style="${currentTab === 'search' ? '' : 'display:none;'}">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size:12px; font-weight:800; color:#6657d9; letter-spacing:0.08em; text-transform:uppercase;">CÔNG CỤ HỌC TIẾNG TRUNG THÔNG MINH</span>
            <h2 style="font-size:26px; color:#1a1e36; margin:6px 0;">📖 Tra cứu Từ điển Hán tự & Pinyin</h2>
            <p style="color:#64748b; font-size:15px; margin:4px 0 16px;">Gõ chữ Hán, Pinyin hoặc <b>bấm nút Microphone 🎙️ để nói trực tiếp</b> bằng tiếng Trung hoặc tiếng Việt.</p>

            <div class="dict-search-wrapper">
              <div class="dict-search-input-box">
                <input type="search" id="dictSearchInput" class="dict-search-input" placeholder="Nhập chữ Hán (你好), Pinyin (ni hao), nghĩa (xin chào) hoặc bấm Mic...">
                <button type="button" id="dictClearBtn" class="dict-clear-btn" title="Xóa tìm kiếm">✕</button>
              </div>
              <button type="button" id="dictMicBtn" class="dict-mic-btn" title="Tra cứu bằng giọng nói">
                🎙️
              </button>
            </div>

            <!-- Thanh trạng thái lắng nghe giọng nói -->
            <div id="dictVoiceStatus" class="dict-voice-status" style="display:none;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:16px;">🎧</span>
                <span id="dictVoiceText">Đang lắng nghe... Hãy nói to từ cần tra cứu!</span>
              </div>
              <div class="dict-lang-toggle">
                <button type="button" class="dict-lang-opt active" id="btnLangZh">🇨🇳 Trung</button>
                <button type="button" class="dict-lang-opt" id="btnLangVi">🇻🇳 Việt</button>
              </div>
            </div>
          </div>

          <div id="dictResults" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:14px;"></div>
        </div>

        <!-- ================= TAB 2: PHÂN TÍCH CẤU TRÚC CÂU AI ================= -->
        <div id="dictAnalyzerSection" style="${currentTab === 'analyzer' ? '' : 'display:none;'}">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size:12px; font-weight:800; color:#e11d48; letter-spacing:0.08em; text-transform:uppercase;">TRỢ LÝ NGỮ PHÁP HÁN NGỮ</span>
            <h2 style="font-size:26px; color:#1a1e36; margin:6px 0;">🔍 Phân tích Cấu trúc Câu & Dịch nghĩa</h2>
            <p style="color:#64748b; font-size:15px; margin:4px 0 16px;">Nhập hoặc nói một câu tiếng Trung (hoặc tiếng Việt), hệ thống sẽ bóc tách <b>Chủ/Vị/Tân/Trạng/Bổ ngữ</b> và chỉ ra điểm ngữ pháp HSK!</p>
          </div>

          <div class="analyzer-card">
            <div class="analyzer-input-area">
              <textarea id="analyzerInput" class="analyzer-textarea" placeholder="Nhập hoặc bấm Micro nói một câu tiếng Trung bất kỳ (Ví dụ: 周末你有什么打算？ hoặc Tôi đã đọc xong quyển sách đó)..."></textarea>
              <button type="button" id="analyzerMicBtn" class="analyzer-mic-btn" title="Bấm để nói câu tiếng Trung vào ô này">
                🎙️
              </button>
            </div>

            <!-- Gợi ý câu mẫu để click thử ngay -->
            <div class="analyzer-samples-row">
              <span style="font-size:12px; font-weight:700; color:#64748b;">💡 Câu mẫu thử ngay:</span>
              <button type="button" class="analyzer-sample-pill" data-sample="周末你有什么打算？">周末你有什么打算？</button>
              <button type="button" class="analyzer-sample-pill" data-sample="我把那本书看完了。">我把那本书看完了。(Câu chữ 把)</button>
              <button type="button" class="analyzer-sample-pill" data-sample="他跑得比我快。">他跑得比我快。(Câu chữ 比)</button>
              <button type="button" class="analyzer-sample-pill" data-sample="虽然今天很冷，但是他还在跑步。">虽然今天很冷，但是他还在跑步。</button>
              <button type="button" class="analyzer-sample-pill" data-sample="我是去年九月来北京的。">我是去年九月来北京的。(是...的)</button>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <button type="button" id="btnRunAnalysis" class="analyzer-submit-btn">
                🔍 Phân tích cấu trúc & Dịch nghĩa
              </button>
              <span id="analyzerStatus" style="font-size:13px; font-weight:700; color:#64748b;"></span>
            </div>
          </div>

          <!-- KHUNG KẾT QUẢ PHÂN TÍCH -->
          <div id="analyzerResultsBox" style="display:none;"></div>
        </div>
      </div>
    `;

    // 1. Chuyển đổi giữa 2 Tab
    const tabBtnSearch = document.getElementById('tabBtnSearch');
    const tabBtnAnalyzer = document.getElementById('tabBtnAnalyzer');
    const searchSec = document.getElementById('dictSearchSection');
    const analyzerSec = document.getElementById('dictAnalyzerSection');

    function setTab(tab) {
      currentTab = tab;
      tabBtnSearch.classList.toggle('active', tab === 'search');
      tabBtnAnalyzer.classList.toggle('active', tab === 'analyzer');
      searchSec.style.display = tab === 'search' ? '' : 'none';
      analyzerSec.style.display = tab === 'analyzer' ? '' : 'none';
    }

    tabBtnSearch.onclick = () => setTab('search');
    tabBtnAnalyzer.onclick = () => setTab('analyzer');

    // 2. Tra cứu Từ điển thường
    const searchInput = document.getElementById('dictSearchInput');
    const clearBtn = document.getElementById('dictClearBtn');
    const resultsContainer = document.getElementById('dictResults');

    function updateSearchResults() {
      const q = searchInput.value;
      clearBtn.style.display = q ? 'block' : 'none';
      const list = q ? search(q) : buildDictionaryDatabase().slice(0, 12);

      if (!list.length) {
        resultsContainer.innerHTML = `
          <div style="grid-column:1/-1; text-align:center; padding:32px 16px; background:#fff; border-radius:18px; border:1px dashed #cbd5e1;">
            <div style="font-size:40px; margin-bottom:8px;">🔍</div>
            <h4 style="margin:0 0 6px; color:#1e293b;">Chưa tìm thấy từ đơn lẻ "${q}"</h4>
            <p style="color:#64748b; font-size:14px; margin:0 0 16px;">Có thể đây là một câu ghép hoặc cụm từ dài. Bạn có muốn phân tích ngữ pháp câu này không?</p>
            <button type="button" class="analyzer-submit-btn" style="padding:9px 18px; font-size:14px;" onclick="window.HSKDictionary.switchTab('analyzer', '${q}')">
              🤖 Chuyển sang Phân tích Câu & Dịch nghĩa &rarr;
            </button>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = list.map(item => {
        const bookmarked = window.HSKData?.isBookmarked(item.hanzi);
        return `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div style="display:flex; gap:6px; align-items:center;">
                  <span style="background:#f0edff; color:#6657d9; font-size:12px; font-weight:700; padding:2px 8px; border-radius:999px;">${item.level}</span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:2px 6px; border-radius:6px;">${item.pos || 'Từ vựng'}</span>
                </div>
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

      resultsContainer.querySelectorAll('.bookmark-btn').forEach(btn => {
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

    searchInput.oninput = updateSearchResults;
    clearBtn.onclick = () => {
      searchInput.value = '';
      updateSearchResults();
      searchInput.focus();
    };

    // 3. TÍNH NĂNG TRA CỨU BẰNG GIỌNG NÓI (VOICE SEARCH)
    const dictMicBtn = document.getElementById('dictMicBtn');
    const voiceStatus = document.getElementById('dictVoiceStatus');
    const voiceText = document.getElementById('dictVoiceText');
    const btnLangZh = document.getElementById('btnLangZh');
    const btnLangVi = document.getElementById('btnLangVi');

    btnLangZh.onclick = () => {
      voiceLang = 'zh-CN';
      btnLangZh.classList.add('active');
      btnLangVi.classList.remove('active');
      voiceText.textContent = 'Đang nghe tiếng Trung... Hãy nói từ tiếng Trung cần tra!';
    };

    btnLangVi.onclick = () => {
      voiceLang = 'vi-VN';
      btnLangVi.classList.add('active');
      btnLangZh.classList.remove('active');
      voiceText.textContent = 'Đang nghe tiếng Việt... Hãy nói từ tiếng Việt cần tra!';
    };

    dictMicBtn.onclick = () => {
      if (isListeningDict) {
        stopDictVoice();
        return;
      }
      startDictVoice();
    };

    function startDictVoice() {
      stopAnalyzerVoice();
      dictMicBtn.classList.add('listening');
      dictMicBtn.innerHTML = '⏹';
      voiceStatus.style.display = 'flex';
      voiceText.textContent = voiceLang === 'zh-CN' ? '🎧 Đang nghe tiếng Trung... Hãy nói to từ cần tra!' : '🎧 Đang nghe tiếng Việt... Hãy nói to từ cần tra!';
      isListeningDict = true;

      recognitionInstance = getSpeechRecognizer(
        voiceLang,
        (spokenText) => {
          stopDictVoice();
          searchInput.value = spokenText;
          updateSearchResults();
          if (window.HSKAudioFX?.playClick) window.HSKAudioFX.playClick();
        },
        () => stopDictVoice(),
        () => stopDictVoice()
      );

      if (recognitionInstance) {
        try { recognitionInstance.start(); } catch (e) { stopDictVoice(); }
      }
    }

    function stopDictVoice() {
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch (e) {}
        recognitionInstance = null;
      }
      isListeningDict = false;
      dictMicBtn.classList.remove('listening');
      dictMicBtn.innerHTML = '🎙️';
      voiceStatus.style.display = 'none';
    }

    // 4. TÍNH NĂNG THU ÂM VÀO PHÂN TÍCH CÂU (ANALYZER MIC)
    const analyzerInput = document.getElementById('analyzerInput');
    const analyzerMicBtn = document.getElementById('analyzerMicBtn');
    const analyzerStatus = document.getElementById('analyzerStatus');
    const btnRunAnalysis = document.getElementById('btnRunAnalysis');
    const resultsBox = document.getElementById('analyzerResultsBox');

    analyzerMicBtn.onclick = () => {
      if (isListeningAnalyzer) {
        stopAnalyzerVoice();
        return;
      }
      startAnalyzerVoice();
    };

    function startAnalyzerVoice() {
      stopDictVoice();
      analyzerMicBtn.classList.add('listening');
      analyzerMicBtn.innerHTML = '⏹';
      analyzerStatus.innerHTML = '<span style="color:#e11d48;">🔴 Đang nghe bạn nói câu tiếng Trung... Hãy nói to, rõ ràng!</span>';
      isListeningAnalyzer = true;

      recognitionInstance = getSpeechRecognizer(
        'zh-CN',
        (spokenText) => {
          stopAnalyzerVoice();
          analyzerInput.value = spokenText;
          analyzerStatus.innerHTML = '✅ Đã nhận diện giọng nói xong! Đang phân tích...';
          runSentenceAnalysis();
        },
        () => stopAnalyzerVoice(),
        () => stopAnalyzerVoice()
      );

      if (recognitionInstance) {
        try { recognitionInstance.start(); } catch (e) { stopAnalyzerVoice(); }
      }
    }

    function stopAnalyzerVoice() {
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch (e) {}
        recognitionInstance = null;
      }
      isListeningAnalyzer = false;
      analyzerMicBtn.classList.remove('listening');
      analyzerMicBtn.innerHTML = '🎙️';
      if (analyzerStatus.textContent.includes('Đang nghe')) {
        analyzerStatus.textContent = '';
      }
    }

    // Chọn câu mẫu
    document.querySelectorAll('.analyzer-sample-pill').forEach(pill => {
      pill.onclick = () => {
        analyzerInput.value = pill.dataset.sample;
        runSentenceAnalysis();
      };
    });

    btnRunAnalysis.onclick = () => runSentenceAnalysis();
    analyzerInput.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        runSentenceAnalysis();
      }
    };

    // Thực thi phân tích cấu trúc câu & dịch nghĩa
    async function runSentenceAnalysis() {
      const sentence = (analyzerInput.value || '').trim();
      if (!sentence) {
        alert('Vui lòng gõ hoặc bấm Micro nói một câu cần phân tích.');
        analyzerInput.focus();
        return;
      }

      btnRunAnalysis.disabled = true;
      btnRunAnalysis.innerHTML = '⏳ Đang phân tích ngữ pháp...';
      resultsBox.style.display = 'block';
      resultsBox.innerHTML = `
        <div style="text-align:center; padding:30px; color:#64748b;">
          <div style="font-size:32px; animation:spin 1s infinite linear;">⚙️</div>
          <p style="margin-top:10px; font-weight:700;">Đang bóc tách thành phần câu và tra cứu ngữ pháp HSK...</p>
        </div>
      `;

      try {
        // Kiểm tra xem câu nhập vào là tiếng Trung hay tiếng Việt
        const isChinese = /[\u4e00-\u9fa5]/.test(sentence);
        let zhSentence = sentence;
        let viTranslation = '';

        if (isChinese) {
          viTranslation = await translateText(sentence, 'vi');
        } else {
          // Nhập tiếng Việt -> dịch sang tiếng Trung rồi phân tích tiếng Trung
          zhSentence = await translateText(sentence, 'zh-CN');
          viTranslation = sentence;
        }

        // Tách từ ghép & thành phần ngữ pháp
        const tokens = segmentSentence(zhSentence);
        const components = parseSentenceComponents(zhSentence, tokens);
        const grammarPoints = detectGrammarPatterns(zhSentence);

        // Tạo toàn bộ Pinyin
        const fullPinyin = tokens.map(t => t.pinyin).filter(Boolean).join(' ');

        // Render toàn bộ kết quả phân tích
        resultsBox.innerHTML = `
          <div class="analysis-results-card">
            <!-- 1. HỘP DỊCH NGHĨA HOÀN CHỈNH -->
            <div class="analysis-trans-box">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:12px; font-weight:800; color:#6657d9; text-transform:uppercase; letter-spacing:0.5px;">BẢN DỊCH HOÀN CHỈNH</span>
                <button type="button" style="border:none; background:#ede9fe; color:#6d28d9; padding:5px 12px; border-radius:8px; font-size:12.5px; font-weight:700; cursor:pointer;" onclick="if(window.HSKAudio) window.HSKAudio.speak('${zhSentence}')">
                  🔊 Nghe đọc toàn câu
                </button>
              </div>
              <div class="analysis-hanzi-text">${zhSentence}</div>
              <div class="analysis-pinyin-text">${fullPinyin || '(Phiên âm Hán tự)'}</div>
              <div class="analysis-vi-text">
                <span>🇻🇳 ${viTranslation || 'Đang cập nhật nghĩa...'}</span>
              </div>
            </div>

            <!-- 2. SƠ ĐỒ THÀNH PHẦN NGỮ PHÁP (JUZI CHENGFEN) -->
            <div class="grammar-diagram-section">
              <div class="grammar-diagram-title">
                <span>🧩 Phân tích Thành phần Cấu trúc Câu (句子成分):</span>
              </div>
              <div class="grammar-chips-container">
                ${components.map(comp => `
                  <div class="grammar-chip ${comp.roleClass}">
                    <span class="gc-text">${comp.hanzi}</span>
                    <span class="gc-role">${comp.role}</span>
                  </div>
                `).join('')}
              </div>
              <div style="font-size:12px; color:#64748b; margin-top:8px;">
                Chú thích: <span style="color:#3730a3; font-weight:700;">■ Chủ ngữ</span> • 
                <span style="color:#92400e; font-weight:700;">■ Trạng ngữ</span> • 
                <span style="color:#991b1b; font-weight:700;">■ Vị ngữ/Động từ</span> • 
                <span style="color:#075985; font-weight:700;">■ Tân ngữ</span> • 
                <span style="color:#115e59; font-weight:700;">■ Bổ ngữ</span>
              </div>
            </div>

            <!-- 3. ĐIỂM NGỮ PHÁP HSK TRỌNG TÂM PHÁT HIỆN ĐƯỢC -->
            ${grammarPoints.length > 0 ? `
              <div style="margin-bottom:24px;">
                <div class="grammar-diagram-title" style="color:#c2410c;">
                  <span>💡 Điểm Ngữ pháp HSK Trọng tâm trong câu:</span>
                </div>
                ${grammarPoints.map(gp => `
                  <div class="grammar-insight-card">
                    <div class="gic-header">
                      <span>📌</span> <span>${gp.name}</span>
                    </div>
                    <div class="gic-formula">Công thức: ${gp.formula}</div>
                    <p class="gic-explain">${gp.explain}</p>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- 4. BẢNG BÓC TÁCH TỪNG TỪ GHÉP TRONG CÂU -->
            <div class="word-breakdown-section">
              <div class="grammar-diagram-title">
                <span>📚 Danh mục Từ vựng trong câu (${tokens.length} từ tố):</span>
              </div>
              <div class="word-breakdown-grid">
                ${tokens.map(tok => `
                  <div class="word-token-card">
                    <div>
                      <div class="wtc-hanzi">${tok.hanzi}</div>
                      <div class="wtc-pinyin">${tok.pinyin}</div>
                      <div class="wtc-meaning">${tok.meaning}</div>
                    </div>
                    <div style="text-align:right;">
                      <span class="wtc-level">${tok.level}</span>
                      <div style="margin-top:6px;">
                        <button type="button" style="border:1px solid #cbd5e1; background:#fff; border-radius:6px; padding:3px 6px; font-size:11px; cursor:pointer;" onclick="if(window.HanziPad) window.HanziPad.open('${tok.hanzi}', '${tok.pinyin}', '${tok.meaning}')">
                          ✍️ Viết
                        </button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      } catch (err) {
        resultsBox.innerHTML = `
          <div style="background:#fef2f2; border:1.5px solid #ef4444; border-radius:14px; padding:16px; color:#991b1b;">
            <b>❌ Lỗi khi phân tích câu:</b> ${err.message}
          </div>
        `;
      } finally {
        btnRunAnalysis.disabled = false;
        btnRunAnalysis.innerHTML = '🔍 Phân tích cấu trúc & Dịch nghĩa';
      }
    }

    // Initial search render
    updateSearchResults();
  }

  // Chuyển tab từ bên ngoài (ví dụ từ URL hoặc link)
  function switchTab(tabName, query = '') {
    currentTab = tabName;
    const tabBtnSearch = document.getElementById('tabBtnSearch');
    const tabBtnAnalyzer = document.getElementById('tabBtnAnalyzer');
    const searchSec = document.getElementById('dictSearchSection');
    const analyzerSec = document.getElementById('dictAnalyzerSection');

    if (tabBtnSearch && tabBtnAnalyzer && searchSec && analyzerSec) {
      tabBtnSearch.classList.toggle('active', tabName === 'search');
      tabBtnAnalyzer.classList.toggle('active', tabName === 'analyzer');
      searchSec.style.display = tabName === 'search' ? '' : 'none';
      analyzerSec.style.display = tabName === 'analyzer' ? '' : 'none';

      if (query && tabName === 'analyzer') {
        const input = document.getElementById('analyzerInput');
        if (input) {
          input.value = query;
          document.getElementById('btnRunAnalysis')?.click();
        }
      }
    }
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
    renderNotebookView,
    switchTab,
    analyzeSentence: translateText
  };
})();
