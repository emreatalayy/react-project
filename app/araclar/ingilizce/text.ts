// Comparing answers: tokens, normal forms and edit distance.

export type Lang = 'en' | 'tr';

export function lowerCase(text: string, lang: Lang) {
  return text.toLocaleLowerCase(lang === 'tr' ? 'tr-TR' : 'en-US');
}

export function capitalize(text: string, lang: Lang) {
  return text.charAt(0).toLocaleUpperCase(lang === 'tr' ? 'tr-TR' : 'en-US') + text.slice(1);
}

/** Words of a sentence without surrounding punctuation; apostrophes inside a word stay */
export function tokenize(sentence: string) {
  return sentence
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);
}

const CONTRACTIONS: Record<string, string> = {
  "i'm": 'i am',
  im: 'i am',
  "you're": 'you are',
  youre: 'you are',
  "he's": 'he is',
  hes: 'he is',
  "she's": 'she is',
  shes: 'she is',
  "it's": 'it is',
  "we're": 'we are',
  "they're": 'they are',
  theyre: 'they are',
  "i'd": 'i would',
  "let's": 'let us',
  "don't": 'do not',
  dont: 'do not',
  "doesn't": 'does not',
  doesnt: 'does not',
  "isn't": 'is not',
  isnt: 'is not',
  "aren't": 'are not',
  arent: 'are not',
  "can't": 'cannot',
  cant: 'cannot',
};

/** Lower case, no punctuation, contractions spelled out: what two answers are compared on */
export function normalize(text: string, lang: Lang) {
  let value = text.normalize('NFC').replace(/[’‘`´]/g, "'");
  // A Turkish keyboard easily types İ or ı into an English answer
  value = lang === 'en' ? value.replace(/İ/g, 'I').replace(/ı/g, 'i').toLowerCase() : lowerCase(value, 'tr');
  const words = value.replace(/[^\p{L}\p{N}'\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const expanded = lang === 'en' ? words.flatMap((word) => (CONTRACTIONS[word] ?? word).split(' ')) : words;
  return expanded
    .map((word) => word.replace(/'/g, ''))
    .filter(Boolean)
    .join(' ');
}

export function levenshtein(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = row;
  }
  return previous[b.length];
}

/** Length of the longest run of words the two lists share in the same order */
export function commonInOrder(a: string[], b: string[]) {
  let previous = new Array<number>(b.length + 1).fill(0);
  for (const word of a) {
    const row = [0];
    for (let j = 1; j <= b.length; j++) row[j] = word === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], row[j - 1]);
    previous = row;
  }
  return previous[b.length];
}
