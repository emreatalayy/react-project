import { cardClass } from '../../components/Card';
import { DRAW_COLOR } from '../_lib/format';
import { display } from '../_lib/fonts';
import type { MatchData } from '../_lib/replay';
import type { KeyNumber, Visual } from '../_lib/story';
import { Waffle } from './Waffle';

function MiniVisual({ visual, data }: { visual: Visual; data: MatchData }) {
  const { home, away } = data.teams;
  if (visual.type === 'bar') {
    const { W, D, L } = visual.outcome;
    return (
      <div aria-hidden="true" className="flex h-2.5 gap-0.5">
        <i className="rounded-[3px]" style={{ flex: W, background: home.color }} />
        <i className="rounded-[3px]" style={{ flex: D, background: DRAW_COLOR }} />
        <i className="rounded-[3px]" style={{ flex: L, background: away.color }} />
      </div>
    );
  }
  if (visual.type === 'waffle') {
    return <Waffle counts={visual.counts} colors={[home.color, away.color]} columns={25} className="!gap-0.5" />;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-semibold text-white/50">
      {visual.items.map((item, i) => (
        <span key={i} className="contents">
          {i > 0 && <span aria-hidden="true">×</span>}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-2 py-1 tabular-nums text-white">
            <span className="size-2 rounded-full" style={{ background: data.teams[visual.side].color }} />
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}

export function KeyNumbers({ numbers, data }: { numbers: KeyNumber[]; data: MatchData }) {
  return (
    <ul className="mt-8 grid gap-4 md:grid-cols-3">
      {numbers.map((n, i) => (
        <li key={i} className={`${cardClass()} grid content-start gap-3`} style={{ animationDelay: `${120 + i * 60}ms` }}>
          <b className={`${display.className} text-5xl font-extrabold leading-[0.95] tabular-nums text-white`}>
            {n.value}
            {n.unit && <small className="text-[0.5em] font-semibold text-white/45"> {n.unit}</small>}
          </b>
          <MiniVisual visual={n.visual} data={data} />
          <span className="text-[15px] leading-relaxed text-white/75">{n.text}</span>
        </li>
      ))}
    </ul>
  );
}
