# Component — Charts (ApexCharts)

Trang Home dùng **ApexCharts** để vẽ biểu đồ xu hướng tuần. Component: `src/modules/analytics/ui/trend-chart/components/RevenueTrendChart.tsx` (client component, `"use client"`; export qua `modules/analytics`).

## Biểu đồ "This Week's Revenue Trend"

**Loại:** cột (bar) cho doanh thu + đường (spline/line) cho chi phí nhân công — nhất quán với mockup `home.html`.

**Ba chuỗi (series):**

| Series | Nguồn dữ liệu | Kiểu | Màu (token) |
| --- | --- | --- | --- |
| POS Revenue | `days[].posRevenue` | bar | primary `#3C50E0` |
| Eatclub Revenue | `days[].eatclubRevenue` | bar | phụ trợ (ví dụ `#80CAEE`) |
| Labour Costs | `days[].labourCost` | line/spline | cảnh báo (ví dụ `#FB5454`) |

**Trục X:** 7 ngày của tuần (`days[].date`), hiển thị thứ trong tuần (T2…CN).

**Trục Y:** định dạng USD rút gọn (`$1.2M`, `$800K`) để nhãn gọn; giá trị đầy đủ trong tooltip.

## Props

```ts
type RevenueTrendChartProps = {
  days: { date: string; posRevenue: number; eatclubRevenue: number; labourCost: number }[];
  events: { id: string; title: string; source: 'POS'|'EATCLUB'; amount: number; eventDate: string; shift: string }[];
};
```

Dữ liệu lấy từ **một** hook `useWeeklyTrend(weekStart)` trong `modules/analytics/ui/dashboard/hooks/` (hook gọi `application/services/analytics.service.ts`) (xem [`../data-fetching.md`](../data-fetching.md)).

## Annotation sự kiện

Mỗi `event` biến thành một **annotation** đặt tại `x = eventDate`:

- Nhãn ngắn = `title` (cắt bớt nếu dài).
- Tooltip annotation hiển thị `title`, `amount` (USD), `shift`.
- Màu sắc hiển thị theo tác động sự kiện dương (`#16A34A` / `#3C50E0`).

```ts
annotations: {
  xaxis: events.map((e) => ({
    x: formatDate(e.eventDate),
    borderColor: '#16A34A',
    label: { text: truncate(e.title, 40), borderColor: 'transparent', style: { background: '#16A34A', color: '#fff' } },
  })),
}
```

## Tải động (dynamic import)

ApexCharts cần DOM, nên import động và chỉ render phía client để tránh lỗi SSR:

```tsx
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
```

Component cha (`RevenueTrendChart`) là client component; nó nhận `days`/`events` từ props (đã fetch ở tầng trên).

## Theme sáng/tối

Màu trục, grid, tooltip, và chữ phải đọc từ theme hiện tại (TailAdmin `ThemeProvider`) để biểu đồ đúng ở cả hai chế độ. Không hardcode `#fff`/`#000` cho nền.

## Trạng thái

| Trạng thái | Hiển thị |
| --- | --- |
| Đang tải | Skeleton hình chữ nhật cùng chiều cao chart |
| Có dữ liệu | Chart + annotation |
| Rỗng | Chart vẫn vẽ 7 cột `0` (không ẩn) |

Chiều cao chuẩn: `h-[360px]` (điều chỉnh responsive).

## Nút trên header chart

- **Compare to Previous** — bật/tắt chế độ so sánh với tuần trước (`isCompare`), hiển thị song song các cột hiện tại vs tuần trước và mũi tên delta.
- **Export PNG** — sử dụng `html-to-image` chụp container bao gồm cả 3 phần: Hàng thẻ KPI, Biểu đồ cột có overlay delta, và Chú thích Legend phía dưới (xem ADR [0006](../../adr/0006-html-to-image-dashboard-export.md)).

```ts
const { toPng } = await import("html-to-image");
const dataUrl = await toPng(chartContainerRef.current, {
  cacheBust: true,
  pixelRatio: 2,
  backgroundColor: isDark ? "#111827" : "#ffffff",
});
// tải xuống dưới dạng file .png
```

## Liên quan

- Trang dùng: [`../../features/revenue-analytics/home.md`](../../features/revenue-analytics/home.md)
- Đặc tả dữ liệu: [`../../backend/api/endpoints/revenue.md`](../../backend/api/endpoints/revenue.md#analytics)
- Design tokens: [`../../design/design-system.md`](../../design/design-system.md)
