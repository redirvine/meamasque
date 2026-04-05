import { db } from "../src/db";
import { users, passwordResetTokens } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashToken } from "../src/lib/tokens";
import { sendWelcomeEmail } from "../src/lib/email";

async function main() {
  const targetEmail = process.argv[2];
  if (!targetEmail) {
    console.error("Usage: npx tsx scripts/send-reset-email.ts <email>");
    process.exit(1);
  }

  const user = await db.query.users.findFirst({
    where: eq(users.email, targetEmail),
  });

  if (!user) {
    console.error(`No user found with email: ${targetEmail}`);
    process.exit(1);
  }

  const rawToken = generateToken();
  const hashed = hashToken(rawToken);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    hashedToken: hashed,
  });

  await sendWelcomeEmail(targetEmail, rawToken);
  console.log(`Welcome email sent to ${targetEmail}`);
}

main();
