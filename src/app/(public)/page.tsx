export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
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
      creatorName: ancestors.name,
    })
    .from(images)
    .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
    .where(eq(images.visibility, "public"))
    .orderBy(desc(images.createdAt))
    .limit(8);

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
