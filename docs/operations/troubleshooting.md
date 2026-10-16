# Xử lý sự cố (troubleshooting)

Bảng tra nhanh theo triệu chứng. Nếu sự cố nghiêm trọng, kiểm tra log theo `requestId` (xem [`monitoring.md`](./monitoring.md)).

## Khởi động & kết nối

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Backend không lên, `P1001` / can't reach database | DB chưa sẵn sàng hoặc `DATABASE_URL` sai | Kiểm tra `docker compose -f docker/database/... up -d`; dùng host `database` (trong mạng) hoặc `localhost` (ngoài) |
| `depends_on` không chờ | Thiếu `condition: service_healthy` hoặc thiếu healthcheck | Thêm healthcheck `pg_isready` ở DB |
| Frontend gọi API `Network Error` / CORS | `NEXT_PUBLIC_API_URL` hoặc `CORS_ORIGIN` sai | Đảm bảo origin khớp; nhớ `NEXT_PUBLIC_*` nhúng **lúc build** → build lại |
| `Cannot find module '@prisma/client'` | Chưa `prisma generate` | `npx prisma generate` (và trong image, generate ở stage build) |

## Migration & schema

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `migrate deploy` báo lệch lịch sử | Migration đã chạy/sửa tay | `npx prisma migrate status`; `migrate resolve --applied/--rolled-back` sau đối chiếu |
| Cột mới `null` ở dữ liệu cũ | Thêm cột not-null không default | Làm theo expand→migrate→contract ([`database-migrations.md`](./database-migrations.md)) |
| `Decimal` hiện thành object trong JSON | Chưa serialize `Prisma.Decimal` | Chuyển sang số nguyên VND ở DTO/service |
| Ngày lệch 1 ngày | Trộn `Date` có timezone với `@db.Date` | Luôn dùng date-only `YYYY-MM-DD`; không đổi múi giờ khi lưu ngày |

## Xác thực & phiên

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| Bị đẩy về `/login` liên tục | Access token hết hạn + refresh thất bại | Kiểm tra cookie refresh tồn tại, `JWT_REFRESH_SECRET`, clock; đảm bảo interceptor chỉ refresh **một lần** và phát lại hàng đợi |
| `401` dù vừa đăng nhập | Token không gửi kèm header | Kiểm tra interceptor `Authorization: Bearer`; token chỉ giữ trong bộ nhớ nên mất khi reload → khôi phục qua refresh |
| Cookie không được set | `Secure` cookie trên HTTP dev | Dev: tắt `Secure`; Production: bắt buộc HTTPS |
| `403` khi ghi dữ liệu | Vai trò `ANALYST` | Đúng thiết kế — chỉ `ADMIN`/`MANAGER` ghi |

## Dữ liệu & nghiệp vụ

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `DUPLICATE_REVENUE_ENTRY` | Đã có bản ghi `(entryDate, source)` | Sửa bản ghi cũ (PATCH) thay vì tạo mới; hoặc chọn nguồn khác |
| Biểu đồ không đủ 7 cột | Bỏ sót ngày rỗng | Backend phải điền `0` cho mọi ngày trong tuần |
| `422`/`400` khi gửi event | `title` > 80 hoặc `amount` không nguyên | Sửa theo thông báo; event **cho phép** `amount` âm |
| Labour bị từ chối `amount` = 0 | Ràng buộc `amount > 0` | Nhập giá trị dương |
| KPI trung bình/ngày sai | Chia cho số ngày **có dữ liệu** thay vì số ngày lịch | Sửa công thức: `totalRevenue / sốNgàyLịch` |

## Docker

| Triệu chứng | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `network bistro not found` | Chưa tạo mạng | `docker network create bistro` |
| Cổng đã dùng | Tiến trình cũ chiếm `3000/3001/5432` | `docker ps`; dừng container/tiến trình; hoặc đổi cổng |
| Mất dữ liệu sau `down` | Chạy `down -v` | Khôi phục từ backup ([`docker-database.md`](./docker-database.md)); tránh `-v` khi không chủ đích |
| Image quá lớn / build chậm | Thiếu multi-stage hoặc cache | Đảm bảo Dockerfile đa stage (xem [`docker-backend.md`](./docker-backend.md)) |

## Khi bí

1. Đọc log theo `requestId`.
2. Kiểm tra biến môi trường hiệu dụng (không chỉ file `.env`).
3. Tái hiện tối thiểu (một request `curl`).
4. Kiểm tra `/api/health` và `/api/health/db`.
5. Nếu liên quan schema, `npx prisma migrate status`.

## Liên quan

- [`monitoring.md`](./monitoring.md)
- [`configuration.md`](./configuration.md)
- [`../backend/api/error-handling.md`](../backend/api/error-handling.md)
