# 0008 — Đổi đơn vị tiền tệ sang USD (đô-la Mỹ)

- **Trạng thái:** Accepted
- **Ngày:** 2026-10-17
- **Người quyết định:** Team kỹ thuật & Ban điều hành

## Bối cảnh (Context)

Hệ thống được thiết kế ban đầu với **VND, số nguyên, đơn vị đồng**: cột tiền là `Decimal @db.Decimal(15, 0)`, JSON API là `number`, frontend hiển thị theo `vi-VN` (dấu `.` phân tách nghìn, hậu tố `₫`). Ràng buộc này được ghi ở `docs/AGENT_INSTRUCTIONS.md` và nhiều tài liệu khác.

Tuy nhiên mockup gốc (`docs/design/home.html`) thể hiện số tiền bằng **đô-la Mỹ** (ví dụ Total Revenue `$16,110`), và nhu cầu sản phẩm hiện tại là dùng USD làm đơn vị tiền tệ hiển thị và lưu trữ duy nhất. Việc để tài liệu và code tiếp tục nói VND trong khi mockup dùng `$` gây mâu thuẫn giữa nguồn sự thật và thiết kế.

Cần một đơn vị duy nhất, rõ ràng, áp dụng đồng bộ cho docs, backend, frontend, mà **không phá cấu trúc dữ liệu** (tránh migration và rủi ro đổi kiểu).

## Quyết định (Decision)

Chúng tôi sẽ chuyển đơn vị tiền tệ của toàn hệ thống sang **USD, số nguyên, đơn vị đô-la Mỹ (`$`)**:

1. **Lưu trữ không đổi:** giữ `Decimal @db.Decimal(15, 0)` (số nguyên) và JSON API là `number`. Không đổi schema, không tạo migration, không thêm đơn vị lẻ (cents).
2. **Hiển thị `en-US`:** tiền tố `$`, dấu `,` phân tách nghìn — ví dụ `$16,110`. Rút gọn `$1.2M`, `$800K`.
3. **Đổi tên helper frontend:** `formatVnd` → `formatUsd`, `formatCompactVnd` → `formatCompactUsd`; `formatNumber` và `CurrencyInput` chuyển sang `en-US`.
4. **Đọc số thành chữ theo tiếng Anh:** `readVietnameseAmount` → `readEnglishAmount` (ví dụ `1800000` → `"One million eight hundred thousand dollars"`).
5. **Làm lại dữ liệu demo theo thang USD:** viết lại `backend/prisma/seed.ts` và các mock demo ở frontend với giá trị USD thực tế, khớp mockup — tuần mốc tổng `16,110` USD (~`2,301` USD/ngày). Không quy đổi tỷ giá; bộ số cũ (cấp VND) bị thay hoàn toàn. `readEnglishAmount(1800000)` → `"One million eight hundred thousand dollars"` vẫn đúng như một ví dụ định dạng.
6. **Đồng bộ tài liệu:** cập nhật mọi tham chiếu VND/`₫`/“đồng” trong `/docs` (trừ mockup gốc `docs/design/*.html`) và ràng buộc tiền tệ trong `AGENTS.md`.

## Phương án đã cân nhắc (Alternatives)

| Phương án | Ưu điểm | Nhược điểm | Vì sao loại |
| --- | --- | --- | --- |
| **Chuyển sang USD, giữ số nguyên (Được chọn)** | Một đơn vị duy nhất; khớp mockup; không migration; cấu trúc dữ liệu không đổi | Phải viết lại dữ liệu demo (seed/mock) theo thang USD | Rủi ro thấp nhất, đổi được ngay |
| Giữ VND, thêm lớp quy đổi hiển thị sang USD | Không đụng dữ liệu | Thêm tỷ giá, làm tròn, hai đơn vị song song; tài liệu/code vẫn lẫn lộn | Tăng phức tạp không cần thiết |
| Lưu theo cents (`Decimal(15,2)` hoặc số nguyên cents) | Biểu diễn được phần lẻ dưới 1 đô-la | Phá vỡ ràng buộc “số nguyên”, cần migration và sửa mọi chỗ tính toán | Nghiệp vụ hiện không dùng phần lẻ |
| Hiển thị hậu tố `USD` thay vì tiền tố `$` | Không nhập nhằng đơn vị | Lệch mockup (dùng `$16,110`), dài dòng | Mockup là mốc tham chiếu |

## Hệ quả (Consequences)

**Tích cực:**
- Đơn vị tiền tệ thống nhất trên docs, backend và frontend, khớp mockup sản phẩm.
- Không thay đổi schema, không migration, không rủi ro đổi kiểu dữ liệu.
- Định dạng `en-US` nhất quán giữa KPI, tooltip biểu đồ, form và bản đọc thành chữ.

**Tiêu cực / đánh đổi:**
- Dữ liệu demo cũ (cấp VND) bị thay bằng bộ số USD mới; cần chạy lại `npm run seed` ở backend để DB khớp với tài liệu/mock.
- Mockup `docs/design/create-event.html` và `docs/design/create-labour-cost.html` còn nhãn VND — là nguồn thiết kế gốc nên giữ nguyên, cần được ban thiết kế cập nhật riêng.
- Bất kỳ client/tích hợp ngoài nào giả định VND phải tự diễn giải lại.

**Việc cần làm kéo theo:**
- Cập nhật `docs/AGENT_INSTRUCTIONS.md`, ràng buộc trong `AGENTS.md`, và các tài liệu dùng VND/`₫`.
- Cập nhật `format.ts`, `CurrencyInput`, nhãn form, mô tả DTO Swagger ở backend.
- Đặt lại dữ liệu seed nếu cần con số đại diện cho USD (ngoài phạm vi ADR này).

## Liên quan

- [ADR 0002 — Dùng Prisma làm ORM](./0002-prisma-orm.md) (kiểu `Decimal` cho tiền)
- [docs/architecture/data-flow.md](../architecture/data-flow.md)
- [docs/frontend/components/kpi-cards.md](../frontend/components/kpi-cards.md)
- [docs/backend/database/schema.md](../backend/database/schema.md)
