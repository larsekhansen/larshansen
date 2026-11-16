// The edge's forgiveness (order 23, section 4): what the reach search finds with the jump still working 6 steps after
// walking off an edge, and with 10. The search is run with its usual moves and, as well, walking or running off an
// edge and jumping 1 to `coyoteSteps - 1` steps after leaving it (`search`'s `edge`, which only this tool asks for).
// For each level: the spots he can stand on each way, those only the longer forgiveness reaches (and where), and
// whether the rune and the bracteate (which must need the feather) are touched without the feather.
//
//   bun edge.ts [level ...]      (from tools/review; one level takes about a minute on the Pi)

import { JUMP, PLAYER, TILE } from "@larshansen/pixelkit/config";
import { ORDER } from "../../src/levels/index";
import { search } from "../../src/game/reach";
import { bracteateOf, flagsOf, levelMap, runeOf } from "../../src/game/play";
import { LEVELS } from "./common";

const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
/** `--where`: the spots only the longer forgiveness reaches, as column and the row his feet stand on. */
const where = process.argv.includes("--where");
const key = (s: { x: number; feet: number }) => `${Math.round(s.x / 4)},${Math.round(s.feet / 4)}`;
for (const [id, def0] of LEVELS as unknown as [string, any][]) {
  if (only.length && !only.includes(id)) continue;
  const pole = ORDER.indexOf(id) >= ORDER.indexOf("akerselva");
  // A level whose stones rise is searched with every stone risen, and from the start and every flag with none.
  const worlds: [string, any, any][] = def0.risen
    ? [["every stone risen", { ...def0, legend: { ...def0.legend, solid: def0.legend.solid + def0.risen.solid, oneWay: def0.legend.oneWay + def0.risen.oneWay } }, undefined], ...[undefined, ...flagsOf(levelMap(def0))].map((f) => [`no stone risen from ${f ? `column ${Math.floor(f.x / TILE)}` : "the start"}`, def0, f] as [string, any, any])]
    : [["", def0, undefined]];
  for (const [label, def, from] of worlds) {
    const map = levelMap(def);
    const s = from ?? map.spawn();
    const boxes = [runeOf(map)!, bracteateOf(map)!];
    const run = (coyote: number) => {
      const was = JUMP.coyoteSteps;
      JUMP.coyoteSteps = coyote;
      try {
        const edge = Array.from({ length: coyote - 1 }, (_, k) => k + 1);
        return search(def, { x: s.x - PLAYER.w / 2, feet: s.bottom }, false, boxes, { pole, edge });
      } finally {
        JUMP.coyoteSteps = was;
      }
    };
    const t0 = performance.now();
    const a = run(6);
    const b = run(10);
    const had = new Set(a.spots.map(key));
    const fresh = b.spots.filter((x) => !had.has(key(x)));
    const cols = [...new Set(fresh.map((x) => Math.floor((x.x + PLAYER.w / 2) / TILE)))].sort((p, q) => p - q);
    console.log(
      `${id}${label ? ` (${label})` : ""}: ${a.spots.length} spots with 6, ${b.spots.length} with 10, ${fresh.length} only with 10${cols.length ? ` (columns ${cols.join(", ")})` : ""}; rune ${a.hit[0]} / ${b.hit[0]}; bracteate without the feather ${a.hit[1]} / ${b.hit[1]}; ${Math.round((performance.now() - t0) / 1000)} s`
    );
    if (where && fresh.length) console.log(`  ${fresh.map((x) => `${Math.floor((x.x + PLAYER.w / 2) / TILE)},${(x.feet / TILE).toFixed(2)}`).join("  ")}`);
  }
}
