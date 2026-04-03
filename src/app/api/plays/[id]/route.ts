import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays, playImages, playMemories, images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { logAudit } from "@/lib/audit";


const updatePlaySchema = z.object({
  play: z.string().min(1).optional(),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  primaryImageId: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  imageIds: z.array(z.string()).optional(),
  memories: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const play = await db.query.plays.findFirst({
    where: eq(plays.id, id),
  });

  if (!play) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const associatedImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      caption: playImages.caption,
      sortOrder: playImages.sortOrder,
    })
    .from(playImages)
    .innerJoin(images, eq(playImages.imageId, images.id))
    .where(eq(playImages.playId, id))
    .orderBy(asc(playImages.sortOrder));

  const memories = await db
    .select({
      id: playMemories.id,
      content: playMemories.content,
      sortOrder: playMemories.sortOrder,
    })
    .from(playMemories)
    .where(eq(playMemories.playId, id))
    .orderBy(asc(playMemories.sortOrder));

  return NextResponse.json({ ...play, images: associatedImages, memories });
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
  const parsed = updatePlaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { imageIds, memories, ...playData } = parsed.data;

  const [updated] = await db
    .update(plays)
    .set(playData)
    .where(eq(plays.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update image associations if provided
  if (imageIds !== undefined) {
    await db.delete(playImages).where(eq(playImages.playId, id));

    if (imageIds.length > 0) {
      await db.insert(playImages).values(
        imageIds.map((imageId, index) => ({
          playId: id,
          imageId,
          sortOrder: index,
        }))
      );
    }
  }

  // Update memories if provided
  if (memories !== undefined) {
    await db.delete(playMemories).where(eq(playMemories.playId, id));

    if (memories.length > 0) {
      await db.insert(playMemories).values(
        memories.map((content, index) => ({
          playId: id,
          content,
          sortOrder: index,
        }))
      );
    }
  }

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "update", resource: "play", resourceId: id, detail: `Updated play '${updated.play}'` });

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

  const play = await db.query.plays.findFirst({ where: eq(plays.id, id) });

  await db.delete(plays).where(eq(plays.id, id));

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "delete", resource: "play", resourceId: id, detail: `Deleted play '${play?.play ?? id}'` });

  return NextResponse.json({ success: true });
}
