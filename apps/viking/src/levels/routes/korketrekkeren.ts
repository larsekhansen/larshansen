import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { hazardLive } from "@larshansen/pixelkit/hazard";
import { cx, mid, tile, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow, windingUp } from "../../game/enemies";
import type { Play } from "../../game/play";
import { shieldedWalk } from "./common";
import { GAP, HAZARDS, RIDE, speedAt } from "../korketrekkeren";

// Korketrekkeren's scripted route, played by the tests (and by the page under `?debug&auto`) with the
// real rules: past the boys on the porch with the shield up as each snowball comes, onto the sledge,
// and down the run: over the bumps, over the sledgers, ducking under the branches and the barrier when
// it is down, over the gap, through the trees at dusk; off the sledge at Midtstuen, and to the rune.

const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const KIDS = [1, 2, 3];

/** A thrower that can throw at him from where it stands: in reach, and facing him. */
const inReach = (q: Play, k: number) => {
  const e = q.enemies[k];
  const hx = cx(q);
  return e.alive && Math.abs(hx - e.x) < THROW_REACH.x && Math.abs(q.body.y - e.y) < THROW_REACH.y && (hx - e.x) * e.dir > 1.5 * TILE;
};

/** A branch or the barrier he is about to pass under, that will hurt at his head's height while he passes. */
const overhead = (q: Play) => {
  const front = q.body.x + PLAYER.w;
  const v = Math.max(0.5, speedAt(cx(q)));
  return HAZARDS.some((h) => {
    const ahead = h.x - front;
    if (ahead > 26 || h.x + h.w < q.body.x - 6) return false;
    // Live at any moment from now until he is past it.
    const until = Math.ceil((h.x + h.w + 6 - q.body.x) / v);
    for (let k = 0; k <= until; k += 3) if (hazardLive(h, q.t + k)) return true;
    return false;
  });
};

/** A sledger close ahead of him on the run, still riding. */
const sledgerAhead = (q: Play) =>
  q.enemies.some((e) => e.def.look === "sledger" && e.alive && !e.calm && e.x - e.w / 2 - (q.body.x + PLAYER.w) < 10 && e.x + e.w / 2 > q.body.x);

/**
 * Down the run on the sledge to x: it carries him; he ducks under what hangs at head height while he
 * passes it, and jumps a sledger he is catching up with. Named for what is on the stretch.
 */
const ride = (name: string, x: number): Move => ({
  name,
  keys(q, s) {
    if (cx(q) >= x) return "done";
    const hold = (s.hold as number) ?? 0;
    if (hold > 0) {
      s.hold = hold - 1;
      return { ...NONE, jumpHeld: true };
    }
    if (overhead(q)) return { ...NONE, shield: true };
    if (q.body.onGround && sledgerAhead(q)) {
      s.hold = 30;
      return { ...NONE, jumpHeld: true, jumpPressed: true };
    }
    return NONE;
  }
});

/** Over the gap in the run: on the sledge to its edge, a jump there, held; done when he has landed beyond it. */
const overTheGap: Move = {
  name: "jump the gap",
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    if (s.took === undefined) {
      if (q.body.x + PLAYER.w < GAP.from - 4) return NONE;
      s.took = s.i;
    }
    return { ...NONE, jumpHeld: s.i - (s.took as number) < 40, jumpPressed: s.i === s.took };
  }
};

export const KORKETREKKEREN_ROUTE: Move[] = [
  // Frognerseteren: past the bench, under the porch with the shield up as each snowball comes.
  walk(mid(8)),
  shieldedWalk(
    `past the porch to ${mid(29)}, the shield up as each snowball comes`,
    mid(29),
    (q) => {
      const at = KIDS.find((k) => (inReach(q, k) && windingUp(q.enemies[k], q.t) && untilThrow(q.enemies[k], q.t) <= 12) || q.shots.some((sh) => sh.by === k && sh.spent === undefined));
      return at === undefined ? null : ((Math.sign(q.enemies[at].x - cx(q)) || 1) as 1 | -1);
    },
    6
  ),
  // Onto the sledge at the top of the run.
  walk(tile(32) + 8),
  { name: "onto the sledge", keys: (q) => (q.riding ? "done" : { ...NONE, right: true }) },
  ride("ride the first bends, over the bumps", tile(70)),
  ride("over the sledgers", tile(110)),
  ride("duck the branches", tile(140)),
  ride("duck the barrier when it is down", tile(166)),
  ride("down the steep bit", GAP.from - 40),
  overTheGap,
  ride("ride the long landing", tile(196)),
  ride("duck in the trees at dusk, over the last sledger", tile(236)),
  ride("the run-out to Midtstuen", RIDE.to),
  walk(mid(262))
];
