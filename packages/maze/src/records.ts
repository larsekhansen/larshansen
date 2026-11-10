// What the maze remembers in the browser: the best time and the fewest curses per level
// (`maze.records`), and the highest level he has entered (`maze.reached`). Storage can be missing
// or refuse, so everything here falls back to "nothing remembered".

export const RECORDS_KEY = "maze.records";
export const REACHED_KEY = "maze.reached";

export interface Best {
  /** The best (shortest) time, in milliseconds. */
  ms: number;
  /** The fewest curses in a clear. Kept separately from the time. */
  deaths: number;
}

export type Records = Partial<Record<number, Best>>;

export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function browserStore(): Store | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadRecords(store: Store | null = browserStore()): Records {
  const out: Records = {};
  try {
    const raw = JSON.parse(store?.getItem(RECORDS_KEY) ?? "{}") as Record<string, Partial<Best>>;
    for (const [k, v] of Object.entries(raw ?? {})) {
      const level = Number(k);
      if (Number.isInteger(level) && level >= 1 && v && Number.isFinite(v.ms) && Number.isFinite(v.deaths)) out[level] = { ms: v.ms as number, deaths: v.deaths as number };
    }
  } catch {
    // nothing remembered
  }
  return out;
}

/** Records a clear: the time and the curses each keep their own best. Returns the new records. */
export function recordClear(level: number, ms: number, deaths: number, store: Store | null = browserStore()): Records {
  const all = loadRecords(store);
  const old = all[level];
  all[level] = old ? { ms: Math.min(old.ms, ms), deaths: Math.min(old.deaths, deaths) } : { ms, deaths };
  try {
    store?.setItem(RECORDS_KEY, JSON.stringify(all));
  } catch {
    // kept for this visit only
  }
  return all;
}

/** The highest level he has entered, 1 if none. */
export function loadReached(of: number, store: Store | null = browserStore()): number {
  try {
    const n = Math.round(Number(store?.getItem(REACHED_KEY)));
    return Number.isFinite(n) ? Math.max(1, Math.min(of, n)) : 1;
  } catch {
    return 1;
  }
}

export function saveReached(level: number, store: Store | null = browserStore()) {
  try {
    store?.setItem(REACHED_KEY, String(level));
  } catch {
    // kept for this visit only
  }
}
