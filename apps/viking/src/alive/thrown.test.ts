import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { R, target, view } from "@larshansen/pixelkit/paint";
import { ENEMY } from "@larshansen/pixelkit/palette";
import { THROWN, freshRings, invaders, outlined, type Sprite } from "../render/sprite";
import { glows } from "./glamour";

// Order 39, item 3: after dusk what an invader throws keeps a pixel of the dark between its red outline and its glow (as every
// invader does over a level's own dark since order 32), where an invader's own glow lies against its outline. Measured in place,
// the riveter's bolt in Bjørvika's evening stood 16.5 off its glow (CIEDE2000) and 40.7 off the dark pixel now; every thrown
// thing under its level's own sky 40 or more (`apps/viking/tools/review/o39/after.md`).

/** A canvas that draws nothing, known by itself. */
const canvas = () => {
  const ctx: Record<string, unknown> = { globalAlpha: 1, globalCompositeOperation: "source-over", fillStyle: "" };
  for (const k of ["fillRect", "clearRect", "drawImage"]) ctx[k] = () => undefined;
  const c = { width: 0, height: 0, getContext: () => ctx };
  return c;
};

describe("what is thrown after dusk (order 39)", () => {
  beforeAll(() => {
    (globalThis as Record<string, unknown>).document = { createElement: canvas };
    Object.assign(view, { camX: 0, camY: 0, camXf: 0, camYf: 0, w: 320, h: 200 });
  });
  afterAll(() => {
    delete (globalThis as Record<string, unknown>).document;
  });

  test("its glow keeps a dark pixel off its outline, a pixel further out; an enemy's glow is as it was", () => {
    const street = { ...canvas().getContext(), drawImage: () => undefined } as unknown as CanvasRenderingContext2D;
    target(street);
    freshRings();
    outlined(() => R(10, 10, 5, 4, ENEMY.plum), THROWN);
    outlined(() => R(60, 10, 8, 8, ENEMY.orange), {});
    const copied: unknown[] = [];
    glows({ drawImage: (c: unknown) => void copied.push(c), globalAlpha: 1 } as unknown as CanvasRenderingContext2D);
    const seen: { s: Sprite; thrown: boolean }[] = [];
    invaders((s, _x, _y, thrown) => void seen.push({ s, thrown }));
    expect(seen.map((x) => x.thrown)).toEqual([true, false]);
    const [shot, foe] = seen.map((x) => x.s);
    expect(shot.gap).toBeDefined();
    expect(shot.glow).toBeUndefined();
    expect(copied).toEqual([shot.gap, shot.glowFar, foe.glow]);
  });
});
