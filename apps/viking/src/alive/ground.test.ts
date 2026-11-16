import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { ctx, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { newPlay } from "../game/play";
import { BUILT, loadLevel } from "../levels/index";
import { areaRecorder, deltaE, parseColour, skyOf } from "../render/fields";
import { drawTiles } from "../render/tiles";
import { DRAWN, type Grain } from "./ground";

// Order 26 (ADR 0049): the ground under him. Every solid tile of every level is drawn from the textured set (a piece
// drawn once pixel by pixel and copied), but the named few that are not ground; and every material of that set is three
// to five tones of one hue in a narrow band, its contrast below the figures'.

const rgb = (c: string) => parseColour(c)!.rgb;

/** Solid tiles that are not ground, or are drawn pixel by pixel another way, by level and letter, and why. */
const NOT_GROUND: { level: string; letter: string; where?: (c: number, r: number) => boolean; why: string }[] = [
  { level: "nabolaget", letter: "R", why: "the houses under the roofs: the roofs and walls are the street's back art (the roofs' slate is textured there)" },
  { level: "nabolaget", letter: "T", why: "the church's tower: the back art's" },
  { level: "nabolaget", letter: "H", why: "the chimney on the fourth house: the back art's" },
  { level: "nabolaget", letter: "W", why: "the shed at the street's start: the back art's (the two crates in the yard are the set's)" },
  { level: "nabolaget", letter: "#", where: (c, r) => c >= 131 && c < 152 && r < 20, why: "under the drift: the drift's own snow, the back art's" },
  { level: "bygdoy", letter: "H", why: "the hulls of Fram and of the longship on its cradle: ships, kept in strips by the level" },
  { level: "bygdoy", letter: "L", why: "the loft over the low passage: a building, kept in strips by the level" },
  { level: "bygdoy", letter: "B", why: "a rowing boat on the beach: a thing, not ground" },
  { level: "gamlebyen", letter: "Z", why: "a stone that rises as he comes: drawn from the play's state, not kept" },
  { level: "gamlebyen", letter: "z", why: "a stepping stone that rises as he comes: drawn from the play's state, not kept" },
  { level: "vigelandsparken", letter: "G", where: (c) => c >= 35 && c <= 82, why: "under the bridge's deck: nothing is drawn but the pond and the arches" },
  { level: "korketrekkeren", letter: "#", where: () => true, why: "under the snow's crust: its wind-packed layers with a stone, a root and a lens of ice, drawn pixel by pixel and copied since order 20 (ADR 0042)" },
  { level: "ostensjovannet", letter: "#", where: () => true, why: "the lake's old bed under the banks: reed roots, peat, pebbles, clay and a shell, drawn pixel by pixel and copied since order 20 (ADR 0042)" },
  { level: "stortinget", letter: "W", why: "the rock over the halls: kept in blocks since order 21; its concrete faces are the textured set's" },
  { level: "holmenkollen", letter: "H", why: "the red rail of the course: a thing, padded, not ground" },
  { level: "radhuset", letter: "N", why: "the clock tower's lantern: a building's walls and window" }
];

/** Every level's tiles drawn across its whole map at views 320 x 200, noting which were drawn from the textured set. */
async function walk(id: string) {
  const def = await loadLevel(id);
  const map = newPlay(def, {}).map;
  const sky = skyOf(def, "day");
  DRAWN.tiles = new Set();
  DRAWN.grains ??= new Set();
  const was = { ...view, g: ctx() };
  target(areaRecorder().ctx);
  Object.assign(view, { w: 320, h: 200, k: 1, reduced: true });
  for (let y = 0; y < map.height; y += view.h)
    for (let x = 0; x < map.width; x += view.w) {
      view.camX = view.camXf = x;
      view.camY = view.camYf = y;
      drawTiles(map, def.art, sky, def.underground);
    }
  target(was.g);
  Object.assign(view, { w: was.w, h: was.h, k: was.k, camX: was.camX, camY: was.camY, camXf: was.camXf, camYf: was.camYf, reduced: was.reduced });
  const tiles = DRAWN.tiles;
  DRAWN.tiles = undefined;
  return { map, tiles };
}

describe("the ground under him (order 26)", () => {
  test("every solid tile of every level is drawn from the textured set, but the named that are not ground", async () => {
    const missing = new Map<string, number>();
    for (const st of BUILT) {
      const { map, tiles } = await walk(st.id);
      for (let r = 0; r < map.rows; r++)
        for (let c = 0; c < map.cols; c++) {
          if (!map.isSolid(c, r) || tiles.has(r * 4096 + c)) continue;
          const t = map.tileAt(c, r);
          if (NOT_GROUND.some((n) => n.level === st.id && n.letter === t && (!n.where || n.where(c, r)))) continue;
          const key = `${st.id} "${t}"`;
          missing.set(key, (missing.get(key) ?? 0) + 1);
        }
    }
    expect([...missing].map(([k, n]) => `${k}: ${n} tiles`)).toEqual([]);
  }, 120_000);

  test("every material is three to five tones of one hue, in a narrow band, its contrast below the figures'", () => {
    const grains = [...(DRAWN.grains ?? new Set<Grain>())];
    expect(grains.length).toBeGreaterThan(30);
    // The figures' contrast: an enemy's body against the dark line round it (the least of them), and him against his helmet.
    const figures = Math.min(...[ENEMY.plum, ENEMY.orange, ENEMY.poison, ENEMY.pink, ENEMY.white].map((b) => deltaE(rgb(b), rgb(ENEMY.line))), deltaE(rgb(ROLES.him.tunic), rgb(ROLES.him.skin)));
    const lab = (c: string) => {
      const [r, g, b] = rgb(c).map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
      const X = f((r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047);
      const Y = f(r * 0.2126 + g * 0.7152 + b * 0.0722);
      const Z = f((r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883);
      return { L: 116 * Y - 16, a: 500 * (X - Y), b: 200 * (Y - Z) };
    };
    const wrong: string[] = [];
    const table: string[] = [];
    for (const g of grains) {
      const tones = [...new Set(g.ramp)];
      const span = deltaE(rgb(g.ramp[0]), rgb(g.ramp[g.ramp.length - 1]));
      // Hue: of the tones with colour enough to have one, the widest angle between two.
      const hues = tones.map(lab).filter((l) => Math.hypot(l.a, l.b) > 10).map((l) => (Math.atan2(l.b, l.a) * 180) / Math.PI);
      let spread = 0;
      for (const a of hues) for (const b of hues) spread = Math.max(spread, Math.min(Math.abs(a - b), 360 - Math.abs(a - b)));
      table.push(`${g.name}: ${tones.length} tones, darkest to lightest ${span.toFixed(1)}, hue spread ${spread.toFixed(0)}°`);
      if (tones.length < 3 || tones.length > 5) wrong.push(`${g.name}: ${tones.length} tones`);
      if (spread > HUE_SPREAD) wrong.push(`${g.name}: hues ${spread.toFixed(0)}° apart`);
      if (span > SPAN || span >= figures) wrong.push(`${g.name}: darkest to lightest ${span.toFixed(1)} (the band ${SPAN}, the figures ${figures.toFixed(1)})`);
    }
    console.log(`The textured set (${grains.length} materials; the figures' contrast ${figures.toFixed(1)}):\n  ${table.sort().join("\n  ")}`);
    expect(wrong).toEqual([]);
  });
});

/** A material's tones: their hues no further apart than this (degrees of CIELAB hue, of the tones with colour), and its darkest to its lightest no further than this (CIEDE2000). */
const HUE_SPREAD = 40;
const SPAN = 40;
void TILE;
