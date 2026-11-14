import { box, column, layerWorldX, lit } from "@larshansen/pixelkit/backdrop";
import type { CarrierDef, Lift, Travel } from "@larshansen/pixelkit/carrier";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { LOAD_STEPS, type Launcher } from "@larshansen/pixelkit/launcher";
import { R, layerX, light, mix, view } from "@larshansen/pixelkit/paint";
import { BRICK, CREATURE, FACADE, FLAG, GLASS, ICY, INK, LAND, LAMP, METAL, PAINT, PALETTE, PARADE, PLANTS, ROOF, SKIN, SNOW, STONE, WHITE } from "@larshansen/pixelkit/palette";
import { ICE, type Surface } from "@larshansen/pixelkit/surface";
import { timedPhase, type TimedLedge } from "@larshansen/pixelkit/timed";
import { rampHeight, type Ramp, type TileMap } from "@larshansen/pixelkit/tilemap";
import type { EnemyDef } from "../game/enemies";
import { tbaneDoor } from "../render/furniture";
import { mapBuilder } from "./build";
import type { LevelDef, View } from "./types";

// Level 5, rune H: Holmenkollen. Winter, snowing. Off the train at the top, along a path where the
// snow has turned to ice, down icy steps with red rails that stop a slide, over two gullies (one by
// the snow cannon, one by the chairlift) to the start hut at the top of the jump. Then the inrun:
// no steering, the speed climbs past anything he can run, and one button matters, the jump at the
// lip. Rune H hangs in the flight path; miss it and the landing hill lets him down, the steps under
// the inrun take him back up to try again. The city lies below in the far backdrop.
// New: ice, and the inrun (surfaces). Snowball kids throw; hedgehogs and fire baskets are spiky.
//
//   #  snow   I  ice   H  a red rail (a solid post)   K  rock   =  the walkway's planks
//   -  the hut's roof   _  a snow-laden branch   c  the snow cannon   b  a bench   $  skilling
//
// Sections: the path from the station (teach: ice where nothing can go wrong), the icy steps
// (practise: ice over small drops and gaps), the gullies (twist: the snow cannon onto ice, the
// chairlift), and the jump (set piece: the hut, the inrun, the flight, the rune).

const COLS = 280;
const ROWS = 40;
const b = mapBuilder(COLS, ROWS);

// --- The path from the station, and the first ice -------------------------------------------------
b.ground(0, 40, 9);
b.run(15, 26, 9, "I");
b.put(27, 8, "H");
// A snow cave under the path: in through a hole, out through a crust of snow.
b.fill(29, 39, 10, 12, ".");
b.put(31, 9, ".");
b.run(37, 38, 11, "_");
b.run(38, 39, 9, "-");
// A snow bank above the path with a bench on it, a little off the way.
b.run(19, 22, 7, "=");
// Down a step to the second ice, with a rail at its end.
b.ground(41, 56, 10);
b.run(41, 52, 10, "I");
b.put(53, 9, "H");

// --- The icy steps ----------------------------------------------------------------------------------
b.ground(57, 64, 10);
b.ground(65, 72, 11);
b.run(65, 71, 11, "I");
b.put(72, 10, "H");
b.ground(73, 80, 12);
b.run(73, 79, 12, "I");
b.put(80, 11, "H");
// The first gap: the rail, and one tile of nothing.
b.ground(82, 91, 13);
b.run(82, 90, 13, "I");
b.put(91, 12, "H");
b.ground(92, 99, 14);
// The second gap, three tiles, onto ice.
b.ground(103, 111, 14);
b.run(103, 110, 14, "I");
b.put(111, 13, "H");
// Snow-laden branches high over the steps: up from a rail's top, a nook of skilling.
b.run(79, 81, 9, "_");
b.run(83, 86, 7, "_");

// --- The gullies ---------------------------------------------------------------------------------------
b.ground(112, 119, 14);
// The first gully, crossed by the snow cannon, onto ice that ends at a rail.
b.ground(129, 138, 15);
b.run(129, 137, 15, "I");
b.put(138, 14, "H");
// The second, crossed by the chairlift.
b.ground(151, 157, 16);
// The third, on slabs of ice that crack and sink, and come back: ledges on a beat.
b.ground(170, 175, 16);
// The kids' jump: a little inrun and a lip over flat snow, where the inrun can be learnt and
// nothing can go wrong.
export const KIDS_LIP = { x: 184 * TILE, y: 19 * TILE };
const KIDS: Ramp = {
  points: [
    [176 * TILE, 16 * TILE],
    [177 * TILE, 16 * TILE],
    [KIDS_LIP.x, KIDS_LIP.y]
  ]
};
b.put(175, 16, "#");
b.ground(176, 183, 21);
b.ground(184, 191, 21);
// Down into the hollow under the jump.
const DOWN = b.slope(192, 21, 197, 25, "V");

// --- The jump --------------------------------------------------------------------------------------------
/** The jump's first column: the set piece is laid out from here. */
const J = 192;
// The hollow under the jump runs at the knoll's height; the landing hill goes down from there.
b.ground(J + 5, J + 48, 25);
// The hut: its floor, its roof, beside the tower's lift.
b.fill(J + 15, J + 20, 16, 16, "#");
b.run(J + 15, J + 21, 14, "-");
b.ground(J + 69, J + 79, 35);
b.ground(J + 84, COLS - 1, 33);
// The landing hill starts two tiles past the lip, with a tile of plain ground between: two slopes
// meeting at different heights would lift him from the knoll onto the inrun as he walked back up.
const HILL = b.slope(J + 49, 25, J + 69, 35, "V");
const RISE = b.slope(J + 79, 35, J + 84, 33, "V");
b.fill(COLS - 2, COLS - 1, 0, 32, "K");

/** The inrun: from the hut's door down to the lip, on stilts, open below. */
export const LIP = { x: (J + 47) * TILE, y: 22 * TILE + 8 };
const INRUN: Ramp = {
  points: [
    [(J + 21) * TILE, 16 * TILE],
    [(J + 22) * TILE, 16 * TILE],
    [(J + 44) * TILE, 22 * TILE],
    [LIP.x, LIP.y]
  ]
};

// Marks: the start, the door, signs, flags, benches, the cannon, the rune, the bracteate, the cheese.
b.put(3, 8, "t").put(5, 8, "S").put(9, 8, "i").put(21, 6, "b");
b.put(55, 9, "i").put(57, 9, "f").put(112, 13, "f").put(114, 13, "i").put(117, 13, "c");
b.put(136, 14, "f").put(152, 15, "f").put(171, 15, "i").put(J + 16, 15, "f").put(J + 19, 15, "b");
b.put(J + 51, 19, "r").put(J + 18, 8, "o").put(34, 12, "&");

const COINS: [number, number][] = [
  [11, 8], [12, 8], [13, 8],
  [16, 8], [17, 8], [24, 8], [25, 8],
  [19, 6], [22, 6],
  [29, 8], [36, 8],
  [32, 12], [33, 12], [35, 12], [36, 12],
  [43, 9], [45, 8], [47, 9],
  [59, 9], [60, 9],
  [67, 9], [69, 9],
  [79, 8], [81, 8], [83, 6], [84, 6], [85, 6], [86, 6],
  [81, 11],
  [93, 13], [97, 13],
  [100, 12], [101, 11], [102, 12],
  [121, 10], [124, 8], [127, 9],
  [133, 14], [135, 14],
  [142, 14], [145, 14], [148, 14],
  [159, 15], [162, 15], [165, 15], [168, 15],
  [179, 16], [182, 17],
  [186, 18], [188, 18], [190, 19],
  [J + 9, 24], [J + 11, 24],
  [J + 17, 13], [J + 20, 13],
  [J + 28, 16], [J + 34, 18], [J + 40, 20],
  [J + 48, 20], [J + 50, 19], [J + 53, 19], [J + 55, 21]
];
for (const [c, r] of COINS) b.put(c, r, "$");

export const MAP = b.rows_();
const map = MAP;
const at = (c: number, r: number) => (r >= 0 && r < ROWS && c >= 0 && c < COLS ? map[r][c] : ".");

// --- Surfaces: the ice, and the inrun -------------------------------------------------------------------
/** The inrun: his keys do nothing on it, the slope draws him on, and his speed climbs to well past a run. */
export const INRUN_SURFACE: Surface = { grip: 0, belt: 4.5, cap: 3.8 };
export function surfaceAt(x: number, y: number): Surface | null {
  for (const [ramp, lip] of [
    [INRUN, LIP],
    [KIDS, KIDS_LIP]
  ] as const)
    if (x >= ramp.points[0][0] && x <= lip.x + PLAYER.w / 2) {
      const s = rampHeight([ramp], Math.min(x, lip.x));
      if (s !== null && Math.abs(s - y) < 2) return INRUN_SURFACE;
    }
  const r = Math.round(y / TILE);
  if (Math.abs(y - r * TILE) > 0.5) return null;
  return at(Math.floor(x / TILE), r) === "I" ? ICE : null;
}

// --- Things that move -------------------------------------------------------------------------------------
/** The chairlift over the second gully: one chair on its cable, back and forth, slow at each end. */
const CHAIR_Y = 15 * TILE - 6;
export const CHAIRS: Travel[] = [{ kind: "travel", from: { x: 139 * TILE, y: CHAIR_Y }, to: { x: 149 * TILE, y: CHAIR_Y }, w: 2 * TILE, period: 1000 }];
/** The lift up the tower: from the hollow under the jump to the hut's floor. */
export const LIFT: Lift = { kind: "lift", x: (J + 13) * TILE, top: 16 * TILE, bottom: 25 * TILE, w: 2 * TILE, speed: 0.6, wait: 150 };
const CARRIERS: CarrierDef[] = [...CHAIRS, LIFT];
/** Slabs of ice over the third gully: there two and a half seconds, cracking for one, sunk for two and a half; each a little after the one before. */
export const SLABS: TimedLedge[] = [158, 161, 164, 167].map((c, k) => ({ x: c * TILE, y: 16 * TILE, w: 2 * TILE, on: 150, warn: 60, off: 150, offset: -70 * k }));

export const ENEMIES: EnemyDef[] = [
  { kind: "thrower", look: "kid", c: 33, r: 8, period: 180 },
  { kind: "flyer", look: "crow", c: 47, r: 6, range: 3, rise: 6, period: 170 },
  { kind: "spiky", look: "hedgehog", c: 62, r: 9, range: 1 },
  { kind: "spiky", look: "hedgehog", c: 87, r: 12, range: 2, dir: -1 },
  { kind: "spiky", look: "grill", c: 94, r: 13, speed: 0, w: 12, h: 12 },
  { kind: "thrower", look: "kid", c: 98, r: 13, period: 180, offset: 50 },
  { kind: "flyer", look: "crow", c: 145, r: 10, range: 3, rise: 6, period: 180 },
  { kind: "thrower", look: "kid", c: J + 22, r: 24, period: 190, offset: 120 },
  { kind: "spiky", look: "grill", c: J + 8, r: 24, speed: 0, w: 12, h: 12 },
  { kind: "spiky", look: "hedgehog", c: J + 30, r: 24, range: 3 }
];

// --- Art ----------------------------------------------------------------------------------------------------
const P = PALETTE;
/** Snow under the landing hill's slope: one even colour, so the tiles under it do not show as steps. */
const UNDER_SLOPE = mix(SNOW.lying, ICY.groove, 0.4);

/** Snow: a white top, blue shadow bands, and the odd stone showing through, deeper down. */
function snowTile(c: number, r: number, x: number, y: number, top: boolean) {
  const depth = Math.min(1, (r - surfaceRow(c)) / 6);
  const base = mix(SNOW.lying, ICY.groove, 0.35 + depth * 0.45);
  R(x, y, TILE, TILE, base);
  if (top) {
    R(x, y, TILE, 3, WHITE);
    R(x, y + 3, TILE, 1, SNOW.shade);
    R(x + ((c * 5) % 11), y + 1, 3, 1, ICY.iceLight);
  }
  for (let yy = 6; yy < TILE; yy += 6) R(x, y + yy, TILE, 1, mix(base, ICY.steelShade, 0.25));
  if ((c * 7 + r * 3) % 5 === 0) R(x + ((c * 3 + r) % 10) + 2, y + 8, 4, 3, mix(STONE.base, base, 0.4));
}
function surfaceRow(c: number) {
  for (let r = 0; r < ROWS; r++) if (at(c, r) === "#" || at(c, r) === "I") return r;
  return ROWS;
}

/** Ice: a glassy blue sheet with bright streaks on top, over snow. */
function iceTile(c: number, x: number, y: number) {
  R(x, y, TILE, TILE, mix(SNOW.lying, ICY.groove, 0.4));
  R(x, y, TILE, 8, ICY.ice);
  R(x, y, TILE, 1, ICY.iceLight);
  R(x + ((c * 7) % 9), y + 2, 6, 1, ICY.iceLight);
  R(x + ((c * 5 + 4) % 11), y + 5, 3, 1, ICY.iceLight);
  R(x, y + 8, TILE, 1, ICY.iceDark);
  R(x + ((c * 3) % 13), y + 3, 1, 4, ICY.iceDark);
}

/** A red rail: the padded fence of a ski course, as high as a tile, that stops a slide. */
function railTile(x: number, y: number) {
  R(x + 1, y + 2, 14, 13, ICY.rail);
  R(x + 1, y + 2, 14, 1, mix(ICY.rail, WHITE, 0.4));
  for (let k = 0; k < 14; k += 4) R(x + 1 + k, y + 7, 2, 4, WHITE);
  R(x + 1, y + 14, 14, 1, mix(ICY.rail, INK, 0.35));
  R(x + 2, y + 15, 2, 1, ICY.steelDark);
  R(x + 12, y + 15, 2, 1, ICY.steelDark);
}

/** Inside the snow cave: its back wall in blue shadow, so it reads as a hollow and not as sky. */
function cave() {
  for (let x = 29 * TILE; x < 40 * TILE; x++) {
    const top = 10 * TILE - (x === 31 * TILE + 8 ? 0 : 0);
    R(x, top, 1, 3 * TILE, mix(ICY.groove, ICY.steelDark, 0.45));
    if ((x * 7) % 13 === 0) R(x, top + 4 + ((x * 3) % 30), 1, 3, mix(ICY.groove, ICY.steelDark, 0.2));
  }
  for (let x = 31 * TILE; x < 32 * TILE; x++) R(x, 9 * TILE, 1, TILE, mix(ICY.groove, ICY.steelDark, 0.3));
}

/** The old spruce whose snowy branches (the map's ledges) are the way up to the nook over the steps: a tall trunk, its tiers of needles behind. */
function bigSpruce() {
  const x = 82 * TILE + 8;
  const top = 3 * TILE;
  const foot = 13 * TILE;
  for (let y = top; y < foot - 8; y++) {
    const k = y - top;
    const half = Math.min(26, Math.floor(2 + (k % 22) * 0.9 + k * 0.08));
    const color = k % 22 === 0 ? SNOW.lying : k % 22 === 1 ? SNOW.shade : mix(PLANTS.spruce, ICY.steelDark, 0.15);
    R(x - half, y, half * 2 + 1, 1, color);
  }
  R(x - 2, top + 8, 5, foot - top - 8, PLANTS.spruceTrunk);
  R(x - 2, top + 8, 1, foot - top - 8, mix(PLANTS.spruceTrunk, WHITE, 0.15));
}

/** A spruce weighed down with snow, from its foot. */
function spruce(x: number, foot: number, h: number) {
  R(x - 1, foot - 4, 3, 4, PLANTS.spruceTrunk);
  for (let i = 0; i < h - 4; i++) {
    const half = Math.floor(2 + (i % 7) * 0.8 + i * 0.22);
    R(x - half, foot - h + i, half * 2 + 1, 1, i % 7 === 0 ? SNOW.lying : PLANTS.spruce);
    if (i % 7 === 1) R(x - half + 1, foot - h + i, half, 1, SNOW.shade);
  }
}

/** Holmenkollen station at the top of the line: a platform roof, the T sign, the name. */
function station(v: View) {
  const y = 9 * TILE;
  R(0, y - 34, 14 * TILE, 4, ROOF.slate);
  R(0, y - 34, 14 * TILE, 2, SNOW.lying);
  for (const x of [8, 100, 200]) R(x, y - 30, 3, 30, METAL.lampPost);
  R(80, y - 26, 60, 10, PAINT.tbane);
  R(82, y - 24, 56, 6, WHITE);
  for (let i = 0; i < 7; i++) R(86 + i * 7, y - 23, 4, 4, PAINT.tbane);
  tbaneDoor(v.doors.get("tbane"));
}

/** The jump: the steel tower at the top, the hut, the inrun on its legs, the lip, the landing hill and its marks. */
function jump(v: View) {
  // The tower: white steel, a lattice, a lit deck at the top, the flag.
  const tx = (J + 15) * TILE;
  R(tx + 6, 6 * TILE, 6 * TILE - 12, 8 * TILE, ICY.steel);
  for (let y = 6 * TILE + 6; y < 14 * TILE; y += 10) {
    R(tx + 6, y, 6 * TILE - 12, 1, ICY.steelShade);
    for (let k = 0; k < 6 * TILE - 12; k += 2) R(tx + 6 + k, y + 1 + Math.floor(k / 9), 1, 1, ICY.steelShade);
  }
  R(tx + 2, 5 * TILE + 10, 6 * TILE - 4, 6, ICY.steelDark);
  R(tx + 2, 5 * TILE + 10, 6 * TILE - 4, 1, WHITE);
  for (let x = tx + 6; x < tx + 6 * TILE - 6; x += 6) R(x, 5 * TILE + 3, 1, 7, ICY.steelShade);
  R(tx + 4, 5 * TILE + 3, 6 * TILE - 8, 1, ICY.steelShade);
  R(tx + 6 * TILE / 2, 2 * TILE, 1, 3 * TILE + 3, METAL.flagpole);
  R(tx + 6 * TILE / 2 + 1, 2 * TILE, 13, 9, FLAG.red);
  R(tx + 6 * TILE / 2 + 4, 2 * TILE, 3, 9, FLAG.white);
  R(tx + 6 * TILE / 2 + 1, 2 * TILE + 3, 13, 3, FLAG.white);
  R(tx + 6 * TILE / 2 + 5, 2 * TILE, 1, 9, FLAG.blue);
  R(tx + 6 * TILE / 2 + 1, 2 * TILE + 4, 13, 1, FLAG.blue);
  // The hut: red planks, a lit window, the start gate.
  R(tx, 14 * TILE + 5, 6 * TILE, 2 * TILE - 5, PAINT.red);
  for (let x = tx + 3; x < tx + 6 * TILE; x += 4) R(x, 14 * TILE + 5, 1, 2 * TILE - 5, PAINT.redLine);
  R(tx + 20, 15 * TILE - 4, 14, 9, PAINT.trim);
  R(tx + 21, 15 * TILE - 3, 12, 7, GLASS.farWindow);
  light(tx + 21, 15 * TILE - 3, 12, 7);
  R((J + 20) * TILE + 12, 15 * TILE + 4, 2, 12, ICY.steelDark);
  // The lift's shaft: a steel frame from the hollow up to the hut, beside it.
  const lx = LIFT.x;
  for (const x of [lx - 2, lx + LIFT.w]) R(x, 14 * TILE, 2, 11 * TILE, ICY.steelDark);
  for (let y = 14 * TILE + 8; y < 25 * TILE; y += 12) for (let k = 0; k < LIFT.w; k += 2) R(lx + k, y + Math.floor(k / 4), 1, 1, ICY.steelShade);
  R(lx - 4, 14 * TILE - 2, LIFT.w + 8, 3, ICY.steelDark);
  // The inrun: its deck of packed snow with two grooves, on legs down to the ground.
  for (const [ramp, lip] of [
    [INRUN, LIP],
    [KIDS, KIDS_LIP]
  ] as const)
  for (let x = ramp.points[0][0]; x < lip.x; x++) {
    const y = Math.round(rampHeight([ramp], x) ?? 0);
    R(x, y, 1, 3, ICY.crust);
    R(x, y + 1, 1, 1, ICY.groove);
    R(x, y + 3, 1, 4, ICY.steel);
    R(x, y + 7, 1, 1, ICY.steelShade);
    const foot = ramp === KIDS ? 21 * TILE : 25 * TILE;
    if (x % 40 < 3) R(x, y + 8, 1, foot - y - 8, ICY.steelShade);
    if (x % 40 === 20) for (let k = y + 8; k < foot; k += 2) R(x + Math.floor((k - y) / 4) % 20 - 10, k, 1, 1, ICY.steelShade);
  }
  R(KIDS_LIP.x - 3, KIDS_LIP.y - 1, 4, 6, ICY.rail);
  // The lip, marked in red, and the green of the take-off table's edge.
  R(LIP.x - 3, LIP.y - 1, 4, 9, ICY.rail);
  R(LIP.x - 3, LIP.y - 1, 4, 1, mix(ICY.rail, WHITE, 0.4));
  // The landing hill and the rise at the end of the outrun: packed snow along the slope.
  for (const ramp of [DOWN, HILL, RISE]) {
    const xs = ramp.points.map((p) => p[0]);
    for (let x = Math.min(...xs); x < Math.max(...xs); x++) {
      const y = Math.round(rampHeight([ramp], x) ?? 0);
      R(x, y, 1, 3, WHITE);
      R(x, y + 3, 1, 1, SNOW.shade);
      R(x, y + 4, 1, Math.ceil((y + 4) / TILE) * TILE - y - 4 + TILE, UNDER_SLOPE);
    }
  }
  // Blue marks on the landing hill, every few metres.
  for (let c = J + 50; c < J + 69; c += 3) {
    const x = c * TILE;
    const y = Math.round(rampHeight([HILL], x) ?? 0);
    R(x, y + 2, 6, 1, ICY.mark);
  }
  // Floodlight masts, lit in the flourish.
  for (const fx of [J + 30, J + 40, J + 58]) {
    const base = fx < J + 47 ? 25 * TILE : Math.round(rampHeight([HILL], fx * TILE) ?? 0);
    R(fx * TILE, base - 120, 2, 120, ICY.steelDark);
    R(fx * TILE - 4, base - 124, 10, 4, ICY.steelDark);
    R(fx * TILE - 3, base - 123, 8, 2, v.flourish !== null ? LAMP : ICY.steel);
    if (v.flourish !== null) light(fx * TILE - 3, base - 123, 8, 2, "lamp");
  }
}

/** The chairlift: a cable between two pylons over the second gully; each chair hangs from it. */
function chairlift() {
  const y = CHAIR_Y - 30;
  R(138 * TILE, y, 13 * TILE, 1, METAL.wire);
  for (const px of [138 * TILE, 151 * TILE]) {
    R(px - 2, y - 4, 4, 15 * TILE - y + 40, ICY.steelDark);
    R(px - 6, y - 6, 12, 3, ICY.steelDark);
  }
}

/** A chair: a bar up to the cable, a seat (what he stands on), a footrest. */
function chair(at: { x: number; y: number }) {
  R(at.x + 15, CHAIR_Y - 30, 2, at.y - CHAIR_Y + 30, METAL.wire);
  R(at.x, at.y, 2 * TILE, 3, ICY.rail);
  R(at.x, at.y, 2 * TILE, 1, mix(ICY.rail, WHITE, 0.4));
  R(at.x + 2, at.y - 9, 2, 9, METAL.wire);
  R(at.x + 2, at.y - 10, 2 * TILE - 4, 2, METAL.wire);
  R(at.x + 4, at.y + 6, 2 * TILE - 8, 1, METAL.wire);
}

/** The lift's cage: a steel floor he stands on, a rail round it, the cable up to the top of the shaft. */
function liftCage(at: { x: number; y: number }) {
  R(at.x + LIFT.w / 2, 14 * TILE, 1, at.y - 14 * TILE - 12, METAL.wire);
  R(at.x, at.y, LIFT.w, 4, ICY.steelDark);
  R(at.x, at.y, LIFT.w, 1, ICY.steel);
  R(at.x, at.y - 12, LIFT.w, 1, ICY.steelDark);
  for (const x of [at.x, at.x + LIFT.w - 1]) R(x, at.y - 12, 1, 12, ICY.steelDark);
  R(at.x + 4, at.y - 14, LIFT.w - 8, 2, ICY.rail);
}

/** A slab of ice over the gully: clear blue; cracking (lines across it, blinking) a second before it sinks; a faint ring of foam where it went down. */
function slab(i: number, t: number) {
  const l = SLABS[i];
  const phase = timedPhase(t, l);
  if (phase === "off") {
    for (let x = l.x; x < l.x + l.w; x += 3) R(x, l.y + 2, 2, 1, mix(ICY.iceLight, ICY.steelShade, 0.5));
    return;
  }
  const sink = phase === "warn" && !view.reduced ? Math.floor((t / 6) % 2) : 0;
  R(l.x, l.y + sink, l.w, 6, ICY.ice);
  R(l.x, l.y + sink, l.w, 1, ICY.iceLight);
  R(l.x, l.y + 6 + sink, l.w, 1, ICY.iceDark);
  R(l.x + 4, l.y + 2 + sink, 7, 1, ICY.iceLight);
  if (phase === "warn" && Math.floor(t / 8) % 2 === 0) {
    // Cracks, and the blink round it that every ledge on a beat has.
    for (const [dx, dy, w] of [[5, 1, 6], [10, 3, 8], [20, 2, 5], [24, 4, 6]] as const) R(l.x + dx, l.y + dy + sink, w, 1, INK);
    R(l.x - 2, l.y - 2, l.w + 4, 2, WHITE);
    R(l.x - 2, l.y + 7, l.w + 4, 2, WHITE);
  }
}

/** The snow cannon: a fan in a barrel on a stand, white snow puffing out when it fires. */
function snowCannon(l: Launcher, t: number, loadedAt: number, firedAt: number) {
  const bottom = l.y + l.h;
  const loaded = t - loadedAt >= 0 && t - loadedAt < LOAD_STEPS;
  const shake = loaded && !view.reduced ? Math.floor(t / 2) % 2 : 0;
  R(l.x + 6, bottom - 8, 3, 8, ICY.steelDark);
  R(l.x + 15, bottom - 8, 3, 8, ICY.steelDark);
  R(l.x + 3, bottom - 2, 18, 2, ICY.steelDark);
  for (let i = 0; i < 20; i++) R(l.x + 2 + i, bottom - 16 - Math.floor(i / 4) + shake, 1, 9, i < 2 ? INK : PAINT.warning);
  R(l.x + 21, bottom - 21 + shake, 2, 10, ICY.steelDark);
  for (let k = 0; k < 3; k++) R(l.x + 4 + k * 6, bottom - 13 - k + shake, 2, 2, INK);
  const age = t - firedAt;
  if (age >= 0 && age < 40 && !view.reduced)
    for (let i = 0; i < 10; i++) {
      const k = (age + i * 3) / 40;
      R(l.x + 24 + k * 50 + (i % 3) * 3, bottom - 20 - k * 30 + Math.sin(i * 2) * 4, 2, 2, SNOW.lying);
    }
}

/**
 * Where a far layer puts something drawn at screen y `s` when the view is at the height of the
 * flight: the layers move up and down less than the world does, so the city stays below him as he
 * comes down the hill, and sinks out of sight up by the station.
 */
const sink = (s: number, k: number) => s + view.camY - k * (view.camY - 20 * TILE);

/** The far city, seen from up here: hills beyond the fjord, the water, the town along its shore. */
function farCity() {
  const horizon = sink(100, 0.25);
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.12);
    // In the layer's own pixels, so blocks keep their width however far away they are.
    const lx = Math.floor(wx * 0.12);
    const hills = 20 + 8 * Math.sin(wx * 0.004 + 1) + 4 * Math.sin(wx * 0.017);
    column(x, horizon - hills - 20, horizon - 20, LAND.farHills);
    if (hills > 24) column(x, horizon - hills - 20, horizon - hills - 18, SNOW.far);
    column(x, horizon - 20, horizon + 240, mix(P.water, LAND.farHills, 0.3));
    if ((lx * 7) % 23 === 0) column(x, horizon - 12 + (lx % 3), horizon - 11 + (lx % 3), mix(P.foam, LAND.farHills, 0.3));
    // The town: blocks five to eight pixels wide in two rows, a dark gap between each.
    for (const [row, w] of [
      [0, 6],
      [9, 8]
    ] as const) {
      const block = Math.floor((lx + row) / w);
      const inBlock = (lx + row) % w;
      if (inBlock === 0) continue;
      const h = 3 + ((block * 13 + row) % 6);
      const foot = horizon + 6 + row;
      const n = FACADE.blocks.length;
      const color = mix(FACADE.blocks[(((block * 3 + row) % n) + n) % n], LAND.farHills, 0.15);
      column(x, foot - h, foot, inBlock === w - 1 ? mix(color, INK, 0.15) : color);
      if (inBlock === 2 && (block + row) % 3 === 0) lit(x, foot - h + 2, 1, 1);
    }
    // The City Hall's two brick towers, by the water.
    const hall = lx % 160;
    if ((hall >= 60 && hall < 64) || (hall >= 68 && hall < 72)) column(x, horizon - 10, horizon + 6, mix(BRICK.red, LAND.farHills, 0.2));
  }
}

/** Forested ridges in between, white with snow on their tops. */
function ridges() {
  for (let x = 0; x < view.w; x++) {
    const wx = layerWorldX(x, 0.2);
    const h = 30 + 14 * Math.sin(wx * 0.006 + 2) + 6 * Math.sin(wx * 0.02);
    const base = sink(178, 0.45);
    column(x, base - h, base + 240, LAND.headland);
    column(x, base - h, base - h + 2, SNOW.far);
    if ((Math.floor(wx / 2) * 7) % 5 === 0) column(x, base - h - 3, base - h, LAND.headlandDark);
  }
}

/** Spruces just behind the path, white with snow. */
function nearSpruces() {
  for (let i = 0; i < 70; i++) {
    const wx = i * 60 + ((i * 23) % 30);
    const x = layerX(wx, 0.4);
    if (x < -12 || x > view.w + 12) continue;
    const c = Math.floor(wx / TILE);
    const foot = surfaceRow(Math.min(COLS - 1, c)) * TILE + 6;
    const h = 30 + ((i * 17) % 22);
    box(x - 1, foot - 4, 3, 4, PLANTS.spruceTrunk);
    for (let k = 0; k < h - 4; k++) {
      const half = Math.floor(2 + (k % 7) * 0.8 + k * 0.22);
      box(x - half, foot - h + k, half * 2 + 1, 1, k % 7 === 0 ? SNOW.far : mix(PLANTS.spruce, LAND.headland, 0.3));
    }
  }
}

/** Spectators along the outrun, in front, with flags and cowbells. */
function outrunCrowd(t: number, cheering: boolean) {
  for (let x = (J + 68) * TILE; x < (J + 79) * TILE; x += 7) {
    const g = 35 * TILE + 8;
    const k = Math.floor(x / 7);
    const head = g - 7 - ((k * 37) % 3);
    R(x, head + 4, 6, 9, [PARADE.bunadBlue, CREATURE.kidJacket, PARADE.bunadRed, P.ironDark, PARADE.silkGreen][k % 5]);
    R(x + 1, head, 4, 4, SKIN);
    R(x + 1, head - 1, 4, 2, [CREATURE.kidHat, PARADE.russ, PARADE.silkBlue, WHITE][k % 4]);
    if (k % 3 === 0) {
      const wave = cheering && !view.reduced ? Math.floor((t + k * 7) / 6) % 2 : 0;
      R(x + 5, head - 9 - wave * 2, 1, 8, PARADE.pole);
      R(x + 6, head - 9 - wave * 2, 5, 4, FLAG.red);
      R(x + 7, head - 9 - wave * 2, 1, 4, FLAG.white);
      R(x + 6, head - 7 - wave * 2, 5, 1, FLAG.blue);
    }
  }
}

/** The flourish: the floodlights come on (drawn by the jump), the crowd waves, the board lights. */
function flourish(age: number, v: View) {
  const x = (J + 69) * TILE;
  const y = 30 * TILE;
  R(x, y, 60, 22, INK);
  R(x + 2, y + 2, 56, 18, mix(INK, WHITE, 0.08));
  const on = Math.min(5, Math.floor(age / 6));
  for (let i = 0; i < on; i++) {
    R(x + 6 + i * 10, y + 7, 6, 8, LAMP);
    light(x + 6 + i * 10, y + 7, 6, 8, "soft");
  }
  R(x + 28, y + 22, 3, 5 * TILE - 22, ICY.steelDark);
  void v;
}

export const HOLMENKOLLEN: LevelDef = {
  id: "holmenkollen",
  rune: 4,
  name: "Holmenkollen",
  landmark: { nb: "Hoppbakken over byen", en: "The ski jump over the city" },
  place: { nb: "Hoppbakken", en: "The ski jump" },
  sky: "winterday",
  map: MAP,
  legend: { solid: "#IHKV", oneWay: "=_-", water: "" },
  ramps: [KIDS, INRUN, DOWN, HILL, RISE],
  carriers: CARRIERS,
  timed: SLABS,
  cannons: [{ vx: 5, vy: 6.5 }],
  enemies: ENEMIES,
  surfaceAt: (x, y) => surfaceAt(x, y),
  flourish: 120,
  floor: (x) => (x < J * TILE ? Math.min(ROWS * TILE, (surfaceRow(Math.floor(x / TILE)) + 3) * TILE) : x < (J + 47) * TILE ? 28 * TILE : ROWS * TILE),
  signs: [
    {
      label: { nb: "Is", en: "Ice" },
      lines: { nb: ["Snøen på stien har blitt til is.", "Du sklir når du slipper. Rekkverket stopper deg."], en: ["The snow on the path has turned to ice.", "You slide when you let go. The rail stops you."] }
    },
    {
      label: { nb: "Trappene", en: "The steps" },
      lines: { nb: ["Trappene ned til hoppet er islagt.", "Ingen har strødd. Ingen kommer til å strø."], en: ["The steps down to the jump are iced over.", "Nobody has gritted them. Nobody will."] }
    },
    {
      label: { nb: "Snøkanon", en: "Snow cannon" },
      lines: { nb: ["Snøkanonen lager snø.", "Og flyr deg over juvet."], en: ["The snow cannon makes snow.", "And flies you over the gully."] }
    },
    {
      label: { nb: "Starten", en: "The start" },
      lines: { nb: ["Ned unnarennet styrer du ikke. Hopp på kanten.", "Prøv i barnebakken først. Bommer du, tar heisen deg opp."], en: ["Down an inrun you do not steer. Jump at the lip.", "Try the kids' jump first. Miss, and the lift takes you up."] }
    }
  ],
  doors: [{ id: "tbane", tile: "t", sign: "T-banen", href: "#kart" }],
  art: {
    far: () => farCity(),
    mid: () => ridges(),
    near: () => nearSpruces(),
    back(v) {
      cave();
      bigSpruce();
      station(v);
      for (const [c, h] of [[16, 34], [36, 40], [62, 30], [76, 44], [98, 36], [118, 42], [133, 34], [156, 38]] as const) spruce(c * TILE, surfaceRow(c) * TILE, h);
      chairlift();
      jump(v);
    },
    front(v) {
      outrunCrowd(v.t, v.flourish !== null);
    },
    ground: () => ({ top: SNOW.lying, dot: SNOW.shade, fill: SNOW.shade }),
    tile(t, c, r, x, y, m: TileMap) {
      if (t === "#") {
        snowTile(c, r, x, y, !m.isSolid(c, r - 1));
        return true;
      }
      if (t === "I") {
        iceTile(c, x, y);
        return true;
      }
      if (t === "V") {
        R(x, y, TILE, TILE, UNDER_SLOPE);
        if ((c * 7 + r * 3) % 4 === 0) R(x + ((c * 5 + r) % 11), y + ((c + r * 7) % 12), 3, 1, mix(UNDER_SLOPE, ICY.steelShade, 0.3));
        return true;
      }
      if (t === "H") {
        railTile(x, y);
        return true;
      }
      return false;
    },
    ledges: {
      "=": { body: P.wood, top: SNOW.lying, edge: P.woodDark, joint: P.woodDark },
      _: { body: PLANTS.spruce, top: SNOW.lying, edge: mix(PLANTS.spruce, INK, 0.3), joint: SNOW.shade },
      "-": { body: ROOF.slate, top: SNOW.lying, edge: INK, joint: ROOF.slate }
    },
    carrier: (i, at) => (i < CHAIRS.length ? chair(at) : liftCage(at)),
    timed: (i, v) => slab(i, v.t),
    cannon: (_i, l, loadedAt, firedAt, v) => snowCannon(l, v.t, loadedAt, firedAt),
    flourish: (age, v) => flourish(age, v)
  }
};

