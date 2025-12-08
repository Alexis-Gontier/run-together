import { up } from 'up-fetch';

export const githubClient = up(fetch, () => ({
  baseUrl: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github.v3+json',
  },
}));
