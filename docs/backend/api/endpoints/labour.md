# Endpoints — Nhân công (Labour Costs)

Base: `/api/labour`. Đặc tả nghiệp vụ: [`../../features/labour-cost/create-labour-cost.md`](../../../features/labour-cost/create-labour-cost.md). Dữ liệu: [`../../database/schema.md`](../../database/schema.md).

## `GET /api/labour`

Danh sách chi phí nhân công trong khoảng ngày, tùy chọn lọc theo bộ phận.

**Query**

| Tham số | Kiểu | Ràng buộc |
| --- | --- | --- |
| `from` | date | bắt buộc |
| `to` | date | bắt buộc, ≥ `from` |
| `department` | enum | tùy chọn: `FOH` \| `BOH` \| `MANAGEMENT` \| `STEWARD` |
| `paymentMethod` | enum | tùy chọn: `CASH_TILL` \| `BANK_TRANSFER` \| `PETTY_CASH` |
| `page` / `pageSize` | int | mặc định 1 / 20 |

**Response `200`**

```json
{
  "data": [
    {
      "id": "l1…", "expenseDate": "2026-10-12", "amount": 1800000,
      "department": "FOH", "paymentMethod": "CASH_TILL",
      "note": "Ca tối 4 người", "createdAt": "2026-10-12T14:00:00.000Z"
    }
  ],
  "meta": { "total": 12, "page": 1, "pageSize": 20 }
}
```

## `POST /api/labour` — ADMIN, MANAGER

Ghi một khoản chi phí nhân công.

**Request**

```json
{
  "expenseDate": "2026-10-12",
  "amount": 1800000,
  "department": "FOH",
  "paymentMethod": "CASH_TILL",
  "note": "Ca tối 4 người"
}
```

| Field | Kiểu | Ràng buộc |
| --- | --- | --- |
| `expenseDate` | date | `YYYY-MM-DD` |
| `amount` | number | số nguyên **> 0** (USD) |
| `department` | enum | `FOH` \| `BOH` \| `MANAGEMENT` \| `STEWARD` |
| `paymentMethod` | enum | `CASH_TILL` \| `BANK_TRANSFER` \| `PETTY_CASH` |
| `note` | string? | ≤ 500 |

**Response `201`:** bản ghi vừa tạo.
**Lỗi:** `400 VALIDATION_ERROR`, `403 FORBIDDEN`.

> Nhiều bản ghi labour cho **cùng ngày cùng bộ phận** là hợp lệ (khác bảng `revenue`). Không có ràng buộc duy nhất.

## `PATCH /api/labour/:id` — ADMIN, MANAGER

Cập nhật một phần; cùng ràng buộc như `POST` cho các field được gửi.

**Response `200`:** bản ghi đã cập nhật. **Lỗi:** `400`, `404`, `403`.

## `DELETE /api/labour/:id` — ADMIN, MANAGER

**Response:** `204`. **Lỗi:** `404`, `403`.

## Tương tác với Analytics

`GET /api/analytics/weekly-trend` tổng hợp `labour_costs.amount` **theo ngày** thành chuỗi `labourCost` cho biểu đồ. Sổ nhật ký (ledger) trên trang Labour dùng `GET /api/labour` với đầy đủ trường. Sau khi ghi, frontend invalidate cả `['labour']` lẫn `['analytics']`.
