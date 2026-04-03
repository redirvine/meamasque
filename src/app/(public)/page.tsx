export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, categories, plays, ancestors } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { CategoryGrid, type CategoryTile } from "./category-grid";

export default async function HomePage() {
  // Fetch all categories and find one representative image each
  const allCategories = await db.query.categories.findMany();
  const categoryTiles = await Promise.all(
    allCategories
      .filter((c) => c.name !== "Theatre") // Theatre is covered by Plays
      .map(async (cat) => {
        const img = await db
          .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
          .from(images)
          .where(and(eq(images.categoryId, cat.id), isNull(images.ancestorId)))
          .orderBy(desc(images.highlight), desc(images.createdAt))
          .limit(1);
        return {
          label: cat.name,
          href: `/gallery?category=${cat.slug}`,
          imageUrl: img[0]?.thumbnailUrl ?? img[0]?.blobUrl ?? null,
        } satisfies CategoryTile;
      })
  );

  // Plays tile: use the most recent play's primary image
  const firstPlay = await db
    .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
    .from(plays)
    .leftJoin(images, eq(plays.primaryImageId, images.id))
    .orderBy(desc(plays.year), desc(plays.createdAt))
    .limit(1);

  const playsTile: CategoryTile = {
    label: "Plays",
    href: "/plays",
    imageUrl: firstPlay[0]?.thumbnailUrl ?? firstPlay[0]?.blobUrl ?? null,
  };

  // Ancestors tile: use the first ancestor's photo
  const firstAncestor = await db
    .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
    .from(ancestors)
    .innerJoin(images, eq(ancestors.photoId, images.id))
    .limit(1);

  const ancestorsTile: CategoryTile = {
    label: "Ancestors",
    href: "/ancestors",
    imageUrl:
      firstAncestor[0]?.thumbnailUrl ?? firstAncestor[0]?.blobUrl ?? null,
  };

  const tiles = [...categoryTiles, playsTile, ancestorsTile].filter(
    (t) => t.imageUrl
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CategoryGrid tiles={tiles} />
    </div>
  );
}
