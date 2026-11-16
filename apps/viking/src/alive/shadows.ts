import { carrierDrawn, carrierShown } from "@larshansen/pixelkit/carrier";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { ctx, view } from "@larshansen/pixelkit/paint";
import { timedPhase } from "@larshansen/pixelkit/timed";
import { SHOT, leap } from "../game/enemies";
import { SHEEP } from "../game/sheep";
import type { Play } from "../game/play";

// A shadow under everything that moves (order 23, section 2): him, every enemy and harmless mover, every thrown thing,
// every carrier, the troll and the plough. A soft dark ellipse on the ground below it, 1.2 times its width and a
// quarter of that high at rest, smaller and fainter the higher it is, faint on water, gone over a pit. It is on the
// ground under him also while he is in the air: it shows where he will land; under a gull it is how high the gull is.
//
// Drawn on the street, under what moves and over the tiles, carriers and ledges, from ellipses drawn once (a copy each,
// no rectangles). Black at a share of the ground's light: under the night's tint it is tinted with the ground, so it is
// the same step darker under every sky, and it is never a role's colour (the palette test holds the darkened fields).

/** How dark a shadow is at its edge and in its middle (black over the ground): the palette test darkens every field by the most. */
export const SHADOW = { edge: 0.22, core: 0.24 };
/** The darkest a shadow makes the ground: its middle over its edge. */
export const SHADOW_MOST = 1 - (1 - SHADOW.edge) * (1 - SHADOW.core);
/** Higher than this above the ground, nothing; between, smaller and fainter (pixels). */
export const SHADOW_FADE = 8 * TILE;
/** On water a shadow is this faint. */
const ON_WATER = 0.45;
/** How far down to look for ground under something, in tiles. */
const DEEPEST = 10;

const kept = new Map<number, HTMLCanvasElement>();
/** An ellipse `w` wide and a quarter of that high (two at least): its edge, and a darker middle. */
function ellipse(w: number): HTMLCanvasElement {
  let c = kept.get(w);
  if (c) return c;
  const h = Math.max(2, Math.round(w / 4));
  c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  for (const [scale, a] of [[1, SHADOW.edge], [0.62, SHADOW.core]] as const) {
    g.fillStyle = `rgba(0, 0, 0, ${a})`;
    for (let j = 0; j < h; j++) {
      const y = ((j + 0.5) / h) * 2 - 1;
      const half = (w / 2) * scale * Math.sqrt(Math.max(0, 1 - (y * y) / (scale * scale)));
      const n = Math.round(half * 2);
      if (n > 0) g.fillRect(Math.round(w / 2 - n / 2), j, n, 1);
    }
  }
  kept.set(w, c);
  return c;
}

/** What is under (x, y): the top of the first ground, ledge, carrier or level's own ground at or below y, and whether it is water; null over a pit. */
export function groundUnder(p: Play, x: number, y: number, alpha: number, skipCarrier = -1): { y: number; water: boolean } | null {
  let best: number | null = null;
  let water = false;
  const map = p.map;
  const ramp = map.rampAt(x);
  if (ramp !== null && ramp >= y - 2) best = ramp;
  const c = Math.floor(x / TILE);
  for (let r = Math.max(0, Math.floor((y - 1) / TILE)), last = r + DEEPEST; r < Math.min(map.rows, last); r++) {
    if (best !== null && r * TILE >= best) break;
    if (map.isWater(c, r)) {
      best = r * TILE;
      water = true;
      break;
    }
    if ((map.isSolid(c, r) || map.isOneWay(c, r)) && r * TILE >= y - 2) {
      best = r * TILE;
      break;
    }
  }
  const nearer = (top: number, x0: number, w: number) => {
    if (x < x0 || x > x0 + w || top < y - 2 || (best !== null && top >= best)) return;
    best = top;
    water = false;
  };
  p.def.carriers.forEach((d, i) => {
    if (i === skipCarrier || !carrierShown(d, p.t)) return;
    const at = carrierDrawn(d, p.t, alpha);
    nearer(at.y, at.x, d.w);
  });
  for (const l of p.def.timed) if (timedPhase(p.t, l) !== "off") nearer(l.y, l.x, l.w);
  if (p.grounds) for (const s of p.def.grounds?.stands?.(p.grounds.state, p.t) ?? []) nearer(s.y, s.x, s.w);
  return best === null ? null : { y: best, water };
}

/** One shadow: under the middle `cx` of something `w` wide whose foot is at `feet`. */
function cast(p: Play, cx: number, feet: number, w: number, alpha: number, skipCarrier = -1) {
  if (cx < view.camX - 48 || cx > view.camX + view.w + 48) return;
  const under = groundUnder(p, cx, feet, alpha, skipCarrier);
  if (!under) return;
  const h = Math.max(0, under.y - feet);
  const f = 1 - h / SHADOW_FADE;
  if (f <= 0) return;
  const size = Math.max(3, Math.round(1.2 * w * (1 - 0.5 * (h / SHADOW_FADE))));
  const g = ctx();
  g.globalAlpha = f * (under.water ? ON_WATER : 1);
  g.drawImage(ellipse(size), Math.round(cx - size / 2) - view.camX, under.y - view.camY);
  g.globalAlpha = 1;
}

/**
 * Every shadow of a frame, on the street: what carries (not on water, where it floats), the troll and the plough,
 * sheep, enemies, what is thrown, and him (`body`: where he is drawn; null while he is in a cannon's barrel).
 */
export function shadows(p: Play, body: { x: number; y: number } | null, alpha: number) {
  p.def.carriers.forEach((d, i) => {
    if (!carrierShown(d, p.t)) return;
    const at = carrierDrawn(d, p.t, alpha);
    const under = groundUnder(p, at.x + d.w / 2, at.y + 6, alpha, i);
    if (under && !under.water && under.y > at.y + 6) cast(p, at.x + d.w / 2, at.y + 6, d.w, alpha, i);
  });
  const troll = p.troll && p.def.trollRules?.box(p.troll);
  if (troll) cast(p, troll.x + troll.w / 2, troll.y + troll.h, troll.w, alpha);
  const boss = p.boss?.rules.blocks?.(p.boss.state);
  if (boss) cast(p, boss.x + boss.w / 2, boss.y + boss.h, boss.w, alpha);
  for (const s of p.sheep) cast(p, s.x, s.bottom, SHEEP.w + 4, alpha);
  // An enemy is drawn wider than its box and outlined two pixels all round: its shadow is as wide as what is seen.
  for (const e of p.enemies) if (e.alive && (e.def.kind !== "jumper" || leap(e, p.t).up > 0)) cast(p, e.x, e.y, e.w + 6, alpha);
  for (const s of p.shots) cast(p, s.x, s.y + SHOT.h / 2, SHOT.w, alpha);
  if (body) cast(p, body.x + PLAYER.w / 2, body.y + PLAYER.h, PLAYER.w, alpha);
}
