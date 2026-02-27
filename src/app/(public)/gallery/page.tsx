export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors, categories } from "@/db/schema";
import { eq, desc, and, ne, or, isNull } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";
import { CreatorPicker } from "@/components/gallery/creator-picker";
import { auth } from "../../../../auth";

export const metadata = {
  title: "Gallery - Meamasque",
  description: "Browse our collection of artwork",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ ancestor?: string }>;
}) {
  const params = await searchParams;
  const session = await auth();
  const isAdmin = !!session;

  // Fetch all ancestors for the creator picker
  const allAncestors = await db
    .select({ id: ancestors.id, name: ancestors.name })
    .from(ancestors)
    .orderBy(ancestors.name);

  // Default to Mary Elizabeth Atwood if no ancestor param
  const defaultAncestor = allAncestors.find((a) =>
    a.name.includes("Mary Elizabeth Atwood")
  );
  const selectedId = params.ancestor ?? defaultAncestor?.id ?? allAncestors[0]?.id;

  if (!selectedId) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold">Gallery</h1>
        <p className="text-gray-500">No creators found.</p>
      </div>
    );
  }

  // Fetch images for the selected creator, excluding Theatre category
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      creatorName: ancestors.name,
      categoryName: categories.name,
    })
    .from(images)
    .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
    .leftJoin(categories, eq(images.categoryId, categories.id))
    .where(
      and(
        eq(images.ancestorId, selectedId),
        or(ne(categories.name, "Theatre"), isNull(categories.name))
      )
    )
    .orderBy(desc(images.createdAt));

  // Group images by category
  const grouped = new Map<string, typeof allImages>();
  for (const img of allImages) {
    const key = img.categoryName ?? "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(img);
  }

  const selectedCreator = allAncestors.find((a) => a.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">
        {selectedCreator?.name ?? "Gallery"}
      </h1>
      <CreatorPicker creators={allAncestors} currentId={selectedId} />
      {grouped.size === 0 ? (
        <div className="py-20 text-center text-gray-500">
          <p>No artwork to display yet.</p>
        </div>
      ) : (
        Array.from(grouped.entries()).map(([categoryName, imgs]) => (
          <section key={categoryName} className="mb-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-700">
              {categoryName}
            </h2>
            <ImageGrid images={imgs} isAdmin={isAdmin} />
          </section>
        ))
      )}
    </div>
  );
}
