import { env } from '@/utils/env';

export const APP_URL =
  env.NODE_ENV === 'production'
    ? 'https://l6-runtogether.vercel.app/'
    : 'http://localhost:3000'
