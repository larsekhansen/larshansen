import { R, ctx, lights } from "@larshansen/pixelkit/paint";
import { PALETTE } from "@larshansen/pixelkit/palette";
import type { Enemy, Shot } from "../game/enemies";
import type { Play } from "../game/play";
import { RUNE_CHARS, runeCells, type RuneChar } from "../game/runes";
import type { View } from "../levels/types";
import { glows } from "../alive/glamour";
import { drawCheese, drawSkilling } from "./pickups";
import { eyes, ringCount, rings, ringsTo } from "./sprite";
import { hazardEdge } from "./stand";
import { standTops } from "./tiles";

// The page's own drawing after dusk and of the rune's flight, which `main.ts` drew until order 33: here, in `feel`'s file (the
// first scene waits for it), they leave the first script room and the reduced-motion test can draw them. Without `feel`'s file
// (ADR 0053, amended) nothing of this is drawn: the level still starts and every solid thing is drawn plainly.

/** Eye-shine: the one bright pixel that answers a light in the dark. */
export const EYE_SHINE = "#fff1c2";

/** What the page draws for these: an enemy in its look and outline, something thrown, the paint on what he stands on. */
export interface PageDrawing {
  foe(e: Enemy, v: View): void;
  thrown(s: Shot, v: View): void;
  standing(v: View): void;
}

/**
 * After dusk the street layer has the night's tint over it, and a pigeon on dark planks is a dark shape on dark.
 * So what moves keeps the light of its outline (order 22: the warning red round what can hurt him, the calm pale
 * round what cannot), what can hurt him is a little lighter than its tinted self, with eye-shine where it has
 * eyes; the hazards get a lit edge; the skilling and the cheese shine nearly as by day; what he can stand on
 * keeps the light of its paint. In a level under the trees, the dark that comes after covers all of it but the
 * lamp's circle.
 */
export function afterDark(p: Play, v: View, page: PageDrawing) {
  const street = ctx();
  // A little of their own light back: the shapes drawn again, faint, over their tinted selves.
  street.globalAlpha = 0.25;
  const noted = ringCount();
  for (const e of p.enemies) if (e.alive) page.foe(e, v);
  for (const s of p.shots) page.thrown(s, v);
  ringsTo(noted);
  street.globalAlpha = 0.8;
  p.skilling.forEach((s, i) => s.at === null && drawSkilling(s.box.x + 1, s.box.y + 1, p.t, i));
  if (p.cheese && p.cheese.at === null) drawCheese(p.cheese.box.x, p.cheese.box.y - 2, p.t);
  street.globalAlpha = 0.85;
  for (const h of p.def.hazards ?? []) hazardEdge(h, p.t);
  // What he can stand on keeps the light of its paint.
  page.standing(v);
  standTops(p.map, p.def.art);
  // Every outline drawn on the street this frame, again, alone, over the tint.
  street.globalAlpha = v.sky.phase === "night" ? 0.9 : 0.8;
  // Each invader's glow of its own neon (order 27), under its outline.
  glows(street);
  rings(street);
  street.globalAlpha = 1;
  for (const e of p.enemies) if (e.alive) for (const [x, y] of eyes(e)) R(x, y, 1, 1, EYE_SHINE);
  // What these drew of their own lights (a brazier's glow) has had its turn: it is not drawn twice.
  lights.length = 0;
}

/**
 * The rune on its way from the level to its slot in the header, on the text canvas `u`: `k` of the way (0 to 1) from `from` to
 * `to` (CSS pixels of the stage), eased, in an arc, shrinking to half its size; `unit` CSS pixels an art pixel.
 */
export function runeFlight(u: CanvasRenderingContext2D, k: number, from: { x: number; y: number }, to: { x: number; y: number }, rune: number, unit: number) {
  const e = k * k * (3 - 2 * k);
  const x = from.x + (to.x - from.x) * e;
  const y = from.y + (to.y - from.y) * e - Math.sin(e * Math.PI) * 60;
  const n = unit * (1 - 0.5 * e);
  u.fillStyle = PALETTE.runeGlow;
  runeCells(RUNE_CHARS[rune] as RuneChar, 9, 11).forEach((row, ry) => row.forEach((on, rx) => on && u.fillRect(x + (rx - 4.5) * n, y + (ry - 5.5) * n, Math.ceil(n), Math.ceil(n))));
}
