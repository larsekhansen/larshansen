import { describe, expect, test } from "bun:test";
import { createBody } from "./physics";
import { helmetPixels, playerPixels, type Look } from "./person";

function draw(look?: Look, walk = 0, facing: 1 | -1 = 1) {
  const b = createBody(0, 20);
  b.facing = facing;
  b.onGround = true;
  const out = new Map<string, string>();
  playerPixels(b, walk, "day", (c, r, color) => out.set(`${c},${r}`, color), look);
  return out;
}
const same = (a: Map<string, string>, b: Map<string, string>) => expect([...a].sort()).toEqual([...b].sort());

describe("the outfit moment", () => {
  for (const facing of [1, -1] as const)
    test(`the helmet at offset 0 and all four cape rows is the viking outfit (facing ${facing})`, () => {
      same(draw({ outfit: "viking", helmetOffset: 0, capeRows: 4 }, 0, facing), draw({ outfit: "viking" }, 0, facing));
    });

  test("without a helmet and a cape he is the plain person with a red hat", () => {
    same(draw({ outfit: "viking", helmetOffset: null, capeRows: 0 }), draw());
  });

  test("a helmet in the air floats above the hat, which stays red", () => {
    const d = draw({ outfit: "viking", helmetOffset: 5, capeRows: 0 });
    expect(d.get("4,1")).toBe(draw().get("4,1"));
    expect(d.get("4,-4")).toBeDefined(); // the helmet's first row, 5 above row 1
  });

  test("the cape unrolls one row at a time", () => {
    const count = (n: number) => [...draw({ outfit: "viking", capeRows: n })].filter(([, c]) => c === draw({ outfit: "viking" }).get("0,7")).length;
    expect(count(1)).toBeLessThan(count(4));
  });

  test("helmetPixels alone is the helmet's two rows and the nose guard", () => {
    const got = new Map<string, string>();
    helmetPixels(1, "day", (c, r, color) => got.set(`${c},${r}`, color));
    const worn = draw({ outfit: "viking" });
    for (const [k, color] of got) expect(worn.get(k)).toBe(color);
    expect(got.size).toBe(4 + 6 + 1);
  });
});
