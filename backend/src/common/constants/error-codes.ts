export const ERROR_CODES = {
  validationError: 'VALIDATION_ERROR',
  invalidCredentials: 'INVALID_CREDENTIALS',
  unauthorized: 'UNAUTHORIZED',
  invalidToken: 'INVALID_TOKEN',
  tokenExpired: 'TOKEN_EXPIRED',
  invalidRefreshToken: 'INVALID_REFRESH_TOKEN',
  accountInactive: 'ACCOUNT_INACTIVE',
  forbidden: 'FORBIDDEN',
  notFound: 'NOT_FOUND',
  duplicateRevenueEntry: 'DUPLICATE_REVENUE_ENTRY',
  duplicateEmail: 'DUPLICATE_EMAIL',
  businessRuleViolation: 'BUSINESS_RULE_VIOLATION',
  rateLimited: 'RATE_LIMITED',
  internalError: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
