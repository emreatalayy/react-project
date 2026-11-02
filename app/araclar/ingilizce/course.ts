import { stories } from './stories';

// A1 English course for Turkish speakers. Exercises are generated from this data (see exercises.ts),
// so a lesson only lists its words, sentences and fill-in-the-blank items.

export type Word = {
  en: string;
  tr: string;
  /** Shown on picture cards; only concrete, easily drawn words have one */
  emoji?: string;
};

export type Sentence = {
  en: string;
  tr: string;
  /** Other correct English answers (contractions are already accepted) */
  enAlt?: string[];
  /** Other correct Turkish answers: dropped pronouns, other word orders, synonyms */
  trAlt?: string[];
};

export type Blank = {
  /** Sentence with ___ where the answer goes */
  en: string;
  answer: string;
  options: string[];
  tr: string;
};

export type Lesson = {
  id: string;
  title: string;
  words: Word[];
  sentences: Sentence[];
  blanks: Blank[];
};

export type Tip = {
  title: string;
  body: string;
  examples: { en: string; tr: string }[];
};

export type Unit = {
  id: string;
  title: string;
  description: string;
  /** Bright accent; lighter and darker shades are mixed from it */
  color: string;
  emoji: string;
  /** Earned by opening the unit's chest, the review at the end of the unit */
  sticker: { emoji: string; name: string };
  /** Something a parent can play at home with the child, shown in the parent corner */
  homeIdea: string;
  tips: Tip[];
  lessons: Lesson[];
};

export type Speaker = 'findik' | 'elif' | 'can' | 'deniz';

export type StoryLine = { speaker: Speaker; en: string; tr: string };

/** Asked after line `after` (0-based); `answer` is one of `options` */
export type StoryQuestion = { after: number; prompt: string; options: string[]; answer: string };

/** A short dialogue near the end of a unit, read line by line with a few questions */
export type Story = { unitId: string; title: string; lines: StoryLine[]; questions: StoryQuestion[] };

export const units: Unit[] = [
  {
    id: 'selamlasma',
    title: 'Merhaba!',
    description: 'Selamlaşma, teşekkür etme ve hal hatır sorma',
    color: '#1cb0f6',
    emoji: '👋',
    sticker: { emoji: '🦜', name: 'Konuşkan papağan' },
    homeIdea:
      'Bir gün boyunca evde selamları İngilizce yapın: sabah “Good morning!”, yatarken “Good night!”. Unutan, ötekine bir puan verir.',
    tips: [
      {
        title: 'Günün saatine göre selam',
        body: 'Hello her zaman kullanılır, hi daha samimidir. Good morning öğlene kadar, good afternoon öğleden sonra, good evening akşam selamlaşırken söylenir. Good night ise selam değil vedadır: yatmadan önce ya da akşam ayrılırken.',
        examples: [
          { en: 'Hi, Tom!', tr: 'Selam Tom!' },
          { en: 'Good night!', tr: 'İyi geceler!' },
        ],
      },
      {
        title: 'Teşekkür etmek',
        body: 'Thank you ve daha samimi olan thanks aynı anlama gelir. Cevap olarak you are welcome (rica ederim) denir.',
        examples: [
          { en: 'Thanks a lot!', tr: 'Çok teşekkürler!' },
          { en: 'You are welcome.', tr: 'Rica ederim.' },
        ],
      },
    ],
    lessons: [
      {
        id: 'selamlar',
        title: 'Selamlar',
        words: [
          { en: 'hello', tr: 'merhaba', emoji: '👋' },
          { en: 'goodbye', tr: 'hoşça kal' },
          { en: 'yes', tr: 'evet', emoji: '👍' },
          { en: 'no', tr: 'hayır', emoji: '👎' },
          { en: 'please', tr: 'lütfen', emoji: '🙏' },
          { en: 'thank you', tr: 'teşekkür ederim' },
        ],
        sentences: [
          { en: 'Hello, Anna!', tr: 'Merhaba Anna!' },
          { en: 'Yes, please.', tr: 'Evet, lütfen.' },
          { en: 'No, thank you.', tr: 'Hayır, teşekkür ederim.', enAlt: ['No, thanks.'], trAlt: ['Hayır, teşekkürler.'] },
          { en: 'Goodbye, Tom!', tr: 'Hoşça kal Tom!', trAlt: ['Güle güle Tom!'] },
          { en: 'Thank you, Anna!', tr: 'Teşekkür ederim Anna!', enAlt: ['Thanks, Anna!'], trAlt: ['Teşekkürler Anna!'] },
        ],
        blanks: [],
      },
      {
        id: 'gunaydin',
        title: 'Günaydın',
        words: [
          { en: 'good morning', tr: 'günaydın', emoji: '🌅' },
          { en: 'good afternoon', tr: 'iyi günler', emoji: '☀️' },
          { en: 'good evening', tr: 'iyi akşamlar', emoji: '🌆' },
          { en: 'good night', tr: 'iyi geceler', emoji: '🌙' },
          { en: 'tomorrow', tr: 'yarın' },
        ],
        sentences: [
          { en: 'Good morning, Tom!', tr: 'Günaydın Tom!' },
          { en: 'Good night, Mom.', tr: 'İyi geceler anne.' },
          { en: 'See you tomorrow!', tr: 'Yarın görüşürüz!' },
          { en: 'Good afternoon, Anna.', tr: 'İyi günler Anna.', trAlt: ['Tünaydın Anna.'] },
          { en: 'Good evening, Dad.', tr: 'İyi akşamlar baba.' },
        ],
        blanks: [],
      },
      {
        id: 'nasilsin',
        title: 'Nasılsın?',
        words: [
          { en: 'how', tr: 'nasıl' },
          { en: 'fine', tr: 'iyi' },
          { en: 'very', tr: 'çok' },
          { en: 'and', tr: 've' },
          { en: 'you', tr: 'sen' },
        ],
        sentences: [
          { en: 'How are you?', tr: 'Nasılsın?', trAlt: ['Nasılsınız?', 'Sen nasılsın?'] },
          {
            en: 'I am fine, thank you.',
            tr: 'İyiyim, teşekkür ederim.',
            enAlt: ['I am fine, thanks.', 'I am good, thank you.'],
            trAlt: ['Ben iyiyim, teşekkür ederim.', 'İyiyim, teşekkürler.', 'Ben iyiyim, teşekkürler.'],
          },
          { en: 'I am very well.', tr: 'Çok iyiyim.', enAlt: ['I am very good.'], trAlt: ['Ben çok iyiyim.'] },
          { en: 'And you?', tr: 'Ya sen?', trAlt: ['Ya siz?', 'Sen?'] },
          { en: 'Nice to meet you.', tr: 'Tanıştığımıza memnun oldum.', trAlt: ['Memnun oldum.', 'Tanıştığıma memnun oldum.'] },
        ],
        blanks: [
          { en: 'How ___ you?', answer: 'are', options: ['are', 'is', 'am'], tr: 'Nasılsın?' },
          { en: 'I ___ fine.', answer: 'am', options: ['am', 'is', 'are'], tr: 'İyiyim.' },
        ],
      },
    ],
  },
  {
    id: 'ben-kimim',
    title: 'Ben kimim?',
    description: 'Kendini tanıtma, meslekler ve am / is / are',
    color: '#a560e8',
    emoji: '🙋',
    sticker: { emoji: '😎', name: 'Havalı' },
    homeIdea:
      'Oyuncak bebekler ya da peluşlarla tanışma oyunu oynayın: her biri kendini tanıtsın, “Hello, my name is …”, “I am a doctor.” gibi.',
    tips: [
      {
        title: 'to be: am / is / are',
        body: 'Türkçedeki -im, -sin, -dir eklerinin karşılığıdır. I ile am; he, she ve it ile is; you, we ve they ile are kullanılır. Konuşmada kısaltılır: I’m, you’re, he’s.',
        examples: [
          { en: 'I am a student.', tr: 'Ben öğrenciyim.' },
          { en: 'They are doctors.', tr: 'Onlar doktor.' },
        ],
      },
      {
        title: 'Olumsuz ve soru',
        body: 'Olumsuz yapmak için fiilden sonra not gelir: I am not. Soru sormak için fiil başa geçer: Are you tired?',
        examples: [
          { en: 'She is not sad.', tr: 'O üzgün değil.' },
          { en: 'Is he busy?', tr: 'O meşgul mü?' },
        ],
      },
      {
        title: 'Meslekten önce a / an',
        body: 'Türkçede “Ben öğretmenim” deriz ama İngilizcede tekil meslekten önce a ya da an gelir: I am a teacher. Sesli harfle başlayan kelimelerden önce an kullanılır: an engineer.',
        examples: [{ en: 'He is an engineer.', tr: 'O bir mühendis.' }],
      },
    ],
    lessons: [
      {
        id: 'tanisma',
        title: 'Tanışma',
        words: [
          { en: 'name', tr: 'isim', emoji: '📛' },
          { en: 'student', tr: 'öğrenci', emoji: '🎒' },
          { en: 'teacher', tr: 'öğretmen', emoji: '🧑‍🏫' },
          { en: 'doctor', tr: 'doktor', emoji: '🩺' },
          { en: 'friend', tr: 'arkadaş', emoji: '🤝' },
        ],
        sentences: [
          {
            en: 'My name is Emre.',
            tr: 'Benim adım Emre.',
            enAlt: ['I am Emre.'],
            trAlt: ['Adım Emre.', 'Benim ismim Emre.', 'İsmim Emre.'],
          },
          { en: 'I am a student.', tr: 'Ben öğrenciyim.', trAlt: ['Öğrenciyim.', 'Ben bir öğrenciyim.'] },
          {
            en: 'You are a teacher.',
            tr: 'Sen öğretmensin.',
            trAlt: ['Öğretmensin.', 'Sen bir öğretmensin.', 'Siz öğretmensiniz.', 'Öğretmensiniz.'],
          },
          { en: 'She is a doctor.', tr: 'O bir doktor.', trAlt: ['O doktor.', 'O bir doktordur.', 'O doktordur.'] },
          { en: 'He is my friend.', tr: 'O benim arkadaşım.', trAlt: ['O arkadaşım.'] },
        ],
        blanks: [
          { en: 'I ___ a student.', answer: 'am', options: ['am', 'is', 'are'], tr: 'Ben öğrenciyim.' },
          { en: 'She ___ a doctor.', answer: 'is', options: ['am', 'is', 'are'], tr: 'O bir doktor.' },
          { en: 'You ___ a teacher.', answer: 'are', options: ['am', 'is', 'are'], tr: 'Sen öğretmensin.' },
        ],
      },
      {
        id: 'nerelisin',
        title: 'Nerelisin?',
        words: [
          { en: 'city', tr: 'şehir', emoji: '🏙️' },
          { en: 'country', tr: 'ülke', emoji: '🗺️' },
          { en: 'big', tr: 'büyük' },
          { en: 'beautiful', tr: 'güzel' },
          { en: 'where', tr: 'nerede' },
        ],
        sentences: [
          { en: 'I am from Turkey.', tr: 'Ben Türkiye’denim.', trAlt: ['Türkiye’denim.', 'Ben Türkiyeliyim.', 'Türkiyeliyim.'] },
          {
            en: 'Where are you from?',
            tr: 'Nerelisin?',
            trAlt: ['Sen nerelisin?', 'Nerelisiniz?', 'Siz nerelisiniz?'],
          },
          {
            en: 'Istanbul is a big city.',
            tr: 'İstanbul büyük bir şehir.',
            trAlt: ['İstanbul büyük bir şehirdir.', 'İstanbul büyük bir kent.'],
          },
          { en: 'Trabzon is a beautiful city.', tr: 'Trabzon güzel bir şehir.', trAlt: ['Trabzon güzel bir şehirdir.'] },
          { en: 'We are Turkish.', tr: 'Biz Türk’üz.', trAlt: ['Türk’üz.', 'Biz Türküz.', 'Türküz.'] },
        ],
        blanks: [
          { en: 'Where ___ you from?', answer: 'are', options: ['am', 'is', 'are'], tr: 'Nerelisin?' },
          { en: 'Istanbul ___ a big city.', answer: 'is', options: ['am', 'is', 'are'], tr: 'İstanbul büyük bir şehir.' },
          { en: 'We ___ Turkish.', answer: 'are', options: ['am', 'is', 'are'], tr: 'Biz Türk’üz.' },
        ],
      },
      {
        id: 'degilim',
        title: 'Değilim',
        words: [
          { en: 'happy', tr: 'mutlu', emoji: '😊' },
          { en: 'sad', tr: 'üzgün', emoji: '😢' },
          { en: 'tired', tr: 'yorgun', emoji: '🥱' },
          { en: 'hungry', tr: 'aç', emoji: '😋' },
          { en: 'busy', tr: 'meşgul' },
        ],
        sentences: [
          { en: 'I am not tired.', tr: 'Yorgun değilim.', trAlt: ['Ben yorgun değilim.'] },
          { en: 'Are you hungry?', tr: 'Aç mısın?', trAlt: ['Sen aç mısın?', 'Aç mısınız?', 'Acıktın mı?'] },
          { en: 'She is not sad.', tr: 'O üzgün değil.', trAlt: ['O üzgün değildir.', 'Üzgün değil.'] },
          { en: 'We are happy.', tr: 'Biz mutluyuz.', trAlt: ['Mutluyuz.'] },
          { en: 'Is he busy?', tr: 'O meşgul mü?', trAlt: ['Meşgul mü?'] },
        ],
        blanks: [
          { en: 'I am ___ tired.', answer: 'not', options: ['not', 'no', 'don’t'], tr: 'Yorgun değilim.' },
          { en: '___ you hungry?', answer: 'Are', options: ['Am', 'Is', 'Are'], tr: 'Aç mısın?' },
          { en: '___ he busy?', answer: 'Is', options: ['Am', 'Is', 'Are'], tr: 'O meşgul mü?' },
        ],
      },
    ],
  },
  {
    id: 'renkler',
    title: 'Renkler',
    description: 'Renkleri öğren, etrafındaki şeylerin rengini söyle',
    color: '#ff4b4b',
    emoji: '🎨',
    sticker: { emoji: '🌈', name: 'Gökkuşağı' },
    homeIdea:
      'Evde “Something red!” oyunu oynayın: bir rengi İngilizce söyleyin, çocuk o renkte bir eşya bulup getirsin. Sonra sırayı ona verin.',
    tips: [
      {
        title: 'Bir şeyin rengi',
        body: 'Bir şeyin rengini söylerken is kullanırız: The sky is blue. Birden çok şey varsa are kullanırız: The stars are yellow.',
        examples: [
          { en: 'The sky is blue.', tr: 'Gökyüzü mavi.' },
          { en: 'The stars are yellow.', tr: 'Yıldızlar sarı.' },
        ],
      },
      {
        title: 'Renk önce gelir',
        body: 'Tıpkı Türkçedeki gibi, renk eşyanın önüne gelir. Kırmızı bir balon: a red balloon.',
        examples: [
          { en: 'a red balloon', tr: 'kırmızı bir balon' },
          { en: 'a green hat', tr: 'yeşil bir şapka' },
        ],
      },
      {
        title: 'Ne renk?',
        body: 'Bir şeyin rengini sormak için What colour is it? deriz. Amerikalılar colour yerine color yazar; ikisi de doğru.',
        examples: [{ en: 'What colour is it?', tr: 'O ne renk?' }],
      },
    ],
    lessons: [
      {
        id: 'ana-renkler',
        title: 'Ana renkler',
        words: [
          { en: 'red', tr: 'kırmızı', emoji: '🔴' },
          { en: 'blue', tr: 'mavi', emoji: '🔵' },
          { en: 'yellow', tr: 'sarı', emoji: '🟡' },
          { en: 'green', tr: 'yeşil', emoji: '🟢' },
          { en: 'black', tr: 'siyah', emoji: '⚫' },
        ],
        sentences: [
          { en: 'The sky is blue.', tr: 'Gökyüzü mavi.', trAlt: ['Gökyüzü mavidir.', 'Gök mavi.'] },
          { en: 'The sun is yellow.', tr: 'Güneş sarı.', trAlt: ['Güneş sarıdır.'] },
          { en: 'The grass is green.', tr: 'Çimen yeşil.', trAlt: ['Çimen yeşildir.', 'Çimenler yeşil.', 'Ot yeşil.'] },
          { en: 'My hat is red.', tr: 'Şapkam kırmızı.', trAlt: ['Benim şapkam kırmızı.', 'Şapkam kırmızıdır.'] },
          { en: 'The cat is black.', tr: 'Kedi siyah.', trAlt: ['Kedi siyahtır.'] },
        ],
        blanks: [
          { en: 'The sky ___ blue.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Gökyüzü mavi.' },
          { en: 'I ___ red.', answer: 'like', options: ['like', 'likes', 'liking'], tr: 'Kırmızıyı severim.' },
        ],
      },
      {
        id: 'renkli-dunya',
        title: 'Renkli dünya',
        words: [
          { en: 'white', tr: 'beyaz', emoji: '⚪' },
          { en: 'pink', tr: 'pembe', emoji: '🌸' },
          { en: 'purple', tr: 'mor', emoji: '🟣' },
          { en: 'brown', tr: 'kahverengi', emoji: '🟤' },
          { en: 'colour', tr: 'renk', emoji: '🖍️' },
        ],
        sentences: [
          { en: 'Snow is white.', tr: 'Kar beyaz.', trAlt: ['Kar beyazdır.'] },
          { en: 'The flower is pink.', tr: 'Çiçek pembe.', trAlt: ['Çiçek pembedir.'] },
          { en: 'The bear is brown.', tr: 'Ayı kahverengi.', trAlt: ['Ayı kahverengidir.'] },
          {
            en: 'I like purple.',
            tr: 'Moru severim.',
            trAlt: ['Ben moru severim.', 'Mor rengi severim.', 'Ben mor rengi severim.', 'Moru seviyorum.'],
          },
          {
            en: 'What colour is it?',
            tr: 'O ne renk?',
            enAlt: ['What color is it?'],
            trAlt: ['Ne renk?', 'Bu ne renk?', 'O hangi renk?', 'Rengi ne?'],
          },
        ],
        blanks: [
          { en: 'Snow ___ white.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Kar beyaz.' },
          { en: 'What ___ is it?', answer: 'colour', options: ['colour', 'how', 'who'], tr: 'O ne renk?' },
        ],
      },
      {
        id: 'en-sevdigim-renk',
        title: 'En sevdiğim renk',
        words: [
          { en: 'balloon', tr: 'balon', emoji: '🎈' },
          { en: 'flower', tr: 'çiçek', emoji: '🌻' },
          { en: 'sun', tr: 'güneş', emoji: '🌞' },
          { en: 'star', tr: 'yıldız', emoji: '⭐' },
          { en: 'hat', tr: 'şapka', emoji: '🧢' },
        ],
        sentences: [
          { en: 'My balloon is red.', tr: 'Balonum kırmızı.', trAlt: ['Benim balonum kırmızı.', 'Balonum kırmızıdır.'] },
          {
            en: 'I like green.',
            tr: 'Yeşili severim.',
            trAlt: ['Ben yeşili severim.', 'Yeşil rengi severim.', 'Ben yeşil rengi severim.', 'Yeşili seviyorum.'],
          },
          { en: 'The star is yellow.', tr: 'Yıldız sarı.', trAlt: ['Yıldız sarıdır.'] },
          { en: 'Is the flower white?', tr: 'Çiçek beyaz mı?' },
          {
            en: 'My favourite colour is blue.',
            tr: 'En sevdiğim renk mavi.',
            enAlt: ['My favorite color is blue.', 'My favourite color is blue.', 'My favorite colour is blue.'],
            trAlt: ['En sevdiğim renk mavidir.', 'Benim en sevdiğim renk mavi.'],
          },
        ],
        blanks: [
          { en: '___ the flower white?', answer: 'Is', options: ['Is', 'Are', 'Am'], tr: 'Çiçek beyaz mı?' },
          { en: 'The stars ___ yellow.', answer: 'are', options: ['is', 'are', 'am'], tr: 'Yıldızlar sarı.' },
        ],
      },
    ],
  },
  {
    id: 'hayvanlar',
    title: 'Hayvanlar',
    description: 'Evcil hayvanlar, çiftlik ve hayvanat bahçesi',
    color: '#58cc02',
    emoji: '🐾',
    sticker: { emoji: '🦁', name: 'Aslan yürekli' },
    homeIdea:
      'Hayvan sesi tahmini: siz bir hayvan sesi çıkarın, çocuk İngilizce adını söylesin, “A cow!” gibi. Sonra o ses çıkarsın, siz bilin.',
    tips: [
      {
        title: 'Benim bir ... var',
        body: 'Bir hayvanın olduğunu söylerken have kullanırız: I have a rabbit. He ve she ile has olur: She has a bird.',
        examples: [
          { en: 'I have a rabbit.', tr: 'Bir tavşanım var.' },
          { en: 'She has a bird.', tr: 'Onun bir kuşu var.' },
        ],
      },
      {
        title: 'can: yapabilir',
        body: 'can, bir şeyi yapabildiğini anlatır. Ducks can swim: Ördekler yüzebilir. Soru sormak için can başa gelir: Can a lion swim?',
        examples: [
          { en: 'Ducks can swim.', tr: 'Ördekler yüzebilir.' },
          { en: 'Can a lion swim?', tr: 'Aslan yüzebilir mi?' },
        ],
      },
      {
        title: 'Birden çok hayvan',
        body: 'Çoğu hayvanın sonuna -s ekleyince çoğul olur: bird, birds. Ama sheep hiç değişmez: one sheep, two sheep.',
        examples: [
          { en: 'two birds', tr: 'iki kuş' },
          { en: 'three sheep', tr: 'üç koyun' },
        ],
      },
    ],
    lessons: [
      {
        id: 'evcil-hayvanlar',
        title: 'Evcil hayvanlar',
        words: [
          { en: 'rabbit', tr: 'tavşan', emoji: '🐰' },
          { en: 'bird', tr: 'kuş', emoji: '🐦' },
          { en: 'mouse', tr: 'fare', emoji: '🐭' },
          { en: 'turtle', tr: 'kaplumbağa', emoji: '🐢' },
          { en: 'hamster', tr: 'hamster', emoji: '🐹' },
        ],
        sentences: [
          { en: 'I have a rabbit.', tr: 'Bir tavşanım var.', trAlt: ['Benim bir tavşanım var.', 'Tavşanım var.'] },
          { en: 'The bird is small.', tr: 'Kuş küçük.', trAlt: ['Kuş küçüktür.', 'Kuş ufak.'] },
          { en: 'My turtle is slow.', tr: 'Kaplumbağam yavaş.', trAlt: ['Benim kaplumbağam yavaş.', 'Kaplumbağam yavaştır.'] },
          { en: 'The mouse is grey.', tr: 'Fare gri.', enAlt: ['The mouse is gray.'], trAlt: ['Fare gridir.'] },
          { en: 'She has a bird.', tr: 'Onun bir kuşu var.', trAlt: ['Bir kuşu var.', 'Onun kuşu var.'] },
        ],
        blanks: [
          { en: 'I ___ a rabbit.', answer: 'have', options: ['have', 'has', 'having'], tr: 'Bir tavşanım var.' },
          { en: 'She ___ a bird.', answer: 'has', options: ['have', 'has', 'having'], tr: 'Onun bir kuşu var.' },
          { en: 'The bird ___ small.', answer: 'is', options: ['is', 'are', 'have'], tr: 'Kuş küçük.' },
        ],
      },
      {
        id: 'ciftlikte',
        title: 'Çiftlikte',
        words: [
          { en: 'cow', tr: 'inek', emoji: '🐄' },
          { en: 'horse', tr: 'at', emoji: '🐴' },
          { en: 'sheep', tr: 'koyun', emoji: '🐑' },
          { en: 'duck', tr: 'ördek', emoji: '🦆' },
          { en: 'goat', tr: 'keçi', emoji: '🐐' },
        ],
        sentences: [
          { en: 'The cow is big.', tr: 'İnek büyük.', trAlt: ['İnek büyüktür.', 'İnek iri.'] },
          { en: 'A horse can run.', tr: 'At koşabilir.', enAlt: ['Horses can run.'], trAlt: ['Bir at koşabilir.', 'Atlar koşabilir.'] },
          {
            en: 'Ducks can swim.',
            tr: 'Ördekler yüzebilir.',
            enAlt: ['A duck can swim.'],
            trAlt: ['Ördekler yüzer.', 'Ördek yüzebilir.'],
          },
          {
            en: 'I like sheep.',
            tr: 'Koyunları severim.',
            trAlt: ['Ben koyunları severim.', 'Koyun severim.', 'Ben koyun severim.', 'Koyunları seviyorum.'],
          },
          { en: 'The goat is white.', tr: 'Keçi beyaz.', trAlt: ['Keçi beyazdır.'] },
        ],
        blanks: [
          { en: 'A horse ___ run.', answer: 'can', options: ['can', 'cans', 'to'], tr: 'At koşabilir.' },
          { en: 'The cow ___ big.', answer: 'is', options: ['is', 'are', 'am'], tr: 'İnek büyük.' },
          { en: 'Ducks ___ swim.', answer: 'can', options: ['can', 'is', 'are'], tr: 'Ördekler yüzebilir.' },
        ],
      },
      {
        id: 'hayvanat-bahcesi',
        title: 'Hayvanat bahçesi',
        words: [
          { en: 'lion', tr: 'aslan', emoji: '🦁' },
          { en: 'elephant', tr: 'fil', emoji: '🐘' },
          { en: 'monkey', tr: 'maymun', emoji: '🐒' },
          { en: 'giraffe', tr: 'zürafa', emoji: '🦒' },
          { en: 'bear', tr: 'ayı', emoji: '🐻' },
        ],
        sentences: [
          { en: 'The elephant is very big.', tr: 'Fil çok büyük.', trAlt: ['Fil çok büyüktür.', 'Fil çok iri.'] },
          {
            en: 'Monkeys can climb.',
            tr: 'Maymunlar tırmanabilir.',
            enAlt: ['A monkey can climb.'],
            trAlt: ['Maymunlar tırmanır.', 'Maymun tırmanabilir.'],
          },
          { en: 'The giraffe is tall.', tr: 'Zürafa uzun.', trAlt: ['Zürafa uzundur.', 'Zürafa uzun boylu.'] },
          {
            en: 'Can a lion swim?',
            tr: 'Aslan yüzebilir mi?',
            enAlt: ['Can lions swim?'],
            trAlt: ['Bir aslan yüzebilir mi?', 'Aslanlar yüzebilir mi?'],
          },
          {
            en: 'I like bears.',
            tr: 'Ayıları severim.',
            trAlt: ['Ben ayıları severim.', 'Ayı severim.', 'Ben ayı severim.', 'Ayıları seviyorum.'],
          },
        ],
        blanks: [
          { en: '___ a lion swim?', answer: 'Can', options: ['Can', 'Is', 'Are'], tr: 'Aslan yüzebilir mi?' },
          { en: 'The giraffe ___ tall.', answer: 'is', options: ['is', 'are', 'can'], tr: 'Zürafa uzun.' },
          { en: 'The elephant is ___ big.', answer: 'very', options: ['very', 'many', 'much'], tr: 'Fil çok büyük.' },
        ],
      },
    ],
  },
  {
    id: 'vucudumuz',
    title: 'Vücudumuz',
    description: 'Yüzümüz, ellerimiz, ayaklarımız ve hareket komutları',
    color: '#ffc800',
    emoji: '🖐️',
    sticker: { emoji: '🦸', name: 'Süper kahraman' },
    homeIdea:
      '“Fındık diyor ki” oyunu oynayın: “Touch your nose!”, “Clap your hands!” deyin, çocuk söyleneni yapsın. Sonra sırayı ona verin, o size komut versin.',
    tips: [
      {
        title: 'Bir göz, iki göz',
        body: 'Birden fazla olunca kelimenin sonuna -s gelir: one eye, two eyes. Ama bazıları değişir: foot olur feet, tooth olur teeth.',
        examples: [
          { en: 'I have two eyes.', tr: 'İki gözüm var.' },
          { en: 'two feet', tr: 'iki ayak' },
        ],
      },
      {
        title: 'Komut vermek',
        body: 'Touch your nose gibi cümleler yapılacak işle başlar. your “senin” demektir: your nose, senin burnun.',
        examples: [
          { en: 'Touch your nose.', tr: 'Burnuna dokun.' },
          { en: 'Clap your hands.', tr: 'Ellerini çırp.' },
        ],
      },
      {
        title: 'have ve has',
        body: 'Sende bir şey varsa have dersin: I have ten fingers. Kedi için, ya da he ve she için has kullanılır: The cat has big ears.',
        examples: [{ en: 'The cat has big ears.', tr: 'Kedinin büyük kulakları var.' }],
      },
    ],
    lessons: [
      {
        id: 'yuzum',
        title: 'Yüzüm',
        words: [
          { en: 'eye', tr: 'göz', emoji: '👁️' },
          { en: 'ear', tr: 'kulak', emoji: '👂' },
          { en: 'nose', tr: 'burun', emoji: '👃' },
          { en: 'mouth', tr: 'ağız', emoji: '👄' },
          { en: 'tooth', tr: 'diş', emoji: '🦷' },
        ],
        sentences: [
          { en: 'I have two eyes.', tr: 'İki gözüm var.', trAlt: ['Benim iki gözüm var.'] },
          { en: 'Touch your nose.', tr: 'Burnuna dokun.', trAlt: ['Burnunuza dokunun.', 'Burnuna dokun lütfen.'] },
          { en: 'Open your mouth.', tr: 'Ağzını aç.', trAlt: ['Ağzınızı açın.', 'Ağzını aç lütfen.'] },
          {
            en: 'The cat has big ears.',
            tr: 'Kedinin büyük kulakları var.',
            trAlt: ['Kedinin kulakları büyük.', 'Kedinin kocaman kulakları var.'],
          },
          {
            en: 'I have white teeth.',
            tr: 'Beyaz dişlerim var.',
            trAlt: ['Benim beyaz dişlerim var.', 'Dişlerim beyaz.', 'Benim dişlerim beyaz.'],
          },
        ],
        blanks: [
          { en: 'I ___ two eyes.', answer: 'have', options: ['have', 'has', 'am'], tr: 'İki gözüm var.' },
          { en: 'The cat ___ big ears.', answer: 'has', options: ['have', 'has', 'is'], tr: 'Kedinin büyük kulakları var.' },
          { en: 'I have two ___.', answer: 'eyes', options: ['eye', 'eyes', 'an eye'], tr: 'İki gözüm var.' },
        ],
      },
      {
        id: 'ellerim',
        title: 'Ellerim ve ayaklarım',
        words: [
          { en: 'hand', tr: 'el', emoji: '✋' },
          { en: 'foot', tr: 'ayak', emoji: '🦶' },
          { en: 'arm', tr: 'kol', emoji: '💪' },
          { en: 'leg', tr: 'bacak', emoji: '🦵' },
          { en: 'finger', tr: 'parmak', emoji: '👆' },
        ],
        sentences: [
          {
            en: 'My hands are clean.',
            tr: 'Ellerim temiz.',
            trAlt: ['Benim ellerim temiz.', 'Ellerim temizdir.', 'Ellerim tertemiz.'],
          },
          { en: 'Clap your hands.', tr: 'Ellerini çırp.', trAlt: ['Alkışla.', 'Ellerinizi çırpın.', 'El çırp.'] },
          { en: 'I have ten fingers.', tr: 'On parmağım var.', trAlt: ['Benim on parmağım var.'] },
          {
            en: 'A bird has two legs.',
            tr: 'Kuşun iki bacağı var.',
            enAlt: ['Birds have two legs.'],
            trAlt: ['Bir kuşun iki bacağı var.', 'Kuşların iki bacağı var.', 'Kuşun iki ayağı var.'],
          },
          {
            en: 'Can you touch your feet?',
            tr: 'Ayaklarına dokunabilir misin?',
            trAlt: ['Ayaklarına dokunabiliyor musun?', 'Ayaklarınıza dokunabilir misiniz?', 'Sen ayaklarına dokunabilir misin?'],
          },
        ],
        blanks: [
          { en: 'My hands ___ clean.', answer: 'are', options: ['is', 'are', 'am'], tr: 'Ellerim temiz.' },
          { en: 'I have ten ___.', answer: 'fingers', options: ['finger', 'fingers', 'a finger'], tr: 'On parmağım var.' },
          { en: '___ your hands.', answer: 'Clap', options: ['Clap', 'Claps', 'Clapping'], tr: 'Ellerini çırp.' },
        ],
      },
      {
        id: 'bastan-ayaga',
        title: 'Baştan ayağa',
        words: [
          { en: 'head', tr: 'baş', emoji: '🗣️' },
          { en: 'hair', tr: 'saç', emoji: '💇' },
          { en: 'face', tr: 'yüz', emoji: '🙂' },
          { en: 'clean', tr: 'temiz', emoji: '🧼' },
          { en: 'wash', tr: 'yıkamak', emoji: '🚿' },
        ],
        sentences: [
          { en: 'Wash your face.', tr: 'Yüzünü yıka.', trAlt: ['Yüzünüzü yıkayın.', 'Yüzünü yıka lütfen.'] },
          {
            en: 'Her hair is long.',
            tr: 'Onun saçı uzun.',
            trAlt: ['Saçı uzun.', 'Onun saçları uzun.', 'Saçları uzun.', 'Onun saçı uzundur.'],
          },
          { en: 'My face is clean.', tr: 'Yüzüm temiz.', trAlt: ['Benim yüzüm temiz.', 'Yüzüm temizdir.'] },
          { en: 'Shake your head.', tr: 'Başını salla.', trAlt: ['Kafanı salla.', 'Başınızı sallayın.'] },
          {
            en: 'I can touch my head.',
            tr: 'Başıma dokunabilirim.',
            trAlt: ['Ben başıma dokunabilirim.', 'Kafama dokunabilirim.', 'Ben kafama dokunabilirim.'],
          },
        ],
        blanks: [
          { en: '___ your face.', answer: 'Wash', options: ['Wash', 'Washes', 'Washing'], tr: 'Yüzünü yıka.' },
          { en: 'Her hair ___ long.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Onun saçı uzun.' },
          { en: 'I ___ touch my head.', answer: 'can', options: ['can', 'cans', 'am'], tr: 'Başıma dokunabilirim.' },
        ],
      },
    ],
  },
  {
    id: 'yemek',
    title: 'Yemek ve içecek',
    description: 'Kahvaltı, restoranda sipariş ve sevdiğin yemekler',
    color: '#ff9600',
    emoji: '🍎',
    sticker: { emoji: '🧁', name: 'Tatlı şef' },
    homeIdea:
      'Sofrada istekleri İngilizce yapın: “Water, please.”, “Bread, please.” Bir öğün boyunca sadece İngilizce istenen şey verilsin.',
    tips: [
      {
        title: 'a mı, an mı?',
        body: 'Tekil ve sayılabilen bir şeyden ilk kez söz ederken a ya da an kullanılır. Kelime sesli bir sesle başlıyorsa an gelir: an apple, an egg. Diğerlerinde a: a banana.',
        examples: [
          { en: 'I eat an apple.', tr: 'Bir elma yerim.' },
          { en: 'I want a banana.', tr: 'Bir muz istiyorum.' },
        ],
      },
      {
        title: 'like / likes',
        body: 'He, she ve it ile geniş zamanda fiile -s eklenir: she likes. Olumsuzda don’t ve doesn’t kullanılır; doesn’t’tan sonra fiil yalın kalır: he doesn’t like (likes değil).',
        examples: [
          { en: 'She likes cake.', tr: 'O pasta sever.' },
          { en: 'He doesn’t like sugar.', tr: 'O şeker sevmez.' },
        ],
      },
      {
        title: 'Kibarca istemek',
        body: 'I want doğrudan bir istektir. Restoranda I would like ... please demek daha kibardır; kısaltması I’d like.',
        examples: [{ en: 'I would like a tea, please.', tr: 'Bir çay alabilir miyim lütfen?' }],
      },
    ],
    lessons: [
      {
        id: 'kahvalti',
        title: 'Kahvaltı',
        words: [
          { en: 'water', tr: 'su', emoji: '💧' },
          { en: 'bread', tr: 'ekmek', emoji: '🍞' },
          { en: 'apple', tr: 'elma', emoji: '🍎' },
          { en: 'milk', tr: 'süt', emoji: '🥛' },
          { en: 'tea', tr: 'çay', emoji: '🍵' },
          { en: 'egg', tr: 'yumurta', emoji: '🥚' },
        ],
        sentences: [
          { en: 'I drink water.', tr: 'Ben su içerim.', trAlt: ['Su içerim.', 'Ben su içiyorum.', 'Su içiyorum.'] },
          { en: 'I eat bread.', tr: 'Ben ekmek yerim.', trAlt: ['Ekmek yerim.', 'Ben ekmek yiyorum.', 'Ekmek yiyorum.'] },
          { en: 'An apple and a tea, please.', tr: 'Bir elma ve bir çay lütfen.' },
          { en: 'The milk is cold.', tr: 'Süt soğuk.' },
          { en: 'I like eggs.', tr: 'Yumurta severim.', trAlt: ['Ben yumurta severim.', 'Yumurtayı severim.', 'Yumurta seviyorum.'] },
        ],
        blanks: [
          { en: 'I eat ___ apple.', answer: 'an', options: ['a', 'an', 'two'], tr: 'Bir elma yerim.' },
          { en: 'I have ___ egg.', answer: 'an', options: ['a', 'an', 'two'], tr: 'Bir yumurtam var.' },
        ],
      },
      {
        id: 'restoranda',
        title: 'Restoranda',
        words: [
          { en: 'soup', tr: 'çorba', emoji: '🍲' },
          { en: 'chicken', tr: 'tavuk', emoji: '🍗' },
          { en: 'rice', tr: 'pilav', emoji: '🍚' },
          { en: 'salad', tr: 'salata', emoji: '🥗' },
          { en: 'fish', tr: 'balık', emoji: '🐟' },
        ],
        sentences: [
          { en: 'I want soup.', tr: 'Çorba istiyorum.', enAlt: ['I want a soup.'], trAlt: ['Ben çorba istiyorum.'] },
          { en: 'The fish is very good.', tr: 'Balık çok güzel.', trAlt: ['Balık çok iyi.', 'Balık çok lezzetli.'] },
          {
            en: 'Do you want chicken?',
            tr: 'Tavuk ister misin?',
            trAlt: ['Tavuk istiyor musun?', 'Sen tavuk ister misin?', 'Tavuk ister misiniz?'],
          },
          { en: 'Rice and salad, please.', tr: 'Pilav ve salata lütfen.', trAlt: ['Pirinç ve salata lütfen.'] },
          { en: 'The menu, please.', tr: 'Menü lütfen.', trAlt: ['Menüyü alabilir miyim?'] },
        ],
        blanks: [
          { en: '___ you want chicken?', answer: 'Do', options: ['Do', 'Does', 'Are'], tr: 'Tavuk ister misin?' },
          { en: 'I ___ soup.', answer: 'want', options: ['want', 'wants', 'wanting'], tr: 'Çorba istiyorum.' },
        ],
      },
      {
        id: 'sevdiklerim',
        title: 'Sevdiğim yemekler',
        words: [
          { en: 'pizza', tr: 'pizza', emoji: '🍕' },
          { en: 'cake', tr: 'pasta', emoji: '🍰' },
          { en: 'banana', tr: 'muz', emoji: '🍌' },
          { en: 'orange', tr: 'portakal', emoji: '🍊' },
          { en: 'sugar', tr: 'şeker', emoji: '🍬' },
        ],
        sentences: [
          {
            en: 'I like pizza.',
            tr: 'Pizza severim.',
            trAlt: ['Ben pizza severim.', 'Pizzayı severim.', 'Pizza seviyorum.', 'Pizzayı seviyorum.'],
          },
          {
            en: 'I don’t like bananas.',
            tr: 'Muz sevmem.',
            trAlt: ['Ben muz sevmem.', 'Muzu sevmem.', 'Muz sevmiyorum.', 'Muzları sevmem.'],
          },
          { en: 'She likes cake.', tr: 'O pasta sever.', trAlt: ['O pastayı sever.', 'Pasta sever.'] },
          {
            en: 'Do you like oranges?',
            tr: 'Portakal sever misin?',
            trAlt: ['Portakalı sever misin?', 'Sen portakal sever misin?', 'Portakal sever misiniz?'],
          },
          { en: 'He doesn’t like sugar.', tr: 'O şeker sevmez.', trAlt: ['Şeker sevmez.', 'O şekeri sevmez.'] },
        ],
        blanks: [
          { en: 'She ___ cake.', answer: 'likes', options: ['like', 'likes', 'liking'], tr: 'O pasta sever.' },
          { en: 'I ___ like bananas.', answer: 'don’t', options: ['don’t', 'doesn’t', 'not'], tr: 'Muz sevmem.' },
          { en: 'He ___ like sugar.', answer: 'doesn’t', options: ['don’t', 'doesn’t', 'isn’t'], tr: 'O şeker sevmez.' },
        ],
      },
    ],
  },
  {
    id: 'aile',
    title: 'Aile',
    description: 'Aile üyeleri, sahiplik ve sayılar',
    color: '#e85d9e',
    emoji: '🏡',
    sticker: { emoji: '🧸', name: 'Mutlu yuva' },
    homeIdea:
      'Aile fotoğraflarına birlikte bakın ve “Who is this?” diye sorun; çocuk “This is my mother.” gibi cevaplasın.',
    tips: [
      {
        title: 'have / has',
        body: 'Türkçedeki “var” yapısının karşılığıdır: Bir kız kardeşim var = I have a sister. I, you, we ve they ile have; he, she ve it ile has kullanılır.',
        examples: [
          { en: 'I have a sister.', tr: 'Bir kız kardeşim var.' },
          { en: 'She has a car.', tr: 'Onun bir arabası var.' },
        ],
      },
      {
        title: 'Benim, senin, onun',
        body: 'my (benim), your (senin), his (onun, erkek için), her (onun, kadın için), its (onun, eşya ve hayvan için), our (bizim), their (onların). Türkçede tek bir “onun” varken İngilizcede kişinin cinsiyetine göre his ya da her seçilir.',
        examples: [
          { en: 'His name is Ali.', tr: 'Onun adı Ali.' },
          { en: 'Her name is Elif.', tr: 'Onun adı Elif.' },
        ],
      },
      {
        title: 'Çoğul ve yaş',
        body: 'Sayı birden fazlaysa isim çoğul olur: two dogs (Türkçede “iki köpek” tekildir). Yaş söylerken be fiili kullanılır: I am twenty years old. “I have twenty years” yanlıştır.',
        examples: [
          { en: 'We have two dogs.', tr: 'İki köpeğimiz var.' },
          { en: 'She is ten years old.', tr: 'O on yaşında.' },
        ],
      },
    ],
    lessons: [
      {
        id: 'ailem',
        title: 'Ailem',
        words: [
          { en: 'mother', tr: 'anne', emoji: '👩' },
          { en: 'father', tr: 'baba', emoji: '👨' },
          { en: 'baby', tr: 'bebek', emoji: '👶' },
          { en: 'family', tr: 'aile', emoji: '👨‍👩‍👧' },
          { en: 'sister', tr: 'kız kardeş', emoji: '👧' },
          { en: 'brother', tr: 'erkek kardeş', emoji: '👦' },
        ],
        sentences: [
          { en: 'This is my mother.', tr: 'Bu benim annem.', trAlt: ['Bu annem.'] },
          {
            en: 'My father is a teacher.',
            tr: 'Babam öğretmen.',
            trAlt: ['Benim babam öğretmen.', 'Babam bir öğretmen.', 'Babam öğretmendir.'],
          },
          { en: 'I have a sister.', tr: 'Bir kız kardeşim var.', trAlt: ['Benim bir kız kardeşim var.', 'Kız kardeşim var.'] },
          { en: 'He has two brothers.', tr: 'Onun iki erkek kardeşi var.', trAlt: ['İki erkek kardeşi var.'] },
          { en: 'We are a big family.', tr: 'Biz büyük bir aileyiz.', trAlt: ['Büyük bir aileyiz.'] },
        ],
        blanks: [
          { en: 'I ___ a sister.', answer: 'have', options: ['have', 'has', 'am'], tr: 'Bir kız kardeşim var.' },
          { en: 'He ___ two brothers.', answer: 'has', options: ['have', 'has', 'is'], tr: 'Onun iki erkek kardeşi var.' },
          { en: 'This is ___ mother.', answer: 'my', options: ['my', 'I', 'me'], tr: 'Bu benim annem.' },
        ],
      },
      {
        id: 'sahiplik',
        title: 'Benim, senin',
        words: [
          { en: 'house', tr: 'ev', emoji: '🏠' },
          { en: 'dog', tr: 'köpek', emoji: '🐶' },
          { en: 'cat', tr: 'kedi', emoji: '🐱' },
          { en: 'car', tr: 'araba', emoji: '🚗' },
          { en: 'small', tr: 'küçük' },
        ],
        sentences: [
          { en: 'Her name is Elif.', tr: 'Onun adı Elif.', trAlt: ['Adı Elif.', 'Onun ismi Elif.', 'İsmi Elif.'] },
          { en: 'His car is red.', tr: 'Onun arabası kırmızı.', trAlt: ['Arabası kırmızı.'] },
          { en: 'Our house is small.', tr: 'Bizim evimiz küçük.', trAlt: ['Evimiz küçük.'] },
          { en: 'Their dog is big.', tr: 'Onların köpeği büyük.', trAlt: ['Köpekleri büyük.', 'Onların köpekleri büyük.'] },
          { en: 'This is your cat.', tr: 'Bu senin kedin.', trAlt: ['Bu kedin.', 'Bu sizin kediniz.', 'Bu kediniz.'] },
        ],
        blanks: [
          {
            en: 'Ali has a car. ___ car is red.',
            answer: 'His',
            options: ['His', 'Her', 'Our'],
            tr: 'Ali’nin bir arabası var. Arabası kırmızı.',
          },
          {
            en: 'Elif has a dog. ___ dog is small.',
            answer: 'Her',
            options: ['His', 'Her', 'Their'],
            tr: 'Elif’in bir köpeği var. Köpeği küçük.',
          },
          {
            en: 'We have a house. ___ house is big.',
            answer: 'Our',
            options: ['Our', 'Their', 'My'],
            tr: 'Bizim bir evimiz var. Evimiz büyük.',
          },
        ],
      },
      {
        id: 'sayilar',
        title: 'Sayılar',
        words: [
          { en: 'one', tr: 'bir', emoji: '1️⃣' },
          { en: 'two', tr: 'iki', emoji: '2️⃣' },
          { en: 'three', tr: 'üç', emoji: '3️⃣' },
          { en: 'five', tr: 'beş', emoji: '5️⃣' },
          { en: 'ten', tr: 'on', emoji: '🔟' },
        ],
        sentences: [
          { en: 'I have three cats.', tr: 'Üç kedim var.', trAlt: ['Benim üç kedim var.'] },
          { en: 'She is ten years old.', tr: 'O on yaşında.', enAlt: ['She is ten.'], trAlt: ['On yaşında.'] },
          { en: 'How old are you?', tr: 'Kaç yaşındasın?', trAlt: ['Sen kaç yaşındasın?', 'Kaç yaşındasınız?'] },
          { en: 'I am twenty years old.', tr: 'Ben yirmi yaşındayım.', enAlt: ['I am twenty.'], trAlt: ['Yirmi yaşındayım.'] },
          { en: 'We have two dogs.', tr: 'İki köpeğimiz var.', trAlt: ['Bizim iki köpeğimiz var.'] },
        ],
        blanks: [
          { en: 'I have three ___.', answer: 'cats', options: ['cat', 'cats', 'a cat'], tr: 'Üç kedim var.' },
          { en: 'How ___ are you?', answer: 'old', options: ['old', 'many', 'age'], tr: 'Kaç yaşındasın?' },
          { en: 'She ___ ten years old.', answer: 'is', options: ['is', 'has', 'have'], tr: 'O on yaşında.' },
        ],
      },
    ],
  },
  {
    id: 'oyuncaklar',
    title: 'Oyuncaklar',
    description: 'Oyuncaklar, oyunlar ve birlikte oynamak',
    color: '#7c5cff',
    emoji: '🪀',
    sticker: { emoji: '🎲', name: 'Oyun ustası' },
    homeIdea:
      'Oyuncak kutusunu birlikte açın: çocuk bir oyuncak çıkarıp İngilizce tanıtsın, “This is my robot!” gibi. Adını bilmediği oyuncakları birlikte öğrenin.',
    tips: [
      {
        title: 'Let’s: Hadi …-elim',
        body: 'Birlikte bir şey yapmayı önermek için Let’s ile başlarız. Let’s play! Hadi oynayalım!',
        examples: [
          { en: 'Let’s play!', tr: 'Hadi oynayalım!' },
          { en: 'Let’s play together.', tr: 'Hadi birlikte oynayalım.' },
        ],
      },
      {
        title: 'Can I …? İzin istemek',
        body: 'Arkadaşının oyuncağıyla oynamak istersen kibarca Can I …? diye sorarsın.',
        examples: [{ en: 'Can I play with your ball?', tr: 'Topunla oynayabilir miyim?' }],
      },
      {
        title: 'Nerede?',
        body: 'Bir şeyi ararken Where is …? deriz. Where is my puzzle? Yapbozum nerede?',
        examples: [{ en: 'Where is my puzzle?', tr: 'Yapbozum nerede?' }],
      },
    ],
    lessons: [
      {
        id: 'oyuncak-kutusu',
        title: 'Oyuncak kutusu',
        words: [
          { en: 'ball', tr: 'top', emoji: '🏀' },
          { en: 'doll', tr: 'oyuncak bebek', emoji: '🪆' },
          { en: 'kite', tr: 'uçurtma', emoji: '🪁' },
          { en: 'robot', tr: 'robot', emoji: '🤖' },
          { en: 'puzzle', tr: 'yapboz', emoji: '🧩' },
        ],
        sentences: [
          { en: 'This is my robot.', tr: 'Bu benim robotum.', trAlt: ['Bu robotum.'] },
          {
            en: 'I like my kite.',
            tr: 'Uçurtmamı severim.',
            trAlt: ['Ben uçurtmamı severim.', 'Uçurtmamı seviyorum.', 'Ben uçurtmamı seviyorum.'],
          },
          { en: 'The ball is red.', tr: 'Top kırmızı.', trAlt: ['Top kırmızıdır.'] },
          {
            en: 'She has a doll.',
            tr: 'Onun bir oyuncak bebeği var.',
            trAlt: ['Bir oyuncak bebeği var.', 'Onun bir bebeği var.', 'Bir bebeği var.'],
          },
          { en: 'Where is my puzzle?', tr: 'Yapbozum nerede?', trAlt: ['Benim yapbozum nerede?'] },
        ],
        blanks: [
          { en: 'This is ___ robot.', answer: 'my', options: ['my', 'I', 'me'], tr: 'Bu benim robotum.' },
          { en: 'She ___ a doll.', answer: 'has', options: ['have', 'has', 'is'], tr: 'Onun bir oyuncak bebeği var.' },
          { en: 'Where ___ my puzzle?', answer: 'is', options: ['is', 'are', 'am'], tr: 'Yapbozum nerede?' },
        ],
      },
      {
        id: 'oyun-zamani',
        title: 'Oyun zamanı',
        words: [
          { en: 'bike', tr: 'bisiklet', emoji: '🚲' },
          { en: 'train', tr: 'tren', emoji: '🚂' },
          { en: 'drum', tr: 'davul', emoji: '🥁' },
          { en: 'game', tr: 'oyun', emoji: '🎮' },
          { en: 'block', tr: 'blok', emoji: '🧱' },
        ],
        sentences: [
          {
            en: 'Let’s play!',
            tr: 'Hadi oynayalım!',
            enAlt: ['Let us play!'],
            trAlt: ['Haydi oynayalım!', 'Oynayalım!'],
          },
          {
            en: 'Can I play with your ball?',
            tr: 'Topunla oynayabilir miyim?',
            trAlt: ['Senin topunla oynayabilir miyim?', 'Topunuzla oynayabilir miyim?'],
          },
          {
            en: 'I can ride a bike.',
            tr: 'Bisiklete binebilirim.',
            trAlt: ['Ben bisiklete binebilirim.', 'Bisiklet sürebilirim.', 'Ben bisiklet sürebilirim.'],
          },
          { en: 'The train is fast.', tr: 'Tren hızlı.', trAlt: ['Tren hızlıdır.'] },
          {
            en: 'He has a big drum.',
            tr: 'Onun büyük bir davulu var.',
            trAlt: ['Büyük bir davulu var.', 'Onun büyük davulu var.', 'Onun kocaman bir davulu var.'],
          },
        ],
        blanks: [
          { en: '___ I play with your ball?', answer: 'Can', options: ['Can', 'Am', 'Is'], tr: 'Topunla oynayabilir miyim?' },
          { en: 'I can ___ a bike.', answer: 'ride', options: ['ride', 'rides', 'riding'], tr: 'Bisiklete binebilirim.' },
          { en: 'The train ___ fast.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Tren hızlı.' },
        ],
      },
      {
        id: 'birlikte-oynayalim',
        title: 'Birlikte oynayalım',
        words: [
          { en: 'box', tr: 'kutu', emoji: '📦' },
          { en: 'fun', tr: 'eğlenceli', emoji: '🥳' },
          { en: 'new', tr: 'yeni', emoji: '🆕' },
          { en: 'together', tr: 'birlikte', emoji: '👫' },
          { en: 'jump', tr: 'zıplamak', emoji: '🤸' },
        ],
        sentences: [
          { en: 'This game is fun.', tr: 'Bu oyun eğlenceli.', trAlt: ['Bu oyun eğlencelidir.', 'Bu oyun çok eğlenceli.'] },
          {
            en: 'Let’s play together.',
            tr: 'Hadi birlikte oynayalım.',
            enAlt: ['Let us play together.'],
            trAlt: ['Birlikte oynayalım.', 'Haydi birlikte oynayalım.'],
          },
          {
            en: 'My toys are in the box.',
            tr: 'Oyuncaklarım kutuda.',
            trAlt: ['Benim oyuncaklarım kutuda.', 'Oyuncaklarım kutunun içinde.', 'Oyuncaklarım kutudadır.'],
          },
          { en: 'I have a new ball.', tr: 'Yeni bir topum var.', trAlt: ['Benim yeni bir topum var.', 'Yeni topum var.'] },
          {
            en: 'Can you jump?',
            tr: 'Zıplayabilir misin?',
            trAlt: ['Sen zıplayabilir misin?', 'Zıplayabiliyor musun?', 'Zıplayabilir misiniz?'],
          },
        ],
        blanks: [
          { en: 'My toys ___ in the box.', answer: 'are', options: ['is', 'are', 'am'], tr: 'Oyuncaklarım kutuda.' },
          { en: 'I have a ___ ball.', answer: 'new', options: ['new', 'news', 'newly'], tr: 'Yeni bir topum var.' },
          { en: 'This game ___ fun.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Bu oyun eğlenceli.' },
        ],
      },
    ],
  },
  {
    id: 'okulda',
    title: 'Okulda',
    description: 'Okul eşyaları ve sınıfta duyacağın cümleler',
    color: '#2b70c9',
    emoji: '🎒',
    sticker: { emoji: '🐛', name: 'Kitap kurdu' },
    homeIdea:
      'Okul çantasındaki eşyaları tek tek çıkarıp İngilizce adlarını söylesin: “This is my pencil.” Siz de “Open your book!” gibi komutlar verin.',
    tips: [
      {
        title: 'Sınıf komutları',
        body: 'Öğretmenler kısa komutlar verir. Bu cümleler yapılacak işle başlar: Open your book. Kibar olmak için please ekle.',
        examples: [
          { en: 'Open your book.', tr: 'Kitabını aç.' },
          { en: 'Close the door, please.', tr: 'Kapıyı kapat lütfen.' },
        ],
      },
      {
        title: 'this ve my',
        body: 'this “bu”, my “benim” demektir. This is my pen: Bu benim kalemim.',
        examples: [{ en: 'This is my pen.', tr: 'Bu benim kalemim.' }],
      },
      {
        title: 'İzin istemek',
        body: 'Arkadaşının bir eşyasını kullanmak istersen Can I ...? diye sorarsın.',
        examples: [{ en: 'Can I use your scissors?', tr: 'Makasını kullanabilir miyim?' }],
      },
    ],
    lessons: [
      {
        id: 'kalemlerim',
        title: 'Kalemlerim',
        words: [
          { en: 'pen', tr: 'tükenmez kalem', emoji: '🖊️' },
          { en: 'pencil', tr: 'kurşun kalem', emoji: '✏️' },
          { en: 'paper', tr: 'kağıt', emoji: '📄' },
          { en: 'ruler', tr: 'cetvel', emoji: '📏' },
          { en: 'notebook', tr: 'defter', emoji: '📓' },
        ],
        sentences: [
          {
            en: 'This is my pen.',
            tr: 'Bu benim kalemim.',
            trAlt: ['Bu kalemim.', 'Bu benim tükenmez kalemim.', 'Bu tükenmez kalemim.'],
          },
          {
            en: 'I have a red pencil.',
            tr: 'Kırmızı bir kurşun kalemim var.',
            trAlt: [
              'Benim kırmızı bir kurşun kalemim var.',
              'Bir kırmızı kurşun kalemim var.',
              'Kırmızı bir kalemim var.',
              'Bir kırmızı kalemim var.',
              'Benim kırmızı bir kalemim var.',
            ],
          },
          { en: 'Where is my ruler?', tr: 'Cetvelim nerede?', trAlt: ['Benim cetvelim nerede?'] },
          { en: 'The notebook is new.', tr: 'Defter yeni.', trAlt: ['Defter yenidir.'] },
          { en: 'The paper is white.', tr: 'Kağıt beyaz.', trAlt: ['Kağıt beyazdır.'] },
        ],
        blanks: [
          { en: 'This is ___ pen.', answer: 'my', options: ['my', 'I', 'me'], tr: 'Bu benim kalemim.' },
          { en: 'Where ___ my ruler?', answer: 'is', options: ['is', 'are', 'am'], tr: 'Cetvelim nerede?' },
          { en: 'I have ___ red pencil.', answer: 'a', options: ['a', 'an', 'two'], tr: 'Kırmızı bir kurşun kalemim var.' },
        ],
      },
      {
        id: 'sinifta',
        title: 'Sınıfta',
        words: [
          { en: 'chair', tr: 'sandalye', emoji: '🪑' },
          { en: 'door', tr: 'kapı', emoji: '🚪' },
          { en: 'clock', tr: 'saat', emoji: '🕒' },
          { en: 'computer', tr: 'bilgisayar', emoji: '💻' },
          { en: 'globe', tr: 'dünya küresi', emoji: '🌍' },
        ],
        sentences: [
          { en: 'Open your book.', tr: 'Kitabını aç.', trAlt: ['Kitabınızı açın.', 'Kitabını aç lütfen.', 'Lütfen kitabını aç.'] },
          {
            en: 'Close the door, please.',
            tr: 'Kapıyı kapat lütfen.',
            enAlt: ['Please close the door.'],
            trAlt: ['Lütfen kapıyı kapat.', 'Kapıyı kapatın lütfen.', 'Lütfen kapıyı kapatın.', 'Kapıyı kapatır mısın?'],
          },
          { en: 'Sit on your chair.', tr: 'Sandalyene otur.', trAlt: ['Sandalyenize oturun.'] },
          {
            en: 'Look at the globe.',
            tr: 'Dünya küresine bak.',
            trAlt: ['Küreye bak.', 'Dünya küresine bakın.', 'Küreye bakın.'],
          },
          {
            en: 'The clock is on the wall.',
            tr: 'Saat duvarda.',
            trAlt: ['Saat duvardadır.', 'Saat duvarın üstünde.', 'Saat duvarın üzerinde.'],
          },
        ],
        blanks: [
          { en: '___ your book.', answer: 'Open', options: ['Open', 'Opens', 'Opening'], tr: 'Kitabını aç.' },
          { en: 'The clock is ___ the wall.', answer: 'on', options: ['on', 'of', 'to'], tr: 'Saat duvarda.' },
          { en: 'Look ___ the globe.', answer: 'at', options: ['at', 'of', 'from'], tr: 'Dünya küresine bak.' },
        ],
      },
      {
        id: 'ders-zamani',
        title: 'Ders zamanı',
        words: [
          { en: 'homework', tr: 'ödev', emoji: '📝' },
          { en: 'bell', tr: 'zil', emoji: '🔔' },
          { en: 'scissors', tr: 'makas', emoji: '✂️' },
          { en: 'paintbrush', tr: 'fırça', emoji: '🖌️' },
          { en: 'lesson', tr: 'ders', emoji: '📚' },
        ],
        sentences: [
          {
            en: 'I can read and write.',
            tr: 'Okuyup yazabilirim.',
            trAlt: ['Ben okuyup yazabilirim.', 'Okuyabilir ve yazabilirim.', 'Okumayı ve yazmayı bilirim.'],
          },
          {
            en: 'We have English today.',
            tr: 'Bugün İngilizce dersimiz var.',
            enAlt: ['Today we have English.', 'We have an English lesson today.', 'We have English class today.'],
            trAlt: ['Bugün İngilizcemiz var.', 'Bugün bizim İngilizce dersimiz var.', 'Bugün İngilizce dersi var.'],
          },
          { en: 'Is this your homework?', tr: 'Bu senin ödevin mi?', trAlt: ['Bu ödevin mi?', 'Bu sizin ödeviniz mi?'] },
          { en: 'My homework is easy.', tr: 'Ödevim kolay.', trAlt: ['Benim ödevim kolay.', 'Ödevim kolaydır.'] },
          {
            en: 'Can I use your scissors?',
            tr: 'Makasını kullanabilir miyim?',
            trAlt: ['Senin makasını kullanabilir miyim?', 'Makasınızı kullanabilir miyim?'],
          },
        ],
        blanks: [
          { en: '___ this your homework?', answer: 'Is', options: ['Is', 'Are', 'Am'], tr: 'Bu senin ödevin mi?' },
          { en: '___ I use your scissors?', answer: 'Can', options: ['Can', 'Am', 'Is'], tr: 'Makasını kullanabilir miyim?' },
          { en: 'We ___ English today.', answer: 'have', options: ['have', 'has', 'having'], tr: 'Bugün İngilizce dersimiz var.' },
        ],
      },
    ],
  },
  {
    id: 'hava-giysiler',
    title: 'Hava ve giysiler',
    description: 'Hava nasıl, bugün ne giyelim?',
    color: '#0891b2',
    emoji: '🌦️',
    sticker: { emoji: '⛄', name: 'Kardan adam' },
    homeIdea:
      'Her sabah pencereden bakıp “What is the weather like?” diye sorun. Çocuk “It is sunny!” gibi cevaplasın ve o gün ne giyeceğini İngilizce söylesin: “My coat!”',
    tips: [
      {
        title: 'Hava nasıl? It is …',
        body: 'Havadan söz ederken cümleye It is ile başlarız: It is sunny. It is cold. Kısaca It’s da denir.',
        examples: [
          { en: 'It is sunny.', tr: 'Hava güneşli.' },
          { en: 'It is cold today.', tr: 'Bugün hava soğuk.' },
        ],
      },
      {
        title: 'Üşüyorum: I am cold',
        body: 'Türkçede “üşüyorum” deriz ama İngilizcede I am cold deriz. “I have cold” yanlıştır. Sıcakladıysan: I am hot.',
        examples: [
          { en: 'I am cold.', tr: 'Üşüyorum.' },
          { en: 'I am hot.', tr: 'Sıcakladım.' },
        ],
      },
      {
        title: 'Giyinmek: put on',
        body: 'Bir şeyi giymek için put on deriz. Put on your coat! Montunu giy!',
        examples: [{ en: 'Put on your coat.', tr: 'Montunu giy.' }],
      },
    ],
    lessons: [
      {
        id: 'hava-durumu',
        title: 'Hava durumu',
        words: [
          { en: 'sunny', tr: 'güneşli', emoji: '🌤️' },
          { en: 'rainy', tr: 'yağmurlu', emoji: '🌧️' },
          { en: 'cloudy', tr: 'bulutlu', emoji: '☁️' },
          { en: 'snowy', tr: 'karlı', emoji: '🌨️' },
          { en: 'windy', tr: 'rüzgârlı', emoji: '🌬️' },
        ],
        sentences: [
          {
            en: 'It is sunny.',
            tr: 'Hava güneşli.',
            trAlt: ['Güneşli.', 'Hava güneşlidir.', 'Bugün hava güneşli.'],
          },
          {
            en: 'It is rainy today.',
            tr: 'Bugün hava yağmurlu.',
            enAlt: ['It is raining today.', 'Today it is rainy.'],
            trAlt: ['Bugün yağmurlu.', 'Hava bugün yağmurlu.', 'Bugün yağmur yağıyor.'],
          },
          { en: 'Is it cloudy?', tr: 'Hava bulutlu mu?', trAlt: ['Bulutlu mu?'] },
          {
            en: 'It is windy and cold.',
            tr: 'Hava rüzgârlı ve soğuk.',
            trAlt: ['Rüzgârlı ve soğuk.', 'Hava rüzgarlı ve soğuk.', 'Rüzgarlı ve soğuk.'],
          },
          {
            en: 'I like snowy days.',
            tr: 'Karlı günleri severim.',
            trAlt: ['Ben karlı günleri severim.', 'Karlı günleri seviyorum.', 'Ben karlı günleri seviyorum.'],
          },
        ],
        blanks: [
          { en: 'It ___ sunny.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Hava güneşli.' },
          { en: '___ it cloudy?', answer: 'Is', options: ['Is', 'Are', 'Am'], tr: 'Hava bulutlu mu?' },
          { en: 'It is windy ___ cold.', answer: 'and', options: ['and', 'is', 'the'], tr: 'Hava rüzgârlı ve soğuk.' },
        ],
      },
      {
        id: 'sicak-soguk',
        title: 'Sıcak mı, soğuk mu?',
        words: [
          { en: 'hot', tr: 'sıcak', emoji: '🥵' },
          { en: 'cold', tr: 'soğuk', emoji: '🥶' },
          { en: 'snow', tr: 'kar', emoji: '❄️' },
          { en: 'umbrella', tr: 'şemsiye', emoji: '☂️' },
          { en: 'weather', tr: 'hava', emoji: '🌡️' },
        ],
        sentences: [
          {
            en: 'It is hot today.',
            tr: 'Bugün hava sıcak.',
            trAlt: ['Bugün sıcak.', 'Hava bugün sıcak.', 'Bugün hava sıcaktır.'],
          },
          { en: 'I am cold.', tr: 'Üşüyorum.', trAlt: ['Ben üşüyorum.', 'Üşüdüm.', 'Ben üşüdüm.'] },
          {
            en: 'Take your umbrella.',
            tr: 'Şemsiyeni al.',
            trAlt: ['Şemsiyenizi alın.', 'Şemsiyeni yanına al.', 'Şemsiyeni al lütfen.'],
          },
          { en: 'The snow is white and cold.', tr: 'Kar beyaz ve soğuk.', trAlt: ['Kar beyaz ve soğuktur.'] },
          {
            en: 'What is the weather like?',
            tr: 'Hava nasıl?',
            enAlt: ['How is the weather?'],
            trAlt: ['Hava durumu nasıl?', 'Havalar nasıl?'],
          },
        ],
        blanks: [
          { en: 'I ___ cold.', answer: 'am', options: ['am', 'is', 'have'], tr: 'Üşüyorum.' },
          { en: 'It is ___ today.', answer: 'hot', options: ['hot', 'hotly', 'heat'], tr: 'Bugün hava sıcak.' },
          { en: '___ your umbrella.', answer: 'Take', options: ['Take', 'Takes', 'Taking'], tr: 'Şemsiyeni al.' },
        ],
      },
      {
        id: 'giysilerim',
        title: 'Giysilerim',
        words: [
          { en: 'coat', tr: 'mont', emoji: '🧥' },
          { en: 'shoes', tr: 'ayakkabı', emoji: '👟' },
          { en: 'dress', tr: 'elbise', emoji: '👗' },
          { en: 'T-shirt', tr: 'tişört', emoji: '👕' },
          { en: 'socks', tr: 'çorap', emoji: '🧦' },
        ],
        sentences: [
          { en: 'Put on your coat.', tr: 'Montunu giy.', trAlt: ['Montunuzu giyin.', 'Paltonu giy.', 'Ceketini giy.'] },
          {
            en: 'I like my red shoes.',
            tr: 'Kırmızı ayakkabılarımı severim.',
            trAlt: ['Ben kırmızı ayakkabılarımı severim.', 'Kırmızı ayakkabılarımı seviyorum.'],
          },
          { en: 'Her dress is pink.', tr: 'Onun elbisesi pembe.', trAlt: ['Elbisesi pembe.', 'Onun elbisesi pembedir.'] },
          { en: 'My socks are blue.', tr: 'Çoraplarım mavi.', trAlt: ['Benim çoraplarım mavi.', 'Çoraplarım mavidir.'] },
          { en: 'Where is my T-shirt?', tr: 'Tişörtüm nerede?', trAlt: ['Benim tişörtüm nerede?'] },
        ],
        blanks: [
          { en: 'My socks ___ blue.', answer: 'are', options: ['is', 'are', 'am'], tr: 'Çoraplarım mavi.' },
          { en: 'Put ___ your coat.', answer: 'on', options: ['on', 'of', 'at'], tr: 'Montunu giy.' },
          { en: 'Her dress ___ pink.', answer: 'is', options: ['is', 'are', 'am'], tr: 'Onun elbisesi pembe.' },
        ],
      },
    ],
  },
  {
    id: 'gunluk',
    title: 'Günlük hayat',
    description: 'Geniş zaman, rutinler ve hafta sonu planları',
    color: '#00b8a3',
    emoji: '⏰',
    sticker: { emoji: '🦄', name: 'Tek boynuzlu at' },
    homeIdea:
      'Akşam yemeğinde günü birlikte anlatın: “I wake up at seven.”, “I go to school.” Çocuk kendi gününü üç cümleyle anlatmayı denesin.',
    tips: [
      {
        title: 'Geniş zaman (Present Simple)',
        body: 'Alışkanlıklar ve rutinler için kullanılır. He, she ve it ile fiile -s ya da -es eklenir: she goes, he watches. Diğer öznelerde fiil yalın kalır: I go, they watch.',
        examples: [
          { en: 'I wake up at seven.', tr: 'Yedide uyanırım.' },
          { en: 'She goes to school.', tr: 'O okula gider.' },
        ],
      },
      {
        title: 'do / does ile soru ve olumsuz',
        body: 'Soru: Do you play? Does he swim? Olumsuz: I don’t, she doesn’t. does ya da doesn’t varsa fiil -s almaz: Does he swim? (swims değil).',
        examples: [
          { en: 'Do you play football?', tr: 'Futbol oynar mısın?' },
          { en: 'She doesn’t go to the cinema.', tr: 'O sinemaya gitmez.' },
        ],
      },
      {
        title: 'at, on, in',
        body: 'Saatten önce at (at seven), günden önce on (on Sunday), ay, yıl ve günün bölümlerinden önce in (in the morning) gelir. Bazı kalıplar ezberlenir: at night, at the weekend.',
        examples: [
          { en: 'We go to the park on Sunday.', tr: 'Pazar günü parka gideriz.' },
          { en: 'They watch TV at night.', tr: 'Geceleri televizyon izlerler.' },
        ],
      },
    ],
    lessons: [
      {
        id: 'sabah',
        title: 'Sabah',
        words: [
          { en: 'breakfast', tr: 'kahvaltı', emoji: '🍳' },
          { en: 'school', tr: 'okul', emoji: '🏫' },
          { en: 'bus', tr: 'otobüs', emoji: '🚌' },
          { en: 'work', tr: 'iş', emoji: '💼' },
          { en: 'morning', tr: 'sabah', emoji: '🌄' },
        ],
        sentences: [
          {
            en: 'I wake up at seven.',
            tr: 'Yedide uyanırım.',
            trAlt: ['Ben yedide uyanırım.', 'Saat yedide uyanırım.', 'Ben saat yedide uyanırım.'],
          },
          {
            en: 'I eat breakfast every day.',
            tr: 'Her gün kahvaltı yaparım.',
            enAlt: ['I have breakfast every day.'],
            trAlt: ['Ben her gün kahvaltı yaparım.', 'Her gün kahvaltı ederim.'],
          },
          {
            en: 'She goes to school by bus.',
            tr: 'O okula otobüsle gider.',
            trAlt: ['Okula otobüsle gider.', 'O otobüsle okula gider.', 'Otobüsle okula gider.'],
          },
          { en: 'My father goes to work.', tr: 'Babam işe gider.', trAlt: ['Benim babam işe gider.', 'Babam işe gidiyor.'] },
          {
            en: 'We drink tea in the morning.',
            tr: 'Sabahları çay içeriz.',
            trAlt: ['Biz sabahları çay içeriz.', 'Sabah çay içeriz.', 'Biz sabah çay içeriz.'],
          },
        ],
        blanks: [
          { en: 'She ___ to school.', answer: 'goes', options: ['go', 'goes', 'going'], tr: 'O okula gider.' },
          { en: 'I ___ up at seven.', answer: 'wake', options: ['wake', 'wakes', 'waking'], tr: 'Yedide uyanırım.' },
          { en: 'We drink tea ___ the morning.', answer: 'in', options: ['at', 'on', 'in'], tr: 'Sabahları çay içeriz.' },
        ],
      },
      {
        id: 'aksam',
        title: 'Akşam',
        words: [
          { en: 'book', tr: 'kitap', emoji: '📖' },
          { en: 'music', tr: 'müzik', emoji: '🎵' },
          { en: 'dinner', tr: 'akşam yemeği', emoji: '🍽️' },
          { en: 'bed', tr: 'yatak', emoji: '🛏️' },
          { en: 'night', tr: 'gece', emoji: '🌃' },
        ],
        sentences: [
          {
            en: 'I read a book.',
            tr: 'Kitap okurum.',
            trAlt: ['Ben kitap okurum.', 'Bir kitap okurum.', 'Kitap okuyorum.', 'Ben kitap okuyorum.', 'Bir kitap okuyorum.'],
          },
          {
            en: 'They watch TV at night.',
            tr: 'Geceleri televizyon izlerler.',
            trAlt: ['Onlar geceleri televizyon izler.', 'Onlar geceleri televizyon izlerler.', 'Gece televizyon izlerler.'],
          },
          { en: 'He listens to music.', tr: 'O müzik dinler.', trAlt: ['Müzik dinler.', 'O müzik dinliyor.', 'Müzik dinliyor.'] },
          {
            en: 'We eat dinner at home.',
            tr: 'Akşam yemeğini evde yeriz.',
            enAlt: ['We have dinner at home.'],
            trAlt: ['Biz akşam yemeğini evde yeriz.', 'Evde akşam yemeği yeriz.'],
          },
          {
            en: 'I go to bed at eleven.',
            tr: 'On birde yatarım.',
            trAlt: ['Ben on birde yatarım.', 'Saat on birde yatarım.'],
          },
        ],
        blanks: [
          { en: 'He ___ to music.', answer: 'listens', options: ['listen', 'listens', 'listening'], tr: 'O müzik dinler.' },
          { en: 'They ___ TV at night.', answer: 'watch', options: ['watch', 'watches', 'watching'], tr: 'Geceleri televizyon izlerler.' },
          { en: 'I go to bed ___ eleven.', answer: 'at', options: ['at', 'in', 'on'], tr: 'On birde yatarım.' },
        ],
      },
      {
        id: 'hafta-sonu',
        title: 'Hafta sonu',
        words: [
          { en: 'park', tr: 'park', emoji: '🌳' },
          { en: 'football', tr: 'futbol', emoji: '⚽' },
          { en: 'cinema', tr: 'sinema', emoji: '🎬' },
          { en: 'swim', tr: 'yüzmek', emoji: '🏊' },
          { en: 'weekend', tr: 'hafta sonu', emoji: '🎉' },
        ],
        sentences: [
          {
            en: 'Do you play football?',
            tr: 'Futbol oynar mısın?',
            trAlt: ['Sen futbol oynar mısın?', 'Futbol oynuyor musun?', 'Futbol oynar mısınız?'],
          },
          {
            en: 'She doesn’t go to the cinema.',
            tr: 'O sinemaya gitmez.',
            trAlt: ['Sinemaya gitmez.', 'O sinemaya gitmiyor.'],
          },
          {
            en: 'We go to the park on Sunday.',
            tr: 'Pazar günü parka gideriz.',
            enAlt: ['We go to the park on Sundays.'],
            trAlt: ['Pazar günleri parka gideriz.', 'Biz pazar günü parka gideriz.', 'Pazar parka gideriz.'],
          },
          { en: 'Does he swim?', tr: 'O yüzer mi?', trAlt: ['Yüzer mi?', 'O yüzüyor mu?'] },
          {
            en: 'I meet my friends at the weekend.',
            tr: 'Hafta sonu arkadaşlarımla buluşurum.',
            enAlt: ['I meet my friends on the weekend.', 'I meet my friends at weekends.'],
            trAlt: ['Hafta sonları arkadaşlarımla buluşurum.', 'Ben hafta sonu arkadaşlarımla buluşurum.'],
          },
        ],
        blanks: [
          { en: '___ he swim?', answer: 'Does', options: ['Do', 'Does', 'Is'], tr: 'O yüzer mi?' },
          { en: 'She ___ go to the cinema.', answer: 'doesn’t', options: ['don’t', 'doesn’t', 'isn’t'], tr: 'O sinemaya gitmez.' },
          { en: 'We go to the park ___ Sunday.', answer: 'on', options: ['at', 'in', 'on'], tr: 'Pazar günü parka gideriz.' },
        ],
      },
    ],
  },
];

/** One stop on the learning path: a lesson, the unit's story, or the review chest that closes the unit */
export type PathNode = {
  id: string;
  kind: 'lesson' | 'story' | 'review';
  title: string;
  unit: Unit;
  unitIndex: number;
  lessons: Lesson[];
  story?: Story;
};

// Stops unlock in this order, each one after the previous is finished
export const pathNodes: PathNode[] = units.flatMap((unit, unitIndex) => {
  const story = stories.find((s) => s.unitId === unit.id);
  return [
    ...unit.lessons.map(
      (lesson): PathNode => ({ id: lesson.id, kind: 'lesson', title: lesson.title, unit, unitIndex, lessons: [lesson] }),
    ),
    ...(story
      ? [{ id: `${unit.id}-hikaye`, kind: 'story' as const, title: story.title, unit, unitIndex, lessons: unit.lessons, story }]
      : []),
    { id: `${unit.id}-tekrar`, kind: 'review', title: 'Ünite tekrarı', unit, unitIndex, lessons: unit.lessons },
  ];
});
