import type { Phase } from "./oslo";
import { STONE, type Stone } from "./palette";

// Shared drawing state. The world is drawn at low resolution into `world` and scaled up by
// a whole number of device pixels, so every art pixel stays square and sharp.

export const view = {
  w: 320, // art pixels across
  h: 200,
  k: 3, // device pixels per art pixel
  dpr: 1,
  cssW: 960,
  cssH: 600,
  camXf: 0, // where the camera really is, in art pixels
  camYf: 0,
  camX: 0, // the whole-pixel part the art is drawn at; each layer is then nudged by the rest
  camY: 0,
  reduced: false
};

let g: CanvasRenderingContext2D;
export function target(ctx: CanvasRenderingContext2D) {
  g = ctx;
}
export function ctx() {
  return g;
}

/** Rectangle in world coordinates. */
export function R(x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(Math.round(x) - view.camX, Math.round(y) - view.camY, w, h);
}

/** Rectangle in screen coordinates. */
export function S(x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Filled pixel circle in screen coordinates. */
export function disc(cx: number, cy: number, r: number, color: string) {
  g.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    const w = Math.floor(Math.sqrt(r * r - dy * dy));
    g.fillRect(Math.round(cx - w), Math.round(cy + dy), w * 2 + 1, 1);
  }
}

/** Filled pixel circle in world coordinates. */
export function wdisc(cx: number, cy: number, r: number, color: string) {
  disc(cx - view.camX, cy - view.camY, r, color);
}

/** A gable roof: a triangle in world coordinates, widest at `baseY`. */
export function gable(x: number, baseY: number, w: number, h: number, color: string) {
  for (let i = 0; i < h; i++) {
    const half = Math.round((w / 2) * ((i + 1) / h));
    R(x + w / 2 - half, baseY - h + i, half * 2, 1, color);
  }
}

/** Where a layer at `factor` depth starts, in its own pixels. Reduced motion flattens every layer. */
export function layerOrigin(factor: number) {
  const f = view.reduced ? 1 : factor;
  return (view.camXf + view.w / 2) * f - view.w / 2;
}

/**
 * Where a layer at `factor` depth puts world x on its canvas. Everything in a layer is drawn at
 * the same whole-pixel offset, and the canvas itself is then moved by the remaining fraction, so a
 * layer glides smoothly without its pixels drifting apart.
 */
export function layerX(wx: number, factor: number) {
  const f = view.reduced ? 1 : factor;
  return Math.round(wx * f) - Math.floor(layerOrigin(factor));
}

// Windows and lamps register themselves while a layer is drawn, and come on after dark.
export type LightKind = "window" | "soft" | "lamp" | "pool";
export const lights: { x: number; y: number; w: number; h: number; kind: LightKind; color?: string }[] = [];
/** A light that comes on after dark; `color`, when given, is its own (a low sun's), in place of the kind's. */
export function light(x: number, y: number, w: number, h: number, kind: LightKind = "window", color?: string) {
  lights.push({ x, y, w, h, kind, color });
}

export function drawLights() {
  for (const l of lights) {
    const x = l.x - view.camX;
    const y = l.y - view.camY;
    if (l.kind === "pool") {
      // Lamplight on the street: the ground itself gets brighter, most right under the lamp.
      g.globalCompositeOperation = "lighter";
      const cx = x + l.w / 2;
      for (let i = 0; i < l.w; i++) {
        const t = 1 - Math.abs(x + i + 0.5 - cx) / (l.w / 2);
        if (t <= 0) continue;
        g.fillStyle = `rgba(255, 186, 96, ${(0.34 * t * t).toFixed(3)})`;
        g.fillRect(x + i, y, 1, l.h);
      }
      g.globalCompositeOperation = "source-over";
      continue;
    }
    if (l.kind === "lamp") {
      g.fillStyle = "rgba(255, 205, 120, 0.22)";
      g.fillRect(x - 1, y + l.h, l.w + 2, 1);
    }
    g.fillStyle = l.color ?? (l.kind === "soft" ? "rgba(255, 214, 120, 0.45)" : "#ffd36b");
    g.fillRect(x, y, l.w, l.h);
  }
  lights.length = 0;
}

export const TINT: Record<Phase, string | null> = {
  day: null,
  evening: "rgba(110, 60, 100, 0.30)",
  night: "rgba(10, 16, 48, 0.62)",
  twilight: "rgba(36, 46, 110, 0.42)"
};

/** A colour mixed toward `toward` by `t`. Both as #rrggbb. */
export function mix(color: string, toward: string, t: number) {
  const k = Math.max(0, Math.min(1, t));
  const ch = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16);
  const out = [0, 1, 2].map((i) => Math.round(ch(color, i) + (ch(toward, i) - ch(color, i)) * k));
  return "#" + out.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Small deterministic random numbers, so the city looks the same on every visit. */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

function stoneHash(x: number, y: number) {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * One column of rough stonework from `top` to `bottom` in world coordinates, leaving a gap for an
 * opening: irregular blocks with dark mortar, the same stones every visit. The front page's ruins
 * and the maze's walls are both drawn with it.
 */
export function stoneColumn(x: number, top: number, bottom: number, gapTop = 0, gapBottom = 0, stone: Stone = STONE) {
  // Stonework is the same every frame, and a wall of it is tens of thousands of single pixels: so
  // it is drawn once into squares kept beside the page, and a column is then a strip copied from them.
  if (gapBottom > gapTop && gapTop < bottom && gapBottom > top) {
    stoneWall(x, top, 1, Math.min(bottom, gapTop), stone);
    stoneWall(x, Math.max(top, gapBottom), 1, bottom, stone);
  } else stoneWall(x, top, 1, bottom, stone);
}

function stonePixels(x: number, top: number, bottom: number, stone: Stone) {
  for (let y = top; y < bottom; y++) {
    const course = Math.floor(y / 4);
    const offset = (course * 5) % 7;
    const block = Math.floor((x + offset) / 6);
    const isMortar = y % 4 === 3 || (x + offset) % 6 === 0;
    const shade = stoneHash(block, course);
    const color = isMortar ? stone.mortar : shade < 0.33 ? stone.dark : shade < 0.75 ? stone.base : stone.light;
    R(x, y, 1, 1, color);
  }
}

/** Side of a kept square of stonework, in art pixels, and how many are kept before starting over. */
const STONE_SQUARE = 128;
const STONE_KEPT = 160;
const stoneSquares = new Map<Stone, Map<string, HTMLCanvasElement>>();
let stoneCount = 0;

function stoneSquare(stone: Stone, cx: number, cy: number): HTMLCanvasElement {
  let squares = stoneSquares.get(stone);
  if (!squares) stoneSquares.set(stone, (squares = new Map()));
  const key = `${cx},${cy}`;
  let square = squares.get(key);
  if (square) return square;
  if (stoneCount >= STONE_KEPT) {
    stoneSquares.clear();
    stoneCount = 0;
    stoneSquares.set(stone, (squares = new Map()));
  }
  square = document.createElement("canvas");
  square.width = square.height = STONE_SQUARE;
  const was = { g, camX: view.camX, camY: view.camY };
  g = square.getContext("2d")!;
  view.camX = cx * STONE_SQUARE;
  view.camY = cy * STONE_SQUARE;
  for (let i = 0; i < STONE_SQUARE; i++) stonePixels(view.camX + i, view.camY, view.camY + STONE_SQUARE, stone);
  g = was.g;
  view.camX = was.camX;
  view.camY = was.camY;
  squares.set(key, square);
  stoneCount++;
  return square;
}

/** A whole wall of stonework, `w` columns from x, `top` to `bottom`: the same pixels as that many `stoneColumn`s, copied in as few pieces as it crosses kept squares. */
export function stoneWall(x: number, top: number, w: number, bottom: number, stone: Stone = STONE) {
  if (typeof document === "undefined" || (x | 0) !== x || (top | 0) !== top || (bottom | 0) !== bottom) {
    for (let i = 0; i < w; i++) stonePixels(x + i, top, bottom, stone);
    return;
  }
  const x0 = Math.max(x, view.camX);
  const x1 = Math.min(x + w, view.camX + g.canvas.width);
  const y0 = Math.max(top, view.camY);
  const y1 = Math.min(bottom, view.camY + g.canvas.height);
  for (let yy = y0; yy < y1; ) {
    const cy = Math.floor(yy / STONE_SQUARE);
    const yEnd = Math.min(y1, (cy + 1) * STONE_SQUARE);
    for (let xx = x0; xx < x1; ) {
      const cx = Math.floor(xx / STONE_SQUARE);
      const xEnd = Math.min(x1, (cx + 1) * STONE_SQUARE);
      g.drawImage(stoneSquare(stone, cx, cy), xx - cx * STONE_SQUARE, yy - cy * STONE_SQUARE, xEnd - xx, yEnd - yy, xx - view.camX, yy - view.camY, xEnd - xx, yEnd - yy);
      xx = xEnd;
    }
    yy = yEnd;
  }
}
