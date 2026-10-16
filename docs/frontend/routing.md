# Routing

Ứng dụng dùng **Next.js App Router**, kế thừa route group của TailAdmin.

**Page là composition mỏng.** Mỗi `page.tsx` chỉ import thành phần public từ module tương ứng (`@/modules/<feature>`) và lắp ghép; không chứa logic nghiệp vụ. Ranh giới import: xem [`README.md`](./README.md#quy-tắc-module).

## Bản đồ route

| Route | File | Module | Layout | Trang | Đặc tả |
| --- | --- | --- | --- | --- | --- |
| `/login` | `(full-width-pages)/login/page.tsx` | `auth` | full-width (không sidebar) | Đăng nhập | [`../features/authentication/login.md`](../features/authentication/login.md) |
| `/` | `(admin)/page.tsx` | `analytics` | admin (sidebar + header) | Home / Revenue Analytics | [`../features/revenue-analytics/home.md`](../features/revenue-analytics/home.md) |
| `/forms/event-note` | `(admin)/forms/event-note/page.tsx` | `events` | admin | Tạo sự kiện | [`../features/events/create-event.md`](../features/events/create-event.md) |
| `/forms/labour-cost` | `(admin)/forms/labour-cost/page.tsx` | `labour` | admin | Ghi chi phí nhân công | [`../features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md) |

Ví dụ page mỏng:

```tsx
// src/app/(admin)/forms/labour-cost/page.tsx
import { LabourCostPage } from '@/modules/labour';
export default function Page() {
  return <LabourCostPage />;
}
```

## Route group

- **`(admin)`** — mọi trang trong khu vực đã đăng nhập. `(admin)/layout.tsx` render `AppSidebar` + `AppHeader` (`shared/components/layout/`) và bọc nội dung. Nhóm dấu ngoặc **không** xuất hiện trong URL (`/forms/event-note`, không phải `/admin/forms/...`).
- **`(full-width-pages)`** — trang không sidebar, dùng cho Login (và sau này là trang lỗi). `layout.tsx` của nhóm canh giữa nội dung toàn màn hình.

## Bảo vệ route (middleware)

`src/middleware.ts` chặn truy cập khu vực `(admin)` khi chưa đăng nhập:

```
Không có phiên hợp lệ + truy cập route admin  → redirect /login
Đã đăng nhập + truy cập /login                → redirect /
```

Middleware chỉ đọc **dấu hiệu phiên** (ví dụ sự hiện diện của access token trong cookie phiên hoặc một cookie cờ). Kiểm tra quyền thật vẫn do backend thực thi; middleware chỉ để điều hướng UX. Vì access token nằm trong bộ nhớ, việc khôi phục phiên khi tải lại trang dùng refresh token (cookie) → gọi `/api/auth/refresh` để lấy access token mới (xem [`data-fetching.md`](./data-fetching.md#khôi-phục-phiên)).

## Điều hướng sidebar

Mục menu định nghĩa trong `shared/components/layout/AppSidebar.tsx` theo kiểu TailAdmin (`NavItem` với `name`, `icon`, `path`), `path` lấy từ `ROUTES` (`shared/constants/routes.ts`). Thay menu demo của TailAdmin bằng menu nghiệp vụ:

| Nhãn | `path` | Icon (Material Symbols) |
| --- | --- | --- |
| Tổng quan | `/` | `dashboard` |
| Ghi sự kiện | `/forms/event-note` | `event` |
| Chi phí nhân công | `/forms/labour-cost` | `payments` |

Giữ cơ chế `subItems` của TailAdmin nếu cần nhóm; giai đoạn này ba mục phẳng là đủ.

## Breadcrumb

Dùng `PageBreadCrumb` (TailAdmin) ở đầu mỗi trang admin để hiển thị vị trí: ví dụ *Forms / Ghi sự kiện*.

## Sau khi chuyển trang

Sau khi tạo sự kiện hoặc chi phí thành công, điều hướng về `/` và hiển thị toast xác nhận; TanStack Query đã invalidate dữ liệu biểu đồ (xem [`state-management.md`](./state-management.md)).

## Ngoài phạm vi

Không có route chi tiết/sửa cho từng bản ghi trong giai đoạn này. Nếu cần, thêm `/forms/.../[id]` theo cùng layout `(admin)`.
