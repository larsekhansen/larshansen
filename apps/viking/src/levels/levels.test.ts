import { beforeAll, describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { createBody, stepBody } from "@larshansen/pixelkit/physics";
import { fire } from "@larshansen/pixelkit/launcher";
import { cannonRide, carrier, cx, feet, jump, leap, mid, on, playMoves, tile, wait, walk, type Move } from "../game/bot";
import { KIND } from "../game/enemies";
import { benchesOf, cannonsOf, flagsOf, levelMap, newPlay, stepPlay } from "../game/play";
import { fresh } from "../game/progress";
import { HOLMENKOLLEN } from "./holmenkollen";
import { HOLMENKOLLEN_ROUTE, SLOTTET_ROUTE } from "./routes";
import { SLOTTET } from "./slottet";
import { AKERSHUS, HOIST } from "./akershus";
import { BUILT, LINE, ORDER } from "./index";
import { kartDef } from "./kart";
import { LANGKAIA, RAFTS } from "./langkaia";
import { BELLS, FERRY, LIFT, RADHUSET } from "./radhuset";
import { MARKS, type LevelDef } from "./types";

// The built levels: their maps make sense, a scripted player clears each with the front page's
// single jump (raising every flag, without a fall, and from level 4 on without losing a heart), the
// gold bracteate needs the raven's feather, and the things that move do what the levels promise.
// Levels 4 and 5 are held to the order's measure of a level: 220 to 280 columns, a minute or more
// to clear, 40 to 80 skilling, eight to twenty enemies, one brown cheese, a bench or two, two to
// four signs, and no enemy at a flag or a bench.

const IDLE = { left: false, right: false, jumpHeld: false, jumpPressed: false };

/** The route through each level, as a scripted player plays it. */
const ROUTE: Record<string, Move[]> = {
  langkaia: [
    walk(tile(46) + 4),
    leap(tile(48), 1),
    walk(tile(50) + 8),
    leap(tile(54), 1),
    walk(tile(57) + 8),
    wait("raft 3 near", (q) => carrier(q, RAFTS[4]).x <= 1020),
    leap(tile(61), 1),
    wait("raft 3 far", (q) => carrier(q, RAFTS[4]).x >= 1072),
    leap((q) => carrier(q, RAFTS[4]).x + 4 * 16, 1),
    walk(1272),
    jump(0),
    walk(1270),
    leap(tile(81), 1),
    jump(0),
    walk(mid(82)),
    jump(0)
  ],
  akershus: [
    walk(mid(16) + 4),
    jump(0),
    jump(0),
    jump(0),
    jump(1, { hold: 20 }),
    walk(mid(28)),
    cannonRide(1),
    walk(tile(49) - 20),
    leap(tile(50), 1),
    walk(tile(56) - 30),
    leap(tile(57), 1),
    walk(mid(65)),
    wait("the hoist down", (q) => carrier(q, HOIST).y >= HOIST.bottom - 2),
    cannonRide(1),
    walk(mid(88)),
    jump(0),
    walk(tile(89) - 8),
    leap(tile(90), 1),
    walk(tile(93)),
    leap(tile(92), -1),
    walk(tile(88)),
    leap(tile(90), 1),
    walk(mid(96)),
    jump(0)
  ],
  radhuset: [
    walk(tile(11) - 6),
    wait("the ferry at the quay", (q) => carrier(q, FERRY).x <= 180),
    jump(1, { release: 8 }),
    wait("the ferry across", (q) => carrier(q, FERRY).x >= 396),
    walk(mid(31)),
    walk(mid(48)),
    wait("the lift down", (q) => carrier(q, LIFT).y >= LIFT.bottom),
    walk(mid(51)),
    wait("the lift up", (q) => carrier(q, LIFT).y <= LIFT.top),
    walk(mid(60)),
    walk(BELLS[0].x + 16),
    wait("bell 0", (q) => on(q, 0)),
    jump(0),
    ...[1, 2, 3, 4].flatMap((i) => [walk(BELLS[i - 1].x + BELLS[i - 1].w - 6), wait(`bell ${i}`, (q) => on(q, i)), jump(1, { release: 16 })]),
    walk(BELLS[4].x + 28),
    jump(1, { release: 8 }),
    jump(0),
    jump(1, { release: 12 }),
    walk(mid(91)),
    jump(0)
  ],
  slottet: SLOTTET_ROUTE,
  holmenkollen: HOLMENKOLLEN_ROUTE
};

/** The way to each level's bracteate with the feather, from the start. */
const GOLD: Record<string, Move[]> = {
  langkaia: [walk(mid(2)), jump(0, { second: 18 })],
  akershus: [...ROUTE.akershus.slice(0, -2), walk(mid(94) + 4), jump(0, { second: 18 })],
  radhuset: [...ROUTE.radhuset.slice(0, 9), jump(1, { second: 14 }), walk(mid(60))],
  // From the balcony's left end, two jumps up past the rune to the eaves; along to the flagpole and up.
  slottet: [...SLOTTET_ROUTE.slice(0, -2), walk(tile(227) + 6), jump(0, { second: 18 }), walk(mid(229)), jump(0)],
  // In the hut, up through its roof, then two jumps up the tower.
  holmenkollen: [...HOLMENKOLLEN_ROUTE.slice(0, -1), walk(mid(210)), jump(0), jump(0, { second: 18 })]
};

/** The first three levels: the scripted player has half the order's target. From level 4 on: at least a minute. */
const TARGET: Record<string, number> = { langkaia: 60, akershus: 90, radhuset: 120 };
const NEW = new Set(["slottet", "holmenkollen"]);

describe("the line", () => {
  test("ten levels, one per rune of LARS HANSEN, three built", () => {
    expect(LINE.map((l) => "LARSHANSEN"[l.rune]).join("")).toBe("LARSHANSEN");
    expect(BUILT.map((l) => l.id)).toEqual(["langkaia", "akershus", "radhuset", "slottet", "holmenkollen"]);
    expect(new Set(ORDER).size).toBe(10);
  });

  test("the line map has a station for each, the mound, and Hjem", () => {
    const def = kartDef(fresh());
    const map = levelMap(def);
    for (const d of def.doors) expect(map.find(d.tile).length).toBe(1);
    expect(def.doors.map((d) => d.id)).toEqual(["home", "maze", ...ORDER]);
  });
});

/** The built levels, imported here as they are, not through the page's loaders. */
const LEVELS: LevelDef[] = [LANGKAIA, AKERSHUS, RADHUSET, SLOTTET, HOLMENKOLLEN];

test("the line's stations say the same as the built levels themselves", () => {
  for (const def of LEVELS) {
    const st = LINE.find((l) => l.id === def.id)!;
    expect(st.built).toBe(true);
    expect([st.rune, st.name, st.place]).toEqual([def.rune, def.name, def.place]);
  }
});

for (const def of LEVELS) {
  describe(def.name, () => {
    const map = levelMap(def);
    const known = new Set([".", ...def.legend.solid, ...def.legend.oneWay, ...def.legend.water, ...Object.values(MARKS), ...def.doors.map((d) => d.tile)]);

    test("its map: rectangular, one start, one rune, one bracteate, its doors, no letter it does not know", () => {
      for (const row of def.map) expect(row.length).toBe(def.map[0].length);
      expect(map.find(MARKS.start).length).toBe(1);
      expect(map.find(MARKS.rune).length).toBe(1);
      expect(map.find(MARKS.bracteate).length).toBe(1);
      for (const d of def.doors) expect(map.find(d.tile).length).toBe(1);
      expect(def.doors.some((d) => d.id === "tbane" && d.href === "#kart")).toBe(true);
      const unknown = [...new Set(def.map.join(""))].filter((ch) => !known.has(ch));
      expect(unknown).toEqual([]);
      expect(map.find(MARKS.sign).length).toBe(def.signs.length);
      expect(cannonsOf(def, map).length).toBe(def.cannons.length);
    });

    test("every sign speaks both languages, in two lines at most", () => {
      for (const s of def.signs) {
        expect(s.lines.nb.length).toBeGreaterThan(0);
        expect(s.lines.en.length).toBe(s.lines.nb.length);
        expect(s.lines.nb.length).toBeLessThanOrEqual(2);
      }
    });

    test(NEW.has(def.id) ? "a scripted player clears it with one jump, raising every flag, losing no heart, in a minute or more" : `a scripted player clears it with one jump, raising every flag, inside ${TARGET[def.id]} seconds`, () => {
      const p = newPlay(def);
      const r = playMoves(p, ROUTE[def.id], { max: 60 * 300 });
      expect(r.stuck).toBeNull();
      expect(r.done).toBe(true);
      expect(p.runeAt).not.toBeNull();
      expect(r.events.filter((e) => e.splash).length).toBe(0);
      expect(r.events.filter((e) => e.flag !== null).map((e) => e.flag)).toEqual(flagsOf(map).map((_, i) => i));
      if (NEW.has(def.id)) {
        expect(r.hurt).toEqual([]);
        expect(r.seconds).toBeGreaterThanOrEqual(60);
        expect(r.seconds).toBeLessThan(150);
        console.log(`${def.name}: scripted clear ${r.seconds.toFixed(1)} s, ${p.found} of ${p.skilling.length} skilling on the way`);
      } else expect(r.seconds).toBeLessThan(TARGET[def.id] / 2);
    });

    test("with the feather the bracteate can be reached", () => {
      const p = newPlay(def, { feather: true });
      const r = playMoves(p, GOLD[def.id], { until: (q) => q.bracteateAt !== null });
      expect(r.stuck).toBeNull();
      expect(p.bracteateAt).not.toBeNull();
    });

    test("without it the bracteate cannot be reached at all, with the ski pole or not (a search with every moving thing everywhere at once and every enemy a trampoline)", () => {
      const r = reach.get(def.id)!;
      expect(r.bracteate).toBe(false);
      // The search plays from where he can stand, at walking speed: it finds the rune where no speed
      // is needed to get there. Holmenkollen's needs the inrun's speed, which the scripted player shows.
      if (def.id !== "holmenkollen") expect(r.rune).toBe(true);
    });

    if (NEW.has(def.id))
      test("it is a level the size the order asks: columns, skilling, enemies, cheese, benches, signs, flags", () => {
        expect(map.cols).toBeGreaterThanOrEqual(220);
        expect(map.cols).toBeLessThanOrEqual(280);
        const skilling = map.find(MARKS.skilling).length;
        expect(skilling).toBeGreaterThanOrEqual(40);
        expect(skilling).toBeLessThanOrEqual(80);
        expect(map.find(MARKS.cheese).length).toBe(1);
        const benches = benchesOf(map);
        expect(benches.length).toBeGreaterThanOrEqual(1);
        expect(benches.length).toBeLessThanOrEqual(2);
        expect(def.signs.length).toBeGreaterThanOrEqual(2);
        expect(def.signs.length).toBeLessThanOrEqual(4);
        const enemies = def.enemies ?? [];
        expect(enemies.length).toBeGreaterThanOrEqual(8);
        expect(enemies.length).toBeLessThanOrEqual(20);
        expect(flagsOf(map).length).toBeGreaterThanOrEqual(2);
        // No enemy's patrol comes within three tiles of a flag or a bench.
        const spots = [...flagsOf(map), ...benches];
        for (const e of enemies) {
          const x = e.c * TILE + TILE / 2;
          const reachX = ((e.range ?? 0) + 3) * TILE;
          for (const f of spots) if (Math.abs(f.bottom - (e.r + 1) * TILE) < 3 * TILE) expect({ enemy: e.c, near: Math.abs(f.x - x) > reachX }).toEqual({ enemy: e.c, near: true });
        }
        // Every kind in it has a drawing of its own size.
        for (const e of enemies) expect(KIND[e.kind]).toBeDefined();
      });
  });
}

/** The reach searches, one worker per level, side by side: the slowest is what the suite waits for. */
const reach = new Map<string, { rune: boolean; bracteate: boolean; spots: number; ms: number }>();
beforeAll(async () => {
  const results = await Promise.all(
    LEVELS.map(
      (def) =>
        new Promise<{ id: string; rune: boolean; bracteate: boolean; spots: number; ms: number }>((resolve, reject) => {
          const w = new Worker(new URL("../game/reach.worker.ts", import.meta.url).href);
          w.onmessage = (e) => {
            resolve(e.data);
            w.terminate();
          };
          w.onerror = (e) => reject(e);
          w.postMessage(def.id);
        })
    )
  );
  for (const r of results) reach.set(r.id, r);
}, 240000);

describe("what the levels promise", () => {
  test("Langkaia: the water puts him back on the last ground he stood on, as the old fjord did", () => {
    const p = newPlay(LANGKAIA);
    playMoves(p, [walk(tile(47) + 6)]);
    for (let i = 0; i < 80; i++) {
      const ev = stepPlay(p, { ...IDLE, right: true });
      if (ev.splash) break;
    }
    expect(p.body.onGround).toBe(true);
    expect(Math.abs(cx(p) - (tile(47) + 6))).toBeLessThan(24);
    expect(feet(p)).toBe(tile(16));
  });

  test("Akershus: the first cannon cannot miss", () => {
    const l = cannonsOf(AKERSHUS)[0];
    const b = createBody(0, 0);
    fire(l, b);
    for (let i = 0; i < 200 && !(b.onGround && i > 2); i++) stepBody(b, IDLE, levelMap(AKERSHUS));
    expect(b.y + PLAYER.h).toBe(tile(14));
    expect(b.x + PLAYER.w / 2).toBeGreaterThan(tile(40));
  });

  test("Akershus: fired while the hoist is up, he hits it and the moat puts him back at the flag", () => {
    const p = newPlay(AKERSHUS);
    const route = ROUTE.akershus;
    const upTo = route.findIndex((m) => m.name === "the hoist down");
    playMoves(p, [...route.slice(0, upTo), wait("the hoist at the top", (q) => carrier(q, HOIST).y <= HOIST.top), cannonRide(1)], { max: 60 * 120 });
    expect(p.checkpoints.reached).toBe(0);
    expect(Math.abs(cx(p) - flagsOf(levelMap(AKERSHUS))[0].x)).toBeLessThan(2);
  });

  test("Rådhuset: a bell rings when he lands on it, and gone it drops him on the roof below, not in the water", () => {
    const p = newPlay(RADHUSET);
    const route = ROUTE.radhuset;
    const at = route.findIndex((m) => m.name === "bell 0");
    const r = playMoves(p, route.slice(0, at + 2), { max: 60 * 120 });
    expect(r.events.some((e) => e.bell === 0)).toBe(true);
    let splash = false;
    for (let i = 0; i < 400; i++) splash = stepPlay(p, IDLE).splash || splash;
    expect(splash).toBe(false);
    expect(feet(p)).toBe(tile(18));
  });

  test("Rådhuset: neighbouring bells are both there for over a second, so a patient player can always go on", () => {
    for (let i = 1; i < BELLS.length; i++) {
      let bothThere = 0;
      for (let t = 0; t < 300; t++) {
        const there = (k: number) => (t + (BELLS[k].offset ?? 0) + 3000) % 300 < 180;
        if (there(i - 1) && there(i)) bothThere++;
      }
      expect(bothThere).toBeGreaterThanOrEqual(60);
    }
  });
});

// The levels compile to the defs the page shows; the plan's other seven are listed, not built.
test("the planned levels are on the line, not built", () => {
  expect(LINE.length).toBe(10);
  expect(LINE.filter((l) => l.built).length).toBe(5);
});
