# Tính năng — Ghi chi phí nhân công (create-labour-cost)

## Mục tiêu

Ghi từng khoản chi phí nhân công theo ngày và bộ phận, hiển thị trong sổ nhật ký (ledger) và cộng vào chuỗi "Labour Costs" trên biểu đồ Home.

## Vai trò

`ADMIN`, `MANAGER`. `ANALYST` chỉ xem.

## Route

`/forms/labour-cost` → `src/app/[locale]/(admin)/forms/labour-cost/page.tsx` (page mỏng, import từ `modules/labour`), gồm `LabourCostForm` (`modules/labour/ui/labour-form/`). Sổ nhật ký `LabourLedgerTable` (`modules/labour/ui/labour-ledger/`) **chưa triển khai**.

## Bố cục

Theo mockup `docs/design/create-labour-cost.html`:

1. **Form** (trái/trên): ngày, số tiền (USD, có định dạng + đọc thành chữ), bộ phận, phương thức thanh toán, ghi chú.
2. **Sổ nhật ký** (phải/dưới): bảng các khoản chi, tổng theo bộ phận, phân trang.

## Field & ràng buộc

| Field | UI | Kiểu | Ràng buộc |
| --- | --- | --- | --- |
| `expenseDate` | Date picker | date | `YYYY-MM-DD`, bắt buộc |
| `amount` | `CurrencyInput` | number | số nguyên **> 0** (USD) |
| `department` | Select | enum | `FOH` \| `BOH` \| `MANAGEMENT` \| `STEWARD` |
| `paymentMethod` | Select | enum | `CASH_TILL` \| `BANK_TRANSFER` \| `PETTY_CASH` |
| `note` | Textarea | string? | ≤ 500 ký tự |

**Đọc số thành chữ:** dưới ô số tiền hiển thị bản đọc tiếng Anh ("One million eight hundred thousand dollars") để giảm sai sót khi nhập.

## API

**`POST /api/labour`**

```json
{
  "expenseDate": "2026-10-12",
  "amount": 1800000,
  "department": "FOH",
  "paymentMethod": "CASH_TILL",
  "note": "Ca tối 4 người"
}
```

**`GET /api/labour?from=…&to=…&department=…`** — cho sổ nhật ký (lọc theo ngày/bộ phận, phân trang).

Chi tiết: [`../backend/api/endpoints/labour.md`](../../backend/api/endpoints/labour.md).

Sau thành công: invalidate `['labour']` và `['analytics']`, toast, reset form (giữ `expenseDate` và `department` để nhập tiếp cho nhanh).

## Dữ liệu

Bảng `labour_costs`. **Nhiều bản ghi cùng ngày cùng bộ phận là hợp lệ** (khác `revenue`). Xem [`../backend/database/schema.md`](../../backend/database/schema.md#labourcost).

## Sổ nhật ký (ledger)

| Cột | Nội dung |
| --- | --- |
| Ngày | `expenseDate` |
| Số tiền | `amount` định dạng USD, `tabular-nums` |
| Bộ phận | Nhãn tiếng Việt của `department` |
| Phương thức | Nhãn của `paymentMethod` |
| Ghi chú | `note` (cắt nếu dài) |

Kèm **tổng** theo bộ phận cho khoảng đang lọc. Phân trang theo `page`/`pageSize`.

## Tiêu chí chấp nhận

- [ ] Gửi hợp lệ → `201`, dòng mới xuất hiện đầu sổ nhật ký, tổng cập nhật.
- [ ] `amount` ≤ 0 hoặc không nguyên → lỗi validate.
- [ ] Thiếu `department` hoặc `paymentMethod` → lỗi field.
- [ ] Bản đọc số tiền thành chữ khớp giá trị nhập.
- [ ] Lọc sổ theo bộ phận/ngày hoạt động, tổng phản ánh bộ lọc.
- [ ] Chuỗi "Labour Costs" trên Home tăng đúng sau khi ghi.
- [ ] `ANALYST` cố gửi → `403`.
- [ ] Reset form giữ `expenseDate` + `department` cho lần nhập kế tiếp.

## Trường hợp biên

| Tình huống | Hành vi |
| --- | --- |
| Hai khoản cùng ngày cùng bộ phận | Cho phép |
| `amount` rất lớn (> 10 chữ số) | Chặn ở validate (giới hạn hợp lý, ví dụ ≤ 10^12) |
| Ghi chú > 500 | Chặn, đếm ký tự |
| Sổ rỗng | "Chưa có chi phí nào" + tổng `$0` |
| Lọc trả về rỗng | Hiển thị rỗng, giữ bộ lọc |

## Đọc số thành chữ

Hàm thuần `readEnglishAmount(n: number): string` sống ở `src/modules/shared/lib/format.ts`, có unit test với các mốc: `0` → `"Zero dollars"`, `1000` → `"One thousand dollars"`, `1500000` → `"One million five hundred thousand dollars"`, `1800000` → `"One million eight hundred thousand dollars"`, `1234567` → `"One million two hundred thirty-four thousand five hundred sixty-seven dollars"`. Không dùng thư viện ngoài nếu chưa có trong stack.

## Kiểm thử

- e2e: tạo hợp lệ; `amount` ≤ 0 → `400`; `ANALYST` → `403`; lọc theo bộ phận.
- Unit: `readEnglishAmount` các mốc trên.
- Component: validate field; tổng ledger cập nhật; reset giữ ngày/bộ phận.

## Liên quan

- Form & validate: [`../frontend/forms-and-validation.md`](../../frontend/forms-and-validation.md)
- Endpoint: [`../backend/api/endpoints/labour.md`](../../backend/api/endpoints/labour.md)
- Mockup: `docs/design/create-labour-cost.html`
