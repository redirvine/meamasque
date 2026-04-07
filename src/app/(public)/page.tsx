export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, categories, plays, ancestors, places, siteAbout } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { CategoryGrid, type CategoryTile } from "./category-grid";

function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function HomePage() {
  // Fetch all categories and find a random featured image each
  const allCategories = await db.query.categories.findMany();
  // "Mary Elizabeth Atwood" category links to /about, not gallery
  const aboutCategoryName = "Mary Elizabeth Atwood";

  const categoryTiles = await Promise.all(
    allCategories
      .filter((c) => c.name !== "Theatre" && c.name !== aboutCategoryName)
      .map(async (cat) => {
        const featuredImages = await db
          .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
          .from(images)
          .where(
            and(
              eq(images.categoryId, cat.id),
              isNull(images.ancestorId),
              eq(images.featured, true)
            )
          );
        const img = pickRandom(featuredImages);
        return {
          label: cat.name,
          href: `/gallery?category=${cat.slug}`,
          imageUrl: img?.thumbnailUrl ?? img?.blobUrl ?? null,
        } satisfies CategoryTile;
      })
  );

  // About tile: use the siteAbout primary photo
  const about = await db.query.siteAbout.findFirst();
  let aboutPhotoUrl: string | null = null;
  if (about?.photoId) {
    const aboutImg = await db.query.images.findFirst({
      where: eq(images.id, about.photoId),
      columns: { blobUrl: true, thumbnailUrl: true },
    });
    aboutPhotoUrl = aboutImg?.thumbnailUrl ?? aboutImg?.blobUrl ?? null;
  }

  const aboutTile: CategoryTile = {
    label: "About",
    href: "/about",
    imageUrl: aboutPhotoUrl,
  };

  // Plays tile: use a random featured play's primary image
  const featuredPlays = await db
    .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
    .from(plays)
    .innerJoin(images, eq(plays.primaryImageId, images.id))
    .where(eq(plays.featured, true));

  const playImg = pickRandom(featuredPlays);

  const playsTile: CategoryTile = {
    label: "Plays",
    href: "/plays",
    imageUrl: playImg?.thumbnailUrl ?? playImg?.blobUrl ?? null,
  };

  // Places tile: use the first place's photo
  const firstPlace = await db
    .select({ blobUrl: images.blobUrl, thumbnailUrl: images.thumbnailUrl })
    .from(places)
    .innerJoin(images, eq(places.photoId, images.id))
    .limit(1);

  const placesTile: CategoryTile = {
    label: "Places",
    href: "/places",
    imageUrl:
      firstPlace[0]?.thumbnailUrl ?? firstPlace[0]?.blobUrl ?? null,
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

  const desiredOrder = [
    "About", "Paintings", "Drawings", "Mixed Media", "Masks", "Poems", "Plays", "Places", "Ancestors",
  ];

  const allTiles = [aboutTile, ...categoryTiles, playsTile, placesTile, ancestorsTile].filter(
    (t) => t.imageUrl
  );

  const tiles = allTiles.sort((a, b) => {
    const ai = desiredOrder.indexOf(a.label);
    const bi = desiredOrder.indexOf(b.label);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CategoryGrid tiles={tiles} />
    </div>
  );
}
