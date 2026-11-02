'use client';

import { useEffect, useId, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { Check, Star, Turtle, Volume2, X } from 'lucide-react';
import { speak } from './audio';
import styles from './ingilizce.module.css';
import type { DayMark } from './progress';

// Button faces dark enough for white bold text on them
export const GREEN = '#1a873a';
export const RED = '#c92a2a';
export const BLUE = '#1877c9';
export const AMBER = '#b45309';
export const ORANGE = '#c2410c';
export const MUTED = '#e2e8f0';

/**
 * A chunky button whose face colour is `face`; the darker edge under it comes from the same colour.
 * `sized={false}` leaves height, padding and corners to the caller.
 */
export function PressButton({
  face,
  depth = 5,
  sized = true,
  className = '',
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { face: string; depth?: number; sized?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={`${styles.press} ${styles.display} inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide text-white disabled:text-slate-400 ${sized ? 'h-13 rounded-2xl px-6 text-lg' : ''} ${className}`}
      style={{ '--face': face, '--depth': `${depth}px`, ...style } as CSSProperties}
    />
  );
}

export function SpeakButton({ text, slow = false, className = '' }: { text: string; slow?: boolean; className?: string }) {
  const Icon = slow ? Turtle : Volume2;
  return (
    <button
      type="button"
      onClick={() => speak(text, slow)}
      aria-label={slow ? 'Yavaş dinle' : 'Dinle'}
      className={`grid shrink-0 place-items-center rounded-xl text-sky-500 transition-colors hover:bg-sky-100 hover:text-sky-600 ${className}`}
    >
      <Icon aria-hidden="true" className="size-6" />
    </button>
  );
}

export type OptionTone = 'idle' | 'selected' | 'right' | 'wrong' | 'faded';

// Outlined answer cards with a thicker bottom edge; right and wrong also differ in the feedback text
export const optionTones: Record<OptionTone, string> = {
  idle: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  selected: 'border-sky-400 bg-sky-50 text-sky-700',
  right: 'border-green-500 bg-green-50 text-green-800',
  wrong: 'border-rose-400 bg-rose-50 text-rose-700',
  faded: 'border-slate-200 bg-white text-slate-300',
};

export function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="hidden size-6 shrink-0 place-items-center rounded-md border-2 border-slate-200 font-mono text-xs text-slate-400 sm:grid">
      {children}
    </kbd>
  );
}

/** Three stars, `count` of them filled */
export function Stars({ count, className = 'size-4' }: { count: number; className?: string }) {
  return (
    <span role="img" aria-label={`${count} yıldız`} className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${className} ${i < count ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'}`}
          strokeWidth={2}
        />
      ))}
    </span>
  );
}

/** Monday to Sunday, with the days a lesson was finished filled in */
export function WeekRow({ week, className = '' }: { week: DayMark[]; className?: string }) {
  return (
    <ol aria-label="Bu hafta" className={`flex justify-between gap-1 ${className}`}>
      {week.map((day) => (
        <li key={day.label} className={`flex flex-col items-center gap-1 ${day.future ? 'opacity-50' : ''}`}>
          <span
            className={`grid size-9 place-items-center rounded-full border-2 ${
              day.done
                ? 'border-orange-500 bg-orange-500 text-white'
                : day.today
                  ? 'border-dashed border-orange-400 bg-orange-50'
                  : 'border-slate-200 bg-white'
            }`}
          >
            {day.done && <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
          </span>
          <span className={`text-xs font-bold ${day.today ? 'text-orange-600' : 'text-slate-500'}`}>
            {day.label}
            <span className="sr-only">{day.done ? ', ders yapıldı' : ', ders yok'}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** A white card over a dimmed page; Escape and the backdrop close it when `onClose` is given */
export function Modal({
  title,
  onClose,
  children,
  className = 'max-w-md',
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${styles.pop} relative m-auto w-full rounded-[2rem] border-2 border-b-[6px] border-slate-200 bg-white p-6 text-slate-800 shadow-2xl sm:p-7 ${className}`}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        )}
        <h2 id={titleId} className={`${styles.display} pr-10 text-2xl font-bold`}>
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
