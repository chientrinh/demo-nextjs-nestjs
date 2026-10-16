# Xác thực API

## Tóm tắt

- Cơ chế: JWT stateless (access token) + refresh token trong cookie httpOnly.
- Thư viện: `@nestjs/passport` + `passport-jwt`, băm mật khẩu bằng `bcrypt`.
- Quyết định kiến trúc: [`../../adr/0003-jwt-passport-auth.md`](../../adr/0003-jwt-passport-auth.md).

## Token

| Token | Thời hạn | Payload | Nơi client giữ |
| --- | --- | --- | --- |
| Access | 15 phút | `{ sub: userId, email, role }` | Bộ nhớ (biến JS), gắn `Authorization: Bearer` |
| Refresh | 7 ngày | `{ sub: userId, tokenVersion }` | Cookie `refresh_token` (httpOnly, Secure, SameSite=Strict) |

Refresh token không được trả trong body JSON. Nó đến qua `Set-Cookie`.

## Luồng đăng nhập

```
POST /api/auth/login  { email, password }
   ▼
AuthService.validateUser(email, password)
   · tìm user theo email (chỉ isActive = true)
   · bcrypt.compare(password, passwordHash)
   · sai → 401 { code: "INVALID_CREDENTIALS" }
   ▼
Phát access token + refresh token
   ▼
200 { accessToken, user } + Set-Cookie: refresh_token=…
```

Phản hồi không bao giờ chứa `passwordHash`. `user` gồm `{ id, email, fullName, role }`.

## Luồng làm mới token

```
POST /api/auth/refresh   (cookie refresh_token tự gửi kèm)
   ▼
Đọc + verify refresh token từ cookie
   · thiếu/hỏng → 401 { code: "INVALID_REFRESH_TOKEN" }
   · kiểm tra tokenVersion khớp user (đã thu hồi thì chặn)
   ▼
200 { accessToken } + xoay vòng refresh token mới
```

Refresh token **được xoay vòng** mỗi lần dùng (rotation); token cũ bị vô hiệu.

## Luồng đăng xuất

```
POST /api/auth/logout
   ▼
Thu hồi: xóa cookie, tăng tokenVersion của user (vô hiệu mọi refresh token cũ)
   ▼
204
```

## Bảo vệ endpoint

`JwtAuthGuard` chạy toàn cục. Đánh dấu công khai bằng `@Public()`:

```ts
@Public()
@Post('login')
login(@Body() dto: LoginDto) { ... }
```

Guard đọc `Authorization: Bearer <accessToken>`, verify, gắn `request.user = { id, email, role }`.

## Phân quyền

Sau xác thực, `RolesGuard` kiểm tra `@Roles(...)`:

```ts
@Post()
@Roles(Role.ADMIN, Role.MANAGER)
create(@Body() dto: CreateEventDto) { ... }
```

Bảng vai trò: [`../../architecture/security.md`](../../architecture/security.md).

## Định dạng lỗi xác thực

| Trường hợp | Mã HTTP | `code` |
| --- | --- | --- |
| Thiếu access token | 401 | `UNAUTHORIZED` |
| Access token hết hạn/hỏng | 401 | `TOKEN_EXPIRED` / `INVALID_TOKEN` |
| Sai email/mật khẩu | 401 | `INVALID_CREDENTIALS` |
| Refresh token không hợp lệ | 401 | `INVALID_REFRESH_TOKEN` |
| Đúng token nhưng thiếu vai trò | 403 | `FORBIDDEN` |
| Tài khoản bị vô hiệu hóa | 401 | `ACCOUNT_INACTIVE` |

Xem thêm: [`error-handling.md`](./error-handling.md).

## Bảo mật liên quan

- Rate limit `POST /api/auth/login` để chống brute-force.
- Cookie refresh: `httpOnly`, `Secure`, `SameSite=Strict`.
- CORS chỉ mở cho origin frontend; bật credentials để cookie hoạt động.
- Access token không lưu `localStorage`.

## Đặc tả endpoint

Chi tiết request/response: [`endpoints/auth.md`](./endpoints/auth.md).
