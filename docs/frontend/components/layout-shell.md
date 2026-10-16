# Component — Layout Shell

Khung layout kế thừa TailAdmin. Tài liệu này mô tả phần dự án dùng và tùy biến, không mô tả lại toàn bộ TailAdmin.

## Cây layout

```
src/app/layout.tsx                    # Root
└── ThemeProvider                     # dark/light — shared/providers/theme-provider.tsx
    └── SidebarProvider               # trạng thái sidebar — shared/providers/sidebar-provider.tsx
        └── QueryProvider             # TanStack Query — shared/providers/query-provider.tsx
            └── AuthProvider          # phiên đăng nhập — modules/auth/application/store/session-provider.tsx
                └── {children}

src/app/(admin)/layout.tsx            # Khu vực đã đăng nhập
└── <div class="flex">
    ├── AppSidebar                    # shared/components/layout/AppSidebar.tsx
    └── <div class="flex-1">
        ├── AppHeader                 # shared/components/layout/AppHeader.tsx
        └── <main>{children}</main>

src/app/(full-width-pages)/layout.tsx # Không sidebar (Login)
└── <div class="grid place-items-center min-h-screen">{children}</div>
```

## `AppSidebar`

Nguồn: `shared/components/layout/AppSidebar.tsx` (TailAdmin). Điều hướng định nghĩa bằng mảng `NavItem` (`name`, `icon`, `path`) — `path` lấy từ `ROUTES` (`shared/constants/routes.ts`). Thay menu demo bằng ba mục nghiệp vụ (xem [`../routing.md`](../routing.md#điều-hướng-sidebar)).

- Sidebar nền tối (`#1C2434`), mục đang chọn nổi bật bằng màu primary.
- Trạng thái đóng/mở do `SidebarProvider`; trên mobile là overlay.
- Icon dùng **Material Symbols Outlined**.

## `AppHeader`

Nguồn: `shared/components/layout/AppHeader.tsx` (TailAdmin). Chứa:

- Nút mở/đóng sidebar (mobile).
- Ô tìm kiếm (giữ nguyên hoặc ẩn nếu không dùng).
- **Theme toggle** (sáng/tối) — TailAdmin.
- **User dropdown** — hiển thị `fullName` + `role`, có mục đăng xuất gọi `logout()`.

Đăng xuất: gọi `POST /api/auth/logout`, xóa auth state, chuyển hướng `/login`.

## Vùng nội dung `main`

- Padding chuẩn theo TailAdmin (`p-4 md:p-6`).
- Mỗi trang admin mở đầu bằng `PageBreadCrumb` (`shared/components/common/PageBreadCrumb.tsx`) rồi tới nội dung.
- Nội dung chia thành các `ComponentCard` (`shared/components/common/ComponentCard.tsx`) để nhất quán tiêu đề/khung.

## Responsive

| Breakpoint | Hành vi |
| --- | --- |
| `< lg` | Sidebar ẩn mặc định, mở dạng overlay; header có nút hamburger |
| `≥ lg` | Sidebar cố định bên trái; nội dung chiếm phần còn lại |

Chi tiết: [`../design/responsive.md`](../../design/responsive.md).

## Tùy biến so với TailAdmin

| Thay đổi | Lý do |
| --- | --- |
| Thêm `QueryProvider` (`shared/providers/query-provider.tsx`), `AuthProvider` (`modules/auth/application/`) | Cần server state + phiên đăng nhập |
| Thay `navItems`/`othersItems` | Menu nghiệp vụ thay menu demo |
| User dropdown dùng `useAuth().user` (từ `modules/auth`) | Hiển thị người đăng nhập thật |
| Logo/tên "The Bistro" | Nhận diện thương hiệu |

Không tùy biến phần nào khác của shell trừ khi có lý do ghi lại.
