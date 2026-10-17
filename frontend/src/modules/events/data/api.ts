import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { CreateEventInput, EventNote } from "../domain/event";

type EventPage = {
  data: EventNote[];
  meta: { total: number; page: number; pageSize: number };
};

export async function fetchEvents(params: {
  from: string;
  to: string;
  page?: number;
  pageSize?: number;
}): Promise<EventPage> {
  const { data } = await httpClient.get<EventPage>("/events", { params });
  return data;
}

export async function createEvent(input: CreateEventInput): Promise<EventNote> {
  const { data } = await httpClient.post<EventNote>("/events", input);
  return data;
}

export async function updateEvent(
  id: string,
  input: Partial<CreateEventInput>,
): Promise<EventNote> {
  const { data } = await httpClient.patch<EventNote>(`/events/${id}`, input);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  await httpClient.delete(`/events/${id}`);
}
