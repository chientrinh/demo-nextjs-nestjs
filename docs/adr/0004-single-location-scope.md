# 0004 — Phạm vi một địa điểm (single location)

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật + nghiệp vụ

## Bối cảnh

Ban đầu có giả định hệ thống phục vụ nhiều chi nhánh (multi-branch) với bộ lọc theo địa điểm. Tuy nhiên nghiệp vụ hiện tại chỉ vận hành **một nhà hàng**. Thêm chiều "địa điểm" vào mọi bảng, truy vấn, và UI sẽ tăng đáng kể độ phức tạp (khóa duy nhất phức hợp, phân quyền theo chi nhánh, tổng hợp đa cơ sở) mà chưa có nhu cầu thực.

## Quyết định

Hệ thống phạm vi **một địa điểm duy nhất**. Không có bảng `locations`, không có `locationId` trên các bảng dữ liệu, không có bộ lọc địa điểm trong UI.

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Một địa điểm (chọn)** | Mô hình đơn giản; khóa duy nhất gọn; UI sạch | Không mở rộng đa cơ sở ngay | Chưa có nhu cầu |
| Thêm `locationId` ngay | Sẵn sàng mở rộng | Phức tạp hóa mọi thứ khi chưa cần | YAGNI |
| Nhiều instance triển khai | Tách biệt dữ liệu tự nhiên | Hạ tầng nhân bản | Thừa |

## Hệ quả

**Tích cực:**
- Khóa duy nhất đơn giản: `revenue_entries(entry_date, source)`, `users(email)`.
- Truy vấn và UI gọn, không cần "location switcher".

**Tiêu cực / đánh đổi:**
- Nếu sau này mở nhiều chi nhánh, cần migration thêm `locationId` + backfill + đổi khóa duy nhất. Đây là **thay đổi phá vỡ** — sẽ cần một ADR mới (thay thế ADR này).

**Việc cần làm kéo theo:**
- Ghi rõ phạm vi này trong [`../architecture/system-overview.md`](../architecture/system-overview.md) và [`../backend/database/schema.md`](../backend/database/schema.md) để agent không tự thêm đa chi nhánh.

## Liên quan

- [`../architecture/system-overview.md`](../architecture/system-overview.md)
- [`../backend/database/schema.md`](../backend/database/schema.md)
