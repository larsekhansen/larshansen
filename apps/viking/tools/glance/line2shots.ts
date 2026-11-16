// The addresses for order 25's pictures in place: every look line 2 has of its own, where it lives, him three tiles off
// (`enemyshots.ts`'s way), and what the census does not draw (a watched statue, a guard as stone, a calm swan, a swan
// telling, the heron, a sledger riding), the sea serpent in each of its states along the scripted route (its ring, rising,
// its tell, spitting, dazed, its tail's fin and its tail, its coils), and what section 2 names (the wasp, the flying
// pigeon, the track rat rising, the kid, the troll after dusk, the feather falling, a bracteate and the shield). Each by
// day and under its level's own sky, in the format `sheet.py` reads: a label, the level, the sky, the address's path, and
// `wait` where the page must play the route first (`tools/shots.ts --wait=5000`).
//
//   bun tools/glance/line2shots.ts > line2.tsv

import { TILE } from "@larshansen/pixelkit/config";
import { placeBody } from "@larshansen/pixelkit/physics";
import { leap } from "../../src/game/enemies";
import { playMoves, type Move } from "../../src/game/bot";
import { newPlay, stepPlay, type Play } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import { ORDER, loadLevel } from "../../src/levels/index";
import * as ROUTES from "../../src/levels/routes";
import type { LevelDef } from "../../src/levels/types";
import { skyOf } from "./skies";

const IDLE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const out: string[] = [];
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];
const fresh = (def: LevelDef) => {
  const i0 = ORDER.indexOf(def.id);
  return newPlay(def, { pole: i0 >= ORDER.indexOf("akerselva"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
};
const line = (label: string, def: LevelDef, path: (sky: string) => string, wait = false) => {
  for (const sky of ["day", skyOf(def)]) out.push(`${label}\t${def.id}\t${sky}\t${path(sky)}${wait ? "\twait" : ""}`);
};
/** Him dropped onto the ground under (hx, hy), `steps` steps, the camera on (wx, wy). */
const still = (label: string, def: LevelDef, hx: number, hy: number, wx: number, wy: number, steps = 2, extra = "") =>
  line(label, def, (sky) => `/viking/?debug&steps=${steps}&sky=${sky}&level=${def.id}&x=${Math.round(hx)}&y=${Math.max(0, Math.round(hy))}&where=${Math.round(wx)},${Math.round(wy)}&look=${Math.round(wx)},${Math.round(wy)}${extra}#${def.id}`);
/** The scripted route played to the first step `until` holds, then that step: a page under `?debug&auto`. */
const played = (label: string, def: LevelDef, until: (p: Play) => boolean, at: (p: Play) => [number, number], later = 0) => {
  const p = fresh(def);
  const r = playMoves(p, routeOf(def.id), { max: 60 * 200, until });
  if (!until(p)) return console.error(`${label}: not met along ${def.id}'s route`);
  for (let k = 0; k < later; k++) stepPlay(p, IDLE);
  const [wx, wy] = at(p);
  line(label, def, (sky) => `/viking/?debug&auto&steps=${r.steps + 1 + later}&sky=${sky}&level=${def.id}&where=${Math.round(wx)},${Math.round(wy)}&look=${Math.round(wx)},${Math.round(wy)}#${def.id}`, true);
};
/** Where he stands nearest x on ground under row y. */
function standNear(p: Play, x: number, y: number) {
  for (let k = 0; k < 12; k++)
    for (const s of [1, -1]) {
      const hx = x + s * k * TILE;
      const at = p.map.surfaceBelow(hx, y);
      if (at !== null && at - y < 6 * TILE) return { hx, hy: y };
    }
  return { hx: x, hy: y };
}

// Every look of line 2's own, the first of each where it lives (him three tiles before it; a statue's back to him, so it
// walks; a jumper at the top of its leap).
const OWN = new Set(["crab", "penguin", "slinger", "statue", "bronze", "boy", "ringer", "sledger", "swan", "coot", "duck", "nester", "riveter", "archer", "guard", "goose", "dog"]);
for (const id of ["bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]) {
  const def = await loadLevel(id);
  const seen = new Set<string>();
  for (const [i, e] of (def.enemies ?? []).entries()) {
    if (!OWN.has(e.look) || seen.has(e.look)) continue;
    seen.add(e.look);
    // Step 0, but for a jumper: a hit in the first steps holds the page's picture, and whether the first frame came first
    // is a race (the handover's "Checking").
    let steps = 0;
    if (e.kind === "jumper") {
      const probe = fresh(def);
      let best = 0;
      for (let t = 2; t < 600; t++) if (leap(probe.enemies[i], t).up > best) [best, steps] = [leap(probe.enemies[i], t).up, t];
    }
    const statue = e.look === "statue" || e.look === "bronze";
    const p = fresh(def);
    const ex = e.c * TILE + TILE / 2;
    const { hx, hy } = standNear(p, ex + (statue ? 3 : -3) * TILE, (Math.floor(e.r) - 4) * TILE);
    const at = p.map.surfaceBelow(hx, hy);
    if (at !== null) placeBody(p.body, hx, at);
    for (let t = 0; t < steps; t++) stepPlay(p, IDLE);
    const en = p.enemies[i];
    still(e.look, def, hx, hy, en.x, en.y - en.h / 2, steps);
  }
}

// What the census does not draw: a watched statue and bronze (he faces it), a guard still stone (him eight tiles off), a
// calm swan (him on the shore before its stretch), a swan telling, the heron, a sledger riding (the route stomps every
// sledger before one pulls off: that one is in `states.ts`'s sheets).
{
  const vig = await loadLevel("vigelandsparken");
  for (const look of ["statue", "bronze"]) {
    const e = vig.enemies!.find((d) => d.look === look)!;
    const ex = e.c * TILE + TILE / 2;
    still(`watched ${look}`, vig, ex - 3 * TILE, (e.r - 1) * TILE, ex, (e.r + 1) * TILE - 8);
  }
  const gam = await loadLevel("gamlebyen");
  const g = gam.enemies!.find((d) => d.look === "guard")!;
  const p = fresh(gam);
  const s = standNear(p, g.c * TILE - 8 * TILE, (g.r - 1) * TILE);
  still("guard as stone", gam, s.hx, s.hy, g.c * TILE + 8, (g.r + 1) * TILE - 5);
  const lake = await loadLevel("ostensjovannet");
  const { HERON } = await import("../../src/levels/ostensjovannet");
  const q = fresh(lake);
  const sw = lake.enemies!.find((d) => d.look === "swan")!;
  const a = standNear(q, sw.c * TILE - 8 * TILE, (sw.r - 2) * TILE);
  still("swan, calm", lake, a.hx, a.hy, sw.c * TILE, (sw.r + 1) * TILE - 6);
  played("swan, telling", lake, (z) => z.enemies.some((e) => e.def.look === "swan" && (e.n ?? 0) >= 200), (z) => {
    const e = z.enemies.find((e) => e.def.look === "swan" && (e.n ?? 0) >= 200)!;
    return [e.x, e.y - 8];
  });
  const h = standNear(q, HERON.x - 3 * TILE, HERON.y - TILE);
  still("heron", lake, h.hx, h.hy, HERON.x + HERON.w / 2, HERON.y + 4);
  const kork = await loadLevel("korketrekkeren");
  played("sledger pulled off", kork, (z) => z.enemies.some((e) => e.def.look === "sledger" && e.calm && e.alive), (z) => {
    const e = z.enemies.find((e) => e.def.look === "sledger" && e.calm && e.alive)!;
    return [e.x + 18, e.y - 14];
  });
  played("sledger riding", kork, (z) => z.enemies.some((e) => e.def.look === "sledger" && e.n !== undefined && !e.calm && e.x > e.home - 4 * TILE), (z) => {
    const e = z.enemies.find((e) => e.def.look === "sledger" && e.n !== undefined && !e.calm)!;
    return [e.x, e.y - 7];
  });
}

// The sea serpent in each of its states, along the scripted route.
{
  const gam = await loadLevel("gamlebyen");
  type S = { phase: string; since: number; at: number; def: { floor: number; points: number[] }; tail: { x: number } | null; dir: number };
  const sp = (p: Play) => p.boss?.state as unknown as S;
  const neck = (p: Play): [number, number] => [sp(p).def.points[sp(p).at], sp(p).def.floor - 30];
  const phase = (name: string, after: number) => (p: Play) => !!p.boss && sp(p).phase === name && p.t - sp(p).since >= after;
  played("serpent, its ring", gam, phase("ring", 40), (p) => [sp(p).def.points[sp(p).at], sp(p).def.floor + 20]);
  played("serpent, rising", gam, phase("rise", 15), neck);
  played("serpent, its tell", gam, phase("rear", 70), neck);
  played("serpent, spitting", gam, phase("spit", 6), neck);
  played("serpent, dazed", gam, phase("dazed", 30), (p) => [sp(p).def.points[sp(p).at] + sp(p).dir * 6, sp(p).def.floor - 8]);
  played("serpent, its tail's fin", gam, (p) => !!p.boss && sp(p).phase === "lash" && !!sp(p).tail && p.t - sp(p).since >= 20, (p) => [sp(p).tail!.x, sp(p).def.floor + 8]);
  played("serpent, its tail", gam, (p) => !!p.boss && sp(p).phase === "lash" && !!sp(p).tail && p.t - sp(p).since >= 90, (p) => [sp(p).tail!.x, sp(p).def.floor - 8]);
  played("serpent, its coils", gam, phase("rest", 30), (p) => [sp(p).def.points[sp(p).at] - 34 * (sp(p).dir || 1), sp(p).def.floor + 10]);
}

// Section 2: the wasp, the flying pigeon, the track rat rising, the kid, the troll after dusk, the feather falling onto
// him, a bracteate and the shield.
{
  const first = async (id: string, look: string, label = look, phaseOf?: (t: number, e: Parameters<typeof leap>[0]) => boolean) => {
    const def = await loadLevel(id);
    const i = def.enemies!.findIndex((d) => d.look === look);
    const e = def.enemies![i];
    const p = fresh(def);
    let steps = 2;
    if (phaseOf) for (let t = 2; t < 800; t++) if (phaseOf(t, p.enemies[i])) {
      steps = t;
      break;
    }
    const s = standNear(p, e.c * TILE - 3 * TILE, (Math.floor(e.r) - 3) * TILE);
    const ex = p.enemies[i].x;
    still(label, def, s.hx, s.hy, ex, (e.r + 1) * TILE - 8, steps);
  };
  await first("ekeberg", "wasp", "wasp (Ekeberg)");
  await first("akerselva", "wasp", "wasp (Akerselva)");
  await first("stortinget", "pigeonfly");
  await first("stortinget", "trackrat", "track rat, rising", (t, e) => leap(e, t).up > 8 && leap(e, t + 1).up > leap(e, t).up + 1);
  await first("korketrekkeren", "kid");
  await first("holmenkollen", "kid", "kid (Holmenkollen)");
  const nord = await loadLevel("nordmarka");
  played("troll walking, after dusk", nord, (p) => !!p.troll && p.troll.phase === "walk" && p.t - p.troll.since > 20, (p) => [p.troll!.x, (p.def.troll?.floor ?? 0) - 24]);
  const lang = await loadLevel("langkaia");
  for (const k of [40, 85]) line(`the feather falling, ${k} of 100`, lang, (sky) => `/viking/?debug&steps=2&sky=${sky}&level=langkaia&x=1315&y=232&fall=${k}&where=1318,${k < 50 ? 212 : 228}&look=1318,${k < 50 ? 212 : 228}#langkaia`);
  for (const id of ["langkaia", "gamlebyen"]) {
    const def = await loadLevel(id);
    const p = fresh(def);
    if (!p.bracteate) continue;
    const b = p.bracteate;
    const s = standNear(p, b.x - 3 * TILE, b.y);
    still("bracteate", def, s.hx, s.hy, b.x + 6, b.y + 6);
  }
  const by = await loadLevel("bygdoy");
  const p = fresh(by);
  if (p.gift) {
    const s = standNear(p, p.gift.x - 3 * TILE, p.gift.y - TILE);
    still("the shield where it is given", by, s.hx, s.hy, p.gift.x + 5, p.gift.y + 6);
  }
  const vig = await loadLevel("vigelandsparken");
  still("the shield on his back", vig, 30 * TILE, 15 * TILE, 30 * TILE + 5, 16 * TILE, 2, "&shield");
  still("the shield up", vig, 30 * TILE, 15 * TILE, 30 * TILE + 5, 16 * TILE, 20, "&shield&keys=s20");
}
console.log(out.join("\n"));
