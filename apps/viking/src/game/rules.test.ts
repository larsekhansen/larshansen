import { describe, expect, test } from "bun:test";
import { DASH, PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { LevelDef } from "../levels/types";
import { WINDUP, leap, untilThrow, windingUp, type EnemyDef } from "./enemies";
import { HEARTS, LIVES, PURSE_LIFE, SAFE_STEPS, STOMP, againAtBoss, extraGround, newPlay, runeFree, stepPlay, type Events, type Play, type PlayIntent } from "./play";
import { PLOUGH, PLOUGH_STEPS, lineHolds, ploughBoss, type Plough } from "./plough";
import { placeBody } from "@larshansen/pixelkit/physics";
import { ICE } from "@larshansen/pixelkit/surface";
import { carefulStep } from "./careful";
import { TROLL, TROLL_STEPS, WAVE, type TrollDef } from "./troll";

// The rules every level shares from level 4 on: hearts, lives, pits, benches, skilling, the brown
// cheese, the five kinds of enemy, the bass drum and the ski pole's dash. Each on a small made-up
// level, so a rule is seen working alone.

const idle: PlayIntent = { left: false, right: false, jumpHeld: false, jumpPressed: false };
const right: PlayIntent = { ...idle, right: true };
const left: PlayIntent = { ...idle, left: true };

/** A level from a map and a few extras; the floor is `#`, ledges `_`, water `~`. */
function level(map: string[], extra: Partial<LevelDef> = {}): LevelDef {
  return {
    id: "test",
    rune: 0,
    name: "Test",
    landmark: { nb: "", en: "" },
    place: { nb: "", en: "" },
    sky: "day",
    map,
    legend: { solid: "#", oneWay: "_", water: "~" },
    ramps: [],
    carriers: [],
    timed: [],
    cannons: [],
    signs: [],
    doors: [],
    art: { back() {}, ground: () => ({ top: "", dot: "", fill: "" }), ledges: {} },
    ...extra
  };
}

/** Steps the play `n` times with the intent (or a function of the step), and returns every event. */
function steps(p: Play, n: number, intent: PlayIntent | ((i: number) => PlayIntent) = idle) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(stepPlay(p, typeof intent === "function" ? intent(i) : intent));
  return out;
}
const cx = (p: Play) => p.body.x + PLAYER.w / 2;
const feet = (p: Play) => p.body.y + PLAYER.h;

// A floor at row 6 with a pit (cols 14 to 16) and water (cols 24 to 26), a flag at 10, a bench at 20.
const PIT = level([
  "..............................",
  "..............................",
  "..............................",
  "..............................",
  "..............................",
  "..S.......f.........b.........",
  "##############...#######~~~###",
  "##############...#######~~~###"
]);

describe("hearts, pits and lives", () => {
  test("a fall into a pit takes a heart and puts him back at the last flag", () => {
    const p = newPlay(PIT);
    const ev: Events[] = [];
    for (let i = 0; i < 300 && !ev.some((e) => e.splash); i++) ev.push(stepPlay(p, right));
    expect(ev.some((e) => e.flag === 0)).toBe(true);
    expect(ev.some((e) => e.splash)).toBe(true);
    expect(p.hearts).toBe(HEARTS - 1);
    expect(p.hurt).toBe(true);
    expect(Math.abs(cx(p) - (10 * TILE + 8))).toBeLessThan(2);
  });

  test("water is the same as a pit, and he comes back on firm ground, not hanging over the edge", () => {
    const p = newPlay(PIT, { start: { x: 22 * TILE, bottom: 6 * TILE } });
    let splash = false;
    for (let i = 0; i < 120 && !splash; i++) splash = stepPlay(p, right).splash;
    expect(splash).toBe(true);
    expect(p.hearts).toBe(HEARTS - 1);
    expect(p.body.x + PLAYER.w).toBeLessThanOrEqual(24 * TILE);
  });

  test("with no hearts left a life goes, and he starts again at the flag with full hearts", () => {
    const p = newPlay(PIT);
    let lost = false;
    for (let i = 0; i < 2000 && !lost; i++) lost = stepPlay(p, right).lifeLost;
    expect(lost).toBe(true);
    expect(p.lives).toBe(2);
    expect(p.hearts).toBe(HEARTS);
    expect(Math.abs(cx(p) - (10 * TILE + 8))).toBeLessThan(2);
  });

  test("with no lives left the level is over, and nothing moves after", () => {
    const p = newPlay(PIT, { lives: 1 });
    let over = false;
    for (let i = 0; i < 3000 && !over; i++) over = stepPlay(p, right).over;
    expect(over).toBe(true);
    expect(p.run.state).toBe("over");
    const t = p.t;
    steps(p, 10, right);
    expect(p.t).toBe(t);
  });

  test("a bench: up to sit, the hearts fill, and falls bring him back to it", () => {
    const p = newPlay(PIT, { start: { x: 18 * TILE, bottom: 6 * TILE } });
    p.hearts = 1;
    steps(p, 60, (i) => (i < 30 ? right : idle));
    // Walk to the bench and sit.
    for (let i = 0; i < 200 && Math.abs(cx(p) - (20 * TILE + 8)) > 2; i++) stepPlay(p, cx(p) < 20 * TILE + 8 ? right : left);
    steps(p, 10);
    const ev = stepPlay(p, { ...idle, sit: true });
    expect(ev.bench).toBe(0);
    expect(p.hearts).toBe(HEARTS);
    expect(p.sitting).not.toBeNull();
    // He sits until he moves; then into the water, and back to the bench.
    steps(p, 20);
    expect(p.sitting).not.toBeNull();
    let splash = false;
    for (let i = 0; i < 120 && !splash; i++) splash = stepPlay(p, right).splash;
    expect(p.hearts).toBe(HEARTS - 1);
    expect(Math.abs(cx(p) - (20 * TILE + 8))).toBeLessThan(2);
  });

  test("a fall while he still blinks from a hit puts him back, but takes no second heart", () => {
    const p = newPlay(PIT);
    p.hearts = 2;
    let splash = false;
    for (let i = 0; i < 400 && !splash; i++) {
      // Hit just now, as if knocked off the edge by something.
      if (cx(p) > 13 * TILE && p.safeUntil === 0) p.safeUntil = p.t + SAFE_STEPS;
      const ev = stepPlay(p, right);
      splash = ev.splash;
      if (splash) expect(ev.hurt).toBe(false);
    }
    expect(splash).toBe(true);
    expect(p.hearts).toBe(2);
    expect(Math.abs(cx(p) - (10 * TILE + 8))).toBeLessThan(2);
  });

  test("after a fall he blinks for a second and a half and cannot be hurt", () => {
    const p = newPlay(PIT);
    let at = -1;
    for (let i = 0; i < 400 && at < 0; i++) if (stepPlay(p, right).splash) at = p.t;
    expect(p.safeUntil - at).toBe(SAFE_STEPS);
  });
});

describe("skilling and the brown cheese", () => {
  const COINS = level([".........", "S.$$$..&.", "#########"]);

  test("each skilling is taken once, counted, and climbs the chime", () => {
    const p = newPlay(COINS);
    const ev = steps(p, 120, right);
    expect(p.found).toBe(3);
    expect(ev.filter((e) => e.coin !== null).map((e) => e.coin)).toEqual([0, 1, 2]);
  });

  test("a hundred in the purse make a life", () => {
    const p = newPlay(COINS, { purse: PURSE_LIFE - 2 });
    const ev = steps(p, 60, right);
    expect(ev.filter((e) => e.life).length).toBe(1);
    expect(p.lives).toBe(4);
    expect(p.purse).toBe(1);
  });

  test("the brown cheese is a life", () => {
    const p = newPlay(COINS, { purse: 0 });
    steps(p, 120, right);
    expect(p.cheese?.at).not.toBeNull();
    expect(p.lives).toBe(4);
  });
});

describe("a visit remembers what a level has given", () => {
  const COINS = level([".........", "S.$$$..&.", "#########"]);

  test("the brown cheese taken earlier in this visit is not there again", () => {
    const p = newPlay(COINS, { cheeseTaken: true });
    const ev = steps(p, 120, right);
    expect(ev.some((e) => e.life)).toBe(false);
    expect(p.lives).toBe(3);
  });

  test("skilling taken again after a restart count on the card, but pay nothing towards a life twice", () => {
    const first = newPlay(COINS);
    steps(first, 120, right);
    expect(first.purse).toBe(3);
    const again = newPlay(COINS, { purse: first.purse, paid: [...first.paid] });
    const ev = steps(again, 120, right);
    expect(again.found).toBe(3);
    expect(ev.filter((e) => e.coin !== null).length).toBe(3);
    expect(again.purse).toBe(3);
  });

  test("an enemy beaten again after a restart pays nothing twice", () => {
    const def = level(["......", "......", "......", "......", "..S...", "######"], { enemies: [{ kind: "walker", look: "pigeon", c: 2, r: 4, range: 0, speed: 0 }] });
    const drop = (paid?: readonly number[]) => {
      const p = newPlay(def, { start: { x: 2 * TILE + 8, bottom: 2 * TILE }, paid });
      p.body.onGround = false;
      expect(steps(p, 40).some((e) => e.stomp === 0)).toBe(true);
      return p;
    };
    const first = drop();
    expect(first.purse).toBe(1);
    expect(drop([...first.paid]).purse).toBe(0);
  });
});

describe("walking to a click in a level", () => {
  /** Walks the way `intent` points as a click would, until the careful walk stops him; then lets him come to rest. */
  const stroll = (p: Play, intent: PlayIntent, n = 400) => {
    const ev = [];
    let stopped = false;
    for (let i = 0; i < n; i++) {
      const k = stopped ? null : carefulStep(p, intent);
      if (!k) stopped = true;
      ev.push(stepPlay(p, k ?? idle));
    }
    return { ev, stopped };
  };

  test("it stops at the edge of the water instead of walking in, and never jumps", () => {
    const p = newPlay(PIT, { start: { x: 21 * TILE, bottom: 6 * TILE } });
    const { ev, stopped } = stroll(p, { ...right, jumpHeld: true, jumpPressed: true });
    expect(stopped).toBe(true);
    expect(ev.some((e) => e.splash || e.step.jumped)).toBe(false);
    expect(p.body.onGround).toBe(true);
    expect(cx(p)).toBeGreaterThan(22 * TILE);
    expect(p.body.x).toBeLessThan(24 * TILE);
  });

  test("on ice it stops early enough not to slide off", () => {
    const ICY = level(["..............", "S.............", "##########...."], { surfaceAt: () => ICE });
    const p = newPlay(ICY);
    const { ev, stopped } = stroll(p, right, 600);
    expect(stopped).toBe(true);
    expect(ev.some((e) => e.splash)).toBe(false);
    expect(p.body.onGround).toBe(true);
  });

  test("it stops before an enemy instead of walking into it", () => {
    const p = newPlay(FIELD([{ kind: "walker", look: "pigeon", c: 12, r: 5, range: 0, speed: 0 }]));
    const { ev, stopped } = stroll(p, right);
    expect(stopped).toBe(true);
    expect(ev.some((e) => e.hurt)).toBe(false);
  });
});

/** A long floor for enemies to walk on, with a ledge at row 3 from column 4 to 9. */
const FIELD = (enemies: EnemyDef[], extra: Partial<LevelDef> = {}) =>
  level(["..............................", "..............................", "..............................", "....______....................", "..............................", "S.............................", "##############################"], { enemies, ...extra });

describe("enemies", () => {
  test("a walker turns at the end of its ledge, and never walks off it", () => {
    const p = newPlay(FIELD([{ kind: "walker", look: "pigeon", c: 6, r: 2 }]), { start: { x: 28 * TILE, bottom: 6 * TILE } });
    const xs: number[] = [];
    for (let i = 0; i < 1200; i++) {
      stepPlay(p, idle);
      xs.push(p.enemies[0].x);
    }
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(4 * TILE);
    expect(Math.max(...xs)).toBeLessThanOrEqual(10 * TILE);
    expect(p.enemies[0].y).toBe(3 * TILE);
  });

  test("walking into a walker costs a heart and knocks him back", () => {
    const p = newPlay(FIELD([{ kind: "walker", look: "pigeon", c: 8, r: 5, range: 0, speed: 0 }]));
    const ev = steps(p, 120, right);
    expect(ev.filter((e) => e.hurt).length).toBe(1);
    expect(p.hearts).toBe(HEARTS - 1);
    expect(cx(p)).toBeLessThan(8 * TILE);
  });

  test("landing on a walker beats it, bounces him (higher with the jump held) and gives a skilling", () => {
    const run = (held: boolean) => {
      const p = newPlay(FIELD([{ kind: "walker", look: "pigeon", c: 14, r: 5, range: 0, speed: 0 }]), { start: { x: 14 * TILE + 8, bottom: 2 * TILE } });
      p.body.onGround = false;
      let top = Infinity;
      let stomp = false;
      for (let i = 0; i < 80; i++) {
        const ev = stepPlay(p, { ...idle, jumpHeld: held });
        if (ev.stomp !== null) stomp = true;
        if (stomp) top = Math.min(top, feet(p));
      }
      return { p, stomp, rise: 6 * TILE - 8 - top };
      // (the walker's back is at 6 * TILE - 8)
    };
    const held = run(true);
    const plain = run(false);
    expect(held.stomp).toBe(true);
    expect(held.p.enemies[0].alive).toBe(false);
    expect(held.p.hearts).toBe(HEARTS);
    expect(held.p.purse).toBe(1);
    expect(held.rise).toBeGreaterThan(plain.rise + 20);
    expect(STOMP.held).toBeGreaterThan(STOMP.plain);
  });

  test("landing on a spiky thing hurts instead, and throws him off it", () => {
    const p = newPlay(FIELD([{ kind: "spiky", look: "hedgehog", c: 14, r: 5, range: 0, speed: 0 }]), { start: { x: 14 * TILE + 8, bottom: 2 * TILE } });
    p.body.onGround = false;
    const ev = steps(p, 60);
    expect(ev.some((e) => e.hurt)).toBe(true);
    expect(p.enemies[0].alive).toBe(true);
  });

  test("a flyer waves up and down along its line, and can be landed on", () => {
    const p = newPlay(FIELD([{ kind: "flyer", look: "gull", c: 6, r: 3, range: 2, rise: 8, period: 120 }]), { start: { x: 28 * TILE, bottom: 6 * TILE } });
    const ys: number[] = [];
    for (let i = 0; i < 240; i++) {
      stepPlay(p, idle);
      ys.push(p.enemies[0].y);
    }
    expect(Math.max(...ys) - Math.min(...ys)).toBe(16);
    const q = newPlay(FIELD([{ kind: "flyer", look: "gull", c: 14, r: 4, range: 0, rise: 0, period: 120 }]), { start: { x: 14 * TILE + 8, bottom: 1 * TILE } });
    q.body.onGround = false;
    expect(steps(q, 60).some((e) => e.stomp === 0)).toBe(true);
  });

  test("a thrower winds up for a full second before every throw, and what it throws hurts", () => {
    const def = FIELD([{ kind: "thrower", look: "kid", c: 11, r: 5, period: 170 }]);
    const p = newPlay(def, { start: { x: 7 * TILE, bottom: 6 * TILE } });
    const e = p.enemies[0];
    let throws = 0;
    let hurt = false;
    for (let i = 0; i < 400; i++) {
      // A throw only ever comes after WINDUP steps of the arm going up.
      if (untilThrow(e, p.t + 1) === 0) for (let k = 1; k <= WINDUP; k++) expect(windingUp(e, p.t + 1 - k)).toBe(true);
      const ev = stepPlay(p, idle);
      throws += ev.thrown.length;
      hurt = hurt || ev.hurt;
    }
    expect(throws).toBeGreaterThan(0);
    expect(hurt).toBe(true);
    expect(WINDUP).toBeGreaterThanOrEqual(60);
  });

  test("a thrower does not throw at him from far away", () => {
    const p = newPlay(FIELD([{ kind: "thrower", look: "kid", c: 28, r: 5, period: 170 }]), { start: { x: 1 * TILE, bottom: 6 * TILE } });
    expect(steps(p, 400).some((e) => e.thrown.length > 0)).toBe(false);
  });

  test("a jumper ripples for a second, then leaps out and goes back under", () => {
    const def = FIELD([{ kind: "jumper", look: "salmon", c: 12, r: 6, rise: 40, period: 200 }]);
    const p = newPlay(def);
    const e = p.enemies[0];
    let rippleBefore = true;
    for (let t = 1; t < 400; t++) if (leap(e, t).up > 0 && leap(e, t - 1).up === 0) rippleBefore = rippleBefore && leap(e, t - 2).ripple;
    expect(rippleBefore).toBe(true);
    const ups = Array.from({ length: 200 }, (_, t) => leap(e, t).up);
    expect(Math.max(...ups)).toBe(40);
    expect(ups.filter((u) => u === 0).length).toBeGreaterThan(100);
  });

  test("after a hit he cannot be hit again for a second and a half", () => {
    const p = newPlay(FIELD([{ kind: "walker", look: "pigeon", c: 4, r: 5, range: 0, speed: 0 }, { kind: "walker", look: "pigeon", c: 1, r: 5, range: 0, speed: 0 }]), { start: { x: 3 * TILE, bottom: 6 * TILE } });
    const ev = steps(p, 60, right);
    expect(ev.filter((e) => e.hurt).length).toBe(1);
  });
});

describe("the bass drum", () => {
  test("landing on it throws him far higher than a jump", () => {
    const p = newPlay(level(["........", "........", "........", "........", "........", "........", "........", "S..d....", "########"], { drum: 7 }));
    let top = Infinity;
    const ev = steps(p, 120, (i) => (i < 40 ? right : idle));
    for (const _ of ev) void _;
    // Walk onto it again to measure.
    const q = newPlay(level(["........", "........", "........", "........", "........", "........", "........", "S..d....", "########"], { drum: 7 }));
    for (let i = 0; i < 120; i++) {
      stepPlay(q, i < 30 ? right : idle);
      top = Math.min(top, feet(q));
    }
    expect(ev.some((e) => e.drum === 0)).toBe(true);
    expect(8 * TILE - top).toBeGreaterThan(80);
  });
});

describe("the ski pole", () => {
  const OPEN = level(["..............................", "..............................", "S.............................", "##############################"]);

  test("without the pole nothing happens", () => {
    const p = newPlay(OPEN);
    expect(steps(p, 5, { ...idle, dash: true }).some((e) => e.dash)).toBe(false);
  });

  test("a dash is three tiles in ten steps, level, the way he faces", () => {
    const p = newPlay(OPEN, { pole: true });
    steps(p, 3, right);
    steps(p, 30);
    const x0 = p.body.x;
    const y0 = p.body.y;
    stepPlay(p, { ...idle, jumpHeld: true, jumpPressed: true });
    steps(p, 8, { ...idle, jumpHeld: true });
    const air = p.body.y;
    const ev = stepPlay(p, { ...idle, dash: true });
    expect(ev.dash).toBe(true);
    const xStart = p.body.x - DASH.speed;
    steps(p, DASH.steps - 1);
    expect(p.body.x - xStart).toBeCloseTo(DASH.steps * DASH.speed, 5);
    expect(p.body.y).toBeCloseTo(air, 5);
    expect(p.body.x).toBeGreaterThan(x0);
    expect(y0).toBeGreaterThan(air);
  });

  test("once per time in the air; landing gives it back", () => {
    const p = newPlay(OPEN, { pole: true });
    stepPlay(p, { ...idle, jumpHeld: true, jumpPressed: true });
    let dashes = 0;
    for (let i = 0; i < 80 && !(p.body.onGround && !p.dash); i++) if (stepPlay(p, { ...idle, jumpHeld: true, dash: i % 3 === 0 }).dash) dashes++;
    expect(dashes).toBe(1);
    steps(p, 80);
    expect(p.body.onGround).toBe(true);
    expect(stepPlay(p, { ...idle, dash: true }).dash).toBe(true);
  });
});

describe("zones", () => {
  // A waterfall over the floor at columns 10 and 11, and a current along columns 20 to 27.
  const FALLS = level(["..............................", "..............................", "..............................", "..............................", "S.............................", "##############################"], {
    zones: [
      { x: 10 * TILE, y: 0, w: 2 * TILE, h: 5 * TILE, push: { x: 0, y: 0.6 } },
      { x: 20 * TILE, y: 3 * TILE, w: 8 * TILE, h: 2 * TILE, push: { x: 0.5, y: 0 } }
    ]
  });

  test("under a waterfall his jump is pressed down; the dash goes straight through it", () => {
    const p = newPlay(FALLS, { start: { x: 11 * TILE, bottom: 5 * TILE }, pole: true });
    let top = Infinity;
    for (let i = 0; i < 60; i++) {
      stepPlay(p, { ...idle, jumpHeld: i < 40, jumpPressed: i === 0 });
      top = Math.min(top, feet(p));
    }
    expect(5 * TILE - top).toBeLessThan(20);
    // From beside it, a jump and a dash at its top cross it level.
    const q = newPlay(FALLS, { start: { x: 8 * TILE + 8, bottom: 5 * TILE }, pole: true });
    for (let i = 0; i < 14; i++) stepPlay(q, { ...right, jumpHeld: true, jumpPressed: i === 0 });
    const y = q.body.y;
    stepPlay(q, { ...right, dash: true });
    for (let i = 0; i < 9; i++) {
      stepPlay(q, right);
      expect(q.body.y).toBeCloseTo(y, 5);
    }
    expect(q.body.x).toBeGreaterThan(12 * TILE);
  });

  test("a current carries him along while he stands in it", () => {
    const p = newPlay(FALLS, { start: { x: 21 * TILE, bottom: 5 * TILE } });
    steps(p, 40);
    expect(cx(p) - 21 * TILE).toBeCloseTo(20, 0);
  });
});

describe("the troll", () => {
  // A clearing on a floor at row 8, from column 10 to 34; the troll sleeps at 30; the dawn falls on 18 to 22, then 22 to 26, then 26 to 30.
  const ARENA: TrollDef = { floor: 8 * TILE, x0: 10 * TILE, x1: 34 * TILE, x: 30 * TILE, wakeAt: 14 * TILE, dawn: [[18 * TILE, 22 * TILE], [22 * TILE, 26 * TILE], [26 * TILE, 30 * TILE]] };
  const CLEARING = level(
    ["....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "S............................r......", "####################################"],
    { troll: ARENA }
  );
  const at = (x: number) => newPlay(CLEARING, { start: { x, bottom: 8 * TILE } });

  test("it sleeps until he comes into the clearing, then takes a long, loud while to wake", () => {
    const p = at(12 * TILE);
    expect(steps(p, 100).some((e) => e.troll)).toBe(false);
    const q = at(15 * TILE);
    const ev = steps(q, TROLL_STEPS.waking);
    expect(ev.findIndex((e) => e.troll === "wake")).toBe(0);
    expect(q.troll!.x).toBe(ARENA.x);
    steps(q, 2);
    expect(q.troll!.phase).toBe("walk");
    expect(q.troll!.x).toBeLessThan(ARENA.x);
  });

  test("it raises its club for a full second before every slam", () => {
    const p = at(16 * TILE);
    const ev = steps(p, 1500);
    const ups = ev.flatMap((e, i) => (e.troll === "windup" ? [i] : []));
    const slams = ev.flatMap((e, i) => (e.troll === "slam" ? [i] : []));
    expect(slams.length).toBeGreaterThan(0);
    for (const s of slams) expect(s - Math.max(...ups.filter((u) => u < s))).toBeGreaterThanOrEqual(60);
  });

  test("its slam sends a wave along the ground that hurts unless he is in the air", () => {
    const p = at(16 * TILE);
    const ev = steps(p, 1500, () => (p.troll!.phase === "windup" ? left : idle));
    expect(ev.some((e) => e.hurt)).toBe(true);
    // The same, jumping as the club comes down: the wave goes under him.
    const q = at(16 * TILE);
    let hurt = false;
    for (let i = 0; i < 400 && !hurt; i++) {
      const t = q.troll!;
      const slamming = t.phase === "windup" && q.t - t.since >= TROLL_STEPS.windup - 4;
      hurt = stepPlay(q, t.phase === "windup" && !slamming ? left : { ...idle, jumpHeld: slamming || !q.body.onGround, jumpPressed: slamming }).hurt;
      if (t.phase === "stuck" && q.t - t.since > WAVE.steps) break;
    }
    expect(hurt).toBe(false);
  });

  test("stuck in the dawn with his headlamp on it, a third of it turns to stone; looking away, or out of the dawn, nothing", () => {
    // He stands just left of the dawn and looks right, at it: it stops in the light to slam.
    const look = (face: PlayIntent, x: number) => {
      const p = at(x);
      steps(p, 1200, () => {
        const t = p.troll!;
        if (t.phase === "windup" && p.t - t.since < 8) return left;
        if (t.phase === "stuck" && p.t - t.since > 2 && p.t - t.since < 6) return face;
        return idle;
      });
      return p;
    };
    // The jumps are left out here: the wave is allowed to hurt, the hits are what is counted.
    expect(look(right, 17 * TILE).troll!.hits).toBeGreaterThan(0);
    expect(look(left, 17 * TILE).troll!.hits).toBe(0);
    expect(look(right, 15 * TILE).troll!.hits).toBe(0);
  });

  test("three hits and it is stone for good: it hurts nobody, holds him up, and the rune shows on it", () => {
    const p = at(16 * TILE);
    const t = p.troll!;
    t.phase = "stuck";
    for (const x of [20, 24, 28]) {
      t.x = x * TILE;
      t.phase = "stuck";
      t.since = p.t;
      p.body.x = (x - 3) * TILE;
      p.body.facing = 1;
      p.safeUntil = p.t + 1000;
      steps(p, TROLL_STEPS.hit + 2);
    }
    expect(t.hits).toBe(3);
    expect(t.phase as string).toBe("stone");
    expect(p.rune!.x + p.rune!.w / 2).toBeCloseTo(t.x, 0);
    expect(p.rune!.y + p.rune!.h).toBeLessThanOrEqual(ARENA.floor - TROLL.h);
    expect(extraGround(p).some((c) => c.y === ARENA.floor - TROLL.h && c.x < t.x && c.x + c.w > t.x)).toBe(true);
  });

  test("the rune cannot be taken while the troll is awake", () => {
    const p = at(29 * TILE);
    p.troll!.phase = "walk";
    p.troll!.x = 20 * TILE;
    steps(p, 30, (i) => (i < 20 ? right : idle));
    expect(p.runeAt).toBeNull();
  });

  test("Game over in its fight: he goes on from the bench before it, with three lives and full hearts, the troll asleep and whole again", () => {
    const BENCHED = level(["....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "....................................", "S.....b......................r......", "####################################"], { troll: ARENA });
    const p = newPlay(BENCHED, { start: { x: 16 * TILE, bottom: 8 * TILE }, lives: 1 });
    p.troll!.hits = 2;
    p.hearts = 1;
    let over = false;
    for (let i = 0; i < 1500 && !over; i++) over = stepPlay(p, p.troll!.phase === "walk" ? right : idle).over;
    expect(over).toBe(true);
    expect(p.overAtBoss).toBe(true);
    againAtBoss(p);
    expect(p.run.state).toBe("running");
    expect([p.lives, p.hearts]).toEqual([LIVES, HEARTS]);
    expect(Math.abs(cx(p) - (6 * TILE + 8))).toBeLessThan(2);
    expect([p.troll!.phase, p.troll!.hits, p.troll!.x]).toEqual(["asleep", 0, ARENA.x]);
    // Away from a fight, Game over is the whole level again.
    const lost = (() => {
      const r = newPlay(PIT, { lives: 1 });
      r.hearts = 1;
      let o = false;
      for (let i = 0; i < 600 && !o; i++) o = stepPlay(r, right).over;
      return r;
    })();
    expect(lost.run.state).toBe("over");
    expect(lost.overAtBoss).toBe(false);
  });

  test("a life lost sends it back to sleep where it started, and the stone it has turned to stays", () => {
    const p = newPlay(CLEARING, { start: { x: 16 * TILE, bottom: 8 * TILE }, lives: 2 });
    p.troll!.hits = 1;
    p.hearts = 1;
    let lost = false;
    for (let i = 0; i < 1500 && !lost; i++) lost = stepPlay(p, p.troll!.phase === "walk" ? right : idle).lifeLost;
    expect(lost).toBe(true);
    expect(p.troll!.phase).toBe("asleep");
    expect(p.troll!.x).toBe(ARENA.x);
    expect(p.troll!.hits).toBe(1);
  });
});

describe("hazards and gusts", () => {
  // A floor at row 6 with a one-tile trench (cols 10 and 11) whose bottom is live, as the third rail is.
  const RAIL = level(
    ["....................", "....................", "....................", "....................", "....................", "..S.................", "##########..########", "####################"],
    { hazards: [{ x: 10 * TILE, y: 7 * TILE - 4, w: 2 * TILE, h: 4 }] }
  );

  test("walking into the live trench costs a heart, throws him clear and back, and he blinks; he is not hurt again", () => {
    const p = newPlay(RAIL);
    const ev = steps(p, 240, (i) => (i < 100 ? right : idle));
    expect(ev.filter((e) => e.zap).length).toBe(1);
    expect(p.hearts).toBe(HEARTS - 1);
    expect(p.body.onGround).toBe(true);
    expect(feet(p)).toBe(6 * TILE);
    expect(cx(p)).toBeLessThan(10 * TILE);
  });

  test("a hazard on a beat hurts only while live, and warns for a second first", () => {
    const beat = { rest: 100, warn: 60, live: 40 };
    const SPARK = level(["....", "..S.", "####"], { hazards: [{ x: 0, y: 0, w: 4 * TILE, h: 2 * TILE, beat }] });
    const p = newPlay(SPARK);
    const ev = steps(p, 199);
    expect(ev.findIndex((e) => e.zap)).toBe(160 - 1);
    expect(ev.filter((e) => e.zap).length).toBe(1);
  });

  test("a gust only pushes him while it is live", () => {
    const FLAT = level([".....................................", "..S..................................", "#####################################"], { zones: [{ x: 0, y: 0, w: 37 * TILE, h: 3 * TILE, push: { x: 0.5, y: 0 }, beat: { rest: 60, warn: 60, live: 60 } }] });
    const p = newPlay(FLAT);
    const x0 = cx(p);
    steps(p, 119);
    expect(cx(p)).toBe(x0);
    steps(p, 60);
    expect(cx(p) - x0).toBeCloseTo(30, 0);
  });

  test("sheep on a knoll stand where they are put when the level says so", () => {
    const KNOLL = level(["..........", "..S..e....", "##########"], { sheepRange: 0 });
    const p = newPlay(KNOLL);
    const x = p.sheep[0].x;
    steps(p, 600);
    expect(p.sheep[0].x).toBe(x);
  });
});

describe("the last boss: the plough", () => {
  // A street at row 10, sixty tiles long; the plough parked at its right, a line by a bank at the left.
  const row = (ch: string) => ch.repeat(60);
  const street = [row("."), row("."), row("."), row("."), row("."), row("."), row("."), row("."), row("."), "..S" + ".".repeat(57), row("#"), row("#")];
  const DEF = {
    floor: 10 * TILE,
    x: 50 * TILE,
    wakeAt: 10 * TILE,
    rounds: [
      { x0: 20 * TILE, x1: 50 * TILE, sticks: true },
      { x0: 18 * TILE, x1: 50 * TILE, sticks: true },
      { x0: 30 * TILE, x1: 50 * TILE, sticks: false }
    ],
    line: { x0: 14 * TILE, x1: 17 * TILE, y: 10 * TILE - 28, speed: 7 }
  };
  const STREET = level(street, { boss: ploughBoss(DEF) });
  const plough = (p: Play) => p.boss!.state as Plough;

  test("parked, it does nothing and hurts nobody until he comes along; then it wakes, drives at him, and telegraphs a full second before every charge", () => {
    const p = newPlay(STREET, { start: { x: 5 * TILE, bottom: 10 * TILE } });
    steps(p, 100);
    expect(plough(p).phase).toBe("parked");
    const ev = steps(p, 1200, (i) => (i < 90 ? right : idle));
    const names = ev.map((e) => e.boss);
    expect(names).toContain("wake");
    names.forEach((e, i) => {
      if (e === "charge") expect(i - names.lastIndexOf("windup", i)).toBeGreaterThanOrEqual(PLOUGH_STEPS.windup);
    });
    expect(names.filter((e) => e === "charge").length).toBeGreaterThanOrEqual(1);
  });

  test("its cab is a hit from above (the line throws him there), and a lost life sends it back parked with its hits kept; the line holds only for the first", () => {
    const p = newPlay(STREET, { start: { x: 15 * TILE, bottom: 10 * TILE } });
    const pl = plough(p);
    // Put it where he can land on it, awake, and drop him onto its roof.
    Object.assign(pl, { phase: "stuck", since: p.t, x: 20 * TILE });
    placeBody(p.body, 20 * TILE, 10 * TILE - PLOUGH.h - 20);
    p.body.onGround = false;
    let hit = false;
    for (let i = 0; i < 40 && !hit; i++) hit = stepPlay(p, idle).boss === "hit";
    expect(hit).toBe(true);
    expect(pl.hits).toBe(1);
    expect(lineHolds(pl)).toBe(false);
    // Lose a life: parked again where it started, the hit kept.
    p.hearts = 1;
    Object.assign(pl, { phase: "drive", since: p.t, x: cx(p) + 20 });
    p.safeUntil = 0;
    placeBody(p.body, cx(p), 10 * TILE);
    let lost = false;
    for (let i = 0; i < 60 && !lost; i++) lost = stepPlay(p, idle).lifeLost;
    expect(lost).toBe(true);
    expect(pl.phase).toBe("parked");
    expect(pl.x).toBe(DEF.x);
    expect(pl.hits).toBe(1);
  });

  test("Game over in its fight: on again from the bench before it, the plough parked with no hits", () => {
    const BENCHED = level([...street.slice(0, 9), "..S.b" + ".".repeat(55), row("#"), row("#")], { boss: ploughBoss(DEF) });
    const p = newPlay(BENCHED, { start: { x: 34 * TILE, bottom: 10 * TILE }, lives: 1 });
    const pl = plough(p);
    Object.assign(pl, { phase: "drive", since: p.t, x: cx(p) + 40, hits: 2 });
    p.hearts = 1;
    let over = false;
    for (let i = 0; i < 600 && !over; i++) over = stepPlay(p, idle).over;
    expect(over).toBe(true);
    expect(p.overAtBoss).toBe(true);
    againAtBoss(p);
    const again = plough(p);
    expect([again.phase, again.hits, again.x]).toEqual(["parked", 0, DEF.x]);
    expect([p.lives, p.hearts]).toEqual([LIVES, HEARTS]);
    expect(Math.abs(cx(p) - (4 * TILE + 8))).toBeLessThan(2);
  });

  test("three hits, and it parks for good; only then does the rune show", () => {
    const p = newPlay(STREET);
    const pl = plough(p);
    for (let k = 0; k < 3; k++) {
      Object.assign(pl, { phase: "stuck", since: p.t, x: 30 * TILE });
      placeBody(p.body, 30 * TILE, 10 * TILE - PLOUGH.h - 20);
      p.body.onGround = false;
      p.safeUntil = p.t + 999;
      for (let i = 0; i < 40 && pl.hits === k; i++) stepPlay(p, idle);
      steps(p, PLOUGH_STEPS.hit + 2);
    }
    expect(pl.hits).toBe(3);
    expect(pl.phase).toBe("beaten");
    expect(runeFree(p)).toBe(true);
  });
});
