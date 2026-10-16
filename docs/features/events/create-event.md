# Tính năng — Ghi sự kiện (create-event)

## Mục tiêu

Ghi lại một sự kiện/ghi chú có ảnh hưởng doanh thu và **ghim nó lên biểu đồ tuần** để giải thích biến động (live nhạc, khuyến mãi, mất điện, hủy show…).

## Vai trò

`ADMIN`, `MANAGER`. `ANALYST` chỉ xem, không ghi.

## Route

`/forms/event-note` → `src/app/(admin)/forms/event-note/page.tsx` (page mỏng, import từ `modules/events`), component `EventNoteForm` ở `modules/events/ui/event-form/`.

## Bố cục

Theo mockup `docs/design/create-event.html`:

- Tiêu đề trang: **Event & Note**.
- Form gồm: tiêu đề sự kiện, nguồn doanh thu (radio POS/Eatclub), số tiền ảnh hưởng (VND), ngày sự kiện, ca làm việc, ghi chú.
- Khu **quick-fill presets** điền nhanh một số trường hợp thường gặp.
- Xem trước: vị trí sự kiện sẽ ghim trên biểu đồ (nếu có).

## Field & ràng buộc

| Field | UI | Kiểu | Ràng buộc |
| --- | --- | --- | --- |
| `title` | Input text | string | **bắt buộc, 1–80 ký tự** (trim) |
| `source` | Radio | enum | `POS` \| `EATCLUB` |
| `amount` | `CurrencyInput` | number | số nguyên; **≥ 0** (không cho phép số âm) |
| `eventDate` | Date picker | date | `YYYY-MM-DD` |
| `shift` | Select | enum | `CA_NGAY` \| `CA_TRUA` \| `CA_TOI` \| `CA_DEM` |
| `note` | Textarea | string? | ≤ 500 ký tự |

> **Điểm lưu ý:** `amount` ở đây bắt buộc **≥ 0 (không cho phép âm)**, mô tả giá trị doanh thu do sự kiện mang lại (ví dụ live music, tiệc tư nhân). Biểu đồ hiển thị tác động sự kiện dương.

## API

**`POST /api/events`**

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

Trả `201` + sự kiện vừa tạo. Chi tiết: [`../backend/api/endpoints/events.md`](../../backend/api/endpoints/events.md).

Sau thành công: invalidate `['events']` và `['analytics']`, toast xác nhận, điều hướng về `/`.

## Dữ liệu

Bảng `event_annotations`. Xem [`../backend/database/schema.md`](../../backend/database/schema.md#eventannotation).

## Tiêu chí chấp nhận

- [ ] Gửi hợp lệ → `201`, sự kiện xuất hiện trên biểu đồ Home ở đúng ngày.
- [ ] `title` rỗng hoặc > 80 ký tự → lỗi ngay dưới field, không gửi.
- [ ] `amount` âm bị chặn (form không cho nhập dấu âm, schema validate `min(0)`).
- [ ] `amount` không phải số nguyên → lỗi validate.
- [ ] Quick-fill điền đúng các field nhưng vẫn qua validate khi submit.
- [ ] `ANALYST` cố gửi → `403`, UI hiển thị "không có quyền".
- [ ] Sau thành công, biểu đồ Home đã cập nhật (không cần refresh thủ công).

## Trường hợp biên

| Tình huống | Hành vi |
| --- | --- |
| `title` toàn khoảng trắng | Bị chặn (trim → rỗng) |
| `amount` = 0 | Cho phép (sự kiện trung tính), nhưng UI nên gợi ý nhập giá trị |
| Ngày ngoài tuần đang xem | Lưu được; chỉ hiển thị khi xem đúng tuần |
| Ghi chú > 500 ký tự | Chặn, hiển thị đếm ký tự |
| Hai sự kiện cùng ngày/ca | Cho phép (không ràng buộc duy nhất) |

## Đếm ký tự

Trường `title` hiển thị bộ đếm `x/80` và `note` `x/500`; đổi màu khi gần/vượt giới hạn.

## Kiểm thử

- e2e: tạo hợp lệ; `title` > 80 → `400`; `ANALYST` → `403`; `amount` < 0 bị chặn.
- Component: validate `title`/`amount`; quick-fill; trạng thái submit.

## Liên quan

- Form & validate: [`../frontend/forms-and-validation.md`](../../frontend/forms-and-validation.md)
- Endpoint: [`../backend/api/endpoints/events.md`](../../backend/api/endpoints/events.md)
- Mockup: `docs/design/create-event.html`
