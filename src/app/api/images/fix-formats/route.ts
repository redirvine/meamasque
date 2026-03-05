import { NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";
import { convertToWebSafe, generateThumbnail } from "@/lib/thumbnail";

/**
 * One-off endpoint to convert existing HEIC/HEIF/TIFF images to web-safe formats.
 * POST /api/images/fix-formats
 */
export async function POST() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allImages = await db.select().from(images);
  const fixed: string[] = [];

  for (const image of allImages) {
    const newBlobUrl = await convertToWebSafe(image.blobUrl, image.id);
    if (newBlobUrl) {
      // Update blobUrl
      await db
        .update(images)
        .set({ blobUrl: newBlobUrl, updatedAt: new Date() })
        .where(eq(images.id, image.id));

      // Regenerate thumbnail from the converted image
      const thumbUrl = await generateThumbnail(newBlobUrl, image.id, image.thumbnailUrl);
      if (thumbUrl) {
        await db
          .update(images)
          .set({ thumbnailUrl: thumbUrl })
          .where(eq(images.id, image.id));
      }

      fixed.push(image.title);
    }
  }

  return NextResponse.json({
    message: `Converted ${fixed.length} image(s)`,
    fixed,
  });
}
