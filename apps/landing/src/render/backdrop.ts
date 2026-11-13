import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import { barcode, munch } from "@larshansen/pixelkit/landmarks";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { ctx, layerX, seeded, view } from "@larshansen/pixelkit/paint";
import { BRICK, FACADE, GLASS, LAND, MASONRY, METAL, PAINT, PALETTE, ROOF, SNOW, TRAM as TRAMCAR } from "@larshansen/pixelkit/palette";

// Everything behind the street: the hills, Ekeberg, the fjord, Galgeberg, the skyline and the
// tram. Each layer moves slower than the street the further away it is, and every layer is
// drawn on its own, so nearer things always cover the lights of things behind them.

const FAR = 0.12;
const FJORD = 0.2;
const HILL = 0.25;
const SKYLINE = 0.4;
const TRAM = 0.7;

export function drawHills(sky: Sky) {
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, FAR);
    const hills = 16 + 6 * Math.sin(wx * 0.004) + 4 * Math.sin(wx * 0.011 + 1);
    column(x, 132 - hills, 140, LAND.farHills);
    // Ekeberg rises south-east of Bjørvika, so it fills the right-hand side of the world.
    const ekeberg = 50 * Math.exp(-(((wx - 1220) / 420) ** 2)) + 3 * Math.sin(wx * 0.09);
    if (ekeberg > 4) {
      column(x, 136 - ekeberg, 140, LAND.forest);
      if ((Math.floor(wx / 3) + Math.floor(ekeberg)) % 7 === 0) column(x, 136 - ekeberg, 138 - ekeberg, LAND.forestDark);
      if (sky.snow && ekeberg > 30) column(x, 136 - ekeberg, 138 - ekeberg, SNOW.far);
    }
  }
}

export function drawFjord(t: number) {
  const g = ctx();
  const tt = view.reduced ? 0 : t;
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, FJORD);
    if (wx < 740) continue;
    column(x, 138, 160, PALETTE.water);
    // Hovedøya, low and green, out in the fjord.
    const island = 9 * Math.exp(-(((wx - 1460) / 70) ** 2));
    if (island > 1) column(x, 138 - island, 139, LAND.island);
  }
  g.fillStyle = PALETTE.foam;
  for (let i = 0; i < 14; i++) {
    const wx = 790 + ((i * 97) % 760);
    const x = layerX(wx, FJORD) + Math.round(Math.sin(tt * 0.02 + i) * 2);
    if (x > 0 && x < view.w) g.fillRect(x, 141 + (i % 5) * 3 - view.camY, 3, 1);
  }
}

/**
 * Galgeberg, between Vålerenga and Gamlebyen: a slope of small wooden houses. On top stands the
 * lamp post that an old photograph made people take for the gallows.
 */
const GALGEBERG = 330;
const hillHeight = (wx: number) => 30 * Math.exp(-(((wx - GALGEBERG) / 170) ** 2));
// Placed in the layer's own pixels, side by side, so no house hides behind another's window.
const HILL_HOUSES = [
  { dx: -40, w: 9, h: 7, color: PAINT.farOchre },
  { dx: -29, w: 8, h: 6, color: PAINT.farRed },
  { dx: -18, w: 10, h: 7, color: PAINT.farWhite },
  { dx: -6, w: 8, h: 6, color: PAINT.farGreen },
  { dx: 6, w: 9, h: 7, color: PAINT.farOchre },
  { dx: 17, w: 8, h: 6, color: PAINT.farRed },
  { dx: 28, w: 9, h: 7, color: PAINT.farWhite }
];

export function drawGalgeberg(sky: Sky) {
  for (let x = 0; x < view.w; x++) {
    const h = hillHeight(layerWorldX(x, HILL));
    if (h > 1) column(x, 146 - h, 160, LAND.slope);
  }
  const f = view.reduced ? 1 : HILL;
  const base = layerX(GALGEBERG, HILL);
  for (const house of HILL_HOUSES) {
    const x = base + house.dx;
    if (x < -12 || x > view.w + 2) continue;
    const ground = 146 - hillHeight(GALGEBERG + (house.dx + house.w / 2) / f);
    box(x, ground - house.h, house.w, house.h + 2, house.color);
    for (let i = 0; i < 3; i++) box(x + 1 - i, ground - house.h - 3 + i, house.w - 2 + i * 2, 1, sky.snow ? SNOW.far : ROOF.far);
    box(x + 2, ground - house.h + 2, 2, 2, GLASS.farWindow);
    lit(x + 2, ground - house.h + 2, 2, 2);
  }
  box(base, 104, 1, 13, METAL.lampPost);
  box(base - 1, 103, 3, 1, METAL.lampPost);
}

// The skyline: ordinary blocks, with gaps left for the landmarks.
const rnd = seeded(31);
const LANDMARK_GAPS: [number, number][] = [
  [20, 100],
  [230, 270],
  [380, 470],
  [540, 660],
  [1005, 1045],
  [1075, 1205]
];
const BLOCKS = (() => {
  const out: { wx: number; w: number; h: number; color: string; gableRoof: boolean }[] = [];
  const colors = FACADE.blocks;
  // Side by side on screen, never overlapping, so every lit window belongs to the block in front.
  for (let wx = -40; wx < 1560; ) {
    const w = 14 + Math.floor(rnd() * 14);
    const h = 12 + Math.floor(rnd() * 20);
    const color = colors[Math.floor(rnd() * colors.length)];
    const gableRoof = rnd() < 0.35;
    if (!LANDMARK_GAPS.some(([a, b]) => wx + w / SKYLINE > a && wx < b)) out.push({ wx, w, h, color, gableRoof });
    wx += Math.ceil((w + 1 + Math.floor(rnd() * 3)) / SKYLINE);
  }
  return out;
})();

const BASE = 160;

export function drawSkylineBlocks() {
  const g = ctx();
  BLOCKS.forEach((b, n) => {
    const x = layerX(b.wx, SKYLINE);
    if (x + b.w < 0 || x > view.w) return;
    const y = BASE - b.h;
    box(x, y, b.w, b.h, b.color);
    if (b.gableRoof) for (let i = 0; i < 6; i++) box(x + 5 - i, y - 6 + i, b.w - (5 - i) * 2, 1, b.color);
    g.fillStyle = "rgba(40, 50, 60, 0.22)";
    for (let wy = y + 3; wy < BASE - 3; wy += 5)
      for (let wx = 2; wx < b.w - 2; wx += 4) {
        g.fillRect(x + wx, wy - view.camY, 2, 2);
        if ((n * 7 + wx * 3 + wy) % 9 === 0) lit(x + wx, wy, 2, 2);
      }
  });
}

/** Vålerenga kirke: grey stone, Gothic Revival, with its tower off to one side. */
function valerengaKirke(x: number) {
  box(x - 16, BASE - 20, 26, 20, MASONRY.church);
  for (let i = 0; i < 10; i++) box(x - 7 - i, BASE - 30 + i, 8 + i * 2, 1, ROOF.churchSlate);
  box(x + 10, BASE - 40, 9, 40, MASONRY.churchTower);
  for (let i = 0; i < 16; i++) box(x + 14 - Math.floor(i / 4), BASE - 56 + i, 1 + Math.floor(i / 4) * 2, 1, ROOF.churchSlate);
  box(x + 13, BASE - 34, 3, 5, MASONRY.churchWindow);
  for (const wx of [-12, -6, 0]) {
    box(x + wx, BASE - 15, 3, 7, MASONRY.churchWindow);
    lit(x + wx, BASE - 15, 3, 7);
  }
}

/** Kampen kirke: red brick, Gothic Revival, 1882. */
function kampenKirke(x: number) {
  box(x - 14, BASE - 26, 28, 26, BRICK.red);
  box(x - 4, BASE - 50, 8, 26, BRICK.red);
  for (let i = 0; i < 20; i++) {
    const half = 1 + Math.floor(i / 5);
    box(x - half, BASE - 70 + i, half * 2, 1, BRICK.red);
  }
  box(x - 1, BASE - 44, 2, 5, BRICK.kampenWindow);
  for (const wx of [-10, 6]) {
    box(x + wx, BASE - 20, 3, 8, BRICK.kampenWindow);
    lit(x + wx, BASE - 20, 3, 8);
  }
}

/** Kruttverket: an old brick factory by the Alna, now workshops, studios and a stage. */
function kruttverket(x: number) {
  box(x - 28, BASE - 3, 56, 3, LAND.river);
  box(x - 24, BASE - 30, 48, 27, BRICK.kruttverket);
  for (let i = 0; i < 8; i++) box(x - 19 - i, BASE - 38 + i, 38 + i * 2, 1, ROOF.factory);
  for (const row of [BASE - 26, BASE - 14])
    for (let wx = -20; wx < 20; wx += 7) {
      box(x + wx, row, 4, 8, BRICK.kruttverketWindow);
      box(x + wx + 1, row - 1, 2, 1, BRICK.kruttverketWindow);
      lit(x + wx, row, 4, 8);
    }
  box(x + 14, BASE - 58, 5, 26, BRICK.kruttverketChimney);
  box(x + 13, BASE - 60, 7, 2, BRICK.kruttverketCap);
}

/** Kværnerbyen: new apartment blocks next to the old Kværner hall. */
function kvaernerbyen(x: number) {
  const blocks = [
    { dx: -46, w: 16, h: 50, color: "#e7e4dd" },
    { dx: -27, w: 14, h: 42, color: "#d3d7d9" },
    { dx: -10, w: 16, h: 56, color: "#ece9e2" }
  ];
  for (const b of blocks) {
    box(x + b.dx, BASE - b.h, b.w, b.h, b.color);
    for (let y = BASE - b.h + 3; y < BASE - 2; y += 4) {
      box(x + b.dx + 1, y, b.w - 2, 1, FACADE.balcony);
      if ((y + b.dx) % 3 === 0) lit(x + b.dx + 2, y - 2, b.w - 4, 2);
    }
  }
  // The hall, with a factory's saw-tooth roof.
  box(x + 10, BASE - 14, 36, 14, FACADE.hall);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) box(x + 10 + i * 6 + j, BASE - 18 + j, 1, 4 - j, ROOF.sawTooth);
  for (let wx = 12; wx < 44; wx += 5) {
    box(x + wx, BASE - 9, 3, 3, FACADE.hallWindow);
    lit(x + wx, BASE - 9, 3, 3);
  }
}

export function drawLandmarks() {
  const at = (wx: number) => layerX(wx, SKYLINE);
  valerengaKirke(at(60));
  kampenKirke(at(250));
  kruttverket(at(425));
  kvaernerbyen(at(600));
  munch(at(1025), BASE);
  barcode(at(1090), BASE);
}

/** The blue tram along Dronning Eufemias gate, in Bjørvika. */
export function drawTram(t: number) {
  const g = ctx();
  const y = 156 - view.camY;
  const x0 = layerX(960, TRAM);
  const x1 = layerX(1540, TRAM);
  g.fillStyle = METAL.rail;
  g.fillRect(Math.max(0, x0), y, Math.min(view.w, x1) - Math.max(0, x0), 1);
  const period = 1500;
  const along = view.reduced ? 220 : Math.round(((t % period) / period) * 900) - 120;
  const tx = layerX(960 + along, TRAM);
  if (tx < -70 || tx > view.w + 10) return;
  for (let s = 0; s < 3; s++) {
    const sx = tx + s * 21;
    g.fillStyle = TRAMCAR.body;
    g.fillRect(sx, y - 11, 20, 10);
    g.fillStyle = TRAMCAR.glass;
    g.fillRect(sx + 1, y - 9, 18, 3);
    g.fillStyle = TRAMCAR.body;
    for (let w = 5; w < 18; w += 5) g.fillRect(sx + w, y - 9, 1, 3);
    g.fillStyle = TRAMCAR.skirt;
    g.fillRect(sx, y - 2, 20, 1);
    lit(sx + 1, 156 - 9, 18, 3);
  }
  g.fillStyle = METAL.wire;
  g.fillRect(tx + 28, y - 14, 1, 3);
  g.fillRect(tx + 25, y - 14, 7, 1);
}
