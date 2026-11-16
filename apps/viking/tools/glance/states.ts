// One look of a level drawn in chosen states (order 25), as JSON for `framesheet.py`: each state a patch over the first
// enemy of that look (`calm`, `n`, `dir`, `x`), a step, and where he is; for looking at what the census does not draw (a
// watched statue, a calm swan, a guard as stone).
//   bun tools/glance/states.ts <level> <look> '<json list of [label, patch, t]>' > out.json
import { target, view } from "@larshansen/pixelkit/paint";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { loadLevel } from "../../src/levels/index";
import { newPlay } from "../../src/game/play";
import { SHIELD_RULES } from "../../src/game/shield";
import "../../src/render/feel";
import { drawEnemy } from "../../src/render/pickups";
const [level, look, list] = process.argv.slice(2);
const def = await loadLevel(level);
const p = newPlay(def, { shield: SHIELD_RULES, hasShield: def.rune > 10 });
const e0 = p.enemies.find((e) => e.def.look === look)!;
Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
type Rect = { x: number; y: number; w: number; h: number; c: string };
const frames: { name: string; rects: Rect[] }[] = [];
for (const [label, patch, t, him] of JSON.parse(list) as [string, Record<string, unknown>, number, number?][]) {
  const e = { ...e0, def: { ...e0.def }, ...patch } as typeof e0;
  const rects: Rect[] = [];
  const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); }, drawImage() {} };
  target(rec as unknown as CanvasRenderingContext2D);
  const v = { sky: skyFor(new Date(2026, 5, 15, 12), "day"), t, alpha: 1, doors: new Map(), now: new Date(), him: { x: him ?? -999, y: 0 }, flourish: null, facing: 1, troll: null, flags: [], enemies: p.enemies, boss: null, cleared: [], runeAt: null, grounds: p.grounds?.state ?? null };
  void (def.art.enemy?.(e, v as never) || drawEnemy(e, t));
  const dx = Math.round(e.x) - 100, dy = Math.round(e.y) - 100;
  frames.push({ name: label, rects: rects.filter((r) => !r.c.startsWith("rgba")).map((r) => ({ ...r, x: r.x - dx, y: r.y - dy })) });
}
const all = frames.flatMap((f) => f.rects);
const x0 = Math.min(...all.map((r) => r.x)), y0 = Math.min(...all.map((r) => r.y));
const w = Math.max(...all.map((r) => r.x + r.w)) - x0, h = Math.max(...all.map((r) => r.y + r.h)) - y0;
const out = { [`${level} ${look}`]: frames.map((f) => { const px = Array.from({ length: h }, () => Array<string>(w).fill("")); for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) px[y - y0][x - x0] = r.c; return { name: f.name, w, h, x0: 0, y0: 0, px }; }) };
console.log(JSON.stringify(out));
