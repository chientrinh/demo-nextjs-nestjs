import { describe, expect, it } from "vitest";
import { labourCostSchema } from "./labour";

const validLabour = {
  expenseDate: "2026-10-17",
  amount: 100,
  department: "FOH",
  paymentMethod: "CASH_TILL",
};

describe("labourCostSchema", () => {
  it("chấp nhận dữ liệu hợp lệ", () => {
    expect(labourCostSchema.safeParse(validLabour).success).toBe(true);
  });

  it("từ chối amount bằng 0", () => {
    const result = labourCostSchema.safeParse({ ...validLabour, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("từ chối amount âm", () => {
    const result = labourCostSchema.safeParse({ ...validLabour, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("từ chối amount không nguyên", () => {
    const result = labourCostSchema.safeParse({ ...validLabour, amount: 1.5 });
    expect(result.success).toBe(false);
  });

  it("từ chối expenseDate sai định dạng", () => {
    const result = labourCostSchema.safeParse({ ...validLabour, expenseDate: "2026/10/17" });
    expect(result.success).toBe(false);
  });
});
