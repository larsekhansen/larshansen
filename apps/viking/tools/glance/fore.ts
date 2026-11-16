// Where each level has room for something in front of him (order 23, section 3.4): the stretches of the level, as
// columns, where a thing passing him would cross the six tiles ahead of him with nothing there he must read (a jump,
// a pit or water, a patrol, a pickup: `src/alive/forecheck.ts`). The things are placed in `src/alive/fore.ts` from this.
//
//   bun tools/glance/fore.ts [level ...]

import { TILE } from "@larshansen/pixelkit/config";
import type { Move } from "../../src/game/bot";
import { BUILT, loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";
import { clearAt, featuresOf } from "../../src/alive/forecheck";
import { FORE } from "../../src/alive/fore";

const only = process.argv.slice(2);
for (const st of BUILT) {
  if (only.length && !only.includes(st.id)) continue;
  const def = await loadLevel(st.id);
  const route = (ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`];
  const feats = featuresOf(def, route);
  const width = def.map[0].length * TILE;
  const runs: [number, number][] = [];
  for (let x = 4 * TILE; x < width - 4 * TILE; x += TILE / 2) {
    if (!clearAt(x, feats)) continue;
    const last = runs.at(-1);
    if (last && x - last[1] <= TILE / 2) last[1] = x;
    else runs.push([x, x]);
  }
  const placed = (FORE[st.id] ?? []).map((f) => `${(f.x / TILE).toFixed(1)}${clearAt(f.x, feats) ? "" : " (NOT CLEAR)"}`);
  console.log(`${st.id}: ${runs.map(([a, b]) => (a === b ? (a / TILE).toFixed(1) : `${(a / TILE).toFixed(1)}-${(b / TILE).toFixed(1)}`)).join(", ") || "nowhere"}${placed.length ? `; placed at ${placed.join(", ")}` : ""}`);
}
