import { describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { skyFor, type Phase, type Sky } from "@larshansen/pixelkit/oslo";
import { TINT, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES, STAND } from "@larshansen/pixelkit/palette";
import { drawSky } from "@larshansen/pixelkit/sky";
import { viewFor } from "@larshansen/pixelkit/stage";
import { autopilot, type Move } from "../game/bot";
import { frame } from "../game/frame";
import { newPlay, stepPlay, type Play } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import type { LevelDef, View } from "../levels/types";
import { FAR_VIEW_H } from "./backdrop";
import { ANY_METHOD, deltaE, tinted, type Rgb } from "./fields";
import { airOf, backHazeOf, hazeOf } from "./haze";
import { padLayout } from "./pad";
import { drawTiles, drawWater } from "./tiles";
import "../alive/ground";
import "../alive/props";

// The upright phone (order 45): on a screen taller than it is wide the sky over the far view and the ground under him are tall
// bands, and a level fills them (`art.sky`, `art.under`, `alive/upright.ts`). Held here, drawn as the page draws them at five places
// of each level's scripted route, framed by the page's own camera rule with the pad's buttons at 390 x 844 and 360 x 640 at a phone's
// pixel ratio: (1) no band of one flat colour taller than a stated share of the screen under the bar, in the sky (the kit's sky and the
// level's) or under his feet (the level's tiles and what it draws under them), under every sky, but by name; (2) nothing the two
// hooks add comes within 10 of the warning red, the paint or any role's colours under any sky.

/** The most of the screen under the bar a band of one flat colour may take, in the sky or under him. */
const FLAT = 0.2;
/** Where a flat band upright is not the sky or the ground (order 45 filled the top of its ranking), the most it takes there now, and why. */
const FLAT_NAMED: Record<string, { most: number; why: string }> = {
  ekeberg: { most: 0.43, why: "at the viewpoint the fjord far below in the far layer (Ekeberg's own view of the town, its boats in it), under the evening's tint" },
  gamlebyen: { most: 0.34, why: "at the longship's prow the harbour's water at dawn, darkening with its depth" },
  encore: { most: 0.28, why: "the water mirror under the stage (the encore is not filled: order 45's ranking had it a 2)" }
};

const SIZES: [number, number][] = [
  [390, 844],
  [360, 640]
];
const DPR = 3;
/** The bar during a level upright, two rows (CSS pixels; `game/frame.test.ts`). */
const BAR = 80;

// --- A canvas that keeps its pixels: fills (solid, see-through, the brush's gradients) over an RGB buffer, as a browser composites them.

interface Grad {
  y0: number;
  y1: number;
  stops: { at: number; rgba: [number, number, number, number] }[];
  addColorStop(at: number, c: string): void;
}
const RGBA = new Map<string, [number, number, number, number] | null>();
function rgbaOf(c: string): [number, number, number, number] | null {
  let v = RGBA.get(c);
  if (v === undefined) RGBA.set(c, (v = parse(c)));
  return v;
}
function parse(c: string): [number, number, number, number] | null {
  const s = c.trim();
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).split("").map((d) => d + d).join("") : s.slice(1);
    const v = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return [v[0], v[1], v[2], h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1];
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (!m) return null;
  const p = m[1].split(",").map((x) => Number(x.trim()));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
/** Buffers kept by size and slot, cleared for each use: a frame is six canvases, and there are a few hundred frames. */
const BUFFERS = new Map<string, { px: Float32Array; al: Float32Array }>();
function raster(w: number, h: number, seen?: (c: string, grad: boolean) => void, slot = "") {
  let b = slot ? BUFFERS.get(`${w}x${h}${slot}`) : undefined;
  if (!b) {
    b = { px: new Float32Array(w * h * 3), al: new Float32Array(w * h) };
    if (slot) BUFFERS.set(`${w}x${h}${slot}`, b);
  } else {
    b.px.fill(0);
    b.al.fill(0);
  }
  const { px, al } = b;
  let style: unknown = "#000";
  let dy = 0;
  const sorted = new WeakMap<Grad, Grad["stops"]>();
  const base: Record<string, unknown> = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: w, height: h },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
      if (typeof v === "string") seen?.(v, false);
    },
    setTransform(_a: number, _b: number, _c: number, _d: number, _e: number, f: number) {
      dy = f;
    },
    createLinearGradient(_x0: number, y0: number, _x1: number, y1: number): Grad {
      const g: Grad = { y0, y1, stops: [], addColorStop: (at, c) => (g.stops.push({ at, rgba: rgbaOf(c)! }), sorted.delete(g), seen?.(c, true)) };
      return g;
    },
    fillRect(this: { globalAlpha: number }, x: number, y: number, rw: number, rh: number) {
      const x0 = Math.max(0, Math.round(x));
      const x1 = Math.min(w, Math.round(x + rw));
      const y0 = Math.max(0, Math.round(y + dy));
      const y1 = Math.min(h, Math.round(y + dy + rh));
      if (x1 <= x0 || y1 <= y0) return;
      const solid = typeof style === "string" ? rgbaOf(style) : null;
      const grad = typeof style === "object" && style && "stops" in (style as object) ? (style as Grad) : null;
      let st = grad ? sorted.get(grad) : undefined;
      if (grad && !st) sorted.set(grad, (st = [...grad.stops].sort((a, b) => a.at - b.at)));
      for (let yy = y0; yy < y1; yy++) {
        let c = solid;
        if (grad && st) {
          const t = Math.max(0, Math.min(1, (yy - dy + 0.5 - grad.y0) / (grad.y1 - grad.y0 || 1)));
          let i = 0;
          while (i + 1 < st.length && st[i + 1].at <= t) i++;
          const a = st[i];
          const b = st[Math.min(st.length - 1, i + 1)];
          const k = b.at > a.at ? Math.max(0, Math.min(1, (t - a.at) / (b.at - a.at))) : 0;
          c = [a.rgba[0] + (b.rgba[0] - a.rgba[0]) * k, a.rgba[1] + (b.rgba[1] - a.rgba[1]) * k, a.rgba[2] + (b.rgba[2] - a.rgba[2]) * k, a.rgba[3] + (b.rgba[3] - a.rgba[3]) * k];
        }
        if (!c) return;
        const sa = c[3] * this.globalAlpha;
        if (sa <= 0) continue;
        for (let xx = x0; xx < x1; xx++) {
          const j = yy * w + xx;
          const i = j * 3;
          const da = al[j];
          const oa = sa + da * (1 - sa);
          const k = sa / oa;
          px[i] += (c[0] - px[i]) * k;
          px[i + 1] += (c[1] - px[i + 1]) * k;
          px[i + 2] += (c[2] - px[i + 2]) * k;
          al[j] = oa;
        }
      }
    }
  };
  Object.setPrototypeOf(base, ANY_METHOD);
  return {
    ctx: base as unknown as CanvasRenderingContext2D,
    /** A colour over what is drawn and nowhere else (`source-atop`: the kit's haze and the night's tint over a pass). */
    atop(c: string | null, k: number) {
      const p = c && rgbaOf(c);
      if (!p || k <= 0) return;
      const a = p[3] * k;
      for (let j = 0; j < w * h; j++) {
        if (al[j] <= 0) continue;
        const i = j * 3;
        px[i] += (p[0] - px[i]) * a;
        px[i + 1] += (p[1] - px[i + 1]) * a;
        px[i + 2] += (p[2] - px[i + 2]) * a;
      }
    },
    /** Another layer laid over this one, as the page's stacked canvases show it. */
    over(o: { px: Float32Array; al: Float32Array }) {
      for (let j = 0; j < w * h; j++) {
        const sa = o.al[j];
        if (sa <= 0) continue;
        const i = j * 3;
        const da = al[j];
        const oa = sa + da * (1 - sa);
        const k = sa / oa;
        px[i] += (o.px[i] - px[i]) * k;
        px[i + 1] += (o.px[i + 1] - px[i + 1]) * k;
        px[i + 2] += (o.px[i + 2] - px[i + 2]) * k;
        al[j] = oa;
      }
    },
    px,
    al,
    /** The longest run of rows from `from` to `to` with detail on under 1 % of the row (a pixel more than 24 off its right or lower neighbour). */
    flat(from: number, to: number): number {
      let best = 0;
      let cur = 0;
      const d = (i: number, j: number) => Math.abs(px[i] - px[j]) + Math.abs(px[i + 1] - px[j + 1]) + Math.abs(px[i + 2] - px[j + 2]);
      for (let y = Math.max(0, from); y < Math.min(h, to); y++) {
        let n = 0;
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 3;
          if ((x + 1 < w && d(i, i + 3) > 24) || (y + 1 < h && d(i, i + w * 3) > 24)) n++;
        }
        if (n < 0.01 * w) best = Math.max(best, ++cur);
        else cur = 0;
      }
      return best;
    }
  };
}

// --- Where he stands: five places of the route, and the camera as the page frames it with the pad up --------------------------------

interface Place {
  name: string;
  x: number;
  y: number;
  t: number;
}
const PLACES = new Map<string, { play: Play; at: Place[] }>();
async function places(id: string, def: LevelDef): Promise<{ play: Play; at: Place[] }> {
  let got = PLACES.get(id);
  if (!got) PLACES.set(id, (got = await placesOf(id, def)));
  return got;
}
async function placesOf(id: string, def: LevelDef): Promise<{ play: Play; at: Place[] }> {
  const i0 = ORDER.indexOf(id);
  const p = newPlay(def, { pole: id === "encore" || i0 > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: id === "encore" || def.rune > 10 });
  const route = (ROUTES as unknown as Record<string, Move[]>)[`${id.toUpperCase()}_ROUTE`];
  const pilot = autopilot(route);
  const track: Place[] = [];
  for (let n = 0; n < 60 * 400 && p.runeAt === null; n++) {
    const k = pilot(p);
    if (!k) break;
    stepPlay(p, k);
    if (p.body.onGround && n % 4 === 0) track.push({ name: "", x: p.body.x, y: p.body.y, t: p.t });
    if (def.boss?.ends && p.boss && def.boss.ends(p.boss.state)) break;
  }
  const by = (f: (a: Place, b: Place) => boolean) => track.reduce((a, b) => (f(a, b) ? b : a));
  const mid = p.map.width / 2;
  const at = [
    { ...track[0], name: "the start" },
    { ...by((a, b) => b.y < a.y), name: "the highest" },
    { ...track[Math.max(0, track.length - 15)], name: "the end" },
    { ...by((a, b) => Math.abs(b.x - mid) < Math.abs(a.x - mid)), name: "the middle" }
  ];
  return { play: p, at };
}

function framed(p: Play, at: Place, w: number, h: number) {
  const v = viewFor(w, h, DPR, 240);
  const unit = v.k / DPR;
  const slots = padLayout(w, h, { top: 0, right: 0, bottom: 0, left: 0 });
  const buttons = [slots.move, slots.enter, slots.jump, ...(p.pole ? [slots.dash] : [])];
  const body = { ...p.body, x: at.x, y: at.y, vx: 0, vy: 0, onGround: true, facing: 1 as const };
  const focus = { x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h / 2, facing: 1 };
  const floor = p.def.floor?.(focus.x) ?? p.map.height;
  const bounds = { width: p.map.width, bottom: Math.max(floor, Math.round(focus.y + v.h / 3)), top: (BAR * DPR) / v.k };
  const cam = frame({ x: 0, y: 0 }, focus, bounds, v, 1000 / 60, true, { buttons, unit, him: body, facing: 1, vy: 0 });
  return { v, cam, top: Math.round((BAR * DPR) / v.k), body };
}

function viewOf(sky: Sky, t: number, him: { x: number; y: number }): View {
  return { sky, t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null };
}

const SKIES: { name: string; sky: (def: LevelDef) => Sky }[] = [
  { name: "day", sky: () => skyFor(new Date(2026, 5, 15, 12), "day") },
  { name: "evening", sky: () => skyFor(new Date(2026, 5, 15, 12), "evening") },
  { name: "twilight", sky: () => skyFor(new Date(2026, 5, 15, 12), "twilight") },
  { name: "night", sky: () => skyFor(new Date(2026, 0, 15, 12), "night") },
  { name: "its own", sky: (def) => (def.sky === "winterday" ? { ...skyFor(new Date(2026, 0, 15, 12), "day"), snow: true } : def.sky ? skyFor(new Date(2026, 0, 15, 12), def.sky) : skyFor(new Date(2026, 0, 15, 12), "night")) }
];

async function scenes(): Promise<{ id: string; def: LevelDef }[]> {
  const out: { id: string; def: LevelDef }[] = [];
  for (const st of [...BUILT, { id: "encore" }]) out.push({ id: st.id, def: await loadLevel(st.id) });
  return out;
}

/**
 * A frame drawn as the page draws it upright (`render` in main.ts): the sky and what the level adds to it, the three far layers each
 * drawn as for a view `FAR_VIEW_H` high round him (`farPass`), washed by its haze and tinted after dusk, the street's backdrop with its
 * haze, the water, the tiles and what the level draws under them, the street tinted. What moves and he are not drawn. The passes are
 * drawn once a place (none draws differently under another sky: `render/warning.test.ts` holds it) and washed and tinted for each sky.
 */
function passes(def: LevelDef, play: Play, t: number, him: { x: number; y: number }) {
  const v = viewOf(skyFor(new Date(2026, 5, 15, 12), "day"), t, him);
  const art = def.art;
  const himRow = him.y - view.camYf;
  const dy = view.h > view.w && view.h > FAR_VIEW_H && !def.underground ? Math.max(0, Math.round(himRow - FAR_VIEW_H / 2)) : 0;
  const haze = hazeOf(def);
  const out: { px: Float32Array; al: Float32Array; haze: number }[] = [];
  const pass = (draw: () => void, k: number, shift = 0) => {
    const l = raster(view.w, view.h, undefined, `pass${out.length}`);
    target(l.ctx);
    view.camY += shift;
    view.camYf += shift;
    l.ctx.setTransform(1, 0, 0, 1, 0, shift);
    draw();
    l.ctx.setTransform(1, 0, 0, 1, 0, 0);
    view.camY -= shift;
    view.camYf -= shift;
    out.push({ px: l.px, al: l.al, haze: k });
  };
  [art.far, art.mid, art.near].forEach((draw, i) => draw && pass(() => draw(v), haze[i], dy));
  pass(() => art.back(v), backHazeOf(def));
  pass(() => {
    drawWater(play.map, t);
    drawTiles(play.map, art, v.sky, def.underground);
    art.under?.(v, play.map);
  }, 0);
  return out;
}
function composed(def: LevelDef, play: Play, drawn: ReturnType<typeof passes>, sky: Sky, t: number, him: { x: number; y: number }, top: number) {
  const out = raster(view.w, view.h, undefined, "out");
  target(out.ctx);
  drawSky(sky, t, play.map.height - 4 * TILE - 34);
  def.art.sky?.(viewOf(sky, t, him), top);
  const tint = TINT[sky.phase];
  const air = airOf(def, sky.phase);
  for (const d of drawn) {
    const l = raster(view.w, view.h, undefined, "wash");
    l.px.set(d.px);
    l.al.set(d.al);
    l.atop(air, d.haze);
    if (tint) l.atop(tint, 1);
    out.over(l);
  }
  return out;
}

/** Each scene's longest flat bands over his head and under his feet, the most over its places, sizes and skies, as a share of the screen under the bar. */
const FLATS = new Map<string, { sky: number; under: number; at: string }>();
async function flats(id: string, def: LevelDef) {
  let f = FLATS.get(id);
  if (f) return f;
  f = { sky: 0, under: 0, at: "" };
  const { play, at } = await places(id, def);
  const was = { ...view };
  const skies = def.sky === "day" ? [SKIES[0]] : [SKIES[0], SKIES[SKIES.length - 1]];
  try {
    for (const [w, h] of SIZES)
      for (const pl of at) {
        const { v, cam, top, body } = framed(play, pl, w, h);
        Object.assign(view, { w: v.w, h: v.h, k: v.k, dpr: DPR, camX: Math.round(cam.x), camXf: cam.x, camY: Math.round(cam.y), camYf: cam.y, reduced: false });
        const him = { x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h / 2 };
        const feet = Math.round(body.y + PLAYER.h - cam.y);
        const share = (n: number) => n / (v.h - top);
        const drawn = passes(def, play, pl.t, him);
        for (const s of skies) {
          const r = composed(def, play, drawn, s.sky(def), pl.t, him, top);
          const above = share(r.flat(top, feet - PLAYER.h));
          const below = share(r.flat(feet + 1, v.h));
          if (above > f.sky) f.sky = above;
          if (below > f.under) f.under = below;
          if (Math.max(above, below) >= Math.max(f.sky, f.under)) f.at = `${w}x${h} ${pl.name} (${s.name}) ${above >= below ? "over his head" : "under his feet"}`;
        }
      }
  } finally {
    Object.assign(view, was);
  }
  FLATS.set(id, f);
  return f;
}

describe("the upright phone's tall bands are filled (order 45)", () => {
  test(`upright, no band of one flat colour takes more than ${FLAT * 100} % of the screen under the bar, in the sky or under him, in any level under any sky, but by name`, async () => {
    const wrong: string[] = [];
    const table: string[] = [];
    const used = new Set<string>();
    for (const { id, def } of await scenes()) {
      const f = await flats(id, def);
      const most = Math.max(f.sky, f.under);
      table.push(`${id}: the sky ${(f.sky * 100).toFixed(0)} %, under him ${(f.under * 100).toFixed(0)} % (${f.at})`);
      const named = FLAT_NAMED[id];
      if (named) {
        used.add(id);
        if (most > named.most + 0.005) wrong.push(`${id}: ${(most * 100).toFixed(1)} %, more than its named ${(named.most * 100).toFixed(0)} %`);
      } else if (most > FLAT) wrong.push(`${id}: ${(most * 100).toFixed(1)} % (${f.at})`);
    }
    console.log(`The longest flat bands upright:\n  ${table.join("\n  ")}`);
    expect(wrong).toEqual([]);
    expect(Object.keys(FLAT_NAMED).filter((k) => !used.has(k))).toEqual([]);
  }, 300_000);

  test("nothing the upright sky and the band under the ground add comes within 10 of the warning red, the paint or any role's colours, under any sky", async () => {
    const ROLE: { role: string; colours: readonly string[]; day?: boolean }[] = [
      { role: "the warning red", colours: [ENEMY.red] },
      { role: "the paint", colours: [STAND.top] },
      { role: "his tunic", colours: [ROLES.him.tunic, ROLES.him.tunicLit, ROLES.him.tunicShade], day: true },
      { role: "what he takes", colours: [ROLES.take.copper, ROLES.take.gold, ROLES.take.goldDark] },
      { role: "a boss's now", colours: ROLES.COLOURS.now },
      { role: "things to use", colours: ROLES.COLOURS.use },
      { role: "the calm outline", colours: ROLES.COLOURS.calm }
    ];
    const wrong = new Set<string>();
    const least: Record<string, { d: number; at: string }> = {};
    const rgb = (c: string) => rgbaOf(c)!.slice(0, 3) as Rgb;
    const was = { ...view };
    try {
      for (const { id, def } of await scenes()) {
        if (!def.art.sky && !def.art.under) continue;
        const { play, at } = await places(id, def);
        for (const s of SKIES) {
          const sky = s.sky(def);
          const phase: Phase = sky.phase;
          for (const pl of at.slice(0, 3)) {
            const { v, cam, top, body } = framed(play, pl, 390, 844);
            Object.assign(view, { w: v.w, h: v.h, k: v.k, dpr: DPR, camX: Math.round(cam.x), camXf: cam.x, camY: Math.round(cam.y), camYf: cam.y, reduced: false });
            const him = { x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h / 2 };
            for (const part of ["sky", "under"] as const) {
              const drawn = new Set<string>();
              const r = raster(v.w, v.h, (c) => drawn.add(c));
              target(r.ctx);
              if (part === "sky") def.art.sky?.(viewOf(sky, pl.t, him), top);
              else def.art.under?.(viewOf(sky, pl.t, him), play.map);
              for (const c of drawn) {
                const p = rgbaOf(c);
                // A gradient's clear end, and a fill that is hardly there, are not colours anyone sees.
                if (!p || p[3] < 0.3) continue;
                // The sky's canvas is drawn in each sky's own colours; the street's (under the ground) is tinted after dusk.
                const seen = part === "sky" ? rgb(c) : tinted(rgb(c), phase);
                for (const ro of ROLE) {
                  if (ro.day && phase !== "day") continue;
                  for (const rc of ro.colours) {
                    const d = deltaE(seen, rgb(rc));
                    if (d < (least[ro.role]?.d ?? Infinity)) least[ro.role] = { d, at: `${id} ${part} ${c} (${s.name})` };
                    if (d < 10) wrong.add(`${id} ${part} ${c} (${s.name}): ${d.toFixed(1)} from ${ro.role}`);
                  }
                }
              }
            }
          }
        }
      }
    } finally {
      Object.assign(view, was);
    }
    console.log(`What the upright bands add, its least distances from each role's colours:\n  ${Object.entries(least).map(([r, l]) => `${r}: ${l.d.toFixed(1)} at ${l.at}`).join("\n  ")}`);
    expect([...wrong]).toEqual([]);
  }, 300_000);
});
