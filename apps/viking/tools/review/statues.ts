// Line 2 review (15 November 2026): solid tiles over each statue's walk, and three-row walls beside it (can a statue be a trap?). Run: bun statues.ts
import { LEVELS, play as P } from "./common.ts";
const def = LEVELS.find((l) => l[0] === "vigelandsparken")![1] as any;
const map = P.levelMap(def);
for (const e of def.enemies.filter((d: any) => d.look === "statue" || d.look === "bronze")) {
  const lo = Math.floor(e.c - (e.range ?? 0)) - 1, hi = Math.ceil(e.c + (e.range ?? 0)) + 1;
  const ceil: string[] = [];
  for (let c = lo; c <= hi; c++) for (let r = e.r - 5; r < e.r; r++) if (map.isSolid(c, r)) ceil.push(`${c},${r}`);
  const walls: string[] = [];
  for (let c = lo; c <= hi; c++) if (map.isSolid(c, e.r) && map.isSolid(c, e.r - 1) && map.isSolid(c, e.r - 2)) walls.push(String(c));
  console.log(`${e.look} at col ${e.c} range ${e.range}: solid within 5 rows over its walk: ${ceil.length ? ceil.join(" ") : "none"}; 3-row walls beside it: ${walls.length ? walls.join(",") : "none"}`);
}
