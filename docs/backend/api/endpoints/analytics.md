# Endpoints — Analytics (Doanh thu & Chi phí)

Base: `/api`. Kiểu tiền: số nguyên USD. Ngày: `YYYY-MM-DD`. Đặc tả dữ liệu: [`../../database/schema.md`](../../database/schema.md).

<a id="analytics"></a>

## `GET /api/analytics/weekly-trend`

Dữ liệu cho biểu đồ Home: 7 ngày (cột doanh thu POS, cột doanh thu Eatclub, đường chi phí nhân công) + danh sách bán hàng/sự kiện ghim.

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
- `posRevenue` là **tổng** `event_annotations.amount` có `source = 'POS'` và `eventDate = date`.
- `eatclubRevenue` là **tổng** `event_annotations.amount` có `source = 'EATCLUB'` và `eventDate = date`.
- `labourCost` là **tổng** `labour_costs.amount` của ngày đó (mọi bộ phận).
- `events` gồm các `event_annotations` có `eventDate` trong tuần.

**Liên quan:** [`../../features/revenue-analytics/home.md`](../../../features/revenue-analytics/home.md), [`../../frontend/components/charts.md`](../../../frontend/components/charts.md).

## `GET /api/analytics/summary`

KPI tổng hợp cho khoảng ngày.

**Query:** `from`, `to` (bắt buộc).

**Response `200`**

```json
{
  "totalRevenue": 16110,
  "averagePerDay": 2301,
  "totalCovers": 14,
  "daysWithData": 7
}
```

| Field | Công thức |
| --- | --- |
| `totalRevenue` | `SUM(event_annotations.amount)` trong khoảng (cả POS + EATCLUB) |
| `averagePerDay` | `totalRevenue / số ngày trong khoảng` (làm tròn tới đô-la) |
| `totalCovers` | `COUNT(event_annotations)` (tổng số giao dịch / lần bán trong khoảng) |
| `daysWithData` | số ngày có ít nhất một bản ghi bán hàng phát sinh |

`averagePerDay` chia cho **số ngày lịch** trong khoảng (`to - from + 1`), không phải số ngày có dữ liệu.
