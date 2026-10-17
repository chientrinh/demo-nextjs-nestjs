import { describe, expect, it } from "vitest";
import { canWrite } from "./enums";

describe("canWrite", () => {
  it("cho phép ADMIN ghi", () => {
    expect(canWrite("ADMIN")).toBe(true);
  });

  it("cho phép MANAGER ghi", () => {
    expect(canWrite("MANAGER")).toBe(true);
  });

  it("từ chối ANALYST ghi", () => {
    expect(canWrite("ANALYST")).toBe(false);
  });

  it("từ chối khi thiếu role", () => {
    expect(canWrite(null)).toBe(false);
    expect(canWrite(undefined)).toBe(false);
  });
});
