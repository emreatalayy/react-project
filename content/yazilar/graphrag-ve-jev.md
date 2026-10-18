## Giriş

Bugün bir LLM uygulaması kurarken iki sorun neredeyse her zaman karşımıza çıkıyor.

1. **Modele yanlış ya da eksik bağlam gidiyor.** Klasik RAG, soruya en çok benzeyen birkaç metin parçasını bulup modele veriyor. Ama cevap birden çok belgeye dağılmışsa ya da soru "bu veri setinin genel teması ne?" gibi bütüne dair bir soruysa, benzerlik araması yetmiyor.
2. **Modelden gelen çıktıyı yazılım kullanamıyor.** LLM'ler insanlara metin yazmak için eğitildi. Oysa otomasyonda çoğu zaman bir paragraf değil, bir karar lazım: "Bu talep hangi ekibe gitsin?", "Bu aday elemeyi geçti mi?". Metni ayrıştırmak, şemaya uymayan yanıtları yakalamak ve modelin ne kadar emin olduğunu tahmin etmek ayrı bir iş yükü.

Bu yazıda bu iki soruna farklı yönlerden yaklaşan iki projeye bakıyorum:

- **GraphRAG**, girdi tarafını düzeltiyor: Modele giden bağlamı bir bilgi grafiği üzerinden topluyor.
- **Jev**, çıktı tarafını değiştiriyor: Metin yerine olasılıklarıyla birlikte tipli kararlar döndürüyor.

---

## 1. GraphRAG: Bilgi grafiğiyle bağlam toplamak

### graphrag.com nedir?

[graphrag.com](https://graphrag.com/), Neo4j'nin desteklediği açık kaynaklı bir **GraphRAG desen kataloğu**. İçerik CC BY 4.0 lisanslı, GitHub'da topluluk katkısına açık ve bir Discord sunucusu var. Site dört bölümden oluşuyor:

- **Concepts:** GraphRAG ve bilgi grafiği kavramlarına giriş.
- **How-to Guides:** Veri hazırlamadan erişime kadar hedef odaklı rehberler (ör. chunking).
- **Reference:** Asıl değerli kısım. Grafik modelleri ve retriever desenleri tek tek, aynı şablonla anlatılıyor.
- **Appendices:** 36 makalelik bir okuma listesi ve terimler sözlüğü.

Sitenin bence en faydalı yanı, "GraphRAG" kelimesinin kafa karıştırıcı kullanımını netleştirmesi. Bu kelime bazen Microsoft'un 2024'te yayınladığı belirli bir veri hattını ([From Local to Global, arXiv:2404.16130](https://arxiv.org/abs/2404.16130)), bazen de genel bir yaklaşımı anlatmak için kullanılıyor. graphrag.com ikinci anlamı benimsiyor: GraphRAG, **erişim için grafik yapısından yararlanan bir RAG desenleri ailesi**. Microsoft'un yaklaşımı bu ailenin desenlerinden yalnızca biri.

### Bilgi grafiği ne katıyor?

Bilgi grafiğinde varlıklar **düğüm**, aralarındaki bağlar **tipli ilişki** olarak tutuluyor. Hem düğümler hem ilişkiler özellik taşıyabiliyor. GraphRAG'de neredeyse her desenin temelinde iki özellikli `Chunk` düğümleri var: `text` (okunabilir metin) ve `embedding` (vektör).

Vektör veritabanı "bu parçaya benzeyen parçalar hangileri?" sorusuna cevap veriyor. Grafik ise buna şunları ekliyor:

- Bu parça hangi belgenin, hangi bölümünün içinde?
- Bu parçada hangi kişiler, ürünler ya da kavramlar geçiyor?
- Bu varlıklar başka hangi varlıklara, hangi ilişkiyle bağlı?

Yani grafik, benzerlik aramasının bulduğu noktadan **ilişkileri takip ederek** genişlemeyi mümkün kılıyor.

### Erişim iki adımda

Katalog, grafik tabanlı erişimi iki parçaya ayırıyor:

1. **Giriş noktası araması:** Grafikte başlangıç düğümlerini bulmak. Bu arama vektör, tam metin, hibrit, mekânsal ya da filtre tabanlı olabilir. Benzerlik skorlarıyla birlikte düğümler döner.
2. **Erişim sorgusu:** Bu düğümlerden başlayıp grafikte gezinen bir sorgu (Neo4j'de Cypher). Bağlamın asıl zenginleştiği yer burası.

Bu iki adım, daha geniş bir RAG hattının ortasında duruyor: Öncesinde sorgu yeniden yazma ve varlık çıkarma, sonrasında yeniden sıralama ve budama, en sonda da cevap üretimi var.

### Grafik modelleri

Her retriever belirli bir grafik şekli istiyor. Katalog bu şekilleri ayrı desenler olarak tanımlıyor. Önemlileri:

| Grafik modeli | Ne tutar? |
|---|---|
| **Lexical Graph** | Belge → parça yapısı. En basit hâli. |
| **Parent-Child** | Küçük parçalar aranır, büyük "ebeveyn" parça modele verilir. |
| **Sibling / Hierarchical** | Komşu parçalar ve bölüm hiyerarşisi. Bağlamı kaybetmeden genişlemek için. |
| **Hypothetical Questions** | Her parçanın cevaplayabileceği sorular LLM ile üretilip parçaya bağlanır. |
| **Extracted Entities** | Parçalardan çıkarılan varlıklar ve aralarındaki ilişkiler. |
| **+ Community Summaries** | Varlıklar kümelere ayrılır, her küme için bir özet yazılır. |
| **Domain Graph** | Belgelerden değil doğrudan iş alanından gelen yapı (müşteri, ürün, sipariş…). |
| **Memory Graph** | Ajan hafızası. Epizodik, prosedürel, semantik ve zamansal türleri var. |

Bir not: Lexical graph kurmak, metni nasıl parçaladığınıza doğrudan bağlı. Sitedeki [Chunk Görselleştirici](/araclar/chunk-gorsellestirici) aracı bu adımı denemek için iyi bir başlangıç.

### Retriever desenleri

Katalog retriever'ları temel ve ileri olarak ikiye ayırıyor:

- **Temel:** Basic Retriever, Parent-Child Retriever, Metadata Filtering, Pattern Matching, Cypher Templates, Graph-Enhanced Vector Search.
- **İleri:** Local Retriever, Global Community Summary Retriever, Hypothetical Question Retriever, Text2Cypher ve Dynamic Cypher Generation.

İkisini biraz daha yakından inceleyelim, çünkü GraphRAG'in neden var olduğunu en iyi bunlar anlatıyor.

#### Graph-Enhanced Vector Search

Klasik vektör aramasının grafikle genişletilmiş hâli:

1. Soru, parçaları gömerken kullanılan modelle gömülür.
2. Vektör aramasıyla en benzer *k* parça bulunur.
3. Bu parçalardan `HAS_ENTITY` ilişkisiyle varlıklara geçilir, oradan da 1–2 adım komşu varlıklara gidilir.
4. Parçalar ve bulunan ilişkiler birlikte LLM'e verilir.

Neo4j'de kabaca şöyle görünüyor:

```cypher
CALL db.index.vector.queryNodes('chunk_embeddings', 5, $questionEmbedding)
YIELD node AS chunk, score
MATCH (chunk)-[:HAS_ENTITY]->(e)
OPTIONAL MATCH path = (e)-[*1..2]-(related)
WHERE NOT related:Chunk AND NOT related:Document
RETURN chunk.text, score, collect(DISTINCT path) AS context
```

**Ne zaman?** Cevabın parçalara dağıldığı ya da "kim kiminle bağlantılı?" türü soruların sorulduğu durumlarda. **Bedeli:** Önceden LLM ile varlık ve ilişki çıkarmak gerekiyor, sorgu anında da daha büyük bir bağlam penceresi kullanılıyor.

#### Global Community Summary Retriever

Microsoft GraphRAG makalesinden gelen desen. "Bu belgelerin ana temaları neler?" gibi **bütüne dair** soruları cevaplamak için tasarlanmış. Bu tür sorularda en benzer parçaları bulmak işe yaramıyor, çünkü cevap tek bir parçada değil.

- **Hazırlık:** Varlık ve ilişkiler çıkarılır. Leiden ya da Louvain gibi bir algoritmayla hiyerarşik topluluklar bulunur. Her topluluk LLM ile özetlenir.
- **Sorgu anı:** Seçilen seviyedeki bütün topluluk özetleri, sığmazsa parti parti, LLM'e verilir ve cevap bu özetlerden üretilir.

Katalog bu hazırlığın pahalı olduğunu açıkça yazıyor ve hangi adımın gerçekten LLM gerektirdiğini düşünmeyi öneriyor. Ayrıca DRIFT gibi, global ve yerel aramayı birleştiren varyantlara da değiniyor.

### Değerlendirme

graphrag.com bir ürün değil, bir **ortak dil** önerisi. Değeri şurada: "GraphRAG kuralım" demek yerine "lexical graph + extracted entities kurup graph-enhanced vector search kullanalım" diyebiliyorsunuz. Her desenin hangi grafik şeklini gerektirdiği, ne zaman kullanılacağı ve hangi makaleden çıktığı tek yerde duruyor.

Eksiklerine gelince: Site doğal olarak Neo4j ve Cypher merkezli. Ayrıca desenleri yan yana koyan bir maliyet ya da doğruluk karşılaştırması yok. Hangi desenin sizin verinizde işe yaradığını yine kendiniz ölçmek zorundasınız.

---

## 2. Jev: Metin değil, karar üreten model

### TypeSafe AI ve Jev

[TypeSafe AI](https://typesafe.ai/), San Francisco merkezli bir yapay zekâ laboratuvarı. İki yıl gizli çalıştıktan sonra 15 Eylül 2026'da ortaya çıktı ve ilk modeli **Jev**'i erken erişimle duyurdu. Kurucusu Diogo Almeida, OpenAI'da ChatGPT'nin temelindeki talimat izleme (instruction following) çalışmalarında yer almış bir araştırmacı. Basında şirketin DCVC liderliğinde 40 milyon dolarlık bir seed yatırımı aldığı yazıyor.

İsimlerin bir hikâyesi var:

- **System One Models**, Kahneman'ın *Hızlı ve Yavaş Düşünme* kitabındaki hızlı ve sezgisel "Sistem 1"den geliyor.
- **Jev**, ekonomist William Stanley Jevons'a gönderme. Jevons paradoksuna göre bir kaynak verimli kullanılmaya başlandıkça tüketimi azalmaz, artar. TypeSafe'in tezi de bu: Zekânın maliyeti her büyüklük mertebesinde düştüğünde, yepyeni kullanım alanları açılıyor.

### Fikir: "Decisions, not strings"

TypeSafe'e göre LLM'ler insanlar için kelime üretiyor, Jev ise yazılım için **tipli karar** üretiyor. Model metin üretmiyor. Olası çıktılar baştan tanımlanıyor ve her cevap bir olasılık dağılımıyla geliyor.

Bir çağrının iki girdisi var:

- **`state`:** Karar verilecek durum. Metin ya da JSON olabilir.
- **`questions`:** Bu duruma dair tipli sorular.

Her soru aynı `state`'e karşı **paralel ve birbirinden yalıtılmış** olarak değerlendiriliyor. Bu yüzden soru eklemek yanıt süresini neredeyse değiştirmiyor ve sorular birbirinin bağlamını kirletmiyor.

### Soru tipleri

| Tip | Soru | Döner |
|---|---|---|
| `choice` | Listeden bir seçenek seç | `choice`, `probabilities`, `confidence` |
| `score` | Bir rubriğe göre puanla | `score`, `probabilities`, `confidence` |
| `noul` | Bu ifade doğru mu? | 0–1 arası tek bir olasılık |

Ekim'de çıkan 1.14 sürümüyle, deneysel olarak tek bir sınırlayıcı kutu döndüren **`box`** tipi ve görsel girdi desteği de eklendi. Şirket bunları "danger zone" başlığıyla, henüz üretime hazır olmadığını belirterek sunuyor.

### Örnek bir çağrı

Bir destek talebini yönlendirmek istediğimizi düşünelim:

```json
POST https://api.typesafe.ai/v1/systemone

{
  "model": "jev-latest",
  "state": "Ödeme sayfasında indirim kodunu girince her seferinde zaman aşımı hatası alıyorum.",
  "questions": {
    "ekip": {
      "type": "choice",
      "instructions": "Bu talebi hangi ekip ele almalı?",
      "criteria": {
        "teknik": "Hata, entegrasyon veya performans sorunu",
        "fatura": "Ödeme, abonelik veya iade",
        "satis": "Fiyat ve paket soruları"
      }
    },
    "engelleyici": {
      "type": "noul",
      "instructions": "Kullanıcı işlemini tamamlayamıyor mu?"
    }
  }
}
```

Yanıt (temsilî):

```json
{
  "answers": {
    "ekip": {
      "type": "choice",
      "choice": "teknik",
      "probabilities": { "teknik": 0.82, "fatura": 0.12, "satis": 0.06 },
      "confidence": 0.73
    },
    "engelleyici": { "type": "noul", "noul": 0.91 }
  }
}
```

Ayrıştırılacak bir metin yok. `answers.ekip.choice` her zaman tanımlı üç değerden biri.

### Güven skoru nasıl okunur?

`confidence`, olasılık dağılımının ne kadar tek bir seçeneğe yığıldığını 0–1 arasında özetliyor. Bütün olasılık tek seçenekteyse 1, eşit dağılmışsa 0 oluyor. `choice` için hesap basit:

```
confidence = (en yüksek olasılık − 1/n) / (1 − 1/n)
```

Yukarıdaki örnekte: (0,82 − 1/3) / (2/3) ≈ 0,73. `score` tipinde formül seviyelerin sırasını da hesaba katıyor: Komşu iki seviye arasında kalmak, iki uç arasında kalmaktan daha az belirsizlik sayılıyor. `noul` için ayrı bir alan yok. 0,5'e yakın değer kararsızlık demek ve istenirse |2p − 1| güven gibi kullanılabiliyor.

Dokümantasyonun önerdiği kullanım üç bantlı:

- **Yüksek güven:** Otomatik uygula.
- **Orta güven:** Kullanıcıdan onay iste.
- **Düşük güven:** İnsana ya da daha güçlü bir modele devret.

Eşik riske göre değişiyor. Örneğin para transferi onayı gibi kritik bir işlemde 0,9'un altı onaya düşerken, salt okunur bir işlem doğrudan yapılabilir. Dokümantasyonun tavsiyesi muhafazakâr başlamak ve eşikleri kendi verinizle ayarlamak.

### Nasıl çalışıyor?

Şirket mimariyi açıklamıyor. Paylaşılan üç başlık var:

- **Yeni bir mimari.**
- **Paralel örnekleyici:** LLM'ler token token sıralı üretirken Jev bütün çıktıları tek bir paralel sorguda üretiyor.
- **RLCD (Reinforcement Learning for Calibrated Decisions):** RLHF insan tercihini, RLVR doğrulanabilir cevabı optimize ediyor. RLCD ise **kalibrasyonu** hedefliyor: Model %80 emin dediğinde gerçekten yaklaşık %80 oranında haklı olmalı. TypeSafe'e göre RLHF modelleri aşırı özgüvenli yapıyor ve döngüde insan tutmayı zorunlu kılıyor.

### İddialar ve rakamlar

| | Jev (şirkete göre) |
|---|---|
| Girdi fiyatı | Milyon token başına $0,042 (çıktı ücretsiz) |
| Yanıt süresi | 70–500 ms |
| Kendi iş akışı testlerinde | LLM'lere göre 193,6 kat hızlı, 444,6 kat ucuz |
| "Halüsinasyon" | %0 (çıktının şemaya uyması yapı gereği garanti) |

Somut bir müşteri örneği de var. Yapay zekâ ajanlarıyla çalışan işe alım platformu **Jack & Jill**, aday ön elemesinde Gemini 3.1 Flash Lite'ın yerine Jev'i koymuş:

- 1.000 aday başına maliyet **$0,755 → $0,092** (yaklaşık %88 düşüş).
- Medyan eleme süresi **20,3 sn → 10,3 sn**.
- İşe alım yöneticilerinin geçmişte seçtiği adayların 2.000 kişilik kısa listede kalma oranı %93,9 → %94,6 (istatistiksel olarak anlamlı değil). AUC 0,924 → 0,933.
- Testten üretime geçiş 10 gün sürmüş.

Kalite rakamlarının çevrim dışı bir testten geldiğini, yıllık tasarruf rakamlarının da projeksiyon olduğunu not etmek gerekiyor.

### Neye uygun, neye değil?

**Uygun:** Sınıflandırma, yönlendirme (routing), puanlama ve sıralama, içerik moderasyonu, ajanlar için koruma bariyerleri (guardrail) ve hızlı karar döngüleri. TypeSafe saniyede ~10 sorguyla Doom oynayan bir demo bile paylaştı.

**Uygun değil:** Sohbet, kod üretimi, açık uçlu akıl yürütme ve gerekçe yazmayı gerektiren her şey. Jev araç çağırmıyor. Bir ajanın yanında karar katmanı olarak duruyor.

Dokümantasyonun tasarım tavsiyesi önemli: **Her etken için ayrı ve dar bir soru sorun, sonuçları kodunuzda birleştirin.** "Bu girişim fikrini puanla" yerine pazar büyüklüğü, teknik yapılabilirlik ve farklılaşma ayrı ayrı sorulmalı, ağırlıklandırma da sizin formülünüzle yapılmalı.

### Eleştirel bakış

Jev'in fikri güçlü, ama dikkat edilmesi gereken noktalar var:

- **Tip güvenliği doğruluk değildir.** "Sıfır halüsinasyon" iddiası, çıktının her zaman şemaya uyması anlamına geliyor. Model yine de **emin bir şekilde yanlış** cevap verebilir.
- **Rakamlar şirketin kendi ölçümleri.** Referans cevaplar GPT-6 Astra ve Fable 5.1'in ortalamasından türetilmiş. İş akışlarını şirketin kendi ekibi kurmuş, LLM'ler de TypeSafe'in kendi sarmalayıcısıyla çalıştırılmış. TypeSafe bu sınırları blog yazısında kendisi de açıkça yazıyor.
- **Fiyatın kalıcı olup olmadığı belli değil.** Şirket, fiyatın sübvanse olabileceğini kabul ediyor.
- **Gerekçe yok.** Jev size bir sayı veriyor, bir neden vermiyor. Mimari de kapalı olduğu için kararın neden öyle çıktığını denetlemek zor. Düzenlemeye tabi alanlarda bu ciddi bir eksik.
- **Kalibrasyon kanıtı sınırlı.** Kalibrasyon ürünün merkezinde ama şu an için kamuya açık bir kalibrasyon grafiği ya da metriği yok.

---

## 3. İkisi birlikte: Bir öneri

Bu iki proje rakip değil, aynı hattın iki ucunda duruyorlar. GraphRAG modele **ne gireceğini**, Jev ise yazılıma **ne çıkacağını** düzenliyor. Hatta graphrag.com'un anlattığı RAG hattındaki ön ve son işleme adımları, Jev'in tam da iyi olduğu türden küçük kararlardan oluşuyor.

Aşağıdaki akış benim önerim, test edilmiş bir mimari değil:

1. **Sorguyu yönlendirme (`choice`):** Soru belirli bir olgu mu soruyor, yoksa bütüne dair bir soru mu? Cevaba göre ya Local Retriever'a ya da Global Community Summary Retriever'a gidilir. Global retriever pahalı olduğu için bu ayrım ciddi tasarruf sağlayabilir.
2. **Bağlamı budama (`noul`):** Graph-enhanced vector search'ün getirdiği her parça ve yol için "Bu, soruyu cevaplamaya yardımcı oluyor mu?" diye sorulur. Sorular paralel çalıştığı için 20 parçayı elemek, bir parçayı elemekle neredeyse aynı sürede biter.
3. **Cevap üretimi:** Ancak bundan sonra daha küçük ve temiz bir bağlamla büyük LLM çağrılır.
4. **Kalite kapısı (`score`):** Üretilen cevap "bağlama dayanıyor mu?" rubriğiyle puanlanır. Güven düşükse cevap insana düşer.

Bu kurguda pahalı ve yavaş model yalnızca gerçekten metin yazılması gereken yerde çalışıyor. Geri kalan her karar ucuz, hızlı ve güven skoruyla ölçülebilir hâle geliyor.

---

## Sonuç

- **GraphRAG**, "RAG'e grafik ekleyelim" fikrini adlandırılmış, birbirinden ayrılabilen desenlere dönüştürüyor. graphrag.com bu desenleri öğrenmek ve ekip içinde ortak bir dil kurmak için şu an elimizdeki en derli toplu kaynak.
- **Jev**, LLM'leri her işe koşmak yerine kararı ayrı bir model sınıfına taşımayı öneriyor. İddiaları büyük ve büyük ölçüde şirketin kendi ölçümlerine dayanıyor, ama sorduğu soru yerinde: Yazılım her seferinde bir paragrafa değil, çoğu zaman güven skoru olan tek bir karara ihtiyaç duyar.

Benim çıkardığım ders şu: Bir sonraki LLM projesinde modeli tek parça bir kara kutu olarak düşünmek yerine, hattı **bağlam toplama**, **karar verme** ve **metin üretme** diye ayırmak ve her adıma ona uygun aracı koymak.

---

## Kaynaklar

- [graphrag.com: GraphRAG Pattern Catalog](https://graphrag.com/)
- [Intro to GraphRAG](https://graphrag.com/concepts/intro-to-graphrag/) · [Intro to Knowledge Graphs](https://graphrag.com/concepts/intro-to-knowledge-graphs/)
- [Graph-Enhanced Vector Search](https://graphrag.com/reference/graphrag/graph-enhanced-vector-search/) · [Global Community Summary Retriever](https://graphrag.com/reference/graphrag/global-community-summary-retriever/)
- [graphrag.com: Research listesi](https://graphrag.com/appendices/research/)
- Edge vd., [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130) (2024)
- [TypeSafe AI](https://typesafe.ai/) · [Introducing System One Models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Jev 1.14](https://typesafe.ai/blog/jev-1-14) · [Jack & Jill vaka çalışması](https://typesafe.ai/blog/jack-jill-jev-case-study)
- [TypeSafe dokümantasyonu](https://docs.typesafe.ai/introduction) · [Confidence](https://docs.typesafe.ai/confidence)
- [DigitalOcean: What is Jev?](https://www.digitalocean.com/resources/articles/what-is-jev)
- [Dealroom: TypeSafe exits stealth with $40M seed](https://dealroom.co/news/151032-typesafe-exits-stealth-with-40m-seed-to-build-ai-for-software-not-people/)
