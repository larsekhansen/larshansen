// How the QR code looks. This is our own vocabulary; qr/qrOptions.ts translates it
// into qr-code-styling's options.

import type { CornerDotType, CornerSquareType, DotType, ErrorCorrectionLevel } from "qr-code-styling";

export type GradientKind = "none" | "linear" | "radial";

/** The part of a design that a template sets. */
export interface Look {
  dotStyle: DotType;
  cornerSquareStyle: CornerSquareType;
  cornerDotStyle: CornerDotType;
  dotColor: string;
  gradient: GradientKind;
  /** End color of the gradient; ignored when gradient is "none". */
  gradientColor: string;
  cornerColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
}

export interface Logo {
  /** The uploaded image as a data: URL, so it survives a page reload. */
  dataUrl: string;
  /** Share of the code's width the logo may take, 0.2–0.5. */
  size: number;
  /** Removes the dots behind the logo instead of drawing it on top of them. */
  hideDotsBehind: boolean;
}

export interface Design extends Look {
  errorCorrection: ErrorCorrectionLevel;
  /** Empty space around the code as a share of the image width. */
  margin: number;
  logo: Logo | null;
}

export const DEFAULT_DESIGN: Design = {
  dotStyle: "square",
  cornerSquareStyle: "square",
  cornerDotStyle: "square",
  dotColor: "#151714",
  gradient: "none",
  gradientColor: "#151714",
  cornerColor: "#151714",
  backgroundColor: "#ffffff",
  transparentBackground: false,
  errorCorrection: "M",
  margin: 0.1,
  logo: null
};

export const DOT_STYLES: { value: DotType; label: string }[] = [
  { value: "square", label: "Firkant" },
  { value: "rounded", label: "Avrundet" },
  { value: "extra-rounded", label: "Myk" },
  { value: "dots", label: "Prikker" },
  { value: "classy", label: "Elegant" },
  { value: "classy-rounded", label: "Elegant myk" }
];

export const CORNER_SQUARE_STYLES: { value: CornerSquareType; label: string }[] = [
  { value: "square", label: "Firkant" },
  { value: "extra-rounded", label: "Avrundet" },
  { value: "dot", label: "Sirkel" }
];

export const CORNER_DOT_STYLES: { value: CornerDotType; label: string }[] = [
  { value: "square", label: "Firkant" },
  { value: "dot", label: "Sirkel" }
];

export const GRADIENTS: { value: GradientKind; label: string }[] = [
  { value: "none", label: "Ensfarget" },
  { value: "linear", label: "Lineær" },
  { value: "radial", label: "Sirkulær" }
];

/** How much of the code can be damaged or covered (by a logo) and still be read. */
export const ERROR_CORRECTION_LEVELS: { value: ErrorCorrectionLevel; label: string; recovers: string }[] = [
  { value: "L", label: "L", recovers: "7 %" },
  { value: "M", label: "M", recovers: "15 %" },
  { value: "Q", label: "Q", recovers: "25 %" },
  { value: "H", label: "H", recovers: "30 %" }
];
