import { ctx, target, view } from "./paint";

// Small pieces of drawing that never change (a tile of rock made of dozens of single rectangles) are
// drawn once onto sheets kept beside the page and copied from there after.
const SHEET = 512;
const KEPT_MOST = 6000;
const sheets = new Map<string, { free: { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D; next: number } | null }>();
const keptAt = new Map<string, { canvas: HTMLCanvasElement; sx: number; sy: number }>();

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
  let at = keptAt.get(key);
  if (!at) {
    if (keptAt.size >= KEPT_MOST) {
      keptAt.clear();
      sheets.clear();
    }
    const size = `${w}x${h}`;
    let rack = sheets.get(size);
    if (!rack) sheets.set(size, (rack = { free: null }));
    const cols = Math.floor(SHEET / w);
    const cells = cols * Math.floor(SHEET / h);
    if (!rack.free || rack.free.next >= cells) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = SHEET;
      rack.free = { canvas, g: canvas.getContext("2d")!, next: 0 };
    }
    const i = rack.free.next++;
    at = { canvas: rack.free.canvas, sx: (i % cols) * w, sy: Math.floor(i / cols) * h };
    const was = { camX: view.camX, camY: view.camY };
    target(rack.free.g);
    view.camX = x - at.sx;
    view.camY = y - at.sy;
    draw();
    target(onto);
    view.camX = was.camX;
    view.camY = was.camY;
    keptAt.set(key, at);
  }
  onto.drawImage(at.canvas, at.sx, at.sy, w, h, dx, dy, w, h);
}
