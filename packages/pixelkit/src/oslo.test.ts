import { describe, expect, test } from "bun:test";
import { pickLang } from "./i18n";
import { osloClock, skyFor, sunTimes } from "./oslo";

const minutes = (h: number) => Math.round(h * 60);

describe("Oslo time", () => {
  test("follows summer time", () => {
    expect(osloClock(new Date("2026-07-01T12:00:00Z"))).toMatchObject({ hour: 14, offset: 2 });
    expect(osloClock(new Date("2026-01-15T12:00:00Z"))).toMatchObject({ hour: 13, offset: 1 });
  });

  // Published times for Oslo, allowing ten minutes for the simple solar model.
  test.each([
    ["2026-06-21T12:00:00Z", 3 * 60 + 54, 22 * 60 + 44],
    ["2026-12-21T12:00:00Z", 9 * 60 + 18, 15 * 60 + 12]
  ])("sunrise and sunset on %s", (iso, rise, set) => {
    const t = sunTimes(osloClock(new Date(iso)));
    expect(Math.abs(minutes(t.rise) - rise)).toBeLessThanOrEqual(10);
    expect(Math.abs(minutes(t.set) - set)).toBeLessThanOrEqual(10);
  });
});

describe("the sky", () => {
  test("a January midnight is dark, snowy and has northern lights", () => {
    expect(skyFor(new Date("2026-01-10T23:00:00Z"))).toMatchObject({ phase: "night", snow: true, aurora: true });
  });

  test("a June midnight stays blue", () => {
    expect(skyFor(new Date("2026-06-21T22:00:00Z")).phase).toBe("twilight");
  });

  test("a July noon is day", () => {
    expect(skyFor(new Date("2026-07-01T10:00:00Z")).phase).toBe("day");
  });

  test("17 May has flags", () => {
    expect(skyFor(new Date("2026-05-17T10:00:00Z")).flags).toBe(true);
  });

  test("?sky= picks a look", () => {
    expect(skyFor(new Date("2026-07-01T10:00:00Z"), "winter")).toMatchObject({ phase: "night", snow: true });
  });
});

describe("language", () => {
  test("Norwegian browsers get Norwegian", () => {
    expect(pickLang(["nb-NO", "en"])).toBe("nb");
    expect(pickLang(["nn"])).toBe("nb");
    expect(pickLang(["de-DE", "no"])).toBe("nb");
  });

  test("everyone else gets English, in their own order of preference", () => {
    expect(pickLang(["en-GB", "nb"])).toBe("en");
    expect(pickLang(["fr"])).toBe("en");
  });
});
