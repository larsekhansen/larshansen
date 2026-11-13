import { describe, expect, test } from "bun:test";
import { DASH, PLAYER, TILE } from "@larshansen/pixelkit/config";
import type { LevelDef } from "../levels/types";
import { WINDUP, leap, untilThrow, windingUp, type EnemyDef } from "./enemies";
import { HEARTS, PURSE_LIFE, SAFE_STEPS, STOMP, newPlay, stepPlay, type Play, type PlayIntent } from "./play";

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
    const ev = steps(p, 300, right);
    expect(ev.some((e) => e.flag === 0)).toBe(true);
    expect(ev.some((e) => e.splash)).toBe(true);
    expect(p.hearts).toBe(HEARTS - 1);
    expect(p.hurt).toBe(true);
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
