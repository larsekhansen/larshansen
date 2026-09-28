// Reading an uploaded logo into a data: URL that can be drawn and saved with the draft.

const MAX_LOGO_PIXELS = 512;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * SVGs are kept as they are (small and sharp at any size). Other images are redrawn as a PNG
 * no larger than 512 px, so a phone photo does not fill up localStorage or slow down drawing.
 */
export async function readLogoFile(file: File): Promise<string> {
  if (file.type === "image/svg+xml") return readAsDataUrl(file);

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_LOGO_PIXELS / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}
