import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stories, storyImages, images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const updateStorySchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  content: z.string().optional().nullable(),
  excerpt: z.string().optional().nullable(),
  coverImageId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  visibility: z.enum(["public", "private"]).optional(),
  imageIds: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = await db.query.stories.findFirst({
    where: eq(stories.id, id),
  });

  if (!story) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Get associated images
  const associatedImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      caption: storyImages.caption,
      sortOrder: storyImages.sortOrder,
    })
    .from(storyImages)
    .innerJoin(images, eq(storyImages.imageId, images.id))
    .where(eq(storyImages.storyId, id))
    .orderBy(asc(storyImages.sortOrder));

  return NextResponse.json({ ...story, images: associatedImages });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updateStorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const { imageIds, ...storyData } = data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(storyData)) {
    if (value !== undefined) updateData[key] = value;
  }

  const [updated] = await db
    .update(stories)
    .set(updateData)
    .where(eq(stories.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update image associations if provided
  if (imageIds !== undefined) {
    await db.delete(storyImages).where(eq(storyImages.storyId, id));

    if (imageIds.length > 0) {
      await db.insert(storyImages).values(
        imageIds.map((imageId, index) => ({
          storyId: id,
          imageId,
          sortOrder: index,
        }))
      );
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(stories).where(eq(stories.id, id));

  return NextResponse.json({ success: true });
}
