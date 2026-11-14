import { describe, expect, test } from "bun:test";
import { PROGRESS_VERSION, allRunes, clearLevel, findBracteate, fresh, furthestOpen, hasPole, hasProgress, isOpen, readProgress, writeProgress } from "./progress";
import { LINE_1, LINE_2, LINE_2_AT, ORDER as ORDER16 } from "../levels/index";

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
    const p = readProgress(JSON.stringify({ v: 2, cleared: ["langkaia", 3, null, "langkaia", ""], best: { langkaia: 41000, akershus: "fast", radhuset: -1, x: NaN }, bracteates: "all", skilling: { slottet: 12, x: -1, y: 2.5 }, clean: [1, "slottet"] }));
    expect(p).toEqual({ cleared: ["langkaia"], best: { langkaia: 41000 }, bracteates: [], skilling: { slottet: 12 }, clean: ["slottet"] });
  });

  test("what the first three levels saved, before skilling and hearts, still reads: their runes and bracteates kept, their times from the short levels gone", () => {
    const old = '{"cleared":["langkaia","akershus","radhuset"],"best":{"langkaia":41300,"akershus":65000,"radhuset":88000},"bracteates":["akershus"]}';
    const p = readProgress(old);
    expect(p.cleared).toEqual(["langkaia", "akershus", "radhuset"]);
    expect(p.best).toEqual({});
    expect(p.bracteates).toEqual(["akershus"]);
    expect(p.skilling).toEqual({});
    expect(p.clean).toEqual([]);
    expect(isOpen(p, [...ORDER, "holmenkollen"], 3)).toBe(true);
  });

  test("a save from before the first three were lengthened: only their best times, skilling and clean marks go, and only once", () => {
    const old = JSON.stringify({
      cleared: ["langkaia", "akershus", "radhuset", "slottet", "holmenkollen"],
      best: { langkaia: 41300, akershus: 65000, radhuset: 88000, slottet: 70100, holmenkollen: 66000 },
      bracteates: ["langkaia", "slottet"],
      skilling: { langkaia: 3, slottet: 40 },
      clean: ["radhuset", "slottet"]
    });
    const p = readProgress(old);
    expect(p.cleared).toEqual(["langkaia", "akershus", "radhuset", "slottet", "holmenkollen"]);
    expect(p.bracteates).toEqual(["langkaia", "slottet"]);
    expect(p.best).toEqual({ slottet: 70100, holmenkollen: 66000 });
    expect(p.skilling).toEqual({ slottet: 40 });
    expect(p.clean).toEqual(["slottet"]);
    // Written back, it carries the mark: a new best on the long Langkaia stays.
    const again = clearLevel(p, "langkaia", 75000, false, { skilling: 50, clean: true });
    expect(again.newBest).toBe(true);
    const stored = writeProgress(again.progress);
    expect(JSON.parse(stored).v).toBe(PROGRESS_VERSION);
    const read = readProgress(stored);
    expect(read.best.langkaia).toBe(75000);
    expect(read.skilling.langkaia).toBe(50);
    expect(read.clean).toContain("langkaia");
    expect(readProgress(writeProgress(read))).toEqual(read);
  });

  test("a version mark that is not a number counts as an old save", () => {
    const p = readProgress(JSON.stringify({ v: "2", cleared: ["langkaia"], best: { langkaia: 41300 } }));
    expect(p.cleared).toEqual(["langkaia"]);
    expect(p.best).toEqual({});
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

describe("line 2 beside a save from line 1", () => {
  // A save as the game writes it today (14 November 2026), from a visitor who has all ten runes of
  // line 1, some bracteates, best times, skilling and clean marks.
  const today = JSON.stringify({
    v: 2,
    cleared: ["langkaia", "akershus", "radhuset", "slottet", "holmenkollen", "akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"],
    best: { langkaia: 61600, akershus: 57400, radhuset: 77100, slottet: 61300, holmenkollen: 44100, akerselva: 65500, nordmarka: 60600, stortinget: 63000, ekeberg: 63000, nabolaget: 83200 },
    bracteates: ["langkaia", "radhuset", "nordmarka"],
    skilling: { langkaia: 60, nabolaget: 71 },
    clean: ["slottet", "holmenkollen"]
  });

  test("a visitor with ten runes keeps everything, and line 2 is open for him at Bygdøy", () => {
    const p = readProgress(today);
    expect(writeProgress(p)).toBe(today);
    expect(allRunes(p, LINE_1)).toBe(true);
    expect(hasPole(p)).toBe(true);
    expect(isOpen(p, ORDER16, LINE_2_AT)).toBe(true);
    expect(isOpen(p, ORDER16, LINE_2_AT + 1)).toBe(false);
    // On the map he arrives at Bygdøy, the furthest open station among the built ones.
    expect(ORDER16[furthestOpen(p, ORDER16, 11)]).toBe("bygdoy");
    expect(ORDER16[furthestOpen(p, ORDER16, 10)]).toBe("nabolaget");
  });

  test("line 2's runes are kept beside line 1's, and do not count towards the ten", () => {
    let p = readProgress(today);
    p = clearLevel(p, "bygdoy", 58000, true, { skilling: 50, clean: true }).progress;
    const again = readProgress(writeProgress(p));
    expect(again.cleared.slice(0, 10)).toEqual(LINE_1);
    expect(again.cleared).toContain("bygdoy");
    expect(again.best.nabolaget).toBe(83200);
    expect(again.best.bygdoy).toBe(58000);
    expect(again.bracteates).toEqual(["langkaia", "radhuset", "nordmarka", "bygdoy"]);
    expect(allRunes(again, LINE_1)).toBe(true);
    expect(allRunes(again, LINE_2)).toBe(false);
    expect(isOpen(again, ORDER16, LINE_2_AT + 1)).toBe(true);
  });

  test("with nine runes of line 1, line 2 stays closed", () => {
    const nine = readProgress(JSON.stringify({ ...JSON.parse(today), cleared: LINE_1.slice(0, 9) }));
    expect(isOpen(nine, ORDER16, LINE_2_AT)).toBe(false);
  });
});
