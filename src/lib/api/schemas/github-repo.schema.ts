import { z } from 'zod';

export const githubRepoSchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  watchers_count: z.number(),
  description: z.string().nullable(),
  html_url: z.string().url(),
});

export type GitHubRepo = z.infer<typeof githubRepoSchema>;
