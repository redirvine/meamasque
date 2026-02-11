import { db } from "@/db";
import { artists, images } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ImageGrid } from "@/components/gallery/image-grid";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const artist = await db.query.artists.findFirst({
    where: eq(artists.slug, slug),
  });

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
    .where(
      and(eq(images.artistId, artist.id), eq(images.visibility, "public"))
    )
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
        <h1 className="text-3xl font-bold">{artist.name}</h1>
        {artist.relationship && (
          <p className="mt-1 text-gray-500">{artist.relationship}</p>
        )}
        {artist.bio && (
          <p className="mt-4 max-w-2xl text-gray-600">{artist.bio}</p>
        )}
      </div>

      <h2 className="mb-4 text-xl font-semibold">Works</h2>
      <ImageGrid images={artistImages} />
    </div>
  );
}
