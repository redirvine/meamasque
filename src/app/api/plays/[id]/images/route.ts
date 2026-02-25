import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays, playImages, images } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const play = await db.query.plays.findFirst({
    where: eq(plays.id, id),
    columns: { id: true, primaryImageId: true },
  });

  if (!play) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get all images from the junction table, ordered by sortOrder
  const associatedImages = await db
    .select({
      id: images.id,
      blobUrl: images.blobUrl,
      title: images.title,
      caption: playImages.caption,
      sortOrder: playImages.sortOrder,
    })
    .from(playImages)
    .innerJoin(images, eq(playImages.imageId, images.id))
    .where(eq(playImages.playId, id))
    .orderBy(asc(playImages.sortOrder));

  // If the primary image isn't already in the junction results, prepend it
  if (
    play.primaryImageId &&
    !associatedImages.some((img) => img.id === play.primaryImageId)
  ) {
    const [primaryImage] = await db
      .select({
        id: images.id,
        blobUrl: images.blobUrl,
        title: images.title,
      })
      .from(images)
      .where(eq(images.id, play.primaryImageId!));

    if (primaryImage) {
      associatedImages.unshift({
        ...primaryImage,
        caption: null,
        sortOrder: -1,
      });
    }
  }

  return NextResponse.json(associatedImages);
}
