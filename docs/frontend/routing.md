# Routing

Ứng dụng dùng **Next.js App Router**, kế thừa route group của TailAdmin. Mọi route nằm dưới segment **`[locale]`** (next-intl): locale `vi` (mặc định) và `en`, `localePrefix: "never"` (URL không chứa locale).

**Page là composition mỏng.** Mỗi `page.tsx` chỉ import thành phần public từ module tương ứng (`@/modules/<feature>`) và lắp ghép; không chứa logic nghiệp vụ. Ranh giới import: xem [`README.md`](./README.md#quy-tắc-module).

## Bản đồ route

| Route | File | Module | Layout | Trang | Đặc tả |
| --- | --- | --- | --- | --- | --- |
| `/login` | `[locale]/(full-width-pages)/(auth)/login/page.tsx` | `auth` | full-width (không sidebar) | Đăng nhập | [`../features/authentication/login.md`](../features/authentication/login.md) |
| `/` | `[locale]/(admin)/page.tsx` | `analytics` | admin (sidebar + header) | Home / Revenue Analytics | [`../features/revenue-analytics/home.md`](../features/revenue-analytics/home.md) |
| `/forms/event-note` | `[locale]/(admin)/forms/event-note/page.tsx` | `events` | admin | Tạo sự kiện | [`../features/events/create-event.md`](../features/events/create-event.md) |
| `/forms/labour-cost` | `[locale]/(admin)/forms/labour-cost/page.tsx` | `labour` | admin | Ghi chi phí nhân công | [`../features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md) |

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

## Bảo vệ route (client-side gates)

`src/middleware.ts` hiện **chỉ làm i18n** (next-intl), không có logic xác thực. Bảo vệ route nằm ở **client** bằng hai gate:

- `RequireAuth` (gắn ở `(admin)/layout.tsx`): `status = 'loading' | 'unauthenticated'` → `FullPageLoader`; `unauthenticated` → điều hướng `/login`; `authenticated` → render shell + trang.
- `RequireGuest` (gắn ở `(full-width-pages)/layout.tsx`): `status = 'loading' | 'authenticated'` → `FullPageLoader`; `authenticated` → điều hướng `/`; `unauthenticated` → render form đăng nhập.

Vì access token nằm trong bộ nhớ, việc khôi phục phiên khi tải lại trang dùng refresh token (cookie) → `POST /api/auth/refresh` (trả về `accessToken` + `user`). Xem [`data-fetching.md`](./data-fetching.md#khôi-phục-phiên) và [`state-management.md`](./state-management.md).

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
