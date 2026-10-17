import { httpClient } from "@/adapters/infrastructures/clients/HttpClient";

import type { CreateLabourCostInput, LabourCost } from "../domain/labour";

// Backend dùng expenseDate; domain dùng entryDate → map tại ranh giới data/
type LabourCostDto = Omit<LabourCost, "entryDate"> & { expenseDate: string };

type LabourPage = {
  data: LabourCostDto[];
  meta: { total: number; page: number; pageSize: number };
};

function fromDto(dto: LabourCostDto): LabourCost {
  const { expenseDate, ...rest } = dto;
  return { ...rest, entryDate: expenseDate };
}

export async function fetchLabourCosts(params: {
  from: string;
  to: string;
  department?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ data: LabourCost[]; meta: LabourPage["meta"] }> {
  const { data } = await httpClient.get<LabourPage>("/labour", { params });
  return {
    data: data.data.map(fromDto),
    meta: data.meta,
  };
}

export async function createLabourCost(
  input: CreateLabourCostInput,
): Promise<LabourCost> {
  // Domain dùng entryDate; API yêu cầu expenseDate
  const { entryDate, ...rest } = input;
  const { data } = await httpClient.post<LabourCostDto>("/labour", {
    ...rest,
    expenseDate: entryDate,
  });
  return fromDto(data);
}

export async function updateLabourCost(
  id: string,
  input: Partial<CreateLabourCostInput>,
): Promise<LabourCost> {
  const { entryDate, ...rest } = input;
  const body = entryDate ? { ...rest, expenseDate: entryDate } : rest;
  const { data } = await httpClient.patch<LabourCostDto>(`/labour/${id}`, body);
  return fromDto(data);
}

export async function deleteLabourCost(id: string): Promise<void> {
  await httpClient.delete(`/labour/${id}`);
}
