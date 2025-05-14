export const articles = [
  {
    id: 'makineler-nasil-dusunur',
    title: 'Makineler Nasıl Düşünür?',
    description: 'Yapay zeka sistemlerinin karar verme mekanizmaları ve düşünme süreçlerini anlama kılavuzu.',
    content: `
      <h1>Makineler Nasıl Düşünür?</h1>
      <p>Yapay zeka sistemleri, insan beyninden ilham alarak geliştirilmiş karmaşık matematiksel modellerdir. Bu yazıda, makinelerin nasıl "düşündüğünü" ve kararlar aldığını inceleyeceğiz.</p>
      Makine öğrenmesi, insanların öğrenme şekillerini taklit etmek için veri ve algoritmaların kullanımına odaklanıp doğruluğunu kademeli olarak artıran bir yapay zeka (AI) ve bilgisayar bilimi dalıdır.
       Makine öğrenimi algoritmalarını denetimli öğrenme ve denetimsiz öğrenme olarak 2 kategoriye ayırabiliriz.
       Denetimli öğrenme verileri sınıflandırmak ve sonuçları doğru bir şekilde tahmin eden algoritmaları eğitmek için etiketli veri kümelerini kullanması şeklinde tanımlanır. Denetimli makine öğrenimi algoritmasında, çıktı zaten bilinmektedir. Çıkış ile girişin bir eşlemesi var. Bu nedenle, bir model oluşturmak için, makine birçok eğitim girdi verisi ile beslenir.

      Eğitim verileri, oluşturulan veri modeli için bir doğruluk düzeyine ulaşılmasına yardımcı olur. Oluşturulan model artık yeni girdi verileriyle beslenmeye ve sonuçları tahmin etmeye hazır olur.
      Etiketli veri nedir?

    Etiketli veriler, makine öğrenmesinde süreci tahmin etmeye yardımcı olan kalıplardır. Herhangi bir makine öğrenimi modelinin temelini oluşturduğundan veri oldukça önemlidir. Veriler üzerinde yaptığımız etiketleme işlemi öğrenme modellerini eğitmek için algoritmalara beslenen veri kümesi olarak işlev görmektedir. 
    Bu etiketli veriler sayesinde yapay zeka uygulamaları çeşitli şekilleri, nesneleri, desenleri tarayıp öğrenebilir.
    Regresyon nedir ?

Öncelikle bir örnek vermek istiyorum. Bildiğimiz üzere sigara içmek çeşitli kanser ve hastalıklara yol açıyor. Her gün 1 paket sigara içtiğimizi düşünelim. Bu sigara içme alışkanlığımız bizi zamanla kanser edecektir. Kısacası sigara içtiğimizde hasta oluruz. Bunun tam tersi mümkün mü? Yani kanser olmamız içtiğimiz sigara oranını arttırabilir mi ? Elbette artırmaz.

Bu örnekten hareketle kanser olmamız sonuç , içtiğimiz sigara da sebeptir. İşte bu sonuç değişkenine bağımlı; sebep değişkenine de bağımsız değişken diyoruz. Amacımız bir günde içilen sigara miktarı (bağımsız değişken) kanser olma (bağımlı değişken) değişkeni üzerinde nasıl bir etkiye sahip olduğunu gözlemlemek ise, regresyon analizini kullanıyoruz.

Yani kısacası biz bağımsız değişkenlerden yola çıkarak bağımlı değişkeni tahmin etmek ve bağımlı değişken üzerinde nasıl bir etkisi olduğunu tahmin etmeye çalışıyoruz

    publishDate: '2024-03-20',
    author: 'Yunus Emre Atalay',
    imageUrl: '/articles/ai-thinking.jpg',
    tags: ['Yapay Zeka', 'Makine Öğrenmesi', 'Derin Öğrenme']
  }
]; 