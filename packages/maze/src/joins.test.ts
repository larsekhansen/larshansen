import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { decodeGhost, encodeGhost, ghostAt, loadGhost, saveGhost } from "./ghost";
import { strings } from "./i18n";
import { LEVELS, mapInfo } from "./levels";
import { FEATHER_GOLD_KEY, FEATHER_KEY, RECORDS_KEY, featherWon, loadFeather, loadRecords, recordClear, saveFeather, type Store } from "./records";
import { playLevel } from "./bot";

// The joins between the maze and the pages that host it (order 36, HANDOVER's "untested paths"). The maze runs in two places:
// inside Vikingfjorden (larshansen.dev/viking/, `#jernhaugen`) and alone (maze.larshansen.dev). A browser keeps a site's
// storage by its address, so the two never share what they remember. The design (ADR 0007, 0012, `apps/iron-maze/README.md`):
// inside Vikingfjorden the maze's records, ghosts and feather are the fjord's own (the fjord reads the feather from the same
// storage); alone, the maze keeps its own records and ghosts, and its feather cannot cross to the fjord, which its words say.
// What the pages do at the join (in, out, the feather's moment) is held by stepped pictures (`?debug&walkin`, `&out`, `&after`
// in the viking page; `apps/viking/tools/review/o36/after.md`).

const store = (): Store & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
};

/** A clear of a level as the scene records it: the time, the curses, the marks, the ghost, the feather. */
function clear(s: Store, level: number) {
  const run = playLevel(level, "pointer");
  const parMs = LEVELS[level - 1].par * 1000;
  const records = recordClear(level, run.steps * (1000 / 60), run.deaths, s, parMs);
  const points = new Int16Array(run.trail.flatMap((p) => [Math.round(p.x * 2), Math.round(p.y * 2)]));
  saveGhost(level, points, s);
  const prize = featherWon(level, records, loadFeather(s), LEVELS.length);
  if (prize) saveFeather(prize, s);
  return prize;
}

const VIKING_MAIN = readFileSync(join(import.meta.dir, "../../../apps/viking/src/main.ts"), "utf8");
const MAZE_MAIN = readFileSync(join(import.meta.dir, "../../../apps/iron-maze/src/main.ts"), "utf8");

describe("the joins between the maze and its two pages", () => {
  test("inside Vikingfjorden the feather the maze gives is the one the fjord reads, under the same keys", () => {
    const fjord = store();
    expect(clear(fjord, 1)).toBeNull();
    expect(clear(fjord, 2)).toBeNull();
    expect(clear(fjord, 3)).toBe("plain");
    expect(fjord.getItem(FEATHER_KEY)).toBe("1");
    // The viking page reads the feather from its own storage by these keys when he comes out of the mound (`readFeather`).
    expect(VIKING_MAIN).toContain(`store.get("${FEATHER_KEY}") === "1"`);
    expect(VIKING_MAIN).toContain(`store.get("${FEATHER_GOLD_KEY}") === "1"`);
    for (let n = 4; n <= LEVELS.length; n++) clear(fjord, n);
    expect(fjord.getItem(FEATHER_GOLD_KEY)).toBe("1");
  });

  test("a record made in one page is seen again in that page (the level list, the card, the ghost), and never in the other", () => {
    const alone = store();
    const fjord = store();
    clear(alone, 2);
    expect(loadRecords(alone)[2]).toBeDefined();
    expect(loadGhost(2, alone)).not.toBeNull();
    expect(loadRecords(fjord)).toEqual({});
    expect(loadGhost(2, fjord)).toBeNull();
    clear(fjord, 1);
    expect(Object.keys(loadRecords(alone))).toEqual(["2"]);
    expect(Object.keys(loadRecords(fjord))).toEqual(["1"]);
    // One maze, one format: the same keys in both, so what one page writes the same page reads back (both mount `createMaze`).
    expect([...alone.data.keys()].sort()).toEqual(["maze.ghost.2", RECORDS_KEY]);
  });

  test("alone, the feather is kept for the visit and the words say it waits in Vikingfjorden", () => {
    const alone = store();
    for (let n = 1; n <= 3; n++) clear(alone, n);
    // It is written where the maze stands, where no fjord reads it; the card and the raven say where it is used.
    expect(alone.getItem(FEATHER_KEY)).toBe("1");
    for (const lang of ["nb", "en"] as const) {
      expect(strings(lang).endStandalone).toContain("Vikingfjorden");
      expect(strings(lang).featherGoldStandalone).toContain("Vikingfjorden");
    }
    const page = readFileSync(join(import.meta.dir, "../../../apps/iron-maze/src/main.ts"), "utf8");
    expect(page).toContain("standalone: true");
  });

  test("a ghost written by one checkout's code is read back to the same end (the format did not change)", () => {
    for (let n = 1; n <= LEVELS.length; n++) {
      const run = playLevel(n, "pointer");
      const points = new Int16Array(run.trail.flatMap((p) => [Math.round(p.x * 2), Math.round(p.y * 2)]));
      const back = decodeGhost(encodeGhost(points))!;
      const end = ghostAt(back, back.length / 2 - 1)!;
      const f = mapInfo(LEVELS[n - 1].map).finish;
      expect({ n, inFinish: end.x >= f.c * 16 && end.x < (f.c + 2) * 16 && end.y >= f.r * 16 && end.y < (f.r + 2) * 16 }).toEqual({ n, inFinish: true });
    }
  });

  test("muted, the maze is silent in both pages: it sounds only through the page's sfx, which the shared mute silences", () => {
    // No module of the maze makes a sound of its own: every sound is `sfx.play` on the sfx the page gives it (each page a
    // stand-in that forwards to the kit's synth and is quiet until it has come: the viking page's since order 33, the maze's
    // own since order 37). `nomusic.test.ts` holds that a muted kit synth makes no sound for any of them.
    const src = join(import.meta.dir);
    for (const f of readdirSync(src).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
      const text = readFileSync(join(src, f), "utf8");
      expect({ f, own: /createSfx|AudioContext|new Audio|\.voice\(/.exec(text)?.[0] ?? null }).toEqual({ f, own: null });
      for (const m of text.matchAll(/(\w+)\.play\(/g)) expect({ f, on: m[1] }).toEqual({ f, on: "sfx" });
    }
    for (const page of [VIKING_MAIN, MAZE_MAIN]) {
      expect(page).toMatch(/play: \(name, n\) => synth\?\.play\(name, n\)/);
      expect(page).toMatch(/sfx,\s+lang,\s+el: stage,/);
    }
  });
});
