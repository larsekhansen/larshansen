import { view } from "./paint";

// The camera of every side-view scene: it looks ahead of the person in the way he faces, and eases
// towards where it wants to be with the same time constant on every screen.

/** Art pixels the camera looks ahead of him, in the way he faces. */
export const LOOK_AHEAD = 22;
/** The camera's time constant: after this long it has gone about two thirds of the way. */
export const EASE_MS = 130;

export interface Focus {
  /** The centre of the person, in world pixels. */
  x: number;
  y: number;
  facing: number;
  /** Raise the view by this much, to show a little of what is above him. */
  lookUp?: number;
}

export interface Bounds {
  /** World width. */
  width: number;
  /** The lowest the bottom of the view may go. */
  bottom: number;
  /** The highest the top of the view may go (0, the top of the world, unless the scene lets it rise above). */
  top?: number;
}

/**
 * Where the camera is after `elapsedMs`, from where it was, as the top left of the view in world
 * pixels. A world narrower or shorter than the screen is centred across and kept at the bottom.
 * `snap` puts it where it wants to be at once.
 */
export function follow(
  cam: { x: number; y: number },
  focus: Focus,
  bounds: Bounds,
  size: { w: number; h: number },
  elapsedMs: number,
  snap = false
): { x: number; y: number } {
  const maxX = bounds.width - size.w;
  const maxY = bounds.bottom - size.h;
  const tx = focus.x + focus.facing * LOOK_AHEAD - size.w / 2;
  const wantX = maxX < 0 ? maxX / 2 : Math.max(0, Math.min(maxX, tx));
  // A tall screen shows more sky, with the ground kept at the bottom.
  const minY = bounds.top === undefined ? 0 : -bounds.top;
  const wantY = maxY < 0 ? maxY : Math.max(minY, Math.min(maxY, focus.y - size.h / 2 - (focus.lookUp ?? 0)));
  const k = snap ? 1 : 1 - Math.exp(-elapsedMs / EASE_MS);
  return { x: cam.x + (wantX - cam.x) * k, y: cam.y + (wantY - cam.y) * k };
}

/** Puts the shared view where `follow` says, whole pixels for drawing and the rest for nudging. */
export function aim(at: { x: number; y: number }) {
  view.camXf = at.x;
  view.camYf = at.y;
  view.camX = Math.floor(view.camXf);
  view.camY = Math.floor(view.camYf);
}
