// Every yellow and gold a level paints (order 22, A4): each level drawn as the palette test draws its fields
// (`render/fields.ts`, its far layers, street, water, tiles and what it draws in front, by day), every colour kept
// whatever its share, and those whose hue is yellow to gold (35 to 70 degrees) with some saturation and light listed
// with the share of the level's painted area they cover and how near they are (CIEDE2000) to the paint on what he
// stands on and to the gold of what he takes. What the page and the kit draw outside the levels (lights after
// dark, the sun, the skilling, the cheese, his rim) is not in it: those are listed by hand in the hand-back.
//
//   bun tools/glance/yellows.ts [--all]        (--all: every colour of a yellow hue, however small)

import { COIN, STAND } from "@larshansen/pixelkit/palette";
import { BUILT, loadLevel } from "../../src/levels/index";
import { deltaE, levelPaint, parseColour, shares } from "../../src/render/fields";

const all = process.argv.includes("--all");
const rgb = (c: string) => parseColour(c)!.rgb;
function hsv([r, g, b]: [number, number, number]) {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  const d = mx - mn;
  let h = 0;
  if (d) {
    const [R, G, B] = [r / 255, g / 255, b / 255];
    h = mx === R ? ((G - B) / d) % 6 : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: mx ? d / mx : 0, v: mx };
}
const rows: { level: string; c: string; share: number; dPaint: number; dGold: number; s: number; v: number }[] = [];
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const p = levelPaint(def, "day");
  const f = shares([p.sky, p.far, p.mid, p.near, p.lane, p.things]);
  for (const [c, share] of f) {
    const x = hsv(rgb(c));
    if (x.h < 35 || x.h > 70 || x.s < (all ? 0.15 : 0.3) || x.v < 0.4) continue;
    if (!all && share < 0.0002) continue;
    rows.push({ level: st.id, c, share, dPaint: deltaE(rgb(c), rgb(STAND.top)), dGold: deltaE(rgb(c), rgb(COIN.gold)), s: x.s, v: x.v });
  }
}
rows.sort((a, b) => a.dPaint - b.dPaint);
console.log("| colour | level | share of what it paints | saturation | value | from the paint | from the gold |");
console.log("|---|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.c} | ${r.level} | ${(r.share * 100).toFixed(2)} % | ${r.s.toFixed(2)} | ${r.v.toFixed(2)} | ${r.dPaint.toFixed(1)} | ${r.dGold.toFixed(1)} |`);
