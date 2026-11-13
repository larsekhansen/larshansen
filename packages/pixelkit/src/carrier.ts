import { TILE } from "./config";
import type { Body, Carrier } from "./physics";
import { WOOD_LEDGE, ledge, type LedgeLook } from "./props";

// Moving ground: a one-way ledge whose place is a pure function of the step count, so it is where
// it should be however the scene got to that step (a reload, the harness, a respawn). He lands on it
// from above like any ledge, and `stepBody` carries him with it while he stands there.

interface Common {
  /** Width in art pixels; a whole number of tiles, so it is drawn from whole ledge tiles. */
  w: number;
  /** Steps added to the clock, so two carriers on the same path can be out of step. */
  offset?: number;
}

/** Bobs up and down by `rise` pixels either side of (x, y), like a raft on a swell. */
export interface Bob extends Common {
  kind: "bob";
  x: number;
  y: number;
  rise: number;
  period: number;
}

/** Travels from one point to another and back, easing at each end. */
export interface Travel extends Common {
  kind: "travel";
  from: { x: number; y: number };
  to: { x: number; y: number };
  period: number;
}

/** A lift in a shaft: waits at the bottom, rises at `speed` pixels a step, waits at the top, comes down. */
export interface Lift extends Common {
  kind: "lift";
  x: number;
  top: number;
  bottom: number;
  speed: number;
  wait: number;
}

export type CarrierDef = Bob | Travel | Lift;

/** Steps in one round of a lift: up, wait, down, wait. */
export function liftPeriod(d: Lift) {
  return 2 * (Math.ceil((d.bottom - d.top) / d.speed) + d.wait);
}

/** The top left of the carrier at a step, in whole pixels so he never stands between two. */
export function carrierAt(d: CarrierDef, step: number): { x: number; y: number } {
  const t = step + (d.offset ?? 0);
  if (d.kind === "bob") return { x: d.x, y: d.y + Math.round(d.rise * Math.sin((2 * Math.PI * t) / d.period)) };
  if (d.kind === "travel") {
    const k = (1 - Math.cos((2 * Math.PI * t) / d.period)) / 2;
    return { x: Math.round(d.from.x + (d.to.x - d.from.x) * k), y: Math.round(d.from.y + (d.to.y - d.from.y) * k) };
  }
  const travel = Math.ceil((d.bottom - d.top) / d.speed);
  const p = ((t % liftPeriod(d)) + liftPeriod(d)) % liftPeriod(d);
  let y: number;
  if (p < d.wait) y = d.bottom;
  else if (p < d.wait + travel) y = d.bottom - (p - d.wait) * d.speed;
  else if (p < 2 * d.wait + travel) y = d.top;
  else y = d.top + (p - 2 * d.wait - travel) * d.speed;
  return { x: d.x, y: Math.round(Math.max(d.top, Math.min(d.bottom, y))) };
}

/** The carrier at a step as the physics takes it: where it is, and how far it moved in this step. */
export function carrierState(d: CarrierDef, step: number): Carrier {
  const now = carrierAt(d, step);
  const before = carrierAt(d, step - 1);
  return { x: now.x, y: now.y, w: d.w, dx: now.x - before.x, dy: now.y - before.y };
}

/** The carriers within `reach` of the body at a step: the ones worth passing to `stepBody`. */
export function carriersNear(defs: readonly CarrierDef[], step: number, b: Body, reach = 4 * TILE): Carrier[] {
  return defs.map((d) => carrierState(d, step)).filter((c) => c.x - reach < b.x && b.x < c.x + c.w + reach && Math.abs(c.y - b.y) < reach);
}

/**
 * Draws a carrier as plank ledge tiles, between its places at the last two steps by `alpha`, as the
 * person is drawn, so he stays on it on screen too.
 */
export function drawCarrier(d: CarrierDef, step: number, alpha: number, snow: boolean, look: LedgeLook = WOOD_LEDGE) {
  const a = carrierAt(d, step - 1);
  const b = carrierAt(d, step);
  const x = a.x + (b.x - a.x) * alpha;
  const y = a.y + (b.y - a.y) * alpha;
  const n = Math.max(1, Math.round(d.w / TILE));
  for (let i = 0; i < n; i++) ledge(x + i * TILE, y, look, i === 0, i === n - 1, snow);
}
