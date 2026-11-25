import type { Phase } from "@larshansen/pixelkit/oslo";
import { ctx, mix, seeded, view } from "@larshansen/pixelkit/paint";
import { horizonColor } from "@larshansen/pixelkit/sky";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import { TILE } from "@larshansen/pixelkit/config";
import { INK, WHITE } from "@larshansen/pixelkit/palette";
import type { View } from "../levels/types";
import { custom, drawProp, type Piece } from "./ground";

// The upright phone (order 45). On a screen taller than it is wide the view is 240 art pixels wide or more and two and a half
// times as tall (ADR 0019); he stands two thirds of the way down above the pad (ADR 0021, 0043), so a tall sky stands over the far
// view and a tall band of what is under the ground lies below him. The kit's sky (a gradient, a sun or a moon, a few clouds, the
// stars and the northern lights at night) was made for a view about 200 high. This is the brush a level fills those two bands with,
// on an upright screen only (the page asks for it there: `art.sky`, `art.under`), so nothing changes on its side or on a desktop.
//
// The sky: what that level's sky would hold, in depth and sparingly: the air thickening toward the horizon, thin high streaks, a row
// of small far clouds low over the horizon, a winter's grey cover, stars thinning toward the horizon, the northern lights' curtains
// rising over the kit's band, far birds, a plane's trail. Drawn over the kit's sky on its canvas, in each sky's own colours (the
// sky's canvas is not tinted after dusk), from pieces painted once and copied (ADR 0036). What drifts goes by the level's clock and
// holds still with reduced motion; what is far moves with the camera at a sliver of its speed, as the kit's clouds do.
//
// Under the ground: the level's ground goes on down past the play into its own dark, a fixed depth under its surface wherever its
// body runs unbroken to the map's foot in the letters the level names (so never a tower's face or a ledge), with what lies in it
// (stones, roots, an old pipe) drawn first and darkened with it, in layers; and under a pit's foot the same dark. So it never reads
// as somewhere to go, and the pad's buttons stand on a dark ground.

/** The sky's own colours at its top and at the horizon (the kit's gradient, `pixelkit/sky.ts`). */
const TOP: Record<Phase, string> = { day: "#4f96d8", evening: "#2b3466", night: "#050a1d", twilight: "#1d2a5e" };
const LOW: Record<Phase, string> = { day: horizonColor("day"), evening: horizonColor("evening"), night: horizonColor("night"), twilight: horizonColor("twilight") };

/** What a level's tall sky holds (each optional). */
export interface Weather {
  /** Thin high streaks of cloud (cirrus), 1 to 4. */
  streaks?: number;
  /** Small far clouds in a row low over the horizon, 1 to 6. */
  far?: number;
  /** A grey winter's cover: the upper sky drawn toward its grey, and long flat clouds under it, 1 to 3. */
  cover?: number;
  /** Stars thinning toward the horizon after dusk: how many over the upper sky. */
  stars?: number;
  /** The northern lights' curtains rising over the kit's band, where the sky has them: the world y of the horizon the page gives the kit's sky. */
  curtains?: number;
  /** Far birds: a few, or a skein of geese in a V. */
  birds?: "few" | "skein";
  /** A plane's trail across the high sky. */
  trail?: boolean;
  /** How far up the air thickens toward the horizon, in art pixels (0: none). */
  haze?: number;
  /** The level's own air at the horizon, where it has one (the haze goes toward it). */
  air?: string;
}

/** Where the sky band runs: from the top of the canvas to the row of his eyes, less a margin. */
function eyeRow(v: View) {
  return Math.round(v.him.y - view.camYf) - 10;
}

/** A far thing's x on the screen: `x0` in a span a little wider than the view, moving with the camera at `f` of its speed and drifting by `drift` a step. */
function across(x0: number, f: number, t: number, drift: number, w: number) {
  const span = view.w + w + 40;
  const tt = view.reduced ? 0 : t;
  return ((((x0 - view.camXf * f + tt * drift) % span) + span) % span) - w - 20;
}

/** A piece in screen pixels (`drawProp` takes the world's). */
const put = (p: Piece, x: number, y: number, w: number) => drawProp(p, Math.round(x) + view.camX, Math.round(y) + view.camY, w);

// --- The pieces of the sky, painted once a sky ------------------------------------------------------------------------

/** A thin high streak: rows of one or two pixels drawn out, thinner at the ends, its upper edge a shade lighter. */
function streak(phase: Phase, k: number): Piece {
  const w = 46 + ((k * 23) % 30);
  const body = streakColour(phase);
  const lit = phase === "night" ? body : mix(body, WHITE, 0.3);
  return custom(`sky streak ${phase} ${k}`, w, 4, (x, y) => {
    const r = seeded(31 + k * 7 + y * 3);
    const a = 2 + Math.floor(r() * 10) + y * 3;
    const b = w - 2 - Math.floor(r() * 10) - (3 - y) * 2;
    if (x < a || x > b) return null;
    if ((x + y * 5 + k) % 9 === 0) return null;
    return y === 0 || (y === 1 && x % 4 === 0) ? lit : body;
  });
}
function streakColour(phase: Phase) {
  return phase === "day" ? "#e7eff7" : phase === "evening" ? "#d9a7a5" : phase === "twilight" ? "#56638f" : "#121b3d";
}

/** A small far cloud low over the horizon: a flat foot, a rounded top, its underside a shade toward the horizon's air. */
function farCloud(phase: Phase, k: number): Piece {
  const w = 12 + ((k * 7) % 10);
  const h = 4 + (k % 3);
  const lit = farColour(phase);
  const under = mix(lit, LOW[phase], 0.45);
  return custom(`sky far ${phase} ${k}`, w, h, (x, y) => {
    const mid = (w - 1) / 2;
    const top = Math.round(Math.abs(x - mid) * (h / mid) * 0.8 - ((x * 3 + k) % 2));
    if (y < top) return null;
    return y >= h - 2 ? under : lit;
  });
}
function farColour(phase: Phase) {
  return phase === "day" ? "#f2f6fa" : phase === "evening" ? "#e7b39a" : phase === "twilight" ? "#6f7cab" : "#1c2752";
}

/** A long flat cloud of a grey cover (stratus): its foot ragged and darker, its top uneven and lit, broken at its ends. */
function stratus(phase: Phase, k: number): Piece {
  const w = 110 + ((k * 41) % 60);
  const h = 9;
  const grey = coverColour(phase, k);
  const shade = mix(grey, INK, 0.14);
  const light = mix(grey, WHITE, 0.22);
  return custom(`sky stratus ${phase} ${k}`, w, h, (x, y) => {
    const end = Math.min(x, w - 1 - x);
    const head = Math.round(3 - Math.min(3, end / 6) + 1.5 * Math.sin(x * 0.09 + k * 3) + 1.5);
    const foot = h - 1 - Math.round(1.5 + 1.5 * Math.sin(x * 0.13 + k * 2));
    if (y < head || y > foot || (end < 10 && (x * 7 + y * 3) % 4 === 0)) return null;
    return y === head ? light : y >= foot ? shade : grey;
  });
}
function coverColour(phase: Phase, k: number) {
  return phase === "day" ? (k % 2 ? "#aebac7" : "#bec8d3") : phase === "evening" ? "#5d5676" : phase === "twilight" ? "#34406a" : "#0d1530";
}

/** The stars over the upper sky, thinning toward the horizon: a sheet as wide as any view, kept, its top at the canvas's top. */
function starSheet(n: number, phase: Phase, h: number): Piece {
  const w = 300;
  const r = seeded(97);
  const at = new Map<number, string>();
  const bright = phase === "twilight" ? "#e9e4d8" : "#e4e9f7";
  const dim = phase === "twilight" ? "#6f7cad" : "#8f9cc4";
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * w);
    // Thinning: most near the top, few near the horizon.
    const y = Math.floor(Math.pow(r(), 1.8) * (h - 2));
    at.set(y * w + x, r() < 0.25 ? bright : dim);
  }
  return custom(`sky stars ${n} ${phase} ${h}`, w, h, (x, y) => at.get(y * w + x) ?? null);
}

/** A plane's trail: a line a pixel wide drawn out and sloping a little, wider and fainter behind it, the plane a lit point at its head. */
function trail(phase: Phase): Piece {
  const w = 120;
  const h = 14;
  const line = phase === "day" ? "#f4f7fa" : "#e3b6a6";
  const old = mix(line, TOP[phase], 0.22);
  return custom(`sky trail ${phase}`, w, h, (x, y) => {
    const at = Math.round(h - 2 - x * 0.1);
    if (x > w - 3 && y === at) return x === w - 1 ? WHITE : line;
    if (y === at) return x < 40 ? old : line;
    // Behind the plane it spreads, faintly.
    if (x < 60 && y === at + 1 && x % 3 !== 0) return old;
    return null;
  });
}

// --- The sky band ------------------------------------------------------------------------------------------------------

/** What the level's tall sky holds over the far view, on an upright screen, under the bar's `top` rows; `w` says what (`Weather`). */
export function skyBand(v: View, w: Weather, top: number) {
  const phase = v.sky.phase;
  const eye = eyeRow(v);
  const span = eye - top;
  if (span < 60) return;
  const t = v.t;
  const g = ctx();
  // Stars, thinning toward the horizon: over the kit's (which stand evenly over the upper three fifths).
  if (w.stars && phase !== "day") put(starSheet(w.stars, phase, 20 * Math.max(2, Math.min(15, Math.floor((span - 40) / 20)))), (view.w - 300) / 2, top, 300);
  if (w.curtains !== undefined) curtains(v, w.curtains);
  // A winter's grey cover: the upper sky drawn toward its grey, and long flat clouds under it, the nearer lower and darker.
  if (w.cover) {
    const grey = coverColour(phase, 0);
    const wash = g.createLinearGradient(0, top, 0, top + span * 0.7);
    wash.addColorStop(0, `${grey}d9`);
    wash.addColorStop(1, `${grey}00`);
    g.fillStyle = wash;
    g.fillRect(0, top - 8, view.w, Math.round(span * 0.7) + 8);
    for (let k = 0; k < w.cover; k++) {
      const p = stratus(phase, k);
      put(p, across(40 + k * 157, 0.02 + k * 0.012, t, 0.01 + k * 0.006, 170), Math.round(top + 8 + k * span * 0.16 + (k % 2) * 6), 170);
    }
  }
  // Thin high streaks, in the upper third.
  for (let k = 0; k < (w.streaks ?? 0); k++) {
    const p = streak(phase, k);
    const y = Math.round(top + 14 + ((k * 37) % 30) + k * span * 0.09);
    put(p, across(30 + k * 113, 0.015 + k * 0.004, t, 0.004 + k * 0.002, 80), y, 80);
  }
  // A plane's trail, high and still.
  if (w.trail && (phase === "day" || phase === "evening")) put(trail(phase), across(160, 0.01, 0, 0, 120), top + 26, 120);
  // Far birds, half way down the sky: a few, or a skein of geese.
  if (w.birds) {
    const dark = phase === "day" ? "#3e4247" : "#1a1f33";
    const n = w.birds === "skein" ? 7 : 3;
    const x0 = across(200, 0.05, t, 0.08, 40);
    const y0 = Math.round(top + span * 0.4);
    const flap = view.reduced ? 0 : Math.floor(t / 9) % 2;
    g.fillStyle = dark;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const rank = Math.ceil(i / 2);
      const bx = Math.round(w.birds === "skein" ? x0 - rank * 5 : x0 + i * 13 + (i % 2) * 4);
      const by = Math.round(w.birds === "skein" ? y0 + rank * 3 * side * side + (side > 0 ? 0 : rank) : y0 + ((i * 7) % 9));
      g.fillRect(bx, by, 1, 1);
      g.fillRect(bx - 1, by - 1 + ((flap + i) % 2), 1, 1);
      g.fillRect(bx + 1, by - 1 + ((flap + i) % 2), 1, 1);
    }
  }
  // Small far clouds low over the horizon, smaller and paler the nearer it.
  for (let k = 0; k < (w.far ?? 0); k++) {
    const p = farCloud(phase, k);
    const y = Math.round(eye - 70 + ((k * 17) % 34));
    put(p, across(20 + k * 61, 0.03, t, 0.006, 24), y, 24);
  }
  // The air thickening toward the horizon: the sky's own colour there, over the lower part of the band.
  if (w.haze) {
    const low = w.air ?? LOW[phase];
    const top = eye - w.haze;
    const grad = g.createLinearGradient(0, top, 0, eye + 20);
    grad.addColorStop(0, `${low}00`);
    grad.addColorStop(1, `${low}b3`);
    g.fillStyle = grad;
    g.fillRect(0, top, view.w, w.haze + 20);
  }
}

/** The northern lights' curtains: faint rays a view wide, brighter at their foot, kept (they are still; the kit's band under them waves). */
function curtainSheet(phase: Phase): Piece {
  const w = 330;
  const h = 44;
  const night = TOP[phase];
  const foot = ["#1b5a50", "#1a4a5a", "#2b2e5c"];
  const head = foot.map((c) => mix(c, night, 0.55));
  return custom(`sky curtains ${phase}`, w, h, (x, y) => {
    if (x % 3 !== 0) return null;
    const len = Math.round(18 + 14 * Math.sin(x * 0.031 + 1) + 6 * Math.sin(x * 0.13) + 4 * Math.sin(x * 0.0190 * 3));
    const up = h - 1 - y;
    if (len < 10 || up >= len) return null;
    const k = Math.floor(x / 23) % 3;
    return up < len * 0.45 ? foot[k] : head[k];
  });
}

/** The northern lights' curtains rising from the kit's band (`pixelkit/sky.ts`: its top over the horizon it is given), on an upright screen. */
export function curtains(v: View, horizonY: number) {
  if (!v.sky.aurora) return;
  const foot = Math.max(8, horizonY - view.camY - 112) + 4;
  const x = -((((view.camXf * 0.1) % 330) + 330) % 330);
  const p = curtainSheet(v.sky.phase);
  put(p, x, foot - 44, 330);
  if (x + 330 < view.w) put(p, x + 330, foot - 44, 330);
}

// --- Under the ground --------------------------------------------------------------------------------------------------

/** What lies under a level's ground, and how deep its dark is. */
export interface Under {
  /** The letters its ground's body is made of: a column whose run of these reaches the map's foot is ground to its surface. */
  letters: string;
  /** Tiles under the surface where the dark begins to come on. */
  from: number;
  /** How far down it takes to come on, in art pixels. */
  over: number;
  /** The level's dark: what the ground darkens to. */
  dark: string;
  /** How dark at its darkest (0 to 1). */
  most?: number;
  /** What lies in the ground, drawn first (each tile of a column `depth` tiles under its surface, at its world x, y). */
  things?(c: number, depth: number, x: number, y: number): void;
  /** An old pipe laid along the level this many tiles under its surface, in these tones (its body, its lit top, its joints). */
  pipe?: { depth: number; tones: readonly [string, string, string] };
}

/** Each column's surface: the top row of the run of `letters` that reaches the map's foot (or -1), per map, kept. */
const SURFACES = new WeakMap<TileMap, Map<string, Int16Array>>();
function surfaces(map: TileMap, letters: string): Int16Array {
  let m = SURFACES.get(map);
  if (!m) SURFACES.set(map, (m = new Map()));
  let s = m.get(letters);
  if (s) return s;
  s = new Int16Array(map.cols).fill(-1);
  for (let c = 0; c < map.cols; c++) {
    let r = map.rows - 1;
    if (!letters.includes(map.tileAt(c, r))) continue;
    while (r > 0 && letters.includes(map.tileAt(c, r - 1))) r--;
    s[c] = r;
  }
  m.set(letters, s);
  return s;
}

/** The band under the ground, on an upright screen: what lies in it, then its dark coming on a fixed depth under the surface. */
export function underBand(map: TileMap, u: Under) {
  const s = surfaces(map, u.letters);
  const c0 = Math.max(0, Math.floor(view.camX / TILE));
  const c1 = Math.min(map.cols - 1, Math.floor((view.camX + view.w) / TILE));
  const bottom = view.camY + view.h;
  const g = ctx();
  if (u.things)
    for (let c = c0; c <= c1; c++) {
      if (s[c] < 0) continue;
      for (let r = s[c] + 1; r * TILE < bottom; r++) if ((r + 1) * TILE > view.camY) u.things(c, r - s[c], c * TILE, r * TILE);
    }
  // The dark, a column group at a time: one fill each, a gradient from nothing to its darkest. It comes on under the deepest
  // surface two columns either way, so it steps less often than the ground does.
  const at = (c: number) => {
    if (s[c] < 0) return -1;
    let r = s[c];
    for (let k = Math.max(0, c - 2); k <= Math.min(map.cols - 1, c + 2); k++) if (s[k] > r) r = s[k];
    return r;
  };
  // The pipe follows the ground a column group at a time, under the dark as everything in the ground is.
  if (u.pipe)
    for (let c = c0; c <= c1; ) {
      let e = c;
      while (e + 1 <= c1 && s[e + 1] === s[c]) e++;
      if (s[c] >= 0) {
        const y = (s[c] + u.pipe.depth) * TILE + 6 - view.camY;
        const x = c * TILE - view.camX;
        g.fillStyle = u.pipe.tones[0];
        g.fillRect(x, y, (e - c + 1) * TILE, 4);
        g.fillStyle = u.pipe.tones[1];
        g.fillRect(x, y, (e - c + 1) * TILE, 1);
        g.fillStyle = u.pipe.tones[2];
        // A joint every five tiles, where the pipe's lengths meet.
        for (let k = c; k <= e; k++) if (k % 5 === 0) g.fillRect(k * TILE - view.camX, y - 1, 2, 6);
      }
      c = e + 1;
    }
  // Where the ground is open to the map's foot (a pit, a gully), nothing is drawn under the foot and the far layers showed
  // through as if the pit had a floor: the same dark comes on there from two tiles over the foot, so a pit reads as one.
  const pit = (c: number) => (s[c] < 0 && !map.isSolid(c, map.rows - 1) && !map.isWater(c, map.rows - 1) ? map.rows - u.from - 2 : -1);
  for (let c = c0; c <= c1; ) {
    const r = at(c) >= 0 ? at(c) : pit(c);
    let e = c;
    while (e + 1 <= c1 && (at(e + 1) >= 0 ? at(e + 1) : pit(e + 1)) === r) e++;
    if (r >= 0) {
      const y = (r + u.from) * TILE - view.camY;
      if (y < view.h) {
        g.fillStyle = darkening(g, y, view.h, u);
        g.fillRect(c * TILE - view.camX, y, (e - c + 1) * TILE, view.h - y);
      }
    }
    c = e + 1;
  }
}

/** The ground's layers: lines this many pixels under where the dark begins, each a pixel lit and a pixel deeper. */
const STRATA = [14, 33, 57, 84, 116, 152, 194];

/** The dark under the ground from screen row `y` to `bottom`: nothing at `y`, its darkest `over` pixels down, the ground's layers in it. */
function darkening(g: CanvasRenderingContext2D, y: number, bottom: number, u: Under): CanvasGradient {
  const most = u.most ?? 0.8;
  const len = Math.max(1, bottom - y);
  const grad = g.createLinearGradient(0, y, 0, bottom);
  const a = (d: number) => most * Math.min(1, d / u.over);
  const hex = (k: number) => Math.round(Math.max(0, Math.min(1, k)) * 255).toString(16).padStart(2, "0");
  const stop = (d: number, k: number) => d >= 0 && d <= len && grad.addColorStop(d / len, `${u.dark}${hex(k)}`);
  stop(0, 0);
  for (const s of STRATA) {
    if (s + 2 > len) break;
    stop(s - 0.01, a(s));
    stop(s, a(s) - 0.09);
    stop(s + 0.99, a(s) - 0.09);
    stop(s + 1, a(s) + 0.13);
    stop(s + 1.99, a(s) + 0.13);
    stop(s + 2, a(s + 2));
  }
  stop(Math.min(len, u.over), a(Math.min(len, u.over)));
  stop(len, a(len));
  return grad;
}

/** What lies in a level's ground (order 45): a stone in about one in `every` tiles from `deep` tiles down, a root under the surface in about one column in twelve. */
export function inTheGround(o: { stone: string; root?: string; every?: number; deep?: number }) {
  const every = o.every ?? 24;
  const lit = mix(o.stone, WHITE, 0.22);
  const shade = mix(o.stone, INK, 0.3);
  return (c: number, depth: number, x: number, y: number) => {
    const h = (c * 73 + depth * 151 + 17) % (every * 4);
    if (o.root && depth === 1 && h % 12 === 1) {
      // A root under the surface: a thread going down and aside, a finer one off it.
      const g = ctx();
      g.fillStyle = o.root;
      const sx = Math.round(x) - view.camX + 3 + (h % 9);
      const sy = Math.round(y) - view.camY;
      g.fillRect(sx, sy, 1, 6);
      g.fillRect(sx + 1, sy + 5, 1, 5);
      g.fillRect(sx - 2, sy + 3, 2, 1);
      return;
    }
    if (depth < (o.deep ?? 2) || h > 3) return;
    // A stone: rounded, lit on its top, its foot in shadow.
    const w = 5 + (h % 3) * 2;
    const g = ctx();
    const sx = Math.round(x) - view.camX + 3 + ((c * 5) % 5);
    const sy = Math.round(y) - view.camY + 5;
    g.fillStyle = lit;
    g.fillRect(sx + 1, sy, w - 2, 1);
    g.fillStyle = o.stone;
    g.fillRect(sx, sy + 1, w, 3);
    g.fillStyle = shade;
    g.fillRect(sx + 1, sy + 4, w - 2, 1);
  };
}
