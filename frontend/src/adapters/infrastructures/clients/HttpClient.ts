import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { env } from "@/shared/constants/env";
import { ApiError, ERROR_CODES } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";

import { storage } from "../storage";
import type { IHttpClient } from "../interfaces/IHttpClient";

const SESSION_STORAGE_KEY = "bistro_auth_session";

function getStoredAccessToken(): string | null {
  try {
    const raw = storage.get(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.accessToken) return parsed.accessToken;
    }
    const directToken = storage.get("token");
    if (directToken) return directToken;
    return null;
  } catch {
    return null;
  }
}

function updateStoredSession(data: { accessToken: string; user?: unknown }): void {
  try {
    const raw = storage.get(SESSION_STORAGE_KEY);
    const prev = raw ? JSON.parse(raw) : {};
    storage.set(
      SESSION_STORAGE_KEY,
      JSON.stringify({
        ...prev,
        accessToken: data.accessToken,
        ...(data.user ? { user: data.user } : {}),
      }),
    );
  } catch {
    /* ignore */
  }
}

function clearStoredSession(): void {
  storage.remove(SESSION_STORAGE_KEY);
  storage.remove("token");
}

type ErrorEnvelope = {
  statusCode?: number;
  code?: string;
  message?: string | string[];
  details?: unknown;
};

const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function setAuthHeader(config: AxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = {};
  }
  if (
    typeof (config.headers as { set?: (k: string, v: string) => void }).set ===
    "function"
  ) {
    (config.headers as { set: (k: string, v: string) => void }).set(
      "Authorization",
      `Bearer ${token}`,
    );
  } else {
    (config.headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const isEn = window.location.pathname.startsWith("/en");
    const loginPath = isEn ? "/en/login" : "/vi/login";
    if (!window.location.pathname.includes("/login")) {
      window.location.href = loginPath;
    }
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payloadStr =
      typeof window !== "undefined"
        ? window.atob(parts[1])
        : Buffer.from(parts[1], "base64").toString("utf-8");
    const payload = JSON.parse(payloadStr);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now() + 5000;
  } catch {
    return false;
  }
}

async function requestNewAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const { data } = await axiosInstance.post<{
      accessToken: string;
      user?: unknown;
    }>("/auth/refresh");
    const newToken = data.accessToken;
    updateStoredSession(data);
    pendingQueue.forEach((p) => p.resolve(newToken));
    pendingQueue = [];
    return newToken;
  } catch (err: unknown) {
    clearStoredSession();
    pendingQueue.forEach((p) => p.reject(err));
    pendingQueue = [];
    redirectToLogin();
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// ── Request interceptor: tự làm mới nếu biết token hết hạn, gắn header ────
axiosInstance.interceptors.request.use(async (config) => {
  if (
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh")
  ) {
    return config;
  }

  let token = getStoredAccessToken();

  // Nếu biết chắc chắn token đã hết hạn, gọi refresh trước khi gửi
  if (token && isTokenExpired(token)) {
    try {
      token = await requestNewAccessToken();
    } catch (err) {
      return Promise.reject(err);
    }
  }

  if (token) {
    setAuthHeader(config, token);
  }
  return config;
});

// ── Response interceptor: xử lý 401 từ API khác và đá ra login nếu refresh 401 ─
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const envelope = error.response?.data;
    const originalConfig = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Nếu chính endpoint /auth/refresh bị lỗi (đặc biệt là 401) -> đá ra login
    if (originalConfig?.url?.includes("/auth/refresh")) {
      clearStoredSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    // Khi api khác trả về 401 -> gọi /auth/refresh và replay request
    if (status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const newToken = await requestNewAccessToken();
        setAuthHeader(originalConfig, newToken);
        return axiosInstance(originalConfig);
      } catch (refreshErr) {
        return Promise.reject(refreshErr);
      }
    }

    // Chuẩn hóa mọi lỗi khác thành ApiError
    if (!envelope) {
      logger.error("Yêu cầu mạng thất bại", error.message);
      return Promise.reject(
        new ApiError(status, "NETWORK_ERROR", "Không kết nối được máy chủ"),
      );
    }

    const message = Array.isArray(envelope.message)
      ? envelope.message.join(", ")
      : (envelope.message ?? "Đã xảy ra lỗi");

    return Promise.reject(
      new ApiError(
        envelope.statusCode ?? status,
        envelope.code ?? "UNKNOWN_ERROR",
        message,
        envelope.details,
      ),
    );
  },
);

export const httpClient: IHttpClient = axiosInstance;

export { ERROR_CODES };
