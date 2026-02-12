export const dynamic = "force-dynamic";

import { db } from "@/db";
import { stories, images, artists } from "@/db/schema";
import { eq, desc, or, and, SQL } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { hasFamilyAccess } from "@/lib/family-access";

export const metadata = {
  title: "Stories - Meamasque",
  description: "Stories and memories from our family",
};

export default async function StoriesPage() {
  const familyAccess = await hasFamilyAccess();

  const allStories = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      excerpt: stories.excerpt,
      visibility: stories.visibility,
      createdAt: stories.createdAt,
      coverImageUrl: images.blobUrl,
      authorName: artists.name,
    })
    .from(stories)
    .leftJoin(images, eq(stories.coverImageId, images.id))
    .leftJoin(artists, eq(stories.authorId, artists.id))
    .where(familyAccess ? undefined : eq(stories.visibility, "public"))
    .orderBy(desc(stories.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Stories</h1>

      {allStories.length === 0 ? (
        <p className="text-gray-500">No stories yet.</p>
      ) : (
        <div className="space-y-6">
          {allStories.map((story) => (
            <Link key={story.id} href={`/stories/${story.slug}`}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="flex gap-6 p-0">
                  {story.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.coverImageUrl}
                      alt=""
                      className="h-48 w-48 flex-shrink-0 object-cover"
                    />
                  )}
                  <div className="flex flex-col justify-center py-6 pr-6">
                    <h2 className="text-xl font-semibold">{story.title}</h2>
                    {story.authorName && (
                      <p className="mt-1 text-sm text-gray-500">
                        by {story.authorName}
                      </p>
                    )}
                    {story.excerpt && (
                      <p className="mt-2 text-gray-600 line-clamp-3">
                        {story.excerpt}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
