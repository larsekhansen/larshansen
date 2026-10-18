import { light, layerX, seeded, view, ctx } from "./paint";
import type { Sky } from "../game/oslo";

// Everything behind the street: the hills, Ekeberg, the fjord, the skyline and the tram.
// Each layer moves slower than the street the further away it is.

const FAR = 0.12;
const FJORD = 0.2;
const SKYLINE = 0.4;
const TRAM = 0.7;

/** Screen x to the world x a layer shows there. */
function layerWorldX(x: number, factor: number) {
  const f = view.reduced ? 1 : factor;
  return (x - view.w / 2) / f + view.camX + view.w / 2;
}

function column(x: number, top: number, bottom: number, color: string) {
  const g = ctx();
  g.fillStyle = color;
  g.fillRect(x, Math.round(top) - view.camY, 1, Math.round(bottom - top));
}

export function drawHills(sky: Sky) {
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, FAR);
    const hills = 16 + 6 * Math.sin(wx * 0.004) + 4 * Math.sin(wx * 0.011 + 1);
    column(x, 132 - hills, 140, "#93a6ba");
    // Ekeberg rises south-east of Bjørvika, so it fills the right-hand side of the world.
    const ekeberg = 50 * Math.exp(-(((wx - 1380) / 420) ** 2)) + 3 * Math.sin(wx * 0.09);
    if (ekeberg > 4) {
      column(x, 136 - ekeberg, 140, "#5f8458");
      if ((Math.floor(wx / 3) + Math.floor(ekeberg)) % 7 === 0) column(x, 136 - ekeberg, 138 - ekeberg, "#4b6e46");
      if (sky.snow && ekeberg > 30) column(x, 136 - ekeberg, 138 - ekeberg, "#eef3f9");
    }
  }
}

export function drawFjord(t: number) {
  const g = ctx();
  const tt = view.reduced ? 0 : t;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, FJORD);
    if (wx < 900) continue;
    column(x, 138, 160, "#3d7fae");
    // Hovedøya, low and green, out in the fjord.
    const island = 9 * Math.exp(-(((wx - 1620) / 70) ** 2));
    if (island > 1) column(x, 138 - island, 139, "#4f7a4c");
  }
  g.fillStyle = "#d6eef9";
  for (let i = 0; i < 14; i++) {
    const wx = 950 + ((i * 97) % 900);
    const x = layerX(wx, FJORD) + Math.sin(tt * 0.02 + i) * 2;
    if (x > 0 && x < view.w && layerWorldX(x, FJORD) >= 900) g.fillRect(Math.round(x), 141 + (i % 5) * 3 - view.camY, 3, 1);
  }
}

// The skyline: ordinary blocks with the landmarks among them.
const rnd = seeded(31);
const BLOCKS = (() => {
  const out: { wx: number; w: number; h: number; color: string; gableRoof: boolean }[] = [];
  const colors = ["#b9c2ca", "#c8b8a4", "#aab5a2", "#c3a69a", "#d4ccbe"];
  for (let wx = -40; wx < 1700; wx += 14 + Math.floor(rnd() * 14)) {
    out.push({ wx, w: 14 + Math.floor(rnd() * 14), h: 12 + Math.floor(rnd() * 22), color: colors[Math.floor(rnd() * colors.length)], gableRoof: rnd() < 0.35 });
  }
  return out;
})();

const BASE = 160;

function block(x: number, w: number, h: number, color: string, gableRoof: boolean, seed: number) {
  const g = ctx();
  const y = BASE - h - view.camY;
  g.fillStyle = color;
  g.fillRect(Math.round(x), y, w, h);
  if (gableRoof) for (let i = 0; i < 6; i++) g.fillRect(Math.round(x + i), y - 6 + i, w - i * 2, 1);
  g.fillStyle = "rgba(40, 50, 60, 0.35)";
  for (let wy = y + 3; wy < BASE - view.camY - 3; wy += 5)
    for (let wx = 2; wx < w - 2; wx += 4) {
      g.fillRect(Math.round(x + wx), wy, 2, 2);
      if ((seed + wx * 3 + wy) % 5 === 0) light(Math.round(x + wx) + view.camX, wy + view.camY, 2, 2);
    }
}

function kampenKirke(x: number) {
  // Red brick, Gothic Revival, 1882.
  const g = ctx();
  const y = BASE - view.camY;
  g.fillStyle = "#9b4a3a";
  g.fillRect(Math.round(x) - 14, y - 26, 28, 26);
  g.fillRect(Math.round(x) - 4, y - 50, 8, 26);
  for (let i = 0; i < 20; i++) {
    const half = 1 + Math.floor(i / 5);
    g.fillRect(Math.round(x) - half, y - 70 + i, half * 2, 1);
  }
  g.fillStyle = "#6f3329";
  g.fillRect(Math.round(x) - 1, y - 44, 2, 5);
}

function gronlandKirke(x: number) {
  const g = ctx();
  const y = BASE - view.camY;
  g.fillStyle = "#a8794f";
  g.fillRect(Math.round(x) - 16, y - 24, 32, 24);
  g.fillRect(Math.round(x) - 5, y - 52, 10, 30);
  for (let i = 0; i < 10; i++) {
    const half = 1 + Math.floor(i / 2);
    g.fillRect(Math.round(x) - half, y - 62 + i, half * 2, 1);
  }
  g.fillStyle = "#7c5636";
  g.fillRect(Math.round(x) - 2, y - 46, 4, 6);
}

function munch(x: number) {
  // A tall aluminium-clad tower whose top bends towards the fjord.
  const g = ctx();
  const y = BASE - view.camY;
  g.fillStyle = "#c4ccd2";
  g.fillRect(Math.round(x) - 9, y - 78, 18, 78);
  g.fillRect(Math.round(x) - 9 + 3, y - 96, 18, 20);
  g.fillStyle = "#aab4bb";
  for (let wy = y - 76; wy < y; wy += 4) g.fillRect(Math.round(x) - 9, wy, 18, 1);
  g.fillStyle = "#56646e";
  g.fillRect(Math.round(x) - 6 + 3, y - 92, 12, 3);
  light(Math.round(x) - 6 + 3 + view.camX, y - 92 + view.camY, 12, 3);
}

const BARCODE = [
  { dx: 0, w: 12, h: 64, color: "#e5e8ea", stripes: "v" },
  { dx: 14, w: 10, h: 78, color: "#3f4a54", stripes: "h" },
  { dx: 26, w: 14, h: 70, color: "#cfd6d9", stripes: "v" },
  { dx: 42, w: 10, h: 84, color: "#8a9aa5", stripes: "h" },
  { dx: 54, w: 13, h: 72, color: "#efe6d8", stripes: "v" },
  { dx: 69, w: 11, h: 66, color: "#2f3a44", stripes: "h" },
  { dx: 82, w: 14, h: 76, color: "#d9dfe2", stripes: "v" }
];

function barcode(x: number) {
  const g = ctx();
  const y = BASE - view.camY;
  for (const b of BARCODE) {
    const bx = Math.round(x + b.dx);
    g.fillStyle = b.color;
    g.fillRect(bx, y - b.h, b.w, b.h);
    g.fillStyle = "rgba(0, 0, 0, 0.12)";
    if (b.stripes === "v") for (let i = 2; i < b.w; i += 3) g.fillRect(bx + i, y - b.h, 1, b.h);
    else for (let i = 3; i < b.h; i += 4) g.fillRect(bx, y - b.h + i, b.w, 1);
    for (let i = 6; i < b.h - 4; i += 9) light(bx + 2 + view.camX, y - b.h + i + view.camY, b.w - 4, 2);
  }
}

export function drawSkyline() {
  BLOCKS.forEach((b, i) => {
    const x = layerX(b.wx, SKYLINE);
    if (x + b.w >= 0 && x <= view.w) block(x, b.w, b.h, b.color, b.gableRoof, i * 7);
  });
  const at = (wx: number) => layerX(wx, SKYLINE);
  kampenKirke(at(250));
  gronlandKirke(at(760));
  munch(at(1185));
  barcode(at(1250));
}

/** The blue tram along Dronning Eufemias gate, in Bjørvika. */
export function drawTram(t: number) {
  const g = ctx();
  const y = 156 - view.camY;
  const x0 = layerX(1120, TRAM);
  const x1 = layerX(1700, TRAM);
  g.fillStyle = "#6c7378";
  g.fillRect(Math.round(Math.max(0, x0)), y, Math.round(Math.min(view.w, x1) - Math.max(0, x0)), 1);
  const period = 1500;
  const along = view.reduced ? 220 : ((t % period) / period) * 900 - 120;
  const tx = layerX(1120 + along, TRAM);
  if (tx < -70 || tx > view.w + 10) return;
  for (let s = 0; s < 3; s++) {
    const sx = Math.round(tx + s * 21);
    g.fillStyle = "#1f62b3";
    g.fillRect(sx, y - 11, 20, 10);
    g.fillStyle = "#bfe3ff";
    g.fillRect(sx + 1, y - 9, 18, 3);
    g.fillStyle = "#1f62b3";
    for (let w = 5; w < 18; w += 5) g.fillRect(sx + w, y - 9, 1, 3);
    g.fillStyle = "#16467f";
    g.fillRect(sx, y - 2, 20, 1);
    light(sx + 1 + view.camX, y - 9 + view.camY, 18, 3);
  }
  g.fillStyle = "#2b2f33";
  g.fillRect(Math.round(tx) + 28, y - 14, 1, 3);
  g.fillRect(Math.round(tx) + 25, y - 14, 7, 1);
}
