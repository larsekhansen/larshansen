import { describe, expect, test } from "bun:test";
import type { Move } from "../game/bot";
import { BUILT, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import { FORE, FORE_SPEED, FORE_WIDTH } from "./fore";
import { clearAt, featuresOf } from "./forecheck";

// Order 23, section 3.4: something in front of him now and then, never where he must read what is coming. Held from the
// level's own data and its route: a thing passing him crosses the six tiles ahead of him with no jump, no pit or
// water, no enemy's patrol and no pickup there.

describe("what passes in front of him (order 23)", () => {
  test("three or four a level at most, at 1.5 to 2 times the camera's speed, each narrower than a tenth of the narrowest view", () => {
    for (const list of Object.values(FORE)) expect(list.length).toBeLessThanOrEqual(4);
    expect(FORE_SPEED).toBeGreaterThanOrEqual(1.5);
    expect(FORE_SPEED).toBeLessThanOrEqual(2);
    for (const w of Object.values(FORE_WIDTH)) expect(w).toBeLessThanOrEqual(24);
  });

  test("never within six tiles ahead of a jump, a pit or water, an enemy's patrol or a pickup", async () => {
    const bad: string[] = [];
    for (const st of BUILT) {
      const list = FORE[st.id];
      if (!list) continue;
      const def = await loadLevel(st.id);
      const feats = featuresOf(def, (ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`]);
      for (const f of list) if (!clearAt(f.x, feats)) bad.push(`${st.id}: ${f.kind} at column ${f.x / 16}`);
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
