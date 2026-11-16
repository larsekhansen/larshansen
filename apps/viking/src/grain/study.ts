import { PLAYER } from "@larshansen/pixelkit/config";
import { R, mix, view } from "@larshansen/pixelkit/paint";
import { ENEMY, METAL, STONE } from "@larshansen/pixelkit/palette";
import { snap, sx, sy, textCtx, unit } from "@larshansen/pixelkit/text";
import type { Enemy } from "../game/enemies";
import type { Play } from "../game/play";
import type { LevelDef, View } from "../levels/types";
import * as M from "./maps";
import type { PixelMap } from "./maps";

// The grain study (order 22, part B), behind `?debug&grain=<way>`, fetched only then: the subjects drawn again by
// hand, on two scenes, three ways, for Lars to choose between. Nothing here is in the live game, and nothing in the
// page changes for it: the study stages its scene (moving a pigeon, the bench, the cheese and the bracteate into the
// frame), hides today's drawing of each subject the way a level would (a level's own `enemy` and `flag` drawing,
// the skilling and the cheese marked taken, him drawn see-through) and draws its own over the frame the page drew.
//
//   0      today, staged the same way, for the side by side
//   3      the same grain, better drawn: per-pixel maps with tone ramps, at today's size
//   1      finer small things: him, the enemies and what he takes on a grid twice as fine, the world as it is
//   2      everything twice as fine: that, and the street and its backdrop given a second pass on the finer grid
//   sheet  the subjects alone at four times their size: today, way 3, ways 1 and 2, with his and the rat's frames
//   depth  part C: Langkaia's fjord cut into strips, each a little faster than the one above (a still shows one moment)

interface Game {
  play: Play;
  level: LevelDef;
  shown: { x: number; y: number };
  state: { alpha: number; steps: number };
  still(): void;
}

/** The pixels the study's subjects painted, and how many subjects: drawn once and kept, as a real build would, a subject is one copy a frame. */
const drawn = { pixels: 0, subjects: 0 };

/** Draws a map with `dot` per pixel, mirrored when it faces left. */
function paint(m: PixelMap, flip: boolean, dot: (c: number, r: number, colour: string) => void) {
  const w = m.rows[0].length;
  drawn.subjects++;
  m.rows.forEach((row, r) => {
    for (let c = 0; c < w; c++) {
      const ch = row[flip ? w - 1 - c : c];
      if (ch === ".") continue;
      drawn.pixels++;
      dot(c, r, m.colours[ch]);
    }
  });
}

/** A map at today's grain in the world, its top left at (x, y). */
const world = (m: PixelMap, x: number, y: number, flip = false) => paint(m, flip, (c, r, colour) => R(x + c, y + r, 1, 1, colour));

/** The finer grid: a canvas twice the view's art pixels over the street, placed as the street's canvas is. */
let fine: HTMLCanvasElement | null = null;
function fineCanvas(): CanvasRenderingContext2D {
  const street = [...document.querySelectorAll("canvas.depth")].at(-1) as HTMLCanvasElement;
  if (!fine) {
    fine = document.createElement("canvas");
    fine.className = "depth";
    fine.setAttribute("aria-hidden", "true");
    street.parentElement!.insertBefore(fine, document.getElementById("ui"));
  }
  fine.width = view.w * 2;
  fine.height = view.h * 2;
  fine.style.width = `${view.cssW}px`;
  fine.style.height = `${view.cssH}px`;
  fine.style.transform = street.style.transform;
  const g = fine.getContext("2d")!;
  g.imageSmoothingEnabled = false;
  return g;
}
/** A world point on the finer grid. */
const fx = (wx: number) => Math.round((wx - view.camX) * 2);
const fy = (wy: number) => Math.round((wy - view.camY) * 2);

/** A map on the finer grid, its top left at world (x, y). */
function onFine(g: CanvasRenderingContext2D, m: PixelMap, x: number, y: number, flip = false) {
  const x0 = fx(x);
  const y0 = fy(y);
  paint(m, flip, (c, r, colour) => {
    g.fillStyle = colour;
    g.fillRect(x0 + c, y0 + r, 1, 1);
  });
}

/** A map on the finer grid with an enemy's outline: a near-black line a fine pixel wide inside the red, two wide. */
function onFineOutlined(g: CanvasRenderingContext2D, m: PixelMap, x: number, y: number, flip: boolean, rim: string = ENEMY.warning) {
  const w = m.rows[0].length;
  const h = m.rows.length;
  const pad = 3;
  const shape = document.createElement("canvas");
  shape.width = w + pad * 2;
  shape.height = h + pad * 2;
  const s = shape.getContext("2d")!;
  paint(m, flip, (c, r, colour) => {
    s.fillStyle = colour;
    s.fillRect(c + pad, r + pad, 1, 1);
  });
  const grown = (by: number, colour: string) => {
    const c = document.createElement("canvas");
    c.width = shape.width;
    c.height = shape.height;
    const cg = c.getContext("2d")!;
    for (let dx = -by; dx <= by; dx++) for (let dy = -by; dy <= by; dy++) if (Math.abs(dx) + Math.abs(dy) <= by) cg.drawImage(shape, dx, dy);
    cg.globalCompositeOperation = "source-in";
    cg.fillStyle = colour;
    cg.fillRect(0, 0, c.width, c.height);
    return c;
  };
  const at = [fx(x) - pad, fy(y) - pad] as const;
  g.drawImage(grown(3, rim), ...at);
  g.drawImage(grown(1, ENEMY.line), ...at);
  g.drawImage(shape, ...at);
}

/** Him on the text layer (where the page draws him), a map of `scale` maps to an art pixel, its top left at his. */
function him(m: PixelMap, b: { x: number; y: number }, facing: number, scale: number) {
  const u = textCtx();
  const n = unit() / scale;
  const ox = snap(sx(b.x));
  const oy = snap(sy(b.y));
  paint(m, facing < 0, (c, r, colour) => {
    u.fillStyle = colour;
    u.fillRect(ox + c * n, oy + r * n, n, n);
  });
}

/** The scene, staged so every subject is in the frame: two pigeons near the rat, the bench, the flag raised, the cheese and the bracteate out where they can be seen. */
function stage(g: Game) {
  const p = g.play;
  const id = g.level.id;
  if (id === "langkaia") {
    const pigeon = p.enemies.find((e) => e.def.look === "pigeon" && e.x > 1600 && e.x < 1800);
    if (pigeon) Object.assign(pigeon, { x: 2350, home: 2350 });
    if (p.benches[1]) p.benches[1].x = 2600;
    if (p.cheese) Object.assign(p.cheese.box, { x: 2476, y: 236 });
    if (p.bracteate) Object.assign(p.bracteate, { x: 2540, y: 200 });
  }
  if (id === "stortinget") {
    if (p.cheese) Object.assign(p.cheese.box, { x: 1316, y: 268 });
    if (p.bracteate) Object.assign(p.bracteate, { x: 1288, y: 232 });
  }
  // The flags in view raised, flying.
  p.flags.forEach((f, i) => {
    if (Math.abs(f.x - p.body.x) < 400) p.raisedAt[i] = -9999;
  });
}

/** Everything of today's drawing that the study draws itself, out of the way; and its own enemy and flag looks in. */
function takeOver(g: Game, enemy: (e: Enemy, v: View) => boolean, flag: (f: { x: number; bottom: number }) => boolean) {
  const p = g.play;
  const art = g.level.art as LevelDef["art"] & Record<string, unknown>;
  const ownEnemy = art.enemy;
  art.enemy = (e: Enemy, v: View) => enemy(e, v) || (ownEnemy?.(e, v) ?? false);
  const ownFlag = art.flag;
  art.flag = (i, f, raisedAt, v) => flag(f) || (ownFlag?.(i, f, raisedAt, v) ?? false);
  // What he takes: marked taken for the frame, drawn by the study where it lay.
  const coins = p.skilling.filter((s) => s.at === null && Math.abs(s.box.x - p.body.x) < 400);
  for (const s of coins) s.at = -1;
  const cheese = p.cheese && p.cheese.at === null ? { ...p.cheese.box } : null;
  if (p.cheese && cheese) p.cheese.at = -1;
  const bract = p.bracteate && p.bracteateAt === null ? { ...p.bracteate } : null;
  if (bract) p.bracteateAt = -1;
  // Him: see-through, drawn by the study on the text layer.
  g.state.alpha = 0;
  return { coins, cheese, bract };
}

/** The flag's pole, its foot and its finial, as the kit draws them. */
function pole(f: { x: number; bottom: number }) {
  const top = f.bottom - 32;
  R(f.x - 2, f.bottom - 2, 5, 2, STONE.dark);
  R(f.x - 2, f.bottom - 2, 5, 1, STONE.light);
  R(f.x, top, 1, 30, METAL.flagpole);
  R(f.x - 1, top - 2, 3, 2, METAL.brass);
  return top;
}

/** Way 3: today's grain, drawn better. */
function wayThree(g: Game) {
  const p = g.play;
  const walk = (e: Enemy) => (view.reduced ? 0 : Math.floor(e.x / 3) % 2);
  const taken = takeOver(
    g,
    (e) => {
      if (e.def.look === "rat") {
        world(walk(e) ? M.RAT.walk[0] : M.RAT.walk[1], Math.round(e.x - 6.5), Math.round(e.y) - 10, e.dir < 0);
        return true;
      }
      if (e.def.look === "pigeon") {
        world(M.PIGEON, Math.round(e.x - 6.5), Math.round(e.y) - 11, e.dir < 0);
        return true;
      }
      return false;
    },
    (f) => {
      const top = pole(f);
      world(M.FLAG_CLOTH, f.x + 1, top + 1);
      return true;
    }
  );
  g.still();
  for (const s of taken.coins) world(M.SKILLING, s.box.x + 1, s.box.y + 1);
  if (taken.cheese) world(M.CHEESE, taken.cheese.x, taken.cheese.y);
  if (taken.bract) {
    R(taken.bract.x + 5, taken.bract.y - 2, 2, 2, mix(M.BRACTEATE.colours.d, "#000000", 0.1));
    world(M.BRACTEATE, taken.bract.x, taken.bract.y);
  }
  for (const b of p.benches) world(M.BENCH, b.x - 11, b.bottom - 13);
  const b = g.shown;
  const facing = p.body.facing;
  if (p.shield?.has) world(M.SHIELD_BACK, Math.round(facing > 0 ? b.x - 4 : b.x + PLAYER.w - 4), Math.round(b.y) + 2);
  him(p.body.onGround ? M.HIM.stand : M.HIM.air, b, facing, 1);
}

/** Ways 1 and 2: the subjects on a grid twice as fine; with `all`, the street and its backdrop too. */
function wayFine(g: Game, all: boolean) {
  const p = g.play;
  const taken = takeOver(
    g,
    (e) => e.def.look === "rat" || e.def.look === "pigeon",
    () => true
  );
  g.still();
  const f = fineCanvas();
  f.clearRect(0, 0, f.canvas.width, f.canvas.height);
  if (all) everything(f);
  for (const e of p.enemies) {
    if (!e.alive) continue;
    if (e.def.look === "rat") onFineOutlined(f, M.RAT_FINE, e.x - 6.5, e.y - 10, e.dir < 0);
    if (e.def.look === "pigeon") onFineOutlined(f, M.PIGEON_FINE, e.x - 6.5, e.y - 11, e.dir < 0);
  }
  for (const fl of p.flags) {
    if (Math.abs(fl.x - p.body.x) > 400) continue;
    const top = fl.bottom - 32;
    f.fillStyle = STONE.dark;
    f.fillRect(fx(fl.x - 2), fy(fl.bottom - 2), 10, 4);
    f.fillStyle = STONE.light;
    f.fillRect(fx(fl.x - 2), fy(fl.bottom - 2), 10, 1);
    f.fillStyle = METAL.flagpole;
    f.fillRect(fx(fl.x), fy(top), 2, 60);
    f.fillStyle = mix(METAL.flagpole, "#8a8f98", 0.5);
    f.fillRect(fx(fl.x) + 1, fy(top), 1, 60);
    f.fillStyle = METAL.brass;
    f.fillRect(fx(fl.x) - 1, fy(top - 2), 4, 3);
    onFine(f, M.FLAG_CLOTH_FINE, fl.x + 1, top + 1);
  }
  for (const s of taken.coins) onFine(f, M.SKILLING_FINE, s.box.x + 1, s.box.y + 1);
  if (taken.cheese) onFine(f, M.CHEESE_FINE, taken.cheese.x, taken.cheese.y);
  if (taken.bract) onFine(f, M.BRACTEATE_FINE, taken.bract.x, taken.bract.y);
  for (const b of p.benches) onFine(f, M.BENCH_FINE, b.x - 11, b.bottom - 13);
  const b = g.shown;
  const facing = p.body.facing;
  if (p.shield?.has) onFine(f, M.SHIELD_BACK_FINE, facing > 0 ? b.x - 4 : b.x + PLAYER.w - 4, b.y + 2);
  him(p.body.onGround ? M.HIM_FINE.stand : M.HIM_FINE.walk[0], b, facing, 2);
}

/**
 * Way 2: the whole picture onto the finer grid (every canvas copied at twice its size), with a second pass on the
 * finer grid: a lit top edge and a shadowed foot on every shape of the far layers, and on the street's tiles the
 * planks' grain, the stones' courses and the platform's tiles in half pixels.
 */
function everything(f: CanvasRenderingContext2D) {
  const canvases = [document.getElementById("px") as HTMLCanvasElement, ...(document.querySelectorAll("canvas.depth") as NodeListOf<HTMLCanvasElement>)].filter((c) => c !== f.canvas);
  canvases.forEach((c, i) => {
    f.drawImage(c, 0, 0, c.width * 2, c.height * 2);
    if (i === 0) return;
    // The second pass: each shape's top edge a half pixel lighter, its foot a half pixel darker.
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    const W = c.width;
    const at = (x: number, y: number) => d[(y * W + x) * 4 + 3];
    const rgb = (x: number, y: number) => [d[(y * W + x) * 4], d[(y * W + x) * 4 + 1], d[(y * W + x) * 4 + 2]];
    const same = (x: number, y: number, x2: number, y2: number) => {
      const a = rgb(x, y);
      const b = rgb(x2, y2);
      return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) < 24;
    };
    for (let y = 1; y < c.height - 1; y++)
      for (let x = 0; x < W; x++) {
        if (!at(x, y)) continue;
        const [r, gg, b] = rgb(x, y);
        if (!at(x, y - 1) || !same(x, y, x, y - 1)) {
          f.fillStyle = `rgba(${Math.min(255, r + 40)}, ${Math.min(255, gg + 40)}, ${Math.min(255, b + 36)}, 0.85)`;
          f.fillRect(x * 2, y * 2, 2, 1);
        } else if (at(x, y + 1) && !same(x, y, x, y + 1)) {
          f.fillStyle = `rgba(${r * 0.72}, ${gg * 0.72}, ${b * 0.78}, 0.85)`;
          f.fillRect(x * 2, y * 2 + 1, 2, 1);
        } else if (i === canvases.length - 1) {
          // On the street, texture in half pixels: the grain along a plank, the pits and joints in stone.
          const wood = r > gg + 14 && gg > b;
          const stone = Math.abs(r - gg) < 14 && Math.abs(gg - b) < 18 && r > 60;
          if (wood && (x * 3 + (y >> 1) * 5) % 7 < 3) {
            f.fillStyle = `rgba(${r * 0.8}, ${gg * 0.8}, ${b * 0.8}, 0.95)`;
            f.fillRect(x * 2, y * 2 + 1, 2, 1);
          } else if (wood && (x * 5 + y) % 13 === 0) {
            f.fillStyle = `rgba(${Math.min(255, r + 26)}, ${Math.min(255, gg + 22)}, ${Math.min(255, b + 16)}, 0.9)`;
            f.fillRect(x * 2 + 1, y * 2, 1, 1);
          } else if (stone && (x * 7 + y * 3) % 9 === 0) {
            f.fillStyle = `rgba(${r * 0.84}, ${gg * 0.84}, ${b * 0.86}, 0.9)`;
            f.fillRect(x * 2 + ((x + y) & 1), y * 2 + ((x >> 1) & 1), 1, 1);
          }
        }
      }
  });
}

/** `?debug&grain=<way>`: the study, drawn over the frame the page drew. */
export async function study(way: string, g: Game, help?: HTMLElement) {
  stage(g);
  if (way === "3") wayThree(g);
  else if (way === "1") wayFine(g, false);
  else if (way === "2") wayFine(g, true);
  else if (way === "depth") depth(g);
  else g.still();
  if (help) {
    help.hidden = false;
    help.textContent = `grain ${way}: ${drawn.subjects} subjects drawn from maps, ${drawn.pixels} pixels painted once (kept, each is one copy a frame)`;
  }
}

/**
 * Part C: Langkaia's fjord as a plane that recedes. The far layer's water, from the horizon down, cut into strips four
 * pixels tall, each moved as if it scrolled a little faster than the one above (0.12 of the camera at the top, 0.4 at
 * the foot, as Open Surge's sea does). A still shows one moment; two stills a few steps apart show the strips slide.
 */
function depth(g: Game) {
  g.still();
  const far = (document.querySelectorAll("canvas.depth") as NodeListOf<HTMLCanvasElement>)[0];
  const fg = far.getContext("2d")!;
  const copy = document.createElement("canvas");
  copy.width = far.width;
  copy.height = far.height;
  copy.getContext("2d")!.drawImage(far, 0, 0);
  // Where the water is: from the first row the fjord's colour fills most of, to the far canvas's foot.
  const d = fg.getImageData(0, 0, far.width, far.height).data;
  let top = -1;
  for (let y = 0; y < far.height && top < 0; y++) {
    let blue = 0;
    for (let x = 0; x < far.width; x++) {
      const i = (y * far.width + x) * 4;
      if (d[i + 3] && d[i + 2] > d[i] + 30 && d[i + 2] > d[i + 1]) blue++;
    }
    if (blue > far.width * 0.6) top = y;
  }
  if (top < 0) return;
  const strips = Math.min(12, Math.floor((far.height - top) / 4));
  for (let k = 0; k < strips; k++) {
    const f = 0.12 + ((0.4 - 0.12) * (k + 1)) / strips;
    const dx = Math.round(view.camX * (f - 0.12)) % far.width;
    const y = top + k * 4;
    fg.drawImage(copy, 0, y, far.width, 4, -dx, y, far.width, 4);
    fg.drawImage(copy, 0, y, far.width, 4, far.width - dx, y, far.width, 4);
  }
}
