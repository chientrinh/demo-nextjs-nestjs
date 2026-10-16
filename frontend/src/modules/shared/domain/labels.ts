import type {
  Department,
  PaymentMethod,
  RevenueSource,
  Role,
  WorkShift,
} from "./enums";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  ANALYST: "Chuyên viên phân tích",
};

export const REVENUE_SOURCE_LABELS: Record<RevenueSource, string> = {
  POS: "Tại quầy (POS)",
  EATCLUB: "Eatclub",
};

export const DEPARTMENT_LABELS: Record<Department, string> = {
  FOH: "Phục vụ (FOH)",
  BOH: "Bếp (BOH)",
  MANAGEMENT: "Quản lý",
  STEWARD: "Tạp vụ",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_TILL: "Tiền mặt két",
  BANK_TRANSFER: "Chuyển khoản",
  PETTY_CASH: "Quỹ lẻ",
};

export const WORK_SHIFT_LABELS: Record<WorkShift, string> = {
  CA_NGAY: "Ca ngày",
  CA_TRUA: "Ca trưa",
  CA_TOI: "Ca tối",
  CA_DEM: "Ca đêm",
};
