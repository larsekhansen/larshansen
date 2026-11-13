import { describe, expect, test } from "bun:test";
import { FEATHER_GOLD_KEY, FEATHER_KEY, REACHED_KEY, RECORDS_KEY, betterFeather, featherWon, loadFeather, loadReached, loadRecords, markCount, marksFor, marksOf, recordClear, saveFeather, saveReached, type Records, type Store } from "./records";

function memory(): Store & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe("records", () => {
  test("nothing remembered gives nothing", () => {
    expect(loadRecords(memory())).toEqual({});
    expect(loadRecords(null)).toEqual({});
  });

  test("the first clear is remembered as it was", () => {
    const m = memory();
    recordClear(2, 41200, 3, m);
    expect(loadRecords(m)).toEqual({ 2: { ms: 41200, deaths: 3 } });
    expect(JSON.parse(m.data.get(RECORDS_KEY)!)).toEqual({ "2": { ms: 41200, deaths: 3 } });
  });

  test("time and deaths each keep their own best", () => {
    const m = memory();
    recordClear(1, 30000, 5, m);
    recordClear(1, 40000, 1, m); // slower, but fewer curses
    expect(loadRecords(m)[1]).toEqual({ ms: 30000, deaths: 1 });
    recordClear(1, 20000, 9, m); // faster, more curses
    expect(loadRecords(m)[1]).toEqual({ ms: 20000, deaths: 1 });
  });

  test("levels are kept apart, and a new store reads them back", () => {
    const m = memory();
    recordClear(1, 1000, 0, m);
    recordClear(7, 9000, 2, m);
    expect(loadRecords(m)).toEqual({ 1: { ms: 1000, deaths: 0 }, 7: { ms: 9000, deaths: 2 } });
  });

  test("garbage in storage is ignored", () => {
    const m = memory();
    m.data.set(RECORDS_KEY, "{nope");
    expect(loadRecords(m)).toEqual({});
    m.data.set(RECORDS_KEY, JSON.stringify({ "1": { ms: "x", deaths: 1 }, "2": { ms: 5, deaths: 0 } }));
    expect(loadRecords(m)).toEqual({ 2: { ms: 5, deaths: 0 } });
  });

  test("a store that refuses does not throw", () => {
    const bad: Store = { getItem: () => { throw new Error("no"); }, setItem: () => { throw new Error("no"); } };
    expect(() => recordClear(1, 1, 1, bad)).not.toThrow();
    expect(loadReached(7, bad)).toBe(1);
    expect(() => saveReached(3, bad)).not.toThrow();
  });
});

describe("reached", () => {
  test("starts at 1, remembers a level, and is kept within the levels there are", () => {
    const m = memory();
    expect(loadReached(7, m)).toBe(1);
    saveReached(4, m);
    expect(loadReached(7, m)).toBe(4);
    m.data.set(REACHED_KEY, "99");
    expect(loadReached(7, m)).toBe(7);
    m.data.set(REACHED_KEY, "abc");
    expect(loadReached(7, m)).toBe(1);
  });
});

describe("the three marks", () => {
  test("one clear: always cleared, clean without a curse, under par when faster than par", () => {
    expect(marksFor(40000, 2, 30000)).toEqual([true, false, false]);
    expect(marksFor(40000, 0, 30000)).toEqual([true, true, false]);
    expect(marksFor(29900, 1, 30000)).toEqual([true, false, true]);
    expect(marksFor(30000, 0, 30000)).toEqual([true, true, false]); // on par is not under it
    expect(marksFor(1000, 0)).toEqual([true, true, false]); // no par, no third mark
  });

  test("a level never cleared has none", () => {
    expect(marksOf(undefined, 30000)).toEqual([false, false, false]);
    expect(markCount(marksOf(undefined))).toBe(0);
  });

  test("each mark is earned on its own, in any clear, and stays", () => {
    const m = memory();
    recordClear(5, 50000, 3, m, 35000);
    expect(marksOf(loadRecords(m)[5], 35000)).toEqual([true, false, false]);
    recordClear(5, 60000, 0, m, 35000); // slow, but clean
    expect(marksOf(loadRecords(m)[5], 35000)).toEqual([true, true, false]);
    recordClear(5, 30000, 4, m, 35000); // fast, cursed
    expect(marksOf(loadRecords(m)[5], 35000)).toEqual([true, true, true]);
    expect(markCount(marksOf(loadRecords(m)[5], 35000))).toBe(3);
  });

  test("under par is kept with the records, so it stays even if the par is ever made harder", () => {
    const m = memory();
    recordClear(2, 24000, 1, m, 25000);
    expect(JSON.parse(m.data.get(RECORDS_KEY)!)).toEqual({ "2": { ms: 24000, deaths: 1, par: true } });
    expect(marksOf(loadRecords(m)[2], 20000)).toEqual([true, false, true]);
    // A clear not under par does not take it away.
    recordClear(2, 90000, 0, m, 25000);
    expect(loadRecords(m)[2]).toEqual({ ms: 24000, deaths: 0, par: true });
  });

  test("records from before the marks are read by their best time and curses", () => {
    const m = memory();
    m.data.set(RECORDS_KEY, JSON.stringify({ "1": { ms: 20000, deaths: 0 } }));
    expect(marksOf(loadRecords(m)[1], 25000)).toEqual([true, true, true]);
    expect(marksOf(loadRecords(m)[1], 15000)).toEqual([true, true, false]);
  });
});

describe("the raven's feather", () => {
  const cleared = (...levels: number[]): Records => Object.fromEntries(levels.map((n) => [n, { ms: 1, deaths: 0 }]));
  const none = { plain: false, gold: false };

  test("levels 1 and 2 give nothing; the first clear of level 3 gives the feather", () => {
    expect(featherWon(1, cleared(1), none, 7)).toBeNull();
    expect(featherWon(2, cleared(1, 2), none, 7)).toBeNull();
    expect(featherWon(3, cleared(1, 2, 3), none, 7)).toBe("plain");
  });

  test("a feather already held is not won again", () => {
    expect(featherWon(3, cleared(1, 2, 3), { plain: true, gold: false }, 7)).toBeNull();
    expect(featherWon(4, cleared(1, 2, 3, 4), { plain: true, gold: false }, 7)).toBeNull();
  });

  test("a browser that got past level 3 before this rule gets it from the next clear", () => {
    expect(featherWon(5, cleared(5), none, 7)).toBe("plain");
  });

  test("all seven cleared turns it gold, once", () => {
    const all = cleared(1, 2, 3, 4, 5, 6, 7);
    expect(featherWon(7, all, { plain: true, gold: false }, 7)).toBe("gold");
    expect(featherWon(7, all, none, 7)).toBe("gold");
    expect(featherWon(7, all, { plain: true, gold: true }, 7)).toBeNull();
    expect(featherWon(7, cleared(1, 2, 3, 5, 6, 7), { plain: true, gold: false }, 7)).toBeNull(); // one missing
    expect(featherWon(4, all, { plain: true, gold: false }, 7)).toBe("gold"); // whichever clear completes the seven
  });

  test("kept under the fjord's keys; gold sets both", () => {
    const m = memory();
    expect(loadFeather(m)).toEqual({ plain: false, gold: false });
    saveFeather("plain", m);
    expect(m.data.get(FEATHER_KEY)).toBe("1");
    expect(m.data.has(FEATHER_GOLD_KEY)).toBe(false);
    expect(loadFeather(m)).toEqual({ plain: true, gold: false });
    saveFeather("gold", m);
    expect(m.data.get(FEATHER_GOLD_KEY)).toBe("1");
    expect(loadFeather(m)).toEqual({ plain: true, gold: true });
    const bad: Store = { getItem: () => { throw new Error("no"); }, setItem: () => { throw new Error("no"); } };
    expect(loadFeather(bad)).toEqual({ plain: false, gold: false });
    expect(() => saveFeather("gold", bad)).not.toThrow();
  });

  test("what a visit reports is the best it won", () => {
    expect(betterFeather(null, null)).toBeNull();
    expect(betterFeather(null, "plain")).toBe("plain");
    expect(betterFeather("plain", "gold")).toBe("gold");
    expect(betterFeather("gold", null)).toBe("gold");
  });
});
