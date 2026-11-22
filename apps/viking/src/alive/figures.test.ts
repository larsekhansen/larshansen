import { describe, expect, test } from "bun:test";
import { BUILT, ENCORE_STOP, LINE, loadLevel } from "../levels/index";
import { lookName } from "./census";
import { CARRIER_WORDS, ENEMY_STATES, FIGURE_NAMES, HIM_ROWS, LOKI_MOVES, LOKI_PLAIN, LOKI_STAGES, MAZE_STATES, STATE_WORDS, THROWN_STATE, figureKinds, stateOfFrame, stateWords, thingState } from "./figures";

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

// Order 37: every state on the page of every figure has both languages too (ADR 0016). The tool names its rows from the figures'
// table (`STATE_WORDS`, and `stateWords` for the states it builds from parts); here every state the game's tables give it is held
// to have words in both, the bosses' and the small things' read from their sheets' frames as the tool reads them. (The tool says
// any it cannot name, and fails.)
describe("every state on the page of every figure in both languages (order 37)", () => {
  test("every state's words: the English its own, a Norwegian of its own", () => {
    const bad = Object.entries(STATE_WORDS).filter(([k, w]) => w.en !== k || !w.nb || w.nb === w.en);
    expect(bad.map(([k]) => k)).toEqual([]);
    for (const w of [...Object.values(CARRIER_WORDS), THROWN_STATE]) expect(w.nb && w.nb !== w.en).toBeTruthy();
  });

  test("a state built from parts is named from its parts, each level by its station's name", () => {
    expect(stateWords("still, glammed as at langkaia, nabolaget")).toEqual({ en: "still, glammed as at Langkaia, Gamle Oslo", nb: "i ro, glammet som på Langkaia, Gamle Oslo" });
    expect(stateWords(`${THROWN_STATE.en} (radhuset)`)).toEqual({ en: `${THROWN_STATE.en} (Rådhuset)`, nb: `${THROWN_STATE.nb} (Rådhuset)` });
    expect(stateWords("orbit 4")).toEqual({ en: "orbit 4", nb: "sirkel 4" });
    expect(stateWords("the wig knocked off: waiting; the jaws")).toEqual({ en: "the wig knocked off: waiting; the jaws", nb: "parykken slått av: venter; kjevene" });
    expect(stateWords("something nobody named")).toBeNull();
  });

  test("every state the game's tables give the figures' page has its words", async () => {
    const missing: string[] = [];
    const want = (state: string) => !stateWords(state) && missing.push(state);
    for (const [state] of HIM_ROWS) want(state);
    const levels = [...LINE, ENCORE_STOP].map((l) => l.id);
    for (const state of Object.values(ENEMY_STATES)) {
      want(state);
      for (const id of levels) want(`${state}, glammed as at ${id}`);
    }
    for (const stage of LOKI_STAGES) want(`${stage}: ${LOKI_MOVES.join("; ")}`);
    want(LOKI_PLAIN);
    for (const rows of Object.values(MAZE_STATES)) rows.forEach(want);
    for (const st of [...BUILT, { id: "encore" }]) {
      const def = await loadLevel(st.id);
      def.carriers.forEach((d, i) => want(`${d.kind} ${i + 1}`));
      want(`${THROWN_STATE.en} (${st.id})`);
    }
    want("its pieces, smallest first");
    want("its pieces, smallest first, continued");
    // The bosses' and the small things' rows, from their sheets' frames (the tools are read by a path, so they stay outside tsc).
    const glance = "../../tools/glance/";
    const { bossSheets } = await import(`${glance}bosses`);
    const { serpentSheets } = await import(`${glance}serpent`);
    const { frameSheets } = await import(`${glance}frames`);
    const b = bossSheets();
    for (const f of [...b.troll, ...b.plough, ...serpentSheets().serpent]) want(stateOfFrame(f.name));
    const things = await frameSheets(["things", "bench", "bracteate", "rune stone", "flag", "ski pole and feather", "shield", "sheep", "heron"]);
    const sheetOf: Record<string, string> = { things: "skilling", "ski pole and feather": "pole" };
    for (const [label, frames] of Object.entries(things) as [string, { name: string }[]][])
      for (const f of frames) {
        const sheet = label === "things" && f.name === "cheese" ? "cheese" : label === "ski pole and feather" && f.name.startsWith("feather") ? "feather" : (sheetOf[label] ?? label);
        want(stateOfFrame(thingState(sheet, f.name)));
      }
    expect([...new Set(missing)]).toEqual([]);
  });
});
