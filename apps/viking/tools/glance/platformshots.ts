// The addresses for order 18's contact sheet of platforms: every kind of thing he stands on once, on its
// own level, him three tiles before it, with `?debug&where` marking it for the crop and (since order 19)
// `?debug&look` putting the camera on it, so every row shows its subject. One line per shot: a label, the
// level, the sky, the address's path. `sheet.py` makes the contact sheet.
//
//   bun tools/glance/platformshots.ts > platforms.tsv

import { TILE } from "@larshansen/pixelkit/config";
import { carrierDrawn, carrierShown } from "@larshansen/pixelkit/carrier";
import { newPlay, stepPlay } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import { skyOf } from "./skies";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";
import { MARKS } from "../../src/levels/types";

const IDLE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const out: string[] = [];

for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const i0 = ORDER.indexOf(st.id);
  const p = newPlay(def, { pole: i0 >= ORDER.indexOf("akerselva"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
  for (let t = 0; t < 2; t++) stepPlay(p, IDLE);
  const things: { label: string; x: number; y: number; w: number }[] = [];
  // Carriers: one of each kind and width.
  const seen = new Set<string>();
  def.carriers.forEach((d, i) => {
    const key = `${d.kind}:${d.w}`;
    if (seen.has(key) || !carrierShown(d, 2)) return;
    seen.add(key);
    const at = carrierDrawn(d, 2, 1);
    things.push({ label: `carrier ${i} (${d.kind})`, x: at.x, y: at.y, w: d.w });
  });
  // A ledge on a beat.
  if (def.timed.length) things.push({ label: "on a beat", x: def.timed[0].x, y: def.timed[0].y, w: def.timed[0].w });
  // Its own ground: one of each way it stands.
  const how = new Set<string>();
  for (const s of (p.grounds && def.grounds?.stands?.(p.grounds.state, p.t)) ?? []) {
    if (how.has(s.how)) continue;
    how.add(s.how);
    things.push({ label: `own ground (${s.how})`, x: s.x, y: s.y, w: s.w });
  }
  // A statue he can stand on.
  const statue = p.enemies.find((e) => e.def.look === "statue");
  if (statue) things.push({ label: "statue", x: statue.x - statue.w / 2, y: statue.y - statue.h, w: statue.w });
  // The first one-way ledge past the start with no sign near where he stands for it: a sign's bubble would
  // cover the ledge (Langkaia's, at 390 wide; order 20).
  const signNear = (x: number) => def.map.some((row) => [...row].some((ch, c) => ch === MARKS.sign && Math.abs(c * TILE + TILE / 2 - x) < 5 * TILE));
  outer: for (let c = Math.floor(p.body.x / TILE) + 4; c < p.map.cols; c++)
    for (let r = 0; r < p.map.rows; r++)
      if (p.map.isOneWay(c, r) && !p.map.isOneWay(c, r - 1) && !signNear(c * TILE - 3 * TILE)) {
        things.push({ label: "one-way ledge", x: c * TILE, y: r * TILE, w: TILE });
        break outer;
      }
  for (const th of things) {
    // Him three tiles before it, on whatever is under that spot, from its height (a statue: after it, facing it).
    const statueish = th.label === "statue";
    const hx = Math.round(statueish ? th.x - 2 * TILE : th.x - 3 * TILE);
    const hy = Math.max(0, Math.round(th.y - 2 * TILE));
    for (const sky of ["day", skyOf(def)]) out.push(`${th.label}\t${st.id}\t${sky}\t/viking/?debug&steps=2&sky=${sky}&level=${st.id}&x=${hx}&y=${hy}&where=${Math.round(th.x + th.w / 2)},${Math.round(th.y)}&look=${Math.round(th.x + th.w / 2)},${Math.round(th.y)}#${st.id}`);
  }
}
console.log(out.join("\n"));
