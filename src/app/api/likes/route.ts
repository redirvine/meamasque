import { NextResponse } from "next/server";
import { db } from "@/db";
import { likes, users } from "@/db/schema";
import { auth } from "../../../../auth";
import { eq, and, ne, count } from "drizzle-orm";
import { sendLikeNotificationEmail } from "@/lib/email";

const VALID_TYPES = ["image", "play", "ancestor", "place"] as const;
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

  const session = await auth();

  const [countResult] = await db
    .select({ count: count() })
    .from(likes)
    .where(
      and(
        eq(likes.resourceType, resourceType),
        eq(likes.resourceId, resourceId)
      )
    );

  let likedByCurrentUser = false;
  let userLikeId: string | null = null;

  if (session?.user?.id) {
    const userLike = await db.query.likes.findFirst({
      where: and(
        eq(likes.resourceType, resourceType),
        eq(likes.resourceId, resourceId),
        eq(likes.userId, session.user.id)
      ),
    });
    if (userLike) {
      likedByCurrentUser = true;
      userLikeId = userLike.id;
    }
  }

  return NextResponse.json({
    count: countResult?.count ?? 0,
    likedByCurrentUser,
    userLikeId,
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const resourceType = body.resourceType as ResourceType;
  const resourceId = typeof body.resourceId === "string" ? body.resourceId : "";

  if (!resourceType || !resourceId || !VALID_TYPES.includes(resourceType)) {
    return NextResponse.json(
      { error: "resourceType and resourceId are required" },
      { status: 400 }
    );
  }

  // Check if already liked
  const existing = await db.query.likes.findFirst({
    where: and(
      eq(likes.resourceType, resourceType),
      eq(likes.resourceId, resourceId),
      eq(likes.userId, session.user.id)
    ),
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const [newLike] = await db
    .insert(likes)
    .values({
      resourceType,
      resourceId,
      userId: session.user.id,
    })
    .returning();

  // Notify admin users
  try {
    const rows = await db
      .select({ email: users.email })
      .from(users)
      .where(and(eq(users.role, "admin"), ne(users.id, session.user.id)));
    const emails = rows.map((r) => r.email);
    if (emails.length > 0) {
      await sendLikeNotificationEmail(
        emails,
        session.user.name || "Someone",
        resourceType,
        resourceId
      );
    }
  } catch (err) {
    console.error("Like notification email failed:", err);
  }

  return NextResponse.json(newLike, { status: 201 });
}
