import { useMutation, useQueryClient } from "@tanstack/react-query";

import { eventsService } from "../../../application/services/events.service";
import type { CreateEventInput } from "../../../domain/event";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
