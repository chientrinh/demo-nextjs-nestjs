# Responsive

Chiến lược: **mobile-first**, dùng breakpoint mặc định của Tailwind (kế thừa TailAdmin) với mốc hành vi theo `DESIGN.md`.

## Breakpoint

| Tên | Khoảng | Hành vi chính |
| --- | --- | --- |
| Mobile | `< 640px` | Sidebar off-canvas (overlay); widget xếp một cột; KPI `grid-cols-1` |
| Tablet | `640px – 1023px` | KPI `grid-cols-2`; sidebar thu gọn thành dock icon `90px`; widget có thể 1 cột |
| Desktop | `1024px+` | Lưới đa cột đầy đủ; sidebar cố định `290px` |

Class Tailwind tương ứng: `sm:` = 640px, `md:` = 768px, `lg:` = 1024px, `xl:` = 1280px.

## Sidebar

| Viewport | Trạng thái |
| --- | --- |
| `< lg` | Ẩn mặc định; mở dạng overlay có lớp phủ; đóng khi chọn mục |
| `lg`–`xl` | Thu gọn icon dock `90px` (tùy cấu hình) |
| `≥ xl` | Mở rộng `290px` |

`SidebarProvider` (TailAdmin) giữ trạng thái; hành vi này không cần code thêm.

## Header

- Sticky, cao `72px`.
- Mobile: nút hamburger mở sidebar; ẩn ô tìm kiếm nếu không cần; giữ theme toggle + user menu.

## Lưới nội dung

- **Hàng KPI:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` (mobile `gap-4`).
- **Biểu đồ + phụ:** lưới con 12 cột — biểu đồ chiếm `lg:col-span-8`, khối phụ `lg:col-span-4`; mobile xếp chồng.
- **Chiều cao chart:** `h-[280px]` mobile, `h-[360px]` desktop.

## Bảng dữ liệu (ledger)

| Viewport | Xử lý |
| --- | --- |
| Desktop | Bảng đầy đủ cột |
| Mobile | Cuộn ngang trong khung (`overflow-x-auto`), giữ padding `py-4 px-5` |

Không ẩn cột quan trọng (ngày, số tiền, bộ phận) ở mobile — cuộn ngang thay vì cắt bỏ dữ liệu.

## Form

- Mobile: field một cột, nhãn trên.
- Desktop: form có thể chia hai cột cho các cặp field ngắn (ngày + ca), nhưng field tiền và tiêu đề chiếm toàn chiều rộng.

## Quy tắc

1. **Test ở 375px, 768px, 1440px** tối thiểu.
2. **Không dùng chiều rộng cố định** (`w-[500px]`) trừ khi có lý do rõ.
3. **Giữ cột số liệu quan trọng** — ưu tiên cuộn hơn ẩn.
4. **Không tràn ngang toàn trang.** Chỉ vùng bảng được cuộn ngang.

## Liên quan

- Shell: [`../frontend/components/layout-shell.md`](../frontend/components/layout-shell.md)
- Token khoảng cách: [`design-system.md`](./design-system.md)
