import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { TILE } from "@larshansen/pixelkit/config";
import { placeBody } from "@larshansen/pixelkit/physics";
import { ENEMY, ROLES } from "@larshansen/pixelkit/palette";
import { playMoves } from "../game/bot";
import { LOKI_SETS, LOKI_STEPS, LOKI_TELLS, type Loki } from "../game/loki";
import { PLOUGH_STEPS } from "../game/plough";
import { allRunes, fresh, hasProgress, readProgress, writeProgress, type Progress } from "../game/progress";
import { SERPENT_STEPS } from "../game/serpent";
import { SHIELD_RULES } from "../game/shield";
import { ENCORE as WORDS, STORY } from "../game/story";
import { TROLL_STEPS } from "../game/troll";
import { newPlay, stepPlay, type Play } from "../game/play";
import { deltaE, parseColour } from "../render/fields";
import { PLAIN, lokiFrames } from "../render/loki";
import { ENCORE, FLOOR, STAGE } from "./encore";
import { BUILT, ENCORE_STOP, LINE, ORDER } from "./index";
import { ENCORE_COL, ENCORE_COLS, KART_COLS, kartDef, kartMap, lineTwoOpen } from "./kart";
import { kartArt } from "./kartArt";
import { ENCORE_ROUTE } from "./routes/encore";

// The encore (order 29, ADR 0052): a stop that is there only once every rune of both lines is held, and that changes
// nothing else; Loki's tells as long as the bosses' he borrows them from; the fight won by the scripted player and by the
// sloppy one; the story's existing lines untouched.

const all = (): Progress => ({ ...fresh(), cleared: [...ORDER], best: Object.fromEntries(ORDER.map((id) => [id, 60000])) });
const play = () => newPlay(ENCORE, { pole: true, shield: SHIELD_RULES, hasShield: true });

describe("the stop", () => {
  test("is not on the map with any rune missing: the map and its doors are exactly as before", () => {
    for (const missing of ORDER) {
      const p: Progress = { ...all(), cleared: ORDER.filter((id) => id !== missing) };
      const def = kartDef(p, kartArt);
      expect(def.map).toEqual(kartMap(lineTwoOpen(p)));
      expect(def.map[0].length).toBe(KART_COLS);
      expect(def.doors.some((d) => d.id === ENCORE_STOP.id)).toBe(false);
      expect(def.map.some((row) => row.includes("E"))).toBe(false);
    }
    for (const p of [fresh(), { ...fresh(), cleared: ORDER.slice(0, 10) }]) expect(kartDef(p, kartArt).map).toEqual(kartMap(lineTwoOpen(p)));
  });

  test("is on it with every rune: past the last station, a door like any other, on the line", () => {
    const def = kartDef(all(), kartArt);
    expect(def.map[0].length).toBe(ENCORE_COLS);
    const door = def.doors.find((d) => d.id === ENCORE_STOP.id)!;
    expect(door.href).toBe("#encore");
    expect(def.map[10][ENCORE_COL]).toBe("E");
    expect(def.map[11][ENCORE_COL]).toBe("O");
    for (const row of def.map) expect(row.length).toBe(ENCORE_COLS);
  });

  test("gives no rune and changes no total: not a station of either line, its best time kept and nothing else", () => {
    expect(ENCORE.rune).toBe(-1);
    expect(ORDER).not.toContain(ENCORE_STOP.id);
    expect(LINE.some((l) => l.id === ENCORE_STOP.id)).toBe(false);
    expect(BUILT.some((l) => l.id === ENCORE_STOP.id)).toBe(false);
    expect(ENCORE.map.some((row) => row.includes("r") || row.includes("o") || row.includes("$") || row.includes("&"))).toBe(false);
    // A best time for the encore: read back as written, and no count of runes, progress or lines changes with it.
    const seen = { ...all(), best: { ...all().best, encore: 41000 } };
    expect(readProgress(writeProgress(seen))).toEqual(seen);
    expect(allRunes(seen, ORDER)).toBe(allRunes(all(), ORDER));
    expect(hasProgress({ ...fresh(), best: { encore: 41000 } })).toBe(false);
  });
});

describe("the stage", () => {
  test("a flat floor and no pits: ground under every column, the water only under the deck", () => {
    for (let c = 0; c < ENCORE.map[0].length; c++) expect("#GD").toContain(ENCORE.map[FLOOR][c]);
    for (let r = 0; r < FLOOR; r++) expect(ENCORE.map[r]).not.toContain("~");
  });
  test("one screen and a half of stage, a flag and a bench before it", () => {
    const w = (STAGE.c1 - STAGE.c0) * TILE;
    expect(w).toBeGreaterThanOrEqual(1.4 * 320);
    expect(w).toBeLessThanOrEqual(1.6 * 385);
    const flag = ENCORE.map[FLOOR - 1].indexOf("f");
    const bench = ENCORE.map[FLOOR - 1].indexOf("b");
    expect(flag).toBeGreaterThan(0);
    expect(bench).toBeGreaterThan(flag);
    expect(bench).toBeLessThan(STAGE.c0);
  });
});

describe("Loki", () => {
  test("every attack has a tell at least as long as the shortest of the three bosses' tells", () => {
    const shortest = Math.min(TROLL_STEPS.windup, PLOUGH_STEPS.windup, ...SERPENT_STEPS.tell);
    expect(shortest).toBe(60);
    for (const [attack, t] of Object.entries(LOKI_TELLS)) expect(t.steps, attack).toBeGreaterThanOrEqual(shortest);
    // The bite borrows the serpent's ring of foam: as long as its ring.
    expect(LOKI_TELLS.bite.steps).toBeGreaterThanOrEqual(SERPENT_STEPS.ring);
  });

  test("in play, each tell is seen that long before the move it tells of", () => {
    const p = play();
    const r = playMoves(p, ENCORE_ROUTE, { max: 60 * 120 });
    const at = (name: string) => r.events.map((e, i) => (e.boss === name ? i : -1)).filter((i) => i >= 0);
    for (const [tell, move, steps] of [["club", "slam", LOKI_STEPS.club], ["rev", "charge", LOKI_STEPS.rev], ["ring", "bite", LOKI_STEPS.ring]] as const) {
      const ts = at(tell);
      expect(ts.length, tell).toBeGreaterThan(0);
      for (const t of ts) expect(at(move).find((m) => m > t)! - t, `${tell} to ${move}`).toBeGreaterThanOrEqual(steps);
    }
  });

  test("each phase brings in its move first: the club, then the charge, then the bite", () => {
    expect(LOKI_SETS.map((s) => s[0])).toEqual(["club", "charge", "bite"]);
  });

  test("the scripted player wins: three stomps as he poses, no heart lost, and he leaves; the clock stops", () => {
    const p = play();
    const r = playMoves(p, ENCORE_ROUTE, { max: 60 * 120 });
    expect(r.done).toBe(true);
    expect(r.hurt).toEqual([]);
    const s = p.boss!.state as Loki;
    expect(s.hits).toBe(3);
    expect(s.phase).toBe("gone");
    expect(p.run.state).toBe("done");
    expect(r.events.filter((e) => e.boss === "hit").length).toBe(3);
    expect(r.events.some((e) => e.boss === "gone")).toBe(true);
    expect(p.runeAt).toBeNull();
    expect(r.seconds).toBeGreaterThan(15);
    expect(r.seconds).toBeLessThan(60);
  });

  test("a stomp hits only while he poses; standing still on the stage, he is hit by the club, and the hint says so", () => {
    const p = play();
    // He walks onto the stage and stands there: the club comes, and hurts.
    let saw = "";
    for (let i = 0; i < 1200 && !saw; i++) {
      const ev = stepPlay(p, { left: false, right: (p.body.x as number) < 20 * TILE, jumpHeld: false, jumpPressed: false });
      if (ev.boss?.startsWith("miss")) saw = ev.boss;
    }
    expect(saw).toBe("missClub");
    expect(p.hearts).toBeLessThan(3);
    expect((p.boss!.state as Loki).hits).toBe(0);
  });

  test("the shield works as anywhere: held facing his slide it stops it (he skids and poses); it never stops the club's wave", () => {
    const p = play();
    playMoves(p, ENCORE_ROUTE, { max: 60 * 60, until: (q) => (q.boss!.state as Loki).phase === "rev" });
    const s = p.boss!.state as Loki;
    expect(s.attack).toBe("charge");
    // On the floor in the slide's way (the route would be up on a speaker by now), the shield up facing him, until he has slid into it.
    placeBody(p.body, s.x + s.dir * 4 * TILE, FLOOR * TILE);
    p.body.onGround = true;
    let posed = false;
    let hurt = false;
    let blocked = false;
    for (let i = 0; i < 400 && !posed; i++) {
      const toward = s.x < p.body.x;
      const ev = stepPlay(p, { left: toward && p.body.facing > 0, right: !toward && p.body.facing < 0, jumpHeld: false, jumpPressed: false, shield: true });
      hurt ||= ev.hurt;
      blocked ||= ev.blocked;
      posed = s.phase === "pose";
    }
    expect(blocked).toBe(true);
    expect(posed).toBe(true);
    expect(hurt).toBe(false);
  });

  test("a lost life in the fight puts him back at the bench before the stage, and Loki at his mark, his hits kept", () => {
    const p = play();
    playMoves(p, ENCORE_ROUTE, { max: 60 * 60, until: (q) => (q.boss!.state as Loki).hits === 1 && (q.boss!.state as Loki).phase === "strut" });
    p.hearts = 1;
    p.safeUntil = 0;
    let lost = false;
    for (let i = 0; i < 2000 && !lost; i++) lost = stepPlay(p, { left: false, right: false, jumpHeld: false, jumpPressed: false }).lifeLost;
    expect(lost).toBe(true);
    const s = p.boss!.state as Loki;
    expect(s.phase).toBe("asleep");
    expect(s.hits).toBe(1);
    expect(p.body.x + 5).toBeLessThan(STAGE.c0 * TILE);
  });
});

describe("the sloppy player", () => {
  test("wins the encore on most seeds at a person's timing (±2 steps), as at the serpent", async () => {
    const { LEVELS, POLE } = await import("../../tools/review/common.ts");
    const { reference, sloppyRun } = await import("../../tools/review/sloppy.ts");
    const [id, def, moves] = LEVELS.find((l) => l[0] === "encore")!;
    const ref = reference(def, moves as never[], POLE.has(id));
    let won = 0;
    for (let seed = 201; seed < 211; seed++) if (sloppyRun(id, def, moves as never[], ref, { k: 2, drop: 0, overhold: 0, seed, pole: true }).outcome === "clear") won++;
    expect(won).toBeGreaterThanOrEqual(5);
  }, 120_000);
});

describe("the words", () => {
  test("the story's lines before the encore's block are order 27's, unchanged", () => {
    const text = readFileSync(join(import.meta.dir, "../game/story.ts"), "utf8");
    const at = text.indexOf("\n// ---------------------------------------------------------------------------------------------------------------------\n// THE ENCORE");
    expect(at).toBeGreaterThan(0);
    // The file as it was on origin/main before order 29 (its sha256), and that is everything above the block.
    expect(createHash("sha256").update(text.slice(0, at)).digest("hex")).toBe("d5c4925407a74c63c2b73613d18c07389bd3b28052c225846d80a2a446b5e2aa");
    expect(STORY.en.opening.length).toBe(4);
  });

  test("every encore line in both languages, short enough for a bubble at 360 wide, and nobody named", () => {
    for (const lang of ["en", "nb"] as const) {
      for (const [k, v] of Object.entries(WORDS[lang])) {
        expect(v.length, `${lang} ${k}`).toBeGreaterThan(0);
        if (k !== "ending") for (const line of v.split("\n")) expect(line.length, `${lang} ${k}: ${line}`).toBeLessThanOrEqual(44);
        expect(v).not.toMatch(/Trump|Donald/);
      }
      expect(Object.keys(WORDS[lang]).sort()).toEqual(Object.keys(WORDS.en).sort());
    }
    // The invoice or the client: at most once in the encore's words.
    const told = JSON.stringify(WORDS).match(/invoice|client|faktura|klient/gi) ?? [];
    expect(told.length).toBeLessThanOrEqual(2);
  });
});

describe("his colours", () => {
  const rgb = (c: string) => parseColour(c)!.rgb;
  test("under the glamour every colour of his is the enemy palette's (he is the Invaders' front man)", () => {
    const enemy = new Set<string>(Object.values(ENEMY));
    for (const f of lokiFrames().filter((f) => !f.name.endsWith("plain"))) for (const c of f.ink) expect(enemy.has(c), `${f.name}: ${c}`).toBe(true);
  });
  test("plain, nothing of him is neon or near a role's colour", () => {
    for (const c of new Set(Object.values(PLAIN))) {
      for (const n of ROLES.glamour) expect(deltaE(rgb(c), rgb(n)), `${c} near ${n}`).toBeGreaterThanOrEqual(8);
      for (const [role, cs] of Object.entries(ROLES.COLOURS)) if (role !== "enemy") for (const r of cs) expect(deltaE(rgb(c), rgb(r)), `${c} near ${role} ${r}`).toBeGreaterThanOrEqual(10);
    }
  });
});
