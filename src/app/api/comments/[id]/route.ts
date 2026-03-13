import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
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

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id));

  if (!comment) {
    return NextResponse.json(
      { error: "Comment not found" },
      { status: 404 }
    );
  }

  // Only admins or the author can delete
  const isAdmin = session.user.role === "admin";
  if (!isAdmin && comment.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Delete replies first if this is a top-level comment
  if (comment.parentId === null) {
    await db.delete(comments).where(eq(comments.parentId, id));
  }

  await db.delete(comments).where(eq(comments.id, id));

  return NextResponse.json({ success: true });
}
