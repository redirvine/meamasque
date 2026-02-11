import { db } from "@/db";
import { images, artists, categories } from "@/db/schema";
import { eq, desc, and, like, or, SQL } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { hasFamilyAccess } from "@/lib/family-access";
import { Suspense } from "react";

export const metadata = {
  title: "Gallery - Meamasque",
  description: "Browse our collection of artwork",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ artist?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const familyAccess = await hasFamilyAccess();

  const conditions: SQL[] = [];

  // Visibility filter
  if (familyAccess) {
    // Show both public and private
  } else {
    conditions.push(eq(images.visibility, "public"));
  }

  if (params.artist) {
    conditions.push(eq(images.artistId, params.artist));
  }
  if (params.category) {
    conditions.push(eq(images.categoryId, params.category));
  }
  if (params.q) {
    conditions.push(
      or(
        like(images.title, `%${params.q}%`),
        like(images.description, `%${params.q}%`)
      )!
    );
  }

  const [allImages, allArtists, allCategories] = await Promise.all([
    db
      .select({
        id: images.id,
        title: images.title,
        blobUrl: images.blobUrl,
        dateCreated: images.dateCreated,
        artistName: artists.name,
      })
      .from(images)
      .leftJoin(artists, eq(images.artistId, artists.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(images.createdAt)),
    db.query.artists.findMany({
      orderBy: (artists, { asc }) => [asc(artists.name)],
    }),
    db.query.categories.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
      <Suspense>
        <GalleryFilters artists={allArtists} categories={allCategories} />
      </Suspense>
      <ImageGrid images={allImages} />
    </div>
  );
}
