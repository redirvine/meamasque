import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { familyAccess } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "../../../../../auth";
import { hash } from "bcryptjs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { code, label } = await request.json();

  const updates: Record<string, unknown> = {};
  if (label !== undefined) updates.label = label || null;
  if (code) {
    if (code.length < 4) {
      return NextResponse.json(
        { error: "Code must be at least 4 characters" },
        { status: 400 }
      );
    }
    updates.hashedCode = await hash(code, 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  await db.update(familyAccess).set(updates).where(eq(familyAccess.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(familyAccess).where(eq(familyAccess.id, id));

  return NextResponse.json({ success: true });
}
