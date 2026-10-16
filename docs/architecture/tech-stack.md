# Tech Stack

## Tổng hợp

| Tầng | Công nghệ | Phiên bản thực tế / mục tiêu |
| --- | --- | --- |
| Frontend framework | Next.js (App Router) | 16.x (16.3.4) |
| Frontend ngôn ngữ | TypeScript | 5.x |
| Frontend runtime | React | 19.x (19.2.8) |
| UI base | TailAdmin (Next.js free) | theo repo upstream |
| Styling | Tailwind CSS | 4.x (@tailwindcss/postcss) |
| Biểu đồ | ApexCharts (`react-apexcharts`) | 7.x / 2.x |
| Xuất báo cáo | `html-to-image` | 1.x (1.11.13) |
| Đa ngôn ngữ | `next-intl` | 4.x (4.14.2) |
| Form | React Hook Form + Zod | 7.x / 3.x |
| Server state | TanStack Query | 5.x |
| HTTP client | axios | 1.x |
| Backend framework | NestJS | 11.x |
| Backend ngôn ngữ | TypeScript | 5.x |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Xác thực | JWT (passport-jwt) + bcrypt | — |
| Validation | class-validator + class-transformer | — |
| Tài liệu API | Swagger (`@nestjs/swagger`) | — |
| Container | Docker + Docker Compose | — |

## Frontend

**Next.js App Router** — chọn vì TailAdmin bản Next.js dựng sẵn trên App Router, cho phép server component cho dữ liệu ban đầu và client component cho tương tác biểu đồ. Xem [`adr/0002-prisma-orm.md`](../adr/0002-prisma-orm.md) về ORM; quyết định Next.js đi kèm lựa chọn TailAdmin.

**TailAdmin** là bộ khung admin sẵn có: sidebar, header, card, form, table. Form Login bắt nguồn từ TailAdmin nhưng được chuyển vào module `auth` (`modules/auth/ui/login-form/`) (xem [`features/authentication/login.md`](../features/authentication/login.md)).

**ApexCharts** vẽ biểu đồ xu hướng (bar + spline), hỗ trợ annotation để ghim sự kiện lên trục thời gian — đúng với mockup `home.html` và `create-event.html`.

**html-to-image** chụp toàn bộ khu vực dashboard (KPI cards, biểu đồ cột có icon overlay, chú thích legend) thành ảnh PNG độ nét cao (xem [`adr/0006-html-to-image-dashboard-export.md`](../adr/0006-html-to-image-dashboard-export.md)).

**React Hook Form + Zod** cho form Event và Labour: schema Zod là nguồn validate duy nhất, dùng lại type suy ra (`z.infer`) cho payload API.

**TanStack Query** quản lý server state (fetch danh sách, cache, invalidate sau khi ghi) — tách khỏi UI state cục bộ.

**axios** là HTTP client duy nhất, khởi tạo một lần ở `src/adapters/infrastructures/clients/HttpClient.ts` (theo ports & adapters). Module nghiệp vụ nằm trong `src/modules/`; chỉ tầng `data/` của module chạm `adapters/`. Luồng dữ liệu là `ui/<area>/hooks → application/services → data/api.ts`. Xem [`frontend/data-fetching.md`](../frontend/data-fetching.md).

## Backend

**NestJS** — cấu trúc module rõ ràng, DI sẵn, phù hợp chia theo miền nghiệp vụ. Guard/Interceptor/Pipe cho xác thực, phân quyền, validate đầu vào.

**Prisma** — schema khai báo, type-safe, migration có version. Chọn thay vì TypeORM/query builder thô vì schema là nguồn sự thật cho cả database lẫn type ở tầng API (xem [`adr/0002-prisma-orm.md`](../adr/0002-prisma-orm.md)).

**JWT qua passport-jwt** — access token ngắn hạn + refresh token trong httpOnly cookie (xem [`adr/0003-jwt-passport-auth.md`](../adr/0003-jwt-passport-auth.md)).

## Database

**PostgreSQL 16** — quan hệ rõ ràng, kiểu `date` và `Decimal`, index tốt cho truy vấn theo khoảng ngày. Đơn vị lưu tiền: VND số nguyên (`Decimal(15,0)`).

## Hạ tầng

**Docker Compose**, tách riêng từng tầng (database, backend, frontend) theo quyết định tại [`adr/0005-docker-per-layer-compose.md`](../adr/0005-docker-per-layer-compose.md). Các service giao tiếp qua network `bistro`.

## Quy ước chung

- TypeScript `strict: true` ở cả hai tầng.
- ESLint + Prettier thống nhất (xem [`contributing/coding-standards.md`](../contributing/coding-standards.md)).
- Không có thư viện nào được thêm vào mà không cập nhật bảng trên và ghi lý do.

## Liên quan

- Vì sao monorepo: [`adr/0001-monorepo-layout.md`](../adr/0001-monorepo-layout.md)
- Biến môi trường từng tầng: [`operations/configuration.md`](../operations/configuration.md)
