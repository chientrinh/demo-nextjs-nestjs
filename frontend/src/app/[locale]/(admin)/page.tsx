import { Suspense } from "react";
import type { Metadata } from "next";

import { DashboardView } from "@/modules/analytics";

export const metadata: Metadata = {
  title: "Tổng quan doanh thu | Bistro Analytics",
  description: "Theo dõi doanh thu, xu hướng tuần và chi phí nhân công nhà hàng",
};

export default function HomePage() {
  return (
    <Suspense>
      <DashboardView />
    </Suspense>
  );
}
