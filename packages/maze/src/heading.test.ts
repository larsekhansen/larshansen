import { describe, expect, test } from "bun:test";
import { createBot } from "./bot";
import { createRecorder } from "./ghost";
import { ghostWalk, newHeading, turn, type View } from "./heading";
import { LEVELS } from "./levels";
import { SPEED, newState, stepMaze } from "./rules";

// Order 37: which of his drawings the maze shows (his side, his back going away, his face coming toward) follows the way he
// moves with a little stickiness. A diagonal drag never flickers between two drawings, a corridor's way is taken in a few
// steps, and standing keeps the drawing he stopped in. Drawing only: the rules never read it.

/** A seeded jitter, as a finger's drag has: the same numbers every run. */
function jitter(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32 - 0.5;
  };
}

/** How many times the drawing changes along a run of moves, from a heading that starts as given. */
function changes(moves: [number, number][], start: View = "side") {
  const h = newHeading();
  h.view = start;
  let n = 0;
  let was = h.view;
  for (const [dx, dy] of moves) {
    turn(h, dx, dy);
    if (h.view !== was) n++;
    was = h.view;
  }
  return { n, last: h.view, facing: h.facing };
}

describe("his drawing in the maze follows his way, with a little stickiness (order 37)", () => {
  test("a steady diagonal at any angle never changes his drawing more than once, from any drawing, with keys, a mouse (with Shift too) or a jittering finger", () => {
    const worst: string[] = [];
    // A finger's drag jitters by up to a quarter of a step across and up and down (the maze spends what the finger moved at the
    // pointer's speed, so a real drag jitters less); keys and a mouse go straight. A finger is never careful (Shift or jump).
    const inputs = [["keys", SPEED.keys, 0], ["keys, careful", SPEED.careful, 0], ["mouse", SPEED.pointer, 0], ["mouse, careful", SPEED.careful, 0], ["finger", SPEED.pointer, 0.8]] as const;
    for (let deg = 0; deg < 360; deg += 1) {
      const a = (deg * Math.PI) / 180;
      for (const [how, speed, noise] of inputs)
        for (let seed = 0; seed < (noise ? 3 : 1); seed++) {
          const r = jitter(deg * 7 + seed * 1000 + how.length);
          const moves: [number, number][] = Array.from({ length: 600 }, () => [Math.cos(a) * speed + r() * noise, Math.sin(a) * speed + r() * noise]);
          for (const start of ["side", "away", "toward"] as const) {
            const { n } = changes(moves, start);
            if (n > 1) worst.push(`${deg} degrees, ${how}, seed ${seed}, from ${start}: ${n} changes`);
          }
        }
    }
    expect(worst).toEqual([]);
  });

  test("up a corridor he shows his back, down one his face, along one his side, each within a few steps of turning into it", () => {
    const run = (dx: number, dy: number, steps: number) => Array.from({ length: steps }, () => [dx * SPEED.keys, dy * SPEED.keys] as [number, number]);
    const h = newHeading();
    const seen: { view: View; at: number }[] = [];
    let step = 0;
    let was: View = h.view;
    for (const leg of [run(0, -1, 40), run(1, 0, 40), run(0, 1, 40), run(-1, 0, 40), run(0, -1, 40)])
      for (const [dx, dy] of leg) {
        turn(h, dx, dy);
        if (h.view !== was) seen.push({ view: h.view, at: step });
        was = h.view;
        step++;
      }
    expect(seen.map((s) => s.view)).toEqual(["away", "side", "toward", "side", "away"]);
    // Each turn is taken within ten steps (12 art pixels) of setting off or of the corner.
    seen.forEach((s, i) => expect(s.at - i * 40).toBeLessThanOrEqual(10));
  });

  test("he faces the way he goes sideways at once, and a corridor's jitter up or down does not turn him round", () => {
    const h = newHeading(1);
    turn(h, -SPEED.keys, 0);
    expect(h.facing).toBe(-1);
    const r = jitter(3);
    for (let i = 0; i < 300; i++) turn(h, r() * 0.6, -SPEED.pointer);
    expect(h.facing).toBe(-1);
    expect(h.view).toBe("away");
  });

  test("standing, he keeps the drawing he stopped in", () => {
    const h = newHeading();
    for (let i = 0; i < 30; i++) turn(h, 0, SPEED.keys);
    expect(h.view).toBe("toward");
    for (let i = 0; i < 300; i++) turn(h, 0, 0);
    expect(h.view).toBe("toward");
    expect(turn(h, 0.01, -0.02).view).toBe("toward");
  });

  test("the scripted player's clear of every level shows his side and a corridor's way (all three over the seven), and never flickers (no change within six steps of another)", () => {
    const all = new Set<View>();
    for (let level = 1; level <= LEVELS.length; level++)
      for (const speed of ["keys", "pointer"] as const) {
        const bot = createBot(level, speed);
        const s = newState(level);
        const h = newHeading();
        const changedAt: number[] = [];
        const views = new Set<View>();
        for (let i = 0; i < 60 * 180 && s.phase !== "cleared"; i++) {
          const intent = bot.next(s);
          bot.after(stepMaze(s, intent));
          const was = h.view;
          turn(h, intent.dx, intent.dy);
          views.add(h.view);
          if (h.view !== was) changedAt.push(i);
        }
        expect(s.phase).toBe("cleared");
        // Level 4 (Råttent gulv) never goes down a corridor.
        expect({ level, speed, side: views.has("side"), corridor: views.has("away") || views.has("toward") }).toEqual({ level, speed, side: true, corridor: true });
        views.forEach((v) => all.add(v));
        const quick = changedAt.filter((at, i) => i > 0 && at - changedAt[i - 1] < 6);
        expect({ level, speed, quick }).toEqual({ level, speed, quick: [] });
      }
    expect([...all].sort()).toEqual(["away", "side", "toward"]);
  });

  test("his ghost's walk goes by the distance it covers and takes his drawings from its own points; a jump is not walked", () => {
    const rec = createRecorder();
    for (let i = 0; i <= 30; i++) rec.push(40 + i * 1.5, 100);
    for (let i = 1; i <= 30; i++) rec.push(85, 100 - i * 1.5);
    rec.push(200, 200); // a teleport
    for (let i = 1; i <= 30; i++) rec.push(200, 200 + i * 1.5);
    const w = ghostWalk(rec.points());
    expect(w.dist[30]).toBeCloseTo(45, 0);
    expect(w.dist[60]).toBeCloseTo(90, 0);
    expect(w.dist[61]).toBeCloseTo(w.dist[60], 5);
    expect(w.dist[91]).toBeCloseTo(135, 0);
    expect([w.view[30], w.view[60], w.view[91]]).toEqual(["side", "away", "toward"]);
    expect(w.facing[30]).toBe(1);
  });
});
