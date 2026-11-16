import { TILE } from "@larshansen/pixelkit/config";
import { skyFor, type Phase, type Sky } from "@larshansen/pixelkit/oslo";
import { TINT, ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { drawSky } from "@larshansen/pixelkit/sky";
import { newPlay } from "../game/play";
import type { LevelDef, View } from "../levels/types";
import { carrierDrawn, carrierShown, drawCarrier } from "@larshansen/pixelkit/carrier";
import { drawCheckpoint } from "@larshansen/pixelkit/checkpoint";
import { drawCannon, drawDrum } from "@larshansen/pixelkit/launcher";
import { drawTimed } from "@larshansen/pixelkit/timed";
import { STAND_LEDGE } from "./stand";
import { drawTiles, drawWater } from "./tiles";
// The textured set (order 26) draws the tiles, as it does in the page once feel's file has come.
import "../alive/ground";

// For the tests only (order 18, ADR 0039), never imported by the page: what a level paints as fields,
// the colours that cover its ground, walls, sky, water and far layers. Each level is drawn (sky, far
// layers, buildings, water, tiles: everything but what moves, what can hurt him and what he can take)
// into a recording context at views across its whole map, and every rectangle's area inside the view
// is added to its colour. A colour is a field where it covers at least `FIELD_SHARE` of a level's
// recorded area; small things (windows, flags, flowers) are not fields.

/** A colour covering this share of everything a level paints is one of its fields. */
export const FIELD_SHARE = 0.004;

export type Rgb = [number, number, number];

/** `#rgb`, `#rrggbb`, `rgb()` and `rgba()` as [r, g, b] and an alpha; null for what is not a colour. */
export function parseColour(c: unknown): { rgb: Rgb; a: number } | null {
  if (typeof c !== "string") return null;
  const s = c.trim();
  if (s.startsWith("#")) {
    const h = s.length === 4 ? s.slice(1).split("").map((d) => d + d).join("") : s.slice(1, 7);
    return { rgb: [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as Rgb, a: 1 };
  }
  const m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (!m) return null;
  const p = m[1].split(",").map((x) => Number(x.trim()));
  return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
}

export const hex = (c: Rgb) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

/** A context that draws nothing and adds up the area each colour covers inside the view. */
export function areaRecorder() {
  const area = new Map<string, number>();
  let style: unknown = "#000000";
  const base = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: 0, height: 0 },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
    },
    createLinearGradient: () => {
      const stops: string[] = [];
      return { stops, addColorStop: (_o: number, c: string) => stops.push(c) };
    },
    fillRect(x: number, y: number, w: number, h: number) {
      if (this.globalAlpha < 0.6 || this.globalCompositeOperation !== "source-over") return;
      const x0 = Math.max(0, x);
      const y0 = Math.max(0, y);
      const x1 = Math.min(view.w, x + w);
      const y1 = Math.min(view.h, y + h);
      if (x1 <= x0 || y1 <= y0) return;
      const a = (x1 - x0) * (y1 - y0);
      const add = (c: unknown, k: number) => {
        const p = parseColour(c);
        if (!p || p.a < 0.6) return;
        const key = hex(p.rgb);
        area.set(key, (area.get(key) ?? 0) + a * k);
      };
      const g = style as { stops?: string[] };
      if (g && typeof g === "object" && g.stops) g.stops.forEach((c) => add(c, 1 / g.stops!.length));
      else add(style, 1);
    }
  };
  const fake = new Proxy(base, {
    get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined),
    set: (t, k, v) => {
      (t as Record<string | symbol, unknown>)[k] = v;
      return true;
    }
  });
  return { ctx: fake as unknown as CanvasRenderingContext2D, area };
}

/** The sky a level is drawn under for a phase: its own pinned sky when it has one, at that phase. */
export function skyOf(def: LevelDef, phase: Phase): Sky {
  const named = def.sky === "winterday" ? "day" : def.sky;
  const own = named ? skyFor(new Date(2026, 0, 15, 12), named) : null;
  return { ...(own ?? skyFor(new Date(2026, 5, 15, 12), phase)), phase };
}

/** What a level paints, by layer, as the area each colour covers (order 22: one walk over the level for every measure). */
export interface Painted {
  sky: Map<string, number>;
  far: Map<string, number>;
  mid: Map<string, number>;
  near: Map<string, number>;
  /** The street: its backdrop, water and tiles. */
  lane: Map<string, number>;
  /** Its tiles alone: the ground he and what moves stand on, where their shadows fall (order 23). */
  ground: Map<string, number>;
  /** What moves and is used (carriers, ledges on a beat, cannons, drums, flags) and what the level draws in front. */
  things: Map<string, number>;
}

/**
 * Every colour a level paints under a phase's sky, untinted, by layer, with the area each covers. Drawn at views
 * 320 x 200 across the whole map.
 */
export function levelPaint(def: LevelDef, phase: Phase): Painted {
  const play = newPlay(def, {});
  const map = play.map;
  const sky = skyOf(def, phase);
  const recs = { sky: areaRecorder(), far: areaRecorder(), mid: areaRecorder(), near: areaRecorder(), lane: areaRecorder(), ground: areaRecorder(), things: areaRecorder() };
  const was = { ...view, g: ctx() };
  Object.assign(view, { w: 320, h: 200, k: 1, reduced: true });
  const v: View = { sky, t: 0, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null };
  const horizon = map.height - 4 * TILE - 34;
  const art = def.art;
  for (let y = -view.h; y < map.height + view.h / 2; y += view.h)
    for (let x = 0; x < map.width; x += view.w) {
      view.camX = view.camXf = x;
      view.camY = view.camYf = y;
      v.him = { x: x + view.w / 2, y: y + view.h / 2 };
      target(recs.sky.ctx);
      drawSky(sky, 0, horizon);
      target(recs.far.ctx);
      art.far?.(v);
      target(recs.mid.ctx);
      art.mid?.(v);
      target(recs.near.ctx);
      art.near?.(v);
      target(recs.lane.ctx);
      art.back(v);
      drawWater(map, 0);
      drawTiles(map, art, sky, def.underground);
      target(recs.ground.ctx);
      drawTiles(map, art, sky, def.underground);
      // What moves and what is used, as the page draws them (`drawThings` in main.ts), at the start; and what is in front.
      target(recs.things.ctx);
      def.carriers.forEach((d, i) => {
        if (!carrierShown(d, 0)) return;
        const at = carrierDrawn(d, 0, 1);
        if (art.carrier) art.carrier(i, at, v);
        else drawCarrier(d, 0, 1, sky.snow, STAND_LEDGE);
      });
      def.timed.forEach((l, i) => (art.timed ? art.timed(i, v) : drawTimed(l, 0, sky.snow, STAND_LEDGE)));
      play.cannons.forEach((l, i) => (art.cannon ? art.cannon(i, l, -999, play.firedAt[i], v) : drawCannon(l, 0, -999, play.firedAt[i])));
      play.drums.forEach((l, i) => (art.drum ? art.drum(i, l, play.drummedAt[i], v) : drawDrum(l, 0, play.drummedAt[i])));
      play.flags.forEach((f, i) => art.flag?.(i, f, null, v) || drawCheckpoint(f, null, 0));
      art.front?.(v);
      lights.length = 0;
    }
  target(was.g);
  Object.assign(view, { w: was.w, h: was.h, k: was.k, camX: was.camX, camY: was.camY, camXf: was.camXf, camYf: was.camYf, reduced: was.reduced });
  return { sky: recs.sky.area, far: recs.far.area, mid: recs.mid.area, near: recs.near.area, lane: recs.lane.area, ground: recs.ground.area, things: recs.things.area };
}

/** Areas added together, as shares of their sum, keeping those of `share` or more. */
export function shares(maps: Map<string, number>[], share = 0): Map<string, number> {
  const sum = new Map<string, number>();
  for (const m of maps) for (const [c, a] of m) sum.set(c, (sum.get(c) ?? 0) + a);
  const total = [...sum.values()].reduce((a, b) => a + b, 0);
  const out = new Map<string, number>();
  for (const [c, a] of sum) if (a / total >= share) out.set(c, a / total);
  return out;
}

/**
 * The colours a level paints as fields under a phase's sky, untinted, with the share of the level's area each
 * covers: the sky, the far layers, the street's backdrop, water and tiles. `share`: the least share kept (0 keeps
 * every colour). `painted`: the level's paint already walked (`levelPaint`), so it is walked once.
 */
export function levelFields(def: LevelDef, phase: Phase, share = FIELD_SHARE, painted?: Painted): Map<string, number> {
  const p = painted ?? levelPaint(def, phase);
  return shares([p.sky, p.far, p.mid, p.near, p.lane], share);
}

/** A colour's saturation and value (HSV, 0 to 1). */
export function satVal([r, g, b]: Rgb): { s: number; v: number } {
  const mx = Math.max(r, g, b) / 255;
  const mn = Math.min(r, g, b) / 255;
  return { s: mx ? (mx - mn) / mx : 0, v: mx };
}

/** The p-th share (0 to 1) of weighted values. */
export function percentile(xs: { x: number; w: number }[], p: number): number {
  const sorted = [...xs].sort((a, b) => a.x - b.x);
  const total = sorted.reduce((t, a) => t + a.w, 0);
  let run = 0;
  for (const a of sorted) {
    run += a.w;
    if (run >= p * total) return a.x;
  }
  return sorted.at(-1)?.x ?? 0;
}

/**
 * What is behind the play lane against the lane itself (order 22, A6): the far layers' colours (far, mid, near) by
 * day, each with the haze it is drawn with (`haze`, toward `air`), as saturation and value weighted by the area each
 * covers; and the same of the street (its backdrop, water and tiles). The middle and the tenth and ninetieth
 * percentiles of each.
 */
export function backdropBand(def: LevelDef, haze: readonly [number, number, number], air: string, painted?: Painted) {
  const p = painted ?? levelPaint(def, "day");
  const airRgb = parseColour(air)!.rgb;
  const back: { s: number; v: number; w: number }[] = [];
  [p.far, p.mid, p.near].forEach((layer, i) => {
    for (const [c, a] of layer) back.push({ ...satVal(mixRgb(parseColour(c)!.rgb, airRgb, haze[i])), w: a });
  });
  const lane = [...p.lane].map(([c, a]) => ({ ...satVal(parseColour(c)!.rgb), w: a }));
  const stats = (xs: { s: number; v: number; w: number }[]) => ({
    s50: percentile(xs.map((a) => ({ x: a.s, w: a.w })), 0.5),
    s90: percentile(xs.map((a) => ({ x: a.s, w: a.w })), 0.9),
    v10: percentile(xs.map((a) => ({ x: a.v, w: a.w })), 0.1),
    v50: percentile(xs.map((a) => ({ x: a.v, w: a.w })), 0.5),
    v90: percentile(xs.map((a) => ({ x: a.v, w: a.w })), 0.9)
  });
  return { back: back.length ? stats(back) : null, lane: stats(lane) };
}

/** The night's (or evening's, twilight's) tint over a colour, as the street layer gets it. */
export function tinted(c: Rgb, phase: Phase): Rgb {
  const t = TINT[phase];
  if (!t) return c;
  const p = parseColour(t)!;
  return c.map((v, i) => v * (1 - p.a) + p.rgb[i] * p.a) as Rgb;
}

export const mixRgb = (a: Rgb, b: Rgb, k: number): Rgb => a.map((v, i) => v + (b[i] - v) * k) as Rgb;

// CIE Lab and the CIEDE2000 colour difference, for distances as the eye sees them.
function toLab([r, g, b]: Rgb): [number, number, number] {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}

/** CIEDE2000 between two colours (about 2 is a just-noticeable difference; 10 and more, plainly two colours). */
export function deltaE(a: Rgb, b: Rgb): number {
  const [L1, a1, b1] = toLab(a);
  const [L2, a2, b2] = toLab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h = (x: number, y: number) => (x === 0 && y === 0 ? 0 : ((Math.atan2(y, x) / rad) + 360) % 360);
  const h1p = h(a1p, b1);
  const h2p = h(a2p, b2);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
  const Lmp = (L1 + L2) / 2;
  const Cmp = (C1p + C2p) / 2;
  let hmp = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) > 180) hmp = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
    else hmp = (h1p + h2p) / 2;
  }
  const T = 1 - 0.17 * Math.cos((hmp - 30) * rad) + 0.24 * Math.cos(2 * hmp * rad) + 0.32 * Math.cos((3 * hmp + 6) * rad) - 0.2 * Math.cos((4 * hmp - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hmp - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lmp - 50) ** 2) / Math.sqrt(20 + (Lmp - 50) ** 2);
  const Sc = 1 + 0.045 * Cmp;
  const Sh = 1 + 0.015 * Cmp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
}

/**
 * How a colour looks to someone with deuteranopia or protanopia (Machado, Oliveira and Fernandes 2009,
 * severity 1), worked in linear light.
 */
export function colourBlind(c: Rgb, kind: "deutan" | "protan"): Rgb {
  const M = kind === "deutan" ? [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]] : [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]];
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const gam = (v: number) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(0, v) ** (1 / 2.4) - 0.055);
  const l = c.map(lin);
  return M.map((row) => gam(Math.min(1, Math.max(0, row[0] * l[0] + row[1] * l[1] + row[2] * l[2])))) as Rgb;
}
