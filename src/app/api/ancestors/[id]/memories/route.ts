import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors, ancestorMemories } from "@/db/schema";
import { eq, asc, max } from "drizzle-orm";
import { auth } from "../../../../../../auth";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const ancestor = await db.query.ancestors.findFirst({
    where: eq(ancestors.id, id),
    columns: { id: true },
  });

  if (!ancestor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(ancestorMemories.sortOrder) })
    .from(ancestorMemories)
    .where(eq(ancestorMemories.ancestorId, id));

  const [newMemory] = await db
    .insert(ancestorMemories)
    .values({
      ancestorId: id,
      content,
      sortOrder: (maxOrder ?? -1) + 1,
    })
    .returning();

  return NextResponse.json(newMemory, { status: 201 });
}
