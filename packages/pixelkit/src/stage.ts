import type { Phase } from "./oslo";
import { TINT, drawLights, lights, target, view } from "./paint";
import { horizonColor } from "./sky";

export interface Stage {
  px: HTMLCanvasElement;
  ui: HTMLCanvasElement;
  /** Context of `px`. */
  g: CanvasRenderingContext2D;
  depths: { factor: number; canvas: HTMLCanvasElement; g: CanvasRenderingContext2D }[];
  depth(factor: number): CanvasRenderingContext2D;
  /** The sizing part of the page's layout: art pixel scale, canvas sizes. */
  resize(): void;
  /** `air` (the viking game's, opt-in): the haze goes toward it, and after dusk is folded with the tint into one fill. */
  pass(onto: CanvasRenderingContext2D, draw: () => void, phase: Phase, haze?: number, air?: string): void;
  nudge(canvas: HTMLCanvasElement, fracX: number): void;
}

/**
 * The view for a stage `cssW` x `cssH` at `dpr`: `k` whole device pixels per art pixel, keeping about 192 art
 * pixels of height and 180 of width (a tall phone zooms in further, so the street is not a strip under an
 * empty sky; never narrower than `minWidth` where a page asks), and `w` x `h` art pixels, one more than the
 * screen in each direction, so nudging a layer never shows an edge.
 */
export function viewFor(cssW: number, cssH: number, dpr: number, minWidth?: number): { k: number; w: number; h: number } {
  const devW = Math.max(1, Math.round(cssW * dpr));
  const devH = Math.max(1, Math.round(cssH * dpr));
  let k = Math.max(1, Math.floor(Math.min(devH / 192, devW / 180)));
  if (devH > devW * 1.2) k = Math.max(k, Math.min(Math.ceil(devH / 280), Math.floor(devW / 120)));
  if (minWidth) k = Math.max(1, Math.min(k, Math.floor(devW / minWidth)));
  return { k, w: Math.ceil(devW / k) + 1, h: Math.ceil(devH / k) + 1 };
}

/**
 * `minWidth`: the fewest art pixels the view may be wide, however tall and narrow the screen; a page
 * that needs to see far ahead (the viking game, on an upright phone) passes it. Without it a tall
 * phone zooms in until the street fills it (the front page).
 */
export function createStage(opts: { stage: HTMLElement; px: HTMLCanvasElement; ui: HTMLCanvasElement; factors: number[]; minWidth?: number }): Stage {
  const { stage, px, ui } = opts;
  const g = px.getContext("2d")!;
  const scratch = document.createElement("canvas");
  const sg = scratch.getContext("2d")!;

  /**
   * One canvas per depth, stacked between the sky and the text layer. Each is drawn at whole art
   * pixels and then moved by the fraction its depth has scrolled, so every depth glides smoothly
   * instead of jumping a whole, large pixel at a time.
   */
  const depths = opts.factors.map((factor) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "depth";
    stage.insertBefore(canvas, ui);
    return { factor, canvas, g: canvas.getContext("2d")! };
  });
  const depth = (factor: number) => depths.find((d) => d.factor === factor)!.g;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    Object.assign(view, viewFor(rect.width, rect.height, dpr, opts.minWidth), { dpr });
    view.cssW = (view.w * view.k) / dpr;
    view.cssH = (view.h * view.k) / dpr;
    for (const c of [px, ui, ...depths.map((d) => d.canvas)]) {
      c.style.width = `${view.cssW}px`;
      c.style.height = `${view.cssH}px`;
    }
    for (const c of [px, scratch, ...depths.map((d) => d.canvas)]) {
      c.width = view.w;
      c.height = view.h;
    }
    ui.width = Math.round(view.cssW * dpr);
    ui.height = Math.round(view.cssH * dpr);
  }

  /**
   * Draws one pass of the scene onto a depth's canvas. Distant passes fade a little towards the
   * colour of the horizon, which keeps them calm behind the player. At dusk and night the pass is
   * darkened and then its own windows and lamps come on, before nearer things cover what they should.
   */
  function pass(onto: CanvasRenderingContext2D, draw: () => void, phase: Phase, haze = 0, air?: string) {
    sg.globalCompositeOperation = "source-over";
    sg.clearRect(0, 0, view.w, view.h);
    target(sg);
    lights.length = 0;
    draw();
    const tint = TINT[phase];
    if (air && haze > 0) {
      // The viking game's haze (`air`, opt-in): toward the level's own air, and after dusk folded with the night's
      // tint into one fill (the haze, then the tint, as one colour at one alpha).
      sg.globalCompositeOperation = "source-atop";
      sg.fillStyle = folded(air, haze, tint);
      sg.fillRect(0, 0, view.w, view.h);
      sg.globalCompositeOperation = "source-over";
      if (tint) drawLights();
      onto.drawImage(scratch, 0, 0);
      return;
    }
    if (haze > 0) {
      sg.globalCompositeOperation = "source-atop";
      sg.globalAlpha = haze;
      sg.fillStyle = horizonColor(phase);
      sg.fillRect(0, 0, view.w, view.h);
      sg.globalAlpha = 1;
    }
    if (tint) {
      sg.globalCompositeOperation = "source-atop";
      sg.fillStyle = tint;
      sg.fillRect(0, 0, view.w, view.h);
      sg.globalCompositeOperation = "source-over";
      drawLights();
    }
    onto.drawImage(scratch, 0, 0);
  }

  /** A haze toward `air` at `haze`, then a tint (an rgba or nothing) over it, as one rgba: the same as the two fills one after the other over an opaque pixel. */
  const foldedCache = new Map<string, string>();
  function folded(air: string, haze: number, tint: string | null): string {
    const key = `${air}|${haze}|${tint}`;
    let out = foldedCache.get(key);
    if (out) return out;
    const hex = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
    const h = [0, 1, 2].map((i) => hex(air, i));
    const m = tint ? /rgba?\(([^)]+)\)/.exec(tint) : null;
    const tp = m ? m[1].split(",").map((x) => Number(x)) : [0, 0, 0, 0];
    const b = tp[3] ?? 1;
    const a = 1 - (1 - haze) * (1 - b);
    const c = [0, 1, 2].map((i) => Math.round((h[i] * haze * (1 - b) + tp[i] * b) / a));
    out = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a.toFixed(3)})`;
    foldedCache.set(key, out);
    return out;
  }

  /** Moves a canvas by what is left after drawing at whole art pixels, rounded to device pixels. */
  function nudge(canvas: HTMLCanvasElement, fracX: number) {
    const toCss = (art: number) => Math.round(art * view.k) / view.dpr;
    canvas.style.transform = `translate3d(${-toCss(fracX)}px, ${-toCss(view.camYf - view.camY)}px, 0)`;
  }

  return { px, ui, g, depths, depth, resize, pass, nudge };
}
