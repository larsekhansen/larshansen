import { PLAYER } from "@larshansen/pixelkit/config";
import { carrierAt, pathClock, rides, stopAt } from "@larshansen/pixelkit/carrier";
import { cx, jump, leap, mid, stomp, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { PLOUGH, ploughBox, type Plough } from "../../game/plough";
import { PLOUGH_DEF, TERRACE, TRAMS } from "../nabolaget";

// Nabolaget's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules, the front page's single jump and the ski pole: up the woodshed onto the roofs, a washing line
// up to the next, the cat, the chimney's warm air up to the block, the kid, a line again, the lane
// behind the church in the dark, up the church and its tower, down the snow; then the plough: a bounce
// on the washing line, a jump and the dash from the terrace, a ride on the tram's roof; the rune.

const plough = (q: Play) => q.boss!.state as Plough;
const feet = (q: Play) => q.body.y + PLAYER.h;
const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** Steer in the air for x (as a stomp does), holding the jump. */
const steer = (q: Play, x: number) => {
  const aim = x - q.body.vx * 7 - cx(q);
  const dir = Math.abs(aim) > 2 ? Math.sign(aim) : 0;
  return { left: dir < 0, right: dir > 0, jumpHeld: true, jumpPressed: false };
};

/** Back up onto the terrace by the crate on its street side, to its edge. */
const backUp = (n: number): Move[] => [
  wait(`down, round ${n}`, (q) => q.body.onGround && plough(q).phase !== "hit"),
  walk(tile(175) + 2, { careless: true }),
  jump(-1, { release: 10 }),
  walk(tile(174) + 4, { careless: true }),
  jump(-1, { release: 12 }),
  walk(TERRACE.right - 6, { careless: true })
];

export const NABOLAGET_ROUTE: Move[] = [
  // Up the woodshed, onto the first roof, over the yard to the second.
  walk(tile(9) + 8),
  jump(1, { release: 12 }),
  walk(tile(11) + 8),
  jump(1, { release: 10 }),
  walk(tile(17) + 6),
  leap(tile(18), 1),
  // Off the second roof onto the washing line, up to the third; the cat on its ridge.
  walk(tile(25) + 6, { careless: true }),
  {
    name: "up off the washing line",
    keys: (q, s) => {
      if (s.air && q.body.onGround) return "done";
      if (!q.body.onGround) s.air = true;
      return steer(q, tile(29) + 8);
    }
  },
  stomp(0),
  walk(tile(33) + 6),
  leap(tile(34), 1),
  // Up the fourth roof, over the chimney into its warm air, up to the block's roof.
  walk(tile(39) + 8),
  {
    name: "up in the chimney's air to the block",
    keys: (q, s) => {
      if (s.air && q.body.onGround) return "done";
      if (!q.body.onGround) s.air = true;
      return { ...steer(q, q.body.y < 7 * 16 ? tile(46) : tile(41) + 4), jumpPressed: s.i === 0 };
    }
  },
  stomp(2),
  walk(tile(52) + 6),
  leap(tile(53), 1),
  stomp(3),
  // Off the fifth roof onto the line, up to the sixth.
  walk(tile(62) + 4, { careless: true }),
  {
    name: "up off the second washing line",
    keys: (q, s) => {
      if (s.air && q.body.onGround) return "done";
      if (!q.body.onGround) s.air = true;
      return steer(q, tile(66) + 8);
    }
  },
  walk(tile(70) + 6),
  wait("the crow out of the way", (q) => q.enemies[4].x > tile(74) && q.enemies[4].dir > 0),
  leap(tile(71), 1),
  // Down into the lane behind the church, in the dark.
  walk(tile(80)),
  walk(tile(86) + 4),
  jump(1, { release: 16 }),
  stomp(6),
  walk(tile(92) + 4),
  jump(1, { release: 16 }),
  walk(tile(104)),
  // Up the church's west end, its roof, the tower's ledges, the tower.
  walk(tile(108) + 8),
  jump(1, { release: 12 }),
  walk(tile(110) + 8),
  jump(1, { release: 8 }),
  walk(tile(111) + 8),
  jump(1, { release: 12 }),
  walk(tile(121) + 4),
  jump(1, { release: 12 }),
  walk(tile(124) + 10),
  jump(1, { release: 12 }),
  walk(tile(127) + 8),
  jump(1, { release: 12 }),
  walk(tile(131) + 12),
  // Down the snow on the far side, the crow over it, the tram's slot.
  stomp(8),
  stomp(5),
  walk(tile(155) + 4),
  leap(tile(156), 1),
  // The flag and the bench; up the crate onto the terrace. The plough wakes.
  walk(tile(166) + 6),
  jump(1, { release: 10 }),
  walk(tile(167) + 10),
  jump(1, { release: 10 }),
  walk(TERRACE.right - 6),
  // Round one: it sticks in the bank by the washing line. Onto the line, and off it onto the cab.
  // (Each round's wait lets a round already won go by, so the route can be picked up anywhere.)
  wait("the plough stuck by the washing line", (q) => plough(q).phase === "stuck" || plough(q).hits >= 1),
  {
    name: "the bounce: off the terrace, onto the line, onto the cab",
    keys(q, s) {
      const p = plough(q);
      if (p.hits >= 1) return q.body.onGround ? "done" : steer(q, tile(176));
      if (q.body.onGround && feet(q) === TERRACE.top) return { left: false, right: true, jumpHeld: true, jumpPressed: q.body.x + PLAYER.w >= TERRACE.right - 1 };
      // On the bank by the line: up, to come down on it.
      if (q.body.onGround) return { left: false, right: false, jumpHeld: true, jumpPressed: (s.i as number) % 2 === 0 };
      return steer(q, q.body.vy < 0 && q.body.y < 200 ? p.x : PLOUGH_DEF.line.x0 + 30);
    }
  },
  ...backUp(1),
  // Round two: the line is down; it sticks further along. A jump and the dash from the terrace.
  wait("the plough stuck, nearer", (q) => (plough(q).phase === "stuck" && plough(q).hits === 1) || plough(q).hits >= 2),
  {
    name: "the dash: off the terrace's edge, the dash, onto the cab",
    keys(q, s) {
      const p = plough(q);
      if (p.hits >= 2) return q.body.onGround ? "done" : steer(q, tile(176));
      if (s.took === undefined) {
        if (q.body.x + PLAYER.w < TERRACE.right - 1) return { ...NONE, right: true };
        s.took = s.i;
      }
      const k = s.i - (s.took as number);
      return { left: false, right: true, jumpHeld: k < 40, jumpPressed: k === 0, dash: k === 12 };
    }
  },
  ...backUp(2),
  // Round three: it keeps to the middle. The tram's roof, and off its front onto the cab.
  wait("a tram stands at the terrace", (q) =>
    TRAMS.some((d) => {
      const st = stopAt(d, 0);
      const k = pathClock(d, q.t);
      return k >= st.from && k < st.from + st.steps - 40;
    })
  ),
  walk(tile(171), { careless: true }),
  jump(0, { hold: 20 }),
  {
    name: "on the tram over the plough, and off onto its cab",
    keys(q) {
      const p = plough(q);
      if (p.hits >= 3) return q.body.onGround ? "done" : steer(q, p.x - 40);
      const d = TRAMS.find((t) => rides(t, q.t, q.body));
      if (!d) return q.body.onGround ? NONE : steer(q, p.x);
      const front = carrierAt(d, q.t).x + 4 * 16;
      const box = ploughBox(p);
      if (box.x <= front + 4 && front + 8 <= box.x + box.w && p.phase !== "hit") return { ...NONE, right: true };
      // Keep near the front of the roof, ready.
      const want = front - 8;
      return { ...NONE, right: cx(q) < want - 2, left: cx(q) > want + 2 };
    }
  },
  wait("the plough parks for good", (q) => plough(q).phase === "beaten"),
  walk(tile(206) + 4),
  leap(tile(207), 1),
  walk(mid(218)),
  jump(0)
];
void PLOUGH;
