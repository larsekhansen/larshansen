// Every figure the game draws, on one page (order 35): a PNG sheet of each at four times size, on the sheets' neutral ground,
// its states in rows and each state's frames in a row, with no words in the picture; and `figures.json` beside them, naming
// each as a player would say it (English and Norwegian), the levels it is met in and its states in row order.
//
//   bun tools/figures.ts <dir> [--scale=4]
//
// What is drawn comes from the game's own tables (`src/alive/figures.ts` lists them; a new enemy, carrier, thrower, boss or
// prop appears without a word here), through the glance tools that already drew parts of it (`glance/frames.ts`, `bosses.ts`,
// `serpent.ts`, `loki.ts`, the census in `src/alive/census.ts`):
// - him: every frame of his table, a state a row;
// - every enemy: a row for each state it is drawn in (still, moving, winding up, its glamour breaking), glammed in the lean of
//   each level it is met in (levels with the same lean share their rows), then its natural self and its glam marks alone; what
//   can hurt him with the page's outline (the near-black line and the warning red), its natural self in the calm pale;
// - every boss in every state its sheet has (the troll, the plough, the serpent), and Loki at each of his four stages through
//   every move and tell, drawn by the encore's own art (his club, his beacons, the ring of foam and the jaws, his stars);
// - each level's carriers, a row each (alike ones once), at four moments of its round;
// - what each thrower throws, in flight in its two frames and spent;
// - the pickups and the things every level has, the sheep and the heron;
// - every prop kind of the props kit (ADR 0051), each piece it is drawn as, from every level.
// Nothing it writes belongs in the repository.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TILE } from "@larshansen/pixelkit/config";
import { carrierDrawn, carrierPeriod, carrierShown, drawCarrier } from "@larshansen/pixelkit/carrier";
import { skyFor } from "@larshansen/pixelkit/oslo";
import { target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, PAINT, ROLES } from "@larshansen/pixelkit/palette";
import { writePng } from "../../../tools/png";
import { census } from "../src/alive/census";
import { pixels, type Frame } from "../src/alive/frames";
import { FIGURE_NAMES, figureKinds, type FigureKind } from "../src/alive/figures";
import { HIM, MARGIN } from "../src/alive/him";
import { PROPS, panelDoor } from "../src/alive/props";
import { newPlay } from "../src/game/play";
import { createLoki, type Loki, type LokiPhase } from "../src/game/loki";
import { BUILT, loadLevel } from "../src/levels/index";
import { ENCORE, LOKI_DEF } from "../src/levels/encore";
import type { LevelDef, View } from "../src/levels/types";
import { levelPaint } from "../src/render/fields";
import { drawShot } from "../src/render/pickups";
import { STAND_LEDGE } from "../src/render/stand";
import { bossSheets } from "./glance/bosses";
import { frameSheets } from "./glance/frames";
import { serpentSheets } from "./glance/serpent";
import "../src/render/feel";

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) {
  console.error("usage: bun tools/figures.ts <dir> [--scale=4]");
  process.exit(2);
}
const SCALE = Number(args.find((a) => a.startsWith("--scale="))?.slice(8) ?? 4);
/** The sheets' neutral ground (`glance/framesheet.py`'s light ground), between the frames too. */
const GROUND: [number, number, number] = [214, 220, 206];
/** Art pixels between frames and round the sheet. */
const GAP = 3;

/** A frame as a grid of colours ("" nothing), and a sheet as rows of them, each row a state. */
type Grid = string[][];
interface Row {
  state: string;
  frames: Grid[];
}

// --- Grids -----------------------------------------------------------------------------------------------------------------

type Rect = { x: number; y: number; w: number; h: number; c: string };
/** What a drawing paints, as rectangles, through a recorder (translucent fills, glows and shadows, left out). */
function record(draw: () => void): Rect[] {
  const rects: Rect[] = [];
  const rec = {
    fillStyle: "" as unknown,
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      if (typeof rec.fillStyle === "string" && !rec.fillStyle.startsWith("rgba") && rec.globalAlpha >= 0.99) rects.push({ x, y, w, h, c: rec.fillStyle });
    }
  };
  const any = new Proxy(rec, { get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined), set: (t, k, v) => (((t as Record<string | symbol, unknown>)[k] = v), true) });
  target(any as unknown as CanvasRenderingContext2D);
  try {
    draw();
  } finally {
    target(undefined as unknown as CanvasRenderingContext2D);
  }
  return rects;
}

/** Rectangles as grids of one size, so a row's frames line up (all of a figure's frames on one grid, from their least x and y). */
function grids(frames: Rect[][]): Grid[] {
  const all = frames.flat();
  if (!all.length) return frames.map(() => [[]]);
  const x0 = Math.floor(Math.min(...all.map((r) => r.x)));
  const y0 = Math.floor(Math.min(...all.map((r) => r.y)));
  const w = Math.ceil(Math.max(...all.map((r) => r.x + r.w))) - x0;
  const h = Math.ceil(Math.max(...all.map((r) => r.y + r.h))) - y0;
  return frames.map((rs) => {
    const g = Array.from({ length: h }, () => Array<string>(w).fill(""));
    for (const r of rs)
      for (let y = Math.round(r.y); y < Math.round(r.y + r.h); y++) for (let x = Math.round(r.x); x < Math.round(r.x + r.w); x++) if (g[y - y0] && x - x0 >= 0 && x - x0 < w) g[y - y0][x - x0] = r.c;
    return g;
  });
}

/** A frame of the game's per-pixel maps as a grid of its size, with `pad` pixels round it. */
function frameGrid(f: Frame, w: number, h: number, ox = 0, oy = 0): Grid {
  const g = Array.from({ length: h }, () => Array<string>(w).fill(""));
  pixels(f, 1, w, (c, r, colour) => {
    if (r + oy >= 0 && r + oy < h && c + ox >= 0 && c + ox < w) g[r + oy][c + ox] = colour;
  });
  return g;
}

/**
 * The page's outline round a shape (`outlined` in `render/sprite.ts`): the shape grown by two pixels in the rim's colour, inside
 * it grown by one in the near-black line, the shape over both.
 */
function outline(g: Grid, rim: string): Grid {
  const h = g.length + 4;
  const w = (g[0]?.length ?? 0) + 4;
  const out = Array.from({ length: h }, () => Array<string>(w).fill(""));
  const at = (x: number, y: number) => !!g[y - 2]?.[x - 2];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (at(x, y)) {
        out[y][x] = g[y - 2][x - 2];
        continue;
      }
      let near = 3;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2 && at(x + dx, y + dy)) near = Math.min(near, Math.abs(dx) + Math.abs(dy));
      if (near === 1) out[y][x] = ENEMY.line;
      else if (near === 2) out[y][x] = rim;
    }
  return out;
}

const sameGrid = (a: Grid, b: Grid) => a.length === b.length && a.every((r, y) => r.length === b[y].length && r.every((c, x) => c === b[y][x]));
const sameRow = (a: Grid[], b: Grid[]) => a.length === b.length && a.every((g, i) => sameGrid(g, b[i]));

// --- The sheet -------------------------------------------------------------------------------------------------------------

/** The sheet as a PNG: rows of frames on the neutral ground, each frame in a cell as large as its row's largest, at `SCALE`. */
function sheet(rows: Row[]): Uint8Array {
  const cells = rows.map((r) => ({ w: Math.max(1, ...r.frames.map((g) => g[0]?.length ?? 0)), h: Math.max(1, ...r.frames.map((g) => g.length)) }));
  const W = Math.max(...rows.map((r, i) => GAP + r.frames.length * (cells[i].w + GAP))) * SCALE;
  const H = (GAP + cells.reduce((n, c) => n + c.h + GAP, 0)) * SCALE;
  const rgba = new Uint8Array(W * H * 4);
  for (let i = 0; i < W * H; i++) rgba.set([...GROUND, 255], i * 4);
  const hex = new Map<string, number[]>();
  const rgb = (c: string) => {
    let v = hex.get(c);
    if (!v) {
      const h = c.replace("#", "");
      const f = h.length === 3 ? h.split("").map((d) => d + d).join("") : h.slice(0, 6);
      hex.set(c, (v = [0, 2, 4].map((k) => parseInt(f.slice(k, k + 2), 16))));
    }
    return v;
  };
  let top = GAP;
  rows.forEach((row, ri) => {
    const { w: cw, h: ch } = cells[ri];
    row.frames.forEach((g, fi) => {
      // Each frame stands on the foot of its cell, in the middle across.
      const ox = GAP + fi * (cw + GAP) + Math.floor((cw - (g[0]?.length ?? 0)) / 2);
      const oy = top + (ch - g.length);
      g.forEach((line, y) =>
        line.forEach((c, x) => {
          if (!c || !c.startsWith("#")) return;
          const [r, gg, b] = rgb(c);
          for (let sy = 0; sy < SCALE; sy++)
            for (let sx = 0; sx < SCALE; sx++) {
              const i = (((oy + y) * SCALE + sy) * W + (ox + x) * SCALE + sx) * 4;
              rgba[i] = r;
              rgba[i + 1] = gg;
              rgba[i + 2] = b;
            }
        })
      );
    });
    top += ch + GAP;
  });
  return writePng({ w: W, h: H, rgba });
}

// --- What is drawn ---------------------------------------------------------------------------------------------------------

const DAY = skyFor(new Date(2026, 5, 15, 12), "day");
const viewAt = (t: number, more: Partial<View> = {}): View => ({ sky: DAY, t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: -999, y: -999 }, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null, ...more }) as View;
const wide = () => Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
/** Rows of a figure from its frames by name: a state is the name before its first comma or colon, its number off. */
function byName(frames: { name: string; px: Grid }[]): Row[] {
  const rows: Row[] = [];
  for (const f of frames) {
    const state = f.name.split(/[,:]/)[0].replace(/ \d+$/, "").trim();
    const row = rows.find((r) => r.state === state) ?? rows[rows.push({ state, frames: [] }) - 1];
    row.frames.push(f.px);
  }
  return rows;
}

/** Him: every frame of his table, in the states his table keeps (still, running, in the air, landing ...). */
function him(): Row[] {
  const w = 10 + 2 * MARGIN;
  const h = 16 + 2 * MARGIN;
  const ROWS: [string, (keyof typeof HIM)[]][] = [
    ["standing", ["stand", "breath", "blink", "breathBlink"]],
    ["running", ["run"]],
    ["in the air", ["rise", "apex", "fall"]],
    ["landing", ["land", "landDeep"]],
    ["dashing", ["dash"]],
    ["behind the shield", ["shield"]],
    ["sitting", ["sit", "sitBack", "sitForward"]],
    ["thrown back by a hit", ["hurt"]],
    ["pushing into a door", ["push"]]
  ];
  const listed = new Set(ROWS.flatMap(([, ks]) => ks));
  // A frame his table gains comes in a row of its own.
  for (const k of Object.keys(HIM) as (keyof typeof HIM)[]) if (!listed.has(k)) ROWS.push([k, [k]]);
  return ROWS.map(([state, keys]) => ({ state, frames: keys.flatMap((k) => [HIM[k]].flat()).map((f) => frameGrid(f as Frame, w, h, MARGIN, MARGIN)) }));
}

/** Every enemy look in every level it is met in: its states glammed in each lean (alike leans once), its natural self, its marks. */
async function enemies(): Promise<Map<string, Row[]>> {
  const all = await census(true);
  const out = new Map<string, Row[]>();
  const looks = new Map<string, [string, (typeof all)[string]][]>();
  for (const [key, c] of Object.entries(all)) {
    const look = key.slice(0, key.lastIndexOf("@"));
    (looks.get(look) ?? looks.set(look, []).get(look)!).push([c.level, c]);
  }
  for (const [look, seen] of looks) {
    // One grid for every frame of the look, so its frames line up from row to row.
    const states = (c: (typeof all)[string]) => [
      ["still", c.idle, ENEMY.warning],
      ["moving", c.move, ENEMY.warning],
      ...(c.windup ? [["winding up", [c.windup], ENEMY.warning] as const] : []),
      ["its glamour breaking", c.death, ""]
    ] as const;
    const blocks = seen.map(([level, c]) => ({ level, states: states(c) }));
    const first = seen[0][1];
    const rest = [["natural", first.natural, ROLES.calm], ...(first.marks ? [["its glam alone", [first.marks], ""] as const] : [])] as const;
    // Each state's frames on one grid, so they line up along the row.
    const take = (ds: readonly { rects: Rect[] }[], rim: string) => grids(ds.map((d) => d.rects)).map((g) => (rim ? outline(g, rim) : pad(g)));
    const rows: (Row & { levels: string[] })[] = [];
    for (const b of blocks) {
      const mine = b.states.map(([state, ds, rim]) => ({ state, frames: take(ds, rim) }));
      // Levels that lean alike draw alike: their rows once, naming every level.
      const same = rows.length >= mine.length && rows.find((r, i) => i % mine.length === 0 && mine.every((m, j) => rows[i + j] && rows[i + j].state.startsWith(m.state) && sameRow(rows[i + j].frames, m.frames)));
      if (same) {
        const i = rows.indexOf(same);
        for (let j = 0; j < mine.length; j++) rows[i + j].levels.push(b.level);
      } else for (const m of mine) rows.push({ ...m, levels: [b.level] });
    }
    for (const [state, ds, rim] of rest) rows.push({ state, frames: take(ds, rim), levels: [] });
    out.set(look, rows.map((r) => ({ state: r.levels.length && seen.length > 1 ? `${r.state}, glammed as at ${r.levels.join(", ")}` : r.state, frames: r.frames })));
  }
  return out;
}

/** Two pixels of nothing round a grid, as the outline gives an outlined one, so both sit alike. */
const pad = (g: Grid): Grid => {
  const w = (g[0]?.length ?? 0) + 4;
  return [Array(w).fill(""), Array(w).fill(""), ...g.map((r) => ["", "", ...r, "", ""]), Array(w).fill(""), Array(w).fill("")];
};

/** The bosses' sheets (the troll, the plough, the serpent) in rows by state. */
function bosses(): Map<string, Row[]> {
  wide();
  const out = new Map<string, Row[]>();
  const b = bossSheets();
  out.set("troll", byName(b.troll));
  out.set("plough", byName(b.plough));
  out.set("serpent", byName(serpentSheets().serpent));
  return out;
}

/** Loki at each of his four stages (glammed, the wig off, the shades off, the jacket off) through every move and its tell, and plain, by the encore's own art. */
function loki(): Row[] {
  wide();
  const T = 1000;
  const at = (phase: LokiPhase, hits: number, age: number, more: Partial<Loki> = {}) => {
    const s = createLoki(LOKI_DEF);
    Object.assign(s, { phase, since: T - age, hits, x: LOKI_DEF.home, dir: -1, aim: LOKI_DEF.floor }, more);
    return record(() => ENCORE.art.boss!(s, viewAt(T, { boss: s })));
  };
  const MOVES: [string, LokiPhase, number, Partial<Loki>?][] = [
    ["waiting", "asleep", 10],
    ["waking", "waking", 60],
    ["strutting", "strut", 10, { x: LOKI_DEF.home }],
    ["strutting", "strut", 10, { x: LOKI_DEF.home + 4 }],
    ["strutting", "strut", 10, { x: LOKI_DEF.home + 8 }],
    ["the club raised: its tell", "club", 30],
    ["the slam and its wave", "slam", 8, { wave: { x: LOKI_DEF.home, at: T - 8 } }],
    ["revving: its tell", "rev", 30],
    ["the charge", "charge", 10],
    ["the ring of foam: its tell", "ring", 30, { ring: { x: LOKI_DEF.home - 60, y: LOKI_DEF.floor, fixed: false } }],
    ["the jaws", "bite", 10, { ring: { x: LOKI_DEF.home - 60, y: LOKI_DEF.floor, fixed: true } }],
    ["posing: the opening", "pose", 10],
    ["posing: the opening", "pose", 40],
    ["reeling from the hit that takes the next piece", "reel", 5]
  ];
  const stages = ["glammed", "the wig knocked off", "the shades knocked off", "the jacket knocked off"];
  // He reels from the hit that knocks off the next piece: drawn with that hit counted.
  const drawn = stages.map((_, hits) => MOVES.map(([, phase, age, more]) => at(phase, phase === "reel" ? Math.min(3, hits + 1) : hits, age, more)));
  const plain = [at("plain", 3, 10), at("plain", 3, 70), at("leave", 3, 20)];
  const gs = grids([...drawn.flat(), ...plain]);
  const rows: Row[] = stages.map((stage, i) => ({ state: `${stage}: ${MOVES.map(([m]) => m).join("; ")}`, frames: gs.slice(i * MOVES.length, (i + 1) * MOVES.length) }));
  rows.push({ state: "plain: standing, shrugging, walking off", frames: gs.slice(stages.length * MOVES.length) });
  return rows;
}

/** A level's carriers, a row each (alike ones once), at four moments of their round, each where it is then. */
function carriers(def: LevelDef): Row[] {
  wide();
  const rows: Row[] = [];
  def.carriers.forEach((d, i) => {
    const period = Math.max(4, carrierPeriod(d));
    const shown: number[] = [];
    for (let t = 0; t < period && shown.length < 4; t += Math.max(1, Math.floor(period / 16))) if (carrierShown(d, t) && (shown.length === 0 || t - shown[shown.length - 1] >= period / 5)) shown.push(t);
    const frames = shown.map((t) => {
      const at = carrierDrawn(d, t, 1);
      view.camX = view.camXf = Math.round(at.x) - 200;
      view.camY = view.camYf = Math.round(at.y) - 200;
      const rs = record(() => (def.art.carrier ? def.art.carrier(i, at, viewAt(t)) : drawCarrier(d, t, 1, false, STAND_LEDGE)));
      // The page draws on the screen, less the camera: where it is on the screen, less where the camera put it.
      return rs.map((r) => ({ ...r, x: r.x - 200, y: r.y - 200 }));
    });
    if (!frames.length || !frames.some((f) => f.length)) return;
    const gs = grids(frames).map(pad);
    if (!rows.some((r) => sameRow(r.frames, gs))) rows.push({ state: `${d.kind} ${i + 1}`, frames: gs });
  });
  return rows;
}

/** What a level's throwers throw, by thrower: in flight in its two frames, and spent (the shield stopped it). */
function thrown(def: LevelDef): Map<string, Grid[]> {
  wide();
  const play = newPlay(def, { hasShield: def.rune > 10 });
  const out = new Map<string, Grid[]>();
  play.enemies.forEach((e, i) => {
    if (e.def.kind !== "thrower") return;
    const look = e.def.look === "gull" ? "gull (thrower)" : e.def.look;
    if (out.has(look)) return;
    const v = viewAt(0, { enemies: play.enemies });
    const shot = (x: number, spent?: number) => ({ x, y: 200, vx: -2, vy: 0.3, born: 0, by: i, spent }) as never;
    const drawn = [shot(200), shot(203), shot(200, 0)].map((s, k) =>
      record(() => {
        v.t = k * 4;
        void (def.art.shot?.(s, v) || drawShot(s));
      })
    );
    out.set(look, grids(drawn).map((g) => outline(g, ENEMY.warning)));
  });
  return out;
}

/** The pickups and things every level has, and the sheep and the heron, from `glance/frames.ts`'s sheets. */
async function things(): Promise<Map<string, Row[]>> {
  const f = await frameSheets(["things", "bench", "bracteate", "rune stone", "flag", "ski pole and feather", "shield", "sheep", "heron"]);
  const rows = (frames: { name: string; px: Grid }[], state?: string): Row[] => (state ? [{ state, frames: frames.map((x) => x.px) }] : byName(frames));
  const of = (name: string, pick: (n: string) => boolean = () => true) => (f[name] ?? []).filter((x) => pick(x.name));
  const out = new Map<string, Row[]>();
  out.set("skilling", rows(of("things", (n) => n !== "cheese"), "turning"));
  out.set("cheese", rows(of("things", (n) => n === "cheese"), "lying"));
  out.set("bracteate", rows(of("bracteate"), "turning"));
  out.set("rune", rows(of("rune stone").map((x) => ({ ...x, name: x.name.split(", ").at(-1)! }))));
  out.set("pole", rows(of("ski pole and feather", (n) => n.startsWith("ski")), "standing"));
  out.set("feather", rows(of("ski pole and feather", (n) => n.startsWith("feather")).map((x) => ({ ...x, name: x.name.includes("gold") ? "gold" : "as it falls" }))));
  out.set("shield", rows(of("shield")));
  out.set("bench", rows(of("bench")));
  out.set("flag", rows(of("flag")));
  out.set("sheep", rows(of("sheep").map((x) => ({ ...x, name: x.name.replace(/^sheep, /, "") }))));
  out.set("heron", rows(of("heron").map((x) => ({ ...x, name: x.name.replace(/^heron, /, "").replace(/^heron$/, "standing") }))));
  return out;
}

/** Every prop kind every level draws (and the doors drawn from a scene's doors), each piece it is drawn as, from the props kit. */
async function props(): Promise<{ rows: Map<string, Row[]>; used: Record<string, string[]> }> {
  PROPS.pieces = new Map();
  const used: Record<string, string[]> = {};
  for (const st of [...BUILT, { id: "encore" }]) {
    PROPS.used = new Set();
    levelPaint(await loadLevel(st.id), "day");
    // The kiosk's and the yellow house's doors, shut and open, as the props test draws them.
    target({ fillRect() {} } as unknown as CanvasRenderingContext2D);
    for (const open of [false, true]) {
      const door = { id: "d", kind: "door", x: 0, w: 14, h: 30, bottom: 100, sign: "", name: "", href: null, soon: false, secret: false, open, shake: 0 } as never;
      if (st.id === "stortinget") panelDoor(door, PAINT.shopDoor, PAINT.shopDoorPanel);
      if (st.id === "nabolaget") panelDoor(door, PAINT.homeDoor, PAINT.homeDoorPanel);
    }
    used[st.id] = [...PROPS.used];
  }
  const rows = new Map<string, Row[]>();
  for (const [kind, pieces] of PROPS.pieces) {
    const gs = [...pieces.entries()]
      .map(([key, { w, piece }]) => {
        const g = Array.from({ length: piece.h }, () => Array<string>(w).fill(""));
        for (let i = 0; i < piece.runs.length; i += 4) for (let x = 0; x < piece.runs[i + 2]; x++) if (g[piece.runs[i + 1]]) g[piece.runs[i + 1]][piece.runs[i] + x] = piece.ink[piece.runs[i + 3]];
        return { key, g };
      })
      .sort((a, b) => a.g.length * (a.g[0]?.length ?? 0) - b.g.length * (b.g[0]?.length ?? 0));
    // Pieces alike but for their place are one; at most eight to a row, smallest first.
    const seen: Grid[] = [];
    const kept = gs.filter(({ g }) => !seen.some((s) => sameGrid(s, g)) && seen.push(g));
    const r: Row[] = [];
    for (let i = 0; i < kept.length; i += 8) r.push({ state: kept.slice(i, i + 8).map((p) => p.key).join("; "), frames: kept.slice(i, i + 8).map((p) => p.g) });
    rows.set(kind, r);
  }
  PROPS.pieces = undefined;
  PROPS.used = undefined;
  return { rows, used };
}

// --- The run ---------------------------------------------------------------------------------------------------------------

mkdirSync(dir, { recursive: true });
const sheets = new Map<string, Row[]>();
sheets.set("him", him());
for (const [look, rows] of await enemies()) sheets.set(`enemy-${look}`, rows);
for (const [boss, rows] of bosses()) sheets.set(`boss-${boss}`, rows);
sheets.set("boss-loki", loki());
const throws = new Map<string, { level: string; frames: Grid[] }[]>();
for (const st of BUILT) {
  const def = await loadLevel(st.id);
  if (def.carriers.length) sheets.set(`carrier-${def.id}`, carriers(def));
  for (const [look, frames] of thrown(def)) (throws.get(look) ?? throws.set(look, []).get(look)!).push({ level: def.id, frames });
}
for (const [look, seen] of throws) {
  const rows: (Row & { levels: string[] })[] = [];
  for (const s of seen) {
    const same = rows.find((r) => sameRow(r.frames, s.frames));
    if (same) same.levels.push(s.level);
    else rows.push({ state: "", frames: s.frames, levels: [s.level] });
  }
  sheets.set(`thrown-${look}`, rows.map((r) => ({ state: `in flight, turning, spent (${r.levels.join(", ")})`, frames: r.frames })));
}
for (const [kind, rows] of await things()) sheets.set(`${kind === "sheep" || kind === "heron" ? "harmless" : "pickup"}-${kind}`, rows);
const { rows: propRows, used } = await props();
for (const [kind, rows] of propRows) sheets.set(`prop-${kind}`, rows);

const kinds = await figureKinds(used);
const listed = new Map<string, FigureKind>(kinds.map((k) => [k.file, k]));
const json: { file: string; name: { en: string; nb: string } | null; levels: string[]; states: string[] }[] = [];
for (const [file, rows] of sheets) {
  const k = listed.get(file);
  if (!rows.length || !rows.some((r) => r.frames.length)) {
    console.log(`nothing drawn: ${file}`);
    continue;
  }
  writeFileSync(join(dir, `${file}.png`), sheet(rows));
  json.push({ file: `${file}.png`, name: FIGURE_NAMES[file] ?? null, levels: k?.levels ?? [], states: rows.map((r) => r.state) });
}
// What the tables list and nothing drew, and what was drawn with no name, are said, not left out.
for (const k of kinds) if (!sheets.has(k.file)) console.log(`listed, not drawn: ${k.file}`);
for (const j of json) if (!j.name) console.log(`drawn, no name: ${j.file}`);
writeFileSync(join(dir, "figures.json"), JSON.stringify(json, null, 1) + "\n");
console.log(`${json.length} sheets and figures.json in ${dir}`);
