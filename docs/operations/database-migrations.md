# Migration cơ sở dữ liệu

Migration quản lý bởi **Prisma Migrate**. Thư mục: `backend/prisma/migrations/`. Không bao giờ sửa tay schema production ngoài migration.

## Vòng đời

| Môi trường | Lệnh | Ai chạy |
| --- | --- | --- |
| Dev | `npx prisma migrate dev --name <mo-ta>` | Lập trình viên |
| Test/CI | `npx prisma migrate deploy` | CI (sau khi dựng DB) |
| Production | `npx prisma migrate deploy` | Job khởi động/entrypoint |

## Quy trình dev

1. Sửa `backend/prisma/schema.prisma`.
2. Tạo migration: `npx prisma migrate dev --name add_event_annotations`.
3. Prisma sinh file SQL trong `prisma/migrations/<timestamp>_<name>/migration.sql` và áp vào DB dev.
4. `npx prisma generate` cập nhật client (thường tự chạy).
5. **Commit cả** `schema.prisma` **và** thư mục migration.

## Kiểm tra trước khi commit

```bash
cd backend
npx prisma migrate status     # không có migration lệch
npx prisma validate
```

## Chạy migration (deploy)

```bash
npx prisma migrate deploy
```

Chạy trong entrypoint container (xem [`docker-backend.md`](./docker-backend.md)). Với nhiều replica, chạy như **job một lần** trước khi scale app để tránh tranh chấp.

## Migration phá vỡ (breaking) — quy trình an toàn

Vì schema nhỏ, ưu tiên **expand → migrate → contract** khi đổi cột:

1. **Expand:** thêm cột/bảng mới (nullable hoặc có default), giữ cột cũ.
2. **Migrate:** ghi dữ liệu (script `prisma db execute` hoặc migration SQL có `UPDATE`).
3. **Contract:** sau khi app dùng cột mới ổn định, xóa cột cũ trong migration tiếp theo.

Ví dụ điển hình của dự án: nếu sau này thêm `locationId` (xem [ADR 0004](../adr/0004-single-location-scope.md)), làm theo ba bước trên với backfill.

## Quy tắc

1. **Không sửa migration đã deploy.** Thay đổi → migration mới.
2. **Không dùng `db push`** cho môi trường chia sẻ (chỉ dùng cho prototype cục bộ).
3. **Mọi thay đổi schema đi kèm cập nhật** [`../backend/database/schema.md`](../backend/database/schema.md).
4. **Default an toàn:** cột mới không-null phải có default hoặc được backfill trong cùng migration.
5. **Index** tạo cùng migration với cột/bảng dùng nó (xem [`../backend/database/indexing.md`](../backend/database/indexing.md)).

## Khôi phục sự cố

| Tình huống | Xử lý |
| --- | --- |
| `migrate dev` hỏng giữa chừng | Sửa migration.sql, `npx prisma migrate resolve --rolled-back <name>`, tạo lại |
| DB production lệch lịch sử | `npx prisma migrate resolve --applied <name>` sau khi đối chiếu thủ công |
| Cần reset DB dev | `npx prisma migrate reset` (**xóa toàn bộ dữ liệu dev**) |

## Liên quan

- [`../backend/database/migrations.md`](../backend/database/migrations.md)
- [`docker-database.md`](./docker-database.md)
