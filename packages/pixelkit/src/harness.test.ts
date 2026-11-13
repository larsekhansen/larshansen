import { describe, expect, test } from "bun:test";
import { FROZEN_NOW, parseKeys, readHarness } from "./harness";

describe("the key script", () => {
  test("holds each letter's action for its number of steps", () => {
    const s = parseKeys("r2,j1,n1,l1,u1");
    expect(s).toEqual([["right"], ["right"], ["jump"], [], ["left"], ["up"]]);
  });

  test("an empty script holds nothing", () => {
    expect(parseKeys("")).toEqual([]);
  });

  test("an unknown letter is an error, not a silent no-op", () => {
    expect(() => parseKeys("x3")).toThrow();
    expect(() => parseKeys("r")).toThrow();
  });
});

describe("reading the address", () => {
  test("only under ?debug, and only with steps", () => {
    expect(readHarness(new URLSearchParams("steps=5"))).toBeNull();
    expect(readHarness(new URLSearchParams("debug"))).toBeNull();
    const h = readHarness(new URLSearchParams("debug&steps=200&keys=r200&sky=day"));
    expect(h?.steps).toBe(200);
    expect(h?.script.length).toBe(200);
    expect(h?.now).toBe(FROZEN_NOW);
  });
});
