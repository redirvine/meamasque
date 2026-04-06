export const dynamic = "force-dynamic";

import { db } from "@/db";
import { ancestors, images, ancestorMemories, ancestorPhotos, categories, comments, likes } from "@/db/schema";
import { eq, count, desc, asc, ne, and, notInArray, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "../../../../../auth";
import { CollapsibleSections } from "./collapsible-sections";
import { AncestorPhoto } from "./ancestor-photo";
import { CollapseToggle } from "./collapse-toggle";
import { CommentsSection } from "@/components/comments/comments-section";
import { LikeButton } from "@/components/likes/like-button";

export default async function AncestorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  const { slug } = await params;

  const results = await db
    .select({
      id: ancestors.id,
      name: ancestors.name,
      slug: ancestors.slug,
      maidenName: ancestors.maidenName,
      relationship: ancestors.relationship,
      birthplace: ancestors.birthplace,
      born: ancestors.born,
      deathPlace: ancestors.deathPlace,
      died: ancestors.died,
      spouse: ancestors.spouse,
      occupation: ancestors.occupation,
      immigration: ancestors.immigration,
      bio: ancestors.bio,
      photoId: ancestors.photoId,
      photoUrl: images.blobUrl,
    })
    .from(ancestors)
    .leftJoin(images, eq(ancestors.photoId, images.id))
    .where(eq(ancestors.slug, slug))
    .limit(1);

  const ancestor = results[0];
  if (!ancestor) notFound();

  const [memoryCountResult] = await db
    .select({ count: count() })
    .from(ancestorMemories)
    .where(eq(ancestorMemories.ancestorId, ancestor.id));
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
    .from(ancestorPhotos)
    .innerJoin(images, eq(ancestorPhotos.imageId, images.id))
    .where(eq(ancestorPhotos.ancestorId, ancestor.id))
    .orderBy(asc(ancestorPhotos.sortOrder));

  // Fetch all other images for this ancestor (not the primary photo)
  const additionalPhotoIds = new Set(additionalPhotos.map((p) => p.id));
  const excludeIds = [
    ...(ancestor.photoId ? [ancestor.photoId] : []),
  ];

  const otherImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      thumbnailUrl: images.thumbnailUrl,
      dateCreated: images.dateCreated,
      description: images.description,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(
      and(
        eq(images.ancestorId, ancestor.id),
        excludeIds.length > 0 ? notInArray(images.id, excludeIds) : undefined
      )
    )
    .orderBy(desc(images.createdAt));

  // Split other images: "photo-like" (no category or "Photos") merge into additional photos,
  // everything else stays as categorized works
  const photoLike = otherImages.filter(
    (img) => !additionalPhotoIds.has(img.id) && (!img.categoryName || img.categoryName === "Photos")
  );
  const works = otherImages.filter(
    (img) => !additionalPhotoIds.has(img.id) && img.categoryName && img.categoryName !== "Photos"
  );

  // Merge: additional photos first, then uncategorized/Photos images
  const mergedPhotos = [
    ...additionalPhotos,
    ...photoLike.map((img) => ({
      id: img.id,
      title: img.title,
      blobUrl: img.blobUrl,
      thumbnailUrl: img.thumbnailUrl,
      description: img.description,
      dateCreated: img.dateCreated,
    })),
  ];

  // Fetch comment counts for all images on this page
  const allImageIds = [
    ...mergedPhotos.map((p) => p.id),
    ...works.map((w) => w.id),
  ];
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

  // Fetch like counts for all images on this page
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

  const grouped = new Map<string, typeof works>();
  for (const work of works) {
    const key = work.categoryName ?? "Other";
    const arr = grouped.get(key);
    if (arr) arr.push(work);
    else grouped.set(key, [work]);
  }

  const details = [
    { label: "Relationship", value: ancestor.relationship },
    { label: "Maiden Name", value: ancestor.maidenName },
    { label: "Born", value: ancestor.born },
    { label: "Birthplace", value: ancestor.birthplace },
    { label: "Died", value: ancestor.died },
    { label: "Death Place", value: ancestor.deathPlace },
    { label: "Spouse", value: ancestor.spouse },
    { label: "Occupation", value: ancestor.occupation },
    { label: "Immigration", value: ancestor.immigration },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/ancestors"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Ancestors
      </Link>

      <article>
        <div className="flex flex-col gap-6 sm:flex-row">
          {ancestor.photoUrl && (
            <AncestorPhoto src={ancestor.photoUrl} name={ancestor.name} />
          )}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-start gap-2">
                <h1 className="text-3xl font-bold">
                  {ancestor.name}
                  {ancestor.maidenName && (
                    <span className="font-normal text-gray-500">
                      {" "}
                      (née {ancestor.maidenName})
                    </span>
                  )}
                </h1>
                {isAdmin && (
                  <Link
                    href={`/admin/ancestors?edit=${ancestor.id}`}
                    className="mt-1 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    title="Edit ancestor"
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
          bio={ancestor.bio}
          memoryCount={memoryCount}
          ancestorId={ancestor.id}
          ancestorName={ancestor.name}
          additionalPhotos={mergedPhotos.map((p) => ({
            id: p.id,
            title: p.title ?? "",
            blobUrl: p.blobUrl ?? "",
            thumbnailUrl: p.thumbnailUrl,
            dateCreated: p.dateCreated,
            description: p.description,
            commentCount: commentCountMap.get(p.id) ?? 0,
            likeCount: likeCountMap.get(p.id) ?? 0,
          }))}
          photoGroups={Array.from(grouped.entries()).map(
            ([categoryName, imgs]) => ({
              categoryName,
              images: imgs.map((img) => ({
                id: img.id,
                title: img.title ?? "",
                blobUrl: img.blobUrl ?? "",
                thumbnailUrl: img.thumbnailUrl,
                dateCreated: img.dateCreated,
                description: img.description,
                commentCount: commentCountMap.get(img.id) ?? 0,
                likeCount: likeCountMap.get(img.id) ?? 0,
              })),
            })
          )}
          isAdmin={isAdmin}
          currentUserId={session?.user?.id}
          redirectPath={`/ancestors/${slug}`}
        />

        <div className="mt-8">
          <LikeButton
            resourceType="ancestor"
            resourceId={ancestor.id}
            currentUserId={session?.user?.id}
          />
        </div>

        <CommentsSection
          resourceType="ancestor"
          resourceId={ancestor.id}
          currentUserId={session?.user?.id}
          isAdmin={isAdmin}
        />
      </article>
    </div>
  );
}
