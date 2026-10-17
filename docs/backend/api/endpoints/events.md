# Endpoints — Sự kiện (Event Annotations)

Base: `/api/events`. Đặc tả nghiệp vụ: [`../../features/events/create-event.md`](../../../features/events/create-event.md). Dữ liệu: [`../../database/schema.md`](../../database/schema.md).

## `GET /api/events`

Danh sách sự kiện trong khoảng ngày.

**Query**

| Tham số | Kiểu | Ràng buộc |
| --- | --- | --- |
| `from` | date | bắt buộc |
| `to` | date | bắt buộc, ≥ `from` |
| `source` | enum | tùy chọn: `POS` \| `EATCLUB` |
| `shift` | enum | tùy chọn: `CA_NGAY` \| `CA_TRUA` \| `CA_TOI` \| `CA_DEM` |
| `page` / `pageSize` | int | mặc định 1 / 20 |

**Response `200`**

```json
{
  "data": [
    {
      "id": "e1…", "title": "Live nhạc tối thứ Bảy", "source": "POS",
      "amount": 2500000, "eventDate": "2026-10-17", "shift": "CA_TOI",
      "note": "Ban nhạc 5 người", "createdAt": "2026-10-16T09:12:00.000Z"
    }
  ],
  "meta": { "total": 3, "page": 1, "pageSize": 20 }
}
```

## `POST /api/events` — ADMIN, MANAGER

Tạo sự kiện để ghim lên biểu đồ.

**Request**

```json
{
  "title": "Live nhạc tối thứ Bảy",
  "source": "POS",
  "amount": 2500000,
  "eventDate": "2026-10-17",
  "shift": "CA_TOI",
  "note": "Ban nhạc 5 người"
}
```

| Field | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| `title` | string | **bắt buộc, 1–80 ký tự** | Cắt khoảng trắng đầu/cuối |
| `source` | enum | `POS` \| `EATCLUB` | Nguồn bị ảnh hưởng |
| `amount` | number | số nguyên, **có thể âm** | Ảnh hưởng USD; âm = giảm |
| `eventDate` | date | `YYYY-MM-DD` | |
| `shift` | enum | `CA_NGAY` \| `CA_TRUA` \| `CA_TOI` \| `CA_DEM` | |
| `note` | string? | ≤ 500 | |

**Response `201`:** sự kiện vừa tạo.
**Lỗi:** `400 VALIDATION_ERROR` (bao gồm `title` > 80 ký tự), `403 FORBIDDEN`.

> `amount` **được phép âm** — khác với `revenue`/`labour`. Dùng để biểu diễn sự kiện làm giảm doanh thu (ví dụ mất điện, hủy show).

## `PATCH /api/events/:id` — ADMIN, MANAGER

Cập nhật một phần; mọi field tùy chọn, cùng ràng buộc như `POST`.

**Response `200`:** sự kiện đã cập nhật. **Lỗi:** `400`, `404`, `403`.

## `DELETE /api/events/:id` — ADMIN, MANAGER

**Response:** `204`. **Lỗi:** `404`, `403`.

## Ghi chú tương tác với biểu đồ

Frontend lấy sự kiện từ `GET /api/analytics/weekly-trend` (đã gộp sẵn) để tránh hai lần gọi. Endpoint `GET /api/events` dùng cho trang danh sách/chỉnh sửa. Sau khi tạo/sửa/xóa, frontend invalidate query key `analytics` để biểu đồ vẽ lại annotation.
