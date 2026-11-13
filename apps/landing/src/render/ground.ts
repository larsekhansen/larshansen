import { TILE } from "@larshansen/pixelkit/config";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { R, stoneColumn } from "@larshansen/pixelkit/paint";
import { GROUND, MASONRY, PALETTE, PLANTS, SNOW, STONE } from "@larshansen/pixelkit/palette";
import { STONE_LEDGE, crate, edgesOf, forVisibleTiles, groundFill, groundTop, lampPool, ledge, outlineTile } from "@larshansen/pixelkit/props";
import { LEVEL, districtFrom, isSolid, tileAt } from "../game/level";
import { LAMPS } from "./buildings";

// Everything you can stand on shares one look: a bright top edge and a dark outline.
// Scenery never gets it, so it is easy to tell what is a platform.

// The street changes underfoot: cobbles at Vålerenga and Kampen, grass in the garden and the
// park, and pale stone on the square in Bjørvika.
function surface(x: number) {
  if (x < districtFrom("Tøyen")) return { top: GROUND.cobble, dot: GROUND.cobbleDot, fill: GROUND.cobbleFill };
  if (x < districtFrom("Bjørvika")) return { top: PALETTE.grass, dot: PALETTE.grassDark, fill: PALETTE.earth };
  return { top: GROUND.paving, dot: GROUND.pavingDot, fill: GROUND.pavingFill };
}

export function drawTiles(sky: Sky) {
  forVisibleTiles(LEVEL, (t, c, r, x, y) => {
    const open = !isSolid(c, r - 1);
    if (t === "#") {
      // The pavement or grass runs on under crates, hedges and ruins, which stand on it.
      const s = surface(x);
      groundFill(x, y, c, r, s.fill);
      if (tileAt(c, r - 1) !== "#") groundTop(x, y, c, s.top, s.dot, sky.snow && open);
    } else if (t === "B") crate(x, y, edgesOf(tileAt, c, r), open, sky.snow);
    else if (t === "H") {
      R(x, y, TILE, TILE, PLANTS.hedge);
      for (let i = 0; i < 6; i++) R(x + ((i * 5 + c * 3) % 14), y + ((i * 7 + r * 5) % 14), 2, 2, i % 2 ? PLANTS.hedgeLight : PLANTS.hedgeDark);
      outlineTile(x, y, edgesOf(tileAt, c, r), PLANTS.hedgeEdge);
      if (open) R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW.lying : PLANTS.hedgeTop);
    } else if (t === "R") {
      // Fallen walls you can stand on: rough stone with a worn, mossy top.
      for (let i = 0; i < TILE; i++) stoneColumn(x + i, y, y + TILE);
      outlineTile(x, y, edgesOf(tileAt, c, r), MASONRY.edge);
      if (open) {
        R(x + 1, y + 1, TILE - 2, 1, sky.snow ? SNOW.lying : MASONRY.worn);
        if (!sky.snow) for (let i = 2; i < TILE - 2; i += 5) R(x + i, y - 1, 2, 1, STONE.moss);
      }
    } else if (t === "_") ledge(x, y, STONE_LEDGE, tileAt(c - 1, r) !== "_", tileAt(c + 1, r) !== "_", sky.snow);
  });
}

/** After dark, the street brightens around each lamp. */
export function lightStreet() {
  for (const l of LAMPS) lampPool(l.x, 160);
}
