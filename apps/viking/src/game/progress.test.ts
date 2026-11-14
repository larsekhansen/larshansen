import { describe, expect, test } from "bun:test";
import { allRunes, clearLevel, findBracteate, fresh, furthestOpen, hasPole, hasProgress, isOpen, readProgress, writeProgress } from "./progress";

const ORDER = ["langkaia", "akershus", "radhuset", "slottet"];

describe("reading stored progress", () => {
  test("nothing stored, or anything broken, is a fresh start", () => {
    for (const raw of [null, undefined, "", "{", "null", "[]", "42", '"x"', "{}"]) expect(readProgress(raw)).toEqual(fresh());
  });

  test("good data comes back as it was written", () => {
    const p = clearLevel(clearLevel(fresh(), "langkaia", 41000, true).progress, "akershus", 80000, false).progress;
    expect(readProgress(writeProgress(p))).toEqual(p);
  });

  test("wrong types inside are dropped, the rest kept", () => {
    const p = readProgress(JSON.stringify({ cleared: ["langkaia", 3, null, "langkaia", ""], best: { langkaia: 41000, akershus: "fast", radhuset: -1, x: NaN }, bracteates: "all", skilling: { slottet: 12, x: -1, y: 2.5 }, clean: [1, "slottet"] }));
    expect(p).toEqual({ cleared: ["langkaia"], best: { langkaia: 41000 }, bracteates: [], skilling: { slottet: 12 }, clean: ["slottet"] });
  });

  test("what the first three levels saved, before skilling and hearts, still reads as it was", () => {
    const old = '{"cleared":["langkaia","akershus","radhuset"],"best":{"langkaia":41300,"akershus":65000,"radhuset":88000},"bracteates":["akershus"]}';
    const p = readProgress(old);
    expect(p.cleared).toEqual(["langkaia", "akershus", "radhuset"]);
    expect(p.best).toEqual({ langkaia: 41300, akershus: 65000, radhuset: 88000 });
    expect(p.bracteates).toEqual(["akershus"]);
    expect(p.skilling).toEqual({});
    expect(p.clean).toEqual([]);
    expect(isOpen(p, [...ORDER, "holmenkollen"], 3)).toBe(true);
  });
});

describe("clearing a level", () => {
  test("the first clear is a best, a slower one is not, a faster one is", () => {
    const a = clearLevel(fresh(), "langkaia", 50000, false);
    expect(a.newBest).toBe(true);
    const b = clearLevel(a.progress, "langkaia", 60000, false);
    expect(b.newBest).toBe(false);
    expect(b.progress.best.langkaia).toBe(50000);
    const c = clearLevel(b.progress, "langkaia", 40000, false);
    expect(c.newBest).toBe(true);
    expect(c.progress.best.langkaia).toBe(40000);
    expect(c.progress.cleared).toEqual(["langkaia"]);
  });

  test("a bracteate is kept once found, also from a run without it", () => {
    const a = clearLevel(fresh(), "langkaia", 50000, true).progress;
    expect(clearLevel(a, "langkaia", 40000, false).progress.bracteates).toEqual(["langkaia"]);
    expect(findBracteate(fresh(), "akershus").bracteates).toEqual(["akershus"]);
  });

  test("the most skilling is kept, and a clean run marks the level for good", () => {
    let p = clearLevel(fresh(), "slottet", 70000, false, { skilling: 30, clean: false }).progress;
    p = clearLevel(p, "slottet", 60000, false, { skilling: 20, clean: true }).progress;
    p = clearLevel(p, "slottet", 80000, false, { skilling: 41, clean: false }).progress;
    expect(p.skilling.slottet).toBe(41);
    expect(p.clean).toEqual(["slottet"]);
    expect(p.best.slottet).toBe(60000);
  });

  test("clearing Holmenkollen gives the ski pole", () => {
    expect(hasPole(fresh())).toBe(false);
    expect(hasPole(clearLevel(fresh(), "holmenkollen", 1, false).progress)).toBe(true);
  });

  test("progress is not changed in place", () => {
    const p = fresh();
    clearLevel(p, "langkaia", 1, true);
    expect(p).toEqual(fresh());
  });
});

describe("the line", () => {
  test("the first station is always open; the next when the one before is cleared", () => {
    const p = clearLevel(fresh(), "langkaia", 1, false).progress;
    expect([0, 1, 2].map((i) => isOpen(fresh(), ORDER, i))).toEqual([true, false, false]);
    expect([0, 1, 2].map((i) => isOpen(p, ORDER, i))).toEqual([true, true, false]);
  });

  test("he arrives at the furthest open station among the built ones", () => {
    let p = fresh();
    expect(furthestOpen(p, ORDER, 3)).toBe(0);
    p = clearLevel(p, "langkaia", 1, false).progress;
    expect(furthestOpen(p, ORDER, 3)).toBe(1);
    p = clearLevel(clearLevel(p, "akershus", 1, false).progress, "radhuset", 1, false).progress;
    expect(furthestOpen(p, ORDER, 3)).toBe(2);
  });

  test("anything done counts as progress", () => {
    expect(hasProgress(fresh())).toBe(false);
    expect(hasProgress(findBracteate(fresh(), "langkaia"))).toBe(true);
  });
});

test("all ten runes: every station on the line cleared, from a fresh start or an old save; an old save's odd entries do not count", () => {
  const order = ["a", "b", "c"];
  expect(allRunes(fresh(), order)).toBe(false);
  let p = fresh();
  for (const id of order) p = clearLevel(p, id, 1000, false).progress;
  expect(allRunes(p, order)).toBe(true);
  // An old save with the first two and something else in it, then the third cleared now.
  const old = readProgress(JSON.stringify({ cleared: ["a", "b", "zz", 7], best: { a: 5 } }));
  expect(allRunes(old, order)).toBe(false);
  expect(allRunes(clearLevel(old, "c", 900, true).progress, order)).toBe(true);
});
