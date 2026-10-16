# Docker — Backend (NestJS API)

Thư mục: `docker/backend/`. Image backend chạy API tại cổng `3001`.

## Dockerfile (multi-stage)

`docker/backend/Dockerfile`:

```dockerfile
# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend .
RUN npx prisma generate && npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

Lưu ý:

- `prisma generate` phải chạy **sau** khi copy schema.
- Runtime copy `node_modules` từ stage `deps` (đã có Prisma client sau `generate` ở build; nếu client sinh ở build, copy từ `build` để chắc chắn).

## Compose

`docker/backend/docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: ../..
      dockerfile: docker/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://bistro:bistro@database:5432/bistro?schema=public
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: http://frontend:3000
    depends_on:
      database:
        condition: service_healthy
    networks:
      - bistro

networks:
  bistro:
    external: true
```

## Mạng & kết nối DB

- Backend gọi database qua **tên service** `database` (không dùng `localhost`).
- Mạng `bistro` tạo một lần: `docker network create bistro`, và các compose frontend/backend/database cùng tham gia.

## Migration khi khởi động

`CMD` chạy `prisma migrate deploy` trước khi start app. Với nhiều replica, cần chạy migration như một **job riêng** thay vì trong từng container (tránh đua). Xem [`database-migrations.md`](./database-migrations.md).

## Build & chạy

```bash
docker network create bistro 2>/dev/null || true
docker compose -f docker/backend/docker-compose.yml up --build
```

Kiểm tra: `curl http://localhost:3001/api/health`.

## Liên quan

- [`0005-docker-per-layer-compose.md`](../adr/0005-docker-per-layer-compose.md)
- [`docker-database.md`](./docker-database.md)
- [`configuration.md`](./configuration.md)
