import sharp from "sharp";
import { put, del } from "@vercel/blob";

const THUMB_WIDTH = 800;

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
    const pipeline = sharp(buffer).rotate();
    const output = needsResize
      ? await pipeline.resize({ width: THUMB_WIDTH }).toBuffer()
      : await pipeline.toBuffer();

    // Determine format from metadata
    const ext = metadata.format === "png" ? "png" : metadata.format === "webp" ? "webp" : "jpg";
    const contentType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

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
