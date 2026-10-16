export const ERROR_CODES = {
  validationError: "VALIDATION_ERROR",
  duplicateRevenueEntry: "DUPLICATE_REVENUE_ENTRY",
  duplicateEmail: "DUPLICATE_EMAIL",
  invalidCredentials: "INVALID_CREDENTIALS",
  forbidden: "FORBIDDEN",
  tokenExpired: "TOKEN_EXPIRED",
  invalidToken: "INVALID_TOKEN",
  notFound: "NOT_FOUND",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export type ValidationDetail = { field: string; message: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get validationDetails(): ValidationDetail[] {
    if (!Array.isArray(this.details)) return [];
    return this.details.filter(
      (d): d is ValidationDetail =>
        typeof d === "object" &&
        d !== null &&
        "field" in d &&
        "message" in d,
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
