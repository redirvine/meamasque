export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, artists } from "@/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/gallery/image-grid";

export default async function HomePage() {
  const firstArtist = await db
    .select({ id: artists.id, name: artists.name })
    .from(artists)
    .orderBy(asc(artists.createdAt))
    .limit(1)
    .then((rows) => rows[0]);

  const featuredImages = firstArtist
    ? await db
        .select({
          id: images.id,
          title: images.title,
          blobUrl: images.blobUrl,
          dateCreated: images.dateCreated,
          artistName: artists.name,
        })
        .from(images)
        .leftJoin(artists, eq(images.artistId, artists.id))
        .where(and(eq(images.visibility, "public"), eq(images.artistId, firstArtist.id)))
        .orderBy(desc(images.createdAt))
        .limit(8)
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Meamasque
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            A collection of art and memories spanning generations.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/gallery">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Gallery
              </Button>
            </Link>
            <Link href="/artists">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Meet the Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Works */}
      {featuredImages.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Works</h2>
              <Link
                href="/gallery"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                View all &rarr;
              </Link>
            </div>
            <ImageGrid images={featuredImages} />
          </div>
        </section>
      )}
    </div>
  );
}
