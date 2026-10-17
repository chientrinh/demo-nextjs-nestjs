# The Demo Analytics — Dashboard phân tích doanh thu & chi phí nhân công

Đồ án cá nhân dùng để **ứng tuyển**. Monorepo đóng gói bằng **Docker**, gồm:

| Tầng | Công nghệ |
| --- | --- |
| Frontend | Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · next-intl (vi/en) |
| Backend | NestJS 12 · Prisma ORM · JWT + Passport |
| Database | PostgreSQL 16 |
| Hạ tầng | Docker Compose (tách riêng từng layer: database / backend / frontend) |

---

# Phần 1 — Hướng dẫn cài đặt demo lên máy local (Docker)

Toàn bộ demo chạy bằng **Docker Compose** — không cần cài Node/npm trên máy host. Mọi lệnh dưới đây chỉ cần **copy và dán** vào terminal.

## 1.1 Yêu cầu hệ thống

- **Docker Engine + Docker Compose v2** (mới nhất).
- **Git**.
- (Tuỳ chọn) Node.js ≥ 22 — chỉ cần nếu muốn chạy test ngoài Docker.

Kiểm tra Docker đã sẵn sàng:

```bash
docker --version
docker compose version
```

## 1.2 Clone mã nguồn

```bash
git clone https://github.com/chientrinh/demo-nextjs-nestjs.git the-demo
cd the-demo
```

> Kho lưu trữ: https://github.com/chientrinh/demo-nextjs-nestjs

## 1.3 Tạo mạng Docker (chạy 1 lần)

Ba service (database, backend, frontend) giao tiếp với nhau qua mạng tên `demo`:

```bash
docker network create demo
```

## 1.4 Cấu hình database

Tạo file `.env` cho Postgres (mật khẩu demo là `demo`):

```bash
cat > docker/database/.env <<'EOF'
POSTGRES_USER=demo
POSTGRES_PASSWORD=demo
POSTGRES_DB=demo
EOF
```

## 1.5 Cấu hình backend

Tạo file `.env` cho backend. **Lưu ý:** `DATABASE_URL` phải khớp `POSTGRES_PASSWORD` ở bước trên; hai `JWT_SECRET` phải **khác nhau**.

```bash
cat > docker/backend/.env <<'EOF'
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://demo:demo@database:5432/demo?schema=public
JWT_SECRET=dev-jwt-access-secret-demo-analytics-key-2026-min-32-chars
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-demo-analytics-key-2026-min-32-chars
CORS_ORIGIN=http://localhost:3000,http://frontend:3000
SEED_ADMIN_PASSWORD=admin123
SEED_MANAGER_PASSWORD=manager123
SEED_ANALYST_PASSWORD=analyst123
EOF
```

## 1.6 Dựng database

```bash
docker compose -f docker/database/docker-compose.yml up -d
```

Chờ vài giây để Postgres sẵn sàng (có healthcheck `pg_isready`).

## 1.7 Dựng backend

```bash
docker compose -f docker/backend/docker-compose.yml up -d
```

Lần đầu sẽ build image (cài dependencies). Sau khi xong, backend chạy ở chế độ watch (hot-reload) tại cổng **3001**.

## 1.8 Tạo bảng + nạp dữ liệu demo

```bash
docker compose -f docker/backend/docker-compose.yml exec backend npx prisma migrate deploy
docker compose -f docker/backend/docker-compose.yml exec backend npm run seed
```

Lệnh thứ hai tạo **3 tài khoản demo** và **3 tuần dữ liệu** doanh thu/chi phí mẫu.

## 1.9 Dựng frontend

```bash
docker compose -f docker/frontend/docker-compose.yml up -d
```

Frontend chạy tại cổng **3000**.

## 1.10 Truy cập & tài khoản demo

| Thành phần | URL |
| --- | --- |
| Dashboard (frontend) | http://localhost:3000 |
| REST API (backend) | http://localhost:3001/api |
| Swagger UI | http://localhost:3001/api/docs |
| Health check | http://localhost:3001/api/health |

**Tài khoản demo:**

| Email | Mật khẩu | Vai trò | Quyền |
| --- | --- | --- | --- |
| admin@demo.local | admin123 | ADMIN | Đọc + ghi + quản lý người dùng |
| manager@demo.local | manager123 | MANAGER | Đọc + ghi |
| analyst@demo.local | analyst123 | ANALYST | Chỉ đọc |

> **Về dữ liệu demo:** seed tạo dữ liệu cho khoảng ngày **2026-10-05 → 2026-10-24** (tuần mốc 2026-10-12 có tổng doanh thu $16,110, khớp mockup thiết kế). Nếu mở dashboard thấy trống (do ngày hiện tại nằm ngoài khoảng đó), truy cập URL có tham số tuần để xem dữ liệu mẫu:

```
http://localhost:3000/?week=2026-10-12
```

## 1.11 Kiểm tra nhanh

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
```

## 1.12 Xem log

```bash
docker compose -f docker/database/docker-compose.yml logs -f database
docker compose -f docker/backend/docker-compose.yml logs -f backend
docker compose -f docker/frontend/docker-compose.yml logs -f frontend
```

## 1.13 Dừng / dọn dẹp

```bash
# Dừng tất cả (giữ nguyên dữ liệu trong volume)
docker compose -f docker/frontend/docker-compose.yml down
docker compose -f docker/backend/docker-compose.yml down
docker compose -f docker/database/docker-compose.yml down

# Dừng và XÓA toàn bộ dữ liệu (cẩn thận)
docker compose -f docker/database/docker-compose.yml down -v
```

## 1.14 Khắc phục sự cố thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `network demo not found` | Chạy `docker network create demo` trước |
| Cổng 3000/3001/5432 đã bị chiếm | `docker ps` tìm và dừng tiến trình cũ, hoặc đổi cổng trong compose |
| Backend báo lỗi kết nối DB | Kiểm tra `DATABASE_URL` trong `docker/backend/.env` khớp `POSTGRES_PASSWORD` trong `docker/database/.env` |
| Build lần đầu lâu | Bình thường — image đang cài dependencies; lần sau dùng cache |
| Frontend báo lỗi CORS | Đảm bảo `CORS_ORIGIN` chứa origin `http://localhost:3000` |

---

# Phần 2 — Giới thiệu dự án

## 2.1 Bài toán

The Demo là hệ thống dashboard cho **ban điều hành nhà hàng**, giúp trả lời ngay trong một màn hình:

- Tuần này doanh thu bao nhiêu, đến từ đâu (bán tại quầy `POS` hay app đối tác `EATCLUB`)?
- Chi phí nhân công theo ngày là bao nhiêu?
- Sự kiện/bán hàng nào đang ảnh hưởng đến biến động doanh thu?

Thay vì gộp sổ sách cuối ngày, hệ thống ghi **từng giao dịch bán hàng / sự kiện** và **từng khoản chi phí nhân công**, rồi tổng hợp lên biểu đồ tuần — đảm bảo "một nguồn, một chỗ".

## 2.2 Các tính năng đã hoàn thiện

- **Đăng nhập / khôi phục phiên:** JWT access token (15 phút) + refresh token (7 ngày) xoay vòng; tải lại trang tự khôi phục phiên qua refresh token; hiển thị loading toàn trang tới khi có token.
- **Phân quyền 3 vai trò:** `ADMIN` / `MANAGER` được ghi; `ANALYST` chỉ đọc (backend chặn bằng guard, frontend ẩn nút).
- **Home / Revenue Analytics:** KPI (Total Revenue, Average per Day, Total Covers) + biểu đồ tuần 3 chuỗi (POS, Eatclub, Labour) với annotation sự kiện; so sánh tuần trước; **Export PNG** toàn bộ báo cáo.
- **Ghi sự kiện / bán hàng** (`/forms/event-note`): form với quick-fill presets, validate title ≤ 80, amount ≥ 0.
- **Ghi chi phí nhân công** (`/forms/labour-cost`): form validate amount > 0, hiển thị **đọc số tiền thành chữ** tiếng Anh để giảm sai sót.
- **Đa ngôn ngữ:** giao diện `vi` / `en` (next-intl), giữ locale khi điều hướng.
- **Theme sáng/tối** (Tailwind dark mode).
- **Swagger UI** cho API; **health check** DB.

## 2.3 Kiến trúc

Monorepo 3 tầng, mỗi tầng một Docker image riêng:

```
the-demo/
├── frontend/        # Next.js 16 — UI, theo kiến trúc module + ports & adapters
├── backend/         # NestJS 12 — REST API, controller → service → repository → Prisma
├── docker/          # Dockerfile + docker-compose cho từng layer
└── docs/            # Đặc tả, ADR, thiết kế (nguồn sự thật của dự án)
```

**Frontend** tổ chức theo module (`src/modules/<feature>/`):

```
ui/<area>/hooks (TanStack Query) → application/services → data/api.ts → adapters/infrastructures (axios)
```

- `app/` chỉ composition; logic nằm trong `modules/`.
- App-shared (`src/shared/`): UI primitive, provider, util, constant.
- Hạ tầng HTTP tách riêng ở `src/adapters/` (ports & adapters) — module không phụ thuộc axios.

**Backend** theo quy tắc *controller mỏng, service dày, repository cô lập DB*:

```
Controller → Service → Repository → PrismaService → PostgreSQL
```

- DTO `class-validator` cho mọi input (`whitelist` + `forbidNonWhitelisted`).
- `JwtAuthGuard` → `RolesGuard` chạy theo thứ tự; `@Public()`, `@Roles(...)`.
- Mọi lỗi trả về **một envelope duy nhất**, client quyết định hành vi theo `code` (không so khớp `message`).

## 2.4 Các API chính

| Method | Endpoint | Ghi chú |
| --- | --- | --- |
| POST | `/api/auth/login` | Công khai — trả accessToken + user |
| POST | `/api/auth/refresh` | Công khai — xoay vòng refresh token, trả accessToken + user |
| POST | `/api/auth/logout` | Thu hồi phiên |
| GET | `/api/auth/me` | Hồ sơ người dùng hiện tại |
| GET/POST | `/api/users`, GET/PATCH `/api/users/:id` | Quản lý người dùng (ADMIN) |
| GET/POST | `/api/events`, GET/PATCH/DELETE `/api/events/:id` | Bán hàng / sự kiện |
| GET/POST | `/api/labour`, GET/PATCH/DELETE `/api/labour/:id` | Chi phí nhân công |
| GET | `/api/analytics/weekly-trend` | Biểu đồ tuần (7 ngày, điền 0) |
| GET | `/api/analytics/summary` | KPI tổng hợp |
| GET | `/api/health`, `/api/health/db` | Health check |

## 2.5 Những điểm kỹ thuật nổi bật 

- **Refresh token rotation + `tokenVersion`:** mỗi lần refresh xoay vòng refresh token; logout/đổi mật khẩu tăng `tokenVersion` để **vô hiệu mọi refresh token cũ**. Access token giữ **trong bộ nhớ** (không localStorage) → giảm rủi ro XSS.
- **Xử lý lỗi theo `code`:** envelope `{ statusCode, code, message, details, timestamp, path }` với `code` ổn định (`VALIDATION_ERROR`, `DUPLICATE_EMAIL`, `FORBIDDEN`…), client lập trình theo `code` thay vì so khớp chuỗi.
- **Repository cô lập DB:** `PrismaService` chỉ inject trong tầng repository; service thuần logic → dễ test, dễ thay hạ tầng.
- **Tổng hợp analytics đúng đặc tả:** `weekly-trend` trả **đúng 7 ngày** và điền `0` cho ngày trống; `summary.averagePerDay` chia theo **số ngày lịch**; tiền là **USD số nguyên** (Decimal(15,0)).
- **Quản lý state rõ ràng ở frontend:** TanStack Query cho server state, **Zustand** cho auth/token/theme/sidebar, `useState` cho UI state cục bộ.
- **Validate một nguồn:** schema **Zod** ở frontend (suy type bằng `z.infer`) + `class-validator` ở backend; `title ≤ 80` được thực thi cả 3 lớp (Zod → DTO → độ dài cột DB).
- **i18n + dark mode + RTL-ready:** giao diện hai ngôn ngữ, class-based dark mode, dùng CSS logical properties.
- **Unit test:** backend 33 test, frontend 26 test (Vitest) — chi tiết ở mục 2.6.

## 2.6 Testing

```bash
# Backend (33 test)
cd backend
npm run test

# Frontend (26 test)
cd frontend
pnpm test
```

Phạm vi test:

- **Backend:** `AnalyticsService` (7 ngày / điền 0 / KPI), `RolesGuard` (ANALYST bị 403), `JwtAuthGuard` (bỏ qua endpoint public), `AuthService` (login/refresh/logout), DTO validation, env validation.
- **Frontend:** hàm thuần `formatUsd`/`readEnglishAmount`/`canWrite` và schema Zod (`event`, `labour`, `login`).

## 2.7 Tài liệu

Toàn bộ đặc tả, hợp đồng API, mô hình dữ liệu và ADR nằm trong thư mục [`docs/`](docs/README.md):

- [`docs/architecture/`](docs/architecture) — kiến trúc, luồng dữ liệu, bảo mật.
- [`docs/backend/api/`](docs/backend/api) — hợp đồng API + mã lỗi.
- [`docs/backend/database/`](docs/backend/database) — mô hình dữ liệu, migration.
- [`docs/frontend/`](docs/frontend) — cấu trúc, routing, state, data fetching.
- [`docs/adr/`](docs/adr) — biên bản quyết định kiến trúc (0001–0008).

---

## Giấy phép

Dự án cá nhân dùng để ứng tuyển và học tập.
