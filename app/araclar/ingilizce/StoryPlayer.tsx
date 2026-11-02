'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Languages, X } from 'lucide-react';
import { playSound, speakAuto, stopSpeaking } from './audio';
import { Character, SPEAKER_LOOKS } from './Character';
import type { Speaker, Story, StoryLine, StoryQuestion } from './course';
import styles from './ingilizce.module.css';
import { Mascot } from './Mascot';
import type { SessionReward } from './progress';
import { makeConfetti, SessionEnd, type SessionOutcome } from './SessionEnd';
import { GREEN, optionTones, PressButton, RED, SpeakButton, type OptionTone } from './ui';

type Step = { kind: 'line'; line: StoryLine; index: number } | { kind: 'question'; question: StoryQuestion };

const NAMES: Record<Speaker, string> = { findik: 'Fındık', elif: 'Elif', can: 'Can', deniz: 'Deniz' };

// Lines in order, each followed by the questions asked after it
function storySteps(story: Story): Step[] {
  return story.lines.flatMap((line, index): Step[] => [
    { kind: 'line', line, index },
    ...story.questions.filter((q) => q.after === index).map((question): Step => ({ kind: 'question', question })),
  ]);
}

function Avatar({ speaker }: { speaker: Speaker }) {
  return speaker === 'findik' ? (
    <Mascot className="h-16 w-14 shrink-0" />
  ) : (
    <Character who={SPEAKER_LOOKS[speaker]} className="h-16 w-14 shrink-0" />
  );
}

export function StoryPlayer({
  story,
  startedAt,
  learnerName,
  onFinish,
  onClose,
}: {
  story: Story;
  startedAt: number;
  learnerName: string;
  onFinish: (stars: number) => SessionReward;
  onClose: () => void;
}) {
  const steps = useMemo(() => storySteps(story), [story]);
  const [position, setPosition] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [translated, setTranslated] = useState<number[]>([]);
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const step = steps[position];
  const shownLines = steps.slice(0, position + 1).flatMap((s) => (s.kind === 'line' ? [s] : []));
  const questions = steps.filter((s) => s.kind === 'question').length;

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      stopSpeaking();
    };
  }, []);

  // Each new line is read out and scrolled into view
  useEffect(() => {
    if (step?.kind === 'line') speakAuto(step.line.en);
    bottom.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [step]);

  function answer(option: string) {
    if (step?.kind !== 'question' || choice) return;
    setChoice(option);
    if (option === step.question.answer) playSound('correct');
    else {
      playSound('wrong');
      setMistakes(mistakes + 1);
    }
  }

  function next() {
    if (step?.kind === 'question' && !choice) return;
    setChoice(null);
    if (position + 1 < steps.length) {
      setPosition(position + 1);
      return;
    }
    const stars = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
    const reward = onFinish(stars);
    playSound('complete');
    setOutcome({
      stars,
      reward,
      confetti: makeConfetti(),
      accuracy: questions > 0 ? (questions - mistakes) / questions : 1,
      seconds: Math.round((Date.now() - startedAt) / 1000),
      story: true,
    });
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (outcome) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        next();
      } else if (step?.kind === 'question' && /^[1-3]$/.test(event.key)) {
        const option = step.question.options[Number(event.key) - 1];
        if (option) answer(option);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function toneOf(option: string, question: StoryQuestion): OptionTone {
    if (!choice) return 'idle';
    if (option === question.answer) return 'right';
    return option === choice ? 'wrong' : 'faded';
  }

  const answeredWrong = step?.kind === 'question' && choice !== null && choice !== step.question.answer;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={story.title}
      className="fixed inset-0 z-[70] isolate flex flex-col overflow-hidden bg-[#fffaf0] text-slate-800"
    >
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 pt-4 sm:gap-4 sm:px-6 sm:pt-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Hikâyeyi kapat"
          className="grid size-11 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600"
        >
          <X aria-hidden="true" className="size-7" strokeWidth={2.5} />
        </button>
        <div
          role="progressbar"
          aria-label="Hikâye ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={outcome ? steps.length : position}
          className="h-5 flex-1 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-500"
            style={{ width: `${((outcome ? steps.length : position) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      {outcome ? (
        <SessionEnd outcome={outcome} learnerName={learnerName} onClose={onClose} />
      ) : (
        <>
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
              <p className="text-sm font-extrabold uppercase tracking-wider text-violet-600">Hikâye</p>
              <h2 className={`${styles.display} text-3xl font-bold`}>{story.title}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                <Languages aria-hidden="true" className="size-4" />
                Türkçesini görmek için bir balona dokun.
              </p>
              <ol className="mt-6 flex flex-col gap-4">
                {shownLines.map(({ line, index }) => {
                  const open = translated.includes(index);
                  return (
                    <li key={index} className={`${styles.rise} flex items-end gap-2`}>
                      <Avatar speaker={line.speaker} />
                      <div className="min-w-0">
                        <p className="ml-1 text-xs font-extrabold text-slate-500">{NAMES[line.speaker]}</p>
                        <div className="flex items-center gap-1 rounded-3xl rounded-bl-md border-2 border-slate-200 bg-white py-2 pl-4 pr-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() =>
                              setTranslated(open ? translated.filter((i) => i !== index) : [...translated, index])
                            }
                            aria-expanded={open}
                            className="text-left"
                          >
                            <span lang="en" className="block text-lg font-bold leading-snug">
                              {line.en}
                            </span>
                            {open && <span className="block text-base font-semibold text-slate-500">{line.tr}</span>}
                          </button>
                          <SpeakButton text={line.en} className="size-10" />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div ref={bottom} />
            </div>
          </main>

          <footer
            className={`border-t-2 transition-colors ${
              step?.kind === 'question' && choice
                ? answeredWrong
                  ? 'border-rose-300 bg-rose-100'
                  : 'border-green-300 bg-green-100'
                : 'border-slate-200 bg-white'
            }`}
          >
            <div aria-live="polite" className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-4 sm:px-6">
              {step?.kind === 'question' && (
                <>
                  <p className={`${styles.display} text-xl font-bold`}>{step.question.prompt}</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {step.question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        disabled={choice !== null}
                        onClick={() => answer(option)}
                        className={`rounded-2xl border-2 border-b-4 px-4 py-3 text-lg font-semibold transition-colors ${optionTones[toneOf(option, step.question)]}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <PressButton
                face={step?.kind === 'question' && !choice ? '#e2e8f0' : answeredWrong ? RED : GREEN}
                disabled={step?.kind === 'question' && !choice}
                onClick={next}
                className="w-full sm:ml-auto sm:w-auto sm:min-w-48"
              >
                {position + 1 === steps.length && (step?.kind !== 'question' || choice) ? 'Bitir' : 'Devam'}
              </PressButton>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
