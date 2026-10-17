import axios, { type AxiosError, type AxiosRequestConfig } from "axios";

import { env } from "@/shared/constants/env";
import { ApiError, ERROR_CODES } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";

import type { IHttpClient } from "../interfaces/IHttpClient";

import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isTokenExpired,
} from "@/shared/token";

function getStoredAccessToken(): string | null {
  const token = getAccessToken();
  return token && token.length > 0 ? token : null;
}

function updateStoredSession(data: { accessToken: string }): void {
  setAccessToken(data.accessToken);
}

function clearStoredSession(): void {
  clearAccessToken();
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
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
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

// ── Request interceptor: luôn có access token trước khi gọi API bảo vệ ───────
axiosInstance.interceptors.request.use(async (config) => {
  if (
    config.url?.includes("/auth/login") ||
    config.url?.includes("/auth/refresh")
  ) {
    return config;
  }

  let token = getStoredAccessToken();

  // Access token chỉ nằm trong bộ nhớ nên sẽ mất sau khi tải lại trang.
  // Khi đó (hoặc khi token sắp hết hạn), dùng refresh cookie để lấy token mới
  // trước khi gửi request API bảo vệ.
  if (!token || isTokenExpired(token)) {
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
