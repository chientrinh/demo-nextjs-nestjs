import { describe, expect, it } from "vitest";
import { eventNoteSchema } from "./event";

const validEvent = {
  title: "Live nhạc tối thứ Bảy",
  source: "POS",
  amount: 100,
  eventDate: "2026-10-17",
  shift: "CA_TOI",
};

describe("eventNoteSchema", () => {
  it("chấp nhận dữ liệu hợp lệ", () => {
    expect(eventNoteSchema.safeParse(validEvent).success).toBe(true);
  });

  it("từ chối title vượt 80 ký tự", () => {
    const result = eventNoteSchema.safeParse({ ...validEvent, title: "a".repeat(81) });
    expect(result.success).toBe(false);
  });

  it("từ chối amount âm", () => {
    const result = eventNoteSchema.safeParse({ ...validEvent, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("chấp nhận amount bằng 0", () => {
    expect(eventNoteSchema.safeParse({ ...validEvent, amount: 0 }).success).toBe(true);
  });

  it("từ chối eventDate sai định dạng", () => {
    const result = eventNoteSchema.safeParse({ ...validEvent, eventDate: "17/10/2026" });
    expect(result.success).toBe(false);
  });
});
