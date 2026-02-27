export const dynamic = "force-dynamic";

import { db } from "@/db";
import { artists, images } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageGrid } from "@/components/gallery/image-grid";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "../../../../../auth";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [artist, session] = await Promise.all([
    db.query.artists.findFirst({
      where: eq(artists.slug, slug),
    }),
    auth(),
  ]);
  const isAdmin = !!session;

  if (!artist) {
    notFound();
  }

  const artistImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      dateCreated: images.dateCreated,
      artistName: artists.name,
    })
    .from(images)
    .leftJoin(artists, eq(images.artistId, artists.id))
    .where(eq(images.artistId, artist.id))
    .orderBy(desc(images.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/artists"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        All Artists
      </Link>

      <div className="mb-8">
        <div className="flex items-start gap-2">
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          {isAdmin && (
            <Link
              href={`/admin/artists?edit=${artist.id}`}
              className="mt-1 flex-shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="Edit artist"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          )}
        </div>
        {artist.bio && (
          <p className="mt-4 max-w-2xl text-gray-600">{artist.bio}</p>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold">Works</h2>
      <ImageGrid images={artistImages} isAdmin={isAdmin} />
    </div>
  );
}
