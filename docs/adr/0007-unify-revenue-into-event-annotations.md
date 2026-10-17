# 0007 — Hợp nhất ghi nhận doanh thu vào bảng event_annotations và xóa bảng revenue_entries

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-17
- **Người quyết định:** Team kỹ thuật & Ban điều hành

## Bối cảnh (Context)

Ban đầu, hệ thống thiết kế bảng `revenue_entries` như một bảng chốt sổ doanh thu tổng hợp cuối ngày (mỗi ngày chỉ có duy nhất 1 bản ghi cho `POS` và 1 bản ghi cho `EATCLUB` qua ràng buộc `@@unique([entryDate, source])`), đồng thời có thêm bảng `event_annotations` để ghi chú các sự kiện bán hàng/hoạt động đặc biệt.

Tuy nhiên trong thực tế vận hành nhà hàng:
- Nhà hàng bán hàng liên tục trong ngày theo từng ca làm việc (`WorkShift`), có nhiều giao dịch/món/sự kiện bán hàng phát sinh trong một ngày.
- Việc duy trì bảng chốt sổ `revenue_entries` tạo sự trùng lặp và phân mảnh luồng nhập liệu. Form người dùng thao tác hàng ngày là `Event & Note` (`/forms/event-note`), ghi trực tiếp từng lần bán hàng vào `event_annotations`.
- Do đó, cần tinh giản mô hình dữ liệu: dùng `event_annotations` làm bảng ghi nhận doanh thu chi tiết (có thể ghi nhiều lần/ngày), và dùng `labour_costs` để theo dõi chi phí. Xóa bỏ hoàn toàn bảng `revenue_entries`.

## Quyết định (Decision)

Chúng tôi sẽ:
1. **Xóa hoàn toàn bảng `revenue_entries`**: Xóa model `RevenueEntry` khỏi Prisma schema, tạo migration drop bảng `revenue_entries` và xóa `RevenueModule` ở backend.
2. **Hợp nhất nguồn tính doanh thu vào `event_annotations`**:
   - `event_annotations` đóng vai trò là bảng ghi nhận doanh thu chi tiết (bán được gì, nguồn nào, số tiền bao nhiêu, theo ca làm việc nào, trong ngày có thể ghi nhiều lần).
   - Biểu đồ xu hướng tuần (`WeeklyTrend`) tính doanh thu `POS` và `EATCLUB` bằng cách tính tổng `SUM(amount)` từ `event_annotations` theo từng ngày (`eventDate`) và từng nguồn (`source`).
   - Thẻ KPI `totalRevenue` và `averagePerDay` tính tổng doanh thu từ `event_annotations`.
3. **Chi phí tiếp tục sử dụng `labour_costs`**:
   - Đường `labourCost` trên biểu đồ và báo cáo chi phí tiếp tục lấy từ `labour_costs`.

## Phương án đã cân nhắc (Alternatives)

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Giữ cả 2 bảng** (`revenue_entries` + `event_annotations`) | Tách biệt báo cáo chốt ca và nhật ký sự kiện | Trùng lặp công sức nhập liệu; dễ lệch số giữa chốt sổ và chi tiết | Không phù hợp quy trình nhập liệu thực tế của nhà hàng |
| **Chỉ dùng `event_annotations` (Được chọn)** | Một luồng nhập liệu duy nhất; linh hoạt ghi nhiều lần bán trong ngày; cấu trúc dữ liệu đơn giản, tinh gọn | Cần aggregate `SUM()` khi vẽ biểu đồ và tính KPI | Tận dụng index `@@index([eventDate])`, hiệu năng cao và giải quyết triệt để trùng lặp |

## Hệ quả (Consequences)

**Tích cực:**
- Quy trình dữ liệu rõ ràng, một nguồn sự thật duy nhất cho doanh thu.
- Người dùng chỉ cần nhập liệu qua form `Event & Note` (`/forms/event-note`).
- Giảm số lượng bảng và module cần bảo trì (bỏ `RevenueModule`).

**Việc cần làm kéo theo:**
- Cập nhật Prisma schema (`schema.prisma`) và tạo migration drop bảng `revenue_entries`.
- Cập nhật `AnalyticsRepository` và `AnalyticsService` để tính tổng doanh thu từ `event_annotations`.
- Xóa `RevenueModule`, `RevenueController`, `RevenueService`, `RevenueRepository`.
- Cập nhật tài liệu thiết kế và kiến trúc trong `/docs`.

## Liên quan

- [docs/backend/database/schema.md](../backend/database/schema.md)
- [docs/features/revenue-analytics/home.md](../features/revenue-analytics/home.md)
- [docs/architecture/system-overview.md](../architecture/system-overview.md)
