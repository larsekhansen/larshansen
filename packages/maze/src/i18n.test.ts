import { describe, expect, test } from "bun:test";
import { strings } from "./i18n";

describe("the maze's words", () => {
  const nb = strings("nb") as Record<string, unknown>;
  const en = strings("en") as Record<string, unknown>;

  test("every string exists in Norwegian and in English, of the same kind", () => {
    expect(Object.keys(nb).sort()).toEqual(Object.keys(en).sort());
    for (const key of Object.keys(en)) expect({ key, kind: typeof nb[key] }).toEqual({ key, kind: typeof en[key] });
  });

  test("none is empty, and the ones that take numbers use them", () => {
    for (const words of [nb, en])
      for (const [key, value] of Object.entries(words)) {
        const text = typeof value === "function" ? (value as (...a: unknown[]) => string)(7, 9) : value;
        expect({ key, ok: typeof text === "string" && text.trim().length > 0 }).toEqual({ key, ok: true });
        if (typeof value === "function" && value.length > 0) expect({ key, uses: /7/.test(String(text)) || /0:/.test(String(text)) }).toEqual({ key, uses: true });
      }
  });

  test("the feather's line is the fjord's, word for word (apps/viking keeps its own copy)", () => {
    expect(nb.feather).toBe("Haugbonden gir seg. Ravnefjæra er din: hopp en gang til i lufta.");
    expect(en.feather).toBe("The mound-dweller yields. The raven's feather is yours: jump once more in mid-air.");
  });
});
