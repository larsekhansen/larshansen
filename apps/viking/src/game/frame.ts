import { EASE_MS, follow, type Bounds, type Focus } from "@larshansen/pixelkit/camera";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";

// Where the camera goes (order 21, ADR 0043): the kit's `follow`, and on a touch screen room under him for the
// buttons that lie over the picture. Pure, so the tests frame every level's scripted route at every phone size
// the way the page does.

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Tiles ahead of him that no button may cover, and tiles under his feet. */
export const AHEAD = 6;
export const UNDER = 2;

/**
 * He, the two tiles under his feet and six ahead the way he faces, in world pixels (`him` is his top left);
 * `more` widens it by that many pixels each way.
 */
export function aheadOf(him: { x: number; y: number }, facing: number, more = 0): Rect {
  const ahead = AHEAD * TILE;
  const x = facing < 0 ? him.x - ahead : him.x;
  return { x: x - more, y: him.y, w: PLAYER.w + ahead + 2 * more, h: PLAYER.h + UNDER * TILE };
}

/**
 * He, the two tiles under his feet and six ahead whichever way he turns (order 37): what the camera makes room for before it
 * must, so a turn finds the six tiles the other way already clear and the camera does not jump (it did, up to 76 px in a
 * frame, on a phone on its side with a notch, where the pad stands further in). `more` widens it by that many pixels each way.
 */
export function eitherWay(him: { x: number; y: number }, more = 0): Rect {
  const right = aheadOf(him, 1, more);
  const left = aheadOf(him, -1, more);
  return { x: left.x, y: right.y, w: right.x + right.w - left.x, h: right.h };
}

/**
 * The least camera y (the top of the view, world pixels), from `camY` up, at which `r` (world pixels) is under no
 * button, with the camera's left at `camX`: wherever it is under one, he is lifted until it is just above it, and
 * looked at again (it may then meet one higher up). A button wholly above him or beside him asks nothing. `buttons`
 * are in CSS pixels of the screen, `unit` CSS pixels to an art pixel.
 */
export function roomFor(r: Rect, camX: number, camY: number, unit: number, buttons: readonly Rect[], gap = 4): number {
  const x0 = (r.x - camX) * unit;
  const x1 = (r.x + r.w - camX) * unit;
  let y = camY;
  for (let tries = 0; tries <= buttons.length; tries++) {
    const top = (r.y - y) * unit;
    const bottom = (r.y + r.h - y) * unit;
    const under = buttons.find((b) => x1 > b.x - gap && x0 < b.x + b.w + gap && bottom > b.y - gap + 0.01 && top < b.y + b.h + gap);
    if (!under) break;
    y = r.y + r.h - (under.y - gap) / unit;
  }
  return y;
}

/** The buttons over the picture, and how to see him against them. */
export interface Room {
  buttons: readonly Rect[];
  unit: number;
  /** His top left as drawn. */
  him: { x: number; y: number };
  facing: number;
  /** How fast he falls (world pixels a step): the camera, easing, lags that times its time constant behind him. */
  vy?: number;
  /**
   * On the line map, the foot of the lowest board under its stations (world y; order 42). From him down to there, across the whole
   * view, nothing is under the pad's bottom row (the move pad, the dash, the jump): order 41's lower rows of boards came close to it.
   */
  below?: number;
}

/** A tile and a half more each way: the camera starts to make room before a button is in the way, so it eases there. */
const EARLY = Number(process.env.EARLY ?? 1.5) * TILE;

/**
 * Where the camera is after `elapsedMs` (the kit's `follow`), with room made under him for the buttons: as he
 * comes near one the camera eases up so he stands above it, and he is never under one (the strict region
 * holds the camera wherever easing has not yet got it).
 */
export function frame(cam: { x: number; y: number }, focus: Focus, bounds: Bounds, size: { w: number; h: number }, elapsedMs: number, snap: boolean, room?: Room): { x: number; y: number } {
  const at = follow(cam, focus, bounds, size, elapsedMs, snap);
  return room ? roomy(at, cam, focus, bounds, size, elapsedMs, snap, room) : at;
}

/** `at`, where `follow` put the camera, moved so the buttons leave him room (see `frame`). */
export function roomy(at: { x: number; y: number }, cam: { x: number; y: number }, focus: Focus, bounds: Bounds, size: { w: number; h: number }, elapsedMs: number, snap: boolean, room: Room): { x: number; y: number } {
  if (room.buttons.length === 0) return at;
  // He stands at most two thirds of the way down the screen above the pad (ADR 0021's two thirds, counted from the
  // top of its bottom row), upright and on its side, so the pad lies over ground he has passed, not over him; the bottom row
  // of the map goes on down under him where the view looks below it.
  // The pad's bottom row (the move pad, the dash, the jump): a button raised above it in a corner is left to the lift.
  const low = Math.max(...room.buttons.map((b) => b.y + b.h));
  const row = room.buttons.filter((b) => b.y + b.h >= low - 30);
  {
    const pad = size.h - Math.min(...row.map((b) => b.y)) / room.unit;
    const bottom = Math.max(bounds.bottom, Math.round(focus.y + size.h / 3 + (2 * pad) / 3));
    if (bottom > bounds.bottom) {
      bounds = { ...bounds, bottom };
      at = follow(cam, focus, bounds, size, elapsedMs, snap);
    }
  }
  // On the line map the boards hang under the deck, the lowest `below`: from him down to it, the whole view across, clear of the
  // bottom row (order 42). On a flat deck that is the same lift everywhere. The raised slot (the way in, over the jump on its side)
  // stands over the deck itself by design; the boards pass under it at the screen's edge as the stations do.
  const boards = (y: number) => (room.below === undefined ? y : roomFor({ x: at.x, y: room.him.y, w: size.w, h: room.below - room.him.y }, at.x, y, room.unit, row));
  // The camera eases, so a falling man is a step's fall times its time constant below where it means him to be: it
  // looks that much further down, and is there when he is. It eases for the ground ahead either way (order 37), so that
  // turning round does not lift it all at once where a button stands behind him.
  const early = eitherWay(room.him, EARLY);
  early.h += Math.max(0, room.vy ?? 0) * (EASE_MS / (1000 / 60));
  const lifted = boards(roomFor(early, at.x, at.y, room.unit, room.buttons));
  if (lifted > at.y) {
    // The kit's camera rises no higher than `-top` and goes no lower than `bottom`: ask it for at least `lifted`.
    const top = Math.min(bounds.top ?? 0, -lifted);
    at.y = follow(cam, focus, { ...bounds, top, bottom: Math.max(bounds.bottom, lifted + size.h) }, size, elapsedMs, snap).y;
  }
  at.y = boards(roomFor(aheadOf(room.him, room.facing), at.x, at.y, room.unit, room.buttons));
  return at;
}
