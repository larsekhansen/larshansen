// What a visitor has done across the levels, kept in localStorage["viking.progress"] as JSON: the
// levels cleared, the best time per level, the levels whose gold bracteate he found, the most
// skilling found in each, and the levels cleared without losing a heart. Pure functions, and
// forgiving: missing, old or broken data reads as a fresh start, never as an error, and what the
// first three levels saved before skilling and hearts existed still reads as it was.

export const PROGRESS_KEY = "viking.progress";

export interface Progress {
  /** Level ids, in the order they were first cleared. */
  cleared: string[];
  /** Best time per level id, in milliseconds. */
  best: Record<string, number>;
  /** Level ids whose bracteate he has found. */
  bracteates: string[];
  /** The most skilling found in one run of each level. */
  skilling: Record<string, number>;
  /** Level ids cleared at least once without losing a heart: a waffle mark on the station's board. */
  clean: string[];
}

export const fresh = (): Progress => ({ cleared: [], best: {}, bracteates: [], skilling: {}, clean: [] });

const ids = (v: unknown): string[] => (Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && x.length > 0))] : []);

/** Reads stored progress. Anything it cannot use is left out. */
export function readProgress(raw: string | null | undefined): Progress {
  if (!raw) return fresh();
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return fresh();
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return fresh();
  const o = data as Record<string, unknown>;
  const numbers = (v: unknown, ok: (n: number) => boolean) => {
    const out: Record<string, number> = {};
    if (v && typeof v === "object" && !Array.isArray(v))
      for (const [k, n] of Object.entries(v as Record<string, unknown>)) if (typeof n === "number" && Number.isFinite(n) && ok(n)) out[k] = n;
    return out;
  };
  return {
    cleared: ids(o.cleared),
    best: numbers(o.best, (n) => n > 0),
    bracteates: ids(o.bracteates),
    skilling: numbers(o.skilling, (n) => n >= 0 && Number.isInteger(n)),
    clean: ids(o.clean)
  };
}

export const writeProgress = (p: Progress): string => JSON.stringify(p);

/**
 * A level cleared in `ms`, with or without its bracteate, with `skilling` found and `clean` when no
 * heart was lost. Returns the new progress and whether the time is a new best.
 */
export function clearLevel(p: Progress, id: string, ms: number, bracteate: boolean, run: { skilling?: number; clean?: boolean } = {}): { progress: Progress; newBest: boolean } {
  const old = p.best[id];
  const newBest = old === undefined || ms < old;
  const found = run.skilling ?? 0;
  return {
    progress: {
      cleared: p.cleared.includes(id) ? p.cleared : [...p.cleared, id],
      best: newBest ? { ...p.best, [id]: ms } : p.best,
      bracteates: bracteate && !p.bracteates.includes(id) ? [...p.bracteates, id] : p.bracteates,
      skilling: found > (p.skilling[id] ?? 0) ? { ...p.skilling, [id]: found } : p.skilling,
      clean: run.clean && !p.clean.includes(id) ? [...p.clean, id] : p.clean
    },
    newBest
  };
}

/** The ski pole is the prize for clearing Holmenkollen. */
export const hasPole = (p: Progress) => p.cleared.includes("holmenkollen");

/** A bracteate found, kept even before the level is cleared. */
export function findBracteate(p: Progress, id: string): Progress {
  return p.bracteates.includes(id) ? p : { ...p, bracteates: [...p.bracteates, id] };
}

/** A station on the line is open when the level before it is cleared; the first always is. */
export function isOpen(p: Progress, order: readonly string[], index: number): boolean {
  if (index <= 0) return true;
  return p.cleared.includes(order[index - 1]);
}

/** The furthest open station among the built levels: where he is put on the map on arrival. */
export function furthestOpen(p: Progress, order: readonly string[], built: number): number {
  let i = 0;
  while (i + 1 < built && isOpen(p, order, i + 1)) i++;
  return i;
}

/** All ten runes: every level on the line cleared. Whatever else an old save holds does not count. */
export const allRunes = (p: Progress, order: readonly string[]) => order.length > 0 && order.every((id) => p.cleared.includes(id));

/** True once anything at all has been done: then the map is home, not the first level. */
export const hasProgress = (p: Progress) => p.cleared.length > 0 || p.bracteates.length > 0;
