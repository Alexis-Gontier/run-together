import { useQuery } from '@tanstack/react-query';
import { getGitHubRepo } from '@/lib/api/endpoints';

export function useGitHubRepo(owner: string, repo: string) {
  return useQuery({
    queryKey: ['github-repo', owner, repo],
    queryFn: () => getGitHubRepo(owner, repo),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
