import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { users, ancestors, images } from "./schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const db = drizzle(client);

async function migrate() {
  // 1. Find Mary Elizabeth's user record
  const allUsers = await db.select().from(users);
  const maryUser = allUsers.find((u) =>
    u.name?.includes("Mary Elizabeth")
  );
  if (!maryUser) {
    console.error("Could not find Mary Elizabeth user record");
    process.exit(1);
  }
  console.log(`Found user: ${maryUser.name} (${maryUser.id})`);

  // 2. Set isSiteSubject on her user
  await db
    .update(users)
    .set({ isSiteSubject: true })
    .where(eq(users.id, maryUser.id));
  console.log("Set isSiteSubject = true");

  // 3. Find her ancestor record
  const allAncestors = await db.select().from(ancestors);
  const maryAncestor = allAncestors.find((a) =>
    a.name.includes("Mary Elizabeth")
  );
  if (!maryAncestor) {
    console.error("Could not find Mary Elizabeth ancestor record");
    process.exit(1);
  }
  console.log(`Found ancestor: ${maryAncestor.name} (${maryAncestor.id})`);

  // 4. Move images from ancestorId to creatorUserId
  const updated = await db
    .update(images)
    .set({ creatorUserId: maryUser.id, ancestorId: null })
    .where(eq(images.ancestorId, maryAncestor.id))
    .returning();
  console.log(`Updated ${updated.length} images to creatorUserId`);

  // 5. Delete the ancestor record
  await db.delete(ancestors).where(eq(ancestors.id, maryAncestor.id));
  console.log("Deleted ancestor record");

  console.log("Migration complete!");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
