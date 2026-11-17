import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { cx, mid, sit, wait, walk, type Move } from "../../game/bot";
import type { Play, PlayIntent } from "../../game/play";
import { LOKI_RING, LOKI_STEPS, lokiWave, type Loki } from "../../game/loki";
import { STACKS } from "../encore";

// The encore's scripted route (order 29), played by the tests and under `?debug&auto` with the real rules: up the park's
// path past the flag, a sit on the bench, onto the stage; then Loki. The club: stand, and jump as it comes down (the wave
// passes under). The charge: up onto the nearest speaker while he revs, and stay there while he slides. The bite: wait for
// the ring to stop following, then walk out of it. Each time he poses: to him, and down on him.

const loki = (q: Play) => q.boss!.state as Loki;
const feet = (q: Play) => q.body.y + PLAYER.h;
const NONE: PlayIntent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
/** A speaker stack's top, and the middle of each. */
const TOP = 10 * TILE;
const MIDS = STACKS.map((c) => c * TILE + TILE);
const onStack = (q: Play) => q.body.onGround && Math.abs(feet(q) - TOP) < 0.5;
const nearest = (x: number) => MIDS.reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
/** Walk toward x, stopping within two pixels. */
const go = (q: Play, x: number): PlayIntent => {
  const d = x - cx(q);
  return Math.abs(d) <= 2 ? NONE : { ...NONE, left: d < 0, right: d > 0 };
};

/** The fight: his three borrowed moves answered, and a stomp each time he poses. */
export const lokiFight: Move = {
  name: "Loki: jump the club, up on a speaker for the charge, out of the ring, down on him as he poses",
  keys(q, m) {
    const s = loki(q);
    if (s.hits >= 3) return q.body.onGround ? "done" : NONE;
    const hx = cx(q);
    const age = q.t - s.since;
    // In the air: the jump held while rising (and a moment after), steering for what it was for.
    if (!q.body.onGround) {
      // Down on him while he poses; once hit, away from him (landing on him again is only a bounce).
      const target = m.stomp ? (s.phase === "pose" ? s.x : s.x + (hx < s.x ? -28 : 28)) : (m.aim as number | undefined);
      const k = { ...NONE, jumpHeld: q.body.vy < 0 || (m.i as number) - ((m.jumpAt as number) ?? -99) < 30 };
      if (target !== undefined) {
        const aim = target - q.body.vx * 7 - hx;
        k.left = aim < -2;
        k.right = aim > 2;
      }
      return k;
    }
    m.aim = undefined;
    m.stomp = false;
    const jumpFor = (x: number, stomp = false): PlayIntent => {
      m.aim = x;
      m.stomp = stomp;
      m.jumpAt = m.i;
      const d = x - hx;
      return { ...NONE, left: d < -2, right: d > 2, jumpHeld: true, jumpPressed: true };
    };
    switch (s.phase) {
      case "pose": {
        // To about twenty pixels from him, then up and down onto him.
        const d = s.x - hx;
        if (Math.abs(d) > 40) return go(q, s.x - Math.sign(d) * 20);
        if (Math.abs(d) < 12 && !onStack(q)) return go(q, s.x + (hx < s.x ? -20 : 20));
        return jumpFor(s.x, true);
      }
      case "strut":
      case "rev":
      case "charge":
        if (s.attack !== "charge") return NONE;
        // The plough's charge: up onto the nearest speaker before he slides, and stay.
        if (onStack(q)) return NONE;
        if (Math.abs(nearest(hx) - hx) > 3) return go(q, nearest(hx));
        return jumpFor(hx);
      case "club":
        // The troll's club: jump as it comes down.
        if (!onStack(q) && age >= LOKI_STEPS.club - 6) return jumpFor(hx);
        return NONE;
      case "slam":
        if (!onStack(q)) for (const f of lokiWave(s, q.t)) if (Math.abs(f.x + f.w / 2 - hx) < 18) return jumpFor(hx);
        return NONE;
      case "ring":
      case "bite": {
        // The serpent's ring: once it holds, out of it, away from him.
        const r = s.ring;
        if (!r || (s.phase === "ring" && age < LOKI_STEPS.follow)) return NONE;
        if (Math.abs(r.y - feet(q)) > 2 || Math.abs(r.x - hx) >= LOKI_RING.r + PLAYER.w / 2 + 6) return NONE;
        const away = hx <= s.x ? -1 : 1;
        const room = away < 0 ? r.x - s.def.x0 > 3 * TILE : s.def.x1 - r.x > 3 * TILE;
        return go(q, r.x + (room ? away : -away) * (LOKI_RING.r + PLAYER.w + 10));
      }
    }
    return NONE;
  }
};

export const ENCORE_ROUTE: Move[] = [
  // The park's path, the flag, the bench before the stage.
  walk(mid(9)),
  sit(),
  // Onto the stage: the show starts.
  walk(mid(18)),
  lokiFight,
  // Plain, he shrugs, says his line and goes off by the wing; then it is over.
  wait("he has gone", (q) => q.run.state === "done")
];
