# Hợp đồng API — Tổng quan

## Nguyên tắc chung

- **Base URL:** `https://<host>/api` (cục bộ: `http://localhost:3001/api`).
- **Định dạng:** JSON cho cả request và response. Header bắt buộc khi có body: `Content-Type: application/json`.
- **Xác thực:** Bearer JWT trên mọi endpoint trừ `POST /api/auth/login` và `POST /api/auth/refresh`.
- **Ngày:** tham số và field ngày dùng `YYYY-MM-DD` (date-only).
- **Tiền:** số nguyên VND trong JSON (`"amount": 1250000`).
- **Enum:** UPPER_SNAKE_CASE, khớp [`database/schema.md`](../database/schema.md).
- **Tên khóa JSON:** `camelCase` (`entryDate`, `paymentMethod`, `totalRevenue`), khớp field Prisma. Khác tên cột DB `snake_case`. Frontend chỉ thêm `src/modules/<x>/data/dtos` khi hình dạng API khác domain — xem [`../../frontend/data-fetching.md`](../../frontend/data-fetching.md).

## Versioning

Giai đoạn này **không** đặt version trong URL. Khi cần thay đổi phá vỡ, thêm tiền tố `/api/v2` và giữ `/api` cho bản hiện hành trong một chu kỳ. Ghi lại quyết định bằng ADR.

## Định dạng response

**Đối tượng/collection đơn giản** trả trực tiếp:

```json
{ "id": "…", "entryDate": "2026-10-12", "source": "POS", "amount": 8200000, "covers": 142 }
```

**Danh sách** trả về mảng phẳng khi tập nhỏ và có phân trang khi có thể lớn:

```json
{
  "data": [ /* … */ ],
  "meta": { "total": 128, "page": 1, "pageSize": 20 }
}
```

**Tạo mới** trả `201 Created` kèm đối tượng vừa tạo. **Xóa** trả `204 No Content`.

## Tham số lọc chung

Các endpoint danh sách (`revenue`, `labour`, `events`) hỗ trợ tối thiểu:

| Tham số | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `from` | date | Ngày bắt đầu (bao gồm) |
| `to` | date | Ngày kết thúc (bao gồm) |
| `page` | int ≥ 1 | Trang (mặc định 1) |
| `pageSize` | int 1–100 | Kích thước trang (mặc định 20) |

Endpoint `analytics` dùng `weekStart` (thứ Hai của tuần cần xem) thay cho `from`/`to`.

## Mã trạng thái

| Mã | Khi nào |
| --- | --- |
| 200 OK | Đọc/sửa thành công |
| 201 Created | Tạo thành công |
| 204 No Content | Xóa thành công |
| 400 Bad Request | Dữ liệu không hợp lệ (validate DTO thất bại) |
| 401 Unauthorized | Thiếu/hỏng access token |
| 403 Forbidden | Đã xác thực nhưng thiếu vai trò |
| 404 Not Found | Không tìm thấy tài nguyên |
| 409 Conflict | Vi phạm ràng buộc duy nhất (ví dụ `(entryDate, source)`) |
| 422 Unprocessable Entity | Vi phạm quy tắc nghiệp vụ (ngoài validate hình thức) |
| 429 Too Many Requests | Vượt rate limit (đăng nhập) |
| 500 Internal Server Error | Lỗi không lường trước |

Định dạng body lỗi: [`error-handling.md`](./error-handling.md).

## Danh mục endpoint

| Nhóm | Tiền tố | Đặc tả |
| --- | --- | --- |
| Xác thực | `/api/auth` | [`endpoints/auth.md`](./endpoints/auth.md) |
| Doanh thu | `/api/revenue` | [`endpoints/revenue.md`](./endpoints/revenue.md) |
| Sự kiện | `/api/events` | [`endpoints/events.md`](./endpoints/events.md) |
| Nhân công | `/api/labour` | [`endpoints/labour.md`](./endpoints/labour.md) |
| Analytics | `/api/analytics` | [`endpoints/revenue.md`](./endpoints/revenue.md#analytics) |
| Người dùng | `/api/users` | [`endpoints/auth.md`](./endpoints/auth.md#users) |

## Swagger

Tài liệu tương tác sinh tự động ở `/api/docs` (dev). Trong production, tắt hoặc bảo vệ (xem [`../architecture/security.md`](../../architecture/security.md)).
