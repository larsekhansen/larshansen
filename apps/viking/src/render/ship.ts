import { R, mix } from "@larshansen/pixelkit/paint";
import { INK, PALETTE } from "@larshansen/pixelkit/palette";

// The longship, moored: a hull of planks narrowing to the keel, shields along the rail, a dragon
// head at the prow, a striped sail hanging from the yard, and stays from the mast. Its deck, the
// ledges on its mast and its yard are ledges in the level's map; this only draws round them.

const P = PALETTE;

export interface Ship {
  /** Stern and prow, world x. */
  x0: number;
  x1: number;
  /** The deck's line. */
  deck: number;
  mast: number;
  /** The yard: its height, and the stretch the sail hangs from. */
  yard: number;
  sail0: number;
  sailW: number;
}

export function drawLongship(s: Ship) {
  const { x0, x1, deck: top } = s;
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
  // The sail hangs from the yard, striped red and cream, its belly at the bottom.
  const sailTop = s.yard + 3;
  const sailH = top - 34 - sailTop;
  for (let i = 0; i < s.sailW; i++) {
    const belly = Math.round(3 * Math.sin((Math.PI * i) / s.sailW));
    const stripe = Math.floor(i / 12) % 2 === 0;
    R(s.sail0 + i, sailTop, 1, sailH + belly, stripe ? P.sail : P.sailStripe);
    if (i % 12 === 0) R(s.sail0 + i, sailTop, 1, sailH + belly, mix(stripe ? P.sail : P.sailStripe, INK, 0.25));
  }
  R(s.sail0, sailTop, s.sailW, 1, mix(P.sail, INK, 0.3));
  for (let y = sailTop + 12; y < sailTop + sailH - 1; y += 12) R(s.sail0, y, s.sailW, 1, mix(P.sail, INK, 0.12));
  // The mast, and the stays down to the prow and the stern.
  const mastTop = s.yard - 8;
  R(s.mast - 1, mastTop, 4, top - mastTop, P.woodDark);
  R(s.mast, mastTop, 1, top - mastTop, P.wood);
  R(s.mast - 2, mastTop - 2, 6, 2, P.woodDark);
  const stay = (ax: number, ay: number, bx: number, by: number) => {
    const n = Math.abs(bx - ax);
    for (let i = 0; i <= n; i++) R(ax + (bx > ax ? i : -i), Math.round(ay + ((by - ay) * i) / n), 1, 1, mix(P.woodDark, INK, 0.3));
  };
  stay(s.mast + 1, mastTop - 1, x1 - 2, top - 6);
  stay(s.mast + 1, mastTop - 1, x0 + 2, top - 8);
}
