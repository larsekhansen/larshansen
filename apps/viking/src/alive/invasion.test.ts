import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import type { Move } from "../game/bot";
import { levelMap } from "../game/play";
import { BUILT, loadLevel } from "../levels/index";
import * as ROUTES from "../levels/routes";
import { PLACES, SIZE } from "./invasion";
import { jumpsOf } from "./invasioncheck";

// Order 27, section 3: the invasion's evidence stands in the scenery behind the lane, a few in each level, never near a
// jump he must read (where the route leaves the ground or comes down, a pit or water, a door, a sign, a bench, a flag).

describe("what the Neon Invaders left in Oslo (order 27)", () => {
  test("every level has two to four pieces", () => {
    for (const st of BUILT) {
      const n = PLACES[st.id]?.length ?? 0;
      expect(n, st.id).toBeGreaterThanOrEqual(2);
      expect(n, st.id).toBeLessThanOrEqual(4);
    }
  });

  test("each stands on the ground with air over it (a mirror ball hangs in the air), three tiles or more from anything he must read", async () => {
    const bad: string[] = [];
    for (const st of BUILT) {
      const def = await loadLevel(st.id);
      const map = levelMap(def);
      const near = await jumpsOf(def, (ROUTES as unknown as Record<string, Move[]>)[`${st.id.toUpperCase()}_ROUTE`]);
      for (const p of PLACES[st.id] ?? []) {
        const x = p.c * TILE + TILE / 2;
        const f = near.find((n) => Math.abs(n - x) < 3 * TILE);
        if (f !== undefined) bad.push(`${st.id}: the ${p.kind} at column ${p.c} is ${Math.round(Math.abs(f - x))} px from what he must read`);
        const rows = Math.ceil(SIZE[p.kind].h / TILE);
        if (p.kind !== "ball" && !map.isSolid(p.c, p.r)) bad.push(`${st.id}: the ${p.kind} at column ${p.c} stands on nothing`);
        for (let k = 1; k <= rows; k++) if (map.isSolid(p.c, p.r - k)) bad.push(`${st.id}: the ${p.kind} at column ${p.c} is in the ground`);
      }
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
