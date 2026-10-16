# Quản lý trạng thái

Nguyên tắc phân loại rõ ba loại trạng thái — không trộn chúng vào nhau.

| Loại | Ví dụ | Công cụ | Nơi sống |
| --- | --- | --- | --- |
| **Server state** | revenue, labour, events, KPI, xu hướng tuần | TanStack Query | Hook ở `modules/<x>/ui/<area>/hooks/` (gọi `application/services/`); cache của QueryClient |
| **Auth state** | access token, user hiện tại | React Context | `modules/auth/application/store/session-provider.tsx` (bộ nhớ, không persist) |
| **UI state** | tuần đang xem, form mở, toast, đóng/mở sidebar | `useState` / `useReducer` | Cục bộ component trong `modules/<x>/ui/` |

## Server state — TanStack Query

Mọi dữ liệu đến từ backend đi qua TanStack Query. Đây là nguồn sự thật cho dữ liệu hiển thị.

### Query key theo miền

Key khai báo trong hook tại `modules/<x>/ui/<area>/hooks/`.

| Key | Endpoint | Dùng ở |
| --- | --- | --- |
| `['analytics','weekly-trend', weekStart]` | `GET /api/analytics/weekly-trend` | `modules/analytics` — biểu đồ |
| `['analytics','summary', from, to]` | `GET /api/analytics/summary` | `modules/analytics` — KPI |
| `['revenue', filters]` | `GET /api/revenue` | Danh sách/sửa doanh thu |
| `['labour', filters]` | `GET /api/labour` | `modules/labour` — sổ nhật ký |
| `['events', filters]` | `GET /api/events` | `modules/events` — danh sách sự kiện |
| `['me']` | `GET /api/auth/me` | `modules/auth` — hồ sơ người dùng |

Đặt key theo thứ tự **miền → tài nguyên → tham số** để invalidate theo tiền tố dễ dàng.

### Thời gian cache

| Dữ liệu | `staleTime` | Lý do |
| --- | --- | --- |
| Xu hướng tuần / KPI | 60 giây | Dữ liệu tài chính đổi chậm |
| Danh sách revenue/labour/events | 30 giây | |
| `me` | 5 phút | Ít đổi |

### Invalidate sau khi ghi

Mọi mutation phải invalidate đúng key. Hook mutation đặt ở `modules/<x>/ui/<area>/hooks/` (ví dụ `modules/labour/ui/labour-form/hooks/use-create-labour-cost.ts`), gọi service trong `application/services/`. Bảng dưới là quy tắc bắt buộc:

| Sau khi... | Invalidate |
| --- | --- |
| Tạo/sửa/xóa revenue | `['revenue']`, `['analytics']` |
| Tạo/sửa/xóa labour | `['labour']`, `['analytics']` |
| Tạo/sửa/xóa event | `['events']`, `['analytics']` |

Dùng tiền tố để quét mọi biến thể tham số:

```ts
queryClient.invalidateQueries({ queryKey: ['analytics'] });
```

## Auth state — Auth Context

`AuthProvider` (ở `modules/auth/application/store/session-provider.tsx`) giữ `{ user, accessToken, status }` trong bộ nhớ và cung cấp `login()`, `logout()`, `refresh()`. Hook `useAuth()` cũng được export từ `modules/auth`.

- Access token **không** vào `localStorage` (giảm rủi ro XSS).
- Khi tải lại trang, phiên được khôi phục bằng refresh token (cookie) → gọi `/api/auth/refresh` (xem [`data-fetching.md`](./data-fetching.md#khôi-phục-phiên)).
- Axios interceptor đọc token từ context này (hoặc một module giữ token) để gắn header.

```ts
const { user, status, login, logout } = useAuth();
```

`status` là một trong `'loading' | 'authenticated' | 'unauthenticated'`.

## UI state

Giữ cục bộ, không đẩy lên global store:

- **Tuần đang xem** trên Home: `useState` (hoặc tham số URL `?week=2026-10-12` để chia sẻ được — khuyến nghị URL vì bookmark/link được).
- **Trạng thái form**: React Hook Form quản lý.
- **Toast**: `useState` trong provider mỏng hoặc thư viện toast.
- **Sidebar mở/đóng**: do `SidebarProvider` của TailAdmin quản lý.

Khi UI state cần **chia sẻ giữa nhiều component** (không chỉ một cây), nâng nó lên `modules/<x>/application/store/` (ví dụ một `<x>-store.ts` hoặc `session-provider.tsx`). State cục bộ một component thì để ngay trong component — đừng tạo store sớm.

## Phản mẫu — tránh

- Sao chép server data vào `useState` rồi tự đồng bộ (dùng thẳng kết quả Query).
- Dùng `useEffect` gọi fetch thủ công thay cho `useQuery`.
- Đưa UI state (tuần, form) vào cache Query.
- Lưu access token vào `localStorage`.

## Liên quan

- Gọi API cụ thể và xử lý lỗi: [`data-fetching.md`](./data-fetching.md)
- Vị trí provider trong cây: [`README.md`](./README.md#provider)
