import { TILE } from "@larshansen/pixelkit/config";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cx, feet, jumpTo, mid, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow, windingUp } from "../../game/enemies";
import type { Play } from "../../game/play";
import { shieldedWalk } from "./common";
import { JET_IN, SLAB, W } from "../vigelandsparken";

// Vigelandsparken's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules, the single jump, the ski pole and the shield: through the gate and over the first statue,
// across the bridge and its broken span while the Angry Boy is quiet, up a jet to the giants' bowl and
// down the other, over the rose garden's first statue and up the second onto the pergola, the courtyard's
// statue led to the wall by turning his back on it, up the Monolith's figures, across the plateau with
// the shield up as each ring comes, and down to the Wheel of Life.

const FLOOR = W * TILE;
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
/** The statues by their place in the level's list. */
const RIGHT_OF_GARDEN = 6;
const COURTYARD = 7;
const RINGERS = [11, 12];

/** A thrower that can throw at him from where it stands: in reach, and facing him. */
const inReach = (q: Play, k: number) => {
  const e = q.enemies[k];
  const hx = cx(q);
  return e.alive && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y && (hx - e.x) * e.dir > 1.5 * TILE;
};

/** Up on a statue that stands where it is: a short jump to come down on its head. */
const ontoStatue = (k: number): Move => ({
  name: `onto statue ${k}`,
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    if (s.i > 200) return "done";
    const aim = q.enemies[k].x - q.body.vx * 7 - cx(q);
    return { left: aim < -2, right: aim > 2, jumpHeld: s.i < 40, jumpPressed: s.i === 0 };
  }
});

/** Stands at the wall with his back to the statue behind him (turned away again if he has looked round) until it has come up behind him. */
const leadTo = (k: number, x: number): Move => ({
  name: `his back to statue ${k}, at the wall`,
  keys: (q) => {
    const e = q.enemies[k];
    if (e.x < cx(q) && e.x >= cx(q) - 22 && q.body.onGround) return "done";
    return { ...NONE, right: cx(q) < x || q.body.facing !== 1 };
  }
});

/** Turns round to face the statue behind him: one press the other way, and it is stone again. */
const faceIt = (k: number): Move => ({
  name: `face statue ${k}`,
  keys: (q) => {
    const way = Math.sign(q.enemies[k].x - cx(q));
    return q.body.facing === way ? "done" : { ...NONE, left: way < 0, right: way > 0 };
  }
});

export const VIGELANDSPARKEN_ROUTE: Move[] = [
  // Through the gate and past the pigeon; the first statue is in the way, still while he looks: over it.
  walk(mid(10)),
  walk(mid(31)),
  walk(mid(35)),
  // The bridge: over the bronze statue, to the broken span; across on the loose slab while the boy is quiet.
  walk(mid(54)),
  walk(mid(55)),
  wait("the slab there, and the boy quiet", (q) => timedPhase(q.t, SLAB) === "on" && timedPhase(q.t + 40, SLAB) === "on"),
  jumpTo(SLAB.x + SLAB.w / 2),
  jumpTo(mid(62)),
  walk(mid(80)),
  walk(mid(85)),
  // The fountain: onto the near jet's spot on the rim, up with it, onto the giants' bowl; across it,
  // off its far end onto the other jet, and off that onto the far rim.
  walk(JET_IN.x + JET_IN.w / 2),
  wait("up on the jet", (q) => feet(q) <= FLOOR - 63),
  walk(JET_IN.x + JET_IN.w - 10),
  jumpTo(mid(91)),
  walk(mid(100)),
  walk(tile(102) + 8),
  wait("on the far jet", (q) => q.body.onGround),
  walk(mid(106)),
  walk(mid(110)),
  // The rose garden: over the first statue; the second is still while he faces it: up on it, onto the pergola.
  walk(mid(121)),
  walk(tile(131) + 4),
  ontoStatue(RIGHT_OF_GARDEN),
  jumpTo(mid(135)),
  // Down into the courtyard, over its statue, to the wall: his back to it until it has followed him
  // there, then round to face it, up on it, and onto the wall.
  walk(tile(138) + 6),
  walk(mid(145)),
  walk(tile(154) - 6),
  leadTo(COURTYARD, tile(154) - 6),
  faceIt(COURTYARD),
  ontoStatue(COURTYARD),
  jumpTo(tile(154) + 6),
  walk(mid(157)),
  // The Monolith: up its figures, left and right, onto the plateau.
  walk(mid(171)),
  jumpTo(mid(173)),
  jumpTo(mid(177)),
  jumpTo(mid(173)),
  jumpTo(mid(178)),
  walk(mid(179)),
  jumpTo(mid(183)),
  walk(mid(188)),
  // The plateau: the granite groups throw rings; walk, stop and raise the shield as each lets go, walk.
  shieldedWalk(
    `across the plateau to ${mid(211)}, the shield up as each ring comes`,
    mid(211),
    (q) => {
      const at = RINGERS.find((k) => (inReach(q, k) && windingUp(q.enemies[k], q.t) && untilThrow(q.enemies[k], q.t) <= 12) || q.shots.some((sh) => sh.by === k && sh.spent === undefined));
      return at === undefined ? null : ((Math.sign(q.enemies[at].x - cx(q)) || 1) as 1 | -1);
    },
    6
  ),
  // Down the steps to the Wheel of Life.
  walk(mid(226)),
  walk(mid(234)),
  walk(mid(239))
];

