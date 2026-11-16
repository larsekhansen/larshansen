// The ground's surfaces, one picture each (order 26): for every level and every solid letter on its map, a tile of it
// with the sky over its top (the one nearest the middle of the level), drawn with the four tiles round it into a
// raster of its own, outside the page, as the street layer draws it: the water, the tiles, under the level's own sky
// the night's tint over them and what keeps its light after dark (the paint) over that. Written as raw RGB with a
// small index, for `groundsheet.py` to lay out at any scale. Run on two checkouts, it gives each surface before and after.
//
//   bun tools/glance/groundsheet.ts <out dir> [day|own]

import { TILE } from "@larshansen/pixelkit/config";
import type { Phase } from "@larshansen/pixelkit/oslo";
import { TINT, target, view } from "@larshansen/pixelkit/paint";
import { mkdirSync, writeFileSync } from "node:fs";
import { newPlay } from "../../src/game/play";
import { BUILT, loadLevel } from "../../src/levels/index";
import { parseColour, skyOf } from "../../src/render/fields";
import { drawTiles, drawWater, standTops } from "../../src/render/tiles";
import { skyOf as ownSky } from "./skies";

const [out, which = "day"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const W = 7 * TILE;
const H = 5 * TILE;

/** A context that paints rectangles into an RGB raster, blending what is not opaque. */
function raster(w: number, h: number) {
  const px = new Float32Array(w * h * 3);
  let style: unknown = "#000000";
  const g = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    canvas: { width: w, height: h },
    get fillStyle() {
      return style;
    },
    set fillStyle(v: unknown) {
      style = v;
    },
    fillRect(x: number, y: number, rw: number, rh: number) {
      const p = parseColour(style);
      if (!p) return;
      const a = p.a * this.globalAlpha;
      for (let yy = Math.max(0, y); yy < Math.min(h, y + rh); yy++)
        for (let xx = Math.max(0, x); xx < Math.min(w, x + rw); xx++) {
          const i = (yy * w + xx) * 3;
          for (let k = 0; k < 3; k++) px[i + k] = px[i + k] * (1 - a) + p.rgb[k] * a;
        }
    }
  };
  const ctx = new Proxy(g, { get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined) });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, px };
}

const index: string[] = [];
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  const map = newPlay(def, {}).map;
  const own = ownSky(def);
  const phase = (which === "day" ? "day" : own === "winter" ? "night" : own) as Phase;
  const sky = skyOf(def, phase);
  const letters = [...new Set(map.map.join(""))].filter((t) => def.legend.solid.includes(t));
  for (const t of letters) {
    let best: { c: number; r: number; d: number } | null = null;
    for (let r = 1; r < map.rows; r++)
      for (let c = 2; c < map.cols - 2; c++) {
        if (map.tileAt(c, r) !== t || map.isSolid(c, r - 1) || map.isWater(c, r - 1)) continue;
        const d = Math.abs(c - map.cols / 2);
        if (!best || d < best.d) best = { c, r, d };
      }
    if (!best) {
      for (let r = 0; r < map.rows && !best; r++) for (let c = 0; c < map.cols && !best; c++) if (map.tileAt(c, r) === t) best = { c, r, d: 0 };
    }
    if (!best) continue;
    const { ctx, px } = raster(W, H);
    target(ctx);
    Object.assign(view, { w: W, h: H, k: 1, reduced: true, camX: best.c * TILE - 3 * TILE, camY: best.r * TILE - 2 * TILE, camXf: best.c * TILE - 3 * TILE, camYf: best.r * TILE - 2 * TILE });
    ctx.fillStyle = "#a9c9e0";
    ctx.fillRect(0, 0, W, H);
    drawWater(map, 0);
    drawTiles(map, def.art, sky, def.underground);
    const tint = TINT[sky.phase];
    if (tint) {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, W, H);
      standTops(map, def.art);
    }
    const name = `${st.id}-${t === "#" ? "ground" : t.charCodeAt(0)}`;
    const bytes = new Uint8Array(W * H * 3);
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.round(Math.max(0, Math.min(255, px[i])));
    writeFileSync(`${out}/${name}.rgb`, bytes);
    index.push(`${name}\t${st.id}\t${t}\t${best.c}\t${best.r}\t${sky.phase}`);
  }
}
writeFileSync(`${out}/index.tsv`, index.join("\n") + "\n");
console.log(`${index.length} surfaces, ${W} x ${H} each`);
