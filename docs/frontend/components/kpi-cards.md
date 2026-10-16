# Component — KPI Cards

Ba thẻ KPI ở đầu trang Home, hiển thị số liệu tổng hợp từ `GET /api/analytics/summary`.

## Thẻ KPI

| Thẻ | Field API | Nhãn | Định dạng |
| --- | --- | --- | --- |
| Tổng doanh thu | `totalRevenue` | Total Revenue | `1.234.567 ₫` |
| Trung bình mỗi ngày | `averagePerDay` | Average per Day | `1.234.567 ₫` |
| Tổng lượt khách | `totalCovers` | Total Covers | `905` (số nguyên, phân tách nghìn) |

Giá trị khớp mockup: Total Revenue `$16,110`, Average per Day `$2,301`, Total Covers `905` — nhưng dự án hiển thị **VND** với định dạng Việt Nam (dấu `.` phân tách nghìn, hậu tố `₫`).

## `KpiCard`

Vị trí: `src/modules/analytics/ui/kpi-cards/components/KpiCard.tsx` (export qua `modules/analytics`).

**Props**

```ts
type KpiCardProps = {
  label: string;              // "Tổng doanh thu"
  value: number;              // 16110000
  format?: 'currency' | 'number';
  icon?: ReactNode;           // Material Symbols
  trend?: { value: number; direction: 'up' | 'down' }; // tùy chọn
};
```

**Hành vi**

- `format: 'currency'` → `formatVnd(value)`; `'number'` → phân tách nghìn.
- `loading` (nếu dùng) hiển thị skeleton cùng kích thước để tránh nhảy layout.
- `trend` tùy chọn hiển thị mũi tên tăng/giảm; giai đoạn này chưa cần so sánh kỳ trước nên có thể bỏ.

## Định dạng

`src/modules/shared/lib/format.ts`:

```ts
export const formatVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

export const formatNumber = (n: number) =>
  new Intl.NumberFormat('vi-VN').format(n);
```

Dùng `Intl.NumberFormat('vi-VN')` — không tự viết regex chèn dấu chấm.

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
| Rỗng (0) | Hiển thị `0 ₫` / `0`, không ẩn thẻ |

## Liên quan

- Trang dùng: [`../../features/revenue-analytics/home.md`](../../features/revenue-analytics/home.md)
- Endpoint: [`../../backend/api/endpoints/revenue.md`](../../backend/api/endpoints/revenue.md#analytics)
