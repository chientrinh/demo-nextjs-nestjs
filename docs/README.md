# Tài liệu dự án The Bistro Analytics

Bộ tài liệu này là **nguồn sự thật duy nhất (single source of truth)** cho dự án *The Bistro Analytics* — hệ thống dashboard phân tích doanh thu và chi phí nhân công cho nhà hàng, xây dựng trên nền TailAdmin.

Mọi thay đổi về kiến trúc, API, database hay tính năng phải được phản ánh vào đây trước hoặc cùng lúc với code.

## Đọc gì trước?

| Bạn là | Bắt đầu tại |
| --- | --- |
| **AI Agent** cần code | [`AGENT_INSTRUCTIONS.md`](./AGENT_INSTRUCTIONS.md) — bộ quy tắc bắt buộc |
| Người mới tham gia dự án | [`architecture/system-overview.md`](./architecture/system-overview.md) |
| Backend developer | [`backend/README.md`](./backend/README.md) |
| Frontend developer | [`frontend/README.md`](./frontend/README.md) |
| Designer / UI | [`design/design-system.md`](./design/design-system.md) |
| DevOps | [`operations/docker-backend.md`](./operations/docker-backend.md) |
| Product / QA | [`features/README.md`](./features/README.md) |

## Bản đồ tài liệu

```
docs/
├── README.md                  # (bạn đang ở đây) Index tổng
├── AGENT_INSTRUCTIONS.md      # 🤖 Quy tắc tối thượng cho AI Agent
│
├── architecture/              # Hệ thống được lắp ghép thế nào
│   ├── system-overview.md     # Bức tranh tổng thể, các tầng
│   ├── tech-stack.md          # Stack & lý do chọn
│   ├── data-flow.md           # Dữ liệu chảy qua hệ thống
│   ├── integrations.md        # Tích hợp bên ngoài (POS, Eatclub)
│   └── security.md            # Xác thực, phân quyền, bảo mật
│
├── backend/                   # NestJS API & Database
│   ├── README.md              # Cấu trúc module, quy ước
│   ├── database/              # PostgreSQL + Prisma
│   │   ├── schema.md          # Mô hình dữ liệu đầy đủ
│   │   ├── migrations.md      # Quy trình migration
│   │   └── indexing.md        # Chiến lược index & hiệu năng
│   ├── api/                   # Hợp đồng API
│   │   ├── overview.md        # Quy ước chung, versioning
│   │   ├── authentication.md  # Luồng JWT
│   │   ├── error-handling.md  # Định dạng lỗi chuẩn
│   │   └── endpoints/         # Đặc tả từng nhóm endpoint
│   │       ├── auth.md
│   │       ├── analytics.md
│   │       ├── events.md
│   │       └── labour.md
│   └── testing.md             # Chiến lược kiểm thử backend
│
├── frontend/                  # Next.js App Router
│   ├── README.md              # Cấu trúc thư mục, quy ước
│   ├── routing.md             # Sơ đồ route
│   ├── state-management.md    # Server state vs UI state
│   ├── data-fetching.md       # Gọi API, cache, revalidate
│   ├── forms-and-validation.md# React Hook Form + Zod
│   ├── components/            # Đặc tả component tái sử dụng
│   │   ├── layout-shell.md
│   │   ├── kpi-cards.md
│   │   └── charts.md
│   └── testing.md             # Chiến lược kiểm thử frontend
│
├── design/                    # Hệ thống thiết kế & UI/UX
│   ├── design-system.md       # Tokens, màu, chữ (nguồn: DESIGN.md)
│   ├── components.md          # Thư viện UI component
│   ├── responsive.md          # Breakpoint & hành vi
│   └── accessibility.md       # Tiêu chuẩn a11y
│
├── features/                  # Đặc tả nghiệp vụ theo tính năng
│   ├── README.md
│   ├── authentication/
│   │   └── login.md
│   ├── revenue-analytics/
│   │   └── home.md
│   ├── events/
│   │   └── create-event.md
│   └── labour-cost/
│       └── create-labour-cost.md
│
├── adr/                       # Architecture Decision Records
│   ├── README.md
│   ├── template.md
│   └── 0001..0008
│
├── operations/                # Vận hành & DevOps
│   ├── environments.md
│   ├── docker-backend.md      # Docker riêng cho backend
│   ├── docker-frontend.md     # Docker riêng cho frontend
│   ├── docker-database.md     # Docker riêng cho database
│   ├── configuration.md
│   ├── database-migrations.md
│   ├── monitoring.md
│   ├── security-audit.md
│   └── troubleshooting.md
│
└── contributing/              # Quy trình đóng góp
    ├── development-setup.md
    ├── coding-standards.md
    ├── testing-guidelines.md
    └── pull-request.md
```

## Cấu trúc source code tương ứng

Toàn bộ code nằm trong một monorepo. Tài liệu ở đây mô tả chính xác layout này.

| Thư mục | Nội dung | Tài liệu |
| --- | --- | --- |
| `frontend/` | Next.js App Router (TailAdmin base) | [`frontend/`](./frontend/README.md) |
| `backend/` | NestJS API + Prisma | [`backend/`](./backend/README.md) |
| `docker/` | Compose & Dockerfile tách theo từng tầng | [`operations/`](./operations/environments.md) |
| `docs/design/` | Mockup HTML gốc + `DESIGN.md` | [`design/`](./design/design-system.md) |

## Bản đồ tài liệu gốc (mockup)

Các file trong `docs/design/` là **nguồn thiết kế gốc**, không phải tài liệu kỹ thuật:

- `docs/design/DESIGN.md` — design tokens (đã được tái cấu trúc vào [`design/design-system.md`](./design/design-system.md)).
- `docs/design/home.html` — mockup trang Home / Revenue Analytics.
- `docs/design/create-event.html` — mockup form Event & Note.
- `docs/design/create-labour-cost.html` — mockup form Labour Cost Tracker.

Khi mockup và tài liệu mâu thuẫn, **tài liệu trong `/docs` thắng**, và mockup được cập nhật lại cho khớp.
