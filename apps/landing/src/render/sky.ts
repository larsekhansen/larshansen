import type { Phase, Sky } from "../game/oslo";
import { S, ctx, disc, seeded, view } from "./paint";

const GRADIENT = {
  day: ["#4f96d8", "#cde8f5"],
  evening: ["#2b3466", "#f2a46a"],
  night: ["#050a1d", "#1b2b58"],
  twilight: ["#1d2a5e", "#7083c2"]
} as const;

/** The sky's colour at the horizon, which distant things fade towards. */
export function horizonColor(phase: Phase) {
  return GRADIENT[phase][1];
}

const rnd = seeded(7);
const STARS = Array.from({ length: 90 }, () => ({ x: rnd(), y: rnd(), k: rnd() }));
const FLAKES = Array.from({ length: 110 }, () => ({ x: rnd(), y: rnd(), k: rnd() }));
const CLOUDS = Array.from({ length: 7 }, () => ({ x: rnd(), y: rnd(), s: 0.6 + rnd() * 0.8 }));
const CLOUD_COLOR = { day: "#ffffff", evening: "#f6c3a0", twilight: "#8a98cf", night: "rgba(28, 39, 80, 0.55)" } as const;

/** World y of the horizon, so the low evening sun sinks behind the hills. */
const HORIZON = 126;
const MOON_R = 6;

/**
 * A crescent: only the lit pixels are drawn, so the sky, the northern lights and the clouds
 * show where the dark side of the moon is.
 */
function crescent(cx: number, cy: number) {
  const g = ctx();
  g.fillStyle = "#e9eefb";
  const bx = 3;
  const by = -2;
  const br = MOON_R - 1;
  for (let dy = -MOON_R; dy <= MOON_R; dy++) {
    const half = Math.floor(Math.sqrt(MOON_R * MOON_R - dy * dy));
    const bdy = dy - by;
    if (Math.abs(bdy) > br) {
      g.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1);
      continue;
    }
    const bhalf = Math.floor(Math.sqrt(br * br - bdy * bdy));
    const left = Math.min(half, bx - bhalf - 1);
    if (left >= -half) g.fillRect(Math.round(cx - half), Math.round(cy + dy), left + half + 1, 1);
    const right = Math.max(-half, bx + bhalf + 1);
    if (right <= half) g.fillRect(Math.round(cx + right), Math.round(cy + dy), half - right + 1, 1);
  }
}

export function drawSky(sky: Sky, t: number) {
  const g = ctx();
  const tt = view.reduced ? 0 : t;
  const [top, bottom] = GRADIENT[sky.phase];
  const grad = g.createLinearGradient(0, 0, 0, view.h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, view.w, view.h);

  const sunX = view.w * 0.78;
  const high = Math.max(14, HORIZON - view.camY - 96);

  if (sky.phase === "night") {
    STARS.forEach((s, i) => {
      const x = Math.floor(s.x * view.w);
      const y = Math.floor(s.y * (view.h * 0.6));
      if ((x - sunX) ** 2 + (y - high) ** 2 <= (MOON_R + 1) ** 2) return; // behind the moon
      g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(tt * 0.03 + i * 1.7)) * s.k;
      S(x, y, 1, 1, "#ffffff");
    });
    g.globalAlpha = 1;
  }

  // The sun and the moon are furthest away, so everything else in the sky goes in front.
  if (sky.phase === "day") {
    disc(sunX, high, 9, "rgba(255, 236, 150, 0.35)");
    disc(sunX, high, 6, "#fff3b8");
  } else if (sky.phase === "evening") {
    const y = HORIZON - view.camY - 30;
    disc(view.w * 0.62, y, 12, "rgba(255, 170, 100, 0.4)");
    disc(view.w * 0.62, y, 9, "#ffb26b");
  } else {
    crescent(sunX, high);
  }

  if (sky.aurora) {
    const bands = ["rgba(90, 255, 170, 0.10)", "rgba(60, 220, 210, 0.08)", "rgba(180, 120, 255, 0.06)"];
    const top0 = Math.max(8, HORIZON - view.camY - 112);
    bands.forEach((col, b) => {
      g.fillStyle = col;
      for (let x = 0; x < view.w; x += 2) {
        const wx = x + view.camX * 0.1;
        const y = top0 + b * 9 + Math.sin(wx * 0.025 + tt * 0.012 + b) * 7 + Math.sin(wx * 0.07 - tt * 0.02) * 2;
        g.fillRect(x, Math.round(y), 2, Math.round(16 + Math.sin(wx * 0.05 + b + tt * 0.01) * 6));
      }
    });
  }

  // Clouds drift slowly from the west, further away the smaller they are.
  const horizon = HORIZON - view.camY;
  for (const c of CLOUDS) {
    const span = view.w + 80;
    const x = (((c.x * span - view.camX * 0.06 * c.s + tt * 0.03 * c.s) % span) + span) % span - 40;
    const y = 14 + c.y * Math.max(20, horizon - 64);
    const r = Math.round(5 * c.s);
    const color = CLOUD_COLOR[sky.phase];
    disc(x, y, r, color);
    disc(x + 7 * c.s, y - 3 * c.s, Math.round(7 * c.s), color);
    disc(x + 15 * c.s, y, r, color);
    S(x - r, y, Math.round(15 * c.s + r * 2), r + 1, color);
  }
}

/** Falling snow, in screen art pixels. It falls in front of everything, so the text layer draws it. */
export function snowfall(sky: Sky, t: number): { x: number; y: number; size: number }[] {
  if (!sky.snow) return [];
  const tt = view.reduced ? 0 : t;
  return FLAKES.map((f) => ({
    x: (((f.x * view.w + Math.sin(tt * 0.02 + f.k * 6) * 4 - view.camXf * 0.3 * f.k) % view.w) + view.w) % view.w,
    y: (((f.y * view.h + tt * (0.25 + f.k * 0.35)) % view.h) + view.h) % view.h,
    size: f.k > 0.7 ? 2 : 1
  }));
}
