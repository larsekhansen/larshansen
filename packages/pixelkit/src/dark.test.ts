import { describe, expect, test } from "bun:test";
import { TORCH, darkRow, darknessAt, nightCutsOf, type Light } from "./dark";

// The dark is pure arithmetic over the screen: how dark each point is, and a row of it as pieces.

const him: Light = { x: 100, y: 50, rings: TORCH };
const window_: Light = { rect: { x: 10, y: 10, w: 6, h: 8 }, dark: 0 };

/** Every pixel of a row from its pieces, to compare with `darknessAt` pixel by pixel. */
function expand(row: number, w: number, lights: Light[], night: number | number[]) {
  const out: number[] = [];
  const cuts = typeof night === "number" ? [] : nightCutsOf(night);
  for (const r of darkRow(row, w, lights, night, cuts)) for (let i = 0; i < r.w; i++) out.push(r.dark);
  return out;
}

describe("the dark", () => {
  test("far from every light it is the night; the torch clears round him in steps", () => {
    expect(darknessAt(300, 50, 1, [him])).toBe(1);
    expect(darknessAt(100 + 44, 50, 1, [him])).toBe(0.6);
    expect(darknessAt(100 + 38, 50, 1, [him])).toBe(0.3);
    expect(darknessAt(100, 50, 1, [him])).toBe(0);
    expect(darknessAt(300, 50, 0.7, [him])).toBe(0.7);
  });

  test("a light never makes it darker than the night is", () => {
    expect(darknessAt(100 + 44, 50, 0.4, [him])).toBe(0.4);
  });

  test("a rectangle of light clears just its rectangle", () => {
    expect(darknessAt(12, 12, 1, [window_])).toBe(0);
    expect(darknessAt(16, 12, 1, [window_])).toBe(1);
    expect(darknessAt(12, 18, 1, [window_])).toBe(1);
  });

  test("a row covers the whole width, and its pieces agree with the dark at every pixel but the edges of a ring", () => {
    const night = Array.from({ length: 320 }, (_, x) => (x < 150 ? 1 : x < 200 ? 0.8 : 0.5));
    for (const row of [0, 12, 30, 50, 61, 95])
      for (const n of [1, night]) {
        const runs = darkRow(row, 320, [him, window_], n, typeof n === "number" ? [] : nightCutsOf(n));
        const px = expand(row, 320, [him, window_], n);
        expect(px.length).toBe(320);
        const edges = new Set(runs.map((r) => r.x));
        for (let x = 0; x < 320; x++) {
          const base = typeof n === "number" ? n : n[x];
          // A ring's edge is rounded to a whole pixel, so the pixel either side of a cut may take
          // its neighbour's value; everywhere else the piece is exact.
          if (px[x] !== darknessAt(x + 0.5, row + 0.5, base, [him, window_])) expect(edges.has(x) || edges.has(x + 1)).toBe(true);
        }
      }
  });

  test("the night changes only at its cuts", () => {
    expect(nightCutsOf([1, 1, 0.8, 0.8, 0.5])).toEqual([2, 4]);
    expect(nightCutsOf([0.5, 0.5])).toEqual([]);
  });

  test("with no lights a row is one piece of night", () => {
    expect(darkRow(5, 320, [], 0.9)).toEqual([{ x: 0, w: 320, dark: 0.9 }]);
  });
});
