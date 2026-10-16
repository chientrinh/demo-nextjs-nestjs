# Tổng quan hệ thống

## Sản phẩm là gì?

**The Bistro Analytics** là dashboard web cho ban điều hành nhà hàng: theo dõi doanh thu theo ngày từ hai nguồn (POS tại quầy và app đối tác Eatclub), theo dõi chi phí nhân công, và ghim các sự kiện ảnh hưởng lên biểu đồ để giải thích biến động. Giao diện dựng trên nền TailAdmin.

## Kiến trúc tầng

Hệ thống gồm ba tầng chạy độc lập, giao tiếp qua HTTP:

```
┌─────────────────────────────────────────────────────────────┐
│  Người dùng (trình duyệt)                                     │
│  Admin · Manager · Analyst                                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG FRONTEND — Next.js (App Router)          cổng 3000     │
│  · TailAdmin shell: Sidebar + Header + Main                   │
│  · ApexCharts (biểu đồ), React Hook Form + Zod (form)         │
│  · Gọi REST API qua axios, cache bằng TanStack Query          │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST /api/* (JSON, Bearer JWT)
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG BACKEND — NestJS                         cổng 3001     │
│  · AuthModule (JWT + passport)                                │
│  · RevenueModule · LabourModule · EventsModule                │
│  · AnalyticsModule (tổng hợp tuần, KPI)                       │
│  · Prisma Client (data access)                                │
└───────────────────────────┬─────────────────────────────────┘
                            │ TCP 5432 (Prisma)
┌───────────────────────────▼─────────────────────────────────┐
│  TẦNG DATABASE — PostgreSQL 16                 cổng 5432     │
│  · users · revenue_entries · labour_costs · event_annotations │
└─────────────────────────────────────────────────────────────┘
```

Ba tầng được đóng gói và chạy bằng Docker, mỗi tầng một compose riêng (xem [`operations/environments.md`](../operations/environments.md)).

## Ranh giới trách nhiệm (seam chính)

Toàn hệ thống có **một seam ngoài duy nhất mà frontend phụ thuộc**: REST API dưới tiền tố `/api`. Frontend không biết gì về Prisma, SQL, hay cấu trúc bảng. Mọi thay đổi schema phải đi qua tầng API.

| Tầng | Sở hữu | Không được biết về |
| --- | --- | --- |
| Frontend | Hiển thị, tương tác, validate phía client, cache | SQL, tên bảng, Prisma model |
| Backend | Nghiệp vụ, xác thực, phân quyền, tính toán tổng hợp | ApexCharts, DOM, Tailwind |
| Database | Lưu trữ, ràng buộc toàn vẹn, index | HTTP, JWT, React |

## Các module chức năng

Backend chia theo module nghiệp vụ (NestJS module), frontend chia theo route + feature component:

| Miền nghiệp vụ | Backend module | Frontend route | Đặc tả |
| --- | --- | --- | --- |
| Xác thực | `AuthModule`, `UsersModule` | `/login` | [`features/authentication/login.md`](../features/authentication/login.md) |
| Doanh thu & xu hướng tuần | `RevenueModule`, `AnalyticsModule` | `/` | [`features/revenue-analytics/home.md`](../features/revenue-analytics/home.md) |
| Sự kiện/ghi chú doanh thu | `EventsModule` | `/forms/event-note` | [`features/events/create-event.md`](../features/events/create-event.md) |
| Chi phí nhân công | `LabourModule` | `/forms/labour-cost` | [`features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md) |

## Phạm vi (scope)

**Trong phạm vi:** đăng nhập, xem xu hướng doanh thu tuần, KPI tổng hợp, tạo sự kiện ghim biểu đồ, ghi chi phí nhân công, xuất báo cáo và sổ nhật ký chi phí.

**Ngoài phạm vi (giai đoạn này):** đa chi nhánh, tích hợp POS/Eatclub thời gian thực (hiện nhập tay), phân quyền chi tiết theo bảng, đa ngôn ngữ.

Quyết định đa chi nhánh bị loại bỏ được ghi lại tại [`adr/0004-single-location-scope.md`](../adr/0004-single-location-scope.md).

## Liên quan

- Stack chi tiết và lý do chọn: [`tech-stack.md`](./tech-stack.md)
- Dữ liệu chảy qua hệ thống: [`data-flow.md`](./data-flow.md)
- Tích hợp bên ngoài: [`integrations.md`](./integrations.md)
- Xác thực & bảo mật: [`security.md`](./security.md)
