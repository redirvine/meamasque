export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, categories } from "@/db/schema";
import { eq, desc, and, like, or, SQL } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { auth } from "../../../../auth";
import { Suspense } from "react";

export const metadata = {
  title: "Gallery - Meamasque",
  description: "Browse our collection of artwork",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ ancestor?: string; category?: string; q?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const isAdmin = !!session;

  const conditions: SQL[] = [];

  if (params.ancestor) {
    conditions.push(eq(images.ancestorId, params.ancestor));
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

  const [allImages, allAncestors, allCategories] = await Promise.all([
    db
      .select({
        id: images.id,
        title: images.title,
        blobUrl: images.blobUrl,
        dateCreated: images.dateCreated,
        creatorName: ancestors.name,
      })
      .from(images)
      .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(images.createdAt)),
    db
      .select({ id: ancestors.id, name: ancestors.name })
      .from(ancestors)
      .orderBy(ancestors.name),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .orderBy(categories.name),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
      <Suspense>
        <GalleryFilters ancestors={allAncestors} categories={allCategories} />
      </Suspense>
      <ImageGrid images={allImages} isAdmin={isAdmin} />
    </div>
  );
}
