import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { auth } from "../../../../../../auth";
import { eq } from "drizzle-orm";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { z } from "zod";
import { generateThumbnail } from "@/lib/thumbnail";

const cropSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = cropSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
  });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Download the current image
  const response = await fetch(image.blobUrl);
  const buffer = Buffer.from(await response.arrayBuffer());

  // Get image dimensions
  const metadata = await sharp(buffer).metadata();
  if (!metadata.width || !metadata.height) {
    return NextResponse.json(
      { error: "Could not read image dimensions" },
      { status: 500 }
    );
  }

  // Convert percentage crop to pixel values
  const { x, y, width, height } = parsed.data;
  const cropLeft = Math.round((x / 100) * metadata.width);
  const cropTop = Math.round((y / 100) * metadata.height);
  const cropWidth = Math.round((width / 100) * metadata.width);
  const cropHeight = Math.round((height / 100) * metadata.height);

  // Crop the image
  const cropped = await sharp(buffer)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .toBuffer();

  // Determine format from the existing URL
  const ext = image.blobUrl.split(".").pop()?.split("?")[0] ?? "jpg";
  const contentType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
        ? "image/webp"
        : "image/jpeg";

  // Upload cropped image to Vercel Blob
  const filename = `${image.id}-cropped.${ext}`;
  const blob = await put(filename, cropped, {
    access: "public",
    contentType,
  });

  // Delete old blob
  try {
    await del(image.blobUrl);
  } catch {
    // Old blob may not exist (dev mode), continue
  }

  // Update DB with new blob URL
  const [updated] = await db
    .update(images)
    .set({ blobUrl: blob.url, updatedAt: new Date() })
    .where(eq(images.id, id))
    .returning();

  // Regenerate thumbnail in the background — don't block the crop response
  generateThumbnail(cropped, id, image.thumbnailUrl).then(async (thumbnailUrl) => {
    if (thumbnailUrl) {
      await db
        .update(images)
        .set({ thumbnailUrl })
        .where(eq(images.id, id));
    }
  });

  return NextResponse.json({ blobUrl: updated.blobUrl });
}
