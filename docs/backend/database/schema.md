# Mô hình dữ liệu

Database: **PostgreSQL 16**. ORM: **Prisma**. File schema nằm ở `backend/prisma/schema.prisma`.

Ba bảng nghiệp vụ: `users`, `labour_costs`, `event_annotations`.

## Quy ước chung cho mọi bảng

- **Tên cột DB `snake_case`.** Cột Postgres dùng `snake_case` (ví dụ `password_hash`, `created_by_id`). Prisma giữ **field `camelCase`** và ánh xạ bằng `@map("snake_case")`; **JSON API trả `camelCase`** — xem [Ánh xạ kiểu sang JSON](#ánh-xạ-kiểu-sang-json-api).
- Khóa chính `id` kiểu `String` (UUID v4), sinh bằng `@default(uuid())`.
- Có `createdAt`/`updatedAt` (`@default(now())` / `@updatedAt`), map xuống `created_at`/`updated_at`.
- Bản ghi do người dùng tạo có `createdById` (`@map("created_by_id")`) trỏ tới `users.id`.
- **Tiền:** `Decimal @db.Decimal(15, 0)` — USD, số nguyên, không thập phân.
- **Ngày nghiệp vụ:** `DateTime @db.Date` — date-only, không timezone.

Prisma đặt **field `camelCase`**, ánh xạ xuống cột `snake_case` bằng `@map`; tên model giữ PascalCase, **tên bảng `snake_case` plural** qua `@@map`. Nhờ vậy code Prisma/TypeScript và JSON API đều dùng `camelCase`, còn DB vẫn `snake_case`. Ví dụ:

```prisma
model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String   @map("password_hash")
  fullName     String   @map("full_name")
  role         Role     @default(ANALYST)
  isActive     Boolean  @default(true) @map("is_active")
  tokenVersion Int      @default(0) @map("token_version")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  labourCosts      LabourCost[]
  eventAnnotations EventAnnotation[]

  @@map("users")
}
```

## Enums

```prisma
enum Role {
  ADMIN
  MANAGER
  ANALYST
}

enum RevenueSource {
  POS
  EATCLUB
}

enum Department {
  FOH          // Front of House — phục vụ, lễ tân
  BOH          // Back of House — bếp
  MANAGEMENT   // Quản lý
  STEWARD      // Tạp vụ, rửa chén
}

enum PaymentMethod {
  CASH_TILL     // Tiền mặt từ két
  BANK_TRANSFER // Chuyển khoản
  PETTY_CASH    // Quỹ lẻ
}

enum WorkShift {
  CA_NGAY  // Ca ngày
  CA_TRUA  // Ca trưa
  CA_TOI   // Ca tối
  CA_DEM   // Ca đêm
}
```

## `User`

Tài khoản đăng nhập và gán chủ sở hữu cho dữ liệu tạo ra. Cột DB (`snake_case`) / field Prisma (`camelCase`):

| Cột DB | Field Prisma | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- | --- |
| `id` | `id` | String (UUID) | PK | |
| `email` | `email` | String | **unique**, not null | Chuẩn hóa lowercase |
| `password_hash` | `passwordHash` | String | not null | bcrypt; không bao giờ trả ra API |
| `full_name` | `fullName` | String | not null | Tên hiển thị |
| `role` | `role` | Role | not null, default `ANALYST` | |
| `is_active` | `isActive` | Boolean | not null, default `true` | Vô hiệu hóa mà không xóa |
| `token_version` | `tokenVersion` | Int | not null, default `0` | Tăng khi logout/đổi mật khẩu để vô hiệu mọi refresh token cũ |
| `created_at` | `createdAt` | DateTime | | |
| `updated_at` | `updatedAt` | DateTime | | |

Quan hệ: một user có nhiều `labourCosts`, `eventAnnotations`.

## `EventAnnotation`

Bản ghi bán hàng / doanh thu chi tiết (bán được gì mỗi ngày, trong ngày có thể bán nhiều lần) theo nguồn và ca làm việc, đồng thời dùng ghim sự kiện lên biểu đồ tuần.

| Cột DB | Field Prisma | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- | --- |
| `id` | `id` | String (UUID) | PK | |
| `title` | `title` | String | not null, **≤ 80 ký tự** | Tiêu đề món/sự kiện/lần bán hàng |
| `source` | `source` | RevenueSource | not null | Nguồn doanh thu: `POS` hoặc `EATCLUB` |
| `amount` | `amount` | Decimal(15,0) | not null, **≥ 0** | Giá trị doanh thu bán được (USD, không âm) |
| `event_date` | `eventDate` | Date | not null | Ngày phát sinh bán hàng |
| `shift` | `shift` | WorkShift | not null | Ca làm việc (`CA_NGAY`, `CA_TRUA`, `CA_TOI`, `CA_DEM`) |
| `note` | `note` | String? | nullable, ≤ 500 | Ghi chú thêm |
| `created_by_id` | `createdById` | String | FK → `users.id`, not null | |
| `created_at` / `updated_at` | `createdAt` / `updatedAt` | DateTime | | |

**Index:** `@@index([eventDate])`.

> Giới hạn 80 ký tự của `title` được thực thi ở cả ba lớp: Zod (frontend), class-validator (DTO), và độ dài cột (DB). Xem [`features/events/create-event.md`](../../features/events/create-event.md).

## `LabourCost`

Một khoản chi phí nhân công theo ngày và bộ phận.

| Cột DB | Field Prisma | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- | --- |
| `id` | `id` | String (UUID) | PK | |
| `expense_date` | `expenseDate` | Date | not null | Ngày chi |
| `amount` | `amount` | Decimal(15,0) | not null, > 0 | Số tiền USD |
| `department` | `department` | Department | not null | `FOH`/`BOH`/`MANAGEMENT`/`STEWARD` |
| `payment_method` | `paymentMethod` | PaymentMethod | not null | |
| `note` | `note` | String? | nullable, ≤ 500 | |
| `created_by_id` | `createdById` | String | FK → `users.id`, not null | |
| `created_at` / `updated_at` | `createdAt` / `updatedAt` | DateTime | | |

**Index:** `@@index([expenseDate])`, `@@index([department])` — phục vụ lọc theo ngày/bộ phận (xem [`indexing.md`](./indexing.md)).

## Quan hệ (ERD rút gọn)

```
users 1 ──< labour_costs
users 1 ──< event_annotations
```

Ba bảng dữ liệu không tham chiếu nhau; chúng chỉ gặp nhau khi **tổng hợp** ở tầng Analytics (theo ngày), không có khóa ngoại chéo.

## Ánh xạ kiểu sang JSON (API)

| Prisma | JSON API | Ghi chú |
| --- | --- | --- |
| `Decimal(15,0)` | `number` | Serialize qua `Number()`; an toàn trong ngưỡng an toàn của JS (< 2^53) |
| `DateTime @db.Date` | `string` `YYYY-MM-DD` | Serialize date-only, không kèm giờ |
| `DateTime` (`createdAt`) | `string` ISO 8601 | |
| enum | `string` UPPER_SNAKE_CASE | |
| field `camelCase` | `camelCase` | JSON API giữ `camelCase`; frontend chỉ thêm `data/dtos` khi hình dạng API khác domain |

## Liên quan

- Migration & tiến hóa schema: [`migrations.md`](./migrations.md)
- Index và hiệu năng: [`indexing.md`](./indexing.md)
- Đặc tả API dùng các kiểu này: [`../api/overview.md`](../api/overview.md)
