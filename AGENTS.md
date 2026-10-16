# AGENTS.md

## Trạng thái repo (đọc trước)

- Repo hiện **chỉ có tài liệu** — chưa có `frontend/`, `backend/`, `docker/`. `/docs` mô tả **layout monorepo mục tiêu**; code sẽ được dựng theo đó. Đừng giả định các thư mục đó đã tồn tại.
- Nguồn sự thật là `/docs`. Đọc [`docs/AGENT_INSTRUCTIONS.md`](docs/AGENT_INSTRUCTIONS.md) trước khi code bất cứ thứ gì — đó là bộ quy tắc bắt buộc (luật bất khả xâm phạm, chọn tài liệu theo việc, từ vựng, quy trình task).
- Tài liệu viết bằng **tiếng Việt**. Giữ tiếng Việt cho docs, commit body, nhãn UI; định danh code bằng tiếng Anh.
- Mockup gốc: `docs/design/*.html` + `docs/design/DESIGN.md`. Khi mockup mâu thuẫn tài liệu → **tài liệu thắng**.

## Lệnh (sau khi có `frontend/`/`backend/`)

Chạy trong thư mục tầng tương ứng: dev `npm run start:dev` (backend) / `npm run dev` (frontend); `npm run build`; `npm run lint`; `npm run test`; `npm run format`. Backend e2e: `npm run test:e2e`.

- Trước khi mở PR: `npm run lint` rồi `npm run test` (thứ tự này).
- Cổng dev: frontend `3000`, backend `3001` (tiền tố `/api`), Postgres `5432`. Swagger ở `/api/docs`, health ở `/api/health` và `/api/health/db`.
- DB: `docker network create bistro` + `docker compose -f docker/database/docker-compose.yml up -d`; backend: `npx prisma migrate dev` → `npx prisma generate` → `npm run seed` (tạo admin mẫu).
- Backend cần `JWT_SECRET` và `JWT_REFRESH_SECRET` **khác nhau**; thiếu thì fail-fast. Không commit `.env`.

## Git

- Base branch tài liệu ghi là `main`; **default branch thực tế của repo là `master`**.
- Nhánh: `feat/…`, `fix/…`, `docs/…`, `chore/…`. Commit theo conventional commits.
- `.agents/` được khai trong `.gitmodules` nhưng **bị `.gitignore` bỏ qua và chưa có gitlink** trong parent repo. Đừng `git add .agents` như thư mục thường; thao tác git của nó phải chạy **bên trong** `.agents`.
- `docs/design/*.html` và `docs/design/DESIGN.md` là nguồn thiết kế gốc — giữ nguyên, không "dọn dẹp".

## Quy ước dễ đoán sai

- **Đặt tên:** cột Postgres `snake_case`; field Prisma `camelCase` + `@map("snake_case")`; tên bảng `snake_case` số nhiều qua `@@map`; **JSON API `camelCase`** (khớp field Prisma). Frontend cũng `camelCase` → `data/dtos/` là **tùy chọn**, chỉ tạo khi hình dạng API khác type domain.
- **Tiền:** VND, **số nguyên**, đơn vị đồng. Prisma `Decimal @db.Decimal(15, 0)`; JSON là `number`.
- **Ngày:** date-only `YYYY-MM-DD`, Postgres kiểu `date`, **không** timezone.
- **ID:** UUID v4.
- **Enum:** API dùng `UPPER_SNAKE_CASE`; UI hiển thị nhãn tiếng Việt.
- **Xác thực:** chỉ `POST /api/auth/login` và `POST /api/auth/refresh` là công khai. Access token `camelCase` `accessToken` giữ **trong bộ nhớ** (không localStorage); refresh token cookie `refresh_token` httpOnly, có xoay vòng.
- **Phân quyền:** `ADMIN` + `MANAGER` được ghi; `ANALYST` chỉ đọc.
- **Lỗi:** quyết định hành vi theo `code` (enum), **không** so khớp `message`. Envelope: `statusCode`, `code`, `message`, `details`, `timestamp`, `path`.

## Kiến trúc

Backend NestJS: **controller mỏng, service dày**; DTO `class-validator` cho mọi input (`whitelist` + `forbidNonWhitelisted`); Prisma chỉ trong service; `passwordHash` không bao giờ ra response; guard theo thứ tự `JwtAuthGuard` → `RolesGuard` (`@Public()`, `@Roles(...)`).

Frontend luồng dữ liệu một chiều: **`ui/<area>/hooks` → `application/services/<feature>.service.ts` → `data/api.ts` → `adapters/infrastructures`** (axios ở `clients/HttpClient.ts`). Hook **không** gọi thẳng `data/`; `ui/`/`application/`/`domain/` không chạm `axios`; `app/` chỉ composition; import liên module chỉ qua barrel `modules/<feature>`. `src/shared/` = app-shared không gắn nghiệp vụ (không phụ thuộc ngược); `src/modules/shared/` = nghiệp vụ dùng chung ≥2 module.

## Ràng buộc nghiệp vụ (hay bị viết sai)

- `weeklyTrend` trả **đúng 7 ngày**, điền `0` cho ngày trống, gộp đúng theo nguồn.
- `summary.totalRevenue` = POS + EATCLUB; `averagePerDay` chia theo **số ngày lịch**.
- `amount`: revenue ≥ 0, labour > 0, event **cho phép âm**. Event `title` ≤ 80 ký tự.
- Unique `(entryDate, source)` → trùng thì trả `DUPLICATE_REVENUE_ENTRY`.

## Test bắt buộc

Đổi hành vi phải đổi test trong cùng PR. Bắt buộc có: `weeklyTrend` 7 ngày/điền 0; các quy tắc `amount` và `title` ≤ 80; trùng `(entryDate, source)`; `ANALYST` ghi → `403`; auth login/refresh/logout. Mock tại ranh giới (mạng, ApexCharts), không mock logic đang test; không snapshot toàn trang.

## Chọn tài liệu theo việc

Xem bảng trigger trong [`docs/AGENT_INSTRUCTIONS.md`](docs/AGENT_INSTRUCTIONS.md#chọn-tài-liệu-theo-việc-đang-làm). Nếu endpoint/schema bạn cần không có trong tài liệu → **dừng và hỏi**, hoặc cập nhật tài liệu trước; đổi cấu trúc dữ liệu phải kèm ADR mới (`docs/adr/`).
