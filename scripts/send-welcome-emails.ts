import { db } from "../src/db";
import { users, passwordResetTokens } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { generateToken, hashToken } from "../src/lib/tokens";
import { sendWelcomeEmail } from "../src/lib/email";

async function sendToUser(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    console.error(`  No user found: ${email}`);
    return;
  }

  const rawToken = generateToken();
  const hashed = hashToken(rawToken);

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    hashedToken: hashed,
  });

  await sendWelcomeEmail(email, rawToken);
  console.log(`  Sent to ${email}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // List all family users and ask to confirm
    const allFamily = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.role, "family"));

    console.log("Family users who would receive the welcome email:\n");
    for (const u of allFamily) {
      console.log(`  ${u.email?.padEnd(35)} | ${u.name}`);
    }
    console.log(`\nTo send to all: npx tsx scripts/send-welcome-emails.ts --all-family`);
    console.log(`To send to specific: npx tsx scripts/send-welcome-emails.ts email1 email2 ...`);
    return;
  }

  if (args[0] === "--all-family") {
    const allFamily = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "family"));

    console.log(`Sending welcome emails to ${allFamily.length} family users...`);
    for (const u of allFamily) {
      if (u.email) await sendToUser(u.email);
    }
  } else {
    console.log(`Sending welcome emails to ${args.length} specified users...`);
    for (const email of args) {
      await sendToUser(email);
    }
  }

  console.log("\nDone!");
}

main();
