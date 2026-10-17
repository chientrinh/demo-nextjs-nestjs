"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { FullPageLoader } from "@/shared/components/common/FullPageLoader";
import { ROUTES } from "@/shared/constants/routes";

import { useAuthStore } from "../../../application/store/session-provider";

export const RequireGuest: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(ROUTES.home);
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return <FullPageLoader />;
  }

  return <>{children}</>;
};

export default RequireGuest;
