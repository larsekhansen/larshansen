import { TILE } from "./config";
import { shakeX } from "./doors";
import type { Sky } from "./oslo";
import { R, light, mix, view, wdisc } from "./paint";
import { DOORWAY, FIRE, FLAG, GLASS, GROUND, MASONRY, METAL, PAINT, PALETTE, PLANTS, SNOW, STONE, WHITE } from "./palette";
import type { Board } from "./text";

// The things every scene builds from: sign boards, crates, ledges, doors, windows, lamp posts,
// flags, trees, chimney smoke, and the top of the ground. One drawing of each, in world pixels, so
// a birch in one game is the birch in the other. Each is drawn as the front page drew it.

/** A sign board, on a post down to `postBottom` when it stands on one. The words are drawn sharp by the text layer. */
export function signBoard(cx: number, y: number, w: number, postBottom?: number) {
  if (postBottom !== undefined) R(cx - 1, y + 10, 2, postBottom - y - 10, PALETTE.woodDark);
  R(cx - w / 2, y, w, 10, PALETTE.board);
  R(cx - w / 2, y + 10, w, 1, PALETTE.boardEdge);
}

/** The columns and rows of a map that are on screen. */
export function visibleTiles(map: { cols: number; rows: number }) {
  return {
    c0: Math.max(0, Math.floor(view.camX / TILE)),
    c1: Math.min(map.cols - 1, Math.floor((view.camX + view.w) / TILE)),
    r0: Math.max(0, Math.floor(view.camY / TILE)),
    r1: Math.min(map.rows - 1, Math.floor((view.camY + view.h) / TILE))
  };
}

/** Calls `draw` for every tile of the map on screen, row by row: its letter, column, row and top left in world pixels. */
export function forVisibleTiles(map: { map: readonly string[]; cols: number; rows: number }, draw: (t: string, c: number, r: number, x: number, y: number) => void) {
  const { c0, c1, r0, r1 } = visibleTiles(map);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) draw(map.map[r][c], c, r, c * TILE, r * TILE);
}

/** The sign boards of a scene; the text layer writes on them. */
export function drawBoards(boards: Board[]) {
  for (const b of boards) signBoard(b.cx, b.y, b.w, b.post);
}

/** Which sides of a tile get the outline: those where the neighbour is not the same thing. */
export interface Edges {
  left: boolean;
  right: boolean;
  top: boolean;
}

export function edgesOf(tileAt: (c: number, r: number) => string, c: number, r: number): Edges {
  const t = tileAt(c, r);
  return { left: tileAt(c - 1, r) !== t, right: tileAt(c + 1, r) !== t, top: tileAt(c, r - 1) !== t };
}

/** The one-pixel outline that everything you can stand on has, so it is easy to tell from scenery. */
export function outlineTile(x: number, y: number, e: Edges, color: string) {
  if (e.left) R(x, y, 1, TILE, color);
  if (e.right) R(x + TILE - 1, y, 1, TILE, color);
  if (e.top) R(x, y, TILE, 1, color);
}

/** A wooden crate, one tile. `open`: nothing solid on top, so its top edge catches the light (or the snow). */
export function crate(x: number, y: number, e: Edges, open: boolean, snow: boolean) {
  R(x, y, TILE, TILE, PALETTE.crate);
  R(x + 1, y + 1, TILE - 2, TILE - 2, PALETTE.wood);
  for (let i = 0; i < TILE - 2; i++) R(x + 1 + i, y + 1 + i, 1, 1, PALETTE.crateShade);
  outlineTile(x, y, e, PALETTE.crateEdge);
  if (open) R(x + 1, y + 1, TILE - 2, 1, snow ? SNOW.lying : PALETTE.crateTop);
}

export interface LedgeLook {
  body: string;
  /** The trodden top edge. */
  top: string;
  /** The underside and the ends. */
  edge: string;
  /** The joints every six pixels. */
  joint: string;
}
/** A stone lintel left from an arch: the front page's ledges. */
export const STONE_LEDGE: LedgeLook = { body: MASONRY.lintel, top: MASONRY.worn, edge: MASONRY.edge, joint: STONE.mortar };
/** Planks: a deck, a spar, a gallery. */
export const WOOD_LEDGE: LedgeLook = { body: PALETTE.wood, top: mix(PALETTE.wood, WHITE, 0.25), edge: PALETTE.woodDark, joint: PALETTE.woodDark };

/** One tile of a one-way ledge, four pixels thick. `first` and `last`: the ledge ends at this tile's left or right. */
export function ledge(x: number, y: number, look: LedgeLook, first: boolean, last: boolean, snow: boolean) {
  R(x, y, TILE, 4, look.body);
  R(x, y, TILE, 1, snow ? SNOW.lying : look.top);
  R(x, y + 4, TILE, 1, look.edge);
  for (let i = 3; i < TILE; i += 6) R(x + i, y + 1, 1, 3, look.joint);
  if (first) R(x, y, 1, 5, look.edge);
  if (last) R(x + TILE - 1, y, 1, 5, look.edge);
}

/** A ground tile's earth, with one pebble in it at a place that comes from the tile. */
export function groundFill(x: number, y: number, c: number, r: number, fill: string) {
  R(x, y, TILE, TILE, fill);
  R(x + ((c * 7 + r * 3) % 12) + 1, y + ((c * 5 + r * 11) % 9) + 5, 2, 1, GROUND.pebble);
}

/** The top of the ground where it meets the air: a band of grass or stone with a darker line and dots, or snow. */
export function groundTop(x: number, y: number, c: number, top: string, dot: string, snow: boolean) {
  R(x, y, TILE, 4, snow ? SNOW.lying : top);
  R(x, y + 4, TILE, 1, snow ? SNOW.shade : dot);
  if (!snow) for (let i = 1; i < TILE; i += 4) R(x + i + (c % 2), y + 1 + (i % 3), 1, 1, dot);
}

/**
 * A window with a frame and a cross. After dark each of its four panes lights up on its own, so the
 * cross stays dark across the light.
 */
export function pane(x: number, y: number, w: number, h: number, frame: string = PAINT.trim, glass: string = GLASS.pane) {
  R(x - 1, y - 1, w + 2, h + 2, frame);
  R(x, y, w, h, glass);
  R(x + Math.floor(w / 2), y, 1, h, frame);
  R(x, y + Math.floor(h / 2), w, 1, frame);
  const hw = Math.floor(w / 2);
  const hh = Math.floor(h / 2);
  light(x, y, hw, hh);
  light(x + hw + 1, y, w - hw - 1, hh);
  light(x, y + hh + 1, hw, h - hh - 1);
  light(x + hw + 1, y + hh + 1, w - hw - 1, h - hh - 1);
}

/** What a door needs to be drawn: where it stands, and whether it is open, shaking or locked. */
export interface DoorLook {
  x: number;
  w: number;
  h: number;
  bottom: number;
  open: boolean;
  shake: number;
  soon?: boolean;
}

function padlock(x: number, y: number) {
  R(x, y + 3, 6, 5, METAL.padlock);
  R(x + 1, y, 4, 3, METAL.shackle);
  R(x + 2, y + 1, 2, 2, METAL.keyhole);
}

/** A painted door with two panels and a brass knob, padlocked while what is behind it is still to come. */
export function panelDoor(d: DoorLook, color: string, panel: string) {
  const ox = shakeX(d.shake);
  const top = d.bottom - d.h;
  R(d.x + ox, top, d.w, d.h, d.open ? DOORWAY.wood : color);
  if (!d.open) {
    R(d.x + ox + 2, top + 2, d.w - 4, 12, panel);
    R(d.x + ox + 2, top + 17, d.w - 4, 12, panel);
    R(d.x + ox + d.w - 4, top + 16, 2, 2, METAL.brass);
  }
  if (d.soon) padlock(d.x + ox + 5, top + 10);
}

/** A plank door with two iron bands in a frame. It stands open, as a dark hole, while he goes through. */
export function plankDoor(d: DoorLook, frame: string) {
  const ox = shakeX(d.shake);
  const top = d.bottom - d.h;
  R(d.x - 2 + ox, top - 2, d.w + 4, d.h + 2, frame);
  R(d.x + ox, top, d.w, d.h, d.open ? DOORWAY.wood : PALETTE.wood);
  if (d.open) return;
  for (let i = 4; i < d.w; i += 4) R(d.x + ox + i, top, 1, d.h, PALETTE.woodDark);
  R(d.x + ox, top + 6, d.w, 2, PALETTE.iron);
  R(d.x + ox, top + 22, d.w, 2, PALETTE.iron);
  R(d.x + ox + d.w - 4, top + 15, 2, 3, PALETTE.iron);
}

/** A street lamp `tall` pixels high on the ground at `ground`, with a broad hat over the bulb. */
export function lampPost(x: number, ground: number, tall: number) {
  const top = ground - tall;
  R(x, top, 2, tall, METAL.lampPost);
  R(x - 4, top - 7, 10, 2, METAL.lampPost);
  R(x - 3, top - 5, 8, 1, METAL.lampHat);
  R(x - 2, top - 4, 6, 3, METAL.lampGlass);
  light(x - 2, top - 4, 6, 3, "lamp");
}

/** After dark the ground brightens under a lamp post at x. Registered with the ground, not the lamp, so it lies on top of the street. */
export function lampPool(x: number, ground: number) {
  light(x - 12, ground, 26, 6, "pool");
}

/** The Norwegian flag on a white pole from the ground up to `top`. */
export function flagPole(x: number, top: number, ground: number) {
  R(x, top, 1, ground - top, METAL.flagpole);
  R(x - 1, top - 2, 3, 2, METAL.brass);
  flagCloth(x + 1, top);
}

/** The Norwegian flag itself, 13 x 9, its top left at (x, top). */
export function flagCloth(x: number, top: number) {
  R(x, top, 13, 9, FLAG.red);
  R(x + 3, top, 3, 9, FLAG.white);
  R(x, top + 3, 13, 3, FLAG.white);
  R(x + 4, top, 1, 9, FLAG.blue);
  R(x, top + 4, 13, 1, FLAG.blue);
}

/** A leaf tree or a birch, by the season: green, autumn colours from September, bare from December to March. */
export function tree(x: number, ground: number, sky: Sky, birch = false) {
  const autumn = sky.month >= 9 && sky.month <= 11;
  const bare = sky.month === 12 || sky.month <= 3;
  R(x, ground - 26, 3, 26, birch ? PLANTS.birchBark : PLANTS.bark);
  if (birch) for (let y = ground - 24; y < ground; y += 5) R(x + (y % 2), y, 2, 1, PLANTS.birchMark);
  if (bare) {
    R(x - 4, ground - 30, 1, 6, PLANTS.bark);
    R(x + 6, ground - 32, 1, 8, PLANTS.bark);
    if (sky.snow) R(x - 4, ground - 31, 12, 1, SNOW.lying);
    return;
  }
  const crown = autumn ? (birch ? PLANTS.birchAutumn : PLANTS.autumn) : birch ? PLANTS.birchLeaves : PLANTS.leaves;
  const shine = autumn ? (birch ? PLANTS.birchAutumnShine : PLANTS.autumnShine) : birch ? PLANTS.birchShine : PLANTS.leavesShine;
  wdisc(x + 1, ground - 34, birch ? 9 : 12, crown);
  wdisc(x - 2, ground - 38, birch ? 4 : 5, shine);
}

export interface SmokeLook {
  /** How fast the puffs rise, per step. */
  rate: number;
  /** Steps between puffs, and steps a puff lives. */
  spacing: number;
  period: number;
  /** How far a puff rises before it is gone. */
  rise: number;
  /** How much it sways, and drifts to the right. */
  sway: number;
  drift: number;
  /** The smoke's colour as "r, g, b", and its alpha when it leaves the chimney. */
  rgb: string;
  alpha: number;
}
/** Smoke from a wood stove: pale, drifting off to the right. */
export const STOVE_SMOKE: SmokeLook = { rate: 0.5, spacing: 24, period: 72, rise: 20, sway: 6, drift: 5, rgb: FIRE.smoke, alpha: 0.55 };

/** Three puffs of smoke rising from (x, y), on the step count. Still with reduced motion: the caller leaves it out then. */
export function smoke(x: number, y: number, steps: number, s: SmokeLook = STOVE_SMOKE) {
  for (let i = 0; i < 3; i++) {
    const ph = ((steps * s.rate + i * s.spacing) % s.period) / s.period;
    R(x + Math.round(Math.sin(ph * s.sway + i) * 2 + ph * s.drift), y - ph * s.rise, 4, 3, `rgba(${s.rgb}, ${(s.alpha * (1 - ph)).toFixed(2)})`);
  }
}
