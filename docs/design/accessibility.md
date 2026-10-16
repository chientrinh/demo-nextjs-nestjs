# Accessibility (a11y)

Mục tiêu: dashboard dùng được bằng bàn phím và trình đọc màn hình ở mức **WCAG 2.1 AA** cho các luồng chính (đăng nhập, xem KPI, ghi sự kiện, ghi chi phí).

## Nguyên tắc bắt buộc

1. **Mọi input có nhãn.** Dùng `Label` (TailAdmin) liên kết bằng `htmlFor`/`id`. Không dùng placeholder thay nhãn.
2. **Điều khiển được bằng bàn phím.** Mọi phần tử tương tác tới được bằng `Tab`, kích hoạt bằng `Enter`/`Space`.
3. **Focus thấy được.** Giữ focus ring (`0 0 0 4px rgba(60,80,224,.14)` + viền `#3C50E0`). Không `outline: none` mà không thay thế.
4. **Đủ tương phản.** Chữ trên nền đạt tỉ lệ ≥ 4.5:1 (chữ thường) và ≥ 3:1 (chữ lớn). Palette đã chọn đạt mức này; kiểm tra khi đổi màu.
5. **Không dựa vào màu đơn thuần.** Delta âm/dương kèm mũi tên hoặc dấu `+/-`, không chỉ đỏ/xanh — quan trọng cho người mù màu.

## Biểu đồ

ApexCharts render SVG/canvas không tự đọc được. Bổ sung:

- **Văn bản thay thế:** mỗi chart có `aria-label` mô tả, ví dụ *"Biểu đồ doanh thu tuần 12/10–18/10"*.
- **Bảng dữ liệu song song:** cung cấp dữ liệu tuần dưới dạng bảng ẩn (visually-hidden) hoặc bảng hiển thị để trình đọc màn hình nắm được giá trị.
- **Không phụ thuộc tooltip** cho thông tin thiết yếu.

## Bảng dữ liệu

- Dùng `<table>` ngữ nghĩa với `<caption>` (có thể ẩn thị giác) và `<th scope="col">`.
- Tiêu đề cột uppercase là **hình thức**; phần ngữ nghĩa do `<th>` đảm nhiệm.

## Form

- Gắn lỗi với field qua `aria-invalid` và `aria-describedby` trỏ tới phần thông báo lỗi.
- Thông báo lỗi nằm ngay dưới field, có thể đọc bởi trình đọc màn hình.
- Nút submit có nhãn rõ ("Lưu chi phí", không chỉ biểu tượng).

## Thông báo (toast)

- Vùng thông báo dùng `role="status"` (thành công) hoặc `role="alert"` (lỗi) để được công bố.
- Toast không chặn bàn phím và tự biến mất nhưng có thể đóng thủ công.

## Điều hướng

- Có **skip link** ("Bỏ qua tới nội dung") ở đầu trang admin, hiện khi focus.
- Sidebar là danh sách liên kết; mục đang chọn có `aria-current="page"`.
- Thứ tự tab theo thứ tự đọc (trên xuống, trái sang phải).

## Chuyển động

Tôn trọng `prefers-reduced-motion`: giảm/loại animation biểu đồ khi người dùng bật tùy chọn này.

## Ngôn ngữ

- Thuộc tính `lang="vi"` trên `<html>` để trình đọc màn hình phát âm đúng.

## Checklist trước khi xong một trang

- [ ] Mọi input có nhãn liên kết.
- [ ] Đi hết bằng `Tab`, không bị kẹt.
- [ ] Focus luôn thấy.
- [ ] Chart có nhãn/thay thế.
- [ ] Thông báo có `role` phù hợp.
- [ ] Đủ tương phản ở cả chế độ sáng và tối.
