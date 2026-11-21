import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { darkRow, darknessAt, drawDark, merged, nightCutsOf, type Light, type Ring, type Run } from "@larshansen/pixelkit/dark";
import { S, ctx, view } from "@larshansen/pixelkit/paint";
import type { Body } from "@larshansen/pixelkit/physics";
import type { Board } from "@larshansen/pixelkit/text";
import type { TileMap } from "@larshansen/pixelkit/tilemap";
import type { LevelDef, View } from "../levels/types";

// The night under the trees, for the level that has one (Nordmarka): the dark over everything, his
// headlamp and the level's own lights through it, and what shines over it. It comes with that level's
// file (the page calls it through `Art.night`), so the first script does not carry it.

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

/**
 * The headlamp lights what stands in front of the backdrop: the street layer's things, the walls
 * and the top edge of the ground. Where its disc falls on the sky or the far layers, or deeper than
 * a few pixels into the soil below his feet, the night goes back to what it would be without the
 * lamp. The street canvas is see-through where the backdrop shows, so the night is put back there
 * underneath what is drawn (destination-over), and over the soil as usual.
 */
function lampOnlyLightsTheStreet(lamp: Light[], others: Light[], night: number[], shown: Body, map: TileMap) {
  const g = ctx();
  const feet = shown.y + PLAYER.h;
  const r0 = Math.floor(feet / TILE);
  // The top of the soil in each column the lamp reaches: the first solid tile at or below his feet.
  const soil = new Map<number, number>();
  const soilTop = (x: number) => {
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

