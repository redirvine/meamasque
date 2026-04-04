export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, users, categories, comments, likes } from "@/db/schema";
import { eq, desc, and, ne, or, isNull, inArray, count } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { auth } from "../../../../auth";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; image?: string }>;
}) {
  const { category, image: openImageId } = await searchParams;
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  // Find the site subject
  const siteSubject = await db.query.users.findFirst({
    where: eq(users.isSiteSubject, true),
  });

  if (!siteSubject) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-gray-500">No artwork to display yet.</p>
      </div>
    );
  }

  // Look up category by slug if provided
  let categoryRow: { id: string; name: string; description: string | null; descriptionHeader: string | null } | undefined;
  if (category) {
    categoryRow = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
    });
  }

  const redirectPath = category ? `/gallery?category=${category}` : "/gallery";

  // Fetch images filtered by category, or all non-Theatre images as fallback
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      thumbnailUrl: images.thumbnailUrl,
      dateCreated: images.dateCreated,
      description: images.description,
      featured: images.featured,
      creatorName: users.name,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(users, eq(images.creatorUserId, users.id))
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(
      and(
        eq(images.creatorUserId, siteSubject.id),
        categoryRow
          ? eq(images.categoryId, categoryRow.id)
          : or(ne(categories.name, "Theatre"), isNull(categories.name))
      )
    )
    .orderBy(desc(images.createdAt));

  // Fetch comment counts for all images in one query
  const imageIds = allImages.map((img) => img.id);
  const commentCounts = imageIds.length > 0
    ? await db
        .select({
          resourceId: comments.resourceId,
          count: count().as("count"),
        })
        .from(comments)
        .where(
          and(
            eq(comments.resourceType, "image"),
            inArray(comments.resourceId, imageIds)
          )
        )
        .groupBy(comments.resourceId)
    : [];

  const commentCountMap = new Map(commentCounts.map((c) => [c.resourceId, c.count]));

  // Fetch like counts for all images in one query
  const likeCounts = imageIds.length > 0
    ? await db
        .select({
          resourceId: likes.resourceId,
          count: count().as("count"),
        })
        .from(likes)
        .where(
          and(
            eq(likes.resourceType, "image"),
            inArray(likes.resourceId, imageIds)
          )
        )
        .groupBy(likes.resourceId)
    : [];

  const likeCountMap = new Map(likeCounts.map((l) => [l.resourceId, l.count]));
  const imagesWithComments = allImages.map((img) => ({
    ...img,
    commentCount: commentCountMap.get(img.id) ?? 0,
    likeCount: likeCountMap.get(img.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {allImages.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No artwork to display yet.</p>
        </div>
      ) : (
        <ImageGrid images={imagesWithComments} isAdmin={isAdmin} currentUserId={session?.user?.id} redirectPath={redirectPath} categoryDescription={categoryRow?.description} categoryDescriptionHeader={categoryRow?.descriptionHeader} openImageId={openImageId} />
      )}
    </div>
  );
}
