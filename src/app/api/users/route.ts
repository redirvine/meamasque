import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "../../../../auth";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users);

  return NextResponse.json(allUsers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, password, name, role } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        hashedPassword,
        name: name || null,
        role: role || "admin",
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      });

    return NextResponse.json(user);
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
