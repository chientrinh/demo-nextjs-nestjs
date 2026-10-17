# Kiểm thử Frontend

> ⚠️ **Chưa cài đặt:** frontend hiện chưa có test runner (không có script `test`, chưa có Jest/Vitest/RTL). Nội dung dưới đây mô tả chiến lược dự kiến.

## Công cụ

| Loại | Công cụ | Vị trí |
| --- | --- | --- |
| Unit / component | Jest + React Testing Library | cạnh mã nguồn (`*.test.tsx`) **trong module** (`modules/<x>/ui/...`, `modules/shared/lib/...`) hoặc app-shared (`shared/utils/...`) |
| e2e (tùy chọn) | Playwright | `e2e/` |

Test đặt cạnh thứ nó kiểm, bên trong module (hoặc app-shared `shared/`) sở hữu — không gom vào một thư mục `__tests__` chung toàn cục.

## Chạy test

```bash
cd frontend
npm run test            # unit/component
npm run test -- --coverage
npm run test:e2e        # nếu đã cấu hình Playwright
```

## Ưu tiên kiểm thử

Kiểm thử **hành vi người dùng**, không phải chi tiết cài đặt:

1. **Form** — nhập sai (title > 80, amount âm ở labour) hiển thị lỗi đúng field; submit hợp lệ gọi đúng API.
2. **Định dạng** — `formatUsd(16110)` → `"$16,110"` (`modules/shared/lib/format.ts`).
3. **KPI card** — nhận props và render số đã định dạng; trạng thái rỗng hiển thị `0`.
4. **Biểu đồ** — nhận `days` (7 phần tử) và `events`, không ném lỗi; (mock `react-apexcharts`).
5. **Luồng lỗi** — API trả `DUPLICATE_EMAIL` hiển thị thông báo tương ứng.

## Ví dụ — form validation

```tsx
it('báo lỗi khi tiêu đề vượt 80 ký tự', async () => {
  render(<EventNoteForm />);
  await userEvent.type(screen.getByLabelText(/tiêu đề/i), 'a'.repeat(81));
  await userEvent.click(screen.getByRole('button', { name: /lưu/i }));
  expect(await screen.findByText(/không vượt quá 80/i)).toBeInTheDocument();
});
```

## Ví dụ — định dạng

```ts
it('formatUsd dùng định dạng en-US', () => {
  expect(formatUsd(16110)).toBe('$16,110');
});
```

## Mock API

Không gọi mạng thật. Mock **tầng `data/` của module** (`modules/<x>/data/api.ts`) hoặc mock **service** (`modules/<x>/application/services/`) bằng MSW hoặc `jest.mock` để trả dữ liệu cố định; bọc test trong `QueryClientProvider` mới cho mỗi test. Vì `domain/` không chạm mạng, có thể test schema/logic thuần mà không cần mock.

```tsx
import { EventNoteForm } from '@/modules/events';   // import qua barrel, không vào sâu ui/
const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
render(<QueryClientProvider client={qc}><EventNoteForm /></QueryClientProvider>);
```

## Truy cập phần tử

Ưu tiên truy vấn theo **vai trò/nhãn** (`getByRole`, `getByLabelText`) hơn `data-testid`. Mọi input phải có label liên kết (xem [`../design/accessibility.md`](../design/accessibility.md)).

## Không viết

- Test snapshot toàn trang (giòn, ít giá trị).
- Test rằng một component render đúng class Tailwind.
- Test thư viện (ApexCharts, React Hook Form) — chỉ test tích hợp của mình.

## Liên quan

- Quy trình test chung: [`../contributing/testing-guidelines.md`](../contributing/testing-guidelines.md)
- Schema & thông điệp lỗi để assert: [`forms-and-validation.md`](./forms-and-validation.md)
