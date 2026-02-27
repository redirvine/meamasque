export const dynamic = "force-dynamic";

import { db } from "@/db";
import { images, ancestors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ImageSlideshow } from "@/components/gallery/image-slideshow";

export default async function HomePage() {
  const allImages = await db
    .select({
      id: images.id,
      title: images.title,
      blobUrl: images.blobUrl,
      creatorName: ancestors.name,
    })
    .from(images)
    .leftJoin(ancestors, eq(images.ancestorId, ancestors.id))
    .where(eq(images.visibility, "public"))
    .orderBy(desc(images.createdAt));

  return <ImageSlideshow images={allImages} />;
}
