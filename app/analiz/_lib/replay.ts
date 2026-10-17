// Replay engine: exact outcome distributions for "replay the match from minute m".
// - "real": every remaining real shot is a coin flip weighted by its xG (same chances, new luck).
// - "pace": remaining goals are Poisson, at the rate the match showed up to minute m
//   (pre-match market rates updated with the xG produced so far). It never looks ahead.

export type Side = 'home' | 'away';
export type Lens = 'real' | 'pace';

export type Shot = {
  /** Continuous match clock: first-half stoppage time shifts the second half to the right */
  el: number;
  minute: number;
  extra: number;
  team: Side;
  player: string;
  short: string;
  xg: number;
  outcome: 'goal' | 'saved' | 'missed' | 'blocked';
};

export type Team = { name: string; short: string; color: string; formation: string | null };

export type MatchData = {
  id: string;
  kickoff: string;
  competition: string;
  venue: string;
  attendance: number | null;
  teams: Record<Side, Team>;
  firstHalfAdded: number;
  end: number;
  market: { p: number[]; rates: Record<Side, number> };
  shots: Shot[];
  disallowed: { el: number; minute: number; team: Side; player: string | null }[];
  model: { nShots: number };
};

export type WhatIf = {
  id: string;
  label: string;
  /** add: a goal that did not count now counts; goal/miss: force the outcome of a real shot */
  kind: 'add' | 'goal' | 'miss';
  team: Side;
  minute: number;
};

export type Toggles = Record<string, boolean>;

export type Outcome = {
  W: number;
  D: number;
  L: number;
  scores: { h: number; a: number; p: number }[];
  h0: number;
  a0: number;
};

/** Weight of the pre-match expectation, in minutes of play */
const PRIOR_MINUTES = 95;

function poissonBinomial(ps: number[]) {
  let dist = [1];
  for (const p of ps) {
    const next = new Array(dist.length + 1).fill(0);
    dist.forEach((q, k) => {
      next[k] += q * (1 - p);
      next[k + 1] += q * p;
    });
    dist = next;
  }
  return dist;
}

function poisson(mu: number, max = 14) {
  const dist: number[] = [];
  let p = Math.exp(-mu);
  for (let k = 0; k <= max; k++) {
    dist.push(p);
    p *= mu / (k + 1);
  }
  return dist;
}

export function scenario(data: MatchData, whatifs: WhatIf[], m: number, lens: Lens, on: Toggles = {}): Outcome {
  const active = whatifs.filter((w) => on[w.id]);
  const score = { home: 0, away: 0 };
  const extra = { home: 0, away: 0 };
  const remaining: Record<Side, number[]> = { home: [], away: [] };
  const xgSoFar = { home: 0, away: 0 };

  for (const shot of data.shots) {
    const forced = active.find((w) => w.kind !== 'add' && w.team === shot.team && w.minute === shot.minute);
    const isGoal = forced ? forced.kind === 'goal' : shot.outcome === 'goal';
    if (shot.el < m) {
      if (isGoal) score[shot.team]++;
      xgSoFar[shot.team] += shot.xg;
    } else if (lens === 'real') {
      remaining[shot.team].push(forced ? (forced.kind === 'goal' ? 1 : 0) : shot.xg);
    } else if (forced?.kind === 'goal') {
      extra[shot.team]++;
    }
  }
  for (const w of active) {
    if (w.kind !== 'add') continue;
    const el = data.disallowed.find((d) => d.team === w.team && d.minute === w.minute)?.el ?? w.minute;
    if (el < m) score[w.team]++;
    else extra[w.team]++;
  }

  let home: number[];
  let away: number[];
  if (lens === 'real') {
    home = poissonBinomial(remaining.home);
    away = poissonBinomial(remaining.away);
  } else {
    const left = Math.max(0, data.end - m);
    const rate = (side: Side) => ((data.market.rates[side] / 95) * PRIOR_MINUTES + xgSoFar[side]) / (PRIOR_MINUTES + m);
    home = poisson(rate('home') * left);
    away = poisson(rate('away') * left);
  }

  const h0 = score.home + extra.home;
  const a0 = score.away + extra.away;
  let W = 0;
  let D = 0;
  let L = 0;
  const scores: Outcome['scores'] = [];
  home.forEach((ph, i) =>
    away.forEach((pa, j) => {
      const p = ph * pa;
      if (p < 1e-9) return;
      const h = h0 + i;
      const a = a0 + j;
      if (h > a) W += p;
      else if (h === a) D += p;
      else L += p;
      scores.push({ h, a, p });
    }),
  );
  scores.sort((x, y) => y.p - x.p);
  return { W, D, L, scores, h0: score.home, a0: score.away };
}

/** Largest-remainder rounding of win/draw/loss to 100 replays */
export function per100(r: Pick<Outcome, 'W' | 'D' | 'L'>): [number, number, number] {
  const raw = [r.W, r.D, r.L].map((p) => p * 100);
  const base = raw.map(Math.floor) as [number, number, number];
  let left = 100 - base.reduce((a, b) => a + b, 0);
  raw
    .map((v, i) => [v - base[i], i] as const)
    .sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => {
      if (left > 0) {
        base[i]++;
        left--;
      }
    });
  return base;
}

/** Clock label for a point on the continuous clock */
export function clock(el: number, firstHalfAdded: number) {
  if (el <= 45) return `${Math.floor(el)}'`;
  if (el < 45 + firstHalfAdded) return `45+${Math.round(el - 45)}'`;
  if (el <= 90 + firstHalfAdded) return `${Math.floor(el - firstHalfAdded)}'`;
  return `90+${Math.round(el - 90 - firstHalfAdded)}'`;
}

export const minuteLabel = (shot: Pick<Shot, 'minute' | 'extra'>) =>
  shot.extra ? `${shot.minute}+${shot.extra}'` : `${shot.minute}'`;

export type WinPoint = { m: number; W: number; D: number; L: number; h0: number; a0: number };

/** Win probability every quarter minute, from the pace lens (what was knowable at that moment) */
export function winProbability(data: MatchData, whatifs: WhatIf[], on: Toggles = {}, from = 0): WinPoint[] {
  const points: WinPoint[] = [];
  for (let m = from; m <= data.end; m += 0.25) {
    const r = scenario(data, whatifs, m === data.end ? m : m + 0.001, 'pace', on);
    points.push({ m, W: r.W, D: r.D, L: r.L, h0: r.h0, a0: r.a0 });
  }
  return points;
}

export const goalsOf = (data: MatchData) => data.shots.filter((s) => s.outcome === 'goal');

export function scoreAfter(data: MatchData, goal: Shot) {
  const score = { home: 0, away: 0 };
  for (const g of goalsOf(data)) {
    score[g.team]++;
    if (g === goal) break;
  }
  return `${score.home}–${score.away}`;
}
