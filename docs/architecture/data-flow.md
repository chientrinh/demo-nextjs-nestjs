# Luồng dữ liệu

Tài liệu này mô tả dữ liệu chảy qua hệ thống cho từng tác vụ chính. Mỗi luồng nêu rõ: nguồn, các bước biến đổi, đích, và điểm cache/invalidate.

## Tầng gọi API ở frontend

Mọi luồng dưới đây đi qua cùng một chuỗi tầng ở frontend (ports & adapters):

```
ui/<area>/hooks (TanStack Query) → application/services (use-case) → data/api.ts → adapters/infrastructures (httpClient/axios) → NestJS API
```

- `ui/` không gọi mạng và không gọi `data/`; chỉ dùng hook.
- `ui/<area>/hooks/` bọc `useQuery`/`useMutation`, gọi **service**.
- `application/services/` điều phối use-case, gọi `data/api.ts`; không phụ thuộc React.
- `data/` (`modules/<feature>/data/`) gọi `httpClient` hoặc repository.
- `adapters/infrastructures/` giữ axios instance, cổng `IHttpClient`, repository tùy chọn.
- `domain/` chỉ chứa type/schema — không phụ thuộc framework.

Chi tiết: [`frontend/data-fetching.md`](../frontend/data-fetching.md).

## 1. Đăng nhập

```
Người dùng nhập email + mật khẩu (LoginForm)
   │  POST /api/auth/login { email, password }
   ▼
AuthService.validateUser → so khớp bcrypt với users.passwordHash
   │  đúng → ký access token (15 phút) + refresh token (7 ngày)
   ▼
Response: { accessToken, user } + Set-Cookie: refresh_token (httpOnly)
   │
   ▼
Frontend: lưu accessToken trong bộ nhớ, điều hướng tới "/"
```

Chi tiết: [`features/authentication/login.md`](../features/authentication/login.md), [`backend/api/authentication.md`](../backend/api/authentication.md).

## 2. Xem xu hướng doanh thu tuần (Home)

```
Frontend yêu cầu tuần hiện tại
   │  GET /api/analytics/weekly-trend?weekStart=2026-10-12
   ▼
AnalyticsService.weeklyTrend()
   │  ┌─ SELECT revenue_entries WHERE entry_date ∈ [weekStart, weekStart+6]
   │  ├─ SELECT labour_costs   WHERE expense_date ∈ [weekStart, weekStart+6]
   │  └─ SELECT event_annotations WHERE event_date ∈ [weekStart, weekStart+6]
   │  gộp theo ngày → 7 điểm dữ liệu
   ▼
Response: { days: [{ date, posRevenue, eatclubRevenue, labourCost }], events: [...] }
   │
   ▼
RevenueTrendChart (ApexCharts) vẽ 3 chuỗi + annotation sự kiện
```

KPI tổng hợp đi qua endpoint riêng:

```
GET /api/analytics/summary?from=2026-10-12&to=2026-10-18
   ▼
{ totalRevenue, averagePerDay, totalCovers, daysWithData }
   ▼
KpiCard × 3
```

Nguồn dữ liệu: `revenue_entries` (POS + EATCLUB) và `labour_costs`. Chi tiết đặc tả: [`features/revenue-analytics/home.md`](../features/revenue-analytics/home.md).

## 3. Tạo sự kiện ghim biểu đồ

```
Người dùng điền EventNoteForm (title, source, amount, date, shift, note)
   │  validate Zod → POST /api/events
   ▼
EventsService.create() → chèn event_annotations
   ▼
201 Created: { event }
   │
   ▼
Frontend invalidate ['analytics','weekly-trend'] → chart vẽ lại kèm annotation mới
```

Chi tiết: [`features/events/create-event.md`](../features/events/create-event.md).

## 4. Ghi chi phí nhân công

```
Người dùng điền LabourCostForm (date, amount, department, paymentMethod, note)
   │  validate Zod → POST /api/labour
   ▼
LabourService.create() → chèn labour_costs
   ▼
201 Created: { labourCost }
   │
   ▼
Frontend invalidate ['labour'] và ['analytics'] → bảng ledger + biểu đồ cập nhật
```

Chi tiết: [`features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md).

## Trạng thái ở frontend (server state vs UI state)

| Loại | Ví dụ | Ở đâu |
| --- | --- | --- |
| Server state | danh sách revenue, labour, events, KPI | TanStack Query cache, key theo khoảng ngày; hook ở `ui/<area>/hooks` |
| Auth state | accessToken, user đang đăng nhập | Auth context trong bộ nhớ (không localStorage) |
| UI state | tuần đang xem, form đang mở, toast | `useState` cục bộ trong component |

Quy tắc invalidate: sau mọi thao tác ghi (POST/PATCH/DELETE), invalidate đúng query key liên quan. Xem [`frontend/state-management.md`](../frontend/state-management.md) và [`frontend/data-fetching.md`](../frontend/data-fetching.md).

## Biến đổi dữ liệu quan trọng

- **Gộp theo ngày:** backend trả về 7 ngày liên tiếp kể cả ngày không có dữ liệu (giá trị `0`), để biểu đồ không bị đứt trục.
- **Tiền tệ:** không làm tròn ở backend; VND là số nguyên. Định dạng hiển thị (`1.234.567 ₫`) do frontend lo.
- **Ngày:** mọi so sánh khoảng ngày dùng `entry_date`/`expense_date`/`event_date` kiểu `date`, không dính timezone.
