import { db } from "./index";
import { images } from "./schema";
import { isNull } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { generateThumbnail } from "../lib/thumbnail";

async function main() {
  const rows = await db
    .select({ id: images.id, blobUrl: images.blobUrl })
    .from(images)
    .where(isNull(images.thumbnailUrl));

  console.log(`Found ${rows.length} images without thumbnails`);

  let success = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const thumbnailUrl = await generateThumbnail(row.blobUrl, row.id);
      if (thumbnailUrl) {
        await db
          .update(images)
          .set({ thumbnailUrl })
          .where(eq(images.id, row.id));
        success++;
        console.log(`[${success + failed}/${rows.length}] ${row.id} — OK`);
      } else {
        failed++;
        console.log(`[${success + failed}/${rows.length}] ${row.id} — skipped (no thumbnail generated)`);
      }
    } catch (err) {
      failed++;
      console.error(`[${success + failed}/${rows.length}] ${row.id} — FAILED`, err);
    }
  }

  console.log(`\nDone: ${success} generated, ${failed} failed`);
  process.exit(0);
}

main();
