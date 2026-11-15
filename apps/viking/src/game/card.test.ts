import { describe, expect, test } from "bun:test";
import { CARD_AUTO, CARD_GRACE, arriveAfterClear, cardActions, cardGoes, cardKey } from "./card";
import { clearLevel, fresh, isOpen } from "./progress";
import { BUILT, ORDER } from "../levels/index";
import { kartMap, lineTwoOpen, stationX, GATE_COL } from "../levels/kart";
import { TILE } from "@larshansen/pixelkit/config";

// The card at a level's end (ADR 0037): after a rune it takes him out to the map, at the station he
// cleared; a Game over keeps "Try again".

describe("the card after a rune", () => {
  test("has one action, to the map: no way to play the level again from it", () => {
    expect(cardActions("clear")).toEqual(["map"]);
  });

  test("a Game over, and a level that did not come, keep trying again and the map", () => {
    expect(cardActions("over")).toEqual(["again", "map"]);
    expect(cardActions("failed")).toEqual(["again", "map"]);
  });

  test("any key newly pressed takes him out, once the card has been up a moment", () => {
    for (const key of [" ", "ArrowRight", "ArrowUp", "Enter", "Escape", "r", "x", "m"]) expect(cardKey("clear", key, false, CARD_GRACE)).toBe(true);
    // A key still held from the run, repeating, or pressed as he took the rune, is no answer.
    expect(cardKey("clear", "ArrowRight", true, 200)).toBe(false);
    expect(cardKey("clear", " ", false, CARD_GRACE - 1)).toBe(false);
    // Moving the focus, or a modifier alone, is not an answer either.
    for (const key of ["Tab", "Shift", "Control", "Alt", "Meta"]) expect(cardKey("clear", key, false, 100)).toBe(false);
  });

  test("keys do not take him from a Game over card or a failed level's: there he chooses", () => {
    expect(cardKey("over", " ", false, 100)).toBe(false);
    expect(cardKey("failed", "Enter", false, 100)).toBe(false);
    expect(cardKey(null, "Enter", false, 100)).toBe(false);
  });

  test("goes by itself after six seconds, but not under reduced motion, where it waits for him", () => {
    expect(CARD_AUTO).toBe(6 * 60);
    expect(cardGoes("clear", CARD_AUTO - 1, false)).toBe(false);
    expect(cardGoes("clear", CARD_AUTO, false)).toBe(true);
    expect(cardGoes("clear", 100000, true)).toBe(false);
    expect(cardGoes("over", 100000, false)).toBe(false);
  });

  test("he arrives on the map at the station he just cleared, with the next one open ahead of him", () => {
    let p = fresh();
    for (const [i, st] of BUILT.entries()) {
      p = clearLevel(p, st.id, 60000, false).progress;
      const at = ORDER.indexOf(arriveAfterClear(st.id));
      expect(at).toBe(ORDER.indexOf(st.id));
      const next = i + 1 < ORDER.length ? i + 1 : null;
      if (next === null) continue;
      expect(isOpen(p, ORDER, next)).toBe(true);
      // Ahead of him: to the right, and with no gate between (line 2's gate is gone once Vålerenga is cleared).
      expect(stationX(next)).toBeGreaterThan(stationX(at));
      if (stationX(at) < GATE_COL * TILE && stationX(next) > GATE_COL * TILE) {
        expect(lineTwoOpen(p)).toBe(true);
        expect(kartMap(lineTwoOpen(p)).some((row) => row[GATE_COL] === "F")).toBe(false);
      }
    }
  });
});
