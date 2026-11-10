import { TILE } from "@larshansen/pixelkit/config";
import type { Door } from "../game/doors";
import { RAMPS, rampAt } from "../game/level";
import type { Sky } from "@larshansen/pixelkit/oslo";
import { PALETTE, STONE } from "@larshansen/pixelkit/palette";
import { R, gable, light, mix, view } from "@larshansen/pixelkit/paint";
import { runeCells, type RuneChar } from "../game/runes";
import type { Board } from "./text";

// The things the map only marks with a letter: the boathouse, the longship, the longhouse, the
// smithy, the mound, the cabin and the church tower, the beacon, doors and signs. Each is placed
// from the same tile coordinates as the map, so nothing floats: every foot is on ground the map has.
// The street's ground is at y 256 (row 16).

const P = PALETTE;
const G = 256;
const INK = "#1f1a17";
const DARK = mix(P.woodDark, INK, 0.45);
const STAVE = mix(P.woodDark, INK, 0.25);
const LIGHT_WOOD = mix(P.wood, "#ffffff", 0.25);
const EAVE = mix(P.woodDark, INK, 0.2);
const TILE_X = (c: number) => c * TILE;

const reduced = () => view.reduced;

/** A small window with a wooden frame and a cross; it lights up after dark. */
function window(x: number, y: number, w: number, h: number) {
  R(x - 1, y - 1, w + 2, h + 2, P.woodDark);
  R(x, y, w, h, "#a9d2e6");
  R(x + Math.floor(w / 2), y, 1, h, P.woodDark);
  R(x, y + Math.floor(h / 2), w, 1, P.woodDark);
  light(x, y, w, h);
}

/** A plank door with two iron bands. It stands open, as a dark hole, while he goes through. */
function plankDoor(d: Door, frame: string) {
  const ox = d.shake ? (d.shake % 4 < 2 ? 1 : -1) : 0;
  const top = d.bottom - d.h;
  R(d.x - 2 + ox, top - 2, d.w + 4, d.h + 2, frame);
  R(d.x + ox, top, d.w, d.h, d.open ? "#140d08" : P.wood);
  if (d.open) return;
  for (let i = 4; i < d.w; i += 4) R(d.x + ox + i, top, 1, d.h, P.woodDark);
  R(d.x + ox, top + 6, d.w, 2, P.iron);
  R(d.x + ox, top + 22, d.w, 2, P.iron);
  R(d.x + ox + d.w - 4, top + 15, 2, 3, P.iron);
}

/** Wooden sign boards on the walls and on posts. The words are drawn sharp by the text layer. */
export function drawBoards(boards: Board[]) {
  for (const b of boards) {
    if (b.post) R(b.cx - 1, b.y + 10, 2, b.post.bottom - b.y - 10, P.woodDark);
    R(b.cx - b.w / 2, b.y, b.w, 10, P.board);
    R(b.cx - b.w / 2, b.y + 10, b.w, 1, P.boardEdge);
  }
}

/** A tall standing stone left of the start, with LARS HANSEN carved on it in runes. */
function titleStone(sky: Sky) {
  const x0 = 10;
  const w = 40;
  const top = 208;
  const edge = mix(P.rockDark, INK, 0.4);
  R(x0 - 1, top, w + 2, G - top, edge);
  for (let i = 0; i < 8; i++) R(x0 - 1 + 8 - i, top - 8 + i, w + 2 - (8 - i) * 2, 1, edge);
  R(x0, top, w, G - top, P.rock);
  for (let i = 0; i < 8; i++) R(x0 + 8 - i, top - 8 + i, w - (8 - i) * 2, 1, P.rock);
  R(x0, top - 7, 1, G - top + 7, mix(P.rock, "#ffffff", 0.2));
  R(x0 + w - 5, top, 5, G - top, mix(P.rock, INK, 0.15));
  R(x0 + 4, top - 4, 12, 1, mix(P.rock, "#ffffff", 0.25));
  if (sky.snow) R(x0 + 8, top - 8, w - 16, 2, P.snow);
  // The name, carved: LARS above HANSEN, in the dark of the stone.
  const carve = mix(P.rockDark, INK, 0.5);
  const line = (word: string, y: number) => {
    const wide = word.length * 6 - 1;
    [...word].forEach((ch, i) => {
      const cells = runeCells(ch as RuneChar, 5, 7);
      cells.forEach((row, ry) => row.forEach((on, rx) => on && R(x0 + Math.round((w - wide) / 2) + i * 6 + rx, y + ry, 1, 1, carve)));
    });
  };
  line("LARS", top + 6);
  line("HANSEN", top + 20);
  // A little moss at the foot.
  for (let i = 0; i < w; i += 4) R(x0 + i + (i % 3), G - 2 - (i % 2), 2, 2, sky.snow ? P.snow : STONE.moss);
}

/** Naustet, the boathouse: dark timber with a turf roof, and the door Hjem. */
function boathouse(door: Door | undefined, sky: Sky) {
  const x = 126;
  const w = 72;
  const top = 208;
  R(x, top, w, G - top, P.woodDark);
  for (let i = 3; i < w - 1; i += 4) R(x + i, top, 1, G - top, STAVE);
  R(x, top, 2, G - top, DARK);
  R(x + w - 2, top, 2, G - top, DARK);
  window(x + 46, top + 12, 10, 8);
  // The turf roof, with a dark eave and grass growing wild along it.
  gable(x - 8, top, w + 16, 24, sky.snow ? P.snow : P.turf);
  R(x - 8, top - 1, w + 16, 2, EAVE);
  if (!sky.snow)
    for (let i = 0; i < 28; i++) {
      const ry = top - 3 - ((i * 7) % 18);
      const half = Math.round(((w + 16) / 2) * ((24 - (top - ry)) / 24));
      R(x + w / 2 - half + 2 + ((i * 11) % Math.max(1, half * 2 - 4)), ry, 1, 2, i % 2 ? P.grassDark : P.grass);
    }
  // Oars leaning on the wall, and a coil of rope.
  R(x + 60, top + 14, 1, 34, P.wood);
  R(x + 63, top + 12, 1, 36, LIGHT_WOOD);
  R(x + 59, top + 12, 3, 3, P.wood);
  R(x + 62, top + 10, 3, 3, LIGHT_WOOD);
  if (door) plankDoor(door, P.woodDark);
}

/** The longship: hull, shields, dragon head, mast, sail and rigging. The deck and the yard are ledges in the map. */
function longship(sky: Sky, steps: number) {
  const bob = reduced() ? 0 : Math.round((Math.sin(steps * 0.03) + 1) / 2);
  const top = 240 + bob; // the deck's line
  const x0 = 484;
  const x1 = 744;
  // Hull: planks narrowing towards the keel, in two alternating browns.
  for (let i = 0; i < 24; i++) {
    const inset = Math.round(Math.pow(i / 23, 1.7) * 30);
    R(x0 + inset, top + i, x1 - x0 - inset * 2, 1, Math.floor(i / 3) % 2 ? P.woodDark : P.wood);
  }
  R(x0, top, x1 - x0, 2, P.woodDark);
  // Shields along the rail, red and cream in turn, each with an iron boss.
  for (let i = 0, sx = x0 + 12; sx < x1 - 14; i++, sx += 9) {
    R(sx, top + 7, 7, 7, i % 2 ? P.sail : P.sailStripe);
    R(sx + 3, top + 10, 1, 1, P.iron);
    R(sx, top + 7, 7, 1, mix(i % 2 ? P.sail : P.sailStripe, INK, 0.3));
  }
  // The dragon head at the prow, on the right, and the stern post at the other end.
  const px = x1;
  R(px - 2, top - 6, 5, 8, P.wood);
  R(px, top - 13, 5, 8, P.wood);
  R(px + 1, top - 20, 8, 7, P.woodDark);
  R(px + 5, top - 18, 8, 3, P.wood);
  R(px + 8, top - 15, 6, 2, P.woodDark);
  R(px + 3, top - 18, 1, 1, P.sail);
  R(px + 2, top - 23, 2, 3, P.woodDark);
  R(px + 9, top - 16, 1, 1, P.sail);
  R(px + 11, top - 16, 1, 1, P.sail);
  R(px + 8, top - 14, 4, 1, P.sailStripe);
  R(x0 - 2, top - 8, 4, 10, P.wood);
  R(x0 - 4, top - 14, 4, 8, P.woodDark);
  // The sail hangs from the yard (row 9), striped red and cream, belly at the bottom.
  const mast = 616;
  const yard0 = 568;
  const sailW = 96;
  for (let i = 0; i < sailW; i++) {
    const belly = Math.round(3 * Math.sin((Math.PI * i) / sailW));
    const stripe = Math.floor(i / 12) % 2 === 0;
    R(yard0 + i, 147 + bob, 1, 59 + belly, stripe ? P.sail : P.sailStripe);
    if (i % 12 === 0) R(yard0 + i, 147 + bob, 1, 59 + belly, mix(stripe ? P.sail : P.sailStripe, INK, 0.25));
  }
  R(yard0, 147 + bob, sailW, 1, mix(P.sail, INK, 0.3));
  for (let y = 159; y < 205; y += 12) R(yard0, y + bob, sailW, 1, mix(P.sail, INK, 0.12));
  // The mast, and the stays down to the prow and the stern.
  R(mast - 1, 138 + bob, 4, top - 138 - bob, P.woodDark);
  R(mast, 138 + bob, 1, top - 138 - bob, P.wood);
  R(mast - 2, 136 + bob, 6, 2, P.woodDark);
  const stay = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.abs(bx - ax);
    for (let i = 0; i <= n; i++) R(ax + (bx > ax ? i : -i), Math.round(ay + ((by - ay) * i) / n), 1, 1, mix(P.woodDark, INK, 0.3));
  };
  stay(mast + 1, 137 + bob, x1 - 2, top - 6);
  stay(mast + 1, 137 + bob, x0 + 2, top - 8);
  void sky;
}

/** The farm: a fence, and the longhouse, whose turf roof is the slope he walks over. */
function farm(sky: Sky, steps: number) {
  const fence = (from: number, to: number) => {
    R(from, 246, to - from, 2, P.wood);
    R(from, 252, to - from, 2, P.wood);
    for (let x = from; x <= to - 2; x += 16) {
      R(x, 242, 2, 14, P.woodDark);
      R(x, 242, 2, 1, LIGHT_WOOD);
    }
  };
  fence(TILE_X(53), TILE_X(61));
  fence(TILE_X(73), TILE_X(76) - 8);

  const ramp = RAMPS[0];
  const x0 = ramp.points[0][0];
  const x1 = ramp.points[ramp.points.length - 1][0];
  // The roof vent, with smoke, drawn before the turf so only its top shows.
  const vx = 1120;
  R(vx, Math.round(rampAt(vx + 3) ?? 0) - 6, 6, 14, P.woodDark);
  R(vx - 1, Math.round(rampAt(vx + 3) ?? 0) - 7, 8, 2, DARK);
  if (!reduced())
    for (let i = 0; i < 3; i++) {
      const ph = ((steps * 0.5 + i * 24) % 72) / 72;
      R(vx + 1 + Math.round(Math.sin(ph * 6 + i) * 2 + ph * 5), Math.round(rampAt(vx + 3) ?? 0) - 9 - ph * 22, 4, 3, `rgba(200, 196, 190, ${(0.55 * (1 - ph)).toFixed(2)})`);
    }
  for (let x = x0; x < x1; x++) {
    const s = Math.round(rampAt(x) ?? G);
    if (s >= G) continue;
    // The turf and its sod, then the timber wall beneath.
    R(x, s, 1, 1, sky.snow ? P.snow : mix(P.grass, "#ffffff", 0.15));
    R(x, s + 1, 1, 2, sky.snow ? P.snow : P.grass);
    R(x, s + 3, 1, 1, sky.snow ? "#cfd8e6" : P.grassDark);
    R(x, s + 4, 1, 4, P.turf);
    if ((x * 7) % 5 === 0) R(x, s + 5, 1, 1, P.grassDark);
    R(x, s + 8, 1, 1, EAVE);
    if (s + 9 < G) R(x, s + 9, 1, G - s - 9, (x - x0) % 4 === 3 ? STAVE : P.woodDark);
  }
  window(1032, 226, 8, 6);
  window(1104, 226, 8, 6);
  // Round shields on the wall, as on the ship.
  for (const [sx, c] of [[1056, P.sailStripe], [1072, P.sail], [1088, P.sailStripe]] as const) {
    R(sx, 232, 8, 8, c);
    R(sx + 3, 235, 2, 2, P.iron);
  }
}

/** Runesmia: an open-fronted smithy with a glowing forge and an anvil, and the door Runesmia. */
function smithy(door: Door | undefined, sky: Sky, steps: number) {
  const x = 1236;
  const w = 108;
  const top = 206;
  // The back wall of the open bay, dark.
  R(x + 48, top, w - 48, G - top, DARK);
  for (let i = 51; i < w; i += 6) R(x + i, top, 1, G - top, mix(DARK, INK, 0.4));
  // The closed part with the door, in timber.
  R(x, top, 48, G - top, P.woodDark);
  for (let i = 3; i < 46; i += 4) R(x + i, top, 1, G - top, STAVE);
  // The forge: a stone hearth with a chimney, and glowing coals.
  const fx = 1298;
  for (let y = 232; y < G; y += 4) R(fx, y, 26, 3, y % 8 === 0 ? STONE.base : STONE.light);
  for (let y = 232; y < G; y += 4) R(fx + 12 + (y % 8 === 0 ? 0 : 4), y, 1, 3, STONE.mortar);
  R(fx + 5, 238, 16, 11, INK);
  const flick = reduced() ? 0 : Math.round(Math.sin(steps * 0.25));
  R(fx + 6, 244 - flick, 14, 5 + flick, "#ff7a2a");
  R(fx + 8, 243 - flick, 10, 3, "#ffc24a");
  R(fx + 10, 242 - flick, 6, 1, "#fff0b0");
  light(fx + 4, 239, 18, 10, "soft");
  light(fx + 8, 246, 10, 3, "window");
  for (let y = 190; y < 232; y += 4) R(fx + 8, y, 10, 3, y % 8 === 0 ? STONE.base : STONE.light);
  // The anvil on its stump.
  R(1329, 250, 10, 6, P.wood);
  R(1327, 245, 14, 4, P.iron);
  R(1330, 249, 8, 2, mix(P.iron, INK, 0.3));
  R(1341, 246, 4, 2, P.iron);
  R(1327, 245, 14, 1, mix(P.iron, "#ffffff", 0.3));
  // Tools on the back wall.
  for (const tx of [1352 - 4, 1346 - 4]) R(tx, 222, 1, 12, P.iron);
  R(1336, 222, 5, 2, P.iron);
  // Posts, and a wooden shingle roof.
  R(x + 46, top, 3, G - top, P.woodDark);
  R(x + w - 3, top, 3, G - top, P.woodDark);
  const roof = (i: number) => (Math.floor(i / 2) % 2 ? P.woodDark : mix(P.wood, P.woodDark, 0.5));
  for (let i = 0; i < 22; i++) {
    const half = Math.round(((w + 12) / 2) * ((i + 1) / 22));
    R(x + w / 2 - half, top - 22 + i, half * 2, 1, sky.snow && i < 3 ? P.snow : roof(i));
  }
  R(x - 6, top - 1, w + 12, 2, EAVE);
  // The chimney stack comes up through the roof.
  for (let y = 176; y < 190; y += 4) R(fx + 8, y, 10, 3, y % 8 === 0 ? STONE.base : STONE.light);
  R(fx + 7, 174, 12, 2, STONE.dark);
  if (!reduced())
    for (let i = 0; i < 3; i++) {
      const ph = ((steps * 0.6 + i * 22) % 66) / 66;
      R(fx + 10 + Math.round(Math.sin(ph * 5 + i) * 2 + ph * 4), 170 - ph * 22, 4, 3, `rgba(70, 66, 62, ${(0.5 * (1 - ph)).toFixed(2)})`);
    }
  if (door) plankDoor(door, STONE.base);
  // A woodpile beyond the crates.
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 8 - row; i++) {
      const lx = 1396 + row * 3 + i * 5;
      R(lx, G - 4 - row * 4, 5, 4, P.woodDark);
      R(lx + 1, G - 3 - row * 4, 3, 2, P.sand);
    }
  }
}

/** One column of turf from `top` down to the ground: grass, a darker edge, and seeded tufts. */
function turfColumn(x: number, top: number, sky: Sky) {
  const h = G - top;
  if (h <= 0) return;
  R(x, top, 1, h, sky.snow ? mix(P.grass, P.snow, 0.7) : P.grass);
  R(x, top, 1, 2, sky.snow ? P.snow : mix(P.grass, "#ffffff", 0.15));
  if (sky.snow) return;
  R(x, top + 2, 1, 1, P.grassDark);
  const k = (x * 7919) % 23;
  if (k < 5) R(x, top + 4 + ((x * 13) % Math.max(1, h - 6)), 1, 2, P.grassDark);
  else if (k < 8) R(x, top + 3 + ((x * 29) % Math.max(1, h - 5)), 1, 1, mix(P.grass, "#ffffff", 0.18));
}

/** Jernhaugen: the burial mound, a turf hill whose slope is the ramp, standing stones on top, and a stone-framed doorway set into a turf shoulder at its foot. */
function mound(door: Door | undefined, sky: Sky) {
  const ramp = RAMPS[1];
  const x0 = ramp.points[0][0];
  const x1 = ramp.points[ramp.points.length - 1][0];
  // Standing stones on the top, set a little behind the line he walks along.
  const topY = Math.round(ramp.points[1][1]);
  for (const [dx, h] of [[1633, 13], [1646, 15], [1658, 11]] as const) {
    R(dx - 1, topY - 2 - h, 6, h + 3, mix(P.rockDark, INK, 0.4));
    R(dx, topY - 1 - h, 4, h + 1, P.rock);
    R(dx, topY - 1 - h, 1, h + 1, mix(P.rock, "#ffffff", 0.25));
    R(dx + 3, topY - 1 - h, 1, h + 1, P.rockDark);
    if (sky.snow) R(dx, topY - 2 - h, 4, 1, P.snow);
  }
  for (let x = x0; x < x1; x++) turfColumn(x, Math.round(rampAt(x) ?? G), sky);
  // The shoulder: a lower knoll of the same turf from column 91 to the foot of the slope, rising
  // behind the door so the doorway sits in the hill. Drawing only; he walks on the flat ground.
  const from = 91 * TILE;
  const peak = 46;
  for (let x = from; x < x0; x++) {
    const up = Math.min(1, (x - from) / 44);
    const down = Math.min(1, (x0 + 2 - x) / 14);
    const h = Math.round(peak * Math.min(up * up * (3 - 2 * up), down));
    turfColumn(x, G - h, sky);
  }
  // A few boulders in the grass.
  for (const bx of [1572, 1688, 1716]) {
    const s = Math.round(rampAt(bx) ?? G);
    R(bx, s + 4, 7, 4, P.rockDark);
    R(bx + 1, s + 4, 5, 1, P.rock);
  }
  // The doorway: two jamb stones, a lintel and the door.
  if (door) {
    const top = door.bottom - door.h;
    const edge = mix(P.rockDark, INK, 0.4);
    R(door.x - 7, top - 3, 5, door.h + 3, edge);
    R(door.x - 6, top - 3, 3, door.h + 3, P.rock);
    R(door.x + door.w + 2, top - 3, 5, door.h + 3, edge);
    R(door.x + door.w + 3, top - 3, 3, door.h + 3, P.rock);
    R(door.x - 9, top - 6, door.w + 18, 6, edge);
    R(door.x - 8, top - 5, door.w + 16, 4, P.rock);
    R(door.x - 8, top - 5, door.w + 16, 1, mix(P.rock, "#ffffff", 0.25));
    plankDoor(door, "#140d08");
  }
}

/** The cabin with the door Verkstedet, on the plateau of the cliff. */
function cabin(door: Door | undefined, sky: Sky, steps: number) {
  const x = 1916;
  const w = 64;
  const top = 112;
  const base = 160;
  for (let y = top; y < base; y += 4) {
    R(x, y, w, 3, P.wood);
    R(x, y + 3, w, 1, P.woodDark);
    R(x - 2 + ((y / 4) % 2) * 0, y, 2, 3, P.wood); // log ends at the corners
    R(x + w, y, 2, 3, P.wood);
  }
  window(x + 42, top + 18, 12, 10);
  gable(x - 8, top, w + 16, 18, sky.snow ? P.snow : P.turf);
  R(x - 8, top - 1, w + 16, 2, EAVE);
  // A stone chimney, with smoke.
  R(x + 46, top - 20, 6, 14, STONE.base);
  R(x + 45, top - 21, 8, 2, STONE.dark);
  if (!reduced())
    for (let i = 0; i < 3; i++) {
      const ph = ((steps * 0.5 + i * 26) % 78) / 78;
      R(x + 48 + Math.round(Math.sin(ph * 6 + i) * 2 + ph * 5), top - 24 - ph * 22, 4, 3, `rgba(200, 196, 190, ${(0.55 * (1 - ph)).toFixed(2)})`);
    }
  if (door) plankDoor(door, P.woodDark);
}

/** A steep gable of shingles: dark, with a lighter course every third row. */
function shingles(x: number, baseY: number, w: number, h: number, sky: Sky) {
  gable(x, baseY, w, h, sky.snow ? P.snow : P.woodDark);
  if (sky.snow) return;
  for (let i = 2; i < h; i += 3) {
    const half = Math.round((w / 2) * ((i + 1) / h));
    R(x + w / 2 - half, baseY - h + i, half * 2, 1, mix(P.wood, P.woodDark, 0.5));
  }
}

/**
 * The stave-church tower: a narrow body of dark vertical staves, three steep shingled roofs stacked
 * each narrower than the one below, and a gallery on top. The gallery is the ledge in the map
 * (row 5, five tiles wide) and rests on the ridge of the topmost roof; a thin spire with a one-pixel
 * cross rises through it, and a small dragon head sits on each end of the topmost gable.
 */
function tower(sky: Sky) {
  const cx = 2024;
  const staves = (x: number, top: number, w: number, bottom: number) => {
    R(x, top, w, bottom - top, P.woodDark);
    for (let i = 1; i < w; i += 3) R(x + i, top, 1, bottom - top, STAVE);
  };
  staves(cx - 24, 142, 48, 160);
  R(cx - 6, 146, 12, 14, DARK);
  R(cx - 4, 144, 8, 2, DARK);
  light(cx - 4, 149, 8, 9, "soft");
  shingles(cx - 32, 142, 64, 22, sky);
  staves(cx - 14, 106, 28, 126);
  R(cx - 4, 110, 8, 9, DARK);
  light(cx - 3, 112, 6, 6, "soft");
  shingles(cx - 20, 108, 40, 18, sky);
  shingles(cx - 12, 98, 24, 14, sky);
  // Dragon heads on the ends of the topmost gable.
  for (const [dx, dir] of [[cx - 13, -1], [cx + 12, 1]] as const) {
    R(dx, 95, 1, 3, P.wood);
    R(dx + (dir < 0 ? -2 : 1), 94, 2, 1, P.wood);
    R(dx + (dir < 0 ? -2 : 1), 95, 1, 1, P.sailStripe);
  }
  // The spire, with a cross, rising through the middle of the gallery (the ledge at y 80).
  R(cx, 76, 1, 10, P.woodDark);
  R(cx - 1, 73, 3, 1, P.woodDark);
  R(cx, 71, 1, 5, P.woodDark);
  // Struts from the roof up to the gallery, so the platform visibly rests on the tower.
  for (let i = 0; i < 4; i++) {
    R(cx - 12 + i, 84 + i * 3, 1, 3, P.woodDark);
    R(cx + 11 - i, 84 + i * 3, 1, 3, P.woodDark);
  }
  R(cx - 14, 83, 29, 1, EAVE);
}

/** The beacon: an iron fire basket on a post, always burning. */
function beacon(steps: number) {
  const x = 2200;
  const top = 160;
  R(x - 1, top - 20, 3, 20, P.iron);
  R(x - 7, top - 26, 15, 2, P.iron);
  for (let i = 0; i < 6; i++) R(x - 7 + i, top - 24 + i, 1, 1, P.iron);
  for (let i = 0; i < 6; i++) R(x + 7 - i, top - 24 + i, 1, 1, P.iron);
  R(x - 5, top - 22, 11, 3, mix(P.iron, INK, 0.3));
  for (let i = 0; i < 5; i++) {
    const h = 7 + (reduced() ? 1 : Math.round(3 * Math.sin(steps * 0.21 + i * 1.7)));
    R(x - 5 + i * 2 + (i % 2), top - 26 - h, 3, h, "#ff7a2a");
    R(x - 4 + i * 2 + (i % 2), top - 26 - Math.round(h * 0.6), 2, Math.round(h * 0.6), "#ffc24a");
  }
  R(x - 3, top - 28, 7, 3, "#fff0b0");
  light(x - 6, top - 36, 14, 12, "soft");
}

/** Everything behind the street's tiles: the scenery and the doors. */
export function drawBack(doors: Door[], sky: Sky, steps: number) {
  const byId = (id: string) => doors.find((d) => d.id === id);
  titleStone(sky);
  boathouse(byId("home"), sky);
  longship(sky, steps);
  farm(sky, steps);
  smithy(byId("qr"), sky, steps);
  mound(byId("maze"), sky);
  tower(sky);
  cabin(byId("github"), sky, steps);
  beacon(steps);
}

/** After dark, the ground brightens around the forge and the beacon. */
export function lightGround() {
  light(1280, 256, 70, 4, "pool");
  light(2164, 160, 70, 4, "pool");
}

