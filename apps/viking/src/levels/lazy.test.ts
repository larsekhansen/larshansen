import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { carrierDrawn, carrierShown } from "@larshansen/pixelkit/carrier";
import { TILE } from "@larshansen/pixelkit/config";
import { buildDoors } from "@larshansen/pixelkit/doors";
import { ctx, lights, target, view } from "@larshansen/pixelkit/paint";
import { newPlay } from "../game/play";
import { skyOf } from "../render/fields";
import { TEXTURED, drawTiles } from "../render/tiles";
import { BUILT, loadLevel } from "./index";
import { LANGKAIA } from "./langkaia";
import type { LevelDef, View } from "./types";

// Order 30 (ADR 0053): without feel's file. The first script draws through hooks (`TEXTURED` in `render/tiles.ts`) that
// feel's file fills; if that file never comes, a scene opens without it. Every hook the first script calls has a plain
// drawing of its own in the first script, where the thing stands. A level fetched later imports feel's file with it, so it
// is never drawn without it.

const SRC = resolve(dirname(import.meta.path), "..");
/** What vite puts in feel's file (`vite.config.ts`): `alive/`, `render/feel.ts` and `game/story.ts`. */
const FEEL = /\/src\/(alive\/|render\/feel\.ts$|game\/story\.ts$)/;

/** Whether a file of `src` reaches feel's file through its imports that are not types alone (relative imports, followed). */
function reachesFeel(file: string, seen = new Set<string>()): boolean {
  if (FEEL.test(file)) return true;
  if (seen.has(file)) return false;
  seen.add(file);
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(/^import\s+(?!type\b)(?:[^"';]*?from\s+)?"(\.{1,2}\/[^"]+)"/gm)) {
    const to = join(dirname(file), m[1]);
    if (/\.\w+$/.test(to) && !to.endsWith(".ts")) continue; // a style sheet or data
    if (reachesFeel(to.endsWith(".ts") ? to : `${to}.ts`, seen)) return true;
  }
  return false;
}

/** Where paint fell, a byte a world pixel, over a whole level drawn in one view; and what each hook call drew. */
function coverage(w: number, h: number) {
  const hit = new Uint8Array(w * h);
  let call: Uint8Array | null = null;
  const fill = (x: number, y: number, rw: number, rh: number) => {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(w, Math.ceil(x + rw));
    const y1 = Math.min(h, Math.ceil(y + rh));
    for (let yy = y0; yy < y1; yy++)
      for (let xx = x0; xx < x1; xx++) {
        hit[yy * w + xx] = 1;
        if (call) call[yy * w + xx] = 1;
      }
  };
  const base = {
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    fillStyle: "#000000" as unknown,
    canvas: { width: w, height: h },
    fillRect: (x: number, y: number, rw: number, rh: number) => fill(x, y, rw, rh),
    drawImage: (...a: number[]) => (a.length >= 9 ? fill(a[5], a[6], a[7], a[8]) : a.length >= 5 ? fill(a[1], a[2], a[3], a[4]) : fill(a[1], a[2], 1, 1)),
    createLinearGradient: () => ({ addColorStop: () => undefined })
  };
  const fake = new Proxy(base, {
    get: (t, k) => (k in t ? (t as Record<string | symbol, unknown>)[k] : () => undefined),
    set: (t, k, v) => ((t as Record<string | symbol, unknown>)[k] = v, true)
  });
  return {
    ctx: fake as unknown as CanvasRenderingContext2D,
    hit,
    /** Paint that falls while `draw` runs is also noted as that call's. */
    during<T>(draw: () => T): { out: T; drew: Uint8Array } {
      const was = call;
      const drew = new Uint8Array(w * h);
      call = drew;
      try {
        return { out: draw(), drew };
      } finally {
        call = was;
        if (was) for (let i = 0; i < drew.length; i++) if (drew[i]) was[i] = 1;
      }
    }
  };
}

type Hooks = typeof TEXTURED;

/** A level drawn whole as the page draws its street (its back art, its tiles, the things it carries, what is in front), with `hooks` in place of feel's. */
function drawn(def: LevelDef, hooks: Hooks, note?: (name: string, drew: Uint8Array) => void) {
  const play = newPlay(def, {});
  const map = play.map;
  const sky = skyOf(def, "day");
  const rec = coverage(map.width, map.height);
  const saved = { ...TEXTURED };
  for (const k of Object.keys(TEXTURED) as (keyof Hooks)[]) delete TEXTURED[k];
  for (const [k, f] of Object.entries(hooks) as [keyof Hooks, (...a: unknown[]) => unknown][])
    (TEXTURED as Record<string, unknown>)[k] = note
      ? (...a: unknown[]) => {
          const { out, drew } = rec.during(() => f(...a));
          note(`${k} ${typeof a[0] === "string" ? a[0] : ""}`.trim(), drew);
          return out;
        }
      : f;
  const was = { ...view, g: ctx() };
  target(rec.ctx);
  Object.assign(view, { w: map.width, h: map.height, k: 1, reduced: true, camX: 0, camY: 0, camXf: 0, camYf: 0 });
  try {
    const doors = new Map(
      buildDoors(def.doors.flatMap((d) => play.map.find(d.tile).map((t) => ({ id: d.id, kind: d.id, sign: d.sign, x: t.c * TILE, bottom: (t.r + 1) * TILE })))).map((d) => [d.id, d])
    );
    const v: View = { sky, t: 0, alpha: 1, doors, now: new Date(2026, 5, 15, 12), him: { x: 0, y: 0 }, flourish: null, facing: 1, troll: null, flags: [], enemies: [], boss: null, cleared: [], runeAt: null, grounds: null };
    def.art.back(v);
    drawTiles(map, def.art, sky, def.underground);
    def.carriers.forEach((d, i) => {
      if (carrierShown(d, 0)) def.art.carrier?.(i, carrierDrawn(d, 0, 1), v);
    });
    def.art.front?.(v);
  } finally {
    lights.length = 0;
    target(was.g);
    Object.assign(view, { w: was.w, h: was.h, k: was.k, camX: was.camX, camY: was.camY, camXf: was.camXf, camYf: was.camYf, reduced: was.reduced });
    for (const k of Object.keys(TEXTURED) as (keyof Hooks)[]) delete TEXTURED[k];
    Object.assign(TEXTURED, saved);
  }
  return { hit: rec.hit, map };
}

describe("without feel's file (order 30)", () => {
  test("only Langkaia can be drawn without feel's file: every other level imports it, so it comes with the level", () => {
    const alone = [...BUILT.map((l) => l.id), "encore"].filter((id) => !reachesFeel(join(SRC, "levels", `${id}.ts`)));
    expect(alone).toEqual(["langkaia"]);
    // The first script itself (the page) does not reach it: it is fetched, as the page starts.
    expect(reachesFeel(join(SRC, "main.ts"))).toBe(false);
    // The map's look imports it too (the mirror balls, the story's sign, the textured piers): without feel's file the map
    // does not open but says its train did not come, with "Try again", as a level fetched later does.
    expect(reachesFeel(join(SRC, "levels", "kartArt.ts"))).toBe(true);
  });

  test("every thing a hook draws in Langkaia is drawn plainly where it stands when the hook is not there", async () => {
    // The hooks as feel's file fills them (`render/fields.ts` imports it for the tests).
    const real = { ...TEXTURED };
    expect(Object.keys(real).length).toBeGreaterThan(5);
    const nothing = Object.fromEntries(Object.keys(real).map((k) => [k, () => true])) as Hooks;
    for (const st of BUILT) await loadLevel(st.id);
    const def = LANGKAIA;
    // What each hook call draws with feel's file; what is drawn with none of them drawing anything; and with no hooks at all.
    const calls: { name: string; drew: Uint8Array }[] = [];
    drawn(def, real, (name, drew) => calls.push({ name, drew }));
    const none = drawn(def, nothing).hit;
    const plain = drawn(def, {}).hit;
    expect(calls.length).toBeGreaterThan(100);
    const short = new Map<string, number>();
    for (const { name, drew } of calls) {
      let own = 0;
      let covered = 0;
      for (let i = 0; i < drew.length; i++) {
        if (!drew[i] || none[i]) continue;
        own++;
        if (plain[i]) covered++;
      }
      // Of what the kit draws there and nothing else does, at least half is drawn plainly without it.
      if (own > 0 && covered < own / 2) short.set(name, Math.max(short.get(name) ?? 0, own - covered));
    }
    expect([...short].map(([k, n]) => `${k}: ${n} pixels with nothing drawn`)).toEqual([]);
  }, 120_000);

  test("every solid tile and everything he is carried on in Langkaia is drawn without feel's file", () => {
    const { hit, map } = drawn(LANGKAIA, {});
    const bare: string[] = [];
    for (let r = 0; r < map.rows; r++)
      for (let c = 0; c < map.cols; c++) {
        if (!map.isSolid(c, r) && !map.isOneWay(c, r)) continue;
        let n = 0;
        for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) n += hit[(r * TILE + y) * map.width + c * TILE + x];
        if (n < (TILE * TILE) / 8) bare.push(`"${map.tileAt(c, r)}" at ${c},${r}`);
      }
    for (const [i, d] of LANGKAIA.carriers.entries()) {
      const at = carrierDrawn(d, 0, 1);
      let n = 0;
      for (let x = Math.round(at.x); x < at.x + d.w; x++) for (let y = Math.round(at.y); y < at.y + 4; y++) n += hit[y * map.width + x];
      if (n < d.w * 2) bare.push(`carrier ${i}`);
    }
    expect(bare).toEqual([]);
  });
});
