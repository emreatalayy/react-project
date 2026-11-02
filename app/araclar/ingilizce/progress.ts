// Learner progress, kept in this browser's localStorage and read through useSyncExternalStore.
import { newStickers, type SessionFacts, type Sticker } from './stickers';

const STORAGE_KEY = 'ingilizce-ilerleme-v1';

/** Sessions to finish each day */
export const DAILY_GOAL = 2;

export const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🐰', '🐨', '🦁', '🐙'];

export type Progress = {
  /** How many times each path stop was finished */
  completed: Record<string, number>;
  /** Best stars (1–3) each path stop was finished with */
  stars: Record<string, number>;
  streak: number;
  /** Local date (YYYY-MM-DD) of the last finished session */
  lastDay: string | null;
  /** Sessions finished on lastDay */
  daySessions: number;
  /** Local dates with a finished session, the last two weeks */
  days: string[];
  /** Words, sentences and blanks answered wrong and not yet answered right at first try, oldest first */
  mistakes: string[];
  stickers: string[];
  name: string;
  avatar: string;
  /** The welcome with name and avatar has been shown */
  welcomed: boolean;
  muted: boolean;
  /** Speaking exercises, where the browser can recognise speech */
  speaking: boolean;
};

export type DayMark = { label: string; done: boolean; today: boolean; future: boolean };

/** What the page reads: stored progress plus derived values; `loaded` is false while server rendering */
export type ProgressView = Progress & { loaded: boolean; totalStars: number; week: DayMark[] };

export type StreakResult = { streak: number; extended: boolean; week: DayMark[] };

export type SessionReward = { streak: StreakResult; stickers: Sticker[] };

const EMPTY: Progress = {
  completed: {},
  stars: {},
  streak: 0,
  lastDay: null,
  daySessions: 0,
  days: [],
  mistakes: [],
  stickers: [],
  name: '',
  avatar: AVATARS[0],
  welcomed: false,
  muted: false,
  speaking: true,
};

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const MAX_MISTAKES = 50;

const SERVER_VIEW: ProgressView = {
  ...EMPTY,
  loaded: false,
  totalStars: 0,
  week: WEEKDAYS.map((label) => ({ label, done: false, today: false, future: false })),
};

function dayKey(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function today() {
  return dayKey(new Date());
}

function yesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayKey(date);
}

// Monday to Sunday of the current week
function weekMarks(days: string[]): DayMark[] {
  const now = new Date();
  const todayKey = dayKey(now);
  const monday = now.getDate() - ((now.getDay() + 6) % 7);
  return WEEKDAYS.map((label, i) => {
    const key = dayKey(new Date(now.getFullYear(), now.getMonth(), monday + i));
    return { label, done: days.includes(key), today: key === todayKey, future: key > todayKey };
  });
}

// Completed stops saved before stars existed count as one star
function totalStars(progress: Progress) {
  return Object.keys(progress.completed).reduce((sum, id) => sum + Math.max(progress.stars[id] ?? 1, 1), 0);
}

// A streak lives until the end of the day after the last session; the daily count starts from zero each day
function settle(progress: Progress): Progress {
  if (progress.lastDay === today()) return progress;
  return { ...progress, daySessions: 0, streak: progress.lastDay === yesterday() ? progress.streak : 0 };
}

let stored: Progress | null = null;
let view: ProgressView | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      // Fields from older versions (xp, dayXp) are dropped
      const parsed = JSON.parse(saved) as Partial<Progress>;
      const known = Object.fromEntries(Object.entries(parsed).filter(([key]) => key in EMPTY));
      return settle({ ...EMPTY, ...known });
    }
  } catch {
    // Storage blocked or unreadable: start fresh
  }
  return EMPTY;
}

function getStored() {
  stored ??= read();
  return stored;
}

function save(next: Progress) {
  stored = next;
  view = null;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Progress still lasts until the page is closed
  }
  listeners.forEach((listener) => listener());
}

export function getProgress(): ProgressView {
  const progress = getStored();
  view ??= { ...progress, loaded: true, totalStars: totalStars(progress), week: weekMarks(progress.days) };
  return view;
}

export function getServerProgress() {
  return SERVER_VIEW;
}

export function subscribeProgress(listener: () => void) {
  listeners.add(listener);
  // Another tab finished a session
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    stored = null;
    view = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Saves a finished session and hands out the stickers it earned */
export function recordSession(session: Pick<SessionFacts, 'kind' | 'nodeId' | 'stars' | 'spoke'>): SessionReward {
  const progress = settle(getStored());
  const day = today();
  const extended = progress.lastDay !== day;
  const { nodeId } = session;
  const next: Progress = {
    ...progress,
    daySessions: progress.daySessions + 1,
    streak: extended ? progress.streak + 1 : progress.streak,
    lastDay: day,
    days: extended ? [...progress.days, day].slice(-14) : progress.days,
    completed: nodeId ? { ...progress.completed, [nodeId]: (progress.completed[nodeId] ?? 0) + 1 } : progress.completed,
    stars: nodeId ? { ...progress.stars, [nodeId]: Math.max(progress.stars[nodeId] ?? 0, session.stars) } : progress.stars,
  };
  const stickers = newStickers(next.stickers, { ...session, streak: next.streak, totalStars: totalStars(next) });
  save({ ...next, stickers: [...next.stickers, ...stickers.map((sticker) => sticker.id)] });
  return { streak: { streak: next.streak, extended, week: weekMarks(next.days) }, stickers };
}

export function noteMistake(key: string) {
  const progress = getStored();
  save({ ...progress, mistakes: [...progress.mistakes.filter((k) => k !== key), key].slice(-MAX_MISTAKES) });
}

export function clearMistake(key: string) {
  const progress = getStored();
  if (progress.mistakes.includes(key)) save({ ...progress, mistakes: progress.mistakes.filter((k) => k !== key) });
}

export function setProfile(name: string, avatar: string) {
  save({ ...getStored(), name: name.trim().slice(0, 20), avatar, welcomed: true });
}

export function setMuted(muted: boolean) {
  save({ ...getStored(), muted });
}

export function setSpeaking(speaking: boolean) {
  save({ ...getStored(), speaking });
}

/** Clears the learning progress; the name, avatar and settings stay */
export function resetProgress() {
  const { name, avatar, welcomed, muted, speaking } = getStored();
  save({ ...EMPTY, name, avatar, welcomed, muted, speaking });
}
