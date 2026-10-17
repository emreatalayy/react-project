// UI pieces shared by the tool pages.

// Same frosted glass as the home page cards
const glass =
  'border border-white/[0.12] bg-[#0a1530]/70 shadow-[0_16px_40px_-20px_rgba(3,12,32,0.7),inset_0_1px_0_0_rgba(255,255,255,0.1)] backdrop-blur-xl';

export const panel = `rounded-3xl p-4 sm:p-6 ${glass}`;
export const panelTitle = 'font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400';
export const smallButton =
  'inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 text-[13px] text-zinc-300 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white';
export const numberInput =
  'w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right font-mono text-sm tabular-nums text-zinc-100 focus:border-sky-400/50 focus:outline-none';

export const numberFormat = new Intl.NumberFormat('tr-TR');
export const percentFormat = new Intl.NumberFormat('tr-TR', { style: 'percent', maximumFractionDigits: 0 });

// Dark categorical slots 1-5 of the documented palette, validated as a cycle (wrap pair included) on
// #111115 and on the glass panels' effective #09142f. They only separate neighbours; numbers, gaps and
// list views carry identity.
const HIGHLIGHT_COLORS = ['57, 135, 229', '217, 89, 38', '25, 158, 112', '201, 133, 0', '213, 81, 129'];

export function highlightColor(index: number, alpha: number) {
  return `rgba(${HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]}, ${alpha})`;
}

export function countWords(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className={`rounded-2xl p-4 ${glass}`}>
      <dt className="text-xs text-zinc-400">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-50">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-zinc-400">{unit}</span>}
      </dd>
    </div>
  );
}
