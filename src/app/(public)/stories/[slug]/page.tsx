export const dynamic = "force-dynamic";

import { db } from "@/db";
import { stories, storyImages, images, artists } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TiptapRenderer } from "@/components/tiptap-renderer";
import { hasFamilyAccess } from "@/lib/family-access";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const storyResults = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      content: stories.content,
      excerpt: stories.excerpt,
      visibility: stories.visibility,
      createdAt: stories.createdAt,
      authorName: artists.name,
      authorSlug: artists.slug,
    })
    .from(stories)
    .leftJoin(artists, eq(stories.authorId, artists.id))
    .where(eq(stories.slug, slug))
    .limit(1);

  const story = storyResults[0];

  if (!story) notFound();
  if (story.visibility === "private" && !(await hasFamilyAccess())) {
    notFound();
  }

  // Get associated images
  const associatedImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      description: images.description,
      caption: storyImages.caption,
    })
    .from(storyImages)
    .innerJoin(images, eq(storyImages.imageId, images.id))
    .where(eq(storyImages.storyId, story.id))
    .orderBy(asc(storyImages.sortOrder));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/stories"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Stories
      </Link>

      <article>
        <h1 className="text-3xl font-bold">{story.title}</h1>

        {story.authorName && (
          <p className="mt-2 text-gray-500">
            by{" "}
            <Link
              href={`/artists/${story.authorSlug}`}
              className="text-blue-600 hover:underline"
            >
              {story.authorName}
            </Link>
          </p>
        )}

        {story.content && (
          <div className="mt-8">
            <TiptapRenderer content={story.content} />
          </div>
        )}

        {associatedImages.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold">Images</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {associatedImages.map((image) => (
                <Link
                  key={image.id}
                  href={`/gallery/${image.id}`}
                  className="group overflow-hidden rounded-lg border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.blobUrl}
                    alt={image.title}
                    className="w-full transition-transform group-hover:scale-105"
                  />
                  {(image.caption || image.title) && (
                    <div className="p-3">
                      <p className="text-sm font-medium">
                        {image.caption || image.title}
                      </p>
                      {image.description && (
                        <p className="mt-1 text-xs text-gray-500">
                          {image.description}
                        </p>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
