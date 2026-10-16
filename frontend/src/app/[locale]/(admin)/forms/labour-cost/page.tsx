import type { Metadata } from "next";

import { LabourCostForm } from "@/modules/labour";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Chi phí nhân công | Bistro Analytics",
  description: "Ghi nhận và theo dõi chi phí nhân công nhà hàng",
};

export default function LabourCostPage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Chi phí nhân công" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Nhập chi phí mới
        </h2>
        <LabourCostForm />
      </div>


    </div>
  );
}
