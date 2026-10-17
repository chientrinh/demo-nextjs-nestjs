import { createEvent, deleteEvent, fetchEvents, updateEvent } from "../../data/api";
import type { CreateEventInput, EventNote } from "../../domain/event";

type ListParams = {
  from: string;
  to: string;
  page?: number;
  pageSize?: number;
};

type EventPage = {
  data: EventNote[];
  meta: { total: number; page: number; pageSize: number };
};

export const eventsService = {
  list: (params: ListParams): Promise<EventPage> => fetchEvents(params),
  create: (input: CreateEventInput): Promise<EventNote> => createEvent(input),
  update: (id: string, input: Partial<CreateEventInput>): Promise<EventNote> =>
    updateEvent(id, input),
  remove: (id: string): Promise<void> => deleteEvent(id),
};
