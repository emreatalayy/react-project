// New sentences built from words the learner already knows, so a pattern is practised with fresh
// combinations instead of the same five sentences. Only patterns whose Turkish needs no case
// endings, or endings that follow simple vowel harmony, are used.
import { units, type Sentence, type Word } from './course';
import { capitalize } from './text';

const COLOURS = ['red', 'blue', 'yellow', 'green', 'black', 'white', 'pink', 'purple', 'brown'];
const ANIMALS = ['cat', 'dog', 'rabbit', 'bird', 'mouse', 'turtle', 'cow', 'horse', 'duck', 'goat', 'lion', 'elephant', 'monkey', 'bear'];
const THINGS = [...ANIMALS, 'car', 'house', 'flower', 'balloon', 'star', 'hat', 'pencil', 'notebook', 'chair', 'door', 'cake', 'apple', 'ball', 'kite', 'robot'];
const SIZES = ['big', 'small'];

const VOWELS = 'aeıioöuü';
const HARD = 'fstkçşhp';

function lastVowel(word: string) {
  return [...word].reverse().find((c) => VOWELS.includes(c)) ?? 'e';
}

// Four-way harmony (ı, i, u, ü) after the word's last vowel
function fourWay(word: string) {
  const vowel = lastVowel(word);
  return 'aı'.includes(vowel) ? 'ı' : 'ei'.includes(vowel) ? 'i' : 'ou'.includes(vowel) ? 'u' : 'ü';
}

/** Question particle: kırmızı mı, mavi mi, mor mu */
function question(word: string) {
  return `m${fourWay(word)}`;
}

/** Accusative: kırmızıyı, yeşili, moru */
function accusative(word: string) {
  const vowel = fourWay(word);
  return VOWELS.includes(word.at(-1) ?? '') ? `${word}y${vowel}` : `${word}${vowel}`;
}

/** Copula: siyahtır, beyazdır, pembedir */
function copula(word: string) {
  const d = HARD.includes(word.at(-1) ?? '') ? 't' : 'd';
  return `${word}${d}${fourWay(word)}r`;
}

function article(en: string) {
  return 'aeiou'.includes(en[0]) ? 'an' : 'a';
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

type Pattern = (find: (list: string[]) => Word[]) => Sentence | null;

const PATTERNS: Pattern[] = [
  (find) => {
    const [thing, colour] = [pick(find(THINGS)), pick(find(COLOURS))];
    if (!thing || !colour) return null;
    return {
      en: `The ${thing.en} is ${colour.en}.`,
      tr: `${capitalize(thing.tr, 'tr')} ${colour.tr}.`,
      trAlt: [`${capitalize(thing.tr, 'tr')} ${copula(colour.tr)}.`],
    };
  },
  (find) => {
    const [thing, colour] = [pick(find(THINGS)), pick(find(COLOURS))];
    if (!thing || !colour) return null;
    return { en: `Is the ${thing.en} ${colour.en}?`, tr: `${capitalize(thing.tr, 'tr')} ${colour.tr} ${question(colour.tr)}?` };
  },
  (find) => {
    const colour = pick(find(COLOURS));
    if (!colour) return null;
    const object = accusative(colour.tr);
    return {
      en: `I like ${colour.en}.`,
      tr: `${capitalize(object, 'tr')} severim.`,
      trAlt: [`Ben ${object} severim.`, `${capitalize(object, 'tr')} seviyorum.`, `${capitalize(colour.tr, 'tr')} rengi severim.`],
    };
  },
  (find) => {
    const thing = pick(find(THINGS));
    if (!thing) return null;
    return { en: `This is ${article(thing.en)} ${thing.en}.`, tr: `Bu bir ${thing.tr}.`, trAlt: [`Bu ${thing.tr}.`] };
  },
  (find) => {
    const [animal, size] = [pick(find(ANIMALS)), pick(find(SIZES))];
    if (!animal || !size) return null;
    return {
      en: `The ${animal.en} is ${size.en}.`,
      tr: `${capitalize(animal.tr, 'tr')} ${size.tr}.`,
      trAlt: [`${capitalize(animal.tr, 'tr')} ${copula(size.tr)}.`],
    };
  },
];

/** A fresh sentence from the words of the units up to `unitIndex`, or null before there are enough */
export function patternSentence(unitIndex: number): Sentence | null {
  const known = new Map(
    units
      .slice(0, unitIndex + 1)
      .flatMap((unit) => unit.lessons.flatMap((lesson) => lesson.words))
      .map((word) => [word.en, word] as const),
  );
  const find = (list: string[]) => list.flatMap((en) => known.get(en) ?? []);
  // Start at a random pattern and take the first one the known words can fill
  const start = Math.floor(Math.random() * PATTERNS.length);
  for (let i = 0; i < PATTERNS.length; i++) {
    const sentence = PATTERNS[(start + i) % PATTERNS.length](find);
    if (sentence) return sentence;
  }
  return null;
}
