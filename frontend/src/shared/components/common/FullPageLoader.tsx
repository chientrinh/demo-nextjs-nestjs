"use client";

import { useTranslations } from "next-intl";

export const FullPageLoader: React.FC = () => {
  const t = useTranslations("common");

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-gray-700 dark:border-t-brand-400" />
        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
          {t("loading")}
        </span>
      </div>
    </div>
  );
};

export default FullPageLoader;
