# Giám sát & quan sát (monitoring)

Ở quy mô hiện tại, giám sát dựa trên **log có cấu trúc**, **health check**, và **mã request** để lần vết — chưa cần hệ thống APM phức tạp.

## Health check

| Endpoint | Kiểm tra | Dùng cho |
| --- | --- | --- |
| `GET /api/health` | Tiến trình API sống | Liveness probe |
| `GET /api/health/db` | Kết nối DB + `SELECT 1` | Readiness probe |

Trả `200` khi khỏe, `503` khi không. Cài qua `@nestjs/terminus`.

## Log

- **Định dạng:** JSON một dòng khi production; text dễ đọc khi dev.
- **Trường bắt buộc:** `level`, `timestamp`, `requestId`, `method`, `path`, `status`, `durationMs`, `userId` (nếu có).
- **Cấp độ:** `error` cho 5xx/lỗi bất ngờ, `warn` cho 4xx đáng chú ý, `info` cho request, `debug` cho chi tiết dev.
- **Không log:** mật khẩu, token, cookie, `Authorization`, `password`, thông tin nhạy cảm.

## Mã request (request id)

- Sinh `requestId` (UUID) cho mỗi request đầu vào (middleware), trả về header `X-Request-Id`, và gắn vào mọi dòng log của request đó.
- Frontend ghi log `requestId` khi hiển thị lỗi để đối chiếu với backend.

## Đo lường đáng theo dõi

| Chỉ số | Nguồn |
| --- | --- |
| Tỉ lệ 5xx | Log backend |
| Độ trễ API | `durationMs` |
| Lỗi xác thực (401/403) | Log backend |
| Kết nối DB | `/api/health/db` |
| Lỗi phía client | Log console/error boundary |

## Cảnh báo (khuyến nghị)

- 5xx vượt ngưỡng trong 5 phút.
- `/api/health/db` trả 503.
- Dung lượng đĩa DB gần đầy.

## Frontend

- **Error boundary** cho lỗi render.
- Bắt lỗi trong TanStack Query `onError`; hiển thị thông báo thân thiện + `requestId`.
- Không gửi dữ liệu nhạy cảm lên dịch vụ log bên thứ ba.

## Liên quan

- [`troubleshooting.md`](./troubleshooting.md)
- [`../architecture/security.md`](../architecture/security.md)
- [`../backend/api/error-handling.md`](../backend/api/error-handling.md)
