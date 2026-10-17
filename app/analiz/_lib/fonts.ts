import { Barlow_Condensed } from 'next/font/google';

// Condensed scoreboard face for scores and big numbers on the match pages
export const display = Barlow_Condensed({
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});
