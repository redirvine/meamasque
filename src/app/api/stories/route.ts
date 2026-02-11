import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { stories, storyImages, images, artists } from "@/db/schema";
import { auth } from "../../../../auth";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

const createStorySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  coverImageId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  visibility: z.enum(["public", "private"]).default("public"),
  imageIds: z.array(z.string()).optional(),
});

export async function GET() {
  const allStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      excerpt: stories.excerpt,
      visibility: stories.visibility,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      coverImageUrl: images.blobUrl,
      authorName: artists.name,
    })
    .from(stories)
    .leftJoin(images, eq(stories.coverImageId, images.id))
    .leftJoin(artists, eq(stories.authorId, artists.id))
    .orderBy(desc(stories.createdAt));

  return NextResponse.json(allStories);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createStorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const [story] = await db
    .insert(stories)
    .values({
      title: data.title,
      slug: data.slug,
      content: data.content ?? null,
      excerpt: data.excerpt ?? null,
      coverImageId: data.coverImageId ?? null,
      authorId: data.authorId ?? null,
      visibility: data.visibility,
    })
    .returning();

  // Insert story-image associations
  if (data.imageIds && data.imageIds.length > 0) {
    await db.insert(storyImages).values(
      data.imageIds.map((imageId, index) => ({
        storyId: story.id,
        imageId,
        sortOrder: index,
      }))
    );
  }

  return NextResponse.json(story, { status: 201 });
}
