import { afterEach, describe, expect, test } from "bun:test";
import { view } from "@larshansen/pixelkit/paint";
import { createFx } from "./fx";

describe("particles", () => {
  afterEach(() => (view.reduced = false));

  test("a burst makes particles that die out within a second", () => {
    const fx = createFx();
    fx.burst("curse", 100, 100, 7);
    expect(fx.count).toBeGreaterThan(10);
    for (let i = 0; i < 60; i++) fx.step();
    expect(fx.count).toBe(0);
  });

  test("dust is a small puff", () => {
    const fx = createFx();
    fx.burst("dust", 100, 100, 3, { x: -1, y: 0 });
    expect(fx.count).toBeLessThanOrEqual(3);
  });

  test("with motion reduced there are none", () => {
    view.reduced = true;
    const fx = createFx();
    for (const kind of ["curse", "stone", "key", "teleport", "finish", "dust"] as const) fx.burst(kind, 0, 0, 1);
    expect(fx.count).toBe(0);
  });
});
