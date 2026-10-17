import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { CreateLabourCostInput, LabourCost } from "../domain/labour";

type LabourPage = {
  data: LabourCost[];
  meta: { total: number; page: number; pageSize: number };
};

export async function fetchLabourCosts(params: {
  from: string;
  to: string;
  department?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
}): Promise<LabourPage> {
  const { data } = await httpClient.get<LabourPage>("/labour", { params });
  return data;
}

export async function createLabourCost(
  input: CreateLabourCostInput,
): Promise<LabourCost> {
  const { data } = await httpClient.post<LabourCost>("/labour", input);
  return data;
}

export async function updateLabourCost(
  id: string,
  input: Partial<CreateLabourCostInput>,
): Promise<LabourCost> {
  const { data } = await httpClient.patch<LabourCost>(`/labour/${id}`, input);
  return data;
}

export async function deleteLabourCost(id: string): Promise<void> {
  await httpClient.delete(`/labour/${id}`);
}
