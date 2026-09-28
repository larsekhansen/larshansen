// Rendering a code to a file: for download, for the clipboard and for the scan test.

import QRCodeStyling, { type FileExtension } from "qr-code-styling";
import type { Design } from "../design/design";
import { buildQrOptions } from "./qrOptions";

export async function renderQrImage(
  text: string,
  design: Design,
  format: FileExtension,
  size: number
): Promise<Blob> {
  const qrCode = new QRCodeStyling(buildQrOptions(text, design, size));
  const image = await qrCode.getRawData(format);
  if (!(image instanceof Blob)) throw new Error("qr-code-styling returned no image");
  return image;
}

export function downloadQr(text: string, design: Design, format: FileExtension, size: number): Promise<void> {
  // JPEG has no transparency; without this the transparent parts turn black.
  const printableDesign = format === "jpeg" ? { ...design, transparentBackground: false } : design;

  const qrCode = new QRCodeStyling(buildQrOptions(text, printableDesign, size));
  return qrCode.download({ name: "qr-kode", extension: format });
}

export function copyQrImage(text: string, design: Design, size: number): Promise<void> {
  // Safari only allows clipboard writes that start synchronously in the click handler,
  // so we hand ClipboardItem the promise instead of awaiting the image first.
  const image = renderQrImage(text, design, "png", size);
  return navigator.clipboard.write([new ClipboardItem({ "image/png": image })]);
}
