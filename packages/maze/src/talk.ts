import { frame, lit, shade, type Frame } from "@larshansen/pixelkit/frames";
import { mix, view } from "@larshansen/pixelkit/paint";
import { PALETTE, STONE } from "@larshansen/pixelkit/palette";
import { FONT, bubbleEdge, snap, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import type { RavenLine } from "./i18n";

// The raven's face when it talks (order 48; ADR 0057 carried into the mound). The raven is the one in the maze who speaks in its
// own voice, dry and taunting; like Loki at the encore it gets a large portrait beside its words, in place of the bubble over its
// head. It is a Nordic bird, Odin's kind, calm, not glam: black feathers in the blue-violet sheen a raven takes from a torch, a
// heavy grey bill, a pale eye that can be found, shaggy feathers at its throat, the mound's stone and an iron band behind it. Three
// expressions, small ones, as the mound is quiet: dry (the lid half down), sharp (the eye wide under a lowered brow, the bill
// open, the throat feathers raised) and pleased (the eye shut in an arc, the head up, the gape curled).
//
// Where it stands, by the maze's own rule for words: the maze hangs a line over the raven's head while it is in view and otherwise
// puts it at the top left under the header. A portrait over the raven's head would cover the corridors round it and the raven
// itself, so the panel takes the second place: the top left under the header, kept off the safe sides; where he is under it, the
// foot of the screen; where neither has room clear of him, the bubble as before. It slides in from the left over eight steps and out
// over the line's last six; with reduced motion it appears and goes. It never pauses anything. The portraits are painted once each
// into a canvas of their own and copied (ADR 0036), on the words' canvas. This file is fetched by the scene when the maze opens
// (`scene.ts`), not with the first script.

/** A portrait's size, art pixels (the viking game's are the same: `apps/viking/src/render/faces.ts`). */
export const FACE = 56;

export const RAVEN_FACES = ["dry", "sharp", "pleased"] as const;
export type RavenFace = (typeof RAVEN_FACES)[number];

/**
 * The face the raven says each of its lines with: a tag beside the words (`i18n.ts`), the same in both languages; no word changes
 * for it. Here, in the panel's own file, so the first script carries none of it.
 */
export const RAVEN_FACE: Record<RavenLine, RavenFace> = {
  start1: "dry",
  curse1: "pleased",
  start2: "dry",
  curse2Wall: "dry",
  curse2Snake: "sharp",
  start3: "dry",
  key: "dry",
  start4: "sharp",
  curse4Pit: "pleased",
  start5: "sharp",
  curse5: "dry",
  start6: "pleased",
  start7: "dry",
  curse7: "pleased",
  curse3: "sharp",
  stone: "dry",
  teleport: "sharp",
  end: "pleased",
  endStandalone: "pleased",
  feather: "pleased",
  featherGold: "pleased",
  featherGoldStandalone: "pleased",
  endAgain: "dry"
};

const P = PALETTE;

/** A grid of letters, one a pixel, laid over itself part by part ("." leaves what is there): the viking game's portraits' way. */
class Pic {
  c: string[] = new Array<string>(FACE * FACE).fill(".");
  at(x: number, y: number) {
    return x >= 0 && y >= 0 && x < FACE && y < FACE ? this.c[y * FACE + x] : ".";
  }
  set(x: number, y: number, ch: string) {
    if (x >= 0 && y >= 0 && x < FACE && y < FACE) this.c[y * FACE + x] = ch;
  }
  span(y: number, x0: number, x1: number, ch: string) {
    for (let x = Math.round(x0); x <= Math.round(x1); x++) this.set(x, y, ch);
  }
  put(rows: readonly string[], x: number, y: number) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== "." && this.set(x + i, y + j, ch)));
  }
  /** A line of `ch` round every pixel not in `ground` where it meets `ground` (the figure's outline against its backdrop). */
  outline(ground: string, ch: string) {
    const was = [...this.c];
    const get = (x: number, y: number) => (x >= 0 && y >= 0 && x < FACE && y < FACE ? was[y * FACE + x] : ground[0]);
    for (let y = 0; y < FACE; y++)
      for (let x = 0; x < FACE; x++) {
        if (!ground.includes(get(x, y))) continue;
        if ([get(x + 1, y), get(x - 1, y), get(x, y + 1), get(x, y - 1)].some((n) => !ground.includes(n))) this.set(x, y, ch);
      }
  }
  rows(): string[] {
    return Array.from({ length: FACE }, (_, y) => this.c.slice(y * FACE, y * FACE + FACE).join(""));
  }
}

/** Its colours: the mound's stone and iron behind it, the raven's own (`figures.ts`) drawn out into a ramp, the bill's grey. */
const INK: Record<string, string> = {
  // The lining's stone in the mound's dark, its courses' joints, an iron band across it, a torch's warmth from the left.
  "1": shade(STONE.dark, 0.55),
  "2": shade(STONE.dark, 0.42),
  "3": shade(STONE.base, 0.45),
  "4": mix(shade(STONE.base, 0.3), "#c8823c", 0.18),
  "5": shade(P.iron, 0.45),
  "6": P.iron,
  "7": lit(P.iron, 0.25),
  // The feathers: the deepest black, the black, the blue-violet sheen in its shade and lit, its brightest glint.
  d: "#0b090e",
  k: P.raven,
  K: "#33364f",
  S: "#525884",
  H: "#7d84b4",
  // The bill: black, its ridge lit in the grey the figure's bill is drawn in (so it is found on the stone), its shade.
  B: P.ravenBeak,
  b: shade(P.ravenBeak, 0.62),
  c: shade(P.ravenBeak, 0.8),
  // The eye: its pale ring, the pupil, the glint; the mouth's inside.
  e: P.ravenEye,
  o: "#0b090e",
  w: "#ffffff",
  m: "#4a2a34",
  // The game's near-black for its outline.
  l: "#141018"
};

function backdrop(p: Pic) {
  // Courses of the lining's stone, its joints dark; warmer toward the top left, where a torch would be.
  for (let y = 0; y < FACE; y++) for (let x = 0; x < FACE; x++) p.set(x, y, x + y < 30 ? "4" : "3");
  for (let row = 0; row < 5; row++) {
    const y = row * 12 + 2;
    p.span(y, 0, FACE - 1, "2");
    for (let x = (row % 2) * 9 + 4; x < FACE; x += 18) for (let j = 1; j < 12; j++) p.set(x, y + j, "2");
  }
  // An iron band across the wall behind its neck, with its studs.
  for (let y = 41; y < 45; y++) p.span(y, 0, FACE - 1, y === 41 ? "7" : y === 44 ? "5" : "6");
  for (let x = 3; x < FACE; x += 9) p.set(x, 42, "7"), p.set(x, 43, "5");
}

/** Is (x, y) inside the raven (its head, neck and shoulders), `lift` rows up for a raised head, `puffed` for a full breast? */
function inside(x: number, y: number, lift: number, puffed: boolean) {
  // The head: a little longer than tall, its crown flattened, from about x 9 to 38 and y 9 to 37.
  const hx = (x - 24) / 15;
  const hy = (y + lift - 23) / (y + lift < 23 ? 12.5 : 14);
  if (hx * hx + hy * hy <= 1) return true;
  // The neck and the shoulders under it, widening to the picture's foot; the breast fuller when it is pleased.
  if (y >= 32) {
    const t = y - 32;
    const x0 = 11 - t * 0.9;
    const x1 = 34 + t * (puffed ? 0.75 : 0.55);
    return x >= x0 && x <= x1;
  }
  return false;
}

function bird(p: Pic, lift: number, puffed: boolean) {
  const IN = (x: number, y: number) => inside(x, y, lift, puffed);
  for (let y = 0; y < FACE; y++)
    for (let x = 0; x < FACE; x++) {
      if (!IN(x, y)) continue;
      // Lit from the top left: the edge it faces the light with in the sheen, its brightest along the crown; shaded toward the right
      // and the foot.
      const lit1 = !IN(x - 1, y) || !IN(x, y - 1);
      const lit2 = !IN(x - 2, y) || !IN(x, y - 2) || !IN(x - 1, y - 1);
      const lit3 = !IN(x - 3, y) || !IN(x, y - 3) || !IN(x - 2, y - 2);
      const dark = !IN(x + 1, y) || !IN(x + 2, y + 1);
      let ch = "k";
      if (lit1) ch = y < 22 - lift ? "H" : "S";
      else if (lit2) ch = y < 30 - lift ? "S" : "K";
      else if (lit3 && y < 26 - lift) ch = "K";
      else if (dark && y < 40) ch = "d";
      p.set(x, y, ch);
    }
  // The folded wing over the shoulder: the edges of its coverts and long feathers, each a lit line in the sheen sloping back and down
  // as a folded wing's feathers lie, a dark one under it, row under row.
  for (let row = 0; row < 4; row++) {
    const y = 39 + row * 4;
    for (let x = 4 + (row % 2) * 4 - row * 2; x < 25 - row; x += 8) {
      for (let j = 0; j < 5; j++) {
        if (!IN(x + j, y + (j >> 1)) || !IN(x + j + 1, y + (j >> 1) + 1)) continue;
        p.set(x + j, y + (j >> 1), j < 2 ? "S" : "K");
        p.set(x + j, y + (j >> 1) + 1, "d");
      }
    }
  }
  // The wing's bend against the breast, in its shade.
  for (let y = 40; y < FACE; y++) if ((y >> 1) % 2) p.set(Math.round(27 + (y - 40) * 0.2), y, "d");
}

/** The throat's shaggy feathers, pointed, under the bill and down the neck: smooth, or raised and bristling. */
function hackles(p: Pic, lift: number, raised: boolean) {
  const tips = raised
    ? [[36, 31, 6], [33, 33, 7], [30, 35, 6], [39, 29, 5]]
    : [[35, 32, 3], [32, 34, 3], [29, 36, 2]];
  for (const [x, y, n] of tips)
    for (let j = 0; j < n; j++) {
      const dx = raised ? Math.round(j * 0.6) : 0;
      p.set(x + dx, y + j - lift, "k");
      p.set(x + dx - 1, y + j - lift, j < n - 1 ? "K" : "k");
      if (raised && j === n - 1) p.set(x + dx + 1, y + j - lift, "d");
    }
}

/** The bill: deep and heavy, black with a grey lit ridge (as the figure's is grey, to be found on the stone), its nasal bristles over its base, its tip hooked; closed, or open a little. */
function bill(p: Pic, lift: number, open: boolean, tilt: number) {
  const y0 = 17 - lift - tilt;
  const top = [
    "BBBB...........",
    "bBBBBBB........",
    "bbbbbBBBBB.....",
    "cbbbbbbbbbBB...",
    "ccbbbbbbbbbbBb.",
    "cccbbbbbbbbbbbb",
    ".ccccbbbbbbbbbc",
    "..cccccccbbbcc.",
    "........ccccc..",
    "...........cc.."
  ];
  const low = ["lcccccccccc...", ".llcccccccl...", "...llllll....."];
  p.put(top, 37, y0);
  p.put(low, 37, y0 + (open ? 11 : 8));
  if (open) {
    // The mouth's inside between the two.
    for (let y = y0 + 8; y < y0 + 11; y++) p.span(y, 38, 47 - (y - y0 - 8) * 2, "m");
  } else p.span(y0 + 8, 34, 39, "l");
  // The nasal bristles: black feathers lying forward over the bill's base.
  p.put(["kkkkK...", "KkkkkkK.", "dkkkkkkd", ".dkkkd.."], 34, y0 - 1);
}

function eye(p: Pic, face: RavenFace, lift: number) {
  const x = 28;
  const y = 18 - lift;
  if (face === "pleased") {
    // Shut in an arc, as a smile shuts the eyes: the pale of its ring curving up.
    p.put([".eee.", "e...e", "k...k"], x - 1, y);
    return;
  }
  if (face === "sharp") {
    // Narrowed and hard: a lowered brow of lit feathers down over the eye toward the bill, the pupil forward in the ring.
    p.put(["eeeee", "eeowe", "eeooe", ".eee."], x - 1, y);
    p.put(["HSS.....", ".SSSSS..", "...kkkkK", "....kkkk"], x - 3, y - 3);
    return;
  }
  // Dry: the lid half down over it, flat, unimpressed; the pale ring and the dark eye showing under it.
  p.put(["KSSSK", "kkkkk", "eowoe", "eoooe", ".eee."], x - 1, y - 1);
}

/** The raven's portrait: an expression, quiet. Facing right, toward the words. */
export function ravenPortrait(face: RavenFace): Frame {
  const p = new Pic();
  backdrop(p);
  const lift = face === "pleased" ? 2 : 0;
  bird(p, lift, face === "pleased");
  hackles(p, lift, face === "sharp");
  bill(p, lift, face === "sharp", face === "pleased" ? 1 : 0);
  eye(p, face, lift);
  if (face === "pleased") {
    // The gape curled up at its corner, as a smile is.
    p.set(34, 24 - lift, "l"), p.set(33, 23 - lift, "l");
  }
  p.outline("1234567", "l");
  return frame(`the raven, ${face}`, INK, [p.rows()]);
}

/** Every portrait, for the sheets and the tests. */
export const allRavenPortraits = () => RAVEN_FACES.map((face) => ({ face, frame: ravenPortrait(face) }));

// --- Where it stands ----------------------------------------------------------------------------------------------------

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** What the layout needs to know of the screen, CSS pixels. */
export interface MazeScreen {
  w: number;
  h: number;
  /** CSS pixels an art pixel. */
  u: number;
  /** The header's foot. */
  top: number;
  safe: { left: number; right: number; bottom: number };
  /** Him on the screen, with room round him: the panel keeps off it. */
  him: Rect;
}

export interface RavenLayout {
  box: Rect;
  face: Rect;
  words: Rect;
  lines: string[];
  /** Art pixels the portrait is drawn at (56, or 48 on a short screen: the middle of it, never shrunk). */
  size: number;
  font: number;
  lineH: number;
  /** 0 at the top under the header, 1 at the foot. */
  region: number;
}

const EDGE = 8;
const GAP = 6;
const PAD_X = 8;
const PAD_Y = 6;
const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** The words broken into lines that fit `max` CSS pixels. */
export function wrapTo(text: string, max: number, measure: (t: string) => number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}

/**
 * Where the panel goes, or null where it has no room clear of him (the scene then hangs the bubble as before). Tried in turn: at the
 * top left under the header, then at the foot; in each the portrait at 56 art pixels, then 48; the words beside it, broken to fit,
 * as wide as their longest line. No portrait taller than a third of the screen under the header: a short screen gets 48 or the bubble.
 * `prefer`: the region the line found first, while it still fits (so the panel does not jump as he walks).
 */
export function ravenLayout(s: MazeScreen, text: string, measure: (t: string, font: number) => number, prefer = -1): RavenLayout | null {
  const font = Math.max(12, Math.round(4.3 * s.u));
  const lineH = Math.round(font * 1.3);
  const left = s.safe.left + EDGE;
  const right = s.w - s.safe.right - EDGE;
  const order = prefer === 1 ? [1, 0] : [0, 1];
  for (const region of order) {
    for (const size of [56, 48]) {
      const face = size * s.u;
      if (face > (s.h - s.top) / 3) continue;
      const room = right - left - face - GAP;
      if (room < font * 9) continue;
      const lines = wrapTo(text, room - 2 * PAD_X, (t) => measure(t, font));
      const wordsW = Math.min(room, Math.max(...lines.map((t) => measure(t, font))) + 2 * PAD_X + 2);
      const wordsH = lines.length * lineH + 2 * PAD_Y;
      const h = Math.max(face, wordsH);
      const y = region === 0 ? s.top + EDGE : s.h - s.safe.bottom - EDGE - h;
      if (y < s.top + EDGE) continue;
      const box = { x: left, y, w: face + GAP + wordsW, h };
      if (overlaps(box, s.him)) continue;
      return { box, face: { x: left, y: y + Math.floor((h - face) / 2), w: face, h: face }, words: { x: left + face + GAP, y: y + Math.floor((h - wordsH) / 2), w: wordsW, h: wordsH }, lines, size, font, lineH, region };
    }
  }
  return null;
}

// --- Drawing -------------------------------------------------------------------------------------------------------------

const kept = new Map<RavenFace, HTMLCanvasElement>();
/** A portrait painted once into a canvas of its own and copied from then on. */
function portrait(face: RavenFace): HTMLCanvasElement {
  let c = kept.get(face);
  if (!c) {
    const f = ravenPortrait(face);
    c = document.createElement("canvas");
    c.width = FACE;
    c.height = FACE;
    const g = c.getContext("2d")!;
    const r = f.runs;
    for (let i = 0; i < r.length; i += 4) {
      g.fillStyle = f.ink[r[i + 3]];
      g.fillRect(r[i], r[i + 1], r[i + 2], 1);
    }
    kept.set(face, c);
  }
  return c;
}

/** How far in a panel is, 0 out to 1 in: in over its first eight steps, out over its last six; with reduced motion, all in. */
export function slid(age: number, left: number | null, reduced = view.reduced): number {
  if (reduced) return 1;
  const ease = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3;
  return Math.min(ease(age / 8), left === null ? 1 : ease(left / 6));
}

/** Draws the panel on the words' canvas (CSS pixels) for a line: the portrait with its face, in a frame of the game's dark; the words in a box as a bubble's. */
export function drawRavenPanel(l: RavenLayout, line: RavenLine, age: number, left: number | null) {
  const face = RAVEN_FACE[line];
  const g = textCtx();
  const k = slid(age, left);
  const u = l.face.w / l.size;
  const crop = (FACE - l.size) / 2;
  const fx = snap(l.face.x - (1 - k) * (l.face.x + l.face.w + EDGE));
  const fy = snap(l.face.y);
  const was = g.imageSmoothingEnabled;
  g.imageSmoothingEnabled = false;
  g.fillStyle = INK.l;
  g.fillRect(fx - u, fy - u, l.face.w + 2 * u, l.face.h + 2 * u);
  g.drawImage(portrait(face), crop, crop, l.size, l.size, fx, fy, l.face.w, l.face.h);
  g.imageSmoothingEnabled = was;
  const w = l.words;
  const x = snap(w.x - (1 - k) * (w.x + w.w + l.face.w + EDGE));
  g.fillStyle = "rgba(255, 255, 255, 0.96)";
  g.beginPath();
  if (g.roundRect) g.roundRect(x, w.y, w.w, w.h, 8);
  else g.rect(x, w.y, w.w, w.h);
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
  l.lines.forEach((line, i) => g.fillText(line, x + PAD_X, w.y + PAD_Y + l.lineH * (i + 0.5) + 0.5));
  g.textAlign = "center";
}

/** Measures words as the panel draws them. */
export function measured(t: string, font: number) {
  const g = textCtx();
  g.font = `600 ${font}px ${FONT}`;
  return g.measureText(t).width;
}


/**
 * The panel for the raven's line up now, drawn where it has room clear of him (he is kept clear with a tile and a half round him, the
 * corridors he is about to take): the region it found, for the scene to keep while the line is up, or -1 where it has none and the
 * scene hangs its bubble. `age` steps since the line came up, `left` steps until it goes (null: it stays); `x`, `y` where he is in the
 * world, `bar` the header's height in art pixels, `safe` the screen's safe areas.
 */
export function panel(line: RavenLine, text: string, age: number, left: number | null, prefer: number, x: number, y: number, bar: number, safe: { left: number; right: number; bottom: number }): number {
  const u = unit();
  const room = 24;
  const him = { x: sx(x - room), y: sy(y - room - 8), w: 2 * room * u, h: (2 * room + 8) * u };
  const l = ravenLayout({ w: view.cssW, h: view.cssH, u, top: bar * u, safe, him }, text, measured, prefer);
  if (!l) return -1;
  drawRavenPanel(l, line, age, left);
  return l.region;
}
