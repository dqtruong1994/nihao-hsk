# 你好 HSK · Nền Tảng Học Tiếng Trung Đã Nâng Cấp (Full Upgrade Edition)

Dự án học tiếng Trung trực tuyến HSK 1, HSK 2, HSK 3 được clone và nâng cấp toàn diện từ `https://nihao-hsk-threedtech.motivesvn-5767.chatgpt.site/`.

Toàn bộ hệ thống được xây dựng theo kiến trúc **Offline-First + Edge-First**, tối ưu hoàn hảo để lưu trữ và vận hành trên **Cloudflare Free Tier (Chi phí = 0 đồng)**.

---

## 🌟 Các Tính Năng Mới & Nâng Cấp Vượt Trội

### 1. Trang Quản Trị Hệ Thống Toàn Diện (Admin Dashboard Full CRUD)
- **Đường dẫn quản trị:** `/admin` hoặc `admin.html`.
- **Đăng nhập bảo mật:** Xác thực tài khoản Admin (`admin` / `admin@nihao123`) trước khi mở quyền quản trị.
- **Quản lý Bài học (Lessons CRUD):**
  - Xem danh sách bài học HSK 1, 2, 3 kèm tiêu đề tiếng Trung, phiên âm và tiếng Việt.
  - Sửa trực tiếp nội dung bài học, ngữ pháp, từ vựng hoặc thêm bài mới.
  - Nút **Khôi phục bài gốc** chỉ với 1 click.
- **Quản lý Menu điều hướng (Menus CRUD):**
  - Thêm mới liên kết menu, sửa nhãn hiển thị, đổi đường dẫn URL.
  - Thay đổi thứ tự sắp xếp (sort order) và bật/tắt ẩn/hiện menu ngay trên thanh Header.
- **Quản lý Từ vựng (Vocabulary):**
  - Tìm kiếm và tra cứu từ vựng theo chữ Hán, Pinyin, Hán-Việt xuyên suốt cả 3 cấp độ HSK.
- **Quản lý Người dùng & Phân quyền (Users & RBAC):**
  - Danh sách học viên và quản trị viên, ngày tạo, lần đăng nhập gần nhất.
  - Chuyển đổi linh hoạt quyền hạn (`admin` ↔ `student`).
  - Khóa (Block) hoặc Mở khóa tài khoản; Xóa tài khoản vi phạm; Tạo nhanh học viên mới.
- **Cài đặt & Sao lưu hệ thống (Settings & Backup):**
  - Đổi tiêu đề website, cấu hình banner thông báo toàn trang (`#siteAnnouncementBanner`).
  - Xuất toàn bộ cơ sở dữ liệu ra file JSON (`exportFullBackup`).
  - Nhập dữ liệu sao lưu (`importFullBackup`) giúp di chuyển hoặc sao lưu dữ liệu an toàn 100%.

---

### 2. Hệ Thống Đăng Nhập, Đăng Ký & Phân Quyền (Auth & RBAC)
- Tích hợp module [`auth.js`](file:///d:/Others/nihao-hsk-clone/auth.js).
- Hỗ trợ Popup Modal Đăng nhập / Đăng ký hiện đại ngay tại Trang chủ và trang Admin.
- Mã hóa mật khẩu bằng SHA-256 qua Web Crypto API.
- Tự động hiển thị tên học viên, huy hiệu Role (`Admin` hoặc `Học viên`) và nút tắt đăng xuất trên Header.

---

### 3. Công Cụ Học Tiếng Trung Chuyên Sâu
- **Bảng tập viết chữ Hán (Hanzi Stroke Canvas):**
  - Module [`hanzi-canvas.js`](file:///d:/Others/nihao-hsk-clone/hanzi-canvas.js) hiển thị ô Mễ tự cách (米字格) tương tác.
  - Nút **✍️ Tập viết** có mặt trên mọi thẻ từ vựng và tra cứu từ điển.
  - Vẽ nét bằng chuột hoặc cảm ứng ngón tay, có chữ mẫu mờ, nút xóa vẽ lại và phát âm.
- **Lặp lại ngắt quãng (SM-2 Spaced Repetition):**
  - Module [`srs-engine.js`](file:///d:/Others/nihao-hsk-clone/srs-engine.js) chạy thuật toán SM-2 (1-3-7-14-30 ngày).
  - Mục **🎯 Ôn tập hôm nay** trên Trang chủ gom toàn bộ thẻ từ vựng đến hạn của cả 3 cấp độ vào 1 phiên ôn tập duy nhất.
- **Tra cứu Từ điển Hán ngữ & Sổ tay cá nhân (Dictionary & Notebook):**
  - Module [`dictionary.js`](file:///d:/Others/nihao-hsk-clone/dictionary.js).
  - Tra cứu tức thì theo chữ Hán (`你好`), Pinyin (`ni hao`) hoặc tiếng Việt (`xin chào`).
  - Bấm ngôi sao ⭐ để lưu vào **Sổ tay từ vựng yêu thích** phục vụ ôn luyện tập trung.
- **Mô phỏng 4 thanh điệu tiếng Trung bằng Web Audio API:**
  - Module [`chinese-audio.js`](file:///d:/Others/nihao-hsk-clone/chinese-audio.js) tổng hợp trực tiếp tần số cao độ 4 thanh (Thanh 1 ngang 260Hz, Thanh 2 lên 200→260Hz, Thanh 3 trầm 190→130→220Hz, Thanh 4 rơi 270→130Hz).
- **Gamification & Khích lệ học tập:**
  - Âm thanh phản hồi khi chọn đúng/sai.
  - Pháo hoa chúc mừng (Canvas Confetti) khi vượt qua bài kiểm tra (≥ 85%).
  - Hộp giải thích đáp án trực quan ngay sau khi nộp bài.

---

### 4. Đồng Bộ Hội Thoại Giáo Trình Chuẩn Cho HSK 2
- Bổ sung file [`hsk2-textbook-dialogues.json`](file:///d:/Others/nihao-hsk-clone/hsk2-textbook-dialogues.json) với đầy đủ 12 bài hội thoại chuẩn.
- Kích hoạt tab **💬 Hội thoại** mượt mà trong [`hsk2.html`](file:///d:/Others/nihao-hsk-clone/hsk2.html).

---

### 5. Triển Khai Cloudflare Free Tier (Chi Phí = 0 Đồng)
- **Tài liệu hướng dẫn chi tiết:** Xem [`CLOUDFLARE_DEPLOY.md`](file:///d:/Others/nihao-hsk-clone/CLOUDFLARE_DEPLOY.md).
- **Cloudflare Pages:** Không giới hạn băng thông và lượt truy cập, cấp SSL miễn phí trọn đời.
- **Cloudflare Pages Functions:** 100.000 requests/ngày miễn phí tại thư mục `/functions/api/`:
  - `/api/auth/login`, `/api/auth/register`: Đăng nhập, đăng ký serverless.
  - `/api/lessons`: CRUD bài học.
  - `/api/menus`: CRUD menu điều hướng.
  - `/api/users`: Quản lý thành viên & RBAC.
- **Cloudflare D1 (SQLite Edge):** 5 triệu lượt đọc/ngày miễn phí với file khởi tạo [`schema.sql`](file:///d:/Others/nihao-hsk-clone/schema.sql).
- **Offline PWA:** Tích hợp [`sw.js`](file:///d:/Others/nihao-hsk-clone/sw.js) và [`manifest.json`](file:///d:/Others/nihao-hsk-clone/manifest.json) học ngoại tuyến kể cả khi mất mạng.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
nihao-hsk-clone/
├── index.html                   # Trang chủ chính + Hub tiến độ + Navigation
├── site.js / site.css           # Router và điều hướng giao diện chính
├── enhancements.css             # Style bổ trợ (SRS, Hanzi Pad, Banner, Auth)
├── auth.js                      # Động cơ Xác thực & Phân quyền RBAC (Admin/Student)
├── data-store.js                # Quản lý CRUD Bài học, Menu, Sổ tay, Ghi chú
├── dictionary.js                # Tra cứu từ điển Hán - Việt - Pinyin & Sổ tay ⭐
├── gamification.js              # Web Audio FX, Canvas Confetti, Tích lũy XP
├── hanzi-canvas.js              # Bảng tập viết nét chữ Hán trong ô Mễ tự cách (米字格)
├── srs-engine.js                # Thuật toán lặp lại ngắt quãng SM-2 SRS
├── chinese-audio.js / .css      # Bộ phát âm tiếng Trung & cao độ 4 thanh điệu
├── pinyin-audio.js              # Bảng âm thanh ngữ âm Pinyin
├── course-ui.js / course.css    # Logic giao diện bài học
├── textbook-dialogues.js / .css # Trình đọc và hội thoại giáo trình
├── hsk1.html / hsk1-...dialogues.json # Khóa học & hội thoại HSK 1
├── hsk2.html / hsk2-...dialogues.json # Khóa học & hội thoại HSK 2 (đã kích hoạt)
├── hsk3.html / hsk3.js / hsk3.css     # Khóa học HSK 3
├── hsk3-lessons.json            # Dữ liệu 12 bài học HSK 3
├── admin.html / admin/          # Cổng quản trị Admin Dashboard Full CRUD
│   ├── index.html
│   ├── admin.js
│   └── admin.css
├── functions/                   # Serverless APIs cho Cloudflare Pages
│   └── api/
│       ├── auth/login.js
│       ├── auth/register.js
│       ├── lessons.js
│       ├── menus.js
│       └── users.js
├── schema.sql                   # Cơ sở dữ liệu SQLite Cloudflare D1
├── wrangler.toml                # Cấu hình Cloudflare Pages & D1 binding
├── _headers                     # Cấu hình bảo mật HTTP & Caching của Cloudflare
├── sw.js / manifest.json        # Service Worker & PWA Manifest
├── robots.txt / sitemap.xml     # SEO Tags
├── CLOUDFLARE_DEPLOY.md         # Hướng dẫn chi tiết deploy Cloudflare 0 đồng
└── README.md                    # Tài liệu dự án
```

---

## 💻 Cách Khởi Chạy Thử Nghiệm Trên Máy Cục Bộ (Local)

Mở Terminal / PowerShell tại thư mục `d:\Others\nihao-hsk-clone`:

```bash
# Sử dụng Python có sẵn:
python -m http.server 8080

# Hoặc dùng Node.js:
npx serve .
```

Truy cập trên trình duyệt:
- **Trang chủ học tập:** `http://localhost:8080/`
- **Tra cứu từ điển:** `http://localhost:8080/#dict`
- **Sổ tay từ vựng:** `http://localhost:8080/#notebook`
- **Khóa HSK 1:** `http://localhost:8080/#hsk1`
- **Khóa HSK 2:** `http://localhost:8080/#hsk2`
- **Khóa HSK 3:** `http://localhost:8080/#hsk3`
- **Trang Quản trị Admin:** `http://localhost:8080/admin/` hoặc `http://localhost:8080/admin.html`
  - Tài khoản Admin: `admin`
  - Mật khẩu: `admin@nihao123`
