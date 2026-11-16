import { skyFor } from "@larshansen/pixelkit/oslo";
import { target, view } from "@larshansen/pixelkit/paint";
import { leap, untilThrow, type Enemy } from "../game/enemies";
import { newPlay, type Play } from "../game/play";
import { SHIELD_RULES } from "../game/shield";
import { BUILT, loadLevel } from "../levels/index";
import type { View } from "../levels/types";
import "../render/feel";
import { drawEnemy } from "../render/pickups";
import { drawDeath, type Shape } from "./death";
import { clock, forced } from "./parts";

// For the tests and the tools only (order 23): every enemy look of every level drawn in every state it has, through a
// recorder: still (two breaths), moving (four frames of its cycle), winding up (a thrower), and its death (three
// frames). The frame test holds that each has its frames; `tools/glance/frames.ts` makes the sheets of them.

export interface Drawn {
  name: string;
  rects: { x: number; y: number; w: number; h: number; c: string }[];
}

/** What a look's states draw: its idle, move, wind-up and death frames, each a list of rectangles. */
export interface Census {
  level: string;
  kind: string;
  idle: Drawn[];
  move: Drawn[];
  windup: Drawn | null;
  death: Drawn[];
}

const at = (p: Play): View => ({ sky: skyFor(new Date(2026, 5, 15, 12), "day"), t: p.t, alpha: 1, doors: new Map(), now: new Date(2026, 5, 15, 12), him: { x: -999, y: -999 }, flourish: null, facing: 1, troll: p.troll, flags: [], enemies: p.enemies, boss: p.boss?.state ?? null, cleared: [], runeAt: p.runeAt, grounds: p.grounds?.state ?? null });

/**
 * The name a look goes by: Rådhuset's gull throws standing, so it is a look of its own; and Gamlebyen's guards are the
 * bishop's, not the fortress's.
 */
export const lookName = (e: Enemy, level = "") => `${e.def.look}${e.def.kind === "thrower" && e.def.look === "gull" ? " (thrower)" : ""}${level === "gamlebyen" && e.def.look === "guard" ? " (the bishop's)" : ""}`;

/** Every look in every built level, each in every state (the first enemy of each look, in the first level it is met). */
export async function census(): Promise<Record<string, Census>> {
  const out: Record<string, Census> = {};
  const was = { ...view };
  Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 4000, h: 4000, reduced: false });
  try {
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const p = newPlay(def, { shield: SHIELD_RULES, hasShield: def.rune > 10 });
      for (const e0 of p.enemies) {
        const name = lookName(e0, def.id);
        if (out[name]) continue;
        // Where it starts in its level (a jumper's water, a thrower's perch), facing right, not calm.
        const e: Enemy = { ...e0, def: { ...e0.def }, prevY: e0.y, dir: 1, calm: undefined, n: e0.def.look === "swan" ? 0 : e0.def.look === "guard" ? 1 : e0.n };
        const home = { x: e.x, y: e.y };
        const draw = (label: string, t: number, own = t): Drawn => {
          const rects: Drawn["rects"] = [];
          const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); } };
          target(rec as unknown as CanvasRenderingContext2D);
          clock.t = own;
          p.t = t;
          void (def.art.enemy?.(e, at(p)) || drawEnemy(e, t));
          // From where it stands (a walker moves along as its frames go by, a jumper leaps): as if at (200, 200).
          const dx = Math.round(e.x) - 200;
          const dy = Math.round(e.y) - 200;
          for (const r of rects) {
            r.x -= dx;
            r.y -= dy;
          }
          return { name: `${name}, ${label}`, rects };
        };
        // Still: two breaths a second apart, at a moment it is not winding up.
        forced.state = "idle";
        // A thrower just after it threw; a jumper while its water ripples (still) or in the air (moving).
        const calmT = e.def.kind === "thrower" ? findRest(e) : e.def.kind === "jumper" ? findT(e, (t) => leap(e, t).ripple) : 0;
        const idle = e.def.kind === "jumper" ? [draw("waiting", calmT), draw("waiting, rippling", calmT + 6)] : [draw("still", calmT), draw("still, breathing", calmT, calmT + 65)];
        // Moving: four frames of its cycle (by the distance it covers; a flyer by its clock; a jumper rising, at the top, falling).
        forced.state = "move";
        const move: Drawn[] = [];
        for (let k = 0; k < 4; k++) {
          e.x = home.x + k * 3;
          if (e.def.kind === "jumper") {
            // Rising, at the top, falling: its leap's own moments.
            const t = findT(e, (t) => leap(e, t).up > 0 && [leap(e, t + 1).up > leap(e, t).up + 1, Math.abs(leap(e, t + 3).up - leap(e, t - 3).up) <= 1, leap(e, t + 1).up < leap(e, t).up - 1, leap(e, t + 1).up < leap(e, t).up - 2][k]);
            e.y = home.y - leap(e, t).up;
            e.prevY = home.y - leap(e, t - 1).up;
            move.push(draw(`leaping ${k + 1}`, t));
            e.y = home.y;
            continue;
          }
          move.push(draw(`moving ${k + 1}`, e.def.kind === "flyer" ? k * 7 : calmT));
        }
        e.x = home.x;
        e.prevY = e.y;
        forced.state = null;
        // Winding up: half a second before it throws.
        let windup: Drawn | null = null;
        if (e.def.kind === "thrower") {
          forced.state = "idle";
          windup = draw("winding up", calmT + untilThrow(e, calmT) - 30, calmT);
          forced.state = null;
        }
        // Its death, from its still shape.
        const shape: Shape = { r: idle[0].rects.flatMap((r) => [r.x, r.y, r.w, r.h]), c: idle[0].rects.map((r) => r.c) };
        const death = [0, 1, 2].map((k) => {
          const rects: Drawn["rects"] = [];
          const rec = { fillStyle: "", globalAlpha: 1, fillRect(x: number, y: number, w: number, h: number) { rects.push({ x, y, w, h, c: rec.fillStyle }); } };
          target(rec as unknown as CanvasRenderingContext2D);
          drawDeath(shape, 200, k, false);
          return { name: `${name}, ${["hit", "fold", "gone"][k]}`, rects };
        });
        out[name] = { level: def.id, kind: e.def.kind, idle, move, windup, death };
      }
    }
  } finally {
    forced.state = null;
    clock.t = 0;
    Object.assign(view, was);
  }
  return out;
}

/** The first step at which `ok` holds, or 0. */
function findT(e: Enemy, ok: (t: number) => boolean): number {
  for (let t = 1; t < 2000; t++) if (ok(t)) return t;
  void e;
  return 0;
}

/** A moment a thrower is not winding up: just after it threw. */
function findRest(e: Enemy): number {
  for (let t = 0; t < 600; t++) if (untilThrow(e, t) > 61) return t;
  return 0;
}

/** For the sheets: every look's frames, still, moving, winding up and beaten, in order. */
export async function lookFrames(): Promise<Record<string, Drawn[]>> {
  const c = await census();
  return Object.fromEntries(Object.entries(c).map(([k, v]) => [k, [...v.idle, ...v.move, ...(v.windup ? [v.windup] : []), ...v.death]]));
}
