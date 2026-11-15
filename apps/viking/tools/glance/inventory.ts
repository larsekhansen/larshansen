// What each level has that order 18 recolours: enemies by look (kind, box, first place), carriers,
// ledges on a beat, one-way letters, hazards. For choosing where to photograph each kind.
//
//   bun tools/glance/inventory.ts [enemies|platforms]

import { TILE } from "@larshansen/pixelkit/config";
import { KIND } from "../../src/game/enemies";
import { BUILT, loadLevel } from "../../src/levels/index";

const what = process.argv[2] ?? "enemies";
const firstOf = new Map<string, string>();
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  if (what === "enemies") {
    const byLook = new Map<string, { kind: string; n: number; c: number; r: number; w: number; h: number }>();
    for (const e of def.enemies ?? []) {
      const k = KIND[e.kind];
      const had = byLook.get(e.look);
      if (had) had.n++;
      else byLook.set(e.look, { kind: e.kind, n: 1, c: e.c, r: e.r, w: e.w ?? k.w, h: e.h ?? k.h });
    }
    const own = def.art.enemy ? "own" : "";
    for (const [look, v] of byLook) {
      const first = !firstOf.has(look);
      if (first) firstOf.set(look, st.id);
      console.log(`${st.id.padEnd(16)} ${look.padEnd(10)} ${v.kind.padEnd(8)} n=${v.n} at c${v.c} r${v.r} x=${v.c * TILE} box ${v.w}x${v.h} ${own}${first ? " FIRST" : ""}`);
    }
  } else {
    const ledges = Object.keys(def.art.ledges ?? {});
    console.log(`${st.id.padEnd(16)} carriers ${def.carriers.length} timed ${def.timed.length} oneWay '${def.legend.oneWay}' ledgeLooks [${ledges.join(",")}] hazards ${def.hazards?.length ?? 0} grounds ${def.grounds ? "yes" : "no"} ownCarrier ${def.art.carrier ? "yes" : "no"} ownTimed ${def.art.timed ? "yes" : "no"}`);
    def.carriers.forEach((c, i) => console.log(`   carrier ${i} ${JSON.stringify(c).slice(0, 160)}`));
  }
}
