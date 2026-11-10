import { describe, expect, test } from "bun:test";
import { COLS, LEVELS, ROWS, findTiles, finishOf, isWall, ravenTile, startOf, tileAt } from "./levels";

/** Floor tiles reachable from the start pad, four ways. Gates are wall unless `gatesOpen`; crumbling floor counts as floor. */
function reach(map: readonly string[], gatesOpen = true) {
  const s = startOf(map);
  const seen = new Set<string>([`${s.c},${s.r}`]);
  const todo = [[s.c, s.r]];
  while (todo.length) {
    const [c, r] = todo.pop()!;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${c + dc},${r + dr}`;
      if (seen.has(key) || isWall(map, c + dc, r + dr) || (!gatesOpen && tileAt(map, c + dc, r + dr) === "g")) continue;
      seen.add(key);
      todo.push([c + dc, r + dr]);
    }
  }
  return seen;
}

describe.each(LEVELS.map((l, i) => [i + 1, l] as const))("level %d", (_n, level) => {
  const { map } = level;

  test("is 32 x 20 and only uses known letters", () => {
    expect(map.length).toBe(ROWS);
    for (const row of map) {
      expect(row.length).toBe(COLS);
      expect(row).toMatch(/^[#.SFokgc]+$/);
    }
  });

  test("has a 2 x 2 start pad and a 2 x 2 finish", () => {
    for (const ch of ["S", "F"]) {
      expect(findTiles(map, ch).length).toBe(4);
      const { c, r } = ch === "S" ? startOf(map) : finishOf(map);
      for (const [dc, dr] of [[0, 0], [1, 0], [0, 1], [1, 1]]) expect(tileAt(map, c + dc, r + dr)).toBe(ch);
    }
  });

  test("the finish and every standing stone can be reached from the start", () => {
    const seen = reach(map);
    const f = finishOf(map);
    expect(seen.has(`${f.c},${f.r}`)).toBe(true);
    for (const o of findTiles(map, "o")) expect(seen.has(`${o.c},${o.r}`)).toBe(true);
  });

  test("with the gate shut the key is reachable and the finish is not", () => {
    const keys = findTiles(map, "k");
    const gates = findTiles(map, "g");
    expect(keys.length).toBe(gates.length ? 1 : 0);
    if (!gates.length) return;
    const seen = reach(map, false);
    expect(seen.has(`${keys[0].c},${keys[0].r}`)).toBe(true);
    const f = finishOf(map);
    expect(seen.has(`${f.c},${f.r}`)).toBe(false);
  });

  test("every slider lies on floor and has an even period", () => {
    for (const s of level.sliders) {
      expect(s.period % 2).toBe(0);
      for (let r = s.at[1]; r < s.at[1] + s.h; r++) for (let c = s.at[0]; c < s.at[0] + s.w; c++) expect(tileAt(map, c, r)).toBe(".");
    }
  });

  test("every snake's line lies on floor", () => {
    for (const s of level.snakes) {
      const [c0, r0] = s.from;
      const [c1, r1] = s.to;
      expect(c0 === c1 || r0 === r1).toBe(true);
      for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) expect(isWall(map, c, r)).toBe(false);
    }
  });

  test("the raven has a wall with floor below it", () => {
    const { c, r } = ravenTile(map);
    expect(isWall(map, c, r)).toBe(true);
    expect(isWall(map, c, r + 1)).toBe(false);
  });
});

describe("the levels", () => {
  test("there are seven, with their snakes, sliders and darkness where they belong", () => {
    expect(LEVELS.map((l) => l.name)).toEqual(["Inngangen", "Ormegropa", "Jernporten", "Råttent gulv", "Skyveveggene", "Mørket", "Haugbonden"]);
    expect(LEVELS.map((l) => l.snakes.length)).toEqual([0, 4, 0, 0, 0, 0, 2]);
    expect(LEVELS.map((l) => l.sliders.length)).toEqual([0, 0, 0, 0, 7, 0, 1]);
    expect(LEVELS.map((l) => !!l.dark)).toEqual([false, false, false, false, false, true, false]);
  });

  test("levels 3 and 7 have a key and a gate, level 4 and 7 crumbling floor", () => {
    expect(LEVELS.map((l) => findTiles(l.map, "k").length)).toEqual([0, 0, 1, 0, 0, 0, 1]);
    expect(LEVELS.map((l) => findTiles(l.map, "g").length > 0)).toEqual([false, false, true, false, false, false, true]);
    expect(LEVELS.map((l) => findTiles(l.map, "c").length > 0)).toEqual([false, false, false, true, false, false, true]);
    expect(findTiles(LEVELS[2].map, "k")).toEqual([{ c: 15, r: 10 }]);
    expect(findTiles(LEVELS[2].map, "g")).toEqual([{ c: 29, r: 13 }, { c: 30, r: 13 }]);
  });

  test("outside the map is wall", () => {
    expect(tileAt(LEVELS[0].map, -1, 5)).toBe("#");
    expect(tileAt(LEVELS[0].map, 32, 15)).toBe("#");
    expect(tileAt(LEVELS[0].map, 5, 20)).toBe("#");
  });
});
