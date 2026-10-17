# Backend — NestJS

API REST phục vụ dashboard The Bistro Analytics. Chạy ở cổng **3001**, tiền tố toàn cục **`/api`**.

## Cấu trúc thư mục

```
backend/
├── prisma/
│   ├── schema.prisma          # Nguồn sự thật của mô hình dữ liệu
│   ├── migrations/            # Migration có version
│   └── seed.ts                # Dữ liệu khởi tạo (idempotent)
├── src/
│   ├── main.ts                # Bootstrap, prefix /api, CORS, Swagger, ValidationPipe
│   ├── app.module.ts          # Gốc, gắn mọi module
│   ├── prisma/                # PrismaModule + PrismaService (global)
│   ├── common/                # Filter, guard, interceptor, decorator dùng chung
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── decorators/
│   ├── auth/                  # Đăng nhập, cấp/thu hồi token
│   ├── users/                 # Quản lý người dùng (ADMIN)
│   ├── labour/                # Labour costs
│   ├── events/                # Event annotations
│   ├── analytics/             # Tổng hợp tuần, KPI
│   └── health/                # Health check
├── test/                      # e2e test
├── .env.example               # Mẫu biến môi trường
└── package.json
```

Mỗi module nghiệp vụ tuân theo cấu trúc Nest chuẩn với tầng Repository tách biệt:

```
<module>/
├── <module>.module.ts
├── <module>.controller.ts     # Chỉ khai báo route, gọi service
├── <module>.service.ts        # Toàn bộ nghiệp vụ, gọi repository
├── <module>.repository.ts     # Thao tác truy vấn cơ sở dữ liệu qua Prisma
├── dto/                       # Request DTO (class-validator)
│   ├── create-<x>.dto.ts
│   └── update-<x>.dto.ts
└── <module>.service.spec.ts   # Unit test
```

## Quy ước

- **Controller mỏng, Service dày, Repository cô lập dữ liệu.** Luồng thực thi một chiều: `Controller` → `Service` → `Repository` → `PrismaService`.
- **DTO cho mọi đầu vào.** Không nhận `any`. DTO dùng `class-validator`, và `ValidationPipe` toàn cục bật `whitelist` + `forbidNonWhitelisted`.
- **Prisma chỉ nằm trong Repository.** Service không truy vấn DB trực tiếp mà gọi các method của Repository; `PrismaService` chỉ được inject vào tầng Repository.
- **Xử lý lỗi qua filter.** Ném exception chuẩn Nest; filter toàn cục biến chúng thành định dạng lỗi thống nhất (xem [`api/error-handling.md`](./api/error-handling.md)).
- **Serialization rõ ràng.** Service trả về đối tượng khớp hợp đồng API; `passwordHash` không bao giờ xuất hiện trong response.

## Guard & phân quyền

Hai guard áp dụng theo thứ tự: `JwtAuthGuard` (xác thực) rồi `RolesGuard` (phân quyền). Đánh dấu công khai bằng `@Public()`, gán vai trò bằng `@Roles(...)`:

```ts
@Post()
@Roles(Role.ADMIN, Role.MANAGER)
create(@Body() dto: CreateEventDto) { ... }
```

Bảng vai trò đầy đủ: [`../architecture/security.md`](../architecture/security.md).

## Chạy cục bộ

```bash
cd backend
npm install
npx prisma migrate dev         # áp dụng migration + sinh client
npx prisma db seed             # tài khoản admin đầu tiên
npm run start:dev              # watch mode, cổng 3001
```

Biến môi trường: sao chép `.env.example` → `.env`, xem [`../operations/configuration.md`](../operations/configuration.md).

## Script thường dùng

| Lệnh | Việc |
| --- | --- |
| `npm run start:dev` | Chạy watch mode |
| `npm run build` | Biên dịch sang `dist/` |
| `npm run lint` | ESLint |
| `npm run test` | Unit test (Jest) |
| `npm run test:e2e` | e2e test |
| `npx prisma studio` | Xem dữ liệu trực quan |

## Tài liệu liên quan

- Database & schema: [`database/schema.md`](./database/schema.md)
- Hợp đồng API: [`api/overview.md`](./api/overview.md)
- Kiểm thử: [`testing.md`](./testing.md)
- Quy tắc code chung: [`../contributing/coding-standards.md`](../contributing/coding-standards.md)
