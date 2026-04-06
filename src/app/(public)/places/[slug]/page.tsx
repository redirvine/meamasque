export const dynamic = "force-dynamic";

import { db } from "@/db";
import { places, images, placeMemories, placePhotos, comments, likes } from "@/db/schema";
import { eq, count, asc, and, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "../../../../../auth";
import { CollapsibleSections } from "./collapsible-sections";
import { PlacePhoto } from "./place-photo";
import { CollapseToggle } from "../../ancestors/[slug]/collapse-toggle";
import { CommentsSection } from "@/components/comments/comments-section";
import { LikeButton } from "@/components/likes/like-button";

export default async function PlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const { slug } = await params;

  const results = await db
    .select({
      id: places.id,
      name: places.name,
      slug: places.slug,
      description: places.description,
      streetAddress: places.streetAddress,
      city: places.city,
      state: places.state,
      country: places.country,
      visitedOrLived: places.visitedOrLived,
      fromDate: places.fromDate,
      toDate: places.toDate,
      photoId: places.photoId,
      photoUrl: images.blobUrl,
    })
    .from(places)
    .leftJoin(images, eq(places.photoId, images.id))
    .where(eq(places.slug, slug))
    .limit(1);

  const place = results[0];
  if (!place) notFound();

  const [memoryCountResult] = await db
    .select({ count: count() })
    .from(placeMemories)
    .where(eq(placeMemories.placeId, place.id));
  const memoryCount = memoryCountResult?.count ?? 0;

  const additionalPhotos = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      thumbnailUrl: images.thumbnailUrl,
      description: images.description,
      dateCreated: images.dateCreated,
    })
    .from(placePhotos)
    .innerJoin(images, eq(placePhotos.imageId, images.id))
    .where(eq(placePhotos.placeId, place.id))
    .orderBy(asc(placePhotos.sortOrder));

  // Fetch comment/like counts for photos
  const allImageIds = additionalPhotos.map((p) => p.id);
  const imageCommentCounts = allImageIds.length > 0
    ? await db
        .select({
          resourceId: comments.resourceId,
          count: count().as("count"),
        })
        .from(comments)
        .where(
          and(
            eq(comments.resourceType, "image"),
            inArray(comments.resourceId, allImageIds)
          )
        )
        .groupBy(comments.resourceId)
    : [];
  const commentCountMap = new Map(imageCommentCounts.map((c) => [c.resourceId, c.count]));

  const imageLikeCounts = allImageIds.length > 0
    ? await db
        .select({
          resourceId: likes.resourceId,
          count: count().as("count"),
        })
        .from(likes)
        .where(
          and(
            eq(likes.resourceType, "image"),
            inArray(likes.resourceId, allImageIds)
          )
        )
        .groupBy(likes.resourceId)
    : [];
  const likeCountMap = new Map(imageLikeCounts.map((l) => [l.resourceId, l.count]));

  const locationParts = [place.city, place.state, place.country].filter(Boolean);

  const details = [
    { label: "Address", value: place.streetAddress },
    { label: "Location", value: locationParts.length > 0 ? locationParts.join(", ") : null },
    { label: "Type", value: place.visitedOrLived ? (place.visitedOrLived === "lived" ? "Lived here" : "Visited") : null },
    { label: "From", value: place.fromDate },
    { label: "To", value: place.toDate },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/places"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Places
      </Link>

      <article>
        <div className="flex flex-col gap-6 sm:flex-row">
          {place.photoUrl && (
            <PlacePhoto src={place.photoUrl} name={place.name} />
          )}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <h1 className="text-3xl font-bold">{place.name}</h1>
                {isAdmin && (
                  <Link
                    href={`/admin/places?edit=${place.id}`}
                    className="mt-1 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    title="Edit place"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {details.length > 0 && (
                <dl className="mt-4 space-y-2">
                  {details.map((d) => (
                    <div key={d.label} className="flex gap-2">
                      <dt className="text-sm font-medium text-gray-500 w-28 flex-shrink-0">
                        {d.label}
                      </dt>
                      <dd className="text-sm text-gray-900">{d.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div className="flex justify-end">
              <CollapseToggle />
            </div>
          </div>
        </div>

        <CollapsibleSections
          description={place.description}
          memoryCount={memoryCount}
          placeId={place.id}
          placeName={place.name}
          additionalPhotos={additionalPhotos.map((p) => ({
            id: p.id,
            title: p.title ?? "",
            blobUrl: p.blobUrl ?? "",
            thumbnailUrl: p.thumbnailUrl,
            dateCreated: p.dateCreated,
            description: p.description,
            commentCount: commentCountMap.get(p.id) ?? 0,
            likeCount: likeCountMap.get(p.id) ?? 0,
          }))}
          isAdmin={isAdmin}
          currentUserId={session?.user?.id}
          redirectPath={`/places/${slug}`}
        />

        <div className="mt-8">
          <LikeButton
            resourceType="place"
            resourceId={place.id}
            currentUserId={session?.user?.id}
          />
        </div>

        <CommentsSection
          resourceType="place"
          resourceId={place.id}
          currentUserId={session?.user?.id}
          isAdmin={isAdmin}
        />
      </article>
    </div>
  );
}
