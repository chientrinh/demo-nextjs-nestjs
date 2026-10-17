"use client";

import type React from "react";
import { useEffect } from "react";
import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export interface ThemeStoreState {
  theme: ResolvedTheme;
  themeMode: ThemeMode;
  isInitialized: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === "auto") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
  return mode;
}

function applyThemeDom(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-color-scheme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-color-scheme", "light");
  }
}

export const useThemeStore = create<ThemeStoreState>()((set, get) => ({
  theme: "light",
  themeMode: "light",
  isInitialized: false,
  setThemeMode: (mode: ThemeMode) => {
    const resolved = resolveTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", mode);
      localStorage.setItem("theme", resolved);
    }
    applyThemeDom(resolved);
    set({ themeMode: mode, theme: resolved });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === "light" ? "dark" : "light";
    get().setThemeMode(next);
  },
  initTheme: () => {
    if (typeof window === "undefined") return;
    const savedMode =
      (localStorage.getItem("theme-mode") as ThemeMode) || "light";
    const resolved = resolveTheme(savedMode);
    applyThemeDom(resolved);
    set({ themeMode: savedMode, theme: resolved, isInitialized: true });
  },
}));

export const useTheme = () => useThemeStore();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initTheme = useThemeStore((s) => s.initTheme);
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (themeMode !== "auto") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setThemeMode("auto");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode, setThemeMode]);

  return <>{children}</>;
};
