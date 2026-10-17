import { cardClass } from '../../components/Card';
import { DRAW_COLOR } from '../_lib/format';
import { display } from '../_lib/fonts';
import type { MatchData } from '../_lib/replay';
import type { ReplayCard, StoryApi } from '../_lib/story';
import styles from './analiz.module.css';
import { Waffle } from './Waffle';

export function ReplayCards({ cards, api }: { cards: ReplayCard[]; api: StoryApi }) {
  const { data } = api;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card, i) => {
        const real = api.at(card.m, 'real', card.on);
        const pace = api.at(card.m, 'pace', card.on);
        const n = api.per100(real);
        return (
          <article
            key={card.title}
            className={`${cardClass()} grid content-start gap-4 ${card.whatif ? `${styles.whatif} border-dashed` : ''}`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <header className="flex items-center gap-3">
              <span className={`${display.className} rounded-lg bg-white px-2.5 py-1.5 text-base font-bold tabular-nums text-[#0a1530]`}>
                {card.chip}
              </span>
              <span className="grid min-w-0 flex-1 gap-0.5">
                {card.whatif && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-300">Ya olsaydı</span>
                )}
                <h3 className="text-lg font-semibold leading-tight text-white">{card.title}</h3>
              </span>
              {!card.hideScore && (
                <span
                  className={`${display.className} rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-2xl font-extrabold tabular-nums text-white`}
                >
                  {real.h0}–{real.a0}
                </span>
              )}
            </header>
            <p className="flex items-baseline gap-2.5">
              <b className={`${display.className} text-5xl font-extrabold leading-[0.9] tabular-nums text-white`}>
                {n[0]}
                <small className="text-[0.45em] font-semibold text-white/45"> / 100</small>
              </b>
              <span className="text-sm text-white/70">maçta {data.teams.home.name} kazanıyor</span>
            </p>
            <Waffle
              counts={n}
              colors={[data.teams.home.color, data.teams.away.color]}
              label={`100 maç: ${data.teams.home.name} ${n[0]}, beraberlik ${n[1]}, ${data.teams.away.name} ${n[2]}`}
            />
            <Tally n={n} data={data} />
            <p className="border-t border-white/10 pt-4 text-[15px] leading-relaxed text-white/75">
              {card.text({ n, real, pace, api })}
            </p>
          </article>
        );
      })}
    </div>
  );
}

export function Tally({ n, data }: { n: [number, number, number]; data: MatchData }) {
  const items = [
    { value: n[0], label: data.teams.home.short, color: data.teams.home.color },
    { value: n[1], label: 'beraberlik', color: DRAW_COLOR },
    { value: n[2], label: data.teams.away.short, color: data.teams.away.color },
  ];
  return (
    <div className="flex flex-wrap gap-4 text-[13px] text-white/70">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: item.color }} />
          <b className={`${display.className} text-lg font-bold tabular-nums text-white`}>{item.value}</b>
          {item.label}
        </span>
      ))}
    </div>
  );
}
