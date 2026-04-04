export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays, images, playMemories, categories, comments, likes } from "@/db/schema";
import { eq, desc, count, sql, and, inArray } from "drizzle-orm";
import { auth } from "../../../../auth";
import { PlaysListing } from "./plays-listing";

export const metadata = {
  title: "Plays - Mary Elizabeth Atwood",
  description: "Acting history and performances",
};

export default async function PlaysPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const memoryCountSq = db
    .select({
      playId: playMemories.playId,
      count: count().as("memory_count"),
    })
    .from(playMemories)
    .groupBy(playMemories.playId)
    .as("mc");

  const theatreCategory = await db.query.categories.findFirst({
    where: eq(categories.name, "Theatre"),
  });

  const allPlays = await db
    .select({
      id: plays.id,
      play: plays.play,
      role: plays.role,
      location: plays.location,
      description: plays.description,
      year: plays.year,
      primaryImageUrl: images.blobUrl,
      primaryImageThumbnailUrl: images.thumbnailUrl,
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

  // Fetch comment counts for plays
  const playIds = allPlays.map((p) => p.id);
  const commentCounts = playIds.length > 0
    ? await db
        .select({
          resourceId: comments.resourceId,
          count: count().as("count"),
        })
        .from(comments)
        .where(
          and(
            eq(comments.resourceType, "play"),
            inArray(comments.resourceId, playIds)
          )
        )
        .groupBy(comments.resourceId)
    : [];

  const commentCountMap = new Map(commentCounts.map((c) => [c.resourceId, c.count]));

  // Fetch like counts for plays
  const likeCounts = playIds.length > 0
    ? await db
        .select({
          resourceId: likes.resourceId,
          count: count().as("count"),
        })
        .from(likes)
        .where(
          and(
            eq(likes.resourceType, "play"),
            inArray(likes.resourceId, playIds)
          )
        )
        .groupBy(likes.resourceId)
    : [];

  const likeCountMap = new Map(likeCounts.map((l) => [l.resourceId, l.count]));
  const playsWithComments = allPlays.map((p) => ({
    ...p,
    commentCount: commentCountMap.get(p.id) ?? 0,
    likeCount: likeCountMap.get(p.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {allPlays.length === 0 ? (
        <p className="text-gray-500">No plays added yet.</p>
      ) : (
        <PlaysListing
          plays={playsWithComments}
          isAdmin={isAdmin}
          headerText={theatreCategory?.descriptionHeader}
          headerDescription={theatreCategory?.description}
        />
      )}
    </div>
  );
}
