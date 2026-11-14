import { carrierAt } from "@larshansen/pixelkit/carrier";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cannonRide, carrier, cx, jump, leap, tile, wait, walk, type Move } from "../../game/bot";
import { CHAIRS, KIDS_LIP, LIFT, LIP, SLABS } from "../holmenkollen";
import { rides } from "./common";

// Holmenkollen's scripted route: along the icy path, down the icy steps, the snow cannon, the
// chairlift, the slabs, the kids' jump, the tower's lift, the inrun and the jump at the lip.

/** Which enemy of Holmenkollen starts in column c. */

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


export const HOLMENKOLLEN_ROUTE: Move[] = [
  walk(tile(30) + 2),
  leap(tile(31), 1),
  walk(tile(95) + 8),
  walk(tile(98) + 8),
  leap(tile(100), 1),
  walk(tile(115)),
  cannonRide(1),
  walk(tile(137) + 6),
  wait("a chair at this end", (q) => CHAIRS.some((d) => carrierAt(d, q.t).x <= d.from.x + 1)),
  jump(1, { release: 30 }),
  wait("across on the chair", (q) => CHAIRS.some((d) => carrierAt(d, q.t).x >= d.to.x - 1 && rides(d, q.t, q.body))),
  walk(tile(157) + 4),
  // The slabs come up one after another: once the first is steady and the others will be there in
  // time, run across, jumping each tile of water at a slab's end, and on to the far side.
  wait("the slabs, steady in turn", (q) => SLABS.every((_, k) => timedPhase(q.t + 40 * k, SLABS[k]) === "on" && timedPhase(q.t + 40 * k + 70, SLABS[k]) === "on")),
  ...SLABS.map((l) => leap(l.x + l.w - 1, 1, { release: 26 })),
  walk(tile(175)),
  { name: "down the kids' jump, and a jump at its lip", keys: lipJump(KIDS_LIP.x, tile(177)) },
  walk(tile(204) + 4),
  // (It stands a second and a half: on in time to be on it when it goes.)
  wait("the lift at the bottom", (q) => carrier(q, LIFT).y >= LIFT.bottom && carrierAt(LIFT, q.t + 45).y >= LIFT.bottom),
  walk(tile(206)),
  wait("the lift at the top", (q) => carrier(q, LIFT).y <= LIFT.top),
  walk(tile(212)),
  { name: "down the inrun, and the jump at the lip", keys: lipJump(LIP.x, tile(214)) }
];

