import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mix, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, PALETTE } from "@larshansen/pixelkit/palette";
import { textTarget } from "@larshansen/pixelkit/text";
import { ADDER, ADDER_EDGE, adderCells, drawAdder } from "./figures";
import { LEVELS } from "./levels";
import { stillPixels } from "./look";
import { drawBright, drawGhost, drawHim, type Frame } from "./render";
import { gateProgress, newState, sliderSolid, sliderWarning } from "./rules";


// Nothing harmless in the warning red (order 36; ADR 0044, as `apps/viking/src/render/warning.test.ts` holds the fjord). In the
// mound what hurts is a wall, a shut gate, a pit, a sliding wall while it stands and an adder: the walls say so by the curse's
// rust-red line along their edge, an adder by the warning red round it. Nothing else the maze draws (the floor, the stone of
// the walls' tops and faces, the hill, the pad, the doorways, the stones, the key, the teleport stones, the raven, the
// mound-dweller, the feather, a sliding wall's groove and warning, him, his ghost) comes within 10 (CIEDE2000) of the warning
// red or of the curse's reds, but for a few pixels named here.

/** The warning colours: the warning red round what hurts and moves, and the curse's line along every wall (it pulses between two, and flashes). */
const WARNING = { "the warning red": ENEMY.red, "the curse": PALETTE.curse, "the curse, bright": PALETTE.curseBright, "the curse's flash": PALETTE.curseFlash };

function lab(hex: string): [number, number, number] {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const x = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047;
  const y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  const z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/** CIEDE2000 between two colours. */
export function de2000(a: string, b: string): number {
  const [L1, a1, b1] = lab(a);
  const [L2, a2, b2] = lab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h = (bb: number, ap: number) => (bb === 0 && ap === 0 ? 0 : (Math.atan2(bb, ap) / rad + 360) % 360);
  const h1 = h(b1, a1p);
  const h2 = h(b2, a2p);
  const dL = L2 - L1;
  const dC = C2p - C1p;
  let dh = C1p * C2p === 0 ? 0 : h2 - h1;
  if (dh > 180) dh -= 360;
  else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh / 2) * rad);
  const Lm = (L1 + L2) / 2;
  const Cpm = (C1p + C2p) / 2;
  let hm = h1 + h2;
  if (C1p * C2p !== 0) hm = Math.abs(h1 - h2) > 180 ? (h1 + h2 + 360) / 2 : (h1 + h2) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const SC = 1 + 0.045 * Cpm;
  const SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(2 * dTheta * rad) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH));
}

/** Pixels painted by colour, from a canvas that keeps only opaque fills (glows and shadows are see-through, and kept off). */
function inks() {
  const area = new Map<string, number>();
  const g = {
    fillStyle: "" as unknown,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillRect(_x: number, _y: number, w: number, h: number) {
      const c = String(g.fillStyle);
      if (!/^#[0-9a-f]{6}$/i.test(c) || g.globalAlpha < 0.99 || g.globalCompositeOperation !== "source-over") return;
      area.set(c.toLowerCase(), (area.get(c.toLowerCase()) ?? 0) + w * h);
    }
  };
  const any = new Proxy(g, { get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined), set: (t, k, v) => (((t as Record<string | symbol, unknown>)[k] = v), true) });
  return { g: any as unknown as CanvasRenderingContext2D, area };
}

/** Of these inks, the pixels within `d` of each warning colour, by ink. */
function near(area: Map<string, number>, d = 10) {
  const out: { ink: string; warning: string; de: number; px: number }[] = [];
  for (const [ink, px] of area)
    for (const [name, w] of Object.entries(WARNING)) {
      const de = de2000(ink, w);
      if (de < d) out.push({ ink, warning: name, de: Math.round(de * 10) / 10, px });
    }
  return out;
}

const realDocument = (globalThis as { document?: unknown }).document;
beforeAll(() => {
  // Drawn in a test as in a browser that has no canvases: every piece painted where it stands, so its colours are counted.
  (globalThis as { document?: unknown }).document = undefined;
  Object.assign(view, { w: 600, h: 400, k: 1, dpr: 1, cssW: 600, cssH: 400, camX: 0, camY: 0, reduced: false });
});
afterAll(() => {
  (globalThis as { document?: unknown }).document = realDocument;
});

/** The frame the page draws at a level's start, every slider at a clock where it is a groove in its warning, nothing flashing, no adder. */
function harmless(level: number, clock: number, keyTaken = false): Frame {
  const s = newState(level);
  return {
    level,
    t: 7,
    x: s.x,
    y: s.y,
    stones: s.stones.map((o, i) => ({ ...o, lit: i % 2 === 0 })),
    snakes: [],
    cursed: false,
    clock,
    keyTaken,
    gate: keyTaken ? 0.5 : gateProgress(s),
    crumble: new Map(),
    portalCool: 0,
    portalFlash: null,
    stoneFlash: new Map(),
    keyFly: null,
    finishFlash: null
  };
}

describe("nothing harmless in the warning red, in the mound", () => {
  test.each(LEVELS.map((l, i) => [i + 1, l.name] as const))("level %d, %s: the still layer (floor, lining, faces, hill, pad, doorways)", (level) => {
    const area = new Map<string, number>();
    for (const c of stillPixels(LEVELS[level - 1]).px) if (c) area.set(c, (area.get(c) ?? 0) + 1);
    expect({ level, near: near(area) }).toEqual({ level, near: [] });
  });

  test.each(LEVELS.map((l, i) => [i + 1, l.name] as const))("level %d, %s: what is drawn over it (stones, key, gate, teleport stones, crumbling floor, groove and warning of the sliding walls, the raven, the dweller, the feather, the door's corners)", (level) => {
    const def = LEVELS[level - 1];
    // A clock where no slider stands (and, where there is one, one in its warning): what it draws then is harmless.
    const clocks = Array.from({ length: 600 }, (_, k) => k).filter((k) => def.sliders.every((d) => !sliderSolid(d, k)));
    const clock = clocks.find((k) => def.sliders.some((d) => sliderWarning(d, k))) ?? clocks[0] ?? 0;
    for (const keyTaken of [false, true]) {
      const r = inks();
      target(r.g);
      const f = harmless(level, clock, keyTaken);
      drawBright(f);
      // Named, because they hurt: a sliding wall's curse line while it stands (it is wall), drawn in the curse's pulse at this
      // moment; and the rune on a shut gate, glowing the curse's red until the key is taken (a shut gate is wall).
      const standing = def.sliders.some((d) => sliderSolid(d, clock)) ? [mix(PALETTE.curse, PALETTE.curseBright, 0.5 + 0.5 * Math.sin(f.t * 0.045))] : [];
      const gate = !keyTaken && def.map.some((row) => row.includes("g")) ? [PALETTE.curseBright] : [];
      for (const ink of [...standing, ...gate]) r.area.delete(ink.toLowerCase());
      expect({ level, keyTaken, near: near(r.area) }).toEqual({ level, keyTaken, near: [] });
    }
  });

  test("him and his ghost, in every frame he is drawn in the mound", () => {
    const r = inks();
    textTarget(r.g);
    for (let k = 0; k < 400; k += 3) {
      drawHim(100, 100, { moving: k % 2 === 0, dist: k, facing: k % 4 < 2 ? 1 : -1, t: k }, false, 1, k);
      drawGhost(100, 100, { moving: true, dist: k, facing: 1, t: k });
    }
    expect(near(r.area)).toEqual([]);
  });

  test("an adder says it hurts as the fjord's invaders do: the warning red round it, its body off every warning colour", () => {
    const r = inks();
    target(r.g);
    for (let t = 0; t < 30; t++) drawAdder(100, 100, t % 2 === 0, t % 3 === 0 ? 1 : -1, t);
    expect(r.area.get(ADDER_EDGE.toLowerCase())).toBeGreaterThan(30);
    const body = new Map([...r.area].filter(([c]) => [ADDER.belly, ADDER.body, ADDER.light, ADDER.top, ADDER.zigzag].map((x) => x.toLowerCase()).includes(c)));
    expect(near(body, 20)).toEqual([]);
    expect(adderCells(0, 1).flat().filter((c) => c !== ".").length).toBeGreaterThan(30);
  });
});
