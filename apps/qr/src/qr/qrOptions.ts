// Translates our Design into qr-code-styling's options. This is the only file that needs
// to know the shape of that library's configuration.

import type { Gradient, Options } from "qr-code-styling";
import type { Design } from "../design/design";

/**
 * qr-code-styling stores each character as one byte (it keeps only the lowest 8 bits),
 * which breaks €, emoji and anything else outside Latin-1. Phone scanners expect UTF-8,
 * so we hand the library the UTF-8 bytes, one character per byte.
 */
export function toQrByteString(text: string): string {
  const utf8Bytes = new TextEncoder().encode(text);
  return Array.from(utf8Bytes, (byte) => String.fromCharCode(byte)).join("");
}

function dotGradient(design: Design): Gradient | undefined {
  if (design.gradient === "none") return undefined;

  return {
    type: design.gradient,
    rotation: Math.PI / 4, // top-left to bottom-right; ignored for radial
    colorStops: [
      { offset: 0, color: design.dotColor },
      { offset: 1, color: design.gradientColor }
    ]
  };
}

/**
 * @param text what the code should say, as the user typed it
 * @param size width and height of the image in pixels
 */
export function buildQrOptions(text: string, design: Design, size: number): Options {
  const { logo } = design;

  return {
    type: "svg",
    width: size,
    height: size,
    margin: Math.round(size * design.margin),
    data: toQrByteString(text),
    qrOptions: {
      typeNumber: 0, // 0 = pick the smallest version that fits
      mode: "Byte",
      errorCorrectionLevel: design.errorCorrection
    },
    dotsOptions: {
      type: design.dotStyle,
      color: design.dotColor,
      gradient: dotGradient(design)
    },
    cornersSquareOptions: {
      type: design.cornerSquareStyle,
      color: design.cornerColor
    },
    cornersDotOptions: {
      type: design.cornerDotStyle,
      color: design.cornerColor
    },
    backgroundOptions: {
      color: design.transparentBackground ? "transparent" : design.backgroundColor
    },
    image: logo?.dataUrl,
    imageOptions: {
      imageSize: logo?.size ?? 0.4,
      hideBackgroundDots: logo?.hideDotsBehind ?? true,
      margin: Math.round(size * 0.01)
    }
  };
}
