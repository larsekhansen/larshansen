import { TILE } from "@larshansen/pixelkit/config";
import { view } from "@larshansen/pixelkit/paint";
import { snap, textCtx, unit } from "@larshansen/pixelkit/text";

// Something in front of him now and then (order 23, section 3.4): a lamp post, a mast, a trunk, reeds, a rope, passing
// between him and the screen at 1.75 times the camera's speed, dark and plain, narrower than a tenth of the view. Three
// or four a level at most, each where nothing he must read is behind it as it crosses the six tiles ahead of him
// (`forecheck.ts`, held by `fore.test.ts` from the level's own data and its route). Drawn on the text canvas over him;
// on a touch screen never over the pad's buttons (ADR 0043); not with reduced motion, where every layer goes at the
// camera's speed and a thing in front of him would only stand there in the way.

/** How fast it goes, as a share of the camera's speed. */
export const FORE_SPEED = 1.75;
/** The stretch a thing passing him at x crosses ahead of him: from a little before x to six tiles after it. */
export const READ_AHEAD = 6 * TILE;
export const READ_BEHIND = Math.ceil((6 * TILE) / FORE_SPEED);

export type ForeKind = "post" | "mast" | "trunk" | "reeds" | "rope";
/** A thing in front: where it passes him (world x, his middle), and what it is. */
export interface Fore {
  x: number;
  kind: ForeKind;
}

/**
 * Each level's things in front, by its id (placed with `tools/glance/fore.ts`, held by `fore.test.ts`): only where the
 * stretch ahead of him has nothing he must read, which seven levels nowhere have (their skilling, jumps and patrols are
 * too close together for it): Stortinget, Vålerenga, Bygdøy, Vigelandsparken, Korketrekkeren, Bjørvika and Gamlebyen.
 */
const T = TILE;
export const FORE: Record<string, readonly Fore[]> = {
  langkaia: [{ x: 175 * T, kind: "mast" }],
  akershus: [{ x: 272 * T, kind: "post" }],
  radhuset: [{ x: 156.5 * T, kind: "post" }],
  slottet: [{ x: 88.25 * T, kind: "post" }, { x: 144.5 * T, kind: "trunk" }, { x: 246.75 * T, kind: "trunk" }],
  holmenkollen: [{ x: 256 * T, kind: "trunk" }, { x: 270 * T, kind: "trunk" }],
  akerselva: [{ x: 164.25 * T, kind: "trunk" }],
  nordmarka: [{ x: 15.5 * T, kind: "trunk" }, { x: 127.5 * T, kind: "trunk" }, { x: 229 * T, kind: "trunk" }],
  ekeberg: [{ x: 127.5 * T, kind: "trunk" }, { x: 216 * T, kind: "trunk" }],
  ostensjovannet: [{ x: 257.75 * T, kind: "reeds" }]
};

/** Its silhouette's colour: near-black, a little of the night in it, plain. */
const DARK = "rgba(14, 16, 24, 0.92)";
const DARKER = "rgba(8, 9, 14, 0.95)";

/** How wide each kind is (art pixels): never more than a tenth of the narrowest view (240). */
export const FORE_WIDTH: Record<ForeKind, number> = { post: 4, mast: 3, trunk: 12, reeds: 14, rope: 10 };

/**
 * The things in front for this level, over him on the text canvas. `padTop`: on a touch screen the top of the pad's
 * buttons (CSS pixels), under which nothing is drawn.
 */
export function drawFore(id: string, padTop: number | null) {
  const list = FORE[id];
  if (!list || view.reduced) return;
  const g = textCtx();
  const n = unit();
  const mid = view.camXf + view.w / 2;
  const bottom = padTop ?? view.cssH;
  for (const f of list) {
    const w = FORE_WIDTH[f.kind];
    // Where it is on the screen (art pixels): at the middle as the camera's middle passes its place, faster than the street.
    const sx = (f.x - mid) * FORE_SPEED + view.w / 2;
    if (sx < -w - 2 || sx > view.w + 2) continue;
    const x = snap((sx - w / 2) * n);
    const H = view.cssH;
    const r = (ax: number, ay: number, aw: number, ah: number, c: string) => {
      const y0 = Math.max(0, ay);
      const y1 = Math.min(bottom, ay + ah);
      if (y1 <= y0) return;
      g.fillStyle = c;
      g.fillRect(x + ax * n, y0, aw * n, y1 - y0);
    };
    switch (f.kind) {
      case "post":
        // A lamp post: its shaft up the screen, the lamp's arm and head near the top.
        r(1, H * 0.22, 2, H, DARK);
        r(0, H * 0.22, 6, 1.5 * n, DARK);
        r(4, H * 0.22, 3, 3 * n, DARKER);
        r(0, H - 4 * n, 4, 4 * n, DARKER);
        break;
      case "mast":
        // A mast's pole from below to above the screen, a stay leaning off it.
        r(1, 0, 2, H, DARK);
        for (let k = 0; k < 24; k++) r(2 + Math.round(k * 0.5), H * 0.1 + k * 3 * n, 1, 3 * n, DARKER);
        break;
      case "trunk":
        // A tree's trunk, wide, its bark darker at the edges, a branch off it near the top.
        r(2, 0, 8, H, DARK);
        r(1, 0, 1, H, DARKER);
        r(10, 0, 1, H, DARKER);
        r(10, H * 0.15, 4, 2 * n, DARK);
        break;
      case "reeds":
        // Reeds at the foot of the screen, their heads leaning.
        for (let k = 0; k < 7; k++) {
          const h = (14 + ((k * 5) % 9)) * n * 1.6;
          r(k * 2, H - h, 1, h, k % 2 ? DARK : DARKER);
          r(k * 2 + (k % 2 ? 1 : -1), H - h - 3 * n, 1, 4 * n, DARKER);
        }
        break;
      case "rope":
        // A rope from the top of the screen, hanging in a curve, as a mooring line or a rigging does.
        for (let k = 0; k < 20; k++) r(Math.round(10 * Math.sin((k / 20) * Math.PI * 0.5)), k * 4 * n, 1, 4 * n, DARK);
        break;
    }
  }
}
