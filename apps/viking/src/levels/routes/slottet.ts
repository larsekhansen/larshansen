import { TILE, PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown } from "@larshansen/pixelkit/carrier";
import { carrier, cx, jump, leap, mid, tile, wait, walk, type Move } from "../../game/bot";
import { BANNERS, GUARD } from "../slottet";
import { onOne, riding } from "./common";

// Slottet's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules and the front page's single jump: over the pond and the first dig on banners, up by
// the drum to the school's banner over the second dig, over the manhole, the Guard to the
// terrace, up the front to the balcony and the rune.

export const SLOTTET_ROUTE: Move[] = [
  walk(tile(50)),
  wait("a banner over the pond", (q) => onOne(q, BANNERS.B, 25 * TILE - 40) || riding(q)),
  jump(0),
  wait("across the pond", (q) => cx(q) >= tile(60) || (!riding(q) && q.body.onGround)),
  walk(tile(91)),
  wait("a banner over the first dig", (q) => onOne(q, BANNERS.C, 23 * TILE - 40) || riding(q)),
  jump(0),
  wait("across the first dig", (q) => cx(q) >= tile(102) || (!riding(q) && q.body.onGround)),
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

