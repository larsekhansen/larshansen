import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "./config";
import { DECK_STEP, deckEverywhere, deckGround, deckPeriod, deckTilt, deckTops, type Deck } from "./deck";
import { oarBank } from "./oars";
import { SINK, padState, padY, padsEverywhere, padsGround, stepPads, type SinkPad } from "./sink";
import { createBody, stepBody, type Intent, type World } from "./physics";
import { timedPhase } from "./timed";

const idle: Intent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
/** Open air over water: nothing to stand on but what is given. */
const air: World = { width: 60 * TILE, isSolid: () => false, isOneWay: () => false, rampAt: () => null };
const feet = (b: { y: number }) => b.y + PLAYER.h;

describe("a rocking deck", () => {
  const deck: Deck = { x: 10 * TILE, y: 10 * TILE, w: 8 * TILE, seg: 4, tilt: [-10, 10], hold: 60, move: 60 };

  test("it tilts on a beat between its two angles, in whole pixels; the ends move most, the middle not at all", () => {
    expect(deckTilt(deck, 0)).toBe(-10);
    expect(deckTilt(deck, 59)).toBe(-10);
    expect(deckTilt(deck, 150)).toBe(10);
    expect(deckTilt(deck, deckPeriod(deck))).toBe(-10);
    const left = new Set<number>();
    for (let t = 0; t < deckPeriod(deck); t++) {
      const tops = deckTops(deck, t);
      for (const y of tops) expect(Number.isInteger(y)).toBe(true);
      left.add(tops[0]);
      // Neighbouring ledges are never more than a step apart.
      for (let i = 1; i < tops.length; i++) expect(Math.abs(tops[i] - tops[i - 1])).toBeLessThanOrEqual(1);
    }
    expect(Math.max(...left) - Math.min(...left)).toBe(20);
    const mid = deckTops(deck, 0).length / 2;
    expect(Math.abs(deckTops(deck, 0)[mid] - deck.y)).toBeLessThanOrEqual(1);
  });

  test("standing on it he is carried up and down with it, and slides nowhere", () => {
    const b = createBody(deck.x + 6, deckTops(deck, 0)[0]);
    let lo = Infinity;
    let hi = -Infinity;
    for (let t = 1; t < 2 * deckPeriod(deck); t++) {
      stepBody(b, idle, air, undefined, { carriers: deckGround(deck, t, b) });
      expect(b.onGround).toBe(true);
      expect(feet(b)).toBe(deckTops(deck, t)[Math.floor((b.x + PLAYER.w / 2 - deck.x) / deck.seg)]);
      lo = Math.min(lo, feet(b));
      hi = Math.max(hi, feet(b));
    }
    expect(b.x + PLAYER.w / 2).toBe(deck.x + 6);
    expect(hi - lo).toBeGreaterThan(14);
  });

  test("he walks it from end to end and back, uphill and down, at either angle, and never falls through", () => {
    for (const t0 of [0, 150, 100]) {
      const b = createBody(deck.x + 6, deckTops(deck, t0)[0]);
      for (let t = t0 + 1; t < t0 + 600; t++) {
        const going = t - t0 < 300 ? { ...idle, right: b.x + PLAYER.w < deck.x + deck.w - 2 } : { ...idle, left: b.x > deck.x + 2 };
        stepBody(b, going, air, undefined, { carriers: deckGround(deck, t, b) });
        expect(b.onGround).toBe(true);
      }
    }
  });

  test("he lands on it from a jump, on the ledge under him, wherever it is in its rock", () => {
    for (const t0 of [0, 70, 150, 200]) {
      const b = createBody(deck.x + 40, deck.y - 40);
      b.onGround = false;
      let t = t0;
      for (let i = 0; i < 120 && !b.onGround; i++) stepBody(b, idle, air, undefined, { carriers: deckGround(deck, ++t, b) });
      expect(b.onGround).toBe(true);
      expect(feet(b)).toBe(deckTops(deck, t)[Math.floor((b.x + PLAYER.w / 2 - deck.x) / deck.seg)]);
    }
  });

  test("off its end he falls, as off any ledge", () => {
    const b = createBody(deck.x + deck.w + 20, deckTops(deck, 0).at(-1)!);
    expect(deckGround(deck, 1, b)).toEqual([]);
    stepBody(b, idle, air, undefined, { carriers: deckGround(deck, 1, b) });
    expect(b.onGround).toBe(false);
  });

  test("everywhere at once, for a search: every ledge at every height it takes", () => {
    const all = deckEverywhere(deck);
    const at0 = all.filter((c) => c.x === deck.x);
    expect(Math.max(...at0.map((c) => c.y)) - Math.min(...at0.map((c) => c.y))).toBe(20);
    expect(all.every((c) => c.w === deck.seg)).toBe(true);
    expect(DECK_STEP).toBeGreaterThanOrEqual(2);
  });
});

describe("a sinking pad", () => {
  const pad: SinkPad = { x: 10 * TILE, y: 10 * TILE, w: 2 * TILE };

  test("it stands firm 40 steps under him, then sinks over 30, taking him down with it", () => {
    const s = [padState()];
    const b = createBody(pad.x + 16, pad.y);
    const ys: number[] = [];
    for (let t = 1; t <= 120; t++) {
      stepBody(b, idle, air, undefined, { carriers: padsGround([pad], s, t) });
      stepPads([pad], s, t, b);
      ys.push(feet(b));
    }
    expect(ys.slice(0, SINK.firm - 1).every((y) => y === pad.y)).toBe(true);
    expect(s[0].sinkAt).toBe(SINK.firm);
    expect(padY(pad, s[0], SINK.firm + SINK.sink)).toBe(pad.y + SINK.depth);
    expect(Math.max(...ys)).toBe(pad.y + SINK.depth);
  });

  test("stepping off before it sinks, it forgets him; after, it comes back 90 steps after he left", () => {
    const s = [padState()];
    const on = createBody(pad.x + 16, pad.y);
    for (let t = 1; t <= 30; t++) stepPads([pad], s, t, on);
    const off = createBody(pad.x + 100, pad.y);
    stepPads([pad], s, 31, off);
    expect(s[0]).toEqual(padState());
    let t = 32;
    while (s[0].sinkAt === null) stepPads([pad], s, t++, on);
    expect(s[0].sinkAt).toBe(32 + SINK.firm - 1);
    const left = t + 5;
    stepPads([pad], s, left, off);
    expect(s[0].leftAt).toBe(left);
    expect(padY(pad, s[0], left + 40)).toBe(pad.y + SINK.depth);
    expect(padY(pad, s[0], left + SINK.back)).toBe(pad.y);
    for (let k = left + 1; k <= left + SINK.back; k++) stepPads([pad], s, k, off);
    expect(s[0]).toEqual(padState());
  });

  test("everywhere at once, for a search: every height it takes, as the logs are", () => {
    const all = padsEverywhere([pad]);
    expect(all.length).toBe(SINK.depth + 1);
    expect(Math.min(...all.map((c) => c.y))).toBe(pad.y);
    expect(Math.max(...all.map((c) => c.y))).toBe(pad.y + SINK.depth);
  });
});

describe("an oar bank", () => {
  const bank = oarBank({ x: 10 * TILE, y: 12 * TILE, n: 4, dx: TILE + 8, dy: -18, beat: { on: 120, warn: 60, off: 60 }, turn: 60, port: { x: 9 * TILE, y: 8 * TILE }, portDx: 20 });

  test("its oars step up the hull, each a stroke behind the one below, on one beat", () => {
    expect(bank.map((o) => o.y)).toEqual([12 * TILE, 12 * TILE - 18, 12 * TILE - 36, 12 * TILE - 54]);
    expect(bank.map((o) => o.x - bank[0].x)).toEqual([0, 24, 48, 72]);
    // Each oar is out when the one below it was out a stroke before.
    for (let t = 0; t < 600; t++) for (let k = 1; k < bank.length; k++) expect(timedPhase(t, bank[k])).toBe(timedPhase(t - 60, bank[k - 1]));
  });

  test("an oar and the one above it are both out for a while every round, so the stair can be climbed", () => {
    for (let k = 1; k < bank.length; k++) {
      let both = 0;
      for (let t = 0; t < 240; t++) if (timedPhase(t, bank[k - 1]) !== "off" && timedPhase(t, bank[k]) !== "off") both++;
      expect(both).toBeGreaterThanOrEqual(60);
    }
  });
});
