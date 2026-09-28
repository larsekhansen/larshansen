import { describe, expect, test } from "bun:test";
import jsQR from "jsqr";
import qrcode from "qrcode-generator";
import { DEFAULT_DESIGN } from "../design/design";
import { TEMPLATES, applyTemplate } from "../design/templates";
import { MAX_BYTES, describeQr, quietZoneModules } from "./qrInfo";
import { toQrByteString } from "./qrOptions";
import { assessScannability, contrastRatio } from "./scannability";

/** Draws the plain module matrix into RGBA pixels and decodes it, like a camera would. */
function decodeRoundTrip(text: string): string | undefined {
  const qr = qrcode(0, "M");
  qr.addData(toQrByteString(text), "Byte");
  qr.make();

  const modules = qr.getModuleCount();
  const scale = 4;
  const quietZone = 4;
  const size = (modules + quietZone * 2) * scale;
  const pixels = new Uint8ClampedArray(size * size * 4).fill(255);

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (!qr.isDark(row, col)) continue;
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          const x = (col + quietZone) * scale + dx;
          const y = (row + quietZone) * scale + dy;
          pixels.fill(0, (y * size + x) * 4, (y * size + x) * 4 + 3);
        }
      }
    }
  }

  return jsQR(pixels, size, size)?.data;
}

describe("encoding", () => {
  test.each([
    "https://larshansen.dev/qr/",
    "Blåbærsyltetøy på Ærøy",
    "Pris: 49 € 🎉",
    "WIFI:T:WPA;S:Kafé Nord;P:hemmelig;;"
  ])("a scanner reads back %p exactly", (text) => {
    expect(decodeRoundTrip(text)).toBe(text);
  });
});

describe("describeQr", () => {
  test("reports version and size", () => {
    const info = describeQr("https://larshansen.dev/qr/", "M");
    expect(info).toEqual({ fits: true, byteCount: 26, version: 2, moduleCount: 25 });
  });

  test("counts UTF-8 bytes, not characters", () => {
    expect(describeQr("ø", "L").byteCount).toBe(2);
  });

  test("knows the exact capacity limit of each level", () => {
    for (const level of ["L", "M", "Q", "H"] as const) {
      const max = MAX_BYTES[level];
      expect(describeQr("a".repeat(max), level)).toMatchObject({ fits: true, version: 40 });
      expect(describeQr("a".repeat(max + 1), level)).toEqual({ fits: false, byteCount: max + 1, maxBytes: max });
    }
  });

  test("measures the quiet zone in modules", () => {
    // 10 % margin on a 25-module code: each module is 0.8 / 25 = 3.2 % wide, so 10 % ≈ 3.1 modules.
    expect(quietZoneModules(0.1, 25)).toBeCloseTo(3.125);
  });
});

describe("scannability", () => {
  test("contrast ratio follows WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
    expect(contrastRatio("#777777", "#777777")).toBeCloseTo(1);
  });

  test("every template except the inverted one scores high", () => {
    for (const template of TEMPLATES) {
      const { level } = assessScannability(applyTemplate(DEFAULT_DESIGN, template), 25, "passed");
      expect({ template: template.id, level }).toEqual({
        template: template.id,
        level: template.id === "night" ? "medium" : "high"
      });
    }
  });

  test("pale colors and a failed scan both drag the score down", () => {
    const pale = { ...DEFAULT_DESIGN, dotColor: "#cccccc", cornerColor: "#cccccc" };
    expect(assessScannability(pale, 25, "pending").level).toBe("low");
    expect(assessScannability(DEFAULT_DESIGN, 25, "failed").level).toBe("low");
  });

  test("asks for more error correction when there is a logo", () => {
    const withLogo = { ...DEFAULT_DESIGN, logo: { dataUrl: "data:,", size: 0.4, hideDotsBehind: true } };
    expect(assessScannability(withLogo, 25, "passed").tips.join(" ")).toContain("feilrettingen");
  });
});
