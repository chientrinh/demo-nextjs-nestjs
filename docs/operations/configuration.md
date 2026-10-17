# Cấu hình (biến môi trường)

Nguồn sự thật của biến là các file `.env.example` trong `backend/` và `frontend/`. Tài liệu này giải thích ý nghĩa và giá trị mặc định.

## Backend (`backend/.env`)

| Biến | Bắt buộc | Mặc định dev | Mô tả |
| --- | --- | --- | --- |
| `NODE_ENV` | có | `development` | Chế độ chạy |
| `PORT` | không | `3001` | Cổng API |
| `DATABASE_URL` | có | `postgresql://bistro:bistro@localhost:5432/bistro?schema=public` | Chuỗi kết nối Prisma |
| `JWT_SECRET` | có | — | Khóa ký access token (HS256) |
| `JWT_REFRESH_SECRET` | có | — | Khóa ký refresh token |
| `CORS_ORIGIN` | có | `http://localhost:3000,http://frontend:3000` | Nguồn được phép (danh sách phẩy) |
| `SEED_ADMIN_PASSWORD` | khi chạy seed | — | Mật khẩu tài khoản admin dữ liệu demo; không dùng ở production |
| `SEED_MANAGER_PASSWORD` | khi chạy seed | — | Mật khẩu tài khoản manager dữ liệu demo; không dùng ở production |
| `SEED_ANALYST_PASSWORD` | khi chạy seed | — | Mật khẩu tài khoản analyst dữ liệu demo; không dùng ở production |

> `JWT_SECRET` và `JWT_REFRESH_SECRET` phải **khác nhau**, dài và ngẫu nhiên (≥ 32 byte). Sinh bằng `openssl rand -base64 48`.

`npx prisma db seed` chỉ dành cho development. Lệnh từ chối chạy khi `NODE_ENV=production`, và yêu cầu cả ba biến `SEED_*_PASSWORD`; không có mật khẩu seed cố định trong mã nguồn.

## Frontend (`frontend/.env`)

| Biến | Bắt buộc | Mặc định dev | Mô tả |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | có | `http://localhost:3001/api` | Base URL của API |

Chỉ biến có tiền tố `NEXT_PUBLIC_` mới lộ ra trình duyệt. **Không** đặt bí mật ở frontend.

## Nạp biến

- **Backend:** `ConfigModule` của `@nestjs/config` được đăng ký global, đọc `backend/.env` ngoài production và chỉ đọc biến môi trường thật khi `NODE_ENV=production`. Schema Joi kiểm tra biến bắt buộc ngay lúc khởi động.
- **Frontend:** Next.js đọc `.env.local` khi dev; biến `NEXT_PUBLIC_*` nhúng lúc build — **đổi giá trị cần build lại**.

## Thêm biến mới

Khi thêm biến: cập nhật **cả** `.env.example` và bảng này, và (backend) thêm kiểm tra trong schema validation của `@nestjs/config` để fail-fast khi thiếu.

## Liên quan

- [`environments.md`](./environments.md)
- [`../architecture/security.md`](../architecture/security.md)
