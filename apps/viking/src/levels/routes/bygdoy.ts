import { carrierAt } from "@larshansen/pixelkit/carrier";
import { deckTops } from "@larshansen/pixelkit/deck";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { cx, hop, jumpTo, leap, mid, stomp, tile, wait, walk, type Move } from "../../game/bot";
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

/** Holds the shield up against slinger `k` until it has thrown and the throw has been stopped. */
const block = (k: number): Move => ({
  name: `the shield up against slinger ${k}`,
  keys(q, s) {
    const live = q.shots.some((sh) => sh.by === k && sh.spent === undefined);
    if (live) s.live = true;
    if (s.live && !live) return "done";
    return { ...NONE, shield: true };
  }
});

const ENEMY = { penguin: 4, slingers: [5, 6, 7] };
const oarOut = (i: number, steps: number) => (q: Play) => timedPhase(q.t, OARS[i]) === "on" && timedPhase(q.t + steps, OARS[i]) === "on";

export const BYGDOY_ROUTE: Move[] = [
  // The ferry from Rådhusbrygga: on at the quay, up over its wake, off at the pier.
  walk(tile(11) + 4),
  wait("the ferry at the quay", standing(FERRY, tile(12), 50)),
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
  // Down onto Gjøa's deck, along it, and up off its far end as that rises.
  hop(1),
  walk(tile(109) - 8),
  wait("Gjøa's stern up", (q) => deckTops(GJOA_DECK, q.t).at(-1)! <= 189),
  jumpTo(mid(111)),
  stomp(ENEMY.penguin),
  walk(tile(119) + 6),
  // The balsa raft, the bundles, the reed boat, the bundles, the shore.
  walk(tile(121) + 6),
  wait("the raft at the shore", standing(RAFT, tile(122), 30)),
  walk(tile(124)),
  wait("the raft at its far end", (q) => carrierAt(RAFT, q.t).x === tile(127)),
  walk(tile(131) - 6),
  hop(1),
  walk(tile(134) - 6),
  hop(1),
  walk(tile(137) - 6),
  wait("the reed boat at its near end", standing(REED, tile(139), 20)),
  leap(tile(137) - 1, 1),
  wait("the reed boat at its far end", (q) => carrierAt(REED, q.t).x === tile(144)),
  walk(tile(148) - 6),
  hop(1),
  walk(tile(151) - 6),
  hop(1),
  walk(tile(154) - 6),
  leap(tile(154) - 1, 1),
  walk(mid(158)),
  // The longship's hall: up the oars as each comes out, onto the deck, to the prow and the shield.
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
  walk(mid(205)),
  block(ENEMY.slingers[0]),
  walk(mid(214)),
  block(ENEMY.slingers[1]),
  walk(mid(223)),
  block(ENEMY.slingers[2]),
  walk(mid(235)),
  // Up the museum's gable to the rune on its ridge.
  walk(tile(237) + 6),
  jumpTo(mid(239)),
  jumpTo(mid(242)),
  jumpTo(mid(245)),
  jumpTo(mid(248)),
  jumpTo(mid(251)),
  walk(mid(252))
];
