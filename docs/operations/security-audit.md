# Báo cáo Security Audit — The Bistro Analytics

- **Ngày thực hiện:** 2026-10-17
- **Bản code:** nhánh `master`
- **Phạm vi:** `docker/*`, `backend/src/*`, `frontend/src/*`, cấu hình phụ thuộc (package.json), `.gitignore`/`.dockerignore`, secret trong git.
- **Ngoài phạm vi:** pentest hạ tầng mạng, WAF, reverse proxy, CI/CD.

Kết quả: **3 HIGH — 10 MEDIUM — 8 LOW**, cùng danh sách kiểm soát đã đạt chuẩn.

---

## 🔴 HIGH

### H1 — Postgres phơi ra mọi interface + mật khẩu mặc định

- **Vị trí:** `docker/database/docker-compose.yml:9-10` (`- "5432:5432"`), `:6-8` (`POSTGRES_PASSWORD: bistro`).
- **Bằng chứng:** `docker ps` → `0.0.0.0:5432->5432/tcp` (container `bistro-database`).
- **Tác động:** DB truy cập được từ ngoài máy với cặp creds đoán được (`bistro/bistro`) → đọc/ghi toàn bộ dữ liệu.
- **Cách sửa:** chỉ bind localhost và đưa mật khẩu vào biến môi trường:

  ```yaml
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-bistro}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
    POSTGRES_DB: ${POSTGRES_DB:-bistro}
  ports:
    - "127.0.0.1:5432:5432"
  ```

### H2 — Access token lưu trong `localStorage` (XSS ⇒ chiếm phiên)

- **Vị trí:** `frontend/src/modules/auth/data/api.ts:38,48`; `frontend/src/adapters/infrastructures/clients/HttpClient.ts:10-46` (key `bistro_auth_session` + key legacy `"token"`); `frontend/src/modules/auth/application/store/session-provider.tsx:53-54`.
- **Tác động:** trái với `AGENTS.md` ("access token camelCase `accessToken` giữ **trong bộ nhớ**, không localStorage"). Bất kỳ XSS nào cũng đọc được access token; refresh cookie là `httpOnly` nhưng kẻ tấn công vẫn dùng được access token trong 15 phút.
- **Cách sửa:** chỉ giữ access token trong bộ nhớ (biến module/zustand), chỉ persist phần `user` không nhạy cảm; bỏ hẳn key `"token"` legacy.

### H3 — Không có rate limiting

- **Vị trí:** `backend/package.json` thiếu `@nestjs/throttler`; `backend/src/main.ts` và `backend/src/app.module.ts` không đăng ký throttler/`helmet`.
- **Bằng chứng:** `ERROR_CODES.rateLimited` (`backend/src/common/constants/error-codes.ts`) và nhánh map 429 trong `http-exception.filter.ts:86-87` đã tồn tại nhưng chưa bao giờ được kích hoạt.
- **Tác động:** brute-force `POST /api/auth/login`, DoS endpoint nặng.
- **Cách sửa:**

  ```ts
  // app.module.ts
  ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

  // auth.controller.ts
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  ```

---

## 🟠 MEDIUM

### M1 — `/api/health/db` rò rỉ `error.message` công khai

- **Vị trí:** `backend/src/health/health.controller.ts:37-42` (endpoint `@Public()`).
- **Tác động:** lộ chi tiết kết nối/nội bộ CSDL cho người chưa xác thực.
- **Cách sửa:** trả `database: 'disconnected'` chung chung, ghi log chi tiết ở server.

### M2 — Exception filter rò rỉ lỗi 500 thô

- **Vị trí:** `backend/src/common/filters/http-exception.filter.ts:50-59` (`message = exception.message` cho mọi non-HttpException, gồm lỗi Prisma/stack).
- **Cách sửa:** với `status >= 500`, luôn trả message chung; log `exception` server-side.

### M3 — `pageSize` không giới hạn (DoS)

- **Vị trí:** `backend/src/events/dto/query-event.dto.ts:38-43`, `backend/src/labour/dto/query-labour.dto.ts:38-43` (chỉ `@Min(1)`, dùng trực tiếp làm `take`).
- **Cách sửa:** thêm `@Max(100)`.

### M4 — Refresh token không xoay vòng thực sự

- **Vị trí:** `backend/src/auth/auth.service.ts:62-102`.
- **Tác động:** `refresh()` phát token mới nhưng giữ nguyên `tokenVersion`; refresh token cũ vẫn hợp lệ tới hết hạn 7 ngày và không revoke được riêng lẻ.
- **Cách sửa:** tăng `tokenVersion` khi refresh (single-session) hoặc lưu hash refresh token + revoke khi dùng, hoặc xoay vòng theo `jti`.

### M5 — Swagger `/api/docs` công khai ở production

- **Vị trí:** `backend/src/main.ts:54-63` (mount không điều kiện theo `NODE_ENV`).
- **Tác động:** lộ toàn bộ bề mặt API + schema.
- **Cách sửa:** chỉ mount khi `NODE_ENV !== 'production'`, hoặc bọc sau xác thực.

### M6 — Container chạy với quyền root

- **Vị trí:** `docker/backend/Dockerfile`, `docker/frontend/Dockerfile` (không có chỉ thị `USER`).
- **Cách sửa:** tạo user non-root và `USER node` ở stage runtime.

### M7 — JWT secret mặc định hardcode

- **Vị trí:** `docker/backend/docker-compose.yml:17-18` (`${JWT_SECRET:-super-secret-jwt-access-key-bistro-2026}`, tương tự refresh secret).
- **Cách sửa:** bỏ giá trị mặc định, bắt buộc env (`JWT_SECRET: ${JWT_SECRET:?required}`) — như `docker/backend/docker-compose.prod.yml` đã làm đúng.

### M8 — Tài khoản seed mật khẩu cố định

- **Vị trí:** `backend/prisma/seed.ts:56` (`Admin@123456`), `:70` (`Manager@123456`).
- **Tác động:** thông tin đăng nhập mặc định đã biết nếu seed chạy ở môi trường dùng thật.
- **Cách sửa:** lấy mật khẩu từ env, buộc đổi ở lần đăng nhập đầu, không seed ở production.

### M9 — Event `amount` cho phép số âm

- **Vị trí:** `backend/src/events/dto/create-event.dto.ts:30-31`, `backend/src/events/dto/update-event.dto.ts:32-34` (chỉ `@IsInt`); `backend/src/events/events.service.ts:46-60` không kiểm.
- **Tác động:** trái quy tắc nghiệp vụ "`amount`: event ≥ 0 (không cho phép số âm)"; labour đã đúng với `@Min(1)`.
- **Cách sửa:** thêm `@Min(0)` cho cả DTO create/update.

### M10 — Chính sách mật khẩu yếu

- **Vị trí:** `backend/src/users/dto/create-user.dto.ts:13`, `backend/src/users/dto/update-user.dto.ts:13` (`@MinLength(6)`, không ràng buộc độ phức tạp).
- **Cách sửa:** nâng tối thiểu 8–12 ký tự + `@Matches` cho độ phức tạp.

---

## 🟡 LOW

| # | Vị trí | Vấn đề | Cách sửa |
| --- | --- | --- | --- |
| L1 | `.gitignore` (gốc) | Thiếu `*.pem`, `*.key` | Thêm vào `.gitignore` |
| L2 | `docker/backend/Dockerfile:6` | Stage `deps` dùng `npm install` thay `npm ci` (không tái lập, gồm devDeps) | Dùng `npm ci` |
| L3 | `backend/src/main.ts` | Thiếu `helmet` / `x-powered-by` (thiếu security headers) | Thêm `helmet()`, `app.disable('x-powered-by')` |
| L4 | `frontend/src/modules/auth/data/api.ts:16` | `tokenVersion` lộ ra client | Không trả field này |
| L5 | `backend/src/auth/auth.service.ts:39-43` | Login phân biệt `accountInactive` vs `invalidCredentials` → xác nhận email tồn tại | Trả cùng một lỗi chung |
| L6 | `backend/src/auth/auth.controller.ts:41` | `/auth/refresh` nhận cả `req.body.refreshToken` | Chỉ nhận cookie |
| L7 | `docker/backend/docker-compose.prod.yml:9`, `docker/frontend/docker-compose.prod.yml:10` | Phơi `3001:3001` / `3000:3000` trên mọi interface | Bind `127.0.0.1` hoặc đặt sau reverse proxy |
| L8 | `backend/src/users/dto/*.ts` | `fullName` thiếu `@MaxLength` | Thêm giới hạn độ dài |

---

## ✅ Kiểm soát đã đạt chuẩn

- Không SQL injection: chỉ có `$queryRaw` dạng tagged template (`health.controller.ts:31`), không ghép chuỗi truy vấn.
- Không có `dangerouslySetInnerHTML` / `innerHTML` trong `frontend/src`.
- `passwordHash` luôn bị loại khỏi response qua `UsersService.sanitize`.
- JWT fail-fast khi thiếu secret và bắt buộc `JWT_SECRET !== JWT_REFRESH_SECRET` (`main.ts:14-20`, `auth.service.ts:21-28`).
- `ValidationPipe` với `whitelist` + `forbidNonWhitelisted` + `transform` (`main.ts:43-49`).
- CORS allowlist từ `CORS_ORIGIN` + `credentials: true` (`main.ts:31-40`).
- Refresh cookie: `httpOnly`, `secure` ở production, `SameSite=lax`, `path=/api/auth` (`auth.controller.ts:22-28`).
- Thứ tự guard `JwtAuthGuard → RolesGuard` đăng ký global đúng (`app.module.ts:23-32`); `@Roles` áp ở cấp controller cho `users`.
- Không có secret bị track trong git: chỉ `backend/.env.example`; `backend/.env` tồn tại nhưng không được track.

---

## Thứ tự khắc phục đề xuất

1. **H1 → H3 → H2** — sửa nhanh, tác động lớn (lộ DB, brute-force, chiếm phiên).
2. **M3 · M9 · M1 · M2** — chỉnh DTO/filter, phạm vi nhỏ.
3. Còn lại theo sprint kèm test tương ứng (theo `AGENTS.md`: đổi hành vi phải đổi test trong cùng PR).
