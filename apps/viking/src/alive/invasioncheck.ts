import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { playMoves, type Move } from "../game/bot";
import { levelMap, newPlay } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { ORDER } from "../levels/index";
import { MARKS, type LevelDef } from "../levels/types";

// For the test and the tool only (order 27): what the invasion's scenery must keep away from, as world x: every place the
// route leaves the ground or comes down, a pit or water, a door, a sign, a bench, a flag.

export async function jumpsOf(def: LevelDef, moves: Move[]): Promise<number[]> {
  const map = levelMap(def);
  const out: number[] = [];
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
  for (let c = 0; c < map.cols; c++) {
    let solid = false;
    let water = false;
    for (let r = 0; r < map.rows; r++) {
      if (map.isWater(c, r)) water = true;
      if (map.isSolid(c, r) || map.isOneWay(c, r)) solid = true;
    }
    if (water || !solid) out.push(c * TILE + TILE / 2);
  }
  for (const ch of [MARKS.start, MARKS.sign, MARKS.bench, MARKS.flag, MARKS.rune, MARKS.drum, MARKS.cannonLeft, MARKS.cannonRight]) for (const t of map.find(ch)) out.push(t.c * TILE + TILE / 2);
  for (const d of def.doors ?? []) for (const t of map.find(d.tile)) out.push(t.c * TILE + TILE / 2);
  return out.sort((a, b) => a - b);
}
