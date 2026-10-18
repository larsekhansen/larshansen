import type { Phase } from "../game/oslo";

// Shared drawing state. The world is drawn at low resolution into `world` and scaled up by
// a whole number of device pixels, so every art pixel stays square and sharp.

export const view = {
  w: 320, // art pixels across
  h: 200,
  k: 3, // device pixels per art pixel
  dpr: 1,
  cssW: 960,
  cssH: 600,
  camX: 0, // whole art pixels, shared by the art and text layers
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

/**
 * Where a layer at `factor` depth puts world x on screen. The layer's offset is rounded once, so
 * everything in a layer moves together by whole pixels instead of each thing rounding on its own.
 * Reduced motion flattens every layer.
 */
export function layerX(wx: number, factor: number) {
  const f = view.reduced ? 1 : factor;
  return Math.round(wx * f) - Math.round((view.camX + view.w / 2) * f) + Math.round(view.w / 2);
}

// Windows and lamps register themselves while a layer is drawn, and come on after dark.
export type LightKind = "window" | "soft" | "lamp" | "pool";
export const lights: { x: number; y: number; w: number; h: number; kind: LightKind }[] = [];
export function light(x: number, y: number, w: number, h: number, kind: LightKind = "window") {
  lights.push({ x, y, w, h, kind });
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
    g.fillStyle = l.kind === "soft" ? "rgba(255, 214, 120, 0.45)" : "#ffd36b";
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
