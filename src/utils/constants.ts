import { env } from '@/utils/env';
import LOGO from '@/icon.svg';

export const APP_URL =
  env.NODE_ENV === 'production'
    ? 'https://www.run-together.app/'
    : 'http://localhost:3000'

export const APP_LOGO = LOGO