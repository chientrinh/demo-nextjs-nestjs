# Migration

Migration được quản lý bằng **Prisma Migrate**, chạy trong thư mục `backend/`.

## Nguyên tắc

1. **Không sửa migration đã áp dụng.** Mỗi thay đổi schema là một migration mới.
2. **Schema là nguồn sự thật.** Sửa `prisma/schema.prisma`, rồi sinh migration — không sửa DB thủ công.
3. **Migration đi kèm code.** Một PR đổi schema phải chứa cả file migration và thay đổi code dùng nó.
4. **Cập nhật tài liệu.** Mọi migration đổi bảng/cột phải cập nhật [`schema.md`](./schema.md) trong cùng PR.

## Quy trình phát triển

```bash
# trong backend/
npx prisma migrate dev --name add_event_shift_enum
```

Lệnh này: so sánh schema với DB → sinh file SQL trong `prisma/migrations/` → áp dụng → cập nhật Prisma Client.

## Quy trình cho môi trường đã triển khai (production)

```bash
npx prisma migrate deploy
```

Chỉ áp dụng các migration đã có, **không** sinh mới, **không** reset dữ liệu. Chạy như bước một trong quy trình khởi động backend container (xem [`../operations/database-migrations.md`](../../operations/database-migrations.md)).

## Đặt tên migration

Dùng `snake_case`, mô tả thay đổi, tiền tố động từ:

- `init_schema`
- `add_revenue_entry_unique`
- `add_labour_cost_indexes`
- `add_event_annotation_shift`

## Migration đầu tiên (baseline)

Migration `init_schema` tạo: 5 enum, 4 bảng (`users`, `revenue_entries`, `labour_costs`, `event_annotations`), các unique/index mô tả ở [`schema.md`](./schema.md).

## Migration phá vỡ (breaking) — quy trình an toàn

Khi đổi/xóa cột đang dùng:

1. **Mở rộng trước** — thêm cột mới nullable / có default, deploy.
2. **Ghi kép** — code ghi cả cột cũ và mới trong một giai đoạn.
3. **Di trú dữ liệu** — script một lần, chạy bằng migration có SQL tùy biến.
4. **Thu hẹp sau** — xóa cột cũ ở PR riêng khi chắc chắn không còn dùng.

Không gộp bốn bước vào một migration trên môi trường đang chạy.

## Khôi phục khi hỏng

| Tình huống | Cách xử lý |
| --- | --- |
| Migration dev lỗi, chưa cần giữ dữ liệu | `npx prisma migrate reset` (xóa & dựng lại DB dev) |
| Migration đã deploy lỗi giữa chừng | Xem [`../operations/troubleshooting.md`](../../operations/troubleshooting.md); sửa bằng migration bù, không sửa bảng `_prisma_migrations` |
| DB lệch so với schema | `npx prisma migrate status` để xem chênh lệch |

## Seed dữ liệu

`backend/prisma/seed.ts` tạo tài khoản quản trị đầu tiên và (tùy chọn) dữ liệu mẫu một tuần. Chạy:

```bash
npx prisma db seed
```

Seed phải **idempotent** (dùng `upsert`) để chạy lại an toàn.

## Liên quan

- Schema đầy đủ: [`schema.md`](./schema.md)
- Chạy migration trong Docker/CI: [`../operations/database-migrations.md`](../../operations/database-migrations.md)
- Biến `DATABASE_URL`: [`../operations/configuration.md`](../../operations/configuration.md)
