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
| `INVALID_TOKEN` | 401 | Access token hỏng |
| `TOKEN_EXPIRED` | 401 | Access token hết hạn |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh token hỏng/hết hạn |
| `ACCOUNT_INACTIVE` | 401 | Tài khoản bị vô hiệu hóa |
| `FORBIDDEN` | 403 | Thiếu vai trò cho hành động |
| `NOT_FOUND` | 404 | Không tìm thấy theo id |
| `DUPLICATE_REVENUE_ENTRY` | 409 | Đã tồn tại `(entryDate, source)` |
| `DUPLICATE_EMAIL` | 409 | Email đã tồn tại |
| `BUSINESS_RULE_VIOLATION` | 422 | Vi phạm quy tắc nghiệp vụ |
| `RATE_LIMITED` | 429 | Vượt rate limit |
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
| `P2002` (unique) trên `users.email` | `DUPLICATE_EMAIL` | 409 |
| `P2002` trên `revenue_entries(entryDate, source)` | `DUPLICATE_REVENUE_ENTRY` | 409 |
| `P2025` (không tìm thấy) | `NOT_FOUND` | 404 |

Filter dịch lỗi Prisma sang `code` nghiệp vụ để frontend không phụ thuộc Prisma.

## Cách ném lỗi trong code

Dùng exception chuẩn Nest; filter lo phần còn lại:

```ts
throw new ConflictException({
  code: 'DUPLICATE_REVENUE_ENTRY',
  message: 'Doanh thu cho ngày và nguồn này đã tồn tại.',
});
```

Không tự dựng response lỗi trong controller.

## Phía frontend

Frontend đọc `code` để quyết định thông báo: ví dụ `DUPLICATE_REVENUE_ENTRY` → gợi ý sửa bản ghi đã có thay vì tạo mới. Xem [`../../frontend/data-fetching.md`](../../frontend/data-fetching.md#xử-lý-lỗi).
