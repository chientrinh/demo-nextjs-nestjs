# Docker — Frontend (Next.js)

Thư mục: `docker/frontend/`. Image frontend chạy Next.js tại cổng `3000`.

## Dockerfile (multi-stage, standalone output)

Yêu cầu `next.config.js` đặt `output: 'standalone'`.

`docker/frontend/Dockerfile`:

```dockerfile
# ---- deps ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci

# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY frontend .
# NEXT_PUBLIC_* được nhúng LÚC BUILD
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

## Điểm quan trọng

- **`NEXT_PUBLIC_API_URL` nhúng lúc build**, không đổi được khi chạy. Truyền qua `--build-arg`. Đổi URL API → **build lại** image.
- `output: 'standalone'` tạo `server.js` + `.next/standalone` gọn cho image nhỏ.
- Nếu `NEXT_PUBLIC_API_URL` trỏ tới domain công khai, dùng domain thật (không dùng `localhost` khi build cho production).

## Compose

`docker/frontend/docker-compose.yml`:

```yaml
services:
  frontend:
    build:
      context: ../..
      dockerfile: docker/frontend/Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      NODE_ENV: production
    networks:
      - bistro

networks:
  bistro:
    external: true
```

## Build & chạy

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api \
  docker compose -f docker/frontend/docker-compose.yml up --build
```

## Lưu ý CORS

Trình duyệt gọi API từ origin của frontend. `CORS_ORIGIN` ở backend phải khớp origin này (ví dụ `http://localhost:3000` khi dev, domain thật khi production).

## Liên quan

- [`docker-backend.md`](./docker-backend.md)
- [`configuration.md`](./configuration.md)
