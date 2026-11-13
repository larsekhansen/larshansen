// What a visitor has done across the levels, kept in localStorage["viking.progress"] as JSON: the
// levels cleared, the best time per level, and the levels whose gold bracteate he found. Pure
// functions, and forgiving: missing, old or broken data reads as a fresh start, never as an error.

export const PROGRESS_KEY = "viking.progress";

export interface Progress {
  /** Level ids, in the order they were first cleared. */
  cleared: string[];
  /** Best time per level id, in milliseconds. */
  best: Record<string, number>;
  /** Level ids whose bracteate he has found. */
  bracteates: string[];
}

export const fresh = (): Progress => ({ cleared: [], best: {}, bracteates: [] });

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
  const best: Record<string, number> = {};
  if (o.best && typeof o.best === "object" && !Array.isArray(o.best))
    for (const [k, v] of Object.entries(o.best as Record<string, unknown>)) if (typeof v === "number" && Number.isFinite(v) && v > 0) best[k] = v;
  return { cleared: ids(o.cleared), best, bracteates: ids(o.bracteates) };
}

export const writeProgress = (p: Progress): string => JSON.stringify(p);

/** A level cleared in `ms`, with or without its bracteate. Returns the new progress and whether the time is a new best. */
export function clearLevel(p: Progress, id: string, ms: number, bracteate: boolean): { progress: Progress; newBest: boolean } {
  const old = p.best[id];
  const newBest = old === undefined || ms < old;
  return {
    progress: {
      cleared: p.cleared.includes(id) ? p.cleared : [...p.cleared, id],
      best: newBest ? { ...p.best, [id]: ms } : p.best,
      bracteates: bracteate && !p.bracteates.includes(id) ? [...p.bracteates, id] : p.bracteates
    },
    newBest
  };
}

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

/** True once anything at all has been done: then the map is home, not the first level. */
export const hasProgress = (p: Progress) => p.cleared.length > 0 || p.bracteates.length > 0;
