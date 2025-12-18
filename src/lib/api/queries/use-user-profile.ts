import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/lib/api/endpoints";

export function useUserProfile(userId: string | null | undefined) {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserProfile(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
