import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { familyAccess } from "@/db/schema";
import { auth } from "../../../../auth";
import { hash } from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const codes = await db
    .select({
      id: familyAccess.id,
      label: familyAccess.label,
      createdAt: familyAccess.createdAt,
    })
    .from(familyAccess);

  return NextResponse.json(codes);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, label } = await request.json();

  if (!code || code.length < 4) {
    return NextResponse.json(
      { error: "Code must be at least 4 characters" },
      { status: 400 }
    );
  }

  const hashedCode = await hash(code, 12);

  const [entry] = await db
    .insert(familyAccess)
    .values({ hashedCode, label: label || null })
    .returning();

  return NextResponse.json({
    id: entry.id,
    label: entry.label,
    createdAt: entry.createdAt,
  });
}
