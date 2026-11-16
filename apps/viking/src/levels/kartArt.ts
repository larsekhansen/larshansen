import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "@larshansen/pixelkit/doors";
import { column } from "@larshansen/pixelkit/backdrop";
import { R, ctx, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, COIN, DOORWAY, FACADE, FLAG, FOOD, HAT_RED, INK, LAND, METAL, PAINT, PALETTE, PLANTS, SNOW, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { plankDoor } from "@larshansen/pixelkit/props";
import { rampHeight } from "@larshansen/pixelkit/tilemap";
import { drawFjord, drawOsloHills } from "../render/backdrop";
import { drawTick } from "../render/actors";
import { RUNE_CHARS, runeCells, type RuneChar } from "../game/runes";
import { isOpen, type Progress } from "../game/progress";
import { LINE, ORDER } from "./index";
import { DIP, DOWN, GATE_COL, KART_COLS, LINE_1_END, LINE_Y, STORY_SIGN, UP, stationX } from "./kart";
import type { Art, View } from "./types";
import { STORY } from "../game/story";
import { mirrorBall } from "../alive/invasion";

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

/** A low skyline of each place behind its station: a few shapes taken from its level. */
function skyline(i: number, x: number, g: number) {
  const s = (dx: number, w: number, h: number, c: string) => R(x + dx, g - h, w, h, c);
  switch (i) {
    case 0: // Langkaia: the Opera's white slope, its stage tower, the Barcode behind
      for (let k = 0; k < 7; k++) s(-30 + k * 6, 4, 30 + (k % 3) * 8, k % 2 ? FACADE.stageDoor : FACADE.libraryTop);
      for (let k = 0; k < 28; k++) s(-14 + k, 1, Math.round(k * 0.5) + 2, FACADE.marble);
      s(-20, 10, 20, FACADE.stageTower);
      return;
    case 1: // Akershus: a wall and a copper spire
      s(-22, 44, 12, STONE.base);
      s(-6, 12, 22, STONE.light);
      for (let k = 0; k < 8; k++) R(x - 6 + k, g - 22 - (8 - Math.abs(k * 2 - 7)) * 2, 1, (8 - Math.abs(k * 2 - 7)) * 2, METAL.copper);
      return;
    case 2: // Rådhuset: two brick towers
      s(-20, 12, 34, BRICK.red);
      s(8, 12, 36, BRICK.red);
      s(-8, 16, 16, BRICK.course);
      s(10, 6, 6, PAINT.trim);
      return;
    case 3: // Slottet: the palace, pale yellow, a flag on top
      s(-20, 40, 18, FACADE.palace);
      s(-2, 1, 28, METAL.flagpole);
      // Norway's flag, 7 x 5 (order 26, section 3b: it was a red patch): the white cross, the blue in it, nearer the pole.
      R(x - 1, g - 28, 7, 5, FLAG.red);
      R(x, g - 28, 3, 5, FLAG.white);
      R(x - 1, g - 27, 7, 3, FLAG.white);
      R(x + 1, g - 28, 1, 5, FLAG.blue);
      R(x - 1, g - 26, 7, 1, FLAG.blue);
      return;
    case 4: // Holmenkollen: the ski jump
      for (let k = 0; k < 30; k++) s(-14 + k, 1, Math.max(2, 34 - k), k < 3 ? STONE.light : mix(FACADE.stageTower, INK, 0.1));
      return;
    case 5: // Akerselva: a waterfall and an old mill
      s(-18, 16, 18, BRICK.red);
      s(0, 6, 14, PALETTE.water);
      s(0, 6, 2, PALETTE.foam);
      return;
    case 6: // Nordmarka: spruce
      for (const [dx, h] of [[-14, 20], [-4, 28], [7, 22]] as const) for (let k = 0; k < h; k++) R(x + dx - (Math.floor(k / 3) % 4), g - h + k, (Math.floor(k / 3) % 4) * 2 + 1, 1, PLANTS.spruce);
      return;
    case 7: // Stortinget: yellow brick and a round hall
      s(-20, 40, 16, FACADE.storting);
      s(-6, 12, 22, FACADE.stortingDark);
      return;
    case 8: // Ekeberg: the hill
      for (let k = -22; k < 22; k++) s(k, 1, Math.round(24 * Math.exp(-((k / 14) ** 2))), LAND.forest);
      return;
    case 9: // Nabolaget: small wooden houses
      s(-18, 12, 12, PAINT.mint);
      s(-4, 12, 14, PAINT.ochre);
      s(10, 10, 11, PAINT.red);
      return;
    case 10: // Bygdøy: the polar ship's hall, a tall A of a roof, and a longship's dragon prow beside it
      for (let k = 0; k < 18; k++) s(-22 + k, 1, k * 2 + 2, k % 6 === 5 ? PAINT.trim : mix(PAINT.trim, STONE.base, 0.35));
      for (let k = 0; k < 18; k++) s(-4 + k, 1, 36 - k * 2, k % 6 === 0 ? PAINT.trim : mix(PAINT.trim, STONE.base, 0.35));
      s(-12, 12, 10, mix(PALETTE.water, WHITE, 0.3));
      s(14, 16, 6, PALETTE.woodDark);
      s(26, 3, 14, PALETTE.woodDark);
      R(x + 26, g - 16, 5, 3, PALETTE.wood);
      return;
    case 11: // Vigelandsparken: the monolith on its steps, a tree each side
      s(-18, 36, 3, STONE.light);
      s(-12, 24, 3, STONE.base);
      for (let k = 0; k < 30; k++) R(x - 3 + ((k * 7) % 3 === 0 ? 0 : 1), g - 6 - k, 6, 1, k % 4 === 0 ? STONE.light : mix(STONE.light, WHITE, 0.25));
      R(x - 2, g - 38, 4, 2, mix(STONE.light, WHITE, 0.25));
      for (const dx of [-22, 18]) {
        s(dx + 1, 2, 8, PLANTS.bark);
        for (let k = 0; k < 7; k++) R(x + dx - 3 + Math.abs(k - 3), g - 18 + k, 10 - Math.abs(k - 3) * 2, 1, PLANTS.leaves);
      }
      return;
    case 12: // Korketrekkeren: the hill, the run winding down it, spruce
      for (let k = -24; k < 24; k++) s(k, 1, Math.round(22 * Math.exp(-((k / 18) ** 2))), mix(LAND.forest, WHITE, 0.15));
      for (let k = -18; k < 18; k++) R(x + k, g - Math.round(22 * Math.exp(-((k / 18) ** 2))) + 3 + Math.round(3 * Math.sin(k * 0.45)), 1, 1, SNOW.lying);
      for (const dx of [-14, 9]) for (let k = 0; k < 10; k++) R(x + dx - (Math.floor(k / 3) % 3), g - 30 + k, (Math.floor(k / 3) % 3) * 2 + 1, 1, PLANTS.spruce);
      return;
    case 13: // Østensjøvannet: the lake, reeds, a bird hide on its legs
      s(-22, 44, 3, PALETTE.water);
      for (let k = 0; k < 14; k++) R(x - 20 + k * 3, g - 7 - (k % 3) * 2, 1, 7 + (k % 3) * 2, k % 2 ? PLANTS.hedgeDark : PLANTS.hedge);
      s(6, 14, 12, PALETTE.woodDark);
      R(x + 5, g - 14, 16, 2, PALETTE.wood);
      R(x + 9, g - 10, 6, 2, INK);
      R(x - 6, g - 5, 4, 2, WHITE);
      R(x - 3, g - 8, 1, 3, WHITE);
      return;
    case 14: // Bjørvika: a tower crane over a tower half built
      s(-20, 16, 22, mix(STONE.light, WHITE, 0.2));
      for (let y = g - 20; y < g; y += 5) R(x - 20, y, 16, 1, STONE.base);
      for (let k = 0; k < 36; k++) R(x + 6 + (k % 2), g - k, 1, 1, MAP_CRANE);
      R(x + 5, g - 36, 4, 36, mix(MAP_CRANE, WHITE, 0.0));
      for (let y = g - 34; y < g; y += 4) R(x + 6, y, 2, 1, mix(MAP_CRANE, INK, 0.35));
      R(x - 14, g - 38, 34, 2, MAP_CRANE);
      R(x - 10, g - 36, 1, 14, METAL.wire);
      R(x - 12, g - 22, 5, 2, METAL.lampPost);
      return;
    default: // Gamlebyen: a ruined church's arches, the stone of a thousand years
      for (const [dx, h] of [[-20, 24], [-8, 30], [4, 26], [16, 18]] as const) {
        s(dx, 4, h, STONE.base);
        R(x + dx, g - h, 4, 1, STONE.light);
      }
      for (const dx of [-16, -4, 8]) for (let k = 0; k < 8; k++) R(x + dx + (k < 4 ? 0 : 0), g - 22 - Math.round(Math.sin((k / 7) * Math.PI) * 4), 8, 1, k === 0 ? STONE.light : STONE.base);
      s(-22, 44, 3, mix(STONE.base, PALETTE.grass, 0.5));
  }
}

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

/** The station on the line: a white square in a frame of its line's colour, as on a metro map; grey while closed. */
function stationMark(i: number, open: boolean) {
  const x = stationX(i);
  const frame = LINE[i].line === 2 ? LINE_2_COLOR : HAT_RED;
  R(x - 6, LINE_Y - 2, 12, 10, open ? frame : mix(frame, INK, 0.4));
  R(x - 4, LINE_Y, 8, 6, open ? WHITE : mix(WHITE, STONE.base, 0.6));
  // Stortinget is where line 2 leaves: an orange bar across the foot of its square.
  if (ORDER[i] === "stortinget") R(x - 4, LINE_Y + 4, 8, 2, LINE_2_COLOR);
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

/** The viaducts under the lines: concrete piers every three tiles, the far city seen between them. */
function viaduct() {
  // Its piers go down into the water out of sight, however tall the screen.
  const h = 16 * TILE - LINE_Y - 11 + 1200;
  for (let x = 2 * TILE; x < KART_COLS * TILE; x += 3 * TILE) {
    if (x > 8 * TILE && x < 18 * TILE) continue;
    R(x, LINE_Y + 11, 8, h, FACADE.marbleWall);
    R(x, LINE_Y + 11, 2, h, WHITE);
    R(x + 6, LINE_Y + 11, 2, h, FACADE.marbleSeam);
  }
}

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
function deck(x: number, y: number) {
  R(x, y, TILE, 6, LINE_2_COLOR);
  R(x, y, TILE, 1, mix(LINE_2_COLOR, WHITE, 0.35));
  R(x, y + 5, TILE, 1, mix(LINE_2_COLOR, INK, 0.3));
  R(x, y + 6, TILE, 5, FACADE.marbleWall);
  R(x, y + 10, TILE, 1, FACADE.marbleSeam);
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

/** Behind a station: its place's skyline, and its rune stone above it: gold with a tick once the level is cleared. */
function stationBack(i: number, cleared: boolean, clean: boolean, t: number) {
  const x = stationX(i);
  skyline(i, x, LINE_Y);
  runeStone(x - 8, LINE_Y - 46, RUNE_CHARS[LINE[i].rune] as RuneChar, cleared);
  // Still under the glamour (order 27): a mirror ball turning over its stone; a cleared station is plain Oslo again.
  if (!cleared) mirrorBall(x + 13, LINE_Y - 40, t, 8);
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

/** Both lines done: lanterns along both viaducts, lit after dusk. */
function lanterns(v: View) {
  for (let x = 3 * TILE; x < KART_COLS * TILE; x += 3 * TILE) {
    if (x > 8 * TILE && x < 18 * TILE) continue;
    R(x, LINE_Y - 7, 1, 7, METAL.lampPost);
    R(x - 1, LINE_Y - 9, 3, 2, METAL.brass);
    light(x - 1, LINE_Y - 9, 3, 2, "lamp");
  }
  void v;
}

export function kartArt(progress: Progress, open: boolean): Art {
  /** Both lines, all sixteen runes: the map gains its longship and its lanterns. */
  const complete = ORDER.every((id) => progress.cleared.includes(id));
  const cleared = (i: number) => progress.cleared.includes(ORDER[i]);
  const two = (i: number) => LINE[i].line === 2;
  return {
    far: (v) => drawOsloHills(v.sky, LINE_Y + 2 * TILE),
    mid(v) {
      drawFjord(v.t, LINE_Y + 2 * TILE);
      // The fjord goes on down under the viaduct, however tall the screen.
      for (let x = 0; x < view.w; x++) column(x, LINE_Y + 2 * TILE + 8, LINE_Y + 2 * TILE + 1200, PALETTE.water);
    },
    back(v) {
      const home = v.doors.get("home");
      if (home) {
        R(home.x - 6, home.bottom - home.h - 10, home.w + 12, home.h + 10, FACADE.stageTower);
        for (let y = home.bottom - home.h - 6; y < home.bottom; y += 4) for (let xx = home.x - 4; xx < home.x + home.w + 4; xx += 4) R(xx + ((y / 4) % 2) * 2, y, 1, 1, FACADE.stageTowerDot);
        R(home.x, home.bottom - home.h, home.w, home.h, home.open ? DOORWAY.stage : FACADE.stageDoor);
        R(home.x + home.w - 4, home.bottom - 16, 2, 2, METAL.brass);
      }
      viaduct();
      if (complete) longship(v);
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
      LINE.forEach((_l, i) => {
        if (two(i)) faintly(!open, () => stationMark(i, open && isOpen(progress, ORDER, i)));
        else stationMark(i, isOpen(progress, ORDER, i));
      });
    },
    tile(t, _c, _r, x, y) {
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
