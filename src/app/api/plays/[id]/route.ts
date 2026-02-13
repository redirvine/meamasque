import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { plays } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updatePlaySchema = z.object({
  play: z.string().min(1).optional(),
  date: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

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

  const [updated] = await db
    .update(plays)
    .set(parsed.data)
    .where(eq(plays.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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
  await db.delete(plays).where(eq(plays.id, id));

  return NextResponse.json({ success: true });
}
