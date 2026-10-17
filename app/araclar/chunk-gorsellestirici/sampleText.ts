export const SAMPLE_TEXT = `RAG (Retrieval-Augmented Generation), büyük dil modellerinin cevap üretmeden önce harici bir bilgi kaynağına başvurmasını sağlayan bir yöntemdir. Model, soruyla ilgili belgeleri bir vektör veritabanından çeker ve cevabını bu belgelere dayandırır. Böylece modelin eğitim verisinde olmayan güncel ya da kuruma özel bilgiler de kullanılabilir.

Bu sürecin en kritik adımlarından biri belgeleri parçalara, yani chunk'lara ayırmaktır. Çok büyük parçalar alakasız bilgiyi de beraberinde getirir ve modelin bağlam penceresini gereksiz yere doldurur. Çok küçük parçalar ise anlamı böler; bir cümlenin yarısı bir chunk'ta, diğer yarısı başka bir chunk'ta kalabilir.

Overlap, yani örtüşme, bu sorunu hafifletmek için kullanılır. Ardışık iki chunk'ın bir kısmı ortak tutulduğunda, sınırda kalan bilgi her iki parçada da yer alır. Bunun bedeli, depolanan ve aranan metin miktarının artmasıdır.

Sabit boyutlu bölme en basit yöntemdir: metin belirli sayıda karakterden kesilir. Hızlıdır ama kelimeleri ve cümleleri ortadan bölebilir. Özyinelemeli bölme önce paragraflardan, sonra satırlardan ve en son kelimelerden bölmeyi dener; böylece parçalar mümkün olduğunca doğal sınırlarda biter. Cümle bazlı bölme ise cümleleri hiç bölmeden gruplar.

Doğru chunk boyutu belgelerin türüne, kullanılan embedding modeline ve sorulacak soruların yapısına göre değişir. Bu yüzden farklı ayarları deneyip sonucu gözle görmek, iyi bir RAG sisteminin ilk adımıdır.`;
