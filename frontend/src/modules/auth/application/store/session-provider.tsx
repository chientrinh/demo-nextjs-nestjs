"use client";

import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";

import { accessToken, setAccessToken, clearAccessToken } from "@/shared/token";
import type { AuthSession, AuthUser } from "../../domain/auth";
import { authService } from "../services/auth.service";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  status: SessionStatus;
  isAuthenticated: boolean;
  hydrate: () => void;
  login: (session: AuthSession) => void;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

function readSession(): { user: AuthUser | null; token: string | null } {
  try {
    return {
      user: null,
      token: accessToken ?? null,
    };
  } catch {
    return { user: null, token: null };
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  // Trạng thái khởi tạo cố định (null/"loading") để HTML server và client khớp nhau
  // nhau; phiên đã lưu chỉ được nạp sau khi mount qua `hydrate`.
  user: null,
  status: "loading",
  isAuthenticated: false,
  hydrate: () => {
    const { user, token } = readSession();
    set({
      user,
      status: token ? "authenticated" : "unauthenticated",
      isAuthenticated: !!token,
    });
  },
  login: (s: AuthSession) => {
    setAccessToken(s.accessToken);
    set({
      user: s.user,
      status: "authenticated",
      isAuthenticated: true,
    });
  },
  logout: async () => {
    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      set({
        user: null,
        status: "unauthenticated",
        isAuthenticated: false,
      });
    }
  },
  setUser: (user) => {
    set({ user });
  },
}));

export const useAuth = () => useAuthStore();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);

  return <>{children}</>;
};
