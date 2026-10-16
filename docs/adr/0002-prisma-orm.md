# 0002 — Dùng Prisma làm ORM

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật

## Bối cảnh

Backend cần truy cập PostgreSQL an toàn kiểu (type-safe), quản lý migration, và mô hình dữ liệu dễ đọc cho cả người lẫn agent. Mô hình nhỏ (4 bảng) và ổn định, ưu tiên tốc độ phát triển và tài liệu tự sinh hơn là truy vấn SQL thủ công phức tạp.

## Quyết định

Dùng **Prisma** (`prisma` CLI + `@prisma/client`) với schema khai báo trong `backend/prisma/schema.prisma`. Migration quản lý bằng `prisma migrate`. Kiểu dữ liệu DB ánh xạ qua native type: tiền VND là `Decimal @db.Decimal(15,0)`, ngày date-only là `DateTime @db.Date`.

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Prisma (chọn)** | Kiểu end-to-end, migration tường minh, DX tốt | Truy vấn rất phức tạp kém linh hoạt | — |
| TypeORM | Quen thuộc với NestJS | Kiểu yếu hơn, migration dễ lệch | DX kém hơn |
| Kysely / raw SQL | Kiểm soát tối đa | Nhiều mã thủ công, dễ sai | Chậm phát triển |
| Drizzle | Nhẹ, type-safe | Hệ sinh thái/migration còn non hơn Prisma | Chọn Prisma cho ổn định |

## Hệ quả

**Tích cực:**
- `schema.prisma` là nguồn sự thật của mô hình dữ liệu; agent đọc một chỗ.
- Migration có lịch sử rõ; `prisma migrate deploy` chạy trong container.

**Tiêu cực / đánh đổi:**
- Cần `prisma generate` sau khi đổi schema.
- `Decimal` trả về dạng `Prisma.Decimal` — phải chuyển sang `number`/`string` ở ranh giới API (xem chú ý dưới).

**Việc cần làm kéo theo:**
- Serialize `Decimal` → số nguyên VND trong DTO/service trước khi trả JSON.
- Index quan trọng khai báo ngay trong schema (xem [`../backend/database/indexing.md`](../backend/database/indexing.md)).

## Liên quan

- [`../backend/database/schema.md`](../backend/database/schema.md)
- [`../backend/database/migrations.md`](../backend/database/migrations.md)
