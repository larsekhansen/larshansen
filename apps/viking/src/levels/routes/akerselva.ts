import { TILE } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { cx, jump, leap, mid, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { BUCKETS, LOGS_BJOLSEN, LOGS_POOL, POOL, T1, WHEEL } from "../akerselva";
import { riding, rides } from "./common";

// Akerselva's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules, the front page's single jump and the ski pole: over the footbridge, the dash over the
// dry mill race, the logs at Bjølsen, the jump over the first fall, the wheel at Hjula, the dash
// through the curtain, Aamodt bru, the jump off the last fall onto a log, the last pool, the rune.

/** A log of the list that has come up and sits with its left end between x0 and x1. */
const logAt = (q: Play, list: CarrierDef[], y: number, x0: number, x1: number) =>
  list.some((d) => carrierShown(d, q.t) && carrierAt(d, q.t).y === y && carrierAt(d, q.t).x >= x0 && carrierAt(d, q.t).x <= x1);
/** The log he rides, if any. */
const ridden = (q: Play, list: CarrierDef[]) => list.find((d) => rides(d, q.t, q.body));
const LOG1 = T1 * TILE - 3;
const LOGP = POOL * TILE - 3;

/**
 * Onto a log from where he stands: waits for one with its left end between x0 and x1, then jumps
 * and steers to come down on its middle, as a person would. Done once he stands on it.
 */
const ontoLog = (name: string, list: CarrierDef[], y: number, x0: number, x1: number): Move[] => [
  wait(name, (q) => logAt(q, list, y, x0, x1)),
  {
    name: `${name}: on`,
    keys(q, s) {
      if (s.air && q.body.onGround) return "done";
      if (!q.body.onGround) s.air = true;
      // The log that came up in the window, not the one still lying against the rock at the far end.
      if (s.i === 0) s.log = list.findIndex((l) => carrierShown(l, q.t) && carrierAt(l, q.t).x >= x0 && carrierAt(l, q.t).x <= x1);
      const d = list[s.log as number] ?? list.filter((l) => carrierShown(l, q.t)).sort((a, b2) => Math.abs(carrierAt(a, q.t).x - cx(q)) - Math.abs(carrierAt(b2, q.t).x - cx(q)))[0];
      const aim = d ? carrierAt(d, q.t).x + d.w / 2 + 6 - (cx(q) + q.body.vx * 6) : 0;
      const dir = Math.abs(aim) > 2 ? Math.sign(aim) : 0;
      return { left: dir < 0, right: dir > 0, jumpHeld: s.i < 30, jumpPressed: s.i === 0 };
    }
  }
];
/** Rides the log he is on until its left end reaches x, then jumps on. */
const rideTo = (name: string, list: CarrierDef[], x: number): Move => wait(name, (q) => {
  const d = ridden(q, list);
  return !d || carrierAt(d, q.t).x >= x;
});

const A = LOGS_BJOLSEN.slice(0, 2);
const B = LOGS_BJOLSEN.slice(2, 4);
const C = LOGS_BJOLSEN.slice(4, 6);
const [P1, P2, P3, P4, P5] = [0, 2, 4, 6, 8].map((i) => LOGS_POOL.slice(i, i + 2));

export const AKERSELVA_ROUTE: Move[] = [
  walk(tile(30)),
  leap(tile(35), 1, { dash: 12 }),
  walk(tile(60) + 2),
  // Bjølsen: three stretches of logs between rocks.
  ...ontoLog("a log at the bank", A, LOG1, 61 * TILE, 61 * TILE + 6),
  rideTo("across the first stretch", A, 64 * TILE),
  jump(1, { release: 12 }),
  walk(tile(67) + 6),
  ...ontoLog("a log by the first rock", B, LOG1, 68 * TILE, 68 * TILE + 6),
  rideTo("across the second stretch", B, 72 * TILE),
  jump(1, { release: 12 }),
  walk(mid(74)),
  ...ontoLog("a log by the second rock", C, LOG1, 75 * TILE, 75 * TILE + 6),
  rideTo("across the third stretch", C, 78 * TILE),
  jump(1, { release: 14 }),
  walk(tile(88)),
  leap(tile(89), 1),
  // Hjula: on a bucket at the bottom of the wheel, off at the top onto the bridge over the tailrace.
  walk(WHEEL.cx + 20),
  wait("a bucket scoops him up", (q) => riding(q)),
  wait("the bucket near the top", (q) => {
    const d = ridden(q, BUCKETS);
    return !!d && carrierAt(d, q.t).y <= WHEEL.cy - WHEEL.r + 3;
  }),
  jump(1, { release: 40 }),
  walk(tile(126)),
  // The curtain: a jump and the dash through the falling water.
  walk(tile(141) + 4),
  leap(tile(142), 1, { dash: 8 }),
  walk(tile(193) + 8),
  // The last fall: a jump over its top onto a log coming out from under it.
  wait("a log out from under the falls", (q) => logAt(q, P1, LOGP, 196 * TILE + 2, 196 * TILE + 6)),
  leap(tile(194), 1),
  // The last pool: log, rock, log, rock, and a dash off the end of the third stretch.
  rideTo("under the falls to the first rock", P1, 202 * TILE),
  jump(1, { release: 12 }),
  walk(mid(204)),
  ...ontoLog("a log past the first rock", P2, LOGP, 205 * TILE, 205 * TILE + 6),
  rideTo("to the big rock", P2, 212 * TILE),
  jump(1, { release: 14 }),
  walk(tile(215) + 10),
  ...ontoLog("a log past the big rock", P3, LOGP, 216 * TILE, 216 * TILE + 6),
  rideTo("to where the logs go under", P3, 220 * TILE - 6),
  leap((q) => {
    const d = ridden(q, P3);
    return d ? carrierAt(d, q.t).x + d.w - 1 : cx(q);
  }, 1, { dash: 12 }),
  walk(mid(226)),
  ...ontoLog("a log past the small rock", P4, LOGP, 227 * TILE, 227 * TILE + 6),
  rideTo("to the last rock", P4, 230 * TILE),
  jump(1, { release: 12 }),
  walk(mid(232)),
  ...ontoLog("the last log", P5, LOGP, 233 * TILE, 233 * TILE + 6),
  rideTo("to the far bank", P5, 237 * TILE),
  jump(1, { release: 20 }),
  walk(tile(241) + 8),
  jump(1, { release: 10 }),
  walk(tile(243) + 8),
  jump(1, { release: 10 }),
  walk(mid(245)),
  jump(0)
];
