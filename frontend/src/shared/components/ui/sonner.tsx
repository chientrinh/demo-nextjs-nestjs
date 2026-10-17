"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useThemeStore } from "@/shared/providers/theme-provider";

const Toaster = (props: ToasterProps) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Sonner
      theme={theme}
      position="top-right"
      richColors
      closeButton
      {...props}
    />
  );
};

export { Toaster };
