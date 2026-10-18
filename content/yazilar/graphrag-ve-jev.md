Birkaç gündür tarayıcımda iki sekme açık duruyor: graphrag.com ve typesafe.ai. İlk bakışta pek alakaları yok. Biri RAG'e bilgi grafiği eklemenin yollarını anlatan bir katalog, öbürü yepyeni bir model satan bir girişim. Ama ikisini arka arkaya okuyunca aynı derde iki farklı uçtan baktıklarını fark ettim. LLM'le bir şey kurarken canımı en çok sıkan iki yer var: modele ne verdiğimiz ve modelden ne geri aldığımız. GraphRAG birincisiyle, Jev ikincisiyle uğraşıyor.

GraphRAG'le başlayayım. Klasik RAG'i bilirsiniz: belgeleri parçalara bölersiniz, her parçayı bir vektöre çevirirsiniz, soru gelince ona en çok benzeyen beş on parçayı bulup modele verirsiniz. Çoğu zaman da iş görür. Sorun, cevabın tek bir parçada durmadığı anlarda başlıyor. "Bu projede çalışan kişiler başka hangi projelerde var?" diye sorun. Cevap üç ayrı belgeye dağılmış durumda ve hiçbiri tek başına soruya benzemiyor. Ya da "bu belgeler genel olarak ne anlatıyor?" diye sorun. En benzer beş parça size bütünü hiçbir zaman anlatmıyor.

![](graphrag-ve-jev/vektor-ve-grafik.html "Solda klasik vektör araması: soruya en yakın üç parça. Sağda aynı parçalardan içlerinde geçen kişi ve projelere, oradan da başka belgelerdeki parçalara yürüyen grafik araması.")

GraphRAG'in fikri aslında basit. Parçaları ve içlerinde geçen kişileri, ürünleri, kavramları bir grafikte birbirine bağlarsanız, benzerlik aramasının bulduğu yerden ilişkileri takip ederek ilerleyebilirsiniz. Vektör araması size "buna benzeyenler bunlar" der. Grafik ise "bu parçada Ayşe geçiyor, Ayşe şu projede çalışıyor, o proje de şu belgede anlatılıyor" diye devam etmenizi sağlar.

graphrag.com tam olarak bu fikrin etrafında kurulmuş bir desen kataloğu. Arkasında Neo4j var, içerik CC BY 4.0 lisanslı ve GitHub üzerinden herkes katkı yapabiliyor. Bence en faydalı tarafı, "GraphRAG" kelimesinin etrafındaki karmaşayı çözmesi. Bu isim bazen Microsoft'un 2024'te yayınladığı belirli bir sistem için, bazen de genel bir yaklaşım için kullanılıyor. Katalog ikinci anlamı benimsiyor ve GraphRAG'i grafik yapısından faydalanan bir desenler ailesi olarak tanımlıyor. Microsoft'unki bu ailenin üyelerinden sadece biri.

Sitenin referans kısmında her desen aynı kalıpla anlatılmış: hangi grafik şeklini istiyor, ne zaman işe yarıyor, adım adım nasıl çalışıyor, hangi makaleden çıkmış. Grafik tarafında en basitinden, yani sadece belgeler ve parçalardan oluşan yapıdan başlıyor. Oradan parçalardan varlık çıkarılan, sonra bu varlıkların kümelenip özetlendiği versiyonlara kadar gidiyor. Ajanlar için hafıza grafikleri bile var. Arama tarafında da düz vektör aramasından soruyu doğrudan Cypher sorgusuna çeviren Text2Cypher'a kadar on bir desen sıralanmış. Bir de sonda 36 makalelik bir okuma listesi duruyor, konuya yeni girecekler için altın değerinde.

İki desen özellikle aklımda kaldı. Birincisinin adı "graph-enhanced vector search". Önce normal vektör aramasıyla en yakın parçaları buluyorsunuz, sonra bu parçalarda geçen varlıklara, oradan da bir iki adım ötedeki komşularına gidiyorsunuz. Cevabın parçalara dağıldığı sorularda tam ilaç. Bedeli de belli: belgelerdeki varlıkları ve ilişkileri önceden bir LLM ile çıkarmanız, sorgu anında da modele daha uzun bir bağlam göndermeniz gerekiyor.

İkincisi Microsoft'un makalesinden gelen "global community summary" yöntemi. Burada varlıklar Leiden gibi bir algoritmayla topluluklara ayrılıyor ve her topluluk için önceden bir özet yazılıyor. "Genel tema ne?" gibi bir soru geldiğinde parça aramıyorsunuz bile. Bütün özetleri modele verip cevabı onlardan çıkarıyorsunuz. Katalog bu hazırlığın pahalı olduğunu açık açık yazıyor, bu dürüstlük hoşuma gitti.

Eksik bulduğum tek şey, desenleri yan yana koyup "şu veride şu daha iyi çalıştı" diyen bir karşılaştırmanın olmaması. Site doğal olarak her şeyi Neo4j ve Cypher üzerinden anlatıyor ve hangi desenin size uyduğunu yine kendi verinizde denemeniz gerekiyor. Ama ekipte "GraphRAG kuralım" yerine "parçalardan varlık çıkarıp graph-enhanced vector search deneyelim" diyebilmek bile büyük kazanç. Bu arada bütün bu yapıların kalitesi en baştaki parçalama adımına bağlı. Merak eden bu sitedeki [chunk görselleştiriciyle](/araclar/chunk-gorsellestirici) biraz oynayabilir.

---

Gelelim öbür uca. TypeSafe AI, San Francisco'da iki yıl sessizce çalıştıktan sonra 15 Eylül'de ortaya çıkan bir girişim. Kurucusu Diogo Almeida, OpenAI'da ChatGPT'nin temelindeki talimat izleme çalışmalarında yer almış biri. Basında DCVC liderliğinde 40 milyon dolarlık bir yatırım aldıkları yazıyor. İlk modellerinin adı Jev ve dertleri şu: LLM'ler insanlara metin yazmak için eğitildi, oysa otomasyonda istediğimiz şey çoğu zaman bir paragraf değil, bir karar.

Bunu herkes yaşamıştır. Modele "bu destek talebi hangi ekibe gitmeli?" diye soruyorsunuz, size "Bu talep büyük ihtimalle teknik ekibi ilgilendiriyor, çünkü..." diye başlayan bir paragraf dönüyor. Sonra o paragraftan cevabı ayıklıyor, kalıba uymayan yanıtları yakalıyor, modelin ne kadar emin olduğunu da bir şekilde tahmin etmeye çalışıyorsunuz.

![](graphrag-ve-jev/llm-ve-jev.html "Aynı soruya iki farklı cevap. LLM bir paragraf yazıyor, Jev seçeneklerin olasılıklarını ve tek bir güven skorunu döndürüyor. Rakamlar örnek.")

Jev metin üretmiyor. Ona bir durum veriyorsunuz, bu düz bir metin de olabilir bir JSON da, ve bu durumla ilgili sorular soruyorsunuz. Her sorunun tipi baştan belli: ya bir listeden seçim yapacak, ya bir ölçeğe göre puan verecek, ya da "bu doğru mu?" sorusuna 0 ile 1 arasında bir olasılıkla cevap verecek. Seçimle birlikte her seçeneğin olasılığı ve bunlardan hesaplanan tek bir güven skoru da geliyor. Cevap her zaman sizin tanımladığınız seçeneklerden biri, ayıklanacak bir şey kalmıyor. Bir de hoş bir detay var: aynı istekteki sorular paralel ve birbirinden bağımsız değerlendiriliyor. Yani beş soru sormak, bir soru sormakla neredeyse aynı sürede bitiyor.

İsimlerin de bir hikâyesi var. Modelin ait olduğu "System One" sınıfının adı, Kahneman'ın hızlı ve sezgisel düşünme dediği Sistem 1'den geliyor. Jev ise ekonomist William Stanley Jevons'a gönderme. Jevons, kömürü daha verimli yakan buhar makineleri yaygınlaştıkça kömür tüketiminin azalmak yerine arttığını fark etmişti. TypeSafe'in iddiası da buna benziyor: zekânın maliyeti düştükçe daha önce kimsenin aklına gelmeyen kullanım alanları açılacak.

Güven skoru işin tam ortasında duruyor. Dokümantasyon basit bir kural öneriyor. Güven yüksekse karar kendiliğinden uygulanır, ortadaysa kullanıcıdan onay istenir, düşükse iş bir insana ya da daha güçlü bir modele devredilir. Eşikler de işin riskine göre kayar. Bir kaydı okumak için orta bir güven yeterli olabilir ama para transferi onaylanacaksa 0,9'un altındaki her şeyin onaya düşmesi gerekir.

![](graphrag-ve-jev/guven-esikleri.html "Güven skoruna göre üç davranış. Eşikler örnek, işin riskine göre kaydırılıyor. Yukarıdaki örnekte güven 0,73 olduğu için karar onaya düşüyor.")

Modeli nasıl eğittiklerini tam olarak anlatmıyorlar. Söyledikleri üç şey var: yeni bir mimari, çıktıları tek seferde paralel üreten bir örnekleme yöntemi ve RLCD adını verdikleri bir eğitim yaklaşımı. RLHF modeli insanların beğendiği cevaplara doğru iterken RLCD kalibrasyonu hedefliyor. Yani model "yüzde 80 eminim" diyorsa, gerçekten de aşağı yukarı yüzde 80 oranında haklı çıkmalı.

Rakamlar epey iddialı. Milyon girdi token'ı 0,042 dolar, çıktı bedava, yanıt süresi 70 ile 500 milisaniye arası. Kendi kurdukları iş akışı testlerinde LLM'lere göre 193 kat hızlı ve 444 kat ucuz olduklarını söylüyorlar. Bir de gerçek bir müşteri örneği paylaşmışlar. İşe alım platformu Jack & Jill, aday ön elemesinde kullandığı Gemini Flash Lite'ın yerine Jev'i koymuş. Bin aday başına maliyet 0,755 dolardan 0,092 dolara inmiş, bir adayın elenme süresi kabaca 20 saniyeden 10 saniyeye düşmüş, kalite de düşmemiş. Denemeden canlıya geçiş on gün sürmüş.

Yine de birkaç şeyi akılda tutmak lazım. Bu rakamların neredeyse hepsi şirketin kendi ölçümleri, ortada bağımsız bir test henüz yok. Hakkını vermek lazım, TypeSafe bunu kendi yazısında açıkça söylüyor: testleri kendi ekipleri kurmuş ve fiyatın şimdilik sübvanse olabileceğini de kabul ediyorlar. "Sıfır halüsinasyon" iddiası da cevabın her zaman tanımlı seçeneklerden biri olduğu anlamına geliyor, her zaman doğru olduğu anlamına değil. Model gayet emin bir şekilde yanlış seçeneği seçebilir. Üstelik Jev size bir sayı veriyor ama bir gerekçe vermiyor. Mimari de kapalı olduğu için neden öyle karar verdiğini sorgulamanın bir yolu yok. Kalibrasyon ürünün kalbi olduğu hâlde ben şimdilik kamuya açık bir kalibrasyon grafiği de göremedim.

Jev'in ne olmadığını da söylemek gerek. Sohbet etmiyor, kod yazmıyor, araç çağırmıyor, uzun uzun akıl yürütmüyor. Dokümantasyondaki bir tavsiye ise bence bütün LLM projelerinde geçerli: "bu girişim fikrini puanla" gibi her şeyi tek bir soruya sıkıştırmak yerine pazarı, teknik zorluğu ve rakiplerden farkı ayrı ayrı sorun, ağırlıklandırmayı da kendi kodunuzda yapın.

---

İkisini yan yana koyunca aklıma şöyle bir kurgu geldi. Henüz denemedim ama kâğıt üzerinde mantıklı duruyor.

![](graphrag-ve-jev/birlikte.html "Henüz denenmemiş bir öneri: küçük kararları Jev veriyor, grafik bağlamı topluyor, büyük model yalnızca cevabı yazarken devreye giriyor.")

Soru geldiğinde önce Jev'e "bu belirli bir bilgiyi mi soruyor, yoksa bütünü mü?" diye soruyorsunuz. Cevaba göre ya ucuz yerel aramaya ya da pahalı topluluk özetlerine gidiyorsunuz. Diyelim grafik araması yirmi parça getirdi. Her biri için yine Jev'e "bu soruyu cevaplamaya yarıyor mu?" diye soruyorsunuz. Sorular paralel çalıştığı için yirmisini elemek birini elemekle aynı sürede bitiyor. Ancak bundan sonra temizlenmiş, kısalmış bağlamla büyük modeli çağırıyorsunuz. İsterseniz en sonda da cevabın gerçekten bağlama dayanıp dayanmadığını Jev'e puanlatıp, güven düşükse cevabı bir insana yollayabilirsiniz.

Bu kurguda pahalı ve yavaş model sadece gerçekten metin yazılması gereken yerde çalışıyor. Geri kalan her küçük karar ucuz, hızlı ve ne kadar emin olduğunu söyleyebilen bir modele kalıyor.

Bu iki siteden bana kalan şu oldu: LLM'i her işi yapan tek bir kara kutu gibi görmek yerine bağlamı toplamayı, karar vermeyi ve metin yazmayı ayrı işler olarak düşünmek ve her birine kendi aracını koymak. GraphRAG için graphrag.com şu an bulabileceğiniz en derli toplu kaynak. Jev'in iddiaları ise kendi verimle denemeden inanmayacağım kadar büyük ama sorduğu soru bence çok yerinde.
