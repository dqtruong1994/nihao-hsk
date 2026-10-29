# Hướng Dẫn Triển Khai Lên Cloudflare Pages (Chi Phí = 0 Đồng)

Dự án **你好 HSK** được kiến trúc theo mô hình **Edge-First + Offline-First (PWA)**, tối ưu hoàn hảo để chạy trên gói **Free Tier** vĩnh viễn của Cloudflare mà không tốn một đồng chi phí nào.

---

## 1. Bảng Kiểm Tra Hạn Mức Miễn Phí Của Cloudflare (0đ/Tháng)

| Dịch vụ Cloudflare | Hạn mức gói Free | Nhu cầu của web học tiếng Trung | Chi phí |
| :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | **Không giới hạn** băng thông & lượt truy cập | Cung cấp HTML/CSS/JS, âm thanh, icon | **0 VNĐ** |
| **SSL / TLS Certificate** | Tự động cấp phát miễn phí, gia hạn tự động | Bảo mật HTTPS chuẩn quốc tế | **0 VNĐ** |
| **Custom Domain** | Không giới hạn tên miền riêng | Gắn tên miền `.vn` hoặc `.com` tuỳ thích | **0 VNĐ** |
| **Pages Functions** | **100.000 requests/ngày** | Xử lý API đăng nhập, lưu bài học, menu | **0 VNĐ** |
| **Cloudflare D1 (SQLite Edge)** | **5.000.000 lượt đọc/ngày**<br>**100.000 lượt ghi/ngày**<br>5 GB dung lượng lưu trữ | Lưu người dùng, bài học HSK 1-3, menu, từ điển | **0 VNĐ** |

> [!NOTE]
> Web hỗ trợ kiến trúc **Dual-Mode**: Kể cả khi bạn không tạo Database Cloudflare D1, toàn bộ hệ thống vẫn chạy trơn tru 100% nhờ cơ chế **Client-side Storage (IndexedDB/LocalStorage)** và **Service Worker Offline Cache**.

---

## 2. Cách 1: Triển Khai Qua Giao Diện Cloudflare Dashboard (Nhanh nhất - 3 phút)

### Bước 1: Đẩy mã nguồn lên GitHub / GitLab
1. Khởi tạo Git và push mã nguồn thư mục `nihao-hsk-clone` lên GitHub cá nhân của bạn:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao du an Nihao HSK"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/nihao-hsk.git
   git push -u origin main
   ```

### Bước 2: Tạo dự án Cloudflare Pages
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Ở menu bên trái, chọn **Compute (Workers & Pages)** > **Pages**.
3. Bấm **Connect to Git** và chọn repository `nihao-hsk` vừa đẩy lên.
4. Cấu hình bản build:
   - **Project name:** `nihao-hsk` (hoặc tên tuỳ thích).
   - **Production branch:** `main`.
   - **Framework preset:** `None`.
   - **Build command:** Để trống.
   - **Build output directory:** `/` (hoặc `.`).
5. Bấm **Save and Deploy**. Website của bạn sẽ hoạt động ngay lập tức tại địa chỉ: `https://nihao-hsk.pages.dev`.

### Bước 3: Tạo và liên kết cơ sở dữ liệu Cloudflare D1 (Tuỳ chọn lưu trữ đám mây)
1. Ở menu bên trái, vào **Storage & Databases** > **D1 SQL Database** > Bấm **Create database**.
2. Đặt tên database: `nihao-hsk-db` > Bấm **Create**.
3. Chuyển sang tab **Console** trong database vừa tạo, mở file `schema.sql` trong mã nguồn, dán toàn bộ nội dung SQL vào và bấm **Execute**.
4. Quay lại **Workers & Pages** > Chọn dự án `nihao-hsk` > Vào tab **Settings** > **Functions**.
5. Kéo xuống mục **D1 database bindings**:
   - Bấm **Add binding**.
   - **Variable name:** `DB` *(Bắt buộc ghi in hoa `DB`)*.
   - **D1 database:** Chọn `nihao-hsk-db`.
6. Bấm **Save**. Từ lần deploy tiếp theo, mọi dữ liệu bài học, người dùng và menu sẽ được lưu trực tiếp vào cơ sở dữ liệu Edge D1 miễn phí.

---

## 3. Cách 2: Triển Khai Trực Tiếp Bằng Lệnh (Wrangler CLI)

Nếu bạn đã cài Node.js, bạn có thể triển khai trực tiếp từ terminal máy tính mà không cần GitHub:

```bash
# 1. Đăng nhập vào Cloudflare
npx wrangler login

# 2. Tạo database D1 miễn phí
npx wrangler d1 create nihao-hsk-db

# 3. Lấy database_id hiển thị trên terminal và điền vào file wrangler.toml

# 4. Khởi tạo bảng dữ liệu từ schema.sql
npx wrangler d1 execute nihao-hsk-db --file=./schema.sql --remote

# 5. Triển khai toàn bộ trang web và serverless functions lên Cloudflare Pages
npx wrangler pages deploy . --project-name=nihao-hsk
```

---

## 4. Tài Khoản Quản Trị & Phân Quyền (RBAC)

Hệ thống được thiết lập sẵn tài khoản Quản trị tối cao (Admin) để bạn bắt đầu quản lý:

- **Đường dẫn trang Admin:**
  - `https://ten-mien-cua-ban.pages.dev/admin/` hoặc `https://ten-mien-cua-ban.pages.dev/admin.html`
- **Tài khoản mặc định:** `admin`
- **Mật khẩu mặc định:** `admin@nihao123`
- **Phân quyền trong hệ thống:**
  - **Admin:** Xem thống kê, tạo/sửa/xóa bài học, thêm/sửa/ẩn các menu điều hướng, quản lý danh sách học viên, phân quyền hoặc khóa tài khoản, xuất/nhập file sao lưu toàn hệ thống (JSON Backup).
  - **Student (Học viên):** Học bài, nghe audio 4 thanh điệu, tập viết chữ Hán, làm bài test (yêu cầu ≥85% để qua bài), ôn tập ngắt quãng (SRS SM-2), lưu từ vựng vào sổ tay cá nhân.

> [!TIP]
> Ngay sau khi đăng nhập lần đầu vào trang Admin, hãy vào mục **Người dùng & Quyền** hoặc **Cài đặt** để đổi mật khẩu tài khoản Admin nhằm bảo mật tối đa cho website của bạn.

