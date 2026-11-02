// Why an answer was wrong, in one short Turkish sentence a child can follow. The rules are the ones
// Turkish speakers trip over most: am/is/are, a/an, -s after he/she/it, have/has, prepositions.
import type { Blank } from './course';
import { normalize, type Lang } from './text';

const BE = ['am', 'is', 'are'];
const NUMBERS = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const POSSESSIVES = ['the', 'my', 'your', 'his', 'her', 'our', 'their'];

const WHY = {
  be: 'I ile am; he, she, it ve tek bir şeyle is; you, we, they ve birden çok şeyle are kullanılır.',
  beMissing: 'Türkçedeki “-im, -sin, -dir” eklerinin yerine İngilizcede am, is, are gelir; atlanamaz.',
  article: 'Türkçede “bir” demesek de İngilizcede tek bir şeyden önce a ya da an gelir.',
  aAn: 'Sesli harfle (a, e, i, o, u) başlayan kelimeden önce an, diğerlerinden önce a gelir.',
  haveHas: 'I, you, we, they ile have; he, she, it ile has kullanılır.',
  thirdS: 'He, she, it ile geniş zamanda fiile -s eklenir: she likes, he goes.',
  noS: 'I, you, we, they ile fiil yalın kalır; -s yalnızca he, she, it ile eklenir.',
  doDoes: 'Soru sorarken I, you, we, they ile do; he, she, it ile does kullanılır.',
  dontDoesnt: 'Olumsuzda I, you, we, they ile don’t; he, she, it ile doesn’t gelir. doesn’t’tan sonra fiil -s almaz.',
  not: 'Olumsuz yapmak için am, is, are’dan sonra not gelir: I am not tired.',
  can: 'can “yapabilir” demektir; sonraki fiil yalın kalır. Soru sorarken can başa geçer.',
  time: 'Saatten önce at (at seven), günden önce on (on Sunday), sabah ve akşam gibi gün bölümlerinden önce in (in the morning) gelir.',
  surface: 'Bir şeyin üstünde duran şey için on kullanılır: on the wall.',
  lookAt: 'look’tan sonra at gelir: look at the globe.',
  possessive: 'Sahiplik için my (benim), your (senin), his (onun, erkek), her (onun, kız), our (bizim), their (onların) kullanılır.',
  plural: 'Birden fazla şey varsa isme -s eklenir. Türkçede “üç kedi” deriz ama İngilizcede three cats.',
  very: 'Bir özelliği güçlendirmek için very kullanılır: very big.',
  age: 'Yaş sorarken How old are you? denir.',
  ageBe: 'Yaş söylerken have değil be kullanılır: She is ten years old.',
  colour: 'Renk sormak için What colour is it? denir.',
  command: 'Komut verirken cümle fiilin yalın hâliyle başlar: Open your book.',
  order: 'Kelimeler doğru ama sırası farklı. İngilizcede sıra çoğunlukla: kim + ne yapıyor + neyi (I eat bread).',
  heShe: 'he erkekler, she kızlar ve kadınlar için kullanılır.',
  hisHer: 'his erkeğin, her kızın ya da kadının olan şey için kullanılır.',
};

const lower = (words: string[]) => words.map((w) => w.toLowerCase().replace(/’/g, "'"));

// An option list like like / likes / liking: a verb and its -s form
function hasSForm(options: string[]) {
  return options.some((o) => options.includes(`${o}s`) || options.includes(`${o}es`));
}

export function explainBlank(blank: Blank): string | undefined {
  const options = lower(blank.options);
  const answer = blank.answer.toLowerCase().replace(/’/g, "'");
  const sentence = blank.en.toLowerCase();
  if (BE.includes(answer) && options.filter((o) => BE.includes(o)).length >= 2) return WHY.be;
  if (sentence.includes('years old')) return WHY.ageBe;
  if (answer === 'not') return WHY.not;
  if (options.includes('a') && options.includes('an')) return WHY.aAn;
  if (options.includes('have') && options.includes('has')) return WHY.haveHas;
  if (options.includes('do') && options.includes('does')) return WHY.doDoes;
  if (options.includes("don't") && options.includes("doesn't")) return WHY.dontDoesnt;
  if (answer === 'can') return WHY.can;
  if (['at', 'on', 'in'].includes(answer)) {
    if (sentence.startsWith('look')) return WHY.lookAt;
    if (sentence.includes('wall')) return WHY.surface;
    return WHY.time;
  }
  if (options.some((o) => ['my', 'his', 'her', 'our', 'their'].includes(o))) return WHY.possessive;
  if (/\b(two|three|four|five)\b/.test(sentence) && sentence.endsWith('___.')) return WHY.plural;
  if (sentence.startsWith('___') && sentence.endsWith('.')) return WHY.command;
  if (hasSForm(options)) return answer.endsWith('s') && !options.includes(`${answer}s`) ? WHY.thirdS : WHY.noS;
  if (answer === 'very') return WHY.very;
  if (answer === 'old') return WHY.age;
  if (answer === 'colour') return WHY.colour;
  return undefined;
}

/** For a wrong English sentence: the first rule the answer breaks that we can recognise */
export function explainSentence(input: string, answer: string): string | undefined {
  const typed = normalize(input, 'en').split(' ').filter(Boolean);
  const expected = normalize(answer, 'en').split(' ');
  const has = (word: string) => typed.includes(word);
  const wants = (word: string) => expected.includes(word);
  if (typed.length === expected.length && [...typed].sort().join(' ') === [...expected].sort().join(' ')) return WHY.order;
  const expectedBe = expected.find((w) => BE.includes(w));
  if (expectedBe && !typed.some((w) => BE.includes(w))) return WHY.beMissing;
  if (expectedBe && !has(expectedBe)) return WHY.be;
  if ((wants('a') && !has('a')) || (wants('an') && !has('an'))) return has('a') || has('an') ? WHY.aAn : WHY.article;
  if (wants('has') && has('have')) return WHY.haveHas;
  if (wants('have') && has('has')) return WHY.haveHas;
  if (wants('does') && has('do')) return WHY.dontDoesnt;
  if (wants('he') && has('she')) return WHY.heShe;
  if (wants('she') && has('he')) return WHY.heShe;
  if (wants('his') && has('her')) return WHY.hisHer;
  if (wants('her') && has('his')) return WHY.hisHer;
  // -s mistakes, told apart by what comes before the word: a number, he/she/it, or I/you/we/they
  for (const [i, word] of expected.entries()) {
    const before = expected[i - 1] ?? '';
    const singular = word.endsWith('es') && has(word.slice(0, -2)) ? word.slice(0, -2) : word.slice(0, -1);
    const droppedS = word.endsWith('s') && !has(word) && has(singular);
    if (droppedS && NUMBERS.includes(before)) return WHY.plural;
    const thirdPerson = ['he', 'she', 'it'].includes(before) || POSSESSIVES.includes(expected[i - 2] ?? '');
    if (droppedS && thirdPerson && !BE.includes(word)) return WHY.thirdS;
    if (['i', 'you', 'we', 'they'].includes(before) && has(`${word}s`) && !has(word)) return WHY.noS;
  }
  return undefined;
}

/** For each word of `solution`, whether the answer missed it; used to underline what to look at */
export function missedWords(input: string, solution: string, lang: Lang) {
  const typed = normalize(input, lang).split(' ');
  const pool = new Map<string, number>();
  for (const word of typed) pool.set(word, (pool.get(word) ?? 0) + 1);
  return solution.split(/\s+/).map((word) => {
    const parts = normalize(word, lang).split(' ');
    const found = parts.every((part) => (pool.get(part) ?? 0) > 0);
    if (found) for (const part of parts) pool.set(part, (pool.get(part) ?? 0) - 1);
    return !found;
  });
}
