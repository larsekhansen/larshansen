import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { carrierAt } from "@larshansen/pixelkit/carrier";
import { deckTops } from "@larshansen/pixelkit/deck";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cx, jumpTo, leap, mid, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, windingUp } from "../../game/enemies";
import type { Play } from "../../game/play";
import { FERRY, FRAM_DECK, GJOA_DECK, OARS, RAFT, REED } from "../bygdoy";

// Bygdøy's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules, the single jump, the ski pole and the shield he is given on the way: the ferry over from
// Rådhusbrygga, over the boathouses' roofs and the slipway, up to Fram's gallery and over her rocking
// deck to the foredeck, down onto Gjøa's and up to the gallery past the penguin, the balsa raft, the
// bundles and the reed boat, up the oars to the longship's deck, the shield at the prow, the three
// slingers in the yard (walk, stop and raise it, walk), and up the museum's gable to the rune.

const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** A carrier stands where it stops, and will for a while yet. */
const standing = (d: typeof FERRY, x: number, steps: number) => (q: Play) => carrierAt(d, q.t).x === x && carrierAt(d, q.t + steps).x === x;

/** Hops on board the ferry as it goes, up through the skilling over its wake, and comes down on it again. */
const overTheWake: Move = {
  name: "up over the wake",
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    const aim = carrierAt(FERRY, q.t).x + 40 - (cx(q) + q.body.vx * 4);
    return { left: aim < -2, right: aim > 2, jumpHeld: s.i < 30, jumpPressed: s.i === 0 };
  }
};

/**
 * Across a bundle without stopping on it, as a person does before it sinks: walks on to its far edge,
 * jumps there, and steers to come down at `x`. Done when he has landed.
 */
const overBundle = (edge: number, x: number): Move => ({
  name: `over the bundle to ${x}`,
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    if (s.took === undefined) {
      if (q.body.x + PLAYER.w < edge) return { ...NONE, right: true };
      s.took = s.i;
    }
    const k = s.i - (s.took as number);
    const aim = x - q.body.vx * 7 - cx(q);
    return { left: aim < -2, right: aim > 2, jumpHeld: k < 40, jumpPressed: k === 0 };
  }
});

const SLINGERS = [10, 11, 12];
/** A slinger that can throw at him from where it stands: in reach, and facing him. */
const inReach = (q: Play, k: number) => {
  const e = q.enemies[k];
  const hx = cx(q);
  return e.alive && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y && (hx - e.x) * e.dir > 1.5 * TILE;
};

/**
 * Through the yard as a person goes: walking on, and whenever a slinger in reach whirls its sling, or
 * one of their stones is in the air, stopping and raising the shield; holding it a moment after the
 * stone has been stopped, then walking on.
 */
const pastTheSlingers = (x: number): Move => ({
  name: `through the yard to ${x}, the shield up as each sling whirls`,
  keys(q, s) {
    const at = SLINGERS.find((k) => (inReach(q, k) && windingUp(q.enemies[k], q.t)) || q.shots.some((sh) => sh.by === k && sh.spent === undefined));
    if (at !== undefined) {
      s.hold = 15;
      s.face = Math.sign(q.enemies[at].x - cx(q)) || 1;
    }
    if (at !== undefined || (s.hold as number) > 0) {
      s.hold = Math.max(0, (s.hold as number) - 1);
      // Turned to face the one that throws, and the shield up.
      return { ...NONE, left: s.face === -1 && q.body.facing !== -1, right: s.face === 1 && q.body.facing !== 1, shield: true };
    }
    const dx = x - cx(q);
    if (Math.abs(dx) <= 2 && q.body.onGround && Math.abs(q.body.vx) < 0.05) return "done";
    const near = Math.abs(dx) < Math.abs(q.body.vx) * 4;
    return { ...NONE, left: !near && dx < 0, right: !near && dx > 0 };
  }
});
const oarOut = (i: number, steps: number) => (q: Play) => timedPhase(q.t, OARS[i]) === "on" && timedPhase(q.t + steps, OARS[i]) === "on";

export const BYGDOY_ROUTE: Move[] = [
  // The ferry from Rådhusbrygga: on at the quay, up over its wake, off at the pier.
  walk(tile(11) + 4),
  wait("the ferry at the quay", standing(FERRY, tile(12), 40)),
  walk(tile(14)),
  wait("out over the water", (q) => carrierAt(FERRY, q.t).x >= tile(14)),
  overTheWake,
  wait("the ferry at the pier", standing(FERRY, tile(24), 20)),
  walk(mid(31)),
  // The beach: up over the first boathouse, the slipway, over the second.
  walk(tile(38) + 6),
  jumpTo(mid(39)),
  jumpTo(mid(41)),
  walk(mid(44)),
  walk(tile(46) + 8),
  leap(tile(48), 1),
  walk(tile(54) + 6),
  jumpTo(mid(55)),
  jumpTo(mid(57)),
  walk(mid(61)),
  walk(tile(63)),
  walk(mid(69)),
  // Fram's hall: up to the gallery, onto her deck as its near end comes level, up off its far end as it rises.
  walk(tile(70) + 4),
  jumpTo(mid(71)),
  jumpTo(mid(73)),
  walk(tile(77) - 6),
  wait("Fram's deck level with the gallery", (q) => deckTops(FRAM_DECK, q.t)[0] >= 239 && deckTops(FRAM_DECK, q.t + 30)[0] >= 239),
  walk(tile(89) - 8),
  wait("Fram's bow up", (q) => deckTops(FRAM_DECK, q.t).at(-1)! <= 217),
  jumpTo(mid(90)),
  walk(tile(97) + 8),
  // Down onto Gjøa's deck, along it, and up off its far end as that rises; over the penguin.
  walk(tile(109) - 8),
  wait("Gjøa's stern up", (q) => deckTops(GJOA_DECK, q.t).at(-1)! <= 189),
  jumpTo(mid(111)),
  walk(tile(119) + 6),
  // The balsa raft, two bundles (on and off before they sink), the rock; the reed boat, two bundles, the shore.
  walk(tile(121) + 6),
  wait("the raft at the shore", standing(RAFT, tile(122), 40)),
  walk(tile(124)),
  wait("the raft at its far end", standing(RAFT, tile(127), 40)),
  overBundle(tile(133) - 3, tile(135.5)),
  overBundle(tile(136.5) - 3, tile(139)),
  wait("the reed boat at the rock", standing(REED, tile(140), 40)),
  walk(tile(142)),
  wait("the reed boat at its far end", standing(REED, tile(144), 40)),
  overBundle(tile(150) - 3, tile(153)),
  walk(mid(158)),
  // The longship's hall: the rat by the oars, then up the oars as each comes out, onto the deck, to the prow and the shield.
  stomp(8),
  walk(tile(163) + 4),
  wait("the first oar out", oarOut(0, 50)),
  jumpTo(OARS[0].x + 8),
  wait("the second oar out", oarOut(1, 50)),
  jumpTo(OARS[1].x + 8),
  wait("the third oar out", oarOut(2, 50)),
  jumpTo(OARS[2].x + 8),
  wait("the fourth oar out", oarOut(3, 50)),
  jumpTo(OARS[3].x + 8),
  jumpTo(mid(173)),
  walk(mid(198)),
  // Off the prow, and out into the yard past the three slingers: walk, stop and raise the shield, walk.
  walk(tile(201) + 4),
  pastTheSlingers(mid(212)),
  pastTheSlingers(mid(221)),
  pastTheSlingers(mid(235)),
  // Up the museum's gable to the rune on its ridge.
  walk(tile(237) + 6),
  jumpTo(mid(239)),
  jumpTo(mid(242)),
  jumpTo(mid(245)),
  jumpTo(mid(248)),
  jumpTo(mid(251)),
  walk(mid(252))
];
