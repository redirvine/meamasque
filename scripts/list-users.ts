import { db } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
  const all = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role })
    .from(users);
  for (const u of all) {
    console.log(`${u.role?.padEnd(6)} | ${u.email?.padEnd(35)} | ${u.name}`);
  }
}

main();
