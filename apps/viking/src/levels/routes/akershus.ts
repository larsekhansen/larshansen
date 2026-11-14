import { cannonRide, carrier, jump, jumpTo, leap, mid, sit, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { HOIST } from "../akershus";

// Akershus's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules and the front page's single jump: the guard on the quay, over the crates, up the outer wall,
// over the brazier, the first cannon onto the gate tower, along the wall-walk under the crow and onto
// two guards, down into the ward, the bench, the cannon up out of it, a guard between two gaps, over
// the brazier, the cannon over the ditch, up the turret, the moat when the hoist is down, the saluting battery's three cannons in a
// row, over the gap, the bench, over the brazier, the keep and its guard, up inside, along the
// battlements past the crow, the guard and the brazier, to the rune by the spire.

export const AKERSHUS_ROUTE: Move[] = [
  walk(tile(19) + 6),
  stomp(0),
  walk(mid(28) + 4),
  jump(0),
  jump(0),
  jump(0),
  jump(0),
  jump(1, { hold: 20 }),
  walk(mid(40)),
  cannonRide(1),
  walk(tile(61) - 4),
  leap(tile(62), 1),
  // The crow over this stretch flies over his head: it guards the skilling up there, not the walk.
  walk(tile(68) + 4, { careless: true }),
  leap(tile(69), 1),
  walk(tile(73)),
  stomp(3),
  stomp(4),
  walk(tile(85) + 4),
  walk(mid(88)),
  sit(),
  walk(mid(89)),
  cannonRide(1),
  walk(tile(104) + 4),
  leap(tile(105), 1),
  stomp(6),
  walk(tile(112) + 4),
  leap(tile(113), 1),
  walk(mid(120) + 12),
  cannonRide(1),
  walk(mid(138)),
  jump(0),
  jump(0),
  jump(1, { release: 20 }),
  walk(mid(141) + 6),
  wait("the hoist down", (q) => carrier(q, HOIST).y >= HOIST.bottom - 2),
  cannonRide(1),
  cannonRide(1),
  walk(tile(196)),
  stomp(9),
  walk(tile(202) + 6),
  leap(tile(203), 1),
  walk(tile(207) + 8),
  jump(1, { release: 12 }),
  walk(mid(209)),
  walk(tile(217) + 4),
  stomp(11),
  ...[0, 1, 2, 3, 4, 5, 6].flatMap((k): Move[] =>
    k === 0
      ? [walk(mid(225)), jump(0)]
      : k % 2
        ? [walk(tile(224) + 4), jumpTo(mid(221))]
        : [walk(tile(223) - 4), jumpTo(mid(225))]
  ),
  jump(0),
  stomp(12),
  walk(tile(232)),
  stomp(13),
  walk(mid(235), { careless: true }),
  walk(mid(241)),
  jumpTo(mid(244)),
  walk(mid(247)),
  walk(mid(253)),
  jumpTo(mid(256)),
  walk(tile(257)),
  leap(tile(258) + 4, 1),
  walk(mid(265)),
  jump(0)
];
