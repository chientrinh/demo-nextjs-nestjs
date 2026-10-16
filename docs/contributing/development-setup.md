# Thiết lập môi trường phát triển

## Yêu cầu

| Công cụ | Phiên bản |
| --- | --- |
| Node.js | ≥ 22 LTS |
| npm | ≥ 10 |
| Docker + Compose | mới nhất |
| Git | mới nhất |

## Các bước

### 1. Lấy mã nguồn

```bash
git clone <repo-url> the-bistro
cd the-bistro
```

### 2. Database

```bash
docker network create bistro 2>/dev/null || true
docker compose -f docker/database/docker-compose.yml up -d
```

### 3. Backend

```bash
cd backend
cp .env.example .env          # điền JWT_SECRET, JWT_REFRESH_SECRET
npm install
npx prisma migrate deploy     # hoặc migrate dev lần đầu
npx prisma generate
npm run start:dev
```

API: `http://localhost:3001/api` — Swagger: `http://localhost:3001/api/docs`.

### 4. Tạo người dùng đầu tiên

Không có đăng ký tự do. Tạo qua seed hoặc script:

```bash
npm run seed        # tạo admin mẫu (email/mật khẩu in ra console)
```

### 5. Frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm install
npm run dev
```

Dashboard: `http://localhost:3000`.

## Biến môi trường

Xem [`../operations/configuration.md`](../operations/configuration.md). **Không commit `.env`.**

## Lệnh thường dùng

| Việc | Backend | Frontend |
| --- | --- | --- |
| Chạy dev | `npm run start:dev` | `npm run dev` |
| Build | `npm run build` | `npm run build` |
| Lint | `npm run lint` | `npm run lint` |
| Test | `npm run test` | `npm run test` |
| Format | `npm run format` | `npm run format` |

## Kiểm tra nhanh sau khi dựng

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
```

## Liên quan

- [`../operations/environments.md`](../operations/environments.md)
- [`coding-standards.md`](./coding-standards.md)
