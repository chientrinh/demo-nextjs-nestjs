export const ROLES = ["ADMIN", "MANAGER", "ANALYST"] as const;
export type Role = (typeof ROLES)[number];

export const REVENUE_SOURCES = ["POS", "EATCLUB"] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

export const DEPARTMENTS = ["FOH", "BOH", "MANAGEMENT", "STEWARD"] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const PAYMENT_METHODS = [
  "CASH_TILL",
  "BANK_TRANSFER",
  "PETTY_CASH",
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const WORK_SHIFTS = ["CA_NGAY", "CA_TRUA", "CA_TOI", "CA_DEM"] as const;
export type WorkShift = (typeof WORK_SHIFTS)[number];

export const WRITE_ROLES: readonly Role[] = ["ADMIN", "MANAGER"];

export function canWrite(role: Role | null | undefined): boolean {
  return role != null && WRITE_ROLES.includes(role);
}
