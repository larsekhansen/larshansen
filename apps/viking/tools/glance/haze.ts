// The haze behind the play lane (order 22, A6): for every level, the far layers' saturation and value (HSV, weighted
// by area, by day, with the haze each layer is drawn with) against the street's (its backdrop, water and tiles) and
// against the figures (him, the enemies' bodies, the paint and the platforms' bodies, what he takes). With `--try=a,b,c`
// the far, mid and near layers' haze is that instead of each level's own, to choose strengths by.
//
//   bun tools/glance/haze.ts [--try=0.3,0.2,0.1]

import { horizonColor } from "@larshansen/pixelkit/sky";
import { ROLES } from "@larshansen/pixelkit/palette";
import { BUILT, loadLevel } from "../../src/levels/index";
import { backdropBand, parseColour, percentile, satVal } from "../../src/render/fields";
import { airOf, hazeOf } from "../../src/render/haze";

const tried = process.argv.find((a) => a.startsWith("--try="))?.slice(6).split(",").map(Number) as [number, number, number] | undefined;
const figures = ["him", "enemy", "stand", "take"].flatMap((r) => ROLES.COLOURS[r]).map((c) => satVal(parseColour(c)!.rgb));
const fs50 = percentile(figures.map((f) => ({ x: f.s, w: 1 })), 0.5);
const fv50 = percentile(figures.map((f) => ({ x: f.v, w: 1 })), 0.5);
console.log(`The figures: saturation, middle ${fs50.toFixed(2)}; value, middle ${fv50.toFixed(2)}`);
console.log("| level | haze (far, mid, near) | air | behind: saturation 50 / 90 % | behind: value 10 / 50 / 90 % | street: saturation 50 / 90 % | street: value 10 / 50 / 90 % |");
console.log("|---|---|---|---|---|---|---|");
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const haze = tried ?? hazeOf(def);
  const air = airOf(def, "day") ?? horizonColor("day");
  const b = backdropBand(def, haze, air);
  const f = (x: number) => x.toFixed(2);
  console.log(`| ${st.id} | ${haze.join(", ")} | ${air} | ${b.back ? `${f(b.back.s50)} / ${f(b.back.s90)}` : "none"} | ${b.back ? `${f(b.back.v10)} / ${f(b.back.v50)} / ${f(b.back.v90)}` : "none"} | ${f(b.lane.s50)} / ${f(b.lane.s90)} | ${f(b.lane.v10)} / ${f(b.lane.v50)} / ${f(b.lane.v90)} |`);
}
