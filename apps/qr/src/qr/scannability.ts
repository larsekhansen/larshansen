// A quick verdict on how easy the code is to scan, with tips for fixing it.
// The score starts at 100 and each risk takes something off. The strongest signal is the
// real decode test (see scanTest.ts); the rest explains *why* a design might struggle.

import type { Design } from "../design/design";
import { quietZoneModules } from "./qrInfo";

export type ScanLevel = "high" | "medium" | "low";

/** Result of decoding the rendered image; "pending" while the test runs. */
export type ScanTestResult = "pending" | "passed" | "failed";

export interface ScanAssessment {
  score: number;
  level: ScanLevel;
  tips: string[];
}

const formatNumber = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format;

/** Relative luminance of a #rrggbb color, as defined by WCAG 2. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, from 1 (same color) to 21 (black on white). */
export function contrastRatio(colorA: string, colorB: string): number {
  const [lighter, darker] = [luminance(colorA), luminance(colorB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function assessScannability(
  design: Design,
  moduleCount: number,
  testResult: ScanTestResult
): ScanAssessment {
  let score = 100;
  const tips: string[] = [];

  // A transparent code usually ends up on white paper, so judge it against white.
  const paper = design.transparentBackground ? "#ffffff" : design.backgroundColor;
  const inks = [design.dotColor, design.cornerColor];
  if (design.gradient !== "none") inks.push(design.gradientColor);

  const weakestContrast = Math.min(...inks.map((ink) => contrastRatio(ink, paper)));
  if (weakestContrast < 3) {
    score -= 60;
    tips.push(
      `For lav kontrast (${formatNumber(weakestContrast)}:1). Gjør koden mørkere eller bakgrunnen lysere.`
    );
  } else if (weakestContrast < 4.5) {
    score -= 25;
    tips.push(`Kontrasten er i svakeste laget (${formatNumber(weakestContrast)}:1). Sikt mot minst 4,5:1.`);
  } else if (weakestContrast < 7) {
    score -= 5;
  }

  const isLightOnDark = luminance(design.dotColor) > luminance(paper);
  if (isLightOnDark) {
    score -= 30;
    tips.push("Lys kode på mørk bakgrunn leses ikke av alle skannere. Bytt fargene hvis den skal virke overalt.");
  }

  const quietZone = quietZoneModules(design.margin, moduleCount);
  if (quietZone < 2) {
    score -= 15;
    tips.push(
      `Lite luft rundt koden (${formatNumber(quietZone)} moduler). Standarden anbefaler 4, de fleste mobiler klarer seg med 2.`
    );
  }

  if (design.logo && (design.errorCorrection === "L" || design.errorCorrection === "M")) {
    score -= 20;
    tips.push("Med logo bør feilrettingen være Q eller H, så koden tåler at midten er dekket.");
  }

  const version = (moduleCount - 17) / 4;
  if (version >= 15) {
    score -= 10;
    tips.push(`Mye innhold gir en tett kode (versjon ${version}). Kort ned innholdet eller skriv koden ut større.`);
  }

  if (testResult === "failed") {
    score = Math.min(score, 20);
    tips.unshift(
      "En QR-leser klarte ikke å lese koden. Øk kontrasten, velg enklere former eller gjør logoen mindre."
    );
  }

  score = Math.max(0, score);
  const level: ScanLevel = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
  return { score, level, tips };
}
