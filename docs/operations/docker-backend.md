# Docker — Backend (NestJS API)

Thư mục: `docker/backend/`. Image backend chạy API tại cổng `3001`.

## Dockerfile (multi-stage)

`docker/backend/Dockerfile` có **4 stage**:

```dockerfile
# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

# ---- dev (watch mode) ----
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
ENV NODE_ENV=development
ENV PORT=3001
EXPOSE 3001
CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend .
RUN npx prisma generate && npm run build

# ---- runtime (production) ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY backend/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
USER node
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

Lưu ý:

- Stage `dev` dùng cho **development** (hot-reload qua `npm run start:dev`), mount source code từ host qua volume — không copy toàn bộ `backend/` vào image.
- Stage `runtime` dùng cho **production**: chạy bundle đã biên dịch, tự migrate khi khởi động.
- `prisma generate` phải chạy **sau** khi copy schema (ở cả `dev` lẫn `build`).
- Stage `runtime` copy `node_modules` từ stage **`build`** (không phải `deps`) vì Prisma client đã được generate tại `build`.

## Compose

Có hai file compose riêng biệt:

### Development — `docker/backend/docker-compose.yml`

Dùng stage `dev`, mount source code để hot-reload:

```yaml
services:
  backend:
    build:
      context: ../..
      dockerfile: docker/backend/Dockerfile
      target: dev
    container_name: bistro-backend
    ports:
      - "3001:3001"
    volumes:
      - ../../backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL:-postgresql://bistro:bistro@database:5432/bistro?schema=public}
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET is required}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://localhost:3000,http://frontend:3000}
    networks:
      - bistro

networks:
  bistro:
    external: true
```

### Production — `docker/backend/docker-compose.prod.yml`

Dùng stage `runtime`, **không** có volume mount, JWT phải được cung cấp từ môi trường thật (không fallback):

```yaml
services:
  backend:
    build:
      context: ../..
      dockerfile: docker/backend/Dockerfile
      target: runtime
    container_name: bistro-backend-prod
    ports:
      - "127.0.0.1:3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: ${DATABASE_URL:-postgresql://bistro:bistro@database:5432/bistro?schema=public}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN:-http://frontend:3000}
    networks:
      - bistro

networks:
  bistro:
    external: true
```

> **Lưu ý production:** `JWT_SECRET` và `JWT_REFRESH_SECRET` không có giá trị mặc định — thiếu thì app fail-fast khi khởi động.

## Mạng & kết nối DB

- Backend gọi database qua **tên service** `database` (không dùng `localhost`).
- Mạng `bistro` tạo một lần: `docker network create bistro`, và các compose frontend/backend/database cùng tham gia.

## Migration khi khởi động

`CMD` chạy `prisma migrate deploy` trước khi start app. Với nhiều replica, cần chạy migration như một **job riêng** thay vì trong từng container (tránh đua). Xem [`database-migrations.md`](./database-migrations.md).

## Build & chạy

**Development:**

```bash
docker network create bistro 2>/dev/null || true
docker compose -f docker/backend/docker-compose.yml up --build
```

**Production:**

```bash
docker network create bistro 2>/dev/null || true
docker compose -f docker/backend/docker-compose.prod.yml up --build
```

Kiểm tra: `curl http://localhost:3001/api/health`.

## Liên quan

- [`0005-docker-per-layer-compose.md`](../adr/0005-docker-per-layer-compose.md)
- [`docker-database.md`](./docker-database.md)
- [`configuration.md`](./configuration.md)
