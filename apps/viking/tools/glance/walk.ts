// A walk through every level (order 20): a place every `every` columns, him standing on the first thing
// under it (or the nearest column that has one), as addresses for `tools/shots.ts` or `perf.ts`. Each line
// is a name (`<level>-c<column>`), a tab, and the address's path and query.
//
//   bun tools/glance/walk.ts [--every=20] [--levels=a,b] [--sky=day] [--steps=1] > walk.tsv
//
// Each level is walked under its own sky (Langkaia, which follows the clock, by day) unless `--sky` says.
// `flat.py` marks the pictures where a third of the view is one colour or one repeated tile.

import { TILE } from "@larshansen/pixelkit/config";
import { newPlay } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";

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
  const p = newPlay(def, { pole: i0 >= ORDER.indexOf("akerselva"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
  const m = p.map;
  const standable = (c: number) => c >= 0 && c < m.cols && m.surfaceBelow(c * TILE + TILE / 2, 0) !== null;
  // A level's own ground that is not in its map (Korketrekkeren's run): he is put just over it.
  const own = def.grounds?.everywhere() ?? [];
  const ownAt = (c: number) => own.find((s) => s.x <= c * TILE + TILE / 2 && c * TILE + TILE / 2 < s.x + s.w);
  for (let c = 0; c < m.cols; c += every) {
    // The nearest column with something under it, looking right first.
    let at = -1;
    for (let d = 0; d < every && at < 0; d++) at = standable(c + d) ? c + d : standable(c - d) ? c - d : -1;
    const ownGround = at < 0 || Math.abs(at - c) > 2 ? ownAt(c) : undefined;
    const where = ownGround ? `x=${c * TILE + TILE / 2}&y=${ownGround.y - 30}` : at >= 0 ? `x=${at * TILE + TILE / 2}` : null;
    if (!where) continue;
    const s = sky ?? (def.sky === null ? "day" : null);
    out.push(`${st.id}-c${String(c).padStart(3, "0")}\t/viking/?debug&steps=${steps}&level=${st.id}&${where}${s ? `&sky=${s}` : ""}#${st.id}`);
  }
}
console.log(out.join("\n"));
