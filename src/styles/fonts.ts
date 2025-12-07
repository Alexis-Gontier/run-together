import {
  Inter,
} from 'next/font/google';
import { cn } from '@/lib/utils/cn';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const fontVariables = cn(
    fontInter.variable,
);