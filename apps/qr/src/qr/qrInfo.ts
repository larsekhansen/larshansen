// Facts about the code that will be drawn: its version (size), and whether the text fits at all.
// Uses qrcode-generator, the same engine qr-code-styling draws with, so the numbers match.

import qrcode from "qrcode-generator";
import type { ErrorCorrectionLevel } from "qr-code-styling";
import { toQrByteString } from "./qrOptions";

/** The most bytes the largest code (version 40) holds at each level, from ISO/IEC 18004. */
export const MAX_BYTES: Record<ErrorCorrectionLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273
};

export type QrInfo =
  | { fits: true; byteCount: number; version: number; moduleCount: number }
  | { fits: false; byteCount: number; maxBytes: number };

export function describeQr(text: string, errorCorrection: ErrorCorrectionLevel): QrInfo {
  const bytes = toQrByteString(text);
  const maxBytes = MAX_BYTES[errorCorrection];
  if (bytes.length > maxBytes) {
    return { fits: false, byteCount: bytes.length, maxBytes };
  }

  const qr = qrcode(0, errorCorrection); // 0 = smallest version that fits
  qr.addData(bytes, "Byte");
  qr.make();

  // Version 1 is 21×21 modules and every version adds 4 per side.
  const moduleCount = qr.getModuleCount();
  return { fits: true, byteCount: bytes.length, version: (moduleCount - 17) / 4, moduleCount };
}

/**
 * The blank border around the code, measured in modules (the small squares).
 * The standard asks for 4; most phones manage with 2.
 *
 * @param margin blank space on each side as a share of the image width
 */
export function quietZoneModules(margin: number, moduleCount: number): number {
  const moduleWidth = (1 - 2 * margin) / moduleCount;
  return margin / moduleWidth;
}
