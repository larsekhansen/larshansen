import { carrierDrawn, carrierShown, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { R, view } from "@larshansen/pixelkit/paint";
import { ENEMY, STAND } from "@larshansen/pixelkit/palette";
import type { LedgeLook } from "@larshansen/pixelkit/props";
import { pulsePhase, timedPhase } from "@larshansen/pixelkit/timed";
import type { Hazard } from "@larshansen/pixelkit/hazard";
import type { Play } from "../game/play";

// What he stands on reads at a glance (order 18, section 5, ADR 0039; order 22, ADR 0044): its top edge is painted
// yellow, two pixels thick and a little worn at the ends, the same on every ledge, raft, lift, deck and stone: the
// paint players know means "you can go here". What moves has black diagonal marks in the paint (a chevron wants
// three rows; in two they are the stripes of moving machinery); what gives way (sinks, falls, goes on a beat) has
// its paint broken in dashes. The level's main ground and walls keep their own surfaces.

/** Every one-way ledge: a teal body, the paint two pixels thick and worn at its ends, a dark line under it. */
export const STAND_LEDGE: LedgeLook = { body: STAND.body, top: STAND.top, edge: STAND.under, joint: STAND.bodyDark, topH: 2, worn: STAND.worn };

export type Footing = "holds" | "moves" | "gives";
/** A standing place's top, for the page to mark: w wide, its top at (x, y). */
export interface Standing {
  x: number;
  y: number;
  w: number;
  how: Footing;
  /** About to give way (order 19): it trembles first. */
  soon?: boolean;
}

/** What is about to give way trembles: a pixel to and fro every other step; with reduced motion it keeps still. */
export const shiver = (t: number) => (view.reduced ? 0 : (t >> 1) % 2 ? 1 : -1);

/** The paint's two rows, w wide from (x, y), worn at an end that is one: its outer top pixel the worn shade. */
function paint(x: number, y: number, w: number, first = true, last = true) {
  R(x, y, w, 2, STAND.top);
  if (w < 4) return;
  if (first) R(x, y, 1, 1, STAND.worn);
  if (last) R(x + w - 1, y, 1, 1, STAND.worn);
}

/**
 * The top edge of something he can stand on, w wide from (x, y), as it holds, moves or gives way. About to give
 * way (`soon`), the caller moves it by `shiver`; with reduced motion its dashes join instead, a still sign. About
 * to set off (`soon` on what moves, order 19), its marks march along it (with reduced motion they are doubled).
 * `t`: the step, for the marks' march.
 */
export function standTop(x: number, y: number, w: number, how: Footing, soon = false, t = 0) {
  if (x + w < view.camX - 2 || x > view.camX + view.w + 2) return;
  if (how === "gives") {
    for (let k = 0; k < w; k += 6) R(x + k, y, Math.min(soon && view.reduced ? 6 : 4, w - k), 2, STAND.top);
    return;
  }
  paint(x, y, w);
  if (how !== "moves") return;
  // Black marks in the paint, a pixel each row, leaning: every six pixels; about to set off, they march.
  const step = soon && view.reduced ? 3 : 6;
  const shift = soon && !view.reduced ? (t >> 2) % 6 : 0;
  for (let k = 2 + shift; k < w - 2; k += step) {
    R(x + k + 1, y, 1, 1, STAND.mark);
    R(x + k, y + 1, 1, 1, STAND.mark);
  }
}

/** A tile he stands on that a level draws its own way (a risen stone, a crate): its paint, worn where its row of them ends. */
export const tileTop = (x: number, y: number, first = true, last = true) => paint(x, y, TILE, first, last);

/**
 * What hurts and is not an enemy (rebar, the third rail, a branch, the barrier, sparks): the enemy
 * palette's warning colour on its dangerous edge, the same stripe everywhere, while it hurts (blinking
 * through its warning, steady with reduced motion). Drawn over the level's own drawing of it. (Here since
 * order 31, so `render/reduced.test.ts` can draw it.)
 */
export function hazardEdge(h: Hazard, t: number) {
  const phase = h.beat ? pulsePhase(t, h.beat) : "live";
  if (phase === "rest" || (phase === "warn" && !view.reduced && Math.floor(t / 8) % 2)) return;
  const x0 = Math.max(h.x, view.camX - 4);
  const x1 = Math.min(h.x + h.w, view.camX + view.w + 4);
  if (x1 <= x0) return;
  R(x0, h.y, x1 - x0, 1, ENEMY.warning);
  for (let x = h.x + 2; x < x1; x += 4) if (x + 2 > x0) R(x, h.y, 2, 1, ENEMY.line);
}

/**
 * The tops of what he can stand on that the level draws its own way (order 18): rafts, lifts, logs, hooks
 * and the like move; ledges on a beat, sinking pads and the like give way; a statue he watches holds. Drawn
 * over the level's own drawing of each; `alpha` how far the clock is towards the next step; `leaving`, a lift or
 * a train about to set off (its stripe flashes: `render/feel.ts`). The page's, here since order 33 so the
 * reduced-motion test can draw it as the page does after dusk (`render/dusk.ts`).
 */
export function standing(p: Play, alpha: number, leaving?: (d: CarrierDef, t: number) => boolean) {
  p.def.carriers.forEach((d) => {
    if (!carrierShown(d, p.t)) return;
    const at = carrierDrawn(d, p.t, alpha);
    standTop(at.x, at.y, d.w, "moves", leaving?.(d, p.t), p.t);
  });
  for (const l of p.def.timed) {
    const phase = timedPhase(p.t, l);
    if (phase !== "off") standTop(l.x + (phase === "warn" ? shiver(p.t) : 0), l.y, l.w, "gives", phase === "warn");
  }
  if (p.grounds) for (const s of p.def.grounds?.stands?.(p.grounds.state, p.t) ?? []) standTop(s.x + (s.soon ? shiver(p.t) : 0), s.y, s.w, s.how, s.soon, p.t);
  for (const c of p.def.rules?.ground?.(p) ?? []) standTop(c.x, c.y, c.w, "holds");
}
