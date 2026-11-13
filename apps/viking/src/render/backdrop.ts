import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { GLASS, LAND, PAINT, PALETTE, PLANTS, ROOF, SNOW } from "@larshansen/pixelkit/palette";
import { ctx, layerX, seeded, view } from "@larshansen/pixelkit/paint";
import { GROUND_Y } from "../game/level";

// Everything behind the street: mountains, the far shore of the fjord, and near headlands. Each
// layer moves slower than the street the further away it is, and each is drawn on its own canvas,
// so nearer things always cover the lights of things behind them. Same layer system as the front page.

const MOUNTAINS = 0.12;
const FJORD = 0.2;
const HEADLANDS = 0.4;

const SHORE = GROUND_Y - 22; // where the far shore meets its water
const WATER_LINE = GROUND_Y - 18; // the far water, which runs down behind the street

/**
 * Hills and a few far peaks, as seen down the Oslofjord: two broad ranges, the far one paler and
 * bluer, with snow only on the top few pixels of its highest peaks.
 */
export function drawMountains(sky: Sky) {
  const base = SHORE;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, MOUNTAINS);
    const h = 30 + 14 * Math.sin(wx * 0.003 + 0.6) + 8 * Math.sin(wx * 0.0085 + 1) + 3 * Math.sin(wx * 0.021 + 2);
    column(x, base - h, base, LAND.mountains);
    if (h > 46) column(x, base - h, base - h + 6 + ((x * 7) % 3), SNOW.peak);
  }
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, MOUNTAINS);
    const h = 18 + 8 * Math.sin(wx * 0.0052 + 3) + 5 * Math.sin(wx * 0.013) + 2 * Math.sin(wx * 0.031 + 1);
    column(x, base - h, base, LAND.mountainsNear);
    if (sky.snow) column(x, base - h, base - h + 1, SNOW.far);
  }
}

// Far shore: a low green bank with a few small houses, and a spruce here and there.
const rnd = seeded(53);
const FAR_HOUSES = Array.from({ length: 9 }, (_, i) => ({ wx: 200 + i * 230 + Math.floor(rnd() * 90), color: [PAINT.farRed, PAINT.farWhite, PAINT.farOchre][i % 3] }));
const bank = (wx: number) => 7 + 4 * Math.sin(wx * 0.011 + 1) + 3 * Math.sin(wx * 0.037 + 2);

/** The far shore of the fjord and its water, with glints that move. */
export function drawFjord(t: number) {
  const g = ctx();
  const tt = view.reduced ? 0 : t;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, FJORD);
    column(x, WATER_LINE, GROUND_Y + 8, PALETTE.water);
    const h = bank(wx);
    column(x, SHORE - h, WATER_LINE, LAND.forest);
    if ((Math.floor(wx / 3) + Math.floor(h)) % 7 === 0) column(x, SHORE - h, SHORE - h + 2, LAND.forestDark);
  }
  for (const h of FAR_HOUSES) {
    const x = layerX(h.wx, FJORD);
    if (x < -8 || x > view.w + 2) continue;
    const ground = SHORE - bank(h.wx) + 4;
    box(x, ground - 5, 6, 5, h.color);
    box(x - 1, ground - 6, 8, 1, ROOF.far);
    box(x, ground - 7, 6, 1, ROOF.far);
    box(x + 2, ground - 4, 2, 2, GLASS.farWindow);
    lit(x + 2, ground - 4, 2, 2);
  }
  g.fillStyle = PALETTE.foam;
  for (let i = 0; i < 22; i++) {
    const wx = 150 + ((i * 97) % 2100);
    const x = layerX(wx, FJORD) + Math.round(Math.sin(tt * 0.02 + i) * 2);
    if (x > 0 && x < view.w) g.fillRect(x, WATER_LINE + 3 + (i % 5) * 3 - view.camY, 3, 1);
  }
}

/** A spruce in three tiers, from its foot. */
function spruce(x: number, foot: number, h: number, snow: boolean) {
  box(x, foot - 2, 1, 2, PLANTS.spruceTrunk);
  for (let i = 0; i < h; i++) {
    const half = Math.min(1 + Math.floor(i / 3), 4);
    box(x - half, foot - 2 - h + i, half * 2 + 1, 1, i % 3 === 0 && snow ? SNOW.lying : PLANTS.spruce);
  }
}

// Near headlands, in this layer's own pixels, and two islets out on the water.
const HEADS = [
  { at: 30, w: 120, h: 22 },
  { at: 250, w: 90, h: 14 },
  { at: 420, w: 150, h: 26 },
  { at: 640, w: 100, h: 16 },
  { at: 810, w: 130, h: 24 }
];
const ISLETS = [
  { at: 340, w: 30, h: 7 },
  { at: 740, w: 26, h: 6 }
];

export function drawHeadlands(sky: Sky) {
  const foot = GROUND_Y - 3; // meets the water just behind the street
  const worldX = (at: number) => at / HEADLANDS; // a position in the layer's own pixels as a world x
  for (const h of HEADS) {
    const x0 = layerX(worldX(h.at), HEADLANDS);
    if (x0 + h.w < 0 || x0 > view.w) continue;
    for (let i = 0; i < h.w; i++) {
      const t = (i / (h.w - 1)) * 2 - 1;
      const top = Math.round(h.h * Math.pow(Math.max(0, 1 - t * t), 0.7));
      column(x0 + i, foot - top, foot, i % 11 === 0 ? LAND.headlandDark : LAND.headland);
      if (sky.snow && top > 3) column(x0 + i, foot - top, foot - top + 1, SNOW.lying);
    }
    // Spruce along the top of the headland.
    for (let i = 6; i < h.w - 6; i += 9 + ((h.at + i) % 5)) {
      const t = (i / (h.w - 1)) * 2 - 1;
      const top = Math.round(h.h * Math.pow(Math.max(0, 1 - t * t), 0.7));
      spruce(x0 + i, foot - top + 3, 9 + ((i * 3 + h.at) % 6), sky.snow);
    }
  }
  for (const s of ISLETS) {
    const x0 = layerX(worldX(s.at), HEADLANDS);
    if (x0 + s.w < 0 || x0 > view.w) continue;
    for (let i = 0; i < s.w; i++) {
      const t = (i / (s.w - 1)) * 2 - 1;
      const top = Math.round(s.h * Math.pow(Math.max(0, 1 - t * t), 0.6));
      column(x0 + i, foot - top, foot, i % 5 === 0 ? PALETTE.rockDark : PALETTE.rock);
      if (top > 3) column(x0 + i, foot - top, foot - top + 1, sky.snow ? SNOW.lying : LAND.island);
    }
    spruce(x0 + Math.floor(s.w / 2), foot - s.h + 2, 8, sky.snow);
  }
}
