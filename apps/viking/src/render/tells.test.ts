import { afterAll, describe, expect, test } from "bun:test";
import { target, view } from "@larshansen/pixelkit/paint";
import { placeBody } from "@larshansen/pixelkit/physics";
import { pulsePhase } from "@larshansen/pixelkit/timed";
import { autopilot, type Move } from "../game/bot";
import { leap, type Enemy } from "../game/enemies";
import { newPlay, stepPlay, type Play } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { ORDER, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import { CLOSERS, STONES } from "../levels/gamlebyen";
import type { LevelDef, View } from "../levels/types";
import { drawEnemy } from "./pickups";
import { skyOf } from "./fields";
import "./feel";

// Order 40, item 2: the tells order 39's table ranked weakest, held to a size. Each is staged as the page's harness stages it (he put
// somewhere and nothing held, or the scripted route), and the drawing that shows it is recorded pixel by pixel at the step before it
// and at steps inside it, in a box round it; it must change at least `least` pixels there at every one of those steps, with motion and
// with reduced motion. Measured in place (`apps/viking/tools/review/o40/after.md`), these were the smallest tells in the game: the
// track rat's three stones (6 pixels, on and off), the wall that closes behind him at Gamlebyen (about 13), a lily pad or a bundle
// about to sink (a pixel's tremble), a gust coming at Ekeberg (a few leaves of the evening's own colour). What the page outlines is
// recorded without its outline here (`outlined` just draws where there is no page), so a figure's numbers are its body's alone.

const NONE = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const optsFor = (def: LevelDef) => ({ pole: ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: def.rune > 10 });
const routeOf = (id: string) => (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];

/** What a drawing paints in a box, pixel by pixel ("x,y" to its colour). */
function painted(draw: () => void, box: { x0: number; y0: number; x1: number; y1: number }): Map<string, string> {
  const px = new Map<string, string>();
  const rec = {
    fillStyle: "",
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      for (let j = Math.round(y); j < Math.round(y + h); j++)
        for (let i = Math.round(x); i < Math.round(x + w); i++) if (i >= box.x0 && i < box.x1 && j >= box.y0 && j < box.y1) px.set(`${i},${j}`, String(rec.fillStyle));
    }
  };
  const any = new Proxy(rec, { get: (t, k) => (k in t ? t[k as keyof typeof t] : () => undefined) });
  target(any as unknown as CanvasRenderingContext2D);
  draw();
  return px;
}
const differ = (a: Map<string, string>, b: Map<string, string>) => {
  let n = 0;
  for (const k of new Set([...a.keys(), ...b.keys()])) if (a.get(k) !== b.get(k)) n++;
  return n;
};

interface Tell {
  name: string;
  level: string;
  /** Where he is put (as `?x=&y=`), or the route played. */
  at?: [number, number];
  on: (p: Play) => boolean;
  /** The box round it, in world pixels, from the play when it comes on. */
  box: (p: Play) => [number, number, number, number];
  /** What draws it. */
  draw: (def: LevelDef, p: Play, v: View) => void;
  least: number;
}
const enemy = (p: Play, i: number): Enemy => p.enemies[i];
const jumper = (name: string, level: string, i: number, least: number): Tell => ({
  name,
  level,
  at: undefined,
  on: (p) => leap(enemy(p, i), p.t).ripple,
  box: (p) => [enemy(p, i).x - 14, enemy(p, i).y - 40, enemy(p, i).x + 14, enemy(p, i).y + 4],
  draw: (def, p, v) => void (def.art.enemy?.(enemy(p, i), v) || drawEnemy(enemy(p, i), v.t)),
  least
});
const closing = (p: Play) =>
  CLOSERS.find((c) => {
    const s = p.grounds!.state as { at: (number | null)[]; up: boolean[] };
    return p.body.x + 5 > c * 16 + 8 && !STONES.some((st, i) => st.behind && st.c === c && (s.at[i] !== null || s.up[i]));
  });
const soon = (p: Play) => p.def.grounds?.stands?.(p.grounds!.state, p.t)?.find((s) => s.soon);
const TELLS: Tell[] = [
  { ...jumper("the track rat's snout and ballast (Stortinget)", "stortinget", 4, 10) },
  { ...jumper("the salmon's water (Akerselva)", "akerselva", 0, 12) },
  { ...jumper("the Angry Boy's stamping (Vigelandsparken)", "vigelandsparken", 3, 12) },
  {
    name: "a wall closing behind him (Gamlebyen)",
    level: "gamlebyen",
    on: (p) => closing(p) !== undefined,
    box: (p) => [closing(p)! * 16 - 2, 160, closing(p)! * 16 + 18, 400],
    draw: (def, _p, v) => def.art.front?.(v),
    least: 40
  },
  {
    name: "a lily pad about to sink (Østensjøvannet)",
    level: "ostensjovannet",
    at: [712, 250],
    on: (p) => !!soon(p),
    box: (p) => [soon(p)!.x - 4, soon(p)!.y - 4, soon(p)!.x + soon(p)!.w + 4, soon(p)!.y + 8],
    draw: (def, _p, v) => def.art.front?.(v),
    least: 20
  },
  {
    name: "a bundle about to sink (Bygdøy)",
    level: "bygdoy",
    at: [2112, 200],
    on: (p) => !!soon(p),
    box: (p) => [soon(p)!.x - 5, soon(p)!.y - 4, soon(p)!.x + soon(p)!.w + 5, soon(p)!.y + 10],
    draw: (def, _p, v) => def.art.front?.(v),
    least: 10
  },
  {
    name: "a gust coming (Ekeberg)",
    level: "ekeberg",
    at: [62 * 16, 100],
    on: (p) => pulsePhase(p.t, p.def.zones![0].beat!) === "warn",
    box: (p) => [p.def.zones![0].x - 24, p.def.zones![0].y, p.def.zones![0].x + p.def.zones![0].w + 24, p.def.zones![0].y + p.def.zones![0].h],
    draw: (def, _p, v) => def.art.back(v),
    least: 50
  }
];

const viewOf = (def: LevelDef, p: Play, t: number): View => ({ sky: skyOf(def, "day"), t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: p.body.x + 5, y: p.body.y + 7 }, flourish: null, facing: p.body.facing, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: p.runeAt, grounds: p.grounds?.state ?? null });
const saved = { ...view };
afterAll(() => void Object.assign(view, saved));

describe("no tell smaller than it was held to (order 40)", () => {
  for (const tell of TELLS)
    test(`${tell.name}: ${tell.least} pixels or more at every step of it, with motion and with reduced motion`, async () => {
      const def = await loadLevel(tell.level);
      const p = newPlay(def, optsFor(def));
      if (tell.at) {
        const [x, y] = tell.at;
        const at = p.map.surfaceBelow(x, y);
        if (at !== null) placeBody(p.body, x, at);
        else {
          placeBody(p.body, x, y);
          p.body.onGround = false;
        }
      }
      const pilot = tell.at ? null : autopilot(routeOf(tell.level) ?? []);
      // The world a step before it came on: where he was and the level's own ground (a pad he stood on, the ruins).
      let prev = { grounds: null as unknown, him: { x: 0, y: 0 } };
      for (let k = 0; k < 4000 && !tell.on(p); k++) {
        prev = { grounds: structuredClone(p.grounds?.state ?? null), him: { x: p.body.x + 5, y: p.body.y + 7 } };
        stepPlay(p, pilot ? (pilot(p) ?? NONE) : NONE);
      }
      expect(tell.on(p)).toBe(true);
      const [x0, y0, x1, y1] = tell.box(p);
      const box = { x0, y0, x1, y1 };
      Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4096, h: 1024 });
      const seen: number[] = [];
      for (const reduced of [false, true]) {
        view.reduced = reduced;
        // The step before it (its clock a step back, where he was and the ground as it was): what changes is the tell (with reduced
        // motion nothing else in the box moves by itself; with motion its own drawing may, which only makes it larger).
        const was = painted(() => tell.draw(def, p, { ...viewOf(def, p, p.t - 1), him: prev.him, grounds: prev.grounds } as View), box);
        for (const k of [0, 3, 6, 9, 12, 15, 20]) {
          const n = differ(was, painted(() => tell.draw(def, p, viewOf(def, p, p.t + k)), box));
          seen.push(n);
          expect({ reduced, k, n, enough: n >= tell.least }).toEqual({ reduced, k, n, enough: true });
        }
      }
      view.reduced = false;
    });
});
