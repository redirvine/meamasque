import { db } from "../src/db";
import { users, auditLogs } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const allUsers = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users);

  console.log("Users who have NEVER logged in:\n");
  const neverLoggedIn = [];

  for (const u of allUsers) {
    const login = await db.query.auditLogs.findFirst({
      where: and(
        eq(auditLogs.userId, u.id),
        eq(auditLogs.action, "login")
      ),
    });
    if (!login) {
      neverLoggedIn.push(u);
      console.log(`  ${u.role?.padEnd(6)} | ${u.email?.padEnd(35)} | ${u.name}`);
    }
  }

  console.log(`\n${neverLoggedIn.length} user(s) have never logged in.`);
}

main();
