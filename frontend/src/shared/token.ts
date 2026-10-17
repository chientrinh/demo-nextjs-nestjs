import { create } from "zustand";

/**
 * Kiểm tra access token (JWT) đã hết hạn chưa.
 * Trả `false` khi token null/không hợp lệ — nơi gọi tự xử lý trường hợp
 * "không có token" bằng điều kiện `!token || isTokenExpired(token)`.
 */
export function isTokenExpired(token: string | null): boolean {
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

type TokenState = {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
};

/**
 * Store Zustand giữ access token trong bộ nhớ (không persist).
 * Dùng `useTokenStore` để đọc phản ứng trong React; code ngoài React
 * (adapters, services) dùng các helper `getAccessToken`/`setAccessToken`.
 */
export const useTokenStore = create<TokenState>()((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
}));

// Helper truy cập ngoài React — không cần hook.
export const getAccessToken = () => useTokenStore.getState().accessToken;
export const setAccessToken = (token: string | null) =>
  useTokenStore.getState().setAccessToken(token);
export const clearAccessToken = () =>
  useTokenStore.getState().clearAccessToken();
