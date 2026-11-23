import { ctx, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";

// What moves is drawn with an outline as part of its look (order 18, ADR 0039; order 22, ADR 0044): what can hurt
// him in the warning red, what cannot in the pale blue-white of `ROLES.calm`, a pixel all round its shape. A look
// is drawn as before, with `R`, but into a recorder: the rectangles it would paint are noted, not painted. The
// first time a shape is seen it is painted once onto a small canvas of its own with its outline round it; from
// then on that canvas is copied. So an outlined thing costs one copy a frame, not its rectangles, and nothing is
// drawn twice. The eyes it drew (in `ENEMY.eye`) are noted too: they are what shines after dark. After dark the
// outline keeps its light: every outline copied in a frame is noted, and `rings` copies them again, alone, over
// the night's tint.

const rects: number[] = [];
const colours: string[] = [];
/**
 * The level's lean (order 27, ADR 0050): the glamour's two neons as this level has them, and its bodies' plum where it
 * leans another way, colour for colour, applied as a shape is recorded (`alive/glamour.ts` sets it with each scene).
 */
export const lean: Record<string, string> = {};
const recorder = {
  fillStyle: "",
  fillRect(x: number, y: number, w: number, h: number) {
    rects.push(x, y, w, h);
    colours.push(lean[recorder.fillStyle] ?? recorder.fillStyle);
  }
};
const asCtx = recorder as unknown as CanvasRenderingContext2D;
/** The context the outlined shape goes onto, while one is being recorded. */
let onto: CanvasRenderingContext2D | null = null;
/** The outline's colour for the shape being recorded: the caller's, unless the drawing says it is calm. */
let rimNow = "";
export interface Sprite {
  /** The shape with its outline. */
  whole: HTMLCanvasElement;
  /** The outline alone, for after dark. */
  ring: HTMLCanvasElement;
  /** The shape alone and what it was made from (its colours are in it), for the glow after dark (order 27), which is made the first time it is wanted. */
  shape: HTMLCanvasElement;
  key: string;
  glow?: HTMLCanvasElement;
  /** Over a level's own dark (order 32): the glow a pixel further out, and the dark's own pixel between it and the outline. */
  glowFar?: HTMLCanvasElement;
  gap?: HTMLCanvasElement;
}
const kept = new Map<string, Sprite>();
const KEPT_MOST = 800;
const eyesOf = new WeakMap<object, [number, number][]>();
/** The outlines copied this frame, in screen pixels, for `rings` and `glows` (a pool, reused frame to frame); `sprite`: an invader's, which glows. */
const drawnRings: { ring: HTMLCanvasElement; x: number; y: number; sprite: Sprite | null }[] = [];
let drawnCount = 0;
/** For the tests: the last outlined shape as it was recorded (its rectangles, x, y, w, h in turn, as drawn; its colours; its outline's). */
export const lastShape = () => ({ rects, colours, rim: rimNow });


/** Inside an outlined drawing: draws `draw` straight onto the screen, with no outline (a ripple, a splash, a nest). */
export function plain(draw: () => void) {
  if (!onto) return noPage.plain ? noPage.plain(draw) : draw();
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
/**
 * Where there is no page, a tool may be handed each shape outlined and its rim, to outline it as the page does (`tools/figures.ts`,
 * order 36), and what is drawn plain inside one (a ripple, a splash: order 38), to leave it without the outline as the page does.
 */
export const noPage: { outline?: (draw: () => void, rim: string) => void; plain?: (draw: () => void) => void } = {};

export function outlined(draw: () => void, who?: object, rim: string = ENEMY.warning) {
  if (typeof document === "undefined" || onto) return !onto && noPage.outline ? noPage.outline(draw, rim) : draw();
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
  // Two pixels all round: a near-black line inside the outline (order 22, chosen by looking at phone size).
  const m = 2;
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
    // The outline: the shape grown by two pixels in the rim's colour; inside it, grown by one, the near-black line.
    const grown = (by: number, colour: string) => {
      const c = canvas();
      const g2 = c.getContext("2d")!;
      for (let dx = -by; dx <= by; dx++) for (let dy = -by; dy <= by; dy++) if (Math.abs(dx) + Math.abs(dy) <= by) g2.drawImage(shape, dx, dy);
      g2.globalCompositeOperation = "source-in";
      g2.fillStyle = colour;
      g2.fillRect(0, 0, w, h);
      return c;
    };
    const ring = grown(2, rim);
    const line = grown(1, ENEMY.line);
    const whole = canvas();
    const wg = whole.getContext("2d")!;
    wg.drawImage(ring, 0, 0);
    wg.drawImage(line, 0, 0);
    wg.drawImage(shape, 0, 0);
    // The ring alone is the red outside the line.
    const rg = ring.getContext("2d")!;
    rg.globalCompositeOperation = "destination-out";
    rg.drawImage(line, 0, 0);
    sprite = { whole, ring, shape, key };
    kept.set(key, sprite);
  }
  g.drawImage(sprite.whole, x0 - m, y0 - m);
  const at = drawnRings[drawnCount] ?? (drawnRings[drawnCount] = { ring: sprite.ring, x: 0, y: 0, sprite: null });
  at.ring = sprite.ring;
  at.sprite = rim === ENEMY.warning ? sprite : null;
  at.x = x0 - m;
  at.y = y0 - m;
  drawnCount++;
}

/** A new frame: the outlines noted so far are forgotten. */
/** For the tests (order 32): the shapes made so far forgotten, so a recording that copies them is not cut by the cache starting over. */
export function forgetShapes() {
  kept.clear();
}

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

/** For the glow after dark (order 27, `alive/glamour.ts`): each invader outlined since `freshRings`, its sprite and where it was copied. */
export function invaders(each: (s: Sprite, x: number, y: number) => void) {
  for (let i = 0; i < drawnCount; i++) if (drawnRings[i].sprite) each(drawnRings[i].sprite!, drawnRings[i].x, drawnRings[i].y);
}

/** Where the eyes of an enemy were drawn last (world pixels): they shine in the headlamp and after dusk. */
export const eyes = (who: object): readonly [number, number][] => eyesOf.get(who) ?? [];
