import { layerX, mix } from "@larshansen/pixelkit/paint";
import { GLASS, LAND, PAINT, STONE } from "@larshansen/pixelkit/palette";
import { darker, drawFar, farPiece, lighter } from "./far";

// Langkaia's own far view (order 44): what is seen from the quay out on the fjord and up the shore, drawn over the far shore and
// the fjord the first script shares with four levels and the map (`drawFjord`, `drawOsloHills`, which stay as they are). Out on
// the water, nearest first: Hovedøya, low and wooded; smaller islands, one of them Lindøya with its rows of small summer cabins
// in mixed colours; behind them all the far shore, which is Nesodden's long even ridge. To the left, the east, Ekeberg's wooded
// hillside. Langkaia is the first script's level, so this comes with `feel`'s file and is asked for through the props kit's hook
// (`TEXTURED.prop("islands")`): without that file the fjord is as it was (ADR 0053).

/** Where each is seen from, in world x: Ekeberg up the shore at the start, past the Barcode; Lindøya and its islets out past the saunas; Hovedøya between Sørenga's blocks, to the west of them (right). */
const EKEBERG = 40;
const LINDOYA = 1080;
const HOVEDOYA = 2200;

/** The fjord's islands and Ekeberg's hillside, in the fjord's layer (0.2), its water line `ground - 18` as `drawFjord` has it. */
export function langkaiaFar(ground: number) {
  const water = ground - 18;
  drawFar(ekeberg(), layerX(EKEBERG, 0.2) - 70, water + 2);
  drawFar(islet(0), layerX(LINDOYA - 150, 0.2), water + 3);
  drawFar(lindoya(), layerX(LINDOYA, 0.2) - 26, water + 3);
  drawFar(islet(1), layerX(LINDOYA + 180, 0.2), water + 4);
  drawFar(hovedoya(), layerX(HOVEDOYA, 0.2) - 42, water + 7);
}

/** Hovedøya, the nearest: low and wooded, a pale rim of rock at the water, its trees lit on the left. */
const hovedoya = () =>
  farPiece("langkaia hovedoya", 84, 10, (b) => {
    for (let x = 0; x < 84; x++) {
      const t = (x - 40) / 42;
      const h = Math.max(1, Math.round(9 * Math.pow(Math.max(0, 1 - t * t), 0.7)) + (x > 6 && x < 78 && (x * 7) % 5 === 0 ? 1 : 0));
      b.fill(x, 1, 1, 1, x < 36 ? STONE.light : STONE.base);
      if (h > 1) b.fill(x, 1, 2, h, x < 34 ? LAND.island : darker(LAND.island, 0.15));
      if (h > 2 && x % 5 === 2) b.dot(x, h, lighter(LAND.island, x < 34 ? 0.2 : 0.08));
      if (h > 3 && x % 7 === 3) b.dot(x, h - 2, darker(LAND.island, 0.3));
    }
  });

/** Lindøya: a low island with its rows of small summer cabins, each a dot of its own paint under a dark roof, among trees. */
const lindoya = () =>
  farPiece("langkaia lindoya", 52, 7, (b) => {
    const cabins = [PAINT.farRed, PAINT.farWhite, PAINT.farOchre, PAINT.farGreen, mix(PAINT.farWhite, LAND.farHills, 0.3)];
    for (let x = 0; x < 52; x++) {
      const t = (x - 26) / 26;
      const h = Math.max(1, Math.round(6 * Math.pow(Math.max(0, 1 - t * t), 0.6)));
      b.fill(x, 1, 1, 1, x < 22 ? STONE.light : STONE.base);
      if (h > 1) b.fill(x, 1, 2, h, mix(LAND.island, LAND.farHills, 0.15));
      if (h > 3 && (x * 5) % 9 === 1) b.dot(x, h, darker(LAND.island, 0.2));
    }
    // The cabins in two rows along its slope, close together.
    for (const [u, x0, x1] of [[2, 6, 46], [4, 12, 40]] as const)
      for (let x = x0 + (u === 4 ? 1 : 0); x < x1; x += 3) {
        b.dot(x, u, cabins[(x * 3 + u) % cabins.length]);
        b.dot(x, u + 1, darker(STONE.base, 0.35));
      }
  });

/** The smaller islands near Lindøya: low, wooded, a rim of rock. */
const islet = (k: number) =>
  farPiece(`langkaia islet ${k}`, k ? 18 : 26, 5, (b) => {
    const w = k ? 18 : 26;
    for (let x = 0; x < w; x++) {
      const t = (x - w / 2) / (w / 2);
      const h = Math.max(1, Math.round((k ? 3.5 : 4.5) * Math.sqrt(Math.max(0, 1 - t * t))));
      b.fill(x, 1, 1, 1, STONE.base);
      if (h > 1) b.fill(x, 1, 2, h, x < w / 3 ? mix(LAND.island, LAND.farHills, 0.1) : mix(darker(LAND.island, 0.12), LAND.farHills, 0.1));
    }
  });

/** Ekeberg's hillside to the east: wooded, steep from the water, rising to the left; a window or two lit at its foot after dusk. */
const ekeberg = () =>
  farPiece("langkaia ekeberg", 140, 40, (b) => {
    const wood = mix(LAND.forest, LAND.farHills, 0.2);
    for (let x = 0; x < 140; x++) {
      // Highest at its left end, falling steeply to the water past the middle.
      const k = x / 139;
      const h = Math.max(1, Math.round(38 - 34 * Math.pow(k, 1.6) + ((x * 7) % 5 === 0 ? 1 : 0)));
      b.fill(x, 1, 1, h, k > 0.4 && k < 0.85 ? darker(wood, 0.08) : wood);
      b.dot(x, h, lighter(wood, 0.15));
      for (let u = h - 4 - (x % 3); u > 3; u -= 6 + ((x * 3) % 4)) if ((x * 11 + u) % 7 < 2) b.fill(x, 1, u - 1, u, darker(wood, 0.15));
    }
    // Houses at its foot by the water.
    for (const x of [96, 108, 121]) {
      b.block(x, 6, 1, 5, mix(PAINT.farWhite, LAND.farHills, 0.2));
      b.pane(x + 2, 2, 2, 3, GLASS.farWindow);
    }
  });
