import { describe, expect, test } from "bun:test";
import { BUILT, loadLevel } from "../levels/index";
import { lookName } from "./census";
import { FIGURE_NAMES, figureKinds } from "./figures";

// Order 35: every figure on one page. `tools/figures.ts` draws a sheet of every figure the game draws and writes `figures.json`
// from `figureKinds` (`alive/figures.ts`). Every kind any level uses is in that list, met where the level meets it, and every
// figure in it has its name as a player would say it in both languages. (The props are held in `alive/props.test.ts`, which
// draws every level.)

describe("every figure on one page (order 35)", () => {
  test("every enemy, what every thrower throws, every boss and every level's carriers are listed for the figures' page, with the levels they are met in", async () => {
    const kinds = await figureKinds();
    const at = new Map(kinds.map((k) => [k.file, k.levels]));
    const missing: string[] = [];
    const want = (file: string, level: string) => !at.get(file)?.includes(level) && missing.push(`${file} in ${level}`);
    for (const st of [...BUILT, { id: "encore" }]) {
      const def = await loadLevel(st.id);
      want("him", def.id);
      for (const e of def.enemies ?? []) {
        want(`enemy-${lookName({ def: e } as never, def.id)}`, def.id);
        if (e.kind === "thrower") want(`thrown-${lookName({ def: e } as never, def.id)}`, def.id);
      }
      if (def.troll || def.boss) expect(kinds.some((k) => k.group === "boss" && k.levels.includes(def.id))).toBe(true);
      if (def.carriers.length) want(`carrier-${def.id}`, def.id);
    }
    expect(missing).toEqual([]);
    // The three bosses and Loki, each once.
    expect(kinds.filter((k) => k.group === "boss").map((k) => k.kind).sort()).toEqual(["loki", "plough", "serpent", "troll"]);
  });

  test("every figure listed has its name in English and Norwegian, and no name is left over", async () => {
    const kinds = await figureKinds();
    expect(kinds.filter((k) => !FIGURE_NAMES[k.file]?.en || !FIGURE_NAMES[k.file]?.nb).map((k) => k.file)).toEqual([]);
    // A name with no figure is a figure that went (a prop kind is listed only as it is drawn: those are held by the props test).
    const files = new Set(kinds.map((k) => k.file));
    expect(Object.keys(FIGURE_NAMES).filter((f) => !f.startsWith("prop-") && !files.has(f))).toEqual([]);
  });
});
