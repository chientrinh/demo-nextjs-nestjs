# Hướng dẫn cho AI Agent

Tài liệu này là **điểm vào bắt buộc** cho mọi AI Agent làm việc trên repo này. Đọc hết file này trước khi viết bất kỳ dòng code nào.

## Ba luật bất khả xâm phạm

1. **Tài liệu là nguồn sự thật.** Trước khi code một tính năng, đọc đặc tả của nó trong [`features/`](./features/README.md). Nếu đặc tả thiếu hoặc sai, cập nhật tài liệu *rồi mới* code — không tự suy đoán.
2. **Đối chiếu trước khi bịa.** Endpoint, field, enum, schema phải khớp [`backend/api/`](./backend/api/overview.md) và [`backend/database/schema.md`](./backend/database/schema.md). Không tự đặt tên mới.
3. **Một nguồn, một chỗ.** Không lặp lại nội dung giữa các file; trỏ tới file chứa nó.

## Chọn tài liệu theo việc đang làm

Mỗi trigger dưới đây là một nhánh công việc. Chỉ đọc nhánh bạn cần.

| Khi bạn... | Đọc |
| --- | --- |
| Thêm/sửa **trang hoặc component UI** | [`design/design-system.md`](./design/design-system.md) → [`frontend/routing.md`](./frontend/routing.md) → đặc tả tính năng liên quan |
| Thêm/sửa một **module frontend** (auth/analytics/events/labour) | [`frontend/README.md`](./frontend/README.md#quy-tắc-module) → [`design/components.md`](./design/components.md) |
| Thêm/sửa **app-shared** (UI primitive/hook/util/constant/style/provider ở `src/shared/`) | [`frontend/README.md`](./frontend/README.md#quy-tắc-module) → [`design/components.md`](./design/components.md) |
| Thêm/sửa **endpoint hoặc module NestJS** | [`backend/README.md`](./backend/README.md) → [`backend/api/overview.md`](./backend/api/overview.md) → [`backend/api/error-handling.md`](./backend/api/error-handling.md) |
| Đụng vào **bảng, cột, hoặc query** | [`backend/database/schema.md`](./backend/database/schema.md) → [`backend/database/indexing.md`](./backend/database/indexing.md) → [`backend/database/migrations.md`](./backend/database/migrations.md) |
| **Gọi API từ frontend** | [`frontend/data-fetching.md`](./frontend/data-fetching.md) → endpoint tương ứng trong [`backend/api/endpoints/`](./backend/api/endpoints/auth.md) |
| Làm **form nhập liệu** | [`frontend/forms-and-validation.md`](./frontend/forms-and-validation.md) → đặc tả feature tương ứng |
| Thêm **biến môi trường / config** | [`operations/configuration.md`](./operations/configuration.md) → [`operations/environments.md`](./operations/environments.md) |
| Sửa **Docker / hạ tầng** | [`operations/docker-backend.md`](./operations/docker-backend.md), [`docker-frontend.md`](./operations/docker-frontend.md), hoặc [`docker-database.md`](./operations/docker-database.md) |
| Thêm **quyết định kiến trúc** | Tạo ADR mới theo [`adr/template.md`](./adr/template.md), đọc [`adr/README.md`](./adr/README.md) trước |
| Viết **test** | [`backend/testing.md`](./backend/testing.md) hoặc [`frontend/testing.md`](./frontend/testing.md) → [`contributing/testing-guidelines.md`](./contributing/testing-guidelines.md) |
| Chuẩn bị **commit / PR** | [`contributing/pull-request.md`](./contributing/pull-request.md) → [`contributing/coding-standards.md`](./contributing/coding-standards.md) |

## Từ vựng bắt buộc (ubiquitous language)

Dùng đúng các thuật ngữ sau trong code, commit, và tài liệu. Chúng giữ cho agents và người đọc nói cùng một ngôn ngữ.

| Thuật ngữ | Nghĩa | Tránh dùng |
| --- | --- | --- |
| **Event Annotation** | Bản ghi bán hàng / sự kiện phát sinh doanh thu theo ca và nguồn (`POS`/`EATCLUB`), ghim lên biểu đồ | marker, note (dùng riêng) |
| **Revenue Source** | Kênh phát sinh doanh thu: `POS` (tại quầy) hoặc `EATCLUB` (app đối tác) | channel, provider |
| **Labour Cost** | Một khoản chi phí nhân công theo ngày | payroll, salary |
| **Department** | Bộ phận nhận chi: `FOH`, `BOH`, `MANAGEMENT`, `STEWARD` | team, group |
| **Work Shift** | Ca làm việc: `CA_TOI`, `CA_TRUA`, `CA_DEM`, `CA_NGAY` | time slot |
| **Covers** | Số lượt bán / giao dịch phát sinh trong kỳ | guests, pax (chỉ dùng trong UI copy) |
| **Trend** | Chuỗi doanh thu/chi phí theo ngày trong một tuần | series (chỉ là chi tiết ApexCharts) |

Định nghĩa đầy đủ hơn nằm ở [`features/README.md`](./features/README.md#từ-vựng-nghiệp-vụ).

## Quy tắc bất biến về kỹ thuật

- **Tiền tệ:** mọi số tiền là **VND, số nguyên, đơn vị đồng**. Không dùng số thập phân cho tiền. Type ở Prisma là `Decimal @db.Decimal(15, 0)`, ở JSON là `number`.
- **Ngày:** mọi ngày nghiệp vụ là **date-only** (`YYYY-MM-DD`), lưu ở Postgres kiểu `date`. Không thêm timezone vào ngày nghiệp vụ.
- **ID:** UUID v4 cho mọi bản ghi.
- **Xác thực:** mọi endpoint trừ `POST /api/auth/login` và `POST /api/auth/refresh` đều yêu cầu Bearer token.
- **Phân quyền ghi:** chỉ vai trò `ADMIN` và `MANAGER` được tạo/sửa/xóa dữ liệu tài chính; `ANALYST` chỉ đọc.
- **Enum:** giá trị enum ở API là **UPPER_SNAKE_CASE**; ở UI hiển thị nhãn tiếng Việt tương ứng.
- **Frontend theo module:** logic/UI/type/schema của một tính năng nằm trong `src/modules/<feature>/`; `app/` chỉ composition; import liên module chỉ qua barrel `modules/<feature>`. Chi tiết: [`frontend/README.md`](./frontend/README.md#quy-tắc-module).
- **Luồng dữ liệu frontend:** hook ở `modules/<x>/ui/<area>/hooks/` → service ở `modules/<x>/application/services/<feature>.service.ts` → `data/api.ts`. Hook **không** gọi thẳng `data/`; component chỉ gọi hook.
- **Hạ tầng gọi API ở `src/adapters/infrastructures/`:** axios instance (`clients/HttpClient.ts`), cổng `interfaces/IHttpClient.ts`, repository tùy chọn. Chỉ `modules/<x>/data/` được import `adapters/`; `ui/`/`application/`/`domain/` không chạm `axios`.
- **App-shared ở `src/shared/`:** UI primitive/hook/util/constant/style/provider dùng chung toàn app, **không gắn nghiệp vụ**. Import được từ mọi nơi nhưng không phụ thuộc ngược vào `modules/`/`app/`/`adapters/`. Đừng nhầm với `src/modules/shared/` (nghiệp vụ dùng chung ≥2 module).

## Quy trình chuẩn khi nhận task

1. **Định vị** — xác định task thuộc tính năng nào trong [`features/`](./features/README.md); đọc đặc tả + acceptance criteria của nó.
2. **Tra contract** — đọc endpoint/schema liên quan trước khi viết code.
3. **Code** — tuân thủ [`contributing/coding-standards.md`](./contributing/coding-standards.md).
4. **Test** — viết test theo [`contributing/testing-guidelines.md`](./contributing/testing-guidelines.md); chạy `npm run lint` và `npm run test` trong thư mục tầng tương ứng.
5. **Đồng bộ tài liệu** — nếu task đổi contract hoặc hành vi, cập nhật tài liệu tương ứng **trong cùng PR**.
6. **Báo cáo** — nêu rõ file đã sửa, cách kiểm chứng, và tài liệu nào đã cập nhật.

## Cờ đỏ — dừng lại nếu gặp

- Endpoint/schema bạn định dùng không có trong tài liệu → dừng, hỏi trước hoặc cập nhật tài liệu.
- Mockup trong `docs/design/` khác tài liệu trong `/docs` → tài liệu thắng; báo lại để mockup được sửa.
- Task đòi thay đổi cấu trúc dữ liệu mà không có ADR tương ứng → tạo ADR trước.
