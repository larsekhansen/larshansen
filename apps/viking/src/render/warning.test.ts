import { describe, expect, test } from "bun:test";
import { carrierDrawn, carrierShown, drawCarrier } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { drawCheckpoint } from "@larshansen/pixelkit/checkpoint";
import { drawCannon, drawDrum } from "@larshansen/pixelkit/launcher";
import { ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { drawSky } from "@larshansen/pixelkit/sky";
import { drawTimed, timedPhase } from "@larshansen/pixelkit/timed";
import { newPlay } from "../game/play";
import { BUILT, loadLevel } from "../levels/index";
import type { LevelDef, View } from "../levels/types";
import { ANY_METHOD, deltaE, mixRgb, parseColour, skyOf, type Rgb } from "./fields";
import { airOf, backHazeOf, hazeOf } from "./haze";
import { STAND_LEDGE, standTop } from "./stand";
import { drawTiles, drawWater } from "./tiles";
// The textured set and the props kit draw the tiles and the props, as they do in the page once feel's file has come.
import "../alive/ground";
import "../alive/props";

// Harmless things keep off the warning red (order 33, item 2; ADR 0044). The warning red outlines what hurts and moves and
// stripes what hurts and is not an enemy; a harmless thing filled with a red near it says "this hurts" where nothing does.
// Order 32's chairlift chairs had a back of red slats 6.1 from it. Every level is drawn view by view as the page draws it, the
// things he meets (what carries him, the ledges on a beat, cannons, drums, flags, what stands in front), with the paint the page
// puts on what he stands on over them; what is left of them within 10 of the warning red may fill no more than a few pixels of
// a view, or it is named here with why (a dot, or what hurts). The props of the street's backdrop are held piece by piece in
// `alive/props.test.ts`.
//
// Since order 34 (Lars: "Scenery in the kit's red: move it off the red too") the scenery and the ground are held as well: the
// far, mid and near layers, the street's backdrop, the water and the tiles, drawn as the page draws them, each layer's colours
// washed toward the level's air by its haze as the page washes them (`render/haze.ts`), with what he meets and the paint over
// them; what is left within 10 of the warning red may fill no more than `FEW_SCENERY` pixels of a view, or it is named with
// why. His hat keeps the kit's red (he is not drawn here); what hurts keeps its own (named).

/** A few pixels: a light, a fleck, a mark. */
const FEW = 12;
/** A few pixels of scenery in a view: a rear light, a postbox, a door's knob, a stripe on a far sign. */
const FEW_SCENERY = 24;
/** The distance (CIEDE2000) within which a colour reads as the warning red. */
const NEAR = 10;

/** What may come within 10 of the warning red over more than a few pixels of a view, by level and colour, and why. */
const NAMED: Record<string, string> = {
  "holmenkollen #d9573a": "the spectators' red jackets at the outrun: a few pixels a person, many people",
  "holmenkollen #c8302b": "the spectators' red caps and scarves at the outrun: a few pixels a person",
  "slottet #c8302b": "the russ's red overalls in the parade: a few pixels a child",
  "korketrekkeren #c8332b": "the crossing's barrier: it hurts when it is down (a hazard, ADR 0044)"
};

/** The scenery that may come within 10 of the warning red over more than a few pixels of a view, by level and colour as drawn, and why. */
const NAMED_SCENERY: Record<string, string> = {
  "stortinget #e8262e": "the third rail's cover: it hurts, and is the warning red itself (ADR 0044)"
};

type Ink = { hex: string; near: boolean } | null;
/**
 * The lights the levels register within this of the warning red (CIEDE2000) must be named here, and none may come within
 * `NEAR` (order 35: Bjørvika's crane lights stood 10.3 off it, outside the test by luck; now by name). After dusk a light is its
 * own colour over the dark (ADR 0054), so a red light reads as red as any fill.
 */
const CLOSE = 12;
const NAMED_LIGHTS: Record<string, string> = {
  "bjorvika #ff5a44": "the red light at each far crane's jib tip: real crane lights are red, a pixel each, far off, on a thing that does not hurt (10.3 off the warning red: the hue kept, order 35)"
};

/** Each fill colour once, under each haze: its hex as drawn, and whether it is within 10 of the warning red as seen (null: see-through, not counted). */
const INKS = new Map<string, Map<string, Ink>>();
/** The wash over what is drawn now: how far toward the air, and the air (order 34; the page's `pass` with a haze); and its colours (order 35: looked up once a wash, not a key built on every fill). */
const HAZED: { k: number; air: Rgb; inks: Map<string, Ink> } = { k: 0, air: [0, 0, 0], inks: new Map() };
INKS.set("0", HAZED.inks);
function inkOf(style: unknown) {
  if (typeof style !== "string") return null;
  let ink = HAZED.inks.get(style);
  if (ink === undefined) {
    const p = parseColour(style);
    const seen = p && HAZED.k ? mixRgb(p.rgb, HAZED.air, HAZED.k) : p?.rgb;
    ink = !p || !seen || p.a < 0.6 ? null : { hex: `#${p.rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`, near: deltaE(seen, RED) < NEAR };
    HAZED.inks.set(style, ink);
  }
  return ink;
}

/** A view's pixels: whether the fill each was last filled with is near the warning red and counts (a thing he meets), its colour and who drew it. */
function raster(w: number, h: number) {
  const hit = new Int32Array(w * h).fill(-1);
  const found: { hex: string; who: string }[] = [];
  let style: unknown = "#000";
  let mine = true;
  const base: Record<string, unknown> = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: w, height: h },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
    },
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    fillRect(this: { globalAlpha: number; globalCompositeOperation: string }, x: number, y: number, rw: number, rh: number) {
      if (this.globalAlpha < 0.6 || this.globalCompositeOperation !== "source-over") return;
      const ink = inkOf(style);
      if (!ink) return;
      const x0 = Math.max(0, Math.round(x));
      const x1 = Math.min(w, Math.round(x + rw));
      const y0 = Math.max(0, Math.round(y));
      const y1 = Math.min(h, Math.round(y + rh));
      if (x1 <= x0 || y1 <= y0) return;
      // What covers a pixel with anything not near the red, or not counted, clears it; a counted near-red fill marks it.
      let id = -1;
      if (ink.near && mine) id = found.push({ hex: ink.hex, who: caller() }) - 1;
      for (let yy = y0; yy < y1; yy++) hit.fill(id, yy * w + x0, yy * w + x1);
    }
  };
  Object.setPrototypeOf(base, ANY_METHOD);
  return {
    ctx: base as unknown as CanvasRenderingContext2D,
    /** Whether what is drawn from now on counts (the things he meets) or only covers (the paint on what he stands on). */
    counting(all: boolean) {
      mine = all;
    },
    /** Each colour within 10 of the warning red that counts, its pixels, and who drew it. */
    near() {
      const out = new Map<string, { n: number; who: Set<string> }>();
      for (let i = 0; i < hit.length; i++) {
        if (hit[i] < 0) continue;
        const f = found[hit[i]];
        const o = out.get(f.hex) ?? { n: 0, who: new Set<string>() };
        o.n++;
        o.who.add(f.who);
        out.set(f.hex, o);
      }
      return out;
    }
  };
}
const RED = parseColour(ENEMY.red)!.rgb;

/** Who drew a fill: the first two functions of ours up the stack. */
function caller(): string {
  return (new Error().stack ?? "")
    .split("\n")
    .map((l) => /^\s*at (\S+) \(.*\/(\w+)\.ts:\d+/.exec(l))
    .filter((m): m is RegExpExecArray => !!m && !/^(fillRect|R|S|caller|disc|wdisc|put|drawProp|<anonymous>|forEach|map)$/.test(m[1]) && !m[1].includes("."))
    .slice(0, 2)
    .map((m) => `${m[1]} ${m[2]}`)
    .join(" < ");
}

/** Two rasters drawn on at once: what is drawn once is laid on both, each counting it or only covering with it as it is told. */
function both(a: ReturnType<typeof raster>, b: ReturnType<typeof raster>): CanvasRenderingContext2D {
  const ga = a.ctx as unknown as Record<string, unknown>;
  const gb = b.ctx as unknown as Record<string, unknown>;
  const tee = {
    canvas: ga.canvas,
    fillRect: (x: number, y: number, w: number, h: number) => (a.ctx.fillRect(x, y, w, h), b.ctx.fillRect(x, y, w, h))
  };
  for (const k of ["fillStyle", "globalAlpha", "globalCompositeOperation"])
    Object.defineProperty(tee, k, { get: () => ga[k], set: (v) => ((ga[k] = v), (gb[k] = v)) });
  Object.setPrototypeOf(tee, ANY_METHOD);
  return tee as unknown as CanvasRenderingContext2D;
}

type Most = Map<string, { n: number; at: string; who: Set<string> }>;
/** The lights a level registers within `CLOSE` of the warning red: by colour, how far off, and how many places register one. */
type Lit = Map<string, { d: number; n: number }>;

/**
 * Every view of a level by day, walked once for both tests (order 35; each walked it on its own before): the most pixels a
 * near-red colour of its harmless things fills in one, and who drew it (`things`); and (order 34) the same of the scenery and
 * the ground behind and under what he meets, washed by its layer's haze, what he meets only covering it (`scenery`). What he
 * meets is drawn once, onto both.
 */
function nearRed(def: LevelDef): { things: Most; scenery: Most; lights: Lit } {
  const play = newPlay(def, {});
  const map = play.map;
  const sky = skyOf(def, "day");
  const was = { ...view, g: ctx() };
  Object.assign(view, { w: 320, h: 200, k: 1, reduced: true });
  const v: View = { sky, t: 0, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null };
  const art = def.art;
  const most = { things: new Map() as Most, scenery: new Map() as Most, lights: new Map() as Lit };
  const horizon = map.height - 4 * TILE - 34;
  const haze = hazeOf(def);
  const air = parseColour(airOf(def, "day"))!.rgb;
  const wash = (k: number) => {
    const key = k ? `${k}|${air.join()}` : "0";
    let inks = INKS.get(key);
    if (!inks) INKS.set(key, (inks = new Map()));
    Object.assign(HAZED, { k, air, inks });
  };
  const add = (into: Most, r: ReturnType<typeof raster>, at: string) => {
    for (const [c, o] of r.near()) {
      const m = into.get(c) ?? { n: 0, at: "", who: new Set<string>() };
      if (o.n > m.n) Object.assign(m, { n: o.n, at });
      for (const w of o.who) m.who.add(w);
      into.set(c, m);
    }
  };
  try {
    for (let y = -view.h; y < map.height + view.h / 2; y += view.h)
      for (let x = 0; x < map.width; x += view.w) {
        Object.assign(view, { camX: x, camXf: x, camY: y, camYf: y });
        v.him = { x: x + view.w / 2, y: y + view.h / 2 };
        const behind = raster(view.w, view.h);
        const met = raster(view.w, view.h);
        // The sky, then the far layers, the street's backdrop, the water and the tiles, as the page's passes draw them
        // (`main.ts`, `render/haze.ts`): each washed toward the air by its haze.
        target(behind.ctx);
        behind.counting(false);
        drawSky(sky, 0, horizon);
        behind.counting(true);
        wash(haze[0]);
        art.far?.(v);
        wash(haze[1]);
        art.mid?.(v);
        wash(haze[2]);
        art.near?.(v);
        wash(backHazeOf(def));
        art.back(v);
        wash(0);
        drawWater(map, 0);
        drawTiles(map, art, sky, def.underground);
        // The things he meets, as the page draws them at the start (`drawThings` in main.ts), what is in front, and the paint:
        // counted on their own; over the scenery they only cover it. (The props of the street's backdrop are held piece by piece
        // in `alive/props.test.ts`.)
        target(both(behind, met));
        behind.counting(false);
        met.counting(true);
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
        met.counting(false);
        def.carriers.forEach((d) => carrierShown(d, 0) && standTop(carrierDrawn(d, 0, 1).x, carrierDrawn(d, 0, 1).y, d.w, "moves", false, 0));
        def.timed.forEach((l) => timedPhase(0, l) !== "off" && standTop(l.x, l.y, l.w, "gives", false));
        // The lights the view registered, by their own colour (a lamp's yellow or a window's when they have none).
        for (const l of lights) {
          const c = l.color && parseColour(l.color);
          if (!c) continue;
          const d = deltaE(c.rgb, RED);
          if (d >= CLOSE) continue;
          const key = `#${c.rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
          const had = most.lights.get(key) ?? most.lights.set(key, { d, n: 0 }).get(key)!;
          had.n++;
        }
        lights.length = 0;
        add(most.scenery, behind, `${x},${y}`);
        add(most.things, met, `${x},${y}`);
      }
  } finally {
    wash(0);
    target(was.g);
    Object.assign(view, { w: was.w, h: was.h, k: was.k, camX: was.camX, camY: was.camY, camXf: was.camXf, camYf: was.camYf, reduced: was.reduced });
  }
  return most;
}

/** Each level's walk, made by whichever test asks first. */
const WALKED = new Map<string, ReturnType<typeof nearRed>>();
async function walked(id: string) {
  let w = WALKED.get(id);
  if (!w) WALKED.set(id, (w = nearRed(await loadLevel(id))));
  return w;
}

describe("harmless things keep off the warning red (order 33)", () => {
  test("what carries him, the ledges, cannons, drums, flags, what stands in front and every prop fill no more than a few pixels of a view within 10 of the warning red, but by name", async () => {
    const wrong: string[] = [];
    const table: string[] = [];
    const used = new Set<string>();
    for (const st of [...BUILT, { id: "encore" }]) {
      for (const [c, m] of (await walked(st.id)).things) {
        const key = `${st.id} ${c}`;
        const line = `${key} (${deltaE(parseColour(c)!.rgb, RED).toFixed(1)} from it): ${m.n} pixels at the most in a view (at ${m.at}), by ${[...m.who].join("; ")}`;
        table.push(line);
        if (m.n <= FEW) continue;
        if (NAMED[key]) used.add(key);
        else wrong.push(line);
      }
    }
    console.log(`Harmless things within ${NEAR} of the warning red, the most of each colour in a view of 320 x 200:\n  ${table.join("\n  ")}`);
    expect(wrong).toEqual([]);
    // A name no longer needed is taken out.
    expect(Object.keys(NAMED).filter((k) => !used.has(k))).toEqual([]);
  }, 300_000);

  test("the scenery and the ground, washed by their haze as the page draws them, fill no more than a few pixels of a view within 10 of the warning red, but by name (order 34)", async () => {
    const wrong: string[] = [];
    const table: string[] = [];
    const used = new Set<string>();
    for (const st of [...BUILT, { id: "encore" }]) {
      for (const [c, m] of (await walked(st.id)).scenery) {
        const key = `${st.id} ${c}`;
        const line = `${key} (${deltaE(parseColour(c)!.rgb, RED).toFixed(1)} from it as drawn): ${m.n} pixels at the most in a view (at ${m.at}), by ${[...m.who].join("; ")}`;
        table.push(line);
        if (m.n <= FEW_SCENERY) continue;
        if (NAMED_SCENERY[key]) used.add(key);
        else wrong.push(line);
      }
    }
    console.log(`Scenery and ground within ${NEAR} of the warning red, the most of each colour in a view of 320 x 200:\n  ${table.join("\n  ")}`);
    expect(wrong).toEqual([]);
    expect(Object.keys(NAMED_SCENERY).filter((k) => !used.has(k))).toEqual([]);
  }, 300_000);

  test(`no light a level registers is within ${NEAR} of the warning red, and those within ${CLOSE} are named (order 35)`, async () => {
    const wrong: string[] = [];
    const used = new Set<string>();
    for (const st of [...BUILT, { id: "encore" }])
      for (const [c, l] of (await walked(st.id)).lights) {
        const key = `${st.id} ${c}`;
        if (l.d < NEAR) wrong.push(`${key}: ${l.d.toFixed(1)} from the warning red`);
        else if (NAMED_LIGHTS[key]) used.add(key);
        else wrong.push(`${key}: ${l.d.toFixed(1)} from the warning red, and not named`);
      }
    expect(wrong).toEqual([]);
    expect(Object.keys(NAMED_LIGHTS).filter((k) => !used.has(k))).toEqual([]);
  }, 300_000);
});
