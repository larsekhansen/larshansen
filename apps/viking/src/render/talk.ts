import { FONT, bubbleEdge, safeSides, snap, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import { view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import type { Frame } from "../alive/frames";
import { FACE, heroPortrait, lokiPortrait, type HeroFace, type LokiFace } from "./faces";

// The talk panel (order 47, ADR 0057). When a character speaks in his own voice, a large portrait of him stands beside the words,
// with an expression that fits the line, in place of a bubble: Lars, "So the bigger face panels when talking." At the encore Loki
// speaks, and the one he speaks to, the calm Nordic hero, is beside him, quiet where Loki is loud: the two side by side is the
// game's contrast (DESIGN, "Calm Oslo, loud glamour"). Narration (a hint, what a boss is doing) stays in its bubble.
//
// Where it stands: clear of the play he must see while the line shows, of the touch pad and of a notch. At the encore the play is
// on the stage and above it, so the panel goes under the stage's floor (the water mirror, which he never needs to see), across the
// screen over the pad's controls or between them; failing that, under the bar if the play's top is lower; failing both, the page
// keeps its bubble. It never pauses anything. It slides in from the screen's sides and out again (a shout has a flash behind
// him once, as it starts); with reduced motion it appears and goes, no slide, no flash.
//
// Cost: each portrait is painted once into a canvas of its own (kept, ADR 0036) and copied; a frame with a panel adds two copies,
// two filled shapes and its lines of words, all on the words' canvas.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Who speaks and who listens, each with an expression. */
export interface Faces {
  loki: LokiFace;
  hero?: HeroFace;
}

/** Where everything of a panel goes, CSS pixels of the window. */
export interface PanelLayout {
  /** The whole panel, the portraits' frames and the words' box. */
  box: Rect;
  /** The speaker's portrait (on the left) and the listener's (on the right, mirrored), each `face` CSS pixels square. */
  speaker: Rect;
  listener: Rect | null;
  words: Rect;
  lines: string[];
  /** Art pixels a portrait is drawn at (56 or 48). */
  size: number;
  /** Which room it found: under the floor over the controls, between them, or under the bar (the last). */
  region: number;
  font: number;
  lineH: number;
}

/** What the layout needs to know of the screen, CSS pixels. */
export interface Screen {
  w: number;
  h: number;
  /** CSS pixels an art pixel. */
  u: number;
  /** The bar's foot. */
  bar: number;
  /** The touch pad's controls (none without a touch screen). */
  pad: readonly Rect[];
  /** The safe areas at the sides (a notch on a phone on its side) and at the foot (its home bar). */
  safe: { left: number; right: number; bottom: number };
  /** The stage's floor, and the top of what he must see over it (the club raised, the stars over a pose). */
  floor: number;
  playTop: number;
}

/** From the screen's edge and between the panel and anything it keeps off, CSS pixels. */
const EDGE = 8;
const GAP = 6;
/** Inside the words' box. */
const PAD_X = 8;
const PAD_Y = 6;

const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The words broken into lines that fit `max` CSS pixels, each line of the text kept as its own line. */
export function wrapTo(lines: readonly string[], max: number, measure: (t: string) => number): string[] {
  const out: string[] = [];
  for (const text of lines) {
    let line = "";
    for (const word of text.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && measure(next) > max) {
        out.push(line);
        line = word;
      } else line = next;
    }
    if (line) out.push(line);
  }
  return out;
}

/**
 * Where the panel goes on this screen, or null where there is no room for it clear of the play, the pad and the screen's safe
 * areas (the page then shows its bubble). Tried in turn: under the floor across the screen over every control; under the floor
 * between the controls at the left and at the right; under the bar, over the play. In each, both portraits at 56 art pixels, then
 * at 48, then the speaker's alone; the words fill what is left, broken to fit.
 */
export function panelLayout(s: Screen, text: readonly string[], measure: (t: string, font: number) => number, both = true, prefer = -1): PanelLayout | null {
  const font = Math.max(12, Math.round(4.3 * s.u));
  const lineH = Math.round(font * 1.3);
  const left = s.safe.left + EDGE;
  const right = s.w - s.safe.right - EDGE;
  const foot = s.pad.length ? Math.max(...s.pad.map((r) => r.y + r.h)) : s.h - s.safe.bottom - EDGE;
  const regions: Rect[] = [];
  const under = Math.max(s.floor + GAP, s.bar + GAP);
  if (s.pad.length) {
    const top = Math.min(...s.pad.map((r) => r.y)) - GAP;
    regions.push({ x: left, y: under, w: right - left, h: top - under });
    // Between the controls on the left half of the screen and those on the right, down to the screen's foot.
    const lefts = s.pad.filter((r) => r.x + r.w / 2 < s.w / 2);
    const rights = s.pad.filter((r) => r.x + r.w / 2 >= s.w / 2);
    const x0 = lefts.length ? Math.max(...lefts.map((r) => r.x + r.w)) + GAP : left;
    const x1 = rights.length ? Math.min(...rights.map((r) => r.x)) - GAP : right;
    regions.push({ x: x0, y: under, w: x1 - x0, h: foot - under });
  } else regions.push({ x: left, y: under, w: right - left, h: foot - under });
  regions.push({ x: left, y: s.bar + GAP, w: right - left, h: s.playTop - GAP - (s.bar + GAP) });
  // The room it had for this line first, while it still fits (so it does not jump from under the floor to under the bar as he jumps).
  const order = prefer >= 0 && prefer < regions.length ? [prefer, ...regions.keys()] : [...regions.keys()];
  for (const n of order) {
    const r = regions[n];
    if (r.w <= 0 || r.h <= 0) continue;
    for (const [size, two] of [[56, both], [48, both], [56, false], [48, false]] as const) {
      const face = size * s.u;
      const room = r.w - face * (two ? 2 : 1) - GAP * (two ? 2 : 1);
      // Room for at least sixteen letters a line.
      if (room < font * 9) continue;
      const lines = wrapTo(text, room - 2 * PAD_X, (t) => measure(t, font));
      // The box as wide as its longest line, no wider than half the screen's width again: the panel stays together in the middle.
      const wordsW = Math.min(room, Math.max(...lines.map((t) => measure(t, font))) + 2 * PAD_X + 2);
      const wordsH = lines.length * lineH + 2 * PAD_Y;
      const h = Math.max(face, wordsH);
      if (h > r.h) continue;
      // Under the floor, at the foot of the room it has (as far from the play as it can be); under the bar, at its top.
      const y = n < regions.length - 1 ? r.y + r.h - h : r.y;
      const w = face * (two ? 2 : 1) + GAP * (two ? 2 : 1) + wordsW;
      const x = r.x + Math.floor((r.w - w) / 2);
      const box = { x, y, w, h };
      if (s.pad.some((p) => overlaps(box, p))) continue;
      const speaker = { x, y: y + Math.floor((h - face) / 2), w: face, h: face };
      const words = { x: x + face + GAP, y: y + Math.floor((h - wordsH) / 2), w: wordsW, h: wordsH };
      const listener = two ? { x: words.x + wordsW + GAP, y: speaker.y, w: face, h: face } : null;
      return { box, speaker, listener, words, lines, size, font, lineH, region: n };
    }
  }
  return null;
}

// --- Drawing -------------------------------------------------------------------------------------------------------------

const kept = new Map<string, HTMLCanvasElement>();
/** A portrait painted once into a canvas of its own (kept, ADR 0036) and copied from then on. */
function portrait(key: string, make: () => Frame): HTMLCanvasElement {
  let c = kept.get(key);
  if (!c) {
    const f = make();
    c = document.createElement("canvas");
    c.width = FACE;
    c.height = FACE;
    const g = c.getContext("2d")!;
    const r = f.runs;
    for (let i = 0; i < r.length; i += 4) {
      g.fillStyle = f.ink[r[i + 3]];
      g.fillRect(r[i], r[i + 1], r[i + 2], 1);
    }
    kept.set(key, c);
  }
  return c;
}

/** How far in a panel is, 0 out to 1 in: in over its first eight steps, out over its last six; with reduced motion, all in. */
export function slid(age: number, left: number | null, reduced = view.reduced): number {
  if (reduced) return 1;
  const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;
  return Math.min(ease(age / 8), left === null ? 1 : ease(left / 6));
}

/** A shout's flash behind him: once, as it starts, over its first twelve steps; never with reduced motion. */
export const flashOf = (shout: boolean, age: number, reduced = view.reduced) => (shout && !reduced && age < 12 ? 1 - age / 12 : 0);

/**
 * Draws the panel on the words' canvas (CSS pixels): the flash, the portraits in a frame of the game's dark (the listener mirrored
 * to face the speaker; at 48 art pixels the middle of each, not shrunk, so every pixel stays whole), and the words in a box as a
 * bubble's, dark on white, a thin line of the game's dark round it.
 */
export function drawPanel(l: PanelLayout, faces: Faces, stage: number, age: number, left: number | null) {
  const g = textCtx();
  const k = slid(age, left);
  const u = l.speaker.w / l.size;
  const crop = (FACE - l.size) / 2;
  const sp = { ...l.speaker, x: snap(l.speaker.x - (1 - k) * (l.speaker.x + l.speaker.w + EDGE)) };
  const flash = flashOf(faces.loki === "shout", age);
  if (flash > 0) {
    // A burst of light behind his frame, sixteen points, white over hot pink, gone in a fifth of a second.
    const cx = sp.x + sp.w / 2;
    const cy = sp.y + sp.h / 2;
    const R = sp.w * (0.72 + 0.12 * flash);
    g.save();
    g.globalAlpha = flash;
    for (const [col, rr] of [[ENEMY.hotPink, 1], ["#ffffff", 0.82]] as const) {
      g.fillStyle = col;
      g.beginPath();
      for (let i = 0; i < 32; i++) {
        const a = (i / 32) * Math.PI * 2;
        const r = (i % 2 ? R * 0.62 : R) * rr;
        g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
      g.closePath();
      g.fill();
    }
    g.restore();
  }
  const was = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = false;
  const draw = (c: HTMLCanvasElement, at: Rect, mirror: boolean) => {
    const r = { ...at, x: snap(at.x), y: snap(at.y) };
    g.fillStyle = ENEMY.line;
    g.fillRect(r.x - u, r.y - u, r.w + 2 * u, r.h + 2 * u);
    if (!mirror) return g.drawImage(c, crop, crop, l.size, l.size, r.x, r.y, r.w, r.h);
    g.save();
    g.translate(r.x + r.w, r.y);
    g.scale(-1, 1);
    g.drawImage(c, crop, crop, l.size, l.size, 0, 0, r.w, r.h);
    g.restore();
  };
  draw(portrait(`loki-${faces.loki}-${stage}`, () => lokiPortrait(faces.loki, stage)), sp, false);
  if (l.listener && faces.hero) {
    const hero = faces.hero;
    const lr = l.listener;
    draw(portrait(`hero-${hero}`, () => heroPortrait(hero)), { ...lr, x: snap(lr.x + (1 - k) * (view.cssW - lr.x + EDGE)) }, true);
  }
  g.imageSmoothingEnabled = was;
  // The words, in from below as the portraits come in from the sides (with reduced motion, there).
  const w = l.words;
  const y = snap(w.y + (1 - k) * (view.cssH - w.y));
  g.fillStyle = "rgba(255, 255, 255, 0.96)";
  g.beginPath();
  if (g.roundRect) g.roundRect(w.x, y, w.w, w.h, 8);
  else g.rect(w.x, y, w.w, w.h);
  g.fill();
  if (bubbleEdge.color) {
    g.strokeStyle = bubbleEdge.color;
    g.lineWidth = 1;
    g.stroke();
  }
  g.fillStyle = "#1f1a17";
  g.font = `600 ${l.font}px ${FONT}`;
  g.textAlign = "left";
  g.textBaseline = "middle";
  l.lines.forEach((line, i) => g.fillText(line, w.x + PAD_X, y + PAD_Y + l.lineH * (i + 0.5) + 0.5));
  g.textAlign = "center";
}

/** The screen as the page has it now, for `panelLayout`: the stage's floor at world y `floor`, his height over it `tall` art pixels. */
export function screenNow(bar: number, pad: readonly Rect[], floor: number, tall: number): Screen {
  const u = unit();
  const probe = typeof document !== "undefined" && document.querySelector ? document.querySelector(".pad .safe") : null;
  const bottom = probe ? parseFloat(getComputedStyle(probe).paddingBottom) || 0 : 0;
  return { w: view.cssW, h: view.cssH, u, bar, pad, safe: { left: safeSides.left, right: safeSides.right, bottom }, floor: sy(floor), playTop: sy(floor - tall) };
}

/** Measures words as the panel draws them. */
export function measured(t: string, font: number) {
  const g = textCtx();
  g.font = `600 ${font}px ${FONT}`;
  return g.measureText(t).width;
}

