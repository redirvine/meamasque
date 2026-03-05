import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors, ancestorMemories, ancestorPhotos, images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updateAncestorSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  maidenName: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  birthplace: z.string().optional().nullable(),
  born: z.string().optional().nullable(),
  deathPlace: z.string().optional().nullable(),
  died: z.string().optional().nullable(),
  spouse: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  immigration: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photoId: z.string().optional().nullable(),
  memories: z.array(z.string()).optional(),
  imageIds: z.array(z.string()).optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ancestor = await db.query.ancestors.findFirst({
    where: eq(ancestors.id, id),
  });

  if (!ancestor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const memories = await db
    .select({
      id: ancestorMemories.id,
      content: ancestorMemories.content,
      sortOrder: ancestorMemories.sortOrder,
    })
    .from(ancestorMemories)
    .where(eq(ancestorMemories.ancestorId, id))
    .orderBy(asc(ancestorMemories.sortOrder));

  const photos = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      sortOrder: ancestorPhotos.sortOrder,
    })
    .from(ancestorPhotos)
    .innerJoin(images, eq(ancestorPhotos.imageId, images.id))
    .where(eq(ancestorPhotos.ancestorId, id))
    .orderBy(asc(ancestorPhotos.sortOrder));

  return NextResponse.json({ ...ancestor, memories, photos });
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
  const parsed = updateAncestorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { memories, imageIds, ...ancestorData } = parsed.data;

  const [updated] = await db
    .update(ancestors)
    .set(ancestorData)
    .where(eq(ancestors.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (memories !== undefined) {
    await db.delete(ancestorMemories).where(eq(ancestorMemories.ancestorId, id));

    if (memories.length > 0) {
      await db.insert(ancestorMemories).values(
        memories.map((content, index) => ({
          ancestorId: id,
          content,
          sortOrder: index,
        }))
      );
    }
  }

  if (imageIds !== undefined) {
    await db.delete(ancestorPhotos).where(eq(ancestorPhotos.ancestorId, id));

    if (imageIds.length > 0) {
      await db.insert(ancestorPhotos).values(
        imageIds.map((imageId, index) => ({
          ancestorId: id,
          imageId,
          sortOrder: index,
        }))
      );
    }
  }

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "update", resource: "ancestor", resourceId: id, detail: `Updated ancestor '${updated.name}'` });

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

  const ancestor = await db.query.ancestors.findFirst({ where: eq(ancestors.id, id) });

  await db.delete(ancestors).where(eq(ancestors.id, id));

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "delete", resource: "ancestor", resourceId: id, detail: `Deleted ancestor '${ancestor?.name ?? id}'` });

  return NextResponse.json({ success: true });
}
