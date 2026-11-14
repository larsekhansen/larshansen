import { PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown, pathClock, stopAt } from "@larshansen/pixelkit/carrier";
import { cx, jump, leap, mid, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { leap as rise } from "../../game/enemies";
import type { Play } from "../../game/play";
import { EXPRESSES, HIGH, LOCALS } from "../stortinget";
import { riding, rides } from "./common";

// Stortinget's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules, the front page's single jump and the ski pole: the pigeon, the ticket gates, down the
// escalators (the second against him), the trolley, over the open track when the rat is down, the rat
// on the platform while the board counts down, the local's roof through the tunnel until the beam
// sweeps him off, the scooter, the umbrellas on the walkway, the wide track with the dash, the local
// again from the end of platform 2, the express overhead in the cavern, and the rune past the gate.

/** The rat in the track is down, and its gravel is still: time to go over. */
const ratDown = (i: number) => (q: Play) => {
  const l = rise(q.enemies[i], q.t);
  return l.up === 0 && !l.ripple;
};
/** A local stands at its stop (0: platform 1, 1: the end of platform 2), with at least `left` steps before it goes. */
const stands = (stop: number, left = 90) => (q: Play) =>
  LOCALS.some((d) => {
    const s = stopAt(d, stop);
    const k = pathClock(d, q.t);
    return k >= s.from && k < s.from + s.steps - left;
  });
/** He stands on a local's roof. */
const onLocal = (q: Play) => LOCALS.some((d) => rides(d, q.t, q.body));
/** An express's roof is over him, far enough ahead that it is still over him when he comes down on it. */
const expressOver = (q: Play) =>
  EXPRESSES.some((d) => carrierShown(d, q.t) && carrierAt(d, q.t).y === HIGH && cx(q) - carrierAt(d, q.t).x >= 48 && cx(q) - carrierAt(d, q.t).x <= 112);

export const STORTINGET_ROUTE: Move[] = [
  stomp(0),
  walk(tile(17) - 8),
  leap(tile(17) - 1, 1, { release: 20 }),
  walk(tile(20) - 8),
  leap(tile(20) - 1, 1, { release: 20 }),
  stomp(2),
  walk(tile(44) + 4),
  stomp(3),
  walk(tile(60) + 8),
  // The high way while the board counts down: the kiosk's roof, the board's top.
  walk(tile(66) + 4),
  jump(1, { release: 14 }),
  walk(tile(71) + 8),
  jump(1, { release: 30 }),
  walk(tile(77) + 6),
  jump(1, { release: 8 }),
  walk(tile(78) - 2),
  wait("the rat in the track is down", ratDown(4)),
  leap(tile(79) - 2, 1),
  stomp(5),
  walk(tile(90)),
  wait("a local stands at platform 1", stands(0)),
  jump(0, { hold: 30 }),
  wait("through the tunnel, until the beam sweeps him off", (q) => q.body.onGround && !onLocal(q) && cx(q) < tile(131)),
  stomp(6),
  walk(tile(152) - 4),
  wait("the rat in the wide track is down", ratDown(8)),
  leap(tile(153) - 2, 1, { dash: 12 }),
  // Up by the bench's plinth to the cable tray, and down onto the train's roof from there.
  walk(tile(159) + 6),
  jump(1, { release: 14 }),
  walk(tile(162) + 10),
  jump(1, { release: 16 }),
  walk(tile(167) + 6),
  wait("a local stands at the end of platform 2", stands(1, 60)),
  walk(tile(170)),
  wait("on the local's roof", (q) => onLocal(q)),
  walk(tile(171)),
  wait("the express comes over him", expressOver),
  jump(1, { hold: 30 }),
  wait("on the express, to platform 3", (q) => riding(q) && q.body.y + PLAYER.h === HIGH && carrierAt(EXPRESSES[0], q.t).x >= 0 && cx(q) > tile(229) && EXPRESSES.some((d) => rides(d, q.t, q.body) && carrierAt(d, q.t).x === tile(228))),
  walk(tile(236) + 8, { careless: true }),
  leap(tile(237) - 1, 1, { release: 14 }),
  stomp(9),
  walk(tile(246) + 8),
  jump(1, { release: 14 }),
  walk(tile(251) + 8),
  walk(tile(257) - 2, { careless: true }),
  wait("the rat in the siding is down", ratDown(10)),
  leap(tile(258) - 2, 1),
  walk(tile(262) + 8),
  jump(1, { release: 12 }),
  walk(tile(266) + 8),
  jump(1, { release: 12 }),
  walk(mid(267) + 2),
  jump(1, { release: 14 }),
  walk(mid(270))
];
