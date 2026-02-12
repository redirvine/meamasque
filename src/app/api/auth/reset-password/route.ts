import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, isNull, gt } from "drizzle-orm";
import { hashToken } from "@/lib/tokens";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const hashedToken = hashToken(token);

  const resetToken = await db.query.passwordResetTokens.findFirst({
    where: and(
      eq(passwordResetTokens.hashedToken, hashedToken),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date())
    ),
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: "Invalid or expired reset link. Please request a new one." },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(password, 12);

  await db
    .update(users)
    .set({ hashedPassword })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, resetToken.id));

  return NextResponse.json({ message: "Password has been reset successfully" });
}
