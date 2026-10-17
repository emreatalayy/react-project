'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import { glassShadow } from '../../components/Card';
import { DRAW_COLOR, percent1 } from '../_lib/format';
import { display } from '../_lib/fonts';
import { clock, per100, scenario, type MatchData, type Toggles, type WhatIf } from '../_lib/replay';
import styles from './analiz.module.css';
import { Waffle } from './Waffle';

const SLIDER_MAX = 96;

function shuffled() {
  const order = Array.from({ length: 100 }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function Simulator({
  data,
  whatifs,
  presets,
}: {
  data: MatchData;
  whatifs: WhatIf[];
  presets: { m: number; label: string }[];
}) {
  const [minute, setMinute] = useState(0);
  const [on, setOn] = useState<Toggles>({});
  // A replay run fills the squares in random order; null shows them all at once.
  const [run, setRun] = useState<{ order: number[]; revealed: number } | null>(null);

  const { home, away } = data.teams;
  const result = scenario(data, whatifs, minute, 'real', on);
  const n = per100(result);
  const top = result.scores.slice(0, 3);

  function replay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setRun(null);
    setRun({ order: shuffled(), revealed: 0 });
  }

  useEffect(() => {
    if (!run || run.revealed >= 100) return;
    const id = requestAnimationFrame(() => setRun({ ...run, revealed: Math.min(100, run.revealed + 4) }));
    return () => cancelAnimationFrame(id);
  }, [run]);

  const big = [
    { value: n[0], label: `${home.name} kazanır`, color: home.color },
    { value: n[1], label: 'Beraberlik', color: DRAW_COLOR },
    { value: n[2], label: `${away.name} kazanır`, color: away.color },
  ];

  return (
    <div
      className={`fade-up grid overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0a1530]/65 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${glassShadow}`}
    >
      <div className="grid content-start gap-6 p-5 sm:p-6">
        <div>
          <label htmlFor="sim-minute" className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">
            Başlangıç dakikası
          </label>
          <div className="mt-2 flex items-baseline justify-between">
            <b className={`${display.className} text-4xl font-extrabold tabular-nums text-white`}>
              {minute === 0 ? "0'" : clock(minute, data.firstHalfAdded)}
            </b>
            <span
              className={`${display.className} rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-xl font-bold tabular-nums text-white/85`}
            >
              {home.short} {result.h0}–{result.a0} {away.short}
            </span>
          </div>
          <input
            id="sim-minute"
            type="range"
            min={0}
            max={SLIDER_MAX}
            step={1}
            value={Math.floor(minute)}
            onChange={(e) => {
              setMinute(Number(e.target.value));
              setRun(null);
            }}
            className={`${styles.range} mt-2`}
            style={{ ['--fill' as string]: `${(Math.floor(minute) / SLIDER_MAX) * 100}%` }}
          />
          <div aria-hidden="true" className="flex justify-between text-[11px] tabular-nums text-white/45">
            <span>0&apos;</span>
            <span>Devre</span>
            <span>90&apos;</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                aria-pressed={minute === p.m}
                onClick={() => {
                  setMinute(p.m);
                  replay();
                }}
                className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-[#0a1530]"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">Ya olsaydı?</legend>
          <div className="grid gap-0.5">
            {whatifs.map((w) => (
              <label
                key={w.id}
                className="-mx-2.5 flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] text-white/85 hover:bg-white/[0.05]"
              >
                <input
                  type="checkbox"
                  role="switch"
                  checked={!!on[w.id]}
                  onChange={(e) => {
                    setOn({ ...on, [w.id]: e.target.checked });
                    replay();
                  }}
                  className={styles.switch}
                />
                {w.label}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={replay}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 text-[15px] font-semibold text-[#0a1530] transition-transform active:scale-[0.98]"
        >
          <Play aria-hidden="true" className="size-4 fill-current" />
          100 kez oynat
        </button>
      </div>

      <div className="grid content-start gap-5 border-white/10 bg-black/15 p-5 max-md:border-t sm:p-6 md:border-l" aria-live="polite">
        <div className="grid grid-cols-3 gap-2.5">
          {big.map((b) => (
            <div key={b.label} className="grid gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-[13px] leading-snug text-white/70">
              <b className={`${display.className} flex items-center gap-2 text-4xl font-extrabold tabular-nums text-white`}>
                <span className="size-3 rounded-[3px]" style={{ background: b.color }} />
                {b.value}
              </b>
              {b.label}
            </div>
          ))}
        </div>
        <Waffle counts={n} colors={[home.color, away.color]} order={run?.order} revealed={run?.revealed} />
        <div>
          <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">En olası skorlar</p>
          <div className="grid gap-2">
            {top.map((s) => (
              <div key={`${s.h}-${s.a}`} className="grid grid-cols-[3rem_minmax(0,1fr)_3.6rem] items-center gap-2.5 text-sm">
                <b className={`${display.className} text-lg font-bold tabular-nums text-white`}>
                  {s.h}–{s.a}
                </b>
                <i
                  className="block h-2.5 rounded-r"
                  style={{
                    width: `${(s.p / top[0].p) * 100}%`,
                    background: s.h > s.a ? home.color : s.h === s.a ? DRAW_COLOR : away.color,
                  }}
                />
                <span className="text-right tabular-nums text-white/70">{percent1(s.p)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
