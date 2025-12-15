import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/lib/api/endpoints";

export function useUsers(params?: { limit?: number; search?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
