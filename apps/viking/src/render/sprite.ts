import { ctx, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";

// What moves is drawn with an outline as part of its look (order 18, ADR 0039; order 22, ADR 0043): what can hurt
// him in the warning red, what cannot in the pale blue-white of `ROLES.calm`, a pixel all round its shape. A look
// is drawn as before, with `R`, but into a recorder: the rectangles it would paint are noted, not painted. The
// first time a shape is seen it is painted once onto a small canvas of its own with its outline round it; from
// then on that canvas is copied. So an outlined thing costs one copy a frame, not its rectangles, and nothing is
// drawn twice. The eyes it drew (in `ENEMY.eye`) are noted too: they are what shines after dark. After dark the
// outline keeps its light: every outline copied in a frame is noted, and `rings` copies them again, alone, over
// the night's tint.

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
/** The outline's colour for the shape being recorded: the caller's, unless the drawing says it is calm. */
let rimNow = "";
interface Sprite {
  /** The shape with its outline. */
  whole: HTMLCanvasElement;
  /** The outline alone, for after dark. */
  ring: HTMLCanvasElement;
}
const kept = new Map<string, Sprite>();
const KEPT_MOST = 800;
const eyesOf = new WeakMap<object, [number, number][]>();
/** The outlines copied this frame, in screen pixels, for `rings` (a pool, reused frame to frame). */
const drawnRings: { ring: HTMLCanvasElement; x: number; y: number }[] = [];
let drawnCount = 0;
/** For the tests: with `on`, the last outlined shape's rectangles (world pixels) and its outline's colour. */
export const testing: { on: boolean; last: { rim: string; rects: { x: number; y: number; w: number; h: number; c: string }[] } | null } = { on: false, last: null };

/**
 * A dark line between the body and its outline (order 22): "none", or "out" (a near-black ring between the
 * body and the outline, so the outline is two pixels), chosen by looking at phone size.
 */
export const INNER: "none" | "out" = "out";

/** Inside an outlined drawing: draws `draw` straight onto the screen, with no outline (a ripple, a splash, a nest). */
export function plain(draw: () => void) {
  if (!onto) return draw();
  target(onto);
  draw();
  target(asCtx);
}

/** Inside an outlined drawing: what is being drawn cannot hurt him just now (a watched statue, a calm swan): its outline is the calm one. */
export function calm() {
  if (onto) rimNow = ROLES.calm;
}

/**
 * Draws `draw` (rectangles with `R`) with a one-pixel outline round its shape. `who`, when given, has the eyes it
 * drew kept for `eyes`. `rim`: the outline's colour, the warning red unless given (`ROLES.calm` for what cannot
 * hurt him); the drawing may say it is calm itself (`calm()`). Outside a browser it just draws.
 */
export function outlined(draw: () => void, who?: object, rim: string = ENEMY.warning) {
  if (typeof document === "undefined" || onto) return draw();
  onto = ctx();
  rimNow = rim;
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
  rim = rimNow;
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
  const m = INNER === "out" ? 2 : 1;
  let sprite = kept.get(key);
  if (!sprite) {
    if (kept.size >= KEPT_MOST) kept.clear();
    const w = x1 - x0 + 2 * m;
    const h = y1 - y0 + 2 * m;
    const canvas = () => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      return c;
    };
    const shape = canvas();
    const s = shape.getContext("2d")!;
    for (let i = 0; i < n; i++) {
      s.fillStyle = colours[i];
      s.fillRect(rects[i * 4] - x0 + m, rects[i * 4 + 1] - y0 + m, rects[i * 4 + 2], rects[i * 4 + 3]);
    }
    // The outline: the shape grown by a pixel (two, with the dark line inside it), in the rim's colour.
    const ring = canvas();
    const o = ring.getContext("2d")!;
    const grow = (by: number) => {
      for (let dx = -by; dx <= by; dx++) for (let dy = -by; dy <= by; dy++) if (Math.abs(dx) + Math.abs(dy) === by || (by === 1 && Math.abs(dx) + Math.abs(dy) === 1)) o.drawImage(shape, dx, dy);
    };
    grow(1);
    if (m === 2) grow(2);
    o.globalCompositeOperation = "source-in";
    o.fillStyle = rim;
    o.fillRect(0, 0, w, h);
    o.globalCompositeOperation = "source-over";
    const whole = canvas();
    const wg = whole.getContext("2d")!;
    wg.drawImage(ring, 0, 0);
    if (m === 2) {
      // The dark line: the shape grown by one, near-black, between the body and the outline.
      const line = canvas();
      const lg = line.getContext("2d")!;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) lg.drawImage(shape, dx, dy);
      lg.globalCompositeOperation = "source-in";
      lg.fillStyle = ENEMY.line;
      lg.fillRect(0, 0, w, h);
      wg.drawImage(line, 0, 0);
      // The ring alone is the red outside the dark line.
      o.globalCompositeOperation = "destination-out";
      o.drawImage(line, 0, 0);
      o.globalCompositeOperation = "source-over";
    } else {
      o.globalCompositeOperation = "destination-out";
      o.drawImage(shape, 0, 0);
      o.globalCompositeOperation = "source-over";
    }
    wg.drawImage(shape, 0, 0);
    sprite = { whole, ring };
    kept.set(key, sprite);
  }
  g.drawImage(sprite.whole, x0 - m, y0 - m);
  if (testing.on) testing.last = { rim, rects: colours.map((c, i) => ({ x: rects[i * 4] + view.camX, y: rects[i * 4 + 1] + view.camY, w: rects[i * 4 + 2], h: rects[i * 4 + 3], c })) };
  const at = drawnRings[drawnCount] ?? (drawnRings[drawnCount] = { ring: sprite.ring, x: 0, y: 0 });
  at.ring = sprite.ring;
  at.x = x0 - m;
  at.y = y0 - m;
  drawnCount++;
}

/** A new frame: the outlines noted so far are forgotten. */
export function freshRings() {
  drawnCount = 0;
}
/** How many outlines are noted; and back to that many (what is drawn again for its light after dark adds none). */
export const ringCount = () => drawnCount;
export function ringsTo(n: number) {
  drawnCount = n;
}

/** After dark: every outline copied since `freshRings`, copied again alone onto `g` (at the alpha it has), so the outlines keep their light over the night's tint. */
export function rings(g: CanvasRenderingContext2D) {
  for (let i = 0; i < drawnCount; i++) g.drawImage(drawnRings[i].ring, drawnRings[i].x, drawnRings[i].y);
}

/** Where the eyes of an enemy were drawn last (world pixels): they shine in the headlamp and after dusk. */
export const eyes = (who: object): readonly [number, number][] => eyesOf.get(who) ?? [];
