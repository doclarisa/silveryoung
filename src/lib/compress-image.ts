"use client";

/**
 * Shrinks a photo in the browser before upload: longest side at most 2000px,
 * saved as JPEG. Phone photos (often 3–12MB) usually end up around 0.5–1.5MB.
 * Also turns the photo the right way up and drops hidden location data,
 * because only the pixels are copied.
 */
export type CompressedPhoto = { blob: Blob; width: number; height: number; previewUrl: string };

const MAX_SIDE = 2000;
const MAX_INPUT_BYTES = 40 * 1024 * 1024;

export class PhotoError extends Error {}

async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
  } catch {
    // Some browsers can show a format (like iPhone HEIC in Safari) but not decode it this way.
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();
      return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
    } catch {
      URL.revokeObjectURL(url);
      throw new PhotoError(
        "We couldn't open that photo. Please choose a JPEG or PNG photo, or take a new one.",
      );
    }
  }
}

export async function compressImage(file: File, maxBytes: number): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new PhotoError("That file isn't a photo. Please choose a photo.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError("That photo is too large to use. Please choose a smaller one.");
  }

  const img = await decode(file);
  try {
    if (img.width < 300 || img.height < 300) {
      throw new PhotoError("That photo is very small. Please choose a larger, clearer photo.");
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("Your browser couldn't prepare the photo. Please try another browser.");
    ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img.source, 0, 0, width, height);

    for (const quality of [0.85, 0.75, 0.6]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) {
        return { blob, width, height, previewUrl: URL.createObjectURL(blob) };
      }
    }
    throw new PhotoError("That photo is too large, even after shrinking. Please choose another.");
  } finally {
    img.close();
  }
}
