# 0001 — Bố cục monorepo (frontend / backend / docker)

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-16
- **Người quyết định:** Nhóm kỹ thuật

## Bối cảnh

Dự án gồm ba phần rõ ràng: ứng dụng Next.js (dashboard), API NestJS, và PostgreSQL. Cần một cách tổ chức mã nguồn cho phép phát triển, kiểm thử, và triển khai từng phần độc lập mà vẫn đặt cạnh nhau để dễ đồng bộ schema/API. Nhóm nhỏ, một địa điểm, không cần chia nhiều repository gây phân mảnh phiên bản.

## Quyết định

Dùng **một repository (monorepo)** với ba thư mục cấp cao:

```
frontend/    # Next.js (App Router)
backend/     # NestJS API
docker/      # compose + Dockerfile theo từng layer
docs/        # tài liệu (bộ này)
```

Frontend và backend có `package.json` riêng, dùng chung một `docs/` và một `.git`.

## Phương án đã cân nhắc

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Monorepo (chọn)** | Đồng bộ API/schema dễ; một PR xuyên tầng; một CI | Cần kỷ luật ranh giới thư mục | — |
| Polyrepo | Tách biệt triển khai, quyền truy cập | Đồng bộ phiên bản thủ công; PR xuyên tầng khó | Quá cồng kềnh cho nhóm nhỏ |
| Turborepo/Nx | Cache, phụ thuộc tường minh | Thêm công cụ, độ phức tạp | Chưa cần ở quy mô hiện tại |

## Hệ quả

**Tích cực:**
- Một chỗ cho toàn bộ ngữ cảnh; agent đọc `docs/` + code cùng repo.
- Thay đổi API và consumer đi cùng một PR.

**Tiêu cực / đánh đổi:**
- Phải tự giữ ranh giới (không import chéo frontend ↔ backend).
- Build/CI phải lọc theo thư mục khi chỉ một bên thay đổi.

**Việc cần làm kéo theo:**
- `.gitignore` gốc ignore `docs` (tài liệu không được track — chủ ý).
- Mỗi bên có script `build`, `test`, `lint` riêng.

## Liên quan

- [`../architecture/system-overview.md`](../architecture/system-overview.md)
- [`0005-docker-per-layer-compose.md`](./0005-docker-per-layer-compose.md)
