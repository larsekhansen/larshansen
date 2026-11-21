import { TILE } from "./config";
import { R, mix, view } from "./paint";
import { INK, PALETTE, SHIMMER, WHITE } from "./palette";
import { timedPhase, type Beat, type TimedLedge } from "./timed";

// An oar bank: ledges on a beat (timed.ts) drawn as oars. Each oar comes out of its port in the hull,
// and while it is "on" its blade lies flat, a ledge to stand on; it warns with the maze's shimmer, and
// "off" it is pulled up out of reach. Set in a row up a hull, each a stroke behind the one below, they
// are a stair that comes and goes in turn.

export interface Oar extends TimedLedge {
  /** The port in the hull it comes out of: the loom runs from here to the blade. */
  port: { x: number; y: number };
}

/**
 * A bank of `n` oars, the first blade's top left at (x, y), each next one `dx` across and `dy` down
 * (negative: up), `w` wide; their ports along the hull from `port`, `portDx` apart. All on one beat,
 * each `turn` steps behind the one before.
 */
export function oarBank(o: { x: number; y: number; n: number; dx: number; dy: number; w?: number; beat: Beat; turn: number; port: { x: number; y: number }; portDx: number }): Oar[] {
  return Array.from({ length: o.n }, (_, k) => ({
    x: o.x + k * o.dx,
    y: o.y + k * o.dy,
    w: o.w ?? TILE,
    on: o.beat.on,
    warn: o.beat.warn,
    off: o.beat.off,
    offset: (o.beat.offset ?? 0) - k * o.turn,
    port: { x: o.port.x + k * o.portDx, y: o.port.y }
  }));
}

/** A line of pixels from (ax, ay) to (bx, by), `thick` high. */
function line(ax: number, ay: number, bx: number, by: number, color: string, thick = 2) {
  const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
  for (let i = 0; i <= n; i++) R(Math.round(ax + ((bx - ax) * i) / n), Math.round(ay + ((by - ay) * i) / n), 1, thick, color);
}

/** One oar: its loom from the port, its blade flat while it holds him (with the shimmer as it warns), pulled up out of reach while it is off. */
export function drawOar(o: Oar, step: number, wood: string = PALETTE.wood) {
  const phase = timedPhase(step, o);
  const dark = mix(wood, INK, 0.4);
  // The port: a dark round hole with a lighter rim.
  R(o.port.x - 2, o.port.y - 2, 5, 5, mix(wood, INK, 0.2));
  R(o.port.x - 1, o.port.y - 1, 3, 3, INK);
  if (phase === "off") {
    // Shipped: the oar drawn in and raised, its blade up by the port.
    line(o.port.x, o.port.y, o.port.x + Math.sign(o.x - o.port.x) * 6, o.port.y - 14, dark);
    R(o.port.x + Math.sign(o.x - o.port.x) * 6 - 2, o.port.y - 22, 5, 9, wood);
    return;
  }
  const bx = o.x + o.w / 2;
  line(o.port.x, o.port.y, bx, o.y + 1, dark);
  line(o.port.x, o.port.y - 1, bx, o.y, wood, 1);
  // The blade: a broad flat board, his foothold.
  R(o.x, o.y, o.w, 2, mix(wood, WHITE, 0.25));
  R(o.x, o.y + 2, o.w, 2, wood);
  R(o.x, o.y + 4, o.w, 1, dark);
  // With reduced motion the warning holds still instead of blinking, as a ledge's does (order 30).
  if (phase === "warn" && (view.reduced || Math.floor(step / 8) % 2 === 0)) {
    R(o.x - 2, o.y - 2, o.w + 4, 2, SHIMMER);
    R(o.x - 2, o.y + 5, o.w + 4, 2, SHIMMER);
    R(o.x - 2, o.y - 2, 2, 9, SHIMMER);
    R(o.x + o.w, o.y - 2, 2, 9, SHIMMER);
  }
}
