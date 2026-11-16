import { TILE } from "@larshansen/pixelkit/config";
import { mix, view } from "@larshansen/pixelkit/paint";
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

/** How wide each kind is (art pixels): never more than a tenth of the narrowest view (240). */
export const FORE_WIDTH: Record<ForeKind, number> = { post: 9, mast: 16, trunk: 14, reeds: 14, rope: 10 };

/**
 * Its tones (order 24): the level's own air darkened, not black: a body, a darker shade, and a rim a little lighter on
 * the side the light comes from, so it reads as a thing standing near, out of focus, in the same air as the rest.
 */
function tones(air: string) {
  return { rim: mix(air, NEAR, 0.7), body: mix(air, NEAR, 0.8), deep: mix(air, NEAR, 0.88) };
}
const NEAR = "#07080d";

/** How much of the things in front shows (0 to 1): they step out of the way while he reads a bubble or sits, and come back after. */
let shown = 1;

/** A rectangle in CSS pixels. */
type Box = { x: number; y: number; w: number; h: number };

/**
 * The things in front for this level, over him on the text canvas, in a dark tone of its air. `padTop`: on a touch
 * screen the top of the pad's buttons (CSS pixels), under which nothing is drawn. `banner`: where the place's name is
 * (nothing is drawn over it). `quiet`: a bubble is up or he sits: they fade away for as long, so none stands over what
 * he reads or over him at rest.
 */
export function drawFore(id: string, padTop: number | null, air: string, banner: Box | null, quiet: boolean) {
  const list = FORE[id];
  shown = Math.max(0, Math.min(1, shown + (quiet ? -0.1 : 0.05)));
  if (!list || view.reduced || shown <= 0) return;
  const g = textCtx();
  const n = unit();
  const mid = view.camXf + view.w / 2;
  const bottom = padTop ?? view.cssH;
  const c = tones(air);
  g.save();
  g.globalAlpha *= shown;
  if (banner) {
    g.beginPath();
    g.rect(0, 0, view.cssW, view.cssH);
    g.rect(banner.x, banner.y, banner.w, banner.h);
    g.clip("evenodd");
  }
  for (const f of list) {
    const w = FORE_WIDTH[f.kind];
    // Where it is on the screen (art pixels): at the middle as the camera's middle passes its place, faster than the street.
    const sx = (f.x - mid) * FORE_SPEED + view.w / 2;
    if (sx < -w - 2 || sx > view.w + 2) continue;
    const x = snap((sx - w / 2) * n);
    const H = view.cssH;
    const r = (ax: number, ay: number, aw: number, ah: number, colour: string) => {
      const y0 = Math.max(0, ay);
      const y1 = Math.min(bottom, ay + ah);
      if (y1 <= y0) return;
      g.fillStyle = colour;
      g.fillRect(x + ax * n, y0, aw * n, y1 - y0);
    };
    switch (f.kind) {
      case "post": {
        // A lamp post: a plinth, its shaft lit down its left, a crook at the top and the lantern hanging from it (a
        // cap, its panes a shade lighter, a finial).
        const top = H * 0.24;
        r(3, top, 2, H, c.body);
        r(3, top, 1, H, c.rim);
        r(2, H - 9 * n, 4, 9 * n, c.body);
        r(1, H - 4 * n, 6, 4 * n, c.deep);
        r(3, top - 3 * n, 4, 2 * n, c.body);
        r(6, top - 2 * n, 1, 3 * n, c.body);
        r(4, top + 1 * n, 5, 1 * n, c.deep);
        r(5, top + 2 * n, 3, 4 * n, c.rim);
        r(5, top + 2 * n, 1, 4 * n, c.body);
        r(4, top + 6 * n, 5, 1 * n, c.deep);
        r(6, top + 7 * n, 1, 1 * n, c.deep);
        break;
      }
      case "mast": {
        // A ship's mast, stepped below the screen: the pole lit down its left, a yard across it with the sail furled
        // along it in lumps, a shroud down to the rail, the truck at its head.
        const head = H * 0.14;
        const yard = head + 10 * n;
        r(7, head, 2, H, c.body);
        r(7, head, 1, H, c.rim);
        r(6, head - 2 * n, 4, 2 * n, c.deep);
        r(0, yard, 16, 1 * n, c.deep);
        for (let k = 0; k < 15; k++) r(k, yard + 1 * n, 1, (2 + (k % 3 === 1 ? 1 : 0)) * n, k % 4 === 0 ? c.deep : c.body);
        r(1, yard + 1 * n, 14, 1 * n, c.rim);
        for (let k = 0; k < 30; k++) r(9 + Math.round(k * 0.22), yard + 4 * n + k * 3 * n, 1, 3 * n, c.deep);
        break;
      }
      case "trunk": {
        // A trunk, its bark in furrows, lit down its left and dark at its right edge, a branch off it high up with a
        // few twigs, the roots flaring at its foot.
        r(3, 0, 8, H, c.body);
        r(3, 0, 1, H, c.rim);
        r(10, 0, 1, H, c.deep);
        for (let k = 0; k < 9; k++) r(5 + ((k * 3) % 5), (k * 37) % 100 / 100 * H, 1, (6 + (k % 3) * 3) * n, c.deep);
        r(11, H * 0.15, 3, 2 * n, c.body);
        r(13, H * 0.15 - 3 * n, 1, 3 * n, c.deep);
        r(12, H * 0.15 + 2 * n, 1, 2 * n, c.deep);
        r(1, H - 5 * n, 2, 5 * n, c.body);
        r(11, H - 4 * n, 2, 4 * n, c.deep);
        r(0, H - 2 * n, 14, 2 * n, c.deep);
        break;
      }
      case "reeds":
        // Reeds at the foot of the screen, their heads (bulrushes) leaning.
        for (let k = 0; k < 7; k++) {
          const h = (14 + ((k * 5) % 9)) * n * 1.6;
          r(k * 2, H - h, 1, h, k % 2 ? c.body : c.deep);
          if (k % 3 === 0) r(k * 2, H - h - 3 * n, 2, 4 * n, c.body);
          else r(k * 2 + (k % 2 ? 1 : -1), H - h - 3 * n, 1, 4 * n, c.deep);
        }
        break;
      case "rope":
        // A rope from the top of the screen, hanging in a curve, as a mooring line or a rigging does.
        for (let k = 0; k < 20; k++) r(Math.round(10 * Math.sin((k / 20) * Math.PI * 0.5)), k * 4 * n, 1, 4 * n, c.body);
        break;
    }
  }
  g.restore();
}
