import { createEvent, fetchEvents } from "../../data/api";
import type { CreateEventInput, EventNote } from "../../domain/event";

export const eventsService = {
  list: (): Promise<EventNote[]> => fetchEvents(),
  create: (input: CreateEventInput): Promise<EventNote> => createEvent(input),
};
