export const dynamic = "force-dynamic";

import { db } from "@/db";
import { plays, playImages, playMemories, images } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "../../../../../auth";
import { AddMemoryForm } from "./add-memory-form";
import { CommentsSection } from "@/components/comments/comments-section";
import { PlayMediaViewer } from "./play-media-viewer";

export default async function PlayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const { id } = await params;

  const play = await db.query.plays.findFirst({
    where: eq(plays.id, id),
  });

  if (!play) notFound();

  // Get all associated images
  const associatedImages = await db
    .select({
      id: images.id,
      blobUrl: images.blobUrl,
      title: images.title,
      caption: playImages.caption,
      sortOrder: playImages.sortOrder,
    })
    .from(playImages)
    .innerJoin(images, eq(playImages.imageId, images.id))
    .where(eq(playImages.playId, id))
    .orderBy(asc(playImages.sortOrder));

  // If primary image isn't in junction results, prepend it
  if (
    play.primaryImageId &&
    !associatedImages.some((img) => img.id === play.primaryImageId)
  ) {
    const [primaryImage] = await db
      .select({
        id: images.id,
        blobUrl: images.blobUrl,
        title: images.title,
      })
      .from(images)
      .where(eq(images.id, play.primaryImageId!));

    if (primaryImage) {
      associatedImages.unshift({
        ...primaryImage,
        caption: null,
        sortOrder: -1,
      });
    }
  }

  const memories = await db
    .select({
      id: playMemories.id,
      content: playMemories.content,
      sortOrder: playMemories.sortOrder,
    })
    .from(playMemories)
    .where(eq(playMemories.playId, id))
    .orderBy(asc(playMemories.sortOrder));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/plays"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Plays
      </Link>

      <article>
        <div className="flex items-start gap-2">
          <h1 className="text-3xl font-bold">{play.play}</h1>
          {isAdmin && (
            <Link
              href={`/admin/plays?edit=${play.id}`}
              className="mt-1 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Edit play"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>

        <div className="mt-3 space-y-1 text-sm text-gray-600">
          {play.role && <p>Role: {play.role}</p>}
          {play.year != null && (
            <p>{play.year}</p>
          )}
          {play.location && <p>{play.location}</p>}
        </div>

        {play.description && (
          <div className="mt-6 whitespace-pre-wrap text-gray-700">
            {play.description}
          </div>
        )}

        <PlayMediaViewer
          images={associatedImages}
          memories={memories}
          playTitle={play.play}
        />

        {isAdmin && (
          <div className={memories.length > 0 ? "mt-4" : "mt-8"}>
            <AddMemoryForm playId={id} />
          </div>
        )}

        <CommentsSection
          resourceType="play"
          resourceId={id}
          currentUserId={session?.user?.id}
          isAdmin={isAdmin}
        />
      </article>
    </div>
  );
}
