import GridShape from "@/shared/components/common/GridShape";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
        {children}
        <div className="hidden h-full w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
          <div className="relative z-1 flex items-center justify-center">
            <GridShape />
            <div className="flex max-w-xs flex-col items-center">
              <Link href="/" className="mb-4 block">
                <h1 className="text-4xl font-bold text-white">Admin</h1>
              </Link>
              <p className="text-center text-gray-400 dark:text-white/60">
                Hệ thống phân tích doanh thu nhà hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
