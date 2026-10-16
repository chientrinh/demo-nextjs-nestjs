import type { Metadata } from "next";

import { SignInForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Đăng nhập | Bistro Analytics",
  description: "Đăng nhập vào hệ thống quản lý doanh thu nhà hàng Bistro",
};

export default function LoginPage() {
  return <SignInForm />;
}
