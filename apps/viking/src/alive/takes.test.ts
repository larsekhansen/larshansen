import { afterEach, describe, expect, test } from "bun:test";
import { target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import type { Phase } from "@larshansen/pixelkit/oslo";
import { newPlay, type Play } from "../game/play";
import { BUILT, loadLevel } from "../levels/index";
import { deltaE, mixRgb, parseColour, tinted } from "../render/fields";
import { RUNE_RIM, bracteate, cheese, runeRim, runeStone, skilling, takeDark, takeLines } from "./things";

// Order 40, item 1 (ADR 0056 amended): after dusk what he takes has a line a pixel wide round it in the level's dark, as the maze's
// rune key has; by day nothing changes. Order 39 measured the bracteate, the cheese and the skilling 14.5 to 18 off an evening's warm
// ground; with the line each measured in place stands 30 or more off what is round it (`apps/viking/tools/review/o40/after.md`).

type Px = Map<string, string>;
/** What a drawing paints, pixel by pixel ("x,y" to its colour), as the page would, the camera at the world's origin. */
function painted(draw: () => void): Px {
  const px: Px = new Map();
  const rec = {
    fillStyle: "",
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) px.set(`${i},${j}`, rec.fillStyle);
    }
  };
  target(rec as unknown as CanvasRenderingContext2D);
  draw();
  return px;
}
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const at = (k: string) => k.split(",").map(Number);
/** The pixels beside a shape (left, right, above or below one of its own) that it does not paint. */
function beside(shape: Px): Set<string> {
  const out = new Set<string>();
  for (const k of shape.keys()) {
    const [x, y] = at(k);
    for (const [dx, dy] of N4) if (!shape.has(`${x + dx},${y + dy}`)) out.add(`${x + dx},${y + dy}`);
  }
  return out;
}
/** A shape's own pixels on its edge, with their colours. */
const edgeOf = (shape: Px) => [...shape].filter(([k]) => N4.some(([dx, dy]) => !shape.has(`${at(k)[0] + dx},${at(k)[1] + dy}`)));
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const AFTER_DUSK: Phase[] = ["evening", "twilight", "night"];
const rgb = (c: string) => parseColour(c)!.rgb;
/** The things he can still take in a play, each drawn at its step as the page draws it. */
function things(p: Play): (() => void)[] {
  const out: (() => void)[] = [];
  // The skilling's glint, a star that crosses it six steps in a hundred and fifty, is not its shape (it is drawn over the line).
  const still = (draw: () => void) => () => {
    const was = view.reduced;
    view.reduced = true;
    draw();
    view.reduced = was;
  };
  p.skilling.forEach((s, i) => s.at === null && out.push(still(() => skilling(s.box.x + 1, s.box.y + 1, p.t, i))));
  const c = p.cheese;
  if (c && c.at === null) out.push(() => cheese(c.box.x, c.box.y - 2, p.t));
  const b = p.bracteate;
  if (b && p.bracteateAt === null) out.push(() => bracteate(b.x, b.y, p.t));
  return out;
}
/** The view as the whole level, so nothing in it is off the screen. */
const wholeLevel = (p: Play) => Object.assign(view, { camX: -64, camY: -64, camXf: -64, camYf: -64, w: p.map.width + 128, h: p.map.height + 128 });
const saved = { ...view };
afterEach(() => void Object.assign(view, saved));

describe("what he takes after dusk (order 40)", () => {
  test("by day no line; after dusk a line of the level's dark round every thing he can take, on the pixels beside its shape as drawn and nowhere else", async () => {
    expect(takeDark("day")).toBeNull();
    let lined = 0;
    for (const st of BUILT) {
      const p = newPlay(await loadLevel(st.id));
      wholeLevel(p);
      for (const reduced of [false, true]) {
        view.reduced = reduced;
        // Steps that show the skilling's four turns, the cheese's bob and the bracteate narrow and full.
        for (const t of [0, 13, 27, 52, 77]) {
          p.t = t;
          const want = new Set<string>();
          for (const draw of things(p)) for (const k of beside(painted(draw))) want.add(k);
          for (const phase of AFTER_DUSK) {
            const line = painted(() => takeLines(p, phase, false));
            expect([...new Set(line.values())]).toEqual([takeDark(phase)!]);
            expect(new Set(line.keys())).toEqual(want);
            lined += want.size;
          }
        }
      }
    }
    expect(lined).toBeGreaterThan(10_000);
  });

  test("the line is the level's dark: an enemy's own near-black line as the sky's tint leaves it, never black where the sky is not, never near the warning red or a role's colour", () => {
    for (const phase of AFTER_DUSK) {
      const dark = rgb(takeDark(phase)!);
      const want = tinted(rgb(ENEMY.line), phase);
      for (let i = 0; i < 3; i++) expect(Math.abs(dark[i] - want[i])).toBeLessThanOrEqual(0.5);
      expect(deltaE(dark, rgb(ENEMY.red))).toBeGreaterThanOrEqual(30);
      expect(deltaE(dark, tinted(rgb(ENEMY.red), phase))).toBeGreaterThanOrEqual(20);
      for (const [role, colours] of Object.entries(ROLES.COLOURS))
        for (const c of colours) expect({ role, c, far: deltaE(dark, rgb(c)) >= 10 }).toEqual({ role, c, far: true });
    }
    // Not black where the level is not: the evening's line is a dark plum, the night's a navy.
    expect(deltaE(rgb(takeDark("evening")!), [0, 0, 0])).toBeGreaterThan(10);
    expect(deltaE(rgb(takeDark("evening")!), rgb(takeDark("night")!))).toBeGreaterThan(5);
  });

  test("it stands 30 or more off the edge of what it goes round, as the page shows that after dusk (the coin and the cheese drawn again over their tinted selves, the bracteate's disc in its own soft light)", () => {
    const soft = parseColour("rgba(255, 214, 120, 0.45)")!;
    for (const phase of AFTER_DUSK) {
      const dark = rgb(takeDark(phase)!);
      const redrawn = (c: string) => deltaE(mixRgb(tinted(rgb(c), phase), rgb(c), 0.8), dark);
      for (const t of [0, 10, 20, 30]) expect(median(edgeOf(painted(() => skilling(0, 0, t, 0))).map(([, c]) => redrawn(c)))).toBeGreaterThanOrEqual(30);
      expect(median(edgeOf(painted(() => cheese(0, 0, 0))).map(([, c]) => redrawn(c)))).toBeGreaterThanOrEqual(30);
      for (const t of [0, 52]) {
        // Its loop (above the disc, y < 0) has no light of its own.
        const ds = edgeOf(painted(() => bracteate(0, 0, t))).map(([k, c]) => deltaE(at(k)[1] >= 0 ? mixRgb(tinted(rgb(c), phase), soft.rgb, soft.a) : tinted(rgb(c), phase), dark));
        expect(median(ds)).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test("none round what he cannot take: what is taken, the bracteate found on an earlier visit (its pale ring hangs there), what is off the screen", async () => {
    const p = newPlay(await loadLevel("ekeberg"));
    wholeLevel(p);
    p.t = 1;
    const all = painted(() => takeLines(p, "evening", false)).size;
    const bracteateOnly = painted(() => takeLines({ ...p, skilling: [], cheese: null } as Play, "evening", false)).size;
    expect(bracteateOnly).toBeGreaterThan(0);
    expect(painted(() => takeLines(p, "evening", true)).size).toBe(all - bracteateOnly);
    const taken = { ...p, skilling: p.skilling.map((s) => ({ ...s, at: 1 })), cheese: p.cheese && { ...p.cheese, at: 1 }, bracteateAt: 1 } as Play;
    expect(painted(() => takeLines(taken, "evening", false)).size).toBe(0);
    Object.assign(view, { camX: -10_000, camY: -10_000, w: 390, h: 844 });
    expect(painted(() => takeLines(p, "evening", false)).size).toBe(0);
  });
});

// Order 41 (ADR 0044 amended, the planner's call): the rune's stone has a dark edge of its own, and on the night's dark ground it was dark on
// dark (6.7 to 19.3 off what is round it at Langkaia's night and twilight, 13.5 at Østensjøvannet's). After dusk its lit side gets a pale
// rim: the stone's own edge pixels on its top and left, where the light comes from, not a line all round; by day nothing (it is drawn in
// `afterDark`, which the page calls under any sky but the day's).
describe("the rune's stone after dusk (order 41)", () => {
  test("its rim is its own edge's top and left pixels and no others, bobbing with the stone, with motion and without", () => {
    for (const reduced of [false, true])
      for (const t of [0, 20, 40, 63, 90]) {
        view.reduced = reduced;
        const stone = painted(() => runeStone(0, 0, "L", "lit", t, 0));
        const rim = painted(() => runeRim(0, 0, t, 0));
        view.reduced = false;
        const ys = [...stone.keys()].map((k) => at(k)[1]);
        const top = Math.min(...ys);
        const left = Math.min(...[...stone.keys()].map((k) => at(k)[0]));
        // Every rim pixel is one of the stone's own, on its top row or its left column.
        for (const k of rim.keys()) {
          expect(stone.has(k)).toBe(true);
          const [x, y] = at(k);
          expect(y === top || x === left).toBe(true);
        }
        // And all of them: its top row's and its left column's edge, twelve each.
        expect(rim.size).toBe(24);
      }
  });

  test("the rim stands 30 or more off the stone's own dark edge under every sky after dusk, and off the warning red and every role's colour", () => {
    const rim = rgb(RUNE_RIM);
    const stone = [...painted(() => runeStone(0, 0, "L", "lit", 0, 0)).entries()];
    const top = Math.min(...stone.map(([k]) => at(k)[1]));
    const edge = stone.find(([k]) => at(k)[1] === top)![1];
    for (const phase of AFTER_DUSK) expect(deltaE(rim, tinted(rgb(edge), phase))).toBeGreaterThanOrEqual(30);
    expect(deltaE(rim, rgb(ENEMY.red))).toBeGreaterThanOrEqual(30);
    for (const [role, colours] of Object.entries(ROLES.COLOURS))
      for (const c of colours) expect({ role, c, far: deltaE(rim, rgb(c)) >= 10 }).toEqual({ role, c, far: true });
  });
});
