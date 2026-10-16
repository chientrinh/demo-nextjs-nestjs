# 0006 — Sử dụng html-to-image để xuất báo cáo Dashboard sang PNG

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật

## Bối cảnh

Trang tổng quan (Dashboard) hiển thị xu hướng doanh thu hàng tuần bao gồm 3 khối thành phần trực quan:
1. **KPI Cards (3 thẻ):** Total Revenue, Average per Day, Total Covers kèm chỉ số biến động (delta).
2. **Revenue Trend Chart:** Biểu đồ cột chồng (POS, Eatclub) và đường chi phí nhân công (Labour), kèm các marker dot đỉnh cột và icon delta so sánh tuần trước.
3. **Bottom Legend:** Chú thích các nguồn doanh thu, chi phí nhân công và tác động sự kiện.

Nút "Export PNG" trên thanh công cụ yêu cầu xuất hình ảnh báo cáo hoàn chỉnh để người quản lý có thể tải về hoặc chia sẻ nhanh. Mặc định thư viện ApexCharts chỉ cung cấp API xuất Canvas nội bộ của biểu đồ (`chart.dataURI()`), dẫn tới việc:
- Hoàn toàn bỏ qua hàng thẻ KPI phía trên.
- Bỏ qua chú thích Legend phía dưới.
- Mất các lớp phủ HTML/CSS (icon so sánh, border radius cong, clip-path) do chúng được render ngoài Canvas SVG của ApexCharts.

## Quyết định

Sử dụng thư viện **`html-to-image`** để chụp toàn bộ container bọc cả 3 khối (KPI Cards + Chart Canvas + Bottom Legend) thành ảnh PNG:

- Bọc cả 3 thành phần trong một `div` có `ref={chartContainerRef}`.
- Gọi hàm `toPng(chartContainerRef.current, { pixelRatio: 2, backgroundColor: ... })` khi người dùng nhấn "Export PNG".
- Dynamic import `html-to-image` trong handler để tối ưu tải ban đầu.
- Fallback về Canvas export của ApexCharts nếu thao tác chụp DOM gặp lỗi.

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **`html-to-image` DOM capture (chọn)** | Chụp nguyên vẹn giao diện HTML (KPI + Chart + Legend + Icon overlay); độ nét 2x; nhẹ | Phụ thuộc DOM render client-side | — |
| ApexCharts Canvas API thuần | Không cần thêm thư viện ngoài | Chỉ xuất được biểu đồ thô; mất KPI cards, icon overlay và legend | Ảnh xuất ra không đúng giao diện người dùng thấy |
| `html2canvas` | Phổ biến, lâu đời | Kích thước bundle lớn hơn; xử lý CSS modern (Flexbox, Tailwind v4 clip-path) kém hơn `html-to-image` | Dễ lỗi layout với CSS hiện đại |
| In qua trình duyệt (`window.print`) | Native, không cần thư viện | Bật hộp thoại in toàn trang; không xuất trực tiếp file PNG tải về | Trải nghiệm người dùng kém |

## Hệ quả

**Tích cực:**
- Ảnh PNG tải về khớp 100% với những gì hiển thị trên màn hình người dùng, bao gồm cả 3 thẻ chỉ số KPI, biểu đồ cột có mũi tên tăng/giảm và chú thích nguồn doanh thu.
- Tự động nhận diện theme nền (Sáng `#ffffff` / Tối `#111827`) để file PNG không bị trong suốt hay vỡ màu.
- Độ phân giải tăng gấp đôi (`pixelRatio: 2`), sắc nét trên màn hình Retina / HiDPI.

**Tiêu cực / đánh đổi:**
- Thêm một dependency client-side (`html-to-image`).
- Phụ thuộc vào font chữ và CSS styles đã được nạp đầy đủ trong DOM trước khi chụp.

## Liên quan

- [`../frontend/components/charts.md`](../frontend/components/charts.md)
- [`../architecture/tech-stack.md`](../architecture/tech-stack.md)
