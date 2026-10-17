import type { MatchStory } from '../../analiz/_lib/story';
import { gsBarcelona } from './gs-barcelona-2026-10-13';

// Yeni bir maç analizi eklemek için: scripts/analiz/README.md'deki adımlarla JSON'u üret,
// yanına hikâye dosyasını yaz ve buraya ekle. Liste ve sayfa kendini günceller (en yeni en üstte).
export const analyses: MatchStory[] = [gsBarcelona];

export function getAnalysis(slug: string) {
  return analyses.find((a) => a.slug === slug);
}
