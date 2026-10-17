# Component — KPI Cards

Ba thẻ KPI ở đầu trang Home, hiển thị số liệu tổng hợp từ `GET /api/analytics/summary`.

## Thẻ KPI

| Thẻ | Field API | Nhãn | Định dạng |
| --- | --- | --- | --- |
| Tổng doanh thu | `totalRevenue` | Total Revenue | `$16,110` |
| Trung bình mỗi ngày | `averagePerDay` | Average per Day | `$2,301` |
| Tổng lượt khách | `totalCovers` | Total Covers | `905` (số nguyên, phân tách nghìn) |

Tuần mốc trong dữ liệu demo có `totalRevenue = 16,110` USD → hiển thị `$16,110` (khớp mockup). Định dạng **USD** `en-US`: tiền tố `$`, dấu `,` phân tách nghìn.

## `KpiCard`

> **Ghi chú:** component `KpiCard.tsx` hiện **chưa được dùng** — `DashboardView` render 3 thẻ KPI inline; props thực tế là `{ label, value?, fallbackText?, format?, loading? }`.

Vị trí: `src/modules/analytics/ui/kpi-cards/components/KpiCard.tsx` (export qua `modules/analytics`).

**Props**

```ts
type KpiCardProps = {
  label: string;              // "Tổng doanh thu"
  value: number;              // 16110
  format?: 'currency' | 'number';
  icon?: ReactNode;           // Material Symbols
  trend?: { value: number; direction: 'up' | 'down' }; // tùy chọn
};
```

**Hành vi**

- `format: 'currency'` → `formatUsd(value)`; `'number'` → phân tách nghìn.
- `loading` (nếu dùng) hiển thị skeleton cùng kích thước để tránh nhảy layout.
- `trend` tùy chọn hiển thị mũi tên tăng/giảm; giai đoạn này chưa cần so sánh kỳ trước nên có thể bỏ.

## Định dạng

`src/modules/shared/lib/format.ts`:

```ts
export const formatUsd = (n: number) =>
  '$' + new Intl.NumberFormat('en-US').format(n);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('en-US').format(n);
```

Dùng `Intl.NumberFormat('en-US')` — không tự viết regex chèn dấu phẩy. Xem thêm `formatCompactUsd` (rút gọn `$1.2M`, `$800K`) trong cùng file.

## Bố cục

Ba thẻ xếp một hàng trên desktop, chồng dọc trên mobile:

```
grid grid-cols-1 sm:grid-cols-3 gap-4
```

## Nguồn dữ liệu

Lấy từ `useSummary(from, to)` trong `modules/analytics/ui/dashboard/hooks/` (hook gọi `application/services/`; xem [`../data-fetching.md`](../data-fetching.md)). Khoảng ngày mặc định là tuần đang xem; khi người dùng đổi tuần, cả KPI lẫn biểu đồ cập nhật theo cùng `weekStart`.

## Trạng thái

| Trạng thái | Hiển thị |
| --- | --- |
| Đang tải | Skeleton 3 thẻ |
| Có dữ liệu | Số đã định dạng |
| Lỗi | Thẻ hiển thị "—" + nút thử lại |
| Rỗng (0) | Hiển thị `$0` / `0`, không ẩn thẻ |

## Liên quan

- Trang dùng: [`../../features/revenue-analytics/home.md`](../../features/revenue-analytics/home.md)
- Endpoint: [`../../backend/api/endpoints/analytics.md`](../../backend/api/endpoints/analytics.md#analytics)
