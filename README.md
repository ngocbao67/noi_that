# HOMEDECOR SHOP – WEBSITE THƯƠNG MẠI ĐIỆN TỬ BÁN ĐỒ NỘI THẤT TRÊN NỀN TẢNG CLOUDFLARE

> **ĐỒ ÁN MÔN ĐIỆN TOÁN ĐÁM MÂY (CLOUD COMPUTING CAPSTONE PROJECT)**  
> **Kiến trúc Serverless Edge:** React (Vite SPA) + Cloudflare Python Workers + Cloudflare D1 (SQLite) + Workers Static Assets.  
> **Tiền tệ:** 100% VNĐ (Ví dụ: 4.500.000 ₫).  
> **Ngôn ngữ:** 100% Tiếng Việt.

---

## 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG

| Thành phần | Công nghệ triển khai | Vai trò kiến trúc |
|---|---|---|
| **Frontend UI/UX** | React 19, TypeScript, Tailwind CSS, Lucide Icons, React Router | Giao diện thương mại điện tử Scandinavian & Japandi cao cấp, phản hồi nhanh, tối ưu hóa di động |
| **Edge Compute** | **Cloudflare Python Workers** (`worker/entry.py`) | Xử lý REST API không máy chủ tại hơn 300+ PoP toàn cầu, microsecond cold-start |
| **Cơ sở dữ liệu** | **Cloudflare D1 Database** (`schema.sql`) | Relational SQLite Serverless chuẩn ACID, trừ tồn kho và tạo mã đơn hàng nhất quán |
| **Static Hosting** | **Workers Static Assets** (`dist/`) | Phân phối bundle HTML/CSS/JS tĩnh với chế độ SPA Fallback tự động |
| **Chế độ Preview** | Local Reactive Adapter | Tự động đồng bộ localStorage trong môi trường AI Studio để thầy cô / hội đồng nghiệm thu test live |

---

## 2. HỆ THỐNG TÀI KHOẢN MẪU ĐỂ CHẤM ĐỒ ÁN

Website hỗ trợ nút **"Demo 1 chạm"** ngay tại menu và trang Đăng nhập:

- **Tài khoản Quản trị viên (Admin):**
  - **Email:** `admin@homedecor.vn`
  - **Mật khẩu:** `admin123`
  - **Quyền hạn:** Truy cập toàn bộ Admin Dashboard, quản lý 32+ sản phẩm, kho tồn hàng, duyệt đơn, danh mục và người dùng.

- **Tài khoản Khách hàng (Customer):**
  - **Email:** `khachhang@gmail.com`
  - **Mật khẩu:** `123456`
  - **Quyền hạn:** Xem giỏ hàng, đặt hàng COD / Chuyển khoản, theo dõi lịch sử đơn hàng, cập nhật thông tin nhận hàng.

---

## 3. HƯỚNG DẪN 12 BƯỚC XUẤT VÀ TRIỂN KHAI LÊN CLOUDFLARE

### Bước 1: Tải mã nguồn về máy tính
- Xuất project từ Google AI Studio (tải ZIP hoặc đồng bộ qua GitHub).
- Giải nén file vào máy tính của bạn.

### Bước 2: Mở dự án trong Visual Studio Code
```bash
cd homedecor-shop
code .
```

### Bước 3: Cài đặt Dependencies Frontend
```bash
npm install
```

### Bước 4: Biên dịch Frontend Production
```bash
npm run build
```
*Lệnh này sẽ tạo ra thư mục `dist/` chứa toàn bộ assets tĩnh đã được nén và tối ưu.*

### Bước 5: Cài đặt công cụ Cloudflare Wrangler & Đăng nhập
```bash
npm install -g wrangler
# Hoặc chạy trực tiếp qua npx:
npx wrangler login
```
*Trình duyệt sẽ mở trang xác thực tài khoản Cloudflare Dashboard của bạn.*

### Bước 6: Tạo cơ sở dữ liệu Cloudflare D1 mới
```bash
npx wrangler d1 create homedecor-db
```
*Wrangler sẽ trả về thông tin cấu hình, bao gồm `database_name = "homedecor-db"` và chuỗi `database_id`.*

### Bước 7: Cập nhật tệp `wrangler.toml`
Mở tệp `wrangler.toml` ở thư mục gốc và thay thế `database_id` vừa nhận được:
```toml
[[d1_databases]]
binding = "DB"
database_name = "homedecor-db"
database_id = "dán-database-id-của-bạn-vào-đây"
```

### Bước 8: Khởi tạo Cấu trúc bảng (schema.sql) trên D1
Khởi tạo 10 bảng dữ liệu (users, categories, products, orders, order_items...):
```bash
# Thực thi trên Cloudflare D1 Remote:
npx wrangler d1 execute homedecor-db --remote --file=./schema.sql
```

### Bước 9: Nạp 32+ Sản phẩm nội thất mẫu (seed.sql) vào D1
```bash
# Nạp dữ liệu mẫu ban đầu:
npx wrangler d1 execute homedecor-db --remote --file=./seed.sql
```

### Bước 10: Chạy thử nghiệm Localhost (Wrangler Dev)
```bash
npx wrangler dev
```
Truy cập `http://localhost:8787` để trải nghiệm backend Python Worker kết hợp với D1 SQLite local!

### Bước 11: Triển khai chính thức lên Cloudflare Toàn Cầu
```bash
npx wrangler deploy
```

### Bước 12: Kiểm thử và Báo cáo nghiệm thu
- Truy cập domain được cấp: `https://homedecor-shop.<subdomain>.workers.dev`
- Kiểm tra sức khỏe API: `https://homedecor-shop.<subdomain>.workers.dev/api/health`
- Truy vấn kiểm tra dữ liệu đơn hàng trong D1:
```bash
npx wrangler d1 execute homedecor-db --remote --command="SELECT id, code, customer_name, total, status FROM orders;"
```

---

## 4. MA TRẬN API CLOUDFLARE PYTHON WORKERS

| Method | Đường dẫn API | Chức năng | Cơ sở dữ liệu D1 |
|---|---|---|---|
| `GET` | `/api/health` | Kiểm tra trạng thái Edge Worker | Ping phản hồi |
| `GET` | `/api/products` | Lấy danh sách sản phẩm (Lọc, Tìm kiếm, Phân trang) | `SELECT FROM products` |
| `GET` | `/api/products/{id}` | Lấy chi tiết sản phẩm và ảnh gallery | `SELECT FROM products & product_images` |
| `GET` | `/api/categories` | Lấy danh mục nội thất | `SELECT FROM categories` |
| `POST` | `/api/auth/register` | Đăng ký tài khoản khách hàng mới | `INSERT INTO users` |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản & cấp session token | `SELECT & INSERT INTO user_sessions` |
| `POST` | `/api/orders` | Xác thực tồn kho, tính giá từ D1, trừ kho, tạo đơn | `UPDATE products, INSERT INTO orders` |
| `GET` | `/api/orders` | Xem lịch sử đơn của tài khoản đang đăng nhập | `SELECT FROM orders WHERE user_id=?` |
| `GET` | `/api/admin/stats` | Thống kê KPI doanh thu, đơn hàng, biểu đồ | `SELECT COUNT, SUM(total)` |
| `POST` | `/api/admin/products` | Thêm sản phẩm mới vào kho | `INSERT INTO products` |
| `PATCH` | `/api/admin/orders/{id}` | Cập nhật trạng thái đơn (Duyệt, Giao, Hoàn thành) | `UPDATE orders SET status=?` |

---

## 5. THUYẾT MINH CHẾ ĐỘ PREVIEW & PRODUCTION

1. **Khi chạy trong Google AI Studio (Live Preview):**
   - Ứng dụng kích hoạt **Preview Mock Adapter** tự động, nạp đầy đủ 32 sản phẩm nội thất cao cấp vào reactive state.
   - Các thao tác: thêm vào giỏ, đặt hàng, tạo đơn mới, giảm tồn kho, cập nhật trạng thái đơn hàng đều hoạt động trơn tru 100% để thầy cô / hội đồng nghiệm thu có thể bấm trực tiếp.
2. **Khi triển khai lên Cloudflare Workers (Production):**
   - Frontend tự động chuyển sang gọi REST API thật qua `/api/*` được phục vụ bởi Cloudflare Python Workers kết nối với Cloudflare D1 SQLite.
   - Bạn cũng có thể chủ động chuyển đổi chế độ thông qua thanh điều khiển tại trang `/admin/cloudflare`.
