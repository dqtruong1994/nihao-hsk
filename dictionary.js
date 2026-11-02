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
      {"hanzi": "爱", "pinyin": "ài", "hv": "ái", "meaning": "yêu, thích", "level": "HSK 1", "pos": "Động từ", "topic": "Cảm xúc"},
      {"hanzi": "八", "pinyin": "bā", "hv": "bát", "meaning": "số 8", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "爸爸", "pinyin": "bàba", "hv": "ba ba", "meaning": "bố, cha", "level": "HSK 1", "pos": "Danh từ", "topic": "Gia đình"},
      {"hanzi": "杯子", "pinyin": "bēizi", "hv": "bôi tử", "meaning": "cái ly, cốc", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "北京", "pinyin": "Běijīng", "hv": "Bắc Kinh", "meaning": "Bắc Kinh", "level": "HSK 1", "pos": "Danh từ riêng", "topic": "Địa danh"},
      {"hanzi": "本", "pinyin": "běn", "hv": "bản", "meaning": "cuốn, quyển (lượng từ sách)", "level": "HSK 1", "pos": "Lượng từ", "topic": "Đồ vật"},
      {"hanzi": "不客气", "pinyin": "bú kèqi", "hv": "bất khách khí", "meaning": "đừng khách sáo, không có chi", "level": "HSK 1", "pos": "Chào hỏi", "topic": "Giao tiếp"},
      {"hanzi": "不", "pinyin": "bù", "hv": "bất", "meaning": "không, chẳng", "level": "HSK 1", "pos": "Phó từ", "topic": "Phủ định"},
      {"hanzi": "菜", "pinyin": "cài", "hv": "thái", "meaning": "món ăn, rau", "level": "HSK 1", "pos": "Danh từ", "topic": "Ẩm thực"},
      {"hanzi": "茶", "pinyin": "chá", "hv": "trà", "meaning": "trà, chè", "level": "HSK 1", "pos": "Danh từ", "topic": "Ẩm thực"},
      {"hanzi": "吃", "pinyin": "chī", "hv": "ngật", "meaning": "ăn", "level": "HSK 1", "pos": "Động từ", "topic": "Ẩm thực"},
      {"hanzi": "出租车", "pinyin": "chūzūchē", "hv": "xuất tô xa", "meaning": "xe taxi", "level": "HSK 1", "pos": "Danh từ", "topic": "Giao thông"},
      {"hanzi": "打电话", "pinyin": "dǎ diànhuà", "hv": "đả điện thoại", "meaning": "gọi điện thoại", "level": "HSK 1", "pos": "Động từ", "topic": "Giao tiếp"},
      {"hanzi": "大", "pinyin": "dà", "hv": "đại", "meaning": "to, lớn", "level": "HSK 1", "pos": "Tính từ", "topic": "Kích thước"},
      {"hanzi": "的", "pinyin": "de", "hv": "đích", "meaning": "của (trợ từ sở hữu)", "level": "HSK 1", "pos": "Trợ từ", "topic": "Ngữ pháp"},
      {"hanzi": "点", "pinyin": "diǎn", "hv": "điểm", "meaning": "giờ, chút ít", "level": "HSK 1", "pos": "Danh từ/Lượng từ", "topic": "Thời gian"},
      {"hanzi": "电脑", "pinyin": "diànnǎo", "hv": "điện não", "meaning": "máy vi tính", "level": "HSK 1", "pos": "Danh từ", "topic": "Công nghệ"},
      {"hanzi": "电视", "pinyin": "diànshì", "hv": "điện thị", "meaning": "ti vi, truyền hình", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "电影", "pinyin": "diànyǐng", "hv": "điện ảnh", "meaning": "phim, điện ảnh", "level": "HSK 1", "pos": "Danh từ", "topic": "Giải trí"},
      {"hanzi": "东西", "pinyin": "dōngxi", "hv": "đông tây", "meaning": "đồ đạc, vật phẩm", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "都", "pinyin": "dōu", "hv": "đô", "meaning": "đều, tất cả", "level": "HSK 1", "pos": "Phó từ", "topic": "Phó từ"},
      {"hanzi": "读", "pinyin": "dú", "hv": "độc", "meaning": "đọc", "level": "HSK 1", "pos": "Động từ", "topic": "Học tập"},
      {"hanzi": "对不起", "pinyin": "duìbuqǐ", "hv": "đối bất khởi", "meaning": "xin lỗi", "level": "HSK 1", "pos": "Chào hỏi", "topic": "Giao tiếp"},
      {"hanzi": "多", "pinyin": "duō", "hv": "đa", "meaning": "nhiều", "level": "HSK 1", "pos": "Tính từ", "topic": "Số lượng"},
      {"hanzi": "多少", "pinyin": "duōshao", "hv": "đa thiểu", "meaning": "bao nhiêu", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "儿子", "pinyin": "érzi", "hv": "nhi tử", "meaning": "con trai", "level": "HSK 1", "pos": "Danh từ", "topic": "Gia đình"},
      {"hanzi": "二", "pinyin": "èr", "hv": "nhị", "meaning": "số 2", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "饭馆", "pinyin": "fànguǎn", "hv": "phạn quán", "meaning": "nhà hàng, quán ăn", "level": "HSK 1", "pos": "Danh từ", "topic": "Địa điểm"},
      {"hanzi": "飞机", "pinyin": "fēijī", "hv": "phi cơ", "meaning": "máy bay", "level": "HSK 1", "pos": "Danh từ", "topic": "Giao thông"},
      {"hanzi": "分钟", "pinyin": "fēnzhōng", "hv": "phân chung", "meaning": "phút (đồng hồ)", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "高兴", "pinyin": "gāoxìng", "hv": "cao hứng", "meaning": "vui vẻ, vui mừng", "level": "HSK 1", "pos": "Tính từ", "topic": "Cảm xúc"},
      {"hanzi": "个", "pinyin": "gè", "hv": "cá", "meaning": "cái, chiếc (lượng từ chung)", "level": "HSK 1", "pos": "Lượng từ", "topic": "Lượng từ"},
      {"hanzi": "工作", "pinyin": "gōngzuò", "hv": "công tác", "meaning": "công việc, làm việc", "level": "HSK 1", "pos": "Danh từ/Động từ", "topic": "Nghề nghiệp"},
      {"hanzi": "狗", "pinyin": "gǒu", "hv": "cẩu", "meaning": "con chó", "level": "HSK 1", "pos": "Danh từ", "topic": "Động vật"},
      {"hanzi": "汉语", "pinyin": "Hànyǔ", "hv": "Hán ngữ", "meaning": "tiếng Hán, tiếng Trung", "level": "HSK 1", "pos": "Danh từ", "topic": "Ngôn ngữ"},
      {"hanzi": "好", "pinyin": "hǎo", "hv": "hảo", "meaning": "tốt, đẹp, hay", "level": "HSK 1", "pos": "Tính từ", "topic": "Tính từ"},
      {"hanzi": "号", "pinyin": "hào", "hv": "hiệu", "meaning": "ngày (trong tháng), số", "level": "HSK 1", "pos": "Danh từ/Lượng từ", "topic": "Thời gian"},
      {"hanzi": "喝", "pinyin": "hē", "hv": "hát", "meaning": "uống", "level": "HSK 1", "pos": "Động từ", "topic": "Ẩm thực"},
      {"hanzi": "和", "pinyin": "hé", "hv": "hòa", "meaning": "và, cùng với", "level": "HSK 1", "pos": "Liên từ", "topic": "Liên từ"},
      {"hanzi": "很", "pinyin": "hěn", "hv": "hẩn", "meaning": "rất, lắm", "level": "HSK 1", "pos": "Phó từ", "topic": "Phó từ"},
      {"hanzi": "后面", "pinyin": "hòumian", "hv": "hậu diện", "meaning": "phía sau, đằng sau", "level": "HSK 1", "pos": "Danh từ", "topic": "Phương vị"},
      {"hanzi": "回", "pinyin": "huí", "hv": "hồi", "meaning": "về, quay lại", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "会", "pinyin": "huì", "hv": "hội", "meaning": "biết (qua học hỏi), sẽ", "level": "HSK 1", "pos": "Động từ năng nguyện", "topic": "Năng lực"},
      {"hanzi": "几", "pinyin": "jǐ", "hv": "kỷ", "meaning": "mấy, vài", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "家", "pinyin": "jiā", "hv": "gia", "meaning": "nhà, gia đình", "level": "HSK 1", "pos": "Danh từ", "topic": "Gia đình"},
      {"hanzi": "叫", "pinyin": "jiào", "hv": "khiếu", "meaning": "gọi, tên là", "level": "HSK 1", "pos": "Động từ", "topic": "Giao tiếp"},
      {"hanzi": "今天", "pinyin": "jīntiān", "hv": "kim thiên", "meaning": "hôm nay", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "九", "pinyin": "jiǔ", "hv": "cửu", "meaning": "số 9", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "开", "pinyin": "kāi", "hv": "khai", "meaning": "mở, lái (xe)", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "看", "pinyin": "kàn", "hv": "khán", "meaning": "nhìn, xem, đọc", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "看见", "pinyin": "kànjiàn", "hv": "khán kiến", "meaning": "nhìn thấy", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "块", "pinyin": "kuài", "hv": "khối", "meaning": "đồng (đơn vị tiền tệ), miếng", "level": "HSK 1", "pos": "Lượng từ", "topic": "Tiền tệ"},
      {"hanzi": "来", "pinyin": "lái", "hv": "lai", "meaning": "đến, tới", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "老师", "pinyin": "lǎoshī", "hv": "lão sư", "meaning": "thầy cô giáo", "level": "HSK 1", "pos": "Danh từ", "topic": "Nghề nghiệp"},
      {"hanzi": "了", "pinyin": "le", "hv": "liễu", "meaning": "rồi (trợ từ động thái/ngữ khí)", "level": "HSK 1", "pos": "Trợ từ", "topic": "Ngữ pháp"},
      {"hanzi": "冷", "pinyin": "lěng", "hv": "lãnh", "meaning": "lạnh", "level": "HSK 1", "pos": "Tính từ", "topic": "Thời tiết"},
      {"hanzi": "里", "pinyin": "lǐ", "hv": "lý", "meaning": "trong, bên trong", "level": "HSK 1", "pos": "Danh từ", "topic": "Phương vị"},
      {"hanzi": "六", "pinyin": "liù", "hv": "lục", "meaning": "số 6", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "妈妈", "pinyin": "māma", "hv": "ma ma", "meaning": "mẹ, má", "level": "HSK 1", "pos": "Danh từ", "topic": "Gia đình"},
      {"hanzi": "吗", "pinyin": "ma", "hv": "ma", "meaning": "không, à (trợ từ nghi vấn)", "level": "HSK 1", "pos": "Trợ từ", "topic": "Hỏi đáp"},
      {"hanzi": "买", "pinyin": "mǎi", "hv": "mãi", "meaning": "mua", "level": "HSK 1", "pos": "Động từ", "topic": "Mua sắm"},
      {"hanzi": "猫", "pinyin": "māo", "hv": "miêu", "meaning": "con mèo", "level": "HSK 1", "pos": "Danh từ", "topic": "Động vật"},
      {"hanzi": "没关系", "pinyin": "méi guānxi", "hv": "mộc quan hệ", "meaning": "không sao, không có gì", "level": "HSK 1", "pos": "Chào hỏi", "topic": "Giao tiếp"},
      {"hanzi": "没有", "pinyin": "méiyǒu", "hv": "mộc hữu", "meaning": "không có, chưa", "level": "HSK 1", "pos": "Động từ", "topic": "Phủ định"},
      {"hanzi": "米饭", "pinyin": "mǐfàn", "hv": "mễ phạn", "meaning": "cơm", "level": "HSK 1", "pos": "Danh từ", "topic": "Ẩm thực"},
      {"hanzi": "明天", "pinyin": "míngtiān", "hv": "minh thiên", "meaning": "ngày mai", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "名字", "pinyin": "míngzi", "hv": "danh tự", "meaning": "tên, danh xưng", "level": "HSK 1", "pos": "Danh từ", "topic": "Giới thiệu"},
      {"hanzi": "哪", "pinyin": "nǎ", "hv": "nả", "meaning": "nào", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "哪儿", "pinyin": "nǎr", "hv": "nả nhi", "meaning": "ở đâu, chỗ nào", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "那", "pinyin": "nà", "hv": "na", "meaning": "kia, đó", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "那儿", "pinyin": "nàr", "hv": "na nhi", "meaning": "nơi đó, chỗ đó", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "呢", "pinyin": "ne", "hv": "ni", "meaning": "thì sao, đang (trợ từ)", "level": "HSK 1", "pos": "Trợ từ", "topic": "Ngữ pháp"},
      {"hanzi": "能", "pinyin": "néng", "hv": "năng", "meaning": "có thể", "level": "HSK 1", "pos": "Động từ năng nguyện", "topic": "Năng lực"},
      {"hanzi": "你", "pinyin": "nǐ", "hv": "nhĩ", "meaning": "bạn, cậu", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "年", "pinyin": "nián", "hv": "niên", "meaning": "năm", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "女儿", "pinyin": "nǚ'ér", "hv": "nữ nhi", "meaning": "con gái", "level": "HSK 1", "pos": "Danh từ", "topic": "Gia đình"},
      {"hanzi": "朋友", "pinyin": "péngyou", "hv": "bằng hữu", "meaning": "bạn bè", "level": "HSK 1", "pos": "Danh từ", "topic": "Mối quan hệ"},
      {"hanzi": "漂亮", "pinyin": "piàoliang", "hv": "phiêu lượng", "meaning": "đẹp, xinh đẹp", "level": "HSK 1", "pos": "Tính từ", "topic": "Ngoại hình"},
      {"hanzi": "苹果", "pinyin": "píngguǒ", "hv": "bình quả", "meaning": "quả táo", "level": "HSK 1", "pos": "Danh từ", "topic": "Hoa quả"},
      {"hanzi": "七", "pinyin": "qī", "hv": "thất", "meaning": "số 7", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "钱", "pinyin": "qián", "hv": "tiền", "meaning": "tiền", "level": "HSK 1", "pos": "Danh từ", "topic": "Tiền tệ"},
      {"hanzi": "前面", "pinyin": "qiánmiàn", "hv": "tiền diện", "meaning": "phía trước", "level": "HSK 1", "pos": "Danh từ", "topic": "Phương vị"},
      {"hanzi": "请", "pinyin": "qǐng", "hv": "thỉnh", "meaning": "mời, xin", "level": "HSK 1", "pos": "Động từ", "topic": "Giao tiếp"},
      {"hanzi": "去", "pinyin": "qù", "hv": "khứ", "meaning": "đi", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "热", "pinyin": "rè", "hv": "nhiệt", "meaning": "nóng", "level": "HSK 1", "pos": "Tính từ", "topic": "Thời tiết"},
      {"hanzi": "人", "pinyin": "rén", "hv": "nhân", "meaning": "người", "level": "HSK 1", "pos": "Danh từ", "topic": "Con người"},
      {"hanzi": "认识", "pinyin": "rènshi", "hv": "nhận thức", "meaning": "quen biết", "level": "HSK 1", "pos": "Động từ", "topic": "Mối quan hệ"},
      {"hanzi": "三", "pinyin": "sān", "hv": "tam", "meaning": "số 3", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "商店", "pinyin": "shāngdiàn", "hv": "thương điếm", "meaning": "cửa hàng", "level": "HSK 1", "pos": "Danh từ", "topic": "Mua sắm"},
      {"hanzi": "上", "pinyin": "shàng", "hv": "thượng", "meaning": "trên, lên", "level": "HSK 1", "pos": "Danh từ/Động từ", "topic": "Phương vị"},
      {"hanzi": "上午", "pinyin": "shàngwǔ", "hv": "thượng ngọ", "meaning": "buổi sáng", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "少", "pinyin": "shǎo", "hv": "thiểu", "meaning": "ít", "level": "HSK 1", "pos": "Tính từ", "topic": "Số lượng"},
      {"hanzi": "谁", "pinyin": "shéi", "hv": "thùy", "meaning": "ai", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "什么", "pinyin": "shénme", "hv": "thập ma", "meaning": "cái gì", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "十", "pinyin": "shí", "hv": "thập", "meaning": "số 10", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "时候", "pinyin": "shíhou", "hv": "thời hậu", "meaning": "lúc, khi", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "是", "pinyin": "shì", "hv": "thị", "meaning": "là, phải, đúng", "level": "HSK 1", "pos": "Động từ", "topic": "Phán đoán"},
      {"hanzi": "书", "pinyin": "shū", "hv": "thư", "meaning": "sách", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "水", "pinyin": "shuǐ", "hv": "thủy", "meaning": "nước", "level": "HSK 1", "pos": "Danh từ", "topic": "Ẩm thực"},
      {"hanzi": "水果", "pinyin": "shuǐguǒ", "hv": "thủy quả", "meaning": "hoa quả, trái cây", "level": "HSK 1", "pos": "Danh từ", "topic": "Hoa quả"},
      {"hanzi": "睡觉", "pinyin": "shuì jiào", "hv": "thụy giác", "meaning": "ngủ", "level": "HSK 1", "pos": "Động từ", "topic": "Sinh hoạt"},
      {"hanzi": "说", "pinyin": "shuō", "hv": "thuyết", "meaning": "nói", "level": "HSK 1", "pos": "Động từ", "topic": "Giao tiếp"},
      {"hanzi": "说话", "pinyin": "shuō huà", "hv": "thuyết thoại", "meaning": "nói chuyện", "level": "HSK 1", "pos": "Động từ", "topic": "Giao tiếp"},
      {"hanzi": "四", "pinyin": "sì", "hv": "tứ", "meaning": "số 4", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "岁", "pinyin": "suì", "hv": "tuế", "meaning": "tuổi", "level": "HSK 1", "pos": "Lượng từ", "topic": "Tuổi tác"},
      {"hanzi": "他", "pinyin": "tā", "hv": "tha", "meaning": "anh ấy, ông ấy", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "她", "pinyin": "tā", "hv": "tha", "meaning": "cô ấy, bà ấy", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "太", "pinyin": "tài", "hv": "thái", "meaning": "quá, lắm", "level": "HSK 1", "pos": "Phó từ", "topic": "Mức độ"},
      {"hanzi": "天气", "pinyin": "tiānqì", "hv": "thiên khí", "meaning": "thời tiết", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời tiết"},
      {"hanzi": "听", "pinyin": "tīng", "hv": "thính", "meaning": "nghe", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "同学", "pinyin": "tóngxué", "hv": "đồng học", "meaning": "bạn cùng lớp", "level": "HSK 1", "pos": "Danh từ", "topic": "Học tập"},
      {"hanzi": "喂", "pinyin": "wèi", "hv": "ủy", "meaning": "a-lô (nghe điện thoại)", "level": "HSK 1", "pos": "Thán từ", "topic": "Giao tiếp"},
      {"hanzi": "我", "pinyin": "wǒ", "hv": "ngã", "meaning": "tôi, mình", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "我们", "pinyin": "wǒmen", "hv": "ngã môn", "meaning": "chúng tôi, chúng ta", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "五", "pinyin": "wǔ", "hv": "ngũ", "meaning": "số 5", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "喜欢", "pinyin": "xǐhuan", "hv": "hỉ hoan", "meaning": "thích, yêu thích", "level": "HSK 1", "pos": "Động từ", "topic": "Sở thích"},
      {"hanzi": "下", "pinyin": "xià", "hv": "hạ", "meaning": "dưới, xuống", "level": "HSK 1", "pos": "Danh từ/Động từ", "topic": "Phương vị"},
      {"hanzi": "下午", "pinyin": "xiàwǔ", "hv": "hạ ngọ", "meaning": "buổi chiều", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "下雨", "pinyin": "xià yǔ", "hv": "hạ vũ", "meaning": "trời mưa", "level": "HSK 1", "pos": "Động từ", "topic": "Thời tiết"},
      {"hanzi": "先生", "pinyin": "xiānsheng", "hv": "tiên sinh", "meaning": "ông, ngài, thầy", "level": "HSK 1", "pos": "Danh từ", "topic": "Xưng hô"},
      {"hanzi": "现在", "pinyin": "xiànzài", "hv": "hiện tại", "meaning": "bây giờ, hiện nay", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "想", "pinyin": "xiǎng", "hv": "tưởng", "meaning": "muốn, nhớ, nghĩ", "level": "HSK 1", "pos": "Động từ", "topic": "Tâm lý"},
      {"hanzi": "小", "pinyin": "xiǎo", "hv": "tiểu", "meaning": "nhỏ, bé", "level": "HSK 1", "pos": "Tính từ", "topic": "Kích thước"},
      {"hanzi": "小姐", "pinyin": "xiǎojiě", "hv": "tiểu thư", "meaning": "cô gái, tiểu thư", "level": "HSK 1", "pos": "Danh từ", "topic": "Xưng hô"},
      {"hanzi": "些", "pinyin": "xiē", "hv": "thao", "meaning": "một vài, một ít", "level": "HSK 1", "pos": "Lượng từ", "topic": "Số lượng"},
      {"hanzi": "写", "pinyin": "xiě", "hv": "tả", "meaning": "viết", "level": "HSK 1", "pos": "Động từ", "topic": "Học tập"},
      {"hanzi": "谢谢", "pinyin": "xièxie", "hv": "tạ tạ", "meaning": "cảm ơn", "level": "HSK 1", "pos": "Chào hỏi", "topic": "Giao tiếp"},
      {"hanzi": "星期", "pinyin": "xīngqī", "hv": "tinh kỳ", "meaning": "tuần, thứ", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "学生", "pinyin": "xuésheng", "hv": "học sinh", "meaning": "học sinh, sinh viên", "level": "HSK 1", "pos": "Danh từ", "topic": "Học tập"},
      {"hanzi": "学习", "pinyin": "xuéxí", "hv": "học tập", "meaning": "học tập, học", "level": "HSK 1", "pos": "Động từ", "topic": "Học tập"},
      {"hanzi": "学校", "pinyin": "xuéxiào", "hv": "học hiệu", "meaning": "trường học", "level": "HSK 1", "pos": "Danh từ", "topic": "Địa điểm"},
      {"hanzi": "一", "pinyin": "yī", "hv": "nhất", "meaning": "số 1", "level": "HSK 1", "pos": "Số từ", "topic": "Con số"},
      {"hanzi": "衣服", "pinyin": "yīfu", "hv": "y phục", "meaning": "quần áo", "level": "HSK 1", "pos": "Danh từ", "topic": "Trang phục"},
      {"hanzi": "医生", "pinyin": "yīshēng", "hv": "y sinh", "meaning": "bác sĩ", "level": "HSK 1", "pos": "Danh từ", "topic": "Nghề nghiệp"},
      {"hanzi": "医院", "pinyin": "yīyuàn", "hv": "y viện", "meaning": "bệnh viện", "level": "HSK 1", "pos": "Danh từ", "topic": "Địa điểm"},
      {"hanzi": "椅子", "pinyin": "yǐzi", "hv": "ỷ tử", "meaning": "cái ghế", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "有", "pinyin": "yǒu", "hv": "hữu", "meaning": "có", "level": "HSK 1", "pos": "Động từ", "topic": "Sở hữu"},
      {"hanzi": "月", "pinyin": "yuè", "hv": "nguyệt", "meaning": "tháng, mặt trăng", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "再见", "pinyin": "zàijiàn", "hv": "tái kiến", "meaning": "tạm biệt", "level": "HSK 1", "pos": "Chào hỏi", "topic": "Giao tiếp"},
      {"hanzi": "在", "pinyin": "zài", "hv": "tại", "meaning": "ở, tại, đang", "level": "HSK 1", "pos": "Giới từ/Động từ", "topic": "Vị trí"},
      {"hanzi": "怎么", "pinyin": "zěnme", "hv": "chẩm ma", "meaning": "thế nào, sao", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "怎么样", "pinyin": "zěnmeyàng", "hv": "chẩm ma dạng", "meaning": "như thế nào, ra sao", "level": "HSK 1", "pos": "Đại từ", "topic": "Hỏi đáp"},
      {"hanzi": "这", "pinyin": "zhè", "hv": "giá", "meaning": "đây, này", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "这儿", "pinyin": "zhèr", "hv": "giá nhi", "meaning": "ở đây, chỗ này", "level": "HSK 1", "pos": "Đại từ", "topic": "Đại từ"},
      {"hanzi": "中国", "pinyin": "Zhōngguó", "hv": "Trung Quốc", "meaning": "Trung Quốc", "level": "HSK 1", "pos": "Danh từ riêng", "topic": "Quốc gia"},
      {"hanzi": "中午", "pinyin": "zhōngwǔ", "hv": "trung ngọ", "meaning": "buổi trưa", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "住", "pinyin": "zhù", "hv": "trú", "meaning": "sống, ở", "level": "HSK 1", "pos": "Động từ", "topic": "Sinh hoạt"},
      {"hanzi": "桌子", "pinyin": "zhuōzi", "hv": "trác tử", "meaning": "cái bàn", "level": "HSK 1", "pos": "Danh từ", "topic": "Đồ vật"},
      {"hanzi": "字", "pinyin": "zì", "hv": "tự", "meaning": "chữ, chữ Hán", "level": "HSK 1", "pos": "Danh từ", "topic": "Học tập"},
      {"hanzi": "昨天", "pinyin": "zuótiān", "hv": "tạc thiên", "meaning": "hôm qua", "level": "HSK 1", "pos": "Danh từ", "topic": "Thời gian"},
      {"hanzi": "坐", "pinyin": "zuò", "hv": "tọa", "meaning": "ngồi, đi (tàu, xe)", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "做", "pinyin": "zuò", "hv": "tác", "meaning": "làm", "level": "HSK 1", "pos": "Động từ", "topic": "Hành động"},
      {"hanzi": "吧", "pinyin": "ba", "hv": "ba", "meaning": "nhé, đi (trợ từ ngữ khí)", "level": "HSK 2", "pos": "Trợ từ", "lesson": 5, "topic": "Ngữ pháp"},
      {"hanzi": "白", "pinyin": "bái", "hv": "bạch", "meaning": "trắng, màu trắng", "level": "HSK 2", "pos": "Tính từ", "lesson": 8, "topic": "Màu sắc"},
      {"hanzi": "百", "pinyin": "bǎi", "hv": "bách", "meaning": "trăm (100)", "level": "HSK 2", "pos": "Số từ", "lesson": 14, "topic": "Con số"},
      {"hanzi": "帮助", "pinyin": "bāngzhù", "hv": "bang trợ", "meaning": "giúp đỡ, viện trợ", "level": "HSK 2", "pos": "Động từ", "lesson": 10, "topic": "Giao tiếp"},
      {"hanzi": "报纸", "pinyin": "bàozhǐ", "hv": "báo chỉ", "meaning": "báo, tờ báo", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Đồ vật"},
      {"hanzi": "比", "pinyin": "bǐ", "hv": "tỉ", "meaning": "so với, hơn", "level": "HSK 2", "pos": "Giới từ", "lesson": 11, "topic": "So sánh"},
      {"hanzi": "别", "pinyin": "bié", "hv": "biệt", "meaning": "đừng, chớ", "level": "HSK 2", "pos": "Phó từ", "lesson": 10, "topic": "Mệnh lệnh"},
      {"hanzi": "宾馆", "pinyin": "bīnguǎn", "hv": "tân quán", "meaning": "khách sạn", "level": "HSK 2", "pos": "Danh từ", "lesson": 13, "topic": "Địa điểm"},
      {"hanzi": "长", "pinyin": "cháng", "hv": "trường", "meaning": "dài, lâu", "level": "HSK 2", "pos": "Tính từ", "lesson": 4, "topic": "Kích thước"},
      {"hanzi": "唱歌", "pinyin": "chàng gē", "hv": "xướng ca", "meaning": "hát, ca hát", "level": "HSK 2", "pos": "Động từ", "lesson": 11, "topic": "Giải trí"},
      {"hanzi": "出", "pinyin": "chū", "hv": "xuất", "meaning": "ra, ra ngoài", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Hành động"},
      {"hanzi": "穿", "pinyin": "chuān", "hv": "xuyên", "meaning": "mặc, đi (giày, dép)", "level": "HSK 2", "pos": "Động từ", "lesson": 12, "topic": "Trang phục"},
      {"hanzi": "次", "pinyin": "cì", "hv": "thứ", "meaning": "lần, chuyến", "level": "HSK 2", "pos": "Lượng từ", "lesson": 14, "topic": "Số lượng"},
      {"hanzi": "从", "pinyin": "cóng", "hv": "tòng", "meaning": "từ (địa điểm, thời gian)", "level": "HSK 2", "pos": "Giới từ", "lesson": 9, "topic": "Vị trí"},
      {"hanzi": "错", "pinyin": "cuò", "hv": "thác", "meaning": "sai, nhầm", "level": "HSK 2", "pos": "Tính từ", "lesson": 9, "topic": "Đánh giá"},
      {"hanzi": "打篮球", "pinyin": "dǎ lánqiú", "hv": "đả lam cầu", "meaning": "chơi bóng rổ", "level": "HSK 2", "pos": "Động từ", "lesson": 6, "topic": "Thể thao"},
      {"hanzi": "大家", "pinyin": "dàjiā", "hv": "đại gia", "meaning": "mọi người, tất cả", "level": "HSK 2", "pos": "Danh từ/Đại từ", "lesson": 15, "topic": "Xã hội"},
      {"hanzi": "但是", "pinyin": "dànshì", "hv": "đãn thị", "meaning": "nhưng, nhưng mà", "level": "HSK 2", "pos": "Liên từ", "lesson": 14, "topic": "Liên từ"},
      {"hanzi": "到", "pinyin": "dào", "hv": "đáo", "meaning": "đến, tới", "level": "HSK 2", "pos": "Động từ", "lesson": 7, "topic": "Hành động"},
      {"hanzi": "得", "pinyin": "de", "hv": "đắc", "meaning": "được (trợ từ kết cấu bổ ngữ)", "level": "HSK 2", "pos": "Trợ từ", "lesson": 12, "topic": "Ngữ pháp"},
      {"hanzi": "等", "pinyin": "děng", "hv": "đẳng", "meaning": "chờ, đợi", "level": "HSK 2", "pos": "Động từ", "lesson": 8, "topic": "Hành động"},
      {"hanzi": "弟弟", "pinyin": "dìdi", "hv": "đệ đệ", "meaning": "em trai", "level": "HSK 2", "pos": "Danh từ", "lesson": 12, "topic": "Gia đình"},
      {"hanzi": "第一", "pinyin": "dì-yī", "hv": "đệ nhất", "meaning": "thứ nhất, đầu tiên", "level": "HSK 2", "pos": "Số từ", "lesson": 9, "topic": "Thứ tự"},
      {"hanzi": "懂", "pinyin": "dǒng", "hv": "đổng", "meaning": "hiểu, biết", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Nhận thức"},
      {"hanzi": "对", "pinyin": "duì", "hv": "đối", "meaning": "đối với, đúng", "level": "HSK 2", "pos": "Giới từ/Tính từ", "lesson": 5, "topic": "Giao tiếp"},
      {"hanzi": "房间", "pinyin": "fángjiān", "hv": "phòng gian", "meaning": "căn phòng", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Nhà cửa"},
      {"hanzi": "非常", "pinyin": "fēicháng", "hv": "phi thường", "meaning": "vô cùng, rất", "level": "HSK 2", "pos": "Phó từ", "lesson": 4, "topic": "Mức độ"},
      {"hanzi": "服务员", "pinyin": "fúwùyuán", "hv": "phục vụ viên", "meaning": "nhân viên phục vụ", "level": "HSK 2", "pos": "Danh từ", "lesson": 8, "topic": "Nghề nghiệp"},
      {"hanzi": "高", "pinyin": "gāo", "hv": "cao", "meaning": "cao", "level": "HSK 2", "pos": "Tính từ", "lesson": 2, "topic": "Ngoại hình"},
      {"hanzi": "告诉", "pinyin": "gàosu", "hv": "cáo tố", "meaning": "bảo, nói cho biết", "level": "HSK 2", "pos": "Động từ", "lesson": 8, "topic": "Giao tiếp"},
      {"hanzi": "哥哥", "pinyin": "gēge", "hv": "ca ca", "meaning": "anh trai", "level": "HSK 2", "pos": "Danh từ", "lesson": 10, "topic": "Gia đình"},
      {"hanzi": "给", "pinyin": "gěi", "hv": "cấp", "meaning": "cho, đưa cho", "level": "HSK 2", "pos": "Giới từ/Động từ", "lesson": 4, "topic": "Hành động"},
      {"hanzi": "公共汽车", "pinyin": "gōnggòng qìchē", "hv": "công cộng khí xa", "meaning": "xe buýt", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Giao thông"},
      {"hanzi": "公司", "pinyin": "gōngsī", "hv": "công ty", "meaning": "công ty", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Nơi làm việc"},
      {"hanzi": "贵", "pinyin": "guì", "hv": "quý", "meaning": "đắt, quý", "level": "HSK 2", "pos": "Tính từ", "lesson": 8, "topic": "Mua sắm"},
      {"hanzi": "还", "pinyin": "hái", "hv": "hoàn", "meaning": "vẫn, còn", "level": "HSK 2", "pos": "Phó từ", "lesson": 5, "topic": "Phó từ"},
      {"hanzi": "孩子", "pinyin": "háizi", "hv": "hài tử", "meaning": "đứa trẻ, con cái", "level": "HSK 2", "pos": "Danh từ", "lesson": 11, "topic": "Gia đình"},
      {"hanzi": "好吃", "pinyin": "hǎochī", "hv": "hảo ngật", "meaning": "ngon, ngon miệng", "level": "HSK 2", "pos": "Tính từ", "lesson": 6, "topic": "Ẩm thực"},
      {"hanzi": "黑", "pinyin": "hēi", "hv": "hắc", "meaning": "đen, màu đen", "level": "HSK 2", "pos": "Tính từ", "lesson": 8, "topic": "Màu sắc"},
      {"hanzi": "红", "pinyin": "hóng", "hv": "hồng", "meaning": "đỏ, màu đỏ", "level": "HSK 2", "pos": "Tính từ", "lesson": 3, "topic": "Màu sắc"},
      {"hanzi": "火车站", "pinyin": "huǒchēzhàn", "hv": "hỏa xa trạm", "meaning": "ga tàu hỏa", "level": "HSK 2", "pos": "Danh từ", "lesson": 15, "topic": "Giao thông"},
      {"hanzi": "机场", "pinyin": "jīchǎng", "hv": "cơ trường", "meaning": "sân bay", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Giao thông"},
      {"hanzi": "鸡蛋", "pinyin": "jīdàn", "hv": "kê đản", "meaning": "trứng gà", "level": "HSK 2", "pos": "Danh từ", "lesson": 10, "topic": "Ẩm thực"},
      {"hanzi": "件", "pinyin": "jiàn", "hv": "kiện", "meaning": "chiếc, cái (lượng từ áo quần)", "level": "HSK 2", "pos": "Lượng từ", "lesson": 5, "topic": "Lượng từ"},
      {"hanzi": "觉得", "pinyin": "juéde", "hv": "giác đắc", "meaning": "cảm thấy, nghĩ rằng", "level": "HSK 2", "pos": "Động từ", "lesson": 1, "topic": "Tâm lý"},
      {"hanzi": "教室", "pinyin": "jiàoshì", "hv": "giáo thất", "meaning": "phòng học, lớp học", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Trường học"},
      {"hanzi": "姐姐", "pinyin": "jiějie", "hv": "tỷ tỷ", "meaning": "chị gái", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Gia đình"},
      {"hanzi": "介绍", "pinyin": "jièshào", "hv": "giới thiệu", "meaning": "giới thiệu", "level": "HSK 2", "pos": "Động từ", "lesson": 4, "topic": "Giao tiếp"},
      {"hanzi": "进", "pinyin": "jìn", "hv": "tiến", "meaning": "vào, tiến vào", "level": "HSK 2", "pos": "Động từ", "lesson": 12, "topic": "Hành động"},
      {"hanzi": "近", "pinyin": "jìn", "hv": "cận", "meaning": "gần", "level": "HSK 2", "pos": "Tính từ", "lesson": 12, "topic": "Khoảng cách"},
      {"hanzi": "就", "pinyin": "jiù", "hv": "tựu", "meaning": "liền, ngay, chỉ", "level": "HSK 2", "pos": "Phó từ", "lesson": 5, "topic": "Phó từ"},
      {"hanzi": "咖啡", "pinyin": "kāfēi", "hv": "cà phê", "meaning": "cà phê", "level": "HSK 2", "pos": "Danh từ", "lesson": 5, "topic": "Ẩm thực"},
      {"hanzi": "开始", "pinyin": "kāishǐ", "hv": "khai thủy", "meaning": "bắt đầu", "level": "HSK 2", "pos": "Động từ", "lesson": 4, "topic": "Hành động"},
      {"hanzi": "考试", "pinyin": "kǎoshì", "hv": "khảo thí", "meaning": "thi cử, bài thi", "level": "HSK 2", "pos": "Danh từ/Động từ", "lesson": 5, "topic": "Học tập"},
      {"hanzi": "可能", "pinyin": "kěnéng", "hv": "khả năng", "meaning": "có thể, có lẽ", "level": "HSK 2", "pos": "Động từ năng nguyện", "lesson": 11, "topic": "Phán đoán"},
      {"hanzi": "可以", "pinyin": "kěyǐ", "hv": "khả dĩ", "meaning": "có thể, tạm được", "level": "HSK 2", "pos": "Động từ năng nguyện", "lesson": 5, "topic": "Năng lực"},
      {"hanzi": "课", "pinyin": "kè", "hv": "khóa", "meaning": "bài học, môn học", "level": "HSK 2", "pos": "Danh từ", "lesson": 10, "topic": "Học tập"},
      {"hanzi": "快", "pinyin": "kuài", "hv": "khoái", "meaning": "nhanh, sắp", "level": "HSK 2", "pos": "Tính từ/Phó từ", "lesson": 7, "topic": "Tốc độ"},
      {"hanzi": "快乐", "pinyin": "kuàilè", "hv": "khoái lạc", "meaning": "vui vẻ, hạnh phúc", "level": "HSK 2", "pos": "Tính từ", "lesson": 4, "topic": "Cảm xúc"},
      {"hanzi": "离", "pinyin": "lí", "hv": "ly", "meaning": "cách (khoảng cách)", "level": "HSK 2", "pos": "Giới từ", "lesson": 7, "topic": "Vị trí"},
      {"hanzi": "两", "pinyin": "liǎng", "hv": "lưỡng", "meaning": "hai (dùng trước lượng từ)", "level": "HSK 2", "pos": "Số từ", "lesson": 4, "topic": "Con số"},
      {"hanzi": "零", "pinyin": "líng", "hv": "linh", "meaning": "số 0", "level": "HSK 2", "pos": "Số từ", "lesson": 12, "topic": "Con số"},
      {"hanzi": "路", "pinyin": "lù", "hv": "lộ", "meaning": "đường, tuyến đường", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Giao thông"},
      {"hanzi": "旅游", "pinyin": "lǚyóu", "hv": "lữ du", "meaning": "du lịch", "level": "HSK 2", "pos": "Động từ", "lesson": 1, "topic": "Du lịch"},
      {"hanzi": "慢", "pinyin": "màn", "hv": "mạn", "meaning": "chậm", "level": "HSK 2", "pos": "Tính từ", "lesson": 7, "topic": "Tốc độ"},
      {"hanzi": "忙", "pinyin": "máng", "hv": "mang", "meaning": "bận, bận rộn", "level": "HSK 2", "pos": "Tính từ", "lesson": 2, "topic": "Trạng thái"},
      {"hanzi": "每", "pinyin": "měi", "hv": "mỗi", "meaning": "mỗi, mọi", "level": "HSK 2", "pos": "Đại từ", "lesson": 2, "topic": "Đại từ"},
      {"hanzi": "妹妹", "pinyin": "mèimei", "hv": "muội muội", "meaning": "em gái", "level": "HSK 2", "pos": "Danh từ", "lesson": 15, "topic": "Gia đình"},
      {"hanzi": "门", "pinyin": "mén", "hv": "môn", "meaning": "cửa, cổng", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Nhà cửa"},
      {"hanzi": "面条", "pinyin": "miàntiáo", "hv": "miến điều", "meaning": "mì sợi", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Ẩm thực"},
      {"hanzi": "男", "pinyin": "nán", "hv": "nam", "meaning": "nam, đàn ông", "level": "HSK 2", "pos": "Tính từ", "lesson": 11, "topic": "Giới tính"},
      {"hanzi": "牛奶", "pinyin": "niúnǎi", "hv": "ngưu nãi", "meaning": "sữa bò", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Ẩm thực"},
      {"hanzi": "女", "pinyin": "nǚ", "hv": "nữ", "meaning": "nữ, phụ nữ", "level": "HSK 2", "pos": "Tính từ", "lesson": 11, "topic": "Giới tính"},
      {"hanzi": "旁边", "pinyin": "pángbiān", "hv": "bàng biên", "meaning": "bên cạnh", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Phương vị"},
      {"hanzi": "跑步", "pinyin": "pǎo bù", "hv": "bào bộ", "meaning": "chạy bộ", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Thể thao"},
      {"hanzi": "便宜", "pinyin": "piányi", "hv": "tiện nghi", "meaning": "rẻ, giá rẻ", "level": "HSK 2", "pos": "Tính từ", "lesson": 11, "topic": "Mua sắm"},
      {"hanzi": "票", "pinyin": "piào", "hv": "phiếu", "meaning": "vé", "level": "HSK 2", "pos": "Danh từ", "lesson": 15, "topic": "Du lịch"},
      {"hanzi": "妻子", "pinyin": "qīzi", "hv": "thê tử", "meaning": "vợ", "level": "HSK 2", "pos": "Danh từ", "lesson": 12, "topic": "Gia đình"},
      {"hanzi": "起床", "pinyin": "qǐ chuáng", "hv": "khởi sàng", "meaning": "thức dậy", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Sinh hoạt"},
      {"hanzi": "千", "pinyin": "qiān", "hv": "thiên", "meaning": "nghìn (1.000)", "level": "HSK 2", "pos": "Số từ", "lesson": 3, "topic": "Con số"},
      {"hanzi": "铅笔", "pinyin": "qiānbǐ", "hv": "duyên bút", "meaning": "bút chì", "level": "HSK 2", "pos": "Danh từ", "lesson": 13, "topic": "Đồ dùng học tập"},
      {"hanzi": "晴", "pinyin": "qíng", "hv": "tình", "meaning": "nắng, trời nắng ráo", "level": "HSK 2", "pos": "Tính từ", "lesson": 14, "topic": "Thời tiết"},
      {"hanzi": "去年", "pinyin": "qùnián", "hv": "khứ niên", "meaning": "năm ngoái", "level": "HSK 2", "pos": "Danh từ", "lesson": 11, "topic": "Thời gian"},
      {"hanzi": "让", "pinyin": "ràng", "hv": "nhượng", "meaning": "để, bảo, nhường", "level": "HSK 2", "pos": "Động từ", "lesson": 8, "topic": "Sai khiến"},
      {"hanzi": "日", "pinyin": "rì", "hv": "nhật", "meaning": "ngày, mặt trời", "level": "HSK 2", "pos": "Danh từ", "lesson": 15, "topic": "Thời gian"},
      {"hanzi": "上班", "pinyin": "shàng bān", "hv": "thượng ban", "meaning": "đi làm", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Công việc"},
      {"hanzi": "身体", "pinyin": "shēntǐ", "hv": "thân thể", "meaning": "thân thể, sức khỏe", "level": "HSK 2", "pos": "Danh từ", "lesson": 2, "topic": "Sức khỏe"},
      {"hanzi": "生病", "pinyin": "shēng bìng", "hv": "sinh bệnh", "meaning": "bị ốm, bị bệnh", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Sức khỏe"},
      {"hanzi": "生日", "pinyin": "shēngrì", "hv": "sinh nhật", "meaning": "sinh nhật", "level": "HSK 2", "pos": "Danh từ", "lesson": 4, "topic": "Lễ kỷ niệm"},
      {"hanzi": "时间", "pinyin": "shíjiān", "hv": "thời gian", "meaning": "thời gian", "level": "HSK 2", "pos": "Danh từ", "lesson": 2, "topic": "Thời gian"},
      {"hanzi": "事情", "pinyin": "shìqing", "hv": "sự tình", "meaning": "sự việc, chuyện", "level": "HSK 2", "pos": "Danh từ", "lesson": 8, "topic": "Cuộc sống"},
      {"hanzi": "手表", "pinyin": "shǒubiǎo", "hv": "thủ biểu", "meaning": "đồng hồ đeo tay", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Phụ kiện"},
      {"hanzi": "手机", "pinyin": "shǒujī", "hv": "thủ cơ", "meaning": "điện thoại di động", "level": "HSK 2", "pos": "Danh từ", "lesson": 10, "topic": "Công nghệ"},
      {"hanzi": "说话", "pinyin": "shuō huà", "hv": "thuyết thoại", "meaning": "nói chuyện", "level": "HSK 2", "pos": "Động từ", "lesson": 11, "topic": "Giao tiếp"},
      {"hanzi": "送", "pinyin": "sòng", "hv": "tống", "meaning": "tặng, tiễn, đưa", "level": "HSK 2", "pos": "Động từ", "lesson": 3, "topic": "Hành động"},
      {"hanzi": "虽然", "pinyin": "suīrán", "hv": "tuy nhiên", "meaning": "tuy, mặc dù", "level": "HSK 2", "pos": "Liên từ", "lesson": 14, "topic": "Liên từ"},
      {"hanzi": "所以", "pinyin": "suǒyǐ", "hv": "sở dĩ", "meaning": "cho nên, vì vậy", "level": "HSK 2", "pos": "Liên từ", "lesson": 6, "topic": "Liên từ"},
      {"hanzi": "它", "pinyin": "tā", "hv": "tha", "meaning": "nó (chỉ con vật, đồ vật)", "level": "HSK 2", "pos": "Đại từ", "lesson": 1, "topic": "Đại từ"},
      {"hanzi": "踢足球", "pinyin": "tī zúqiú", "hv": "thích túc cầu", "meaning": "đá bóng", "level": "HSK 2", "pos": "Động từ", "lesson": 1, "topic": "Thể thao"},
      {"hanzi": "题", "pinyin": "tí", "hv": "đề", "meaning": "câu hỏi, bài tập, đề bài", "level": "HSK 2", "pos": "Danh từ", "lesson": 9, "topic": "Học tập"},
      {"hanzi": "跳舞", "pinyin": "tiào wǔ", "hv": "khiêu vũ", "meaning": "khiêu vũ, múa", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Nghệ thuật"},
      {"hanzi": "外", "pinyin": "wài", "hv": "ngoại", "meaning": "ngoài, bên ngoài", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Phương vị"},
      {"hanzi": "完", "pinyin": "wán", "hv": "hoàn", "meaning": "hết, xong", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Kết quả"},
      {"hanzi": "玩儿", "pinyin": "wánr", "hv": "ngoạn nhi", "meaning": "chơi", "level": "HSK 2", "pos": "Động từ", "lesson": 14, "topic": "Giải trí"},
      {"hanzi": "晚上", "pinyin": "wǎnshang", "hv": "vãn thượng", "meaning": "buổi tối", "level": "HSK 2", "pos": "Danh từ", "lesson": 4, "topic": "Thời gian"},
      {"hanzi": "往", "pinyin": "wǎng", "hv": "vãng", "meaning": "hướng về, đi về phía", "level": "HSK 2", "pos": "Giới từ", "lesson": 13, "topic": "Phương hướng"},
      {"hanzi": "为什么", "pinyin": "wèishénme", "hv": "vi thập ma", "meaning": "tại sao, vì sao", "level": "HSK 2", "pos": "Đại từ", "lesson": 1, "topic": "Hỏi đáp"},
      {"hanzi": "问", "pinyin": "wèn", "hv": "vấn", "meaning": "hỏi", "level": "HSK 2", "pos": "Động từ", "lesson": 4, "topic": "Giao tiếp"},
      {"hanzi": "问题", "pinyin": "wèntí", "hv": "vấn đề", "meaning": "vấn đề, câu hỏi", "level": "HSK 2", "pos": "Danh từ", "lesson": 9, "topic": "Học tập"},
      {"hanzi": "西瓜", "pinyin": "xīguā", "hv": "tây qua", "meaning": "dưa hấu", "level": "HSK 2", "pos": "Danh từ", "lesson": 10, "topic": "Hoa quả"},
      {"hanzi": "希望", "pinyin": "xīwàng", "hv": "hy vọng", "meaning": "hy vọng, mong muốn", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Tâm lý"},
      {"hanzi": "洗", "pinyin": "xǐ", "hv": "tẩy", "meaning": "rửa, giặt", "level": "HSK 2", "pos": "Động từ", "lesson": 10, "topic": "Sinh hoạt"},
      {"hanzi": "小时", "pinyin": "xiǎoshí", "hv": "tiểu thời", "meaning": "tiếng, giờ đồng hồ", "level": "HSK 2", "pos": "Danh từ", "lesson": 7, "topic": "Thời gian"},
      {"hanzi": "笑", "pinyin": "xiào", "hv": "tiếu", "meaning": "cười", "level": "HSK 2", "pos": "Động từ", "lesson": 13, "topic": "Cảm xúc"},
      {"hanzi": "新", "pinyin": "xīn", "hv": "tân", "meaning": "mới", "level": "HSK 2", "pos": "Tính từ", "lesson": 1, "topic": "Trạng thái"},
      {"hanzi": "姓", "pinyin": "xìng", "hv": "tính", "meaning": "mang họ, họ là", "level": "HSK 2", "pos": "Động từ/Danh từ", "lesson": 11, "topic": "Giới thiệu"},
      {"hanzi": "休息", "pinyin": "xiūxi", "hv": "hưu tức", "meaning": "nghỉ ngơi", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Sinh hoạt"},
      {"hanzi": "雪", "pinyin": "xuě", "hv": "tuyết", "meaning": "tuyết", "level": "HSK 2", "pos": "Danh từ", "lesson": 12, "topic": "Thời tiết"},
      {"hanzi": "颜色", "pinyin": "yánsè", "hv": "nhan sắc", "meaning": "màu sắc", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Màu sắc"},
      {"hanzi": "眼睛", "pinyin": "yǎnjing", "hv": "nhãn tinh", "meaning": "mắt, đôi mắt", "level": "HSK 2", "pos": "Danh từ", "lesson": 1, "topic": "Cơ thể"},
      {"hanzi": "羊肉", "pinyin": "yángròu", "hv": "dương nhục", "meaning": "thịt dê, thịt cừu", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Ẩm thực"},
      {"hanzi": "药", "pinyin": "yào", "hv": "dược", "meaning": "thuốc", "level": "HSK 2", "pos": "Danh từ", "lesson": 2, "topic": "Y tế"},
      {"hanzi": "要", "pinyin": "yào", "hv": "yếu", "meaning": "muốn, phải, cần, sắp", "level": "HSK 2", "pos": "Động từ năng nguyện", "lesson": 1, "topic": "Nguyện vọng"},
      {"hanzi": "也", "pinyin": "yě", "hv": "dã", "meaning": "cũng", "level": "HSK 2", "pos": "Phó từ", "lesson": 1, "topic": "Phó từ"},
      {"hanzi": "一下", "pinyin": "yíxià", "hv": "nhất hạ", "meaning": "một chút, thử làm", "level": "HSK 2", "pos": "Số lượng từ", "lesson": 3, "topic": "Thời lượng"},
      {"hanzi": "已经", "pinyin": "yǐjīng", "hv": "dĩ kinh", "meaning": "đã", "level": "HSK 2", "pos": "Phó từ", "lesson": 4, "topic": "Thời gian"},
      {"hanzi": "一起", "pinyin": "yìqǐ", "hv": "nhất khởi", "meaning": "cùng nhau", "level": "HSK 2", "pos": "Phó từ", "lesson": 1, "topic": "Hành động"},
      {"hanzi": "意思", "pinyin": "yìsi", "hv": "ý tứ", "meaning": "ý nghĩa, thú vị", "level": "HSK 2", "pos": "Danh từ", "lesson": 5, "topic": "Nhận thức"},
      {"hanzi": "因为", "pinyin": "yīnwèi", "hv": "nhân vi", "meaning": "bởi vì, vì", "level": "HSK 2", "pos": "Liên từ", "lesson": 6, "topic": "Liên từ"},
      {"hanzi": "阴", "pinyin": "yīn", "hv": "âm", "meaning": "u ám, trời râm", "level": "HSK 2", "pos": "Tính từ", "lesson": 15, "topic": "Thời tiết"},
      {"hanzi": "游泳", "pinyin": "yóu yǒng", "hv": "du vịnh", "meaning": "bơi lội", "level": "HSK 2", "pos": "Động từ", "lesson": 6, "topic": "Thể thao"},
      {"hanzi": "右边", "pinyin": "yòubian", "hv": "hữu biên", "meaning": "bên phải", "level": "HSK 2", "pos": "Danh từ", "lesson": 11, "topic": "Phương vị"},
      {"hanzi": "鱼", "pinyin": "yú", "hv": "ngư", "meaning": "con cá, món cá", "level": "HSK 2", "pos": "Danh từ", "lesson": 5, "topic": "Ẩm thực"},
      {"hanzi": "远", "pinyin": "yuǎn", "hv": "viễn", "meaning": "xa", "level": "HSK 2", "pos": "Tính từ", "lesson": 7, "topic": "Khoảng cách"},
      {"hanzi": "运动", "pinyin": "yùndòng", "hv": "vận động", "meaning": "vận động, thể thao", "level": "HSK 2", "pos": "Động từ/Danh từ", "lesson": 1, "topic": "Thể thao"},
      {"hanzi": "再", "pinyin": "zài", "hv": "tái", "meaning": "lại, lần nữa, hãy", "level": "HSK 2", "pos": "Phó từ", "lesson": 8, "topic": "Phó từ"},
      {"hanzi": "早上", "pinyin": "zǎoshang", "hv": "tảo thượng", "meaning": "buổi sáng", "level": "HSK 2", "pos": "Danh từ", "lesson": 2, "topic": "Thời gian"},
      {"hanzi": "丈夫", "pinyin": "zhàngfu", "hv": "trượng phu", "meaning": "chồng", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Gia đình"},
      {"hanzi": "找", "pinyin": "zhǎo", "hv": "trảo", "meaning": "tìm kiếm", "level": "HSK 2", "pos": "Động từ", "lesson": 8, "topic": "Hành động"},
      {"hanzi": "着", "pinyin": "zhe", "hv": "trước", "meaning": "đang (trợ từ trạng thái)", "level": "HSK 2", "pos": "Trợ từ", "lesson": 13, "topic": "Ngữ pháp"},
      {"hanzi": "真", "pinyin": "zhēn", "hv": "chân", "meaning": "thật, thật là", "level": "HSK 2", "pos": "Phó từ", "lesson": 3, "topic": "Mức độ"},
      {"hanzi": "正在", "pinyin": "zhèngzài", "hv": "chính tại", "meaning": "đang, chính đang", "level": "HSK 2", "pos": "Phó từ", "lesson": 10, "topic": "Thời gian"},
      {"hanzi": "知道", "pinyin": "zhīdào", "hv": "tri đạo", "meaning": "biết, hiểu biết", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Nhận thức"},
      {"hanzi": "准备", "pinyin": "zhǔnbèi", "hv": "chuẩn bị", "meaning": "chuẩn bị, dự định", "level": "HSK 2", "pos": "Động từ", "lesson": 5, "topic": "Hành động"},
      {"hanzi": "走", "pinyin": "zǒu", "hv": "tẩu", "meaning": "đi, đi bộ", "level": "HSK 2", "pos": "Động từ", "lesson": 7, "topic": "Hành động"},
      {"hanzi": "最", "pinyin": "zuì", "hv": "tối", "meaning": "nhất (cao nhất)", "level": "HSK 2", "pos": "Phó từ", "lesson": 1, "topic": "Mức độ"},
      {"hanzi": "左边", "pinyin": "zuǒbian", "hv": "tả biên", "meaning": "bên trái", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Phương vị"},
      {"hanzi": "花花", "pinyin": "Huāhua", "hv": "Hoa Hoa", "meaning": "Hoa Hoa (tên con mèo)", "level": "HSK 2", "pos": "Danh từ riêng", "lesson": 1, "topic": "Tên riêng"},
      {"hanzi": "杨笑笑", "pinyin": "Yáng Xiàoxiao", "hv": "Dương Tiếu Tiếu", "meaning": "Dương Tiếu Tiếu (tên người)", "level": "HSK 2", "pos": "Danh từ riêng", "lesson": 13, "topic": "Tên riêng"},
      {"hanzi": "班", "pinyin": "bān", "hv": "ban", "meaning": "lớp học, ca làm", "level": "HSK 2", "pos": "Danh từ", "lesson": 13, "topic": "Trường học"},
      {"hanzi": "度", "pinyin": "dù", "hv": "độ", "meaning": "độ (nhiệt độ)", "level": "HSK 2", "pos": "Danh từ", "lesson": 12, "topic": "Thời tiết"},
      {"hanzi": "粉色", "pinyin": "fěnsè", "hv": "phấn sắc", "meaning": "màu hồng", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Màu sắc"},
      {"hanzi": "更", "pinyin": "gèng", "hv": "canh", "meaning": "càng, hơn nữa", "level": "HSK 2", "pos": "Phó từ", "lesson": 15, "topic": "Mức độ"},
      {"hanzi": "公斤", "pinyin": "gōngjīn", "hv": "công cân", "meaning": "ki-lô-gam (kg)", "level": "HSK 2", "pos": "Lượng từ", "lesson": 6, "topic": "Đơn vị đo"},
      {"hanzi": "过", "pinyin": "guò", "hv": "quá", "meaning": "từng, qua", "level": "HSK 2", "pos": "Trợ từ/Động từ", "lesson": 14, "topic": "Ngữ pháp"},
      {"hanzi": "欢迎", "pinyin": "huānyíng", "hv": "hoan nghênh", "meaning": "hoan nghênh, chào đón", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Giao tiếp"},
      {"hanzi": "接", "pinyin": "jiē", "hv": "tiếp", "meaning": "đón, nhận (điện thoại)", "level": "HSK 2", "pos": "Động từ", "lesson": 4, "topic": "Hành động"},
      {"hanzi": "经常", "pinyin": "jīngcháng", "hv": "kinh thường", "meaning": "thường xuyên", "level": "HSK 2", "pos": "Phó từ", "lesson": 6, "topic": "Tần suất"},
      {"hanzi": "米", "pinyin": "mǐ", "hv": "mễ", "meaning": "mét", "level": "HSK 2", "pos": "Lượng từ", "lesson": 2, "topic": "Đơn vị đo"},
      {"hanzi": "拿", "pinyin": "ná", "hv": "noa", "meaning": "cầm, lấy", "level": "HSK 2", "pos": "Động từ", "lesson": 13, "topic": "Hành động"},
      {"hanzi": "以后", "pinyin": "yǐhòu", "hv": "dĩ hậu", "meaning": "sau này, sau khi", "level": "HSK 2", "pos": "Danh từ", "lesson": 5, "topic": "Thời gian"},
      {"hanzi": "一直", "pinyin": "yìzhí", "hv": "nhất trực", "meaning": "thẳng, suốt, liên tục", "level": "HSK 2", "pos": "Phó từ", "lesson": 13, "topic": "Phương hướng"},
      {"hanzi": "长", "pinyin": "zhǎng", "hv": "trưởng", "meaning": "lớn lên, sinh ra", "level": "HSK 2", "pos": "Động từ", "lesson": 13, "topic": "Phát triển"},
      {"hanzi": "自行车", "pinyin": "zìxíngchē", "hv": "tự hành xa", "meaning": "xe đạp", "level": "HSK 2", "pos": "Danh từ", "lesson": 6, "topic": "Giao thông"},
      {"hanzi": "帮", "pinyin": "bāng", "hv": "bang", "meaning": "giúp, giúp đỡ", "level": "HSK 2", "pos": "Động từ", "lesson": 4, "topic": "Giao tiếp"},
      {"hanzi": "不错", "pinyin": "búcuò", "hv": "bất thác", "meaning": "tuyệt, khá tốt", "level": "HSK 2", "pos": "Tính từ", "lesson": 5, "topic": "Đánh giá"},
      {"hanzi": "出院", "pinyin": "chū yuàn", "hv": "xuất viện", "meaning": "xuất viện, ra viện", "level": "HSK 2", "pos": "Động từ", "lesson": 2, "topic": "Y tế"},
      {"hanzi": "粉", "pinyin": "fěn", "hv": "phấn", "meaning": "có màu hồng", "level": "HSK 2", "pos": "Tính từ", "lesson": 3, "topic": "Màu sắc"},
      {"hanzi": "红色", "pinyin": "hóngsè", "hv": "hồng sắc", "meaning": "màu đỏ", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Màu sắc"},
      {"hanzi": "路口", "pinyin": "lùkǒu", "hv": "lộ khẩu", "meaning": "ngã tư, giao lộ", "level": "HSK 2", "pos": "Danh từ", "lesson": 13, "topic": "Giao thông"},
      {"hanzi": "手", "pinyin": "shǒu", "hv": "thủ", "meaning": "bàn tay, tay", "level": "HSK 2", "pos": "Danh từ", "lesson": 13, "topic": "Cơ thể"},
      {"hanzi": "外面", "pinyin": "wàimiàn", "hv": "ngoại diện", "meaning": "bên ngoài", "level": "HSK 2", "pos": "Danh từ", "lesson": 5, "topic": "Phương vị"},
      {"hanzi": "新年", "pinyin": "xīnnián", "hv": "tân niên", "meaning": "năm mới, Tết", "level": "HSK 2", "pos": "Danh từ", "lesson": 15, "topic": "Lễ hội"},
      {"hanzi": "有意思", "pinyin": "yǒu yìsi", "hv": "hữu ý tứ", "meaning": "thú vị, có ý nghĩa", "level": "HSK 2", "pos": "Tính từ", "lesson": 14, "topic": "Đánh giá"},
      {"hanzi": "白色", "pinyin": "báisè", "hv": "bạch sắc", "meaning": "màu trắng", "level": "HSK 2", "pos": "Danh từ", "lesson": 8, "topic": "Màu sắc"},
      {"hanzi": "黑色", "pinyin": "hēisè", "hv": "hắc sắc", "meaning": "màu đen", "level": "HSK 2", "pos": "Danh từ", "lesson": 8, "topic": "Màu sắc"},
      {"hanzi": "房子", "pinyin": "fángzi", "hv": "phòng tử", "meaning": "ngôi nhà", "level": "HSK 2", "pos": "Danh từ", "lesson": 3, "topic": "Nhà cửa"},
      {"hanzi": "下班", "pinyin": "xià bān", "hv": "hạ ban", "meaning": "tan làm, tan ca", "level": "HSK 2", "pos": "Động từ", "lesson": 9, "topic": "Công việc"},
      {"hanzi": "早饭", "pinyin": "zǎofàn", "hv": "tảo phạn", "meaning": "bữa sáng", "level": "HSK 2", "pos": "Danh từ", "lesson": 2, "topic": "Ẩm thực"},
      {"hanzi": "周末", "pinyin": "zhōumò", "hv": "chu vi mạt", "meaning": "cuối tuần", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "打算", "pinyin": "dǎsuàn", "hv": "đả toán", "meaning": "kế hoạch, dự định", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "啊", "pinyin": "a", "hv": "a", "meaning": "trợ từ ngữ khí", "level": "HSK 3", "pos": "Trợ từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "跟", "pinyin": "gēn", "hv": "căn", "meaning": "cùng, với", "level": "HSK 3", "pos": "Giới từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "一直", "pinyin": "yìzhí", "hv": "nhất trực", "meaning": "suốt, liên tục", "level": "HSK 3", "pos": "Phó từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "游戏", "pinyin": "yóuxì", "hv": "du hí", "meaning": "trò chơi", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "作业", "pinyin": "zuòyè", "hv": "tác nghiệp", "meaning": "bài tập về nhà", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "着急", "pinyin": "zháojí", "hv": "trước cấp", "meaning": "lo lắng, sốt ruột", "level": "HSK 3", "pos": "Tính từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "复习", "pinyin": "fùxí", "hv": "phục tập", "meaning": "ôn tập", "level": "HSK 3", "pos": "Động từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "南方", "pinyin": "nánfāng", "hv": "nam phương", "meaning": "phía nam, miền nam", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "北方", "pinyin": "běifāng", "hv": "bắc phương", "meaning": "phía bắc, miền bắc", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "面包", "pinyin": "miànbāo", "hv": "miến bao", "meaning": "bánh mì", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "带", "pinyin": "dài", "hv": "đới", "meaning": "mang theo", "level": "HSK 3", "pos": "Động từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "地图", "pinyin": "dìtú", "hv": "địa đồ", "meaning": "bản đồ", "level": "HSK 3", "pos": "Danh từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "搬", "pinyin": "bān", "hv": "ban", "meaning": "dọn, dời, khiêng", "level": "HSK 3", "pos": "Động từ", "lesson": 1, "topic": ["周末你有什么打算？", "Zhōumò nǐ yǒu shénme dǎsuàn?", "Anh dự định làm gì vào cuối tuần vậy?"]},
      {"hanzi": "腿", "pinyin": "tuǐ", "hv": "thoái", "meaning": "chân (đùi, cẳng chân)", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "疼", "pinyin": "téng", "hv": "đông", "meaning": "đau, nhức", "level": "HSK 3", "pos": "Tính từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "脚", "pinyin": "jiǎo", "hv": "cước", "meaning": "bàn chân", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "树", "pinyin": "shù", "hv": "thụ", "meaning": "cây cối", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "容易", "pinyin": "róngyì", "hv": "dung dị", "meaning": "dễ dàng", "level": "HSK 3", "pos": "Tính từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "难", "pinyin": "nán", "hv": "nan", "meaning": "khó khăn", "level": "HSK 3", "pos": "Tính từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "太太", "pinyin": "tàitai", "hv": "thái thái", "meaning": "bà, vợ, phu nhân", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "秘书", "pinyin": "mìshū", "hv": "bí thư", "meaning": "thư ký", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "经理", "pinyin": "jīnglǐ", "hv": "kinh lý", "meaning": "giám đốc", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "办公室", "pinyin": "bàngōngshì", "hv": "biện công thất", "meaning": "văn phòng", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "辆", "pinyin": "liàng", "hv": "lượng", "meaning": "chiếc, xe (lượng từ)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "楼", "pinyin": "lóu", "hv": "lâu", "meaning": "tòa nhà, tầng, lầu", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "拿", "pinyin": "ná", "hv": "nã", "meaning": "cầm, lấy", "level": "HSK 3", "pos": "Động từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "把", "pinyin": "bǎ", "hv": "bả", "meaning": "cái, cây (lượng từ ô, dao)", "level": "HSK 3", "pos": "Giới từ/Lượng từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "伞", "pinyin": "sǎn", "hv": "tản", "meaning": "cây dù, ô", "level": "HSK 3", "pos": "Danh từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "胖", "pinyin": "pàng", "hv": "bàn", "meaning": "béo, mập", "level": "HSK 3", "pos": "Tính từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "其实", "pinyin": "qíshí", "hv": "kỳ thực", "meaning": "thực ra", "level": "HSK 3", "pos": "Phó từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "瘦", "pinyin": "shòu", "hv": "sấu", "meaning": "gầy, ốm", "level": "HSK 3", "pos": "Tính từ", "lesson": 2, "topic": ["他什么时候回来？", "Tā shénme shíhou huílái?", "Khi nào anh ấy quay về?"]},
      {"hanzi": "还是", "pinyin": "háishi", "hv": "hoàn thị", "meaning": "hay là (câu hỏi)", "level": "HSK 3", "pos": "Liên từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "爬山", "pinyin": "pá shān", "hv": "bà sơn", "meaning": "leo núi", "level": "HSK 3", "pos": "Động từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "小心", "pinyin": "xiǎoxīn", "hv": "tiểu tâm", "meaning": "cẩn thận", "level": "HSK 3", "pos": "Tính từ/Động từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "条", "pinyin": "tiáo", "hv": "điều", "meaning": "chiếc, sợi (quần, váy)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "裤子", "pinyin": "kùzi", "hv": "khố tử", "meaning": "quần", "level": "HSK 3", "pos": "Danh từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "记得", "pinyin": "jìde", "hv": "ký đắc", "meaning": "nhớ, còn nhớ", "level": "HSK 3", "pos": "Động từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "衬衫", "pinyin": "chènshān", "hv": "sấn sam", "meaning": "áo sơ mi", "level": "HSK 3", "pos": "Danh từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "元", "pinyin": "yuán", "hv": "nguyên", "meaning": "đồng (tiền tệ)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "新鲜", "pinyin": "xīnxiān", "hv": "tân tiên", "meaning": "tươi mới", "level": "HSK 3", "pos": "Tính từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "甜", "pinyin": "tián", "hv": "điềm", "meaning": "ngọt", "level": "HSK 3", "pos": "Tính từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "只", "pinyin": "zhǐ", "hv": "chỉ", "meaning": "chỉ", "level": "HSK 3", "pos": "Lượng từ/Phó từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "放", "pinyin": "fàng", "hv": "phóng", "meaning": "đặt, để", "level": "HSK 3", "pos": "Động từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "饮料", "pinyin": "yǐnliào", "hv": "ẩm liệu", "meaning": "thức uống", "level": "HSK 3", "pos": "Danh từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "或者", "pinyin": "huòzhě", "hv": "hoặc giả", "meaning": "hoặc là", "level": "HSK 3", "pos": "Liên từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "舒服", "pinyin": "shūfu", "hv": "thư phục", "meaning": "dễ chịu, thoải mái", "level": "HSK 3", "pos": "Tính từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "花", "pinyin": "huā", "hv": "hoa", "meaning": "hoa", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "绿", "pinyin": "lǜ", "hv": "lục", "meaning": "màu xanh lá", "level": "HSK 3", "pos": "Tính từ", "lesson": 3, "topic": ["桌子上放着很多饮料", "Zhuōzi shang fàng zhe hěn duō yǐnliào", "Trên bàn có rất nhiều thức uống"]},
      {"hanzi": "比赛", "pinyin": "bǐsài", "hv": "tỉ tái", "meaning": "cuộc thi, thi đấu", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "照片", "pinyin": "zhàopiàn", "hv": "chiếu phiến", "meaning": "bức ảnh", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "年级", "pinyin": "niánjí", "hv": "niên cấp", "meaning": "khối lớp, năm thứ", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "又", "pinyin": "yòu", "hv": "hựu", "meaning": "vừa... lại...", "level": "HSK 3", "pos": "Phó từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "聪明", "pinyin": "cōngming", "hv": "thông minh", "meaning": "thông minh", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "热情", "pinyin": "rèqíng", "hv": "nhiệt tình", "meaning": "nhiệt tình, niềm nở", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "努力", "pinyin": "nǔlì", "hv": "nỗ lực", "meaning": "chăm chỉ, cố gắng", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "总是", "pinyin": "zǒngshì", "hv": "tổng thị", "meaning": "luôn luôn", "level": "HSK 3", "pos": "Phó từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "回答", "pinyin": "huídá", "hv": "hồi đáp", "meaning": "trả lời", "level": "HSK 3", "pos": "Động từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "站", "pinyin": "zhàn", "hv": "trạm", "meaning": "đứng", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "饿", "pinyin": "è", "hv": "ngạ", "meaning": "đói bụng", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "超市", "pinyin": "chāoshì", "hv": "siêu thị", "meaning": "siêu thị", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "蛋糕", "pinyin": "dàngāo", "hv": "đản cao", "meaning": "bánh ngọt", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "年轻", "pinyin": "niánqīng", "hv": "niên khinh", "meaning": "trẻ trung", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "认真", "pinyin": "rènzhēn", "hv": "nhận chân", "meaning": "nghiêm túc, chăm chỉ", "level": "HSK 3", "pos": "Tính từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "客人", "pinyin": "kèrén", "hv": "khách nhân", "meaning": "khách hàng", "level": "HSK 3", "pos": "Danh từ", "lesson": 4, "topic": ["她总是笑着跟客人说话", "Tā zǒngshì xiàozhe gēn kèrén shuōhuà", "Cô ấy luôn cười khi nói chuyện với khách hàng"]},
      {"hanzi": "发烧", "pinyin": "fāshāo", "hv": "phát thiêu", "meaning": "phát sốt", "level": "HSK 3", "pos": "Động từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "为", "pinyin": "wèi", "hv": "vị", "meaning": "vì, để", "level": "HSK 3", "pos": "Giới từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "照顾", "pinyin": "zhàogù", "hv": "chiếu cố", "meaning": "chăm sóc", "level": "HSK 3", "pos": "Động từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "用", "pinyin": "yòng", "hv": "dụng", "meaning": "dùng, cần", "level": "HSK 3", "pos": "Động từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "感冒", "pinyin": "gǎnmào", "hv": "cảm mạo", "meaning": "cảm cúm", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "季节", "pinyin": "jìjié", "hv": "quý tiết", "meaning": "mùa trong năm", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "当然", "pinyin": "dāngrán", "hv": "đương nhiên", "meaning": "đương nhiên, tất nhiên", "level": "HSK 3", "pos": "Phó từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "春天", "pinyin": "chūntiān", "hv": "xuân thiên", "meaning": "mùa xuân", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "草", "pinyin": "cǎo", "hv": "thảo", "meaning": "cỏ", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "夏天", "pinyin": "xiàtiān", "hv": "hạ thiên", "meaning": "mùa hè", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "裙子", "pinyin": "qúnzi", "hv": "quần tử", "meaning": "váy, đầm", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "最近", "pinyin": "zuìjìn", "hv": "tối cận", "meaning": "dạo này, gần đây", "level": "HSK 3", "pos": "Danh từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "越", "pinyin": "yuè", "hv": "việt", "meaning": "càng, vượt qua", "level": "HSK 3", "pos": "Phó từ", "lesson": 5, "topic": ["我最近越来越胖了", "Wǒ zuìjìn yuèláiyuè pàng le", "Dạo này em ngày càng béo ra"]},
      {"hanzi": "眼镜", "pinyin": "yǎnjìng", "hv": "nhãn kính", "meaning": "kính mắt", "level": "HSK 3", "pos": "Danh từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "突然", "pinyin": "tūrán", "hv": "đột nhiên", "meaning": "bất ngờ, đột ngột", "level": "HSK 3", "pos": "Tính từ/Phó từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "离开", "pinyin": "líkāi", "hv": "ly khai", "meaning": "rời khỏi, chia tay", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "清楚", "pinyin": "qīngchu", "hv": "thanh sở", "meaning": "rõ ràng", "level": "HSK 3", "pos": "Tính từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "刚才", "pinyin": "gāngcái", "hv": "cương tài", "meaning": "vừa nãy, lúc nãy", "level": "HSK 3", "pos": "Danh từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "帮忙", "pinyin": "bāngmáng", "hv": "bang mang", "meaning": "giúp đỡ", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "特别", "pinyin": "tèbié", "hv": "đặc biệt", "meaning": "đặc biệt, rất", "level": "HSK 3", "pos": "Phó từ/Tính từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "讲", "pinyin": "jiǎng", "hv": "giảng", "meaning": "giảng, nói, kể", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "明白", "pinyin": "míngbai", "hv": "minh bạch", "meaning": "hiểu rõ, sáng tỏ", "level": "HSK 3", "pos": "Tính từ/Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "锻炼", "pinyin": "duànliàn", "hv": "đoán luyện", "meaning": "tập thể dục, rèn luyện", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "音乐", "pinyin": "yīnyuè", "hv": "âm nhạc", "meaning": "âm nhạc", "level": "HSK 3", "pos": "Danh từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "公园", "pinyin": "gōngyuán", "hv": "công viên", "meaning": "công viên", "level": "HSK 3", "pos": "Danh từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "聊天儿", "pinyin": "liáotiānr", "hv": "liêu thiên nhi", "meaning": "trò chuyện, tán gẫu", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "睡着", "pinyin": "shuìzháo", "hv": "thụy trứ", "meaning": "ngủ say, chợp mắt", "level": "HSK 3", "pos": "Động từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "更", "pinyin": "gèng", "hv": "canh", "meaning": "càng, hơn nữa", "level": "HSK 3", "pos": "Phó từ", "lesson": 6, "topic": ["怎么突然找不到了？", "Zěnme tūrán zhǎobudào le?", "Sao bỗng dưng lại không tìm thấy?"]},
      {"hanzi": "同事", "pinyin": "tóngshì", "hv": "đồng sự", "meaning": "đồng nghiệp", "level": "HSK 3", "pos": "Danh từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "以前", "pinyin": "yǐqián", "hv": "dĩ tiền", "meaning": "trước đây, trước kia", "level": "HSK 3", "pos": "Danh từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "银行", "pinyin": "yínháng", "hv": "ngân hàng", "meaning": "ngân hàng", "level": "HSK 3", "pos": "Danh từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "久", "pinyin": "jiǔ", "hv": "cửu", "meaning": "lâu, dài", "level": "HSK 3", "pos": "Tính từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "感兴趣", "pinyin": "gǎn xìngqù", "hv": "cảm hứng thú", "meaning": "có hứng thú, thích", "level": "HSK 3", "pos": "Cụm động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "结婚", "pinyin": "jiéhūn", "hv": "kết hôn", "meaning": "kết hôn, lấy vợ/chồng", "level": "HSK 3", "pos": "Động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "欢迎", "pinyin": "huānyíng", "hv": "hoan nghênh", "meaning": "chào mừng, hoan nghênh", "level": "HSK 3", "pos": "Động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "迟到", "pinyin": "chídào", "hv": "trì đáo", "meaning": "đến muộn, trễ giờ", "level": "HSK 3", "pos": "Động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "半", "pinyin": "bàn", "hv": "bán", "meaning": "nửa, rưỡi", "level": "HSK 3", "pos": "Số từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "接", "pinyin": "jiē", "hv": "tiếp", "meaning": "đón, nhận", "level": "HSK 3", "pos": "Động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "刻", "pinyin": "kè", "hv": "khắc", "meaning": "khắc (15 phút)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "差", "pinyin": "chà", "hv": "sai", "meaning": "kém, thiếu", "level": "HSK 3", "pos": "Tính từ/Động từ", "lesson": 7, "topic": ["我跟她都认识五年了", "Wǒ gēn tā dōu rènshi wǔ nián le", "Tôi và cô ấy quen nhau được năm năm rồi"]},
      {"hanzi": "满意", "pinyin": "mǎnyì", "hv": "mãn ý", "meaning": "hài lòng, vừa ý", "level": "HSK 3", "pos": "Tính từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "电梯", "pinyin": "diàntī", "hv": "điện thang", "meaning": "thang máy", "level": "HSK 3", "pos": "Danh từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "层", "pinyin": "céng", "hv": "tằng", "meaning": "tầng (nhà lầu)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "害怕", "pinyin": "hàipà", "hv": "hại phạ", "meaning": "sợ hãi", "level": "HSK 3", "pos": "Động từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "熊猫", "pinyin": "xióngmāo", "hv": "hùng miêu", "meaning": "gấu trúc", "level": "HSK 3", "pos": "Danh từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "见面", "pinyin": "jiànmiàn", "hv": "kiến diện", "meaning": "gặp mặt", "level": "HSK 3", "pos": "Động từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "安静", "pinyin": "ānjìng", "hv": "an tĩnh", "meaning": "yên tĩnh, thanh tịnh", "level": "HSK 3", "pos": "Tính từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "可乐", "pinyin": "kělè", "hv": "khả nhạc", "meaning": "coca cola", "level": "HSK 3", "pos": "Danh từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "一会儿", "pinyin": "yíhuìr", "hv": "nhất hội nhi", "meaning": "một lát, một chốc", "level": "HSK 3", "pos": "Số lượng từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "马上", "pinyin": "mǎshàng", "hv": "mã thượng", "meaning": "ngay lập tức", "level": "HSK 3", "pos": "Phó từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "洗手间", "pinyin": "xǐshǒujiān", "hv": "tẩy thủ gian", "meaning": "nhà vệ sinh", "level": "HSK 3", "pos": "Danh từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "老", "pinyin": "lǎo", "hv": "lão", "meaning": "già, cũ", "level": "HSK 3", "pos": "Tính từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "几乎", "pinyin": "jīhū", "hv": "kỷ hồ", "meaning": "hầu như, suýt nữa", "level": "HSK 3", "pos": "Phó từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "变化", "pinyin": "biànhuà", "hv": "biến hóa", "meaning": "thay đổi", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "健康", "pinyin": "jiànkāng", "hv": "kiện khang", "meaning": "sức khỏe, mạnh khỏe", "level": "HSK 3", "pos": "Tính từ/Danh từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "重要", "pinyin": "zhòngyào", "hv": "trọng yếu", "meaning": "quan trọng", "level": "HSK 3", "pos": "Tính từ", "lesson": 8, "topic": ["你去哪儿我就去哪儿", "Nǐ qù nǎr wǒ jiù qù nǎr", "Em đi đâu thì anh đi đến đó"]},
      {"hanzi": "中文", "pinyin": "Zhōngwén", "hv": "trung văn", "meaning": "tiếng Trung", "level": "HSK 3", "pos": "Danh từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "班", "pinyin": "bān", "hv": "ban", "meaning": "lớp học", "level": "HSK 3", "pos": "Danh từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "一样", "pinyin": "yíyàng", "hv": "nhất dạng", "meaning": "giống nhau", "level": "HSK 3", "pos": "Tính từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "最后", "pinyin": "zuìhòu", "hv": "tối hậu", "meaning": "cuối cùng", "level": "HSK 3", "pos": "Danh từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "放心", "pinyin": "fàngxīn", "hv": "phóng tâm", "meaning": "yên tâm", "level": "HSK 3", "pos": "Động từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "一定", "pinyin": "yídìng", "hv": "nhất định", "meaning": "nhất định", "level": "HSK 3", "pos": "Phó từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "担心", "pinyin": "dānxīn", "hv": "đam tâm", "meaning": "lo lắng", "level": "HSK 3", "pos": "Động từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "比较", "pinyin": "bǐjiào", "hv": "tỉ giác", "meaning": "tương đối, so sánh", "level": "HSK 3", "pos": "Phó từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "了解", "pinyin": "liǎojiě", "hv": "liễu giải", "meaning": "hiểu rõ, thấu hiểu", "level": "HSK 3", "pos": "Động từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "先", "pinyin": "xiān", "hv": "tiên", "meaning": "trước tiên", "level": "HSK 3", "pos": "Phó từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "中间", "pinyin": "zhōngjiān", "hv": "trung gian", "meaning": "ở giữa", "level": "HSK 3", "pos": "Danh từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "参加", "pinyin": "cānjiā", "hv": "tham gia", "meaning": "tham dự", "level": "HSK 3", "pos": "Động từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "影响", "pinyin": "yǐngxiǎng", "hv": "ảnh hưởng", "meaning": "ảnh hưởng", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 9, "topic": ["她的汉语说得跟中国人一样好", "Tā de Hànyǔ shuō de gēn Zhōngguórén yíyàng hǎo", "Cô ấy nói tiếng Trung Quốc hay như người Trung Quốc vậy"]},
      {"hanzi": "个子", "pinyin": "gèzi", "hv": "cá tử", "meaning": "vóc dáng, chiều cao", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "矮", "pinyin": "ǎi", "hv": "oải", "meaning": "thấp, lùn", "level": "HSK 3", "pos": "Tính từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "历史", "pinyin": "lìshǐ", "hv": "lịch sử", "meaning": "môn lịch sử", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "体育", "pinyin": "tǐyù", "hv": "thể dục", "meaning": "thể dục thể thao", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "数学", "pinyin": "shùxué", "hv": "số học", "meaning": "môn toán học", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "方便", "pinyin": "fāngbiàn", "hv": "phương tiện", "meaning": "tiện lợi", "level": "HSK 3", "pos": "Tính từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "自行车", "pinyin": "zìxíngchē", "hv": "tự hành xa", "meaning": "xe đạp", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "骑", "pinyin": "qí", "hv": "kỵ", "meaning": "cưỡi, đạp (xe)", "level": "HSK 3", "pos": "Động từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "旧", "pinyin": "jiù", "hv": "cựu", "meaning": "cũ, qua sử dụng", "level": "HSK 3", "pos": "Tính từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "换", "pinyin": "huàn", "hv": "hoán", "meaning": "đổi, thay thế", "level": "HSK 3", "pos": "Động từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "地方", "pinyin": "dìfang", "hv": "địa phương", "meaning": "nơi chốn, địa điểm", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "中介", "pinyin": "zhōngjiè", "hv": "trung giới", "meaning": "môi giới, trung gian", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "主要", "pinyin": "zhǔyào", "hv": "chủ yếu", "meaning": "chủ yếu, căn bản", "level": "HSK 3", "pos": "Tính từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "环境", "pinyin": "huánjìng", "hv": "hoàn cảnh", "meaning": "môi trường xung quanh", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "附近", "pinyin": "fùjìn", "hv": "phụ cận", "meaning": "lân cận, gần đây", "level": "HSK 3", "pos": "Danh từ", "lesson": 10, "topic": ["数学比历史难多了", "Shùxué bǐ lìshǐ nán duō le", "Môn Toán khó hơn môn Lịch Sử nhiều"]},
      {"hanzi": "图书馆", "pinyin": "túshūguǎn", "hv": "đồ thư quán", "meaning": "thư viện", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "借", "pinyin": "jiè", "hv": "tá", "meaning": "mượn", "level": "HSK 3", "pos": "Động từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "词典", "pinyin": "cídiǎn", "hv": "từ điển", "meaning": "từ điển", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "还", "pinyin": "huán", "hv": "hoàn", "meaning": "trả lại", "level": "HSK 3", "pos": "Từ vựng", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "灯", "pinyin": "dēng", "hv": "đăng", "meaning": "đèn chiếu sáng", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "会议", "pinyin": "huìyì", "hv": "hội nghị", "meaning": "cuộc họp", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "结束", "pinyin": "jiéshù", "hv": "kết thúc", "meaning": "hoàn thành, kết thúc", "level": "HSK 3", "pos": "Động từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "忘记", "pinyin": "wàngjì", "hv": "vong ký", "meaning": "quên lãng", "level": "HSK 3", "pos": "Động từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "空调", "pinyin": "kōngtiáo", "hv": "không điều", "meaning": "máy điều hòa nhiệt độ", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "关", "pinyin": "guān", "hv": "quan", "meaning": "đóng, tắt", "level": "HSK 3", "pos": "Động từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "地铁", "pinyin": "dìtiě", "hv": "địa thiết", "meaning": "tàu điện ngầm", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "双", "pinyin": "shuāng", "hv": "song", "meaning": "đôi, cặp (lượng từ)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "筷子", "pinyin": "kuàizi", "hv": "khoái tử", "meaning": "đôi đũa", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "啤酒", "pinyin": "píjiǔ", "hv": "tì tửu", "meaning": "bia", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "口", "pinyin": "kǒu", "hv": "khẩu", "meaning": "ngụm, miệng", "level": "HSK 3", "pos": "Lượng từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "瓶子", "pinyin": "píngzi", "hv": "bình tử", "meaning": "chai, lọ", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "笔记本电脑", "pinyin": "bǐjìběn diànnǎo", "hv": "bút ký bản", "meaning": "máy tính xách tay", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "电子邮件", "pinyin": "diànzǐ yóujiàn", "hv": "điện tử bưu kiện", "meaning": "thư điện tử, email", "level": "HSK 3", "pos": "Danh từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "习惯", "pinyin": "xíguàn", "hv": "tập quán", "meaning": "thói quen, tập quán", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 11, "topic": ["别忘了把空调关了", "Bié wàng le bǎ kōngtiáo guān le", "Đừng quên tắt máy điều hòa không khí nhé"]},
      {"hanzi": "太阳", "pinyin": "tàiyáng", "hv": "thái dương", "meaning": "mặt trời", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "西", "pinyin": "xī", "hv": "tây", "meaning": "phía tây", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "生气", "pinyin": "shēngqì", "hv": "sinh khí", "meaning": "tức giận", "level": "HSK 3", "pos": "Tính từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "行李箱", "pinyin": "xínglixiāng", "hv": "hành lý tương", "meaning": "vali hành lý", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "自己", "pinyin": "zìjǐ", "hv": "tự kỷ", "meaning": "bản thân mình", "level": "HSK 3", "pos": "Đại từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "包", "pinyin": "bāo", "hv": "bao", "meaning": "túi xách, bao bì", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "发现", "pinyin": "fāxiàn", "hv": "phát hiện", "meaning": "phát hiện, nhận ra", "level": "HSK 3", "pos": "Động từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "护照", "pinyin": "hùzhào", "hv": "hộ chiếu", "meaning": "hộ chiếu", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "起飞", "pinyin": "qǐfēi", "hv": "khởi phi", "meaning": "cất cánh (máy bay)", "level": "HSK 3", "pos": "Động từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "司机", "pinyin": "sījī", "hv": "ti cơ", "meaning": "tài xế, bác tài", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "教", "pinyin": "jiāo", "hv": "giáo", "meaning": "dạy học", "level": "HSK 3", "pos": "Động từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "画", "pinyin": "huà", "hv": "họa", "meaning": "vẽ tranh, bức tranh", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "需要", "pinyin": "xūyào", "hv": "nhu yếu", "meaning": "cần, nhu cầu", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "黑板", "pinyin": "hēibǎn", "hv": "hắc bản", "meaning": "bảng đen", "level": "HSK 3", "pos": "Danh từ", "lesson": 12, "topic": ["把重要的东西放在我这儿吧", "Bǎ zhòngyào de dōngxi fàng zài wǒ zhèr ba", "Hãy để những đồ quan trọng ở chỗ tôi đi"]},
      {"hanzi": "终于", "pinyin": "zhōngyú", "hv": "chung vu", "meaning": "cuối cùng, rốt cuộc", "level": "HSK 3", "pos": "Phó từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "爷爷", "pinyin": "yéye", "hv": "gia gia", "meaning": "ông nội", "level": "HSK 3", "pos": "Danh từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "礼物", "pinyin": "lǐwù", "hv": "lễ vật", "meaning": "quà tặng", "level": "HSK 3", "pos": "Danh từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "奶奶", "pinyin": "nǎinai", "hv": "nãi nãi", "meaning": "bà nội", "level": "HSK 3", "pos": "Danh từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "遇到", "pinyin": "yùdào", "hv": "ngộ đáo", "meaning": "gặp phải, bắt gặp", "level": "HSK 3", "pos": "Động từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "一边", "pinyin": "yìbiān", "hv": "nhất biên", "meaning": "vừa... vừa...", "level": "HSK 3", "pos": "Phó từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "过去", "pinyin": "guòqù", "hv": "quá khứ", "meaning": "đi qua, quá khứ", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "一般", "pinyin": "yìbān", "hv": "nhất ban", "meaning": "bình thường, phổ biến", "level": "HSK 3", "pos": "Tính từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "愿意", "pinyin": "yuànyì", "hv": "nguyện ý", "meaning": "bằng lòng, sẵn sàng", "level": "HSK 3", "pos": "Động từ năng nguyện", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "起来", "pinyin": "qǐlai", "hv": "khởi lai", "meaning": "đứng dậy, trỗi dậy", "level": "HSK 3", "pos": "Động từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "应该", "pinyin": "yīnggāi", "hv": "ưng cai", "meaning": "nên, phải", "level": "HSK 3", "pos": "Động từ năng nguyện", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "生活", "pinyin": "shēnghuó", "hv": "sinh hoạt", "meaning": "cuộc sống", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "校长", "pinyin": "xiàozhǎng", "hv": "hiệu trưởng", "meaning": "hiệu trưởng", "level": "HSK 3", "pos": "Danh từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "坏", "pinyin": "huài", "hv": "hoại", "meaning": "hỏng, hư, xấu", "level": "HSK 3", "pos": "Tính từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "经常", "pinyin": "jīngcháng", "hv": "kinh thường", "meaning": "thường xuyên", "level": "HSK 3", "pos": "Phó từ", "lesson": 13, "topic": ["我是走回来的", "Wǒ shì zǒuhuílai de", "Anh đi bộ về"]},
      {"hanzi": "打扫", "pinyin": "dǎsǎo", "hv": "đả tảo", "meaning": "quét dọn, dọn vệ sinh", "level": "HSK 3", "pos": "Động từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "干净", "pinyin": "gānjìng", "hv": "can tịnh", "meaning": "sạch sẽ", "level": "HSK 3", "pos": "Tính từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "然后", "pinyin": "ránhòu", "hv": "nhiên hậu", "meaning": "sau đó", "level": "HSK 3", "pos": "Liên từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "冰箱", "pinyin": "bīngxiāng", "hv": "băng tương", "meaning": "tủ lạnh", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "洗澡", "pinyin": "xǐzǎo", "hv": "tẩy táo", "meaning": "tắm rửa", "level": "HSK 3", "pos": "Động từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "节目", "pinyin": "jiémù", "hv": "tiết mục", "meaning": "chương trình giải trí", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "月亮", "pinyin": "yuèliang", "hv": "nguyệt lượng", "meaning": "mặt trăng", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "像", "pinyin": "xiàng", "hv": "tượng", "meaning": "giống như", "level": "HSK 3", "pos": "Động từ/Giới từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "盘子", "pinyin": "pánzi", "hv": "bàn tử", "meaning": "cái đĩa", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "刮风", "pinyin": "guāfēng", "hv": "quát phong", "meaning": "gió thổi, nổi gió", "level": "HSK 3", "pos": "Động từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "叔叔", "pinyin": "shūshu", "hv": "thúc thúc", "meaning": "chú, bác trai", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "阿姨", "pinyin": "āyí", "hv": "a di", "meaning": "dì, cô", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "故事", "pinyin": "gùshi", "hv": "cố sự", "meaning": "câu chuyện", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "声音", "pinyin": "shēngyīn", "hv": "thanh âm", "meaning": "âm thanh, tiếng động", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "菜单", "pinyin": "càidān", "hv": "thái đơn", "meaning": "thực đơn", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "简单", "pinyin": "jiǎndān", "hv": "giản đơn", "meaning": "đơn giản", "level": "HSK 3", "pos": "Tính từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "香蕉", "pinyin": "xiāngjiāo", "hv": "hương tiêu", "meaning": "quả chuối", "level": "HSK 3", "pos": "Danh từ", "lesson": 14, "topic": ["你把水果拿过来", "Nǐ bǎ shuǐguǒ ná guòlái", "Cậu hãy mang trái cây đến đây"]},
      {"hanzi": "留学", "pinyin": "liúxué", "hv": "lưu học", "meaning": "du học", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "水平", "pinyin": "shuǐpíng", "hv": "thủy bình", "meaning": "trình độ", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "提高", "pinyin": "tígāo", "hv": "đề cao", "meaning": "nâng cao, cải thiện", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "练习", "pinyin": "liànxí", "hv": "luyện tập", "meaning": "luyện tập, bài tập", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "完成", "pinyin": "wánchéng", "hv": "hoàn thành", "meaning": "hoàn thành", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "句子", "pinyin": "jùzi", "hv": "cú tử", "meaning": "câu văn", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "其他", "pinyin": "qítā", "hv": "kỳ tha", "meaning": "cái khác, khác", "level": "HSK 3", "pos": "Đại từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "发", "pinyin": "fā", "hv": "phát", "meaning": "gửi, phát", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "要求", "pinyin": "yāoqiú", "hv": "yêu cầu", "meaning": "yêu cầu", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "注意", "pinyin": "zhùyì", "hv": "chú ý", "meaning": "chú ý, để ý", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "上网", "pinyin": "shàngwǎng", "hv": "thượng võng", "meaning": "lên mạng internet", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "除了", "pinyin": "chúle", "hv": "trừ liễu", "meaning": "ngoài ra, ngoại trừ", "level": "HSK 3", "pos": "Giới từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "新闻", "pinyin": "xīnwén", "hv": "tân văn", "meaning": "tin tức thời sự", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "极了", "pinyin": "jí le", "hv": "cực liễu", "meaning": "cực kỳ, hết sức", "level": "HSK 3", "pos": "Phó từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "节日", "pinyin": "jiérì", "hv": "tiết nhật", "meaning": "ngày lễ, lễ hội", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "举行", "pinyin": "jǔxíng", "hv": "cử hành", "meaning": "tổ chức", "level": "HSK 3", "pos": "Động từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "世界", "pinyin": "shìjiè", "hv": "thế giới", "meaning": "thế giới", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "街道", "pinyin": "jiēdào", "hv": "nhai đạo", "meaning": "đường phố", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "文化", "pinyin": "wénhuà", "hv": "văn hóa", "meaning": "văn hóa", "level": "HSK 3", "pos": "Danh từ", "lesson": 15, "topic": ["其他都没什么问题", "Qítā dōu méi shénme wèntí", "Những câu khác đều không có vấn đề gì"]},
      {"hanzi": "城市", "pinyin": "chéngshì", "hv": "thành thị", "meaning": "thành phố", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "如果", "pinyin": "rúguǒ", "hv": "như quả", "meaning": "nếu như", "level": "HSK 3", "pos": "Liên từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "认为", "pinyin": "rènwéi", "hv": "nhận vi", "meaning": "cho rằng, nghĩ rằng", "level": "HSK 3", "pos": "Động từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "皮鞋", "pinyin": "píxié", "hv": "bì hài", "meaning": "giày da", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "帽子", "pinyin": "màozi", "hv": "mạo tử", "meaning": "mũ, nón", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "长", "pinyin": "cháng", "hv": "trường", "meaning": "dài", "level": "HSK 3", "pos": "Từ vựng", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "可爱", "pinyin": "kě'ài", "hv": "khả ái", "meaning": "đáng yêu", "level": "HSK 3", "pos": "Tính từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "米", "pinyin": "mǐ", "hv": "mễ", "meaning": "mét (đơn vị đo)", "level": "HSK 3", "pos": "Từ vựng", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "公斤", "pinyin": "gōngjīn", "hv": "công cân", "meaning": "ki-lô-gam (kg)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "鼻子", "pinyin": "bízi", "hv": "tị tử", "meaning": "mũi", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "头发", "pinyin": "tóufa", "hv": "đầu phát", "meaning": "tóc", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "检查", "pinyin": "jiǎnchá", "hv": "kiểm tra", "meaning": "kiểm tra, khám", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "刷牙", "pinyin": "shuāyá", "hv": "xoát nha", "meaning": "đánh răng", "level": "HSK 3", "pos": "Động từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "关系", "pinyin": "guānxì", "hv": "quan hệ", "meaning": "quan hệ, mối liên hệ", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "别人", "pinyin": "biérén", "hv": "biệt nhân", "meaning": "người khác", "level": "HSK 3", "pos": "Đại từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "词语", "pinyin": "cíyǔ", "hv": "từ ngữ", "meaning": "từ ngữ", "level": "HSK 3", "pos": "Danh từ", "lesson": 16, "topic": ["我现在累得下了班就想睡觉", "Wǒ xiànzài lèi de xià le bān jiù xiǎng shuìjiào", "Bây giờ tôi mệt đến nỗi chỉ muốn đi ngủ sau khi hết giờ làm việc"]},
      {"hanzi": "请假", "pinyin": "qǐng jià", "hv": "thỉnh giả", "meaning": "xin nghỉ phép", "level": "HSK 3", "pos": "Động từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "一共", "pinyin": "yígòng", "hv": "nhất cộng", "meaning": "tổng cộng", "level": "HSK 3", "pos": "Phó từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "邻居", "pinyin": "línjū", "hv": "lân cư", "meaning": "hàng xóm", "level": "HSK 3", "pos": "Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "后来", "pinyin": "hòulái", "hv": "hậu lai", "meaning": "về sau, sau này", "level": "HSK 3", "pos": "Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "爱好", "pinyin": "àihào", "hv": "ái hảo", "meaning": "sở thích", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "办法", "pinyin": "bànfǎ", "hv": "biện pháp", "meaning": "cách thức, biện pháp", "level": "HSK 3", "pos": "Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "饱", "pinyin": "bǎo", "hv": "bão", "meaning": "no bụng", "level": "HSK 3", "pos": "Tính từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "为了", "pinyin": "wèile", "hv": "vị liễu", "meaning": "vì, để (mục đích)", "level": "HSK 3", "pos": "Giới từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "决定", "pinyin": "juédìng", "hv": "quyết định", "meaning": "quyết định", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "选择", "pinyin": "xuǎnzé", "hv": "tuyển trạch", "meaning": "lựa chọn", "level": "HSK 3", "pos": "Động từ/Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "冬天", "pinyin": "dōngtiān", "hv": "đông thiên", "meaning": "mùa đông", "level": "HSK 3", "pos": "Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "必须", "pinyin": "bìxū", "hv": "tất tu", "meaning": "phải, nhất thiết phải", "level": "HSK 3", "pos": "Phó từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "根据", "pinyin": "gēnjù", "hv": "căn cứ", "meaning": "căn cứ vào, theo", "level": "HSK 3", "pos": "Giới từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "情况", "pinyin": "qíngkuàng", "hv": "tình huống", "meaning": "tình hình", "level": "HSK 3", "pos": "Danh từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "渴", "pinyin": "kě", "hv": "khát", "meaning": "khát nước", "level": "HSK 3", "pos": "Tính từ", "lesson": 17, "topic": ["谁都有办法看好你的“病”", "Shéi dōu yǒu bànfǎ kànhǎo nǐ de \"bìng\"", "Ai cũng có cách chữa khỏi \"bệnh\" của em"]},
      {"hanzi": "向", "pinyin": "xiàng", "hv": "hướng", "meaning": "hướng về, quay về", "level": "HSK 3", "pos": "Giới từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "万", "pinyin": "wàn", "hv": "vạn", "meaning": "vạn (10.000)", "level": "HSK 3", "pos": "Số từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "嘴", "pinyin": "zuǐ", "hv": "chủy", "meaning": "miệng", "level": "HSK 3", "pos": "Danh từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "动物", "pinyin": "dòngwù", "hv": "động vật", "meaning": "động vật", "level": "HSK 3", "pos": "Danh từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "段", "pinyin": "duàn", "hv": "đoạn", "meaning": "đoạn, phần", "level": "HSK 3", "pos": "Lượng từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "不但而且", "pinyin": "búdàn... érqiě...", "hv": "bất đán nhi thả", "meaning": "không những... mà còn...", "level": "HSK 3", "pos": "Liên từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "有名", "pinyin": "yǒumíng", "hv": "hữu danh", "meaning": "nổi tiếng", "level": "HSK 3", "pos": "Tính từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "同意", "pinyin": "tóngyì", "hv": "đồng ý", "meaning": "đồng ý, chấp thuận", "level": "HSK 3", "pos": "Động từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "相信", "pinyin": "xiāngxìn", "hv": "tương tín", "meaning": "tin tưởng", "level": "HSK 3", "pos": "Động từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "关于", "pinyin": "guānyú", "hv": "quan vu", "meaning": "về, liên quan đến", "level": "HSK 3", "pos": "Giới từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "机会", "pinyin": "jīhuì", "hv": "cơ hội", "meaning": "cơ hội, thời cơ", "level": "HSK 3", "pos": "Danh từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "国家", "pinyin": "guójiā", "hv": "quốc gia", "meaning": "đất nước, quốc gia", "level": "HSK 3", "pos": "Danh từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "种", "pinyin": "zhǒng", "hv": "chủng", "meaning": "loại, loài", "level": "HSK 3", "pos": "Lượng từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "特点", "pinyin": "tèdiǎn", "hv": "đặc điểm", "meaning": "đặc điểm nổi bật", "level": "HSK 3", "pos": "Danh từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "奇怪", "pinyin": "qíguài", "hv": "kỳ quái", "meaning": "kỳ lạ, kỳ quặc", "level": "HSK 3", "pos": "Tính từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "地", "pinyin": "de", "hv": "địa", "meaning": "trợ từ kết cấu trạng ngữ", "level": "HSK 3", "pos": "Trợ từ", "lesson": 18, "topic": ["我相信他们会同意的", "Wǒ xiāngxìn tāmen huì tóngyì de", "Tôi tin họ sẽ đồng ý"]},
      {"hanzi": "耳朵", "pinyin": "ěrduo", "hv": "nhĩ đóa", "meaning": "tai", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "脸", "pinyin": "liǎn", "hv": "liểm", "meaning": "khuôn mặt", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "短", "pinyin": "duǎn", "hv": "đoản", "meaning": "ngắn", "level": "HSK 3", "pos": "Tính từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "马", "pinyin": "mǎ", "hv": "mã", "meaning": "con ngựa", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "张", "pinyin": "zhāng", "hv": "trương", "meaning": "tờ, bức (lượng từ tranh ảnh)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "位", "pinyin": "wèi", "hv": "vị", "meaning": "vị, ngài (kính ngữ)", "level": "HSK 3", "pos": "Lượng từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "蓝", "pinyin": "lán", "hv": "lam", "meaning": "màu xanh da trời", "level": "HSK 3", "pos": "Tính từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "秋天", "pinyin": "qiūtiān", "hv": "thu thiên", "meaning": "mùa thu", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "过", "pinyin": "guò", "hv": "quá", "meaning": "đón (sinh nhật, lễ), qua", "level": "HSK 3", "pos": "Từ vựng", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "鸟", "pinyin": "niǎo", "hv": "điểu", "meaning": "con chim", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "黄河", "pinyin": "Huáng Hé", "hv": "hoàng hà", "meaning": "sông Hoàng Hà", "level": "HSK 3", "pos": "Danh từ riêng", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "船", "pinyin": "chuán", "hv": "thuyền", "meaning": "thuyền, tàu", "level": "HSK 3", "pos": "Danh từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "经过", "pinyin": "jīngguò", "hv": "kinh quá", "meaning": "đi qua, trải qua", "level": "HSK 3", "pos": "Động từ/Giới từ", "lesson": 19, "topic": ["你没看出来吗？", "Nǐ méi kàn chūlai ma?", "Anh không nhìn ra được à?"]},
      {"hanzi": "照相机", "pinyin": "zhàoxiàngjī", "hv": "chiếu tượng cơ", "meaning": "máy ảnh", "level": "HSK 3", "pos": "Danh từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "被", "pinyin": "bèi", "hv": "bị", "meaning": "bị, được (câu bị động)", "level": "HSK 3", "pos": "Giới từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "难过", "pinyin": "nánguò", "hv": "nan quá", "meaning": "buồn bã, đau lòng", "level": "HSK 3", "pos": "Tính từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "东", "pinyin": "dōng", "hv": "đông", "meaning": "phía đông", "level": "HSK 3", "pos": "Danh từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "信用卡", "pinyin": "xìnyòngkǎ", "hv": "tín dụng tạp", "meaning": "thẻ tín dụng", "level": "HSK 3", "pos": "Danh từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "关心", "pinyin": "guānxīn", "hv": "quan tâm", "meaning": "quan tâm, chăm lo", "level": "HSK 3", "pos": "Động từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "只有才", "pinyin": "zhǐyǒu... cái...", "hv": "chỉ hữu tài", "meaning": "chỉ khi... mới...", "level": "HSK 3", "pos": "Liên từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "成绩", "pinyin": "chéngjì", "hv": "thành tích", "meaning": "thành tích, kết quả điểm", "level": "HSK 3", "pos": "Danh từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "碗", "pinyin": "wǎn", "hv": "oản", "meaning": "bát, chén", "level": "HSK 3", "pos": "Danh từ/Lượng từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "分", "pinyin": "fēn", "hv": "phân", "meaning": "điểm số, phút", "level": "HSK 3", "pos": "Danh từ/Động từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "解决", "pinyin": "jiějué", "hv": "giải quyết", "meaning": "giải quyết vấn đề", "level": "HSK 3", "pos": "Động từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "试", "pinyin": "shì", "hv": "thí", "meaning": "thử làm, thử nghiệm", "level": "HSK 3", "pos": "Động từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "真正", "pinyin": "zhēnzhèng", "hv": "chân chính", "meaning": "thực sự, chân chính", "level": "HSK 3", "pos": "Tính từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]},
      {"hanzi": "多么", "pinyin": "duōme", "hv": "đa ma", "meaning": "biết bao, chừng nào", "level": "HSK 3", "pos": "Phó từ", "lesson": 20, "topic": ["我被他影响了", "Wǒ bèi tā yǐngxiǎng le", "Mình chịu ảnh hưởng từ anh ấy"]}
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
    let selectedLevel = 'all';
  let displayLimit = 24;

  function renderDictionaryView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const db = buildDictionaryDatabase();
    const countTotal = db.length;
    const countHsk1 = db.filter(w => w.level === 'HSK 1').length;
    const countHsk2 = db.filter(w => w.level === 'HSK 2').length;
    const countHsk3 = db.filter(w => w.level === 'HSK 3').length;

    container.innerHTML = `
      <div style="max-width: 960px; margin: 0 auto; padding: 20px 16px;">
        <!-- Thanh chuyển đổi 2 Tab lớn -->
        <div class="dict-tab-nav">
          <button type="button" class="dict-tab-btn ${currentTab === 'search' ? 'active' : ''}" id="tabBtnSearch">
            📖 Tra cứu Từ vựng & Giọng nói (${countTotal} từ)
          </button>
          <button type="button" class="dict-tab-btn ${currentTab === 'analyzer' ? 'active' : ''}" id="tabBtnAnalyzer">
            🤖 Phân tích Cấu trúc Câu & Dịch nghĩa
          </button>
        </div>

        <!-- ================= TAB 1: TRA CỨU TỪ ĐIỂN & GIỌNG NÓI ================= -->
        <div id="dictSearchSection" style="${currentTab === 'search' ? '' : 'display:none;'}">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="font-size:12px; font-weight:800; color:#6657d9; letter-spacing:0.08em; text-transform:uppercase;">TỔNG KHO TỪ VỰNG CHUẨN GIÁO TRÌNH HSK 1, 2, 3</span>
            <h2 style="font-size:26px; color:#1a1e36; margin:6px 0;">📖 Từ điển Hán ngữ Thông minh</h2>
            <p style="color:#64748b; font-size:15px; margin:4px 0 16px;">Tra cứu <b>${countTotal} từ vựng</b> đầy đủ từ Giáo trình Chuẩn HSK 1, 2, 3. Gõ Hán tự, Pinyin, nghĩa tiếng Việt hoặc <b>bấm Mic 🎙️ để nói</b>.</p>

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

            <!-- Bộ lọc phân loại cấp độ HSK -->
            <div class="dict-level-filter">
              <button type="button" class="dict-level-pill ${selectedLevel === 'all' ? 'active' : ''}" data-lvl="all">
                🌐 Tất cả (${countTotal})
              </button>
              <button type="button" class="dict-level-pill ${selectedLevel === 'HSK 1' ? 'active' : ''}" data-lvl="HSK 1">
                🌱 HSK 1 (${countHsk1})
              </button>
              <button type="button" class="dict-level-pill ${selectedLevel === 'HSK 2' ? 'active' : ''}" data-lvl="HSK 2">
                🌿 HSK 2 (${countHsk2})
              </button>
              <button type="button" class="dict-level-pill ${selectedLevel === 'HSK 3' ? 'active' : ''}" data-lvl="HSK 3">
                🌳 HSK 3 (${countHsk3})
              </button>
            </div>

            <div id="dictCountBadge" style="font-size:13px; font-weight:700; color:#64748b; margin-top:-6px; margin-bottom:12px;"></div>
          </div>

          <div id="dictResults" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(270px, 1fr)); gap:14px;"></div>
          <button type="button" id="dictLoadMoreBtn" class="dict-load-more-btn" style="display:none;">
            ⏬ Xem thêm từ vựng khác
          </button>
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

    // 2. Tra cứu Từ điển
    const searchInput = document.getElementById('dictSearchInput');
    const clearBtn = document.getElementById('dictClearBtn');
    const resultsContainer = document.getElementById('dictResults');
    const countBadge = document.getElementById('dictCountBadge');
    const loadMoreBtn = document.getElementById('dictLoadMoreBtn');

    // Bộ lọc cấp độ HSK
    container.querySelectorAll('.dict-level-pill').forEach(btn => {
      btn.onclick = () => {
        selectedLevel = btn.dataset.lvl;
        displayLimit = 24;
        container.querySelectorAll('.dict-level-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSearchResults();
      };
    });

    function updateSearchResults() {
      const q = searchInput.value;
      clearBtn.style.display = q ? 'block' : 'none';
      
      let baseList = q ? search(q) : buildDictionaryDatabase();
      if (selectedLevel !== 'all') {
        baseList = baseList.filter(item => item.level === selectedLevel);
      }

      if (countBadge) {
        countBadge.textContent = q 
          ? `🔍 Tìm thấy ${baseList.length} từ vựng phù hợp với "${q}"`
          : `📚 Đang hiển thị ${Math.min(displayLimit, baseList.length)} / ${baseList.length} từ vựng (${selectedLevel === 'all' ? 'Tất cả cấp độ' : selectedLevel})`;
      }

      const visibleList = baseList.slice(0, displayLimit);
      if (loadMoreBtn) {
        loadMoreBtn.style.display = baseList.length > displayLimit ? 'block' : 'none';
        loadMoreBtn.onclick = () => {
          displayLimit += 24;
          updateSearchResults();
        };
      }

      if (!baseList.length) {
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

      resultsContainer.innerHTML = visibleList.map(item => {
        const bookmarked = window.HSKData?.isBookmarked(item.hanzi);
        const levelBadgeColor = item.level === 'HSK 1' ? '#10b981' : (item.level === 'HSK 2' ? '#3b82f6' : '#6657d9');
        const levelBgColor = item.level === 'HSK 1' ? '#ecfdf5' : (item.level === 'HSK 2' ? '#eff6ff' : '#f5f3ff');
        return `
          <div style="background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:18px; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.2s;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='none'">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
                  <span style="background:${levelBgColor}; color:${levelBadgeColor}; font-size:11.5px; font-weight:800; padding:2px 8px; border-radius:999px;">${item.level}</span>
                  <span style="background:#f1f5f9; color:#475569; font-size:11px; font-weight:700; padding:2px 6px; border-radius:6px;">${item.pos || 'Từ vựng'}</span>
                  ${item.lesson ? `<span style="font-size:11px; color:#94a3b8; font-weight:600;">Bài ${item.lesson}</span>` : ''}
                </div>
                <button type="button" class="bookmark-btn" data-hanzi="${item.hanzi}" style="border:0; background:transparent; font-size:18px; cursor:pointer;" title="Lưu vào sổ tay">${bookmarked ? '⭐' : '☆'}</button>
              </div>
              <div style="font-size:36px; font-family:STKaiti,KaiTi,'KaiTi SC',serif; color:#1a1e36; line-height:1.2;">${item.hanzi}</div>
              <div style="font-size:16px; font-weight:700; color:#6657d9; margin-top:4px;">${item.pinyin}</div>
              <div style="font-size:13px; color:#b45309; font-weight:600; margin-top:2px;">Hán-Việt: ${item.hv}</div>
              <div style="font-size:14px; color:#334155; margin-top:6px; line-height:1.4;">${item.meaning}</div>
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

    searchInput.oninput = () => {
      displayLimit = 24;
      updateSearchResults();
    };
    clearBtn.onclick = () => {
      searchInput.value = '';
      displayLimit = 24;
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
          displayLimit = 24;
          updateSearchResults();
          if (window.Gamification) window.Gamification.playTone(600, 0.1);
        },
        (errMsg) => {
          stopDictVoice();
          voiceStatus.style.display = 'flex';
          voiceText.textContent = '⚠️ ' + errMsg;
          setTimeout(() => {
            if (!isListeningDict) voiceStatus.style.display = 'none';
          }, 3500);
        }
      );

      if (recognitionInstance) {
        try { recognitionInstance.start(); } catch {}
      }
    }

    function stopDictVoice() {
      isListeningDict = false;
      dictMicBtn.classList.remove('listening');
      dictMicBtn.innerHTML = '🎙️';
      if (voiceStatus) voiceStatus.style.display = 'none';
      if (recognitionInstance) {
        try { recognitionInstance.stop(); } catch {}
        recognitionInstance = null;
      }
    }

    // 4. TÍNH NĂNG PHÂN TÍCH CÂU & NGỮ PHÁP
    const analyzerInput = document.getElementById('analyzerInput');
    const analyzerMicBtn = document.getElementById('analyzerMicBtn');
    const btnRunAnalysis = document.getElementById('btnRunAnalysis');
    const analyzerStatus = document.getElementById('analyzerStatus');
    const resultsBox = document.getElementById('analyzerResultsBox');

    // Gợi ý câu mẫu
    container.querySelectorAll('.analyzer-sample-pill').forEach(pill => {
      pill.onclick = () => {
        analyzerInput.value = pill.dataset.sample;
        executeSentenceAnalysis();
      };
    });

    // Mic cho ô phân tích câu
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
      analyzerStatus.innerHTML = '<span style="color:#e11d48;">🎧 Đang nghe... Hãy nói câu tiếng Trung hoặc tiếng Việt!</span>';
      isListeningAnalyzer = true;

      analyzerRecognitionInstance = getSpeechRecognizer(
        'zh-CN', // Mặc định nói tiếng Trung
        (spokenText) => {
          stopAnalyzerVoice();
          analyzerInput.value = spokenText;
          executeSentenceAnalysis();
        },
        (errMsg) => {
          stopAnalyzerVoice();
          analyzerStatus.textContent = '⚠️ ' + errMsg;
        }
      );

      if (analyzerRecognitionInstance) {
        try { analyzerRecognitionInstance.start(); } catch {}
      }
    }

    function stopAnalyzerVoice() {
      isListeningAnalyzer = false;
      analyzerMicBtn.classList.remove('listening');
      analyzerMicBtn.innerHTML = '🎙️';
      analyzerStatus.textContent = '';
      if (analyzerRecognitionInstance) {
        try { analyzerRecognitionInstance.stop(); } catch {}
        analyzerRecognitionInstance = null;
      }
    }

    btnRunAnalysis.onclick = () => executeSentenceAnalysis();

    async function executeSentenceAnalysis() {
      const text = analyzerInput.value.trim();
      if (!text) {
        alert('Vui lòng nhập hoặc nói một câu để phân tích!');
        analyzerInput.focus();
        return;
      }

      btnRunAnalysis.disabled = true;
      btnRunAnalysis.innerHTML = '⏳ Đang phân tích...';
      resultsBox.style.display = 'block';
      resultsBox.innerHTML = `
        <div style="text-align:center; padding:32px; background:#fff; border-radius:18px; border:1px solid #e2e8f0;">
          <div style="font-size:32px; animation:spin 1s linear infinite; display:inline-block;">🔄</div>
          <div style="font-weight:700; color:#334155; margin-top:8px;">AI đang dịch và bóc tách cấu trúc ngữ pháp...</div>
        </div>
      `;

      try {
        let isVietnamese = !/[一-鿿]/.test(text);
        let zhSentence = text;
        let viTranslation = '';

        if (isVietnamese) {
          zhSentence = await translateText(text, 'vi', 'zh-CN');
          viTranslation = text;
        } else {
          viTranslation = await translateText(text, 'zh-CN', 'vi');
        }

        const tokens = segmentSentence(zhSentence);
        const grammarPoints = detectGrammarPoints(zhSentence, tokens);
        const components = classifySentenceComponents(tokens);

        resultsBox.innerHTML = `
          <div class="analyzer-results-card">
            <!-- 1. CÂU GỐC & DỊCH NGHĨA -->
            <div class="analyzer-translation-banner">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
                <div>
                  <div class="atb-label">${isVietnamese ? '🇨🇳 Bản dịch tiếng Trung' : '🇨🇳 Câu tiếng Trung'}</div>
                  <div class="atb-chinese">${zhSentence}</div>
                  <div class="atb-vietnamese">🇻🇳 ${viTranslation}</div>
                </div>
                <button type="button" class="btn" style="background:#fff; border:1.5px solid #d9d5ff; color:#6657d9; border-radius:10px; padding:6px 12px; font-weight:800; font-size:12px; cursor:pointer;" onclick="if(window.HSKAudio) window.HSKAudio.speak('${zhSentence}')">
                  🔊 Nghe câu
                </button>
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
    getAllWords: buildDictionaryDatabase,
    renderDictionaryView,
    renderNotebookView,
    switchTab,
    analyzeSentence: translateText
  };
})();
