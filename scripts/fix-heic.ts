// @ts-expect-error no types for heic-convert
import convert from "heic-convert";
import sharp from "sharp";
import { put, del } from "@vercel/blob";
import { db } from "../src/db";
import { images } from "../src/db/schema";
import { eq, isNull } from "drizzle-orm";

async function main() {
  const broken = await db
    .select({ id: images.id, title: images.title, blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
    .from(images)
    .where(isNull(images.thumbnailUrl));

  console.log(`Found ${broken.length} images without thumbnails`);

  for (const image of broken) {
    if (!image.blobUrl.endsWith(".heic") && !image.blobUrl.endsWith(".heif")) {
      console.log(`Skipping ${image.title} — not HEIC/HEIF`);
      continue;
    }

    console.log(`Converting: ${image.title} (${image.id})`);

    try {
      const response = await fetch(image.blobUrl);
      const inputBuffer = Buffer.from(await response.arrayBuffer());

      // Convert HEIC → JPEG using heic-convert
      const jpegBuffer = Buffer.from(
        await convert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 0.9,
        })
      );

      // Upload converted full-size image
      const blob = await put(`${image.id}.jpg`, jpegBuffer, {
        access: "public",
        contentType: "image/jpeg",
      });

      // Generate 800px thumbnail using sharp (JPEG input now works fine)
      const thumb = await sharp(jpegBuffer)
        .rotate()
        .resize({ width: 800 })
        .jpeg({ quality: 85 })
        .toBuffer();

      const thumbBlob = await put(`thumb-${image.id}.jpg`, thumb, {
        access: "public",
        contentType: "image/jpeg",
      });

      // Update DB
      await db
        .update(images)
        .set({
          blobUrl: blob.url,
          thumbnailUrl: thumbBlob.url,
          updatedAt: new Date(),
        })
        .where(eq(images.id, image.id));

      // Delete old HEIC blob
      try {
        await del(image.blobUrl);
      } catch {
        // May not exist
      }

      console.log(`  ✓ ${blob.url}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${image.title}`, err);
    }
  }

  console.log("Done!");
  process.exit(0);
}

main();
