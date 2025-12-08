import {
  Inter,
  Poppins
} from 'next/font/google';
import { cn } from '@/lib/utils/cn';

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const fontVariables = cn(
  fontInter.variable,
  fontPoppins.variable
);