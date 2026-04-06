export const dynamic = "force-dynamic";

import { db } from "@/db";
import { places, images, placeMemories, comments, likes } from "@/db/schema";
import { eq, sql, count, and, inArray } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Heart, MessageCircle, MapPin } from "lucide-react";

export const metadata = {
  title: "Places - Mary Elizabeth Atwood",
  description: "Significant places in the life of Mary Elizabeth Atwood",
};

export default async function PlacesPage() {
  const memoryCountSq = db
    .select({
      placeId: placeMemories.placeId,
      count: count().as("memory_count"),
    })
    .from(placeMemories)
    .groupBy(placeMemories.placeId)
    .as("mc");

  const allPlaces = await db
    .select({
      id: places.id,
      name: places.name,
      slug: places.slug,
      city: places.city,
      state: places.state,
      country: places.country,
      visitedOrLived: places.visitedOrLived,
      fromDate: places.fromDate,
      toDate: places.toDate,
      photoUrl: images.blobUrl,
      photoThumbnailUrl: images.thumbnailUrl,
      memoryCount: sql<number>`coalesce(${memoryCountSq.count}, 0)`.as("memoryCount"),
    })
    .from(places)
    .leftJoin(images, eq(places.photoId, images.id))
    .leftJoin(memoryCountSq, eq(places.id, memoryCountSq.placeId))
    .orderBy(places.name);

  // Fetch comment counts
  const placeIds = allPlaces.map((p) => p.id);
  const commentCounts = placeIds.length > 0
    ? await db
        .select({
          resourceId: comments.resourceId,
          count: count().as("count"),
        })
        .from(comments)
        .where(
          and(
            eq(comments.resourceType, "place"),
            inArray(comments.resourceId, placeIds)
          )
        )
        .groupBy(comments.resourceId)
    : [];

  const commentCountMap = new Map(commentCounts.map((c) => [c.resourceId, c.count]));

  // Fetch like counts
  const likeCounts = placeIds.length > 0
    ? await db
        .select({
          resourceId: likes.resourceId,
          count: count().as("count"),
        })
        .from(likes)
        .where(
          and(
            eq(likes.resourceType, "place"),
            inArray(likes.resourceId, placeIds)
          )
        )
        .groupBy(likes.resourceId)
    : [];

  const likeCountMap = new Map(likeCounts.map((l) => [l.resourceId, l.count]));

  function locationString(place: typeof allPlaces[number]) {
    return [place.city, place.state, place.country].filter(Boolean).join(", ");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {allPlaces.length === 0 ? (
        <p className="text-gray-500">No places added yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {allPlaces.map((place) => (
            <div key={place.id} className="relative">
              <Link
                href={`/places/${place.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
              {place.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.photoThumbnailUrl ?? place.photoUrl}
                  alt={place.name}
                  className="aspect-[3/2] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[3/2] w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <MapPin className="h-12 w-12 text-gray-300" />
                </div>
              )}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{place.name}</h2>
                  {place.visitedOrLived && (
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      place.visitedOrLived === "lived"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {place.visitedOrLived}
                    </span>
                  )}
                </div>
                {locationString(place) && (
                  <p className="text-sm text-gray-600">
                    {locationString(place)}
                  </p>
                )}
                {(place.fromDate || place.toDate) && (
                  <p className="mt-1 text-sm text-gray-500">
                    {place.fromDate ?? "?"}
                    {" – "}
                    {place.toDate ?? "?"}
                  </p>
                )}
                {(place.memoryCount > 0 || (commentCountMap.get(place.id) ?? 0) > 0 || (likeCountMap.get(place.id) ?? 0) > 0) && (
                  <div className="mt-auto flex gap-3 pt-3">
                    {(likeCountMap.get(place.id) ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <Heart className="h-3.5 w-3.5" />
                        {likeCountMap.get(place.id)}
                      </span>
                    )}
                    {place.memoryCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600">
                        <BookOpen className="h-3.5 w-3.5" />
                        {place.memoryCount} {place.memoryCount === 1 ? "memory" : "memories"}
                      </span>
                    )}
                    {(commentCountMap.get(place.id) ?? 0) > 0 && (
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {commentCountMap.get(place.id)} {commentCountMap.get(place.id) === 1 ? "comment" : "comments"}
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
