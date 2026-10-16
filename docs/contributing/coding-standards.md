# Chuẩn mã nguồn

## Chung

- **TypeScript strict** ở cả hai bên. Không `any` (dùng `unknown` + thu hẹp).
- **Không comment** trừ khi giải thích *vì sao* (quyết định, đánh đổi), không giải thích *cái gì*.
- **Đặt tên:** biến/hàm `camelCase`, type/class `PascalCase`, hằng `UPPER_SNAKE_CASE`, file component `PascalCase.tsx`, file khác `kebab-case.ts`.
- **Một nhiệm vụ mỗi hàm.** Tách khi vượt ~50 dòng.
- **Định dạng** bằng Prettier (cấu hình ở repo); không tranh cãi style trong review.
- **Import** theo thứ tự: thư viện ngoài → alias nội bộ (`@/…`) → tương đối.

## Backend (NestJS)

- Mỗi miền một module: `controller` → `service` → `repository` (Prisma). Controller **không** chứa logic nghiệp vụ.
- **Đặt tên dữ liệu:** cột DB `snake_case`; field Prisma `camelCase` ánh xạ bằng `@map("snake_case")`, tên bảng `snake_case` plural qua `@@map`; JSON API `camelCase` (khớp field Prisma). Xem [`../backend/database/schema.md`](../backend/database/schema.md).
- **DTO** với `class-validator` cho mọi đầu vào; `ValidationPipe` toàn cục (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- Ném lỗi qua **exception chuẩn** (`BadRequestException`, `NotFoundException`, `ForbiddenException`), không trả object lỗi thủ công. Xem [`../backend/api/error-handling.md`](../backend/api/error-handling.md).
- **Không tin client:** kiểm tra quyền ở tầng server bằng `RolesGuard`, không chỉ ẩn nút ở UI.
- **Decimal/ngày:** serialize `Prisma.Decimal` → số nguyên VND; giữ ngày date-only.
- **Không log** dữ liệu nhạy cảm.

### Ví dụ DTO

```ts
export class CreateLabourCostDto {
  @IsDateString() expenseDate: string;

  @IsInt() @Min(1)
  amount: number;

  @IsEnum(Department) department: Department;

  @IsEnum(PaymentMethod) paymentMethod: PaymentMethod;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}
```

## Frontend (Next.js)

- **Mặc định server component.** Thêm `"use client"` chỉ khi cần state/DOM.
- **Tổ chức theo module.** UI/type/schema/data của một tính năng nằm trong `src/modules/<feature>/`; `app/` chỉ composition. Import từ ngoài qua barrel `modules/<feature>`. Xem [`../frontend/README.md`](../frontend/README.md#quy-tắc-module).
- **Không gọi API trong component hiển thị thuần** — nhận props hoặc dùng hook ở `modules/<x>/ui/<area>/hooks/`.
- **Luồng dữ liệu:** hook → service (`modules/<x>/application/services/<feature>.service.ts`) → `data/api.ts`. Hook **không** gọi thẳng `data/`; service không phụ thuộc React; client state dùng chung để ở `modules/<x>/application/store/`.
- **Dữ liệu server** qua TanStack Query; **form** qua React Hook Form + Zod. Xem [`../frontend/state-management.md`](../frontend/state-management.md) và [`../frontend/forms-and-validation.md`](../frontend/forms-and-validation.md).
- **Dùng token thiết kế**, không mã màu rời. Xem [`../design/design-system.md`](../design/design-system.md).
- **Tái dùng component TailAdmin** thay vì viết lại. Xem [`../design/components.md`](../design/components.md).
- **App-shared ở `src/shared/`.** Thứ không gắn nghiệp vụ dùng chung toàn app (UI primitive, hook, `cn`, `env`, `ROUTES`, style, provider) đặt ở `src/shared/`; `shared/` không import ngược `modules/`/`app/`/`adapters/`.
- **Hạ tầng tách riêng.** Khởi tạo `axios` và các repository gọi NestJS ở `src/adapters/infrastructures/`; module chỉ dùng qua `data/` (không gọi trực tiếp từ `ui/`/`application/`). Xem [`../frontend/data-fetching.md`](../frontend/data-fetching.md).
- **Định dạng tiền/ngày** tập trung ở `modules/shared/lib/format.ts`, không rải rác.

## Git

- Thông điệp commit theo **conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Nhánh: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Chi tiết: [`../.agents/skills/git-workflow/SKILL.md`](../../.agents/skills/git-workflow/SKILL.md).

## Trước khi commit

```bash
npm run lint
npm run test
```

## Liên quan

- [`testing-guidelines.md`](./testing-guidelines.md)
- [`pull-request.md`](./pull-request.md)
