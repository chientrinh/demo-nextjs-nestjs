# Đặc tả tính năng

Mỗi thư mục con là một miền nghiệp vụ; mỗi file là một tính năng. Đây là tài liệu **agent đọc trước khi code**.

| Miền | Tính năng | Route | File |
| --- | --- | --- | --- |
| Xác thực | Đăng nhập | `/login` | [`authentication/login.md`](./authentication/login.md) |
| Phân tích doanh thu | Tổng quan / Home | `/` | [`revenue-analytics/home.md`](./revenue-analytics/home.md) |
| Sự kiện | Ghi sự kiện lên biểu đồ | `/forms/event-note` | [`events/create-event.md`](./events/create-event.md) |
| Nhân công | Ghi chi phí nhân công | `/forms/labour-cost` | [`labour-cost/create-labour-cost.md`](./labour-cost/create-labour-cost.md) |

## Khuôn mẫu một đặc tả

Mọi file tính năng theo cấu trúc:

1. **Mục tiêu** — tính năng giải quyết việc gì.
2. **Vai trò** — ai được dùng.
3. **Luồng người dùng** — các bước.
4. **API sử dụng** — endpoint + payload.
5. **Dữ liệu** — bảng/field liên quan.
6. **Tiêu chí chấp nhận** — checklist kiểm chứng được.
7. **Trường hợp biên** — hành vi với dữ liệu bất thường.
8. **Kiểm thử** — test bắt buộc.
9. **Liên quan** — trỏ tới tài liệu khác.

## Từ vựng nghiệp vụ

Thuật ngữ cốt lõi (định nghĩa chi tiết ở [`../AGENT_INSTRUCTIONS.md`](../AGENT_INSTRUCTIONS.md#từ-vựng-bắt-buộc-ubiquitous-language)):

- **Revenue Entry** — doanh thu theo `(entryDate, source)`; `source ∈ {POS, EATCLUB}`.
- **Labour Cost** — chi phí nhân công theo `(expenseDate, department, paymentMethod)`.
- **Event Annotation** — sự kiện có ảnh hưởng doanh thu, ghim lên biểu đồ tuần.
- **Covers** — số lượt khách trong ngày.
- **Trend** — chuỗi 7 ngày cho biểu đồ Home.

## Quy ước chung mọi tính năng

- Mọi trang admin cần đăng nhập; vai trò `ANALYST` chỉ đọc.
- Tiền là **VND, số nguyên**; ngày là **date-only**.
- Sau thao tác ghi: toast xác nhận + invalidate query liên quan (bảng ở [`../frontend/state-management.md`](../frontend/state-management.md#invalidate-sau-khi-ghi)).
- Trạng thái tải/rỗng/lỗi theo [`../design/components.md`](../design/components.md#trạng-thái-chuẩn-của-một-widget).
