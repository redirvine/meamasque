import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { places, placeMemories, placePhotos, images } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const updatePlaceSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  visitedOrLived: z.enum(["visited", "lived"]).optional().nullable(),
  fromDate: z.string().optional().nullable(),
  toDate: z.string().optional().nullable(),
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
  const place = await db.query.places.findFirst({
    where: eq(places.id, id),
  });

  if (!place) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const memories = await db
    .select({
      id: placeMemories.id,
      content: placeMemories.content,
      sortOrder: placeMemories.sortOrder,
    })
    .from(placeMemories)
    .where(eq(placeMemories.placeId, id))
    .orderBy(asc(placeMemories.sortOrder));

  const photos = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      sortOrder: placePhotos.sortOrder,
    })
    .from(placePhotos)
    .innerJoin(images, eq(placePhotos.imageId, images.id))
    .where(eq(placePhotos.placeId, id))
    .orderBy(asc(placePhotos.sortOrder));

  return NextResponse.json({ ...place, memories, photos });
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
  const parsed = updatePlaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { memories, imageIds, ...placeData } = parsed.data;

  const [updated] = await db
    .update(places)
    .set(placeData)
    .where(eq(places.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (memories !== undefined) {
    await db.delete(placeMemories).where(eq(placeMemories.placeId, id));

    if (memories.length > 0) {
      await db.insert(placeMemories).values(
        memories.map((content, index) => ({
          placeId: id,
          content,
          sortOrder: index,
        }))
      );
    }
  }

  if (imageIds !== undefined) {
    await db.delete(placePhotos).where(eq(placePhotos.placeId, id));

    if (imageIds.length > 0) {
      await db.insert(placePhotos).values(
        imageIds.map((imageId, index) => ({
          placeId: id,
          imageId,
          sortOrder: index,
        }))
      );
    }
  }

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "update", resource: "place", resourceId: id, detail: `Updated place '${updated.name}'` });

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

  const place = await db.query.places.findFirst({ where: eq(places.id, id) });

  await db.delete(places).where(eq(places.id, id));

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "delete", resource: "place", resourceId: id, detail: `Deleted place '${place?.name ?? id}'` });

  return NextResponse.json({ success: true });
}
