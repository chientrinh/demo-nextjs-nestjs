# Endpoints — Doanh thu & Analytics

Base: `/api`. Kiểu tiền: số nguyên VND. Ngày: `YYYY-MM-DD`. Đặc tả dữ liệu: [`../../database/schema.md`](../../database/schema.md).

## `GET /api/revenue`

Danh sách bản ghi doanh thu trong khoảng ngày.

**Query**

| Tham số | Kiểu | Ràng buộc |
| --- | --- | --- |
| `from` | date | bắt buộc |
| `to` | date | bắt buộc, ≥ `from` |
| `source` | enum | tùy chọn: `POS` \| `EATCLUB` |
| `page` / `pageSize` | int | mặc định 1 / 20 |

**Response `200`**

```json
{
  "data": [
    { "id": "r1…", "entryDate": "2026-10-12", "source": "POS", "amount": 8200000, "covers": 142, "note": null }
  ],
  "meta": { "total": 14, "page": 1, "pageSize": 20 }
}
```

## `POST /api/revenue` — ADMIN, MANAGER

Tạo bản ghi doanh thu. `(entryDate, source)` phải chưa tồn tại.

**Request**

```json
{ "entryDate": "2026-10-12", "source": "POS", "amount": 8200000, "covers": 142, "note": null }
```

| Field | Kiểu | Ràng buộc |
| --- | --- | --- |
| `entryDate` | date | `YYYY-MM-DD` |
| `source` | enum | `POS` \| `EATCLUB` |
| `amount` | number | số nguyên ≥ 0 (VND) |
| `covers` | number | số nguyên ≥ 0, mặc định 0 |
| `note` | string? | ≤ 500 |

**Response `201`:** bản ghi vừa tạo.
**Lỗi:** `400 VALIDATION_ERROR`, `409 DUPLICATE_REVENUE_ENTRY`, `403 FORBIDDEN`.

## `PATCH /api/revenue/:id` — ADMIN, MANAGER

Cập nhật một phần (`amount`, `covers`, `note`). Không cho đổi `entryDate`/`source` nếu sẽ trùng khóa.

**Response `200`:** bản ghi đã cập nhật. **Lỗi:** `404`, `409`, `403`.

## `DELETE /api/revenue/:id` — ADMIN, MANAGER

**Response:** `204`. **Lỗi:** `404`, `403`.

---

<a id="analytics"></a>

## `GET /api/analytics/weekly-trend`

Dữ liệu cho biểu đồ Home: 7 ngày + sự kiện ghim.

**Query**

| Tham số | Kiểu | Ràng buộc |
| --- | --- | --- |
| `weekStart` | date | bắt buộc; phải là **thứ Hai** |

**Response `200`**

```json
{
  "weekStart": "2026-10-12",
  "days": [
    { "date": "2026-10-12", "posRevenue": 8200000, "eatclubRevenue": 1450000, "labourCost": 3100000 },
    { "date": "2026-10-13", "posRevenue": 0, "eatclubRevenue": 0, "labourCost": 0 }
  ],
  "events": [
    { "id": "e1…", "title": "Live nhạc tối thứ Bảy", "source": "POS", "amount": 2500000, "eventDate": "2026-10-17", "shift": "CA_TOI" }
  ]
}
```

Quy tắc:

- `days` luôn có **đúng 7 phần tử**, từ `weekStart` đến `weekStart + 6`. Ngày không có dữ liệu vẫn xuất hiện với giá trị `0`.
- `posRevenue`/`eatclubRevenue` lấy từ `revenue_entries` theo `source`.
- `labourCost` là **tổng** `labour_costs.amount` của ngày đó (mọi bộ phận).
- `events` gồm các `event_annotations` có `eventDate` trong tuần.

**Liên quan:** [`../../features/revenue-analytics/home.md`](../../../features/revenue-analytics/home.md), [`../../frontend/components/charts.md`](../../../frontend/components/charts.md).

## `GET /api/analytics/summary`

KPI tổng hợp cho khoảng ngày.

**Query:** `from`, `to` (bắt buộc).

**Response `200`**

```json
{
  "totalRevenue": 16110000,
  "averagePerDay": 2301000,
  "totalCovers": 905,
  "daysWithData": 7
}
```

| Field | Công thức |
| --- | --- |
| `totalRevenue` | `SUM(revenue_entries.amount)` trong khoảng (cả POS + EATCLUB) |
| `averagePerDay` | `totalRevenue / số ngày trong khoảng` (làm tròn tới đồng) |
| `totalCovers` | `SUM(revenue_entries.covers)` |
| `daysWithData` | số ngày có ít nhất một bản ghi doanh thu |

`averagePerDay` chia cho **số ngày lịch** trong khoảng (`to - from + 1`), không phải số ngày có dữ liệu.
