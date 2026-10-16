import type { CreateLabourCostInput, LabourCost } from "../domain/labour";
import { insertLabour, listLabour } from "./mock";

const LATENCY_MS = 250;

function resolve<T>(value: T): Promise<T> {
  return new Promise((done) => setTimeout(() => done(value), LATENCY_MS));
}

export async function fetchLabourCosts(): Promise<LabourCost[]> {
  return resolve(listLabour());
}

export async function createLabourCost(
  input: CreateLabourCostInput,
): Promise<LabourCost> {
  return resolve(insertLabour(input));
}
