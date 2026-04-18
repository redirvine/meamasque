export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images, ancestorMemories, comments, likes } from "@/db/schema";
import { eq, sql, count, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Heart, MessageCircle, User } from "lucide-react";

export const metadata = {
  title: "Ancestors - Mary Elizabeth Atwood",
  description: "Family history and ancestors",
};

export default async function AncestorsPage() {
  const memoryCountSq = db
    .select({
      ancestorId: ancestorMemories.ancestorId,
      count: count().as("memory_count"),
    })
    .from(ancestorMemories)
    .groupBy(ancestorMemories.ancestorId)
    .as("mc");

  const allAncestors = await db
    .select({
      id: ancestors.id,
      name: ancestors.name,
      slug: ancestors.slug,
      maidenName: ancestors.maidenName,
      relationship: ancestors.relationship,
      born: ancestors.born,
      died: ancestors.died,
      birthplace: ancestors.birthplace,
      photoUrl: images.blobUrl,
      photoThumbnailUrl: images.thumbnailUrl,
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(ancestors)
    .leftJoin(images, eq(ancestors.photoId, images.id))
    .leftJoin(memoryCountSq, eq(ancestors.id, memoryCountSq.ancestorId))
    .orderBy(ancestors.name);

  // Fetch comment counts for ancestors
  const ancestorIds = allAncestors.map((a) => a.id);
  const commentCounts = ancestorIds.length > 0
    ? await db
        .select({
          resourceId: comments.resourceId,
          count: count().as("count"),
        })
        .from(comments)
        .where(
          and(
            eq(comments.resourceType, "ancestor"),
            inArray(comments.resourceId, ancestorIds)
          )
        )
        .groupBy(comments.resourceId)
    : [];

  const commentCountMap = new Map(commentCounts.map((c) => [c.resourceId, c.count]));

  // Fetch like counts for ancestors
  const likeCounts = ancestorIds.length > 0
    ? await db
        .select({
          resourceId: likes.resourceId,
          count: count().as("count"),
        })
        .from(likes)
        .where(
          and(
            eq(likes.resourceType, "ancestor"),
            inArray(likes.resourceId, ancestorIds)
          )
        )
        .groupBy(likes.resourceId)
    : [];

  const likeCountMap = new Map(likeCounts.map((l) => [l.resourceId, l.count]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {allAncestors.length === 0 ? (
        <p className="text-gray-500">No ancestors added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {allAncestors.map((ancestor) => (
            <div key={ancestor.id} className="relative">
              <Link
                href={`/ancestors/${ancestor.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
              {ancestor.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ancestor.photoThumbnailUrl ?? ancestor.photoUrl}
                  alt={ancestor.name}
                  className="aspect-[4/5] w-full object-cover object-top"
                />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <User className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <h2 className="text-lg font-semibold">
                  {ancestor.name}
                  {ancestor.maidenName && (
                    <span className="font-normal text-gray-500">
                      {" "}
                      (née {ancestor.maidenName})
                    </span>
                  )}
                </h2>
                {ancestor.relationship && (
                  <p className="text-sm text-gray-600">
                    {ancestor.relationship}
                  </p>
                )}
                {(ancestor.born || ancestor.died) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {ancestor.born ?? "?"}
                    {" – "}
                    {ancestor.died ?? "?"}
                  </p>
                )}
                {(ancestor.memoryCount > 0 || (commentCountMap.get(ancestor.id) ?? 0) > 0 || (likeCountMap.get(ancestor.id) ?? 0) > 0) && (
                  <div className="mt-auto flex gap-3 pt-3">
                    {(likeCountMap.get(ancestor.id) ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Heart className="h-3.5 w-3.5" />
                        {likeCountMap.get(ancestor.id)}
                      </span>
                    )}
                    {ancestor.memoryCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                        <BookOpen className="h-3.5 w-3.5" />
                        {ancestor.memoryCount} {ancestor.memoryCount === 1 ? "memory" : "memories"}
                      </span>
                    )}
                    {(commentCountMap.get(ancestor.id) ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {commentCountMap.get(ancestor.id)} {commentCountMap.get(ancestor.id) === 1 ? "comment" : "comments"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
