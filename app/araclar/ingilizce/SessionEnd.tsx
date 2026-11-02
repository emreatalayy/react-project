'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Clock, Flame, Target, type LucideIcon } from 'lucide-react';
import { percentFormat } from '../shared';
import { playSound } from './audio';
import styles from './ingilizce.module.css';
import { Mascot, type Mood } from './Mascot';
import type { SessionReward } from './progress';
import type { Sticker } from './stickers';
import { GREEN, ORANGE, PressButton, Stars, WeekRow } from './ui';

const CONFETTI_COLORS = ['#1cb0f6', '#58cc02', '#ff9600', '#ff4b4b', '#a560e8', '#ffc531', '#e85d9e'];

type ConfettiPiece = { x: number; delay: number; time: number; drift: number; turn: number; color: string };

/** How a finished lesson or story went; `test` is set for a jump test */
export type SessionOutcome = {
  stars: number;
  accuracy: number;
  seconds: number;
  reward: SessionReward;
  confetti: ConfettiPiece[];
  test?: { passed: boolean; unitTitle: string };
  /** A story asks each question once, so its result reads differently from a lesson's */
  story?: boolean;
};

/** Called when a session ends (in an event handler), as the pieces are random */
export function makeConfetti(): ConfettiPiece[] {
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

/** After the result come one screen per new sticker, then the streak on the first session of the day */
type Screen = { kind: 'result' } | { kind: 'sticker'; sticker: Sticker } | { kind: 'streak' };

export function SessionEnd({
  outcome,
  learnerName,
  onClose,
}: {
  outcome: SessionOutcome;
  learnerName: string;
  onClose: () => void;
}) {
  const [screens, setScreens] = useState<Screen[]>(() => [
    { kind: 'result' },
    ...outcome.reward.stickers.map((sticker): Screen => ({ kind: 'sticker', sticker })),
    ...(outcome.reward.streak.extended ? [{ kind: 'streak' } as const] : []),
  ]);
  const screen = screens[0];

  function next() {
    if (screens.length === 1) {
      onClose();
      return;
    }
    setScreens(screens.slice(1));
    if (screens[1].kind === 'sticker') playSound('complete');
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      next();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (screen.kind === 'sticker') {
    return (
      <EndScreen
        mascot="happy"
        title="Yeni çıkartma!"
        text={`“${screen.sticker.name}” çıkartması albümüne eklendi.`}
        action={
          <PressButton face={GREEN} onClick={next} className="w-full sm:w-auto sm:min-w-48">
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
      </EndScreen>
    );
  }

  if (screen.kind === 'streak') {
    const { streak, week } = outcome.reward.streak;
    return (
      <EndScreen
        mascot="happy"
        title={`${streak} günlük seri!`}
        text={
          streak === 1
            ? 'Serin başladı! Yarın da bir ders yapıp ateşi büyüt.'
            : 'Her gün biraz pratik, en hızlı öğrenme yolu. Yarın da gel!'
        }
        action={
          <PressButton face={ORANGE} onClick={next} className="w-full sm:w-auto sm:min-w-48">
            Devam
          </PressButton>
        }
      >
        <span className={`${styles.pop} mt-6 inline-flex items-center gap-1 text-6xl font-extrabold text-orange-500`}>
          <Flame aria-hidden="true" className="size-16 fill-orange-400" />
          {streak}
        </span>
        <WeekRow week={week} className={`${styles.rise} mt-8 w-full max-w-xs`} />
      </EndScreen>
    );
  }

  const { test } = outcome;
  const you = learnerName ? `, ${learnerName}` : '';
  const perfect = outcome.stars === 3;
  const title = test
    ? test.passed
      ? `${test.unitTitle} açıldı!`
      : 'Henüz değil'
    : outcome.story
      ? perfect
        ? 'Kusursuz hikâye!'
        : 'Hikâye bitti!'
      : perfect
        ? 'Kusursuz ders!'
        : 'Ders bitti!';
  const text = test
    ? test.passed
      ? `Testi geçtin${you}! Önceki dersleri atlayıp buradan devam edebilirsin.`
      : 'Önceki dersler biraz daha pratik istiyor. Hazır olunca tekrar dene!'
    : outcome.story
      ? perfect
        ? `Bütün soruları bildin${you}!`
        : 'Hikâyeyi bitirdin! İstersen sonra bir daha oku, soruların hepsini bil.'
      : perfect
        ? `Hiç hata yapmadın${you}! Üç yıldızın hepsi senin.`
        : 'Kaçırdıkların tekrar karşına çıktı ve hepsini doğru yaptın.';

  return (
    <EndScreen
      mascot={test && !test.passed ? 'sad' : 'cheer'}
      title={title}
      text={text}
      action={
        <PressButton face={GREEN} onClick={next} className="w-full sm:w-auto sm:min-w-48">
          Devam
        </PressButton>
      }
    >
      {(!test || test.passed) && <Confetti pieces={outcome.confetti} />}
      {!test && (
        <div className={`${styles.pop} mt-6`} style={{ animationDelay: '200ms' }}>
          <Stars count={outcome.stars} className="size-12 sm:size-14" />
        </div>
      )}
      <dl className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <ResultTile icon={Target} label="Doğruluk" tone="border-green-400 text-green-700">
          {percentFormat.format(outcome.accuracy)}
        </ResultTile>
        <ResultTile icon={Clock} label="Süre" tone="border-sky-400 text-sky-700">
          {formatDuration(outcome.seconds)}
        </ResultTile>
      </dl>
    </EndScreen>
  );
}

function EndScreen({
  mascot,
  title,
  text,
  action,
  children,
}: {
  mascot: Mood;
  title: string;
  text: string;
  action: ReactNode;
  children?: ReactNode;
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
  children: ReactNode;
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
