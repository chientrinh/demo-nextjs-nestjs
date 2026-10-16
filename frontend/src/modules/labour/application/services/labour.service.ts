import { DEPARTMENTS } from "@/modules/shared";

import { createLabourCost, fetchLabourCosts } from "../../data/api";
import type {
  CreateLabourCostInput,
  LabourCost,
  LabourLedger,
} from "../../domain/labour";

type ListParams = {
  page?: number;
  pageSize?: number;
};

export const labourService = {
  create: (input: CreateLabourCostInput): Promise<LabourCost> =>
    createLabourCost(input),

  list: async ({ page = 1, pageSize = 8 }: ListParams = {}): Promise<LabourLedger> => {
    const all = await fetchLabourCosts();

    const totalsByDepartment = DEPARTMENTS.map((department) => ({
      department,
      total: all
        .filter((entry) => entry.department === department)
        .reduce((sum, entry) => sum + entry.amount, 0),
    })).filter((row) => row.total > 0);

    const start = (page - 1) * pageSize;

    return {
      items: all.slice(start, start + pageSize),
      total: all.length,
      page,
      pageSize,
      totalsByDepartment,
    };
  },
};
