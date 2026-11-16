// The ground under him (order 26): what every level's tiles paint, by day, as the palette test sees it (`levelPaint`'s
// `ground`), measured three ways: its fields' least distance (CIEDE2000) to each role's colours; its band (saturation's
// middle and nine tenths, value's tenth, middle and nine tenths, as order 22 measured what is behind the lane); and how
// far the figures (him, the enemies' bodies, the calm outline) stand from it. Written as JSON, so a build before and a
// build after can be compared (`tools/review/o26/`).
//
//   bun tools/glance/ground.ts > ground.json

import { ROLES, STAND } from "@larshansen/pixelkit/palette";
import { BUILT, loadLevel } from "../../src/levels/index";
import { FIELD_SHARE, deltaE, levelPaint, parseColour, percentile, satVal, shares } from "../../src/render/fields";

const rgb = (c: string) => parseColour(c)!.rgb;
/** What is a role's own colour drawn on the ground (the paint, a ledge's teal, the line under it): not ground. */
const OWN = [...ROLES.COLOURS.stand, STAND.worn, STAND.under, STAND.mark];
const isOwn = (c: string) => OWN.some((o) => deltaE(rgb(c), rgb(o)) < 1);
const ROLE_SETS: Record<string, readonly string[]> = { ...ROLES.COLOURS };

const out: Record<string, unknown> = {};
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const p = levelPaint(def, "day");
  const ground = new Map([...p.ground].filter(([c]) => !isOwn(c)));
  const fields = shares([ground], FIELD_SHARE);
  const least: Record<string, { d: number; field: string; role: string }> = {};
  for (const [role, colours] of Object.entries(ROLE_SETS)) {
    if (role === "stand") continue;
    let best = { d: Infinity, field: "", role: "" };
    for (const f of fields.keys()) for (const c of colours) {
      const d = deltaE(rgb(f), rgb(c));
      if (d < best.d) best = { d, field: f, role: c };
    }
    least[role] = { d: Math.round(best.d * 100) / 100, field: best.field, role: best.role };
  }
  const xs = [...ground].map(([c, a]) => ({ ...satVal(rgb(c)), w: a }));
  const pc = (k: "s" | "v", q: number) => Math.round(percentile(xs.map((a) => ({ x: a[k], w: a.w })), q) * 1000) / 1000;
  // How far a figure stands from the ground, area-weighted: the share of the ground within 20 of each figure's colours.
  const total = [...ground.values()].reduce((a, b) => a + b, 0);
  const figures = { him: [ROLES.him.tunic, ROLES.him.tunicLit, ROLES.him.tunicShade, ROLES.him.skin, ROLES.him.helmet], enemy: ROLES.COLOURS.enemy.slice(1), calm: ROLES.COLOURS.calm };
  const within: Record<string, number> = {};
  const median: Record<string, number> = {};
  for (const [who, cs] of Object.entries(figures)) {
    let near = 0;
    const ds: { x: number; w: number }[] = [];
    for (const [g, a] of ground) {
      const d = Math.min(...cs.map((c) => deltaE(rgb(g), rgb(c))));
      if (d < 20) near += a;
      ds.push({ x: d, w: a });
    }
    within[who] = Math.round((near / total) * 1000) / 1000;
    median[who] = Math.round(percentile(ds, 0.5) * 10) / 10;
  }
  out[st.id] = { fields: fields.size, colours: ground.size, painted: [...ground.keys()].sort(), fieldList: [...fields.keys()].sort(), least, band: { s50: pc("s", 0.5), s90: pc("s", 0.9), v10: pc("v", 0.1), v50: pc("v", 0.5), v90: pc("v", 0.9) }, figureMedian: median, within20: within };
}
console.log(JSON.stringify(out, null, 1));
