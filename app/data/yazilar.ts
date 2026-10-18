// Yeni bir yazı eklemek için: metni content/yazilar/<slug>.md olarak yaz (başlık hariç, ilk bölüm
// başlığından başlayarak) ve buraya ekle. Liste ve sayfa kendini günceller (en yeni en üstte).
export interface Post {
  slug: string;
  title: string;
  description: string;
  /** ISO tarih, ör. 2026-10-18 */
  date: string;
  tags: string[];
}

export const posts: Post[] = [
  {
    slug: 'graphrag-ve-jev',
    title: 'Bağlamı Grafikle, Kararı Tiple Kurmak: GraphRAG ve Jev',
    description:
      'LLM’in girdisini bilgi grafiğiyle toplayan GraphRAG desenleri ve metin yerine güven skorlu tipli kararlar döndüren yeni model Jev üzerine.',
    date: '2026-10-18',
    tags: ['GraphRAG', 'RAG', 'Bilgi Grafiği', 'Jev', 'LLM'],
  },
];

export function getPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
