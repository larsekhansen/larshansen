// A walk through every level (order 20): a place every `every` columns along the level's scripted route,
// where the route first stands past that column (on the ground, a ledge or what carries it), as addresses
// for `tools/shots.ts` or `perf.ts`. Each line is a name (`<level>-c<column>`), a tab, and the address's path
// and query: him put there (`x`, `y`), one step, the level's own sky (Langkaia, which follows the clock,
// by day) unless `--sky` says.
//
//   bun tools/glance/walk.ts [--every=20] [--levels=a,b] [--sky=day] [--steps=1] > walk.tsv
//
// `flat.py` marks the pictures where a third of the view is one colour or one repeated tile, or where the far
// backdrop is empty.

import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { autopilot, type Move } from "../../src/game/bot";
import { newPlay, stepPlay } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";

const args = process.argv.slice(2);
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const every = Number(opt("every") ?? 20);
const steps = Number(opt("steps") ?? 1);
const only = opt("levels")?.split(",");
const sky = opt("sky");

const out: string[] = [];
for (const st of BUILT) {
  if (only && !only.includes(st.id)) continue;
  const def = await loadLevel(st.id);
  const i0 = ORDER.indexOf(st.id);
  const p = newPlay(def, { pole: i0 > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: def.rune > 10 });
  const pilot = autopilot((ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`]);
  const s = sky ?? (def.sky === null ? "day" : null);
  let next = 0;
  for (let n = 0; n < 60 * 400 && p.runeAt === null && next * TILE < p.map.width; n++) {
    const k = pilot(p);
    if (!k) break;
    stepPlay(p, k);
    const b = p.body;
    const mid = b.x + PLAYER.w / 2;
    // The first step it stands at or past the column (in the air it waits until it lands).
    if (mid < next * TILE || !b.onGround) continue;
    out.push(`${st.id}-c${String(next).padStart(3, "0")}\t/viking/?debug&steps=${steps}&level=${st.id}&x=${Math.round(mid)}&y=${Math.round(b.y + PLAYER.h - 24)}${s ? `&sky=${s}` : ""}#${st.id}`);
    while (next * TILE <= mid) next += every;
  }
}
console.log(out.join("\n"));
