import { addDays, todayKey } from "@/shared/utils/time";

import type { CreateEventInput, EventNote } from "../domain/event";

const seed: EventNote[] = [
  {
    id: "evt-1",
    title: "Live nhạc cuối tuần",
    source: "POS",
    amount: 500_000,
    eventDate: todayKey(),
    shift: "CA_TOI",
    note: "Ban nhạc 3 người, tăng lượng khách buổi tối",
    createdAt: new Date().toISOString(),
  },
  {
    id: "evt-2",
    title: "Khuyến mãi giờ trưa",
    source: "EATCLUB",
    amount: -200_000,
    eventDate: addDays(todayKey(), -1),
    shift: "CA_TRUA",
    note: "Giảm giá combo trưa",
    createdAt: new Date().toISOString(),
  },
];

let store: EventNote[] = [...seed];

export function listEvents(): EventNote[] {
  return [...store];
}

export function insertEvent(input: CreateEventInput): EventNote {
  const created: EventNote = {
    id: `evt-${Date.now()}`,
    title: input.title.trim(),
    source: input.source,
    amount: input.amount,
    eventDate: input.eventDate,
    shift: input.shift,
    note: input.note?.trim() ? input.note.trim() : null,
    createdAt: new Date().toISOString(),
  };
  store = [created, ...store];
  return created;
}
