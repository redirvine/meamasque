import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays, playMemories } from "@/db/schema";
import { eq, asc, max } from "drizzle-orm";
import { auth } from "../../../../../../auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const play = await db.query.plays.findFirst({
    where: eq(plays.id, id),
    columns: { id: true },
  });

  if (!play) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const memories = await db
    .select({
      id: playMemories.id,
      content: playMemories.content,
      sortOrder: playMemories.sortOrder,
    })
    .from(playMemories)
    .where(eq(playMemories.playId, id))
    .orderBy(asc(playMemories.sortOrder));

  return NextResponse.json(memories);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const play = await db.query.plays.findFirst({
    where: eq(plays.id, id),
    columns: { id: true },
  });

  if (!play) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(playMemories.sortOrder) })
    .from(playMemories)
    .where(eq(playMemories.playId, id));

  const [newMemory] = await db
    .insert(playMemories)
    .values({
      playId: id,
      content,
      sortOrder: (maxOrder ?? -1) + 1,
    })
    .returning();

  return NextResponse.json(newMemory, { status: 201 });
}
