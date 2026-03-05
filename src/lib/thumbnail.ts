import sharp from "sharp";
import { put, del } from "@vercel/blob";

const THUMB_WIDTH = 800;

// Formats that browsers can't display natively
const NON_WEB_FORMATS = new Set(["heic", "heif", "tiff"]);

function outputFormat(format: string | undefined) {
  if (format === "png") return { ext: "png", contentType: "image/png" } as const;
  if (format === "webp") return { ext: "webp", contentType: "image/webp" } as const;
  // HEIC, HEIF, TIFF, and everything else → JPEG
  return { ext: "jpg", contentType: "image/jpeg" } as const;
}

function applyFormat(pipeline: sharp.Sharp, format: string | undefined) {
  const { ext } = outputFormat(format);
  if (ext === "png") return pipeline.png();
  if (ext === "webp") return pipeline.webp();
  return pipeline.jpeg({ quality: 90 });
}

/**
 * Convert a non-web-safe image (HEIC, HEIF, TIFF) to JPEG.
 * Returns the new blob URL if conversion happened, or null if no conversion needed.
 */
export async function convertToWebSafe(
  blobUrl: string,
  imageId: string
): Promise<string | null> {
  try {
    const buffer = Buffer.from(await (await fetch(blobUrl)).arrayBuffer());
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format || !NON_WEB_FORMATS.has(metadata.format)) {
      return null; // Already web-safe
    }

    const output = await applyFormat(sharp(buffer).rotate(), metadata.format).toBuffer();
    const { ext, contentType } = outputFormat(metadata.format);

    const blob = await put(`${imageId}.${ext}`, output, {
      access: "public",
      contentType,
    });

    // Delete the original non-web-safe blob
    try {
      await del(blobUrl);
    } catch {
      // Original may not exist, continue
    }

    return blob.url;
  } catch (err) {
    console.error(`Failed to convert image ${imageId} to web-safe format`, err);
    return null;
  }
}

/**
 * Generate an 800px-wide thumbnail for an image.
 * Accepts a URL string or a Buffer as source.
 * Returns the thumbnail blob URL, or null if generation fails.
 */
export async function generateThumbnail(
  source: string | Buffer,
  imageId: string,
  oldThumbnailUrl?: string | null
): Promise<string | null> {
  try {
    const buffer =
      typeof source === "string"
        ? Buffer.from(await (await fetch(source)).arrayBuffer())
        : source;

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) return null;

    // rotate() with no args auto-orients based on EXIF data
    const needsResize = metadata.width > THUMB_WIDTH;
    let pipeline = sharp(buffer).rotate();
    if (needsResize) pipeline = pipeline.resize({ width: THUMB_WIDTH });

    // Always explicitly set output format (ensures HEIC → JPEG etc.)
    const output = await applyFormat(pipeline, metadata.format).toBuffer();
    const { ext, contentType } = outputFormat(metadata.format);

    // Delete old thumbnail BEFORE uploading (same filename pattern)
    if (oldThumbnailUrl) {
      try {
        await del(oldThumbnailUrl);
      } catch {
        // Old thumbnail may not exist, continue
      }
    }

    const blob = await put(`thumb-${imageId}.${ext}`, output, {
      access: "public",
      contentType,
    });

    return blob.url;
  } catch (err) {
    console.error(`Failed to generate thumbnail for image ${imageId}`, err);
    return null;
  }
}
