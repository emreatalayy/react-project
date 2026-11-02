// Pairs of English words that differ in one sound Turkish speakers find hard to hear apart
export type SoundPair = {
  words: [{ en: string; emoji: string }, { en: string; emoji: string }];
  why: string;
};

export const SOUND_PAIRS: SoundPair[] = [
  {
    words: [
      { en: 'ship', emoji: '🚢' },
      { en: 'sheep', emoji: '🐑' },
    ],
    why: 'ship’teki “i” kısa ve rahat, sheep’teki “ii” uzun söylenir.',
  },
  {
    words: [
      { en: 'three', emoji: '3️⃣' },
      { en: 'tree', emoji: '🌳' },
    ],
    why: 'three, dilin ucu dişlerin arasındayken söylenen “th” ile başlar; tree düz “t” ile.',
  },
  {
    words: [
      { en: 'mouse', emoji: '🐭' },
      { en: 'mouth', emoji: '👄' },
    ],
    why: 'mouth “th” ile biter, dil dişlerin arasına gelir; mouse “s” ile biter.',
  },
  {
    words: [
      { en: 'bat', emoji: '🦇' },
      { en: 'bath', emoji: '🛁' },
    ],
    why: 'bath “th” ile biter, dil dişlerin arasına gelir; bat düz “t” ile.',
  },
  {
    words: [
      { en: 'bear', emoji: '🐻' },
      { en: 'pear', emoji: '🍐' },
    ],
    why: 'pear “p” ile başlar, dudaklardan hava patlar; bear yumuşak “b” ile.',
  },
  {
    words: [
      { en: 'cap', emoji: '🧢' },
      { en: 'cup', emoji: '☕' },
    ],
    why: 'cap’te ağız geniş açılır, “e” ile “a” arası bir ses çıkar; cup’taki “a” kısa ve rahattır.',
  },
];
