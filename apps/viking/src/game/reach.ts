import { carrierAt, carrierPeriod, carrierShown } from "@larshansen/pixelkit/carrier";
import { fellOut } from "@larshansen/pixelkit/checkpoint";
import { DASH, MOVE, PLAYER, TILE } from "@larshansen/pixelkit/config";
import { fire, launcherHit } from "@larshansen/pixelkit/launcher";
import { bounce, createBody, dashStep, stepBody, type Body, type Carrier, type World } from "@larshansen/pixelkit/physics";
import { MARKS, type LevelDef } from "../levels/types";
import { KIND } from "./enemies";
import { STOMP, cannonsOf, drumsOf, levelMap, type Box } from "./play";
import { SHEEP } from "./sheep";

// A search over where he can get to, for the tests. It plays the real `stepBody`, from every place
// he can stand, with a spread of jumps: standing and running, held and let go, steered and not,
// the second jump when he has the feather, and the dash when he has the ski pole. Moving ground is
// put everywhere it ever goes at once, ledges on a beat are always there, and every enemy he can
// land on, and every sheep, is a trampoline all along its patrol and at all its heights at once, at
// the highest bounce: a world with more to stand on and bounce off than the real one. So what this
// search cannot reach, he cannot reach either. (What it can reach is shown by the scripted players,
// which play the real level.)

export interface Spot {
  x: number;
  feet: number;
}

/** Spots closer than this across (on the same height) count as one. */
const BUCKET = 4;
const key = (s: Spot) => `${Math.round(s.x / BUCKET)},${Math.round(s.feet)}`;

/** Every place each carrier ever is, and the ledges on a beat, as ground that does not move. */
export function everywhere(def: LevelDef): Carrier[] {
  const out = new Map<string, Carrier>();
  const add = (x: number, y: number, w: number) => out.set(`${x},${y},${w}`, { x, y, w, dx: 0, dy: 0 });
  for (const d of def.carriers) {
    const period = carrierPeriod(d);
    const bobP = d.bob?.period ?? 1;
    const span = Math.max(period, 1) * Math.max(1, bobP === 1 ? 1 : Math.round(bobP / Math.max(1, gcd(period, bobP))));
    for (let t = 0; t < Math.min(span, 4000); t++) {
      if (!carrierShown(d, t)) continue;
      const at = carrierAt(d, t);
      add(at.x, at.y, d.w);
    }
  }
  for (const l of def.timed) add(l.x, l.y, l.w);
  // Ledges at the same height that touch or overlap are one longer ledge: the same ground to stand
  // on, and far fewer things for each step to look at (a banner's path is hundreds of places).
  const byY = new Map<number, Carrier[]>();
  for (const c of out.values()) byY.set(c.y, [...(byY.get(c.y) ?? []), c]);
  const merged: Carrier[] = [];
  for (const [y, list] of byY) {
    list.sort((a, b) => a.x - b.x);
    let cur = { ...list[0] };
    for (const c of list.slice(1)) {
      if (c.x <= cur.x + cur.w) cur.w = Math.max(cur.w, c.x + c.w - cur.x);
      else {
        merged.push(cur);
        cur = { ...c };
      }
    }
    merged.push({ ...cur, y });
  }
  return merged;
}

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** Something to bounce off: from x0 to x1, its top anywhere from y0 to y1, and how hard it throws him up. */
export interface Pad {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  speed: number;
}

/** Every enemy he can land on, and every sheep, as a pad over all of its patrol and all its heights. */
export function pads(def: LevelDef): Pad[] {
  const map = levelMap(def);
  const out: Pad[] = [];
  for (const e of def.enemies ?? []) {
    const k = KIND[e.kind];
    if (!k.stomp) continue;
    const w = e.w ?? k.w;
    const h = e.h ?? k.h;
    const range = (e.range ?? 0) * TILE;
    const x = e.c * TILE + TILE / 2;
    const base = (e.r + 1) * TILE;
    // Its top: on a slope it rides the slope; a flyer waves; a jumper leaps out of its water.
    let y0 = base - h;
    let y1 = base - h;
    for (let dx = -range; dx <= range; dx += 4) {
      const ramp = map.rampAt(x + dx);
      if (ramp !== null && Math.abs(ramp - base) < TILE * 2) {
        y0 = Math.min(y0, ramp - h);
        y1 = Math.max(y1, ramp - h);
      }
    }
    if (e.kind === "flyer") {
      y0 -= e.rise ?? 10;
      y1 += e.rise ?? 10;
    }
    if (e.kind === "jumper") y0 -= e.rise ?? 40;
    out.push({ x0: x - range - w / 2, x1: x + range + w / 2, y0, y1, speed: STOMP.held });
  }
  for (const t of map.find(MARKS.sheep)) {
    const x = t.c * TILE + TILE / 2;
    const top = (t.r + 1) * TILE - SHEEP.h;
    out.push({ x0: x - SHEEP.range - SHEEP.w / 2, x1: x + SHEEP.range + SHEEP.w / 2, y0: top, y1: top + 1, speed: 7 });
  }
  return out;
}

/** The map as flat arrays, for speed: the search asks it a great many times. */
function fastWorld(def: LevelDef): World & { isWater(c: number, r: number): boolean; height: number } {
  const map = levelMap(def);
  const cols = map.cols;
  const rows = map.rows;
  const solid = new Uint8Array(cols * rows);
  const oneWay = new Uint8Array(cols * rows);
  const water = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      solid[r * cols + c] = map.isSolid(c, r) ? 1 : 0;
      oneWay[r * cols + c] = map.isOneWay(c, r) ? 1 : 0;
      water[r * cols + c] = map.isWater(c, r) ? 1 : 0;
    }
  return {
    width: map.width,
    height: map.height,
    // Outside the map: ground at the sides and below, open sky above, as the map reader has it.
    isSolid: (c, r) => (c < 0 || c >= cols || r >= rows ? true : r < 0 ? false : solid[r * cols + c] === 1),
    isOneWay: (c, r) => c >= 0 && c < cols && r >= 0 && r < rows && oneWay[r * cols + c] === 1,
    isWater: (c, r) => c >= 0 && c < cols && r >= 0 && r < rows && water[r * cols + c] === 1,
    rampAt: map.ramps.length > 0 ? map.rampAt : () => null
  };
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
  /** Steps into the air at which he dashes, with the pole (0: never). */
  dash: number;
}

function moves(feather: boolean, pole: boolean): Move[] {
  const out: Move[] = [];
  for (const dir of [-1, 0, 1] as const)
    for (const hold of [0, 5, 12, 40])
      for (const running of dir === 0 ? [false] : [false, true])
        for (const release of dir === 0 ? [999] : [4, 10, 18, 999])
          for (const turn of release === 999 || hold === 0 ? [false] : [false, true])
            for (const second of feather && hold > 0 ? [0, 12, 20, 28] : [0]) out.push({ dir, hold, running, release, turn, second, dash: 0 });
  if (pole)
    for (const dir of [-1, 1] as const) for (const hold of [0, 40]) for (const dash of [1, 10, 18, 26]) out.push({ dir, hold, running: true, release: 999, turn: false, second: 0, dash });
  return out;
}

/**
 * Where he can stand, from `start`, and every box his body passed through on the way. `boxes` are
 * checked while searching (the bracteate, the rune), so a touch in mid-air counts.
 */
export function search(def: LevelDef, start: Spot, feather: boolean, boxes: Box[], opts: { pole?: boolean } = {}): { spots: Spot[]; hit: boolean[] } {
  const world = fastWorld(def);
  const map = levelMap(def);
  // The moving ground, everywhere at once, in buckets of 64 px so each step only sees what is near.
  const buckets = new Map<number, Carrier[]>();
  for (const c of everywhere(def))
    for (let k = Math.floor((c.x - 16) / 64); k <= Math.floor((c.x + c.w + 16) / 64); k++) {
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(c);
    }
  const surfaceAt = def.surfaceAt ? (x: number, y: number) => def.surfaceAt!(x, y, 0) : undefined;
  const near = (b: Body) => ({ carriers: buckets.get(Math.floor((b.x + PLAYER.w / 2) / 64)) ?? [], surfaceAt });
  const launchers = [...cannonsOf(def, map), ...drumsOf(def, map)];
  const trampolines = pads(def);
  const hit = boxes.map(() => false);
  const seen = new Set<string>([key(start)]);
  const queue: Spot[] = [start];
  const all: Spot[] = [start];
  const list = moves(feather, !!opts.pole);
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
  /** Coming down onto a pad this step: thrown up again from the pad's height. */
  const bounced = (b: Body, prevFeet: number) => {
    if (b.vy <= 0) return false;
    const feet = b.y + PLAYER.h;
    for (const p of trampolines)
      if (b.x + PLAYER.w > p.x0 && b.x < p.x1 && feet >= p.y0 && prevFeet <= p.y1) {
        b.y = Math.max(p.y0, Math.min(p.y1, prevFeet)) - PLAYER.h;
        bounce(b, p.speed);
        return true;
      }
    return false;
  };
  /** Flies a thrown body to wherever it lands, leaning each way, bouncing again where it can. */
  const flyFrom = (b0: Body, depth = 0) => {
    for (const lean of [-1, 0, 1]) {
      const b = { ...b0 };
      for (let i = 0; i < 400; i++) {
        const prev = b.y + PLAYER.h;
        stepBody(b, { left: lean < 0, right: lean > 0, jumpHeld: true, jumpPressed: false }, world, { doubleJump: feather }, near(b));
        touch(b);
        if (fellOut(b, world)) break;
        if (depth < 1 && bounced(b, prev)) {
          flyFrom(b, depth + 1);
          break;
        }
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
      let dashing = 0;
      for (let i = 0; i < 300; i++) {
        const dir = i < m.release ? m.dir : m.turn ? -m.dir : 0;
        const second = m.second > 0 && air === m.second;
        const prev = b.y + PLAYER.h;
        if (m.dash > 0 && air === m.dash && dashing === 0) dashing = DASH.steps;
        if (dashing > 0) {
          const way = (m.dir || 1) as 1 | -1;
          dashStep(b, way, DASH.speed, world);
          if (--dashing === 0) b.vx = way * MOVE.run;
          air++;
        } else stepBody(b, { left: dir < 0, right: dir > 0, jumpHeld: (m.hold > 0 && i < m.hold) || second, jumpPressed: (m.hold > 0 && i === 0) || second }, world, { doubleJump: feather }, near(b));
        touch(b);
        if (fellOut(b, world)) break;
        const shot = launchers.find((l) => launcherHit(l, b));
        if (shot) {
          fire(shot, b);
          flyFrom(b);
          break;
        }
        if (bounced(b, prev)) {
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
