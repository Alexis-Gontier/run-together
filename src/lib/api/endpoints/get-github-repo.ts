import { githubClient } from '@/lib/api/clients';
import { githubRepoSchema } from '@/lib/api/schemas';

export async function getGitHubRepo(owner: string, repo: string) {
  return githubClient(`/repos/${owner}/${repo}`, {
    schema: githubRepoSchema,
  });
}
