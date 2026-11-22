import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { darkRow, darknessAt, drawDark, merged, nightCutsOf, type Light, type Ring, type Run } from "@larshansen/pixelkit/dark";
import { S, ctx, view } from "@larshansen/pixelkit/paint";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Board } from "@larshansen/pixelkit/text";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { LevelDef, View } from "../levels/types";

// A level's own dark (Nordmarka under the trees; Vålerenga's lane behind the church, order 33): the dark over
// everything, his headlamp and the level's own lights through it, and what shines over it. It comes with the
// kit's dark in a file of its own that both levels fetch (the page calls it through `Art.night`), so the first
// script does not carry it.

/** His headlamp: a small ring of light round him, and the beam ahead the way he looks. */
const AROUND: Ring[] = [
  [22, 0.5],
  [16, 0]
];
const BEAM: Ring[] = [
  [60, 0.55],
  [53, 0.28],
  [46, 0]
];

/**
 * Under the trees at night: the dark over everything the street layer shows (the far layers and the
 * sky too), with his headlamp and the level's own lights punched through it, then what shines over
 * it (eyes in the dark, a flame). The person is drawn after, on the text layer, so he always shows.
 */
export function drawNight(def: LevelDef, v: View, shown: Body, boards: readonly Board[], map: TileMap) {
  const art = def.art;
  const dark = def.dark!;
  const night = Array.from({ length: view.w }, (_, x) => Math.round(Math.max(0, Math.min(1, dark(x + view.camX, v))) * 20) / 20);
  const hx = Math.round(shown.x + PLAYER.w / 2) - view.camX;
  const hy = Math.round(shown.y + 2) - view.camY;
  const lights: Light[] = [
    { x: hx, y: hy, rings: AROUND },
    { x: hx + v.facing * 36, y: hy - 2, rings: BEAM }
  ];
  // The boards on posts and over doors catch the light: their words can always be read.
  for (const bd of boards) lights.push({ rect: { x: Math.round(bd.cx - bd.w / 2 - 1) - view.camX, y: bd.y - 1 - view.camY, w: bd.w + 2, h: 13 }, dark: 0.25 });
  for (const l of art.lights?.(v) ?? [])
    lights.push("rect" in l ? { rect: { ...l.rect, x: l.rect.x - view.camX, y: l.rect.y - view.camY }, dark: l.dark } : { x: l.x - view.camX, y: l.y - view.camY, rings: l.rings });
  drawDark(lights, night, NIGHT);
  lampOnlyLightsTheStreet(lights.slice(0, 2), lights.slice(2), night, shown, map);
  art.overDark?.(v);
}

/** The night's colour under the trees (its darkness is the level's `dark`); the palette test measures the outline over it. */
export const NIGHT = "4, 6, 18";
/** How deep into the soil under his feet the headlamp reaches: the ground's top edge, not a disc of earth. */
const LAMP_SOIL = 6;

/** The top of the soil in each column of the screen the lamp reaches (screen pixels): the first solid tile at or below his feet. */
function soilOf(shown: Body, map: TileMap) {
  const feet = shown.y + PLAYER.h;
  const r0 = Math.floor(feet / TILE);
  const soil = new Map<number, number>();
  return (x: number) => {
    let top = soil.get(x);
    if (top !== undefined) return top;
    const wx = x + view.camX;
    const c = Math.floor(wx / TILE);
    top = Infinity;
    for (let r = r0; r < map.rows; r++)
      if (map.isSolid(c, r)) {
        top = r * TILE;
        break;
      }
    const ramp = map.rampAt(wx);
    if (ramp !== null && ramp >= feet - TILE) top = Math.min(top, ramp);
    top = top - view.camY + LAMP_SOIL;
    soil.set(x, top);
    return top;
  };
}

/**
 * The headlamp lights what stands in front of the backdrop: the street layer's things, the walls
 * and the top edge of the ground. Where its disc falls on the sky or the far layers, or deeper than
 * a few pixels into the soil below his feet, the night goes back to what it would be without the
 * lamp. The street canvas is see-through where the backdrop shows, so the night is put back there
 * underneath what is drawn (destination-over), and over the soil as usual.
 */
function lampOnlyLightsTheStreet(lamp: Light[], others: Light[], night: number[], shown: Body, map: TileMap) {
  const g = ctx();
  const soilTop = soilOf(shown, map);
  const reach = Math.max(...lamp.map((l) => ("rings" in l ? Math.max(...l.rings.map((r) => r[0])) : 0)));
  const ys = lamp.flatMap((l) => ("rings" in l ? [l.y] : []));
  const cuts = nightCutsOf(night);
  const all = [...lamp, ...others];
  const y0 = Math.max(0, Math.floor(Math.min(...ys) - reach));
  const y1 = Math.min(view.h, Math.ceil(Math.max(...ys) + reach));
  // Each row's pieces where the night goes back: behind the street, and over the soil. Filled after, a
  // piece alike in the row above making it a row taller (`merged`): every pixel gets the same fills in
  // the same order as row by row (behind first, then over the soil), in far fewer rectangles.
  const behind: Run[][] = [];
  const overSoil: Run[][] = [];
  for (let y = y0; y < y1; y++) {
    const back: Run[] = [];
    const over: Run[] = [];
    for (const run of darkRow(y, view.w, all, night, cuts)) {
      const without = darknessAt(run.x + run.w / 2, y + 0.5, night[Math.min(night.length - 1, run.x)] ?? 0, others);
      if (without <= run.dark || run.dark >= 1) continue;
      const a = (without - run.dark) / (1 - run.dark);
      // The backdrop behind the street: only where nothing of the street is drawn.
      back.push({ x: run.x, w: run.w, dark: a });
      // The soil: from a few pixels under the ground's top down, column by column.
      let from = -1;
      for (let x = run.x; x <= run.x + run.w; x++) {
        const deep = x < run.x + run.w && y >= soilTop(x);
        if (deep && from < 0) from = x;
        else if (!deep && from >= 0) {
          over.push({ x: from, w: x - from, dark: a });
          from = -1;
        }
      }
    }
    behind.push(back);
    overSoil.push(over);
  }
  const fill = (r: Run, y: number, h: number) => S(r.x, y, r.w, h, `rgba(${NIGHT}, ${r.dark})`);
  g.globalCompositeOperation = "destination-over";
  merged(y0, y1, (y) => behind[y - y0], fill);
  g.globalCompositeOperation = "source-over";
  merged(y0, y1, (y) => overSoil[y - y0], fill);
}


// --- A dark whose own lights stand still (Vålerenga's lane behind the church, order 33) --------------------------------------
//
// `drawNight` cuts every row of the screen where a light's ring crosses it and fills each piece: a ring is a new piece in every
// row, so a lane with two lanterns and the church's window through its dark cost about 1,580 rectangles a frame (order 32). Here
// the same dark is kept: what never moves (the night's own depth, the lanterns', the window's, the flag's and the boards' light
// through it) is worked out once, in world pixels, as one path a darkness; his headlamp's rings once a facing, as one path a
// darkness round him. A frame fills each path once in its own colour, held by clips to where it is the least dark, so every
// pixel gets exactly the fills `drawNight` gives it, in the same order (the dark, then the night put back behind the street,
// then over the soil): the same pixels, byte for byte (a path is filled as a rectangle is; a copy of a see-through piece would
// not be). `night.test.ts` holds it pixel by pixel against `drawNight`.

/** Far enough past any screen: the rows of the night above and below its lights, and the clip round the headlamp. */
const FAR = 8192;

/** A darkness and every piece of the dark at it, as world (or lamp) rectangles x, y, w, h, and as one path. */
interface Depth {
  dark: number;
  rects: number[];
  path: Path2D;
}

/** The still part of a level's dark: where it is (world columns), each depth of it, and what lies darker than each of the lamp's. */
interface Field {
  x0: number;
  x1: number;
  depths: Depth[];
  over: Map<number, Path2D | null>;
}

/** His headlamp's rings as depths round (0, 0), and the clips outside the first k of them. */
interface Lamp {
  depths: Depth[];
  outside: Map<number, Path2D>;
}

const FIELDS = new Map<string, Field>();
const LAMPS = new Map<number, Lamp>();

/** Rectangles x, y, w, h grouped by darkness, as depths, the lightest first. */
function depthsOf(by: Map<number, number[]>): Depth[] {
  return [...by]
    .sort((a, b) => a[0] - b[0])
    .map(([dark, rects]) => {
      const path = new Path2D();
      for (let i = 0; i < rects.length; i += 4) path.rect(rects[i], rects[i + 1], rects[i + 2], rects[i + 3]);
      return { dark, rects, path };
    });
}

/** The lights of the dark that stand still, in world pixels, as `drawNight` takes them: the boards, then the level's own. */
function stillLights(def: LevelDef, v: View, boards: readonly Board[]): Light[] {
  const out: Light[] = [];
  for (const bd of boards) out.push({ rect: { x: Math.round(bd.cx - bd.w / 2 - 1), y: bd.y - 1, w: bd.w + 2, h: 13 }, dark: 0.25 });
  for (const l of def.art.lights?.(v) ?? []) out.push(l);
  return out;
}

/**
 * The still dark, worked out once for its lights: the night's depth of each world column (as `drawNight` rounds it), the lights cut
 * through it, row by row and joined as `drawDark` joins them; above and below the lights every row is the night's alone.
 */
function fieldOf(def: LevelDef, v: View, still: Light[], width: number): Field {
  const key = `${def.id} ${JSON.stringify(still)}`;
  const had = FIELDS.get(key);
  if (had) return had;
  const depth = (x: number) => Math.round(Math.max(0, Math.min(1, def.dark!(x, v))) * 20) / 20;
  let x0 = 0;
  let x1 = 0;
  for (let x = 0; x < width; x++) if (depth(x) > 0) [x0, x1] = [x1 > x0 ? x0 : x, x + 1];
  const w = Math.max(1, x1 - x0);
  const night = Array.from({ length: w }, (_, i) => depth(x0 + i));
  const cuts = nightCutsOf(night);
  const lights = still.map((l): Light => ("rect" in l ? { rect: { ...l.rect, x: l.rect.x - x0 }, dark: l.dark } : { x: l.x - x0, y: l.y, rings: l.rings }));
  let top = 0;
  let bottom = 1;
  for (const l of still) {
    const [a, b] = "rect" in l ? [l.rect.y, l.rect.y + l.rect.h] : [l.y - Math.max(...l.rings.map((r) => r[0])), l.y + Math.max(...l.rings.map((r) => r[0]))];
    top = Math.min(top, Math.floor(a) - 1);
    bottom = Math.max(bottom, Math.ceil(b) + 1);
  }
  const by = new Map<number, number[]>();
  const add = (r: Run, y: number, h: number) => {
    let rects = by.get(r.dark);
    if (!rects) by.set(r.dark, (rects = []));
    rects.push(x0 + r.x, y, r.w, h);
  };
  merged(top, bottom, (row) => darkRow(row, w, lights, night, cuts).filter((r) => r.dark > 0), add);
  for (const r of darkRow(0, w, [], night, cuts).filter((r) => r.dark > 0)) {
    add(r, top - FAR, FAR);
    add(r, bottom, FAR);
  }
  const field: Field = { x0, x1, depths: depthsOf(by), over: new Map() };
  FIELDS.set(key, field);
  return field;
}

/** Where the still dark is darker than `dark`: every depth of it past that, as one path (null where none is). */
function darkerThan(f: Field, dark: number): Path2D | null {
  if (f.over.has(dark)) return f.over.get(dark)!;
  const deeper = f.depths.filter((d) => d.dark > dark);
  let path: Path2D | null = null;
  if (deeper.length) {
    path = new Path2D();
    for (const d of deeper) path.addPath(d.path);
  }
  f.over.set(dark, path);
  return path;
}

/** His headlamp, facing `facing`, as `drawNight` places it: the ring round him at (0, 0), the beam ahead at (36, -2). */
function lampOf(facing: number): Lamp {
  const had = LAMPS.get(facing);
  if (had) return had;
  const OFF = 128;
  const rings: Light[] = [
    { x: OFF, y: 0, rings: AROUND },
    { x: OFF + facing * 36, y: -2, rings: BEAM }
  ];
  const by = new Map<number, number[]>();
  merged(
    -64,
    64,
    (row) => darkRow(row, 2 * OFF, rings, 1).filter((r) => r.dark < 1),
    (r, y, h) => {
      let rects = by.get(r.dark);
      if (!rects) by.set(r.dark, (rects = []));
      rects.push(r.x - OFF, y, r.w, h);
    }
  );
  const lamp: Lamp = { depths: depthsOf(by), outside: new Map() };
  LAMPS.set(facing, lamp);
  return lamp;
}

/** Everywhere but the lamp's first `k` depths (its lightest): a clip, by the even-odd rule. */
function outsideOf(lamp: Lamp, k: number): Path2D {
  let path = lamp.outside.get(k);
  if (path) return path;
  path = new Path2D();
  path.rect(-FAR, -FAR, 2 * FAR, 2 * FAR);
  for (const d of lamp.depths.slice(0, k)) path.addPath(d.path);
  lamp.outside.set(k, path);
  return path;
}

/** Whether any of a depth's rectangles meets the world rectangle x, y, w, h. */
function meets(d: Depth, x: number, y: number, w: number, h: number) {
  const r = d.rects;
  for (let i = 0; i < r.length; i += 4) if (r[i] < x + w && r[i] + r[i + 2] > x && r[i + 1] < y + h && r[i + 1] + r[i + 3] > y) return true;
  return false;
}

/**
 * `drawNight` for a level whose own lights through its dark all stand still and whose dark is the same at every moment (Vålerenga's
 * lane, until its flourish): the same pixels, kept. Without paths (the tests' stand-in canvases) or during a flourish, `drawNight`.
 */
export function drawNightKept(def: LevelDef, v: View, shown: Body, boards: readonly Board[], map: TileMap) {
  if (typeof Path2D === "undefined") return drawNight(def, v, shown, boards, map);
  const f = fieldOf(def, v.flourish === null ? v : { ...v, flourish: null }, stillLights(def, v, boards), map.width);
  // Off the screen there is nothing of it to draw (a flourish only lightens it); in a flourish, `drawNight` draws it fading.
  if (f.x1 <= view.camX || f.x0 >= view.camX + view.w) return void def.art.overDark?.(v);
  if (v.flourish !== null) return drawNight(def, v, shown, boards, map);
  const g = ctx();
  const { camX, camY } = view;
  const hx = Math.round(shown.x + PLAYER.w / 2) - camX;
  const hy = Math.round(shown.y + 2) - camY;
  const lamp = lampOf(v.facing);
  const fill = (d: Depth, dark: number, colour = dark >= 1 ? `rgb(${NIGHT})` : `rgba(${NIGHT}, ${dark})`) => {
    g.fillStyle = colour;
    g.fill(d.path);
  };
  // The dark: each depth of the still dark where the lamp is no lighter (outside its lighter rings), then each of the lamp's
  // rings where the still dark is darker than it. Each pixel once, at the least of the two.
  const onScreen = f.depths.filter((d) => meets(d, camX, camY, view.w, view.h));
  for (let k = 1; k <= lamp.depths.length; k++) {
    const group = onScreen.filter((d) => lamp.depths.filter((l) => l.dark < d.dark).length === k);
    if (!group.length) continue;
    g.save();
    g.translate(hx, hy);
    g.clip(outsideOf(lamp, k), "evenodd");
    g.translate(-hx - camX, -hy - camY);
    for (const d of group) fill(d, d.dark);
    g.restore();
  }
  for (const l of lamp.depths) {
    const deeper = l.dark > 0 ? darkerThan(f, l.dark) : null;
    if (!deeper) continue;
    g.save();
    g.translate(-camX, -camY);
    g.clip(deeper);
    g.translate(camX + hx, camY + hy);
    fill(l, l.dark);
    g.restore();
  }
  // Where the lamp lit the dark, the night put back behind the street and over the soil (`lampOnlyLightsTheStreet`): the
  // still dark's depth under each of its rings, at what the ring took off it.
  const near = f.depths.filter((d) => meets(d, hx + camX - 128, hy + camY - 64, 256, 128));
  const back = (extra?: Path2D) => {
    for (const l of lamp.depths) {
      const under = near.filter((d) => d.dark > l.dark);
      if (!under.length) continue;
      g.save();
      if (extra) g.clip(extra);
      g.translate(hx, hy);
      g.clip(l.path);
      g.translate(-hx - camX, -hy - camY);
      for (const d of under) fill(d, 0, `rgba(${NIGHT}, ${(d.dark - l.dark) / (1 - l.dark)})`);
      g.restore();
    }
  };
  g.globalCompositeOperation = "destination-over";
  back();
  g.globalCompositeOperation = "source-over";
  // The soil, column by column: from a few pixels under the ground's top down.
  const soilTop = soilOf(shown, map);
  const soil = new Path2D();
  let from = -1;
  let at = 0;
  for (let x = Math.max(0, hx - 128); x <= Math.min(view.w, hx + 128); x++) {
    const top = x < Math.min(view.w, hx + 128) ? Math.ceil(soilTop(x)) : NaN;
    if (from >= 0 && top !== at) {
      soil.rect(from, at, x - from, FAR);
      from = -1;
    }
    if (from < 0 && Number.isFinite(top)) [from, at] = [x, top];
  }
  back(soil);
  def.art.overDark?.(v);
}
