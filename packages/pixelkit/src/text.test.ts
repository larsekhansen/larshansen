import { afterEach, describe, expect, test } from "bun:test";
import { view } from "./paint";
import { bubble, safeSides, textTarget } from "./text";

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
