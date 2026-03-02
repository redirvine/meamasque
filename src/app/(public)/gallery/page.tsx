export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, users, categories } from "@/db/schema";
import { eq, desc, and, ne, or, isNull } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { auth } from "../../../../auth";
import Link from "next/link";

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const session = await auth();
  const isAdmin = !!session;

  // Find the site subject
  const siteSubject = await db.query.users.findFirst({
    where: eq(users.isSiteSubject, true),
  });

  if (!siteSubject) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
        <p className="text-gray-500">No artwork to display yet.</p>
      </div>
    );
  }

  // Look up category by slug if provided
  let categoryRow: { id: string; name: string } | undefined;
  if (category) {
    categoryRow = await db.query.categories.findFirst({
      where: eq(categories.slug, category),
    });
  }

  const redirectPath = category ? `/gallery?category=${category}` : "/gallery";
  const pageTitle = categoryRow?.name ?? "Gallery";

  // Fetch images filtered by category, or all non-Theatre images as fallback
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        {isAdmin && (
          <Link
            href={`/admin/images/new?redirect=${encodeURIComponent(redirectPath)}`}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload
          </Link>
        )}
      </div>
      {allImages.length === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No artwork to display yet.</p>
        </div>
      ) : (
        <ImageGrid images={allImages} isAdmin={isAdmin} redirectPath={redirectPath} />
      )}
    </div>
  );
}
