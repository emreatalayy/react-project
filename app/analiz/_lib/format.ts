const decimal = (digits: number) =>
  new Intl.NumberFormat('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** "%49" */
export const percent = (p: number) => `%${Math.round(p * 100)}`;
/** "%49,1" */
export const percent1 = (p: number) => `%${decimal(1).format(p * 100)}`;
export const number = (v: number, digits = 2) => decimal(digits).format(v);

/** Neutral for draws, chosen to stay apart from both team colours on the dark glass */
export const DRAW_COLOR = '#8d9188';
