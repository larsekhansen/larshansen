import { TILE } from "@larshansen/pixelkit/config";
import { carrierAt } from "@larshansen/pixelkit/carrier";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { carrier, jump, jumpTo, leap, mid, on, sit, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { untilThrow } from "../../game/enemies";
import type { Play } from "../../game/play";
import { BELLS, CLOCK, FERRY, FERRY_QUAYS, HANDS, LIFT, SWING, SWING_ENDS } from "../radhuset";
import { rides, riding } from "./common";

// Rådhuset's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules and the front page's single jump: the pigeon, up the three low bells onto the terminal's roof
// for the cheese, onto the gull that throws, a sit on the deck's bench, the ferry, the e-scooter, the
// bells over the fountain's pool, the second thrower, the lift up the west tower, through it, the bench
// on the middle roof, the carillon, the swinging bell back across, more bells, the clock's hand up and
// over, the balcony, the parapet, the rune.

/** A bell that is there now and will be for a good while yet: on, not about to warn. */
const steady = (q: Play, i: number) => on(q, i) && timedPhase(q.t + 50, BELLS[i]) === "on";

/** From the bell (or ground) he stands on to bell i, the way `dir` points: wait for it, then a jump steered onto its middle. */
const toBell = (i: number, from: number): Move[] => [
  walk(from),
  wait(`bell ${i}`, (q) => steady(q, i)),
  jumpTo(BELLS[i].x + BELLS[i].w / 2)
];

/** Onto a gull that throws, just after it has thrown, with nothing in the air. */
const stompThrower = (i: number): Move[] => [wait(`gull ${i} has thrown`, (q) => untilThrow(q.enemies[i], q.t) > 120 && q.shots.length === 0), stomp(i)];

/** A tip of the clock's hand at the bottom of its round, about to come up the left side. */
const tipAtBottom = (q: Play) => HANDS.some((d) => carrierAt(d, q.t).y >= CLOCK.cy + CLOCK.r - 1);

export const RADHUSET_ROUTE: Move[] = [
  walk(tile(7)),
  stomp(0),
  walk(mid(16)),
  wait("bell 0", (q) => steady(q, 0)),
  jump(0),
  ...toBell(1, tile(18) - 6),
  ...toBell(2, tile(22) - 6),
  walk(tile(26) - 6),
  jumpTo(mid(29)),
  walk(tile(34) + 10),
  ...stompThrower(1),
  walk(tile(48)),
  stomp(2),
  walk(tile(58) + 4),
  jump(1, { release: 12 }),
  walk(mid(60)),
  sit(),
  walk(tile(75) + 8),
  wait("the ferry at the quay", (q) => carrier(q, FERRY).x <= FERRY_QUAYS.from + 2),
  jump(1, { release: 10 }),
  wait("the ferry across", (q) => carrier(q, FERRY).x >= FERRY_QUAYS.to - 2),
  walk(tile(97)),
  stomp(4),
  walk(tile(107)),
  stomp(5),
  walk(tile(121) - 2),
  wait("pool bell 0", (q) => steady(q, 3)),
  jump(1, { release: 6 }),
  ...toBell(4, tile(123) - 6),
  ...toBell(5, tile(126) - 6),
  // Off the last bell onto the square: the pool ends under it.
  walk(tile(133)),
  stomp(6),
  // Out of the second gull's reach while it throws, then onto it.
  walk(tile(138)),
  ...stompThrower(7),
  walk(LIFT.x - 10),
  wait("the lift at the bottom", (q) => carrier(q, LIFT).y >= LIFT.bottom),
  walk(LIFT.x + 24),
  wait("the lift at the top", (q) => carrier(q, LIFT).y <= LIFT.top),
  walk(mid(180)),
  sit(),
  walk(mid(182)),
  // Up the first four bells in step with the swinging bell, so it comes back for him as he reaches the fourth.
  // (The swing goes round in the bells' own five seconds, so it is always in step with them.)
  wait("the first bell of the carillon, in step with the swing", (q) => steady(q, 6)),
  jump(0),
  ...toBell(7, tile(184) - 6),
  ...toBell(8, tile(187) - 6),
  // The ninth bell and the swinging bell come together: onto the bell as the swing comes back this way.
  wait("bell 9 there, the swinging bell coming back", (q) => steady(q, 9) && carrierAt(SWING, q.t + 40).x >= SWING_ENDS.right - 1),
  jumpTo(BELLS[9].x + TILE),
  walk(tile(193) - 6),
  wait("the swinging bell at this end", (q) => carrier(q, SWING).x >= SWING_ENDS.right - 1 && carrierAt(SWING, q.t + 20).x >= SWING_ENDS.right - 1),
  jumpTo(SWING_ENDS.right + TILE),
  wait("the swinging bell at the far end, the next bell there", (q) => !riding(q) || (carrier(q, SWING).x <= SWING_ENDS.left + 2 && steady(q, 10))),
  jumpTo(BELLS[10].x + TILE),
  ...toBell(11, tile(178) - 6),
  ...toBell(12, tile(181) - 6),
  ...toBell(13, tile(184) - 6),
  ...toBell(14, tile(187) - 6),
  ...toBell(15, tile(190) - 6),
  walk(tile(195)),
  wait("a tip of the clock's hand at the bottom", tipAtBottom),
  leap(tile(197) - 1, 1),
  wait("the tip he rides at the top", (q) => !riding(q) || HANDS.some((d) => rides(d, q.t, q.body) && carrierAt(d, q.t).y <= CLOCK.cy - CLOCK.r + 3)),
  jump(0),
  walk(mid(202)),
  jump(0),
  walk(mid(203)),
  jump(0)
];
