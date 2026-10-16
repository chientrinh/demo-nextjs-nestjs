import { z } from "zod";

import { REVENUE_SOURCES, WORK_SHIFTS } from "@/modules/shared";
import type { RevenueSource, WorkShift } from "@/modules/shared";

export const eventNoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Tiêu đề là bắt buộc")
    .max(80, "Tiêu đề không vượt quá 80 ký tự"),
  source: z.enum(REVENUE_SOURCES),
  amount: z
    .number({ invalid_type_error: "Vui lòng nhập số tiền" })
    .int("Số tiền phải là số nguyên")
    .min(0, "Số tiền không được âm"),
  eventDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải theo định dạng YYYY-MM-DD"),
  shift: z.enum(WORK_SHIFTS),
  note: z.string().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});

export type EventNoteInput = z.infer<typeof eventNoteSchema>;

export type EventNote = {
  id: string;
  title: string;
  source: RevenueSource;
  amount: number;
  eventDate: string;
  shift: WorkShift;
  note: string | null;
  createdAt: string;
};

export type CreateEventInput = EventNoteInput;
