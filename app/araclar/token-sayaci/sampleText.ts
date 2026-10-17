// The same paragraph in both languages, so the token gap between them can be compared directly.
export const SAMPLE_TR =
  'Büyük dil modelleri metni harf harf değil, token adı verilen parçalar halinde işler. Bir token bazen tam bir kelime, bazen bir ek, bazen de tek bir karakterdir. Türkçe gibi eklemeli dillerde kelimeler çok sayıda eke bölündüğü için aynı anlamı taşıyan bir metin genellikle daha fazla token tutar. Bu da hem API maliyetini hem de bağlam penceresinin ne kadarının dolacağını doğrudan etkiler.';

export const SAMPLE_EN =
  'Large language models do not process text letter by letter; they process it in pieces called tokens. A token is sometimes a whole word, sometimes a suffix, and sometimes a single character. In agglutinative languages like Turkish, words split into many suffixes, so a text with the same meaning usually takes more tokens. This directly affects both the API cost and how much of the context window gets filled.';
