import { PLAYER } from "./config";
import type { Body, Carrier } from "./physics";

// A sinking pad: something afloat that holds him for a little while and then goes under, as a bundle
// of balsa logs or a lily pad would. It stands firm for 40 steps under him, then sinks over 30 (he
// goes into the water with it, unless he has moved on), and comes back 90 steps after he leaves it.
// Stepping off before it starts to sink, it forgets him. Unlike the other moving ground it notices
// him, so it keeps a small state; the level steps it once a step, after he has moved.

export interface SinkPad {
  /** Its left end, its width, and its top while it floats. */
  x: number;
  y: number;
  w: number;
  /** How far it goes under. */
  depth?: number;
}

/** Steps it stands firm under him, steps it takes to go under, steps after he leaves until it is back; and how deep it goes. */
export const SINK = { firm: 40, sink: 30, back: 90, depth: 16 };

export interface PadState {
  /** Steps he has stood on it, before it began to sink. */
  on: number;
  /** The step it began to sink, or null. */
  sinkAt: number | null;
  /** The step he left it after it began to sink, or null. */
  leftAt: number | null;
}

export const padState = (): PadState => ({ on: 0, sinkAt: null, leftAt: null });

/** The top of the pad at a step: afloat, going under, under, coming back up over its last 20 steps away. */
export function padY(p: SinkPad, s: PadState, step: number): number {
  if (s.sinkAt === null) return p.y;
  const depth = p.depth ?? SINK.depth;
  const down = Math.min(1, Math.max(0, (step - s.sinkAt) / SINK.sink)) * depth;
  const up = s.leftAt === null ? 0 : Math.max(0, Math.min(1, (step - s.leftAt - (SINK.back - 20)) / 20));
  return Math.round(p.y + down * (1 - up));
}

/** The pads as the physics takes them this step: each where it is, and how far it moved in this step. */
export function padsGround(pads: readonly SinkPad[], states: readonly PadState[], step: number): Carrier[] {
  return pads.map((p, i) => {
    const y = padY(p, states[i], step);
    return { x: p.x, y, w: p.w, dx: 0, dy: y - padY(p, states[i], step - 1) };
  });
}

/** After his step: the pad he stands on counts him; one he has left starts its way back. */
export function stepPads(pads: readonly SinkPad[], states: PadState[], step: number, b: Body) {
  pads.forEach((p, i) => {
    const s = states[i];
    const on = b.onGround && Math.abs(b.y + PLAYER.h - padY(p, s, step)) < 0.01 && b.x + PLAYER.w > p.x && b.x < p.x + p.w;
    if (on) {
      s.leftAt = null;
      if (s.sinkAt === null && ++s.on >= SINK.firm) s.sinkAt = step;
      return;
    }
    if (s.sinkAt === null) s.on = 0;
    else if (s.leftAt === null) s.leftAt = step;
    else if (step - s.leftAt >= SINK.back) Object.assign(s, padState());
  });
}

/** Every height each pad takes, as still ground: for a search over where he can get to (as logs are, everywhere at once). */
export function padsEverywhere(pads: readonly SinkPad[]): Carrier[] {
  return pads.flatMap((p) => Array.from({ length: (p.depth ?? SINK.depth) + 1 }, (_, k) => ({ x: p.x, y: p.y + k, w: p.w, dx: 0, dy: 0 })));
}
