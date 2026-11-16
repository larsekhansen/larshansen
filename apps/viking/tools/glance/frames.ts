// Every frame of every figure (order 23) as JSON, for `framesheet.py`: him from his table of frames, and every enemy
// look as the game draws it, through a recorder, in each state it has (still, moving, winding up, beaten).
//
//   bun tools/glance/frames.ts [figure ...] > frames.json; python3 tools/glance/framesheet.py frames.json <dir>

import { PLAYER } from "@larshansen/pixelkit/config";
import { target, view } from "@larshansen/pixelkit/paint";
import { ALL_FRAMES, MARGIN } from "../../src/alive/him";
import { pixels, type Frame } from "../../src/alive/frames";
import { lookFrames } from "../../src/alive/census";
import { ALL_FOES } from "../../src/alive/foes";
import { SKILLING, CHEESE } from "../../src/alive/things";

type Out = { name: string; w: number; h: number; x0: number; y0: number; box?: [number, number]; px: string[][] };
const only = process.argv.slice(2);
const out: Record<string, Out[]> = {};

const grid = (f: Frame, x0: number, y0: number, w: number, h: number) => {
  const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
  pixels(f, 1, PLAYER.w, (c, r, colour) => {
    if (r - y0 >= 0 && r - y0 < h && c - x0 >= 0 && c - x0 < w) px[r - y0][c - x0] = colour;
  });
  return px;
};

if (!only.length || only.includes("him")) {
  const w = PLAYER.w + 2 * MARGIN;
  const h = PLAYER.h + 2 * MARGIN;
  out.him = ALL_FRAMES.map((f) => ({ name: f.name, w, h, x0: -MARGIN, y0: -MARGIN, box: [PLAYER.w, PLAYER.h], px: grid(f, -MARGIN, -MARGIN, w, h) }));
}

// The looks drawn as frames, from their tables (unsquashed), and the small things.
const table = (fs: Frame[], label: string) => {
  const x0 = Math.min(...fs.map((f) => f.x0));
  const y0 = Math.min(...fs.map((f) => f.y0));
  const w = Math.max(...fs.map((f) => f.x1)) - x0;
  const h = Math.max(...fs.map((f) => f.y1)) - y0;
  if (!only.length || only.includes(label)) out[label] = fs.map((f) => ({ name: f.name, w, h, x0: 0, y0: 0, px: grid(f, x0, y0, w, h) }));
};
for (const [name, l] of Object.entries(ALL_FOES())) table([...l.idle, ...l.move, ...(l.windup ? [l.windup] : [])], `${name} (frames)`);
table([...SKILLING, CHEESE], "things");

// The small things (order 24), each drawn as the page draws it, through a recorder: the bench, the bracteate turning,
// the rune on its stone, the sheep, the flag in still air and in wind, the ski pole, the feather, the shield.
const recorded = (name: string, draw: () => void): { name: string; rects: { x: number; y: number; w: number; h: number; c: string }[] } => {
  const rects: { x: number; y: number; w: number; h: number; c: string }[] = [];
  const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); }, drawImage(c: { rects?: typeof rects }, x: number, y: number) { for (const r of c.rects ?? []) rects.push({ ...r, x: r.x + x, y: r.y + y }); } };
  target(rec as unknown as CanvasRenderingContext2D);
  draw();
  return { name, rects: rects.filter((r) => !r.c.startsWith("rgba")) };
};
const asFigure = (label: string, ds: ReturnType<typeof recorded>[]) => {
  if (only.length && !only.includes(label)) return;
  const all = ds.flatMap((d) => d.rects);
  const x0 = Math.min(...all.map((r) => r.x));
  const y0 = Math.min(...all.map((r) => r.y));
  const w = Math.max(...all.map((r) => r.x + r.w)) - x0;
  const h = Math.max(...all.map((r) => r.y + r.h)) - y0;
  out[label] = ds.map((d) => {
    const px = Array.from({ length: h }, () => Array<string>(w).fill(""));
    for (const r of d.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (y - y0 >= 0 && y - y0 < h && x - x0 >= 0 && x - x0 < w) px[y - y0][x - x0] = r.c;
    return { name: d.name, w, h, x0: 0, y0: 0, px };
  });
};
{
  // Without a page the things draw as rectangles (`stamp` falls back to runs), which the recorder notes.
  const T = await import("../../src/alive/things");
  const { drawShieldFace, drawShieldOn } = await import("../../src/game/shield");
  Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
  asFigure("bench", [recorded("bench", () => T.bench(20, 40, false)), recorded("bench, sitting", () => T.bench(20, 40, true))]);
  asFigure("bracteate", [0, 15, 30, 45, 60, 140].map((s) => recorded(`bracteate, step ${s}`, () => T.bracteate(10, 10, s))));
  asFigure("rune stone", [recorded("rune L, lit", () => T.runeStone(10, 10, "L", "lit", 0)), recorded("rune S, lit", () => T.runeStone(10, 10, "S", "lit", 40)), recorded("rune N, dark", () => T.runeStone(10, 10, "N", "dark", 0)), recorded("rune A, ghost", () => T.runeStone(10, 10, "A", "ghost", 0))]);
  const sheep = (x: number, grazing: number, squash = 0) => ({ home: x, range: 60, x, bottom: 40, dir: 1 as const, grazing, squash, rnd: Math.random });
  asFigure("sheep", [recorded("sheep, walking 1", () => T.sheep(sheep(20, 0))), recorded("walking 2", () => T.sheep(sheep(23, 0))), recorded("walking 3", () => T.sheep(sheep(26, 0))), recorded("walking 4", () => T.sheep(sheep(29, 0))), recorded("grazing", () => T.sheep(sheep(20, 10))), recorded("chewing", () => T.sheep(sheep(20, 30))), recorded("landed on", () => T.sheep(sheep(20, 0, 3)))]);
  const flag = { x: 20, bottom: 50 } as never;
  asFigure("flag", [recorded("folded", () => T.flag(flag, null, 0, "langkaia")), ...[0, 9, 18].map((t) => recorded(`in the wind ${t / 9 + 1}`, () => T.flag(flag, -100 - t, t - 20, "langkaia"))), ...[0, 26, 52].map((t) => recorded(`in still air ${t / 26 + 1}`, () => T.flag(flag, -100 - t, t - 20, "stortinget")))]);
  asFigure("ski pole and feather", [recorded("ski pole", () => T.skiPole(20, 20, 10)), recorded("feather", () => T.feather(20, 20, false)), recorded("feather, gold", () => T.feather(20, 20, true))]);
  asFigure("shield", [recorded("face", () => drawShieldFace(10, 10)), recorded("on his back", () => drawShieldOn({ x: 20, y: 10 }, 1, 0, false)), recorded("coming up", () => drawShieldOn({ x: 20, y: 10 }, 1, 0.5, false)), recorded("up", () => drawShieldOn({ x: 20, y: 10 }, 1, 1, false))]);
}

// What line 2's throwers throw and the serpent spits (order 25), each in flight in its two frames and, where the shield
// stops it, spent; and the heron, standing, making ready to fly and flying off.
{
  const { BUILT, loadLevel } = await import("../../src/levels/index");
  const shot = (x: number, y: number, vx: number, spent?: number) => ({ x, y, vx, vy: 0.3, born: 0, by: 0, spent }) as never;
  const shots: ReturnType<typeof recorded>[] = [];
  for (const st of BUILT) {
    const def = await loadLevel(st.id);
    if (def.rune < 11 || !def.art.shot) continue;
    const v = { t: 0, enemies: [] } as never;
    for (const [label, s] of [[`${st.id}, in flight`, shot(20, 20, -2)], [`${st.id}, turning`, shot(23, 20, -2)], [`${st.id}, stopped`, shot(20, 20, -2, 0)]] as const) shots.push(recorded(label, () => def.art.shot!(s, v)));
  }
  const { ballArt } = await import("../../src/levels/gamlebyen");
  for (const t of [0, 4]) shots.push(recorded(`the serpent's ball ${t / 4 + 1}`, () => ballArt({ ball: { x: 20, y: 20, vx: -2, back: false } } as never, t)));
  asFigure("line 2's shots", shots);
  const { heronArt, HERON } = await import("../../src/levels/ostensjovannet");
  const lake = (landed: number | null, gone: number | null) => ({ pads: [], landed, gone }) as never;
  asFigure("heron", [recorded("heron", () => heronArt(lake(null, null), 0)), recorded("heron, looking back", () => heronArt(lake(null, null), 400)), ...[15, 30, 45].map((k) => recorded(`heron, making ready ${k / 15}`, () => heronArt(lake(0, null), k))), ...[0, 5].map((k) => recorded(`heron, flying off ${k / 5 + 1}`, () => heronArt(lake(null, 0), k + 10)))].map((d) => ({ ...d, rects: d.rects.filter((r) => r.y < HERON.y + 14) })));
}

// The enemies: each look's frames as the page draws them (through `outlined`'s recorder), still, moving, winding up, beaten.
Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
for (const [look, frames] of Object.entries(await lookFrames())) {
  if (only.length && !only.includes(look)) continue;
  const all = frames.flatMap((f) => f.rects.map((r) => r));
  if (!all.length) continue;
  const x0 = Math.min(...all.map((r) => r.x));
  const y0 = Math.min(...all.map((r) => r.y));
  const x1 = Math.max(...all.map((r) => r.x + r.w));
  const y1 = Math.max(...all.map((r) => r.y + r.h));
  out[look] = frames.map((f) => {
    const px = Array.from({ length: y1 - y0 }, () => Array<string>(x1 - x0).fill(""));
    for (const r of f.rects) for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) px[y - y0][x - x0] = r.c;
    return { name: f.name, w: x1 - x0, h: y1 - y0, x0: 0, y0: 0, px };
  });
}
target(undefined as unknown as CanvasRenderingContext2D);
console.log(JSON.stringify(out));
