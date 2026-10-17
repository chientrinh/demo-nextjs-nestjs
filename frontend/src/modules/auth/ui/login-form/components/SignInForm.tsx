"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import Input from "@/shared/components/form/input/InputField";
import Label from "@/shared/components/form/Label";
import Button from "@/shared/components/ui/button/Button";
import { ROUTES } from "@/shared/constants/routes";
import { isApiError } from "@/shared/utils/errors";

import { loginSchema } from "../../../domain/auth";
import type { LoginInput } from "../../../domain/auth";
import { useLogin } from "../hooks/use-login";

export const SignInForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { submit, isLoading } = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await submit(values);
      router.replace(ROUTES.home);
    } catch (err) {
      if (isApiError(err)) {
        setError("root", { message: err.message });
      } else {
        setError("root", { message: "Đăng nhập thất bại. Thử lại." });
      }
    }
  });

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-semibold text-gray-800 sm:text-title-md dark:text-white/90">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nhập email và mật khẩu để đăng nhập hệ thống.
            </p>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="space-y-6">
              <div>
                <Label htmlFor="signin-email">
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="admin@bistro.test"
                  error={Boolean(errors.email)}
                  hint={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div>
                <Label htmlFor="signin-password">
                  Mật khẩu <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    error={Boolean(errors.password)}
                    hint={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inset-e-4 absolute top-1/2 z-30 -translate-y-1/2 cursor-pointer text-gray-400"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {errors.root ? (
                <div
                  role="alert"
                  className="rounded-lg border border-error-500/40 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-400"
                >
                  {errors.root.message}
                </div>
              ) : null}

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  size="sm"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </div>

              <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                <p className="font-medium mb-1">Tài khoản mẫu:</p>
                <p>admin@bistro.local / Admin@123456 (Admin)</p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
