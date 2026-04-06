import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { places, placeMemories, images } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, sql, count } from "drizzle-orm";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const createPlaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  visitedOrLived: z.enum(["visited", "lived"]).optional().nullable(),
  fromDate: z.string().optional().nullable(),
  toDate: z.string().optional().nullable(),
  photoId: z.string().optional().nullable(),
});

export async function GET() {
  const memoryCountSq = db
    .select({
      placeId: placeMemories.placeId,
      count: count().as("memory_count"),
    })
    .from(placeMemories)
    .groupBy(placeMemories.placeId)
    .as("mc");

  const allPlaces = await db
    .select({
      id: places.id,
      name: places.name,
      slug: places.slug,
      description: places.description,
      streetAddress: places.streetAddress,
      city: places.city,
      state: places.state,
      country: places.country,
      visitedOrLived: places.visitedOrLived,
      fromDate: places.fromDate,
      toDate: places.toDate,
      photoId: places.photoId,
      photoUrl: images.blobUrl,
      createdAt: places.createdAt,
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(places)
    .leftJoin(images, eq(places.photoId, images.id))
    .leftJoin(memoryCountSq, eq(places.id, memoryCountSq.placeId))
    .orderBy(places.name);

  return NextResponse.json(allPlaces);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPlaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [place] = await db
    .insert(places)
    .values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      streetAddress: parsed.data.streetAddress ?? null,
      city: parsed.data.city ?? null,
      state: parsed.data.state ?? null,
      country: parsed.data.country ?? null,
      visitedOrLived: parsed.data.visitedOrLived ?? null,
      fromDate: parsed.data.fromDate ?? null,
      toDate: parsed.data.toDate ?? null,
      photoId: parsed.data.photoId ?? null,
    })
    .returning();

  logAudit({ userId: session.user?.id, userEmail: session.user?.email ?? "", action: "create", resource: "place", resourceId: place.id, detail: `Created place '${place.name}'` });

  return NextResponse.json(place, { status: 201 });
}
