export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images, ancestorMemories, comments } from "@/db/schema";
import { eq, sql, count, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, MessageCircle, Pencil, User } from "lucide-react";
import { auth } from "../../../../auth";

export const metadata = {
  title: "Ancestors - Mary Elizabeth Atwood",
  description: "Family history and ancestors",
};

export default async function AncestorsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {allAncestors.length === 0 ? (
        <p className="text-gray-500">No ancestors added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {allAncestors.map((ancestor) => (
            <div key={ancestor.id} className="relative">
              {isAdmin && (
                <Link
                  href={`/admin/ancestors?edit=${ancestor.id}`}
                  className="absolute top-2 right-2 z-10 rounded-full bg-white/80 p-1.5 text-gray-400 shadow transition-colors hover:bg-white hover:text-gray-700"
                  title="Edit ancestor"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              )}
              <Link
                href={`/ancestors/${ancestor.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
              {ancestor.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ancestor.photoThumbnailUrl ?? ancestor.photoUrl}
                  alt={ancestor.name}
                  className="aspect-[3/2] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
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
                {(ancestor.memoryCount > 0 || (commentCountMap.get(ancestor.id) ?? 0) > 0) && (
                  <div className="mt-auto flex gap-3 pt-3">
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
