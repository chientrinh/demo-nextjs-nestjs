# Frontend — Next.js (App Router)

Ứng dụng dashboard dựng trên nền **TailAdmin (Next.js free)**. Chạy ở cổng **3000**.

Nền tảng là TailAdmin; dự án **giữ nguyên** UI/layout/provider của nó và gom phần app-shared đó vào `src/shared/`, đồng thời tổ chức **toàn bộ logic nghiệp vụ theo module** trong `src/modules/`. Hạ tầng gọi backend tách riêng ở `src/adapters/infrastructures/` (ports & adapters).

Mô hình: **`app/` chỉ là lớp composition (route + page mỏng)**; mọi UI, type, schema, và truy cập dữ liệu của một tính năng nằm trong module tương ứng. Page chỉ *lắp ghép* các thành phần public mà module xuất ra.

## Cấu trúc thư mục

> **Khớp code hiện tại:** cây dưới đây là cấu trúc **mục tiêu**. Điểm lệch thực tế: mọi route nằm dưới `app/[locale]/` (next-intl `vi`/`en`); không có `modules/<x>/lib/`, `modules/shared/ui/PageHeader`, `labour/ui/labour-ledger/` (chưa triển khai), `adapters/infrastructures/repositories/`, `shared/utils/query-client.ts`; service events thực tế là `events.service.ts`; Theme/Sidebar/Auth/Token đều dùng **Zustand** (thêm `shared/token.ts`, `adapters/infrastructures/storage/`).

```
frontend/
├── src/
│   ├── app/                                # App Router — CHỈ route + page mỏng
│   │   ├── layout.tsx                      # Root: import shared/styles + bọc providers (Theme/Sidebar/Query/Auth)
│   │   ├── (full-width-pages)/
│   │   │   ├── layout.tsx                  # Layout không sidebar
│   │   │   └── login/page.tsx              # → import từ modules/auth
│   │   └── (admin)/
│   │       ├── layout.tsx                  # AppSidebar + AppHeader + main
│   │       ├── page.tsx                    # → import từ modules/analytics
│   │       └── forms/
│   │           ├── event-note/page.tsx     # → import từ modules/events
│   │           └── labour-cost/page.tsx    # → import từ modules/labour
│   │
│   ├── modules/                            # ← TOÀN BỘ LOGIC THEO TÍNH NĂNG
│   │   ├── auth/
│   │   │   ├── domain/                     # credentials, kiểu phiên, quy tắc xác thực
│   │   │   ├── data/                       # api.ts (login/refresh/logout) — chỉ HTTP
│   │   │   │   └── dtos/                   # (tùy chọn) chỉ khi hình dạng API khác domain
│   │   │   ├── application/
│   │   │   │   ├── services/auth.service.ts        # use-case: login/refresh/me/logout
│   │   │   │   └── store/session-provider.tsx      # AuthProvider, useAuth, kho access token
│   │   │   ├── lib/                        # tiện ích riêng của auth
│   │   │   ├── ui/
│   │   │   │   └── login-form/
│   │   │   │       ├── components/         # SignInForm, ...
│   │   │   │       ├── hooks/              # use-login.ts → gọi auth.service
│   │   │   │       ├── types.ts            # type riêng của UI (khác domain)
│   │   │   │       └── index.ts            # export public của khu vực
│   │   │   └── index.ts                    # API công khai của module
│   │   ├── analytics/
│   │   │   ├── domain/                     # WeeklyTrendDay, AnalyticsSummary, helper tuần
│   │   │   ├── data/                       # api.ts + dtos (tùy chọn) — chỉ HTTP
│   │   │   ├── application/services/analytics.service.ts  # use-case: weekly-trend, summary
│   │   │   ├── lib/
│   │   │   ├── ui/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── hooks/              # use-weekly-trend.ts, use-summary.ts → gọi service
│   │   │   │   ├── kpi-cards/{components,hooks,index.ts}
│   │   │   │   └── trend-chart/{components,hooks,index.ts}
│   │   │   └── index.ts
│   │   ├── events/
│   │   │   ├── domain/                     # EventAnnotation, eventNoteSchema (Zod)
│   │   │   ├── data/                       # api.ts + dtos (tùy chọn) — chỉ HTTP
│   │   │   ├── application/services/event.service.ts      # use-case: createEvent, listEvents
│   │   │   ├── lib/
│   │   │   ├── ui/
│   │   │   │   └── event-form/{components,hooks,types.ts,index.ts}
│   │   │   └── index.ts
│   │   ├── labour/
│   │   │   ├── domain/                     # LabourCost, labourCostSchema (Zod)
│   │   │   ├── data/                       # api.ts + dtos (tùy chọn) — chỉ HTTP
│   │   │   ├── application/services/labour.service.ts     # use-case: createLabourCost, listLabour
│   │   │   ├── lib/                        # hàm thuần riêng của module (nếu có)
│   │   │   ├── ui/
│   │   │   │   ├── labour-form/{components,hooks,index.ts}
│   │   │   │   └── labour-ledger/{components,hooks,index.ts}
│   │   │   └── index.ts
│   │   └── shared/                         # nghiệp vụ dùng chung ≥2 module
│   │       ├── domain/{enums.ts,labels.ts} # enum chung + nhãn tiếng Việt
│   │       ├── lib/format.ts               # formatUsd, formatCompactUsd, readEnglishAmount, formatNumber, formatDate
│   │       └── ui/                         # PageHeader (widget nghiệp vụ dùng chung ≥2 module)
│   │
│   ├── adapters/                           # LỚP HẠ TẦNG (ports & adapters) — giao tiếp ra ngoài
│   │   └── infrastructures/
│   │       ├── clients/HttpClient.ts       # axios instance (baseURL → NestJS API) + interceptors
│   │       ├── interfaces/IHttpClient.ts   # cổng HTTP: module không phụ thuộc axios
│   │       └── repositories/               # (tùy chọn) repository nói chuyện NestJS
│   ├── shared/                             # APP-SHARED — import từ mọi module (không nghiệp vụ)
│   │   ├── components/
│   │   │   ├── common/                     # Loader, ErrorState, EmptyState, PageBreadCrumb, ComponentCard
│   │   │   ├── layout/                     # AppSidebar, AppHeader, AppFooter, AdminLayout, FullWidthLayout
│   │   │   ├── ui/                         # primitive TailAdmin: button, badge, table, dropdown, modal, alert, avatar, images
│   │   │   ├── form/                       # Label, DefaultInputs, SelectInputs, RadioButtons, CurrencyInput
│   │   │   └── theme-toggle/               # nút sáng/tối
│   │   ├── constants/                      # env, routes (ROUTES), storage-keys
│   │   ├── hooks/                          # useMobile, useTheme
│   │   ├── providers/                      # ThemeProvider, SidebarProvider, QueryProvider
│   │   ├── styles/                         # index.css (Tailwind v4 @theme tokens + keyframes)
│   │   └── utils/                          # cn, errors (ApiError), logger, time, query-client
│   └── middleware.ts                       # bảo vệ route (dấu hiệu phiên)
├── public/
├── .env.local.example
└── package.json
```

`shared/` (app-shared), `modules/` và `adapters/` là cách dự án tổ chức lại; `app/` route group theo TailAdmin. Phân biệt ba chỗ "dùng chung":

- **`src/shared/`** — dùng chung **toàn app**, **không gắn nghiệp vụ**: UI primitive, hook, util, constant, style, provider.
- **`src/modules/shared/`** — **nghiệp vụ** dùng chung cho ≥2 module: enum, nhãn tiếng Việt, `format`.
- **`src/adapters/`** — hạ tầng giao tiếp backend (HTTP).

## Quy tắc module

Các luật dưới đây là **bắt buộc**; vi phạm sẽ bị nêu trong review.

1. **`app/` chỉ composition.** Page/route không chứa JSX nghiệp vụ phức tạp — nó import thành phần public từ module và truyền props. Logic ở lại trong module.
2. **Ranh giới import một chiều.** Ngoài module **chỉ** import qua barrel `modules/<feature>` (`index.ts`). Không import xuyên vào `modules/<feature>/ui/...` từ nơi khác.
3. **Thứ tự phụ thuộc trong module:** `ui → application → data → domain`. `ui` **không** gọi `data/` hay `axios` trực tiếp; luồng chuẩn là **`ui/<area>/hooks` → `application/services/*.service.ts` → `data/api.ts`**.
4. **`domain/` không phụ thuộc framework.** Chỉ type, enum, schema Zod, quy tắc nghiệp vụ. Không import React/Next/axios.
5. **`data/` chỉ làm HTTP.** `data/api.ts` gọi backend qua `httpClient` (hoặc repository trong `adapters/`) và trả domain type; **không** chứa hook React, không chứa use-case. `ui/` không bao giờ thấy `axios`.
6. **`application/services/` là tầng use-case.** Hook ở `ui/<area>/hooks` gọi **service** (`<feature>.service.ts`), **không** gọi thẳng `data/`. Service điều phối `data/api.ts`, áp quy tắc, và (nếu cần) ghi `application/store/`. Service **không** phụ thuộc React.
7. **`application/store/` cho client state.** Chỉ tạo khi state cần chia sẻ giữa nhiều component (ví dụ `session-provider.tsx`, một `<x>-store.ts`); state cục bộ một component để ngay trong component.
8. **`lib/` trong module** chỉ chứa hàm thuần của chính module đó (ví dụ một helper định dạng riêng; helper dùng chung ≥2 module đặt ở `modules/shared/lib/` như `readEnglishAmount`).
9. **`modules/shared/`** dành cho nghiệp vụ **≥2 module** dùng chung (enum, nhãn tiếng Việt, `format`); nếu chỉ một module dùng, để trong module đó.
10. **`shared/` (app-shared)** chỉ chứa thứ **không gắn nghiệp vụ** và dùng chung toàn app (UI primitive, hook, util, constant, style, provider); không nhét logic tính năng vào đây.
11. **Barrel `index.ts`** của module là hợp đồng công khai: chỉ export thứ bên ngoài được phép dùng.
12. **`adapters/infrastructures/` là ranh giới ra ngoài (ports & adapters).** Chỉ nơi đây khởi tạo `axios` (`clients/HttpClient.ts`), định nghĩa cổng `interfaces/IHttpClient.ts` và (nếu cần) `repositories/`. `domain/` và `ui/` không import `axios`; chỉ `data/` được dùng. Chi tiết: [`data-fetching.md`](./data-fetching.md).
13. **`shared/` import được từ mọi nơi, nhưng không phụ thuộc ngược.** `shared/` **không** import từ `modules/`, `app/` hay `adapters/`.
14. **`data/dtos/` là tùy chọn.** API trả `camelCase` khớp field Prisma, nên mặc định **không** tạo `dtos/`. Chỉ thêm khi hình dạng API khác type domain (envelope `{ data, meta }`, ép kiểu như `"YYYY-MM-DD"` → `Date`, đổi tên/gộp trường); khi đó `dtos/` là nơi duy nhất biết hình dạng thô. Chi tiết: [`data-fetching.md`](./data-fetching.md).

## Bản đồ route → module

| Route | Module (nguồn UI/logic) | Màn hình |
| --- | --- | --- |
| `/login` | `modules/auth` (`ui/login-form`) | Đăng nhập |
| `/` | `modules/analytics` (`ui/dashboard`) | Home / Revenue Analytics |
| `/forms/event-note` | `modules/events` (`ui/event-form`) | Ghi sự kiện |
| `/forms/labour-cost` | `modules/labour` (`ui/labour-form`, `ui/labour-ledger`) | Chi phí nhân công |

## Quy ước chung

- **App Router, server-first.** Trang đọc dữ liệu ban đầu ở server component nếu tiện; component tương tác (biểu đồ, form) là client component có `"use client"`.
- **Component không tự gọi fetch trong render.** Mọi truy cập API qua **service** ở `modules/<x>/application/services/`, được gọi từ hook ở `ui/<area>/hooks` (TanStack Query bọc trong hook).
- **Kiểu dữ liệu một nguồn.** Schema Zod sống ở `modules/<x>/domain/`, vừa validate form vừa suy ra type (`z.infer`); type khớp hợp đồng backend.
- **Không hardcode URL.** Base URL qua `env` (`shared/constants/env.ts`, đọc `NEXT_PUBLIC_API_URL`); đường dẫn route qua `ROUTES` (`shared/constants/routes.ts`).
- **Không lặp Tailwind class rườm rà.** Ưu tiên token design system (`shared/styles/index.css`) và component TailAdmin sẵn có; ghép class bằng `cn` (`shared/utils`).

## Provider

```
RootLayout (src/app/layout.tsx)
└── ThemeProvider           # shared/providers/theme-provider.tsx
    └── SidebarProvider     # shared/providers/sidebar-provider.tsx
        └── QueryProvider   # shared/providers/query-provider.tsx (client: shared/utils/query-client.ts)
            └── AuthProvider # ← modules/auth/application/store/session-provider.tsx
                └── {children}
```

`(admin)/layout.tsx` bọc `AppSidebar` + `AppHeader` (`shared/components/layout/`); `(full-width-pages)/layout.tsx` không sidebar (dùng cho Login).

## Chạy cục bộ

```bash
cd frontend
npm install
cp .env.local.example .env.local     # đặt NEXT_PUBLIC_API_URL
npm run dev                          # cổng 3000
```

## Script

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Build production |
| `npm run lint` | ESLint (Next) |
| `npm run test` | Unit/component test |

## Tài liệu liên quan

- Bản đồ route: [`routing.md`](./routing.md)
- Server state: [`state-management.md`](./state-management.md)
- Gọi API: [`data-fetching.md`](./data-fetching.md)
- Form & validate: [`forms-and-validation.md`](./forms-and-validation.md)
- Design tokens: [`../design/design-system.md`](../design/design-system.md)
- Kiểm thử: [`testing.md`](./testing.md)
