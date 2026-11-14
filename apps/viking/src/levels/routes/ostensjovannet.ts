import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { cx, jumpTo, leap, mid, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow } from "../../game/enemies";
import type { Play } from "../../game/play";
import { shieldedWalk } from "./common";
import { HERON, PADS } from "../ostensjovannet";

// Østensjøvannet's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules, the single jump, the ski pole and the shield: along the path and the boardwalk past the
// ducks, over the first pads with stones between, across the first swan's stretch without stopping,
// onto the pad in the mist, up the heron to the hide's deck, along the island past the coot with the
// shield up as each gull dives, across the long crossing past two swans and over the stone in the
// middle, along the far shore and up the far hide to the rune.

/** A pad's middle, and its right end. */
const middle = (i: number) => PADS[i].x + PADS[i].w / 2;
const right = (i: number) => PADS[i].x + PADS[i].w;
const GULLS = [4, 5, 6];

/** A gull that can dive at him from where it sits: in reach, and facing him. */
const inReach = (q: Play, k: number) => {
  const e = q.enemies[k];
  const hx = cx(q);
  return e.alive && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y && (hx - e.x) * e.dir > 1.5 * TILE;
};

/** Over a run of pads without stopping: from the end of each, a running leap onto the next. */
const acrossPads = (from: number, to: number): Move[] => {
  const out: Move[] = [];
  for (let i = from; i < to; i++) out.push(leap(right(i) - 2, 1));
  return out;
};

export const OSTENSJOVANNET_ROUTE: Move[] = [
  // The path from the metro, under the first hide, the boardwalk and its ducks.
  walk(mid(8)),
  walk(mid(29)),
  walk(tile(41) - 6),
  // The first pads, firm stones between them.
  jumpTo(mid(42)),
  jumpTo(middle(0)),
  jumpTo(mid(46)),
  jumpTo(middle(1)),
  jumpTo(mid(50)),
  jumpTo(middle(2)),
  jumpTo(mid(54)),
  jumpTo(mid(57)),
  walk(mid(62)),
  // The first swan's stretch: pad to pad, never stopping, and off it before it minds him.
  jumpTo(middle(3)),
  ...acrossPads(3, 7),
  leap(right(7) - 2, 1),
  walk(mid(83)),
  walk(tile(86) - 4),
  // The mist: onto the pad, up the heron before it flies, onto the hide's deck, along it and down onto the island.
  jumpTo(middle(8)),
  jumpTo(HERON.x + HERON.w / 2),
  jumpTo(mid(93)),
  walk(mid(101)),
  walk(mid(104)),
  // The island: past the coot; the gulls dive from their nests, so walk, stop and raise the shield, walk.
  walk(mid(113)),
  shieldedWalk(
    `along the island to ${mid(136)}, the shield up as each gull dives`,
    mid(136),
    (q) => {
      const front = q.body.x + PLAYER.w;
      const diving = q.shots.some((s) => GULLS.includes(s.by) && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - front < 72);
      const about = GULLS.some((k) => inReach(q, k) && untilThrow(q.enemies[k], q.t) <= 4 && q.enemies[k].x - cx(q) < 64);
      return diving || about ? 1 : null;
    },
    4
  ),
  walk(mid(138)),
  // The long crossing: two swans' stretches, one after the other; the stone in the middle; on to the far shore.
  walk(tile(141) - 6),
  jumpTo(middle(9)),
  ...acrossPads(9, 19),
  leap(right(19) - 2, 1),
  wait("on the stone", (q) => q.body.onGround),
  walk(tile(183) - 6),
  jumpTo(middle(20)),
  ...acrossPads(20, 21),
  leap(right(21) - 2, 1),
  // The far shore, and up the far hide to the rune.
  walk(mid(198)),
  walk(mid(228)),
  walk(tile(234) - 4),
  jumpTo(mid(235)),
  jumpTo(mid(239)),
  walk(mid(244))
];
