"use client";

import { useEffect } from "react";

import { useRouter } from "@/i18n/navigation";
import { FullPageLoader } from "@/shared/components/common/FullPageLoader";
import { ROUTES } from "@/shared/constants/routes";

import { useAuthStore } from "../../../application/store/session-provider";

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const status = useAuthStore((s) => s.status);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(ROUTES.login);
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <FullPageLoader />;
  }

  return <>{children}</>;
};

export default RequireAuth;
