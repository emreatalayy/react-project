// Yeni bir yazı eklemek için: metni content/yazilar/<slug>.md olarak yaz (başlık hariç) ve buraya ekle.
// Tek başına bir resim satırı (![](<slug>/x.html "alt yazı")) figür olur; yerel SVG ve HTML parçaları
// content/yazilar altından okunup sayfaya gömülür. Liste ve sayfa kendini günceller (en yeni en üstte).
export interface Post {
  slug: string;
  title: string;
  description: string;
  /** ISO tarih, ör. 2026-10-18 */
  date: string;
  tags: string[];
  sources: { label: string; href: string }[];
}

export const posts: Post[] = [
  {
    slug: 'graphrag-ve-jev',
    title: 'GraphRAG ve Jev Üzerine Notlar',
    description:
      'Biri modele giden bağlamı bilgi grafiğiyle topluyor, öbürü metin yerine karar döndürüyor. İki siteyi kurcalarken aldığım notlar.',
    date: '2026-10-18',
    tags: ['GraphRAG', 'Bilgi Grafiği', 'Jev', 'LLM'],
    sources: [
      { label: 'graphrag.com', href: 'https://graphrag.com/' },
      { label: 'From Local to Global (Microsoft, 2024)', href: 'https://arxiv.org/abs/2404.16130' },
      { label: 'TypeSafe: System One Models ve Jev', href: 'https://typesafe.ai/blog/introducing-system-one-models-and-jev' },
      { label: 'Jev dokümantasyonu', href: 'https://docs.typesafe.ai/introduction' },
      { label: 'Jack & Jill vaka çalışması', href: 'https://typesafe.ai/blog/jack-jill-jev-case-study' },
    ],
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
