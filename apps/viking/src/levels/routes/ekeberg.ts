import { PLAYER } from "@larshansen/pixelkit/config";
import { pathClock, stopAt } from "@larshansen/pixelkit/carrier";
import { pulsePhase, pulseAge } from "@larshansen/pixelkit/timed";
import { cx, jump, leap, stomp, tile, wait, walk, type Move } from "../../game/bot";
import type { Play } from "../../game/play";
import { GUSTS, QR, TRAMS } from "../ekeberg";
import { rides } from "./common";

// Ekeberg's scripted route, played by the tests (and by the page under `?debug&auto`) with the real
// rules, the front page's single jump and the ski pole: the magpie, the tram's roof up the trestle,
// over the cutting, through the first gust when it is still, over the hollows and the pond and up the
// sculptures, across the quarry on the three sheep in a calm, up the bank, along the deck to the rune.

/** A tram stands at its stop (0: in the street, 1: at the top of the cliff), with at least `left` steps before it goes; with `ridden`, the one he is on. */
const stands = (stop: number, left = 60, ridden = false) => (q: Play) =>
  TRAMS.some((d) => {
    if (ridden && !rides(d, q.t, q.body)) return false;
    const s = stopAt(d, stop);
    const k = pathClock(d, q.t);
    return k >= s.from && k < s.from + s.steps - left;
  });
/** Gust `i` has just gone still: a whole rest ahead. */
const calm = (i: number, after = 30) => (q: Play) => {
  const b = GUSTS[i].beat!;
  return pulsePhase(q.t, b) === "rest" && pulseAge(q.t, b).age < after;
};

export const EKEBERG_ROUTE: Move[] = [
  stomp(0),
  walk(tile(15)),
  wait("a tram stands in the street", stands(0, 90)),
  jump(0, { hold: 30 }),
  wait("up the trestle to the top", stands(1, 20, true)),
  walk(tile(50) + 4),
  wait("the first gust is still", calm(0)),
  walk(tile(74) + 8),
  // Down into the first hollow and out, up the head and the ring, over the hedgehog under them.
  leap(tile(75), 1, { release: 6 }),
  walk(tile(79) + 6),
  jump(1, { release: 20 }),
  walk(tile(80) + 10),
  jump(1, { release: 12 }),
  walk(tile(82) + 10),
  jump(1, { release: 26 }),
  walk(tile(88) + 4),
  wait("the pond's gust is still", calm(1, 60)),
  leap(tile(89) - 2, 1),
  stomp(5),
  // Down into the second hollow under the crow, out onto the reclining figure, the squirrel, the tall one.
  walk(tile(97) + 6),
  wait("the hollow's gust is still", calm(2, 60)),
  walk(tile(103) - 6),
  jump(1, { release: 30 }),
  walk(tile(104) + 6),
  jump(1, { release: 14 }),
  stomp(8),
  walk(tile(109) + 8),
  jump(1, { release: 18 }),
  walk(tile(113) + 8),
  stomp(7),
  walk(tile(118) + 6),
  jump(1, { release: 20 }),
  walk(tile(141) + 4),
  // The quarry: off the rim onto the first sheep in a calm, and on across all three, holding on.
  wait("the quarry's gust is still", calm(3, 20)),
  {
    name: "across on the sheep",
    keys(q, s) {
      if (q.body.onGround && cx(q) > tile(158) && q.body.y + PLAYER.h === QR * 16) return "done";
      // Off the rim with a hop, then steering for the next sheep's back, and at last for the far rim.
      if (q.body.onGround && cx(q) < tile(142)) return { left: false, right: true, jumpHeld: s.i > 0, jumpPressed: q.body.x + PLAYER.w >= tile(142) - 2 };
      const next = q.sheep.find((sh) => sh.x > cx(q) + 2);
      const target = next ? next.x : tile(160);
      // Down on a knoll's rock beside a sheep (a bounce that missed): up onto the next sheep again.
      if (q.body.onGround) {
        const aim = target - cx(q);
        return { left: aim < -2, right: aim > 2, jumpHeld: true, jumpPressed: true };
      }
      const aim = target - q.body.vx * 7 - cx(q);
      const dir = q.body.vy < 0 && next ? 1 : Math.abs(aim) > 2 ? Math.sign(aim) : 0;
      return { left: dir < 0, right: dir > 0, jumpHeld: true, jumpPressed: false };
    }
  },
  walk(tile(165) + 8),
  stomp(9),
  walk(tile(170) + 8),
  jump(1, { release: 12 }),
  walk(tile(176) + 4),
  leap(tile(177) - 1, 1),
  walk(tile(185) + 6),
  jump(1, { release: 14 }),
  leap(tile(188) - 1, 1),
  walk(tile(214)),
  stomp(12),
  walk(tile(249) + 8),
  jump(1, { release: 14 }),
  walk(tile(251) + 8)
];
