import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { skyFor, type Sky } from "@larshansen/pixelkit/oslo";
import { TINT, lights, target, view } from "@larshansen/pixelkit/paint";
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
import { ANY_METHOD } from "./fields";
import { airOf, backHazeOf, hazeOf } from "./haze";
import { padLayout } from "./pad";
import { drawTiles, drawWater } from "./tiles";
import "../alive/ground";
import "../alive/props";

// The upright frame drawn as the page draws it (order 45), for `upright.test.ts` and its workers (`upright.worker.ts`): places of a level's
// scripted route framed by the page's own camera rule with the pad, and a canvas of its own in typed arrays that composites the passes.

export const SIZES: [number, number][] = [
  [390, 844],
  [360, 640]
];
export const DPR = 3;
/** The bar during a level upright, two rows (CSS pixels; `game/frame.test.ts`). */
export const BAR = 80;

// --- A canvas that keeps its pixels: fills (solid, see-through, the brush's gradients) over an RGB buffer, as a browser composites them.

interface Grad {
  y0: number;
  y1: number;
  stops: { at: number; rgba: [number, number, number, number] }[];
  addColorStop(at: number, c: string): void;
}
const RGBA = new Map<string, [number, number, number, number] | null>();
export function rgbaOf(c: string): [number, number, number, number] | null {
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
export function raster(w: number, h: number, seen?: (c: string, grad: boolean) => void, slot = "") {
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
        if (sa >= 1) {
          // Opaque: the colour itself (most of what a frame draws: the tiles' runs, the far layers' columns).
          for (let j = yy * w + x0, e = yy * w + x1; j < e; j++) {
            px[j * 3] = c[0];
            px[j * 3 + 1] = c[1];
            px[j * 3 + 2] = c[2];
            al[j] = 1;
          }
          continue;
        }
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
        if (sa >= 1) {
          px[i] = o.px[i];
          px[i + 1] = o.px[i + 1];
          px[i + 2] = o.px[i + 2];
          al[j] = 1;
          continue;
        }
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

export interface Place {
  name: string;
  x: number;
  y: number;
  t: number;
}
const PLACES = new Map<string, { play: Play; at: Place[] }>();
/** The places a worker found (`upright.worker.ts`), kept here with a fresh play of the level, so this thread need not play the route again. */
export function seedPlaces(id: string, def: LevelDef, at: Place[]) {
  const i0 = ORDER.indexOf(id);
  const play = newPlay(def, { pole: id === "encore" || i0 > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: id === "encore" || def.rune > 10 });
  PLACES.set(id, { play, at });
}
export async function places(id: string, def: LevelDef): Promise<{ play: Play; at: Place[] }> {
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

export function framed(p: Play, at: Place, w: number, h: number) {
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

export function viewOf(sky: Sky, t: number, him: { x: number; y: number }): View {
  return { sky, t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null };
}

export const SKIES: { name: string; sky: (def: LevelDef) => Sky }[] = [
  { name: "day", sky: () => skyFor(new Date(2026, 5, 15, 12), "day") },
  { name: "evening", sky: () => skyFor(new Date(2026, 5, 15, 12), "evening") },
  { name: "twilight", sky: () => skyFor(new Date(2026, 5, 15, 12), "twilight") },
  { name: "night", sky: () => skyFor(new Date(2026, 0, 15, 12), "night") },
  { name: "its own", sky: (def) => (def.sky === "winterday" ? { ...skyFor(new Date(2026, 0, 15, 12), "day"), snow: true } : def.sky ? skyFor(new Date(2026, 0, 15, 12), def.sky) : skyFor(new Date(2026, 0, 15, 12), "night")) }
];

export async function scenes(): Promise<{ id: string; def: LevelDef }[]> {
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
    // The lights a pass registers are the kit's to draw after dusk; the page empties the list each pass, and so does this.
    lights.length = 0;
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
export async function flats(id: string, def: LevelDef) {
  let f = FLATS.get(id);
  if (f) return f;
  f = { sky: 0, under: 0, at: "" };
  const { play, at } = await places(id, def);
  const was = { ...view };
  // By day, and under its own sky where that is not a day's (a winter's day or 17 May draws its passes as any day does).
  const skies = def.sky === "day" || def.sky === "winterday" || def.sky === "17mai" ? [SKIES[0]] : [SKIES[0], SKIES[SKIES.length - 1]];
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

