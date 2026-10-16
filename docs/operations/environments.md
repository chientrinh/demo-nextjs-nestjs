# Môi trường

Ba môi trường: **development** (máy dev), **staging** (kiểm thử trước phát hành, tùy chọn), **production**.

## Cổng

| Layer | Dev | Ghi chú |
| --- | --- | --- |
| Frontend (Next.js) | `3000` | `http://localhost:3000` |
| Backend (NestJS) | `3001` | API tại `http://localhost:3001/api` |
| PostgreSQL | `5432` | Chỉ lộ ra ngoài khi cần |

## Biến môi trường & tiền tố

| Layer | File mẫu | Tiền tố công khai |
| --- | --- | --- |
| Backend | `backend/.env.example` | Không có (server-only) |
| Frontend | `frontend/.env.example` | `NEXT_PUBLIC_` cho biến ra client |

Chi tiết đầy đủ: [`configuration.md`](./configuration.md).

## Development

- Chạy Postgres (Docker hoặc native), backend và frontend chạy native (hot reload) hoặc trong Docker.
- `NODE_ENV=development`; log cấp độ `debug`; Swagger bật ở `/api/docs`.
- Refresh cookie **không** `Secure` (chạy HTTP cục bộ).

## Production

- `NODE_ENV=production`; log cấp độ `info`.
- Swagger **tắt** hoặc chỉ sau xác thực.
- Cookie `Secure` + `SameSite=Strict`; bắt buộc HTTPS.
- Secrets nạp từ secret manager / biến môi trường của nền tảng, **không** commit.
- `prisma migrate deploy` chạy khi khởi động (xem [`database-migrations.md`](./database-migrations.md)).

## Khác biệt then chốt

| | Development | Production |
| --- | --- | --- |
| `NODE_ENV` | development | production |
| Swagger | bật | tắt |
| Cookie `Secure` | tắt | bật |
| Log level | debug | info |
| Migration | `migrate dev` | `migrate deploy` |
| `CORS_ORIGIN` | `http://localhost:3000` | domain thật |

## Quy tắc

1. **Không commit `.env`.** Chỉ commit `.env.example`.
2. **Không dùng chung database** giữa các môi trường.
3. **Không bật `synchronize`/tự đổi schema** ở production — dùng migration.

## Liên quan

- [`configuration.md`](./configuration.md) — danh sách biến đầy đủ
- [`../contributing/development-setup.md`](../contributing/development-setup.md)
