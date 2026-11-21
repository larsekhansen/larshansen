import type { Door } from "@larshansen/pixelkit/doors";
import { shakeX } from "@larshansen/pixelkit/doors";
import { R, light, mix, view } from "@larshansen/pixelkit/paint";
import { DOORWAY, FACADE, INK, LAMP, METAL, PAINT, PALETTE, TRAM, WHITE } from "@larshansen/pixelkit/palette";
import { STOVE_SMOKE, smoke } from "@larshansen/pixelkit/props";
import { TEXTURED } from "../render/tiles";
import { custom, drawProp, hash, type Piece } from "./ground";

// The last flat things (order 28, ADR 0051): the props at arm's length that orders 23 to 27 left in rectangles, drawn as
// order 26 drew the ground: each a per-pixel piece in three to five tones of one material, a lit side, a shadowed foot and
// the material's grain, painted once and copied. Every prop is of its place: a lamp post in Gamlebyen is the old town's
// cast iron, at Rådhuset the square's lamp with its broad hat, at the harbour plain steel; a railing is the place's own
// (steel tube at Ekeberg's viewpoint, cast-iron bars on Rådhuset's balcony, a rope at Vigelandsparken's broken span).
//
// Three questions were asked of every one (ADR 0051): what he does with it (a thing he stands on keeps the yellow top
// that the page paints over it, a thing he uses keeps its cyan corners, a thing that hurts its red outline: no detail
// here makes a harmless thing look like any of them, so no flat lit top over a shadow line, nothing in a coin's amber or
// a rune's gold, nothing the shape of a door that is not one); whether it fits its level; and whether the glamour should
// touch it (no: props are Oslo, and Oslo is natural; `props.test.ts` holds that no prop paints a neon).
//
// The first script carries only the hooks (`TEXTURED.prop` and `TEXTURED.walls` in `render/tiles.ts`, for Langkaia, which
// is in it); the levels fetched later import what they use from here.

/** A prop's material: three to five tones of one hue, darkest first (the shadow, the shade, the face, the light, a highlight). */
export interface Stuff {
  name: string;
  ramp: readonly string[];
}

const P = PALETTE;
/** Natural wood: planks, a boat's strakes, a jetty's posts. */
export const WOOD: Stuff = { name: "wood", ramp: [P.woodDark, mix(P.woodDark, P.wood, 0.3), P.wood, mix(P.wood, WHITE, 0.25)] };
/** Old wood, a post's: the sign posts, the legs under a deck. */
export const POST: Stuff = { name: "post", ramp: [mix(P.woodDark, INK, 0.4), P.woodDark, mix(P.woodDark, WHITE, 0.08), mix(P.woodDark, WHITE, 0.15)] };
/** Tarred timber: the sauna rafts' cabins and the club's hut. */
export const TAR: Stuff = { name: "tar", ramp: [mix(PAINT.tar, INK, 0.45), PAINT.tar, mix(PAINT.tar, WHITE, 0.08), mix(PAINT.tar, WHITE, 0.15)] };
/** Cast iron, painted black-green: the old town's lamp posts, a balcony's bars, a basket for a fire. */
export const CAST: Stuff = { name: "cast iron", ramp: [mix(METAL.castIron, INK, 0.4), METAL.castIron, METAL.lampPost, METAL.lampHat] };
/** Galvanised steel: the harbour's lamps, a tube railing, a ladder, a roof's posts. */
export const STEEL: Stuff = { name: "steel", ramp: [METAL.pipeCap, METAL.pipe, mix(METAL.pipe, METAL.rail, 0.5), METAL.rail] };
/** White-painted concrete: the diving tower's legs, the map's piers. */
export const CONCRETE: Stuff = { name: "concrete", ramp: [FACADE.marbleSeam, mix(FACADE.marbleWall, FACADE.marbleSeam, 0.45), FACADE.marbleWall, mix(FACADE.marbleWall, WHITE, 0.55)] };
/** A rope, hemp. */
export const ROPE: Stuff = { name: "rope", ramp: [mix(P.woodDark, INK, 0.2), mix(P.wood, P.woodDark, 0.4), mix(P.wood, WHITE, 0.2)] };

/** Painted planks or a painted door in `color`, its joints in `line`: the shadow and the shade from the line, the grain between the face and the line (no tone lighter than the paint: a lighter one came nearer his skin and the coins). */
const painteds = new Map<string, Stuff>();
export function painted(color: string, line: string): Stuff {
  let s = painteds.get(color + line);
  if (!s) painteds.set(color + line, (s = { name: `painted ${color}`, ramp: [mix(line, INK, 0.3), line, color, mix(color, line, 0.45)] }));
  return s;
}

/** For the tests: every prop kind drawn and every material it drew in. */
export const PROPS: { used?: Set<string>; stuffs?: Set<Stuff>; inks?: Map<string, Set<string>> } = {};

type Ink = string | null;
interface Grid {
  w: number;
  h: number;
  c: Ink[];
}
function dot(g: Grid, x: number, y: number, c: Ink) {
  if (x >= 0 && y >= 0 && x < g.w && y < g.h) g.c[y * g.w + x] = c;
}
function box(g: Grid, x: number, y: number, w: number, h: number, c: Ink) {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dot(g, x + i, y + j, c);
}
const T = (s: Stuff, i: number) => s.ramp[Math.max(0, Math.min(s.ramp.length - 1, i))];

/** A prop's piece, painted the first time it is asked for, kept by its key. */
function made(key: string, w: number, h: number, paint: (g: Grid) => void): Piece {
  let g: Grid | null = null;
  return custom(key, w, h, (x, y) => {
    if (!g) {
      g = { w, h, c: new Array<Ink>(w * h).fill(null) };
      paint(g);
    }
    return g.c[y * w + x];
  });
}

/** Copies a prop's piece with its top left at world (x, y), noting for the tests what drew it. */
function put(kind: string, stuffs: Stuff[], key: string, w: number, h: number, x: number, y: number, paint: (g: Grid) => void) {
  PROPS.used?.add(kind);
  if (PROPS.stuffs) for (const s of stuffs) PROPS.stuffs.add(s);
  const p = made(`${kind}|${key}`, w, h, paint);
  if (PROPS.inks) {
    const set = PROPS.inks.get(kind) ?? new Set<string>();
    for (const c of p.ink) set.add(c);
    PROPS.inks.set(kind, set);
  }
  drawProp(p, x, y, w);
}

/** A column of material `s`, `w` wide: lit on its left, shaded on its right, a grain of darker streaks if asked. */
function column(g: Grid, s: Stuff, x: number, y: number, w: number, h: number, grain = 0, seed = 0) {
  const lit = T(s, 3);
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      let c = w === 1 ? T(s, 2) : i === 0 ? lit : i === w - 1 ? T(s, 1) : T(s, 2);
      if (grain && i > 0 && i < Math.max(2, w - 1) && hash(seed, i, (y + j) >> 2, 41) < grain) c = T(s, 1);
      dot(g, x + i, y + j, c);
    }
}

// --- Posts --------------------------------------------------------------------------------------------------------

/** A post `w` wide from `top` down to `bottom`: lit on its left, its grain, a cap lit on top, its foot darker where it stands. */
export function post(s: Stuff, x: number, top: number, bottom: number, w = 2) {
  const h = Math.round(bottom - top);
  if (h <= 0) return;
  put("post", [s], `${s.name}|${w}|${h}`, w, h, Math.round(x), Math.round(top), (g) => {
    column(g, s, 0, 0, w, h, s === STEEL || s === CONCRETE ? 0 : 0.14, w * 31 + h);
    for (let i = 0; i < w; i++) dot(g, i, 0, T(s, i === w - 1 ? 2 : 3));
    for (let i = 0; i < w; i++) dot(g, i, h - 1, T(s, 0));
    if (h > 6) for (let i = 1; i < w; i++) dot(g, i, h - 2, T(s, 1));
  });
}

// --- Lamp posts, by place -------------------------------------------------------------------------------------------

/**
 * A lamp post, of its place:
 * - `old`: the old town's cast-iron lantern on a fluted post (Gamlebyen, Vålerenga): a stepped plinth, a collar, a lantern
 *   of glass panes in a frame under a little roof with a finial;
 * - `square`: the city square's lamp with its broad hat (Rådhuset), the front page's lamp in cast iron, on a plinth;
 * - `harbour`: plain galvanised steel with an arm and a flat head (the harbour's new quays);
 * - `park`: a park's lantern on a slim green post with a ring foot (Vigelandsparken).
 * `x` is the post's left as the old drawing had it, `ground` where it stands, `tall` the post's height. Its glass is
 * registered as a lamp's light, so it comes on after dark; `lit` paints it lit by day too (Vålerenga's, Ekeberg's once cleared).
 */
export type LampKind = "old" | "square" | "harbour" | "park";
export function lamp(kind: LampKind, x: number, ground: number, tall: number, lit = false, park: Stuff = PARK) {
  x = Math.round(x);
  ground = Math.round(ground);
  const glass = lit ? LAMP : METAL.lampGlass;
  if (kind === "old") {
    // 9 wide, the post's three columns from x - 1; the lantern 13 rows over the post.
    const H = tall + 13;
    const y0 = ground - H;
    put("lamp old", [CAST], `${tall}|${lit ? 1 : 0}`, 9, H, x - 3, y0, (g) => {
      const C = (i: number) => T(CAST, i);
      dot(g, 4, 0, C(3));
      box(g, 3, 1, 3, 1, C(2));
      dot(g, 3, 1, C(3));
      box(g, 2, 2, 5, 1, C(2));
      dot(g, 2, 2, C(3));
      dot(g, 6, 2, C(1));
      box(g, 1, 3, 7, 1, C(1));
      dot(g, 1, 3, C(2));
      // The lantern: its frame, the panes, a mullion.
      for (let y = 4; y < 10; y++) {
        dot(g, 1, y, C(2));
        dot(g, 7, y, C(1));
        for (let i = 2; i < 7; i++) dot(g, i, y, i === 4 ? C(1) : glass);
      }
      box(g, 1, 10, 7, 1, C(2));
      dot(g, 1, 10, C(3));
      dot(g, 7, 10, C(1));
      box(g, 2, 11, 5, 1, C(1));
      box(g, 3, 12, 3, 1, C(1));
      dot(g, 3, 12, C(2));
      // The post, fluted: its lit edge, a fluting line, its shaded side; a collar a third of the way up.
      const foot = H - 6;
      for (let y = 13; y < foot; y++) {
        dot(g, 3, y, C(3));
        dot(g, 4, y, (y >> 1) % 3 === 0 ? C(1) : C(2));
        dot(g, 5, y, C(1));
      }
      const collar = 13 + Math.round((foot - 13) * 0.62);
      box(g, 2, collar, 5, 2, C(2));
      dot(g, 2, collar, C(3));
      box(g, 2, collar + 1, 5, 1, C(1));
      // The plinth in two steps, lit on top, its shadow on the ground.
      box(g, 2, foot, 5, 3, C(2));
      dot(g, 2, foot, C(3));
      box(g, 3, foot, 3, 1, C(3));
      dot(g, 6, foot + 1, C(1));
      dot(g, 6, foot + 2, C(1));
      box(g, 1, foot + 3, 7, 2, C(1));
      box(g, 1, foot + 3, 7, 1, C(2));
      dot(g, 1, foot + 3, C(3));
      box(g, 1, foot + 5, 7, 1, C(0));
    });
    light(x - 1, y0 + 4, 5, 6, "lamp");
    return;
  }
  if (kind === "square") {
    // The old drawing's shape: the post two wide at x, the hat ten wide over it, the glass under the hat.
    const top = ground - tall;
    const H = tall + 7;
    put("lamp square", [CAST], `${tall}|${lit ? 1 : 0}`, 10, H, x - 4, top - 7, (g) => {
      const C = (i: number) => T(CAST, i);
      box(g, 1, 0, 8, 1, C(3));
      dot(g, 0, 0, C(2));
      dot(g, 9, 0, C(2));
      box(g, 0, 1, 10, 1, C(1));
      box(g, 1, 2, 8, 1, C(2));
      box(g, 2, 3, 6, 3, glass);
      box(g, 3, 6, 4, 1, C(1));
      dot(g, 3, 6, C(2));
      const foot = H - 5;
      for (let y = 7; y < foot; y++) {
        dot(g, 4, y, C(3));
        dot(g, 5, y, C(1));
      }
      for (const cy of [9, Math.round(7 + (foot - 7) * 0.55)]) {
        box(g, 3, cy, 4, 1, C(2));
        dot(g, 3, cy, C(3));
      }
      box(g, 3, foot, 4, 2, C(2));
      dot(g, 3, foot, C(3));
      dot(g, 6, foot + 1, C(1));
      box(g, 2, foot + 2, 6, 2, C(1));
      box(g, 2, foot + 2, 6, 1, C(2));
      dot(g, 2, foot + 2, C(3));
      box(g, 2, foot + 4, 6, 1, C(0));
    });
    light(x - 2, top - 4, 6, 3, "lamp");
    return;
  }
  if (kind === "harbour") {
    // A plain steel pole two wide at x, bent over at its top into an arm with a flat head, its lens under it.
    const H = tall + 2;
    const y0 = ground - H;
    put("lamp harbour", [STEEL], `${tall}|${lit ? 1 : 0}`, 10, H, x - 1, y0, (g) => {
      const S = (i: number) => T(STEEL, i);
      box(g, 1, 0, 7, 1, S(3));
      box(g, 1, 1, 6, 1, S(1));
      box(g, 5, 1, 5, 2, S(0));
      box(g, 5, 1, 5, 1, S(1));
      box(g, 6, 3, 3, 1, glass);
      for (let y = 1; y < H - 2; y++) {
        dot(g, 1, y, S(3));
        dot(g, 2, y, S(1));
      }
      // A hatch low on the pole, and a flange at its foot.
      box(g, 2, H - 12, 1, 3, S(0));
      box(g, 0, H - 2, 4, 1, S(2));
      dot(g, 0, H - 2, S(3));
      box(g, 0, H - 1, 4, 1, S(0));
    });
    light(x + 5, y0 + 3, 3, 1, "lamp");
    return;
  }
  // A park's lantern: a slim post painted dark green on a ring foot, a round lantern with a cap.
  const H = tall + 9;
  const y0 = ground - H;
  const green = park;
  put("lamp park", [green], `${green.name}|${tall}|${lit ? 1 : 0}`, 7, H, x - 2, y0, (g) => {
    const C = (i: number) => T(green, i);
    dot(g, 3, 0, C(3));
    box(g, 2, 1, 3, 1, C(2));
    dot(g, 2, 1, C(3));
    box(g, 1, 2, 5, 1, C(1));
    for (let y = 3; y < 7; y++) {
      dot(g, 1, y, C(2));
      dot(g, 5, y, C(1));
      box(g, 2, y, 3, 1, glass);
    }
    box(g, 1, 7, 5, 1, C(1));
    dot(g, 1, 7, C(2));
    box(g, 2, 8, 3, 1, C(1));
    for (let y = 9; y < H - 3; y++) {
      dot(g, 2, y, C(3));
      dot(g, 3, y, C(1));
    }
    box(g, 1, H - 3, 4, 2, C(2));
    dot(g, 1, H - 3, C(3));
    dot(g, 4, H - 2, C(1));
    box(g, 0, H - 1, 6, 1, C(0));
  });
  light(x, y0 + 3, 3, 4, "lamp");
}
/** A park's lamp posts, painted the dark green of park iron. */
const PARK: Stuff = { name: "park iron", ramp: [mix("#1f3a2c", INK, 0.35), "#1f3a2c", "#2c4a39", "#34503f"] };

// --- Railings and fences ------------------------------------------------------------------------------------------

/**
 * A railing from x0 to x1, its top rail at `top`, `h` tall down to where its posts stand:
 * - `tube`: steel tube (Ekeberg's viewpoint, a terrace): a top rail and a middle rail, each a line with a glint now and
 *   then, never a lit top over a shadow (nothing here may look like somewhere to stand), posts with a foot plate;
 * - `bars`: cast-iron bars under a rail (a balcony), every third pixel, a knob on each;
 * - `rope`: a rope sagging between wooden posts (a cordon).
 * Drawn as one piece a span and copied along.
 */
export type RailKind = "tube" | "bars" | "rope";
export function railing(kind: RailKind, x0: number, x1: number, top: number, h: number, span = 24, s: Stuff = kind === "bars" ? CAST : kind === "rope" ? ROPE : STEEL) {
  x0 = Math.round(x0);
  top = Math.round(top);
  for (let x = x0; x < x1; x += span) {
    const w = Math.min(span, x1 - x);
    const last = x + span >= x1;
    put(`rail ${kind}`, kind === "rope" ? [s, POST] : [s], `${s.name}|${w}|${h}|${span}|${last ? 1 : 0}`, w + (last ? 2 : 0), h, x, top, (g) => {
      const S = (i: number) => T(s, i);
      if (kind === "tube") {
        for (let i = 0; i < w + (last ? 2 : 0); i++) {
          dot(g, i, 0, hash(span, i, 1, 43) < 0.12 ? S(3) : S(2));
          dot(g, i, Math.round(h * 0.45), hash(span, i, 2, 43) < 0.08 ? S(3) : S(1));
        }
        const posts = last ? [0, w] : [0];
        for (const px of posts) {
          dot(g, px, 0, S(3));
          for (let y = 1; y < h - 1; y++) {
            dot(g, px, y, S(3));
            dot(g, px + 1, y, S(1));
          }
          box(g, px - 1, h - 1, 4, 1, S(0));
        }
      } else if (kind === "bars") {
        for (let i = 0; i < w; i++) {
          dot(g, i, 0, hash(span, i, 3, 43) < 0.15 ? S(3) : S(2));
          dot(g, i, 1, S(1));
          dot(g, i, h - 1, S(1));
          if (i % 3 === 0) {
            for (let y = 2; y < h - 1; y++) dot(g, i, y, S(1));
            dot(g, i, Math.round(h * 0.55), S(3));
          }
        }
      } else {
        // The rope sags between posts at each end of the span.
        for (let i = 0; i <= w; i++) {
          const sag = Math.round(Math.sin((i / w) * Math.PI) * 3);
          dot(g, i, 1 + sag, S(1));
          if (i % 3 === 1) dot(g, i, 1 + sag, S(2));
        }
        for (const px of last ? [0, w] : [0]) {
          for (let y = 0; y < h; y++) {
            dot(g, px, y, T(POST, 3));
            dot(g, px + 1, y, T(POST, 1));
          }
          dot(g, px, 0, T(POST, 2));
        }
      }
    });
  }
}

// --- Walls of planks, doors -----------------------------------------------------------------------------------------

/**
 * Painted plank walls from `top` down to `ground`, as the front page has them, drawn plank by plank: the joints in `line`,
 * each plank's grain and a nail now and then, a shadow under the eaves, the foot darker where it meets the ground, the
 * white trim at the corners.
 */
export function plankWall(x: number, top: number, w: number, color: string, line: string, ground: number) {
  const h = Math.round(ground - top);
  const s = painted(color, line);
  put("plank wall", [s], `${color}|${line}|${w}|${h}`, w, h, Math.round(x), Math.round(top), (g) => {
    for (let y = 0; y < h; y++)
      for (let i = 0; i < w; i++) {
        let c: string;
        const isTrim = i < 2 || i >= w - 2;
        if (isTrim) c = PAINT.trim;
        else if (i >= 3 && (i - 3) % 4 === 0) c = T(s, 1);
        else {
          const plank = Math.floor((i - 3) / 4);
          c = T(s, 2);
          // The grain: a streak down the plank now and then, a few pixels long, in a tone between the face and the joint.
          const j = (i - 3) % 4;
          if (j > 0 && hash(plank, j, (y + plank * 3) >> 2, 47) < 0.13) c = T(s, 3);
          if ((y === 3 || y === h - 4) && (i - 3) % 4 === 2) c = T(s, 1);
        }
        if (!isTrim && y < 2) c = y === 0 ? T(s, 0) : T(s, 1);
        else if (!isTrim && y >= h - 2) c = T(s, 3);
        dot(g, i, y, c);
      }
  });
}

/**
 * A painted door with two raised panels (the kiosk's, the home's), drawn as the kit's: each panel shaded on its bottom and
 * right edge (no tone lighter than the panel: a lighter one came nearer the coins), a brass knob and a keyhole under it, a kick rail at its foot;
 * open, a dark hole with its frame's shadow. Padlocked while what is behind it is to come.
 */
export function panelDoor(d: Door, color: string, panel: string) {
  const ox = shakeX(d.shake);
  const top = d.bottom - d.h;
  const s = painted(color, mix(color, INK, 0.3));
  put("panel door", [s], `${color}|${panel}|${d.w}|${d.h}|${d.open ? 1 : 0}`, d.w, d.h, d.x + ox, top, (g) => {
    if (d.open) {
      box(g, 0, 0, d.w, d.h, DOORWAY.wood);
      box(g, 0, 0, d.w, 2, mix(DOORWAY.wood, INK, 0.35));
      box(g, 0, 0, 1, d.h, mix(DOORWAY.wood, INK, 0.25));
      return;
    }
    const dark = mix(color, INK, 0.3);
    box(g, 0, 0, d.w, d.h, color);
    for (let y = 0; y < d.h; y++) {
      dot(g, 0, y, panel);
      dot(g, d.w - 1, y, dark);
    }
    box(g, 0, 0, d.w, 1, panel);
    for (const py of [2, 17]) {
      const pw = d.w - 4;
      // The raised panel in the panel's colour, its bevel shaded below and on the right, the door's own colour in its grain.
      box(g, 2, py, pw, 12, panel);
      box(g, 2, py + 11, pw, 1, dark);
      box(g, 1 + pw, py, 1, 12, dark);
      for (let y = py + 2; y < py + 10; y++) if (hash(d.w, y >> 2, py, 49) < 0.4) dot(g, 4 + ((y * 3) % (pw - 4)), y, color);
    }
    box(g, 1, d.h - 2, d.w - 2, 2, dark);
    box(g, 1, d.h - 2, d.w - 2, 1, mix(color, dark, 0.5));
    box(g, d.w - 4, 15, 2, 2, METAL.brass);
    dot(g, d.w - 3, 16, mix(METAL.brass, INK, 0.3));
    dot(g, d.w - 3, 18, INK);
  });
  if (d.soon) {
    const px = d.x + ox + 5;
    const py = top + 10;
    R(px, py + 3, 6, 5, METAL.padlock);
    R(px + 1, py, 4, 3, METAL.shackle);
    R(px + 2, py + 1, 2, 2, METAL.keyhole);
  }
}

// --- Ladders, boats, legs ----------------------------------------------------------------------------------------

/** A steel ladder `w` wide from `top` to `bottom`: its two stiles lit on their left, a rung every five rows lit on its top. */
export function ladder(x: number, top: number, bottom: number, w = 7, s: Stuff = STEEL) {
  const h = Math.round(bottom - top);
  put("ladder", [s], `${s.name}|${w}|${h}`, w, h, Math.round(x), Math.round(top), (g) => {
    for (let y = 0; y < h; y++) {
      dot(g, 0, y, T(s, 3));
      dot(g, w - 1, y, T(s, 1));
    }
    for (let y = 3; y < h; y += 5) {
      box(g, 1, y, w - 2, 1, T(s, 2));
      dot(g, 1, y, T(s, 3));
    }
  });
}

/** A concrete leg `w` wide from `top` to `bottom`, white-painted: lit on its left, the formwork's joints, rust under a tie now and then, darker and wet at its foot. */
export function leg(x: number, top: number, bottom: number, w = 6, s: Stuff = CONCRETE, wet = 0) {
  const h = Math.round(bottom - top);
  put("leg", [s], `${s.name}|${w}|${h}|${wet}`, w, h, Math.round(x), Math.round(top), (g) => {
    for (let y = 0; y < h; y++)
      for (let i = 0; i < w; i++) {
        let c = i === 0 ? T(s, 3) : i >= w - 1 ? T(s, 0) : i === w - 2 ? T(s, 1) : T(s, 2);
        if (y % 12 === 11 && i > 0 && i < w - 1) c = T(s, 1);
        if (i > 0 && i < w - 1 && hash(w, i, y, 51) < 0.03) c = T(s, 1);
        if (wet && y >= h - wet) c = mix(c, T(s, 0), 0.5);
        dot(g, i, y, c);
      }
  });
}

/** A clinker-built rowing boat seen side on, w + 4 wide at its gunwale: strakes lit along their tops, each lap's shadow, the gunwale lit, a thwart and two oarlocks; tar along its waterline. Its top is where the old drawing's was (he stands on it: the page paints it). */
export function rowboat(x: number, y: number, w: number) {
  x = Math.round(x);
  y = Math.round(y);
  put("rowboat", [WOOD], `${w}`, w + 4, 9, x - 2, y - 3, (g) => {
    const W = (i: number) => T(WOOD, i);
    // The oarlocks and the thwart's ends over the gunwale.
    dot(g, 6, 1, W(0));
    dot(g, 6, 2, W(0));
    dot(g, w + 1, 1, W(0));
    dot(g, w + 1, 2, W(0));
    box(g, 5, 0, w - 6, 1, W(0));
    for (let r = 0; r < 6; r++) {
      const left = r;
      const len = w + 4 - r * 2;
      for (let i = 0; i < len; i++) {
        let c = r === 0 ? W(3) : r === 5 ? mix(PAINT.tar, W(0), 0.4) : r % 2 ? W(1) : W(2);
        if (r > 0 && r < 5 && r % 2 === 0 && hash(w, i >> 2, r, 53) < 0.18) c = W(1);
        if (r === 0 && (i === 0 || i === len - 1)) c = W(2);
        dot(g, left + i, 3 + r, c);
      }
    }
    // The thwart he steps on, across the boat: its planks, under the gunwale.
    box(g, 4, 3, w - 4, 2, W(2));
    box(g, 4, 3, w - 4, 1, W(3));
  });
}

/**
 * A sauna raft's pontoons and its cabin (Langkaia): tarred planks, lit on the left corner and dark on the right; a small door of
 * tarred boards with a brass knob; the window with the stove's light behind it in a frame of wood; the pontoons under the
 * deck, a dark band lit on its top, wet under; the stove pipe and its smoke.
 */
export function pontoons(x: number, y: number, rw: number) {
  put("pontoons", [TAR], `${rw}`, rw, 7, Math.round(x), Math.round(y), (g) => {
    for (let i = 3; i < rw - 3; i++) dot(g, i, 4, i % 9 === 4 ? T(TAR, 3) : T(TAR, 1));
    for (let i = 2; i < rw - 2; i++) {
      dot(g, i, 5, i % 6 === 0 ? mix(T(TAR, 0), P.water, 0.4) : mix(T(TAR, 1), P.water, 0.5));
      dot(g, i, 6, mix(T(TAR, 0), P.water, 0.55));
    }
  });
}
export function saunaCabin(x: number, y: number, t: number) {
  x = Math.round(x);
  y = Math.round(y);
  const cx = x + 16;
  put("sauna cabin", [TAR, WOOD], "", 32, 18, cx, y - 18, (g) => {
    for (let yy = 0; yy < 18; yy++)
      for (let i = 0; i < 32; i++) {
        let c = (i - 2) % 4 === 0 && i > 1 ? T(TAR, 0) : T(TAR, 1);
        if (c !== T(TAR, 0) && hash(i >> 2, yy >> 2, 3, 55) < 0.2 && (i + yy) % 3 === 0) c = T(TAR, 2);
        if (i === 0) c = T(TAR, 3);
        if (i === 31) c = INK;
        if (yy === 0) c = T(TAR, 0);
        dot(g, i, yy, c);
      }
    // The door, its boards and a band across.
    box(g, 4, 5, 7, 13, mix(T(TAR, 0), INK, 0.3));
    for (let yy = 5; yy < 18; yy++) dot(g, 4, yy, T(TAR, 2));
    for (const yy of [8, 14]) box(g, 5, yy, 6, 1, T(TAR, 1));
    dot(g, 9, 10, METAL.brass);
    // The window's frame and the stove's light behind it.
    box(g, 17, 4, 10, 7, T(WOOD, 0));
    box(g, 18, 5, 8, 5, LAMP);
    box(g, 22, 5, 1, 5, T(WOOD, 0));
  });
  light(cx + 18, y - 13, 4, 5, "soft");
  light(cx + 23, y - 13, 3, 5, "soft");
  // The stove pipe through the roof.
  put("stove pipe", [STEEL], "", 5, 8, cx + 23, y - 28, (g) => {
    box(g, 0, 0, 5, 1, T(STEEL, 1));
    box(g, 1, 1, 3, 7, T(STEEL, 1));
    for (let yy = 1; yy < 8; yy++) dot(g, 3, yy, T(STEEL, 0));
  });
  if (!view.reduced) smoke(cx + 24, y - 30, t, { ...STOVE_SMOKE, rise: 18 });
}

// --- Langkaia, which is in the first script: its props through one hook -------------------------------------------

/** The diving tower at Sørenga (Langkaia): white concrete legs out of the water, a steel ladder, a tube railing round the top; its board ochre. */
function divingTower(x0: number, top: number, water: number) {
  for (const lx of [x0 + 4, x0 + 80 - 10]) leg(lx, top, water, 6, CONCRETE, 6);
  ladder(x0 + 38, top, water);
  railing("tube", x0, x0 + 80, top - 9, 9, 8);
  R(x0 + 80, top + 2, 24, 3, PAINT.ochre);
  R(x0 + 80, top + 2, 24, 1, mix(PAINT.ochre, WHITE, 0.4));
}

/** The club's hut on its pier: tarred plank walls, a lit window, a door; the stove pipe's smoke. */
function clubHut(x: number, top: number, w: number, water: number, t: number) {
  plankWall(x, top, w, PAINT.tar, mix(PAINT.tar, INK, 0.35), water);
  R(x - 2, top, w + 4, 1, INK);
  R(x + 8, top + 4, 12, 7, P.woodDark);
  R(x + 9, top + 5, 10, 5, LAMP);
  R(x + 14, top + 5, 1, 5, P.woodDark);
  light(x + 9, top + 5, 10, 5, "soft");
  put("hut door", [TAR], "", 9, 16, x + 40, top + 3, (g) => {
    box(g, 0, 0, 9, 16, mix(T(TAR, 0), INK, 0.2));
    for (let y = 0; y < 16; y++) dot(g, 0, y, T(TAR, 2));
    box(g, 1, 4, 8, 1, T(TAR, 1));
    box(g, 1, 11, 8, 1, T(TAR, 1));
    dot(g, 6, 8, T(TAR, 3));
  });
  put("stove pipe", [STEEL], "tall", 5, 14, x + 51, top - 15, (g) => {
    box(g, 0, 0, 5, 1, T(STEEL, 1));
    box(g, 1, 1, 3, 13, T(STEEL, 1));
    for (let y = 1; y < 14; y++) dot(g, 3, y, T(STEEL, 0));
  });
  if (!view.reduced) smoke(x + 52, top - 18, t + 30, STOVE_SMOKE);
}

TEXTURED.walls = (x, top, w, color, line, ground) => (plankWall(x, top, w, color, line, ground), true);
TEXTURED.prop = (kind, a, b, c = 0, d = 0, e = 0) => {
  switch (kind) {
    case "pontoons":
      pontoons(a, b, c);
      return true;
    case "raft":
      saunaCabin(a, b, c);
      return true;
    case "rowboat":
      rowboat(a, b, c);
      return true;
    case "tower":
      divingTower(a, b, c);
      return true;
    case "hut":
      clubHut(a, b, c, d, e);
      return true;
    case "post":
      post(POST, a, b, c, 3);
      return true;
  }
  return false;
};

// --- The blue tram ---------------------------------------------------------------------------------------------------

/** The tram's blue (order 31): its skirt, a shade, its body, the light on it, darkest first. */
export const TRAM_BLUE: Stuff = { name: "tram blue", ramp: [TRAM.skirt, mix(TRAM.body, TRAM.skirt, 0.3), TRAM.body, mix(TRAM.body, WHITE, 0.16)] };
/** Its windows by day: the glass, dark with the sky in it, and a glint. They are lit after dark (the caller registers each). */
const TRAM_GLASS = [mix(TRAM.glass, TRAM.skirt, 0.62), mix(TRAM.glass, TRAM.skirt, 0.42), mix(TRAM.glass, TRAM.skirt, 0.35)];

/**
 * The side of Oslo's blue tram (order 31; ADR 0051), Ekeberg's and Vålerenga's, `w` x `h` at (x, y), its windows' band
 * `winTop` rows down and `winH` tall: two cars joined by bellows at the middle, a door with its glass in each, windows framed
 * with their pillars between, glass by day with the sky's glint in its corner, the roof's edge lit, its lit end and its
 * shaded end, a belt line, panel joints, the dark skirt. One piece, copied: it was a blue box with lamp-yellow windows
 * by day, drawn a column at a time. The page paints his yellow on its roof as on anything that carries him. Returns its
 * panes, in the world, for the caller to light after dark (as far as they show).
 */
export function tramSide(x: number, y: number, w: number, h: number, winTop: number, winH: number): { x: number; y: number; w: number; h: number }[] {
  const mid = w / 2;
  const door = (dx: number) => (dx >= mid - 16 && dx < mid - 10) || (dx >= w - 16 && dx < w - 10);
  const pane = (dx: number) => dx > 2 && dx < w - 3 && dx % 8 < 6 && Math.abs(dx - mid + 0.5) > 1.5 && !door(dx);
  const skirt = h - 4;
  put("tram", [TRAM_BLUE], `${w}|${h}|${winTop}|${winH}`, w, h, Math.round(x), Math.round(y), (g) => {
    const B = (i: number) => T(TRAM_BLUE, i);
    for (let dx = 0; dx < w; dx++) {
      const bellows = Math.abs(dx - mid + 0.5) <= 1.5;
      for (let r = 0; r < h; r++) {
        let c: string | null = r < 2 ? (r === 0 ? mix(TRAM.body, WHITE, 0.3) : B(3)) : dx === 0 ? B(3) : dx === w - 1 ? B(1) : B(2);
        if ((dx === 0 || dx === w - 1) && r === 0) c = null;
        if (bellows && r >= 1) c = r >= skirt ? B(0) : r % 3 === 0 ? mix(B(0), INK, 0.4) : B(0);
        else if (r >= skirt) c = r === skirt ? B(1) : B(0);
        else if (door(dx) && r >= winTop - 1) {
          const edge = dx === mid - 16 || dx === mid - 11 || dx === w - 16 || dx === w - 11;
          const glass = r >= winTop && r < winTop + winH && !edge;
          c = edge || r === winTop - 1 ? B(0) : glass ? TRAM_GLASS[r === winTop ? 2 : 0] : B(1);
        } else if (r === winTop - 1 || r === winTop + winH) c = dx > 1 && dx < w - 2 && !bellows ? B(1) : c;
        else if (r >= winTop && r < winTop + winH && pane(dx)) c = r === winTop && dx % 8 === 0 ? TRAM_GLASS[2] : r === winTop + winH - 1 ? TRAM_GLASS[0] : TRAM_GLASS[dx % 8 === 0 || r === winTop ? 1 : 0];
        else if (r === winTop + winH + 3 && dx > 0 && dx < w - 1) c = B(1);
        else if (r > winTop + winH + 3 && r < skirt && dx > 0 && dx < w - 1 && dx % 16 === 7) c = B(1);
        dot(g, dx, r, c);
      }
    }
  });
  const panes: { x: number; y: number; w: number; h: number }[] = [];
  for (let dx = 3; dx < w - 3; dx++) if (pane(dx) && !pane(dx - 1)) {
    let n = 1;
    while (pane(dx + n)) n++;
    panes.push({ x: Math.round(x) + dx, y: Math.round(y) + winTop, w: n, h: winH });
  }
  return panes;
}

/** For a level's own props: a kept piece painted pixel by pixel (`prop`), and the grid's pen (`dot`, `box`) and a material's tone (`tone`). */
export { put as prop, dot, box, T as tone, type Grid };
