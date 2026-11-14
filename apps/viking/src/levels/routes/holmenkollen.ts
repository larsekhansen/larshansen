import { carrierAt } from "@larshansen/pixelkit/carrier";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cannonRide, carrier, cx, hop, jump, leap, stomp, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { CHAIRS, ENEMIES as HK_ENEMIES, KIDS_LIP, LIFT, LIP, SLABS } from "../holmenkollen";
import { rides } from "./common";

// Holmenkollen's scripted route: along the icy path, down the icy steps, the snow cannon, the
// chairlift, the slabs, the kids' jump, the tower's lift, the inrun and the jump at the lip.

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

