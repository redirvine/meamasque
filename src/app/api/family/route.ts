import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { familyAccess } from "@/db/schema";
import { compare } from "bcryptjs";

export async function POST(request: NextRequest) {
  const { code } = await request.json();

  if (!code) {
    return NextResponse.json(
      { error: "Access code is required" },
      { status: 400 }
    );
  }

  // Check against all stored access codes
  const codes = await db.select().from(familyAccess);

  for (const entry of codes) {
    const match = await compare(code, entry.hashedCode);
    if (match) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("family_access", "verified", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
      return response;
    }
  }

  return NextResponse.json(
    { error: "Invalid access code" },
    { status: 401 }
  );
}
