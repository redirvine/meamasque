import { db } from "@/db";
import { images, artists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/gallery/image-grid";

export default async function HomePage() {
  const featuredImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      artistName: artists.name,
    })
    .from(images)
    .leftJoin(artists, eq(images.artistId, artists.id))
    .where(eq(images.visibility, "public"))
    .orderBy(desc(images.createdAt))
    .limit(8);

  return (
    <div>
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Meamasque
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A collection of art and stories spanning three generations.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/gallery">
              <Button size="lg">Browse Gallery</Button>
            </Link>
            <Link href="/artists">
              <Button size="lg" variant="outline">
                Meet the Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {featuredImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
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
        </section>
      )}
    </div>
  );
}
