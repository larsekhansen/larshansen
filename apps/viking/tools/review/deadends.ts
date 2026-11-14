// Dead ends: places he can get to from the start (or a respawn) from which he can neither reach the
// rune nor fall to a respawn. A graph version of apps/viking/src/game/reach.ts's search (same moves,
// same generous world: every carrier everywhere it ever goes, ledges on a beat always there, enemies
// and sheep as trampolines all along their patrol), recording which landing spot leads to which.
// What this calls a dead end is, in the real level, at least as dead (the real world has less to
// stand on), unless an enemy that hurts him walks into it.
//
// Run: bun deadends.ts [level] [pole=auto|0|1]

import { carrierAt, carrierPeriod, carrierShown } from "../../../../packages/pixelkit/src/carrier.ts";
import { fellOut } from "../../../../packages/pixelkit/src/checkpoint.ts";
import { DASH, MOVE, PLAYER, TILE } from "../../../../packages/pixelkit/src/config.ts";
import { fire, launcherHit } from "../../../../packages/pixelkit/src/launcher.ts";
import { bounce, createBody, dashStep, stepBody } from "../../../../packages/pixelkit/src/physics.ts";
import { zonePush } from "../../../../packages/pixelkit/src/zone.ts";
import { LEVELS, POLE, play as P } from "./common.ts";
const { everywhere, pads } = await import("../../src/game/reach.ts");

const BUCKET = 4;
const key = (x: number, feet: number) => `${Math.round(x / BUCKET)},${Math.round(feet)}`;

function fastWorld(def: any) {
  const map = P.levelMap(def);
  const cols = map.cols, rows = map.rows;
  const solid = new Uint8Array(cols * rows), oneWay = new Uint8Array(cols * rows), water = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      solid[r * cols + c] = map.isSolid(c, r) ? 1 : 0;
      oneWay[r * cols + c] = map.isOneWay(c, r) ? 1 : 0;
      water[r * cols + c] = map.isWater(c, r) ? 1 : 0;
    }
  return {
    width: map.width,
    height: map.height,
    isSolid: (c: number, r: number) => (c < 0 || c >= cols || r >= rows ? true : r < 0 ? false : solid[r * cols + c] === 1),
    isOneWay: (c: number, r: number) => c >= 0 && c < cols && r >= 0 && r < rows && oneWay[r * cols + c] === 1,
    isWater: (c: number, r: number) => c >= 0 && c < cols && r >= 0 && r < rows && water[r * cols + c] === 1,
    rampAt: map.ramps.length > 0 ? map.rampAt : () => null
  };
}

function moveList(pole: boolean) {
  const out: any[] = [];
  for (const dir of [-1, 0, 1])
    for (const hold of [0, 5, 12, 40])
      for (const running of dir === 0 ? [false] : [false, true])
        for (const release of dir === 0 ? [999] : [4, 10, 18, 999])
          for (const turn of release === 999 || hold === 0 ? [false] : [false, true]) out.push({ dir, hold, running, release, turn, second: 0, dash: 0 });
  if (pole) for (const dir of [-1, 1]) for (const hold of [0, 40]) for (const dash of [1, 10, 18, 26]) out.push({ dir, hold, running: true, release: 999, turn: false, second: 0, dash });
  return out;
}
const DROPS = [-1, 0, 1].map((dir) => ({ dir, hold: 0, running: false, release: 999, turn: false, second: 0, dash: 0, drop: 12 }));

export function graph(def: any, starts: { x: number; feet: number }[], pole: boolean, rune: any) {
  const world = fastWorld(def);
  const map = P.levelMap(def);
  const buckets = new Map<number, any[]>();
  for (const c of everywhere(def))
    for (let k = Math.floor((c.x - 16) / 64); k <= Math.floor((c.x + c.w + 16) / 64); k++) {
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(c);
    }
  const surfaceAt = def.surfaceAt ? (x: number, y: number) => def.surfaceAt(x, y, 0) : undefined;
  const near = (b: any, loose = false) => ({ carriers: loose ? [] : buckets.get(Math.floor((b.x + PLAYER.w / 2) / 64)) ?? [], surfaceAt, push: zonePush(def.zones, b) });
  const launchers = [...P.cannonsOf(def, map), ...P.drumsOf(def, map)];
  const tramps = pads(def);
  const list = moveList(pole);
  const spot = new Map<string, { x: number; feet: number; out: Set<string>; rune: boolean; die: boolean }>();
  const queue: string[] = [];
  const add = (x: number, feet: number) => {
    const k = key(x, feet);
    if (!spot.has(k)) {
      spot.set(k, { x, feet, out: new Set(), rune: false, die: false });
      queue.push(k);
    }
    return k;
  };
  for (const s of starts) add(s.x, s.feet);
  while (queue.length) {
    const ks = queue.pop()!;
    const s = spot.get(ks)!;
    const touch = (b: any) => {
      if (b.x < rune.x + rune.w && b.x + PLAYER.w > rune.x && b.y < rune.y + rune.h && b.y + PLAYER.h > rune.y) s.rune = true;
    };
    const land = (b: any) => s.out.add(add(b.x, b.y + PLAYER.h));
    const bounced = (b: any, prevFeet: number) => {
      if (b.vy <= 0) return false;
      const feet = b.y + PLAYER.h;
      for (const p of tramps)
        if (b.x + PLAYER.w > p.x0 && b.x < p.x1 && feet >= p.y0 && prevFeet <= p.y1) {
          b.y = Math.max(p.y0, Math.min(p.y1, prevFeet)) - PLAYER.h;
          bounce(b, p.speed);
          return true;
        }
      return false;
    };
    const flyFrom = (b0: any, depth = 0) => {
      for (const lean of [-1, 0, 1]) {
        const b = { ...b0 };
        for (let i = 0; i < 400; i++) {
          const prev = b.y + PLAYER.h;
          stepBody(b, { left: lean < 0, right: lean > 0, jumpHeld: true, jumpPressed: false }, world, {}, near(b));
          touch(b);
          if (fellOut(b, world)) {
            s.die = true;
            break;
          }
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
    const held = map.supports(createBody(s.x + PLAYER.w / 2, s.feet));
    for (const m of held ? list : [...list, ...DROPS]) {
      const b: any = createBody(s.x + PLAYER.w / 2, s.feet);
      if (m.running) b.vx = m.dir * MOVE.run;
      let air = 0;
      let dashing = 0;
      for (let i = 0; i < 300; i++) {
        const dir = i < m.release ? m.dir : m.turn ? -m.dir : 0;
        const prev = b.y + PLAYER.h;
        if (m.dash > 0 && air === m.dash && dashing === 0) dashing = DASH.steps;
        if (dashing > 0) {
          const way = (m.dir || 1) as 1 | -1;
          dashStep(b, way, DASH.speed, world as any);
          if (--dashing === 0) b.vx = way * MOVE.run;
          air++;
        } else {
          const loose = m.drop !== undefined && i < m.drop;
          if (loose) b.onGround = false;
          stepBody(b, { left: dir < 0, right: dir > 0, jumpHeld: m.hold > 0 && i < m.hold, jumpPressed: m.hold > 0 && i === 0 }, world as any, {}, near(b, loose));
        }
        touch(b);
        if (fellOut(b, world)) {
          s.die = true;
          break;
        }
        const shot = launchers.find((l: any) => launcherHit(l, b));
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
  return spot;
}

if (import.meta.main) {
  const only = process.argv[2];
  for (const [id, def] of LEVELS) {
    if (only && only !== id) continue;
    const map = P.levelMap(def);
    const s = map.spawn();
    const pole = POLE.has(id);
    const t0 = performance.now();
    const g = graph(def, [{ x: s.x - PLAYER.w / 2, feet: s.bottom }], pole, P.runeOf(map));
    // Reverse: which spots lead to the rune or to a fall (a respawn).
    const back = new Map<string, string[]>();
    for (const [k, v] of g) for (const o of v.out) back.set(o, [...(back.get(o) ?? []), k]);
    const good = new Set<string>();
    const q: string[] = [];
    for (const [k, v] of g) if (v.rune || v.die) (good.add(k), q.push(k));
    while (q.length) {
      const k = q.pop()!;
      for (const b of back.get(k) ?? []) if (!good.has(b)) (good.add(b), q.push(b));
    }
    const runeOnly = new Set<string>();
    for (const [k, v] of g) if (v.rune) (runeOnly.add(k), q.push(k));
    while (q.length) {
      const k = q.pop()!;
      for (const b of back.get(k) ?? []) if (!runeOnly.has(b)) (runeOnly.add(b), q.push(b));
    }
    const dead = [...g.entries()].filter(([k]) => !good.has(k));
    const noRune = [...g.entries()].filter(([k]) => !runeOnly.has(k));
    // Group dead spots by area (column ranges per floor).
    const group = (list: any[]) => {
      const byFeet = new Map<number, number[]>();
      for (const [, v] of list) byFeet.set(Math.round(v.feet), [...(byFeet.get(Math.round(v.feet)) ?? []), Math.floor((v.x + 5) / 16)]);
      return [...byFeet.entries()].sort((a, b) => a[1][0] - b[1][0]).map(([f, cs]) => `row ${(f / 16).toFixed(1)} cols ${Math.min(...cs)}-${Math.max(...cs)} (${cs.length})`);
    };
    console.log(`${id}: ${g.size} spots, ${(performance.now() - t0) / 1000 | 0} s; dead ends (no rune, no fall): ${dead.length}${dead.length ? "\n   " + group(dead).join("\n   ") : ""}\n   no way to the rune except by dying: ${noRune.length}${noRune.length ? "\n   " + group(noRune).slice(0, 30).join("\n   ") : ""}`);
  }
}
