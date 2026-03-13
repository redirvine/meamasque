import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, users } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, and, isNull } from "drizzle-orm";

const VALID_TYPES = ["image", "play", "ancestor"] as const;
type ResourceType = (typeof VALID_TYPES)[number];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resourceType = searchParams.get("resourceType") as ResourceType;
  const resourceId = searchParams.get("resourceId");

  if (!resourceType || !resourceId || !VALID_TYPES.includes(resourceType)) {
    return NextResponse.json(
      { error: "resourceType and resourceId are required" },
      { status: 400 }
    );
  }

  const rows = await db
    .select({
      id: comments.id,
      resourceType: comments.resourceType,
      resourceId: comments.resourceId,
      parentId: comments.parentId,
      userId: comments.userId,
      content: comments.content,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(
      and(
        eq(comments.resourceType, resourceType),
        eq(comments.resourceId, resourceId)
      )
    )
    .orderBy(comments.createdAt);

  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const resourceType = body.resourceType as ResourceType;
  const resourceId = typeof body.resourceId === "string" ? body.resourceId : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const parentId = typeof body.parentId === "string" ? body.parentId : null;

  if (!resourceType || !resourceId || !VALID_TYPES.includes(resourceType)) {
    return NextResponse.json(
      { error: "resourceType and resourceId are required" },
      { status: 400 }
    );
  }

  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  // If replying, ensure parent is a top-level comment (no nested replies)
  if (parentId) {
    const [parent] = await db
      .select({ id: comments.id, parentId: comments.parentId })
      .from(comments)
      .where(eq(comments.id, parentId));

    if (!parent) {
      return NextResponse.json(
        { error: "Parent comment not found" },
        { status: 404 }
      );
    }

    if (parent.parentId !== null) {
      return NextResponse.json(
        { error: "Cannot reply to a reply" },
        { status: 400 }
      );
    }
  }

  const [newComment] = await db
    .insert(comments)
    .values({
      resourceType,
      resourceId,
      parentId,
      userId: session.user.id,
      content,
    })
    .returning();

  return NextResponse.json(
    { ...newComment, userName: session.user.name },
    { status: 201 }
  );
}
