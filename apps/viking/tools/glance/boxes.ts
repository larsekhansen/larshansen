// Which enemies' boxes can grow by a quarter (order 18) without breaking a level's scripted clear: for a
// level, tries the route with every enemy grown, then with each enemy alone kept at its old box, and
// says which must keep theirs. The tests are the judge (`bun test`); this only finds where to look.
//
//   bun tools/glance/boxes.ts <level> [<level>...]

import { flagsOf, newPlay } from "../../src/game/play";
import { playMoves } from "../../src/game/bot";
import { SHIELD_RULES } from "../../src/game/shield";
import { loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";
import type { LevelDef } from "../../src/levels/types";

const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget", "bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]);

function clears(def: LevelDef): string {
  const p = newPlay(def, { pole: POLE.has(def.id), shield: SHIELD_RULES, hasShield: def.rune > 10 });
  const r = playMoves(p, (ROUTES as Record<string, Parameters<typeof playMoves>[1]>)[`${def.id.toUpperCase()}_ROUTE`], { max: 60 * 300 });
  const flags = r.events.filter((e) => e.flag !== null).length;
  const want = flagsOf(p.map).length;
  if (r.stuck) return `stuck: ${JSON.stringify(r.stuck).slice(0, 120)}`;
  if (!r.done || p.runeAt === null) return "not done";
  if (r.events.some((e) => e.splash)) return "splash";
  if (flags !== want) return `flags ${flags} of ${want}`;
  if (r.hurt.length) return `hurt ${JSON.stringify(r.hurt).slice(0, 160)}`;
  return "ok";
}

for (const id of process.argv.slice(2)) {
  const def = await loadLevel(id);
  const enemies = def.enemies ?? [];
  console.log(`${id}: all grown: ${clears(def)}`);
  for (let i = 0; i < enemies.length; i++) {
    const kept = { ...def, enemies: enemies.map((e, j) => (j === i ? { ...e, small: true } : e)) };
    const r = clears(kept);
    if (r === "ok") console.log(`  keeping #${i} ${enemies[i].kind}:${enemies[i].look}@${enemies[i].c} alone fixes it`);
  }
  // Each enemy grown alone (all others kept): which ones break it by themselves.
  for (let i = 0; i < enemies.length; i++) {
    const one = { ...def, enemies: enemies.map((e, j) => (j === i ? e : { ...e, small: true })) };
    const r = clears(one);
    if (r !== "ok") console.log(`  growing #${i} ${enemies[i].kind}:${enemies[i].look}@${enemies[i].c} alone breaks it: ${r}`);
  }
}
