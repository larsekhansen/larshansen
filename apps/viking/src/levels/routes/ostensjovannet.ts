import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { cx, jumpTo, mid, tile, wait, walk, type Move } from "../../game/bot";
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

/** Onto a pad and on to about x on it, without stopping to stand there: a pad will not wait. */
const onto = (x: number): Move => ({
  name: `onto the pad at ${x}`,
  keys: (q) => (Math.abs(x - cx(q)) <= 6 && q.body.onGround ? "done" : { left: x < cx(q), right: x > cx(q), jumpHeld: false, jumpPressed: false })
});

/**
 * From pad i onto the next as a person goes: running to its end and jumping there, steering in the air
 * to come down on the middle of the next (braking ahead of it, since the air is slow to turn).
 */
const padToPad = (i: number, to = middle(i + 1), name = `leap from pad ${i} to the next`): Move => ({
  name,
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    if (s.took === undefined) {
      if (q.body.x + PLAYER.w < right(i) - 2 && q.body.onGround) return { left: false, right: true, jumpHeld: false, jumpPressed: false };
      s.took = s.i;
    }
    const k = s.i - (s.took as number);
    const aim = to - q.body.vx * 7 - cx(q);
    return { left: aim < -2, right: aim > 2, jumpHeld: k < 40, jumpPressed: k === 0 };
  }
});

/** Over a run of pads without stopping on any: pad to pad. */
const acrossPads = (from: number, to: number): Move[] => {
  const out: Move[] = [];
  for (let i = from; i < to; i++) out.push(padToPad(i));
  return out;
};

export const OSTENSJOVANNET_ROUTE: Move[] = [
  // The path from the metro, under the first hide, the boardwalk and its ducks.
  walk(mid(8)),
  walk(mid(29)),
  walk(tile(42) - 6),
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
  // The first swan's stretch: from the shore across the first pad and on, pad to pad, never stopping.
  ...acrossPads(3, 7),
  padToPad(7, mid(82), "leap from the last pad to the shore"),
  walk(mid(83)),
  // The mist: onto the pad at the shore's edge, up the heron before it flies, onto the hide's deck, along it and down onto the island.
  onto(right(8) - 10),
  jumpTo(HERON.x + HERON.w / 2),
  jumpTo(mid(92)),
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
  // The long crossing: from the island onto the first pad, pad to pad through two swans' stretches (where
  // they overlap both mind him) and on over the pads past them, onto the stone; on over two more to the shore.
  ...acrossPads(9, 22),
  padToPad(22, mid(187), "leap from the last pad to the stone"),
  wait("on the stone", (q) => q.body.onGround),
  walk(mid(188)),
  walk(tile(189) - 6),
  jumpTo(middle(23)),
  ...acrossPads(23, 24),
  padToPad(24, mid(199), "leap from the last pad to the far shore"),
  // The far shore, and up the far hide to the rune.
  walk(mid(205)),
  walk(mid(235)),
  walk(tile(241) - 4),
  jumpTo(mid(242)),
  jumpTo(mid(246)),
  walk(mid(251))
];
