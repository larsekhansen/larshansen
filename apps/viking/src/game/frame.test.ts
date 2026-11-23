import { describe, expect, test } from "bun:test";
import { PLAYER } from "@larshansen/pixelkit/config";
import { viewFor } from "@larshansen/pixelkit/stage";
import { autopilot, type Move } from "./bot";
import { aheadOf, frame } from "./frame";
import { newPlay, stepPlay, type Play } from "./play";
import { SHIELD_RULES } from "./shield";
import { BUILT, ORDER, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import { padLayout, type Insets, type Rect } from "../render/pad";

// The pad does not hide the game (order 21, rule 6): at every phone size, upright and on its side, at a phone's
// pixel ratios, with and without a notch, he, the two tiles under him and six ahead are never under a button,
// framed by the page's own camera rule (`frame`) as every level's scripted route is played.

const SCREENS: [number, number][] = [
  [360, 640],
  [390, 844],
  [430, 932],
  [844, 390],
  [932, 430]
];
const DPRS = [2, 2.625, 3];
const notched = (w: number, h: number): Insets => (h > w ? { top: 47, right: 0, bottom: 34, left: 0 } : { top: 0, right: 47, bottom: 21, left: 47 });
/** A notch on one side only, on its side (order 37: as many Android phones report it), left or right. */
const oneSide = (w: number, h: number, side: "left" | "right"): Insets | null => (h > w ? null : { top: 0, right: side === "right" ? 47 : 0, bottom: 21, left: side === "left" ? 47 : 0 });
const NONE: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
/** The bar's height during a level on a phone (CSS pixels): two rows upright, one thin row on its side. */
const barOf = (w: number, h: number, safe: Insets) => safe.top + (h > w ? 80 : 40);

interface Shot {
  name: string;
  view: { w: number; h: number; k: number; dpr: number };
  unit: number;
  bar: number;
  slots: ReturnType<typeof padLayout>;
  cam: { x: number; y: number } | null;
  /** The furthest the camera had to rise for the buttons, in CSS pixels. */
  lift: number;
  /** The most it moved in a frame beyond what it moves without the buttons (a jolt), in CSS pixels; and where it was. */
  jolt: number;
  last: { a: number; p: number } | null;
}

const meets = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function shots(): Shot[] {
  const out: Shot[] = [];
  for (const [w, h] of SCREENS)
    for (const dpr of DPRS)
      for (const [label, safe] of [["", NONE], [" notched", notched(w, h)], [" notch left", oneSide(w, h, "left")], [" notch right", oneSide(w, h, "right")]] as const) {
        if (!safe) continue;
        const v = viewFor(w, h, dpr, 240);
        const unit = v.k / dpr;
        out.push({ name: `${w}x${h}@${dpr}${label}`, view: { ...v, dpr }, unit, bar: (barOf(w, h, safe) * dpr) / v.k, slots: padLayout(w, h, safe), cam: null, lift: 0, jolt: 0, last: null });
      }
  return out;
}

/** The buttons shown in this level now, as the page shows them. */
function buttons(s: Shot, p: Play): Rect[] {
  // The slot above the jump is always taken, by the way in or the shield.
  const r: Rect[] = [s.slots.move, s.slots.enter, s.slots.jump];
  if (p.pole) r.push(s.slots.dash);
  return r;
}

/** One step of the camera at this size, as `camera()` in main.ts does it: true if he and the ground ahead are clear. */
function look(s: Shot, p: Play): { clear: boolean; lift: number } {
  const b = p.body;
  const v = s.view;
  const focus = { x: b.x + PLAYER.w / 2 + (p.riding ? p.def.rules?.lead?.(v.w) ?? 0 : 0), y: b.y + PLAYER.h / 2, facing: b.facing };
  const floor = p.def.floor?.(focus.x) ?? p.map.height;
  const bottom = v.h > v.w ? Math.max(floor, Math.round(focus.y + v.h / 3)) : floor;
  const bounds = { width: p.map.width, bottom, top: s.bar };
  const cam = s.cam ?? { x: 0, y: 0 };
  const snap = s.cam === null;
  const plain = frame(cam, focus, bounds, v, 1000 / 60, snap);
  const btns = buttons(s, p);
  const at = frame(cam, focus, bounds, v, 1000 / 60, snap, { buttons: btns, unit: s.unit, him: b, facing: b.facing, vy: b.vy });
  s.cam = at;
  if (s.last) s.jolt = Math.max(s.jolt, (Math.abs(at.y - s.last.a) - Math.abs(plain.y - s.last.p)) * s.unit);
  s.last = { a: at.y, p: plain.y };
  const a = aheadOf(b, b.facing);
  const region = { x: (a.x - at.x) * s.unit, y: (a.y - at.y) * s.unit, w: a.w * s.unit, h: a.h * s.unit };
  return { clear: !btns.some((r) => meets(r, region)), lift: (at.y - plain.y) * s.unit };
}

describe("the pad does not hide the game", () => {
  for (const st of BUILT)
    test(st.id, async () => {
      const def = await loadLevel(st.id);
      const i0 = ORDER.indexOf(st.id);
      const p = newPlay(def, { pole: i0 > ORDER.indexOf("holmenkollen"), shield: SHIELD_RULES, hasShield: i0 > ORDER.indexOf("bygdoy") });
      const pilot = autopilot((ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`]);
      const all = shots();
      const bad: string[] = [];
      for (let n = 0; n < 60 * 400 && p.runeAt === null; n++) {
        const k = pilot(p);
        if (!k) break;
        stepPlay(p, k);
        for (const s of all) {
          const r = look(s, p);
          s.lift = Math.max(s.lift, r.lift);
          if (!r.clear && bad.length < 5) bad.push(`${s.name} at step ${n}, x ${Math.round(p.body.x)}`);
        }
      }
      expect(p.runeAt).not.toBeNull();
      expect(bad).toEqual([]);
      // He is never pushed up so far that he is near the bar: at most half the view's height. And the camera eases there:
      // in no frame does it move more than 24 CSS pixels beyond where it would have gone without the buttons, with a notch
      // too (order 37: on its side with a notch, where the pad stands further in, a turn beside a button jumped it up to
      // 76 px; the camera now makes room for the ground ahead either way before he turns, and the most is 12).
      for (const s of all) {
        expect(s.lift, s.name).toBeLessThan((s.view.h * s.unit) / 2);
        expect(s.jolt, s.name).toBeLessThanOrEqual(24);
      }
    });
});
