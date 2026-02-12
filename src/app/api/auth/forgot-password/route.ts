import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });

  if (!email) {
    return successResponse;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return successResponse;
  }

  const rawToken = generateToken();
  const hashed = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    hashedToken: hashed,
    expiresAt,
  });

  try {
    await sendPasswordResetEmail(email, rawToken);
  } catch {
    // Log internally but don't reveal to user
    console.error("Failed to send password reset email");
  }

  return successResponse;
}
