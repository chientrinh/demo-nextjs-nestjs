import {
  createLabourCost,
  deleteLabourCost,
  fetchLabourCosts,
  updateLabourCost,
} from "../../data/api";
import type {
  CreateLabourCostInput,
  LabourCost,
} from "../../domain/labour";

type ListParams = {
  from: string;
  to: string;
  department?: string;
  paymentMethod?: string;
  page?: number;
  pageSize?: number;
};

type LabourPage = {
  data: LabourCost[];
  meta: { total: number; page: number; pageSize: number };
};

export const labourService = {
  list: (params: ListParams): Promise<LabourPage> =>
    fetchLabourCosts(params),

  create: (input: CreateLabourCostInput): Promise<LabourCost> =>
    createLabourCost(input),

  update: (id: string, input: Partial<CreateLabourCostInput>): Promise<LabourCost> =>
    updateLabourCost(id, input),

  remove: (id: string): Promise<void> => deleteLabourCost(id),
};
