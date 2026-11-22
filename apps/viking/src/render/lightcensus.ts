import { carrierDrawn, drawCarrier } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { drawSky } from "@larshansen/pixelkit/sky";
import { drawTimed } from "@larshansen/pixelkit/timed";
import { buildDoors, type Door } from "@larshansen/pixelkit/doors";
import { invasion } from "../alive/invasion";
import { newPlay } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { ORDER } from "../levels/index";
import type { LevelDef, View } from "../levels/types";
import { ANY_METHOD, NO_METHOD } from "./fields";
import { STAND_LEDGE } from "./stand";
import { drawTiles, drawWater } from "./tiles";

// For the tests and the tools only, never imported by the page (order 32, ADR 0054): every light a scene registers after dark,
// and what is drawn over it. A scene is drawn across its whole length, view by view, path by path in the order a frame draws
// them (the sky; the far layers, each on its own canvas; on the street the backdrop and the invaders' scenery, then the water
// and the tiles, then the things and what is drawn in front; the night under the trees), as a browser draws it (kept pieces
// and stamps made once and copied), into a recording canvas that keeps every fill and copy. Every `light()` registered
// meanwhile is noted with the function that registered it (from the stack), its kind, its colour, where it is and in which
// pass; and every fill of a later pass on the street over it (so drawn over the light once it has come on): see-through ones
// dim it, opaque ones cover it (a copy counts as covering its whole rectangle, so `cover` is the most it can be).

/** The passes of a frame, in order: 0 the sky, 1 to 3 the far layers' canvases, 4 to 6 the street's three passes, 7 the night. */
export const PASS = { sky: 0, far: 1, mid: 2, near: 3, back: 4, invasion: 4, water: 5, tiles: 5, things: 6, front: 6, night: 7 } as const;
export type Path = keyof typeof PASS;

/** A light a scene registered. */
export interface Lit {
  level: string;
  /** The function that registered it and its file (`lamp alive/props`). */
  who: string;
  kind: string;
  /** Its own colour, or "" for its kind's. */
  colour: string;
  x: number;
  y: number;
  w: number;
  h: number;
  path: Path;
  /** The paths of later passes that dim it (see-through) or cover it (opaque), and the most of its pixels either does in a view. */
  dimmedBy: string[];
  coveredBy: string[];
  dim: number;
  cover: number;
  /** The most of its pixels each later path covers (opaque), in any view. */
  coverOf: Partial<Record<Path, number>>;
}

/** The kit's colours for a light of each kind, where it has none of its own (`drawLights` in the kit's `paint.ts`). */
export const KIND_COLOUR: Record<string, string> = { window: "#ffd36b", lamp: "#ffd36b", soft: "rgba(255, 214, 120, 0.45)", pool: "rgba(255, 186, 96, 0.34)" };
/** The colour a light is drawn in. */
export const colourOf = (l: Pick<Lit, "kind" | "colour">) => l.colour || KIND_COLOUR[l.kind];

interface Fill {
  x: number;
  y: number;
  w: number;
  h: number;
  clear: boolean;
  pass: number;
  path: string;
}
/** A colour's alpha, worked out once a colour (order 35: it was read on every fill). */
const ALPHA = new Map<string, number>();
const alphaOf = (s: unknown) => {
  if (typeof s !== "string") return 1;
  let a = ALPHA.get(s);
  if (a === undefined) {
    const m = /^rgba\(([^)]+)\)$/.exec(s.trim());
    ALPHA.set(s, (a = m ? Number(m[1].split(",")[3]) : 1));
  }
  return a;
};

/** A recording context: every fill and copy, with whether it is see-through. */
function recorder(fills: Fill[], where: { pass: number; path: string }) {
  let style: unknown = "#000";
  const base: Record<string, unknown> = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: view.w, height: view.h },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
    },
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    fillRect(this: { globalAlpha: number; globalCompositeOperation: string }, x: number, y: number, w: number, h: number) {
      // Light added to what is there ("lighter": a beam, the low sun) neither dims nor covers what it falls on.
      if (this.globalCompositeOperation === "lighter") return;
      fills.push({ x, y, w, h, clear: this.globalAlpha < 1 || alphaOf(style) < 1 || this.globalCompositeOperation !== "source-over", ...where });
    },
    drawImage(this: { globalAlpha: number; globalCompositeOperation: string }, _src: unknown, ...a: number[]) {
      if (this.globalCompositeOperation === "lighter") return;
      const [x, y, w, h] = a.length >= 8 ? a.slice(4, 8) : a.length >= 4 ? a : [a[0], a[1], 0, 0];
      if (w && h) fills.push({ x, y, w, h, clear: this.globalAlpha < 1 || this.globalCompositeOperation !== "source-over", ...where });
    }
  };
  return Object.setPrototypeOf(base, ANY_METHOD) as unknown as CanvasRenderingContext2D;
}

/** The function that called `light()`, and its file, from the stack: the first named function of ours above it. */
function caller(): string {
  const lines = (new Error().stack ?? "").split("\n").map((l) => l.trim());
  const i = lines.findIndex((l) => /^at light \(/.test(l));
  for (const at of lines.slice(i + 1)) {
    const m = /^at (\S+) \(([^)]+\.ts):\d+(?::\d+)?\)$/.exec(at);
    if (!m || m[1] === "<anonymous>" || /^(forEach|map|flatMap|filter|call|apply)$/.test(m[1])) continue;
    return `${m[1]} ${m[2].replace(/^.*\/(src|pixelkit)\//, "").replace(/\.ts$/, "")}`;
  }
  return "(anonymous)";
}

/** A canvas made while the census draws as a browser would: it draws nothing. */
const NOWHERE = Object.setPrototypeOf({ canvas: { width: 4096, height: 4096 } }, NO_METHOD) as Record<string, unknown>;

/** Every light `def` registers under `sky`, drawn across its whole length, and what a later pass on the street draws over each. */
export function census(name: string, def: LevelDef, sky: Sky): Lit[] {
  const g = globalThis as { document?: unknown };
  const was = { document: g.document, view: { ...view }, ctx: ctx(), push: lights.push };
  g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => NOWHERE }) };
  const seen: Lit[] = [];
  let where: { pass: number; path: Path } = { pass: 0, path: "sky" };
  (lights as unknown as { push: (...l: (typeof lights)[number][]) => number }).push = (...ls) => {
    for (const l of ls) seen.push({ level: name, who: caller(), kind: l.kind, colour: l.color ?? "", x: l.x, y: l.y, w: l.w, h: l.h, path: where.path, dimmedBy: [], coveredBy: [], dim: 0, cover: 0, coverOf: {} });
    return was.push.apply(lights, ls);
  };
  try {
    const p = newPlay(def, { pole: def.id === "encore" || ORDER.indexOf(def.id) > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: def.id === "encore" || def.rune > 10 });
    const map = p.map;
    // Its doors, as the page builds them (`doorSpots` in main.ts): the T-bane's entrance has a lit sign.
    const doors = buildDoors(def.doors.flatMap((d) => (map.find(d.tile)[0] ? [{ id: d.id, kind: d.id, sign: d.sign, href: d.href || undefined, x: map.find(d.tile)[0].c * TILE, bottom: (map.find(d.tile)[0].r + 1) * TILE }] : [])));
    const v: View = { sky, t: 600, alpha: 1, doors: new Map(doors.map((d) => [d.id, d as Door])), now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: null, grounds: p.grounds?.state ?? null };
    const art = def.art;
    const horizon = map.height - 4 * TILE - 34;
    const paths: [Path, () => void][] = [
      ["sky", () => drawSky(sky, v.t, horizon)],
      ["far", () => art.far?.(v)],
      ["mid", () => art.mid?.(v)],
      ["near", () => art.near?.(v)],
      ["back", () => art.back(v)],
      ["invasion", () => invasion(def.id, v.t)],
      ["water", () => drawWater(map, v.t)],
      ["tiles", () => drawTiles(map, art, sky, def.underground)],
      [
        "things",
        () => {
          def.carriers.forEach((d, i) => (art.carrier ? art.carrier(i, carrierDrawn(d, v.t, 1), v) : drawCarrier(d, v.t, 1, sky.snow, STAND_LEDGE)));
          def.timed.forEach((l, i) => (art.timed ? art.timed(i, v) : drawTimed(l, v.t, sky.snow, STAND_LEDGE)));
          p.cannons.forEach((l, i) => art.cannon?.(i, l, -999, p.firedAt[i], v));
          for (const e of p.enemies) art.enemy?.(e, v);
          if (p.troll) art.troll?.(p.troll, v);
          if (p.boss) art.boss?.(p.boss.state, v);
        }
      ],
      ["front", () => art.front?.(v)],
      ["night", () => art.night?.(v, p.body, [], map)]
    ];
    const [w, h] = [640, 400];
    Object.assign(view, { w, h, k: 1, reduced: true });
    for (let y = -h; y < map.height + h / 2; y += h)
      for (let x = 0; x < map.width; x += w) {
        Object.assign(view, { camX: x, camXf: x, camY: y, camYf: y });
        v.him = { x: x + w / 2, y: y + h / 2 };
        const fills: Fill[] = [];
        const from = seen.length;
        for (const [path, draw] of paths) {
          where = { pass: PASS[path], path };
          target(recorder(fills, where));
          lights.length = 0;
          draw();
        }
        lights.length = 0;
        // Every light this view registered on the street, against every fill of a later pass over it.
        for (const l of seen.slice(from)) {
          const pass = PASS[l.path];
          if (pass < PASS.back) continue;
          const lx = l.x - x;
          const ly = l.y - y;
          if (lx + l.w <= 0 || ly + l.h <= 0 || lx >= w || ly >= h) continue;
          const lw = Math.max(1, Math.round(l.w));
          const lh = Math.max(1, Math.round(l.h));
          const dim = new Uint8Array(lw * lh);
          const cover = new Uint8Array(lw * lh);
          const byPath = new Map<Path, Uint8Array>();
          for (const f of fills) {
            if (f.pass <= pass || f.x >= lx + l.w || f.x + f.w <= lx || f.y >= ly + l.h || f.y + f.h <= ly) continue;
            const by = f.clear ? l.dimmedBy : l.coveredBy;
            if (!by.includes(f.path)) by.push(f.path);
            const px = f.clear ? dim : cover;
            const mine = f.clear ? null : (byPath.get(f.path as Path) ?? byPath.set(f.path as Path, new Uint8Array(lw * lh)).get(f.path as Path)!);
            for (let yy = Math.max(0, Math.floor(f.y - ly)); yy < Math.min(lh, Math.ceil(f.y + f.h - ly)); yy++)
              for (let xx = Math.max(0, Math.floor(f.x - lx)); xx < Math.min(lw, Math.ceil(f.x + f.w - lx)); xx++) {
                px[yy * lw + xx] = 1;
                if (mine) mine[yy * lw + xx] = 1;
              }
          }
          const share = (a: Uint8Array) => a.reduce((s, q) => s + q, 0) / a.length;
          l.dim = share(dim);
          l.cover = share(cover);
          for (const [path, a] of byPath) l.coverOf[path] = share(a);
        }
      }
  } finally {
    (lights as unknown as { push: typeof was.push }).push = was.push;
    lights.length = 0;
    Object.assign(view, was.view);
    target(was.ctx);
    if (was.document === undefined) delete g.document;
    else g.document = was.document;
  }
  // The same light registered in several views is one light: the most any view dims or covers it.
  const one = new Map<string, Lit>();
  for (const l of seen) {
    const k = `${l.who}|${l.path}|${l.x}|${l.y}|${l.w}|${l.h}|${l.colour}`;
    const o = one.get(k);
    if (!o) one.set(k, l);
    else {
      for (const d of l.dimmedBy) if (!o.dimmedBy.includes(d)) o.dimmedBy.push(d);
      for (const c of l.coveredBy) if (!o.coveredBy.includes(c)) o.coveredBy.push(c);
      o.dim = Math.max(o.dim, l.dim);
      o.cover = Math.max(o.cover, l.cover);
      for (const [path, c] of Object.entries(l.coverOf) as [Path, number][]) o.coverOf[path] = Math.max(o.coverOf[path] ?? 0, c);
    }
  }
  return [...one.values()];
}
