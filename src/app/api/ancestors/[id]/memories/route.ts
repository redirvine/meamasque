import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors, ancestorMemories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const ancestor = await db.query.ancestors.findFirst({
    where: eq(ancestors.id, id),
    columns: { id: true },
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

  return NextResponse.json(memories);
}
