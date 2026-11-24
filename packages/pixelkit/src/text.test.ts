import { afterEach, describe, expect, test } from "bun:test";
import { view } from "./paint";
import { bubble, bubbleEdge, safeSides, textTarget } from "./text";

// Order 37: a speech bubble keeps off the screen's safe sides (a notch on a phone on its side) once a page has said what they
// are; with none said (the front page) it keeps six pixels from the edge, as before.

/** Where each bubble's rounded rectangle starts, drawn into a stand-in canvas whose text is 6 pixels a letter. */
function lefts(draw: () => void): number[] {
  const out: number[] = [];
  const g = { font: "", fillStyle: "", measureText: (t: string) => ({ width: t.length * 6 }), beginPath() {}, roundRect: (x: number) => void out.push(x), fill() {}, fillText() {} };
  textTarget(g as unknown as CanvasRenderingContext2D);
  draw();
  return out;
}

afterEach(() => Object.assign(safeSides, { left: 0, right: 0 }));

describe("bubbles and the screen's safe sides (order 37)", () => {
  test("with no safe sides said, a bubble at the edge keeps six pixels from it", () => {
    Object.assign(view, { cssW: 844, cssH: 390, k: 2, dpr: 1 });
    expect(lefts(() => bubble(0, 100, "No snakes here."))).toEqual([6]);
    expect(lefts(() => bubble(844, 100, "No snakes here."))).toEqual([844 - 6 - (15 * 6 + 18)]);
  });

  test("with a notch said on either side, it keeps six pixels from the notch", () => {
    Object.assign(view, { cssW: 844, cssH: 390, k: 2, dpr: 1 });
    Object.assign(safeSides, { left: 47, right: 0 });
    expect(lefts(() => bubble(0, 100, "No snakes here."))).toEqual([53]);
    expect(lefts(() => bubble(8, 100, "A line", "left"))).toEqual([53]);
    Object.assign(safeSides, { left: 0, right: 47 });
    expect(lefts(() => bubble(844, 100, "No snakes here."))).toEqual([844 - 47 - 6 - (15 * 6 + 18)]);
    // Away from the edges it is where it was.
    expect(lefts(() => bubble(400, 100, "No snakes here."))).toEqual([400 - (15 * 6 + 18) / 2]);
  });
});

// Order 42: a page may give its bubbles a thin line round them (the viking game does, in the game's dark: on white snow or a cloud a
// bubble had no edge); with none asked for (the front page, the maze's own page) a bubble is drawn as before, with no line.
describe("a bubble's edge (order 42)", () => {
  /** What a bubble strokes, drawn into a stand-in canvas: the colour and width of each stroke. */
  function strokes(): string[] {
    const out: string[] = [];
    const g = { font: "", fillStyle: "", strokeStyle: "", lineWidth: 0, measureText: (t: string) => ({ width: t.length * 6 }), beginPath() {}, roundRect() {}, fill() {}, fillText() {}, stroke() { out.push(`${g.strokeStyle} ${g.lineWidth}`); } };
    textTarget(g as unknown as CanvasRenderingContext2D);
    Object.assign(view, { cssW: 390, cssH: 844, k: 2, dpr: 1 });
    bubble(200, 300, "The guard changes every hour.");
    return out;
  }
  afterEach(() => (bubbleEdge.color = ""));

  test("none unless a page asks: the front page's bubbles are as they were", () => {
    expect(strokes()).toEqual([]);
  });

  test("asked for, a line a pixel wide in that colour round the bubble", () => {
    bubbleEdge.color = "#1f1a17";
    expect(strokes()).toEqual(["#1f1a17 1"]);
  });
});
