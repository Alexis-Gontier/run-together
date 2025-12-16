import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRun } from "@/lib/api/endpoints/update-run";

export function useUpdateRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRun,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      queryClient.invalidateQueries({ queryKey: ["runs-calendar"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["recent-runs"] });
    },
  });
}
