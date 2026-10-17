'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { percent, percent1 } from '../_lib/format';
import { clock, type Side, type WinPoint } from '../_lib/replay';
import type { Annotation } from '../_lib/story';

type Goal = { el: number; side: Side };

const SURFACE = '#0b1834';
const TICKS = [0, 15, 30, 45, 60, 75, 90];

// Two lines, one per team: the chance each side wins from that minute on. Draws live in the tooltip.
export function WinProbabilityChart({
  series,
  counterfactual,
  goals,
  annotations,
  highlight,
  end,
  firstHalfAdded,
  colors,
  names,
  shorts,
}: {
  series: WinPoint[];
  counterfactual?: { label: string; points: WinPoint[] };
  goals: Goal[];
  annotations: Annotation[];
  highlight?: { from: number; to: number; label: string };
  end: number;
  firstHalfAdded: number;
  colors: [home: string, away: string];
  names: [home: string, away: string];
  shorts: [home: string, away: string];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(880);
  const [hover, setHover] = useState<{ i: number; left: number; top: number } | null>(null);
  const [keyIndex, setKeyIndex] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const narrow = width < 600;
  const H = narrow ? 260 : 340;
  const m = { l: 36, r: narrow ? 52 : 70, t: 12, b: 28 };
  const iw = width - m.l - m.r;
  const ih = H - m.t - m.b;
  const X = (e: number) => m.l + (e / end) * iw;
  const Y = (v: number) => m.t + ih - v * ih;
  // Clock minute → continuous clock (second half shifted by first-half stoppage time)
  const tickX = (minute: number) => X(minute > 45 ? minute + firstHalfAdded : minute);

  const step = series.length > 1 ? series[1].m - series[0].m : 0.25;
  const indexAt = (e: number) => Math.max(0, Math.min(series.length - 1, Math.round(e / step)));
  const path = (points: WinPoint[], f: (p: WinPoint) => number) =>
    points.map((p, i) => `${i ? 'L' : 'M'}${X(p.m).toFixed(1)},${Y(f(p)).toFixed(1)}`).join('');
  const cfAt = (e: number) => {
    const pts = counterfactual?.points;
    if (!pts?.length || e < pts[0].m) return null;
    return pts[Math.min(pts.length - 1, Math.round((e - pts[0].m) / step))];
  };
  const value = (p: WinPoint, side: Side) => (side === 'home' ? p.W : p.L);
  const last = series[series.length - 1];

  function onMove(event: PointerEvent<SVGRectElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const e = Math.max(0, Math.min(end, ((event.clientX - rect.left) / rect.width) * end));
    const box = ref.current!.getBoundingClientRect();
    setHover({ i: indexAt(e), left: event.clientX - box.left, top: event.clientY - box.top });
  }
  function onKey(event: KeyboardEvent<SVGRectElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const current = keyIndex ?? indexAt(28);
    const next = Math.max(0, Math.min(series.length - 1, current + (event.key === 'ArrowRight' ? 4 : -4)));
    setKeyIndex(next);
    setHover({ i: next, left: X(series[next].m), top: m.t + 40 });
  }

  const active = hover ? series[hover.i] : null;
  const activeCf = active ? cfAt(active.m) : null;

  return (
    <div ref={ref} className="relative w-full">
      <svg viewBox={`0 0 ${width} ${H}`} width="100%" height={H} className="block overflow-visible">
        {/* the highlighted stretch */}
        {highlight && (
          <>
            <rect x={X(highlight.from)} y={m.t} width={X(highlight.to) - X(highlight.from)} height={ih} fill={colors[0]} fillOpacity={0.12} />
            {!narrow && (
              <text x={(X(highlight.from) + X(highlight.to)) / 2} y={m.t + 18} fill="#fff" fontSize={12} fontWeight={600} textAnchor="middle">
                {highlight.label}
              </text>
            )}
          </>
        )}
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <line key={v} x1={m.l} x2={m.l + iw} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,0.08)" />
        ))}
        {[0, 0.5, 1].map((v) => (
          <text key={v} x={m.l - 8} y={Y(v) + 4} fill="rgba(255,255,255,0.5)" fontSize={11} textAnchor="end">
            %{v * 100}
          </text>
        ))}
        {TICKS.map((t) => (
          <text key={t} x={tickX(t)} y={m.t + ih + 18} fill="rgba(255,255,255,0.5)" fontSize={11} textAnchor="middle">
            {t}&apos;
          </text>
        ))}

        {counterfactual && (
          <path
            d={path(counterfactual.points, (p) => p.W)}
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth={2}
            strokeDasharray="5 4"
            strokeLinejoin="round"
          />
        )}
        <path d={path(series, (p) => p.L)} fill="none" stroke={colors[1]} strokeWidth={2.5} strokeLinejoin="round" />
        <path d={path(series, (p) => p.W)} fill="none" stroke={colors[0]} strokeWidth={2.5} strokeLinejoin="round" />

        {goals.map((g) => {
          const p = series[indexAt(g.el + step)];
          return (
            <circle
              key={g.el}
              cx={X(g.el)}
              cy={Y(value(p, g.side))}
              r={5}
              fill={colors[g.side === 'home' ? 0 : 1]}
              stroke={SURFACE}
              strokeWidth={2.5}
            />
          );
        })}

        {!narrow &&
          annotations.map((a) => (
            <text
              key={a.text}
              x={X(a.x)}
              y={Y(a.y)}
              fill={a.muted ? 'rgba(255,255,255,0.6)' : '#fff'}
              fontSize={12.5}
              fontWeight={a.muted ? 500 : 600}
              textAnchor={a.anchor ?? 'start'}
              paintOrder="stroke"
              stroke={SURFACE}
              strokeWidth={4}
              strokeLinejoin="round"
            >
              {a.text}
            </text>
          ))}

        {/* end values, labelled at the right edge */}
        {(['away', 'home'] as const).map((side) => {
          const v = value(last, side);
          const i = side === 'home' ? 0 : 1;
          return (
            <text key={side} x={m.l + iw + 8} y={Y(v) + (v > 0.5 ? 10 : -2)} fill="#fff" fontSize={12} fontWeight={600}>
              <tspan fill={colors[i]}>●</tspan> {shorts[i]} {percent(v)}
            </text>
          );
        })}

        {active && <line x1={X(active.m)} x2={X(active.m)} y1={m.t} y2={m.t + ih} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />}
        {active && (
          <>
            <circle cx={X(active.m)} cy={Y(active.W)} r={4} fill={colors[0]} stroke={SURFACE} strokeWidth={2} />
            <circle cx={X(active.m)} cy={Y(active.L)} r={4} fill={colors[1]} stroke={SURFACE} strokeWidth={2} />
          </>
        )}
        <rect
          x={m.l}
          y={m.t}
          width={iw}
          height={ih}
          fill="transparent"
          tabIndex={0}
          aria-label="Dakika seçmek için üzerine gelin veya ok tuşlarını kullanın"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
          className="cursor-crosshair outline-none"
        />
      </svg>
      {active && hover && (
        <div
          className="pointer-events-none absolute z-10 w-max max-w-64 rounded-xl border border-white/15 bg-[#0b1834]/95 px-3 py-2 text-xs leading-relaxed text-white/80 shadow-xl backdrop-blur"
          style={{ left: Math.min(hover.left + 14, width - 210), top: Math.max(0, hover.top - 80) }}
        >
          <b className="font-semibold text-white">
            {clock(active.m, firstHalfAdded)} · skor {active.h0}–{active.a0}
          </b>
          <br />
          {names[0]} kazanır {percent1(active.W)}
          <br />
          Beraberlik {percent1(active.D)}
          <br />
          {names[1]} kazanır {percent1(active.L)}
          {activeCf && (
            <>
              <br />
              <span className="text-white/55">
                {counterfactual!.label}: {percent1(activeCf.W)}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
