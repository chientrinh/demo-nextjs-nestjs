# Tích hợp

## Nguyên tắc

Giai đoạn này hệ thống **không gọi trực tiếp** bất kỳ dịch vụ bên ngoài nào. Dữ liệu doanh thu từ POS và Eatclub được **nhập tay** qua form. Mọi "tích hợp" là tích hợp dữ liệu ở tầng nghiệp vụ, thể hiện qua enum `RevenueSource`.

## Nguồn doanh thu (Revenue Sources)

Hai nguồn doanh thu là khái niệm cốt lõi, không phải kết nối mạng:

| Mã | Nguồn | Mô tả |
| --- | --- | --- |
| `POS` | Máy bán hàng tại quầy | Doanh thu ghi nhận trực tiếp tại nhà hàng |
| `EATCLUB` | App đối tác Eatclub | Doanh thu qua đặt bàn/khuyến mãi của đối tác |

Cả hai nguồn cùng tồn tại theo ngày. Một ngày có thể có bản ghi cho `POS`, cho `EATCLUB`, hoặc cả hai. Ràng buộc duy nhất `(entry_date, source)` đảm bảo mỗi nguồn chỉ có một bản ghi/ngày (xem [`backend/database/schema.md`](../backend/database/schema.md)).

## Lộ trình tích hợp tự động (tương lai)

Khi chuyển từ nhập tay sang đồng bộ tự động, đây là hướng thiết kế đã dự trù:

- **Điểm vào:** một module `IngestionModule` mới ghi vào cùng bảng `revenue_entries`, không đổi schema.
- **Nguồn POS:** import file CSV/Excel cuối ngày do máy POS xuất.
- **Nguồn Eatclub:** gọi API đối tác (cần credential riêng) hoặc nhận file đối soát.
- **Idempotency:** dùng khóa `(entry_date, source)` để upsert, tránh trùng khi đồng bộ lại.

Các endpoint hiện tại (`POST /api/revenue`) vẫn giữ nguyên; đồng bộ tự động chỉ là một client khác của cùng tầng dịch vụ.

## Tích hợp trong nội bộ hệ thống

| Kết nối | Giao thức | Ghi chú |
| --- | --- | --- |
| Frontend → Backend | HTTPS / REST JSON | Bearer JWT; base URL qua `NEXT_PUBLIC_API_URL` |
| Backend → Database | TCP 5432 | Prisma; `DATABASE_URL` |
| Container ↔ Container | Docker network `bistro-net` | tên service dùng làm hostname |

## Cấu hình liên quan

Biến môi trường cho các kết nối trên nằm ở [`operations/configuration.md`](../operations/configuration.md). Không hardcode URL hay credential trong code.

## Ngoài phạm vi

- Không có webhook nhận sự kiện từ POS.
- Không có SSO/OAuth bên thứ ba — xác thực là tài khoản nội bộ (xem [`architecture/security.md`](./security.md)).
- Không có cổng thanh toán.
