import { describe, expect, test } from "bun:test";
import { REACHED_KEY, RECORDS_KEY, loadReached, loadRecords, recordClear, saveReached, type Store } from "./records";

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
