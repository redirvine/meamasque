import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ancestors } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
  const parsed = updateAncestorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(ancestors)
    .set(parsed.data)
    .where(eq(ancestors.id, id))
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
  await db.delete(ancestors).where(eq(ancestors.id, id));

  return NextResponse.json({ success: true });
}
