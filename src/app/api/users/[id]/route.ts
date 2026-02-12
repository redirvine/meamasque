import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
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
  const { email, password, name, role } = await request.json();

  const updates: Record<string, unknown> = {};
  if (email !== undefined) updates.email = email;
  if (name !== undefined) updates.name = name || null;
  if (role !== undefined) updates.role = role;
  if (password) {
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    updates.hashedPassword = await hash(password, 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return NextResponse.json(
        { error: "A user with that email already exists" },
        { status: 409 }
      );
    }
    throw error;
  }
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

  // Prevent deleting yourself
  if (session.user?.id === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account" },
      { status: 400 }
    );
  }

  // Prevent deleting the last admin
  const [{ total }] = await db.select({ total: count() }).from(users);
  if (total <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last admin user" },
      { status: 400 }
    );
  }

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
