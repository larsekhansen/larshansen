import { describe, expect, test } from "bun:test";
import { playLevel } from "./bot";
import { GHOST_MAX_STEPS, GHOST_PREFIX, createRecorder, decodeGhost, encodeGhost, ghostAt, loadGhost, saveGhost } from "./ghost";
import type { Store } from "./records";

function memory(): Store & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

/** A walk recorded the way the scene records it: his centre in art pixels after each step. */
function record(points: { x: number; y: number }[]) {
  const r = createRecorder();
  for (const p of points) r.push(p.x, p.y);
  return r.points();
}

/** A seeded wander at up to 1.6 art pixels a step, with a long jump now and then (a teleport, waking at a stone). */
function wander(n: number, seed = 7) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const out: { x: number; y: number }[] = [];
  let x = 100;
  let y = 100;
  for (let i = 0; i < n; i++) {
    if (rnd() < 0.002) {
      x = 8 + rnd() * 490;
      y = 8 + rnd() * 300;
    } else {
      const a = rnd() * Math.PI * 2;
      const d = rnd() * 1.6;
      x = Math.min(500, Math.max(4, x + Math.cos(a) * d));
      y = Math.min(310, Math.max(4, y + Math.sin(a) * d));
    }
    out.push({ x, y });
  }
  return out;
}

describe("the ghost's encoding", () => {
  test("a run comes back exactly, to the half art pixel", () => {
    const points = record(wander(3000));
    const back = decodeGhost(encodeGhost(points));
    expect(back).not.toBeNull();
    expect(Array.from(back!)).toEqual(Array.from(points));
  });

  test("a real clear comes back exactly, teleport and all", () => {
    const run = playLevel(2, "pointer", { portals: true });
    expect(run.teleports).toBe(1);
    const points = record(run.trail);
    expect(Array.from(decodeGhost(encodeGhost(points))!)).toEqual(Array.from(points));
  });

  test("standing still is a few characters, however long", () => {
    const still = record(Array.from({ length: 5000 }, () => ({ x: 48, y: 272 })));
    expect(encodeGhost(still).length).toBeLessThan(20);
  });

  test("three minutes of the busiest wandering stays under 20 kB, and longer runs are cut at three minutes", () => {
    const points = record(wander(GHOST_MAX_STEPS + 2000));
    expect(points.length).toBe(GHOST_MAX_STEPS * 2);
    const text = encodeGhost(points);
    expect(text.length).toBeLessThan(20_000);
    expect(decodeGhost(text)!.length).toBe(GHOST_MAX_STEPS * 2);
  });

  test("a real clear is small: well under a kilobyte for each ten seconds", () => {
    const run = playLevel(1, "keys");
    const text = encodeGhost(record(run.trail));
    expect(text.length).toBeLessThan((run.trail.length / 600) * 1000);
  });

  test("anything else reads as no ghost", () => {
    for (const bad of [null, undefined, "", "hello", "g1:", "g1:zz", "g1:1,1;a~", "g1:1,1;a5æ", "g2:1,1;"]) {
      const out = decodeGhost(bad);
      expect(out === null || out.length === 0).toBe(true);
    }
  });

  test("a huge run count cannot make a ghost longer than three minutes", () => {
    expect(decodeGhost("g1:a,a;A999999999")!.length).toBe(GHOST_MAX_STEPS * 2);
  });
});

describe("the ghost in play", () => {
  test("ghostAt follows the run, blends between steps, and is gone after the last one", () => {
    const points = record([{ x: 10, y: 20 }, { x: 11, y: 20 }, { x: 12, y: 21 }]);
    expect(ghostAt(points, 0)).toEqual({ x: 10, y: 20 });
    expect(ghostAt(points, 0, 0.5)).toEqual({ x: 10.5, y: 20 });
    expect(ghostAt(points, 2)).toEqual({ x: 12, y: 21 });
    expect(ghostAt(points, 3)).toBeNull();
    expect(ghostAt(points, -1)).toBeNull();
  });

  test("a long jump is not blended across", () => {
    const points = record([{ x: 10, y: 20 }, { x: 200, y: 100 }]);
    expect(ghostAt(points, 0, 0.5)).toEqual({ x: 10, y: 20 });
  });

  test("saved per level and read back; nothing saved is no ghost", () => {
    const m = memory();
    expect(loadGhost(3, m)).toBeNull();
    const points = record(wander(600));
    saveGhost(3, points, m);
    expect(m.data.has(GHOST_PREFIX + "3")).toBe(true);
    expect(Array.from(loadGhost(3, m)!)).toEqual(Array.from(points));
    expect(loadGhost(4, m)).toBeNull();
  });

  test("a store that refuses does not throw", () => {
    const bad: Store = { getItem: () => { throw new Error("no"); }, setItem: () => { throw new Error("no"); } };
    expect(() => saveGhost(1, record(wander(10)), bad)).not.toThrow();
    expect(loadGhost(1, bad)).toBeNull();
  });

  test("the recorder can be reset for the next attempt", () => {
    const r = createRecorder();
    r.push(1, 1);
    r.push(2, 2);
    expect(r.length).toBe(2);
    r.reset();
    expect(r.length).toBe(0);
    r.push(3, 4);
    expect(Array.from(r.points())).toEqual([6, 8]);
  });
});
