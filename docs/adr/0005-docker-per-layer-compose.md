# 0005 — Docker tách riêng từng layer

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật

## Bối cảnh

Ứng dụng gồm ba layer: frontend (Next.js), backend (NestJS), database (PostgreSQL). Cần môi trường phát triển cục bộ và đường triển khai tái lập được. Mỗi layer có vòng đời, ngôn ngữ, và tốc độ build khác nhau (Node vs image Postgres).

## Quyết định

Tách Docker theo **từng layer**, mỗi layer có `Dockerfile` và dịch vụ compose **riêng**, đặt trong `docker/`:

```
docker/
  backend/     # Dockerfile + compose cho API
  frontend/    # Dockerfile + compose cho Next.js
  database/    # compose cho PostgreSQL (volume + init)
```

Không dùng một Dockerfile "gộp" nhiều layer. Việc chạy toàn hệ thống được điều phối bằng cách gọi các compose tương ứng (hoặc một compose tổng tham chiếu các file con).

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Dockerfile theo layer (chọn)** | Build/cache độc lập; image nhỏ; tái dùng được | Nhiều file hơn; cần điều phối | — |
| Một Dockerfile đa-stage toàn hệ thống | Ít file | Trộn concern; image lớn; cache kém | Khó bảo trì |
| Không Docker (chạy native) | Nhanh khi dev | "Chạy được trên máy tôi"; khó tái lập | Không đủ tái lập |

## Hệ quả

**Tích cực:**
- Thay đổi frontend không ảnh hưởng cache build backend.
- Có thể chạy riêng database cho test mà không cần dựng cả hai app.

**Tiêu cực / đánh đổi:**
- Cần kỷ luật mạng nội bộ (service name) và biến môi trường giữa các compose.
- Điều phối "toàn stack" cần một điểm vào (script hoặc compose tổng).

**Việc cần làm kéo theo:**
- Mạng chung giữa các compose (external network) để backend gọi được `database`.
- Cổng: frontend `3000`, backend `3001`, Postgres `5432`.
- Multi-stage build cho Node để giảm kích thước image.

## Liên quan

- [`../operations/docker-backend.md`](../operations/docker-backend.md)
- [`../operations/docker-frontend.md`](../operations/docker-frontend.md)
- [`../operations/docker-database.md`](../operations/docker-database.md)
