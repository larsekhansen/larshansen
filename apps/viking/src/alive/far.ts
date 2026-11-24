import { lit } from "@larshansen/pixelkit/backdrop";
import { INK, WHITE } from "@larshansen/pixelkit/palette";
import { mix, view } from "@larshansen/pixelkit/paint";
import { custom, drawProp, type Piece } from "./ground";

// The far view's landmarks (order 43, "the far view"): what a person who knows Oslo looks for from a place, drawn in its far
// layers as a silhouette of its own, by the methods of orders 24 to 28: three or four tones of its material, lit on its left
// and its top (the light comes from the top left), shaded on its right, painted once and copied (ADR 0036). The layer's
// haze washes it toward the level's air with the rest of the layer, so it stays behind the play; its windows are noted as
// it is painted and about half of them come on after dusk, the same ones every night (ADR 0054), as the map's skylines'
// do. Each level paints its own in its own file; this is only the brush. In `feel`'s file, as the props kit is.

/** A window of a far piece: x from its left, rows `from` to `to` counted up from its foot (1 is the row on the ground). */
interface Pane {
  x: number;
  w: number;
  from: number;
  to: number;
}

/** A far piece: its pixels, kept, and its windows, of which those marked come on after dusk. */
export interface Far {
  piece: Piece;
  w: number;
  h: number;
  panes: (Pane & { on: boolean })[];
}

/** What a far piece is painted with: x from its left, `up` counted from its foot (1 is the row on the ground). */
export interface Brush {
  dot(x: number, up: number, c: string): void;
  /** Columns x to x + w - 1, rows `from` to `to`. */
  fill(x: number, w: number, from: number, to: number, c: string): void;
  /** A block of a material: its face, its left column and top row lit, its right column shaded. */
  block(x: number, w: number, from: number, to: number, c: string): void;
  /** A window: its glass, noted so that it can come on after dusk. */
  pane(x: number, w: number, from: number, to: number, c: string): void;
}

/** A tone lit toward white or shaded toward the game's dark: the ramps every far piece is drawn in. */
export const lighter = (c: string, k = 0.2) => mix(c, WHITE, k);
export const darker = (c: string, k = 0.2) => mix(c, INK, k);

const FARS = new Map<string, Far>();
/** Every far piece painted so far, by its key: for the tools that draw each one alone. */
export const farPieces = (): ReadonlyMap<string, Far> => FARS;

/** A far piece `w` x `h`, painted once by `paint` and kept by `key`. */
export function farPiece(key: string, w: number, h: number, paint: (b: Brush) => void): Far {
  let f = FARS.get(key);
  if (f) return f;
  const a: (string | null)[] = new Array(w * h).fill(null);
  const panes: Far["panes"] = [];
  const dot = (x: number, up: number, c: string) => {
    const y = h - up;
    if (x >= 0 && x < w && y >= 0 && y < h) a[y * w + x] = c;
  };
  const fill = (x: number, ww: number, from: number, to: number, c: string) => {
    for (let k = 0; k < ww; k++) for (let u = from; u <= to; u++) dot(x + k, u, c);
  };
  paint({
    dot,
    fill,
    block(x, ww, from, to, c) {
      fill(x, ww, from, to, c);
      fill(x, 1, from, to, lighter(c));
      if (ww > 2) fill(x + ww - 1, 1, from, to, darker(c, 0.16));
      fill(x, ww - 1, to, to, lighter(c, 0.3));
    },
    pane(x, ww, from, to, c) {
      fill(x, ww, from, to, c);
      // About half of them, the same ones every night.
      panes.push({ x, w: ww, from, to, on: ((x * 7 + from * 13 + key.length) % 5) < 3 });
    }
  });
  f = { piece: custom(`far ${key}`, w, h, (x, y) => a[y * w + x]), w, h, panes };
  FARS.set(key, f);
  return f;
}

/** A far piece in a far layer: its left at the layer's x, its foot on world y `foot`; one copy, its windows lit after dusk. */
export function drawFar(f: Far, x: number, foot: number) {
  x = Math.round(x);
  if (x + f.w < 0 || x > view.w) return;
  drawProp(f.piece, x + view.camX, Math.round(foot) - f.h, f.w);
  for (const p of f.panes) if (p.on) lit(x + p.x, Math.round(foot) - p.to, p.w, p.to - p.from + 1);
}
