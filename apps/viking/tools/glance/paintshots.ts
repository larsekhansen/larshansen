// The addresses for order 22's contact sheets of what moves and does not hurt (sheep, the moose, a watched
// statue, a guard still stone, a sledger pulled off, a calm swan, the heron, the troll asleep, the plough parked,
// the serpent dazed, Slottet's parade) and of what he takes (each level's cheese and bracteate, the first
// skilling, the shield where it is given, a rune), in the format `sheet.py` reads: a label, the level, the sky,
// the address's path. Each is taken by day and under the level's own sky (`skyOf`), the night where its own is
// the day's. A third kind of line, with `wait` after the path, is played by the scripted route and needs
// `tools/shots.ts --wait=5000`.
//
//   bun tools/glance/paintshots.ts movers > movers.tsv
//   bun tools/glance/paintshots.ts pickups > pickups.tsv

import { TILE } from "@larshansen/pixelkit/config";
import { carrierDrawn } from "@larshansen/pixelkit/carrier";
import { placeBody } from "@larshansen/pixelkit/physics";
import { playMoves, type Move } from "../../src/game/bot";
import { newPlay, stepPlay, type Play } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import { BUILT, ORDER, loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";
import type { LevelDef } from "../../src/levels/types";
import { skyOf } from "./skies";

const what = process.argv[2] ?? "movers";
const IDLE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const out: string[] = [];
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];

function fresh(def: LevelDef) {
  const i0 = ORDER.indexOf(def.id);
  return newPlay(def, { pole: i0 >= ORDER.indexOf("akerselva"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
}

/** Him at hx, dropped onto whatever is under (hx, hy); then `steps` steps standing; the lines for its two skies. */
function shot(def: LevelDef, label: string, hx: number, hy: number, at: { x: number; y: number }, steps = 2, extra = "") {
  for (const sky of ["day", skyOf(def)])
    out.push(`${label}\t${def.id}\t${sky}\t/viking/?debug&steps=${steps}&sky=${sky}&level=${def.id}&x=${Math.round(hx)}&y=${Math.max(0, Math.round(hy))}&where=${Math.round(at.x)},${Math.round(at.y)}&look=${Math.round(at.x)},${Math.round(at.y)}${extra}#${def.id}`);
}

/** Where he stands nearest x (searching outwards a tile at a time) on ground under row `y`. */
function standNear(p: Play, x: number, y: number) {
  for (let k = 0; k < 12; k++)
    for (const s of [1, -1]) {
      const hx = x + s * k * TILE;
      const at = p.map.surfaceBelow(hx, y);
      if (at !== null && at - y < 6 * TILE) return { hx, hy: y };
    }
  return { hx: x, hy: y };
}

for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const p = fresh(def);
  for (let t = 0; t < 2; t++) stepPlay(p, IDLE);
  if (what === "movers") {
    // Sheep on their knolls.
    if (p.sheep.length) {
      const s = p.sheep[0];
      shot(def, "sheep", s.x - 3 * TILE, s.bottom - 2 * TILE, { x: s.x, y: s.bottom - 6 });
    }
    // Carriers that are animals or people: the moose, the parade's banners and the Guard.
    def.carriers.forEach((d, i) => {
      const at = carrierDrawn(d, 2, 1);
      const label = def.id === "nordmarka" ? "moose" : def.id === "slottet" ? `parade ${i}` : "";
      if (!label || (def.id === "slottet" && i > 1)) return;
      const { hx, hy } = standNear(p, at.x - 3 * TILE, at.y - TILE);
      shot(def, label, hx, hy, { x: at.x + d.w / 2, y: at.y + 8 });
    });
    for (const e of p.enemies) {
      const ex = e.x;
      const ey = e.y - e.h / 2;
      // A statue he faces: stone (he stands before it, facing it).
      if ((e.def.look === "statue" || e.def.look === "bronze") && !out.some((l) => l.startsWith(`watched ${e.def.look}\t`))) shot(def, `watched ${e.def.look}`, ex - 3 * TILE, e.y - 2 * TILE, { x: ex, y: ey });
      // A guard still a statue: him seven tiles off.
      if (def.id === "gamlebyen" && e.def.look === "guard" && !out.some((l) => l.startsWith("guard as stone\t"))) {
        const { hx, hy } = standNear(p, ex - 8 * TILE, e.y - 2 * TILE);
        shot(def, "guard as stone", hx, hy, { x: ex, y: ey });
      }
      // A calm swan: him on the shore before its stretch.
      if (e.def.look === "swan" && !out.some((l) => l.startsWith("swan, calm\t"))) {
        const { hx, hy } = standNear(p, ex - 8 * TILE, e.y - 3 * TILE);
        shot(def, "swan, calm", hx, hy, { x: ex, y: ey });
      }
    }
    // The heron, standing in the shallows.
    if (def.id === "ostensjovannet") {
      const { HERON } = await import("../../src/levels/ostensjovannet");
      const { hx, hy } = standNear(p, HERON.x - 3 * TILE, HERON.y - TILE);
      shot(def, "heron", hx, hy, { x: HERON.x + HERON.w / 2, y: HERON.y + 6 });
    }
    // The troll asleep, the plough parked.
    if (p.troll) {
      const tx = p.troll.x;
      const { hx, hy } = standNear(p, tx - 9 * TILE, p.map.height - 10 * TILE);
      shot(def, "troll asleep", hx, hy, { x: tx, y: (p.map.surfaceBelow(tx, 0) ?? p.map.height) - 12 });
    }
    if (def.id === "nabolaget" && p.boss) {
      const b = p.boss.state as unknown as { x: number; def: { floor: number } };
      const { hx, hy } = standNear(p, b.x - 9 * TILE, b.def.floor - 2 * TILE);
      shot(def, "plough parked", hx, hy, { x: b.x, y: b.def.floor - 14 });
    }
    // A sledger pulled off at the end of its stretch: him well past it.
    if (def.id === "korketrekkeren") {
      const q = fresh(def);
      const r = playMoves(q, routeOf(def.id), { max: 60 * 120, until: (z) => z.enemies.some((e) => e.def.look === "sledger" && e.calm && e.alive) });
      const e = q.enemies.find((e) => e.def.look === "sledger" && e.calm && e.alive);
      if (e) for (const sky of ["day", skyOf(def)]) out.push(`sledger pulled off\t${def.id}\t${sky}\t/viking/?debug&auto&steps=${r.steps + 1}&sky=${sky}&level=${def.id}&where=${Math.round(e.x)},${Math.round(e.y - e.h / 2)}&look=${Math.round(e.x)},${Math.round(e.y - e.h / 2)}#${def.id}\twait`);
    }
    // The serpent dazed on the quay, its head the place to hit.
    if (def.id === "gamlebyen") {
      const q = fresh(def);
      const r = playMoves(q, routeOf(def.id), { max: 60 * 200, until: (z) => (z.boss?.state as { phase?: string } | undefined)?.phase === "dazed" && z.t - ((z.boss!.state as { since: number }).since ?? 0) > 30 });
      const s = q.boss?.state as unknown as { x: number; def: { floor: number }; dir: number } | undefined;
      if (s) for (const sky of ["day", skyOf(def)]) out.push(`serpent dazed\t${def.id}\t${sky}\t/viking/?debug&auto&steps=${r.steps + 1}&sky=${sky}&level=${def.id}&where=${Math.round(q.body.x)},${Math.round(s.def.floor - 8)}#${def.id}\twait`);
    }
  } else {
    // What he takes: the cheese and the bracteate of every level, the first skilling, the shield, the rune.
    if (p.cheese) {
      const c = p.cheese.box;
      const { hx, hy } = standNear(p, c.x - 3 * TILE, c.y - TILE);
      shot(def, "cheese", hx, hy, { x: c.x + 6, y: c.y + 3 });
    }
    if (p.bracteate) {
      const b = p.bracteate;
      const { hx, hy } = standNear(p, b.x - 3 * TILE, b.y);
      shot(def, "bracteate", hx, hy, { x: b.x + 6, y: b.y + 6 });
    }
    if (def.id === "langkaia" || def.id === "stortinget" || def.id === "ostensjovannet") {
      const s = p.skilling.find((s) => s.box.x > p.body.x + 6 * TILE) ?? p.skilling[0];
      const { hx, hy } = standNear(p, s.box.x - 3 * TILE, s.box.y - TILE);
      shot(def, "skilling", hx, hy, { x: s.box.x + 3, y: s.box.y + 3 });
    }
    if (p.gift) {
      const { hx, hy } = standNear(p, p.gift.x - 3 * TILE, p.gift.y - TILE);
      shot(def, "shield", hx, hy, { x: p.gift.x + 5, y: p.gift.y + 6 });
    }
    if (p.rune && (def.id === "langkaia" || def.id === "ekeberg")) {
      const { hx, hy } = standNear(p, p.rune.x - 3 * TILE, p.rune.y);
      shot(def, "rune", hx, hy, { x: p.rune.x + 8, y: p.rune.y + 8 });
    }
  }
}
void placeBody;
console.log(out.join("\n"));
