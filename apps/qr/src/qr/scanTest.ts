// Proves the design scans: render it to a PNG and decode it with jsQR, like a phone would.

import jsQR from "jsqr";
import { useEffect, useState } from "react";
import type { Design } from "../design/design";
import { renderQrImage } from "./renderQr";
import type { ScanTestResult } from "./scannability";

const TEST_IMAGE_SIZE = 480;
const WAIT_FOR_TYPING_MS = 400;

export async function scansAs(image: Blob, expectedText: string): Promise<boolean> {
  const bitmap = await createImageBitmap(image);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return false;

  // Transparent parts count as white paper.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
  return result?.data === expectedText;
}

/** Re-runs the scan test whenever the text or design changes, once the user pauses. */
export function useScanTest(text: string, design: Design, enabled: boolean): ScanTestResult {
  const [result, setResult] = useState<ScanTestResult>("pending");

  useEffect(() => {
    if (!enabled) return;

    setResult("pending");
    let isStale = false;
    const timer = setTimeout(async () => {
      const passed = await renderQrImage(text, design, "png", TEST_IMAGE_SIZE)
        .then((image) => scansAs(image, text))
        .catch(() => false);
      if (!isStale) setResult(passed ? "passed" : "failed");
    }, WAIT_FOR_TYPING_MS);

    return () => {
      isStale = true;
      clearTimeout(timer);
    };
  }, [text, design, enabled]);

  return result;
}
