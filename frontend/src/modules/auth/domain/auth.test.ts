import { describe, expect, it } from "vitest";
import { loginSchema } from "./auth";

describe("loginSchema", () => {
  it("chấp nhận email và mật khẩu hợp lệ", () => {
    expect(
      loginSchema.safeParse({ email: "admin@bistro.local", password: "123456" }).success,
    ).toBe(true);
  });

  it("từ chối email không hợp lệ", () => {
    expect(
      loginSchema.safeParse({ email: "khong-phai-email", password: "123456" }).success,
    ).toBe(false);
  });

  it("từ chối mật khẩu dưới 6 ký tự", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.c", password: "12345" }).success,
    ).toBe(false);
  });
});
