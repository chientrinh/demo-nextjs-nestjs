# Xử lý lỗi

Mọi lỗi API trả về **cùng một cấu trúc JSON**, do một exception filter toàn cục (`HttpExceptionFilter`) sinh ra. Frontend chỉ cần parse một hình dạng duy nhất.

## Cấu trúc lỗi

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ.",
  "details": [
    { "field": "amount", "message": "amount phải là số nguyên dương" }
  ],
  "timestamp": "2026-10-16T09:12:00.000Z",
  "path": "/api/labour"
}
```

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `statusCode` | number | Mã HTTP, lặp lại trong body cho tiện |
| `code` | string | Mã lỗi nghiệp vụ ổn định, UPPER_SNAKE_CASE — dùng để lập trình |
| `message` | string | Thông điệp người đọc được (tiếng Việt) |
| `details` | array? | Chỉ có với lỗi validate; danh sách field lỗi |
| `timestamp` | string | ISO 8601 thời điểm lỗi |
| `path` | string | Đường dẫn request |

`code` là phần **ổn định** để code dựa vào; `message` có thể đổi. Frontend không nên so khớp `message`.

## Bảng mã lỗi

| `code` | HTTP | Khi nào |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | DTO không hợp lệ (class-validator) |
| `INVALID_CREDENTIALS` | 401 | Sai email/mật khẩu |
| `UNAUTHORIZED` | 401 | Thiếu token |
| `INVALID_TOKEN` | 401 | Access token hỏng — đã định nghĩa nhưng chưa emit (gộp thành `UNAUTHORIZED`) |
| `TOKEN_EXPIRED` | 401 | Access token hết hạn — đã định nghĩa nhưng chưa emit (gộp thành `UNAUTHORIZED`) |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token hỏng/hết hạn |
| `ACCOUNT_INACTIVE` | 401 | Tài khoản bị vô hiệu hóa |
| `FORBIDDEN` | 403 | Thiếu vai trò cho hành động |
| `NOT_FOUND` | 404 | Không tìm thấy theo id |
| `DUPLICATE_REVENUE_ENTRY` | 409 | Vi phạm ràng buộc duy nhất (mọi `P2002`) |
| `DUPLICATE_EMAIL` | 409 | Email đã tồn tại |
| `BUSINESS_RULE_VIOLATION` | 422 | Vi phạm quy tắc nghiệp vụ |
| `RATE_LIMITED` | 429 | Vượt rate limit — đã định nghĩa nhưng chưa emit với Throttler |
| `INTERNAL_ERROR` | 500 | Lỗi không lường trước |

## Lỗi validate

Khi `ValidationPipe` thất bại, `details` liệt kê từng field:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ.",
  "details": [
    { "field": "title", "message": "title không được vượt quá 80 ký tự" },
    { "field": "eventDate", "message": "eventDate phải theo định dạng YYYY-MM-DD" }
  ]
}
```

## Ánh xạ lỗi Prisma

| Lỗi Prisma | `code` | HTTP |
| --- | --- | --- |
| `P2002` (mọi unique violation) | `DUPLICATE_REVENUE_ENTRY` | 409 |
| `P2025` (không tìm thấy) | `NOT_FOUND` | 404 — chưa xử lý trong filter; service tự check 404 |

> `DUPLICATE_EMAIL` **không** map từ `P2002`; nó được ném bằng pre-check tường minh trong `users.service.ts`.

Filter dịch lỗi Prisma sang `code` nghiệp vụ để frontend không phụ thuộc Prisma.

## Cách ném lỗi trong code

Dùng exception chuẩn Nest; filter lo phần còn lại:

```ts
throw new ConflictException({
  code: 'DUPLICATE_EMAIL',
  message: 'Email đã tồn tại.',
});
```

Không tự dựng response lỗi trong controller.

## Phía frontend

Frontend đọc `code` để quyết định thông báo: ví dụ `DUPLICATE_EMAIL` → hiển thị lỗi ở field email. Xem [`../../frontend/data-fetching.md`](../../frontend/data-fetching.md#xử-lý-lỗi).
