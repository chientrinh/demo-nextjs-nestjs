# Endpoints — Xác thực & Người dùng

Base: `/api`. Luồng xác thực: [`../authentication.md`](../authentication.md).

## `POST /api/auth/login` — Công khai

Đăng nhập, trả access token và đặt cookie refresh token.

**Request**

```json
{ "email": "manager@thebistro.vn", "password": "S3cret!pass" }
```

| Field | Kiểu | Ràng buộc |
| --- | --- | --- |
| `email` | string | email hợp lệ, ≤ 255 |
| `password` | string | bắt buộc (không ràng buộc độ dài ở DTO) |

**Response `200`**

```json
{
  "accessToken": "eyJhbGciOi…",
  "user": {
    "id": "b3f1…", "email": "manager@thebistro.vn",
    "fullName": "Nguyễn Văn A", "role": "MANAGER",
    "isActive": true, "tokenVersion": 23,
    "createdAt": "2026-01-04T02:00:00.000Z", "updatedAt": "2026-01-04T02:00:00.000Z"
  }
}
```

Header kèm `Set-Cookie: refresh_token=…; HttpOnly; Secure; SameSite=Lax; Path=/api/auth`.

**Lỗi:** `400 VALIDATION_ERROR`, `401 INVALID_CREDENTIALS`, `401 ACCOUNT_INACTIVE`, `429 RATE_LIMITED`.

---

## `POST /api/auth/refresh` — Công khai

Dùng cookie refresh token để cấp access token mới. Xoay vòng refresh token.

**Request:** không body (cookie tự gửi).

**Response `200`**

```json
{
  "accessToken": "eyJhbGciOi…",
  "user": {
    "id": "cd70004b-19ac-46ff-a9a8-f7af3d544c63",
    "email": "admin@bistro.local",
    "fullName": "Quản trị viên",
    "role": "ADMIN",
    "isActive": true,
    "tokenVersion": 23,
    "createdAt": "2026-10-17T07:06:22.221Z",
    "updatedAt": "2026-10-17T13:08:58.948Z"
  }
}
```

Kèm `Set-Cookie` refresh token mới. Trả về luôn `user` nên client không cần gọi thêm `GET /api/auth/me`.

**Lỗi:** `401 INVALID_REFRESH_TOKEN`.

---

## `POST /api/auth/logout` — Cần xác thực

Thu hồi phiên: vô hiệu refresh token, xóa cookie.

**Response:** `200` với body `{ "success": true }`.

---

## `GET /api/auth/me` — Cần xác thực

Trả hồ sơ người dùng đang đăng nhập.

**Response `200`**

```json
{ "user": { "id": "b3f1…", "email": "manager@thebistro.vn", "fullName": "Nguyễn Văn A", "role": "MANAGER", "isActive": true, "tokenVersion": 23, "createdAt": "2026-01-04T02:00:00.000Z", "updatedAt": "2026-01-04T02:00:00.000Z" } }
```

---

## `GET /api/users` — ADMIN

Danh sách người dùng (không gồm `passwordHash`).

**Query:** không hỗ trợ lọc/phân trang (trả mảng phẳng).

**Response `200`**

```json
[
  { "id": "b3f1…", "email": "manager@thebistro.vn", "fullName": "Nguyễn Văn A", "role": "MANAGER", "isActive": true, "tokenVersion": 23, "createdAt": "2026-01-04T02:00:00.000Z", "updatedAt": "2026-01-04T02:00:00.000Z" }
]
```

---

## `POST /api/users` — ADMIN

Tạo người dùng.

**Request**

```json
{ "email": "analyst@thebistro.vn", "password": "S3cret!pass", "fullName": "Trần Thị B", "role": "ANALYST" }
```

| Field | Kiểu | Ràng buộc |
| --- | --- | --- |
| `email` | string | email hợp lệ, duy nhất |
| `password` | string | ≥ 12 ký tự, đủ độ phức tạp (băm bcrypt trước khi lưu) |
| `fullName` | string | 1–120 ký tự |
| `role` | enum | `ADMIN` \| `MANAGER` \| `ANALYST` |

**Response `201`:** đối tượng user (không có `passwordHash`).

**Lỗi:** `400 VALIDATION_ERROR`, `409 DUPLICATE_EMAIL`.

---

## `PATCH /api/users/:id` — ADMIN

Cập nhật hồ sơ, vai trò, trạng thái hoặc mật khẩu.

**Request (một phần)**

```json
{ "role": "MANAGER", "isActive": false }
```

Mọi field tùy chọn; gửi `password` để đổi mật khẩu. **Response `200`:** user đã cập nhật.

**Lỗi:** `400`, `404 NOT_FOUND`.

---

## `GET /api/users/:id` — ADMIN

Trả một user theo id.

**Response `200`:** đối tượng user (không có `passwordHash`). **Lỗi:** `404 NOT_FOUND`.

---

> **Ghi chú:** không có `DELETE /api/users/:id`. Vô hiệu hóa user bằng `PATCH /api/users/:id` với `isActive: false` để bảo toàn `createdById` của dữ liệu tài chính.
