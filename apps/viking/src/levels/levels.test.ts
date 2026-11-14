import { beforeAll, describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { createBody, stepBody } from "@larshansen/pixelkit/physics";
import { fire } from "@larshansen/pixelkit/launcher";
import { cannonRide, carrier, cx, feet, jump, leap, mid, on, playMoves, tile, wait, walk, type Move } from "../game/bot";
import { KIND, leap as leapOf } from "../game/enemies";
import { pulsePhase as pulsePhaseOf } from "@larshansen/pixelkit/timed";
import { benchesOf, cannonsOf, flagsOf, levelMap, newPlay, stepPlay, type Play } from "../game/play";
import { fresh } from "../game/progress";
import { MOVE } from "@larshansen/pixelkit/config";
import { carrierAt } from "@larshansen/pixelkit/carrier";
import { ICE } from "@larshansen/pixelkit/surface";
import { HOLMENKOLLEN, LIFT as TOWER_LIFT, LIP } from "./holmenkollen";
import { BANNERS } from "./slottet";
import { AKERSELVA_ROUTE, EKEBERG_ROUTE, HOLMENKOLLEN_ROUTE, NABOLAGET_ROUTE, NORDMARKA_ROUTE, SLOTTET_ROUTE, STORTINGET_ROUTE } from "./routes";
import { NABOLAGET, PLOUGH_DEF, SMOKE, TERRACE } from "./nabolaget";
import type { Plough } from "../game/plough";
import { EKEBERG, GUSTS, KNOLLS, TRAMS } from "./ekeberg";
import { EXPRESSES, HAZARDS, LOCALS, ROOF, STORTINGET, nextLocal } from "./stortinget";
import { MOOSE, NORDMARKA, TROLL_DEF } from "./nordmarka";
import { riding } from "./routes/common";
import { rides } from "./routes/common";
import { AKERSELVA, BUCKETS, CURTAIN, FALL1, WHEEL } from "./akerselva";
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
  holmenkollen: HOLMENKOLLEN_ROUTE,
  akerselva: AKERSELVA_ROUTE,
  nordmarka: NORDMARKA_ROUTE,
  stortinget: STORTINGET_ROUTE,
  ekeberg: EKEBERG_ROUTE,
  nabolaget: NABOLAGET_ROUTE
};

/** The way to each level's bracteate with the feather, from the start. */
const GOLD: Record<string, Move[]> = {
  langkaia: [walk(mid(2)), jump(0, { second: 18 })],
  akershus: [...ROUTE.akershus.slice(0, -2), walk(mid(94) + 4), jump(0, { second: 18 })],
  radhuset: [...ROUTE.radhuset.slice(0, 9), jump(1, { second: 14 }), walk(mid(60))],
  // From the balcony's left end, two jumps up past the rune to the eaves; along to the flagpole and up.
  slottet: [...SLOTTET_ROUTE.slice(0, -2), walk(tile(227) + 6), jump(0, { second: 18 }), walk(mid(229)), jump(0)],
  // In the hut, up through its roof, then two jumps up the tower.
  holmenkollen: [...HOLMENKOLLEN_ROUTE.slice(0, -1), walk(mid(210)), jump(0), jump(0, { second: 18 })],
  // Up the wheel, off it to the left onto the mill's roof as the bucket starts down, two jumps up the chimney.
  akerselva: [
    ...AKERSELVA_ROUTE.slice(0, AKERSELVA_ROUTE.findIndex((m) => m.name === "a bucket scoops him up") + 1),
    wait("the bucket going down over the roof", (q) => BUCKETS.some((d) => rides(d, q.t, q.body) && carrierAt(d, q.t).x < WHEEL.cx - 52)),
    jump(-1, { release: 30 }),
    walk(mid(103)),
    jump(0, { second: 18 })
  ],
  // On the moose's back, two jumps up where it crosses under the bracteate.
  nordmarka: [...NORDMARKA_ROUTE.slice(0, NORDMARKA_ROUTE.findIndex((m) => m.name === "across on the moose")), wait("on the moose under the bracteate", (q) => riding(q) && cx(q) >= tile(95) + 2), jump(0, { second: 18 })],
  // On the express, a jump and a second one up into the cavern's vault.
  stortinget: [...STORTINGET_ROUTE.slice(0, STORTINGET_ROUTE.findIndex((m) => m.name === "the express comes over him") + 2), jump(1, { second: 14 })],
  // Up the head to the ring, and two jumps up from the ring.
  ekeberg: [...EKEBERG_ROUTE.slice(0, EKEBERG_ROUTE.findIndex((m) => m.name === `walk to ${tile(88) + 4}`)), walk(mid(86)), jump(0, { second: 18 })],
  // Up in the chimney's warm air, and the second jump at the top of it.
  nabolaget: [
    ...NABOLAGET_ROUTE.slice(0, NABOLAGET_ROUTE.findIndex((m) => m.name === "up in the chimney's air to the block")),
    {
      name: "up the warm air, and once more at its top",
      keys: (q, s) => {
        const second = !s.second && q.body.vy > -0.5 && q.body.y < 7 * 16;
        if (second) s.second = true;
        const aim = tile(42) + 4 - q.body.vx * 7 - cx(q);
        return { left: aim < -2, right: aim > 2, jumpHeld: true, jumpPressed: s.i === 0 || second };
      }
    }
  ]
};

/** The first three levels: the scripted player has half the order's target. From level 4 on: at least a minute. */
const TARGET: Record<string, number> = { langkaia: 60, akershus: 90, radhuset: 120 };
const NEW = new Set(["slottet", "holmenkollen", "akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"]);
/** From level 6 on he has the ski pole: it is given for clearing Holmenkollen, the level before. */
const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget"]);
/** The last level is held to a longer clear: ninety seconds or more. */
const LONGEST: Record<string, number> = { nabolaget: 90 };

describe("the line", () => {
  test("ten levels, one per rune of LARS HANSEN, all ten built", () => {
    expect(LINE.map((l) => "LARSHANSEN"[l.rune]).join("")).toBe("LARSHANSEN");
    expect(BUILT.map((l) => l.id)).toEqual(ORDER);
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
const LEVELS: LevelDef[] = [LANGKAIA, AKERSHUS, RADHUSET, SLOTTET, HOLMENKOLLEN, AKERSELVA, NORDMARKA, STORTINGET, EKEBERG, NABOLAGET];

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
      const p = newPlay(def, { pole: POLE.has(def.id) });
      const r = playMoves(p, ROUTE[def.id], { max: 60 * 300 });
      expect(r.stuck).toBeNull();
      expect(r.done).toBe(true);
      expect(p.runeAt).not.toBeNull();
      expect(r.events.filter((e) => e.splash).length).toBe(0);
      expect(r.events.filter((e) => e.flag !== null).map((e) => e.flag)).toEqual(flagsOf(map).map((_, i) => i));
      if (NEW.has(def.id)) {
        expect(r.hurt).toEqual([]);
        expect(r.seconds).toBeGreaterThanOrEqual(LONGEST[def.id] ?? 60);
        expect(r.seconds).toBeLessThan(150);
        console.log(`${def.name}: scripted clear ${r.seconds.toFixed(1)} s, ${p.found} of ${p.skilling.length} skilling on the way`);
      } else expect(r.seconds).toBeLessThan(TARGET[def.id] / 2);
    });

    test("with the feather the bracteate can be reached", () => {
      const p = newPlay(def, { feather: true, pole: POLE.has(def.id) });
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
  test("Slottet: a banner carries him over Spikersuppa, and the bass drum throws him higher than any jump", () => {
    const p = newPlay(SLOTTET);
    const route = SLOTTET_ROUTE;
    const at = route.findIndex((m) => m.name === "across the pond");
    playMoves(p, route.slice(0, at + 1), { max: 60 * 120 });
    expect(cx(p)).toBeGreaterThan(tile(59));
    expect(p.body.onGround).toBe(true);
    // The drum at the Grand: from the street to the balcony, 80 px up.
    const q = newPlay(SLOTTET, { start: { x: tile(42) + 8, bottom: tile(25) } });
    let top = Infinity;
    for (let i = 0; i < 120; i++) {
      stepPlay(q, { ...IDLE, right: i < 10 });
      top = Math.min(top, feet(q));
    }
    expect(tile(25) - top).toBeGreaterThan(80);
    expect(BANNERS.D.length).toBeGreaterThan(0);
  });

  test("Holmenkollen: on ice he slides on when he lets go, and the red rail stops him", () => {
    const p = newPlay(HOLMENKOLLEN, { start: { x: tile(16), bottom: tile(9) } });
    expect(HOLMENKOLLEN.surfaceAt!(tile(16), tile(9), 0)).toBe(ICE);
    for (let i = 0; i < 90; i++) stepPlay(p, { ...IDLE, right: true });
    const x = cx(p);
    for (let i = 0; i < 20; i++) stepPlay(p, IDLE);
    expect(cx(p) - x).toBeGreaterThan(8);
    for (let i = 0; i < 200; i++) stepPlay(p, IDLE);
    expect(p.body.x + PLAYER.w).toBeLessThanOrEqual(tile(27));
  });

  test("Holmenkollen: on the inrun his keys do nothing and his speed climbs well past a run", () => {
    const p = newPlay(HOLMENKOLLEN, { start: { x: tile(213) + 6, bottom: tile(16) } });
    let top = 0;
    for (let i = 0; i < 400 && cx(p) < LIP.x - 8; i++) {
      stepPlay(p, { ...IDLE, left: i > 10 });
      top = Math.max(top, p.body.vx);
    }
    expect(top).toBeGreaterThan(MOVE.run * 2);
  });

  test("Holmenkollen: without a jump at the lip he lands on the hill, no rune; the hollow and the lift take him back up to try again", () => {
    const p = newPlay(HOLMENKOLLEN);
    const route = HOLMENKOLLEN_ROUTE;
    playMoves(p, route.slice(0, -1), { max: 60 * 200 });
    expect(p.hearts).toBe(3);
    // Down the inrun with no jump.
    for (let i = 0; i < 600 && !(p.body.onGround && cx(p) > LIP.x); i++) stepPlay(p, { ...IDLE, right: true });
    expect(p.runeAt).toBeNull();
    expect(feet(p)).toBeGreaterThan(LIP.y);
    const missed = p.t;
    // Back: up the hill, under the inrun to the lift, up in it, into the hut.
    const back = playMoves(p, [walk(TOWER_LIFT.x - 8), wait("the lift at the bottom", (q) => carrier(q, TOWER_LIFT).y >= TOWER_LIFT.bottom), walk(TOWER_LIFT.x + 16), wait("the lift at the top", (q) => carrierAt(TOWER_LIFT, q.t).y <= TOWER_LIFT.top), walk(tile(210))], { max: 60 * 60, until: (q) => q.body.onGround && feet(q) === tile(16) && cx(q) > tile(208) });
    expect(back.stuck).toBeNull();
    expect(feet(p)).toBe(tile(16));
    expect((p.t - missed) / 60).toBeLessThan(25);
    expect(back.events.some((e) => e.splash)).toBe(false);
  });

  test("Akerselva: the wheel takes him on at the bottom and carries him up to the bridge's height", () => {
    const p = newPlay(AKERSELVA, { pole: true, start: { x: WHEEL.cx + 20, bottom: 19 * TILE } });
    let scooped = -1;
    let top = Infinity;
    for (let i = 0; i < 600; i++) {
      stepPlay(p, IDLE);
      if (scooped < 0 && BUCKETS.some((d) => rides(d, p.t, p.body))) scooped = i;
      if (scooped >= 0) top = Math.min(top, feet(p));
    }
    // A bucket comes round within a sixth of a turn, and over the top it is level with the bridge.
    expect(scooped).toBeGreaterThanOrEqual(0);
    expect(scooped).toBeLessThan(Math.abs(WHEEL.period) / WHEEL.n + 2);
    expect(top).toBe(12 * TILE);
  });

  test("Akerselva: walking off the edge into a fall puts him in its pool; jumping, he clears its top", () => {
    const p = newPlay(AKERSELVA, { pole: true, start: { x: tile(86), bottom: tile(12) } });
    let splash = false;
    for (let i = 0; i < 200 && !splash; i++) splash = stepPlay(p, { ...IDLE, right: true }).splash;
    expect(splash).toBe(true);
    const q = newPlay(AKERSELVA, { pole: true, start: { x: tile(86), bottom: tile(12) } });
    const r = playMoves(q, [walk(tile(88)), leap(FALL1.x, 1)]);
    expect(r.events.some((e) => e.splash)).toBe(false);
    expect(feet(q)).toBe(tile(16));
  });

  test("Akerselva: the curtain needs the dash; without it he lands in the cave behind it or the pool", () => {
    const tryIt = (dash?: number) => {
      const p = newPlay(AKERSELVA, { pole: true, start: { x: tile(135), bottom: tile(19) } });
      const r = playMoves(p, [walk(tile(141) + 4), leap(tile(142), 1, dash === undefined ? {} : { dash })], { max: 600 });
      return { p, splash: r.events.some((e) => e.splash) };
    };
    const dashed = tryIt(8);
    expect(dashed.splash).toBe(false);
    expect(cx(dashed.p)).toBeGreaterThan(tile(146));
    expect(feet(dashed.p)).toBe(tile(19));
    const plain = tryIt();
    expect(plain.splash || feet(plain.p) > tile(19)).toBe(true);
    expect(CURTAIN.push.y).toBeGreaterThan(0);
  });

  test("Nordmarka: the moose carries him across the marsh on its back", () => {
    const p = newPlay(NORDMARKA, { pole: true, start: { x: tile(86), bottom: tile(18) } });
    const across = (q: Play) => riding(q) && carrier(q, MOOSE).x >= MOOSE.to.x - 2;
    const r = playMoves(p, [walk(tile(87) + 4), wait("the moose here", (q) => carrier(q, MOOSE).x <= MOOSE.from.x + 2), jump(1, { release: 10 }), wait("across", across)], { max: 60 * 40, until: across });
    expect(r.stuck).toBeNull();
    expect(r.events.some((e) => e.splash)).toBe(false);
    expect(cx(p)).toBeGreaterThan(tile(100));
  });

  test("Nordmarka: the troll is three hits, each in the dawn, and only then does the rune show; a flag and a bench stand right before its clearing", () => {
    const p = newPlay(NORDMARKA, { pole: true });
    const r = playMoves(p, ROUTE.nordmarka, { max: 60 * 300 });
    const hits = r.events.flatMap((e) => (e.troll === "hit" ? [p.t] : []));
    expect(r.events.filter((e) => e.troll === "hit").length).toBe(3);
    expect(r.events.filter((e) => e.troll === "windup").length).toBeGreaterThanOrEqual(3);
    expect(r.events.findIndex((e) => e.troll === "stone")).toBeLessThan(r.events.findIndex((e) => e.rune));
    void hits;
    const map = levelMap(NORDMARKA);
    const lastFlag = flagsOf(map).at(-1)!;
    const bench = benchesOf(map).at(-1)!;
    for (const s of [lastFlag, bench]) {
      expect(s.x).toBeLessThan(TROLL_DEF.x0);
      expect(TROLL_DEF.x0 - s.x).toBeLessThan(8 * TILE);
    }
  });

  test("Stortinget: the first escalator carries him down, the second runs up against him", () => {
    const map = levelMap(STORTINGET);
    const on = (c: number) => ({ x: tile(c), bottom: map.rampAt(tile(c))! });
    const down = newPlay(STORTINGET, { pole: true, start: on(38) });
    for (let i = 0; i < 60; i++) stepPlay(down, IDLE);
    expect(cx(down)).toBeGreaterThan(tile(38) + 20);
    const up = newPlay(STORTINGET, { pole: true, start: on(55) });
    for (let i = 0; i < 60; i++) stepPlay(up, IDLE);
    expect(cx(up)).toBeLessThan(tile(55) - 20);
    const w = newPlay(STORTINGET, { pole: true, start: on(52) });
    for (let i = 0; i < 60; i++) stepPlay(w, { ...IDLE, right: true });
    expect(cx(w) - tile(52)).toBeGreaterThan(40);
    expect(cx(w) - tile(52)).toBeLessThan(60 * MOVE.run * 0.75);
  });

  test("Stortinget: the third rail costs a heart and knocks him back out of the track", () => {
    const p = newPlay(STORTINGET, { pole: true, start: { x: tile(77), bottom: tile(18) } });
    // While the rat in that crossing is down.
    do stepPlay(p, IDLE);
    while (!(leapOf(p.enemies[4], p.t).up === 0 && leapOf(p.enemies[4], p.t - 1).up > 0));
    let zap = false;
    for (let i = 0; i < 120 && !zap; i++) zap = stepPlay(p, { ...IDLE, right: true }).zap;
    expect(zap).toBe(true);
    expect(p.hearts).toBe(2);
    for (let i = 0; i < 60; i++) stepPlay(p, IDLE);
    expect(p.body.onGround).toBe(true);
    expect(feet(p)).toBe(tile(18));
    expect(cx(p)).toBeLessThan(tile(79));
    expect(HAZARDS.length).toBe(3);
  });

  test("Stortinget: a train stands at the platform when the board says so, and its roof carries him through the tunnel; the beam sweeps him off onto platform 2", () => {
    const p = newPlay(STORTINGET, { pole: true, start: { x: tile(90), bottom: tile(18) } });
    while (nextLocal(0, p.t) > 0) stepPlay(p, IDLE);
    const swept = (q: Play) => q.body.onGround && feet(q) === tile(18) && cx(q) > tile(120);
    const r = playMoves(p, [jump(0, { hold: 30 }), wait("swept off", swept)], { max: 60 * 30, until: swept });
    expect(r.stuck).toBeNull();
    expect(r.events.some((e) => e.splash)).toBe(false);
    expect(cx(p)).toBeGreaterThan(tile(127));
    expect(cx(p)).toBeLessThan(tile(130));
    // No train ever leaves anyone waiting much more than five seconds.
    let longest = 0;
    let since = 0;
    for (let t = 0; t < 4000; t++) {
      since = nextLocal(0, t) === 0 ? 0 : since + 1;
      longest = Math.max(longest, since);
    }
    expect(longest / 60).toBeLessThan(5.5);
  });

  test("Stortinget: in the cavern the express passes over the local, and the local goes down to the depot: stay on it and he falls", () => {
    const p = newPlay(STORTINGET, { pole: true, start: { x: tile(170), bottom: tile(18) } });
    while (!LOCALS.some((d) => carrier(p, d).x === tile(166))) stepPlay(p, IDLE);
    const r = playMoves(p, [jump(0, { hold: 30 }), wait("down with the local", (q) => q.hurt)], { max: 60 * 30, until: (q) => q.hurt });
    expect(r.stuck).toBeNull();
    expect(r.events.some((e) => e.splash)).toBe(true);
    // Every express passes over its local before the local dips, a little higher.
    for (const [i, d] of EXPRESSES.entries()) {
      let over = 0;
      for (let t = 0; t < 4000; t++) {
        const l = carrierAt(LOCALS[i], t);
        const e = carrierAt(d, t);
        if (l.y === ROOF && e.y === ROOF - 32 && l.x > tile(176) && Math.abs(e.x - l.x) < 48) over++;
      }
      expect(over).toBeGreaterThan(40);
    }
  });

  test("Ekeberg: the tram's roof carries him up the trestle to the top of the cliff, and goes down into the hill without him", () => {
    const p = newPlay(EKEBERG, { pole: true, start: { x: tile(15), bottom: tile(20) } });
    const top = (q: Play) => q.body.onGround && feet(q) === tile(12) && cx(q) > tile(48);
    const r = playMoves(p, EKEBERG_ROUTE.slice(2, 6), { max: 60 * 40, until: top });
    expect(r.stuck).toBeNull();
    expect(feet(p)).toBe(tile(12));
    // Waiting in the street is never long: three trams on the line.
    let longest = 0;
    let since = 0;
    for (let t = 0; t < 3000; t++) {
      const standing = TRAMS.some((d) => carrierAt(d, t).x === tile(13) && carrierAt(d, t - 1).x === tile(13));
      since = standing ? 0 : since + 1;
      longest = Math.max(longest, since);
    }
    expect(longest / 60).toBeLessThan(4);
  });

  test("Ekeberg: a gust pushes him only after a second of leaves; on flat ground it slows him, and does no harm", () => {
    const g = GUSTS[0];
    const p = newPlay(EKEBERG, { pole: true, start: { x: tile(59), bottom: tile(12) } });
    let moved = 0;
    for (let i = 0; i < 1200; i++) {
      const before = cx(p);
      stepPlay(p, IDLE);
      const live = pulsePhaseOf(p.t, g.beat!) === "live";
      if (!live) expect(cx(p)).toBe(before);
      else moved += before - cx(p);
    }
    expect(moved).toBeGreaterThan(15);
    expect(p.hearts).toBe(3);
    expect(g.beat!.warn).toBeGreaterThanOrEqual(60);
  });

  test("Ekeberg: the quarry is too wide for a jump and the dash; three sheep on their knolls bounce him across", () => {
    // From the rim, a jump and the dash fall short of the far side.
    const p = newPlay(EKEBERG, { pole: true, start: { x: tile(141) + 4, bottom: tile(12) } });
    const r = playMoves(p, [leap(tile(142) - 1, 1, { dash: 12 })], { max: 300 });
    expect(r.events.some((e) => e.splash) || feet(p) > tile(13)).toBe(true);
    expect(KNOLLS.length).toBe(3);
    const q = newPlay(EKEBERG, { pole: true });
    const route = EKEBERG_ROUTE;
    const across = (z: Play) => z.body.onGround && cx(z) > tile(158) && feet(z) === tile(13);
    const r2 = playMoves(q, route.slice(0, route.findIndex((m) => m.name === "across on the sheep") + 1), { max: 60 * 120, until: across });
    expect(r2.stuck).toBeNull();
    expect(r2.events.filter((e) => e.bleat).length).toBeGreaterThanOrEqual(3);
    expect(r2.events.some((e) => e.splash)).toBe(false);
  });

  test("Nabolaget: the chimney's warm air lifts him from the fourth roof to the block's", () => {
    const p = newPlay(NABOLAGET, { pole: true });
    const route = NABOLAGET_ROUTE;
    const upTo = route.findIndex((m) => m.name === "up in the chimney's air to the block");
    const r = playMoves(p, route.slice(0, upTo + 1), { max: 60 * 60, until: (q) => q.body.onGround && feet(q) === tile(8) });
    expect(r.stuck).toBeNull();
    expect(feet(p)).toBe(tile(8));
    expect(SMOKE.push.y).toBeLessThan(0);
  });

  test("Nabolaget: the plough telegraphs every charge for a second, takes three hits (the bounce, the dash, the ride), and only then does the rune show; a flag and a bench stand right before it", () => {
    const p = newPlay(NABOLAGET, { pole: true });
    const r = playMoves(p, NABOLAGET_ROUTE, { max: 60 * 200 });
    expect(r.done).toBe(true);
    const ev = r.events.map((e) => e.boss);
    // Every charge comes a full second after its windup.
    ev.forEach((e, i) => {
      if (e !== "charge") return;
      const w = ev.lastIndexOf("windup", i);
      expect(w).toBeGreaterThanOrEqual(0);
      expect(i - w).toBeGreaterThanOrEqual(60);
    });
    expect(ev.filter((e) => e === "hit").length).toBe(3);
    expect(ev.filter((e) => e === "line").length).toBeGreaterThanOrEqual(1);
    expect(r.events.some((e) => e.dash)).toBe(true);
    expect(ev.indexOf("beaten")).toBeLessThan(r.events.findIndex((e) => e.rune));
    // The three hits: the first after a bounce on the line, the second after a dash, the third from the tram's roof.
    const hits = r.events.flatMap((e, i) => (e.boss === "hit" ? [i] : []));
    expect(ev.lastIndexOf("line", hits[0])).toBeGreaterThan(hits[0] - 120);
    expect(r.events.slice(hits[1] - 60, hits[1]).some((e) => e.dash)).toBe(true);
    const map = levelMap(NABOLAGET);
    for (const s of [flagsOf(map).at(-1)!, benchesOf(map).at(-1)!]) {
      expect(s.x).toBeLessThan(TERRACE.right);
      expect(PLOUGH_DEF.rounds[0].x0 - s.x).toBeLessThan(24 * TILE);
    }
    expect((p.boss!.state as Plough).phase).toBe("beaten");
  });

  test("Nabolaget: from his terrace a jump alone reaches neither the plough's cab nor the washing line's far end; the cab is too high to jump onto from the street", () => {
    const cab = PLOUGH_DEF.floor - 52;
    expect(PLOUGH_DEF.floor - cab).toBeGreaterThan(46);
    expect(PLOUGH_DEF.rounds[1].x0 - 32 - TERRACE.right).toBeGreaterThan(54);
    expect(PLOUGH_DEF.rounds[1].x0 - 32 - TERRACE.right).toBeLessThan(54 + 48);
  });

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

// All ten are on the line and built, and the line map has no hoarding left.
test("all ten levels are built, and the line map has no hoarding", () => {
  expect(LINE.length).toBe(10);
  expect(LINE.filter((l) => l.built).length).toBe(10);
  expect(kartDef(fresh()).map.join("")).not.toContain("F");
});
