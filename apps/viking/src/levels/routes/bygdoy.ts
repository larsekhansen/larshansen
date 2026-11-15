import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { carrierAt } from "@larshansen/pixelkit/carrier";
import { deckTops } from "@larshansen/pixelkit/deck";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cx, jumpTo, leap, mid, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow, windingUp } from "../../game/enemies";
import type { Play } from "../../game/play";
import { shieldedWalk } from "./common";
import { FERRY, FRAM_DECK, GJOA_DECK, OARS, RAFT, REED, YARD_DECK } from "../bygdoy";

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

/** The slinger at the end of the passage under the loft, and the two on the storehouses' ridges. */
const PASSAGE = 10;
const SLINGERS = [11, 12];
/** A slinger that can throw at him from where it stands: in reach, and facing him. */
const inReach = (q: Play, k: number) => {
  const e = q.enemies[k];
  const hx = cx(q);
  return e.alive && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y && (hx - e.x) * e.dir > 1.5 * TILE;
};

/**
 * Through the passage under the loft as a person goes: walking on, and whenever one of the slinger's
 * stones comes down the passage at him and is close, stopping with the shield up until it has fallen.
 */
const throughThePassage = (x: number): Move =>
  shieldedWalk(
    `through the passage to ${x}, the shield up as each stone comes`,
    x,
    (q) => (q.shots.some((sh) => sh.by === PASSAGE && sh.spent === undefined && sh.vx < 0 && sh.x > q.body.x && sh.x - (q.body.x + PLAYER.w) < 72) ? 1 : null),
    4
  );

/**
 * Through the yard as a person goes: walking on, and whenever a slinger in reach is about to let go,
 * or one of their stones is in the air, stopping and raising the shield; holding it a moment after
 * the stone has been stopped, then walking on.
 */
const pastTheSlingers = (x: number, until?: (q: Play) => boolean, name = `through the yard to ${x}, the shield up as each sling lets go`): Move =>
  shieldedWalk(
    name,
    x,
    (q) => {
      const at = SLINGERS.find((k) => (inReach(q, k) && windingUp(q.enemies[k], q.t) && untilThrow(q.enemies[k], q.t) <= 12) || q.shots.some((sh) => sh.by === k && sh.spent === undefined));
      return at === undefined ? null : ((Math.sign(q.enemies[at].x - cx(q)) || 1) as 1 | -1);
    },
    6,
    until
  );
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
  // Off the prow, through the passage under the loft past the first slinger's stones (walk, stop and
  // raise the shield, walk), over him, and out into the yard past the other two.
  walk(tile(201) + 4),
  throughThePassage(tile(212)),
  stomp(PASSAGE),
  // Onto the boat in the slip as its near end comes level, along its rocking deck (stopping on it, the
  // shield up, when the slinger over it lets go), off its far end into the yard, past the last slinger.
  walk(tile(215) - 6),
  wait("the boat's near end level with the yard", (q) => [0, 4].every((k) => Math.abs(deckTops(YARD_DECK, q.t + k)[0] - YARD_DECK.y) <= 2)),
  pastTheSlingers(mid(220), (q) => [0, 8].every((k) => Math.abs(deckTops(YARD_DECK, q.t + k).at(-1)! - YARD_DECK.y) <= 2), "on the boat's middle, the shield up as each sling lets go, until its far end is level"),
  pastTheSlingers(mid(226)),
  pastTheSlingers(mid(236)),
  // Up the museum's gable to the rune on its ridge.
  walk(tile(237) + 6),
  jumpTo(mid(239)),
  jumpTo(mid(242)),
  jumpTo(mid(245)),
  jumpTo(mid(248)),
  jumpTo(mid(251)),
  walk(mid(252))
];
