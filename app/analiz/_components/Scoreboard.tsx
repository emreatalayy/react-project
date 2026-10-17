import { glassShadow } from '../../components/Card';
import { display } from '../_lib/fonts';
import { goalsOf, minuteLabel, type MatchData, type Side } from '../_lib/replay';

// One column per team: name, formation and the goal list, aligned towards the score.
function TeamColumn({ data, side }: { data: MatchData; side: Side }) {
  const team = data.teams[side];
  const away = side === 'away';
  const goals = goalsOf(data).filter((g) => g.team === side);
  const disallowed = data.disallowed.filter((d) => d.team === side);

  return (
    <div className={`grid min-w-0 content-start gap-4 ${away ? 'justify-items-end text-right' : ''}`}>
      <div className={`flex max-w-full min-w-0 items-center gap-2 sm:gap-2.5 ${away ? 'flex-row-reverse' : ''}`}>
        <span aria-hidden="true" className="size-2.5 flex-none rounded-full sm:size-3" style={{ background: team.color }} />
        <p className={`${display.className} min-w-0 truncate text-[1.35rem] font-bold uppercase leading-none tracking-[0.02em] text-white sm:text-[2.6rem]`}>
          {team.name}
        </p>
      </div>
      <ul className="grid gap-1.5 text-[13px] text-white/80 sm:text-sm">
        {goals.map((g) => (
          <li key={g.el} className={`flex items-baseline gap-2 ${away ? 'flex-row-reverse' : ''}`}>
            <span className={`${display.className} w-9 text-[15px] font-semibold tabular-nums text-white/55 ${away ? 'text-left' : 'text-right'}`}>
              {minuteLabel(g)}
            </span>
            <span className="sm:hidden">{g.short}</span>
            <span className="max-sm:hidden">{g.player}</span>
          </li>
        ))}
        {disallowed.map((d) => (
          <li key={`var-${d.el}`} className={`flex items-baseline gap-2 text-white/45 ${away ? 'flex-row-reverse' : ''}`}>
            <span className={`${display.className} w-9 text-[15px] font-semibold tabular-nums ${away ? 'text-left' : 'text-right'}`}>
              {d.minute}&apos;
            </span>
            <span>
              <span className="line-through decoration-white/40">{d.player ?? 'Gol'}</span>
              <span className="ml-1.5 rounded border border-white/15 px-1 py-px text-[10px] font-semibold tracking-wider text-white/55 no-underline">
                VAR
              </span>
            </span>
          </li>
        ))}
        {goals.length === 0 && disallowed.length === 0 && <li className="text-white/40">Gol yok</li>}
      </ul>
    </div>
  );
}

export function Scoreboard({ data, competition, date }: { data: MatchData; competition: string; date: string }) {
  const goals = goalsOf(data);
  const home = goals.filter((g) => g.team === 'home').length;
  const away = goals.length - home;
  const { home: h, away: a } = data.teams;

  return (
    <header
      className={`fade-up rounded-3xl border border-white/[0.12] bg-[#0a1530]/65 bg-linear-to-b from-white/[0.07] to-white/[0.02] ${glassShadow}`}
    >
      <h1 className="sr-only">
        {h.name} {home}–{away} {a.name}
      </h1>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55 sm:px-7">
        <span>{competition}</span>
        <span>
          {date} · {data.venue}
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4 px-5 py-7 sm:gap-10 sm:px-7 sm:py-9 max-sm:grid-cols-2 max-sm:gap-y-6">
        <TeamColumn data={data} side="home" />
        <div className="grid justify-items-center gap-2 max-sm:order-first max-sm:col-span-2">
          <p aria-hidden="true" className={`${display.className} flex items-center gap-3 text-7xl font-bold leading-none tabular-nums text-white sm:text-8xl`}>
            {home}
            <span className="h-1 w-5 rounded-full bg-white/35 sm:w-7" />
            {away}
          </p>
          <p className="rounded-full bg-white/[0.08] px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-white/60">MAÇ SONU</p>
        </div>
        <TeamColumn data={data} side="away" />
      </div>
    </header>
  );
}
