-- Schema Database Cloudflare D1 (Miễn phí 100% - SQLite Edge)
-- Thực thi bằng lệnh: npx wrangler d1 execute nihao-hsk-db --file=./schema.sql

-- 1. Bảng Người dùng (Users & Phân quyền RBAC)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student', -- 'admin' hoặc 'student'
  status TEXT NOT NULL DEFAULT 'active', -- 'active' hoặc 'blocked'
  created_at INTEGER NOT NULL,
  last_login INTEGER
);

-- Tạo tài khoản Admin mặc định (admin / admin@nihao123)
-- SHA-256 hash của "admin@nihao123"
INSERT OR IGNORE INTO users (id, username, password_hash, name, role, status, created_at)
VALUES (
  'admin_01',
  'admin',
  'd0d39e25d2c8fbcf34b4661ea00d8cb36b28537553f1d5336fbf188c64bb93b2',
  'Quản trị viên',
  'admin',
  'active',
  1700000000000
);

-- 2. Bảng Menu điều hướng (Navigation Menus)
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  route TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  visible INTEGER NOT NULL DEFAULT 1,
  is_system INTEGER NOT NULL DEFAULT 0
);

-- Chèn Menu mặc định
INSERT OR IGNORE INTO menus (id, label, route, url, sort_order, visible, is_system) VALUES
('home', 'Trang chủ', 'home', '#home', 1, 1, 1),
('hsk1', 'HSK 1', 'hsk1', '#hsk1', 2, 1, 1),
('hsk2', 'HSK 2', 'hsk2', '#hsk2', 3, 1, 1),
('hsk3', 'HSK 3', 'hsk3', '#hsk3', 4, 1, 1),
('dict', '📖 Tra từ điển', 'dict', '#dict', 5, 1, 0),
('notebook', '⭐ Sổ tay từ vựng', 'notebook', '#notebook', 6, 1, 0);

-- 3. Bảng Bài học tùy chỉnh (Lessons CRUD)
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,            -- Ví dụ: 'hsk1_0', 'hsk2_1'
  course TEXT NOT NULL,           -- 'hsk1', 'hsk2', 'hsk3'
  lesson_index INTEGER NOT NULL,  -- 0 .. 11
  title_vi TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  data_json TEXT NOT NULL,        -- Toàn bộ JSON bài học (vocab, grammar, dialogues, quiz)
  updated_at INTEGER NOT NULL
);

-- 4. Bảng Tiến độ học tập & Điểm XP của Học viên
CREATE TABLE IF NOT EXISTS user_progress (
  user_id TEXT NOT NULL,
  course TEXT NOT NULL,
  completed_lessons TEXT NOT NULL DEFAULT '[]', -- JSON array các bài đã xong [0, 1, 2]
  xp INTEGER NOT NULL DEFAULT 0,
  due_words_count INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, course),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Bảng Sổ tay Từ vựng Yêu thích (Bookmarks)
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  hanzi TEXT NOT NULL,
  pinyin TEXT NOT NULL,
  hv TEXT,
  meaning TEXT NOT NULL,
  course TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Bảng Cài đặt & Thông báo hệ thống (Settings)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
('site_announcement', 'Chào mừng bạn đến với 你好 HSK! Hệ thống học tiếng Trung miễn phí 100%.', 1700000000000),
('site_title', '你好 HSK · Học tiếng Trung mỗi ngày', 1700000000000);

