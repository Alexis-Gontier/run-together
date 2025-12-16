import { up } from 'up-fetch';

export const apiClient = up(fetch, () => ({
  baseUrl: '/api',
  credentials: 'include', // Important pour les cookies de session
}));
