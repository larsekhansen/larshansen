import { ctx, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";

// What can hurt him is drawn with a dark outline (order 18, ADR 0039): a pixel of the enemy palette's
// near-black all round its shape, as part of its look. A look is drawn as before, with `R`, but into a
// recorder: the rectangles it would paint are noted, not painted. The first time a shape is seen it is
// painted once onto a small canvas of its own with its outline round it; from then on that canvas is
// copied. So an outlined enemy costs one copy a frame, not its rectangles, and nothing is drawn twice.
// The eyes it drew (in `ENEMY.eye`) are noted too: they are what shines after dark.

const rects: number[] = [];
const colours: string[] = [];
const recorder = {
  fillStyle: "",
  fillRect(x: number, y: number, w: number, h: number) {
    rects.push(x, y, w, h);
    colours.push(recorder.fillStyle);
  }
};
const asCtx = recorder as unknown as CanvasRenderingContext2D;
/** The context the outlined shape goes onto, while one is being recorded. */
let onto: CanvasRenderingContext2D | null = null;
const kept = new Map<string, HTMLCanvasElement>();
const KEPT_MOST = 800;
const eyesOf = new WeakMap<object, [number, number][]>();

/** Inside an outlined drawing: draws `draw` straight onto the screen, with no outline (a ripple, a splash, a nest). */
export function plain(draw: () => void) {
  if (!onto) return draw();
  target(onto);
  draw();
  target(asCtx);
}

/**
 * Draws `draw` (rectangles with `R`) with a one-pixel outline round its shape. `who`, when given, has
 * the eyes it drew kept for `eyes`. `rim`: the outline's colour, when not the enemy palette's near-black
 * (a boss, while it hurts, has the warning colour). Outside a browser it just draws.
 */
export function outlined(draw: () => void, who?: object, rim: string = ENEMY.outline) {
  if (typeof document === "undefined" || onto) return draw();
  onto = ctx();
  rects.length = 0;
  colours.length = 0;
  target(asCtx);
  try {
    draw();
  } finally {
    target(onto);
  }
  const g = onto;
  onto = null;
  const n = colours.length;
  if (!n) return;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < n * 4; i += 4) {
    x0 = Math.min(x0, rects[i]);
    y0 = Math.min(y0, rects[i + 1]);
    x1 = Math.max(x1, rects[i] + rects[i + 2]);
    y1 = Math.max(y1, rects[i + 1] + rects[i + 3]);
  }
  let key = rim;
  const eyes: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const k = i * 4;
    key += `${colours[i]}${rects[k] - x0},${rects[k + 1] - y0},${rects[k + 2]},${rects[k + 3]};`;
    if (colours[i] === ENEMY.eye) eyes.push([rects[k] + view.camX, rects[k + 1] + view.camY]);
  }
  if (who) eyesOf.set(who, eyes);
  let sprite = kept.get(key);
  if (!sprite) {
    if (kept.size >= KEPT_MOST) kept.clear();
    const w = x1 - x0 + 2;
    const h = y1 - y0 + 2;
    const shape = document.createElement("canvas");
    shape.width = w;
    shape.height = h;
    const s = shape.getContext("2d")!;
    for (let i = 0; i < n; i++) {
      s.fillStyle = colours[i];
      s.fillRect(rects[i * 4] - x0 + 1, rects[i * 4 + 1] - y0 + 1, rects[i * 4 + 2], rects[i * 4 + 3]);
    }
    sprite = document.createElement("canvas");
    sprite.width = w;
    sprite.height = h;
    const o = sprite.getContext("2d")!;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) o.drawImage(shape, dx, dy);
    o.globalCompositeOperation = "source-in";
    o.fillStyle = rim;
    o.fillRect(0, 0, w, h);
    o.globalCompositeOperation = "source-over";
    o.drawImage(shape, 0, 0);
    kept.set(key, sprite);
  }
  g.drawImage(sprite, x0 - 1, y0 - 1);
}

/** Where the eyes of an enemy were drawn last (world pixels): they shine in the headlamp and after dusk. */
export const eyes = (who: object): readonly [number, number][] => eyesOf.get(who) ?? [];
