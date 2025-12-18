import { useQuery } from "@tanstack/react-query";
import { getUserCalendar } from "@/lib/api/endpoints";

export function useUserCalendar(userId: string | null | undefined, year?: number) {
  return useQuery({
    queryKey: ["user-calendar", userId, year],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserCalendar(userId, year);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
