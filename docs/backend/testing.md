# Kiểm thử Backend

## Công cụ

| Loại | Công cụ | Vị trí |
| --- | --- | --- |
| Unit test | Jest + `@nestjs/testing` | cạnh file nguồn (`*.spec.ts`) |
| e2e test | Jest + Supertest | `backend/test/*.e2e-spec.ts` |

## Chạy test

```bash
cd backend
npm run test            # unit
npm run test:watch      # unit, watch
npm run test:cov        # kèm coverage
npm run test:e2e        # e2e (cần DB test)
```

## Cấu trúc e2e

Mỗi e2e test dựng app Nest thật với một **database test riêng** (`DATABASE_URL_TEST`), chạy `prisma migrate deploy` trước, và dọn dữ liệu giữa các test:

```
test/
├── app.e2e-spec.ts          # bootstrap, guard, prefix
├── auth.e2e-spec.ts
├── labour.e2e-spec.ts
├── events.e2e-spec.ts
└── analytics.e2e-spec.ts
```

## Ưu tiên test gì

Nghiệp vụ, không phải framework. Tập trung:

1. **Service quan trọng** — đặc biệt `AnalyticsService` (gộp 7 ngày, điền `0`, tính KPI).
2. **Ranh giới phân quyền** — `ANALYST` gọi `POST` phải bị `403`.
3. **Ràng buộc dữ liệu** — tạo trùng email phải `409 DUPLICATE_EMAIL`; nhiều bản ghi cùng ngày/nguồn là hợp lệ (không ràng buộc duy nhất).
4. **Validate** — `title` > 80 ký tự phải `400`.
5. **Biên** — `amount` âm bị chặn (labour `> 0`, event `>= 0`).

Không viết test chỉ để tăng coverage (ví dụ assert rằng một getter trả về field vừa gán).

## Ví dụ — AnalyticsService.weeklyTrend

```ts
it('trả đủ 7 ngày, điền 0 cho ngày trống', async () => {
  const result = await service.weeklyTrend(new Date('2026-10-12'));
  expect(result.days).toHaveLength(7);
  expect(result.days[1]).toMatchObject({ posRevenue: 0, eatclubRevenue: 0, labourCost: 0 });
});
```

## Ví dụ — phân quyền e2e

```ts
it('ANALYST không được tạo labour cost', () =>
  request(app.getHttpServer())
    .post('/api/labour')
    .set('Authorization', `Bearer ${analystToken}`)
    .send({ expenseDate: '2026-10-12', amount: 100000, department: 'FOH', paymentMethod: 'CASH_TILL' })
    .expect(403));
```

## Dữ liệu test

Dùng factory nhỏ trong `test/factories/` để tạo dữ liệu hợp lệ, có thể override từng field. Không dùng dữ liệu production.

## Ngưỡng coverage

Không đặt ngưỡng cứng toàn repo. Ưu tiên: `analytics`, `auth`, và guard phải có coverage cao (các luồng dễ sai và quan trọng).

## Liên quan

- Quy trình test chung: [`../contributing/testing-guidelines.md`](../contributing/testing-guidelines.md)
- Định dạng lỗi để assert: [`api/error-handling.md`](./api/error-handling.md)
