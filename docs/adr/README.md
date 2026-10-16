# Biên bản quyết định kiến trúc (ADR)

ADR ghi lại **quyết định kiến trúc quan trọng**, bối cảnh, và hệ quả — để agent và người sau hiểu *vì sao* hệ thống như hiện tại, không chỉ *như thế nào*.

## Danh sách

| Mã | Quyết định | Trạng thái |
| --- | --- | --- |
| [0001](./0001-monorepo-layout.md) | Bố cục monorepo (frontend / backend / docker) | Accepted |
| [0002](./0002-prisma-orm.md) | Dùng Prisma làm ORM | Accepted |
| [0003](./0003-jwt-passport-auth.md) | Xác thực bằng JWT + Passport | Accepted |
| [0004](./0004-single-location-scope.md) | Phạm vi một địa điểm (không đa chi nhánh) | Accepted |
| [0005](./0005-docker-per-layer-compose.md) | Docker tách riêng từng layer | Accepted |

## Khi nào viết một ADR

Viết khi quyết định: khó đảo ngược, ảnh hưởng nhiều module, hoặc có nhiều phương án hợp lý. Ví dụ: đổi ORM, đổi cơ chế xác thực, thay đổi phạm vi dữ liệu (thêm đa chi nhánh), đổi chiến lược triển khai.

**Không** viết ADR cho: chọn tên biến, chi tiết UI, refactor nhỏ.

## Quy trình

1. Sao chép [`template.md`](./template.md) thành `NNNN-tieu-de-ngan.md` (số tăng dần, bốn chữ số).
2. Điền Context / Decision / Consequences (kèm Alternatives đã cân nhắc).
3. Đặt trạng thái `Proposed`, thảo luận, rồi chuyển `Accepted`.
4. **Không sửa nội dung ADR đã Accepted.** Thay đổi sau đó → ADR mới, và đánh dấu ADR cũ `Superseded by NNNN`.
5. Cập nhật bảng danh sách ở trên.

## Trạng thái

`Proposed` → `Accepted` → (`Deprecated` | `Superseded by NNNN`).
