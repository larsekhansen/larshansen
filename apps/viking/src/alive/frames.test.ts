import { beforeAll, describe, expect, test } from "bun:test";
import { PLAYER } from "@larshansen/pixelkit/config";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { target, view } from "@larshansen/pixelkit/paint";
import { census, type Census, type Drawn } from "./census";
import { ALL_FRAMES, HIM, HIM_INK, LAND_STEPS, MARGIN, STRIDE, himFrame, runFrame, type HimState } from "./him";
import { pixels, type Frame } from "./frames";
import { DEATH, deathFrame } from "./death";
import { KIND, type EnemyKind } from "../game/enemies";

// Order 23, section 1: frames. Every enemy and harmless mover has an idle of two frames or more, a move cycle of three
// or four, a wind-up pose where it throws and a death of three frames; no frame leaves the box its look is drawn in;
// his frames stay in the room the page keeps round him, and his feet hold as he runs.

/** A frame's rectangles as one string, for telling frames apart. */
const key = (d: Drawn) => JSON.stringify(d.rects.map((r) => [r.x, r.y, r.w, r.h, r.c]));
const distinct = (ds: Drawn[]) => new Set(ds.map(key)).size;
const bounds = (ds: Drawn[]) => {
  const rs = ds.flatMap((d) => d.rects);
  return { x0: Math.min(...rs.map((r) => r.x)), y0: Math.min(...rs.map((r) => r.y)), x1: Math.max(...rs.map((r) => r.x + r.w)), y1: Math.max(...rs.map((r) => r.y + r.h)) };
};

/** Looks that are stone while they are still (a statue he watches; walking, they have their cycle): stone does not breathe. */
const STONE_STILL = ["statue", "bronze"];
/** How far any frame of a look may reach beyond its still frame: a raised arm or wing, a stride, a lean (pixels). */
const REACH = { side: 4, up: 6, down: 3 };

let looks: Record<string, Census> = {};
beforeAll(async () => {
  looks = await census();
}, 120_000);

describe("every enemy and harmless mover has its frames (order 23)", () => {
  test("every kind in KIND is met, and every look of every level is drawn", () => {
    const kinds = new Set(Object.values(looks).map((l) => l.kind));
    for (const k of Object.keys(KIND) as EnemyKind[]) expect(kinds.has(k)).toBe(true);
    expect(Object.keys(looks).length).toBeGreaterThanOrEqual(40);
  });

  test("an idle of two frames or more (stone while it is still has one: a statue he watches)", () => {
    const short: string[] = [];
    for (const [name, l] of Object.entries(looks)) if (!STONE_STILL.includes(name) && distinct(l.idle) < 2) short.push(`${name} (${l.level}): ${distinct(l.idle)}`);
    expect(short).toEqual([]);
  });

  test("a move cycle of three or four frames (what throws stands where it is: its cycle is its wind-up and throw)", () => {
    const short: string[] = [];
    for (const [name, l] of Object.entries(looks)) if (l.kind !== "thrower" && distinct(l.move) < 3) short.push(`${name} (${l.level}): ${distinct(l.move)}`);
    expect(short).toEqual([]);
  });

  test("whatever throws winds up in a pose, not only a flash: its wind-up is none of its still frames", () => {
    const flat: string[] = [];
    for (const [name, l] of Object.entries(looks)) {
      if (l.kind !== "thrower") continue;
      if (!l.windup || l.idle.some((i) => key(i) === key(l.windup!))) flat.push(name);
    }
    expect(flat).toEqual([]);
  });

  test("a death of three frames (hit, fold, gone), within the eight steps the squash took", () => {
    const short: string[] = [];
    for (const [name, l] of Object.entries(looks)) if (distinct(l.death) < 3) short.push(name);
    expect(short).toEqual([]);
    expect(DEATH.end).toBe(8);
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].map((a) => deathFrame(a, false))).toEqual([0, 0, 1, 1, 1, 2, 2, 2, -1]);
    // Reduced motion: no fold (a squash), the hit held, then gone.
    expect([...Array(15).keys()].map((a) => deathFrame(a, true)).filter((k) => k === 1)).toEqual([]);
  });

  test("every look of every level is drawn pixel by pixel (orders 23 to 25, ADR 0045): its body in runs one pixel high, none in the old blocks", () => {
    const pal = new Set<string>(Object.values(ENEMY));
    const blocks: string[] = [];
    for (const [name, l] of Object.entries(looks))
      for (const d of [...l.idle, ...l.move, ...(l.windup ? [l.windup] : [])])
        if (d.rects.some((r) => pal.has(r.c) && r.h > 1)) {
          blocks.push(`${name}: ${d.name}`);
          break;
        }
    expect(blocks).toEqual([]);
  });

  test(`no frame leaves the box its look is drawn in: its still frame, ${REACH.side} pixels either side, ${REACH.up} over it, ${REACH.down} under`, () => {
    const out: string[] = [];
    for (const l of Object.values(looks)) {
      // A jumper's still frames are its water rippling, and its body shows only out of the water: its box is its leap.
      const box = bounds(l.kind === "jumper" ? l.move : l.idle);
      for (const d of [...(l.kind === "jumper" ? [] : l.idle), ...l.move, ...(l.windup ? [l.windup] : [])]) {
        const b = bounds([d]);
        if (b.x0 < box.x0 - REACH.side || b.x1 > box.x1 + REACH.side || b.y0 < box.y0 - REACH.up || b.y1 > box.y1 + REACH.down) out.push(`${d.name}: ${JSON.stringify(b)} against ${JSON.stringify(box)}`);
      }
    }
    expect(out).toEqual([]);
  });
});

describe("his frames (order 23)", () => {
  const still: HimState = { t: 0, walking: false, landed: 99, deep: false, dashing: false, shield: false, seated: false, slope: 0, thrown: false, entering: false, reduced: false };
  const body = (o: Partial<{ onGround: boolean; vy: number; x: number; facing: 1 | -1 }> = {}) => ({ x: 100, y: 100, vx: 0, vy: 0, onGround: true, facing: 1, coyote: 0, buffer: 0, cutReady: false, airJumps: 0, ...o }) as never;

  test(`every frame stays in the room the page keeps round his box (${MARGIN} pixels), and is drawn in his colours`, () => {
    const out: string[] = [];
    for (const f of ALL_FRAMES) if (f.x0 < -MARGIN || f.y0 < -MARGIN || f.x1 > PLAYER.w + MARGIN || f.y1 > PLAYER.h + MARGIN) out.push(`${f.name}: ${f.x0},${f.y0} to ${f.x1},${f.y1}`);
    expect(out).toEqual([]);
    const colours = new Set(Object.values(HIM_INK));
    for (const f of ALL_FRAMES) for (const c of f.ink) expect(colours.has(c)).toBe(true);
    // His feet are on the ground in every frame he stands in.
    for (const f of [HIM.stand, HIM.breath, HIM.blink, ...HIM.run, HIM.land, HIM.landDeep, HIM.shield, HIM.push]) expect(f.y1).toBe(PLAYER.h);
  });

  test("a frame for every state the game keeps", () => {
    const pick = (s: Partial<HimState>, b = body()) => himFrame(b, { ...still, ...s }).name;
    expect(pick({})).toBe("stand");
    expect(new Set([0, 30, 60, 90].map((t) => pick({ t }))).size).toBeGreaterThanOrEqual(2);
    expect(new Set([...Array(400).keys()].map((t) => pick({ t }))).has("blink")).toBe(true);
    expect(new Set([0, 3, 6, 9].map((x) => pick({ walking: true }, body({ x }))))).toEqual(new Set(["run 1", "run 2", "run 3", "run 4"]));
    expect(pick({}, body({ onGround: false, vy: -3 }))).toBe("rise");
    expect(pick({}, body({ onGround: false, vy: 0 }))).toBe("top of the jump");
    expect(pick({}, body({ onGround: false, vy: 3 }))).toBe("fall");
    expect(pick({ landed: 0 })).toBe("landing");
    expect(pick({ landed: 0, deep: true })).toBe("landing from high");
    expect(pick({ landed: LAND_STEPS.low })).toBe("stand");
    expect(pick({ landed: LAND_STEPS.high - 1, deep: true })).toBe("landing from high");
    expect(pick({ dashing: true }, body({ onGround: false }))).toBe("dash");
    expect(pick({ shield: true })).toBe("behind the shield");
    expect(pick({ seated: true })).toBe("sitting");
    expect(pick({ seated: true, slope: 1 })).toBe("sitting, leaning back");
    expect(pick({ thrown: true }, body({ onGround: false, vy: -2 }))).toBe("thrown back");
    expect(pick({ entering: true })).toBe("pushing into a door");
  });

  test("reduced motion keeps the breath and the run (how he reads state), not the landing's squash", () => {
    const reduced = { ...still, reduced: true };
    expect(himFrame(body(), { ...reduced, landed: 0 }).name).toBe("stand");
    expect(new Set([0, 30].map((t) => himFrame(body(), { ...reduced, t }).name)).size).toBe(2);
    expect(himFrame(body({ x: 3 }), { ...reduced, walking: true }).name).toBe("run 2");
  });

  test(`his feet hold as he runs: a planted foot goes back ${STRIDE} pixels a frame, as far as he goes forward`, () => {
    /** Where a boot stands on the ground (its middle, on his bottom row) in a frame, or null if it is lifted. */
    const foot = (f: Frame, near: boolean) => {
      const xs: number[] = [];
      pixels(f, 1, PLAYER.w, (c, r, colour) => {
        if (r === PLAYER.h - 1 && (near ? colour === HIM_INK.K || colour === HIM_INK.L : colour === HIM_INK.k)) xs.push(c);
      });
      return xs.length ? (Math.min(...xs) + Math.max(...xs)) / 2 : null;
    };
    for (const near of [true, false])
      for (let k = 0; k < 4; k++) {
        const a = foot(HIM.run[k], near);
        const b = foot(HIM.run[(k + 1) % 4], near);
        if (a !== null && b !== null) expect(b - a).toBe(-STRIDE);
      }
    // And the frame turns over every STRIDE pixels of ground covered, the same either way he faces.
    expect([0, 2.9, 3, 5.9, 6, 9, 12].map((x) => runFrame(x, 1))).toEqual([0, 0, 1, 1, 2, 3, 0]);
    expect(runFrame(-3, -1)).toBe(1);
  });
});

describe("the small things and what moves and cannot hurt him (order 24)", () => {
  /** A frame's pixels as one string, for telling frames apart. */
  const sig = (f: Frame) => {
    const out: string[] = [];
    pixels(f, 1, f.x1, (c, r, colour) => out.push(`${c},${r},${colour}`));
    return out.join(";");
  };
  test("the sheep walks in three frames or more, grazes in two, and is flattened by a landing; its box as before", async () => {
    const { SHEEP_FRAMES } = await import("./things");
    const { SHEEP } = await import("../game/sheep");
    expect(new Set(SHEEP_FRAMES.walk.map(sig)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(SHEEP_FRAMES.graze.map(sig)).size).toBe(2);
    for (const f of [...SHEEP_FRAMES.walk, ...SHEEP_FRAMES.graze, SHEEP_FRAMES.squash]) {
      expect(f.x1).toBeLessThanOrEqual(SHEEP.w);
      expect(f.y1).toBe(SHEEP.h);
    }
  });

  test("the flag flies in three frames, in wind and in still air; a flame flickers in three; water laps in three", async () => {
    const T = await import("./things");
    const D = await import("./depth");
    const recorded = (draw: () => void) => {
      const rects: string[] = [];
      const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push(`${x},${y},${w},${h},${rec.fillStyle}`); }, drawImage() {} };
      target(rec as unknown as CanvasRenderingContext2D);
      draw();
      return rects.join(";");
    };
    Object.assign(view, { camX: 0, camY: 0, reduced: false });
    const flag = { x: 20, bottom: 60 } as never;
    for (const [level, rate] of [["langkaia", 9], ["stortinget", 26]] as const)
      expect(new Set([0, 1, 2].map((k) => recorded(() => T.flag(flag, -1000, k * rate - 20, level)))).size).toBe(3);
    expect(new Set([0, 5, 10].map((t) => recorded(() => T.flame(10, 10, t)))).size).toBe(3);
    expect(new Set([0, 16, 32].map((t) => recorded(() => D.lap(10, 10, -1, t)))).size).toBe(3);
    // Reduced motion: the flag and the flame hold still.
    view.reduced = true;
    expect(new Set([0, 9, 18].map((t) => recorded(() => T.flag(flag, -1000, t, "langkaia")))).size).toBe(1);
    expect(new Set([0, 5, 10].map((t) => recorded(() => T.flame(10, 10, t)))).size).toBe(1);
    view.reduced = false;
  });
});

void view;
