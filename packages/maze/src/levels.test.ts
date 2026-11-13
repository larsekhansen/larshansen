import { describe, expect, test } from "bun:test";
import { TILE } from "@larshansen/pixelkit/config";
import { COLS, LEVELS, PORTAL_PAIRS, ROWS, centreOf, findTiles, finishOf, isWall, mapInfo, ravenTile, startCentre, startOf, tileAt } from "./levels";
import { BODY, SNAKE_LONG, newState, sliderAt, touchesSnake } from "./rules";

/** Floor tiles reachable from the start pad, four ways. Gates are wall unless `gatesOpen`; crumbling floor counts as floor; teleport stones are floor unless `portals`, when they lead to their twins. */
function reach(map: readonly string[], gatesOpen = true, portals = false) {
  const s = startOf(map);
  const seen = new Set<string>([`${s.c},${s.r}`]);
  const todo = [[s.c, s.r]];
  const twins = new Map(mapInfo(map).portals.map((p) => [`${p.c},${p.r}`, p.twin]));
  while (todo.length) {
    const [c, r] = todo.pop()!;
    const next = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => [c + dc, r + dr]);
    const twin = portals ? twins.get(`${c},${r}`) : undefined;
    if (twin) next.push([twin.c, twin.r]);
    for (const [nc, nr] of next) {
      const key = `${nc},${nr}`;
      if (seen.has(key) || isWall(map, nc, nr) || (!gatesOpen && tileAt(map, nc, nr) === "g")) continue;
      seen.add(key);
      todo.push([nc, nr]);
    }
  }
  return seen;
}

/** The narrowest the screen gets, in art pixels from him to its nearer edge (a phone held upright shows about 120 across). */
const SIGHT = 56;
/** Steps a visitor gets, at the least, between a snake coming into sight and it reaching him. */
const REACT = 30;

describe.each(LEVELS.map((l, i) => [i + 1, l] as const))("level %d", (_n, level) => {
  const { map } = level;

  test("is 32 x 20 and only uses known letters", () => {
    expect(map.length).toBe(ROWS);
    for (const row of map) {
      expect(row.length).toBe(COLS);
      expect(row).toMatch(/^[#.SFokgctuvw]+$/);
    }
  });

  test("teleport stones come in whole pairs, on tiles nothing else uses", () => {
    for (const [a, b] of PORTAL_PAIRS) {
      const n = findTiles(map, a).length;
      expect(n).toBeLessThanOrEqual(1);
      expect(findTiles(map, b).length).toBe(n);
    }
    for (const p of mapInfo(map).portals) expect(sliderAt(level, p.c, p.r)).toBeUndefined();
  });

  test("a body fits everywhere: no two floor tiles meet only at a corner", () => {
    const open = (c: number, r: number) => !isWall(map, c, r);
    for (let r = 0; r + 1 < ROWS; r++)
      for (let c = 0; c + 1 < COLS; c++) {
        const pinch = (open(c, r) && open(c + 1, r + 1) && !open(c + 1, r) && !open(c, r + 1)) || (open(c + 1, r) && open(c, r + 1) && !open(c, r) && !open(c + 1, r + 1));
        if (pinch) throw new Error(`a corner-only pass at ${c},${r}`);
      }
  });

  test("no snake is faster than he can see it coming", () => {
    for (const s of level.snakes) {
      const len = Math.hypot(s.to[0] - s.from[0], s.to[1] - s.from[1]) * TILE;
      const fastest = (Math.PI * len) / s.period; // the eased patrol's top speed, in art pixels per step
      expect((SIGHT - SNAKE_LONG / 2 - BODY / 2) / fastest).toBeGreaterThanOrEqual(REACT);
    }
  });

  test("waking at a stone or the start pad, or arriving by teleport, is always safe", () => {
    const spots = [startCentre(map), ...findTiles(map, "o").map((o) => centreOf(o.c, o.r)), ...mapInfo(map).portals.map((p) => centreOf(p.c, p.r))];
    const s = newState(LEVELS.indexOf(level) + 1);
    for (const at of spots) {
      expect(sliderAt(level, Math.floor(at.x / TILE), Math.floor(at.y / TILE))).toBeUndefined();
      for (const sn of s.snakes)
        for (let t = 0; t < sn.def.period; t++) if (touchesSnake({ def: sn.def, t }, at.x, at.y)) throw new Error(`a snake reaches ${at.x},${at.y} at ${t}`);
    }
  });

  test("dark levels hide nothing that moves", () => {
    if (!level.dark) return;
    expect(level.snakes.length).toBe(0);
    expect(level.sliders.length).toBe(0);
  });

  test("teleports only make a way shorter: every stone and the finish are reached without them", () => {
    const without = reach(map);
    const withThem = reach(map, true, true);
    for (const key of withThem) expect(without.has(key)).toBe(true);
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
    expect(LEVELS.map((l) => l.snakes.length)).toEqual([0, 4, 0, 0, 0, 0, 4]);
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

  test("levels 2 and 5 have a pair of teleport stones, each end in a pocket off the way through", () => {
    expect(LEVELS.map((l) => mapInfo(l.map).portals.length)).toEqual([0, 2, 0, 0, 2, 0, 0]);
    for (const l of LEVELS)
      for (const p of mapInfo(l.map).portals) {
        // A pocket: floor on one side only, so walking past never steps on it by accident.
        const open = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dc, dr]) => !isWall(l.map, p.c + dc, p.r + dr)).length;
        expect(open).toBe(1);
      }
  });

  test("outside the map is wall", () => {
    expect(tileAt(LEVELS[0].map, -1, 5)).toBe("#");
    expect(tileAt(LEVELS[0].map, 32, 15)).toBe("#");
    expect(tileAt(LEVELS[0].map, 5, 20)).toBe("#");
  });
});
