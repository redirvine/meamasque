import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes } from "@/db/schema";
import { auth } from "../../../../../auth";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [like] = await db
    .select()
    .from(likes)
    .where(eq(likes.id, id));

  if (!like) {
    return NextResponse.json({ error: "Like not found" }, { status: 404 });
  }

  if (like.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(likes).where(eq(likes.id, id));

  return NextResponse.json({ success: true });
}
