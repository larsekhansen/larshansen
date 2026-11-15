import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { cx, jumpTo, mid, sit, stomp, tile, wait, walk, type Move } from "../../game/bot";
import { THROW_REACH, untilThrow } from "../../game/enemies";
import { runeFree, type Play, type PlayIntent } from "../../game/play";
import { headBox, neckUp, neckX, tailBox, type Serpent } from "../../game/serpent";
import { shieldedWalk } from "./common";
import { STEPS, STONES, TOWER, type Ruins } from "../gamlebyen";

// Gamlebyen's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules, the single jump, the ski pole and the shield: through the park and over the dig, up St.
// Clement's ruin as its stones rise, over the gable and the crypt, along the bishop's wall stomping the
// guards as they wake, down past the wall that rises behind him, over the water mirror's stepping stones,
// up the town wall on the tower that builds itself, along the walk with the shield up as each arrow comes,
// down into the market, the geese, the bench, the dog; over the basin on the two longships, the serpent's
// bench, and the fight: the shield as it spits, a stomp on its dazed head, a jump over its tail, three
// times; and up onto the last longship's prow to the rune.

const NONE: PlayIntent = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** Runs at `edge` and jumps as his front passes it, steering in the air to come down at x. */
const leapTo = (edge: number, x: number, name = `leap to ${x}`): Move => ({
  name,
  keys(q, s) {
    if (s.air && q.body.onGround) return "done";
    if (!q.body.onGround) s.air = true;
    if (s.took === undefined) {
      if (q.body.x + PLAYER.w < edge && q.body.onGround) return { ...NONE, right: true };
      s.took = s.i;
    }
    const k = s.i - (s.took as number);
    const aim = x - q.body.vx * 7 - cx(q);
    return { left: aim < -2, right: aim > 2, jumpHeld: k < 40, jumpPressed: k === 0 };
  }
});

/** The stone at (c, r) has risen. */
const risen = (c: number, r: number): Move => {
  const i = STONES.findIndex((s) => s.c === c && s.r === r);
  return wait(`the stone at ${c},${r} risen`, (q) => (q.grounds!.state as Ruins).up[i]);
};

/** The archers (enemies 6 and 7): an arrow coming at him, or one of them about to shoot. */
const ARCHERS = [6, 7];
const arrows = (q: Play): 1 | null => {
  const front = q.body.x + PLAYER.w;
  const coming = q.shots.some((s) => ARCHERS.includes(s.by) && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - front < 64);
  const about = ARCHERS.some((k) => {
    const e = q.enemies[k];
    const d = e.x - cx(q);
    return e.alive && untilThrow(e, q.t) <= 3 && d > 4 * TILE && d < 10 * TILE && Math.abs(q.body.y - e.y) < THROW_REACH.y;
  });
  return coming || about ? 1 : null;
};

/**
 * The fight: keeps clear of its neck, faces it with the shield up from its tell until the ball is back,
 * runs to its dazed head and comes down on it, and jumps its tail as it comes along the quay (after a
 * round, and from its second hit on right behind each ball).
 */
const serpentFight: Move = {
  name: "the serpent: the shield as it spits, a stomp on its head, a jump over its tail",
  keys(q, m) {
    const s = q.boss!.state as Serpent;
    if (s.phase === "beaten") return q.body.onGround ? "done" : NONE;
    const hx = cx(q);
    // In the air: hold the jump, and steer onto the head if that is what he jumped for.
    if (!q.body.onGround) {
      if (s.phase === "dazed" || s.phase === "reel") {
        const h = headBox(s);
        const aim = h.x + h.w / 2 - q.body.vx * 7 - hx;
        return { ...NONE, left: aim < -2, right: aim > 2, jumpHeld: true };
      }
      return { ...NONE, jumpHeld: (m.i as number) - ((m.jumpAt as number) ?? 0) < 30 };
    }
    // The tail coming at him along the quay: jump it (the shield, if it is up, comes down for it).
    const tb = tailBox(s, q.t);
    if (tb && s.tail) {
      const d = tb.x + tb.w / 2 - hx;
      if (Math.abs(d) < 28 && d * s.tail.dir < 0) {
        m.jumpAt = m.i;
        return { ...NONE, jumpHeld: true, jumpPressed: true };
      }
    }
    // Dazed: to its head, and up onto it.
    if (s.phase === "dazed") {
      const h = headBox(s);
      const d = h.x + h.w / 2 - hx;
      if (Math.abs(d) > 26) return { ...NONE, left: d < 0, right: d > 0 };
      m.jumpAt = m.i;
      return { ...NONE, left: d < -2, right: d > 2, jumpHeld: true, jumpPressed: true };
    }
    const nx = neckX(s);
    // Up and about to spit, or the ball on its way (and until it is well on its way back): face it, shield up.
    const ball = s.ball && (!s.ball.back || Math.abs(s.ball.x - hx) < 3 * TILE);
    if (s.phase === "rear" || (s.phase === "spit" && ball) || s.phase === "rise") {
      if (Math.abs(nx - hx) < 3 * TILE) return { ...NONE, left: hx < nx, right: hx >= nx };
      const toward = nx > hx ? 1 : -1;
      return { ...NONE, left: toward < 0 && q.body.facing > 0, right: toward > 0 && q.body.facing < 0, shield: true };
    }
    // Otherwise keep five tiles or so from where it is or will be, on the quay (and off its neck while it is up).
    if (Math.abs(nx - hx) < (neckUp(s) ? 3 : 5) * TILE) {
      const away = hx < nx ? -1 : 1;
      const room = away < 0 ? hx - s.def.x0 > 2 * TILE : s.def.x1 - hx > 2 * TILE;
      const go = room ? away : -away;
      return { ...NONE, left: go < 0, right: go > 0 };
    }
    return NONE;
  }
};

export const GAMLEBYEN_ROUTE: Move[] = [
  // The street and the park: the rat, the low walls, the dig.
  walk(mid(16)),
  walk(tile(23)),
  leapTo(tile(24) - 2, mid(27), "leap over the dig"),
  // St. Clement's ruin: up its rising stones to the gable, and down into the street.
  walk(mid(33)),
  jumpTo(mid(34)),
  risen(37, 15),
  jumpTo(mid(37)),
  walk(mid(38)),
  risen(41, 13),
  jumpTo(mid(41)),
  walk(mid(42)),
  risen(45, 11),
  jumpTo(mid(45)),
  walk(mid(46)),
  jumpTo(mid(48) + 4),
  walk(mid(51)),
  walk(mid(52)),
  // Over the crypt's hole, onto the bishop's wall, the guards as they wake.
  walk(tile(54) + 2),
  leapTo(tile(55) - 2, mid(57), "leap over the crypt's hole"),
  walk(mid(59)),
  jumpTo(mid(61)),
  jumpTo(mid(63)),
  stomp(2),
  stomp(3),
  stomp(4),
  // Down off its end; the wall rises behind him.
  walk(mid(96)),
  // The water mirror's stepping stones as they rise.
  walk(tile(97)),
  risen(101, 16),
  leapTo(tile(99) - 2, tile(102), "onto the first stepping stone"),
  ...STEPS.slice(1).flatMap(([c0, c1], i) => [risen(c0, 16), leapTo(tile(STEPS[i][1] + 1) - 2, tile(c0) + ((c1 - c0 + 1) * TILE) / 2, `onto the stepping stone at ${c0}`)]),
  leapTo(tile(126) - 2, mid(128), "onto the far bank"),
  // The tower that builds itself, up the town wall.
  walk(mid(134)),
  walk(TOWER.x + TOWER.w / 2),
  wait("up on the tower", (q) => (q.grounds!.state as Ruins).y === TOWER.high),
  walk(mid(139)),
  // The wall walk, the shield up as each arrow comes; down into the market past the wall that rises behind him.
  shieldedWalk(`along the wall walk to ${mid(175)}, the shield up as each arrow comes`, mid(175), arrows, 4),
  walk(mid(182)),
  stomp(8),
  stomp(9),
  walk(mid(205)),
  sit(),
  stomp(10),
  walk(mid(216)),
  // Over the basin on the longships.
  walk(tile(220)),
  leapTo(tile(222) - 2, tile(225) + 8, "onto the first longship"),
  leapTo(tile(228) - 2, tile(231) + 8, "onto the second longship"),
  leapTo(tile(234) - 2, mid(237), "onto the quay"),
  walk(mid(243)),
  sit(),
  walk(mid(248)),
  serpentFight,
  // The dawn comes, the torches go out, and the rune rises to the last longship's prow; onto it, the rune.
  wait("the dawn, and the rune risen to the prow", runeFree),
  walk(tile(267)),
  jumpTo(mid(269)),
  walk(mid(270))
];
