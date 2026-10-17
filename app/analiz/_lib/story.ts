import type { Lens, MatchData, Outcome, Side, Toggles, WhatIf } from './replay';

export type Visual =
  | { type: 'bar'; outcome: Pick<Outcome, 'W' | 'D' | 'L'> }
  | { type: 'waffle'; counts: [number, number, number] }
  | { type: 'chips'; items: string[]; side: Side };

export type KeyNumber = { value: string; unit?: string; text: string; visual: Visual };

/** Text drawn inside the win-probability chart at a point on the continuous clock; y is a probability (0 bottom, 1 top) */
export type Annotation = { x: number; y: number; text: string; anchor?: 'start' | 'end'; muted?: boolean };

export type StoryApi = {
  data: MatchData;
  at: (m: number, lens: Lens, on?: Toggles) => Outcome;
  per100: (r: Outcome) => [number, number, number];
  xgFrom: (side: Side, from: number) => number;
};

export type ReplayCard = {
  m: number;
  on?: Toggles;
  chip: string;
  title: string;
  whatif?: boolean;
  /** Shown in place of the score for cards that do not start from a real moment */
  hideScore?: boolean;
  text: (ctx: { n: [number, number, number]; real: Outcome; pace: Outcome; api: StoryApi }) => string;
};

export type MatchStory = {
  slug: string;
  data: MatchData;
  /** Turkish labels for the scoreboard */
  competition: string;
  date: string;
  /** Used on the list page and in metadata */
  headline: string;
  summary: string;
  deck: [before: string, highlight: string, after: string];
  numbers: (api: StoryApi) => KeyNumber[];
  winProbability: {
    title: string;
    lede: string;
    text: (api: StoryApi) => string;
    annotations: (api: StoryApi) => Annotation[];
    /** Shaded stretch of the match worth pointing at, on the continuous clock */
    highlight?: { from: number; to: number; label: string };
    /** What-if drawn as a line over the chart (home win probability), from the moment it would have happened */
    counterfactual?: { id: string; legend: string; tooltip: string; until?: number };
  };
  replay: { title: string; lede: string; cards: ReplayCard[] };
  simulator: { title: string; presets: { m: number; label: string }[] };
  whatifs: WhatIf[];
  sourceUrl: string;
};
