import axios, { type AxiosError } from "axios";

import { env } from "@/shared/constants/env";
import { accessTokenStore } from "@/shared/utils/auth-token";
import { ApiError, ERROR_CODES } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";

import type { IHttpClient } from "../interfaces/IHttpClient";

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

axiosInstance.interceptors.request.use((config) => {
  const token = accessTokenStore.get();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorEnvelope>) => {
    const status = error.response?.status ?? 0;
    const envelope = error.response?.data;

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
