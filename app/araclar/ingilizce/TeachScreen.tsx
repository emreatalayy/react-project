'use client';

import { useEffect, useState } from 'react';
import { speak, speakAuto } from './audio';
import type { Tip, Word } from './course';
import styles from './ingilizce.module.css';
import { Mascot } from './Mascot';
import { GREEN, PressButton, SpeakButton } from './ui';

/** Before a new lesson's questions: Fındık's note on the rule, then one card per new word */
export function TeachScreen({ words, tip, onDone }: { words: Word[]; tip?: Tip; onDone: () => void }) {
  const [index, setIndex] = useState(0);
  const count = words.length + (tip ? 1 : 0);
  const word = tip ? (index > 0 ? words[index - 1] : null) : words[index];
  const last = index === count - 1;

  useEffect(() => {
    if (word) speakAuto(word.en);
  }, [word]);

  function next() {
    if (last) onDone();
    else setIndex(index + 1);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      next();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      <main className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <div key={index} className={`${styles.rise} m-auto flex w-full max-w-md flex-col items-center text-center`}>
          {word ? (
            <>
              <p className="text-sm font-extrabold uppercase tracking-wider text-sky-600">Yeni kelime</p>
              <button
                type="button"
                onClick={() => speak(word.en)}
                aria-label={`${word.en}: dinle`}
                className="mt-4 grid size-44 place-items-center rounded-[2.5rem] border-2 border-b-[6px] border-slate-200 bg-white text-8xl shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden="true">{word.emoji ?? '💬'}</span>
              </button>
              <p lang="en" className={`${styles.display} mt-6 flex items-center gap-1 text-5xl font-bold text-slate-800`}>
                {word.en}
                <SpeakButton text={word.en} className="size-11" />
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-500">{word.tr}</p>
            </>
          ) : (
            tip && (
              <>
                <Mascot mood="happy" className="h-32 w-28" />
                <p className="mt-2 text-sm font-extrabold uppercase tracking-wider text-amber-600">Fındık’ın notu</p>
                <h2 className={`${styles.display} mt-1 text-3xl font-bold text-slate-800`}>{tip.title}</h2>
                <p className="mt-3 text-lg leading-relaxed text-slate-600">{tip.body}</p>
                <ul className="mt-5 flex w-full flex-col gap-2 text-left">
                  {tip.examples.map((example) => (
                    <li
                      key={example.en}
                      className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-2 pl-2 pr-4"
                    >
                      <SpeakButton text={example.en} className="size-10" />
                      <span>
                        <span lang="en" className="font-extrabold text-slate-800">
                          {example.en}
                        </span>{' '}
                        <span className="text-slate-500">{example.tr}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )
          )}
          <ol aria-label={`${index + 1} / ${count}`} className="mt-8 flex gap-1.5">
            {Array.from({ length: count }, (_, i) => (
              <li
                key={i}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-sky-500' : i < index ? 'w-2.5 bg-sky-300' : 'w-2.5 bg-slate-300'}`}
              />
            ))}
          </ol>
        </div>
      </main>
      <footer className="border-t-2 border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:min-h-32 sm:px-6">
          <button
            type="button"
            onClick={onDone}
            className={`${styles.display} h-12 rounded-2xl px-4 text-lg font-bold uppercase tracking-wide text-slate-500 transition-colors hover:bg-slate-100`}
          >
            Atla
          </button>
          <PressButton face={GREEN} onClick={next} className="flex-1 sm:flex-none sm:min-w-48">
            {last ? 'Hadi başlayalım!' : 'Sonraki'}
          </PressButton>
        </div>
      </footer>
    </>
  );
}
