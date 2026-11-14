import { TILE, PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown } from "@larshansen/pixelkit/carrier";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { carrier, cx, jump, jumpTo, leap, mid, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { BALLOONS, BANNERS, GUARD } from "../slottet";
import { onOne, riding } from "./common";

// Slottet's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules and the front page's single jump: over the pond on a banner, the first dig on the
// balloon sellers' crates, up by
// the drum to the school's banner over the second dig, over the manhole, the Guard to the
// terrace, up the front to the balcony and the rune.

/** A bunch of balloons that is there now (or in `from` steps) and will be for `for` steps more. */
const steady = (q: Play, i: number, length: number, from = 0) => timedPhase(q.t + from, BALLOONS[i]) === "on" && timedPhase(q.t + from + length, BALLOONS[i]) === "on";

export const SLOTTET_ROUTE: Move[] = [
  walk(tile(50)),
  wait("a banner over the pond", (q) => onOne(q, BANNERS.B, 25 * TILE - 40) || riding(q)),
  jump(0),
  wait("across the pond", (q) => cx(q) >= tile(60) || (!riding(q) && q.body.onGround)),
  // The balloon sellers over the first dig: onto one bunch's crate, the other's, and off.
  walk(tile(95) - 6),
  wait("the first bunch, and the next coming", (q) => steady(q, 0, 40) && steady(q, 1, 20, 40)),
  jumpTo(BALLOONS[0].x + 11),
  wait("the second bunch", (q) => steady(q, 1, 40)),
  jumpTo(BALLOONS[1].x + 11),
  wait("the third bunch", (q) => steady(q, 2, 40)),
  jumpTo(BALLOONS[2].x + 11),
  jumpTo(tile(103)),
  walk(tile(107) + 8),
  wait("the school's banner coming", (q) => BANNERS.D.some((d) => carrierShown(d, q.t) && carrierAt(d, q.t).y === 23 * TILE - 86 && carrierAt(d, q.t).x > tile(106) - 4 && carrierAt(d, q.t).x < tile(107))),
  walk(tile(109) + 8, { careless: true }),
  wait("on the school's banner", (q) => riding(q) && q.body.y + PLAYER.h < 22 * TILE),
  wait("across the second dig", (q) => cx(q) >= tile(122) || !riding(q)),
  walk(tile(131)),
  leap(tile(133), 1),
  walk(tile(198)),
  wait("the Guard at this end", (q) => carrier(q, GUARD).x <= GUARD.from.x + 2),
  walk(tile(200) + 4),
  jump(0),
  wait("the Guard at the far end", (q) => carrier(q, GUARD).x >= GUARD.to.x - 2),
  jump(1),
  walk(tile(220) + 8),
  jump(1, { release: 20 }),
  walk(tile(225) + 6),
  jump(1, { release: 16 }),
  walk(mid(229)),
  jump(0)
];

