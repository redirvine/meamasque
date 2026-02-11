import { db } from "@/db";
import { images, artists, stories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ImageGrid } from "@/components/gallery/image-grid";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const [featuredImages, recentStories] = await Promise.all([
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
      .where(eq(images.visibility, "public"))
      .orderBy(desc(images.createdAt))
      .limit(8),
    db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        excerpt: stories.excerpt,
        coverImageUrl: images.blobUrl,
      })
      .from(stories)
      .leftJoin(images, eq(stories.coverImageId, images.id))
      .where(eq(stories.visibility, "public"))
      .orderBy(desc(stories.createdAt))
      .limit(3),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Meamasque
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            A collection of art and stories spanning generations.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/gallery">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Gallery
              </Button>
            </Link>
            <Link href="/stories">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Read Stories
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

      {/* Recent Stories */}
      {recentStories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Stories</h2>
            <Link
              href="/stories"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Read all &rarr;
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {recentStories.map((story) => (
              <Link key={story.id} href={`/stories/${story.slug}`}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  {story.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.coverImageUrl}
                      alt=""
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{story.title}</h3>
                    {story.excerpt && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {story.excerpt}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
