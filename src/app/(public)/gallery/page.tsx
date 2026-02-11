import { db } from "@/db";
import { images, artists } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ImageGrid } from "@/components/gallery/image-grid";

export const metadata = {
  title: "Gallery - Meamasque",
  description: "Browse our collection of artwork",
};

export default async function GalleryPage() {
  const allImages = await db
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
    .orderBy(desc(images.createdAt));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Gallery</h1>
      <ImageGrid images={allImages} />
    </div>
  );
}
