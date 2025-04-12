export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  publishDate: string;
  author: string;
  imageUrl: string;
  tags: string[];
}

export const articles: Article[] = [
  {
    id: 'makineler-nasil-dusunur',
    title: 'Makineler Nasıl Düşünür?',
    description: 'Yapay zeka sistemlerinin karar verme mekanizmaları ve düşünme süreçlerini anlama kılavuzu.',
    content: `
      <h1>Makineler Nasıl Düşünür?</h1>

      <p>Yapay zeka sistemleri, insan beyninden ilham alarak geliştirilmiş karmaşık matematiksel modellerdir. Bu yazıda, makinelerin nasıl "düşündüğünü" ve kararlar aldığını inceleyeceğiz.</p>

      <h2>1. Veri İşleme ve Örüntü Tanıma</h2>
      <p>Makineler, büyük miktarda veriyi işleyerek örüntüleri tanır ve sınıflandırır. Bu süreç şu adımları içerir:</p>
      <ul>
        <li>Veri toplama ve ön işleme</li>
        <li>Özellik çıkarımı</li>
        <li>Örüntü eşleştirme</li>
        <li>Sınıflandırma</li>
      </ul>

      <h2>2. Öğrenme Mekanizmaları</h2>
      <p>Makineler üç temel yöntemle öğrenir:</p>
      <ul>
        <li>Gözetimli öğrenme</li>
        <li>Gözetimsiz öğrenme</li>
        <li>Pekiştirmeli öğrenme</li>
      </ul>

      <h2>3. Karar Verme Süreci</h2>
      <p>Makineler, öğrendikleri bilgileri kullanarak şu şekilde karar verirler:</p>
      <ol>
        <li>Giriş verisini analiz etme</li>
        <li>Olasılıkları hesaplama</li>
        <li>En uygun çıktıyı seçme</li>
        <li>Sonucu değerlendirme</li>
      </ol>

      <h2>4. Yapay Sinir Ağları</h2>
      <p>Modern yapay zeka sistemleri, beynin yapısından esinlenen yapay sinir ağlarını kullanır. Bu ağlar:</p>
      <ul>
        <li>Bilgiyi katmanlar halinde işler</li>
        <li>Ağırlıkları sürekli günceller</li>
        <li>Karmaşık problemleri çözebilir</li>
      </ul>

      <p>Bu makale, yapay zeka sistemlerinin temel çalışma prensiplerini açıklamaktadır. Gelecek yazılarda daha detaylı konuları ele alacağız.</p>
    `,
    publishDate: '2024-03-20',
    author: 'Yunus Emre Atalay',
    imageUrl: '/articles/ai-thinking.jpg',
    tags: ['Yapay Zeka', 'Makine Öğrenmesi', 'Derin Öğrenme']
  },
]; 