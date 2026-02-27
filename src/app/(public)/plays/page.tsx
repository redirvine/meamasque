export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays, images, playMemories } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { auth } from "../../../../auth";
import { PlaysListing } from "./plays-listing";

export const metadata = {
  title: "Plays - Meamasque",
  description: "Acting history and performances",
};

export default async function PlaysPage() {
  const session = await auth();
  const isAdmin = !!session;

  const memoryCountSq = db
    .select({
      playId: playMemories.playId,
      count: count().as("memory_count"),
    })
    .from(playMemories)
    .groupBy(playMemories.playId)
    .as("mc");

  const allPlays = await db
    .select({
      id: plays.id,
      play: plays.play,
      date: plays.date,
      role: plays.role,
      location: plays.location,
      description: plays.description,
      year: plays.year,
      primaryImageUrl: images.blobUrl,
      imageCount: sql<number>`(
        SELECT COUNT(*) FROM (
          SELECT image_id AS iid FROM play_images WHERE play_id = ${plays.id}
          UNION
          SELECT ${plays.primaryImageId} AS iid WHERE ${plays.primaryImageId} IS NOT NULL
        )
      )`.as("imageCount"),
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(plays)
    .leftJoin(images, eq(plays.primaryImageId, images.id))
    .leftJoin(memoryCountSq, eq(plays.id, memoryCountSq.playId))
    .orderBy(desc(plays.year), desc(plays.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Plays</h1>

      {allPlays.length === 0 ? (
        <p className="text-gray-500">No plays added yet.</p>
      ) : (
        <PlaysListing plays={allPlays} isAdmin={isAdmin} />
      )}
    </div>
  );
}
