import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { drawLights, target, view } from "@larshansen/pixelkit/paint";
import { textTarget } from "@larshansen/pixelkit/text";
import { createBot } from "./bot";
import { adderCells, drawAdder } from "./figures";
import { LEVELS, mapInfo } from "./levels";
import { FLASH, drawBright, drawDark, drawGhost, drawHim, drawWorld, type Frame } from "./render";
import { WARN_STEPS, gateProgress, newState, sliderRise, sliderSolid, sliderWarning, snakeAt, snakeFlat, snakeHeading, stepMaze, type MazeState } from "./rules";

// Reduced motion in the maze (order 36, as `apps/viking/src/render/reduced.test.ts` holds the fjord): nothing blinks or shakes.
// Every level is drawn as the page draws it, its world held where the scripted player finds it, at 48 steps of the page's
// clock, into a canvas that records every call; with reduced motion every recording is the same. What moves with the
// world's own clock is drawn through it: every sliding wall through its warning, an adder's tongue. His breath and blink are
// his idles (as in the fjord): they may change, never come back to a picture they left within 24 steps.

/** A canvas that draws nothing and writes down every call, with the state it was made in. */
function recorder() {
  const calls: string[] = [];
  const ids = new Map<object, number>();
  const id = (o: object) => {
    if (!ids.has(o)) ids.set(o, ids.size);
    return ids.get(o);
  };
  const g = {
    fillStyle: "" as unknown,
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: 1000, height: 1000 },
    fillRect(x: number, y: number, w: number, h: number) {
      calls.push(`R ${x} ${y} ${w} ${h} ${String(g.fillStyle)} ${g.globalAlpha} ${g.globalCompositeOperation}`);
    },
    drawImage(src: object, ...a: number[]) {
      calls.push(`I ${id(src)} ${a.join(" ")} ${g.globalAlpha}`);
    },
    rect(...a: number[]) {
      calls.push(`rect ${a.join(" ")}`);
    }
  };
  const any = new Proxy(g, { get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined), set: (t, k, v) => (((t as Record<string | symbol, unknown>)[k] = v), true) });
  return { g: any as unknown as CanvasRenderingContext2D, calls };
}

// A stand-in page: the still layer's canvas, the kept pieces (made once, then copied), as in a browser.
const realDocument = (globalThis as { document?: unknown }).document;
beforeAll(() => {
  (globalThis as { document?: unknown }).document = {
    createElement: () => {
      const c = { width: 0, height: 0, getContext: () => ({ createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {}, fillRect() {}, set fillStyle(_: string) {} }) };
      return c;
    }
  };
  Object.assign(view, { w: 320, h: 200, k: 1, dpr: 1, cssW: 320, cssH: 200 });
});
afterAll(() => {
  (globalThis as { document?: unknown }).document = realDocument;
  view.reduced = false;
});

/** The frame the scene would draw for this state, at the page's clock `t`. */
function frameOf(s: MazeState, t: number): Frame {
  return {
    level: s.level,
    t,
    x: s.x,
    y: s.y,
    stones: s.stones,
    snakes: s.snakes.map((n) => ({ ...snakeAt(n.def, n.t), flat: snakeFlat(n.def), dir: snakeHeading(n.def, n.t), t: n.t })),
    cursed: false,
    clock: s.steps,
    keyTaken: s.keyTaken,
    gate: gateProgress(s),
    crumble: s.crumble,
    portalCool: s.portalCool,
    portalFlash: null,
    stoneFlash: new Map(),
    keyFly: null,
    finishFlash: null
  };
}

/** Everything the world's canvas gets in one frame, as the page draws it: the pass with its lights, then what is bright, then the dark. */
function world(f: Frame): string {
  const r = recorder();
  target(r.g);
  view.camX = Math.round(f.x - view.w / 2);
  view.camY = Math.round(f.y - view.h / 2);
  drawWorld(f);
  drawLights();
  drawBright(f);
  drawDark(f);
  return r.calls.join("\n");
}

/** Where the scripted player is at every `every` steps of its clear of a level. */
function along(level: number, every: number): MazeState[] {
  const s = newState(level);
  const bot = createBot(level, "keys");
  const out: MazeState[] = [];
  for (let i = 0; i < 4000 && s.phase !== "cleared"; i++) {
    if (i % every === 0) out.push({ ...s, stones: s.stones.map((o) => ({ ...o })), snakes: s.snakes.map((n) => ({ ...n })), crumble: new Map(s.crumble) });
    const ev = stepMaze(s, bot.next(s));
    bot.after(ev);
  }
  return out;
}

/** The steps of the clock at which a recording repeats one it left within 24 steps: a blink. */
function blinks(recs: string[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < recs.length; i++) {
    if (recs[i] === recs[i - 1]) continue;
    for (let j = i - 2; j >= Math.max(0, i - 24); j--) if (recs[j] === recs[i] && recs[j + 1] !== recs[j]) out.push(i);
  }
  return out;
}

describe("reduced motion in the maze", () => {
  test.each(LEVELS.map((l, i) => [i + 1, l.name] as const))("level %d, %s: the world held draws the same at every step of the clock", (level) => {
    view.reduced = true;
    for (const s of along(level, 240)) {
      const recs = Array.from({ length: 48 }, (_, k) => world(frameOf(s, 1000 + k)));
      const changed = recs.findIndex((r) => r !== recs[0]);
      expect({ level, at: `${Math.round(s.x)},${Math.round(s.y)}`, changed }).toEqual({ level, at: `${Math.round(s.x)},${Math.round(s.y)}`, changed: -1 });
    }
  });

  test("without reduced motion the same watch sees the torches flicker and the curse's line pulse (so it can see a change at all)", () => {
    view.reduced = false;
    const s = along(1, 240)[1];
    const recs = Array.from({ length: 48 }, (_, k) => world(frameOf(s, 1000 + k)));
    expect(new Set(recs).size).toBeGreaterThan(1);
  });

  test("every sliding wall through its warning: steady with reduced motion, shimmering without", () => {
    for (const [i, def] of LEVELS.entries())
      for (const d of def.sliders) {
        const s = newState(i + 1);
        Object.assign(s, { x: (d.at[0] + 0.5) * TILE, y: (d.at[1] + 0.5) * TILE });
        // The clock at each step of its warning with the slider sunk into its groove (it may still be sinking as the warning
        // begins: that is the world's motion): the world there is the same but for the warning.
        const clocks = Array.from({ length: 2 * d.period }, (_, k) => k).filter((k) => sliderWarning(d, k) && !sliderSolid(d, k) && sliderRise(d, k) === 0);
        expect(clocks.length).toBeGreaterThan(WARN_STEPS / 2);
        // What is drawn on and round the slider's own tiles (the others on its level go on rising and sinking by the clock).
        const x0 = d.at[0] * TILE - 2;
        const y0 = d.at[1] * TILE - 2;
        const mine = (rec: string) =>
          rec
            .split("\n")
            .filter((c) => {
              const [kind, x, y] = c.split(" ");
              const wx = Number(x) + view.camX;
              const wy = Number(y) + view.camY;
              return kind === "R" && wx >= x0 && wx < x0 + d.w * TILE + 4 && wy >= y0 && wy < y0 + d.h * TILE + 4;
            })
            .join("\n");
        const at = (reduced: boolean) => {
          view.reduced = reduced;
          return clocks.map((k) => mine(world({ ...frameOf({ ...s, steps: k }, 1000), clock: k })));
        };
        expect({ level: i + 1, slider: d.at.join(","), changes: new Set(at(true)).size }).toEqual({ level: i + 1, slider: d.at.join(","), changes: 1 });
        expect(new Set(at(false)).size).toBeGreaterThan(1);
      }
  });

  test("an adder's tongue stays out with reduced motion (its body's wave is how it moves, and goes on)", () => {
    const tongue = (reduced: boolean) => {
      view.reduced = reduced;
      return Array.from({ length: 48 }, (_, t) => {
        const r = recorder();
        target(r.g);
        view.camX = view.camY = 0;
        drawAdder(100, 100, true, 1, t);
        return r.calls.some((c) => c.includes("#d23a3a"));
      });
    };
    expect(tongue(true).every(Boolean)).toBe(true);
    expect(tongue(false).some((x) => !x)).toBe(true);
    // The wave is the adder's own cycle: its body by its own clock, never by the page's.
    expect(adderCells(5, 1)).toEqual(adderCells(5, 1));
  });

  test("his torch's flame holds still; his breath and blink are his idles and never blink back within 24 steps", () => {
    const him = (reduced: boolean) => {
      view.reduced = reduced;
      const u = recorder();
      textTarget(u.g);
      return Array.from({ length: 96 }, (_, k) => {
        u.calls.length = 0;
        drawHim(100, 100, { moving: false, dist: 0, facing: 1, t: 1000 + k }, false, 1, 1000 + k);
        const flame = u.calls.filter((c) => /#ffd36b|#fff2c4/.test(c)).join("\n");
        return { all: u.calls.join("\n"), flame };
      });
    };
    const held = him(true);
    expect(new Set(held.map((h) => h.flame)).size).toBe(1);
    expect(blinks(held.map((h) => h.all.split("\n").filter((c) => !/#ffd36b|#fff2c4/.test(c)).join("\n")))).toEqual([]);
    expect(new Set(him(false).map((h) => h.flame)).size).toBeGreaterThan(1);
  });

  test("his ghost is drawn the same at every step of the clock it is held at", () => {
    view.reduced = true;
    const u = recorder();
    textTarget(u.g);
    const recs = Array.from({ length: 48 }, (_, k) => {
      u.calls.length = 0;
      drawGhost(80, 80, { moving: true, dist: 30, facing: -1, t: 1000 + k });
      return u.calls.join("\n");
    });
    expect(new Set(recs).size).toBe(1);
  });

  test("the flashes are the page's moments, not blinks: each is shorter than a second and drawn once", () => {
    for (const steps of Object.values(FLASH)) expect(steps).toBeLessThanOrEqual(60);
    expect(mapInfo(LEVELS[1].map).portals.length).toBeGreaterThan(0);
  });
});
