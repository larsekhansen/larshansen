import { ENEMY } from "@larshansen/pixelkit/palette";
import { ROLES } from "@larshansen/pixelkit/palette";
import { view } from "@larshansen/pixelkit/paint";
import { invaders, lean, type Sprite } from "../render/sprite";
import type { Frame } from "./frames";

// The glamour (order 27, ADR 0050). The Neon Invaders have put a spell on Oslo: everything under it is glammed up in
// neon and out to hurt him. It is a spell, not a costume, so a stomp breaks it and the creature is itself again; a
// rune lifts it from a whole station. What makes the invaders one gang is not one hue but one treatment:
//
//   neon      bodies in the glamour's family (`ROLES.glamour`): the warm end the enemy palette had (plum as magenta,
//             orange as laser orange, poison as acid green) and the rest (hot pink, magenta, purple, electric blue,
//             lime); a level leans its own way (`LEANS`), so sixteen levels do not look alike
//   sheen     two neons on a figure's lit side: the first along its top where the light falls, the second down its
//             back, as a sign's tubes light what stands under them (`sheened`, worked out once a frame)
//   marks     a few glam marks drawn into its maps, chosen to suit the animal (shades, a crest, a headband, leg
//             warmers, shoulder pads): pieces marked `glam` (`frames.ts`), so its bare self is the same map without them
//   glow      after dark, a soft glow of its own hue under the red outline (`render/sprite.ts`)
//
// The marks and the sheen are drawn in two letters, `N` and `n`, whose colours are the level's lean (the page maps them
// as it records a shape: `lean` in `render/sprite.ts`).

/** How a look is drawn just now: glammed (as the page draws an invader), bare (its natural self) or its marks alone (what flies off). */
export const glam: { mode: "glam" | "bare" | "marks" } = { mode: "glam" };

/** The two neons the marks and the sheen are drawn in, as the frames have them: the first (the top) and the second (the back). */
export const NEON_A = ENEMY.hotPink;
export const NEON_B = ENEMY.blue;

/**
 * Each level's lean (order 27, section 1): the two neons of its marks and sheen, and where a level leans its bodies
 * another way, their plum ramp too. Nordmarka acid green and purple in the dark; Bjørvika electric blue and pink among
 * the cranes; the rest each a pair of their own. Every colour here is the glamour's (the palette test holds it).
 */
export const LEANS: Record<string, Record<string, string>> = {
  langkaia: {},
  akershus: { [NEON_A]: ENEMY.magenta, [NEON_B]: ENEMY.lime },
  radhuset: { [NEON_B]: ENEMY.poison },
  slottet: { [NEON_A]: ENEMY.magenta },
  holmenkollen: { [NEON_A]: ENEMY.blue, [NEON_B]: ENEMY.hotPink },
  akerselva: { [NEON_A]: ENEMY.poison, [NEON_B]: ENEMY.magenta },
  nordmarka: { [NEON_A]: ENEMY.poison, [NEON_B]: ENEMY.purple },
  stortinget: { [NEON_B]: ENEMY.purple },
  ekeberg: { [NEON_A]: ENEMY.orange, [NEON_B]: ENEMY.purple },
  nabolaget: { [NEON_B]: ENEMY.poison },
  bygdoy: { [NEON_A]: ENEMY.orange },
  vigelandsparken: { [NEON_A]: ENEMY.magenta, [NEON_B]: ENEMY.poison },
  korketrekkeren: {},
  ostensjovannet: { [NEON_A]: ENEMY.poison },
  bjorvika: { [NEON_A]: ENEMY.blue, [NEON_B]: ENEMY.hotPink, [ENEMY.plum]: ENEMY.hotPink },
  gamlebyen: { [NEON_B]: ENEMY.orange }
};

/** A scene's lean, for the page to record its shapes in (`lean` in `render/sprite.ts`): none on the map. */
export function leanFor(level: string) {
  for (const k of Object.keys(lean)) delete lean[k];
  Object.assign(lean, LEANS[level] ?? {});
}

/** What a sheen may light: a body's own colours (never its eyes, its near-black, its claws, a mark, or the pink of a tail or a foot). */
const LIT = new Set<string>([ENEMY.plum, ENEMY.plumLight, ENEMY.plumDark, ENEMY.orange, ENEMY.orangeLight, ENEMY.amber, ENEMY.poison, ENEMY.poisonLight, ENEMY.white, ENEMY.whiteShade]);

const sheens = new WeakMap<Frame, Frame>();

/**
 * A glammed frame with its sheen: the body's top edge, where the light falls on it, in two neons, the first over its
 * front half and the second over the quarter behind it, as a sign's tubes light what stands under them: one treatment for
 * every invader. A pixel alone on the edge (a claw, an ear's tip) is left. Its marks as drawn. Worked out once a frame
 * and kept.
 */
export function sheened(f: Frame): Frame {
  let s = sheens.get(f);
  if (s) return s;
  const at = new Map<number, string>();
  const key = (x: number, y: number) => (y + 64) * 512 + x + 256;
  const r = f.runs;
  for (let i = 0; i < r.length; i += 4) for (let k = 0; k < r[i + 2]; k++) at.set(key(r[i] + k, r[i + 1]), f.ink[r[i + 3]]);
  const mid = (f.x0 + f.x1) / 2;
  const back = f.x0 + (f.x1 - f.x0) * 0.25;
  const out: number[] = [];
  const ink = [...f.ink];
  const inkOf = (c: string) => {
    let n = ink.indexOf(c);
    if (n < 0) n = ink.push(c) - 1;
    return n;
  };
  // Its top edge where the light falls: a body's pixel with nothing over it.
  const top = (x: number, y: number) => LIT.has(at.get(key(x, y)) ?? "") && !at.has(key(x, y - 1));
  for (let i = 0; i < r.length; i += 4) {
    const c = f.ink[r[i + 3]];
    for (let k = 0; k < r[i + 2]; k++) {
      const x = r[i] + k;
      const y = r[i + 1];
      let col = c;
      if (LIT.has(c) && top(x, y) && (top(x - 1, y) || top(x + 1, y))) col = x >= mid ? NEON_A : x >= back ? NEON_B : c;
      out.push(x, y, 1, inkOf(col));
    }
  }
  // Back into runs.
  const runs: number[] = [];
  for (let i = 0; i < out.length; i += 4) {
    const n = runs.length;
    if (n && runs[n - 4] + runs[n - 2] === out[i] && runs[n - 3] === out[i + 1] && runs[n - 1] === out[i + 3]) runs[n - 2]++;
    else runs.push(out[i], out[i + 1], 1, out[i + 3]);
  }
  s = { ...f, runs: Int16Array.from(runs), ink };
  sheens.set(f, s);
  return s;
}

/** The frame a look shows as the glamour stands: glammed with its sheen, bare, or its marks alone (null: it has none). */
export function glamFrame(f: Frame): Frame | null {
  if (glam.mode === "bare") return f.bare ?? f;
  if (glam.mode === "marks") return f.marks ?? null;
  return sheened(f);
}

/** How much of its light the red outline keeps over a level's own dark (order 31): as much as over the night's tint. */
export const RING_OVER_DARK = 0.9;

/**
 * Over a level's own dark, which comes after the night's tint and covers all but its lights (Nordmarka under the trees,
 * Vålerenga's lane behind the church): each invader's neon glow, and over it the red outline alone, on its own pixels, as
 * clear as by day (orders 27, 31; Vålerenga's since order 32), so the dark round it is as dark as before.
 */
export function overTheDark(g: CanvasRenderingContext2D, dark?: (wx: number) => boolean) {
  const a = g.globalAlpha;
  // Where the dark lies only over part of the level (Vålerenga's lane), only the invaders under it: elsewhere `afterDark` drew them.
  const under = (s: Sprite, x: number) => !dark || dark(x + view.camX + s.whole.width / 2);
  g.globalAlpha = a * 0.8;
  invaders((s, x, y) => {
    if (!under(s, x)) return;
    if (!s.glow) s.glow = glowOf(s);
    g.drawImage(s.glow, x - GLOW + 2, y - GLOW + 2);
  });
  g.globalAlpha = a * RING_OVER_DARK;
  invaders((s, x, y) => under(s, x) && g.drawImage(s.ring, x, y));
  g.globalAlpha = a;
}

/** How far the glow reaches past an invader's shape (its outline covers the first two pixels of it). */
const GLOW = 5;

/**
 * After dark, under the outlines: every invader outlined this frame gets a soft glow of its own neon round it, as a sign's
 * tube has; made once a shape (the shape grown by three, four and five pixels, faint, its own pixels cut out) and copied.
 * Its neon is the commonest of the glamour's colours in it; a white gull glows in its level's first neon.
 */
export function glows(g: CanvasRenderingContext2D) {
  invaders((s, x, y) => {
    if (!s.glow) s.glow = glowOf(s);
    g.drawImage(s.glow, x - GLOW + 2, y - GLOW + 2);
  });
}

function glowOf(s: Sprite): HTMLCanvasElement {
  // The shape's key is its colours and rectangles, "#colourx,y,w,h;" each.
  const area = new Map<string, number>();
  for (const m of s.key.matchAll(/(#[0-9a-f]{6})-?\d+,-?\d+,(\d+),(\d+);/g)) if (ROLES.glamour.includes(m[1])) area.set(m[1], (area.get(m[1]) ?? 0) + +m[2] * +m[3]);
  let hue = lean[NEON_A] ?? NEON_A;
  let most = 0;
  for (const [c, a] of area) if (a > most) [hue, most] = [c, a];
  const w = s.shape.width + 2 * GLOW - 4;
  const h = s.shape.height + 2 * GLOW - 4;
  const make = () => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const out = make();
  const o = out.getContext("2d")!;
  for (const by of [3, 4, 5]) {
    // The shape grown square by `by` pixels: across, then down.
    const across = make();
    const a = across.getContext("2d")!;
    for (let dx = -by; dx <= by; dx++) a.drawImage(s.shape, GLOW - 2 + dx, GLOW - 2);
    const both = make();
    const b = both.getContext("2d")!;
    for (let dy = -by; dy <= by; dy++) b.drawImage(across, 0, dy);
    b.globalCompositeOperation = "source-in";
    b.fillStyle = hue;
    b.fillRect(0, 0, w, h);
    o.globalAlpha = 0.2;
    o.drawImage(both, 0, 0);
  }
  o.globalAlpha = 1;
  o.globalCompositeOperation = "destination-out";
  o.drawImage(s.shape, GLOW - 2, GLOW - 2);
  return out;
}
