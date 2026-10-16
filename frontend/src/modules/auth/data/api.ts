import { ERROR_CODES, ApiError } from "@/shared/utils/errors";

import type { AuthSession, LoginInput } from "../domain/auth";

const LATENCY_MS = 350;

type MockAccount = {
  email: string;
  password: string;
  id: string;
  name: string;
  role: "ADMIN" | "ANALYST";
};

const ACCOUNTS: MockAccount[] = [
  {
    email: "admin@bistro.test",
    password: "123456",
    id: "usr-admin",
    name: "Quản trị viên",
    role: "ADMIN",
  },
  {
    email: "analyst@bistro.test",
    password: "123456",
    id: "usr-analyst",
    name: "Chuyên viên phân tích",
    role: "ANALYST",
  },
];

function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => setTimeout(() => done(value), LATENCY_MS));
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const account = ACCOUNTS.find(
    (candidate) =>
      candidate.email === input.email.trim().toLowerCase() &&
      candidate.password === input.password,
  );

  if (!account) {
    throw new ApiError(
      401,
      ERROR_CODES.invalidCredentials,
      "Email hoặc mật khẩu không đúng",
    );
  }

  return resolve({
    accessToken: `mock-access-token-${account.id}`,
    user: {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
    },
  });
}

export async function refresh(): Promise<AuthSession> {
  return resolve({
    accessToken: "mock-access-token-usr-admin",
    user: {
      id: "usr-admin",
      email: "admin@bistro.test",
      name: "Quản trị viên",
      role: "ADMIN",
    },
  });
}

export async function logout(): Promise<void> {
  return resolve(undefined);
}
