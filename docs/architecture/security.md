# Bảo mật

## Mô hình xác thực

Hệ thống dùng **JWT stateless** cho API, kèm refresh token trong cookie. Chi tiết luồng token: [`backend/api/authentication.md`](../backend/api/authentication.md), quyết định: [`adr/0003-jwt-passport-auth.md`](../adr/0003-jwt-passport-auth.md).

| Token | Thời hạn | Nơi lưu | Mục đích |
| --- | --- | --- | --- |
| Access token | 15 phút | Bộ nhớ frontend (không localStorage) | Gắn vào header `Authorization: Bearer <token>` |
| Refresh token | 7 ngày | Cookie `httpOnly`, `Secure`, `SameSite=Lax` | Cấp lại access token khi hết hạn |

Access token không lưu ở `localStorage` để giảm rủi ro XSS đánh cắp token thường trú.

## Vai trò và phân quyền

| Vai trò | Đọc dữ liệu | Ghi dữ liệu (events/labour) | Quản lý người dùng |
| --- | --- | --- | --- |
| `ADMIN` | ✅ | ✅ | ✅ |
| `MANAGER` | ✅ | ✅ | ❌ |
| `ANALYST` | ✅ | ❌ | ❌ |

Thực thi: một guard xác thực JWT (`JwtAuthGuard`) chạy trên mọi endpoint, và một guard phân quyền (`RolesGuard`) kiểm tra vai trò trên các endpoint ghi. Endpoint danh sách người dùng chỉ `ADMIN`.

Quy tắc bất biến: **`ANALYST` không bao giờ được ghi**. Mọi endpoint `POST/PATCH/DELETE` trên dữ liệu tài chính phải yêu cầu `ADMIN` hoặc `MANAGER`.

## Bảo vệ mật khẩu

- Băm bằng **bcrypt** với cost factor ≥ 10. Không bao giờ trả `passwordHash` ra API.
- Yêu cầu độ mạnh mật khẩu tối thiểu ở form Login/User (xem [`frontend/forms-and-validation.md`](../frontend/forms-and-validation.md)).

## Bảo vệ đầu vào

- `ValidationPipe` toàn cục với `whitelist: true` và `forbidNonWhitelisted: true` — loại bỏ mọi field không khai báo trong DTO.
- Validate ở cả hai đầu: Zod phía frontend (trải nghiệm), class-validator phía backend (ranh giới tin cậy). Backend **không tin** dữ liệu frontend.
- Prisma tham số hóa mọi truy vấn → phòng SQL injection ở tầng ORM.

## Bảo vệ giao thông

- Production: chỉ HTTPS; refresh cookie đặt `Secure`.
- CORS: chỉ cho phép origin của frontend (`CORS_ORIGIN` trong env). Không dùng `*` khi bật credentials.
- Rate limiting: khuyến nghị `@nestjs/throttler` cho `POST /api/auth/login` (chống brute-force) — xem [`operations/monitoring.md`](../operations/monitoring.md).

## Bí mật và cấu hình

- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, mật khẩu DB là **bí mật**, chỉ nằm trong `.env` (đã gitignore). Không commit.
- Mỗi môi trường dùng bộ secret riêng. Xem [`operations/configuration.md`](../operations/configuration.md).

## Nhật ký kiểm toán

Mọi bản ghi tài chính lưu `createdById` (người tạo). Đây là mức truy vết tối thiểu; ghi log có cấu trúc cho các hành động ghi được mô tả ở [`operations/monitoring.md`](../operations/monitoring.md).

## Checklist trước khi phát hành

- [ ] `JWT_*_SECRET` đủ dài và ngẫu nhiên, khác giữa các môi trường.
- [ ] CORS chỉ mở cho origin frontend thật.
- [ ] Cookie refresh có `httpOnly` + `Secure` + `SameSite=Lax`.
- [ ] Swagger (`/api/docs`) tắt hoặc có bảo vệ ở production.
- [ ] Không có secret nào trong git history.
