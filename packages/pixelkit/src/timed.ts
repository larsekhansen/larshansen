import { TILE } from "./config";
import { R } from "./paint";
import { PALETTE, SHIMMER } from "./palette";
import type { Carrier } from "./physics";
import { STONE_LEDGE, ledge, type LedgeLook } from "./props";

// Ledges on a beat: there for a while, a one-second warning, then gone for a while. While they are
// there (warning included) they hold him like any one-way ledge. The warning is the maze's sliding
// wall shimmer: a two-pixel outline that blinks every eight steps.

export interface Beat {
  /** Steps it is there, then warns, then is gone. */
  on: number;
  warn: number;
  off: number;
  /** Steps added to the clock, so ledges on the same beat can take turns. */
  offset?: number;
}

export type TimedPhase = "on" | "warn" | "off";

export function timedPhase(step: number, b: Beat): TimedPhase {
  const period = b.on + b.warn + b.off;
  const t = (((step + (b.offset ?? 0)) % period) + period) % period;
  return t < b.on ? "on" : t < b.on + b.warn ? "warn" : "off";
}

/**
 * Something mostly quiet that comes on for a while after a warning: a gust of wind, a spark. The
 * same beat as a ledge's, the other way round: at rest, a warning (a second, so he can see it
 * coming), then live.
 */
export interface Pulse {
  rest: number;
  warn: number;
  live: number;
  offset?: number;
}

export type PulsePhase = "rest" | "warn" | "live";

/** Where a pulse is at a step: its rest is a ledge's "on", its warning the same, and live is "off". */
export function pulsePhase(step: number, p: Pulse): PulsePhase {
  const phase = timedPhase(step, { on: p.rest, warn: p.warn, off: p.live, offset: p.offset });
  return phase === "on" ? "rest" : phase === "warn" ? "warn" : "live";
}

/** Steps since a pulse's phase began, and how long that phase lasts: for drawing a warning that grows. */
export function pulseAge(step: number, p: Pulse): { age: number; of: number } {
  const period = p.rest + p.warn + p.live;
  const t = (((step + (p.offset ?? 0)) % period) + period) % period;
  if (t < p.rest) return { age: t, of: p.rest };
  if (t < p.rest + p.warn) return { age: t - p.rest, of: p.warn };
  return { age: t - p.rest - p.warn, of: p.live };
}

/** A timed ledge in the world: its top left and width (whole tiles), and its beat. */
export interface TimedLedge extends Beat {
  x: number;
  y: number;
  w: number;
}

/** The timed ledges there at this step, as carriers that do not move, for `stepBody`. */
export function timedCarriers(ledges: readonly TimedLedge[], step: number): Carrier[] {
  return ledges.filter((l) => timedPhase(step, l) !== "off").map((l) => ({ x: l.x, y: l.y, w: l.w, dx: 0, dy: 0 }));
}

/** The ledge while it is there, blinking its outline while it warns; nothing while it is gone. */
export function drawTimed(l: TimedLedge, step: number, snow: boolean, look: LedgeLook = STONE_LEDGE) {
  const phase = timedPhase(step, l);
  // The iron brackets it sits on stay, so the eye knows where it comes back.
  for (const bx of [l.x + 1, l.x + l.w - 4]) {
    R(bx, l.y + 5, 3, 1, PALETTE.ironDark);
    R(bx + 1, l.y + 6, 1, 2, PALETTE.ironDark);
  }
  if (phase === "off") return;
  const n = Math.max(1, Math.round(l.w / TILE));
  for (let i = 0; i < n; i++) ledge(l.x + i * TILE, l.y, look, i === 0, i === n - 1, snow);
  if (phase === "warn" && Math.floor(step / 8) % 2 === 0) {
    // The maze's warning, on a box two pixels round the ledge (which is five high with its edge).
    const x = l.x - 2;
    const y = l.y - 2;
    const w = l.w + 4;
    const h = 5 + 4;
    R(x, y, w, 2, SHIMMER);
    R(x, y + h - 2, w, 2, SHIMMER);
    R(x, y, 2, h, SHIMMER);
    R(x + w - 2, y, 2, h, SHIMMER);
  }
}
