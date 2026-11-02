'use client';

import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { createRecognition, speak, speakAuto, stopSpeaking, type Recognition } from './audio';
import { Character } from './Character';
import { answerIndex, type Draft, type Exercise, type Grade } from './exercises';
import styles from './ingilizce.module.css';
import { Key, optionTones, PressButton, SpeakButton, BLUE, RED, type OptionTone } from './ui';

type Handlers = {
  onChoose: (index: number) => void;
  onPick: (tileIndex: number) => void;
  onUnpick: (position: number) => void;
  onText: (text: string) => void;
  onMatched: () => void;
  /** A finished speech transcript, graded right away */
  onSpoken: (transcript: string) => void;
};

type ViewProps = Handlers & { exercise: Exercise; draft: Draft; graded: Grade | null };

function titleOf(exercise: Exercise) {
  switch (exercise.kind) {
    case 'picture':
      return `“${exercise.word.tr}” hangisi?`;
    case 'select':
      return 'Doğru anlamı seç';
    case 'match':
      return 'Eşleşen çiftlere dokun';
    case 'build':
      return exercise.from === 'tr' ? 'Bu cümleyi İngilizceye çevir' : 'Bu cümleyi Türkçeye çevir';
    case 'listen':
      return 'Duyduğun cümleyi kur';
    case 'type':
      return 'Bu cümleyi İngilizce yaz';
    case 'speak':
      return 'Bu cümleyi sesli söyle';
    case 'blank':
      return 'Boşluğu doldur';
  }
}

function optionTone(index: number, draft: Draft, exercise: Exercise, graded: Grade | null): OptionTone {
  if (!graded) return index === draft.choice ? 'selected' : 'idle';
  if (index === answerIndex(exercise)) return 'right';
  return index === draft.choice ? 'wrong' : 'faded';
}

export function ExerciseView(props: ViewProps) {
  const { exercise } = props;
  return (
    <div className={styles.rise}>
      <h2 className={`${styles.display} text-[1.7rem] font-bold leading-tight text-slate-800 sm:text-3xl`}>
        {titleOf(exercise)}
      </h2>
      <div className="mt-6 sm:mt-8">
        <ExerciseBody {...props} />
      </div>
    </div>
  );
}

function ExerciseBody({ exercise, draft, graded, onChoose, onPick, onUnpick, onText, onMatched, onSpoken }: ViewProps) {
  const locked = graded !== null;
  switch (exercise.kind) {
    case 'picture':
      return (
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {exercise.options.map((word, index) => (
            <button
              key={word.en}
              type="button"
              disabled={locked}
              onClick={() => onChoose(index)}
              className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 border-b-[6px] px-2 pb-4 pt-7 transition-colors sm:pt-9 ${optionTones[optionTone(index, draft, exercise, graded)]}`}
            >
              <span aria-hidden="true" className="text-6xl leading-none sm:text-7xl">
                {word.emoji}
              </span>
              <span lang="en" className="text-lg font-bold">
                {word.en}
              </span>
              <span className="absolute right-2 top-2">
                <Key>{index + 1}</Key>
              </span>
            </button>
          ))}
        </div>
      );

    case 'select':
      return (
        <>
          <Prompt lang="en" text={exercise.word.en} />
          <OptionList options={exercise.options} {...{ exercise, draft, graded, onChoose }} />
        </>
      );

    case 'blank': {
      const [before, after] = exercise.blank.en.split('___');
      const filled = draft.choice === null ? null : exercise.options[draft.choice];
      return (
        <>
          <p lang="en" className="text-2xl font-semibold leading-loose text-slate-800 sm:text-3xl sm:leading-loose">
            {before}
            <span
              className={`mx-1 inline-block min-w-20 rounded-lg border-b-2 px-2 text-center ${
                filled ? 'border-sky-500 text-sky-600' : 'border-slate-400 text-transparent'
              }`}
            >
              {filled ?? '___'}
            </span>
            {after}
          </p>
          <p className="mt-2 text-base text-slate-500">{exercise.blank.tr}</p>
          <OptionList options={exercise.options} {...{ exercise, draft, graded, onChoose }} />
        </>
      );
    }

    case 'match':
      return <MatchPairs exercise={exercise} onMatched={onMatched} />;

    case 'build':
      return (
        <>
          <Prompt lang={exercise.from} text={exercise.sentence[exercise.from]} />
          <TileBoard tiles={exercise.tiles} picked={draft.picked} locked={locked} onPick={onPick} onUnpick={onUnpick} />
        </>
      );

    case 'listen':
      return (
        <>
          <div className="flex items-end justify-center gap-4">
            <PressButton
              face={BLUE}
              depth={6}
              sized={false}
              aria-label="Cümleyi dinle"
              className="size-24 rounded-3xl"
              onClick={() => speak(exercise.sentence.en)}
            >
              <SpeakIcon />
            </PressButton>
            <SpeakButton text={exercise.sentence.en} slow className="size-14 border-2 border-b-4 border-slate-200 bg-white" />
          </div>
          <div className="mt-8">
            <TileBoard tiles={exercise.tiles} picked={draft.picked} locked={locked} onPick={onPick} onUnpick={onUnpick} />
          </div>
        </>
      );

    case 'speak':
      return <SpeakAloud text={exercise.sentence.en} locked={locked} onSpoken={onSpoken} />;

    case 'type':
      return (
        <>
          <Prompt lang="tr" text={exercise.sentence.tr} />
          <textarea
            value={draft.text}
            onChange={(event) => onText(event.target.value)}
            // Enter checks the answer (handled by the player) instead of starting a new line
            onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
            disabled={locked}
            rows={3}
            lang="en"
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            aria-label="İngilizce cevabın"
            placeholder="İngilizce yaz"
            autoFocus
            className="mt-6 w-full resize-none rounded-3xl border-2 border-b-4 border-slate-200 bg-white p-4 text-xl text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none disabled:opacity-70"
          />
        </>
      );
  }
}

// Speaker drawn larger than the icon set's, for the big listen button
function SpeakIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-11" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M11 4.7a.7.7 0 0 0-1.2-.5L6.4 7.6A1.4 1.4 0 0 1 5.4 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.4a1.4 1.4 0 0 1 1 .4l3.4 3.4a.7.7 0 0 0 1.2-.5z" fill="currentColor" />
      <path d="M16 9a5 5 0 0 1 0 6" strokeLinecap="round" />
      <path d="M19.4 18.4a9 9 0 0 0 0-12.8" strokeLinecap="round" />
    </svg>
  );
}

// A classmate says the prompt in a speech bubble
function Prompt({ lang, text }: { lang: 'en' | 'tr'; text: string }) {
  return (
    <div className="flex items-end gap-1 sm:gap-2">
      <Character text={text} className="h-28 w-24 shrink-0 sm:h-32 sm:w-28" />
      <p
        lang={lang}
        className="relative mb-10 flex items-center gap-1 rounded-3xl border-2 border-slate-200 bg-white py-3 pl-5 pr-2 text-xl font-semibold text-slate-800 shadow-sm"
      >
        <span
          aria-hidden="true"
          className="absolute -left-[9px] bottom-4 size-4 rotate-45 border-b-2 border-l-2 border-slate-200 bg-white"
        />
        <span className="relative">{text}</span>
        {lang === 'en' ? <SpeakButton text={text} className="relative size-9" /> : <span className="w-2" />}
      </p>
    </div>
  );
}

const RECOGNITION_ERRORS: Record<string, string> = {
  'not-allowed': 'Mikrofon izni verilmedi. Tarayıcıdan izin ver ya da bu alıştırmayı atla.',
  'service-not-allowed': 'Mikrofon izni verilmedi. Tarayıcıdan izin ver ya da bu alıştırmayı atla.',
  'audio-capture': 'Mikrofon bulunamadı.',
  'no-speech': 'Ses duyamadım, tekrar dene.',
  network: 'Konuşma tanıma hizmetine ulaşılamadı.',
};

function SpeakAloud({ text, locked, onSpoken }: { text: string; locked: boolean; onSpoken: (transcript: string) => void }) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const [error, setError] = useState<string | null>(null);
  const active = useRef<Recognition | null>(null);

  // Leaving the exercise drops a running recognition without grading it
  useEffect(
    () => () => {
      const recognition = active.current;
      if (!recognition) return;
      recognition.onend = null;
      recognition.abort();
    },
    [],
  );

  function toggle() {
    if (active.current) {
      active.current.stop();
      return;
    }
    const recognition = createRecognition();
    if (!recognition) return;
    stopSpeaking();
    let final = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setHeard(`${final}${interim}`.trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') setError(RECOGNITION_ERRORS[event.error] ?? 'Sesini tanıyamadım, tekrar dene.');
    };
    recognition.onend = () => {
      active.current = null;
      setListening(false);
      if (final.trim()) onSpoken(final.trim());
    };
    active.current = recognition;
    setError(null);
    setHeard('');
    setListening(true);
    try {
      recognition.start();
    } catch {
      active.current = null;
      setListening(false);
      setError('Mikrofon başlatılamadı.');
    }
  }

  return (
    <>
      <Prompt lang="en" text={text} />
      <div className="mt-6 flex flex-col items-center gap-4 text-center">
        <div className="relative">
          {listening && (
            <span aria-hidden="true" className={`${styles.ring} absolute inset-0 rounded-3xl`} style={{ boxShadow: `0 0 0 4px ${RED}` }} />
          )}
          <PressButton
            face={listening ? RED : BLUE}
            depth={6}
            sized={false}
            disabled={locked}
            onClick={toggle}
            aria-label={listening ? 'Konuşmayı bitir' : 'Konuşmaya başla'}
            className="relative size-24 rounded-3xl"
          >
            {listening ? (
              <Square aria-hidden="true" className="size-8 fill-current" />
            ) : (
              <Mic aria-hidden="true" className="size-10" />
            )}
          </PressButton>
        </div>
        <p aria-live="polite" className={`min-h-6 text-lg font-semibold ${error ? 'text-rose-600' : 'text-slate-600'}`}>
          {error ?? (heard ? `“${heard}”` : listening ? 'Dinliyorum, cümleyi söyle…' : 'Mikrofona dokun ve cümleyi söyle')}
        </p>
        <p className="max-w-xs text-xs leading-relaxed text-slate-500">
          Sesin, tarayıcının konuşma tanıma hizmetiyle yazıya çevrilir.
        </p>
      </div>
    </>
  );
}

function OptionList({
  options,
  exercise,
  draft,
  graded,
  onChoose,
}: {
  options: string[];
  exercise: Exercise;
  draft: Draft;
  graded: Grade | null;
  onChoose: (index: number) => void;
}) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          disabled={graded !== null}
          onClick={() => onChoose(index)}
          className={`flex items-center gap-3 rounded-2xl border-2 border-b-4 px-4 py-4 text-left text-lg font-semibold transition-colors ${optionTones[optionTone(index, draft, exercise, graded)]}`}
        >
          <Key>{index + 1}</Key>
          {option}
        </button>
      ))}
    </div>
  );
}

const tileClass = 'h-12 rounded-2xl border-2 border-b-4 px-4 text-lg font-semibold';

function TileBoard({
  tiles,
  picked,
  locked,
  onPick,
  onUnpick,
}: {
  tiles: string[];
  picked: number[];
  locked: boolean;
  onPick: (tileIndex: number) => void;
  onUnpick: (position: number) => void;
}) {
  return (
    <>
      <div className={`${styles.lines} flex min-h-[7.5rem] flex-wrap content-start gap-x-2 gap-y-3 pt-1.5`}>
        {picked.map((tileIndex, position) => (
          <button
            key={tileIndex}
            type="button"
            disabled={locked}
            onClick={() => onUnpick(position)}
            className={`${tileClass} ${styles.pop} border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50`}
          >
            {tiles[tileIndex]}
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {tiles.map((tile, index) =>
          picked.includes(index) ? (
            // Keeps the bank from reflowing while tiles are in the answer
            <span key={index} aria-hidden="true" className={`${tileClass} grid place-items-center border-transparent bg-slate-200 text-transparent`}>
              {tile}
            </span>
          ) : (
            <button
              key={index}
              type="button"
              disabled={locked}
              onClick={() => onPick(index)}
              className={`${tileClass} border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50`}
            >
              {tile}
            </button>
          ),
        )}
      </div>
    </>
  );
}

type MatchExercise = Extract<Exercise, { kind: 'match' }>;
type Side = 'left' | 'right';

// Keys 1–5 pick from the English column and 6–0 from the Turkish one
const MATCH_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

function MatchPairs({ exercise, onMatched }: { exercise: MatchExercise; onMatched: () => void }) {
  const { pairs, rightOrder } = exercise;
  const [selected, setSelected] = useState<Record<Side, number | null>>({ left: null, right: null });
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<Record<Side, number> | null>(null);

  function choose(side: Side, pair: number) {
    if (matched.includes(pair)) return;
    if (side === 'left') speakAuto(pairs[pair].en);
    const next = { ...selected, [side]: selected[side] === pair ? null : pair };
    if (next.left === null || next.right === null) {
      setSelected(next);
      return;
    }
    setSelected({ left: null, right: null });
    if (next.left === next.right) {
      const nowMatched = [...matched, pair];
      setMatched(nowMatched);
      if (nowMatched.length === pairs.length) onMatched();
    } else {
      setWrong({ left: next.left, right: next.right });
      window.setTimeout(() => setWrong(null), 600);
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const position = MATCH_KEYS.indexOf(event.key);
      if (position < 0 || event.ctrlKey || event.metaKey || event.altKey) return;
      if (position < pairs.length) choose('left', position);
      else if (position >= 5 && position - 5 < pairs.length) choose('right', rightOrder[position - 5]);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function tone(side: Side, pair: number): string {
    if (matched.includes(pair)) return optionTones.faded;
    if (wrong?.[side] === pair) return `${optionTones.wrong} ${styles.shake}`;
    return selected[side] === pair ? optionTones.selected : optionTones.idle;
  }

  const column = (side: Side, order: number[]) =>
    order.map((pair, position) => (
      <button
        key={pair}
        type="button"
        disabled={matched.includes(pair)}
        onClick={() => choose(side, pair)}
        lang={side === 'left' ? 'en' : 'tr'}
        className={`flex min-h-16 items-center gap-3 rounded-2xl border-2 border-b-4 px-3 py-2 text-left text-lg font-semibold transition-colors ${tone(side, pair)}`}
      >
        <Key>{MATCH_KEYS[side === 'left' ? position : position + 5]}</Key>
        <span className="flex-1 text-center">{side === 'left' ? pairs[pair].en : pairs[pair].tr}</span>
      </button>
    ));

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className="flex flex-col gap-3">{column('left', pairs.map((_, i) => i))}</div>
      <div className="flex flex-col gap-3">{column('right', rightOrder)}</div>
    </div>
  );
}
