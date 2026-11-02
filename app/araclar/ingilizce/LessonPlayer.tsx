'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { Clock, EarOff, Flame, MicOff, Target, X, type LucideIcon } from 'lucide-react';
import { percentFormat } from '../shared';
import { playSound, speakAuto, stopSpeaking } from './audio';
import { ExerciseView } from './ExerciseViews';
import { canCheck, grade, itemKey, withoutKind, type Draft, type Exercise, type Grade } from './exercises';
import styles from './ingilizce.module.css';
import { Mascot, type Mood } from './Mascot';
import { clearMistake, noteMistake, type SessionReward } from './progress';
import type { SessionFacts, Sticker } from './stickers';
import { AMBER, GREEN, MUTED, ORANGE, PressButton, RED, Stars, WeekRow } from './ui';

/** Right answers in a row before the combo counter shows */
const COMBO_FROM = 3;
const PRAISE = ['Harika', 'Süper', 'Mükemmel', 'Aferin', 'Çok iyi', 'Bravo'];
const CHEERS = ['Az kaldı!', 'Sorun değil!', 'Neredeyse!'];
const CONFETTI_COLORS = ['#1cb0f6', '#58cc02', '#ff9600', '#ff4b4b', '#a560e8', '#ffc531', '#e85d9e'];
const EMPTY_DRAFT: Draft = { choice: null, picked: [], text: '' };

export type LessonSession = {
  key: number;
  kind: SessionFacts['kind'];
  nodeId: string | null;
  title: string;
  exercises: Exercise[];
  startedAt: number;
};

export type SessionResult = { stars: number; spoke: boolean };

/** `advance` is false for a mistake, which sends the exercise to the back of the queue */
type Feedback = Grade & { title: string; advance: boolean };

type ConfettiPiece = { x: number; delay: number; time: number; drift: number; turn: number; color: string };

type Result = { stars: number; accuracy: number; seconds: number; reward: SessionReward; confetti: ConfettiPiece[] };

/** After the result come one screen per new sticker, then the streak on the first session of the day */
type Screen = { kind: 'result' } | { kind: 'sticker'; sticker: Sticker } | { kind: 'streak' };

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

// Mistakes never end a lesson; they only cost stars
function starsFor(mistakes: number) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}

function makeConfetti(): ConfettiPiece[] {
  return Array.from({ length: 70 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    time: 2.2 + Math.random() * 1.6,
    drift: (Math.random() - 0.5) * 160,
    turn: 360 + Math.random() * 720,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
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
  const [queue, setQueue] = useState(session.exercises);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [spoke, setSpoke] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [confirmingExit, setConfirmingExit] = useState(false);

  const total = session.exercises.length;
  const current = queue[0];
  const ready = current !== undefined && !feedback && canCheck(current, draft);
  const screen = screens[0];

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (current?.kind === 'listen' || current?.kind === 'speak') speakAuto(current.sentence.en);
    else if (current?.kind === 'select') speakAuto(current.word.en);
    else if (current?.kind === 'build' && current.from === 'en') speakAuto(current.sentence.en);
  }, [current]);

  function praise() {
    return learnerName ? `${pick(PRAISE)}, ${learnerName}!` : `${pick(PRAISE)}!`;
  }

  function choose(index: number) {
    if (!current || feedback) return;
    setDraft((previous) => ({ ...previous, choice: index }));
    if (current.kind === 'picture') speakAuto(current.options[index].en);
  }

  function check(answer: Draft = draft) {
    if (!current || feedback || !canCheck(current, answer)) return;
    const graded = grade(current, answer);
    const key = itemKey(current);
    // Speech recognition errors are not the learner's: a missed speaking exercise costs nothing
    const forgiven = !graded.correct && current.kind === 'speak';
    if (graded.correct) {
      setSolved(solved + 1);
      setCombo(combo + 1);
      playSound('correct');
      if (current.kind === 'speak') setSpoke(true);
      if (key && current.attempt === 0) clearMistake(key);
      const spoken = englishAnswer(current);
      if (spoken) window.setTimeout(() => speakAuto(spoken), 350);
    } else if (forgiven) {
      setSolved(solved + 1);
      setCombo(0);
      playSound('wrong');
    } else {
      setMistakes(mistakes + 1);
      setCombo(0);
      playSound('wrong');
      if (key) noteMistake(key);
    }
    setFeedback({
      ...graded,
      advance: graded.correct || forgiven,
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
    const reward = onFinish({ stars, spoke });
    playSound('complete');
    setResult({
      stars,
      reward,
      confetti: makeConfetti(),
      accuracy: total / (total + mistakes),
      seconds: Math.round((Date.now() - session.startedAt) / 1000),
    });
    setScreens([
      { kind: 'result' },
      ...reward.stickers.map((sticker): Screen => ({ kind: 'sticker', sticker })),
      ...(reward.streak.extended ? [{ kind: 'streak' } as const] : []),
    ]);
  }

  // A missed exercise goes to the back of the queue and comes again until it is answered right
  function next() {
    if (!current || !feedback) return;
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

  function nextScreen() {
    if (screens.length > 1) {
      setScreens(screens.slice(1));
      if (screens[1].kind === 'sticker') playSound('complete');
    } else {
      onClose();
    }
  }

  function skip(kind: 'listen' | 'speak') {
    setDraft(EMPTY_DRAFT);
    setQueue(withoutKind(queue, kind));
  }

  function requestClose() {
    if (result || (solved === 0 && mistakes === 0)) onClose();
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
      if (confirmingExit) return;
      if (result) {
        if (event.key === 'Enter') {
          event.preventDefault();
          nextScreen();
        }
        return;
      }
      if (event.key === 'Enter') {
        // Also stops a focused tile or option from being pressed by the same key
        event.preventDefault();
        if (feedback) next();
        else check();
        return;
      }
      const typing = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;
      if (typing || feedback || !current) return;
      if (current.kind === 'picture' || current.kind === 'select' || current.kind === 'blank') {
        const index = Number(event.key) - 1;
        if (Number.isInteger(index) && index >= 0 && index < current.options.length) choose(index);
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
      : feedback.advance
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

      {result && screen?.kind === 'result' ? (
        <OutcomeScreen
          mascot="cheer"
          title={result.stars === 3 ? 'Kusursuz ders!' : 'Ders bitti!'}
          text={
            result.stars === 3
              ? `Hiç hata yapmadın${learnerName ? `, ${learnerName}` : ''}! Üç yıldızın hepsi senin.`
              : 'Kaçırdıkların tekrar karşına çıktı ve hepsini doğru yaptın.'
          }
          action={
            <PressButton face={GREEN} onClick={nextScreen} className="w-full sm:w-auto sm:min-w-48">
              Devam
            </PressButton>
          }
        >
          <Confetti pieces={result.confetti} />
          <div className={`${styles.pop} mt-6`} style={{ animationDelay: '200ms' }}>
            <Stars count={result.stars} className="size-12 sm:size-14" />
          </div>
          <dl className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
            <ResultTile icon={Target} label="Doğruluk" tone="border-green-400 text-green-700">
              {percentFormat.format(result.accuracy)}
            </ResultTile>
            <ResultTile icon={Clock} label="Süre" tone="border-sky-400 text-sky-700">
              {formatDuration(result.seconds)}
            </ResultTile>
          </dl>
        </OutcomeScreen>
      ) : result && screen?.kind === 'sticker' ? (
        <OutcomeScreen
          mascot="happy"
          title="Yeni çıkartma!"
          text={`“${screen.sticker.name}” çıkartması albümüne eklendi.`}
          action={
            <PressButton face={GREEN} onClick={nextScreen} className="w-full sm:w-auto sm:min-w-48">
              Harika!
            </PressButton>
          }
        >
          <span
            key={screen.sticker.id}
            aria-hidden="true"
            className={`${styles.pop} mt-6 grid size-36 place-items-center rounded-full border-4 border-dashed border-amber-300 bg-amber-50 text-7xl`}
          >
            {screen.sticker.emoji}
          </span>
        </OutcomeScreen>
      ) : result && screen?.kind === 'streak' ? (
        <OutcomeScreen
          mascot="happy"
          title={`${result.reward.streak.streak} günlük seri!`}
          text={
            result.reward.streak.streak === 1
              ? 'Serin başladı! Yarın da bir ders yapıp ateşi büyüt.'
              : 'Her gün biraz pratik, en hızlı öğrenme yolu. Yarın da gel!'
          }
          action={
            <PressButton face={ORANGE} onClick={nextScreen} className="w-full sm:w-auto sm:min-w-48">
              Devam
            </PressButton>
          }
        >
          <span className={`${styles.pop} mt-6 inline-flex items-center gap-1 text-6xl font-extrabold text-orange-500`}>
            <Flame aria-hidden="true" className="size-16 fill-orange-400" />
            {result.reward.streak.streak}
          </span>
          <WeekRow week={result.reward.streak.week} className={`${styles.rise} mt-8 w-full max-w-xs`} />
        </OutcomeScreen>
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
              ) : current?.kind === 'listen' || current?.kind === 'speak' ? (
                <SkipButton kind={current.kind} onSkip={skip} />
              ) : (
                <span className="hidden sm:block" />
              )}
              <PressButton
                face={feedback ? (feedback.correct ? GREEN : feedback.advance ? AMBER : RED) : ready ? GREEN : MUTED}
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

function SkipButton({ kind, onSkip }: { kind: 'listen' | 'speak'; onSkip: (kind: 'listen' | 'speak') => void }) {
  const Icon = kind === 'listen' ? EarOff : MicOff;
  return (
    <button
      type="button"
      onClick={() => onSkip(kind)}
      className={`${styles.display} inline-flex h-12 w-fit items-center gap-2 rounded-2xl px-3 text-base font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700`}
    >
      <Icon aria-hidden="true" className="size-5" />
      {kind === 'listen' ? 'Şu an dinleyemiyorum' : 'Şu an konuşamıyorum'}
    </button>
  );
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
        {!correct && <p className="text-lg font-semibold">{feedback.solution}</p>}
        {feedback.note && <p className="mt-0.5 text-sm font-semibold opacity-90">{feedback.note}</p>}
        {feedback.meaning && <p className="mt-0.5 text-sm font-semibold opacity-90">Anlamı: {feedback.meaning}</p>}
      </div>
    </div>
  );
}

function OutcomeScreen({
  mascot,
  title,
  text,
  action,
  children,
}: {
  mascot: Mood;
  title: string;
  text: string;
  action: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      {/* m-auto rather than justify-center, so a tall screen on a short window still scrolls to its top */}
      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
        <div className={`${styles.rise} m-auto flex w-full flex-col items-center text-center`}>
          <Mascot mood={mascot} className="h-36 w-32 sm:h-44 sm:w-40" />
          <h2 className={`${styles.display} mt-4 text-4xl font-bold text-slate-800`}>{title}</h2>
          <p className="mt-2 max-w-sm text-lg leading-relaxed text-slate-600">{text}</p>
          {children}
        </div>
      </main>
      <footer className="border-t-2 border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl px-4 py-4 sm:min-h-32 sm:items-center sm:justify-end sm:px-6">
          {action}
        </div>
      </footer>
    </>
  );
}

function Confetti({ pieces }: { pieces: ConfettiPiece[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className={styles.confetti}
          style={
            {
              '--x': `${piece.x}%`,
              '--delay': `${piece.delay}s`,
              '--time': `${piece.time}s`,
              '--drift': `${piece.drift}px`,
              '--turn': `${piece.turn}deg`,
              '--color': piece.color,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ResultTile({
  icon: Icon,
  label,
  tone,
  children,
}: {
  icon: LucideIcon;
  label: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.rise} overflow-hidden rounded-2xl border-2 border-b-4 bg-white ${tone}`}>
      <dt className="flex items-center justify-center gap-1.5 bg-current/10 py-1.5 text-sm font-extrabold uppercase tracking-wide">
        <Icon aria-hidden="true" className="size-4" />
        {label}
      </dt>
      <dd className={`${styles.display} py-3 text-3xl font-bold tabular-nums text-slate-800`}>{children}</dd>
    </div>
  );
}
