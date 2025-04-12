import ArticleClient from './ArticleClient';

export const articles = [
  {
    id: 'makineler-nasil-dusunur',
    title: 'Makineler Nasıl Düşünür?',
    description: 'Yapay zeka sistemlerinin karar verme mekanizmaları ve düşünme süreçlerini anlama kılavuzu.',
    content: `
      <h1>Makineler Nasıl Düşünür?</h1>
      <p>Yapay zeka sistemleri, insan beyninden ilham alarak geliştirilmiş karmaşık matematiksel modellerdir. Bu yazıda, makinelerin nasıl "düşündüğünü" ve kararlar aldığını inceleyeceğiz.</p>
      // ... içerik devam ediyor ...
    `,
    publishDate: '2024-03-20',
    author: 'Yunus Emre Atalay',
    imageUrl: '/articles/ai-thinking.jpg',
    tags: ['Yapay Zeka', 'Makine Öğrenmesi', 'Derin Öğrenme']
  }
];

export function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export default function Page() {
  return <ArticleClient />;
} 