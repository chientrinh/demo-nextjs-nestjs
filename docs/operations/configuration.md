# Cấu hình (biến môi trường)

Nguồn sự thật của biến là các file `.env.example` trong `backend/` và `frontend/`. Tài liệu này giải thích ý nghĩa và giá trị mặc định.

## Backend (`backend/.env`)

| Biến | Bắt buộc | Mặc định dev | Mô tả |
| --- | --- | --- | --- |
| `NODE_ENV` | có | `development` | Chế độ chạy |
| `PORT` | không | `3001` | Cổng API |
| `DATABASE_URL` | có | `postgresql://bistro:bistro@localhost:5432/bistro?schema=public` | Chuỗi kết nối Prisma |
| `JWT_SECRET` | có | — | Khóa ký access token (HS256) |
| `JWT_ACCESS_TTL` | không | `15m` | Hạn access token |
| `JWT_REFRESH_SECRET` | có | — | Khóa ký refresh token |
| `JWT_REFRESH_TTL` | không | `7d` | Hạn refresh token |
| `CORS_ORIGIN` | có | `http://localhost:3000` | Nguồn được phép (danh sách phẩy) |
| `BCRYPT_ROUNDS` | không | `10` | Số vòng băm mật khẩu |
| `RATE_LIMIT_TTL` | không | `60` | Giây cho cửa sổ rate limit |
| `RATE_LIMIT_LIMIT` | không | `100` | Số request tối đa mỗi cửa sổ |

> `JWT_SECRET` và `JWT_REFRESH_SECRET` phải **khác nhau**, dài và ngẫu nhiên (≥ 32 byte). Sinh bằng `openssl rand -base64 48`.

## Frontend (`frontend/.env`)

| Biến | Bắt buộc | Mặc định dev | Mô tả |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | có | `http://localhost:3001/api` | Base URL của API |

Chỉ biến có tiền tố `NEXT_PUBLIC_` mới lộ ra trình duyệt. **Không** đặt bí mật ở frontend.

## Nạp biến

- **Backend:** `@nestjs/config` đọc `.env` khi dev; production đọc từ môi trường thật.
- **Frontend:** Next.js đọc `.env.local` khi dev; biến `NEXT_PUBLIC_*` nhúng lúc build — **đổi giá trị cần build lại**.

## Thêm biến mới

Khi thêm biến: cập nhật **cả** `.env.example` và bảng này, và (backend) thêm kiểm tra trong schema validation của `@nestjs/config` để fail-fast khi thiếu.

## Liên quan

- [`environments.md`](./environments.md)
- [`../architecture/security.md`](../architecture/security.md)
