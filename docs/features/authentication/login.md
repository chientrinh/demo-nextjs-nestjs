# Tính năng — Đăng nhập

## Mục tiêu

Cho phép người dùng nội bộ (admin, quản lý, chuyên viên phân tích) xác thực để truy cập dashboard.

## Vai trò

Mọi người dùng đã được tạo tài khoản. Không có đăng ký tự do.

## Luồng người dùng

1. Người dùng mở ứng dụng khi chưa có phiên → middleware chuyển tới `/login`.
2. Nhập email + mật khẩu, bấm **Đăng nhập**.
3. Hệ thống gọi `POST /api/auth/login`.
4. Thành công → lưu access token trong bộ nhớ, chuyển tới `/`.
5. Thất bại → hiển thị lỗi, giữ nguyên dữ liệu đã nhập (trừ mật khẩu).

## Giao diện

Dùng form **`SignInForm`** (bắt nguồn từ TailAdmin, chuyển vào module auth tại `src/modules/auth/ui/login-form/components/SignInForm.tsx`) — form email/mật khẩu, nút, ghi nhớ. Tùy biến tối thiểu: gắn handler của dự án, logo/tên "The Bistro", bỏ liên kết "quên mật khẩu"/"đăng ký" nếu không dùng. Schema `credentials` ở `modules/auth/domain/`, gọi API qua `modules/auth/application/services/` (hook ở `ui/login-form/hooks/` gọi service).

Trang: `src/app/(full-width-pages)/login/page.tsx` (page mỏng, import từ `modules/auth`), layout full-width (không sidebar).

## API

**`POST /api/auth/login`**

```json
{ "email": "manager@thebistro.vn", "password": "S3cret!pass" }
```

Thành công `200`:

```json
{ "accessToken": "eyJ…", "user": { "id": "…", "email": "…", "fullName": "…", "role": "MANAGER" } }
```

Kèm `Set-Cookie: refresh_token=…` (httpOnly). Chi tiết: [`../backend/api/endpoints/auth.md`](../../backend/api/endpoints/auth.md).

## Validate (client)

| Field | Quy tắc |
| --- | --- |
| `email` | email hợp lệ, bắt buộc |
| `password` | bắt buộc, ≥ 8 ký tự |

## Tiêu chí chấp nhận

- [ ] Đăng nhập đúng → chuyển tới `/`, header hiển thị `fullName` và `role`.
- [ ] Sai mật khẩu → lỗi "Email hoặc mật khẩu không đúng", **không** tiết lộ bên nào sai.
- [ ] Tài khoản `isActive = false` → lỗi "Tài khoản đã bị vô hiệu hóa".
- [ ] Đã đăng nhập mà mở `/login` → tự chuyển về `/`.
- [ ] Tải lại trang trong phiên → vẫn đăng nhập (khôi phục qua refresh token).
- [ ] Nút đăng nhập hiển thị trạng thái đang xử lý, chặn double-submit.

## Trường hợp biên

| Tình huống | Hành vi |
| --- | --- |
| Hết hạn access token khi đang dùng | Interceptor gọi refresh một lần; thất bại → về `/login` |
| Refresh token hết hạn (7 ngày) | Về `/login`, không thông báo lỗi kỹ thuật |
| Vượt rate limit | Hiển thị "Quá nhiều lần thử, vui lòng đợi" |

## Kiểm thử

- e2e backend: đăng nhập đúng/sai, tài khoản vô hiệu hóa, refresh, logout.
- Component: validate field, hiển thị lỗi chung, trạng thái submit.

## Liên quan

- Xác thực chi tiết: [`../backend/api/authentication.md`](../../backend/api/authentication.md)
- Bảo mật: [`../architecture/security.md`](../../architecture/security.md)
- Khôi phục phiên: [`../frontend/data-fetching.md`](../../frontend/data-fetching.md#khôi-phục-phiên)
