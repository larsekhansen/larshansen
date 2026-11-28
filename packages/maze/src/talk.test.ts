import { describe, expect, test } from "bun:test";
import { viewFor } from "@larshansen/pixelkit/stage";
import { strings, type RavenLine } from "./i18n";
import { FACE, RAVEN_FACE, RAVEN_FACES, allRavenPortraits, ravenLayout, slid, type MazeScreen, type Rect } from "./talk";

// The raven's face beside its words (order 48; ADR 0057 carried into the mound). Its portraits (three expressions), which face goes
// with which line, where the panel stands (by the maze's own rule for words: the top left under the header, else the foot; never over
// him, a notch or the home bar, and inside the screen), and that it holds still with reduced motion. The scene draws it: its stepped
// pictures are in order 48's hand-back, and `reduced.test.ts` draws the scene itself with a line up.

/** Every line the raven says, as the scene names them. */
const LINES = Object.keys(RAVEN_FACE) as RavenLine[];

/** Words measured as the page's 600-weight system font about measures them: a little over half the font's size a letter. */
const measure = (t: string, font: number) => t.length * font * 0.56;

/** The four phone sizes of the viking game's checks, at a phone's pixel ratio, as the kit lays out the maze's own page. */
const SIZES = [
  [390, 844],
  [844, 390],
  [360, 640],
  [667, 375]
] as const;
/** A pretended notch and home bar: none; on the left; on the right; upright (a top notch and a home bar). */
const SAFES = [
  { left: 0, right: 0, bottom: 0 },
  { left: 47, right: 0, bottom: 21 },
  { left: 0, right: 47, bottom: 21 },
  { left: 0, right: 0, bottom: 34 }
];

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function screen(w: number, h: number, safe: MazeScreen["safe"], him: Rect): MazeScreen {
  const v = viewFor(w, h, 3);
  return { w, h, u: v.k / 3, top: 44, safe, him };
}

describe("the raven's portraits", () => {
  test("three expressions (dry, sharp, pleased), each whole: every pixel of its 56 x 56 painted", () => {
    const all = allRavenPortraits();
    expect(all.map((p) => p.face)).toEqual(["dry", "sharp", "pleased"]);
    for (const { frame } of all) {
      let n = 0;
      for (let i = 0; i < frame.runs.length; i += 4) n += frame.runs[i + 2];
      expect(n).toBe(FACE * FACE);
    }
  });

  test("each expression its own: any two 40 or more pixels apart (order 47's measure for the faces)", () => {
    const grid = (f: ReturnType<typeof allRavenPortraits>[number]["frame"]) => {
      const g: string[] = [];
      for (let i = 0; i < f.runs.length; i += 4) for (let k = 0; k < f.runs[i + 2]; k++) g[f.runs[i + 1] * FACE + f.runs[i] + k] = f.ink[f.runs[i + 3]];
      return g;
    };
    const all = allRavenPortraits().map((p) => grid(p.frame));
    for (let a = 0; a < all.length; a++)
      for (let b = a + 1; b < all.length; b++) {
        let d = 0;
        for (let i = 0; i < FACE * FACE; i++) if (all[a][i] !== all[b][i]) d++;
        expect(d).toBeGreaterThanOrEqual(40);
      }
  });

  test("calm, not glam: no colour of the glamour's neon family on it, and none of the warning red", () => {
    const NEON = ["#ff2d95", "#ff00cc", "#8a2be2", "#5b1d9a", "#2a2aff", "#c8ff2a", "#e8262e"];
    for (const { frame } of allRavenPortraits()) for (const c of frame.ink) expect(NEON).not.toContain(c.toLowerCase());
  });
});

describe("which face goes with which line", () => {
  test("every line the raven says has a face, one of its three, in both languages the same; and every such line has words in both", () => {
    for (const line of LINES) {
      expect(RAVEN_FACES).toContain(RAVEN_FACE[line]);
      for (const lang of ["en", "nb"] as const) expect(typeof strings(lang)[line]).toBe("string");
    }
    // All three are used.
    expect(new Set(Object.values(RAVEN_FACE)).size).toBe(3);
  });
});

describe("where the panel stands", () => {
  test("at the four phone sizes, with and without a notch, him anywhere on the screen: never over him, a notch, the home bar or the header, always inside the screen", () => {
    let placed = 0;
    let bubbles = 0;
    for (const [w, h] of SIZES)
      for (const safe of SAFES)
        for (let hy = 60; hy < h; hy += 40)
          for (let hx = 20; hx < w; hx += 60) {
            const him = { x: hx - 40, y: hy - 50, w: 80, h: 90 };
            for (const line of LINES) {
              const l = ravenLayout(screen(w, h, safe, him), strings("en")[line], measure);
              if (!l) {
                bubbles++;
                continue;
              }
              placed++;
              expect(overlaps(l.box, him)).toBe(false);
              expect(l.box.x).toBeGreaterThanOrEqual(safe.left);
              expect(l.box.x + l.box.w).toBeLessThanOrEqual(w - safe.right);
              expect(l.box.y).toBeGreaterThanOrEqual(44);
              expect(l.box.y + l.box.h).toBeLessThanOrEqual(h - safe.bottom);
              // The words inside their box, the portrait beside them.
              expect(l.words.x).toBeGreaterThanOrEqual(l.face.x + l.face.w);
              expect(l.lines.every((t) => measure(t, l.font) <= l.words.w)).toBe(true);
            }
          }
    expect(placed).toBeGreaterThan(bubbles);
  });

  test("with him in the middle of the screen every line in both languages has its panel at every size, notch or none", () => {
    for (const [w, h] of SIZES)
      for (const safe of SAFES) {
        const him = { x: w / 2 - 40, y: (h + 44) / 2 - 45, w: 80, h: 90 };
        for (const lang of ["en", "nb"] as const) for (const line of LINES) expect(ravenLayout(screen(w, h, safe, him), strings(lang)[line], measure)).not.toBeNull();
      }
  });

  test("it keeps the place it found for a line while it still fits (it does not jump between the top and the foot as he walks)", () => {
    const s = screen(390, 844, SAFES[0], { x: 155, y: 400, w: 80, h: 90 });
    const text = strings("en").start1;
    expect(ravenLayout(s, text, measure)!.region).toBe(0);
    expect(ravenLayout(s, text, measure, 1)!.region).toBe(1);
  });
});

describe("with reduced motion", () => {
  test("it is all in from the first step its line is up to the last, with no slide; without, it slides in over eight steps and out over six", () => {
    for (let age = 0; age < 300; age++) for (const left of [null, 0, 3, 100]) expect(slid(age, left, true)).toBe(1);
    expect(slid(0, null, false)).toBe(0);
    expect(slid(4, null, false)).toBeGreaterThan(0);
    expect(slid(4, null, false)).toBeLessThan(1);
    expect(slid(8, null, false)).toBe(1);
    expect(slid(100, 0, false)).toBe(0);
  });
});
