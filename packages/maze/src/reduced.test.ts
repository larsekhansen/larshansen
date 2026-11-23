import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { createInput } from "@larshansen/pixelkit/input";
import { drawLights, target, view } from "@larshansen/pixelkit/paint";
import { createStage } from "@larshansen/pixelkit/stage";
import { textTarget } from "@larshansen/pixelkit/text";
import { createBot } from "./bot";
import { adderCells, drawAdder } from "./figures";
import { LEVELS, mapInfo } from "./levels";
import { FLASH, drawBright, drawDark, drawGhost, drawHim, drawWorld, type Frame } from "./render";
import { WARN_STEPS, gateProgress, newState, sliderRise, sliderSolid, sliderWarning, snakeAt, snakeFlat, snakeHeading, stepMaze, type MazeState } from "./rules";
import { createMaze, type Steer } from "./scene";

// Reduced motion in the maze (order 36, as `apps/viking/src/render/reduced.test.ts` holds the fjord): nothing blinks or shakes.
// Every level is drawn as the page draws it, its world held where the scripted player finds it, at 48 steps of the page's
// clock, into a canvas that records every call; with reduced motion every recording is the same. What moves with the
// world's own clock is drawn through it: every sliding wall through its warning, an adder's tongue. His breath and blink are
// his idles (as in the fjord): they may change, never come back to a picture they left within 24 steps.
//
// Since order 37 the scene itself is drawn too, as the page draws it (`createMaze` in a stand-in page whose canvases record every
// call): through a curse, a level's end, its card and the way into the next level. What the scene draws over the world (the
// screen's shake, the curse's red frame round the view, the fade) was only read in the code before.

/** A canvas that draws nothing and writes down every call, with the state it was made in. */
function recorder(): { g: CanvasRenderingContext2D; calls: string[] } {
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
    },
    fillText(text: string, x: number, y: number) {
      calls.push(`T ${text} ${x} ${y} ${String(g.fillStyle)} ${g.globalAlpha}`);
    },
    measureText: (text: string) => ({ width: text.length * 6 }),
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
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

// --- The scene itself (order 37) -----------------------------------------------------------------------------------------------

/** An element of the stand-in page: takes any property and any call; a canvas's context records (`canvases`, in the order made). */
function element(tag: string, canvases: { g: CanvasRenderingContext2D; calls: string[] }[], styles: string[]): object {
  const own: Record<string | symbol, unknown> = { tagName: tag.toUpperCase(), style: {}, hidden: false, textContent: "", children: [] as object[] };
  const classes = new Set<string>();
  own.classList = { add: (c: string) => classes.add(c), remove: (c: string) => classes.delete(c), contains: (c: string) => classes.has(c), toggle: (c: string, on?: boolean) => ((on ?? !classes.has(c)) ? classes.add(c) : classes.delete(c), classes.has(c)) };
  if (tag === "canvas") {
    const r = recorder();
    canvases.push(r);
    own.getContext = () => r.g;
  }
  own.appendChild = own.append = own.insertBefore = (...kids: object[]) => {
    for (const k of kids) if ((k as { tagName?: string }).tagName === "STYLE") styles.push(String((k as { textContent?: string }).textContent ?? ""));
    (own.children as object[]).push(...kids);
    return kids[0];
  };
  own.querySelector = () => null;
  own.getBoundingClientRect = () => ({ left: 0, top: 0, width: 390, height: 844, right: 390, bottom: 844 });
  return new Proxy(own, { get: (t, k) => (k in t ? t[k] : () => undefined), set: (t, k, v) => ((t[k] = v), true) });
}

/** What one step of the scene drew: the camera, the sharp canvas (him, the words, what is drawn over the view), the world. */
interface Drawn {
  step: number;
  phase: string;
  level: number;
  cam: string;
  text: string;
  world: string;
  /** The fade over the whole view (0 none, 1 black), and fills that frame the view along an edge. */
  fade: number;
  frame: number;
  card: boolean;
}

/**
 * Runs the maze's own scene in a stand-in page for `steps` steps on `level`, steered by `steer`, drawing a frame after every
 * step as the page does, and says what each frame drew. `press(i)` names a key pressed before step i (the card's way on).
 */
function scene(reduced: boolean, level: number, steer: Steer, steps: number, press: (i: number, drawn: Drawn[]) => "enter" | null = () => null): { drawn: Drawn[]; styles: string[] } {
  const canvases: { g: CanvasRenderingContext2D; calls: string[] }[] = [];
  const styles: string[] = [];
  const g = globalThis as Record<string, unknown>;
  const was = { document: g.document, window: g.window, getComputedStyle: g.getComputedStyle };
  const body = element("body", canvases, styles);
  g.document = { createElement: (tag: string) => element(tag, canvases, styles), getElementById: () => null, head: element("head", canvases, styles), body, addEventListener() {}, removeEventListener() {} };
  g.window = { addEventListener() {}, removeEventListener() {}, devicePixelRatio: 1 };
  g.getComputedStyle = () => ({ paddingTop: "0", paddingRight: "0", paddingBottom: "0", paddingLeft: "0" });
  try {
    const stageEl = element("div", canvases, styles) as HTMLElement;
    const px = element("canvas", canvases, styles) as HTMLCanvasElement;
    const ui = element("canvas", canvases, styles) as HTMLCanvasElement;
    const kit = createStage({ stage: stageEl, px, ui, factors: [1] });
    kit.resize();
    // The sharp canvas, as the page gives it to the kit's text.
    const sharp = canvases[1];
    textTarget(sharp.g);
    // The canvas the world's pass is drawn on before it is copied onto its depth (the first the stage made of its own), and the
    // depth's own canvas, which then gets what is bright (the doorway's glow, his light), the bursts and the dark.
    const pass = canvases[2];
    const street = canvases[3];
    view.reduced = reduced;
    const input = createInput();
    /** The card after a level (`panel.ts`, the element of class "mz-done"). */
    let card: { hidden: boolean } | undefined;
    const maze = createMaze({ stage: kit, input, sfx: { play() {}, voice() {}, muted: true, toggleMute: () => true }, lang: "en", el: stageEl, say() {}, onLeave() {}, topInset: () => 20 }, { level, steer });
    card = (stageEl as unknown as { children: { hidden: boolean; className?: string }[] }).children.find((k) => typeof k.className === "string" && k.className.includes("mz-done"));
    const drawn: Drawn[] = [];
    for (let i = 0; i < steps; i++) {
      const key = press(i, drawn);
      if (key) input.press(key);
      maze.step();
      input.endStep();
      for (const c of canvases) c.calls.length = 0;
      maze.render(0, 1000);
      const text = sharp.calls;
      const W = view.cssW;
      const H = view.cssH;
      const fade = text.map((c) => /^R 0 0 (\S+) (\S+) rgba\(\d+, \d+, \d+, ([\d.]+)\)/.exec(c)).find((m) => m && Number(m[1]) >= W && Number(m[2]) >= H);
      // A fill along a whole edge of the view, a few pixels deep: a frame round it.
      const frame = text.filter((c) => {
        const [k, x, y, w, h] = c.split(" ");
        if (k !== "R") return false;
        const [X, Y, Wd, Ht] = [x, y, w, h].map(Number);
        return (Wd >= W && Ht <= 8 && (Y <= 0 || Y + Ht >= H)) || (Ht >= H && Wd <= 8 && (X <= 0 || X + Wd >= W));
      }).length;
      drawn.push({
        step: i,
        phase: maze.state.phase,
        level: maze.state.level,
        cam: `${view.camXf} ${view.camYf}`,
        text: text.join("\n"),
        world: `${pass.calls.join("\n")}\n--\n${street.calls.join("\n")}`,
        fade: fade ? Number(fade[3]) : 0,
        frame,
        card: !!card && !card.hidden
      });
    }
    maze.destroy();
    return { drawn, styles };
  } finally {
    Object.assign(g, was);
    view.reduced = false;
  }
}

/** Stands still for `wait` steps, walks left into the wall until the curse takes him, then stands still. */
function intoTheWall(wait: number): Steer {
  let i = 0;
  let cursed = false;
  return { next: () => (i++ < wait || cursed ? { dx: 0, dy: 0 } : { dx: -1.2, dy: 0 }), after: (ev) => void (cursed ||= !!ev.cursed) };
}

/** The scripted player's clear of a level, then nothing more (the next level is only looked at). */
function clearOnly(level: number): Steer {
  const bot = createBot(level, "keys");
  return { next: (s) => (s.level === level ? bot.next(s) : { dx: 0, dy: 0 }), after: (ev) => bot.after(ev) };
}

/** Steps at which a run of values turns from rising to falling or back, other than at its ends (0 or 1). */
function turns(xs: number[]): number[] {
  const out: number[] = [];
  let dir = 0;
  for (let i = 1; i < xs.length; i++) {
    const d = Math.sign(xs[i] - xs[i - 1]);
    if (!d) continue;
    if (dir && d !== dir && xs[i - 1] > 0 && xs[i - 1] < 1) out.push(i);
    dir = d;
  }
  return out;
}

describe("the scene itself, drawn as the page draws it, with reduced motion (order 37)", () => {
  test("through a curse nothing shakes, frames the view or flashes: the camera, the world and the sharp canvas hold still while it has him", () => {
    const { drawn } = scene(true, 1, intoTheWall(40), 120);
    const cursed = drawn.filter((d) => d.phase === "cursed");
    expect(cursed.length).toBeGreaterThan(30);
    expect(new Set(cursed.map((d) => d.cam)).size).toBe(1);
    expect(cursed.filter((d) => d.frame).length).toBe(0);
    // From the curse's second frame (its first is drawn where he was a step before, as every frame is), the world holds still.
    expect(new Set(cursed.slice(1).map((d) => d.world)).size).toBe(1);
    // His breath is his idle (as in the fjord): it may change him, never back within 24 steps.
    expect(blinks(cursed.map((d) => d.text))).toEqual([]);
    expect(blinks(drawn.map((d) => d.world))).toEqual([]);
  });

  test("without reduced motion the same watch sees the shake, the red frame round the view and the curse flashing (so it can see them)", () => {
    const cursed = scene(false, 1, intoTheWall(40), 120).drawn.filter((d) => d.phase === "cursed");
    expect(new Set(cursed.map((d) => d.cam)).size).toBeGreaterThan(1);
    expect(cursed.filter((d) => d.frame).length).toBeGreaterThan(20);
    expect(new Set(cursed.map((d) => d.world)).size).toBeGreaterThan(1);
  });

  test("a level's end, its card and the way into the next: no shake, no frame round the view, the fade only ever darkens or clears, a little a step", () => {
    const clear = playLevelSteps(1);
    // The key that takes him on from the card is pressed thirty steps after the card shows.
    const { drawn, styles } = scene(true, 1, clearOnly(1), clear + 160, (i, d) => (d.findIndex((x) => x.card) === i - 30 ? "enter" : null));
    const shown = drawn.findIndex((d) => d.card);
    expect(shown).toBeGreaterThan(clear);
    expect(drawn.at(-1)!.level).toBe(2);
    const after = drawn.slice(clear);
    // He stands in the doorway from the clear until the next level loads: the camera does not move.
    const still = after.filter((d) => d.level === 1);
    expect(new Set(still.map((d) => d.cam)).size).toBe(1);
    expect(drawn.filter((d) => d.frame).length).toBe(0);
    // The fade: dark at the start, clearing; dark again on the way out; clearing into the next level. It turns only when fully clear or
    // fully dark, and never changes by more than a twentieth a step.
    const fade = drawn.map((d) => d.fade);
    expect(turns(fade)).toEqual([]);
    expect(Math.max(...fade.slice(1).map((f, i) => Math.abs(f - fade[i])))).toBeLessThanOrEqual(1 / 20 + 1e-9);
    // The world after the clear: the doorway's flare dies away once and nothing comes back.
    expect(blinks(after.map((d) => d.world))).toEqual([]);
    // The card's styles move nothing.
    expect(styles.join("\n")).not.toMatch(/animation|transition|@keyframes/);
  });
});

/** The step on which the scripted player clears a level at key speed. */
function playLevelSteps(level: number): number {
  const s = newState(level);
  const bot = createBot(level, "keys");
  let i = 0;
  for (; i < 4000 && s.phase !== "cleared"; i++) bot.after(stepMaze(s, bot.next(s)));
  return i;
}
