# Hệ thống thiết kế

Nguồn gốc: `docs/design/DESIGN.md` (frontmatter token + quy tắc).

> ⚠️ **Khớp code hiện tại:** theme thực tế trong `src/shared/styles/index.css` là theme **TailAdmin** — font **Outfit**, palette `brand/gray/orange/success/error/warning`, **sidebar sáng** (`bg-white dark:bg-gray-900`). Các token M3 (surface/primary/navy) và font Plus Jakarta Sans/Inter dưới đây là đặc tả gốc từ `DESIGN.md`, **chưa được triển khai**.

Tên hệ thống: **Executive Analytics & Operational Intelligence**. Phong cách: corporate modernism + data ergonomics; nền sáng, "cột lệnh" navy đậm, điểm nhấn royal blue.

## Token màu

Triển khai trong `src/shared/styles/index.css` qua khối `@theme` (Tailwind v4) của TailAdmin. Bảng dưới là token M3 từ `DESIGN.md`; cột "Dùng cho" là quy ước áp dụng.

### Bề mặt & chữ

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `surface` | `#f8f9ff` | Nền canvas (light) |
| `surface-container-lowest` | `#ffffff` | Card, bảng, KPI |
| `surface-container-low` | `#eff4ff` | Nền phụ nhẹ |
| `surface-container` | `#e5eeff` | Nền phân tách |
| `on-surface` | `#0b1c30` | Chữ chính |
| `on-surface-variant` | `#454655` | Chữ phụ |
| `outline` | `#757686` | Viền đậm |
| `outline-variant` | `#c5c5d7` | Viền hairline |
| `inverse-surface` | `#213145` | Nền đảo (dark) |
| `inverse-on-surface` | `#eaf1ff` | Chữ trên nền đảo |

### Primary (điểm nhấn tương tác)

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `primary` | `#1c33c8` | Chữ/nhấn đậm |
| `primary-container` | `#3c50e0` | **Nút primary, series ApexCharts chính, mục sidebar active** |
| `on-primary` / `on-primary-container` | `#ffffff` / `#d9dbff` | Chữ trên primary |
| Hover | `#3641F5` | Trạng thái hover của nút primary |
| Tint (container) | `#ECF3FF` | Nền badge "active metric" |
| On-container | `#2A31D8` | Chữ trên tint |

### Cột điều hướng (navy)

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| Sidebar nền | `#1C2434` | Cột sidebar tối |
| Header nền | `#FFFFFF` (light) / `#101828` (dark) | Header |
| Viền dark | `#344054` | Hairline ở dark |

### Nguồn dữ liệu (biểu đồ)

| Vai trò | Màu | Dùng cho |
| --- | --- | --- |
| Chuỗi chính | `#3C50E0` | POS Revenue (bar), spline chính |
| Chuỗi so sánh | `#0BA5EC` | Eatclub Revenue (bar) |
| Cảnh báo / chi phí | `#F04438` (hoặc `#FB5454`) | Labour Costs (line), delta âm |

### Ngữ nghĩa phản hồi

| Ý nghĩa | Chữ | Nền | Dùng |
| --- | --- | --- | --- |
| Tích cực / tăng | `#12B76A` | `#ECFDF3` | Delta dương, thành công |
| Tiêu cực / lỗi | `#F04438` | `#FEF3F2` | Delta âm, lỗi |
| Cảnh báo | `#F79009` | `#FFFAEB` | Sắp vượt ngưỡng |
| Trung tính | `#64748B` | `#F2F4F7` | Nhãn, viền |

## Typography

Hai họ chữ: **Plus Jakarta Sans** (tiêu đề, số KPI) và **Inter** (nhãn, bảng, vi thể).

| Vai trò | Họ | Size / weight / line-height |
| --- | --- | --- |
| `display-xl` | Plus Jakarta Sans | 60 / 700 / 72 |
| `headline-lg` | Plus Jakarta Sans | 36 / 700 / 44 |
| `headline-md` | Plus Jakarta Sans | 30 / 600 / 38 |
| `headline-sm` | Plus Jakarta Sans | 20 / 600 / 28 |
| `title-md` | Plus Jakarta Sans | 18 / 600 / 26 |
| `body-lg` | Inter | 16 / 400 / 24 |
| `body-md` | Inter | 14 / 400 / 20 |
| `label-md` | Inter | 14 / 500 / 20 |
| `label-sm` | Inter | 12 / 500 / 16 |
| `caption` | Inter | 11 / 500 / 14 |

Quy tắc bắt buộc:

- **Số dạng bảng (tabular numerics):** mọi số tiền, phần trăm, và số trong sổ nhật ký bật `font-variant-numeric: tabular-nums` để cột thẳng hàng.
- **Tiêu đề KPI:** line-height chặt (1.2–1.26) và letter-spacing âm.
- **Tên cột bảng:** UPPERCASE, `letter-spacing 0.05em`, cỡ `caption`/`label-sm`.

## Khoảng cách & bố cục

- Nhịp cơ sở **8pt**.
- Padding canvas: `1rem` (mobile) → `1.5rem` (tablet) → `2rem` (desktop).
- Sidebar: **290px** mở rộng, **90px** thu gọn. Header: **72px**, sticky.
- Hàng KPI: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`, gutter `1.5rem` desktop / `1rem` mobile.
- Lưới trực quan: lưới con 12 cột (ví dụ 7 cột chart + 5 cột phụ).

Biến khoảng cách: `--space-xs` `.25rem`, `--space-sm` `.5rem`, `--space-md` `1rem`, `--space-lg` `1.5rem`, `--space-xl` `2rem`; `gutter` `1.5rem`, `margin` `2rem` (mobile `1rem`).

## Bo góc (shapes)

| Token | Giá trị | Dùng cho |
| --- | --- | --- |
| `rounded-sm` | 4px | Input, chip, ô bảng |
| `rounded-md` | 6px | Nút chuẩn |
| `rounded-lg` | 8px | Icon square, container nhỏ |
| `rounded-xl` | 12px | **Card KPI, khung chart, bảng** |
| `rounded-full` | 9999px | Badge trạng thái, avatar |

Bar ApexCharts: bo đầu **5px**.

## Độ nổi (elevation)

Ưu tiên **viền hairline hơn đổ bóng**. Nền canvas `#F9FAFB`, card trắng `#FFFFFF` tạo phân tách bằng tương phản.

| Cấp | Bóng | Dùng |
| --- | --- | --- |
| `shadow-xs` | `0 1px 2px rgba(16,24,40,.05)` | Nút primary, pill |
| `shadow-sm` | `0 1px 3px rgba(16,24,40,.08), 0 1px 2px rgba(16,24,40,.04)` | Card KPI, chart |
| `shadow-md` | `0 4px 8px -2px rgba(16,24,40,.1), 0 2px 4px -2px rgba(16,24,40,.06)` | Menu, dropdown, tooltip |
| Focus ring | `0 0 0 4px rgba(60,80,224,.14)` | Input/control đang focus |

## Trạng thái

- **Focus:** viền `#3C50E0` + halo 4px.
- **Hover nút primary:** `#3641F5`.
- **Disabled:** giảm opacity, con trỏ `not-allowed`.

## Nguồn sự thật

- Token: `src/shared/styles/index.css` (`@theme`) — đồng bộ với bảng trên.
- Tài liệu gốc: `docs/design/DESIGN.md`.
- Component thư viện: [`components.md`](./components.md).
