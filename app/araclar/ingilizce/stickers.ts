import { units } from './course';

export type Sticker = { id: string; emoji: string; name: string; hint: string };

/** What a finished session tells the sticker check */
export type SessionFacts = {
  kind: 'lesson' | 'story' | 'review' | 'practice' | 'review-due' | 'mistakes' | 'test';
  nodeId: string | null;
  stars: number;
  spoke: boolean;
  streak: number;
  totalStars: number;
};

type Rule = Sticker & { earned: (facts: SessionFacts) => boolean };

const RULES: Rule[] = [
  { id: 'ilk-adim', emoji: '🌱', name: 'İlk adım', hint: 'İlk dersini bitir', earned: () => true },
  {
    id: 'kusursuz',
    emoji: '💯',
    name: 'Kusursuz',
    hint: 'Bir dersi hiç hata yapmadan bitir',
    earned: (f) => (f.kind === 'lesson' || f.kind === 'story' || f.kind === 'review') && f.stars === 3,
  },
  { id: 'bulbul', emoji: '🎤', name: 'Bülbül', hint: 'Bir cümleyi sesli doğru söyle', earned: (f) => f.spoke },
  { id: 'hata-avcisi', emoji: '🧹', name: 'Hata avcısı', hint: 'Hatalarım oyununu bitir', earned: (f) => f.kind === 'mistakes' },
  { id: 'hafiza', emoji: '🧠', name: 'Hafıza ustası', hint: 'Bugünün tekrarını bitir', earned: (f) => f.kind === 'review-due' },
  { id: 'hikaye', emoji: '📖', name: 'Hikâye sever', hint: 'Bir hikâyeyi bitir', earned: (f) => f.kind === 'story' },
  { id: 'seri-3', emoji: '🔥', name: 'Ateşli', hint: '3 gün üst üste ders yap', earned: (f) => f.streak >= 3 },
  { id: 'seri-7', emoji: '🚀', name: 'Roket', hint: '7 gün üst üste ders yap', earned: (f) => f.streak >= 7 },
  { id: 'yildiz-25', emoji: '⭐', name: 'Yıldız avcısı', hint: '25 yıldız topla', earned: (f) => f.totalStars >= 25 },
  { id: 'yildiz-60', emoji: '🌟', name: 'Süperstar', hint: '60 yıldız topla', earned: (f) => f.totalStars >= 60 },
  ...units.map(
    (unit): Rule => ({
      id: `unite-${unit.id}`,
      emoji: unit.sticker.emoji,
      name: unit.sticker.name,
      hint: `“${unit.title}” ünitesinin sonundaki sandığı aç`,
      earned: (f) => f.nodeId === `${unit.id}-tekrar`,
    }),
  ),
];

export const STICKERS: Sticker[] = RULES.map(({ id, emoji, name, hint }) => ({ id, emoji, name, hint }));

/** Stickers this session earns that the learner does not have yet */
export function newStickers(owned: string[], facts: SessionFacts): Sticker[] {
  return RULES.filter((rule) => !owned.includes(rule.id) && rule.earned(facts)).map(({ id, emoji, name, hint }) => ({
    id,
    emoji,
    name,
    hint,
  }));
}
