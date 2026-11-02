'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { BookOpen, Check, Flame, Gift, Lock, Play, Settings, Star, Sticker, Volume2, VolumeX } from 'lucide-react';
import { canRecognize, canSpeak } from './audio';
import { pathNodes, units, type PathNode, type Unit } from './course';
import { buildExercises, mistakeExercises, practiceExercises, type Exercise, type Modes } from './exercises';
import styles from './ingilizce.module.css';
import { LessonPlayer, type LessonSession } from './LessonPlayer';
import { Mascot } from './Mascot';
import { AlbumModal, GuideModal, ParentModal, WelcomeModal } from './Panels';
import {
  DAILY_GOAL,
  getProgress,
  getServerProgress,
  recordSession,
  setMuted,
  subscribeProgress,
  type ProgressView,
} from './progress';
import { GREEN, MUTED, PressButton, Stars } from './ui';

// Horizontal offsets that make the path wind; scaled down on phones by --snake
const SNAKE = [0, 60, 88, 60, 0, -60, -88, -60];

const card = 'rounded-[2rem] border-2 border-b-[6px] border-slate-200 bg-white';

type StopState = 'done' | 'current' | 'locked';

let sessionCount = 0;

// Only called from click handlers; a fresh key mounts a fresh player
function createSession(kind: LessonSession['kind'], nodeId: string | null, title: string, exercises: Exercise[]) {
  return { key: sessionCount++, kind, nodeId, title, exercises, startedAt: Date.now() };
}

// Unit colours are bright; text and button faces use a darker mix of them
function shade(color: string, amount: number) {
  return `color-mix(in srgb, ${color} ${100 - amount}%, #000)`;
}

function tint(color: string, amount: number) {
  return `color-mix(in srgb, ${color} ${amount}%, #fff)`;
}

const subscribeNothing = () => () => {};

export function EnglishCourse() {
  const progress = useSyncExternalStore(subscribeProgress, getProgress, getServerProgress);
  // Known only in the browser; false while server rendering
  const recognizes = useSyncExternalStore(subscribeNothing, canRecognize, () => false);
  const [active, setActive] = useState<LessonSession | null>(null);
  const [openStop, setOpenStop] = useState<string | null>(null);
  const [guide, setGuide] = useState<Unit | null>(null);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [parentGate, setParentGate] = useState<[number, number] | null>(null);
  const scrolledToCurrent = useRef(false);

  // The first unfinished stop is the one to do next; everything after it is locked
  const currentIndex = pathNodes.findIndex((node) => !progress.completed[node.id]);
  const currentNode = currentIndex >= 0 ? pathNodes[currentIndex] : null;
  const finishedLessons = pathNodes.filter((node) => node.kind === 'lesson' && progress.completed[node.id]);

  // A returning learner lands on the stop they are at, as the path is long
  useEffect(() => {
    if (scrolledToCurrent.current || currentIndex <= 0) return;
    scrolledToCurrent.current = true;
    document.querySelector('[data-current-stop]')?.scrollIntoView({ block: 'center' });
  }, [currentIndex]);

  useEffect(() => {
    if (!openStop) return;
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element) || !event.target.closest('[data-path-stop]')) setOpenStop(null);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openStop]);

  function modes(): Modes {
    return { listening: canSpeak(), speaking: progress.speaking && recognizes };
  }

  function start(kind: LessonSession['kind'], nodeId: string | null, title: string, exercises: Exercise[]) {
    setOpenStop(null);
    // Saved mistakes from older course content may no longer match any exercise
    if (exercises.length > 0) setActive(createSession(kind, nodeId, title, exercises));
  }

  function startNode(node: PathNode) {
    start(node.kind, node.id, node.title, buildExercises(node, modes()));
  }

  function openParentCorner() {
    setParentGate([3 + Math.floor(Math.random() * 7), 3 + Math.floor(Math.random() * 7)]);
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-10">
      <Hud
        progress={progress}
        onAlbum={() => setAlbumOpen(true)}
        onParent={openParentCorner}
      />

      <Greeting progress={progress} next={currentNode} onStart={() => currentNode && startNode(currentNode)} />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <ActionCard
          emoji="🏋️"
          title="Tekrar oyunu"
          text={finishedLessons.length > 0 ? 'Bitirdiğin derslerden karışık' : 'İlk dersten sonra açılır'}
          disabled={finishedLessons.length === 0}
          onClick={() => start('practice', null, 'Tekrar oyunu', practiceExercises(finishedLessons, modes()))}
        />
        <ActionCard
          emoji="🧹"
          title="Hatalarım"
          text={progress.mistakes.length > 0 ? `${progress.mistakes.length} hata seni bekliyor` : 'Bekleyen hata yok'}
          disabled={progress.mistakes.length === 0}
          onClick={() => start('mistakes', null, 'Hatalarım', mistakeExercises(progress.mistakes, modes()))}
        />
      </div>

      {units.map((unit, unitIndex) => {
        const stops = pathNodes.filter((node) => node.unitIndex === unitIndex);
        return (
          <section key={unit.id} aria-labelledby={`unite-${unit.id}`} className="mt-10">
            <UnitBanner
              unit={unit}
              index={unitIndex}
              stars={stops.reduce((sum, node) => sum + (progress.completed[node.id] ? (progress.stars[node.id] ?? 1) : 0), 0)}
              maxStars={stops.length * 3}
              onGuide={() => setGuide(unit)}
            />
            <ol className="flex flex-col items-center gap-9 pb-4 pt-14 [--snake:0.7px] sm:[--snake:1px]">
              {stops.map((node) => {
                const index = pathNodes.indexOf(node);
                const state: StopState =
                  index === currentIndex ? 'current' : progress.completed[node.id] ? 'done' : 'locked';
                const offset = SNAKE[index % SNAKE.length];
                return (
                  <li
                    key={node.id}
                    data-current-stop={state === 'current' || undefined}
                    // The transform makes each stop its own stacking context; the open one goes on top
                    className={openStop === node.id ? 'relative z-10' : undefined}
                    style={{ transform: `translateX(calc(${offset} * var(--snake)))` }}
                  >
                    <PathStop
                      node={node}
                      state={state}
                      stars={progress.stars[node.id] ?? 1}
                      mascotSide={offset > 0 ? 'left' : 'right'}
                      open={openStop === node.id}
                      onToggle={() => setOpenStop(openStop === node.id ? null : node.id)}
                      onStart={() => startNode(node)}
                    />
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {currentIndex === -1 && (
        <div className={`${card} mt-10 flex flex-col items-center p-6 text-center`}>
          <Mascot mood="cheer" className="h-32 w-28" />
          <p className={`${styles.display} mt-2 text-2xl font-bold`}>Bütün yolu bitirdin!</p>
          <p className="mt-1 text-slate-600">Tekrar oyunuyla öğrendiklerini taze tutabilirsin.</p>
        </div>
      )}

      {active && (
        <LessonPlayer
          key={active.key}
          session={active}
          learnerName={progress.name}
          onFinish={(result) => recordSession({ kind: active.kind, nodeId: active.nodeId, ...result })}
          onClose={() => setActive(null)}
        />
      )}
      {progress.loaded && !progress.welcomed && <WelcomeModal progress={progress} />}
      {albumOpen && <AlbumModal owned={progress.stickers} onClose={() => setAlbumOpen(false)} />}
      {guide && <GuideModal unit={guide} onClose={() => setGuide(null)} />}
      {parentGate && (
        <ParentModal
          progress={progress}
          recognizes={recognizes}
          gate={parentGate}
          onClose={() => setParentGate(null)}
        />
      )}
    </div>
  );
}

const hudButton =
  'grid size-11 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700';

function Hud({ progress, onAlbum, onParent }: { progress: ProgressView; onAlbum: () => void; onParent: () => void }) {
  // daySessions is zero until a session is finished today
  const practicedToday = progress.daySessions > 0;
  const SoundIcon = progress.muted ? VolumeX : Volume2;
  return (
    <div className="sticky top-[4.5rem] z-30 flex items-center gap-2 rounded-full border-2 border-b-4 border-slate-200 bg-white/95 py-1.5 pl-1.5 pr-2 shadow-sm backdrop-blur">
      <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-sky-100 text-2xl">
        {progress.avatar}
      </span>
      <span className={`${styles.display} min-w-0 flex-1 truncate text-lg font-bold`}>{progress.name || 'Merhaba!'}</span>
      <span
        title="Günlük seri"
        className={`flex items-center gap-1 text-lg font-extrabold tabular-nums ${practicedToday ? 'text-orange-500' : 'text-slate-400'}`}
      >
        <Flame aria-hidden="true" className={`size-6 ${practicedToday ? 'fill-orange-400' : ''}`} />
        {progress.streak}
        <span className="sr-only">günlük seri</span>
      </span>
      <span title="Yıldızlar" className="flex items-center gap-1 text-lg font-extrabold tabular-nums text-amber-500">
        <Star aria-hidden="true" className="size-6 fill-amber-400" />
        {progress.totalStars}
        <span className="sr-only">yıldız</span>
      </span>
      <button type="button" onClick={onAlbum} aria-label="Çıkartma albümü" title="Çıkartma albümü" className={hudButton}>
        <Sticker aria-hidden="true" className="size-6 text-violet-500" />
      </button>
      <button
        type="button"
        onClick={() => setMuted(!progress.muted)}
        aria-pressed={!progress.muted}
        aria-label="Sesler"
        title={progress.muted ? 'Sesleri aç' : 'Sesleri kapat'}
        className={`${hudButton} max-sm:hidden`}
      >
        <SoundIcon aria-hidden="true" className="size-6" />
      </button>
      <button type="button" onClick={onParent} aria-label="Ebeveyn köşesi" title="Ebeveyn köşesi" className={hudButton}>
        <Settings aria-hidden="true" className="size-6" />
      </button>
    </div>
  );
}

function greetingFor(progress: ProgressView, next: PathNode | null) {
  const you = progress.name ? `, ${progress.name}` : '';
  if (!next) return `Bütün dersleri bitirdin${you}! Sen bir yıldızsın.`;
  if (progress.daySessions >= DAILY_GOAL) return `Bugünkü hedefi tamamladın${you}! İstersen bir ders daha yapalım.`;
  if (progress.streak > 0 && progress.daySessions === 0)
    return `Serin ${progress.streak} gün${you}! Bugün de bir ders yap, ateş sönmesin.`;
  if (Object.keys(progress.completed).length === 0) return `Merhaba${you}! Hadi ilk dersimize başlayalım.`;
  return `Hadi${you}! Sıradaki ders: “${next.title}”.`;
}

function Greeting({ progress, next, onStart }: { progress: ProgressView; next: PathNode | null; onStart: () => void }) {
  const goalMet = progress.daySessions >= DAILY_GOAL;
  return (
    <div className={`${card} mt-5 flex items-center gap-3 p-4 sm:gap-5 sm:p-5`}>
      <Mascot mood={goalMet ? 'cheer' : 'idle'} className="h-32 w-28 shrink-0 sm:h-36 sm:w-32" />
      <div className="min-w-0 flex-1">
        <p className={`${styles.display} text-xl font-bold leading-snug sm:text-2xl`}>{greetingFor(progress, next)}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Bugünün hedefi</span>
          {Array.from({ length: DAILY_GOAL }, (_, i) => (
            <span
              key={i}
              className={`grid size-7 place-items-center rounded-full border-2 ${
                i < progress.daySessions ? 'border-green-600 bg-green-600 text-white' : 'border-slate-300 bg-white'
              }`}
            >
              {i < progress.daySessions && <Check aria-hidden="true" className="size-4" strokeWidth={3.5} />}
            </span>
          ))}
          <span className="sr-only">
            {Math.min(progress.daySessions, DAILY_GOAL)} / {DAILY_GOAL} ders
          </span>
        </div>
        {next && (
          <PressButton face={GREEN} onClick={onStart} className="mt-4 w-full">
            <Play aria-hidden="true" className="size-5 fill-current" />
            {Object.keys(progress.completed).length === 0 ? 'Başla' : 'Devam et'}
          </PressButton>
        )}
      </div>
    </div>
  );
}

function ActionCard({
  emoji,
  title,
  text,
  disabled,
  onClick,
}: {
  emoji: string;
  title: string;
  text: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${card} flex flex-col items-start gap-1 p-4 text-left transition-transform enabled:hover:-translate-y-0.5 enabled:active:translate-y-0.5 disabled:cursor-not-allowed`}
    >
      <span aria-hidden="true" className={`text-4xl ${disabled ? 'opacity-40 grayscale' : ''}`}>
        {emoji}
      </span>
      <span className={`${styles.display} text-xl font-bold ${disabled ? 'text-slate-400' : 'text-slate-800'}`}>
        {title}
      </span>
      <span className="text-sm font-semibold leading-snug text-slate-500">{text}</span>
    </button>
  );
}

function UnitBanner({
  unit,
  index,
  stars,
  maxStars,
  onGuide,
}: {
  unit: Unit;
  index: number;
  stars: number;
  maxStars: number;
  onGuide: () => void;
}) {
  return (
    <header
      className="flex items-center gap-3 rounded-[2rem] border-2 border-b-[6px] p-4 sm:gap-4"
      style={{ backgroundColor: tint(unit.color, 16), borderColor: tint(unit.color, 55) }}
    >
      <span
        aria-hidden="true"
        className="grid size-16 shrink-0 place-items-center rounded-full bg-white text-4xl shadow-sm"
      >
        {unit.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-extrabold uppercase tracking-wider" style={{ color: shade(unit.color, 45) }}>
          Ünite {index + 1}
          <span className="ml-2 inline-flex items-center gap-0.5 normal-case tracking-normal">
            <Star aria-hidden="true" className="size-3.5 fill-amber-400 text-amber-500" />
            {stars}/{maxStars}
          </span>
        </p>
        <h2 id={`unite-${unit.id}`} className={`${styles.display} text-2xl font-bold leading-tight text-slate-800`}>
          {unit.title}
        </h2>
        <p className="text-sm font-semibold text-slate-600">{unit.description}</p>
      </div>
      <button
        type="button"
        onClick={onGuide}
        aria-label={`${unit.title} ipuçları`}
        title="İpuçları"
        className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-b-4 border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
      >
        <BookOpen aria-hidden="true" className="size-6" />
      </button>
    </header>
  );
}

function PathStop({
  node,
  state,
  stars,
  mascotSide,
  open,
  onToggle,
  onStart,
}: {
  node: PathNode;
  state: StopState;
  stars: number;
  mascotSide: 'left' | 'right';
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
}) {
  const { color } = node.unit;
  const chest = node.kind === 'review';
  const lessonNumber = node.unit.lessons.findIndex((lesson) => lesson.id === node.id) + 1;
  const subtitle = chest ? 'Ünitenin hepsinden karışık; içinde bir çıkartma var!' : `Ders ${lessonNumber} / ${node.unit.lessons.length}`;
  const status = state === 'done' ? 'tamamlandı' : state === 'locked' ? 'kilitli' : 'sıradaki';
  const Icon = state === 'locked' ? Lock : chest ? Gift : state === 'done' ? Check : Star;

  return (
    <div data-path-stop className="relative">
      {state === 'current' && !open && (
        <span className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2">
          <span
            className={`${styles.float} ${styles.display} relative block whitespace-nowrap rounded-2xl border-2 border-slate-200 bg-white px-3 py-1 text-lg font-bold uppercase tracking-wide`}
            style={{ color: shade(color, 35) }}
          >
            {chest ? 'Aç beni!' : 'Başla'}
            <span className="absolute left-1/2 top-full -mt-[6px] size-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white" />
          </span>
        </span>
      )}
      {state === 'current' && (
        <>
          <span
            aria-hidden="true"
            className={`${styles.ring} absolute inset-0 rounded-full`}
            style={{ boxShadow: `0 0 0 5px ${color}` }}
          />
          <Mascot
            className={`pointer-events-none absolute top-1/2 h-20 w-[4.3rem] -translate-y-1/2 ${
              mascotSide === 'left' ? 'right-full mr-4' : 'left-full ml-4'
            }`}
          />
        </>
      )}
      <PressButton
        face={state === 'locked' ? MUTED : color}
        depth={8}
        sized={false}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`${node.unit.title}: ${node.title}, ${status}`}
        className="relative size-20 rounded-full"
      >
        {chest && state === 'done' ? (
          <span aria-hidden="true" className="text-4xl">
            {node.unit.sticker.emoji}
          </span>
        ) : (
          <Icon
            aria-hidden="true"
            strokeWidth={2.75}
            className={`size-9 ${state === 'locked' ? 'text-slate-400' : 'text-white'} ${state === 'current' && !chest ? 'fill-white' : ''}`}
          />
        )}
      </PressButton>
      {state === 'done' && !chest && (
        <span className="absolute left-1/2 top-full mt-2.5 -translate-x-1/2">
          <Stars count={stars} />
        </span>
      )}

      {open && (
        <div
          className={`${styles.rise} absolute left-1/2 top-full z-20 mt-8 w-60 -translate-x-1/2 rounded-3xl border-2 border-b-[6px] bg-white p-4 text-left shadow-xl`}
          style={{ borderColor: state === 'locked' ? '#e2e8f0' : tint(color, 60) } as CSSProperties}
        >
          <p className={`${styles.display} text-xl font-bold leading-tight`}>{node.title}</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">{subtitle}</p>
          {state === 'locked' ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500">
              <Lock aria-hidden="true" className="size-4" />
              Önceki durakları bitirince açılır.
            </p>
          ) : (
            <>
              {state === 'done' && !chest && (
                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-500">
                  <Stars count={stars} /> En iyi sonucun
                </p>
              )}
              <PressButton face={shade(color, 35)} onClick={onStart} className="mt-4 w-full">
                {state === 'done' ? 'Tekrar oyna' : chest ? 'Sandığı aç' : 'Başla'}
              </PressButton>
            </>
          )}
        </div>
      )}
    </div>
  );
}
