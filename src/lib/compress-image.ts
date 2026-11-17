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

/** code matches join.photoErrors in the dictionaries, so the form can show it in any language. */
export type PhotoErrorCode = "notPhoto" | "tooLarge" | "cantOpen" | "tooSmall" | "browser" | "stillTooLarge";
export class PhotoError extends Error {
  constructor(public code: PhotoErrorCode) {
    super(code);
  }
}

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
      throw new PhotoError("cantOpen");
    }
  }
}

export async function compressImage(file: File, maxBytes: number): Promise<CompressedPhoto> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new PhotoError("notPhoto");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new PhotoError("tooLarge");
  }

  const img = await decode(file);
  try {
    if (img.width < 300 || img.height < 300) {
      throw new PhotoError("tooSmall");
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const width = Math.round(img.width * scale);
    const height = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new PhotoError("browser");
    ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img.source, 0, 0, width, height);

    for (const quality of [0.85, 0.75, 0.6]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= maxBytes) {
        return { blob, width, height, previewUrl: URL.createObjectURL(blob) };
      }
    }
    throw new PhotoError("stillTooLarge");
  } finally {
    img.close();
  }
}
