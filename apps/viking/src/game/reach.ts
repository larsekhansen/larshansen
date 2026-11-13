import { carrierAt, liftPeriod } from "@larshansen/pixelkit/carrier";
import { fellOut } from "@larshansen/pixelkit/checkpoint";
import { MOVE, PLAYER } from "@larshansen/pixelkit/config";
import { fire, launcherHit } from "@larshansen/pixelkit/launcher";
import { createBody, stepBody, type Body, type Carrier } from "@larshansen/pixelkit/physics";
import type { LevelDef } from "../levels/types";
import { cannonsOf, levelMap, type Box } from "./play";

// A search over where he can get to, for the tests. It plays the real `stepBody`, from every place
// he can stand, with a spread of jumps: standing and running, held and let go, steered and not,
// and the second jump when he has the feather. Moving ground is put everywhere it ever goes at
// once, and ledges on a beat are always there: a world with more to stand on than the real one.
// So what this search cannot reach, he cannot reach either. (What it can reach is shown by the
// scripted players, which play the real level.)

export interface Spot {
  x: number;
  feet: number;
}

const BUCKET = 4;
const key = (s: Spot) => `${Math.round(s.x / BUCKET)},${Math.round(s.feet)}`;

/** Every place each carrier ever is, and the ledges on a beat, as ground that does not move. */
export function everywhere(def: LevelDef): Carrier[] {
  const out = new Map<string, Carrier>();
  const add = (x: number, y: number, w: number) => out.set(`${x},${y},${w}`, { x, y, w, dx: 0, dy: 0 });
  for (const d of def.carriers) {
    const period = d.kind === "lift" ? liftPeriod(d) : d.kind === "bob" ? d.period : d.period;
    const bobP = d.bob?.period ?? 1;
    const span = Math.max(period, 1) * Math.max(1, bobP === 1 ? 1 : Math.round(bobP / Math.max(1, gcd(period, bobP))));
    for (let t = 0; t < Math.min(span, 4000); t++) {
      const at = carrierAt(d, t);
      add(at.x, at.y, d.w);
    }
  }
  for (const l of def.timed) add(l.x, l.y, l.w);
  return [...out.values()];
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

export interface Reach {
  spots: Spot[];
  touched: (box: Box) => boolean;
}

interface Move {
  dir: -1 | 0 | 1;
  /** Steps the jump key is held (0: no jump, he walks or runs off). */
  hold: number;
  /** Starting already at a run. */
  running: boolean;
  /** Steps after which the direction is let go (or turned round), or never. */
  release: number;
  turn: boolean;
  /** Steps into the air at which the second jump is pressed, with the feather. */
  second: number;
}

function moves(feather: boolean): Move[] {
  const out: Move[] = [];
  for (const dir of [-1, 0, 1] as const)
    for (const hold of [0, 5, 12, 40])
      for (const running of dir === 0 ? [false] : [false, true])
        for (const release of dir === 0 ? [999] : [4, 10, 18, 999])
          for (const turn of release === 999 || hold === 0 ? [false] : [false, true])
            for (const second of feather && hold > 0 ? [0, 12, 20, 28] : [0]) out.push({ dir, hold, running, release, turn, second });
  return out;
}

/**
 * Where he can stand, from `start`, and every box his body passed through on the way. `boxes` are
 * checked while searching (the bracteate, the rune), so a touch in mid-air counts.
 */
export function search(def: LevelDef, start: Spot, feather: boolean, boxes: Box[]): { spots: Spot[]; hit: boolean[] } {
  const map = levelMap(def);
  // The moving ground, everywhere at once, in buckets of 64 px so each step only sees what is near.
  const buckets = new Map<number, Carrier[]>();
  for (const c of everywhere(def))
    for (let k = Math.floor((c.x - 16) / 64); k <= Math.floor((c.x + c.w + 16) / 64); k++) {
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(c);
    }
  const near = (b: Body) => ({ carriers: buckets.get(Math.floor((b.x + PLAYER.w / 2) / 64)) ?? [] });
  const cannons = cannonsOf(def, map);
  const hit = boxes.map(() => false);
  const seen = new Set<string>([key(start)]);
  const queue: Spot[] = [start];
  const all: Spot[] = [start];
  const list = moves(feather);
  const touch = (b: Body) =>
    boxes.forEach((r, i) => {
      if (!hit[i] && b.x < r.x + r.w && b.x + PLAYER.w > r.x && b.y < r.y + r.h && b.y + PLAYER.h > r.y) hit[i] = true;
    });
  const land = (b: Body) => {
    const s = { x: b.x, feet: b.y + PLAYER.h };
    const k = key(s);
    if (!seen.has(k)) {
      seen.add(k);
      queue.push(s);
      all.push(s);
    }
  };
  /** Flies a fired body to wherever it lands, leaning each way. */
  const flyFrom = (b0: Body) => {
    for (const lean of [-1, 0, 1]) {
      const b = { ...b0 };
      for (let i = 0; i < 400; i++) {
        stepBody(b, { left: lean < 0, right: lean > 0, jumpHeld: false, jumpPressed: false }, map, { doubleJump: feather }, near(b));
        touch(b);
        if (fellOut(b, map)) break;
        if (b.onGround) {
          land(b);
          break;
        }
      }
    }
  };
  while (queue.length) {
    const s = queue.pop()!;
    for (const m of list) {
      const b = createBody(s.x + PLAYER.w / 2, s.feet);
      if (m.running) b.vx = m.dir * MOVE.run;
      let air = 0;
      for (let i = 0; i < 300; i++) {
        const dir = i < m.release ? m.dir : m.turn ? -m.dir : 0;
        const second = m.second > 0 && air === m.second;
        stepBody(b, { left: dir < 0, right: dir > 0, jumpHeld: (m.hold > 0 && i < m.hold) || second, jumpPressed: (m.hold > 0 && i === 0) || second }, map, { doubleJump: feather }, near(b));
        touch(b);
        if (fellOut(b, map)) break;
        const shot = cannons.find((l) => launcherHit(l, b));
        if (shot) {
          fire(shot, b);
          flyFrom(b);
          break;
        }
        if (!b.onGround) air++;
        else if (air > 0 || (m.hold === 0 && i > 2)) {
          land(b);
          if (air > 0) break;
        }
        if (m.hold === 0 && i > 60) break;
      }
    }
  }
  return { spots: all, hit };
}
