import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

async function backupBlobs() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  const backupDir = join(process.cwd(), "backup", "blobs");
  await mkdir(backupDir, { recursive: true });

  const allImages = await db.select().from(schema.images);

  console.log(`Found ${allImages.length} images to back up`);
  console.log(`Saving to ${backupDir}\n`);

  let success = 0;
  let failed = 0;

  for (const image of allImages) {
    const url = image.blobUrl;
    const filename = `${image.id}${getExtension(url)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`✗ ${image.title} — HTTP ${res.status}`);
        failed++;
        continue;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(join(backupDir, filename), buffer);
      console.log(`✓ ${image.title} → ${filename}`);
      success++;
    } catch (err) {
      console.error(
        `✗ ${image.title} — ${err instanceof Error ? err.message : err}`
      );
      failed++;
    }
  }

  console.log(`\nDone: ${success} saved, ${failed} failed`);
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

backupBlobs().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
