import { env } from '@/utils/env';
import LOGO from '@/icon.svg';

export const APP_URL =
  env.NODE_ENV === 'production'
    ? 'https://l6-runtogether.vercel.app/'
    : 'http://localhost:3000'

export const APP_LOGO = LOGO