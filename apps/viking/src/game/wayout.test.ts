import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BACK_WAIT_MS, makesEntry, wayOut, type WayOut } from "./wayout";

// Order 37: the maze's way out inside this page. Order 36 found that going through a door while the page still loads leaves
// the way out (Back) with nowhere to go. Now the way in notes whether it made a history entry, and the way out falls back to
// where he came from when it did not, or when Back does not answer. Held on a stand-in history: one with an entry for the
// mound and the page's entry before it, one whose entry the load replaced, and one where Back does nothing at all.

/** A stand-in page: its history as a list of addresses and where it stands, Back as the browser does it, the clock by hand. */
function page(entries: string[], canGoBack: boolean) {
  const history = { entries: [...entries], at: entries.length - 1 };
  const timers: { at: number; then: () => void }[] = [];
  let now = 0;
  const said: string[] = [];
  const p: WayOut = {
    canGoBack,
    inMaze: () => history.entries[history.at] === "#jernhaugen",
    back: () => {
      said.push("back");
      // The browser goes back a step if there is one of this page's (its hashchange takes him out) and does nothing if not.
      if (history.at > 0) timers.push({ at: now + 30, then: () => void history.at-- });
    },
    out: () => {
      said.push("out");
      history.entries[history.at] = "#kart";
    },
    wait: (ms, then) => void timers.push({ at: now + ms, then })
  };
  const run = (ms: number) => {
    for (now = 0; now <= ms; now += 10) for (const t of timers.filter((t) => t.at === now)) t.then();
  };
  return { p, history, said, run };
}

describe("the maze's way out inside the page (order 37)", () => {
  test("gone in through a door after the page loaded, Back takes him out and nothing more is done", () => {
    const { p, history, said, run } = page(["#nordmarka", "#jernhaugen"], true);
    wayOut(p);
    run(BACK_WAIT_MS * 2);
    expect(said).toEqual(["back"]);
    expect(history.entries[history.at]).toBe("#nordmarka");
  });

  test("gone in while the page loaded (its entry replaced), he goes straight out to where he came from: no Back", () => {
    const { p, history, said, run } = page(["#jernhaugen"], false);
    wayOut(p);
    run(BACK_WAIT_MS * 2);
    expect(said).toEqual(["out"]);
    expect(history.entries[history.at]).toBe("#kart");
  });

  test("where Back has no entry to go back to and does nothing, he is out after the wait all the same", () => {
    const { p, history, said, run } = page(["#jernhaugen"], true);
    wayOut(p);
    run(BACK_WAIT_MS - 10);
    expect(said).toEqual(["back"]);
    run(BACK_WAIT_MS * 2);
    expect(said).toEqual(["back", "out"]);
    expect(history.entries[history.at]).toBe("#kart");
  });

  test("the way in makes an entry only once the page has loaded", () => {
    expect(makesEntry("loading")).toBe(false);
    expect(makesEntry("interactive")).toBe(false);
    expect(makesEntry("complete")).toBe(true);
  });

  test("the page goes in and out by this rule", () => {
    const main = readFileSync(join(import.meta.dir, "../main.ts"), "utf8");
    expect(main).toMatch(/canGoBack = entering = makesEntry\(document\.readyState\);\s+location\.hash = MAZE_HASH;/);
    expect(main).toMatch(/wayOut\(\{\s+canGoBack: canGoBack && location\.hash === MAZE_HASH,/);
  });
});
