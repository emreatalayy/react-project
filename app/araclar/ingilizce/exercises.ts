import { units, type Blank, type Lesson, type PathNode, type Sentence, type Word } from './course';
import { explainBlank, explainSentence, missedWords } from './explain';
import { patternSentence } from './patterns';
import { SOUND_PAIRS, type SoundPair } from './sounds';
import { commonInOrder, levenshtein, lowerCase, normalize, tokenize, type Lang } from './text';

export { normalize, tokenize, type Lang };

type ExerciseBody =
  | { kind: 'picture'; word: Word; options: Word[] }
  /** Hear a word and pick its picture; the pictures carry no labels until the answer is checked */
  | { kind: 'hear'; word: Word; options: Word[] }
  | { kind: 'select'; word: Word; options: string[] }
  /** Look at a picture and say its English word */
  | { kind: 'say'; word: Word }
  /** Hear one of two words that differ in a single sound and pick which one it was */
  | { kind: 'pair'; pair: SoundPair; said: number }
  | { kind: 'match'; pairs: Word[]; rightOrder: number[] }
  /** Build the translation of a sentence given in `from` out of word tiles */
  | { kind: 'build'; from: Lang; sentence: Sentence; tiles: string[] }
  | { kind: 'listen'; sentence: Sentence; tiles: string[] }
  /** Say the sentence aloud; `tiles` are kept for when speaking is switched off */
  | { kind: 'speak'; sentence: Sentence; tiles: string[] }
  | { kind: 'type'; sentence: Sentence }
  | { kind: 'blank'; blank: Blank; options: string[] };

/**
 * A wrong answer sends the exercise to the back of the queue with `attempt` raised, which resets its view.
 * `generated` marks sentences built from patterns: they are practice, not course items to remember.
 */
export type Exercise = ExerciseBody & { id: number; attempt: number; generated?: boolean };

/** What the learner has answered so far; `text` is the typed answer or the speech transcript */
export type Draft = { choice: number | null; picked: number[]; text: string };

/** Exercise kinds that need the browser's speech features */
export type Modes = { listening: boolean; speaking: boolean };

export type Grade = {
  correct: boolean;
  /** The expected answer, shown after a mistake */
  solution: string;
  /** For each space-separated word of `solution`, whether the answer missed it */
  missed?: boolean[];
  /** Why the answer was wrong, when a known rule explains it */
  why?: string;
  /** Turkish meaning, for listening exercises that showed no text */
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

function pickOne<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)];
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
  return {
    correct: false,
    solution,
    missed: missedWords(input, solution, lang),
    why: lang === 'en' ? explainSentence(input, solution) : undefined,
  };
}

// Speech recognition writes numbers as digits and mishears names, so digits are spelt out and
// names are not required
const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NAMES = new Set(['anna', 'tom', 'emre', 'elif', 'ali', 'can', 'deniz', 'istanbul', 'trabzon']);

function spokenWords(text: string) {
  return normalize(text, 'en')
    .split(' ')
    .map((word) => NUMBER_WORDS[Number(word)] ?? (word === '20' ? 'twenty' : word))
    .filter((word) => word && !NAMES.has(word));
}

// Three of every four words heard in the right order is enough: recognition is not perfect either.
// The words that were not heard are named, so the child knows which ones to say more clearly.
function gradeSpeech(transcript: string, sentence: Sentence): Grade {
  const heard = spokenWords(transcript);
  let best = { score: -1, missing: [] as string[] };
  for (const answer of accepted(sentence, 'en')) {
    const expected = spokenWords(answer);
    const score = commonInOrder(heard, expected) / Math.max(expected.length, 1);
    if (score > best.score) best = { score, missing: expected.filter((word) => !heard.includes(word)) };
  }
  const notes = [
    transcript && `Duyduğum: “${transcript}”`,
    best.missing.length > 0 && `Tam duyamadıklarım: ${best.missing.join(', ')}`,
  ].filter(Boolean);
  return { correct: best.score >= 0.75, solution: sentence.en, note: notes.join(' · ') || undefined };
}

function gradeSaidWord(transcript: string, word: Word): Grade {
  const heard = ` ${spokenWords(transcript).join(' ')} `;
  const target = normalize(word.en, 'en');
  const close = target.length >= 4 && heard.split(' ').some((w) => w && levenshtein(w, target) <= 1);
  return {
    correct: heard.includes(` ${target} `) || close,
    solution: word.en,
    note: transcript ? `Duyduğum: “${transcript}”` : undefined,
  };
}

/** Index of the right option for the multiple choice exercises */
export function answerIndex(exercise: Exercise) {
  switch (exercise.kind) {
    case 'picture':
    case 'hear':
      return exercise.options.indexOf(exercise.word);
    case 'select':
      return exercise.options.indexOf(exercise.word.tr);
    case 'blank':
      return exercise.options.indexOf(exercise.blank.answer);
    case 'pair':
      return exercise.said;
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
    case 'say':
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
    case 'hear':
      return { correct: correctChoice, solution: exercise.word.en, meaning: exercise.word.tr };
    case 'select':
      return { correct: correctChoice, solution: exercise.word.tr };
    case 'pair':
      return {
        correct: correctChoice,
        solution: exercise.pair.words[exercise.said].en,
        why: correctChoice ? undefined : exercise.pair.why,
      };
    case 'blank':
      return {
        correct: correctChoice,
        solution: exercise.blank.en.replace('___', exercise.blank.answer),
        why: correctChoice ? undefined : explainBlank(exercise.blank),
      };
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
    case 'say':
      return gradeSaidWord(draft.text, exercise.word);
    case 'match':
      return { correct: true, solution: '' };
  }
}

/** The English and Turkish of a saved item, for the parents' summary and the word book */
export function itemText(key: string): { en: string; tr: string } | null {
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

/** Identifies the word, sentence or blank an exercise practises, for spaced repetition and mistakes */
export function itemKey(exercise: Exercise) {
  if (exercise.generated) return null;
  switch (exercise.kind) {
    case 'picture':
    case 'hear':
    case 'select':
    case 'say':
      return `w:${exercise.word.en}`;
    case 'blank':
      return `b:${exercise.blank.en}`;
    case 'match':
    case 'pair':
      return null;
    default:
      return `s:${exercise.sentence.en}`;
  }
}

let nextId = 0;

function make(body: ExerciseBody, generated = false): Exercise {
  return { ...body, id: nextId++, attempt: 0, ...(generated ? { generated } : {}) };
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

function pictureOptions(word: Word, lessonWords: Word[], unitWords: Word[]) {
  const withPicture = (words: Word[]) => words.filter((w) => w.emoji);
  if (!word.emoji) return null;
  const others = pickDistinct(withPicture(lessonWords), withPicture(unitWords), 2, (w) => w.en, word.en);
  return others.length === 2 ? shuffle([word, ...others]) : null;
}

function wordExercise(word: Word, lessonWords: Word[], unitWords: Word[]): Exercise {
  const options = pictureOptions(word, lessonWords, unitWords);
  if (options) return make({ kind: 'picture', word, options });
  const others = pickDistinct(lessonWords, unitWords, 3, (w) => w.tr, word.tr);
  return make({ kind: 'select', word, options: shuffle([word.tr, ...others.map((w) => w.tr)]) });
}

function hearExercise(word: Word, lessonWords: Word[], unitWords: Word[]): Exercise {
  const options = pictureOptions(word, lessonWords, unitWords);
  return options ? make({ kind: 'hear', word, options }) : wordExercise(word, lessonWords, unitWords);
}

/** One word exercise, varied by what the browser can do: hear it, see it, or say it */
function anyWordExercise(word: Word, lessonWords: Word[], unitWords: Word[], modes: Modes): Exercise {
  const kinds = ['see', ...(modes.listening ? ['hear'] : []), ...(modes.speaking ? ['say'] : [])];
  const kind = pickOne(kinds);
  if (kind === 'hear') return hearExercise(word, lessonWords, unitWords);
  if (kind === 'say') return make({ kind: 'say', word });
  return wordExercise(word, lessonWords, unitWords);
}

function matchExercise(words: Word[]): Exercise {
  const pairs = sample(words, 5);
  return make({ kind: 'match', pairs, rightOrder: shuffle(pairs.map((_, i) => i)) });
}

function pairExercise(): Exercise {
  return make({ kind: 'pair', pair: pickOne(SOUND_PAIRS), said: Math.floor(Math.random() * 2) });
}

type SentenceKind = 'build-en' | 'build-tr' | 'listen' | 'type' | 'speak';
const ROTATION: SentenceKind[] = ['build-en', 'listen', 'build-tr', 'type', 'speak'];
const MAX_TYPED_WORDS = 4;

// Five sentences get one of each kind; a shorter list starts the rotation at a random kind
function sentenceExercises(sentences: Sentence[], unitIndex: number, modes: Modes, generated = false) {
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
        return make({ kind: 'build', from: 'tr', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) }, generated);
      case 'build-tr':
        return make({ kind: 'build', from: 'en', sentence, tiles: wordTiles(sentence.tr, 'tr', unitIndex) }, generated);
      case 'listen':
        return make({ kind: 'listen', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) }, generated);
      case 'speak':
        return make({ kind: 'speak', sentence, tiles: wordTiles(sentence.en, 'en', unitIndex) }, generated);
      case 'type':
        return make({ kind: 'type', sentence }, generated);
    }
  });
}

/** A sentence built from a pattern with known words, as tiles in either direction */
function patternExercise(unitIndex: number): Exercise | null {
  const sentence = patternSentence(unitIndex);
  if (!sentence) return null;
  const from: Lang = Math.random() < 0.5 ? 'tr' : 'en';
  const lang: Lang = from === 'tr' ? 'en' : 'tr';
  return make({ kind: 'build', from, sentence, tiles: wordTiles(sentence[lang], lang, unitIndex) }, true);
}

function blankExercise(blank: Blank): Exercise {
  return make({ kind: 'blank', blank, options: shuffle(blank.options) });
}

// A lesson asks about its first words (just shown on the teaching cards), matches them, then mixes
// sentences, two blanks and one extra: a pattern sentence or a sound pair
function lessonExercises(lesson: Lesson, unitIndex: number, modes: Modes) {
  const unitWords = units[unitIndex].lessons.flatMap((l) => l.words);
  const [first, second, third] = lesson.words;
  const pattern = patternExercise(unitIndex);
  const extras = [...(pattern ? [pattern] : []), ...(modes.listening ? [pairExercise()] : [])];
  return [
    modes.listening ? hearExercise(first, lesson.words, unitWords) : wordExercise(first, lesson.words, unitWords),
    wordExercise(second, lesson.words, unitWords),
    modes.speaking ? make({ kind: 'say', word: third }) : wordExercise(third, lesson.words, unitWords),
    matchExercise(lesson.words),
    ...shuffle([
      ...sentenceExercises(lesson.sentences, unitIndex, modes),
      ...sample(lesson.blanks, 2).map(blankExercise),
      ...sample(extras, 1),
    ]),
  ];
}

/** A review over several lessons: unit chests, practice and jump tests */
export function mixedExercises(lessons: Lesson[], unitIndex: number, modes: Modes) {
  const words = lessons.flatMap((lesson) => lesson.words);
  const pattern = patternExercise(unitIndex);
  return [
    ...sample(words, 2).map((word) => anyWordExercise(word, words, words, modes)),
    matchExercise(words),
    ...shuffle([
      ...sentenceExercises(sample(lessons.flatMap((lesson) => lesson.sentences), 5), unitIndex, modes),
      ...sample(lessons.flatMap((lesson) => lesson.blanks), 3).map(blankExercise),
      ...(pattern ? [pattern] : []),
      ...(modes.listening ? [pairExercise()] : []),
    ]),
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

/** Fresh exercises for the given items (spaced review, mistakes); unknown keys are skipped */
export function itemExercises(keys: string[], modes: Modes) {
  const wanted = new Set(keys);
  return shuffle(
    units.flatMap((unit, unitIndex) => {
      const unitWords = unit.lessons.flatMap((lesson) => lesson.words);
      return unit.lessons.flatMap((lesson) => [
        ...lesson.words
          .filter((w) => wanted.has(`w:${w.en}`))
          .map((w) => anyWordExercise(w, lesson.words, unitWords, modes)),
        ...sentenceExercises(
          lesson.sentences.filter((s) => wanted.has(`s:${s.en}`)),
          unitIndex,
          modes,
        ),
        ...lesson.blanks.filter((b) => wanted.has(`b:${b.en}`)).map(blankExercise),
      ]);
    }),
  );
}

/** The test for skipping ahead to a unit: a mixed review of everything before it, without speaking */
export function jumpTestExercises(unitIndex: number, modes: Modes) {
  const lessons = units.slice(0, unitIndex).flatMap((unit) => unit.lessons);
  return mixedExercises(lessons, unitIndex - 1, { ...modes, speaking: false });
}

/**
 * Listening or speaking turned off mid-lesson: sentence exercises become English word-tile builds and
 * a heard word becomes a labelled picture choice; sound pairs and spoken words are dropped.
 */
export function withoutSpeech(queue: Exercise[], feature: 'listening' | 'speaking'): Exercise[] {
  return queue.flatMap((exercise): Exercise[] => {
    const next = { id: exercise.id, attempt: exercise.attempt + 1, generated: exercise.generated };
    if (feature === 'listening') {
      if (exercise.kind === 'listen') return [{ ...next, kind: 'build', from: 'tr', sentence: exercise.sentence, tiles: exercise.tiles }];
      if (exercise.kind === 'hear') return [{ ...next, kind: 'picture', word: exercise.word, options: exercise.options }];
      if (exercise.kind === 'pair') return [];
    } else {
      if (exercise.kind === 'speak') return [{ ...next, kind: 'build', from: 'tr', sentence: exercise.sentence, tiles: exercise.tiles }];
      if (exercise.kind === 'say') return [];
    }
    return [exercise];
  });
}
