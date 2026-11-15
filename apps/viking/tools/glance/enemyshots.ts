// The addresses for order 18's contact sheet of enemies: every kind of enemy once, on the ground it
// lives on, him three tiles away, with `?debug&where` marking where it is on the screen so a script can
// crop round it. One line per shot: a label, a tab, the address's path.
//
//   bun tools/glance/enemyshots.ts > enemies.txt

import { TILE } from "@larshansen/pixelkit/config";
import { placeBody } from "@larshansen/pixelkit/physics";
import { leap } from "../../src/game/enemies";
import { newPlay, stepPlay } from "../../src/game/play";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";
import { SHIELD_RULES } from "../../src/game/shield";

const IDLE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const seen = new Set<string>();
/** Where to look for a kind, when its first one is not the best to see (left empty: the first). */
const PREFER: Record<string, string> = {};

for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const i0 = ORDER.indexOf(st.id);
  for (const [i, e] of (def.enemies ?? []).entries()) {
    const kind = e.look === "gull" && e.kind === "thrower" ? "gull-thrower" : e.look;
    if (seen.has(kind) || (PREFER[kind] && PREFER[kind] !== st.id)) continue;
    seen.add(kind);
    // A jumper is photographed in the air: at a step near the top of its leap.
    let steps = 2;
    if (e.kind === "jumper") {
      const probe = newPlay(def, {});
      const en = probe.enemies[i];
      let best = 0;
      for (let t = 2; t < 600; t++) {
        const up = leap(en, t).up;
        if (up > best) {
          best = up;
          steps = t;
        }
      }
    }
    // He stands three tiles before it (a statue: after it, his back to it, so it walks).
    const statue = e.look === "statue" || e.look === "bronze";
    const ex = e.c * TILE + TILE / 2;
    const hx = Math.round(ex + (statue ? 3 : -3) * TILE);
    const hy = Math.max(0, (Math.floor(e.r) - 4) * TILE);
    const p = newPlay(def, { pole: i0 >= ORDER.indexOf("akerselva"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
    const at = p.map.surfaceBelow(hx, hy);
    if (at !== null) {
      placeBody(p.body, hx, at);
      p.lastGround = { x: hx, bottom: at };
    }
    for (let t = 0; t < steps; t++) stepPlay(p, IDLE);
    const en = p.enemies[i];
    const wy = Math.round(en.y - en.h / 2);
    for (const sky of ["day", "night"]) console.log(`${kind}\t${st.id}\t${sky}\t/viking/?debug&steps=${steps}&sky=${sky}&level=${st.id}&x=${hx}&y=${hy}&where=${Math.round(en.x)},${wy}#${st.id}`);
  }
}
