# Chiến lược Index & hiệu năng

## Index hiện có

| Bảng | Index | Phục vụ truy vấn |
| --- | --- | --- |
| `users` | `@unique(email)` | Tra cứu khi đăng nhập |
| `labour_costs` | `@@index([expenseDate])` | Dải ngày, tổng hợp chi phí theo ngày |
| `labour_costs` | `@@index([department])` | Lọc theo bộ phận trên sổ nhật ký |
| `event_annotations` | `@@index([eventDate])` | Dải ngày doanh thu, tổng hợp bán hàng, ghim sự kiện |

Index `eventDate` và `expenseDate` là quan trọng nhất vì **mọi truy vấn analytics đều lọc theo khoảng ngày** (xem [`../api/endpoints/analytics.md`](../api/endpoints/analytics.md)).

## Truy vấn trọng tâm và chi phí

| Truy vấn | Tần suất | Đường index |
| --- | --- | --- |
| Xu hướng tuần (7 ngày × 2 bảng) | mỗi lần mở Home | Range scan trên `eventDate`, `expenseDate` |
| KPI tổng hợp theo khoảng | mỗi lần mở Home / đổi khoảng | Range scan, `SUM`/`COUNT` gộp ở DB |
| Sổ nhật ký labour theo bộ phận + ngày | khi xem ledger | `expenseDate` + `department` |

## Nguyên tắc

1. **Tổng hợp ở database, không ở ứng dụng.** `SUM`/`COUNT`/`GROUP BY` chạy trong Postgres; backend không kéo toàn bộ hàng về rồi cộng.
2. **Không `SELECT *` rồi bỏ.** Chỉ chọn cột cần (`select` của Prisma) để giảm payload.
3. **Index có mục đích.** Không thêm index "cho chắc". Mỗi index mới phải gắn với một truy vấn liệt kê trong bảng trên, và cập nhật bảng đó.
4. **Đo trước khi tối ưu.** Dùng `EXPLAIN ANALYZE` trên truy vấn chậm trước khi thêm index.

## Tổng hợp theo tuần — ví dụ

Để dựng 7 điểm dữ liệu cho biểu đồ, dùng một truy vấn gộp cho mỗi bảng thay vì 7 truy vấn:

```sql
SELECT event_date, source, SUM(amount) AS total
FROM event_annotations
WHERE event_date BETWEEN $1 AND $2
GROUP BY event_date, source;
```

Backend gộp kết quả thành mảng 7 ngày, chèn `0` cho ngày thiếu (điền đầy ở tầng service, xem [`../api/endpoints/analytics.md`](../api/endpoints/analytics.md)).

## Khi nào thêm index

Thêm index mới khi: (a) có truy vấn lặp lại chậm trong production, và (b) `EXPLAIN ANALYZE` cho thấy sequential scan trên bảng lớn. Ghi index mới vào bảng đầu tài liệu này cùng truy vấn nó phục vụ.

## Giới hạn giai đoạn này

Dữ liệu còn nhỏ (vài bản ghi/ngày). Chiến lược trên đủ dùng; tối ưu sâu (composite index, materialized view cho KPI) để lại khi khối lượng tăng.
