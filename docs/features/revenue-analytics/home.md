# Tính năng — Home / Revenue Analytics

## Mục tiêu

Cho ban điều hành thấy ngay trong một màn hình: KPI tổng hợp và xu hướng doanh thu/chi phí theo tuần, kèm sự kiện ảnh hưởng để giải thích biến động.

## Vai trò

Tất cả vai trò (`ADMIN`, `MANAGER`, `ANALYST`) — chỉ đọc.

## Bố cục

Theo mockup `docs/design/home.html`:

1. **Breadcrumb** (`PageBreadCrumb`).
2. **Hàng KPI** — 3 thẻ: Total Revenue, Average per Day, Total Covers (xem [`../frontend/components/kpi-cards.md`](../../frontend/components/kpi-cards.md)).
3. **Card biểu đồ "This Week's Revenue Trend"** — 3 chuỗi (POS Revenue, Eatclub Revenue, Labour Costs) + annotation sự kiện. Header card có:
   - Bộ chọn tuần (mặc định tuần hiện tại; điều khiển bằng tham số URL `?week=YYYY-MM-DD`).
   - Nút **Compare to Previous** (đổi sang tuần trước).
   - Nút **Export PNG** (tải ảnh biểu đồ).
4. (Tùy chọn) Danh sách sự kiện của tuần bên cạnh biểu đồ.

## Luồng người dùng

1. Mở `/` → tải KPI + biểu đồ tuần hiện tại song song.
2. Đổi tuần (chọn ngày hoặc "Compare to Previous") → cập nhật biểu đồ, KPI, và danh sách sự kiện.
3. Bấm **Export PNG** → tải ảnh biểu đồ hiện tại.

## API

| Việc | Endpoint |
| --- | --- |
| Dữ liệu biểu đồ + sự kiện | `GET /api/analytics/weekly-trend?weekStart=YYYY-MM-DD` |
| KPI tổng hợp | `GET /api/analytics/summary?from=…&to=…` |

`weekStart` phải là **thứ Hai**. Khoảng KPI khớp tuần đang xem (`from = weekStart`, `to = weekStart + 6`).

Hình dạng response đầy đủ: [`../backend/api/endpoints/revenue.md`](../../backend/api/endpoints/revenue.md#analytics).

## Dữ liệu hiển thị

| Thành phần | Nguồn | Ghi chú |
| --- | --- | --- |
| POS Revenue (bar) | `days[].posRevenue` | `sum(event_annotations.amount where source=POS)` |
| Eatclub Revenue (bar) | `days[].eatclubRevenue` | `sum(event_annotations.amount where source=EATCLUB)` |
| Labour Costs (line) | `days[].labourCost` | `sum(labour_costs.amount)` mọi bộ phận |
| Tổng doanh thu | `summary.totalRevenue` | POS + EATCLUB (tổng doanh thu từ `event_annotations`) |
| Trung bình/ngày | `summary.averagePerDay` | chia số ngày lịch trong khoảng |
| Tổng lượt bán / covers | `summary.totalCovers` | `count(event_annotations)` trong khoảng |
| Annotation | `events[]` | mỗi sự kiện một ghim tại `eventDate` |

## Tiêu chí chấp nhận

- [ ] Biểu đồ vẽ **đủ 7 cột** kể cả ngày không có dữ liệu (giá trị `0`), không đứt trục.
- [ ] Ba chuỗi đúng màu/nhãn: POS (primary), Eatclub (so sánh), Labour (cảnh báo).
- [ ] KPI khớp mockup về cấu trúc (giá trị thực theo dữ liệu); định dạng USD.
- [ ] Sự kiện trong tuần xuất hiện dưới dạng annotation có tooltip (title, amount ±, ca).
- [ ] Đổi tuần cập nhật đồng thời biểu đồ, KPI, sự kiện.
- [ ] Export PNG tải được ảnh biểu đồ.
- [ ] Trạng thái tải dùng skeleton; lỗi có nút "Thử lại".
- [ ] Hoạt động đúng ở chế độ sáng và tối.

## Trường hợp biên

| Tình huống | Hành vi |
| --- | --- |
| Tuần không có dữ liệu | 7 cột `0`; KPI là `0`; danh sách sự kiện rỗng |
| Ngày chỉ có Eatclub | Cột POS = `0`, cột Eatclub có giá trị |
| Sự kiện `amount` âm | Annotation màu giảm; tooltip hiển thị dấu âm |
| Nhiều sự kiện cùng ngày | Nhiều annotation; nhãn không chồng che khuất hoàn toàn |
| `weekStart` không phải thứ Hai | Backend từ chối `400`; UI luôn gửi thứ Hai |

## Kiểm thử

- `AnalyticsService.weeklyTrend`: trả 7 phần tử, điền `0`, gộp đúng theo nguồn.
- `summary`: `averagePerDay` chia theo số ngày lịch.
- Component: KPI render số, chart render 7 điểm không lỗi, annotation từ `events`.

## Liên quan

- Chart component: [`../frontend/components/charts.md`](../../frontend/components/charts.md)
- KPI component: [`../frontend/components/kpi-cards.md`](../../frontend/components/kpi-cards.md)
- Endpoint: [`../backend/api/endpoints/revenue.md`](../../backend/api/endpoints/revenue.md#analytics)
- Mockup: `docs/design/home.html`
