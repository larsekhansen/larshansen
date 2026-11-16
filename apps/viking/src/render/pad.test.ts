import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import type { Action } from "@larshansen/pixelkit/input";
import { PAD_WORDS, createThumbs, noteFor, padLayout, wireThumbs, type Control, type Insets, type Rect } from "./pad";

// The touch pad in the hand (order 21, ADR 0043): buttons that fit thumbs, and that answer them.

/** The phones of the order, upright and on their side, with no insets and with a notch and a home bar. */
const SCREENS: [number, number][] = [
  [360, 640],
  [390, 844],
  [430, 932],
  [844, 390],
  [932, 430]
];
const NONE: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
/** An iPhone's safe areas: upright a notch above and a home bar below; on its side the notch at a side. */
const notched = (w: number, h: number): Insets => (h > w ? { top: 47, right: 0, bottom: 34, left: 0 } : { top: 0, right: 47, bottom: 21, left: 47 });

function gap(a: Rect, b: Rect): number {
  const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
  return dx >= 0 && dy >= 0 ? Math.hypot(dx, dy) : Math.max(dx, dy);
}

describe("buttons fit thumbs", () => {
  for (const [w, h] of SCREENS)
    for (const safe of [NONE, notched(w, h)])
      test(`${w} x ${h}, insets ${JSON.stringify(safe)}`, () => {
        const r = padLayout(w, h, safe);
        const all = Object.entries(r) as [Control, Rect][];
        for (const [c, b] of all) {
          // At least 56 x 56 CSS pixels.
          expect(Math.min(b.w, b.h), c).toBeGreaterThanOrEqual(56);
          // Inside the safe areas: nothing under the home bar or a notch.
          expect(b.x, c).toBeGreaterThanOrEqual(safe.left);
          expect(b.x + b.w, c).toBeLessThanOrEqual(w - safe.right);
          expect(b.y + b.h, c).toBeLessThanOrEqual(h - safe.bottom);
          // Below the bar (on its side one thin row, 40 px; upright at most two rows, 90 px).
          expect(b.y, c).toBeGreaterThanOrEqual(safe.top + (h > w ? 90 : 40));
        }
        // 8 px or more between any two.
        for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) expect(gap(all[i][1], all[j][1]), `${all[i][0]} / ${all[j][0]}`).toBeGreaterThanOrEqual(8);
        // Jump is the biggest, and the lowest on the right; left and right are one pad, wider than tall.
        const area = (b: Rect) => b.w * b.h;
        for (const c of ["dash", "shield", "enter"] as const) expect(area(r.jump)).toBeGreaterThan(area(r[c]));
        for (const c of ["dash", "shield"] as const) expect(r.jump.y + r.jump.h).toBeGreaterThan(r[c].y + r[c].h);
        expect(r.jump.x).toBeGreaterThan(w / 2);
        expect(r.move.x + r.move.w).toBeLessThan(w / 2);
        expect(r.move.w).toBeGreaterThanOrEqual(2 * 56 + 8);
      });
});

/** A pad with every control, its fingers wired to synthetic pointer events, and what it held. */
function rig(w = 390, h = 844) {
  const slots = padLayout(w, h, NONE);
  const log: [Action, boolean][] = [];
  const thumbs = createThumbs(() => slots, (a, on) => log.push([a, on]));
  const root = new EventTarget();
  const win = new EventTarget();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  let changed = 0;
  wireThumbs(root, win, doc, thumbs, () => changed++);
  const fire = (type: string, id: number, at?: { x: number; y: number }) => {
    const e = Object.assign(new Event(type, { cancelable: true }), { pointerId: id, clientX: at?.x ?? 0, clientY: at?.y ?? 0 });
    root.dispatchEvent(e);
    return e;
  };
  const mid = (c: Control, fx = 0.5, fy = 0.5) => ({ x: slots[c].x + slots[c].w * fx, y: slots[c].y + slots[c].h * fy });
  return { slots, thumbs, log, root, win, doc, fire, mid, changes: () => changed };
}

describe("a button answers the thumb", () => {
  test("pressed in the same event, looks pressed, and the page is told at once", () => {
    const r = rig();
    const before = r.changes();
    const e = r.fire("pointerdown", 1, r.mid("jump"));
    expect(r.thumbs.held.jump).toBe(true);
    expect(r.thumbs.pressed("jump")).toBe("down");
    expect(r.changes()).toBeGreaterThan(before);
    // The browser does nothing else with it (no scroll, no zoom, no mouse events after).
    expect(e.defaultPrevented).toBe(true);
    r.fire("pointerup", 1, r.mid("jump"));
    expect(r.thumbs.held.jump).toBe(false);
    expect(r.log).toEqual([
      ["jump", true],
      ["jump", false]
    ]);
  });

  test("a touch that slides off a button lets go of it, and holds it again if it slides back", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("jump"));
    r.fire("pointermove", 1, r.mid("jump", 0.9, 0.5));
    expect(r.thumbs.held.jump).toBe(true);
    r.fire("pointermove", 1, { x: r.slots.jump.x - 30, y: r.slots.jump.y - 40 });
    expect(r.thumbs.held.jump).toBe(false);
    r.fire("pointermove", 1, r.mid("jump"));
    expect(r.thumbs.held.jump).toBe(true);
    r.fire("pointerup", 1, r.mid("jump"));
    expect(r.thumbs.held.jump).toBe(false);
  });

  test("a finger sliding off one button onto another does not press the other", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("dash"));
    expect(r.thumbs.held.dash).toBe(true);
    r.fire("pointermove", 1, r.mid("jump"));
    expect(r.thumbs.held.dash).toBe(false);
    expect(r.thumbs.held.jump).toBe(false);
  });

  test("left and right are one pad he slides across without lifting", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("move", 0.25));
    expect(r.thumbs.held.left).toBe(true);
    expect(r.thumbs.pressed("move")).toBe("left");
    r.fire("pointermove", 1, r.mid("move", 0.75));
    expect(r.thumbs.held.left).toBe(false);
    expect(r.thumbs.held.right).toBe(true);
    expect(r.thumbs.pressed("move")).toBe("right");
    r.fire("pointermove", 1, r.mid("move", 0.1));
    expect(r.thumbs.held.left).toBe(true);
    expect(r.thumbs.held.right).toBe(false);
    // Off the pad altogether: he stops.
    r.fire("pointermove", 1, { x: r.slots.move.x + r.slots.move.w + 20, y: r.slots.move.y - 30 });
    expect(r.thumbs.held.left || r.thumbs.held.right).toBe(false);
  });

  test("a second finger never cancels the first", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("jump", 0.3));
    r.fire("pointerdown", 2, r.mid("jump", 0.7));
    r.fire("pointerup", 2, r.mid("jump", 0.7));
    expect(r.thumbs.held.jump).toBe(true);
    r.fire("pointercancel", 2);
    expect(r.thumbs.held.jump).toBe(true);
    r.fire("pointerup", 1, r.mid("jump", 0.3));
    expect(r.thumbs.held.jump).toBe(false);
    // Two fingers on the move pad's halves hold both; lifting one leaves the other's.
    r.fire("pointerdown", 3, r.mid("move", 0.2));
    r.fire("pointerdown", 4, r.mid("move", 0.8));
    expect(r.thumbs.held.left && r.thumbs.held.right).toBe(true);
    r.fire("pointerup", 3);
    expect(r.thumbs.held.left).toBe(false);
    expect(r.thumbs.held.right).toBe(true);
  });

  test("lifting one finger never lets go of the other's button", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("move", 0.8));
    r.fire("pointerdown", 2, r.mid("jump"));
    r.fire("pointerdown", 3, r.mid("shield"));
    r.fire("pointerup", 2, r.mid("jump"));
    expect(r.thumbs.held.right).toBe(true);
    expect(r.thumbs.held.down).toBe(true);
    expect(r.thumbs.held.jump).toBe(false);
    r.fire("lostpointercapture", 3);
    expect(r.thumbs.held.down).toBe(false);
    expect(r.thumbs.held.right).toBe(true);
  });

  test("the screen turning mid-press lets go of everything, and no key stays held", () => {
    for (const type of ["orientationchange", "resize"]) {
      const r = rig();
      r.fire("pointerdown", 1, r.mid("move", 0.2));
      r.fire("pointerdown", 2, r.mid("jump"));
      r.win.dispatchEvent(new Event(type));
      expect(Object.values(r.thumbs.held).some(Boolean)).toBe(false);
      // Its lifting, after, changes nothing; the next touch is a fresh press.
      r.fire("pointerup", 2, r.mid("jump"));
      expect(r.log.filter(([, on]) => on).length).toBe(2);
      r.fire("pointerdown", 5, r.mid("jump"));
      expect(r.thumbs.held.jump).toBe(true);
    }
  });

  test("the page losing focus or being hidden lets go of everything", () => {
    const r = rig();
    r.fire("pointerdown", 1, r.mid("dash"));
    r.win.dispatchEvent(new Event("blur"));
    expect(r.thumbs.held.dash).toBe(false);
    r.fire("pointerdown", 2, r.mid("move", 0.9));
    r.doc.hidden = true;
    r.doc.dispatchEvent(new Event("visibilitychange"));
    expect(r.thumbs.held.right).toBe(false);
    r.doc.hidden = false;
    r.fire("pointerdown", 3, r.mid("enter"));
    r.win.dispatchEvent(new Event("pagehide"));
    expect(Object.values(r.thumbs.held).some(Boolean)).toBe(false);
  });

  test("a touch beside every control is not the pad's: it goes on to the game", () => {
    const r = rig();
    const e = r.fire("pointerdown", 1, { x: 195, y: 300 });
    expect(e.defaultPrevented).toBe(false);
    expect(Object.values(r.thumbs.held).some(Boolean)).toBe(false);
  });

  test("a control taken away under a finger lets go of it", () => {
    let shown: Partial<Record<Control, Rect>> = padLayout(390, 844, NONE);
    const thumbs = createThumbs(() => shown, () => undefined);
    thumbs.down(1, shown.dash!.x + 10, shown.dash!.y + 10);
    expect(thumbs.held.dash).toBe(true);
    const { dash: _, ...rest } = shown;
    shown = rest;
    thumbs.refresh();
    expect(thumbs.held.dash).toBe(false);
  });
});

describe("the help line on a touch screen", () => {
  const was = { pole: false, shield: false, riding: false };
  test("says only what changed, in the pad's words, never a key, in two lines at 360 wide", () => {
    for (const lang of ["nb", "en"] as const) {
      const notes = [noteFor(lang, was, { ...was, pole: true }), noteFor(lang, was, { ...was, shield: true }), noteFor(lang, was, { ...was, riding: true }), noteFor(lang, { ...was, riding: true }, was)];
      expect(notes.every(Boolean)).toBe(true);
      expect(noteFor(lang, was, was)).toBeNull();
      for (const n of notes) {
        expect(n!).not.toMatch(/arrow|space|shift|piltast|mellomrom|\bpil\b|↑|↓|\bR\b|\bX\b/i);
        // The line is at most 336 px wide at 360 (24 px of margin) with 28 px of padding: two lines of 308 px. At 14 px a
        // character of system-ui is under 7.5 px on average, so 64 characters is two lines with room to spare.
        expect(n!.length).toBeLessThanOrEqual(64);
      }
    }
    expect(Object.keys(PAD_WORDS.nb)).toEqual(Object.keys(PAD_WORDS.en));
  });
});

describe("the buttons are furniture", () => {
  // ADR 0039: none of the roles' colours. The pad's own rules use greys and white only, see-through; and nothing on it
  // moves by itself (reduced motion: no transition, no animation).
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  const rules = [...css.matchAll(/([^{}]*\.pad[^{}]*)\{([^}]*)\}/g)];
  test("greys and white only", () => {
    expect(rules.length).toBeGreaterThan(5);
    for (const [, sel, body] of rules) {
      for (const m of body.matchAll(/rgba?\(([^)]+)\)|#([0-9a-f]{3,8})\b/gi)) {
        const [r, g, b] = m[1] ? m[1].split(",").map(Number) : m[2].length <= 4 ? [...m[2].slice(0, 3)].map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(m[2].slice(i, i + 2), 16));
        expect(Math.max(r, g, b) - Math.min(r, g, b), `${sel.trim()}: ${m[0]}`).toBeLessThanOrEqual(8);
      }
      expect(body, sel).not.toMatch(/transition|animation/);
    }
  });
});
