import { PLAYER, STEP_MS, TILE } from "@larshansen/pixelkit/config";
import type { Body } from "@larshansen/pixelkit/physics";

// The run: ten runes against a clock. All pure, so it can be tested without a browser.
// The clock counts physics steps, not wall time, so it plays the same on every screen.

export const RUNES_IN_RUN = 10;
const ALL = (1 << RUNES_IN_RUN) - 1;

export interface Run {
  /** Bit i is set once rune i has been collected. */
  mask: number;
  steps: number;
  /** idle until the first step he takes, running until the tenth rune, then done. */
  state: "idle" | "running" | "done";
}

export const newRun = (): Run => ({ mask: 0, steps: 0, state: "idle" });

/** He moved: the clock starts, the first time only. */
export function begin(run: Run) {
  if (run.state === "idle") run.state = "running";
}

/** One physics step has passed. */
export function tick(run: Run) {
  if (run.state === "running") run.steps++;
}

/** Collects rune `i`. Reports whether it was new, and whether it was the last one. */
export function collect(run: Run, i: number): { fresh: boolean; finished: boolean } {
  const bit = 1 << i;
  if (run.state === "done" || run.mask & bit) return { fresh: false, finished: false };
  begin(run); // a rune picked up before a step was taken (placed by ?x=) still starts the clock
  run.mask |= bit;
  const finished = run.mask === ALL;
  if (finished) run.state = "done";
  return { fresh: true, finished };
}

export const countOf = (run: Run) => [...Array(RUNES_IN_RUN).keys()].filter((i) => run.mask & (1 << i)).length;
export const elapsedMs = (run: Run) => run.steps * STEP_MS;

/** 0:00.0, as in a header clock. */
export function formatTime(ms: number): string {
  const tenths = Math.floor(ms / 100);
  const m = Math.floor(tenths / 600);
  const s = Math.floor((tenths % 600) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${tenths % 10}`;
}

/** Compares a finished time with the best so far (null when there is none). */
export function judge(best: number | null, ms: number): { best: number; isNew: boolean } {
  const isNew = best === null || ms < best;
  return { best: isNew ? ms : (best as number), isNew };
}

/** The runes the body overlaps and has not collected, by index. Each rune is a 16 x 16 tile. */
export function touched(b: Body, runes: { index: number; x: number; y: number }[], mask: number): number[] {
  return runes.filter((r) => !(mask & (1 << r.index)) && b.x < r.x + TILE && b.x + PLAYER.w > r.x && b.y < r.y + TILE && b.y + PLAYER.h > r.y).map((r) => r.index);
}
