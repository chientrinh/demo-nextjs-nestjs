import { addDays, todayKey } from "@/shared/utils/time";

import type { CreateLabourCostInput, LabourCost } from "../domain/labour";

const seed: LabourCost[] = [
  {
    id: "lab-1",
    expenseDate: todayKey(),
    amount: 380,
    department: "FOH",
    paymentMethod: "CASH_TILL",
    note: "Ca tối cuối tuần",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lab-2",
    expenseDate: todayKey(),
    amount: 420,
    department: "BOH",
    paymentMethod: "BANK_TRANSFER",
    note: "Tăng cường bếp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lab-3",
    expenseDate: addDays(todayKey(), -1),
    amount: 120,
    department: "STEWARD",
    paymentMethod: "PETTY_CASH",
    note: "Tạp vụ theo giờ",
    createdAt: new Date().toISOString(),
  },
  {
    id: "lab-4",
    expenseDate: addDays(todayKey(), -2),
    amount: 280,
    department: "MANAGEMENT",
    paymentMethod: "BANK_TRANSFER",
    note: "Ca quản lý",
    createdAt: new Date().toISOString(),
  },
];

let store: LabourCost[] = [...seed];

export function listLabour(): LabourCost[] {
  return [...store].sort((a, b) =>
    a.expenseDate < b.expenseDate ? 1 : a.expenseDate > b.expenseDate ? -1 : 0,
  );
}

export function insertLabour(input: CreateLabourCostInput): LabourCost {
  const created: LabourCost = {
    id: `lab-${Date.now()}`,
    expenseDate: input.expenseDate,
    amount: input.amount,
    department: input.department,
    paymentMethod: input.paymentMethod,
    note: input.note?.trim() ? input.note.trim() : null,
    createdAt: new Date().toISOString(),
  };
  store = [created, ...store];
  return created;
}
