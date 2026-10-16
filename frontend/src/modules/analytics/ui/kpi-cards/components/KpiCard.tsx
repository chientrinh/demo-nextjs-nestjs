"use client";

import React from "react";
import { formatNumber, formatVnd } from "@/modules/shared";

type KpiCardProps = {
  label: string;
  value?: number;
  fallbackText?: string;
  format?: "currency" | "number";
  loading?: boolean;
};

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  fallbackText,
  format = "currency",
  loading = false,
}) => {
  const displayValue =
    fallbackText !== undefined
      ? fallbackText
      : value !== undefined && value > 0
        ? format === "currency"
          ? formatVnd(value)
          : formatNumber(value)
        : fallbackText || "0";

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-6 dark:bg-gray-800/50">
      <span className="text-[14px] font-normal text-gray-500 block mb-1 dark:text-gray-400">
        {label}
      </span>
      {loading ? (
        <span className="block h-9 w-32 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      ) : (
        <span className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">
          {displayValue}
        </span>
      )}
    </div>
  );
};

export default KpiCard;
