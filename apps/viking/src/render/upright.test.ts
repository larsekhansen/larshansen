import { describe, expect, test } from "bun:test";
import { PLAYER } from "@larshansen/pixelkit/config";
import { type Phase } from "@larshansen/pixelkit/oslo";
import { target, view } from "@larshansen/pixelkit/paint";
import { ENEMY, ROLES, STAND } from "@larshansen/pixelkit/palette";
import { ANY_METHOD, deltaE, tinted, type Rgb } from "./fields";
import { DPR, SKIES, framed, places, raster, rgbaOf, scenes, seedPlaces, viewOf, type Place } from "./uprightframe";
import { loadLevel } from "../levels/index";

// The upright phone (order 45): on a screen taller than it is wide the sky over the far view and the ground under him are tall
// bands, and a level fills them (`art.sky`, `art.under`, `alive/upright.ts`). Held here, drawn as the page draws them at five places
// of each level's scripted route, framed by the page's own camera rule with the pad's buttons at 390 x 844 and 360 x 640 at a phone's
// pixel ratio: (1) no band of one flat colour taller than a stated share of the screen under the bar, in the sky (the kit's sky and the
// level's) or under his feet (the level's tiles and what it draws under them), under every sky, but by name; (2) nothing the two
// hooks add comes within 10 of the warning red, the paint or any role's colours under any sky.

/** The most of the screen under the bar a band of one flat colour may take, in the sky or under him. */
const FLAT = 0.2;
/**
 * Where a flat band upright is not the sky or the ground, the most it may take there, and why. Order 45 named three (Ekeberg's fjord far
 * below the viewpoint, 0.43; Gamlebyen's harbour at the prow, 0.34; the encore's water mirror, 0.28); order 46 gave each what is there
 * (the fjord's islands, a ferry's wake and the far shore; the harbour's depth strips and a mooring; what the mirror mirrors) and none is
 * named now.
 */
const FLAT_NAMED: Record<string, { most: number; why: string }> = {};

/**
 * Each scene's longest flat bands, measured in workers side by side. In a worker of its own the drawing is as fast as in a process
 * alone: in the suite, after the reduced-motion test has drawn every level through every kind of stand-in canvas, the same drawing
 * on this thread took two and a half times as long (18.7 s where it takes 7).
 */
async function measured(ids: string[]): Promise<Map<string, { sky: number; under: number; at: string }>> {
  const out = new Map<string, { sky: number; under: number; at: string }>();
  const queue = [...ids];
  const n = Math.min(4, navigator.hardwareConcurrency || 4, queue.length);
  await Promise.all(
    Array.from({ length: n }, async () => {
      const w = new Worker(new URL("./upright.worker.ts", import.meta.url).href);
      try {
        for (let id = queue.shift(); id; id = queue.shift()) {
          const got = await new Promise<{ id: string; sky: number; under: number; at: string; places: Place[] }>((done, fail) => {
            w.onmessage = (e) => done(e.data);
            w.onerror = (e) => fail(e);
            w.postMessage({ id });
          });
          out.set(id, got);
          // The places it played the route for, kept for the tests below (this thread need not play it again).
          seedPlaces(id, await loadLevel(id), got.places);
        }
      } finally {
        w.terminate();
      }
    })
  );
  return out;
}

describe("the upright phone's tall bands are filled (order 45)", () => {
  test(`upright, no band of one flat colour takes more than ${FLAT * 100} % of the screen under the bar, in the sky or under him, in any level under any sky, but by name`, async () => {
    const wrong: string[] = [];
    const table: string[] = [];
    const used = new Set<string>();
    const all = await scenes();
    const got = await measured(all.map((s) => s.id));
    for (const { id } of all) {
      const f = got.get(id)!;
      const most = Math.max(f.sky, f.under);
      table.push(`${id}: the sky ${(f.sky * 100).toFixed(0)} %, under him ${(f.under * 100).toFixed(0)} % (${f.at})`);
      const named = FLAT_NAMED[id];
      if (named) {
        used.add(id);
        if (most > named.most + 0.005) wrong.push(`${id}: ${(most * 100).toFixed(1)} %, more than its named ${(named.most * 100).toFixed(0)} %`);
      } else if (most > FLAT) wrong.push(`${id}: ${(most * 100).toFixed(1)} % (${f.at})`);
    }
    console.log(`The longest flat bands upright:\n  ${table.join("\n  ")}`);
    expect(wrong).toEqual([]);
    expect(Object.keys(FLAT_NAMED).filter((k) => !used.has(k))).toEqual([]);
  }, 300_000);

  test("with reduced motion nothing the upright sky and the band under the ground add moves: drawn at four moments, the same calls", async () => {
    const moved: string[] = [];
    const was = { ...view };
    try {
      for (const { id, def } of await scenes()) {
        if (!def.art.sky && !def.art.under) continue;
        const { play, at } = await places(id, def);
        for (const s of SKIES) {
          const sky = s.sky(def);
          const pl = at[0];
          const { v, cam, top, body } = framed(play, pl, 390, 844);
          Object.assign(view, { w: v.w, h: v.h, k: v.k, dpr: DPR, camX: Math.round(cam.x), camXf: cam.x, camY: Math.round(cam.y), camYf: cam.y, reduced: true });
          const him = { x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h / 2 };
          const record = (t: number) => {
            const calls: string[] = [];
            let style: unknown = "";
            const g: Record<string, unknown> = {
              get fillStyle() {
                return style;
              },
              set fillStyle(c: unknown) {
                style = c;
              },
              globalAlpha: 1,
              canvas: { width: v.w, height: v.h },
              createLinearGradient: (...a: number[]) => {
                const stops: string[] = [];
                return { addColorStop: (o: number, c: string) => stops.push(`${o.toFixed(4)} ${c}`), toString: () => `grad ${a.join(",")} ${stops.join(";")}` };
              },
              fillRect: (x: number, y: number, w: number, h: number) => calls.push(`${String(style)} ${x},${y},${w},${h}`)
            };
            Object.setPrototypeOf(g, ANY_METHOD);
            target(g as unknown as CanvasRenderingContext2D);
            def.art.sky?.(viewOf(sky, t, him), top);
            def.art.under?.(viewOf(sky, t, him), play.map);
            return calls.join("\n");
          };
          const first = record(100);
          if ([109, 517, 1905].some((t) => record(t) !== first)) moved.push(`${id} (${s.name})`);
        }
      }
    } finally {
      Object.assign(view, was);
    }
    expect(moved).toEqual([]);
  });

  test("nothing the upright sky and the band under the ground add comes within 10 of the warning red, the paint or any role's colours, under any sky", async () => {
    const ROLE: { role: string; colours: readonly string[]; day?: boolean }[] = [
      { role: "the warning red", colours: [ENEMY.red] },
      { role: "the paint", colours: [STAND.top] },
      { role: "his tunic", colours: [ROLES.him.tunic, ROLES.him.tunicLit, ROLES.him.tunicShade], day: true },
      { role: "what he takes", colours: [ROLES.take.copper, ROLES.take.gold, ROLES.take.goldDark] },
      { role: "a boss's now", colours: ROLES.COLOURS.now },
      { role: "things to use", colours: ROLES.COLOURS.use },
      { role: "the calm outline", colours: ROLES.COLOURS.calm }
    ];
    const wrong = new Set<string>();
    const least: Record<string, { d: number; at: string }> = {};
    const rgb = (c: string) => rgbaOf(c)!.slice(0, 3) as Rgb;
    const was = { ...view };
    try {
      for (const { id, def } of await scenes()) {
        if (!def.art.sky && !def.art.under) continue;
        const { play, at } = await places(id, def);
        for (const s of SKIES) {
          const sky = s.sky(def);
          const phase: Phase = sky.phase;
          for (const pl of at.slice(0, 3)) {
            const { v, cam, top, body } = framed(play, pl, 390, 844);
            Object.assign(view, { w: v.w, h: v.h, k: v.k, dpr: DPR, camX: Math.round(cam.x), camXf: cam.x, camY: Math.round(cam.y), camYf: cam.y, reduced: false });
            const him = { x: body.x + PLAYER.w / 2, y: body.y + PLAYER.h / 2 };
            for (const part of ["sky", "under"] as const) {
              const drawn = new Set<string>();
              const r = raster(v.w, v.h, (c) => drawn.add(c));
              target(r.ctx);
              if (part === "sky") def.art.sky?.(viewOf(sky, pl.t, him), top);
              else def.art.under?.(viewOf(sky, pl.t, him), play.map);
              for (const c of drawn) {
                const p = rgbaOf(c);
                // A gradient's clear end, and a fill that is hardly there, are not colours anyone sees.
                if (!p || p[3] < 0.3) continue;
                // The sky's canvas is drawn in each sky's own colours; the street's (under the ground) is tinted after dusk.
                const seen = part === "sky" ? rgb(c) : tinted(rgb(c), phase);
                for (const ro of ROLE) {
                  if (ro.day && phase !== "day") continue;
                  for (const rc of ro.colours) {
                    const d = deltaE(seen, rgb(rc));
                    if (d < (least[ro.role]?.d ?? Infinity)) least[ro.role] = { d, at: `${id} ${part} ${c} (${s.name})` };
                    if (d < 10) wrong.add(`${id} ${part} ${c} (${s.name}): ${d.toFixed(1)} from ${ro.role}`);
                  }
                }
              }
            }
          }
        }
      }
    } finally {
      Object.assign(view, was);
    }
    console.log(`What the upright bands add, its least distances from each role's colours:\n  ${Object.entries(least).map(([r, l]) => `${r}: ${l.d.toFixed(1)} at ${l.at}`).join("\n  ")}`);
    expect([...wrong]).toEqual([]);
  }, 300_000);
});
