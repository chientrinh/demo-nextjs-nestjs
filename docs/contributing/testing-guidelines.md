# Hướng dẫn kiểm thử

Nguyên tắc: kiểm thử **hành vi và ràng buộc nghiệp vụ**, không kiểm thử chi tiết cài đặt. Test phải chạy được, nhanh, và độc lập.

## Backend (Jest + Supertest)

| Loại | Phạm vi |
| --- | --- |
| Unit | Service thuần (logic ngày, tổng hợp, validate nghiệp vụ) |
| Integration | Controller + Prisma với **DB test** (dùng `docker/database` trên cổng riêng hoặc testcontainers) |
| e2e | Luồng HTTP đầy đủ: login → ghi dữ liệu → đọc analytics |

```bash
cd backend
npm run test
npm run test:e2e
```

### Bắt buộc có test

- `weeklyTrend` trả **đúng 7 phần tử**, điền `0` cho ngày trống, gộp đúng theo nguồn.
- `summary.totalRevenue` = POS + EATCLUB; `averagePerDay` chia theo **số ngày lịch**; `daysWithData` đúng.
- `title` > 80 → `400` (`VALIDATION_ERROR`).
- Trùng email → `DUPLICATE_EMAIL`; nhiều bản ghi cùng ngày/nguồn là hợp lệ (không ràng buộc duy nhất).
- `ANALYST` ghi dữ liệu → `403`.
- `amount` quy tắc: labour > 0, event ≥ 0 (không cho phép số âm).
- Auth: login đúng/sai, refresh xoay vòng, logout.

### Dọn dẹp

Mỗi test tự dựng dữ liệu và xóa sau (transaction rollback hoặc `deleteMany` trong `afterEach`). Không phụ thuộc thứ tự test.

## Frontend (Jest + RTL)

Xem chi tiết [`../frontend/testing.md`](../frontend/testing.md).

```bash
cd frontend
npm run test
```

### Bắt buộc có test

- Validate form: `title` ≤ 80, `amount` theo quy tắc từng form, trường bắt buộc.
- `formatUsd` và `readEnglishAmount` (dự án thêm).
- KPI card render giá trị đã định dạng; biểu đồ render 7 điểm không lỗi (mock ApexCharts).

## Quy tắc chung

1. **Mock tại ranh giới** (mạng, thư viện đồ họa), không mock logic đang test.
2. **Truy vấn theo vai trò/nhãn**, không `data-testid` khi có thể.
3. **Một assert kỳ vọng mỗi test** (hoặc một hành vi rõ ràng).
4. **Test đọc được như đặc tả:** `it('từ chối sự kiện có tiêu đề quá 80 ký tự', …)`.
5. **Không snapshot toàn trang.**
6. **Cập nhật test cùng lúc với đổi hành vi** — PR đổi hành vi mà không đổi test sẽ bị từ chối.

## CI

Mỗi PR chạy: `lint` → `test` → (tùy chọn) `test:e2e`. Test phải xanh trước khi review.

## Liên quan

- [`../backend/testing.md`](../backend/testing.md)
- [`../frontend/testing.md`](../frontend/testing.md)
- [`pull-request.md`](./pull-request.md)
