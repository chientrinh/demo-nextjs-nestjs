# 0003 — Xác thực bằng JWT + Passport

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật

## Bối cảnh

Dashboard là ứng dụng nội bộ, người dùng được tạo thủ công (không tự đăng ký). API là stateless và sẽ phục vụ một SPA Next.js. Cần xác thực đơn giản, an toàn, không phụ thuộc phiên server-side, dễ triển khai trong container và hỗ trợ phân quyền theo vai trò.

## Quyết định

Dùng **JWT** với **Passport** (`@nestjs/passport`, `passport-jwt`):

- **Access token** 15 phút, ký HS256, gửi qua `Authorization: Bearer`, lưu **trong bộ nhớ** phía client (không `localStorage`).
- **Refresh token** 7 ngày, trong cookie `httpOnly` + `Secure` + `SameSite=Strict`, **xoay vòng** mỗi lần refresh.
- Phân quyền bằng `RolesGuard` + decorator `@Roles(Role.ADMIN, ...)`.
- Mật khẩu băm bằng `bcrypt`.

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **JWT + refresh cookie (chọn)** | Stateless, an toàn XSS cho refresh, hợp SPA | Cần logic xoay vòng/khôi phục phiên | — |
| Session server-side | Thu hồi tức thì | Cần store phiên, không stateless | Không cần thiết ở quy mô này |
| Chỉ access token dài hạn | Đơn giản | Khó thu hồi, rủi ro cao | Kém an toàn |
| Auth bên thứ ba (Auth0/Clerk) | Tính năng sẵn | Chi phí, phụ thuộc, thừa nhu cầu | Nội bộ, tự chủ |

## Hệ quả

**Tích cực:**
- Không lưu token dài hạn ở nơi JS đọc được → giảm rủi ro XSS.
- Vai trò kiểm soát ghi/đọc tài chính rõ ràng.

**Tiêu cực / đánh đổi:**
- Access token ngắn hạn buộc có interceptor refresh; phải xử lý hàng đợi request khi refresh.
- Thu hồi refresh token cần bảng/lưu vết (hoặc chấp nhận đánh đổi).

**Việc cần làm kéo theo:**
- Interceptor axios: 401 → refresh một lần → phát lại request; thất bại → về `/login`.
- `JWT_SECRET`/`JWT_REFRESH_SECRET` trong biến môi trường, không commit.
- Cookie cần `Secure` → chạy HTTPS; dev dùng `httpOnly` + không `Secure`.

## Liên quan

- [`../backend/api/authentication.md`](../backend/api/authentication.md)
- [`../architecture/security.md`](../architecture/security.md)
- [`../features/authentication/login.md`](../features/authentication/login.md)
