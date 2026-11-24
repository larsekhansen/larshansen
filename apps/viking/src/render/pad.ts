import type { Action, Input } from "@larshansen/pixelkit/input";
import type { Lang } from "@larshansen/pixelkit/i18n";
import { view } from "@larshansen/pixelkit/paint";
import { safeSides, sx, sy, unit } from "@larshansen/pixelkit/text";
import type { Bounds, Focus } from "@larshansen/pixelkit/camera";
import { aheadOf, roomy } from "../game/frame";
import { DASH_REST, type Play } from "../game/play";

// The touch pad, in the hand (order 21, ADR 0043). A chunk of its own, fetched on a touch screen only.
//
// The buttons lie over the picture, see-through, in the corners a thumb reaches: left and right one wide pad
// on the left that a thumb slides across without lifting; jump the biggest and lowest on the right, the dash to
// its left; and one slot that says what up or down does here (Go in at a door, Sit at a bench, Shield where he
// has it, Duck on the sledge; Go in, dimmed, where there is nothing to do), over the move pad upright and over
// the jump on its side. Every
// one is at least 56 x 56 CSS pixels with 8 or more between, inside the safe areas. The camera keeps him, the
// two tiles under him and six ahead out from under them (`roomFor` in `game/frame.ts`).
//
// Each finger is followed on its own: a finger holds the control it went down on while it is over it, and lets
// go of it when it slides off or lifts; on the move pad the half it is over says left or right. A control is
// held while any finger holds it, so a second finger never cancels the first, and lifting one never lets go of
// the other's. The screen turning, the page losing focus or being hidden lets go of everything.

export type Control = "move" | "enter" | "dash" | "shield" | "jump";
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Sizes in CSS pixels: none under 56, the jump the biggest. The way in and the shield share a slot. */
export const SIZE = { move: { w: 156, h: 72 }, enter: { w: 70, h: 66 }, dash: { w: 66, h: 66 }, shield: { w: 70, h: 66 }, jump: { w: 88, h: 88 } } as const;
/** From the safe area's edge, and between two controls. */
export const EDGE = 12;
export const GAP = 10;

/**
 * Where each control goes on a screen `w` x `h` (CSS pixels) with these safe-area insets. The same slots
 * whatever is shown, so a thumb finds a button where it was: the move pad alone in the bottom left corner; the
 * jump in the bottom right corner, the dash to its left a little higher (the jump is the lowest), and the slot
 * above the jump, which the way in and the shield share (one of them shown at a time).
 */
export function padLayout(w: number, h: number, safe: Insets): Record<Control, Rect> {
  const left = safe.left + EDGE;
  const right = w - safe.right - EDGE;
  const bottom = h - safe.bottom - EDGE;
  // On its side a little narrower: there his six tiles ahead, the way he faces, come nearer the screen's sides.
  const move = { x: left, y: bottom - SIZE.move.h, ...SIZE.move, w: h > w ? SIZE.move.w : SIZE.move.w - 20 };
  const jump = { x: right - SIZE.jump.w, y: bottom - SIZE.jump.h, ...SIZE.jump };
  const dash = { x: jump.x - GAP - SIZE.dash.w, y: bottom - 24 - SIZE.dash.h, ...SIZE.dash };
  // Upright, over the move pad: the left thumb walks, or (where he cannot walk: the shield up, the sledge, a door)
  // does up and down. On its side, over the jump: there a slot over the move pad stands where he starts a level.
  const up = h > w ? { x: left, y: move.y - GAP - SIZE.shield.h, ...SIZE.shield } : { x: jump.x + (SIZE.jump.w - SIZE.shield.w) / 2, y: jump.y - GAP - SIZE.shield.h, ...SIZE.shield };
  return { move, enter: up, dash, shield: { ...up }, jump };
}

/** What each control holds. The move pad is two: left over its left half, right over its right. */
const ACTION: Record<Exclude<Control, "move">, Action> = { enter: "enter", dash: "dash", shield: "down", jump: "jump" };

const inside = (r: Rect, x: number, y: number) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

export interface Thumbs {
  down(id: number, x: number, y: number): boolean;
  move(id: number, x: number, y: number): void;
  up(id: number): void;
  /** Lets go of everything: the screen turned, the page lost focus. */
  clear(): void;
  /** Looks again at what each finger presses: after a control came or went. */
  refresh(): void;
  /** Which actions are held now, and which controls look pressed. */
  held: Record<Action, boolean>;
  pressed(c: Control): "" | "down" | "left" | "right" | "both";
}

/**
 * The fingers on the pad, as pure state: `rects` says where each shown control is now (CSS pixels), `hold`
 * is told whenever an action is taken up or let go.
 */
export function createThumbs(rects: () => Partial<Record<Control, Rect>>, hold: (a: Action, on: boolean) => void): Thumbs {
  /** Each finger: the control it went down on, and where it is now. */
  const fingers = new Map<number, { c: Control; x: number; y: number }>();
  const held: Record<Action, boolean> = { left: false, right: false, jump: false, up: false, down: false, enter: false, dash: false };
  /** What one finger presses now: nothing once it is off its control. */
  function presses(f: { c: Control; x: number; y: number }, r: Partial<Record<Control, Rect>>): Action | null {
    const at = r[f.c];
    if (!at || !inside(at, f.x, f.y)) return null;
    if (f.c === "move") return f.x < at.x + at.w / 2 ? "left" : "right";
    return ACTION[f.c];
  }
  function settle() {
    const r = rects();
    const now: Record<Action, boolean> = { left: false, right: false, jump: false, up: false, down: false, enter: false, dash: false };
    for (const f of fingers.values()) {
      const a = presses(f, r);
      if (a) now[a] = true;
    }
    for (const a of Object.keys(now) as Action[])
      if (now[a] !== held[a]) {
        held[a] = now[a];
        hold(a, now[a]);
      }
  }
  return {
    held,
    down(id, x, y) {
      const r = rects();
      const c = (Object.keys(r) as Control[]).find((k) => inside(r[k]!, x, y));
      if (!c) return false;
      fingers.set(id, { c, x, y });
      settle();
      return true;
    },
    move(id, x, y) {
      const f = fingers.get(id);
      if (!f) return;
      f.x = x;
      f.y = y;
      settle();
    },
    up(id) {
      if (!fingers.delete(id)) return;
      settle();
    },
    clear() {
      fingers.clear();
      settle();
    },
    refresh: settle,
    pressed(c) {
      if (c === "move") return held.left && held.right ? "both" : held.left ? "left" : held.right ? "right" : "";
      return held[ACTION[c]] ? "down" : "";
    }
  };
}

/** A pointer event as far as the pad reads it. */
interface PointerLike {
  pointerId: number;
  clientX: number;
  clientY: number;
  target: EventTarget | null;
  preventDefault(): void;
}

/**
 * Pointer events on `root` (the pad) feed the fingers; the screen turning (from upright to on its side or back) or
 * the window losing focus, and the page being hidden, let go of all of them. A resize that does not turn it (a
 * phone's toolbar showing) lets go of nothing. `changed` is told after anything that may change what looks pressed.
 */
export function wireThumbs(root: EventTarget, win: EventTarget & { innerWidth?: number; innerHeight?: number }, doc: EventTarget & { hidden: boolean }, thumbs: Thumbs, changed: () => void) {
  root.addEventListener("pointerdown", (ev) => {
    const e = ev as unknown as PointerLike;
    if (!thumbs.down(e.pointerId, e.clientX, e.clientY)) return;
    e.preventDefault();
    // Its moves and its lifting come here wherever the finger goes (a touch is captured so anyway).
    (e.target as Element | null)?.setPointerCapture?.(e.pointerId);
    changed();
  });
  root.addEventListener("pointermove", (ev) => {
    const e = ev as unknown as PointerLike;
    thumbs.move(e.pointerId, e.clientX, e.clientY);
    changed();
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    root.addEventListener(type, (ev) => {
      thumbs.up((ev as unknown as PointerLike).pointerId);
      changed();
    });
  root.addEventListener("contextmenu", (ev) => ev.preventDefault());
  const all = () => {
    thumbs.clear();
    changed();
  };
  for (const type of ["blur", "orientationchange", "pagehide"]) win.addEventListener(type, all);
  const side = () => (win.innerWidth ?? 0) > (win.innerHeight ?? 0);
  let wide = side();
  win.addEventListener("resize", () => {
    if (side() === wide) return thumbs.refresh();
    wide = side();
    all();
  });
  doc.addEventListener("visibilitychange", () => doc.hidden && all());
}

/** The words the pad says, and the help line's notes on a touch screen: what just changed, in the pad's words. */
export const PAD_WORDS = {
  nb: {
    move: "Gå til venstre eller høyre",
    pole: "Skistaven: Rykk gir et kort rykk, også i lufta.",
    shield: "Skjoldet: hold Skjold for å løfte det.",
    sledge: "På kjelken: Hopp for å hoppe, Dukk for å dukke.",
    off: "Av kjelken: Skjold løfter skjoldet igjen."
  },
  en: {
    move: "Walk left or right",
    pole: "The ski pole: Dash for a short dash, in the air too.",
    shield: "The shield: hold Shield to raise it.",
    sledge: "On the sledge: Jump to jump, Duck to duck.",
    off: "Off the sledge: Shield raises the shield again."
  }
};

/** What changed, between two of a level's help lines, as a note in the pad's words; null if nothing to say. */
export function noteFor(lang: Lang, was: { pole: boolean; shield: boolean; riding: boolean }, now: { pole: boolean; shield: boolean; riding: boolean }): string | null {
  const w = PAD_WORDS[lang];
  if (now.riding !== was.riding) return now.riding ? w.sledge : w.off;
  if (now.shield && !was.shield) return w.shield;
  if (now.pole && !was.pole) return w.pole;
  return null;
}

/** What the pad shows this frame: whether it is up at all (not under a card, not while a level's file comes), and whether the dash and the shield (Duck on the sledge) have anything to do now. The way in says so itself (`show` on it). */
export interface PadState {
  on: boolean;
  dash: boolean;
  shield: boolean;
}

/** What the page knows this frame, for the bar, the pad and the note. */
export interface InHand {
  /** A level is on: not the map, no card, no level's file on its way. */
  level: boolean;
  /** The pad is up: no card, no level's file on its way. */
  on: boolean;
  /** Nothing he presses counts now (arriving, a card, the rune flying, in a cannon, going through a door). */
  still: boolean;
  /** Him as drawn. */
  shown: { x: number; y: number };
  /** Where the banner is drawn, if it is. */
  banner: Rect | null;
  /** The help line's note stays until this step. */
  noteUntil: number;
  steps: number;
}

export interface Pad {
  thumbs: Thumbs;
  /** Once a frame on a touch screen: the bar folds its links away while a level is on, the pad says which buttons have something to do now, the note stands clear of him. */
  frame(p: Play, h: InHand): void;
  /** Where each shown control is, in CSS pixels of the window. */
  rects(): Rect[];
  /** Where the camera goes with room left for the buttons (`roomy` in `game/frame.ts`), from where `follow` put it. */
  room(at: { x: number; y: number }, cam: { x: number; y: number }, focus: Focus, bounds: Bounds, elapsedMs: number, snap: boolean, him: { x: number; y: number }, facing: number, vy: number, below?: number): { x: number; y: number };
  /** Puts each control where it goes: after a resize. */
  layout(): void;
  show(s: PadState): void;
}

/** The pad in the page: lays out the controls, follows the fingers, and says what each does now. */
export function createPad(el: HTMLElement, input: Input, lang: Lang, page: { header: HTMLElement; help: HTMLElement }): Pad {
  const controls = {} as Record<Control, HTMLElement>;
  controls.move = el.querySelector<HTMLElement>(".move")!;
  controls.enter = el.querySelector<HTMLElement>('[data-action="enter"]')!;
  controls.dash = el.querySelector<HTMLElement>('[data-action="dash"]')!;
  controls.shield = el.querySelector<HTMLElement>('[data-action="down"]')!;
  controls.jump = el.querySelector<HTMLElement>('[data-action="jump"]')!;
  controls.move.setAttribute("aria-label", PAD_WORDS[lang].move);
  // Off until the page's first frame says it is up (while the first level's file comes, it is not).
  el.classList.add("off");
  // The safe areas, read from CSS (`env(safe-area-inset-*)`) through an element that has them as its padding.
  const probe = el.appendChild(document.createElement("i"));
  probe.className = "safe";
  let slots = padLayout(innerWidth, innerHeight, { top: 0, right: 0, bottom: 0, left: 0 });
  // Shown: not hidden by the page (the dash and the shield until he has them) and not set aside for the other one
  // of the slot the way in and the shield share.
  const isShown = (c: Control) => !controls[c].hidden && !controls[c].classList.contains("aside");
  const shownRects = () => {
    const r: Partial<Record<Control, Rect>> = {};
    for (const c of Object.keys(slots) as Control[]) if (isShown(c)) r[c] = slots[c];
    return r;
  };
  const thumbs = createThumbs(shownRects, (a, on) => input.hold(a, on));
  const look: Record<Control, string> = { move: "", enter: "", dash: "", shield: "", jump: "" };
  function paint() {
    for (const c of Object.keys(controls) as Control[]) {
      const p = thumbs.pressed(c);
      if (p === look[c]) continue;
      look[c] = p;
      controls[c].dataset.pressed = p;
    }
  }
  wireThumbs(el, window, document, thumbs, paint);
  // Keyboard or switch access to a button still works, as a press.
  for (const c of ["enter", "dash", "shield", "jump"] as const) {
    const a = ACTION[c];
    controls[c].addEventListener("click", (e) => (e as MouseEvent).detail === 0 && input.press(a));
  }
  function layout() {
    const s = getComputedStyle(probe);
    const px = (v: string) => parseFloat(v) || 0;
    slots = padLayout(innerWidth, innerHeight, { top: px(s.paddingTop), right: px(s.paddingRight), bottom: px(s.paddingBottom), left: px(s.paddingLeft) });
    // The bubbles (a sign's words, a boss's lines) keep off a notch at the side too (order 37).
    Object.assign(safeSides, { left: px(s.paddingLeft), right: px(s.paddingRight) });
    for (const c of Object.keys(controls) as Control[]) {
      const r = slots[c];
      Object.assign(controls[c].style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    }
    // A finger on a control that moved is looked at again where it now is (turning the screen let go of it already).
    thumbs.refresh();
    paint();
  }
  layout();
  let said = "";
  let playing = false;
  let barAt = -1;
  /**
   * Where the bar ends, for the cards, which keep below it (`--bar`): now, whenever the bar changes, and every frame. The page's
   * camera sets it too, with a mouse as well (order 31); this one also follows the bar folding and unfolding within the frame.
   */
  const barEnds = () => {
    const bar = Math.round(page.header.getBoundingClientRect().bottom);
    if (bar !== barAt) document.body.style.setProperty("--bar", `${(barAt = bar)}px`);
    return bar;
  };
  barEnds();
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(barEnds).observe(page.header);
  const meets = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  const pad: Pad = {
    thumbs,
    frame(p, h) {
      if (h.level !== playing) document.body.classList.toggle("playing", (playing = h.level));
      const bar = barEnds();
      // The slot above the jump: the way in at a door or a bench (the page has just said so, `show`); elsewhere the
      // shield, or Duck on the sledge, once he has it; with neither, the way in, dimmed.
      const door = controls.enter.classList.contains("show");
      const shield = !controls.shield.hidden && !door;
      // Either out of step with what this frame wants (order 41: the shield starts without `aside`, so away from a door at the first
      // frame the way in stayed shown under it, its dimmed edge round the shield's).
      if (controls.shield.classList.contains("aside") === shield || controls.enter.classList.contains("aside") !== shield) {
        controls.shield.classList.toggle("aside", !shield);
        controls.enter.classList.toggle("aside", shield);
      }
      pad.show({
        on: h.on,
        dash: !h.still && p.pole && !p.dash && !p.dashSpent && !p.sitting && p.t - p.dashEnded >= DASH_REST,
        shield: !h.still && (p.riding || (p.body.onGround && !p.sitting))
      });
      // The note: under the bar (and the banner), or else just over the pad, wherever it covers neither him nor
      // the ground ahead of him; with nowhere clear, not shown this frame.
      const help = page.help;
      if (help.hidden) return;
      if (h.steps > h.noteUntil) {
        help.hidden = true;
        return;
      }
      const a = aheadOf(h.shown, p.body.facing);
      const ahead = { x: sx(a.x), y: sy(a.y), w: a.w * unit(), h: a.h * unit() };
      const hh = help.offsetHeight;
      const w = help.offsetWidth;
      const lowest = Math.min(view.cssH, ...pad.rects().map((r) => r.y));
      for (const y of [Math.max(bar + 8, h.banner ? h.banner.y + h.banner.h + 8 : 0), lowest - hh - 8]) {
        if (meets({ x: (view.cssW - w) / 2, y, w, h: hh }, ahead)) continue;
        help.style.top = `${Math.round(y)}px`;
        help.style.visibility = "";
        return;
      }
      help.style.visibility = "hidden";
    },
    rects: () => Object.values(shownRects()),
    room: (at, cam, focus, bounds, elapsedMs, snap, him, facing, vy, below) => (el.classList.contains("off") ? at : roomy(at, cam, focus, bounds, view, elapsedMs, snap, { buttons: pad.rects(), unit: view.k / view.dpr, him, facing, vy, below })),
    layout,
    show(s) {
      const key = `${+s.on}${+s.dash}${+s.shield}${+controls.dash.hidden}${+controls.shield.hidden}${+controls.shield.classList.contains("aside")}`;
      if (key === said) return;
      said = key;
      el.classList.toggle("off", !s.on);
      controls.dash.classList.toggle("dim", !s.dash);
      controls.shield.classList.toggle("dim", !s.shield);
      // A control taken away under a finger lets go of it; with the pad off (a card), every finger lets go.
      if (!s.on) thumbs.clear();
      else thumbs.refresh();
      paint();
    }
  };
  return pad;
}
