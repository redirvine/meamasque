import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays, playMemories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

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
