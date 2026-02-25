import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays, images, playMemories } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, desc, sql, count } from "drizzle-orm";
import { z } from "zod";

const createPlaySchema = z.object({
  play: z.string().min(1),
  date: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  primaryImageId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memoryCountSq = db
    .select({
      playId: playMemories.playId,
      count: count().as("memory_count"),
    })
    .from(playMemories)
    .groupBy(playMemories.playId)
    .as("mc");

  const allPlays = await db
    .select({
      id: plays.id,
      play: plays.play,
      date: plays.date,
      role: plays.role,
      location: plays.location,
      description: plays.description,
      year: plays.year,
      primaryImageId: plays.primaryImageId,
      primaryImageUrl: images.blobUrl,
      createdAt: plays.createdAt,
      imageCount: sql<number>`(
        SELECT COUNT(*) FROM (
          SELECT image_id AS iid FROM play_images WHERE play_id = ${plays.id}
          UNION
          SELECT ${plays.primaryImageId} AS iid WHERE ${plays.primaryImageId} IS NOT NULL
        )
      )`.as("imageCount"),
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(plays)
    .leftJoin(images, eq(plays.primaryImageId, images.id))
    .leftJoin(memoryCountSq, eq(plays.id, memoryCountSq.playId))
    .orderBy(desc(plays.year), desc(plays.createdAt));

  return NextResponse.json(allPlays);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createPlaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [play] = await db
    .insert(plays)
    .values({
      play: parsed.data.play,
      date: parsed.data.date ?? null,
      role: parsed.data.role ?? null,
      location: parsed.data.location ?? null,
      description: parsed.data.description ?? null,
      year: parsed.data.year ?? null,
      primaryImageId: parsed.data.primaryImageId ?? null,
    })
    .returning();

  return NextResponse.json(play, { status: 201 });
}
