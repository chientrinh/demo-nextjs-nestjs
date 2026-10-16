import type { CreateEventInput, EventNote } from "../domain/event";
import { insertEvent, listEvents } from "./mock";

const LATENCY_MS = 250;

function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => setTimeout(() => done(value), LATENCY_MS));
}

export async function fetchEvents(): Promise<EventNote[]> {
  return resolve(listEvents());
}

export async function createEvent(input: CreateEventInput): Promise<EventNote> {
  return resolve(insertEvent(input));
}
