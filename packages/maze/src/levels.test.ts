import { describe, expect, test } from "bun:test";
import { COLS, LEVELS, ROWS, findTiles, finishOf, isWall, ravenTile, startOf, tileAt } from "./levels";

/** Floor tiles reachable from the start pad, four ways. */
function reach(map: readonly string[]) {
  const s = startOf(map);
  const seen = new Set<string>([`${s.c},${s.r}`]);
  const todo = [[s.c, s.r]];
  while (todo.length) {
    const [c, r] = todo.pop()!;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const key = `${c + dc},${r + dr}`;
      if (seen.has(key) || isWall(map, c + dc, r + dr)) continue;
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
      expect(row).toMatch(/^[#.SFo]+$/);
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
  test("there are three, and only the second has snakes", () => {
    expect(LEVELS.map((l) => l.name)).toEqual(["Inngangen", "Ormegropa", "Jernporten"]);
    expect(LEVELS.map((l) => l.snakes.length)).toEqual([0, 4, 0]);
  });

  test("outside the map is wall", () => {
    expect(tileAt(LEVELS[0].map, -1, 5)).toBe("#");
    expect(tileAt(LEVELS[0].map, 32, 15)).toBe("#");
    expect(tileAt(LEVELS[0].map, 5, 20)).toBe("#");
  });
});
