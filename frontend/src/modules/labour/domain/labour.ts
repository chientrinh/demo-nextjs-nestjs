import { z } from "zod";

import { DEPARTMENTS, PAYMENT_METHODS } from "@/modules/shared";
import type { Department, PaymentMethod } from "@/modules/shared";

export const labourCostSchema = z.object({
  expenseDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải theo định dạng YYYY-MM-DD"),
  amount: z
    .number({ invalid_type_error: "Vui lòng nhập số tiền" })
    .int("Số tiền phải là số nguyên")
    .positive("Số tiền phải lớn hơn 0"),
  department: z.enum(DEPARTMENTS),
  paymentMethod: z.enum(PAYMENT_METHODS),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

export type LabourCostInput = z.infer<typeof labourCostSchema>;

export type LabourCost = {
  id: string;
  expenseDate: string;
  amount: number;
  department: Department;
  paymentMethod: PaymentMethod;
  note: string | null;
  createdAt: string;
};

export type CreateLabourCostInput = LabourCostInput;

export type LabourLedger = {
  items: LabourCost[];
  total: number;
  page: number;
  pageSize: number;
  totalsByDepartment: { department: Department; total: number }[];
};
