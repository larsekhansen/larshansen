import { ctx, target, view } from "./paint";

// Small pieces of drawing that never change (a tile of rock made of dozens of single rectangles, a spruce
// of a hundred rows) are drawn once onto sheets kept beside the page and copied from there after.
const SHEET = 512;
const KEPT_MOST = 6000;
/** The sheets, each filled shelf by shelf: a shelf is a row of pieces no taller than it, left to right. */
const sheets: { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D; shelves: { y: number; h: number; x: number }[]; bottom: number }[] = [];
const keptAt = new Map<string, { canvas: HTMLCanvasElement; sx: number; sy: number }>();

/** Room for a piece w x h: on a shelf tall enough with room left, or a new shelf, or a new sheet. */
function room(w: number, h: number) {
  for (const s of sheets) {
    const size = s.canvas.width;
    for (const sh of s.shelves)
      if (sh.h >= h && sh.h <= h * 2 && sh.x + w <= size) {
        sh.x += w;
        return { s, sx: sh.x - w, sy: sh.y };
      }
    if (s.bottom + h <= size && w <= size) {
      s.shelves.push({ y: s.bottom, h, x: w });
      s.bottom += h;
      return { s, sx: 0, sy: s.bottom - h };
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.max(SHEET, w, h);
  const s = { canvas, g: canvas.getContext("2d")!, shelves: [{ y: 0, h, x: w }], bottom: h };
  sheets.push(s);
  return { s, sx: 0, sy: 0 };
}

/** The sheet's cell for `key`, drawn by `draw` the first time with (ox, oy) of `R`'s world at its top left. */
function cell(key: string, w: number, h: number, ox: number, oy: number, draw: () => void) {
  let at = keptAt.get(key);
  if (at) return at;
  if (keptAt.size >= KEPT_MOST) {
    keptAt.clear();
    sheets.length = 0;
  }
  const { s, sx, sy } = room(w, h);
  at = { canvas: s.canvas, sx, sy };
  const onto = ctx();
  const was = { camX: view.camX, camY: view.camY };
  target(s.g);
  view.camX = ox - at.sx;
  view.camY = oy - at.sy;
  // Held to its own cell, so a piece of a larger drawing (`keptStrips`) takes only its part.
  s.g.save();
  s.g.beginPath();
  s.g.rect(sx, sy, w, h);
  s.g.clip();
  draw();
  s.g.restore();
  target(onto);
  view.camX = was.camX;
  view.camY = was.camY;
  keptAt.set(key, at);
  return at;
}

/**
 * Draws `draw` (which paints the world rectangle x, y, w, h and nothing outside it with `R`, the same pixels every time,
 * opaque or clear, registering no lights) once, and copies it from then on. `key` names what is
 * drawn, place included. Outside a browser it just draws.
 */
export function kept(key: string, x: number, y: number, w: number, h: number, draw: () => void) {
  if (typeof document === "undefined") return draw();
  const dx = x - view.camX;
  const dy = y - view.camY;
  const onto = ctx();
  if (dx + w <= 0 || dy + h <= 0 || dx >= onto.canvas.width || dy >= onto.canvas.height) return;
  const at = cell(key, w, h, x, y, draw);
  onto.drawImage(at.canvas, at.sx, at.sy, w, h, dx, dy, w, h);
}

/**
 * A large piece that never changes (a hall's walls, a ship), kept as strips `strip` pixels wide: `draw` paints
 * the whole of it, and each strip keeps its part. Only the strips on the screen are copied, or ever drawn.
 */
export function keptStrips(key: string, x: number, y: number, w: number, h: number, draw: () => void, strip = 128) {
  for (let sx = x; sx < x + w; sx += strip) kept(`${key} ${sx - x}`, sx, y, Math.min(strip, x + w - sx), h, draw);
}

/**
 * The same for a shape that looks alike wherever it stands (a far spruce of a given height and colour):
 * `draw` paints it in its own frame, 0..w and 0..h, with `R`, and it is copied to (x, y) of the canvas being
 * drawn on, in that canvas's own pixels (a far layer's, or the street's less the camera). `key` names the
 * shape, not the place. Nothing is culled here: the caller knows what its layer shows. Outside a browser it
 * just draws, there.
 */
export function stamp(key: string, x: number, y: number, w: number, h: number, draw: () => void) {
  if (typeof document === "undefined") {
    const was = { camX: view.camX, camY: view.camY };
    view.camX = -x;
    view.camY = -y;
    draw();
    view.camX = was.camX;
    view.camY = was.camY;
    return;
  }
  const at = cell(key, w, h, 0, 0, draw);
  ctx().drawImage(at.canvas, at.sx, at.sy, w, h, x, y, w, h);
}

/** Whether anything between world x0 and x1 is on the street layer's canvas: what is not need not be drawn. */
export function seen(x0: number, x1: number) {
  return x1 > view.camX && x0 < view.camX + view.w;
}
