import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "@larshansen/pixelkit/doors";
import { R, mix } from "@larshansen/pixelkit/paint";
import { BRICK, DOORWAY, FACADE, HAT_RED, INK, LAND, METAL, PAINT, PALETTE, PLANTS, SNOW, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { plankDoor } from "@larshansen/pixelkit/props";
import { rampHeight } from "@larshansen/pixelkit/tilemap";
import { drawRune } from "../render/actors";
import { drawFjord, drawOsloHills } from "../render/backdrop";
import { RUNE_CHARS } from "../game/runes";
import { isOpen, type Progress } from "../game/progress";
import { LINE, ORDER, isBuilt } from "./index";
import type { LevelDef, View } from "./types";

// The line map: one T-bane line, thick and red, with a station for each of the ten levels. He walks
// along it like anywhere else and goes in at a station. Its rune is carved above it, lit once the
// level is cleared; its name is on a board under it, with the best time once there is one. A branch
// dips under the line to Jernhaugen, the burial mound with the maze. Stations four to ten stand
// behind a construction fence. Hjem, the door home, is at the far left.
//
//   L  the line   #  the embankment   F  the fence   h Hjem   j Jernhaugen   1 to 9, 0  the stations

export const KART_MAP = [
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "...........................F........................",
  "..h.S.1.............2...3..F..4..5..6..7..8..9..0...",
  "LLLLLLLLL.........LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",
  "#########.........##################################",
  "#########....j....##################################",
  "####################################################",
  "####################################################"
];

const LINE_Y = 11 * TILE;
const DIP = 14 * TILE;
const DOWN = { points: [[9 * TILE, LINE_Y], [12 * TILE, DIP]] as [number, number][] };
const UP = { points: [[15 * TILE, DIP], [18 * TILE, LINE_Y]] as [number, number][] };
const STATION_TILES = "1234567890";
const FENCE_X = 27 * TILE;

/** The station's x on the line (its door's middle). */
export const stationX = (i: number) => {
  const c = KART_MAP[10].indexOf(STATION_TILES[i]);
  return c * TILE + TILE / 2;
};

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
      for (let k = 0; k < 8; k++) R(x - 6 + k, g - 22 - (8 - Math.abs(k * 2 - 7)) * 2, 12 - k * 2 > 0 ? 1 : 1, (8 - Math.abs(k * 2 - 7)) * 2, METAL.copper);
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
      R(x - 1, g - 28, 6, 4, HAT_RED);
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
      for (const [dx, h] of [[-14, 20], [-4, 28], [7, 22]] as const) for (let k = 0; k < h; k++) R(x + dx - Math.floor(k / 3) % 4, g - h + k, (Math.floor(k / 3) % 4) * 2 + 1, 1, PLANTS.spruce);
      return;
    case 7: // Stortinget: yellow brick and a round hall
      s(-20, 40, 16, FACADE.storting);
      s(-6, 12, 22, FACADE.stortingDark);
      return;
    case 8: // Ekeberg: the hill
      for (let k = -22; k < 22; k++) s(k, 1, Math.round(24 * Math.exp(-((k / 14) ** 2))), LAND.forest);
      return;
    default: // Nabolaget: small wooden houses
      s(-18, 12, 12, PAINT.mint);
      s(-4, 12, 14, PAINT.ochre);
      s(10, 10, 11, PAINT.red);
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

/** A station: a white square on the line (grey while closed), its rune above, its skyline behind. */
function station(i: number, open: boolean, cleared: boolean, v: View) {
  const x = stationX(i);
  skyline(i, x, LINE_Y);
  drawRune(x - 8, LINE_Y - 46, RUNE_CHARS[LINE[i].rune], cleared ? "lit" : "dark", v.t, i);
  R(x - 6, LINE_Y - 2, 12, 10, open ? HAT_RED : mix(HAT_RED, INK, 0.4));
  R(x - 4, LINE_Y, 8, 6, open ? WHITE : mix(WHITE, STONE.base, 0.6));
}

/** The construction fence across the line after the third station: boards, braces, a warning stripe. */
function fence() {
  const x = FENCE_X;
  R(x - 2, 0, TILE + 4, LINE_Y, PAINT.hoarding);
  for (let y = 0; y < LINE_Y; y += 8) R(x - 2, y, TILE + 4, 1, PAINT.hoardingLine);
  R(x - 2, 0, 1, LINE_Y, INK);
  R(x + TILE + 1, 0, 1, LINE_Y, INK);
  for (let y = LINE_Y - 24; y < LINE_Y - 16; y++) for (let k = 0; k < TILE + 4; k++) if (((k + y) >> 2) % 2 === 0) R(x - 2 + k, y, 1, 1, PAINT.warning);
}

/** The line itself, over the dip on a light bridge, and the branch dipping under it to the mound. */
function branch() {
  for (let x = 9 * TILE; x < 18 * TILE; x++) {
    R(x, LINE_Y + 1, 1, 3, mix(HAT_RED, WHITE, 0.45));
    if (x % 24 === 0) R(x, LINE_Y + 4, 2, DIP - LINE_Y - 30, mix(STONE.light, WHITE, 0.3));
    const s = rampHeight([DOWN, UP], x);
    const y = s === null ? DIP : Math.round(s);
    R(x, y, 1, 4, HAT_RED);
    R(x, y, 1, 1, mix(HAT_RED, WHITE, 0.3));
  }
}

export function kartDef(progress: Progress): LevelDef {
  const cleared = (i: number) => progress.cleared.includes(ORDER[i]);
  return {
    id: "kart",
    rune: -1,
    name: "T-banen",
    landmark: { nb: "Linje 1", en: "Line 1" },
    place: { nb: "", en: "" },
    sky: null,
    map: KART_MAP,
    legend: { solid: "L#F", oneWay: "", water: "" },
    ramps: [DOWN, UP],
    carriers: [],
    timed: [],
    cannons: [],
    signs: [],
    doors: [
      { id: "home", tile: "h", sign: "Hjem", href: "/?from=viking" },
      { id: "maze", tile: "j", sign: "Jernhaugen", href: "#jernhaugen" },
      ...LINE.map((l, i) => ({ id: l.id, tile: STATION_TILES[i], sign: l.name, href: isBuilt(l) ? `#${l.id}` : "" }))
    ],
    art: {
      far: (v) => drawOsloHills(v.sky, LINE_Y + 2 * TILE),
      mid: (v) => drawFjord(v.t, LINE_Y + 2 * TILE),
      back(v) {
        const home = v.doors.get("home");
        if (home) {
          R(home.x - 6, home.bottom - home.h - 10, home.w + 12, home.h + 10, FACADE.stageTower);
          for (let y = home.bottom - home.h - 6; y < home.bottom; y += 4) for (let xx = home.x - 4; xx < home.x + home.w + 4; xx += 4) R(xx + ((y / 4) % 2) * 2, y, 1, 1, FACADE.stageTowerDot);
          R(home.x, home.bottom - home.h, home.w, home.h, home.open ? DOORWAY.stage : FACADE.stageDoor);
          R(home.x + home.w - 4, home.bottom - 16, 2, 2, METAL.brass);
        }
        mound(v.doors.get("maze"), v.sky.snow);
        branch();
        LINE.forEach((_, i) => station(i, isOpen(progress, ORDER, i) && i < 3, cleared(i), v));
        fence();
      },
      ground: () => ({ top: PALETTE.grass, dot: PALETTE.grassDark, fill: PALETTE.earth }),
      ledges: {}
    }
  };
}
