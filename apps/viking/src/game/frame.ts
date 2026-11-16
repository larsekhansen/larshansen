import { follow, type Bounds, type Focus } from "@larshansen/pixelkit/camera";
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
 * The least camera y (the top of the view, world pixels) at which `r` (world pixels) is clear above every
 * button it is over, with the camera's left at `camX`; -Infinity when none is in its way. `buttons` are in CSS
 * pixels of the screen, `unit` CSS pixels to an art pixel.
 */
export function roomFor(r: Rect, camX: number, unit: number, buttons: readonly Rect[], gap = 4): number {
  const x0 = (r.x - camX) * unit;
  const x1 = (r.x + r.w - camX) * unit;
  let need = -Infinity;
  for (const b of buttons) if (x1 > b.x - gap && x0 < b.x + b.w + gap) need = Math.max(need, r.y + r.h - (b.y - gap) / unit);
  return need;
}

/** The buttons over the picture, and how to see him against them. */
export interface Room {
  buttons: readonly Rect[];
  unit: number;
  /** His top left as drawn. */
  him: { x: number; y: number };
  facing: number;
}

/** Three tiles more each way: the camera starts to make room before a button is in the way, so it eases there. */
const EARLY = 3 * TILE;

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
  const early = roomFor(aheadOf(room.him, room.facing, EARLY), at.x, room.unit, room.buttons);
  if (early > -Infinity) {
    // The kit's camera rises no higher than `-top` and goes no lower than `bottom`: ask it for at least `early`.
    const top = Math.min(bounds.top ?? 0, -early);
    at.y = follow(cam, focus, { ...bounds, top, bottom: Math.max(bounds.bottom, early + size.h) }, size, elapsedMs, snap).y;
  }
  at.y = Math.max(at.y, roomFor(aheadOf(room.him, room.facing), at.x, room.unit, room.buttons));
  return at;
}
