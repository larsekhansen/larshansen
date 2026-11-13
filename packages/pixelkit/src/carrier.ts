import { PLAYER, TILE } from "./config";
import { R } from "./paint";
import { PALETTE } from "./palette";
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
  /** A bob on top of the path: up and down by `rise` pixels over `period` steps (a raft that also drifts). */
  bob?: { rise: number; period: number };
  /** Solid from below too, this thick: a heavy platform he bumps his head on. */
  under?: number;
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
  const at = pathAt(d, step);
  if (!d.bob) return at;
  const t = step + (d.offset ?? 0);
  return { x: at.x, y: at.y + Math.round(d.bob.rise * Math.sin((2 * Math.PI * t) / d.bob.period)) };
}

function pathAt(d: CarrierDef, step: number): { x: number; y: number } {
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
  return { x: now.x, y: now.y, w: d.w, dx: now.x - before.x, dy: now.y - before.y, under: d.under };
}

/** The carriers within `reach` of the body at a step: the ones worth passing to `stepBody`. */
export function carriersNear(defs: readonly CarrierDef[], step: number, b: Body, reach = 4 * TILE): Carrier[] {
  return defs.map((d) => carrierState(d, step)).filter((c) => c.x - reach < b.x && b.x < c.x + c.w + reach && Math.abs(c.y - b.y) < reach);
}

/** Where a carrier is drawn between its last two steps, by `alpha`: blended, then whole pixels. */
export function carrierDrawn(d: CarrierDef, step: number, alpha: number): { x: number; y: number; fx: number } {
  const a = carrierAt(d, step - 1);
  const b = carrierAt(d, step);
  const fx = a.x + (b.x - a.x) * alpha;
  return { x: Math.round(fx), y: Math.round(a.y + (b.y - a.y) * alpha), fx };
}

/** True when the body stands on the carrier as it is at this step. */
export function rides(d: CarrierDef, step: number, b: Body): boolean {
  const c = carrierAt(d, step);
  return b.onGround && Math.abs(b.y + PLAYER.h - c.y) < 0.01 && b.x + PLAYER.w > c.x && b.x < c.x + d.w;
}

/**
 * The person is drawn between steps, and so is the carrier, but the carrier lands on whole pixels.
 * When he rides it, his drawn place takes the same rounding, so he and the ground under him move
 * as one: feet on its drawn top, and its whole-pixel steps sideways. Moves `shown`; true if he rides.
 */
export function rideShown(defs: readonly CarrierDef[], step: number, alpha: number, body: Body, shown: { x: number; y: number }): boolean {
  for (const d of defs) {
    if (!rides(d, step, body)) continue;
    const at = carrierDrawn(d, step, alpha);
    shown.x -= at.fx - at.x;
    shown.y = at.y - PLAYER.h;
    return true;
  }
  return false;
}

/**
 * The plain carrier: a raft of planks on two dark cross-beams, as a ledge he can stand on. Scenes
 * with something better to show (a ferry, a lift) draw their own and use `carrierDrawn` for where.
 */
export function drawCarrier(d: CarrierDef, step: number, alpha: number, snow: boolean, look: LedgeLook = WOOD_LEDGE) {
  const { x, y } = carrierDrawn(d, step, alpha);
  const n = Math.max(1, Math.round(d.w / TILE));
  R(x + 3, y + 5, 3, 3, PALETTE.woodDark);
  R(x + d.w - 6, y + 5, 3, 3, PALETTE.woodDark);
  R(x + 2, y + 5, d.w - 4, 1, PALETTE.woodDark);
  for (let i = 0; i < n; i++) ledge(x + i * TILE, y, look, i === 0, i === n - 1, snow);
}
