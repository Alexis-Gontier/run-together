import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRun } from "@/lib/api/endpoints/create-run";

export function useCreateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["runs-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["recent-runs"] });
    },
  });
}
