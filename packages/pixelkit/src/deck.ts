import { PLAYER } from "./config";
import { R, mix } from "./paint";
import type { Body, Carrier } from "./physics";
import { INK, PALETTE, WHITE } from "./palette";

// A rocking deck: a ship's deck that tilts on a beat between two angles. There are no slopes in the
// physics: it is a row of narrow ledges side by side, and as it rocks each rises or falls in turn, in
// steps of whole pixels, the ends most and the middle not at all. Standing on it he is carried up
// and down with the ledge under him, and slides nowhere; walking along it, he is carried up or down
// the pixel or two from one ledge to the next, as he would walk up a stair of very low steps.

export interface Deck {
  /** Its left end, its width (whole ledges) and the top of its ledges when it lies level. */
  x: number;
  y: number;
  w: number;
  /** How wide each of its narrow ledges is. */
  seg: number;
  /** How far its right end stands above level at its two angles, in pixels (below level when negative); its left end the same the other way. */
  tilt: [number, number];
  /** Steps it holds each angle, and steps it takes to rock from one to the other. */
  hold: number;
  move: number;
  /** Steps added to its clock, so two decks are out of step. */
  offset?: number;
}

/** How far a ledge may be from his feet and still be walked onto, up or down, as a step. */
export const DECK_STEP = 4;

export const deckPeriod = (d: Deck) => 2 * (d.hold + d.move);

const ease = (u: number) => u * u * (3 - 2 * u);

/** How far its right end is up at a step (its left end is as far down): the first angle, a rock over, the second, a rock back. */
export function deckTilt(d: Deck, step: number): number {
  const p = deckPeriod(d);
  const k = (((step + (d.offset ?? 0)) % p) + p) % p;
  const f = k < d.hold ? 0 : k < d.hold + d.move ? ease((k - d.hold) / d.move) : k < 2 * d.hold + d.move ? 1 : 1 - ease((k - 2 * d.hold - d.move) / d.move);
  return d.tilt[0] + (d.tilt[1] - d.tilt[0]) * f;
}

/** The number of ledges it is made of. */
export const deckLedges = (d: Deck) => Math.max(1, Math.round(d.w / d.seg));

/** The top of each ledge at a step, in whole pixels: the ends rise and fall most, the middle stays. */
export function deckTops(d: Deck, step: number): number[] {
  const n = deckLedges(d);
  const t = deckTilt(d, step);
  const mid = (n - 1) / 2;
  return Array.from({ length: n }, (_, i) => d.y - Math.round(mid > 0 ? (t * (i - mid)) / mid : 0));
}

/** The ledge he is over: the one under his middle, or (at an end) the nearest his body is over; -1 when he is not over it. */
export function deckUnder(d: Deck, b: Body): number {
  if (b.x + PLAYER.w <= d.x || b.x >= d.x + d.w) return -1;
  const n = deckLedges(d);
  return Math.max(0, Math.min(n - 1, Math.floor((b.x + PLAYER.w / 2 - d.x) / d.seg)));
}

/**
 * What the deck gives the physics this step: one ledge the width of the deck, at the height of the
 * ledge he is over. Standing on it (his feet within a step of that ledge a step ago), it carries him
 * to the ledge's height now; otherwise it moves only as that ledge moves, for him to land on.
 */
export function deckGround(d: Deck, step: number, b: Body): Carrier[] {
  const i = deckUnder(d, b);
  if (i < 0) return [];
  const now = deckTops(d, step)[i];
  const before = deckTops(d, step - 1)[i];
  const feet = b.y + PLAYER.h;
  const standing = b.onGround && Math.abs(feet - before) <= DECK_STEP;
  return [{ x: d.x, y: now, w: d.w, dx: 0, dy: standing ? now - feet : now - before }];
}

/** Every ledge at every height it takes, as still ground: for a search over where he can get to. */
export function deckEverywhere(d: Deck): Carrier[] {
  const out = new Map<string, Carrier>();
  for (let t = 0; t < deckPeriod(d); t++)
    deckTops(d, t).forEach((y, i) => {
      const x = d.x + i * d.seg;
      out.set(`${x},${y}`, { x, y, w: d.seg, dx: 0, dy: 0 });
    });
  return [...out.values()];
}

/** The deck's planks as they stand at a step: each ledge a plank's end, darker below, a seam between. The level draws the hull under it. */
export function drawDeck(d: Deck, step: number, plank: string = PALETTE.wood) {
  const tops = deckTops(d, step);
  const dark = mix(plank, INK, 0.35);
  tops.forEach((y, i) => {
    const x = d.x + i * d.seg;
    R(x, y, d.seg, 1, mix(plank, WHITE, 0.25));
    R(x, y + 1, d.seg, 3, plank);
    R(x, y + 4, d.seg, 1, dark);
    if (i % 4 === 0) R(x, y + 1, 1, 3, dark);
  });
}
