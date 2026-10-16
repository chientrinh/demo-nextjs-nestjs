# Docker — Database (PostgreSQL)

Thư mục: `docker/database/`. Chạy PostgreSQL 16 với volume bền và healthcheck.

## Compose

`docker/database/docker-compose.yml`:

```yaml
services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: bistro
      POSTGRES_PASSWORD: bistro
      POSTGRES_DB: bistro
    ports:
      - "5432:5432"
    volumes:
      - bistro_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bistro -d bistro"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - bistro

volumes:
  bistro_pgdata:

networks:
  bistro:
    external: true
```

## Điểm quan trọng

- **Volume `bistro_pgdata`** giữ dữ liệu qua các lần restart. `docker compose down -v` sẽ **xóa** dữ liệu.
- **Healthcheck** `pg_isready` để backend `depends_on: condition: service_healthy` chờ DB sẵn sàng.
- Cổng `5432` chỉ nên lộ ra ngoài khi cần kết nối công cụ (psql/DBeaver). Production: **không** publish cổng; chỉ truy cập qua mạng nội bộ.
- `.env` của Postgres chỉ dùng **dev**. Production dùng secret mạnh.

## Kết nối

- Từ máy dev: `postgresql://bistro:bistro@localhost:5432/bistro`
- Từ container backend: `postgresql://bistro:bistro@database:5432/bistro?schema=public`

## Lệnh thường dùng

```bash
# dựng DB
docker compose -f docker/database/docker-compose.yml up -d

# vào psql
docker compose -f docker/database/docker-compose.yml exec database psql -U bistro -d bistro

# xem log
docker compose -f docker/database/docker-compose.yml logs -f database

# dừng (giữ dữ liệu)
docker compose -f docker/database/docker-compose.yml down

# dừng và XÓA dữ liệu (cẩn trọng)
docker compose -f docker/database/docker-compose.yml down -v
```

## Sao lưu / phục hồi

```bash
# sao lưu
docker compose -f docker/database/docker-compose.yml exec -T database \
  pg_dump -U bistro bistro > backup_$(date +%F).sql

# phục hồi
cat backup_2026-10-16.sql | \
  docker compose -f docker/database/docker-compose.yml exec -T database \
  psql -U bistro -d bistro
```

## Liên quan

- [`database-migrations.md`](./database-migrations.md)
- [`docker-backend.md`](./docker-backend.md)
