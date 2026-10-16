import type { Metadata } from "next";

import { EventNoteForm } from "@/modules/events";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Ghi sự kiện | Bistro Analytics",
  description: "Tạo ghi chú sự kiện ảnh hưởng đến doanh thu nhà hàng",
};

export default function EventNotePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Ghi sự kiện" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/3">
        <EventNoteForm />
      </div>
    </div>
  );
}
