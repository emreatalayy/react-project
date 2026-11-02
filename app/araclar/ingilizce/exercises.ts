import { units, type Blank, type Lesson, type PathNode, type Sentence, type Word } from './course';

export type Lang = 'en' | 'tr';

type ExerciseBody =
  | { kind: 'picture'; word: Word; options: Word[] }
  | { kind: 'select'; word: Word; options: string[] }
  | { kind: 'match'; pairs: Word[]; rightOrder: number[] }
  /** Build the translation of a sentence given in `from` out of word tiles */
  | { kind: 'build'; from: Lang; sentence: Sentence; tiles: string[] }
  | { kind: 'listen'; sentence: Sentence; tiles: string[] }
  /** Say the sentence aloud; `tiles` are kept for when speaking is switched off */
  | { kind: 'speak'; sentence: Sentence; tiles: string[] }
  | { kind: 'type'; sentence: Sentence }
  | { kind: 'blank'; blank: Blank; options: string[] };

/** A wrong answer sends the exercise to the back of the queue with `attempt` raised, which resets its view */
export type Exercise = ExerciseBody & { id: number; attempt: number };

/** What the learner has answered so far; `text` is the typed answer or the speech transcript */
export type Draft = { choice: number | null; picked: number[]; text: string };

/** Exercise kinds that need the browser's speech features */
export type Modes = { listening: boolean; speaking: boolean };

export type Grade = {
  correct: boolean;
  /** The expected answer, shown after a mistake */
  solution: string;
  /** Turkish meaning, for the listening exercise that showed no text */
  meaning?: string;
  note?: string;
};

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function sample<T>(items: readonly T[], count: number) {
  return shuffle(items).slice(0, count);
}

// Takes from `primary` first and tops up from `fallback`, skipping repeats of the same key
function pickDistinct<T>(primary: T[], fallback: T[], count: number, keyOf: (item: T) => string, exclude: string) {
  const seen = new Set([exclude]);
  const picked: T[] = [];
  for (const item of [...shuffle(primary), ...shuffle(fallback)]) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(item);
    if (picked.length === count) break;
  }
  return picked;
}

function lowerCase(text: string, lang: Lang) {
  return text.toLocaleLowerCase(lang === 'tr' ? 'tr-TR' : 'en-US');
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
  "don't": 'do not',
  dont: 'do not',
  "doesn't": 'does not',
  doesnt: 'does not',
  "isn't": 'is not',
  isnt: 'is not',
  "aren't": 'are not',
  arent: 'are not',
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

function levenshtein(a: string, b: string) {
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

let knownWords: Set<string> | null = null;

// Every English word the course uses. A slip that lands on one of these ("like" for "likes") is
// a grammar mistake, not a typo.
function isKnownWord(word: string) {
  if (!knownWords) {
    const texts = units.flatMap((unit) =>
      unit.lessons.flatMap((lesson) => [
        ...lesson.words.map((w) => w.en),
        ...lesson.sentences.flatMap((s) => [s.en, ...(s.enAlt ?? [])]),
        ...lesson.blanks.flatMap((b) => [b.en, ...b.options]),
      ]),
    );
    knownWords = new Set(texts.flatMap((text) => normalize(text, 'en').split(' ')));
  }
  return knownWords.has(word);
}

// One misspelt word of four or more letters is let through, as long as it is not a real word
function findTypo(input: string, answer: string) {
  const typed = input.split(' ');
  const expected = answer.split(' ');
  if (typed.length !== expected.length) return null;
  const differences = typed.flatMap((word, i) => (word === expected[i] ? [] : [[word, expected[i]] as const]));
  if (differences.length !== 1) return null;
  const [wrong, right] = differences[0];
  return right.length >= 4 && levenshtein(wrong, right) === 1 && !isKnownWord(wrong) ? { wrong, right } : null;
}

function accepted(sentence: Sentence, lang: Lang) {
  return lang === 'en' ? [sentence.en, ...(sentence.enAlt ?? [])] : [sentence.tr, ...(sentence.trAlt ?? [])];
}

function gradeSentence(input: string, sentence: Sentence, lang: Lang, allowTypo: boolean): Grade {
  const solution = sentence[lang];
  const answer = normalize(input, lang);
  const answers = accepted(sentence, lang).map((text) => normalize(text, lang));
  if (answers.includes(answer)) return { correct: true, solution };
  if (allowTypo) {
    for (const candidate of answers) {
      const typo = findTypo(answer, candidate);
      if (typo) return { correct: true, solution, note: `Küçük bir yazım hatası: “${typo.wrong}” değil, “${typo.right}”.` };
    }
  }
  return { correct: false, solution };
}

// Speech recognition writes numbers as digits and mishears names, so digits are spelt out and
// names are not required
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NAMES = new Set(['anna', 'tom', 'emre', 'elif', 'ali', 'istanbul', 'trabzon']);

function spokenWords(text: string) {
  return normalize(text, 'en')
    .split(' ')
    .map((word) => NUMBER_WORDS[Number(word)] ?? (word === '20' ? 'twenty' : word))
    .filter((word) => word && !NAMES.has(word));
}

function commonInOrder(a: string[], b: string[]) {
  let previous = new Array<number>(b.length + 1).fill(0);
  for (const word of a) {
    const row = [0];
    for (let j = 1; j <= b.length; j++) row[j] = word === b[j - 1] ? previous[j - 1] + 1 : Math.max(previous[j], row[j - 1]);
    previous = row;
  }
  return previous[b.length];
}

// Three of every four words heard in the right order is enough: recognition is not perfect either
function gradeSpeech(transcript: string, sentence: Sentence): Grade {
  const heard = spokenWords(transcript);
  const correct = accepted(sentence, 'en').some((answer) => {
    const expected = spokenWords(answer);
    return commonInOrder(heard, expected) >= Math.ceil(expected.length * 0.75);
  });
  return { correct, solution: sentence.en, note: transcript ? `Duyduğum: “${transcript}”` : undefined };
}

/** Index of the right option for the multiple choice exercises */
export function answerIndex(exercise: Exercise) {
  switch (exercise.kind) {
    case 'picture':
      return exercise.options.indexOf(exercise.word);
    case 'select':
      return exercise.options.indexOf(exercise.word.tr);
    case 'blank':
      return exercise.options.indexOf(exercise.blank.answer);
    default:
      return -1;
  }
}

export function canCheck(exercise: Exercise, draft: Draft) {
  switch (exercise.kind) {
    case 'build':
    case 'listen':
      return draft.picked.length > 0;
    case 'type':
    case 'speak':
      return draft.text.trim() !== '';
    case 'match':
      return false;
    default:
      return draft.choice !== null;
  }
}

export function grade(exercise: Exercise, draft: Draft): Grade {
  const correctChoice = draft.choice === answerIndex(exercise);
  switch (exercise.kind) {
    case 'picture':
      return { correct: correctChoice, solution: exercise.word.en };
    case 'select':
      return { correct: correctChoice, solution: exercise.word.tr };
    case 'blank':
      return { correct: correctChoice, solution: exercise.blank.en.replace('___', exercise.blank.answer) };
    case 'build': {
      const built = draft.picked.map((i) => exercise.tiles[i]).join(' ');
      return gradeSentence(built, exercise.sentence, exercise.from === 'tr' ? 'en' : 'tr', false);
    }
    case 'listen': {
      const built = draft.picked.map((i) => exercise.tiles[i]).join(' ');
      return { ...gradeSentence(built, exercise.sentence, 'en', false), meaning: exercise.sentence.tr };
    }
    case 'type':
      return gradeSentence(draft.text, exercise.sentence, 'en', true);
    case 'speak':
      return gradeSpeech(draft.text, exercise.sentence);
    case 'match':
      return { correct: true, solution: '' };
  }
}

/** The English and Turkish of a saved mistake, for the parents' summary */
export function mistakeText(key: string): { en: string; tr: string } | null {
  for (const lesson of units.flatMap((unit) => unit.lessons)) {
    const word = lesson.words.find((w) => key === `w:${w.en}`);
    if (word) return word;
    const sentence = lesson.sentences.find((s) => key === `s:${s.en}`);
    if (sentence) return { en: sentence.en, tr: sentence.tr };
    const blank = lesson.blanks.find((b) => key === `b:${b.en}`);
    if (blank) return { en: blank.en.replace('___', blank.answer), tr: blank.tr };
  }
  return null;
}

/** Identifies the word, sentence or blank an exercise practises, for the list of mistakes */
export function itemKey(exercise: Exercise) {
  switch (exercise.kind) {
    case 'picture':
    case 'select':
      return `w:${exercise.word.en}`;
    case 'blank':
      return `b:${exercise.blank.en}`;
    case 'match':
      return null;
    default:
      return `s:${exercise.sentence.en}`;
  }
}

let nextId = 0;

function make(body: ExerciseBody): Exercise {
  return { ...body, id: nextId++, attempt: 0 };
}

// Pronouns and articles never become extra tiles: "Ben" added to "Öğrenciyim" or "the" added
// to "I drink water" would be a correct sentence that the answer list does not know about.
const NOT_DISTRACTORS: Record<Lang, Set<string>> = {
  en: new Set(['a', 'an', 'the']),
  tr: new Set(['ben', 'sen', 'o', 'biz', 'siz', 'onlar', 'benim', 'senin', 'onun', 'bizim', 'sizin', 'onların', 'bir']),
};

function wordTiles(text: string, lang: Lang, unitIndex: number) {
  const answer = tokenize(text);
  const used = new Set(answer.map((word) => lowerCase(word, lang)));
  const pool = new Map<string, string>();
  for (const unit of units.slice(0, unitIndex + 1)) {
    for (const lesson of unit.lessons) {
      for (const sentence of lesson.sentences) {
        for (const word of tokenize(sentence[lang])) {
          const key = lowerCase(word, lang);
          if (!used.has(key) && !NOT_DISTRACTORS[lang].has(key) && !pool.has(key)) pool.set(key, word);
        }
      }
    }
  }
  const extra = answer.length <= 3 ? 4 : 3;
  return shuffle([...answer, ...sample([...pool.values()], extra)]);
}

function wordExercise(word: Word, lessonWords: Word[], unitWords: Word[]): Exercise {
  const withPicture = (words: Word[]) => words.filter((w) => w.emoji);
  if (word.emoji) {
    const others = pickDistinct(withPicture(lessonWords), withPicture(unitWords), 2, (w) => w.en, word.en);
    if (others.length === 2) return make({ kind: 'picture', word, options: shuffle([word, ...others]) });
  }
  const others = pickDistinct(lessonWords, unitWords, 3, (w) => w.tr, word.tr);
  return make({ kind: 'select', word, options: shuffle([word.tr, ...others.map((w) => w.tr)]) });
}

function matchExercise(words: Word[]): Exercise {
  const pairs = sample(words, 5);
  return make({ kind: 'match', pairs, rightOrder: shuffle(pairs.map((_, i) => i)) });
}

type SentenceKind = 'build-en' | 'build-tr' | 'listen' | 'type' | 'speak';
const ROTATION: SentenceKind[] = ['build-en', 'listen', 'build-tr', 'type', 'speak'];
const MAX_TYPED_WORDS = 4;

// Five sentences get one of each kind; a shorter list starts the rotation at a random kind
function sentenceExercises(sentences: Sentence[], unitIndex: number, modes: Modes) {
  const offset = Math.floor(Math.random() * ROTATION.length);
  const kinds = shuffle(sentences.map((_, i) => ROTATION[(i + offset) % ROTATION.length]));
  return sentences.map((sentence, i) => {
    // Typing a long sentence is too much for a child; those are built from tiles instead
    const tooLongToType = kinds[i] === 'type' && tokenize(sentence.en).length > MAX_TYPED_WORDS;
    const kind =
      (kinds[i] === 'listen' && !modes.listening) || (kinds[i] === 'speak' && !modes.speaking) || tooLongToType
        ? 'build-en'
        : kinds[i];
    switch (kind) {
      case 'build-en':
        return make({ kind: 'build', from: 'tr', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) });
      case 'build-tr':
        return make({ kind: 'build', from: 'en', sentence, tiles: wordTiles(sentence.tr, 'tr', unitIndex) });
      case 'listen':
        return make({ kind: 'listen', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) });
      case 'speak':
        return make({ kind: 'speak', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) });
      case 'type':
        return make({ kind: 'type', sentence });
    }
  });
}

function blankExercise(blank: Blank): Exercise {
  return make({ kind: 'blank', blank, options: shuffle(blank.options) });
}

// A lesson introduces its first words, matches them, then mixes sentences and blanks
function lessonExercises(lesson: Lesson, unitIndex: number, modes: Modes) {
  const unitWords = units[unitIndex].lessons.flatMap((l) => l.words);
  return [
    ...lesson.words.slice(0, 3).map((word) => wordExercise(word, lesson.words, unitWords)),
    matchExercise(lesson.words),
    ...shuffle([...sentenceExercises(lesson.sentences, unitIndex, modes), ...lesson.blanks.map(blankExercise)]),
  ];
}

/** A review over several lessons: unit reviews and the practice session */
export function mixedExercises(lessons: Lesson[], unitIndex: number, modes: Modes) {
  const words = lessons.flatMap((lesson) => lesson.words);
  const sentences = sample(
    lessons.flatMap((lesson) => lesson.sentences),
    6,
  );
  const blanks = sample(
    lessons.flatMap((lesson) => lesson.blanks),
    3,
  );
  return [
    ...sample(words, 2).map((word) => wordExercise(word, words, words)),
    matchExercise(words),
    ...shuffle([...sentenceExercises(sentences, unitIndex, modes), ...blanks.map(blankExercise)]),
  ];
}

export function buildExercises(node: PathNode, modes: Modes) {
  return node.kind === 'lesson'
    ? lessonExercises(node.lessons[0], node.unitIndex, modes)
    : mixedExercises(node.lessons, node.unitIndex, modes);
}

/** Free practice over up to four of the finished lessons */
export function practiceExercises(finished: PathNode[], modes: Modes) {
  const picked = sample(finished, 4);
  return mixedExercises(
    picked.flatMap((node) => node.lessons),
    Math.max(...picked.map((node) => node.unitIndex)),
    modes,
  );
}

/** The ten most recent mistakes, each as a fresh exercise */
export function mistakeExercises(keys: string[], modes: Modes) {
  const recent = new Set(keys.slice(-10));
  return shuffle(
    units.flatMap((unit, unitIndex) => {
      const unitWords = unit.lessons.flatMap((lesson) => lesson.words);
      return unit.lessons.flatMap((lesson) => [
        ...lesson.words.filter((w) => recent.has(`w:${w.en}`)).map((w) => wordExercise(w, lesson.words, unitWords)),
        ...sentenceExercises(
          lesson.sentences.filter((s) => recent.has(`s:${s.en}`)),
          unitIndex,
          modes,
        ),
        ...lesson.blanks.filter((b) => recent.has(`b:${b.en}`)).map(blankExercise),
      ]);
    }),
  );
}

/** Listening or speaking turned off mid-lesson: those exercises become English word-tile builds */
export function withoutKind(queue: Exercise[], kind: 'listen' | 'speak'): Exercise[] {
  return queue.map((exercise) =>
    (exercise.kind === 'listen' || exercise.kind === 'speak') && exercise.kind === kind
      ? {
          kind: 'build',
          from: 'tr',
          sentence: exercise.sentence,
          tiles: exercise.tiles,
          id: exercise.id,
          attempt: exercise.attempt + 1,
        }
      : exercise,
  );
}
