import { ctx, layerOrigin, mix, view } from "@larshansen/pixelkit/paint";
import { PALETTE } from "@larshansen/pixelkit/palette";

// Depth (order 23, section 3). What Open Surge's sea does, within the rule that what never changes is drawn once and
// copied (ADR 0036): a band of water or snow running from the horizon to the lane, cut into thin strips, each a little
// faster than the one above it and (water) drifting a little faster, so the band reads as a plane running away from
// him. Each strip is drawn once into a kept texture and copied each frame: a few copies a strip, no rectangles.
//
// And `at`, for a piece of a far layer drawn at a speed of its own on that layer's canvas: so a level's layers can be
// split (the near trees from the far ones, a row of houses from the skyline) into more speeds than its three canvases.

/** A receding plane: where it runs on its layer's canvas, how fast its strips go, and what it is made of. */
export interface Plane {
  /** The factor of the canvas it is drawn on (0.12, 0.2 or 0.4). */
  layer: number;
  /** Its top (the horizon) and its foot, in world pixels as its layer draws them. */
  top: number;
  bottom: number;
  /** The factor of its top strip and of its foot's (a share of the camera's speed). */
  from: number;
  to: number;
  /** Its tones from the far strip to the near one; its glints (foam, a sparkle on snow); how fast its near strip drifts (pixels a step; 0 for snow). */
  tones: readonly string[];
  glint: string;
  drift: number;
  /** A strip's height at the top and at the foot (pixels): nearer strips are taller, as the swell is. 3 and 3 unless given. */
  strip?: number;
  near?: number;
}

/** The width a strip's texture repeats over. */
const PERIOD = 192;
const textures = new Map<string, { canvas: HTMLCanvasElement; rows: number[]; heights: number[] }>();

/** A plane's strips: their heights, top to foot, filling it. */
function strips(p: Plane): number[] {
  const a = p.strip ?? 3;
  const b = p.near ?? a;
  const total = p.bottom - p.top;
  const out: number[] = [];
  for (let y = 0; y < total; ) {
    const h = Math.max(1, Math.min(total - y, Math.round(a + (b - a) * (y / total))));
    out.push(h);
    y += h;
  }
  return out;
}

/** A plane's texture: each strip its tone, with glints that grow longer and more frequent toward the near strip. Drawn once. */
function texture(p: Plane) {
  const heights = strips(p);
  const id = `${p.tones.join()}${p.glint}${heights.join()}`;
  let t = textures.get(id);
  if (t) return t;
  const n = heights.length;
  const canvas = document.createElement("canvas");
  canvas.width = PERIOD;
  canvas.height = p.bottom - p.top;
  const g = canvas.getContext("2d")!;
  const rows: number[] = [];
  let y0 = 0;
  for (let k = 0; k < n; k++) {
    const s = heights[k];
    rows.push(y0);
    const f = n > 1 ? k / (n - 1) : 1;
    const i = f * (p.tones.length - 1);
    const tone = mix(p.tones[Math.floor(i)], p.tones[Math.min(p.tones.length - 1, Math.floor(i) + 1)], i - Math.floor(i));
    g.fillStyle = tone;
    g.fillRect(0, y0, PERIOD, s);
    // Glints: more and longer nearer him, each at its own place (a fixed hash, so the same every visit).
    g.fillStyle = p.glint;
    const count = 3 + Math.round(f * 6);
    const len = 1 + Math.round(f * 3);
    for (let j = 0; j < count; j++) g.fillRect((j * 97 + k * 61 + ((k * 13) % 7)) % PERIOD, y0 + ((j + k) % s), len, 1);
    // A strip's lower edge a touch lighter: the swell's crest seen from above.
    if (s > 1) {
      g.fillStyle = mix(tone, p.glint, 0.12);
      g.fillRect(0, y0 + s - 1, PERIOD, 1);
    }
    y0 += s;
  }
  t = { canvas, rows, heights };
  textures.set(id, t);
  return t;
}

/**
 * Draws a receding plane on the canvas being drawn (its layer's pass, so the haze and the night's tint go over it as
 * over the rest of the layer). `t`: the level's clock, for the drift (none with reduced motion).
 */
export function plane(p: Plane, t: number) {
  // Where there is no page (the tests, which read what each level paints), its strips as plain bands of their tones.
  if (typeof document === "undefined") {
    const hs = strips(p);
    let y = p.top;
    hs.forEach((h, k) => {
      const f = hs.length > 1 ? k / (hs.length - 1) : 1;
      const i = f * (p.tones.length - 1);
      ctx().fillStyle = mix(p.tones[Math.floor(i)], p.tones[Math.min(p.tones.length - 1, Math.floor(i) + 1)], i - Math.floor(i));
      ctx().fillRect(0, y - view.camY, view.w, h);
      y += h;
    });
    return;
  }
  const tex = texture(p);
  const n = tex.heights.length;
  const g = ctx();
  const o = layerOrigin(p.layer);
  const frac = o - Math.floor(o);
  const tt = view.reduced ? 0 : t;
  for (let k = 0; k < n; k++) {
    const share = n > 1 ? k / (n - 1) : 1;
    const f = p.from + (p.to - p.from) * share;
    // Where the strip's texture starts on this canvas: its own speed, less the canvas's own nudge, and its drift.
    const x0 = Math.round(-layerOrigin(f) + frac + tt * p.drift * (0.35 + 0.65 * share));
    const start = (((x0 % PERIOD) + PERIOD) % PERIOD) - PERIOD;
    const y = p.top + tex.rows[k] - view.camY;
    const s = tex.heights[k];
    for (let x = start; x < view.w; x += PERIOD) g.drawImage(tex.canvas, 0, tex.rows[k], PERIOD, s, x, y, PERIOD, s);
  }
}

/**
 * Where world x goes on a far layer's canvas (factor `layer`) for a piece drawn at its own factor `f` (order 23): within
 * half a pixel of where a canvas of its own would put it, so a layer's pieces can go at more speeds than its canvas.
 */
export function spedX(wx: number, f: number, layer: number): number {
  const o = layerOrigin(layer);
  const fo = view.reduced ? 1 : f;
  return Math.round(wx * fo - layerOrigin(f) + (o - Math.floor(o)));
}

/**
 * The fjord's water as a plane (`drawFjord`'s, on the middle canvas): from the far shore's water line, at the layer's
 * own speed, to well past it nearer the quay; and a sailing boat far out on it, going its own way at its own pace.
 */
export function fjord(t: number, top: number, bottom: number) {
  plane({ layer: 0.2, top, bottom, from: 0.2, to: 0.5, tones: [WATER_FAR, PALETTE.water, WATER_NEAR], glint: PALETTE.foam, drift: 0.12, strip: 2, near: 4 }, t);
  // The boat: on the strip a third of the way down, a white sail and a dark hull, crossing in about four minutes.
  const f = 0.3;
  const span = view.w + 400;
  const x = Math.round(((((900 * f - layerOrigin(f) + (view.reduced ? 0 : t) * 0.06) % span) + span) % span) - 200);
  if (x < -8 || x > view.w) return;
  const y = Math.round(top + (bottom - top) / 3) - view.camY;
  const g = ctx();
  g.fillStyle = "#3a3f4a";
  g.fillRect(x, y, 7, 1);
  g.fillRect(x + 1, y + 1, 5, 1);
  g.fillStyle = "#f4f2ea";
  for (let k = 0; k < 5; k++) g.fillRect(x + 3, y - 5 + k, 1 + (k >> 1), 1);
}
const WATER_FAR = mix(PALETTE.water, PALETTE.foam, 0.22);
const WATER_NEAR = mix(PALETTE.water, "#1d4f6e", 0.25);
