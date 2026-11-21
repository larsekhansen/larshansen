// Order 30 (debt 7): every enemy kind met in more than one level, in each level it is met in: where it stands, the level's
// lean of the glamour's two neons (its marks' `N` and `n`), and how far each of the two stands from that level's fields
// (CIEDE2000), by day and under the level's own sky (tinted as the palette test tints: the figure a quarter its own light).
// Prints a TSV for the table in `tools/review/o30/` and, with `--urls=<base>`, the addresses of the pictures in place.
//
//   bun tools/glance/leanplaces.ts [--urls=http://localhost:5184] > leans.tsv
import { TILE } from "@larshansen/pixelkit/config";
import type { Phase } from "@larshansen/pixelkit/oslo";

import { NEON_A, NEON_B, LEANS } from "../../src/alive/glamour";
import { BUILT, loadLevel } from "../../src/levels/index";
import type { LevelDef } from "../../src/levels/types";
import { deltaE, levelFields, mixRgb, parseColour, tinted, type Rgb } from "../../src/render/fields";

const base = process.argv.find((a) => a.startsWith("--urls="))?.slice(7);
const rgb = (c: string) => parseColour(c)!.rgb;
/** The phase a level's own sky is drawn at: its pinned sky's, or the evening for a level that follows the clock. */
const own = (def: LevelDef): Phase => (({ "17mai": "day", winterday: "day", winter: "night", day: "day", evening: "evening", twilight: "twilight", night: "night" }) as Record<string, Phase>)[def.sky ?? ""] ?? "evening";

const defs = new Map<string, LevelDef>();
const by = new Map<string, Map<string, { c: number; r: number }[]>>();
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  defs.set(st.id, def);
  for (const e of def.enemies ?? []) {
    const look = (e as { look?: string }).look ?? e.kind;
    const m = by.get(look) ?? new Map<string, { c: number; r: number }[]>();
    m.set(st.id, [...(m.get(st.id) ?? []), { c: e.c, r: e.r }]);
    by.set(look, m);
  }
}
const fieldsOf = new Map<string, Map<string, number>>();
const fields = (def: LevelDef, phase: Phase) => {
  const k = `${def.id} ${phase}`;
  if (!fieldsOf.has(k)) fieldsOf.set(k, levelFields(def, phase));
  return fieldsOf.get(k)!;
};
/** The nearest field to a neon under a phase, and how near. */
function nearest(def: LevelDef, neon: string, phase: Phase): { d: number; field: string } {
  const fg: Rgb = phase === "day" ? rgb(neon) : mixRgb(tinted(rgb(neon), phase), rgb(neon), 0.25);
  let best = { d: Infinity, field: "" };
  for (const f of fields(def, "day").keys()) {
    const d = deltaE(fg, tinted(rgb(f), phase));
    if (d < best.d) best = { d, field: f };
  }
  return best;
}
console.log(["kind", "level", "where (c,r)", "sky", "neon 1", "neon 2", "day: nearest field to 1 / 2", "own sky: nearest field to 1 / 2"].join("\t"));
const urls: string[] = [];
for (const [look, m] of by) {
  if (m.size < 2) continue;
  for (const [id, at] of m) {
    const def = defs.get(id)!;
    const lean = LEANS[id] ?? {};
    const a = lean[NEON_A] ?? NEON_A;
    const b = lean[NEON_B] ?? NEON_B;
    const sky = own(def);
    const f = (n: string, p: Phase) => {
      const x = nearest(def, n, p);
      return `${x.d.toFixed(1)} (${x.field})`;
    };
    console.log([look, id, at.map((p) => `${p.c},${p.r}`).join(" "), def.sky ?? "clock", a, b, `${f(a, "day")} / ${f(b, "day")}`, sky === "day" ? "" : `${f(a, sky)} / ${f(b, sky)}`].join("\t"));
    if (base) {
      const p = at[0];
      const x = Math.round(p.c * TILE + 8);
      const y = Math.round(p.r * TILE);
      for (const s of sky === "day" ? ["day"] : ["day", def.sky ?? "evening"]) urls.push(`${base}/viking/?debug&told&level=${id}&steps=2&sky=${s}&look=${x},${y}#${id}`);
    }
  }
}
if (base) console.error(urls.join("\n"));
