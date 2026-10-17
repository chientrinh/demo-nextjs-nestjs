# Thư viện Component

Tài liệu này liệt kê component dùng trong dự án: phần **kế thừa TailAdmin** (dùng nguyên) và phần **dự án thêm** (đặc tả ngắn; chi tiết ở nơi khác).

## Kế thừa TailAdmin (dùng nguyên)

| Component | Đường dẫn | Dùng ở |
| --- | --- | --- |
| `Button` | `src/shared/components/ui/button/Button.tsx` | Mọi nơi |
| `Badge` | `src/shared/components/ui/badge/Badge.tsx` | Delta badge, trạng thái |
| `Table` (`Table`,`TableHeader`,`TableBody`,`TableRow`,`TableCell`) | `src/shared/components/ui/table/index.tsx` | Sổ nhật ký labour |
| `Label` | `src/shared/components/form/Label.tsx` | Nhãn form |
| `Input` (mặc định) | `src/shared/components/form/form-elements/DefaultInputs.tsx` | Input text/số |
| `TextArea` | `src/shared/components/form/form-elements/TextAreaInput.tsx` | Ghi chú |
| `SelectInputs` | `src/shared/components/form/form-elements/SelectInputs.tsx` | Chọn bộ phận, ca, phương thức |
| `RadioButtons` | `src/shared/components/form/form-elements/RadioButtons.tsx` | Chọn nguồn doanh thu |
| `Loader` / `ErrorState` / `EmptyState` | `src/shared/components/common/` | Trạng thái widget |
| `ThemeToggle` | `src/shared/components/theme-toggle/` | Header — sáng/tối |
| `PageBreadCrumb` | `src/shared/components/common/PageBreadCrumb.tsx` | Đầu mỗi trang admin |
| `ComponentCard` | `src/shared/components/common/ComponentCard.tsx` | Khung nội dung |
| `AppSidebar` / `AppHeader` | `src/shared/components/layout/` | Shell (xem [`../frontend/components/layout-shell.md`](../frontend/components/layout-shell.md)) |

Nguyên tắc: **không viết lại** component TailAdmin đã có. Tùy biến bằng props hoặc wrapper mỏng, không sửa trực tiếp file thư viện trừ khi cần và có ghi chú.

`src/shared/components/` chỉ chứa UI **toàn cục, không gắn nghiệp vụ**. Component mang logic tính năng nằm trong `src/modules/<feature>/ui/` (bảng dưới).

## Dự án thêm (thuộc module)

| Component | Đường dẫn | Module | Mô tả | Đặc tả |
| --- | --- | --- | --- | --- |
| `SignInForm` | `src/modules/auth/ui/login-form/components/SignInForm.tsx` | `auth` | Form đăng nhập (từ TailAdmin, chuyển vào module) | [`../features/authentication/login.md`](../features/authentication/login.md) |
| `KpiCard` | `src/modules/analytics/ui/kpi-cards/components/KpiCard.tsx` | `analytics` | Thẻ số liệu tổng hợp | [`../frontend/components/kpi-cards.md`](../frontend/components/kpi-cards.md) |
| `RevenueTrendChart` | `src/modules/analytics/ui/trend-chart/components/RevenueTrendChart.tsx` | `analytics` | Biểu đồ tuần + annotation | [`../frontend/components/charts.md`](../frontend/components/charts.md) |
| `EventNoteForm` | `src/modules/events/ui/event-form/components/EventNoteForm.tsx` | `events` | Form ghi sự kiện | [`../features/events/create-event.md`](../features/events/create-event.md) |
| `LabourCostForm` | `src/modules/labour/ui/labour-form/components/LabourCostForm.tsx` | `labour` | Form chi phí nhân công | [`../features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md) |
| `LabourLedgerTable` | `src/modules/labour/ui/labour-ledger/components/LabourLedgerTable.tsx` | `labour` | Bảng sổ nhật ký | [`../features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md) |
| `CurrencyInput` | `src/shared/components/form/CurrencyInput.tsx` | (toàn cục) | Input tiền USD, dùng nhiều form | [`../frontend/forms-and-validation.md`](../frontend/forms-and-validation.md) |

## Quy ước component

- **Một nhiệm vụ.** Component làm một việc; tách khi vượt ~150 dòng.
- **Props có kiểu, tường minh.** Không `any`; export type props.
- **Client component khi cần DOM/state** (`"use client"`); còn lại để server.
- **Không gọi API trong component hiển thị thuần.** Nhận props từ trang/hook; truy cập dữ liệu qua hook ở `modules/<x>/ui/<area>/hooks/` (hook gọi `application/services/`).
- **Vị trí theo module.** Component gắn nghiệp vụ nằm trong `modules/<feature>/ui/`; chỉ UI tái dùng không nghiệp vụ mới đặt ở `src/shared/components/`.
- **Dùng token, không mã màu rời.** (`text-primary`, `bg-surface-container-lowest`, …)

## Trạng thái chuẩn của một widget

Mọi widget dữ liệu hỗ trợ bốn trạng thái nhất quán:

| Trạng thái | Hiển thị |
| --- | --- |
| Loading | Skeleton đúng kích thước |
| Empty | Thông điệp ngắn hoặc giá trị `0` (biểu đồ không ẩn) |
| Error | "—" + nút thử lại |
| Ready | Nội dung |

## Accessibility

Mọi component tương tác phải: có nhãn (`Label` liên kết), điều khiển được bằng bàn phím, và giữ focus ring thấy được — xem [`accessibility.md`](./accessibility.md).
