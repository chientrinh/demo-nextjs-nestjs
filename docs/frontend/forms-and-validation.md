# Form & Validation

Hai form nhập liệu (Event và Labour) dùng **React Hook Form** + **Zod** qua `@hookform/resolvers/zod`. Schema Zod là **nguồn validate duy nhất** phía client và sinh ra type cho payload.

Schema sống ở **`modules/<feature>/domain/`** (`modules/events/domain/event.ts`, `modules/labour/domain/labour.ts`, `modules/auth/domain/credentials.ts`) — không đặt ở thư mục dùng chung, vì ràng buộc gắn với từng tính năng.

## Nguyên tắc

1. **Schema trước, form sau.** Định nghĩa schema Zod, suy ra type bằng `z.infer`, rồi mới dựng form.
2. **Validate phía client để UX, phía server để tin cậy.** Backend luôn validate lại (class-validator); client không thay thế được.
3. **Thông điệp lỗi tiếng Việt**, hiển thị ngay dưới field.
4. **Không double-source.** Ràng buộc (ví dụ `title ≤ 80`) khai báo một lần ở schema, không lặp ở component.

## Khuôn mẫu chung

```ts
// src/modules/events/domain/event.ts
import { z } from 'zod';

export const eventNoteSchema = z.object({
  title: z.string().trim().min(1, 'Tiêu đề là bắt buộc').max(80, 'Tiêu đề không vượt quá 80 ký tự'),
  source: z.enum(['POS', 'EATCLUB']),
  amount: z.number().int('Số tiền phải là số nguyên'),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo định dạng YYYY-MM-DD'),
  shift: z.enum(['CA_NGAY', 'CA_TRUA', 'CA_TOI', 'CA_DEM']),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});
export type EventNoteInput = z.infer<typeof eventNoteSchema>;
```

```ts
const form = useForm<EventNoteInput>({ resolver: zodResolver(eventNoteSchema), defaultValues: {...} });
```

## Các field chuyên biệt

### Tiền tệ USD

Input tiền dùng `CurrencyInput` — component UI toàn cục đặt ở `src/shared/components/form/CurrencyInput.tsx` (xem [`../design/components.md`](../design/components.md)):

- Người dùng gõ số, hiển thị phân tách nghìn (`1,234,567`).
- Giá trị lưu trong form là **số nguyên** (`number`), không phải chuỗi có dấu phân cách.
- Không cho nhập phần thập phân.

```ts
amount: z.number({ invalid_type_error: 'Vui lòng nhập số tiền' })
  .int('Số tiền phải là số nguyên')
  .min(0, 'Số tiền không được âm'),
```

### Ngày

Dùng date picker trả về chuỗi `YYYY-MM-DD`. Không dùng `Date` object để tránh lệch timezone.

### Chọn nguồn / bộ phận / ca

Dùng radio group (nguồn) và select (bộ phận, ca, phương thức thanh toán) theo component TailAdmin (`RadioButtons`, `SelectInputs`). Nhãn hiển thị tiếng Việt, giá trị là enum.

| Enum | Nhãn UI |
| --- | --- |
| `POS` | Tại quầy (POS) |
| `EATCLUB` | Eatclub |
| `FOH` | Phục vụ (FOH) |
| `BOH` | Bếp (BOH) |
| `MANAGEMENT` | Quản lý |
| `STEWARD` | Tạp vụ |
| `CASH_TILL` | Tiền mặt két |
| `BANK_TRANSFER` | Chuyển khoản |
| `PETTY_CASH` | Quỹ lẻ |
| `CA_NGAY` / `CA_TRUA` / `CA_TOI` / `CA_DEM` | Ca ngày / trưa / tối / đêm |

## Xử lý lỗi từ server

Lỗi `VALIDATION_ERROR` từ backend chứa `details: [{ field, message }]`. Map vào `setError` của React Hook Form:

```ts
catch (e) {
  if (e instanceof ApiError && e.code === 'VALIDATION_ERROR') {
    (e.details as { field: string; message: string }[]).forEach((d) =>
      form.setError(d.field as keyof EventNoteInput, { message: d.message })
    );
  }
}
```

Lỗi toàn form (ví dụ `DUPLICATE_REVENUE_ENTRY`) hiển thị qua `setError('root', ...)` hoặc toast.

## Trạng thái submit

- Nút submit bị `disabled` khi `isSubmitting`.
- Chặn double-submit: `handleSubmit` chỉ chạy một lần mỗi lần bấm; nút hiển thị spinner.
- Thành công → toast + điều hướng về `/` (xem [`routing.md`](./routing.md#sau-khi-chuyển-trang)).

## Quick-fill (chỉ form Event)

Form Event có các nút điền nhanh (presets) đặt sẵn `source`/`shift`/`amount` gợi ý; chúng gọi `form.setValue(...)`, không bỏ qua validate.

## Ràng buộc riêng từng form

| Form | Schema | Ràng buộc đặc thù |
| --- | --- | --- |
| Event | `modules/events/domain/event.ts` | `title` ≤ 80; `amount` **≥ 0** (không cho phép âm) |
| Labour | `modules/labour/domain/labour.ts` | `amount` **> 0**; `department`/`paymentMethod` bắt buộc |

Chi tiết đầy đủ: [`../features/events/create-event.md`](../features/events/create-event.md), [`../features/labour-cost/create-labour-cost.md`](../features/labour-cost/create-labour-cost.md).

## Liên quan

- Endpoint nhận payload: [`../backend/api/endpoints/events.md`](../backend/api/endpoints/events.md), [`../backend/api/endpoints/labour.md`](../backend/api/endpoints/labour.md)
- Định dạng lỗi: [`../backend/api/error-handling.md`](../backend/api/error-handling.md)
- Component form toàn cục TailAdmin: `src/shared/components/form/`
- Nhãn enum tiếng Việt: `modules/shared/domain/labels.ts`
