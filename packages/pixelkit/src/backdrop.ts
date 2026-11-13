import { ctx, layerOrigin, light, view } from "./paint";

// Helpers for drawing a far layer (hills, a fjord, a skyline) in its own canvas pixels. A layer
// moves slower than the ground the further away it is; across it is drawn in the layer's pixels,
// down it keeps the world's height, so the horizon lines up with the ground in front.

/** A column of a layer's canvas, to the world x it shows there. */
export function layerWorldX(x: number, factor: number) {
  const f = view.reduced ? 1 : factor;
  return (x + Math.floor(layerOrigin(factor))) / f;
}

/** One column of a layer from `top` to `bottom` in world y. */
export function column(x: number, top: number, bottom: number, color: string) {
  const g = ctx();
  g.fillStyle = color;
  g.fillRect(x, Math.round(top) - view.camY, 1, Math.round(bottom - top));
}

/** Rectangle in a layer's screen space, with the world's vertical position. */
export function box(x: number, y: number, w: number, h: number, color: string) {
  const g = ctx();
  g.fillStyle = color;
  g.fillRect(Math.round(x), Math.round(y) - view.camY, Math.round(w), Math.round(h));
}

/** A window in a layer that comes on after dark. */
export function lit(x: number, y: number, w: number, h: number) {
  light(Math.round(x) + view.camX, Math.round(y), w, h);
}
