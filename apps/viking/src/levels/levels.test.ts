import { beforeAll, describe, expect, test } from "bun:test";
import { PLAYER, TILE } from "@larshansen/pixelkit/config";
import { createBody, stepBody } from "@larshansen/pixelkit/physics";
import { fire } from "@larshansen/pixelkit/launcher";
import { cannonRide, carrier, cx, feet, jump, jumpTo, leap, mid, playMoves, tile, wait, walk, type Move } from "../game/bot";
import { KIND, THROW_REACH, leap as leapOf } from "../game/enemies";
import { footOf } from "@larshansen/pixelkit/tilemap";
import { pulsePhase as pulsePhaseOf, timedPhase } from "@larshansen/pixelkit/timed";
import { benchesOf, cannonsOf, flagsOf, levelMap, newPlay, stepPlay, type Play } from "../game/play";
import { fresh } from "../game/progress";
import { MOVE } from "@larshansen/pixelkit/config";
import { carrierAt, carrierPeriod } from "@larshansen/pixelkit/carrier";
import { ICE } from "@larshansen/pixelkit/surface";
import { HOLMENKOLLEN, LIFT as TOWER_LIFT, LIP } from "./holmenkollen";
import { BANNERS } from "./slottet";
import { AKERSELVA_ROUTE, AKERSHUS_ROUTE, BYGDOY_ROUTE, EKEBERG_ROUTE, HOLMENKOLLEN_ROUTE, LANGKAIA_ROUTE, NABOLAGET_ROUTE, NORDMARKA_ROUTE, RADHUSET_ROUTE, SLOTTET_ROUTE, STORTINGET_ROUTE, VIGELANDSPARKEN_ROUTE, KORKETREKKEREN_ROUTE, OSTENSJOVANNET_ROUTE, BJORVIKA_ROUTE, GAMLEBYEN_ROUTE } from "./routes";
import { BARRIER, GAP, HAZARDS as RUN_HAZARDS, KORKETREKKEREN, RIDE, speedAt, trackY } from "./korketrekkeren";
import { follow } from "@larshansen/pixelkit/camera";
import { HERON, OSTENSJOVANNET, PADS as LILY_PADS, SWAN, W as LW, inStretch } from "./ostensjovannet";
import { BAY, BJORVIKA, F1 as BF1, F2 as BF2, GUSTS as BJ_GUSTS, HOIST as BJ_HOIST, HOOKS, SHAFTS, SHEETS, SPARKS } from "./bjorvika";
import type { Travel } from "@larshansen/pixelkit/carrier";
import { CLOSERS, GAMLEBYEN, GROUNDS as RUIN_GROUNDS, QUAY as GQ, SERPENT_DEF, STONES, STREET, TOWER, TOWN, WAKE, type Ruins } from "./gamlebyen";
import { BOY, ENEMIES as VIGELAND_ENEMIES, JET_IN, JET_OUT, SLAB, VIGELANDSPARKEN, W as VW } from "./vigelandsparken";
import { BYGDOY, FERRY, FRAM_DECK, GJOA_DECK, LOFT, OARS, PADS, RAFT as BALSA, REED, W } from "./bygdoy";
import { SHIELD_RULES } from "../game/shield";
import { deckTops } from "@larshansen/pixelkit/deck";
import { SINK } from "@larshansen/pixelkit/sink";
import { NABOLAGET, PLOUGH_DEF, SMOKE, TERRACE } from "./nabolaget";
import type { Plough } from "../game/plough";
import { EKEBERG, GUSTS, KNOLLS, TRAMS } from "./ekeberg";
import { EXPRESSES, HAZARDS, LOCALS, ROOF, STORTINGET, nextLocal } from "./stortinget";
import { MOOSE, NORDMARKA, TROLL_DEF } from "./nordmarka";
import { riding } from "./routes/common";
import { rides } from "./routes/common";
import { AKERSELVA, BUCKETS, CURTAIN, FALL1, WHEEL } from "./akerselva";
import { SLOTTET } from "./slottet";
import { AKERSHUS, BATTERY, HOIST } from "./akershus";
import { BUILT, LINE, LINE_1, LINE_2, ORDER } from "./index";
import { GATE_COL, LINE_1_END, STATIONS, kartDef, lineTwoOpen } from "./kart";
import { kartArt } from "./kartArt";
import { LANGKAIA, RAFT } from "./langkaia";
import { BELLS, CARILLON, CLOCK, HANDS, LOW_BELLS, POOL_BELLS, RADHUSET, SWING, SWING_ENDS } from "./radhuset";
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
  langkaia: LANGKAIA_ROUTE,
  akershus: AKERSHUS_ROUTE,
  radhuset: RADHUSET_ROUTE,
  slottet: SLOTTET_ROUTE,
  holmenkollen: HOLMENKOLLEN_ROUTE,
  akerselva: AKERSELVA_ROUTE,
  nordmarka: NORDMARKA_ROUTE,
  stortinget: STORTINGET_ROUTE,
  ekeberg: EKEBERG_ROUTE,
  nabolaget: NABOLAGET_ROUTE,
  bygdoy: BYGDOY_ROUTE,
  vigelandsparken: VIGELANDSPARKEN_ROUTE,
  korketrekkeren: KORKETREKKEREN_ROUTE,
  ostensjovannet: OSTENSJOVANNET_ROUTE,
  bjorvika: BJORVIKA_ROUTE,
  gamlebyen: GAMLEBYEN_ROUTE
};

/** The way to each level's bracteate with the feather, from the start. */
const GOLD: Record<string, Move[]> = {
  langkaia: [walk(mid(2)), jump(0, { second: 18 })],
  // From the last stretch of the battlements, beside the brazier, two jumps up the spire to its tip.
  akershus: [...AKERSHUS_ROUTE.slice(0, -2), walk(mid(261) + 6, { careless: true }), jump(0, { second: 18 })],
  // From the parapet, under the lantern, two jumps up past its roof.
  radhuset: [...RADHUSET_ROUTE.slice(0, -2), walk(mid(205)), jump(1, { second: 18 })],
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
  ],
  // On the longship's deck under its mast: two jumps up onto the yard, and two more up off it.
  bygdoy: [...BYGDOY_ROUTE.slice(0, BYGDOY_ROUTE.findIndex((m) => m.name === `walk to ${mid(198)}`)), walk(mid(184)), jump(0, { second: 18 }), walk(mid(186)), jump(0, { second: 18 })],
  // On the Monolith's top figure: two jumps up over its tip.
  vigelandsparken: [...VIGELANDSPARKEN_ROUTE.slice(0, VIGELANDSPARKEN_ROUTE.findIndex((m) => m.name === `walk to ${mid(179)}`)), walk(mid(178)), jump(0, { second: 18 })],
  // On the sledge over the gap: the jump at its edge, and the second at the top of it.
  // On the stone in the middle of the long crossing: two jumps up.
  ostensjovannet: [...OSTENSJOVANNET_ROUTE.slice(0, OSTENSJOVANNET_ROUTE.findIndex((m) => m.name === "on the stone") + 1), walk(mid(180)), jump(0, { second: 18 })],
  // From the market's stall up onto the hall's eaves, and two jumps up over its dragon heads.
  gamlebyen: [...GAMLEBYEN_ROUTE.slice(0, GAMLEBYEN_ROUTE.findIndex((m) => m.name === "stomp enemy 9") + 1), walk(mid(187)), jumpTo(mid(189)), walk(mid(190)), jumpTo(mid(192)), walk(mid(195)), jump(0, { second: 18 })],
  // On the second hook of the traverse, under the top crane's jib: two jumps up as it passes under the bracteate.
  bjorvika: [
    ...BJORVIKA_ROUTE.slice(0, BJORVIKA_ROUTE.findIndex((m) => m.name === "hop onto the second hook of the traverse") + 1),
    wait("on the hook under the bracteate", (q) => Math.abs(cx(q) - (tile(228) + 8)) < 6),
    jump(0, { second: 18 })
  ],
  korketrekkeren: [
    ...KORKETREKKEREN_ROUTE.slice(0, KORKETREKKEREN_ROUTE.findIndex((m) => m.name === "jump the gap")),
    {
      name: "over the gap, and once more at the top",
      keys(q, s) {
        if (s.took === undefined) {
          if (q.body.x + PLAYER.w < GAP.from - 4) return IDLE;
          s.took = s.i;
        }
        const k = s.i - (s.took as number);
        return { ...IDLE, jumpHeld: k < 40 || (k >= 18 && k < 48), jumpPressed: k === 0 || k === 18 };
      }
    }
  ]
};

/** Every level is held to the order's measure: at least a minute for the scripted player, and the size of a level. */
const NEW = new Set(["langkaia", "akershus", "radhuset", "slottet", "holmenkollen", "akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget", "bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]);
/** From level 6 on he has the ski pole: it is given for clearing Holmenkollen, the level before. */
const POLE = new Set(["akerselva", "nordmarka", "stortinget", "ekeberg", "nabolaget", "bygdoy", "vigelandsparken", "korketrekkeren", "ostensjovannet", "bjorvika", "gamlebyen"]);
/** How each level is played in the tests: with the pole from level 6 on, and the shield's rules (Bygdøy gives the shield at its prow; in line 1 he does not have it; after Bygdøy it is his). */
const opts = (def: LevelDef, more: { feather?: boolean } = {}) => ({ pole: POLE.has(def.id), shield: SHIELD_RULES, hasShield: def.rune > 10, ...more });
/**
 * The scripted clear's floor: forty seconds, the last level eighty. (It was sixty and ninety; order 12
 * cut the long waits on rides and bosses, which took ten to eighteen seconds off some levels without
 * taking away anything to do. The size of a level is held by its columns, 220 to 280.)
 */
const SHORTEST = 40;
const LONGEST: Record<string, number> = { nabolaget: 80 };

/**
 * Enemies allowed by a route's jump over a pit or water, by name, and why:
 * - Nabolaget's snowball kid stands at the edge of the block's roof, where the leap over the gap begins:
 *   the route stomps him first, and further back his reach would cover the flag on the same roof.
 * - Nabolaget's cat at the foot of the drift, before the tram's first slot: the route stomps it first.
 *   The street there is four tiles; a cat sitting still a tile further back was hit twice as often by
 *   the sloppy player coming down the drift (order 13), so it walks where it did.
 * - Østensjøvannet's three swans: see below.
 */
const JUMP_EXCEPTIONS: Record<string, string[]> = {
  nabolaget: ["thrower:kid@52", "walker:cat@153"],
  // Østensjøvannet's swans swim the water the pads lie on: that is the level. Each lets him be (it cannot
  // be touched) until he has been in its stretch four seconds, and the stretches are crossed in three.
  ostensjovannet: ["spiky:swan@70.5", "spiky:swan@149.5", "spiky:swan@166.5"]
};

/**
 * The route's jumps (its "jump" and "leap" moves) that go over a pit or water: where he left the ground
 * and where he landed, played through the real rules. A gap is a column between the two with water
 * under them, or nothing at all.
 */
function jumpsOverGaps(def: LevelDef, moves: Move[]) {
  const map = levelMap(def);
  const out: { move: string; from: { x: number; bottom: number }; to: { x: number; bottom: number } }[] = [];
  const watched = moves.map((m): Move =>
    /^(jump|leap)/.test(m.name)
      ? {
          name: m.name,
          keys(q, s) {
            const rec = (s.rec ??= { from: null, last: null }) as { from: { x: number; bottom: number } | null; last: { x: number; bottom: number } | null };
            if (!rec.from && !q.body.onGround && rec.last) rec.from = rec.last;
            if (q.body.onGround) rec.last = { x: cx(q), bottom: feet(q) };
            const k = m.keys(q, s);
            if (k === "done" && rec.from) out.push({ move: m.name, from: rec.from, to: { x: cx(q), bottom: feet(q) } });
            return k;
          }
        }
      : m
  );
  playMoves(newPlay(def, opts(def)), watched, { max: 60 * 300 });
  const gapAt = (c: number, top: number) => {
    for (let r = top; r < map.rows; r++) {
      if (def.legend.water.includes(map.tileAt(c, r))) return true;
      if (map.isSolid(c, r) || map.isOneWay(c, r)) return false;
    }
    return true;
  };
  return out.filter((j) => {
    const top = Math.floor(Math.min(j.from.bottom, j.to.bottom) / TILE);
    for (let c = Math.floor(Math.min(j.from.x, j.to.x) / TILE); c <= Math.floor(Math.max(j.from.x, j.to.x) / TILE); c++) if (gapAt(c, top)) return true;
    return false;
  });
}

describe("the lines", () => {
  test("line 1: ten levels, one per rune of LARS HANSEN, all built; line 2: six, one per rune of VIKING", () => {
    const word = (ids: string[]) => ids.map((id) => "LARSHANSENVIKING"[LINE[ORDER.indexOf(id)].rune]).join("");
    expect(word(LINE_1)).toBe("LARSHANSEN");
    expect(word(LINE_2)).toBe("VIKING");
    expect(LINE.map((l) => l.line).join("")).toBe("1111111111222222");
    expect(LINE.filter((l) => l.line === 1).every((l) => l.built)).toBe(true);
    expect(new Set(ORDER).size).toBe(16);
    // The built stations are the first of the order: a station opens when the one before it is cleared.
    expect(BUILT.map((l) => l.id)).toEqual(ORDER.slice(0, BUILT.length));
  });

  test("the line map has a station for each of the sixteen, the mound, and Hjem; line 1 has not moved", () => {
    const def = kartDef(fresh(), kartArt);
    const map = levelMap(def);
    for (const d of def.doors) expect(map.find(d.tile).length).toBe(1);
    expect(def.doors.map((d) => d.id)).toEqual(["home", "maze", ...ORDER]);
    // Line 1's ten stations stand where they stood before line 2 came.
    expect(STATIONS.slice(0, 10)).toEqual([6, 20, 24, 29, 34, 39, 44, 49, 52, 55]);
    expect(LINE_1.map((id) => map.find(def.doors.find((d) => d.id === id)!.tile)[0].c)).toEqual([6, 20, 24, 29, 34, 39, 44, 49, 52, 55]);
    // Line 2's six are past line 1's end, on its own deck.
    for (const c of STATIONS.slice(10)) expect(c).toBeGreaterThan(LINE_1_END);
  });

  test("line 2 opens when Nabolaget is cleared: until then a gate stands across it, with a sign", () => {
    const closed = kartDef(fresh(), kartArt);
    expect(lineTwoOpen(fresh())).toBe(false);
    const gate = levelMap(closed);
    expect(gate.isSolid(GATE_COL, 10)).toBe(true);
    expect(gate.isSolid(GATE_COL, 0)).toBe(true);
    expect(closed.signs[0].lines.en).toEqual(["Opens once Nabolaget is cleared."]);
    const nine = { ...fresh(), cleared: LINE_1.slice(0, 9) };
    expect(lineTwoOpen(nine)).toBe(false);
    const all = { ...fresh(), cleared: [...LINE_1] };
    expect(lineTwoOpen(all)).toBe(true);
    const open = levelMap(kartDef(all, kartArt));
    expect(open.isSolid(GATE_COL, 10)).toBe(false);
    // He can walk from Hjem's end of line 1 to the far end of line 2.
    const p = newPlay(kartDef(all, kartArt), { start: { x: tile(50), bottom: tile(11) } });
    for (let i = 0; i < 60 * 30 && cx(p) < tile(98); i++) stepPlay(p, { ...IDLE, right: true });
    expect(cx(p)).toBeGreaterThan(tile(98));
    const q = newPlay(closed, { start: { x: tile(50), bottom: tile(11) } });
    for (let i = 0; i < 60 * 10; i++) stepPlay(q, { ...IDLE, right: true, jumpHeld: true, jumpPressed: i % 40 === 0 });
    expect(cx(q)).toBeLessThan(tile(GATE_COL));
  });
});

/** The built levels, imported here as they are, not through the page's loaders. */
const LEVELS: LevelDef[] = [LANGKAIA, AKERSHUS, RADHUSET, SLOTTET, HOLMENKOLLEN, AKERSELVA, NORDMARKA, STORTINGET, EKEBERG, NABOLAGET, BYGDOY, VIGELANDSPARKEN, KORKETREKKEREN, OSTENSJOVANNET, BJORVIKA, GAMLEBYEN];

test("the line's stations say the same as the built levels themselves", () => {
  for (const def of LEVELS) {
    const st = LINE.find((l) => l.id === def.id)!;
    expect(st.built).toBe(true);
    expect([st.rune, st.name]).toEqual([def.rune, def.name]);
  }
});

for (const def of LEVELS) {
  describe(def.name, () => {
    const map = levelMap(def);
    const known = new Set([".", ...def.legend.solid, ...def.legend.oneWay, ...def.legend.water, ...(def.risen ? [...def.risen.solid, ...def.risen.oneWay] : []), ...Object.values(MARKS), ...def.doors.map((d) => d.tile)]);

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

    test("a scripted player clears it with one jump, raising every flag, losing no heart, in forty seconds or more", () => {
      const p = newPlay(def, opts(def));
      const r = playMoves(p, ROUTE[def.id], { max: 60 * 300 });
      expect(r.stuck).toBeNull();
      expect(r.done).toBe(true);
      expect(p.runeAt).not.toBeNull();
      expect(r.events.filter((e) => e.splash).length).toBe(0);
      expect(r.events.filter((e) => e.flag !== null).map((e) => e.flag)).toEqual(flagsOf(map).map((_, i) => i));
      expect(r.hurt).toEqual([]);
      expect(r.seconds).toBeGreaterThanOrEqual(LONGEST[def.id] ?? SHORTEST);
      expect(r.seconds).toBeLessThan(150);
      console.log(`${def.name}: scripted clear ${r.seconds.toFixed(1)} s, ${p.found} of ${p.skilling.length} skilling on the way`);
    });

    test("with the feather the bracteate can be reached", () => {
      const p = newPlay(def, opts(def, { feather: true }));
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

    test("no dead ends: from everywhere he can get to with what he is sure to have, the rune can be reached without a fall, and a fall at least puts him back", () => {
      const r = reach.get(def.id)!;
      expect(r.reached).toBeGreaterThan(100);
      expect(r.dead).toEqual([]);
      expect(r.onlyByFalling).toEqual([]);
    });

    test("no enemy's patrol comes within three tiles of where a route's jump over a pit or water takes off or lands", () => {
      const near = jumpsOverGaps(def, ROUTE[def.id]).flatMap((j) =>
        (def.enemies ?? []).flatMap((e) => {
          const name = `${e.kind}:${e.look}@${e.c}`;
          if (JUMP_EXCEPTIONS[def.id]?.includes(name)) return [];
          const x = e.c * TILE + TILE / 2;
          const span = (e.range ?? 0) * TILE;
          return [j.from, j.to].flatMap((s) => (Math.max(0, Math.abs(s.x - x) - span) <= 3 * TILE && Math.abs(s.bottom - (e.r + 1) * TILE) <= 2 * TILE ? [`${name} by "${j.move}" at column ${Math.floor(s.x / TILE)}`] : []));
        })
      );
      expect(near).toEqual([]);
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
        // No enemy's patrol comes within three tiles of a flag or a bench, and no thrower can reach
        // him standing at one, or at a sign while he reads it.
        const spots = [...flagsOf(map), ...benches];
        const signs = map.find(MARKS.sign).map(footOf);
        for (const e of enemies) {
          const x = e.c * TILE + TILE / 2;
          const reachX = ((e.range ?? 0) + 3) * TILE;
          for (const f of spots) if (Math.abs(f.bottom - (e.r + 1) * TILE) < 3 * TILE) expect({ enemy: e.c, near: Math.abs(f.x - x) > reachX }).toEqual({ enemy: e.c, near: true });
          if (e.kind === "thrower")
            for (const f of [...spots, ...signs]) {
              const inReach = Math.abs(f.x - x) < (e.reach ?? 7) * TILE + TILE / 2 && Math.abs(f.bottom - PLAYER.h - (e.r + 1) * TILE) < THROW_REACH.y;
              expect({ thrower: e.c, at: Math.floor(f.x / TILE), inReach }).toEqual({ thrower: e.c, at: Math.floor(f.x / TILE), inReach: false });
            }
        }
        // Every kind in it has a drawing of its own size.
        for (const e of enemies) expect(KIND[e.kind]).toBeDefined();
      });
  });
}

/** The reach searches, one worker per level, side by side: the slowest is what the suite waits for. */
const reach = new Map<string, { rune: boolean; bracteate: boolean; spots: number; reached: number; dead: string[]; onlyByFalling: string[]; ms: number }>();
beforeAll(async () => {
  const results = await Promise.all(
    LEVELS.map(
      (def) =>
        new Promise<{ id: string; rune: boolean; bracteate: boolean; spots: number; reached: number; dead: string[]; onlyByFalling: string[]; ms: number }>((resolve, reject) => {
          const w = new Worker(new URL("../game/reach.worker.ts", import.meta.url).href);
          w.onmessage = (e) => {
            resolve(e.data);
            w.terminate();
          };
          w.onerror = (e) => reject(e);
          w.postMessage({ id: def.id, pole: POLE.has(def.id) });
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
    const back = playMoves(p, [walk(TOWER_LIFT.x - 8), wait("the lift at the bottom", (q) => carrier(q, TOWER_LIFT).y >= TOWER_LIFT.bottom && carrierAt(TOWER_LIFT, q.t + 45).y >= TOWER_LIFT.bottom), walk(TOWER_LIFT.x + 16), wait("the lift at the top", (q) => carrierAt(TOWER_LIFT, q.t).y <= TOWER_LIFT.top), walk(tile(210))], { max: 60 * 60, until: (q) => q.body.onGround && feet(q) === tile(16) && cx(q) > tile(208) });
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
    // The last flag before the plough's street (another stands past the tram's slot), and the last bench.
    for (const s of [flagsOf(map).filter((f) => f.x < TERRACE.right).at(-1)!, benchesOf(map).at(-1)!]) {
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

  test("Langkaia: the first water comes right after the first flag; falling in costs a heart and puts him back at it", () => {
    const map = levelMap(LANGKAIA);
    const flag = flagsOf(map)[0];
    const water = map.find((ch) => ch === "~").map((t) => t.c);
    const firstWater = Math.min(...water);
    expect(firstWater * TILE - flag.x).toBeLessThan(8 * TILE);
    // Nothing before that flag can drop him: no water, no pit.
    expect(flag.x).toBeLessThan(firstWater * TILE);
    const p = newPlay(LANGKAIA);
    playMoves(p, [...LANGKAIA_ROUTE.slice(0, LANGKAIA_ROUTE.findIndex((m) => m.name === `walk to ${tile(66) + 6}`) + 1)], { max: 60 * 60 });
    expect(p.checkpoints.reached).toBe(0);
    let splash = false;
    for (let i = 0; i < 120 && !splash; i++) splash = stepPlay(p, { ...IDLE, right: true }).splash;
    expect(splash).toBe(true);
    expect(p.hearts).toBe(2);
    expect(Math.abs(cx(p) - flag.x)).toBeLessThan(2);
    expect(feet(p)).toBe(flag.bottom);
  });

  test("Langkaia: the two drifting rafts stand side by side in the middle long enough to walk from one to the other", () => {
    let together = 0;
    let longest = 0;
    for (let t = 0; t < 2000; t++) {
      const gap = carrierAt(RAFT.meetB, t).x - (carrierAt(RAFT.meetA, t).x + 5 * TILE);
      together = gap <= 1 ? together + 1 : 0;
      longest = Math.max(longest, together);
    }
    expect(longest).toBeGreaterThanOrEqual(80);
  });

  test("Akershus: the first cannon cannot miss", () => {
    const l = cannonsOf(AKERSHUS)[0];
    const b = createBody(0, 0);
    fire(l, b);
    for (let i = 0; i < 200 && !(b.onGround && i > 2); i++) stepBody(b, IDLE, levelMap(AKERSHUS));
    // Onto the gate tower, where the first flag is.
    const flag = flagsOf(levelMap(AKERSHUS))[0];
    expect(b.y + PLAYER.h).toBe(flag.bottom);
    expect(Math.abs(b.x + PLAYER.w / 2 - flag.x)).toBeLessThan(2 * TILE);
  });

  test("Akershus: fired while the hoist is up, he hits it and the moat puts him back at the flag before it", () => {
    const p = newPlay(AKERSHUS);
    const route = AKERSHUS_ROUTE;
    const upTo = route.findIndex((m) => m.name === "the hoist down");
    // Into the cannon just as the hoist comes to the top (it stands there under a second).
    playMoves(p, [...route.slice(0, upTo), wait("the hoist coming to the top", (q) => carrier(q, HOIST).y <= HOIST.top + 40 && carrierAt(HOIST, q.t + 1).y < carrier(q, HOIST).y), cannonRide(1)], { max: 60 * 120 });
    const flags = flagsOf(levelMap(AKERSHUS));
    expect(p.checkpoints.reached).toBe(1);
    expect(p.hearts).toBe(2);
    expect(Math.abs(cx(p) - flags[1].x)).toBeLessThan(2);
  });

  test("Akershus: the saluting battery fires him from cannon to cannon onto the last wall; leaning back on the way drops him in the harbour", () => {
    const at = AKERSHUS_ROUTE.findIndex((m) => m.name === "the hoist down");
    const p = newPlay(AKERSHUS);
    const r = playMoves(p, AKERSHUS_ROUTE.slice(0, at + 3), { max: 60 * 120, until: (z) => z.body.onGround && cx(z) > tile(190) });
    expect(r.stuck).toBeNull();
    const fired = r.events.flatMap((e) => (e.fired !== null ? [e.fired] : []));
    expect(fired.slice(-3)).toEqual(BATTERY);
    expect(r.events.some((e) => e.splash)).toBe(false);
    expect(cx(p)).toBeGreaterThan(tile(190));
    // Holding back while the first of them throws him: short of the next, into the water.
    const q = newPlay(AKERSHUS);
    playMoves(q, AKERSHUS_ROUTE.slice(0, at + 2), { max: 60 * 120 });
    const leaning = (z: Play) => z.firedAt[BATTERY[0]] > 0;
    playMoves(q, [cannonRide(1)], { max: 60 * 20, until: leaning });
    let splash = false;
    for (let i = 0; i < 200 && !splash; i++) splash = stepPlay(q, { ...IDLE, left: true }).splash;
    expect(splash).toBe(true);
  });

  test("Rådhuset: a bell of the carillon rings when he lands on it, and gone it drops him on the middle roof, not in the water", () => {
    const p = newPlay(RADHUSET);
    const at = RADHUSET_ROUTE.findIndex((m) => m.name.startsWith("the first bell of the carillon"));
    const r = playMoves(p, RADHUSET_ROUTE.slice(0, at + 2), { max: 60 * 150, until: (q) => q.body.onGround && feet(q) === CARILLON[0].y });
    expect(r.events.some((e) => e.bell === BELLS.indexOf(CARILLON[0]))).toBe(true);
    let splash = false;
    for (let i = 0; i < 400; i++) splash = stepPlay(p, IDLE).splash || splash;
    expect(splash).toBe(false);
    expect(feet(p)).toBe(tile(32));
  });

  test("Rådhuset: neighbouring bells are both there for over a second, so a patient player can always go on", () => {
    const pairs = [...[1, 2].map((i) => [LOW_BELLS[i - 1], LOW_BELLS[i]]), ...[1, 2].map((i) => [POOL_BELLS[i - 1], POOL_BELLS[i]]), ...[1, 2, 3, 5, 6, 7, 8, 9].map((i) => [CARILLON[i - 1], CARILLON[i]])];
    for (const [a, b] of pairs) {
      let bothThere = 0;
      for (let t = 0; t < 300; t++) if (timedPhase(t, a) !== "off" && timedPhase(t, b) !== "off") bothThere++;
      expect(bothThere).toBeGreaterThanOrEqual(60);
    }
  });

  test("Rådhuset: the swinging bell comes back to the fourth bell while it is there, and the clock's hand passes within a jump of the first ledge and under the balcony", () => {
    // The swing stands at its right end while the fourth bell of the carillon is on, once a round.
    let together = 0;
    for (let t = 0; t < carrierPeriod(SWING); t++) if (carrierAt(SWING, t).x >= SWING_ENDS.right - 8 && timedPhase(t, CARILLON[3]) !== "off") together++;
    // ... and stands at its left end while the bell after it is there.
    let across = 0;
    for (let t = 0; t < carrierPeriod(SWING); t++) if (carrierAt(SWING, t).x <= SWING_ENDS.left + 2 && timedPhase(t, CARILLON[4]) === "on") across++;
    expect(across).toBeGreaterThan(20);
    expect(together).toBeGreaterThan(30);
    // The hand: its bottom a short hop from the tower's first ledge, its top a jump under the balcony.
    const map = levelMap(RADHUSET);
    expect(map.isOneWay(196, 15)).toBe(true);
    expect(CLOCK.cy + CLOCK.r - 15 * TILE).toBeLessThan(16);
    expect(CLOCK.cy - CLOCK.r - 8 * TILE).toBeGreaterThan(0);
    expect(CLOCK.cy - CLOCK.r - 8 * TILE).toBeLessThan(40);
    expect(HANDS.length).toBe(2);
  });
});

describe("Bygdøy, the first of line 2", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(BYGDOY, { pole: true, shield: SHIELD_RULES, start });

  test("Fram's deck rocks him up and down; only from its far end, as it rises, does a jump reach the foredeck", () => {
    const tryFrom = (high: boolean) => {
      let t0 = 0;
      while ((deckTops(FRAM_DECK, t0).at(-1)! <= 217) !== high || deckTops(FRAM_DECK, t0 + 40).at(-1)! !== deckTops(FRAM_DECK, t0).at(-1)) t0++;
      const p = P({ x: tile(89) - 8, bottom: deckTops(FRAM_DECK, t0).at(-1)! });
      p.t = t0;
      playMoves(p, [jumpTo(mid(90))], { max: 200 });
      return feet(p);
    };
    expect(tryFrom(true)).toBe(tile(11));
    expect(tryFrom(false)).toBeGreaterThan(tile(11));
  });

  test("a bundle of balsa holds him forty steps, then goes under, and him with it", () => {
    const p = P({ x: PADS[0].x + 16, bottom: PADS[0].y });
    let splashAt = -1;
    for (let i = 0; i < 200 && splashAt < 0; i++) if (stepPlay(p, IDLE).splash) splashAt = i;
    expect(splashAt).toBeGreaterThan(SINK.firm);
    expect(splashAt).toBeLessThan(SINK.firm + SINK.sink + 10);
  });

  test("the oars are a stair up the hull: each comes out a stroke after the one below, and the two are out together for over a second", () => {
    for (let k = 1; k < OARS.length; k++) {
      expect(OARS[k].y).toBeLessThan(OARS[k - 1].y);
      let both = 0;
      for (let t = 0; t < 270; t++) if (timedPhase(t, OARS[k]) === "on" && timedPhase(t, OARS[k - 1]) !== "off") both++;
      expect(both).toBeGreaterThanOrEqual(60);
    }
  });

  test("the shield is given at the longship's prow, and the route stops the slingers' stones with it", () => {
    const p = P();
    const r = playMoves(p, BYGDOY_ROUTE, { max: 60 * 300 });
    expect(r.events.filter((e) => e.gift).length).toBe(1);
    expect(r.events.filter((e) => e.blocked).length).toBeGreaterThanOrEqual(2);
    expect(r.hurt).toEqual([]);
  });

  test("in the passage under the loft, a man who walks on without the shield is hit whenever he comes; one who stops and raises it as each stone comes never is", () => {
    // From the prow, at every moment of the slinger's beat.
    let careless = 0;
    let shielded = 0;
    const from = { x: tile(199) + 8, bottom: tile(14) };
    for (let t0 = 0; t0 < 100; t0++) {
      const p = newPlay(BYGDOY, { pole: true, shield: SHIELD_RULES, hasShield: true, start: from });
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 600 && cx(p) < tile(LOFT[1] + 3); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      if (hurt) careless++;
      const q = newPlay(BYGDOY, { pole: true, shield: SHIELD_RULES, hasShield: true, start: from });
      q.t = t0;
      let hold = 0;
      hurt = false;
      for (let i = 0; i < 1200 && cx(q) < tile(LOFT[1] + 3); i++) {
        if (q.shots.some((s) => s.by === 10 && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - (q.body.x + PLAYER.w) < 72)) hold = 4;
        hurt = stepPlay(q, hold-- > 0 ? { ...IDLE, shield: true } : { ...IDLE, right: true }).hurt || hurt;
      }
      if (hurt) shielded++;
    }
    expect(careless).toBe(100);
    expect(shielded).toBe(0);
    // In the passage he cannot jump: the loft's floor is a row over his head.
    const map = levelMap(BYGDOY);
    for (let c = LOFT[0]; c <= LOFT[1]; c++) expect([map.isSolid(c, W - 2), map.isSolid(c, W - 1)]).toEqual([true, false]);
  });

  test("past the other two slingers, a man who walks on without raising the shield is hit at many of the moments he could come", () => {
    let hit = 0;
    let tries = 0;
    // Over one round of their beat.
    for (let t0 = 0; t0 < 110; t0 += 2) {
      const p = P({ x: tile(216), bottom: tile(19) });
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 400 && p.body.x < tile(236); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      tries++;
      if (hurt) hit++;
    }
    expect(hit / tries).toBeGreaterThanOrEqual(0.4);
  });

  test("the ferry and the raft never keep him waiting much more than five seconds", () => {
    for (const [d, x] of [[FERRY, tile(12)], [BALSA, tile(122)], [REED, tile(140)]] as const) {
      let longest = 0;
      let since = 0;
      for (let t = 0; t < 4000; t++) {
        since = carrierAt(d, t).x === x ? 0 : since + 1;
        longest = Math.max(longest, since);
      }
      expect(longest / 60).toBeLessThan(5.5);
    }
    expect(GJOA_DECK.hold + 2 * GJOA_DECK.move).toBeLessThan(5 * 60);
  });
});

describe("Vigelandsparken: the statues move while his back is turned", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(VIGELANDSPARKEN, { pole: true, shield: SHIELD_RULES, hasShield: true, start });
  const FLOOR = VW * TILE;

  test("the walls the statues are for are out of a jump's reach from the ground, and in reach from a statue's head", () => {
    const map = levelMap(VIGELANDSPARKEN);
    // The pergola and the courtyard's far wall: three rows high.
    for (const c of [134, 154]) {
      expect(map.isSolid(c, VW - 3)).toBe(true);
      expect(map.isSolid(c, VW - 4)).toBe(false);
    }
    // From the ground at the pergola's foot, a jump falls short; from the statue's head, it lands on top.
    const tryFrom = (bottom: number) => {
      const p = P({ x: tile(134) - 8, bottom });
      p.enemies.forEach((e) => (e.alive = false));
      playMoves(p, [jumpTo(mid(135))], { max: 200 });
      return feet(p);
    };
    expect(tryFrom(FLOOR)).toBe(FLOOR);
    const statue = VIGELAND_ENEMIES.find((e) => e.c === 133)!;
    const p = P({ x: tile(131) + 4, bottom: FLOOR });
    const r = playMoves(p, [jumpTo(statue.c * TILE + TILE / 2), jumpTo(mid(135))], { max: 400 });
    expect(r.hurt).toEqual([]);
    expect(feet(p)).toBe(FLOOR - 3 * TILE);
  });

  test("the courtyard's statue follows him to the wall while his back is turned, and the route climbs it there", () => {
    const p = P();
    const route = VIGELANDSPARKEN_ROUTE;
    const r = playMoves(p, route.slice(0, route.findIndex((m) => m.name === "face statue 7") + 1), { max: 60 * 120 });
    expect(r.hurt).toEqual([]);
    const e = p.enemies[7];
    expect(e.x).toBeGreaterThan(tile(152));
    expect(e.calm).toBe(true);
  });

  test("the loose slab is there while the Angry Boy stamps, shakes while he is in the air, and drops when he lands", () => {
    const boy = newPlay(VIGELANDSPARKEN).enemies[3];
    for (let t = 0; t < BOY.period * 2; t++) {
      const { up, ripple } = leapOf(boy, t);
      if (ripple) expect(timedPhase(t, SLAB)).toBe("on");
      if (up > 0) expect(timedPhase(t, SLAB)).toBe("warn");
    }
    // Off for under a second, on for over a second: the wait for it is never long.
    expect(SLAB.off).toBeLessThan(60);
    expect(SLAB.on).toBeGreaterThan(60);
  });

  test("the fountain's jets never keep him waiting much more than five seconds", () => {
    for (const d of [JET_IN, JET_OUT]) {
      let longest = 0;
      let since = 0;
      for (let t = 0; t < 2000; t++) {
        since = carrierAt(d, t).y >= FLOOR ? 0 : since + 1;
        longest = Math.max(longest, since);
      }
      expect(longest / 60).toBeLessThan(5.5);
    }
  });

  test("on the plateau, a man who walks on without the shield is hit at most of the moments he could come; the route stops the rings with it", () => {
    let hit = 0;
    let tries = 0;
    for (let t0 = 0; t0 < 130; t0 += 2) {
      const p = P({ x: tile(189), bottom: FLOOR - 8 * TILE });
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 400 && p.body.x < tile(211); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      tries++;
      if (hurt) hit++;
    }
    expect(hit / tries).toBeGreaterThanOrEqual(0.75);
    const p = P();
    const r = playMoves(p, VIGELANDSPARKEN_ROUTE, { max: 60 * 300 });
    expect(r.done).toBe(true);
    expect(r.hurt).toEqual([]);
    expect(r.events.filter((e) => e.blocked).length).toBeGreaterThanOrEqual(1);
  });
});

describe("Korketrekkeren: a sledge he cannot stop", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(KORKETREKKEREN, { pole: true, shield: SHIELD_RULES, hasShield: true, start });
  const on = (c: number) => ({ x: tile(c) + 8, bottom: trackY(tile(c) + 8)! });

  test("on the sledge it carries him at the stretch's speed whatever he presses, never over twice his run; no dash, no stop", () => {
    for (const keys of [IDLE, { ...IDLE, left: true }, { ...IDLE, right: true, dash: true }]) {
      const p = P(on(36));
      let top = 0;
      for (let i = 0; i < 200; i++) {
        const x = cx(p);
        stepPlay(p, keys);
        expect(p.riding).toBe(true);
        top = Math.max(top, cx(p) - x);
        if (i > 2) expect(cx(p) - x).toBeGreaterThan(0.9);
      }
      expect(top).toBeLessThanOrEqual(2 * MOVE.run + 0.01);
    }
    for (let x = RIDE.from; x < RIDE.to; x += 8) expect(speedAt(x)).toBeLessThanOrEqual(2 * MOVE.run);
  });

  test("the run is a stair of ledges no more than four pixels apart, but for the bumps' far sides and the gap: no slope under his body", () => {
    const tops = [];
    for (let x = RIDE.from; x < RIDE.to; x += 4) tops.push(trackY(x));
    let drops = 0;
    for (let i = 1; i < tops.length; i++) {
      const a = tops[i - 1];
      const b = tops[i];
      if (a === null || b === null) continue;
      expect(Number.isInteger(b)).toBe(true);
      if (Math.abs(b - a) > 4) drops++;
    }
    expect(drops).toBe(3);
  });

  test("ducking (down) he passes under a branch and the lowered barrier; sitting up, they cost a heart and he rides on, blinking", () => {
    for (const duck of [false, true]) {
      // Past the first two branches.
      const p = P(on(112));
      let hurt = 0;
      for (let i = 0; i < 400 && cx(p) < tile(127); i++) {
        const x = cx(p);
        const ev = stepPlay(p, { ...IDLE, shield: duck });
        if (ev.hurt) hurt++;
        expect(p.riding).toBe(true);
        expect(cx(p)).toBeGreaterThan(x);
      }
      expect(cx(p)).toBeGreaterThanOrEqual(tile(127));
      // Sitting up, each branch costs a heart and he rides on; ducking, none does; the shield never comes up.
      expect(hurt).toBe(duck ? 0 : 2);
      expect(p.shield!.raise).toBe(0);
    }
    // The barrier: down for a while on its beat, and while down only a duck gets under it.
    const live = (t: number) => pulsePhaseOf(t, BARRIER.beat!) === "live";
    let t0 = 0;
    while (!live(t0 + Math.round((BARRIER.x - tile(148)) / speedAt(tile(150))))) t0++;
    for (const duck of [false, true]) {
      const p = P(on(148));
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 300 && cx(p) < tile(162); i++) hurt = stepPlay(p, { ...IDLE, shield: duck }).hurt || hurt;
      expect(hurt).toBe(!duck);
    }
  });

  test("off the run over the gap, he is put back at the last flag, on the sledge; a jump at its edge clears it onto a long clear landing", () => {
    const p = P(on(164));
    let splash = false;
    for (let i = 0; i < 300 && !splash; i++) splash = stepPlay(p, IDLE).splash;
    expect(splash).toBe(true);
    expect(p.hearts).toBe(2);
    const flag = flagsOf(levelMap(KORKETREKKEREN)).filter((f) => f.x < GAP.from).at(-1)!;
    expect(Math.abs(cx(p) - flag.x)).toBeLessThan(2);
    stepPlay(p, IDLE);
    expect(p.riding).toBe(true);
    const q = P(on(167));
    const r = playMoves(q, [KORKETREKKEREN_ROUTE.find((m) => m.name === "jump the gap")!], { max: 600 });
    expect(r.events.some((e) => e.splash)).toBe(false);
    expect(cx(q)).toBeGreaterThan(GAP.to);
    // Nothing on the landing for eight tiles.
    for (const e of KORKETREKKEREN.enemies!) expect(e.c < GAP.to / TILE || e.c > GAP.to / TILE + 8 + (e.range ?? 0)).toBe(true);
    for (const h of RUN_HAZARDS) expect(h.x < GAP.from || h.x > GAP.to + 8 * TILE).toBe(true);
  });

  test("every obstacle on the run is in view at least 1.2 s before he reaches it, at every width the page can have, an upright phone's included", () => {
    // The view's size in art pixels: the narrowest the page allows (240), an upright phone, 1280 x 800, a phone on its side.
    for (const view of [{ w: 240, h: 520 }, { w: 293, h: 633 }, { w: 321, h: 201 }, { w: 423, h: 196 }]) {
      const p = P();
      const seen = new Map<string, number>();
      const reached = new Map<string, number>();
      let cam = { x: 0, y: 0 };
      let first = true;
      const things = (q: Play) => [
        ...RUN_HAZARDS.map((h, i) => ({ id: `hazard ${i}`, x: h.x, y: h.y, w: h.w, h: h.h })),
        { id: "the gap", x: GAP.from, y: trackY(GAP.from - 4)! - 8, w: GAP.to - GAP.from, h: 24 },
        ...q.enemies.flatMap((e, i) => (e.def.look === "sledger" && !e.calm ? [{ id: `sledger ${i}`, x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h }] : []))
      ];
      const watch: Move = {
        name: "watch",
        keys(q) {
          const focus = { x: cx(q) + (q.riding ? KORKETREKKEREN.rules!.lead!(view.w) : 0), y: q.body.y + PLAYER.h / 2, facing: q.body.facing };
          const floor = KORKETREKKEREN.floor!(focus.x);
          const bottom = view.h > view.w ? Math.max(floor, Math.round(focus.y + view.h / 3)) : floor;
          cam = follow(cam, focus, { width: q.map.width, bottom, top: 12 }, view, 1000 / 60, first);
          first = false;
          for (const o of things(q)) {
            if (!q.riding) continue;
            const inView = o.x < cam.x + view.w && o.x + o.w > cam.x && o.y < cam.y + view.h && o.y + o.h > cam.y + 12;
            if (inView && !seen.has(o.id)) seen.set(o.id, q.t);
            if (q.body.x + PLAYER.w >= o.x && !reached.has(o.id)) reached.set(o.id, q.t);
          }
          return "done";
        }
      };
      playMoves(p, KORKETREKKEREN_ROUTE.flatMap((m) => [watch, m, watch]).map((m) => (m === watch ? m : { name: m.name, keys: (q, s) => (watch.keys(q, s), m.keys(q, s)) })), { max: 60 * 120 });
      for (const [id, at] of reached) {
        expect(seen.has(id)).toBe(true);
        expect({ id, w: view.w, lead: (at - seen.get(id)!) / 60 >= 1.2 }).toEqual({ id, w: view.w, lead: true });
      }
      expect(reached.size).toBeGreaterThanOrEqual(RUN_HAZARDS.length + 1 + 2);
    }
  });

  test("on the scripted ride there are about forty seconds of riding; the boys at the hut are stopped by the shield", () => {
    const p = P();
    let riding = 0;
    const r = playMoves(p, KORKETREKKEREN_ROUTE.map((m) => ({ name: m.name, keys: (q: Play, s: Parameters<Move["keys"]>[1]) => ((riding += q.riding ? 1 : 0), m.keys(q, s)) })), { max: 60 * 300 });
    expect(r.done).toBe(true);
    expect(riding / 60).toBeGreaterThan(38);
    expect(r.events.filter((e) => e.blocked).length).toBeGreaterThanOrEqual(1);
  });
});

describe("Østensjøvannet: pads that sink, swans that mind their water", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(OSTENSJOVANNET, { pole: true, shield: SHIELD_RULES, hasShield: true, start });
  const FLOOR = LW * TILE;

  test("the first three pads have firm stones between them; every pad is a hop from the next", () => {
    const map = levelMap(OSTENSJOVANNET);
    for (const c of [42, 46, 50, 54]) expect(map.isSolid(c, LW)).toBe(true);
    for (const p of LILY_PADS.slice(0, 3)) {
      const c = Math.floor(p.x / TILE);
      expect(map.isSolid(c - 1, LW) || map.isSolid(c - 2, LW)).toBe(true);
    }
    for (let i = 3; i < LILY_PADS.length; i++) {
      const gap = LILY_PADS[i].x - (LILY_PADS[i - 1].x + LILY_PADS[i - 1].w);
      if (gap < 0 || gap > 4 * TILE) continue;
      expect(gap).toBeLessThanOrEqual(32);
    }
  });

  test("each swan's stretch is crossed in about three seconds at a run, under the four it allows", () => {
    for (const e of OSTENSJOVANNET.enemies!.filter((d) => d.look === "swan")) {
      const seconds = (2 * (e.range ?? 0) * TILE) / MOVE.run / 60;
      expect(seconds).toBeGreaterThan(2.4);
      expect(seconds).toBeLessThan(SWAN.come / 60);
    }
    // And the route crosses them without one coming for him.
    const p = P();
    const r = playMoves(p, OSTENSJOVANNET_ROUTE, { max: 60 * 300 });
    expect(r.done).toBe(true);
    expect(r.hurt).toEqual([]);
  });

  test("the heron holds him a second, then flies off and drops him in the water; it is back three seconds later", () => {
    const p = P({ x: HERON.x + HERON.w / 2, bottom: HERON.y });
    let on = 0;
    let splash = -1;
    for (let i = 0; i < 200 && splash < 0; i++) {
      if (stepPlay(p, IDLE).splash) splash = i;
      else if (p.body.onGround) on++;
    }
    expect(on).toBeGreaterThanOrEqual(HERON.stay - 2);
    expect(splash).toBeGreaterThan(HERON.stay);
    expect(splash).toBeLessThan(HERON.stay + 40);
    const s = p.grounds!.state as { gone: number | null };
    expect(s.gone).not.toBeNull();
    for (let i = 0; i < HERON.away + 2; i++) stepPlay(p, IDLE);
    expect(s.gone).toBeNull();
    // From the pad before it the hide's deck is out of a jump's reach; from the heron it is not.
    const deck = (LW - 4) * TILE;
    expect(FLOOR - deck).toBeGreaterThan(46);
    expect(HERON.y - deck).toBeLessThan(46);
  });

  test("the gulls dive at him straight from their nests: a man who walks on along the shore is hit at most of the moments he could come", () => {
    let hit = 0;
    let tries = 0;
    for (let t0 = 0; t0 < 110; t0 += 2) {
      const p = P({ x: tile(112), bottom: FLOOR });
      p.enemies[3].alive = false;
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 400 && p.body.x < tile(134); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      tries++;
      if (hurt) hit++;
    }
    expect(hit / tries).toBeGreaterThanOrEqual(0.75);
    const p = P();
    const r = playMoves(p, OSTENSJOVANNET_ROUTE, { max: 60 * 300 });
    expect(r.events.filter((e) => e.blocked).length).toBeGreaterThanOrEqual(1);
  });

  test("a careless man who waits on the stone at the swans' meeting is left alone; one who waits on a pad in a stretch is not", () => {
    // On the island's edge, out of every stretch, for ten seconds: nothing comes.
    const p = P({ x: tile(139), bottom: FLOOR });
    let hurt = false;
    for (let i = 0; i < 600; i++) hurt = stepPlay(p, IDLE).hurt || hurt;
    expect(hurt).toBe(false);
    const swan = p.enemies.find((e) => e.def.look === "swan" && e.def.c === 149.5)!;
    expect(inStretch(swan, p.body)).toBe(false);
  });
});

describe("Bjørvika: hooks that carry him, and he chooses when to let go", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(BJORVIKA, { pole: true, shield: SHIELD_RULES, hasShield: true, start });
  const map = levelMap(BJORVIKA);
  /** The width of firm floor at a row, from column c going the way `dir` points. */
  const floorFrom = (c: number, row: number, dir: 1 | -1) => {
    let n = 0;
    while (map.isSolid(c + dir * n, row) && !map.isSolid(c + dir * n, row - 1)) n++;
    return n;
  };

  test("every hook comes to a tile from its near landing (a hop on) and right up to its far one (a step off), and every landing is four tiles wide or more", () => {
    for (const h of HOOKS) {
      const row = h.from.y / TILE;
      const c0 = h.from.x / TILE;
      const c1 = h.to.x / TILE + h.w / TILE;
      // The near end: a tile from a landing, or (on the traverse) a tile from the last hook's far end.
      const before = HOOKS.find((k) => k.from.y === h.from.y && k.to.x + k.w === h.from.x - TILE);
      if (!before) {
        expect(map.isSolid(c0 - 1, row)).toBe(false);
        expect(floorFrom(c0 - 2, row, -1)).toBeGreaterThanOrEqual(4);
      }
      const next = HOOKS.find((k) => k.from.y === h.from.y && k.from.x === (c1 + 1) * TILE);
      if (!next) expect(floorFrom(c1, row, 1)).toBeGreaterThanOrEqual(4);
      // Under the gap it crosses: the drop (or the bay's net).
      for (let c = c0 - 1; c < c1; c++) expect(map.isSolid(c, row)).toBe(false);
    }
  });

  test("the hoist, the hooks and the sheets never keep him waiting much more than five seconds", () => {
    const wait = (at: (t: number) => boolean) => {
      let longest = 0;
      let since = 0;
      for (let t = 0; t < 4000; t++) {
        since = at(t) ? 0 : since + 1;
        longest = Math.max(longest, since);
      }
      return longest / 60;
    };
    expect(wait((t) => carrierAt(BJ_HOIST, t).y === BJ_HOIST.bottom)).toBeLessThan(5.5);
    for (const d of [...HOOKS, ...SHEETS]) expect(wait((t) => carrierAt(d, t).x === (d as Travel).from.x)).toBeLessThan(5.5);
  });

  test("a miss at the first hook costs nothing: the net holds him, and its step leads back up to the floor", () => {
    // Dropped off the hook over the middle of the bay: the net.
    const p = P({ x: tile(BAY[0] + 4) + 8, bottom: tile(BF1) });
    p.body.onGround = false;
    for (let i = 0; i < 90; i++) stepPlay(p, IDLE);
    expect(p.hurt).toBe(false);
    expect(feet(p)).toBe(tile(BF1 + 3));
    // From the net, up the step and back onto the floor before the bay.
    const r = playMoves(p, [walk(tile(BAY[0] + 2) + 4), jumpTo(tile(BAY[0]) + 8), jumpTo(tile(BAY[0] - 2) + 8)], { max: 600, until: (q) => q.body.onGround && feet(q) === tile(BF1) && cx(q) < tile(BAY[0]) });
    expect(r.done).toBe(true);
    expect(p.hurt).toBe(false);
    expect(feet(p)).toBe(tile(BF1));
    expect(cx(p)).toBeLessThan(tile(BAY[0]));
  });

  test("the welder's sparks hurt only on their beat, after a second's warning; between showers he walks under them", () => {
    const beat = SPARKS.beat!;
    expect(beat.warn).toBeGreaterThanOrEqual(60);
    const at = (t0: number) => {
      const p = P({ x: tile(53), bottom: tile(BF1) });
      p.t = t0;
      for (let i = 0; i < 40; i++) stepPlay(p, { ...IDLE, right: true });
      return p.hurt;
    };
    const period = beat.rest + beat.warn + beat.live;
    const start = (period - (beat.offset ?? 0)) % period;
    expect(at(start)).toBe(false);
    expect(at(start + beat.rest + beat.warn - 5)).toBe(true);
  });

  test("on the riveters' girder, a man who walks on without the shield is hit at most of the moments he could come; one who stops and raises it as each bolt comes never is", () => {
    let careless = 0;
    let shielded = 0;
    const from = { x: tile(180), bottom: tile(BF2) };
    const riveters = [9, 10];
    // Over one round of their beat.
    for (let t0 = 0; t0 < 120; t0 += 2) {
      const p = P(from);
      p.enemies[7].alive = false;
      p.enemies[8].alive = false;
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 600 && cx(p) < tile(194); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      if (hurt) careless++;
      const q = P(from);
      q.enemies[7].alive = false;
      q.enemies[8].alive = false;
      q.t = t0;
      let hold = 0;
      hurt = false;
      for (let i = 0; i < 1500 && cx(q) < tile(194); i++) {
        if (q.shots.some((s) => riveters.includes(s.by) && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - (q.body.x + PLAYER.w) < 64)) hold = 4;
        hurt = stepPlay(q, hold-- > 0 ? { ...IDLE, shield: true } : { ...IDLE, right: true }).hurt || hurt;
      }
      if (hurt) shielded++;
    }
    expect(careless / 60).toBeGreaterThanOrEqual(0.6);
    expect(shielded).toBe(0);
  });

  test("the gusts push against him over the shafts only after a second of dust", () => {
    for (const z of BJ_GUSTS) {
      expect(z.beat!.warn).toBeGreaterThanOrEqual(60);
      expect(z.push.x).toBeLessThan(0);
      for (const c of SHAFTS) expect(z.x <= tile(c) && z.x + z.w >= tile(c + 5)).toBe(true);
    }
  });
});

describe("Gamlebyen: the ruins rebuild as he passes", () => {
  const P = (start?: { x: number; bottom: number }) => newPlay(GAMLEBYEN, { pole: true, shield: SHIELD_RULES, hasShield: true, start });
  const ruins = (p: Play) => p.grounds!.state as Ruins;

  test("a stone is not there until he comes near; then it rises, and stays, and is ground (a wall solid, a ledge one-way)", () => {
    const p = P({ x: tile(27) + 8, bottom: tile(STREET) });
    const i = STONES.findIndex((s) => s.c === 37 && s.r === STREET - 4);
    expect(p.map.isOneWay(37, STREET - 4)).toBe(false);
    for (let k = 0; k < 20; k++) stepPlay(p, IDLE);
    expect(ruins(p).at[i]).toBeNull();
    for (let k = 0; k < 400 && cx(p) < tile(33); k++) stepPlay(p, { ...IDLE, right: true });
    for (let k = 0; k < 40; k++) stepPlay(p, IDLE);
    expect(ruins(p).up[i]).toBe(true);
    expect(p.map.isOneWay(37, STREET - 4)).toBe(true);
    // Walking away, it stays.
    for (let k = 0; k < 200; k++) stepPlay(p, { ...IDLE, left: true });
    expect(p.map.isOneWay(37, STREET - 4)).toBe(true);
  });

  test("a stone that would rise where he stands waits until he has moved off", () => {
    // The lowest stone of the first wall that rises behind him: standing under it, his head is in its tile.
    const st = STONES.findIndex((s) => s.c === CLOSERS[0] && !STONES.some((o) => o.c === s.c && o.r > s.r));
    const s = STONES[st];
    const p = P({ x: tile(s.c) + 8, bottom: tile(s.r + 1) });
    const state = ruins(p);
    state.at[st] = p.t;
    for (let k = 0; k < 60; k++) stepPlay(p, IDLE);
    expect(state.up[st]).toBe(false);
    expect(p.map.isSolid(s.c, s.r)).toBe(false);
    // He steps out from under it: it sets.
    for (let k = 0; k < 20; k++) stepPlay(p, { ...IDLE, right: true });
    expect(state.up[st]).toBe(true);
    expect(p.map.isSolid(s.c, s.r)).toBe(true);
  });

  test("twice a wall rises behind him once he is past it: from his side it is too high to climb, from the side he came it can be climbed", () => {
    for (const c of CLOSERS) {
      const wall = STONES.filter((s) => s.c === c);
      expect(wall.length).toBeGreaterThanOrEqual(3);
      expect(wall.every((s) => s.wall && s.behind)).toBe(true);
      const top = Math.min(...wall.map((s) => s.r));
      const map = levelMap(GAMLEBYEN);
      const floorAt = (col: number) => {
        for (let r = 0; r < map.rows; r++) if (map.isSolid(col, r)) return r;
        return map.rows;
      };
      const before = floorAt(c - 1);
      const after = Math.min(...wall.map((s) => s.r)) + wall.length;
      // From the side he came, its top is two rows up: a jump. From beyond, four: not.
      expect(before - top).toBe(2);
      expect(after - top).toBe(4);
      // Before he is past, it is not there; once he is three tiles past, it rises.
      const p = P({ x: tile(c + 1) + 8, bottom: tile(after) });
      for (let k = 0; k < 20; k++) stepPlay(p, IDLE);
      expect(p.map.isSolid(c, top)).toBe(false);
      for (let k = 0; k < 120; k++) stepPlay(p, { ...IDLE, right: cx(p) < tile(c + 4) });
      expect(p.map.isSolid(c, top)).toBe(true);
    }
  });

  test("the bishop's guards are stone (harmless, not to be touched) until he comes near; then they walk", () => {
    const p = P({ x: tile(63) + 8, bottom: tile(15) });
    const guards = p.enemies.filter((e) => e.def.look === "guard");
    expect(guards.length).toBe(3);
    for (let k = 0; k < 60; k++) stepPlay(p, IDLE);
    for (const g of guards) {
      expect(g.calm).toBe(true);
      expect(g.x).toBe(g.home);
    }
    for (let k = 0; k < 200 && cx(p) < guards[0].x - WAKE * TILE + 4; k++) stepPlay(p, { ...IDLE, right: true });
    for (let k = 0; k < 30; k++) stepPlay(p, IDLE);
    expect(guards[0].calm).toBe(false);
    expect(guards[0].x).not.toBe(guards[0].home);
    expect(guards[2].calm).toBe(true);
  });

  test("the tower builds itself under him up the town wall, with no wait at its foot, and sinks back once he has left it a while", () => {
    const p = P({ x: TOWER.x - 8, bottom: TOWER.low });
    for (let k = 0; k < 20; k++) stepPlay(p, IDLE);
    expect(ruins(p).y).toBe(TOWER.low);
    // On it, it starts up at once.
    for (let k = 0; k < 10; k++) stepPlay(p, { ...IDLE, right: true });
    expect(ruins(p).y).toBeLessThan(TOWER.low);
    let k = 0;
    for (; k < 400 && ruins(p).y > TOWER.high; k++) stepPlay(p, IDLE);
    expect(ruins(p).y).toBe(TOWER.high);
    stepPlay(p, IDLE);
    expect(feet(p)).toBe(TOWER.high);
    expect(k / 60).toBeLessThan(2);
    // Off onto the wall walk; after a while it goes back down.
    for (let i = 0; i < 30; i++) stepPlay(p, { ...IDLE, right: true });
    expect(feet(p)).toBe(tile(TOWN));
    for (let i = 0; i < TOWER.wait + 200; i++) stepPlay(p, IDLE);
    expect(ruins(p).y).toBe(TOWER.low);
    expect(RUIN_GROUNDS.everywhere().length).toBe(TOWER.low - TOWER.high + 1);
  });

  test("on the wall walk, a man who walks on without the shield is hit at most of the moments he could come; one who stops and raises it as each arrow comes never is", () => {
    let careless = 0;
    let shielded = 0;
    const from = { x: tile(140), bottom: tile(TOWN) };
    const archers = [6, 7];
    for (let t0 = 0; t0 < 120; t0 += 2) {
      const p = P(from);
      p.t = t0;
      let hurt = false;
      for (let i = 0; i < 600 && cx(p) < tile(166); i++) hurt = stepPlay(p, { ...IDLE, right: true }).hurt || hurt;
      if (hurt) careless++;
      const q = P(from);
      q.t = t0;
      let hold = 0;
      hurt = false;
      for (let i = 0; i < 1500 && cx(q) < tile(166); i++) {
        if (q.shots.some((s) => archers.includes(s.by) && s.spent === undefined && s.vx < 0 && s.x > q.body.x && s.x - (q.body.x + PLAYER.w) < 64)) hold = 4;
        hurt = stepPlay(q, hold-- > 0 ? { ...IDLE, shield: true } : { ...IDLE, right: true }).hurt || hurt;
      }
      if (hurt) shielded++;
    }
    expect(careless / 50).toBeGreaterThanOrEqual(0.6);
    expect(shielded).toBe(0);
  });

  test("the serpent's quay: its bench right before it, its three places along it, and the rune on the last longship only once it is beaten", () => {
    const map = levelMap(GAMLEBYEN);
    const bench = benchesOf(map).at(-1)!;
    expect(SERPENT_DEF.x0 - bench.x).toBeLessThan(4 * TILE);
    expect(SERPENT_DEF.x1 - SERPENT_DEF.x0).toBeGreaterThanOrEqual(24 * TILE);
    for (const x of SERPENT_DEF.points) expect(x > SERPENT_DEF.x0 && x < SERPENT_DEF.x1).toBe(true);
    for (let c = Math.floor(SERPENT_DEF.x0 / TILE); c < Math.floor(SERPENT_DEF.x1 / TILE); c++) expect(map.isSolid(c, GQ)).toBe(true);
    // The route's fight: three hits, and only then the rune.
    const p = P();
    const r = playMoves(p, GAMLEBYEN_ROUTE, { max: 60 * 300 });
    expect(r.done).toBe(true);
    const hits = r.events.filter((e) => e.boss === "hit").length;
    expect(hits).toBe(3);
    const beaten = r.events.findIndex((e) => e.boss === "beaten");
    expect(beaten).toBeGreaterThan(0);
    expect(r.events.findIndex((e) => e.rune)).toBeGreaterThan(beaten);
    expect(r.events.filter((e) => e.blocked).length).toBeGreaterThanOrEqual(3);
  });
});

describe("no way out but the restart button, fixed", () => {
  test("Rådhuset: east of the clock tower is the harbour, so a fall off the tower costs a heart and puts him back at the flag by the clock", () => {
    const map = levelMap(RADHUSET);
    for (let c = 209; c < map.cols; c++) expect(map.isWater(c, 48)).toBe(true);
    const flag = flagsOf(map).at(-1)!;
    const p = newPlay(RADHUSET, { start: { x: tile(204), bottom: tile(16) } });
    p.save = { ...flag };
    let splash = false;
    for (let i = 0; i < 600 && !splash; i++) splash = stepPlay(p, { ...IDLE, right: true }).splash;
    expect(splash).toBe(true);
    expect(p.hearts).toBe(2);
    expect(Math.abs(cx(p) - flag.x)).toBeLessThan(2);
  });

  test("Rådhuset: a missed clock hand drops him on the tower roof, where a hop catches a tip as it comes round the bottom", () => {
    const p = newPlay(RADHUSET, { start: { x: tile(202), bottom: tile(16) } });
    const low = (q: Play) => HANDS.some((d) => carrierAt(d, q.t).y >= CLOCK.cy + CLOCK.r - 6);
    let rode = -1;
    for (let i = 0; i < 60 * 10 && rode < 0; i++) {
      stepPlay(p, { ...IDLE, jumpHeld: true, jumpPressed: p.body.onGround && low(p) });
      if (p.body.onGround && !p.map.supports(p.body)) rode = i;
    }
    expect(rode).toBeGreaterThanOrEqual(0);
    expect(rode / 60).toBeLessThan(8);
    // And it carries him up the side of the clock.
    for (let i = 0; i < 90; i++) stepPlay(p, IDLE);
    expect(feet(p)).toBeLessThan(tile(14));
  });

  test("Slottet: the palace's terrace goes on to the edge of the map, so there is no slot beside it to fall into", () => {
    const map = levelMap(SLOTTET);
    for (let c = 212; c < map.cols; c++) for (const r of [16, 17, 18]) expect(map.isSolid(c, r)).toBe(true);
  });
});

// All sixteen are built (order 16): every station has its address, and none stands under construction.
test("all sixteen stations are built, and every one has an address to go to", () => {
  expect(LINE.filter((l) => l.built).length).toBe(16);
  const def = kartDef({ ...fresh(), cleared: [...LINE_1] }, kartArt);
  for (const l of LINE) expect(def.doors.find((d) => d.id === l.id)!.href).toBe(`#${l.id}`);
});
