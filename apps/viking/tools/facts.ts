// The levels' numbers for docs/games/LEVELS.html, read from the levels themselves: columns, the
// scripted clear (the routes the tests play), enemies, skilling, flags and benches. Writes them into
// the page between its FACTS markers, so the page is never written up by hand.
//
//   bun tools/facts.ts          (from apps/viking; prints the table and updates the page)

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { playMoves } from "../src/game/bot";
import { benchesOf, flagsOf, levelMap, newPlay } from "../src/game/play";
import { AKERSELVA } from "../src/levels/akerselva";
import { AKERSHUS } from "../src/levels/akershus";
import { EKEBERG } from "../src/levels/ekeberg";
import { HOLMENKOLLEN } from "../src/levels/holmenkollen";
import { LANGKAIA } from "../src/levels/langkaia";
import { NABOLAGET } from "../src/levels/nabolaget";
import { NORDMARKA } from "../src/levels/nordmarka";
import { RADHUSET } from "../src/levels/radhuset";
import { AKERSELVA_ROUTE, AKERSHUS_ROUTE, EKEBERG_ROUTE, HOLMENKOLLEN_ROUTE, LANGKAIA_ROUTE, NABOLAGET_ROUTE, NORDMARKA_ROUTE, RADHUSET_ROUTE, SLOTTET_ROUTE, STORTINGET_ROUTE } from "../src/levels/routes";
import { SLOTTET } from "../src/levels/slottet";
import { STORTINGET } from "../src/levels/stortinget";
import { MARKS } from "../src/levels/types";

const LEVELS = [
  [LANGKAIA, LANGKAIA_ROUTE, false],
  [AKERSHUS, AKERSHUS_ROUTE, false],
  [RADHUSET, RADHUSET_ROUTE, false],
  [SLOTTET, SLOTTET_ROUTE, false],
  [HOLMENKOLLEN, HOLMENKOLLEN_ROUTE, false],
  [AKERSELVA, AKERSELVA_ROUTE, true],
  [NORDMARKA, NORDMARKA_ROUTE, true],
  [STORTINGET, STORTINGET_ROUTE, true],
  [EKEBERG, EKEBERG_ROUTE, true],
  [NABOLAGET, NABOLAGET_ROUTE, true]
] as const;

const facts: Record<string, { cols: number; clear: number; enemies: number; coins: number; flags: number; benches: number }> = {};
for (const [def, route, pole] of LEVELS) {
  const map = levelMap(def);
  const r = playMoves(newPlay(def, { pole }), [...route], { max: 60 * 300 });
  if (!r.done) throw new Error(`${def.id}: the scripted route does not clear (${r.stuck})`);
  facts[def.id] = { cols: map.cols, clear: Math.round(r.seconds), enemies: (def.enemies ?? []).length, coins: map.find(MARKS.skilling).length, flags: flagsOf(map).length, benches: benchesOf(map).length };
}
console.table(facts);

const page = join(import.meta.dir, "../../../docs/games/LEVELS.html");
const html = readFileSync(page, "utf8");
const start = "// ---- FACTS: written by apps/viking/tools/facts.ts from the levels; do not edit by hand ----";
const end = "// ---- end of FACTS ----";
const i = html.indexOf(start);
const j = html.indexOf(end);
if (i < 0 || j < i) throw new Error("LEVELS.html has no FACTS markers");
const block = `${start}\nconst FACTS = ${JSON.stringify(facts, null, 0).replace(/},"/g, '},\n  "').replace(/^{/, "{\n  ").replace(/}}$/, "}\n}")};\n`;
writeFileSync(page, html.slice(0, i) + block + html.slice(j));
console.log(`written into ${page}`);
