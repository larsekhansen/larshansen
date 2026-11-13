// What the maze remembers in the browser: the best time, the fewest curses and the marks per level
// (`maze.records`), the highest level he has entered (`maze.reached`), and the raven's feather
// (`viking.feather`, `viking.featherGold`, which the fjord reads). Storage can be missing or refuse,
// so everything here falls back to "nothing remembered".

export const RECORDS_KEY = "maze.records";
export const REACHED_KEY = "maze.reached";
export const FEATHER_KEY = "viking.feather";
export const FEATHER_GOLD_KEY = "viking.featherGold";

export interface Best {
  /** The best (shortest) time, in milliseconds. */
  ms: number;
  /** The fewest curses in a clear. Kept separately from the time. */
  deaths: number;
  /** Set once a clear came in under par, so the mark stays even if the par is ever changed. */
  par?: true;
}

/** A level's three marks: cleared, cleared without a curse, cleared under par. Each is earned on its own, in any clear. */
export type Marks = [cleared: boolean, clean: boolean, underPar: boolean];

/** The marks one clear earns: always cleared; clean with no curse; under par when the time is below `parMs`. */
export function marksFor(ms: number, deaths: number, parMs?: number): Marks {
  return [true, deaths === 0, parMs !== undefined && ms < parMs];
}

/**
 * The marks a level holds, from what is remembered. The best time and the fewest curses are each
 * the best of all clears, so "clean" and "under par" read from them are the marks of all clears
 * together; the stored `par` flag keeps the third one whatever the par becomes.
 */
export function marksOf(best: Best | undefined, parMs?: number): Marks {
  if (!best) return [false, false, false];
  const [, clean, under] = marksFor(best.ms, best.deaths, parMs);
  return [true, clean, under || best.par === true];
}

/** How many of the three marks are held. */
export const markCount = (m: Marks) => m.filter(Boolean).length;

export type Records = Partial<Record<number, Best>>;

export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The browser's localStorage, or null where there is none or it refuses. */
export function browserStore(): Store | null {
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
      if (!(Number.isInteger(level) && level >= 1 && v && Number.isFinite(v.ms) && Number.isFinite(v.deaths))) continue;
      const best: Best = { ms: v.ms as number, deaths: v.deaths as number };
      if (v.par === true) best.par = true;
      out[level] = best;
    }
  } catch {
    // nothing remembered
  }
  return out;
}

/**
 * Records a clear: the time and the curses each keep their own best, and a clear under par (`parMs`)
 * is remembered as such. Returns the new records.
 */
export function recordClear(level: number, ms: number, deaths: number, store: Store | null = browserStore(), parMs?: number): Records {
  const all = loadRecords(store);
  const old = all[level];
  const best: Best = old ? { ms: Math.min(old.ms, ms), deaths: Math.min(old.deaths, deaths) } : { ms, deaths };
  if (old?.par || marksFor(ms, deaths, parMs)[2]) best.par = true;
  all[level] = best;
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

// --- the raven's feather --------------------------------------------------------------------------

export type Feather = "plain" | "gold";

/** Which feather the browser already holds. */
export interface FeatherHeld {
  plain: boolean;
  gold: boolean;
}

export function loadFeather(store: Store | null = browserStore()): FeatherHeld {
  try {
    const gold = store?.getItem(FEATHER_GOLD_KEY) === "1";
    return { plain: gold || store?.getItem(FEATHER_KEY) === "1", gold };
  } catch {
    return { plain: false, gold: false };
  }
}

/** Keeps a feather won. The gold one is the plain one turned gold, so it sets both keys. */
export function saveFeather(kind: Feather, store: Store | null = browserStore()) {
  try {
    store?.setItem(FEATHER_KEY, "1");
    if (kind === "gold") store?.setItem(FEATHER_GOLD_KEY, "1");
  } catch {
    // kept for this visit only
  }
}

/** The level whose first clear gives the raven's feather. */
export const FEATHER_LEVEL = 3;

/**
 * What a clear newly wins; `records` already include this clear. Every level cleared and no gold
 * feather yet: the gold one. Level 3 cleared (or a later one, for a browser that got past level 3
 * before this rule) and no feather yet: the plain one. Otherwise nothing.
 */
export function featherWon(level: number, records: Records, held: FeatherHeld, levels: number): Feather | null {
  let all = true;
  for (let n = 1; n <= levels; n++) if (!records[n]) all = false;
  if (all && !held.gold) return "gold";
  if (level >= FEATHER_LEVEL && !held.plain) return "plain";
  return null;
}

/** The better of two feathers won in one visit: gold beats plain beats none. */
export const betterFeather = (a: Feather | null, b: Feather | null): Feather | null => (a === "gold" || b === "gold" ? "gold" : (a ?? b));
