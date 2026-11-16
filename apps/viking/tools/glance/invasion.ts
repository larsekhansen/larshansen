// Where the invasion's evidence may stand in each level (order 27, section 3): columns on the ground with three rows of air
// over them, three tiles or more from any place the route leaves the ground or comes down, a pit or water, a door, a sign,
// a bench or a flag, at about a quarter, a half and three quarters of the level. A tool for choosing `PLACES` in
// `src/alive/invasion.ts`; the test holds what is chosen.
//
//   bun tools/glance/invasion.ts [level ...]

import { TILE } from "@larshansen/pixelkit/config";
import { BUILT, loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";
import type { Move } from "../../src/game/bot";
import { levelMap } from "../../src/game/play";
import { jumpsOf } from "../../src/alive/invasioncheck";

const only = process.argv.slice(2);
for (const st of BUILT) {
  if (only.length && !only.includes(st.id)) continue;
  const def = await loadLevel(st.id);
  const map = levelMap(def);
  const near = await jumpsOf(def, (ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`]);
  const ok: number[] = [];
  for (let c = 6; c < map.cols - 6; c++) {
    const x = c * TILE + TILE / 2;
    if (near.some((f) => Math.abs(f - x) < 3 * TILE)) continue;
    let r = -1;
    for (let k = 1; k < map.rows; k++) if (map.isSolid(c, k) && !map.isSolid(c, k - 1) && !map.isSolid(c, k - 2) && !map.isSolid(c, k - 3) && !map.isWater(c, k - 1)) r = k;
    if (r > 0) ok.push(c * 100 + r);
  }
  const pick = [0.22, 0.5, 0.78].map((f) => ok.reduce((b, v) => (Math.abs(Math.floor(v / 100) - f * map.cols) < Math.abs(Math.floor(b / 100) - f * map.cols) ? v : b), ok[0]));
  console.log(`${st.id} (${map.cols} columns): ${pick.map((v) => `[${Math.floor(v / 100)}, ${v % 100}]`).join(" ")}  (${ok.length} places)`);
}
