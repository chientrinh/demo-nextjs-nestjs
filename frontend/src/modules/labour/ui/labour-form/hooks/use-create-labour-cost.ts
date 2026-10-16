import { useMutation, useQueryClient } from "@tanstack/react-query";

import { labourService } from "../../../application/services/labour.service";
import type { CreateLabourCostInput } from "../../../domain/labour";

export function useCreateLabourCost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateLabourCostInput) => labourService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labour"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
