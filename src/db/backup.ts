import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

async function backup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = join(process.cwd(), "backup", timestamp);
  const blobDir = join(backupDir, "blobs");
  await mkdir(blobDir, { recursive: true });

  console.log(`Backup: ${timestamp}\n`);

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  // --- 1. Export database tables as JSON ---
  console.log("Exporting database...");

  const tables = {
    users: await db.select({ id: schema.users.id, email: schema.users.email, name: schema.users.name, role: schema.users.role, createdAt: schema.users.createdAt }).from(schema.users),
    artists: await db.select().from(schema.artists),
    categories: await db.select().from(schema.categories),
    images: await db.select().from(schema.images),
    stories: await db.select().from(schema.stories),
    storyImages: await db.select().from(schema.storyImages),
    ancestors: await db.select().from(schema.ancestors),
    plays: await db.select().from(schema.plays),
    siteAbout: await db.select().from(schema.siteAbout),
    familyAccess: await db.select({ id: schema.familyAccess.id, label: schema.familyAccess.label, createdAt: schema.familyAccess.createdAt }).from(schema.familyAccess),
  };

  for (const [name, rows] of Object.entries(tables)) {
    await writeFile(
      join(backupDir, `${name}.json`),
      JSON.stringify(rows, null, 2)
    );
    console.log(`  ✓ ${name}: ${rows.length} rows`);
  }

  // --- 2. Download blobs ---
  console.log("\nDownloading images...");

  let success = 0;
  let failed = 0;

  for (const image of tables.images) {
    const url = image.blobUrl;
    const ext = getExtension(url);
    const filename = `${image.id}${ext}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ✗ ${image.title} — HTTP ${res.status}`);
        failed++;
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(join(blobDir, filename), buffer);
      console.log(`  ✓ ${image.title}`);
      success++;
    } catch (err) {
      console.error(
        `  ✗ ${image.title} — ${err instanceof Error ? err.message : err}`
      );
      failed++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Location: ${backupDir}`);
  console.log(`Database: ${Object.values(tables).reduce((sum, rows) => sum + rows.length, 0)} total rows across ${Object.keys(tables).length} tables`);
  console.log(`Images: ${success} saved, ${failed} failed`);

  process.exit(failed > 0 ? 1 : 0);
}

function getExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.substring(pathname.lastIndexOf("."));
    if (ext && ext.length <= 5) return ext;
  } catch {
    // ignore
  }
  return ".bin";
}

backup().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
