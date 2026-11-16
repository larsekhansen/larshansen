import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { playMoves, type Move } from "../game/bot";
import { levelMap, newPlay } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { ORDER } from "../levels/index";
import type { LevelDef } from "../levels/types";
import { READ_AHEAD, READ_BEHIND } from "./fore";

// For the test and the tool only (order 23, section 3.4): where in a level something may pass in front of him. What
// he must read is never behind it: a jump (where the route leaves the ground and where it comes down), a pit or water,
// an enemy's patrol, and a pickup (a skilling, the cheese, the bracteate, the rune). A thing passing at 1.5 to 2 times
// the camera's speed crosses the six tiles ahead of him while he goes from about three and a half tiles before the
// place it passes him to that place, so the stretch from `READ_BEHIND` before it to `READ_AHEAD` after it must have
// none of them.

/** Every place in a level he must read, as world x: what the route jumps from and to, pits and water, patrols, pickups. */
export function featuresOf(def: LevelDef, moves: Move[]): number[] {
  const map = levelMap(def);
  const out: number[] = [];
  // The route's jumps: where he left the ground and where he came down, every time.
  let from: number | null = null;
  const watched = moves.map((m): Move => ({
    name: m.name,
    keys(q, s) {
      const x = q.body.x + PLAYER.w / 2;
      if (q.body.onGround) {
        if (from !== null) out.push(from, x);
        from = null;
      } else if (from === null && !q.riding) from = x;
      return m.keys(q, s);
    }
  }));
  const pole = ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen");
  const p = newPlay(def, { pole, shield: SHIELD_RULES, hasShield: def.rune > 10 });
  playMoves(p, watched, { max: 60 * 300 });
  // Pits and water: a column with water in it, or nothing to stand on all the way down.
  for (let c = 0; c < map.cols; c++) {
    let solid = false;
    let water = false;
    for (let r = 0; r < map.rows; r++) {
      if (map.isWater(c, r)) water = true;
      if (map.isSolid(c, r) || map.isOneWay(c, r)) solid = true;
    }
    if (water || !solid) out.push(c * TILE + TILE / 2);
  }
  const fresh = newPlay(def, { pole, shield: SHIELD_RULES, hasShield: def.rune > 10 });
  for (const e of fresh.enemies) {
    const reach = (e.def.range ?? 0) * TILE + e.w / 2;
    for (let x = e.home - reach; x <= e.home + reach; x += TILE / 2) out.push(x);
  }
  for (const s of fresh.skilling) out.push(s.box.x + s.box.w / 2);
  if (fresh.cheese) out.push(fresh.cheese.box.x + 6);
  if (fresh.bracteate) out.push(fresh.bracteate.x + 6);
  if (fresh.rune) out.push(fresh.rune.x + 8);
  return out.sort((a, b) => a - b);
}

/** True when nothing he must read lies in the stretch a thing passing him at `x` crosses ahead of him. */
export function clearAt(x: number, features: readonly number[]): boolean {
  return !features.some((f) => f >= x - READ_BEHIND && f <= x + READ_AHEAD);
}
