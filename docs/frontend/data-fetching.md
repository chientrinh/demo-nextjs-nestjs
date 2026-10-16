# Gọi API (Data Fetching)

Hạ tầng gọi backend nằm ở **`src/adapters/infrastructures/`** (ports & adapters). Luồng dữ liệu: **hook ở `ui/<area>/hooks` → `application/services/*.service.ts` → `data/api.ts` → `httpClient` (axios)**; TanStack Query bọc ở tầng hook.

Backend trả JSON **`camelCase`** (khớp field Prisma; DB mới dùng `snake_case` — xem [`../backend/api/overview.md`](../backend/api/overview.md)). Vì domain/UI cũng `camelCase`, **hầu hết module không cần biến đổi**; chỉ thêm **`modules/<feature>/data/dtos/`** khi hình dạng API khác type domain — xem [bên dưới](#dtos--tuỳ-chọn).

Ranh giới: `ui/` **không** gọi `axios`/`fetch`, và **không** gọi `data/` trực tiếp — chỉ gọi **service** ở `application/services/`; `domain/` không chạm mạng. Chỉ `data/` được import từ `adapters/`.

## Lớp adapters (hạ tầng ra ngoài)

```
src/adapters/infrastructures/
├── clients/HttpClient.ts        # axios instance (baseURL → NestJS API) + interceptors
├── interfaces/IHttpClient.ts    # cổng: interface HTTP client (module không phụ thuộc axios)
└── repositories/               # (tùy chọn) repository nói chuyện NestJS
```

### Axios instance

```ts
// src/adapters/infrastructures/clients/HttpClient.ts
import axios from 'axios';
import { env } from '@/shared/constants/env';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,   // NEXT_PUBLIC_API_URL, ví dụ http://localhost:3001/api
  withCredentials: true,     // gửi cookie refresh token
  headers: { 'Content-Type': 'application/json' },
});
```

### Cổng `IHttpClient`

`IHttpClient` tách module khỏi thư viện: `data/` phụ thuộc **hợp đồng** (`get`/`post`/… chứ không phải `axios`), nên thay client, mock hay test đều dễ. `httpClient` (axios instance) thoả interface này.

```ts
// src/adapters/infrastructures/interfaces/IHttpClient.ts
export interface IHttpClient {
  get<T>(url: string, config?: unknown): Promise<{ data: T }>;
  post<T>(url: string, body?: unknown, config?: unknown): Promise<{ data: T }>;
  put<T>(url: string, body?: unknown, config?: unknown): Promise<{ data: T }>;
  patch<T>(url: string, body?: unknown, config?: unknown): Promise<{ data: T }>;
  delete<T>(url: string, config?: unknown): Promise<{ data: T }>;
}
```

### Repository (tùy chọn)

Module nhiều endpoint có thể gom lời gọi vào một repository trong `repositories/`; module đơn giản thì gọi `httpClient` thẳng trong `data/api.ts`.

```ts
// src/adapters/infrastructures/repositories/NestJSLabourRepository.ts
import { httpClient } from '../clients/HttpClient';
import type { LabourCost } from '@/modules/labour/domain/types';

export const labourRepository = {
  list: () => httpClient.get<LabourCost[]>('/labour').then((r) => r.data),
  create: (data: Partial<LabourCost>) =>
    httpClient.post<LabourCost>('/labour', data).then((r) => r.data),
};
```

Hai interceptor:

1. **Request** — gắn `Authorization: Bearer <accessToken>` từ Auth context.
2. **Response** — chuẩn hóa lỗi: đọc `code` và `message` theo [`../backend/api/error-handling.md`](../backend/api/error-handling.md) và ném một `ApiError` thống nhất.

```ts
// src/shared/utils/errors.ts
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}
```

## `data/` — chỉ HTTP

`data/` là **nơi duy nhất** trong module chạm `httpClient`: **không** chứa hook React, **không** chứa use-case.

- **`api.ts`** — hàm gọi backend (qua `httpClient` hoặc repository), trả **type domain**. Hàm thuần, không biết React.
- **`dtos/`** — *tùy chọn*, chỉ thêm khi cần (xem bên dưới).

```ts
// src/modules/events/data/api.ts
import { httpClient } from '@/adapters/infrastructures/clients/HttpClient';
import type { EventAnnotation, CreateEventInput } from '../domain/types';

export async function fetchEvents(): Promise<EventAnnotation[]> {
  const { data } = await httpClient.get<EventAnnotation[]>('/events');
  return data;
}

export async function createEvent(input: CreateEventInput): Promise<EventAnnotation> {
  const { data } = await httpClient.post<EventAnnotation>('/events', input);
  return data;
}
```

### `dtos/` — tuỳ chọn

Vì API trả `camelCase` khớp domain, **thường không cần `dtos/`**. Chỉ tạo `data/dtos/` khi hình dạng API **khác** type domain, ví dụ:

- API bọc danh sách trong `{ data, meta }` mà hook cần mảng phẳng;
- cần ép kiểu (`"2026-10-12"` → `Date`);
- tên trường API khác domain, hoặc gộp/tách trường.

Khi đó `dtos/` là **nơi duy nhất** biết cả hai hình dạng; `api.ts` map rồi trả domain, phần còn lại không thấy DTO thô.

```ts
// src/modules/events/data/dtos/event.ts   (chỉ khi cần)
import type { EventAnnotation } from '../../domain/types';

// Hình dạng thô đúng như API trả về
export type EventDto = {
  id: string;
  title: string;
  source: string;
  amount: number;
  eventDate: string;   // YYYY-MM-DD
  shift: string;
  note: string | null;
  createdAt: string;
};

// API bọc { data, meta } — domain chỉ cần mảng
export function fromEventPage(res: { data: EventDto[] }): EventAnnotation[] {
  return res.data.map((d) => ({ ...d }));
}
```

Rồi `api.ts` dùng mapper:

```ts
export async function fetchEvents(): Promise<EventAnnotation[]> {
  const { data } = await httpClient.get<{ data: EventDto[] }>('/events');
  return fromEventPage(data);
}
```

## `application/services/` — tầng use-case

Hook **không** gọi `data/` trực tiếp mà gọi **service** trong `application/services/<feature>.service.ts`. Service điều phối một hay nhiều hàm `data/api.ts`, áp quy tắc nghiệp vụ, và (nếu cần) ghi `application/store/`. Service là hàm thuần — **không** phụ thuộc React, không biết `useQuery`.

```ts
// src/modules/labour/application/services/labour.service.ts
import { fetchLabour, createLabourCost } from '../../data/api';
import type { LabourCost, CreateLabourCostInput } from '../../domain/types';

export const labourService = {
  list: (params: { page: number; pageSize: number }): Promise<LabourCost[]> =>
    fetchLabour(params),
  create: (input: CreateLabourCostInput): Promise<LabourCost> =>
    createLabourCost(input),
};
```

## Hook trong `ui/<area>/hooks/`

TanStack Query sống ở **hook trong khu vực UI** (`ui/<area>/hooks/use-*.ts`), gọi **service** và khai query key + invalidate. Component chỉ gọi hook.

```ts
// src/modules/analytics/ui/dashboard/hooks/use-weekly-trend.ts
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../../application/services/analytics.service';

export function useWeeklyTrend(weekStart: string) {
  return useQuery({
    queryKey: ['analytics', 'weekly-trend', weekStart],
    queryFn: () => analyticsService.weeklyTrend(weekStart),
    staleTime: 60_000,
  });
}
```

Mutation gọi service, kèm invalidate đúng key:

```ts
// src/modules/labour/ui/labour-form/hooks/use-create-labour-cost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { labourService } from '../../../application/services/labour.service';

export function useCreateLabourCost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: labourService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['labour'] });
      qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
```

## Khôi phục phiên

Access token ở trong bộ nhớ nên mất khi tải lại trang. Khi ứng dụng khởi động, `AuthProvider` gọi một lần:

```
POST /api/auth/refresh   (cookie tự gửi)
   ├─ 200 → nhận accessToken mới, gọi GET /api/auth/me, chuyển status = 'authenticated'
   └─ 401 → status = 'unauthenticated'
```

Interceptor response có thể tự thử refresh một lần khi gặp `401 TOKEN_EXPIRED`, rồi phát lại request gốc; nếu vẫn thất bại thì đăng xuất và điều hướng `/login`.

## Xử lý lỗi

Dùng `code` để quyết định hành vi, **không** so khớp `message`:

| `code` | Hành vi UI |
| --- | --- |
| `VALIDATION_ERROR` | Hiển thị lỗi từng field (`details`) trên form |
| `DUPLICATE_REVENUE_ENTRY` | Toast: đã có bản ghi cho ngày+nguồn; gợi ý sửa |
| `DUPLICATE_EMAIL` | Lỗi field `email` trên form người dùng |
| `INVALID_CREDENTIALS` | Lỗi chung dưới form Login |
| `FORBIDDEN` | Toast: bạn không có quyền thực hiện |
| `TOKEN_EXPIRED` / `INVALID_TOKEN` | Thử refresh; nếu thất bại → `/login` |
| `NOT_FOUND` | Toast: không tìm thấy, làm mới danh sách |
| còn lại | Toast lỗi chung + ghi log |

## Loading & empty state

- **Loading:** khung xương (skeleton) cho card/chart, không nhấp nháy layout.
- **Empty:** ngày không có dữ liệu vẫn hiển thị `0` trên biểu đồ (backend đã điền đầy — xem [`../backend/api/endpoints/revenue.md`](../backend/api/endpoints/revenue.md#analytics)). Sổ nhật ký rỗng hiển thị "Chưa có chi phí nào".
- **Error:** thông báo ngắn + nút "Thử lại" gọi `refetch()`.

## Ghi chú

- Không gọi API trong `useEffect` thủ công; luôn dùng hook.
- **Luồng chuẩn:** `ui/<area>/hooks` → `application/services/*.service.ts` → `data/api.ts` → `httpClient`. Hook **không** gọi thẳng `data/`; component **không** gọi service trực tiếp (chỉ qua hook).
- Chỉ **một** axios instance ở `adapters/infrastructures/clients/HttpClient.ts`; không tạo instance rời trong module.
- **`dtos/` chỉ khi cần.** API trả `camelCase` khớp domain, nên mặc định không tạo `dtos/`; chỉ thêm khi hình dạng API khác type domain (envelope, ép kiểu, đổi tên) — và khi đó chỉ `data/dtos/` biết hình dạng thô.
- `ui/`, `application/` và `domain/` không import `axios`; chỉ `data/` được import từ `adapters/`.
- Không trộn dữ liệu từ hai endpoint rồi cache lại — để Time/backend gộp.
- Biểu đồ Home lấy cả ngày lẫn sự kiện từ **một** endpoint `weekly-trend` để tránh hai lần gọi.
- Không import hook của module này từ module khác; nếu cần dùng chung, đưa xuống `modules/shared`.
