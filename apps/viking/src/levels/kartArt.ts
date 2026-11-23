import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "@larshansen/pixelkit/doors";
import { box } from "@larshansen/pixelkit/backdrop";
import { R, ctx, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, COIN, DOORWAY, ENEMY, FACADE, FLAG, FOOD, HAT_RED, INK, LAND, MASONRY, METAL, PAINT, PALETTE, PLANTS, ROOF, SNOW, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { plankDoor } from "@larshansen/pixelkit/props";
import { rampHeight } from "@larshansen/pixelkit/tilemap";
import { drawFjord, drawOsloHills } from "../render/backdrop";
import { drawTick } from "../render/actors";
import { RUNE_CHARS, runeCells, type RuneChar } from "../game/runes";
import { isOpen, type Progress } from "../game/progress";
import { LINE, ORDER } from "./index";
import { DIP, DOWN, ENCORE_COL, ENCORE_COLS, GATE_COL, KART_COLS, LINE_1_END, LINE_Y, STORY_SIGN, UP, stationX } from "./kart";
import type { Art, View } from "./types";
import { STORY } from "../game/story";
import { mirrorBall } from "../alive/invasion";
import { custom, drawProp, hash } from "../alive/ground";
import { CONCRETE, leg } from "../alive/props";

// The map's sign by Langkaia's station tells the story of the glamour again (order 27): its words are the story's.
STORY_SIGN.label = { nb: STORY.nb.signLabel, en: STORY.en.signLabel };
STORY_SIGN.lines = { nb: STORY.nb.sign, en: STORY.en.sign };

// How the line map looks, fetched on its own (see kart.ts for what it is): the skyline of each place
// behind its station, the runes carved over them, the viaduct, the burial mound in its dip, Hjem, and
// line 2: its orange track out of Stortinget under line 1, its own viaduct, its stations, the gate
// and the hoardings. Until line 2 opens, everything of it is drawn faint.

const LINE_2_COLOR = PAINT.tbane2;
/** Bjørvika's crane on the map: the quieter ochre the level's own cranes have, not the paint on what he stands on (order 22). */
const MAP_CRANE = "#bfa95e";
/** The low deck line 2 runs on under line 1, just over the water. */
const LOW = LINE_Y + 2 * TILE - 9;
/** Where line 2's track leaves the deck of line 1, just past Stortinget's board, and where it comes up to its own. */
const LEAVE = stationX(7) + 6;
const JOIN = (LINE_1_END + 1) * TILE;

/**
 * A low skyline of each place behind its station (order 28: drawn as a level is, a piece a station, painted once and
 * copied): each place's own shapes in three to five tones of their own material, lit on the left (the sun is the map's),
 * shaded on the right, with the windows, courses, spires and slopes that make it that place at a glance.
 */
const SKY_W = 76;
const SKY_H = 56;
function skyline(i: number, x: number, g: number) {
  drawProp(custom(`kart skyline ${i}`, SKY_W, SKY_H, (px, py) => skyPixels(i).a[py * SKY_W + px]), x - SKY_W / 2, g - SKY_H, SKY_W);
  // After dark about half its windows are lit, the same ones every night (order 32, ADR 0054), as a level's windows are.
  skyPixels(i).panes.forEach((p, n) => hash(i, n, 3, 17) < 0.5 && light(x + p.dx, g - p.to, p.w, p.to - p.from + 1, "window"));
}
/** A skyline's pixels, painted once, and its windows (dx from the station's middle, w wide, rows from..to up from the ground). */
interface Pane {
  dx: number;
  w: number;
  from: number;
  to: number;
}
const SKIES: { a: (string | null)[]; panes: Pane[] }[] = [];
function skyPixels(i: number) {
  if (!SKIES[i]) {
    SKIES[i] = { a: new Array<string | null>(SKY_W * SKY_H).fill(null), panes: [] };
    paintSkyline(i, SKIES[i].a, SKIES[i].panes);
  }
  return SKIES[i];
}
/** A tone between a colour and toward white (k > 0) or toward the dark (k < 0). */
const lit = (c: string, k = 0.22) => mix(c, WHITE, k);
const dim = (c: string, k = 0.22) => mix(c, INK, k);
function paintSkyline(i: number, a: (string | null)[], panes: Pane[]) {
  // dx from the station's middle, up from the ground (1 is the row on the ground).
  const dot = (dx: number, up: number, c: string | null) => {
    const px = dx + SKY_W / 2;
    const py = SKY_H - up;
    if (px >= 0 && px < SKY_W && py >= 0 && py < SKY_H) a[py * SKY_W + px] = c;
  };
  const fill = (dx: number, w: number, h: number, c: string, from = 1) => {
    for (let k = 0; k < w; k++) for (let u = from; u <= h; u++) dot(dx + k, u, c);
  };
  /** A building or a block: its face, its left lit, its right shaded, its top lit, its foot shaded. */
  const block = (dx: number, w: number, h: number, c: string, from = 1) => {
    fill(dx, w, h, c, from);
    for (let u = from; u <= h; u++) {
      dot(dx, u, lit(c));
      dot(dx + w - 1, u, dim(c, 0.18));
    }
    for (let k = 0; k < w; k++) {
      dot(dx + k, h, k === w - 1 ? c : lit(c, 0.3));
      if (from === 1) dot(dx + k, 1, dim(c, 0.15));
    }
  };
  /** A window: its glass, and noted, so it can be lit after dark. */
  const pane = (dx: number, w: number, h: number, c: string, from = 1) => {
    fill(dx, w, h, c, from);
    panes.push({ dx, w, from, to: h });
  };
  const windows = (dx: number, w: number, u0: number, u1: number, sx: number, sy: number, ww: number, wh: number, c: string) => {
    for (let k = 1; k + ww <= w - 1; k += sx) for (let u = u0; u + wh - 1 <= u1; u += sy) pane(dx + k, ww, u + wh - 1, c, u);
  };
  const courses = (dx: number, w: number, h: number, c: string, every: number, from = 2) => {
    for (let u = from; u < h; u += every) for (let k = 1; k < w - 1; k++) if ((k + Math.floor(u / every) * 3) % 7 !== 0) dot(dx + k, u, c);
  };
  /** A spruce: a spire, then tiers widening, its left lit and its right in shade. */
  const spruce = (dx: number, h: number, c: string) => {
    dot(dx, h, lit(c, 0.15));
    dot(dx, h - 1, c);
    for (let k = 2; k < h; k++) {
      const half = Math.min(1 + Math.floor((k % 4) + k / 4), 7);
      for (let j = -half; j <= half; j++) dot(dx + j, h - k, j < 0 ? (j === -half ? lit(c, 0.12) : c) : j === 0 ? c : dim(c, 0.25));
    }
    fill(dx, 1, 2, PLANTS.bark);
  };
  /** A round-crowned tree on a trunk. */
  const tree = (dx: number, h: number, c: string) => {
    fill(dx, 2, h - 6, PLANTS.bark);
    dot(dx + 1, h - 7, dim(PLANTS.bark));
    for (let k = 0; k < 8; k++) {
      const half = 4 - Math.abs(k - 3.5) * 0.9;
      for (let j = -Math.round(half); j <= Math.round(half); j++) dot(dx + 1 + j, h - k, j < 0 ? lit(c, k > 4 ? 0.08 : 0.18) : dim(c, j > 1 ? 0.25 : 0.1));
    }
  };
  switch (i) {
    case 0: {
      // Langkaia: the Barcode's slim towers behind, the Opera's white roof sloping up out of the water to the stage tower,
      // the glass foyer under it.
      [[-34, 5, 40], [-28, 4, 46], [-23, 5, 36], [-17, 4, 42]].forEach(([dx, w, h], k) => {
        const c = k % 2 ? mix(FACADE.stageDoor, WHITE, 0.25) : FACADE.libraryTop;
        block(dx, w, h, c);
        for (let u = 4; u < h - 1; u += 3) for (let j = 1; j < w - 1; j++) dot(dx + j, u, k % 2 ? lit(c, 0.35) : FACADE.libraryTopMullion);
      });
      block(-6, 13, 30, FACADE.stageTower);
      for (let u = 4; u < 28; u += 3) for (let j = 1; j < 12; j += 2) dot(-6 + j + (u % 2), u, FACADE.stageTowerDot);
      for (let k = 0; k < 34; k++) {
        const h = Math.round(k * 0.55) + 2;
        const dx = -18 + k;
        for (let u = 1; u <= h; u++) dot(dx, u, u >= h - 1 ? (u === h ? FACADE.marble : FACADE.marbleEdge) : k > 8 && u < h - 2 ? (dx % 3 === 0 ? FACADE.libraryTopMullion : mix(FACADE.stageDoor, FACADE.libraryTop, 0.45)) : FACADE.marbleWall);
      }
      return;
    }
    case 1: {
      // Akershus: the curtain wall in courses with its battlements, the keep, a copper spire gone green.
      block(-26, 52, 12, STONE.base);
      courses(-26, 52, 12, STONE.dark, 3);
      for (let k = -26; k < 26; k += 4) fill(k, 2, 14, STONE.base, 13), dot(k, 14, STONE.light);
      // The keep stands to the right of the rune stone, so its spire is seen.
      block(9, 14, 24, STONE.light);
      courses(9, 14, 24, STONE.base, 4);
      fill(15, 2, 18, INK, 14);
      for (let k = 0; k < 9; k++) {
        const w = 9 - k;
        for (let j = 0; j < w; j++) dot(12 + Math.ceil(k / 2) + j, 25 + k * 2, j < w / 2 ? METAL.copperLight : j === w - 1 ? METAL.copperDark : METAL.copper);
        for (let j = 0; j < w; j++) dot(12 + Math.ceil(k / 2) + j, 26 + k * 2, j < w / 2 ? METAL.copper : METAL.copperDark);
      }
      dot(16, 44, METAL.copperDark);
      return;
    }
    case 2: {
      // Rådhuset: the two brick towers, their courses and window slits, the clock on the east tower; the hall between.
      block(-8, 16, 16, BRICK.course);
      windows(-8, 16, 4, 13, 3, 12, 1, 8, dim(BRICK.course, 0.4));
      for (const [dx, h] of [[-21, 36], [8, 38]] as const) {
        block(dx, 13, h, BRICK.red);
        courses(dx, 13, h, BRICK.course, 3);
        for (let u = 6; u < h - 6; u += 8) fill(dx + 3, 1, u + 3, dim(BRICK.red, 0.45), u), fill(dx + 8, 1, u + 3, dim(BRICK.red, 0.45), u);
        fill(dx - 1, 15, h + 1, lit(BRICK.red, 0.35), h);
      }
      fill(11, 6, 34, PAINT.trim, 29);
      dot(13, 32, INK);
      dot(13, 31, INK);
      dot(14, 31, INK);
      fill(11, 1, 34, lit(PAINT.trim, 0.1), 29);
      return;
    }
    case 3: {
      // Slottet: the palace, pale yellow, its rows of windows, the portico's columns and pediment, the flag on the roof.
      block(-24, 48, 18, FACADE.palace);
      for (const u of [4, 11]) for (let k = -22; k < 22; k += 4) if (k < -6 || k > 4) pane(k, 2, u + 3, mix(GLASS_DARK, FACADE.palace, 0.25), u);
      fill(-24, 48, 18, lit(FACADE.palace, 0.4), 18);
      fill(-24, 48, 17, dim(FACADE.palace, 0.12), 17);
      for (let k = -6; k <= 5; k += 3) fill(k, 1, 15, PAINT.trim, 2), fill(k + 1, 1, 15, dim(FACADE.palace, 0.18), 2);
      for (let k = 0; k < 7; k++) for (let j = -7 + k; j <= 6 - k; j++) dot(j, 19 + k, k === 0 ? dim(FACADE.palace, 0.1) : lit(FACADE.palace, 0.25));
      fill(-2, 1, 31, METAL.flagpole, 26);
      // Norway's flag, 7 x 5 (order 26).
      for (let u = 27; u <= 31; u++) for (let k = -1; k <= 5; k++) {
        const col = k === 1 || u === 29 ? FLAG.blue : k === 0 || k === 2 || u === 28 || u === 30 ? FLAG.white : FLAG.red;
        dot(k, u, col);
      }
      return;
    }
    case 4: {
      // Holmenkollen: the jump's inrun on its steel, the tower at its top, the landing hill in snow.
      for (let k = 0; k < 40; k++) {
        const dx = -20 + k;
        const top = Math.max(3, Math.round(40 - k * 1.05));
        // The landing hill's snow under the inrun, curving down to the right.
        const hill = Math.max(2, Math.round(16 * Math.exp(-(((k - 6) / 22) ** 2)) + 2));
        fill(dx, 1, hill, k < 20 ? SNOW.lying : SNOW.shade);
        if (k < 30) {
          dot(dx, top, STONE.light);
          dot(dx, top - 1, mix(FACADE.stageTower, INK, 0.1));
          dot(dx, top + 1, SNOW.lying);
          if (k % 5 === 0) for (let u = hill + 1; u < top - 1; u++) dot(dx, u, mix(FACADE.stageTower, INK, 0.25));
        }
      }
      block(-22, 5, 46, mix(FACADE.stageTower, INK, 0.12), 38);
      fill(-23, 7, 47, STONE.light, 46);
      return;
    }
    case 5: {
      // Akerselva: the brick mill with its rows of arched windows and a chimney, the fall white over the rocks beside it.
      block(-22, 18, 20, BRICK.red);
      courses(-22, 18, 20, BRICK.course, 3);
      for (const u of [4, 11]) for (let k = -20; k < -6; k += 4) pane(k, 2, u + 4, BRICK.kruttverketWindow, u), dot(k, u + 4, dim(BRICK.red, 0.3)), dot(k + 1, u + 4, dim(BRICK.red, 0.3));
      block(-8, 4, 30, BRICK.kruttverketChimney, 18);
      fill(-9, 6, 31, BRICK.kruttverketCap, 30);
      for (let k = 0; k < 8; k++) for (let u = 1; u <= 14; u++) dot(k, u, u > 12 ? PALETTE.foam : (k + u) % 4 === 0 ? PALETTE.foam : k < 2 ? lit(PALETTE.water, 0.2) : PALETTE.water);
      fill(0, 8, 3, PALETTE.foam);
      for (const [dx, h] of [[-2, 6], [8, 8], [11, 5]] as const) block(dx, 4, h, PALETTE.rock);
      return;
    }
    case 6:
      // Nordmarka: spruces, their spires, their lit sides and their shade.
      spruce(-16, 22, PLANTS.spruce);
      spruce(-4, 32, PLANTS.spruce);
      spruce(8, 26, PLANTS.spruce);
      spruce(18, 18, dim(PLANTS.spruce, 0.1));
      return;
    case 7: {
      // Stortinget: the yellow brick wings and windows, the round hall in the middle with its cornice and tall windows.
      block(-26, 52, 16, FACADE.storting);
      for (const u of [4, 10]) for (let k = -24; k < 24; k += 4) if (k < -9 || k > 7) pane(k, 2, u + 3, mix(GLASS_DARK, FACADE.storting, 0.2), u);
      for (let k = 0; k < 18; k++) {
        const dx = -9 + k;
        const h = 22 + Math.round(Math.sin((k / 17) * Math.PI) * 3);
        for (let u = 1; u <= h; u++) dot(dx, u, k < 5 ? lit(FACADE.stortingDark, 0.15) : k > 13 ? dim(FACADE.stortingDark, 0.15) : FACADE.stortingDark);
        dot(dx, h, lit(FACADE.storting, 0.35));
        if (k % 4 === 1) pane(dx, 2, 17, mix(GLASS_DARK, FACADE.stortingDark, 0.2), 6);
      }
      return;
    }
    case 8: {
      // Ekeberg: the wooded hill, lit on its left, tufts of trees; the white restaurant on its brow.
      for (let k = -30; k < 30; k++) {
        const h = Math.round(26 * Math.exp(-((k / 17) ** 2)));
        for (let u = 1; u <= h; u++) dot(k, u, k < -6 ? (u > h - 2 ? lit(LAND.forest, 0.18) : LAND.forest) : k > 8 ? dim(LAND.forest, 0.18) : LAND.forest);
        if (h > 3 && (k * 7) % 5 === 0) dot(k, h + 1, k < 0 ? lit(LAND.forest, 0.1) : LAND.forest);
        for (let u = 2; u < h - 2; u++) if (hash(k, u, 8, 61) < 0.08) dot(k, u, dim(LAND.forest, 0.3));
      }
      block(-4, 15, 30, FACADE.marbleWall, 20);
      pane(-3, 13, 27, mix(GLASS_DARK, FACADE.marbleWall, 0.35), 25);
      pane(-3, 13, 23, mix(GLASS_DARK, FACADE.marbleWall, 0.5), 22);
      fill(-4, 15, 30, WHITE, 30);
      return;
    }
    case 9: {
      // Vålerenga: small wooden houses, plank by plank, under their roofs; the church's spire behind.
      // Vålerenga kirke's tower and its spire, behind the houses.
      block(20, 6, 28, MASONRY.churchTower);
      pane(22, 2, 22, MASONRY.churchWindow, 18);
      for (let k = 0; k < 18; k++) {
        const half = Math.max(0, Math.round(3 - k / 6));
        for (let j = -half; j <= half; j++) dot(23 + j, 29 + k, j < 0 ? lit(ROOF.churchSlate, 0.15) : j > 0 ? dim(ROOF.churchSlate) : ROOF.churchSlate);
      }
      [[-22, 13, 13, PAINT.mint, PAINT.mintLine], [-7, 13, 15, PAINT.ochre, PAINT.ochreLine], [8, 12, 12, PAINT.red, PAINT.redLine]].forEach(([dx, w, h, c, line]) => {
        const X = dx as number;
        const W = w as number;
        const H = h as number;
        block(X, W, H, c as string);
        for (let k = 2; k < W - 1; k += 3) fill(X + k, 1, H - 1, line as string, 2);
        pane(X + 3, 3, 8, mix(GLASS_DARK, c as string, 0.2), 5);
        for (let k = 0; k <= Math.ceil(W / 2); k++) for (let j = k; j < W - k; j++) dot(X + j, H + 1 + k, j === k ? lit(ROOF.red, 0.15) : j === W - k - 1 ? dim(ROOF.red) : ROOF.red);
      });
      return;
    }
    case 10: {
      // Bygdøy: Fram's hall, a tall A of a roof with its ribs; the longship's dragon prow beside it.
      for (let k = 0; k < 18; k++) {
        fill(-22 + k, 1, k * 2 + 2, k % 6 === 5 ? PAINT.trim : mix(PAINT.trim, STONE.base, 0.3));
        fill(-4 + k, 1, 36 - k * 2, k % 6 === 0 ? PAINT.trim : mix(PAINT.trim, STONE.base, 0.42));
      }
      fill(-12, 12, 10, mix(PALETTE.water, WHITE, 0.3));
      for (let k = 0; k < 12; k += 3) fill(-12 + k, 1, 10, mix(PALETTE.water, WHITE, 0.15));
      block(14, 16, 6, PALETTE.woodDark);
      for (let k = 0; k < 16; k += 4) dot(14 + k, 4, lit(PALETTE.woodDark, 0.3));
      block(26, 3, 14, PALETTE.woodDark);
      fill(26, 5, 16, PALETTE.wood, 14);
      dot(29, 15, HAT_RED);
      return;
    }
    case 11: {
      // Vigelandsparken: the Monolith on its steps, its carved figures in light and shade; a lime each side.
      block(-18, 36, 3, STONE.light);
      block(-12, 24, 6, STONE.base, 4);
      for (let u = 7; u < 38; u++) for (let k = -3; k < 3; k++) dot(k, u, k === -3 ? lit(STONE.light, 0.3) : k === 2 ? STONE.base : (u + k * 2) % 4 === 0 ? STONE.base : lit(STONE.light, 0.15));
      fill(-2, 4, 39, lit(STONE.light, 0.3), 38);
      tree(-24, 18, PLANTS.leaves);
      tree(20, 18, PLANTS.leaves);
      return;
    }
    case 12: {
      // Korketrekkeren: the snowy hill, the run winding down it in its groove, spruces dark against the snow.
      for (let k = -30; k < 30; k++) {
        const h = Math.round(24 * Math.exp(-((k / 20) ** 2)));
        for (let u = 1; u <= h; u++) dot(k, u, k > 6 ? SNOW.shade : SNOW.lying);
        const run = h - 3 - Math.round(3 * Math.sin(k * 0.45));
        if (k > -20 && k < 20 && run > 1) dot(k, run, mix(SNOW.shade, INK, 0.12));
      }
      spruce(-16, 14, PLANTS.spruce);
      spruce(10, 20, PLANTS.spruce);
      spruce(17, 12, dim(PLANTS.spruce, 0.1));
      return;
    }
    case 13: {
      // Østensjøvannet: the lake with its bank of reeds, the bird hide on its legs, a swan.
      fill(-26, 52, 3, PALETTE.water);
      for (let k = -26; k < 26; k += 5) dot(k, 2, lit(PALETTE.water, 0.35));
      for (let k = 0; k < 16; k++) fill(-24 + k * 3, 1, 7 + (k % 3) * 2, k % 2 ? PLANTS.hedgeDark : PLANTS.hedge, 3), dot(-24 + k * 3, 8 + (k % 3) * 2, PLANTS.bark);
      block(6, 14, 14, PALETTE.woodDark, 4);
      for (let k = 2; k < 13; k += 3) fill(6 + k, 1, 13, dim(PALETTE.woodDark), 5);
      fill(9, 6, 11, INK, 10);
      for (let k = 0; k < 16; k++) dot(5 + k, 15, k < 8 ? lit(PALETTE.wood) : PALETTE.wood), dot(5 + k, 14, dim(PALETTE.wood));
      fill(7, 1, 3, PALETTE.woodDark), fill(18, 1, 3, PALETTE.woodDark);
      fill(-8, 4, 5, WHITE, 4), fill(-5, 1, 7, WHITE, 5), dot(-5, 8, PALETTE.sailStripe);
      return;
    }
    case 14: {
      // Bjørvika: a tower going up in floors of concrete and glass, its top floors bare; the crane's lattice over it.
      block(-24, 18, 26, lit(STONE.light, 0.15));
      for (let u = 3; u < 24; u += 5) fill(-23, 16, u, STONE.base, u);
      for (let u = 4; u < 17; u += 5) for (let k = -22; k < -8; k += 3) pane(k, 2, u + 2, mix(GLASS_DARK, WHITE, 0.35), u);
      for (const k of [-24, -16, -8]) fill(k, 1, 32, STONE.base, 26);
      // The crane's mast to the right of the rune stone, its lattice; the jib over the tower, its hook down to a beam.
      for (let u = 1; u <= 40; u++) {
        dot(10, u, lit(MAP_CRANE, 0.2));
        dot(13, u, dim(MAP_CRANE, 0.2));
        dot(11 + (u % 2), u, (u >> 1) % 2 ? dim(MAP_CRANE, 0.35) : MAP_CRANE);
      }
      for (let k = -14; k < 26; k++) dot(k, 42, MAP_CRANE), dot(k, 41, (k & 1) ? dim(MAP_CRANE, 0.35) : MAP_CRANE);
      fill(-10, 1, 40, METAL.wire, 26);
      fill(-12, 5, 26, METAL.lampPost, 25);
      fill(20, 6, 41, dim(MAP_CRANE, 0.4), 38);
      return;
    }
    default: {
      // Gamlebyen: a ruined church's arches, the stone of a thousand years in courses, grass along their tops.
      fill(-26, 52, 3, mix(STONE.base, PALETTE.grass, 0.5));
      for (const [dx, h] of [[-20, 24], [-8, 30], [4, 26], [16, 18]] as const) {
        block(dx, 5, h, STONE.base);
        courses(dx, 5, h, STONE.dark, 3);
        fill(dx, 5, h + 1, mix(STONE.moss, PALETTE.grass, 0.4), h + 1);
      }
      for (const dx of [-15, -3, 9]) for (let k = 0; k < 7; k++) {
        const u = 20 + Math.round(Math.sin((k / 6) * Math.PI) * 4);
        dot(dx + k, u, STONE.light);
        dot(dx + k, u - 1, STONE.base);
        dot(dx + k, u - 2, STONE.dark);
      }
    }
  }
}
/** Windows seen from the map, dark glass. */
const GLASS_DARK = "#3a4650";

/** The burial mound around the door Jernhaugen: turf over a stone doorway, standing stones on top. */
function mound(door: Door | undefined, snow: boolean) {
  if (!door) return;
  const cx = door.x + door.w / 2;
  for (let dx = -54; dx <= 54; dx++) {
    const h = Math.round(46 * Math.exp(-((dx / 34) ** 2)));
    if (h < 2) continue;
    const x = cx + dx;
    R(x, DIP - h, 1, h, snow ? mix(PALETTE.grass, SNOW.lying, 0.7) : PALETTE.grass);
    R(x, DIP - h, 1, 2, snow ? SNOW.lying : mix(PALETTE.grass, WHITE, 0.15));
    if (!snow && (x * 7919) % 23 < 4) R(x, DIP - h + 3 + ((x * 13) % 9), 1, 2, PALETTE.grassDark);
  }
  for (const [dx, h] of [[-8, 9], [2, 11], [12, 8]] as const) {
    R(cx + dx, DIP - 46 - h + 2, 4, h, PALETTE.rock);
    R(cx + dx, DIP - 46 - h + 2, 1, h, mix(PALETTE.rock, WHITE, 0.25));
  }
  const top = door.bottom - door.h;
  const edge = mix(PALETTE.rockDark, INK, 0.4);
  R(door.x - 7, top - 3, 5, door.h + 3, edge);
  R(door.x - 6, top - 3, 3, door.h + 3, PALETTE.rock);
  R(door.x + door.w + 2, top - 3, 5, door.h + 3, edge);
  R(door.x + door.w + 3, top - 3, 3, door.h + 3, PALETTE.rock);
  R(door.x - 9, top - 6, door.w + 18, 6, edge);
  R(door.x - 8, top - 5, door.w + 16, 4, PALETTE.rock);
  plankDoor(door, DOORWAY.wood);
}

/** The waffle mark: a small heart of waffle, for a level cleared without losing a heart. */
function waffle(x: number, y: number) {
  const rows = [".ww.ww.", "wwwwwww", "wwwwwww", ".wwwww.", "..www..", "...w..."];
  rows.forEach((row, r) => [...row].forEach((ch, c) => ch === "w" && R(x + c, y + r, 1, 1, (c + r) % 2 ? FOOD.waffleDough : FOOD.waffleCrust)));
}

/** Drawn faint (line 2 before it opens): at under half strength, so the map shows where it will go. */
function faintly(on: boolean, draw: () => void) {
  if (!on) return draw();
  const g = ctx();
  const a = g.globalAlpha;
  g.globalAlpha = a * 0.4;
  draw();
  g.globalAlpha = a;
}

/**
 * A padlock on a closed station's face (order 41: closed was told from open by its greyer frame and face alone, colour only): its
 * shackle in iron lit on the left, its body dark iron lit along its top with a keyhole, 6 x 6 on the 8 x 6 face.
 */
const LOCK = ["..ss..", ".s..S.", "bLLLLb", "bbkbbb", "bbkbbb", "dddddd"];
const LOCK_INK: Record<string, string> = { s: mix(METAL.lampHat, WHITE, 0.35), S: METAL.lampHat, b: METAL.castIron, L: mix(METAL.castIron, WHITE, 0.3), k: mix(WHITE, STONE.base, 0.4), d: mix(METAL.castIron, INK, 0.5) };

/** The station on the line: a white square in a frame of its line's colour, as on a metro map; grey while closed, with a padlock on it. */
function stationMark(i: number, open: boolean) {
  const x = stationX(i);
  const frame = open ? (LINE[i].line === 2 ? LINE_2_COLOR : HAT_RED) : mix(LINE[i].line === 2 ? LINE_2_COLOR : HAT_RED, INK, 0.4);
  const white = open ? WHITE : mix(WHITE, STONE.base, 0.6);
  // Its frame enamelled (order 28): lit along its top and left, shaded along its bottom and right, the white face's inner
  // edge in the frame's shadow. Stortinget is where line 2 leaves: an orange bar across the foot of its square.
  const two = ORDER[i] === "stortinget";
  drawProp(
    custom(`kart station ${frame} ${two ? 1 : 0}${open ? "" : " locked"}`, 12, 10, (px, py) => {
      if (px >= 2 && px < 10 && py >= 2 && py < 8) {
        const lock = open ? "." : LOCK[py - 2][px - 3] ?? ".";
        if (lock !== ".") return LOCK_INK[lock];
        if (two && py >= 6) return LINE_2_COLOR;
        return px === 2 || py === 2 ? mix(white, STONE.base, 0.25) : white;
      }
      if ((px === 0 && py === 0) || (px === 11 && py === 9)) return mix(frame, INK, 0.15);
      return py === 0 || px === 0 ? mix(frame, WHITE, 0.3) : py === 9 || px === 11 ? mix(frame, INK, 0.3) : frame;
    }),
    x - 6,
    LINE_Y - 2,
    12
  );
}

/** The gate across line 2 while it is closed: boards up to the sky, braces, a warning stripe. */
function gate() {
  const x = GATE_COL * TILE;
  R(x - 2, 0, TILE + 4, LINE_Y, PAINT.hoarding);
  for (let y = 0; y < LINE_Y; y += 8) R(x - 2, y, TILE + 4, 1, PAINT.hoardingLine);
  R(x - 2, 0, 1, LINE_Y, INK);
  R(x + TILE + 1, 0, 1, LINE_Y, INK);
  for (let y = LINE_Y - 24; y < LINE_Y - 16; y++) for (let k = 0; k < TILE + 4; k++) if (((k + y) >> 2) % 2 === 0) R(x - 2 + k, y, 1, 1, HAT_RED);
}

/** The viaducts under the lines: concrete piers every three tiles, the far city seen between them (as far as the map goes: past the longship to the encore's stop once every rune is held). */
function viaduct(cols = KART_COLS) {
  // Its piers go down into the water out of sight, however tall the screen (order 28): white concrete lit on the left,
  // the formwork's joints, a bracket under the deck, darker and wet where the water reaches, and under the water's surface
  // the fjord's own green-blue over them, deeper and deeper, so they stand in it and do not float on it.
  const water = LINE_Y + 2 * TILE + 8;
  for (let x = 2 * TILE; x < cols * TILE; x += 3 * TILE) {
    if (x > 8 * TILE && x < 18 * TILE) continue;
    drawProp(custom("kart bracket", 12, 4, bracketCell), x - 2, LINE_Y + 11, 12);
    leg(x, LINE_Y + 15, water, 8, CONCRETE, 3);
    drawProp(custom("kart pier under", 8, 1200, underCell), x, water, 8);
  }
}
const bracketCell = (px: number, py: number) => {
  const w = 12 - py * 2 + (py === 0 ? 0 : 2);
  const x0 = (12 - w) / 2;
  if (px < x0 || px >= x0 + w) return null;
  return py === 0 ? mix(FACADE.marbleSeam, INK, 0.2) : px === x0 ? mix(FACADE.marbleWall, WHITE, 0.55) : px === x0 + w - 1 ? FACADE.marbleSeam : FACADE.marbleWall;
};
const underCell = (px: number, py: number) => {
  const deep = Math.min(0.9, 0.5 + py / 120);
  const c = px < 2 ? mix(FACADE.marbleWall, WHITE, 0.55) : px >= 6 ? FACADE.marbleSeam : FACADE.marbleWall;
  // A ripple's light now and then where the surface moves over it.
  if (py < 24 && px > 0 && px < 7 && (px * 5 + py * 3) % 11 === 0) return mix(PALETTE.foam, PALETTE.water, 0.4);
  return mix(c, py > 60 ? PALETTE.waterDeep : PALETTE.water, deep);
};

/**
 * Line 2's track out of Stortinget: it leaves line 1's deck just past Stortinget's board, goes down
 * to a low deck over the water, runs under line 1 past Ekeberg and Nabolaget, and comes up to the
 * level of its own viaduct beside line 1's end.
 */
function lowTrack() {
  const down = LEAVE + 10;
  const up = JOIN - 24;
  for (let x = LEAVE; x < JOIN; x++) {
    const y = x < down ? LINE_Y + 11 + Math.round(((x - LEAVE) / (down - LEAVE)) * (LOW - LINE_Y - 11)) : x < up ? LOW : LOW - Math.round(((x - up) / (JOIN - up)) * (LOW - LINE_Y - 11));
    R(x, y, 1, 4, LINE_2_COLOR);
    R(x, y, 1, 1, mix(LINE_2_COLOR, WHITE, 0.35));
    R(x, y + 4, 1, 2, mix(FACADE.marbleWall, WHITE, 0.3));
    R(x, y + 6, 1, 1, FACADE.marbleSeam);
    // Short legs into the water every two tiles along the low deck.
    if (x >= down && x < up && (x - down) % 32 < 2) R(x, y + 7, 1, LINE_Y + 2 * TILE + 4 - y - 7, FACADE.marbleSeam);
  }
}

/** The line crosses the dip on a light bridge in the back; the branch runs down to the mound and up again, and earth fills under it. */
function branch() {
  for (let x = 9 * TILE; x < 18 * TILE; x++) {
    R(x, LINE_Y, 1, 4, mix(HAT_RED, WHITE, 0.45));
    R(x, LINE_Y + 4, 1, 2, mix(FACADE.marbleWall, WHITE, 0.4));
    if ((x - 9 * TILE) % 24 < 2) R(x, LINE_Y + 6, 1, DIP - LINE_Y - 30, mix(FACADE.marbleSeam, WHITE, 0.4));
    const s = rampHeight([DOWN, UP], x);
    const y = s === null ? DIP : Math.round(s);
    if (s !== null) R(x, y + 4, 1, 16 * TILE - y - 4, PALETTE.earth);
    R(x, y, 1, 4, HAT_RED);
    R(x, y, 1, 1, mix(HAT_RED, WHITE, 0.3));
  }
}

/** Line 2's deck, for him to walk along: an orange band on concrete, as line 1's is red. */
function deck(x: number, y: number, c = LINE_2_COLOR) {
  drawProp(custom(`kart deck ${c}`, TILE, 11, (px, py) => deckCell(c, px, py)), x, y, TILE);
}
/**
 * A tile of a line's deck (order 28): the line's colour in a band lit along its top and shaded under, a joint between
 * sections and two bolts in each; under it the concrete in the band's shadow, the formwork's joint, its seam.
 */
function deckCell(c: string, px: number, py: number) {
  if (py === 0) return px === 0 ? mix(c, WHITE, 0.2) : mix(c, WHITE, 0.35);
  if (py < 5) return px === 0 ? mix(c, INK, 0.25) : (px === 4 || px === 12) && py === 2 ? mix(c, INK, 0.3) : (px === 5 || px === 13) && py === 2 ? mix(c, WHITE, 0.2) : c;
  if (py === 5) return mix(c, INK, 0.3);
  if (py === 6) return mix(FACADE.marbleWall, INK, 0.12);
  if (py === 10) return FACADE.marbleSeam;
  return px === 8 ? FACADE.marbleSeam : FACADE.marbleWall;
}

/** The stone's dashed outline and faint carving while its level is not cleared: an empty slot, as in the header. */
const SLOT = "rgba(31, 26, 23, 0.5)";
const SLOT_RUNE = "rgba(31, 26, 23, 0.16)";
const SLOT_NIGHT = "rgba(220, 228, 255, 0.45)";

/**
 * A station's rune stone, 16 x 16 from (x, y), in the header's language (order 18): cleared, a gold tile
 * with the rune dark on it and a tick at its corner, lit after dark; not yet, an empty slot, a faint dashed
 * outline with the rune barely there.
 */
function runeStone(x: number, y: number, char: RuneChar, cleared: boolean) {
  const cells = runeCells(char, 9, 11);
  if (!cleared) {
    // Its dashes are dark by day and stay pale after dark, so the empty slot is seen as one in any sky.
    for (let k = 1; k < 15; k += 2)
      for (const [dx, dy] of [[k, 0], [k, 15], [0, k], [15, k]]) {
        R(x + dx, y + dy, 1, 1, SLOT);
        light(x + dx, y + dy, 1, 1, "window", SLOT_NIGHT);
      }
    cells.forEach((row, ry) => row.forEach((on, rx) => on && R(x + 4 + rx, y + 3 + ry, 1, 1, SLOT_RUNE)));
    return;
  }
  R(x + 1, y, 14, 16, COIN.goldDark);
  R(x, y + 1, 16, 14, COIN.goldDark);
  R(x + 1, y + 1, 14, 14, COIN.gold);
  R(x + 1, y + 1, 14, 1, COIN.goldLight);
  R(x + 1, y + 1, 1, 14, COIN.goldLight);
  cells.forEach((row, ry) => row.forEach((on, rx) => on && R(x + 4 + rx, y + 3 + ry, 1, 1, INK)));
  // The tick: a dark disc over the top right corner with a pale check in it.
  drawTick(x + 11, y - 3);
  // After dark its frame glows; the rune and the tick stay dark on it.
  for (const [lx, ly, lw, lh] of [[x + 1, y, 14, 1], [x + 1, y + 15, 14, 1], [x, y + 1, 1, 14], [x + 15, y + 1, 1, 14]]) light(lx, ly, lw, lh, "soft");
}

/** The mirror ball's bracket: a post up from the rune stone's corner and an arm out over the ball, iron lit on top and on its left. */
const ballBracket = (px: number, py: number) => {
  if (px === 0 || px === 1) return py >= 1 ? (px === 0 ? mix(METAL.lampHat, WHITE, 0.2) : METAL.castIron) : null;
  if (py === 1) return px === 8 ? METAL.castIron : mix(METAL.lampHat, WHITE, 0.2);
  if (py === 2 && px > 1 && px < 8) return METAL.castIron;
  if (py === 3 && px === 2) return METAL.castIron;
  return null;
};

/** Behind a station: its place's skyline, and its rune stone above it: gold with a tick once the level is cleared. */
function stationBack(i: number, cleared: boolean, clean: boolean, t: number) {
  const x = stationX(i);
  skyline(i, x, LINE_Y);
  runeStone(x - 8, LINE_Y - 46, RUNE_CHARS[LINE[i].rune] as RuneChar, cleared);
  // Still under the glamour (order 27): a mirror ball turning over its stone; a cleared station is plain Oslo again.
  if (!cleared) {
    // Hung from a bracket the invaders clamped to the stone's corner (order 28), so it hangs from something.
    drawProp(custom("kart ball bracket", 9, 9, ballBracket), x + 6, LINE_Y - 54, 9);
    mirrorBall(x + 13, LINE_Y - 40, t, 7);
  }
  if (clean) waffle(x + 9, LINE_Y - 37);
}

/**
 * Both lines done: a longship lies at anchor at the end of the line, past the last station's boards and
 * under the end of the viaduct, in view where he stands after the last level: its hull with a row of shields, a carved dragon at
 * the prow and a curl at the stern, its striped sail set on the yard, a lantern at the stern lit after
 * dusk, and its reflection in the fjord. It stays; it is the game's last picture.
 */
function longship(v: View) {
  // Past the last station's boards, below them, and to the right of the help line on a wide screen.
  const w = 48;
  const x = KART_COLS * TILE - w - 12;
  const y = LINE_Y + 4 * TILE + 2;
  const bob = view.reduced ? 0 : Math.round(Math.sin(v.t * 0.04));
  const yy = y + bob;
  const wood = PALETTE.woodDark;
  // Its reflection, broken by the water.
  for (let k = 0; k < 5; k++) R(x + 4 + ((k * 7) % 9), y + 9 + k * 3, w - 8 - k * 6, 1, mix(PALETTE.water, wood, 0.35));
  // The hull: a long low curve, the strakes along it, the stem and the sternpost rising at the ends.
  for (let i = 0; i < w; i++) {
    const f = i / (w - 1);
    const rise = Math.round(5 * (Math.abs(f - 0.5) * 2) ** 3);
    R(x + i, yy - rise, 1, 7 + rise - Math.round(4 * (Math.abs(f - 0.5) * 2) ** 2), wood);
    R(x + i, yy - rise, 1, 1, mix(wood, WHITE, 0.25));
    R(x + i, yy + 3 - Math.round(rise / 2), 1, 1, mix(wood, INK, 0.35));
  }
  // The dragon at the prow (to the right, out to sea) and the curl of the stern.
  for (let k = 0; k < 12; k++) R(x + w - 1 + Math.round(Math.sin((k / 12) * Math.PI * 0.5) * 4), yy - 5 - k, 2, 1, PALETTE.wood);
  R(x + w + 2, yy - 18, 6, 3, PALETTE.wood);
  R(x + w + 6, yy - 17, 3, 2, PALETTE.wood);
  R(x + w + 4, yy - 17, 1, 1, HAT_RED);
  R(x + w + 7, yy - 15, 2, 1, HAT_RED);
  for (let k = 0; k < 9; k++) R(x - 1 - Math.round(Math.sin((k / 9) * Math.PI * 0.6) * 3), yy - 5 - k, 2, 1, PALETTE.wood);
  R(x - 5, yy - 15, 3, 3, PALETTE.wood);
  // Shields along its side, red and white.
  for (let k = 6; k < w - 6; k += 6) {
    R(x + k, yy - 1, 5, 4, k % 12 ? HAT_RED : PALETTE.sail);
    R(x + k + 2, yy, 1, 1, PALETTE.ironDark);
  }
  // The mast, the yard, the sail with its stripes.
  R(x + w / 2 - 1, yy - 30, 2, 30, wood);
  R(x + 12, yy - 29, w - 24, 2, wood);
  for (let r = 0; r < 18; r++) for (let c = 0; c < w - 26; c += 4) R(x + 13 + c, yy - 27 + r, 4, 1, (c / 4) % 2 ? PALETTE.sailStripe : PALETTE.sail);
  // A lantern at the stern, lit after dusk.
  R(x + 2, yy - 13, 1, 6, METAL.lampPost);
  R(x + 1, yy - 15, 3, 3, METAL.brass);
  light(x + 1, yy - 15, 3, 3, "lamp");
}

/** Both lines done: lanterns along both viaducts, lit after dusk (on to the encore's stop). */
function lanterns(v: View) {
  for (let x = 3 * TILE; x < ENCORE_COLS * TILE; x += 3 * TILE) {
    if (x > 8 * TILE && x < 18 * TILE) continue;
    R(x, LINE_Y - 7, 1, 7, METAL.lampPost);
    R(x - 1, LINE_Y - 9, 3, 2, METAL.brass);
    light(x - 1, LINE_Y - 9, 3, 2, "lamp");
  }
  void v;
}

/**
 * The encore's stop (order 29, ADR 0052), past the longship at the end of line 2, once every rune of both lines is held: a
 * small festival stage on a pontoon in Middelalderparken's water mirror, the park's trees behind it, its black roof on two
 * towers of truss, a speaker stack at each side; under the glamour a mirror ball turning under its roof and the neon round
 * its mouth, plain once the encore has been seen. No rune stone: it gives none.
 */
const STAGE_W = 60;
const STAGE_H = 52;
function encoreStop(seen: boolean, t: number) {
  const x = ENCORE_COL * TILE + TILE / 2;
  drawProp(custom(`kart encore ${seen ? 1 : 0}`, STAGE_W, STAGE_H, encoreCell(seen)), x - STAGE_W / 2, LINE_Y - STAGE_H, STAGE_W);
  if (seen) return;
  mirrorBall(x, LINE_Y - 36, t);
  // After dark its neon keeps its light, with a soft glow of its first neon round the tubes, as an invader's (order 30,
  // `glows` in `alive/glamour.ts`: one neon, the shape grown by three, four and five pixels, a fifth of it each); the tubes over it.
  const nx = x - STAGE_W / 2 + 10;
  const ny = LINE_Y - STAGE_H + 21;
  for (const by of [3, 4, 5]) light(nx - by, ny - by, 40 + 2 * by, 3 + 2 * by, "window", "rgba(255, 45, 149, 0.2)");
  light(nx, ny, 40, 1, "window", ENEMY.hotPink);
  light(nx, ny + 2, 40, 1, "window", ENEMY.lime);
}
function encoreCell(seen: boolean) {
  let a: (string | null)[] | null = null;
  return (px: number, py: number) => {
    if (!a) {
      a = new Array<string | null>(STAGE_W * STAGE_H).fill(null);
      const g = a;
      const dot = (x: number, y: number, c: string) => x >= 0 && y >= 0 && x < STAGE_W && y < STAGE_H && (g[y * STAGE_W + x] = c);
      const fill = (x: number, y: number, w: number, h: number, c: string) => {
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dot(x + i, y + j, c);
      };
      // The park's trees behind it: round crowns, lit on the left.
      for (const [cx, cy, r] of [[8, 18, 9], [50, 16, 10], [30, 10, 8]] as const)
        for (let j = -r; j <= r; j++)
          for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) dot(cx + i, cy + j, i + j < -r / 2 ? PLANTS.leavesShine : i > r / 3 ? dim(PLANTS.leaves, 0.2) : PLANTS.leaves);
      // The roof: black canvas, its edge lit; the two truss towers; the backdrop.
      const top = 16;
      fill(8, top, 44, 4, "#16131a");
      fill(8, top, 44, 1, "#2e2a33");
      fill(10, top + 4, 40, STAGE_H - top - 12, "#1c1920");
      for (const tx of [7, 50]) for (let y = top; y < STAGE_H - 8; y++) {
        dot(tx, y, METAL.rail);
        dot(tx + 2, y, METAL.pipe);
        dot(tx + 1, y, y % 4 < 2 ? METAL.rail : METAL.pipe);
      }
      // The neon round its mouth under the glamour; plain, its lights warm white.
      if (!seen) {
        fill(10, top + 5, 40, 1, ENEMY.hotPink);
        fill(10, top + 7, 40, 1, ENEMY.lime);
      } else for (let k = 0; k < 5; k++) dot(14 + k * 8, top + 5, "#fff4dc");
      // Speaker stacks at the sides, black with grilles.
      for (const sx of [11, 42]) {
        fill(sx, STAGE_H - 22, 7, 14, "#141216");
        for (let y = STAGE_H - 20; y < STAGE_H - 9; y += 2) fill(sx + 1, y, 5, 1, "#2c2a30");
      }
      // The deck, and the pontoon under it in the water.
      fill(6, STAGE_H - 8, 48, 2, "#29252b");
      fill(6, STAGE_H - 8, 48, 1, "#36313a");
      fill(8, STAGE_H - 6, 44, 4, mix("#4a4e58", PALETTE.water, 0.4));
      fill(4, STAGE_H - 2, 52, 2, mix(PALETTE.water, PALETTE.foam, 0.25));
    }
    return a[py * STAGE_W + px];
  };
}
/** Its station mark: the line's white square in line 2's frame, as every stop has. */
function encoreMark() {
  const x = ENCORE_COL * TILE + TILE / 2;
  drawProp(
    custom(`kart station ${LINE_2_COLOR} 0`, 12, 10, (px, py) => {
      if (px >= 2 && px < 10 && py >= 2 && py < 8) return px === 2 || py === 2 ? mix(WHITE, STONE.base, 0.25) : WHITE;
      if ((px === 0 && py === 0) || (px === 11 && py === 9)) return mix(LINE_2_COLOR, INK, 0.15);
      return py === 0 || px === 0 ? mix(LINE_2_COLOR, WHITE, 0.3) : py === 9 || px === 11 ? mix(LINE_2_COLOR, INK, 0.3) : LINE_2_COLOR;
    }),
    x - 6,
    LINE_Y - 2,
    12
  );
}

export function kartArt(progress: Progress, open: boolean): Art {
  /** Both lines, all sixteen runes: the map gains its longship and its lanterns. */
  const complete = ORDER.every((id) => progress.cleared.includes(id));
  /** The encore seen (order 29): it has a best time; its stage is plain on the map from then on. */
  const seen = progress.best.encore !== undefined;
  const cleared = (i: number) => progress.cleared.includes(ORDER[i]);
  const two = (i: number) => LINE[i].line === 2;
  return {
    far: (v) => drawOsloHills(v.sky, LINE_Y + 2 * TILE),
    mid(v) {
      drawFjord(v.t, LINE_Y + 2 * TILE);
      // The fjord goes on down under the viaduct, however tall the screen.
      // In bands growing darker as it goes down (order 28), a band a rectangle, with the light of a wave here and there.
      const top = LINE_Y + 2 * TILE + 8;
      for (let k = 0; k < 8; k++) box(0, top + k * 12, view.w, 12, mix(PALETTE.water, PALETTE.waterDeep, k * 0.12));
      box(0, top + 96, view.w, 1200 - 96, mix(PALETTE.water, PALETTE.waterDeep, 0.95));
      for (let k = 0; k < 24; k++) {
        const wx = (k * 173) % (KART_COLS * TILE);
        const sx = Math.round(wx - view.camX * 0.2) % (view.w + 40);
        const yy = top + 4 + ((k * 37) % 80);
        box(sx < -20 ? sx + view.w + 40 : sx, yy, 4 + (k % 3) * 2, 1, mix(PALETTE.water, PALETTE.foam, 0.35 - Math.min(0.25, (yy - top) / 400)));
      }
    },
    back(v) {
      const home = v.doors.get("home");
      if (home) {
        // The stage tower's cladding round the door Hjem (order 28): lit on its left, shaded on its right, its dotted
        // panels; the door of dark steel, lit along its edge, a push bar, its brass handle.
        const w = home.w + 12;
        const h = home.h + 10;
        drawProp(
          custom(`kart hjem ${home.w} ${home.h} ${home.open ? 1 : 0}`, w, h, (px, py) => {
            const dx = px - 6;
            const dy = py - 10;
            if (dx >= 0 && dx < home.w && dy >= 0) {
              if (home.open) return dy < 2 ? mix(DOORWAY.stage, INK, 0.3) : DOORWAY.stage;
              if (dx === 0) return mix(FACADE.stageDoor, WHITE, 0.2);
              if (dx === home.w - 1) return mix(FACADE.stageDoor, INK, 0.3);
              if (dy === home.h - 16 && dx > 1 && dx < home.w - 2) return mix(FACADE.stageDoor, WHITE, 0.12);
              if (dx >= home.w - 4 && dx < home.w - 2 && (dy === home.h - 16 || dy === home.h - 15)) return dy === home.h - 16 ? mix(METAL.brass, WHITE, 0.3) : METAL.brass;
              return FACADE.stageDoor;
            }
            if (dx >= -1 && dx <= home.w && dy >= -1) return FACADE.stageTowerDot;
            if (px === 0) return mix(FACADE.stageTower, WHITE, 0.4);
            if (px === w - 1) return FACADE.stageTowerTop;
            if (py === 0) return mix(FACADE.stageTower, WHITE, 0.4);
            return py >= 4 && py % 4 === 0 && (px + (py / 4) % 2 * 2) % 4 === 2 ? FACADE.stageTowerDot : py % 12 === 11 ? FACADE.stageTowerTop : FACADE.stageTower;
          }),
          home.x - 6,
          home.bottom - home.h - 10,
          w
        );
      }
      viaduct(complete ? ENCORE_COLS : KART_COLS);
      if (complete) longship(v);
      if (complete) encoreStop(seen, v.t);
      faintly(!open, lowTrack);
      mound(v.doors.get("maze"), v.sky.snow);
      branch();
      LINE.forEach((l, i) => {
        if (!two(i)) stationBack(i, cleared(i), progress.clean.includes(l.id), v.t);
        else faintly(!open, () => stationBack(i, cleared(i), progress.clean.includes(l.id), v.t));
      });
      if (!open) gate();
    },
    front(v) {
      if (complete) lanterns(v);
      if (complete) encoreMark();
      LINE.forEach((_l, i) => {
        if (two(i)) faintly(!open, () => stationMark(i, open && isOpen(progress, ORDER, i)));
        else stationMark(i, isOpen(progress, ORDER, i));
      });
    },
    tile(t, _c, _r, x, y) {
      // Line 1's deck is the shared letter's (`render/tiles.ts`), drawn here in the same colours with its joints (order 28).
      if (t === "L") return deck(x, y, HAT_RED), true;
      if (t !== "O") return false;
      faintly(!open, () => deck(x, y));
      return true;
    },
    ground: () => ({ top: PALETTE.grass, dot: PALETTE.grassDark, fill: PALETTE.earth }),
    ledges: {}
  };
}

/** The line map's words, in both languages: they come with its look, so the first script does not carry them (order 18). */
export const KART_WORDS = {
  nb: {
    lineSub: "Linje 1, ti stopp",
    lineSubBoth: "Linje 1 og 2, seksten stopp",
    /** The line map's board at the end of a line all cleared: its best times added up. */
    lineTime: (n: number, time: string) => `Linje ${n} ${time}`,
    closed: (before: string) => `Stengt til du har klart ${before}.`,
    moundNoFeather: ["Det sies at haugbonden har en ravnefjær.", "Gullet henger høyt uten den."],
    featherLine: "Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta."
  },
  en: {
    lineSub: "Line 1, ten stops",
    lineSubBoth: "Lines 1 and 2, sixteen stops",
    lineTime: (n: number, time: string) => `Line ${n} ${time}`,
    closed: (before: string) => `Closed until ${before} is done.`,
    moundNoFeather: ["They say the mound-dweller keeps a raven's feather.", "The gold hangs high without it."],
    featherLine: "The mound-dweller yields. The raven's feather is yours: jump once more in mid-air."
  }
};
