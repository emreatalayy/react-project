'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { EarOff, Flame, Lightbulb, MicOff, X } from 'lucide-react';
import { playSound, speakAuto, stopSpeaking } from './audio';
import type { Tip, Word } from './course';
import { ExerciseView } from './ExerciseViews';
import { canCheck, grade, itemKey, withoutSpeech, type Draft, type Exercise, type Grade } from './exercises';
import styles from './ingilizce.module.css';
import { Mascot, type Mood } from './Mascot';
import { recordAnswer, type SessionReward } from './progress';
import { makeConfetti, SessionEnd, type SessionOutcome } from './SessionEnd';
import type { SessionFacts } from './stickers';
import { TeachScreen } from './TeachScreen';
import { AMBER, GREEN, MUTED, PressButton, RED } from './ui';

/** Right answers in a row before the combo counter shows */
const COMBO_FROM = 3;
/** Mistakes a jump test allows */
const TEST_MISTAKES = 2;
const PRAISE = ['Harika', 'Süper', 'Mükemmel', 'Aferin', 'Çok iyi', 'Bravo'];
const CHEERS = ['Az kaldı!', 'Sorun değil!', 'Neredeyse!'];
const EMPTY_DRAFT: Draft = { choice: null, picked: [], text: '' };

export type LessonSession = {
  key: number;
  kind: SessionFacts['kind'];
  nodeId: string | null;
  title: string;
  exercises: Exercise[];
  startedAt: number;
  /** New words (and the unit's rule) shown on cards before the first question */
  teach?: { words: Word[]; tip?: Tip };
  /** For a jump test: the unit it opens */
  test?: { unitTitle: string };
};

export type SessionResult = { stars: number; spoke: boolean; passed: boolean };

/** `advance` is false for a mistake, which sends the exercise to the back of the queue */
type Feedback = Grade & { title: string; advance: boolean };

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

// Mistakes never end a lesson; they only cost stars
function starsFor(mistakes: number) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}

// After a right answer the English sentence is read out, as a model to repeat
function englishAnswer(exercise: Exercise) {
  switch (exercise.kind) {
    case 'type':
      return exercise.sentence.en;
    case 'build':
      return exercise.from === 'tr' ? exercise.sentence.en : null;
    case 'blank':
      return exercise.blank.en.replace('___', exercise.blank.answer);
    default:
      return null;
  }
}

// What the page reads out when an exercise appears
function promptAudio(exercise: Exercise | undefined) {
  switch (exercise?.kind) {
    case 'listen':
    case 'speak':
      return exercise.sentence.en;
    case 'select':
    case 'hear':
      return exercise.word.en;
    case 'pair':
      return exercise.pair.words[exercise.said].en;
    case 'build':
      return exercise.from === 'en' ? exercise.sentence.en : null;
    default:
      return null;
  }
}

export function LessonPlayer({
  session,
  learnerName,
  onFinish,
  onClose,
}: {
  session: LessonSession;
  learnerName: string;
  onFinish: (result: SessionResult) => SessionReward;
  onClose: () => void;
}) {
  const [teaching, setTeaching] = useState(Boolean(session.teach));
  const [queue, setQueue] = useState(session.exercises);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [spoke, setSpoke] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const [confirmingExit, setConfirmingExit] = useState(false);
  // The model answer is read out a moment after a right answer; moving on cancels it so it never
  // talks over the next exercise's own audio
  const modelTimer = useRef<number | undefined>(undefined);

  const total = session.exercises.length;
  const current = queue[0];
  const ready = current !== undefined && !feedback && canCheck(current, draft);

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      window.clearTimeout(modelTimer.current);
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    const audio = teaching ? null : promptAudio(current);
    if (audio) speakAuto(audio);
  }, [current, teaching]);

  function praise() {
    return learnerName ? `${pick(PRAISE)}, ${learnerName}!` : `${pick(PRAISE)}!`;
  }

  function choose(index: number) {
    if (!current || feedback) return;
    setDraft((previous) => ({ ...previous, choice: index }));
    if (current.kind === 'picture' || current.kind === 'pair') {
      speakAuto(current.kind === 'picture' ? current.options[index].en : current.pair.words[index].en);
    }
  }

  function check(answer: Draft = draft) {
    if (!current || feedback || !canCheck(current, answer)) return;
    const graded = grade(current, answer);
    const key = itemKey(current);
    // Recognition errors are not the learner's: a missed speaking exercise costs nothing
    const spoken = current.kind === 'speak' || current.kind === 'say';
    const forgiven = !graded.correct && spoken;
    // Only the first try counts for memory; a retried item stays where the mistake put it
    if (key && current.attempt === 0 && !forgiven) recordAnswer(key, graded.correct);
    if (graded.correct) {
      setSolved(solved + 1);
      setCombo(combo + 1);
      playSound('correct');
      if (spoken) setSpoke(true);
      const model = englishAnswer(current);
      if (model) modelTimer.current = window.setTimeout(() => speakAuto(model), 350);
    } else {
      if (forgiven || session.test) setSolved(solved + 1);
      if (!forgiven) setMistakes(mistakes + 1);
      setCombo(0);
      playSound('wrong');
    }
    setFeedback({
      ...graded,
      // A jump test moves on after a mistake; it measures, it does not drill
      advance: graded.correct || forgiven || Boolean(session.test),
      title: graded.correct ? praise() : forgiven ? 'Tam anlayamadım' : `${pick(CHEERS)} Doğrusu:`,
    });
  }

  function spokeAloud(transcript: string) {
    const answer = { ...EMPTY_DRAFT, text: transcript };
    setDraft(answer);
    check(answer);
  }

  function matched() {
    setSolved(solved + 1);
    setCombo(combo + 1);
    playSound('correct');
    setFeedback({ correct: true, advance: true, solution: '', title: praise() });
  }

  function finish() {
    const stars = starsFor(mistakes);
    const passed = mistakes <= TEST_MISTAKES;
    const reward = onFinish({ stars, spoke, passed });
    playSound(session.test && !passed ? 'wrong' : 'complete');
    setOutcome({
      stars,
      reward,
      confetti: makeConfetti(),
      // In a test every question is asked once; in a lesson missed ones come again
      accuracy: session.test ? (total - mistakes) / total : total / (total + mistakes),
      seconds: Math.round((Date.now() - session.startedAt) / 1000),
      test: session.test ? { passed, unitTitle: session.test.unitTitle } : undefined,
    });
  }

  // A missed exercise goes to the back of the queue and comes again until it is answered right
  function next() {
    if (!current || !feedback) return;
    window.clearTimeout(modelTimer.current);
    const rest = queue.slice(1);
    setFeedback(null);
    setDraft(EMPTY_DRAFT);
    if (!feedback.advance) {
      setQueue([...rest, { ...current, attempt: current.attempt + 1 }]);
      return;
    }
    setQueue(rest);
    if (rest.length === 0) finish();
  }

  // Dropped exercises (sound pairs, spoken words) count as done so the bar still fills up
  function skip(feature: 'listening' | 'speaking') {
    const remaining = withoutSpeech(queue, feature);
    setDraft(EMPTY_DRAFT);
    setSolved(solved + queue.length - remaining.length);
    setQueue(remaining);
    if (remaining.length === 0) finish();
  }

  function requestClose() {
    if (outcome || teaching || (solved === 0 && mistakes === 0)) onClose();
    else setConfirmingExit(true);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (confirmingExit) setConfirmingExit(false);
        else requestClose();
        return;
      }
      // The teaching cards and the end screens handle their own keys
      if (confirmingExit || teaching || outcome) return;
      if (event.key === 'Enter') {
        // Also stops a focused tile or option from being pressed by the same key
        event.preventDefault();
        if (feedback) next();
        else check();
        return;
      }
      const typing = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;
      if (typing || feedback || !current) return;
      if (['picture', 'hear', 'select', 'blank', 'pair'].includes(current.kind)) {
        const index = Number(event.key) - 1;
        const count = current.kind === 'pair' ? 2 : 'options' in current ? current.options.length : 0;
        if (Number.isInteger(index) && index >= 0 && index < count) choose(index);
      } else if ((current.kind === 'build' || current.kind === 'listen') && event.key === 'Backspace') {
        setDraft((previous) => ({ ...previous, picked: previous.picked.slice(0, -1) }));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const feedbackTone = !feedback
    ? 'border-slate-200 bg-white'
    : feedback.correct
      ? 'border-green-300 bg-green-100'
      : feedback.advance && !session.test
        ? 'border-amber-300 bg-amber-100'
        : 'border-rose-300 bg-rose-100';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={session.title}
      className="fixed inset-0 z-[70] isolate flex flex-col overflow-hidden bg-[#f4faff] text-slate-800"
    >
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={requestClose}
          aria-label="Dersi kapat"
          className="grid size-11 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600"
        >
          <X aria-hidden="true" className="size-7" strokeWidth={2.5} />
        </button>
        <div
          role="progressbar"
          aria-label="Ders ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={solved}
          className="h-5 flex-1 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`relative h-full rounded-full bg-linear-to-r transition-[width] duration-500 ease-out ${
              combo >= COMBO_FROM ? 'from-orange-500 to-amber-400' : 'from-green-500 to-lime-400'
            }`}
            style={{ width: `${(solved / total) * 100}%` }}
          >
            <span className="absolute inset-x-2 top-1 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>
        <span
          aria-live="polite"
          className={`flex w-14 items-center justify-end gap-1 text-lg font-extrabold tabular-nums text-orange-500 ${
            combo >= COMBO_FROM ? '' : 'invisible'
          }`}
        >
          <Flame aria-hidden="true" className="size-6 fill-orange-400" />
          {combo}
          <span className="sr-only">üst üste doğru</span>
        </span>
      </header>

      {outcome ? (
        <SessionEnd outcome={outcome} learnerName={learnerName} onClose={onClose} />
      ) : teaching && session.teach ? (
        <TeachScreen words={session.teach.words} tip={session.teach.tip} onDone={() => setTeaching(false)} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
              {current && (
                <ExerciseView
                  key={`${current.id}-${current.attempt}`}
                  exercise={current}
                  draft={draft}
                  graded={feedback}
                  onChoose={choose}
                  onPick={(tile) => setDraft((previous) => ({ ...previous, picked: [...previous.picked, tile] }))}
                  onUnpick={(position) =>
                    setDraft((previous) => ({ ...previous, picked: previous.picked.filter((_, i) => i !== position) }))
                  }
                  onText={(text) => setDraft((previous) => ({ ...previous, text }))}
                  onMatched={matched}
                  onSpoken={spokeAloud}
                />
              )}
            </div>
          </main>

          <footer className={`border-t-2 transition-colors ${feedbackTone}`}>
            <div
              aria-live="polite"
              className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:min-h-32 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              {feedback ? (
                <FeedbackMessage feedback={feedback} />
              ) : current && ['listen', 'hear', 'pair'].includes(current.kind) ? (
                <SkipButton feature="listening" onSkip={skip} />
              ) : current && ['speak', 'say'].includes(current.kind) ? (
                <SkipButton feature="speaking" onSkip={skip} />
              ) : (
                <span className="hidden sm:block" />
              )}
              <PressButton
                face={
                  feedback
                    ? feedback.correct
                      ? GREEN
                      : feedback.advance && !session.test
                        ? AMBER
                        : RED
                    : ready
                      ? GREEN
                      : MUTED
                }
                disabled={!feedback && !ready}
                onClick={feedback ? next : () => check()}
                className="w-full sm:w-auto sm:min-w-48"
              >
                {feedback ? (feedback.advance ? 'Devam' : 'Tamam') : 'Kontrol et'}
              </PressButton>
            </div>
          </footer>
        </>
      )}

      {confirmingExit && (
        <div className="absolute inset-0 z-10 flex overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            className={`${styles.pop} m-auto w-full max-w-sm rounded-[2rem] border-2 border-b-[6px] border-slate-200 bg-white p-6 text-center shadow-2xl`}
          >
            <Mascot mood="sad" className="mx-auto h-28 w-24" />
            <h2 id="exit-title" className={`${styles.display} mt-2 text-2xl font-bold`}>
              Gidiyor musun?
            </h2>
            <p className="mt-1 text-slate-600">Şimdi çıkarsan bu dersi baştan yapman gerekir.</p>
            <div className="mt-6 flex flex-col gap-3">
              <PressButton face={GREEN} onClick={() => setConfirmingExit(false)} autoFocus>
                Derse devam et
              </PressButton>
              <button
                type="button"
                onClick={onClose}
                className={`${styles.display} h-12 rounded-2xl text-lg font-bold uppercase tracking-wide text-rose-600 transition-colors hover:bg-rose-50`}
              >
                Çık
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkipButton({
  feature,
  onSkip,
}: {
  feature: 'listening' | 'speaking';
  onSkip: (feature: 'listening' | 'speaking') => void;
}) {
  const Icon = feature === 'listening' ? EarOff : MicOff;
  return (
    <button
      type="button"
      onClick={() => onSkip(feature)}
      className={`${styles.display} inline-flex h-12 w-fit items-center gap-2 rounded-2xl px-3 text-base font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700`}
    >
      <Icon aria-hidden="true" className="size-5" />
      {feature === 'listening' ? 'Şu an dinleyemiyorum' : 'Şu an konuşamıyorum'}
    </button>
  );
}

/** The solution with the words the answer missed marked, so the child sees where it went wrong */
function Solution({ text, missed }: { text: string; missed?: boolean[] }): ReactNode {
  if (!missed?.some(Boolean)) return text;
  return text.split(/\s+/).map((word, i) => (
    <Fragment key={i}>
      {i > 0 && ' '}
      {missed[i] ? (
        <mark className="rounded-md bg-white/80 px-1 text-inherit underline decoration-wavy decoration-2 underline-offset-4">
          {word}
        </mark>
      ) : (
        word
      )}
    </Fragment>
  ));
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  const { correct, advance } = feedback;
  const mood: Mood = correct ? 'happy' : 'sad';
  const text = correct ? 'text-green-800' : advance ? 'text-amber-900' : 'text-rose-800';
  return (
    <div className={`flex items-center gap-3 ${styles.rise}`}>
      <Mascot mood={mood} className="h-20 w-[4.3rem] shrink-0 sm:h-24 sm:w-20" />
      <div className={`min-w-0 ${text}`}>
        <p className={`${styles.display} text-2xl font-bold`}>{feedback.title}</p>
        {!correct && (
          <p className="text-lg font-semibold">
            <Solution text={feedback.solution} missed={feedback.missed} />
          </p>
        )}
        {feedback.why && (
          <p className="mt-1 flex items-start gap-1.5 text-sm font-semibold">
            <Lightbulb aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {feedback.why}
          </p>
        )}
        {feedback.note && <p className="mt-0.5 text-sm font-semibold opacity-90">{feedback.note}</p>}
        {feedback.meaning && <p className="mt-0.5 text-sm font-semibold opacity-90">Anlamı: {feedback.meaning}</p>}
      </div>
    </div>
  );
}
