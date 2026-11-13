import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { carrierAt, carrierShown, rides, type CarrierDef } from "@larshansen/pixelkit/carrier";
import { cannonRide, carrier, cx, hop, jump, leap, mid, stomp, tile, wait, walk, type Move } from "../game/bot";
import type { Play } from "../game/play";
import { BANNERS, GUARD } from "./slottet";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { CHAIRS, ENEMIES as HK_ENEMIES, KIDS_LIP, LIFT, LIP, SLABS } from "./holmenkollen";

/** Which enemy of Holmenkollen starts in column c. */
const ENEMY_AT = (c: number) => HK_ENEMIES.findIndex((e) => e.c === c);

/** Onto an inrun (walking until `onto`), and the jump four steps before its lip. Done when he lands. */
function lipJump(lip: number, onto: number): Move["keys"] {
  return (q, s) => {
    if (s.air && q.body.onGround && s.pressed !== undefined) return "done";
    if (!q.body.onGround) s.air = true;
    const press = cx(q) >= lip - 16 && s.pressed === undefined;
    if (press) s.pressed = q.t;
    const held = s.pressed !== undefined && q.t - (s.pressed as number) < 40;
    return { left: false, right: cx(q) < onto, jumpHeld: held || press, jumpPressed: press };
  };
}

/** A slab that is there, and will be for a good while yet. */
const slabSteady = (p: Play, k: number) => timedPhase(p.t, SLABS[k]) === "on" && timedPhase(p.t + 70, SLABS[k]) === "on";

// The scripted routes through levels 4 and 5, played by the tests with the real rules and the
// front page's single jump: each must clear its level without a fall or a heart lost, raising
// every flag, and take at least a minute.

/** A carrier over him, at its riding height, wide enough under him to land on from a jump straight up. */
const over = (p: Play, d: CarrierDef, y: number) => {
  if (!carrierShown(d, p.t)) return false;
  const at = carrierAt(d, p.t);
  return at.y === y && at.x + 4 <= p.body.x && at.x + d.w - 4 >= p.body.x + PLAYER.w + 12;
};
const onOne = (p: Play, ds: CarrierDef[], y: number) => ds.some((d) => over(p, d, y));
/** Riding: standing on ground that is not the map's. */
const riding = (p: Play) => p.body.onGround && !p.map.supports(p.body);

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

export const HOLMENKOLLEN_ROUTE: Move[] = [
  walk(tile(30) + 2),
  leap(tile(31), 1),
  walk(tile(95) + 8),
  stomp(ENEMY_AT(98)),
  walk(tile(98) + 8),
  leap(tile(100), 1),
  walk(tile(115)),
  cannonRide(1),
  walk(tile(137) + 6),
  wait("a chair at this end", (q) => CHAIRS.some((d) => carrierAt(d, q.t).x <= d.from.x + 1)),
  jump(1, { release: 30 }),
  wait("across on the chair", (q) => CHAIRS.some((d) => carrierAt(d, q.t).x >= d.to.x - 1 && rides(d, q.t, q.body))),
  walk(tile(157) + 4),
  ...[0, 1, 2, 3].flatMap((k): Move[] => [
    wait(`slab ${k}`, (q) => slabSteady(q, k) && (k === 3 || timedPhase(q.t + 40, SLABS[k + 1]) === "on")),
    ...(k === 0 ? [walk(SLABS[0].x + 24)] : [hop(1), walk(SLABS[k].x + 24)])
  ]),
  hop(1),
  walk(tile(175)),
  { name: "down the kids' jump, and a jump at its lip", keys: lipJump(KIDS_LIP.x, tile(177)) },
  walk(tile(204) + 4),
  wait("the lift at the bottom", (q) => carrier(q, LIFT).y >= LIFT.bottom),
  walk(tile(206)),
  wait("the lift at the top", (q) => carrier(q, LIFT).y <= LIFT.top),
  walk(tile(212)),
  { name: "down the inrun, and the jump at the lip", keys: lipJump(LIP.x, tile(214)) }
];
